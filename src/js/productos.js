const CLAVE_PRODUCTOS = "productosSierraDorada";

const catalogoProductos = document.getElementById("catalogoProductos");

// Esta función asíncrona obtiene los productos.
// Prioriza los datos de localStorage (que pueden tener cambios del admin)
// y si no existen, carga los datos del archivo JSON inicial.
async function obtenerProductos() {
    let productosGuardados = localStorage.getItem(CLAVE_PRODUCTOS);

    if (productosGuardados) {
        try {
            const parsed = JSON.parse(productosGuardados);
            if (Array.isArray(parsed) && parsed.some(p => p.id && p.id.startsWith('S'))) {
                localStorage.removeItem(CLAVE_PRODUCTOS);
                productosGuardados = null;
            } else {
                return parsed;
            }
        } catch (e) {
            localStorage.removeItem(CLAVE_PRODUCTOS);
            productosGuardados = null;
        }
    }

    const response = await fetch('../src/data/productos.json');
    const productosDesdeJson = await response.json();
    return productosDesdeJson;
}

let productosGlobales = [];
let categoriaActiva = "todos";
let estiloActivo = "todos";

function cumpleEstilo(producto, estilo) {
    if (estilo === 'todos') return true;
    const nameLower = producto.name.toLowerCase();
    const descLower = (producto.description || "").toLowerCase();
    const isSour = nameLower.includes('sour') || descLower.includes('sour');
    const isAle = (nameLower.includes('ale') || nameLower.includes('apa') || nameLower.includes('barley') || nameLower.includes('stout') || descLower.includes('ale') || descLower.includes('pale ale') || descLower.includes('stout')) && !isSour;
    
    if (estilo === 'sour') return isSour;
    if (estilo === 'ale') return isAle;
    return true;
}

async function mostrarCatalogo() {
    productosGlobales = await obtenerProductos();
    renderizarCatalogo();
}

