import { ProductDetailsModal } from './components/ProductDetailsModal.js';

const CLAVE_PRODUCTOS = "productosSierraDorada";
const IMAGEN_PLACEHOLDER = "https://placehold.co/600x400/222223/B3A269?text=Imagen+Pendiente";

const catalogoProductos = document.getElementById("catalogoProductos");
const productDetailsModal = new ProductDetailsModal();

// --- HELPERS DE IMÁGENES (compatibles con admin.js) ---
function normalizarImagenes(producto) {
    if (!producto) return [];

    if (Array.isArray(producto.images) && producto.images.length > 0) {
        const tienePrincipalExplicita = producto.images.some(img => img && img.isMain === true);
        return producto.images.map((img, i) => ({
            url: typeof img === 'string' ? img : (img.url || ''),
            fit: img.fit || producto.imageFit || 'cover',
            isMain: tienePrincipalExplicita ? (img.isMain === true) : (i === 0)
        }));
    }

    const url = producto.image || IMAGEN_PLACEHOLDER;
    return [{
        url: url,
        fit: producto.imageFit || 'cover',
        isMain: true
    }];
}

function obtenerImagenPrincipal(producto) {
    const imagenes = normalizarImagenes(producto);
    return imagenes.find(img => img.isMain) || imagenes[0] || { url: IMAGEN_PLACEHOLDER, fit: 'cover', isMain: true };
}

function obtenerImagenes(producto) {
    return normalizarImagenes(producto);
}

// Esta función asíncrona obtiene los productos.
// Prioriza los datos de localStorage (que pueden tener cambios del admin)
// y si no existen, carga los datos del archivo JSON inicial.
async function obtenerProductos() {
    let productosGuardados = localStorage.getItem(CLAVE_PRODUCTOS);

    if (productosGuardados) {
        try {
            const parsed = JSON.parse(productosGuardados);
            const tieneIdsAntiguos = Array.isArray(parsed) && parsed.some(p => p.id && p.id.startsWith('S'));
            if (tieneIdsAntiguos) {
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

    try {
        const [resCervezas, resMerch] = await Promise.all([
            fetch('../src/data/cervezas.json'),
            fetch('../src/data/merchandising.json')
        ]);
        const cervezas = await resCervezas.json();
        const merch = await resMerch.json();
        return [...cervezas, ...merch];
    } catch (error) {
        console.error("Error al cargar los archivos JSON de productos:", error);
        return [];
    }
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
                        const imagenes = obtenerImagenes(producto);
                        const imagenPrincipal = obtenerImagenPrincipal(producto);
                        const carouselId = `carousel-${producto.id}`;

                        let imagenHtml = '';
                        if (imagenes.length > 1) {
                            const indicadores = imagenes.map((img, i) => `
                                <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" ${i === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${i + 1}"></button>
                            `).join('');
                            const items = imagenes.map((img, i) => `
                                <div class="carousel-item ${i === 0 ? 'active' : ''}">
                                    <img src="${img.url}" alt="${producto.name} - ${i + 1}" class="producto-img" style="object-fit: ${img.fit || 'cover'}; height: 220px;">
                                </div>
                            `).join('');
                            imagenHtml = `
                                <div id="${carouselId}" class="carousel slide producto-img-container" data-bs-ride="carousel" style="background-color: #111;">
                                    <div class="carousel-indicators">${indicadores}</div>
                                    <div class="carousel-inner">${items}</div>
                                    <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Anterior</span>
                                    </button>
                                    <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                                        <span class="visually-hidden">Siguiente</span>
                                    </button>
                                </div>
                            `;
                        } else {
                            imagenHtml = `
                                <div class="producto-img-container"${imagenPrincipal.fit === 'contain' ? ' style="background-color: #111;"' : ''}>
                                    <img src="${imagenPrincipal.url}" alt="${producto.name}" class="producto-img" style="object-fit: ${imagenPrincipal.fit || 'cover'};">
                                    <div class="producto-img-overlay"></div>
                                </div>
                            `;
                        }

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
 
                        const subtituloSeccion = producto.id.startsWith('M') ? "Estilo / Uso" : "Maridaje";
                        const maridajeLimitado = (producto.maridaje || []).slice(0, 3);
                        const maridajeHtml = (maridajeLimitado.length > 0) ? `
                            <div class="producto-maridaje">
                                <h4 class="producto-subtitulo">${subtituloSeccion}</h4>
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
                                    ${imagenHtml}
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

// Abrir modal premium de detalles al hacer click en "Ver Detalles"
window.abrirDetallesModal = function(id) {
    const producto = productosGlobales.find(p => p.id === id);
    if (!producto) return;
    productDetailsModal.abrir(producto);
};

// --- EVENT LISTENERS PARA LOS FILTROS ---
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

mostrarCatalogo();