function renderizarCatalogo() {
    catalogoProductos.innerHTML = "";

    const productosActivos = productosGlobales.filter(p => p.activo !== false);

    if (productosActivos.length === 0) {
        catalogoProductos.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center">
                    No hay productos en este momento.
                </div>
            </div>
        `;
        return;
    }

    // Clasificar productos por prefijo y aplicar filtros
    let cervezas = productosActivos.filter(p => p.id.startsWith('C'));
    let packs = productosActivos.filter(p => p.id.startsWith('P'));
    let merchandising = productosActivos.filter(p => p.id.startsWith('M'));

    // Filtrar por estilo de cerveza si está activo
    if (estiloActivo !== "todos") {
        cervezas = cervezas.filter(p => cumpleEstilo(p, estiloActivo));
        // Si filtramos por estilo de cerveza, el usuario solo espera ver cervezas o packs relacionados,
        // pero de acuerdo a la instrucción, el filtro de estilo sour/ale aplica directamente a la cerveza.
        // Ocultamos packs y merch de la visualización si hay un filtro de estilo de cerveza activo para enfocar la vista.
        packs = [];
        merchandising = [];
    }

    // Filtrar por categoría activa
    if (categoriaActiva === "Cervezas") {
        packs = [];
        merchandising = [];
    } else if (categoriaActiva === "Packs") {
        cervezas = [];
        merchandising = [];
    } else if (categoriaActiva === "Merchandising") {
        cervezas = [];
        packs = [];
    }

    const categorias = [
        { titulo: "Cervezas Artesanales", productos: cervezas },
        { titulo: "Packs Especiales", productos: packs },
        { titulo: "Merchandising Sierra Dorada", productos: merchandising }
    ];

    let hayResultados = false;

    categorias.forEach(cat => {
        if (cat.productos.length === 0) return;
        hayResultados = true;

        // Inyectamos la cabecera de la sección y su respectivo grid
        const sectionHtml = `
            <section class="mb-5">
                <h2 class="mb-4 text-dorado text-center" style="font-family: var(--fuente-destacados); border-bottom: 2px solid rgba(179, 162, 105, 0.3); padding-bottom: 8px; font-size: 3rem;">
                    ${cat.titulo}
                </h2>
                <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                    ${cat.productos.map(producto => {
                        const precioFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(producto.price);
                        
                        const detallesHtml = (producto.abv || producto.ibu || producto.temperature) ? `
                            <div class="producto-detalles-extra">
                                <h4 class="producto-subtitulo">Detalles</h4>
                                <div class="producto-specs">
                                    ${producto.abv ? `<p>ABV: ${producto.abv}</p>` : ''}
                                    ${producto.ibu ? `<p>IBU: ${producto.ibu}</p>` : ''}
                                    ${producto.temperature ? `<p>🌡️ ${producto.temperature}</p>` : ''}
                                </div>
                            </div>
                        ` : '';
 
                        const maridajeLimitado = (producto.maridaje || []).slice(0, 3);
                        const maridajeHtml = (maridajeLimitado.length > 0) ? `
                            <div class="producto-maridaje">
                                <h4 class="producto-subtitulo">Maridaje</h4>
                                <ul>
                                    ${maridajeLimitado.map(item => `<li>${item.emoji} ${item.name}</li>`).join('')}
                                </ul>
                            </div>
                        ` : '';
 
                        const extraInfoHtml = (detallesHtml || maridajeHtml) ? `
                            <div class="producto-extra-info">
                                ${detallesHtml}
                                ${maridajeHtml}
                            </div>
                        ` : '';
 
                        const colorSrmHtml = producto.colorHex ? 
                            `<div class="producto-color-srm" title="${producto.colorName || ''}" style="background-color: ${producto.colorHex};"></div>` : '';
 
                        return `
                            <article class="col">
                                <div class="producto-card">
                                    <div class="producto-img-container">
                                        <img src="${producto.image}" alt="${producto.name}" class="producto-img">
                                        <div class="producto-img-overlay"></div>
                                    </div>
                                    <div class="producto-body">
                                        <div class="producto-header">
                                            <div>
                                                <h3 class="producto-nombre">${producto.name}</h3>
                                                <p class="producto-precio">${precioFormateado}</p>
                                            </div>
                                            ${colorSrmHtml}
                                        </div>
                                        <p class="producto-subdescripcion">${producto.inspiration || ''}</p>
                                        <p class="producto-descripcion">${producto.description}</p>
                                        
                                        ${extraInfoHtml}
 
                                        <div class="producto-actions">
                                            <button class="btn btn-outline-dorado" onclick="abrirDetallesModal('${producto.id}')">Ver Detalles</button>
                                            <button class="btn btn-dorado"><i class="bi bi-cart-plus"></i> Agregar</button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        `;
                    }).join('')}
                </div>
            </section>
        `;
        
        catalogoProductos.insertAdjacentHTML('beforeend', sectionHtml);
    });

    if (!hayResultados) {
        catalogoProductos.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-warning d-inline-block px-5">
                    No se encontraron productos que coincidan con los filtros seleccionados.
                </div>
            </div>
        `;
    }
}

// Crear e inyectar modal premium de detalles al hacer click en "Ver Detalles"
window.abrirDetallesModal = function(id) {
    const producto = productosGlobales.find(p => p.id === id);
    if (!producto) return;

    // Eliminar modal anterior si existe
    const modalExistente = document.getElementById('modalDetallesProducto');
    if (modalExistente) {
        modalExistente.remove();
    }

    const precioFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(producto.price);
    const chars = producto.characteristics || {};

    const modalHtml = `
        <div class="modal fade" id="modalDetallesProducto" tabindex="-1" aria-labelledby="modalDetallesProductoLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content bg-dark text-light border-secondary">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title" id="modalDetallesProductoLabel" style="font-family: var(--fuente-destacados); color: var(--color-dorado); font-size: 2rem;">
                            ${producto.name} - Detalle Premium
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="row">
                            <div class="col-md-5 mb-3 text-center">
                                <img src="${producto.image}" alt="${producto.name}" class="img-fluid rounded mb-3" style="max-height: 300px; object-fit: cover; width: 100%; border: 1px solid rgba(179, 162, 105, 0.35);">
                                ${producto.colorHex ? `
                                    <div class="d-flex align-items-center justify-content-center gap-2 mb-3">
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${producto.colorHex}; border: 1px solid var(--color-dorado);"></div>
                                        <span>SRM: <strong>${producto.colorName || 'N/A'}</strong></span>
                                    </div>
                                ` : ''}
                                <div class="p-3 rounded" style="background: rgba(179, 162, 105, 0.12); border: 1px solid rgba(179, 162, 105, 0.25);">
                                    <h6 style="color: var(--color-dorado); font-family: var(--fuente-destacados);">Especificaciones</h6>
                                    <p class="mb-1" style="font-size: 0.95rem;"><strong>Precio:</strong> ${precioFormateado}</p>
                                    ${producto.abv ? `<p class="mb-1" style="font-size: 0.95rem;"><strong>ABV:</strong> ${producto.abv}</p>` : ''}
                                    ${producto.ibu ? `<p class="mb-1" style="font-size: 0.95rem;"><strong>IBU:</strong> ${producto.ibu}</p>` : ''}
                                    ${producto.temperature ? `<p class="mb-0" style="font-size: 0.95rem;"><strong>Temperatura:</strong> ${producto.temperature}</p>` : ''}
                                </div>
                            </div>
                            <div class="col-md-7">
                                ${producto.inspiration ? `
                                    <h5 style="color: var(--color-dorado); font-family: var(--fuente-destacados); font-style: italic;">"${producto.inspiration}"</h5>
                                ` : ''}
                                ${producto.legend ? `
                                    <p class="text-white-50" style="font-size: 0.95rem; font-style: italic; border-left: 3px solid var(--color-dorado); padding-left: 10px;">
                                        ${producto.legend}
                                    </p>
                                ` : ''}
                                
                                <h6 class="mt-4" style="color: var(--color-dorado); font-family: var(--fuente-destacados);">Descripción Completa</h6>
                                <p style="font-size: 0.95rem; text-align: justify;">${producto.fullDescription || producto.description}</p>
                                
                                ${producto.process ? `
                                    <h6 class="mt-3" style="color: var(--color-dorado); font-family: var(--fuente-destacados);">Proceso de Elaboración</h6>
                                    <p style="font-size: 0.95rem; text-align: justify;">${producto.process}</p>
                                ` : ''}
                                
                                <h6 class="mt-4" style="color: var(--color-dorado); font-family: var(--fuente-destacados);">Perfil Sensorial (Características)</h6>
                                <div class="row g-2" style="font-size: 0.9rem;">
                                    ${chars.color ? `<div class="col-6"><strong>Color:</strong> ${chars.color}</div>` : ''}
                                    ${chars.aroma ? `<div class="col-6"><strong>Aroma:</strong> ${chars.aroma}</div>` : ''}
                                    ${chars.sabor ? `<div class="col-6"><strong>Sabor:</strong> ${chars.sabor}</div>` : ''}
                                    ${chars.maridaje ? `<div class="col-6"><strong>Sugerencia:</strong> ${chars.maridaje}</div>` : ''}
                                </div>
                                
                                ${producto.maridaje && producto.maridaje.length > 0 ? `
                                    <h6 class="mt-4" style="color: var(--color-dorado); font-family: var(--fuente-destacados);">Maridaje Sugerido</h6>
                                    <div class="d-flex flex-wrap gap-2">
                                        ${producto.maridaje.map(item => `
                                            <span class="badge bg-secondary p-2" style="font-size: 0.85rem; border: 1px solid rgba(179, 162, 105, 0.25);">
                                                ${item.emoji} ${item.name}
                                            </span>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-dorado"><i class="bi bi-cart-plus"></i> Agregar al Carrito</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalElement = document.getElementById('modalDetallesProducto');
    const bModal = new bootstrap.Modal(modalElement);
    bModal.show();
};

// --- EVENT LISTENERS PARA LOS FILTROS ---
document.addEventListener("DOMContentLoaded", () => {
    const catButtons = document.querySelectorAll(".filter-category");
    const seccionFiltroEstilo = document.getElementById("seccionFiltroEstilo");
    const styleButtons = document.querySelectorAll(".filter-style");

    catButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Cambiar clase activa en botones de categoría
            catButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            categoriaActiva = btn.getAttribute("data-category");

            // Mostrar u ocultar el filtro de estilo para Cervezas
            if (categoriaActiva === "Cervezas") {
                seccionFiltroEstilo.style.display = "block";
            } else {
                seccionFiltroEstilo.style.display = "none";
                // Resetear el estilo seleccionado
                estiloActivo = "todos";
                styleButtons.forEach(b => {
                    if (b.getAttribute("data-style") === "todos") {
                        b.classList.add("active");
                    } else {
                        b.classList.remove("active");
                    }
                });
            }

            renderizarCatalogo();
        });
    });

    styleButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Cambiar clase activa en botones de estilo
            styleButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            estiloActivo = btn.getAttribute("data-style");
            renderizarCatalogo();
        });
    });
});

mostrarCatalogo();