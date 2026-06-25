// Constantes para las claves de localStorage, para evitar errores de tipeo.
const CLAVE_PRODUCTOS = "productosSierraDorada";
const CLAVE_SESION = "sesionSierraDorada";

let productos = [];

// --- REFERENCIAS AL DOM ---
const formProducto = document.getElementById("formProducto");
// Campos del formulario
const id = document.getElementById("id");
const name = document.getElementById("name");
const inspiration = document.getElementById("inspiration");
const description = document.getElementById("description");
const price = document.getElementById("price");
const abv = document.getElementById("abv");
const ibu = document.getElementById("ibu");
const image = document.getElementById("image");
const colorHex = document.getElementById("colorHex");
const colorName = document.getElementById("colorName");
const temperature = document.getElementById("temperature");
const legend = document.getElementById("legend");
const fullDescription = document.getElementById("fullDescription");
const process = document.getElementById("process");
const characteristics_color = document.getElementById("characteristics_color");
const characteristics_aroma = document.getElementById("characteristics_aroma");
const characteristics_sabor = document.getElementById("characteristics_sabor");
const characteristics_maridaje = document.getElementById("characteristics_maridaje");
const maridaje = document.getElementById("maridaje");

// Campos ocultos para controlar el modo de edición.
const modoEdicion = document.getElementById("modoEdicion");
const idOriginal = document.getElementById("idOriginal");

// Referencias a otros elementos de la interfaz.
const tablaProductos = document.getElementById("tablaProductos");
const mensajeProducto = document.getElementById("mensajeProducto");
const mensajeTabla = document.getElementById("mensajeTabla");

const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnDescargarJson = document.getElementById("btnDescargarJson");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const inputBusqueda = document.getElementById("inputBusqueda");

// Referencias para acciones en lote
const seleccionarTodo = document.getElementById("seleccionarTodo");
const btnAccionesLote = document.getElementById("btnAccionesLote");
const btnEliminarSeleccionados = document.getElementById("btnEliminarSeleccionados");

// Referencias a las pestañas
const tabGestion = new bootstrap.Tab(document.getElementById('gestion-tab'));
const tabFormulario = new bootstrap.Tab(document.getElementById('formulario-tab'));

// Referencias al modal de imagen
const modalCambiarImagen = new bootstrap.Modal(document.getElementById('modalCambiarImagen'));
const nombreProductoModal = document.getElementById('nombreProductoModal');
const imagenActualModal = document.getElementById('imagenActualModal');
const inputUrlImagenModal = document.getElementById('inputUrlImagenModal');
const inputFileImagenModal = document.getElementById('inputFileImagenModal');
const idProductoModal = document.getElementById('idProductoModal');
const btnGuardarImagenModal = document.getElementById('btnGuardarImagenModal');
const mensajeModal = document.getElementById('mensajeModal');

// Referencias al modal de confirmación
const confirmacionModal = document.getElementById('confirmacionModal');
const confirmacionModalTitulo = document.getElementById('confirmacionModalTitulo');
const confirmacionModalMensaje = document.getElementById('confirmacionModalMensaje');
const btnAceptarConfirmacion = document.getElementById('btnAceptarConfirmacion');
const btnCancelarConfirmacion = document.getElementById('btnCancelarConfirmacion');

let archivoModalBase64 = null; // Variable para la imagen codificada del MODAL

// Diccionario inteligente para mapear comidas a emojis de maridaje
const emojiMap = {
    "hamburguesa": "🍔",
    "hamburguesas": "🍔",
    "pollo": "🍗",
    "queso": "🧀",
    "quesos": "🧀",
    "picante": "🌶️",
    "ensalada": "🥗",
    "ensaladas": "🥗",
    "ceviche": "🐟",
    "ceviches": "🐟",
    "marisco": "🍤",
    "mariscos": "🍤",
    "pescado": "🐟",
    "postre": "🍰",
    "postres": "🍰",
    "chocolate": "🍫",
    "carne": "🥩",
    "carnes": "🥩",
    "ostra": "🦪",
    "ostras": "🦪",
    "café": "☕",
    "cafe": "☕",
    "miel": "🍯",
    "panela": "🍯",
    "roble": "🪵",
    "whiskey": "🥃",
    "caramelo": "🍮",
    "puro": "🚬",
    "puros": "🚬"
};

// --- LÓGICA DE AUTENTICACIÓN ---
function protegerRutaAdmin() {
    const sesionTexto = localStorage.getItem(CLAVE_SESION);

    // Si no hay sesión, redirige al login.
    if (sesionTexto === null) {
        window.location.href = "login.html";
        return;
    }

    const sesion = JSON.parse(sesionTexto);

    // Si la sesión no es de un 'admin', redirige al login.
    if (sesion.rol !== "admin") {
        window.location.href = "login.html";
    }
}

// --- LÓGICA DE DATOS (PRODUCTOS) ---
async function cargarProductos() {
    let productosGuardados = localStorage.getItem(CLAVE_PRODUCTOS);

    if (productosGuardados !== null) {
        try {
            const parsed = JSON.parse(productosGuardados);
            if (Array.isArray(parsed) && parsed.some(p => p.id && p.id.startsWith('S'))) {
                localStorage.removeItem(CLAVE_PRODUCTOS);
                productosGuardados = null;
            } else {
                productos = parsed;
            }
        } catch (e) {
            localStorage.removeItem(CLAVE_PRODUCTOS);
            productosGuardados = null;
        }
    }

    if (productosGuardados === null) {
        try {
            const response = await fetch('../src/data/productos.json');
            productos = await response.json();
            guardarProductos();
        } catch (error) {
            console.error("No se pudo cargar el archivo de productos.json", error);
            mensajeTabla.textContent = "Error: No se pudieron cargar los productos.";
        }
    }
}

function guardarProductos() {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos));
}

/**
 * Muestra los productos en la tabla.
 * @param {Array} productosAMostrar - La lista de productos que se va a renderizar.
 */
let columnaOrdenamiento = "";
let ordenAscendente = true;

function ordenarProductos(lista) {
    if (!columnaOrdenamiento) return lista;

    return [...lista].sort((a, b) => {
        let valA = a[columnaOrdenamiento];
        let valB = b[columnaOrdenamiento];

        if (columnaOrdenamiento === 'categoria') {
            valA = valA || 'Cervezas';
            valB = valB || 'Cervezas';
        } else if (columnaOrdenamiento === 'activo') {
            valA = (valA !== false) ? 1 : 0;
            valB = (valB !== false) ? 1 : 0;
        } else if (columnaOrdenamiento === 'price') {
            valA = Number(valA) || 0;
            valB = Number(valB) || 0;
        } else if (columnaOrdenamiento === 'abv') {
            valA = parseFloat(String(valA).replace(/[^0-9.]/g, '')) || 0;
            valB = parseFloat(String(valB).replace(/[^0-9.]/g, '')) || 0;
        } else if (columnaOrdenamiento === 'ibu') {
            valA = parseInt(String(valA).replace(/[^0-9]/g, '')) || 0;
            valB = parseInt(String(valB).replace(/[^0-9]/g, '')) || 0;
        } else {
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return ordenAscendente ? -1 : 1;
        if (valA > valB) return ordenAscendente ? 1 : -1;
        return 0;
    });
}

function mostrarProductos(productosAMostrar) {
    tablaProductos.innerHTML = "";

    const productosOrdenados = ordenarProductos(productosAMostrar);

    if (productosOrdenados.length === 0) {
        tablaProductos.innerHTML = `<tr><td colspan="9" class="text-center">No se encontraron productos.</td></tr>`;
        return;
    }

    productosOrdenados.forEach(producto => {
        // Lógica para el icono de la imagen
        const tieneImagenReal = producto.image && !producto.image.includes('placehold.co');
        const claseIconoImagen = tieneImagenReal ? 'text-dorado' : 'text-secondary';
        const botonImagen = `
            <button class="btn btn-sm btn-outline-light" onclick="abrirModalImagen('${producto.id}')" data-bs-toggle="tooltip" data-bs-placement="top" title="Cambiar imagen">
                <i class="bi bi-camera ${claseIconoImagen}"></i>
            </button>`;

        const estadoLabel = (producto.activo !== false)
            ? `<span class="estado-activo">Activo</span>`
            : `<span class="estado-inactivo">Inactivo</span>`;

        // Plantillas literales para construir el HTML de la fila.
        tablaProductos.innerHTML += `
            <tr>
                <td><input type="checkbox" class="form-check-input" data-id="${producto.id}"></td>
                <td>${producto.id}</td>
                <td>${producto.name}</td>
                <td>${producto.categoria || 'Cervezas'}</td>
                <td>$${producto.price.toLocaleString('es-CO')}</td>
                <td>${producto.abv || 'N/A'}</td>
                <td>${producto.ibu || 'N/A'}</td>
                <td>${estadoLabel}</td>
                <td class="text-center">
                    <div class="acciones-tabla">
                        <button class="btn btn-sm btn-warning" onclick="editarProducto('${producto.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarProducto('${producto.id}')">Eliminar</button>
                        ${botonImagen}
                    </div>
                </td>
            </tr>
        `;
    });

    // Inicializar los tooltips de Bootstrap después de crear los elementos
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    actualizarEstadoAccionesLote();
}

function toggleSeccionCerveza(categoria) {
    const seccionCerveza = document.getElementById("seccionCervezaDetalles");
    if (seccionCerveza) {
        if (categoria === "Cervezas") {
            seccionCerveza.style.display = "block";
        } else {
            seccionCerveza.style.display = "none";
        }
    }
}

// --- LÓGICA DEL FORMULARIO ---
function limpiarFormulario() {
    formProducto.reset();

    modoEdicion.value = "false";
    idOriginal.value = "";

    tituloFormulario.textContent = "Agregar producto";
    btnGuardar.textContent = "Guardar producto";
    id.disabled = false;
    mensajeProducto.textContent = "";

    const catSelector = document.getElementById("categoriaSelector");
    if (catSelector) {
        catSelector.value = "Cervezas";
    }
    const activoProd = document.getElementById("activoProducto");
    if (activoProd) {
        activoProd.checked = true;
    }
    toggleSeccionCerveza("Cervezas");
}

function existeProducto(id) {
    return productos.some(producto => producto.id === id);
}

function sugerirSiguienteId() {
    const maxId = productos
        .map(p => p.id)
        .map(id => id.substring(1))
        .filter(numStr => !isNaN(Number(numStr)))
        .map(numStr => Number(numStr))
        .reduce((max, current) => (current > max ? current : max), 999);

    const siguienteIdNumerico = maxId + 1;
    return `C${siguienteIdNumerico}`;
}

function validarFormulario() {
    const idVal = id.value.trim();
    const nameVal = name.value.trim();
    const priceVal = Number(price.value);

    mensajeProducto.textContent = '';
    mensajeProducto.className = '';

    if (!idVal || !nameVal) {
        toastManager.show('Completa los campos obligatorios (ID, Nombre).', 'error');
        return false;
    }

    if (isNaN(priceVal) || priceVal < 0) {
        toastManager.show('El precio debe ser un número positivo.', 'error');
        return false;
    }

    // Si estamos agregando uno nuevo, validar que el ID no exista
    if (modoEdicion.value !== "true" && existeProducto(idVal)) {
        toastManager.show('El ID ingresado ya existe.', 'error');
        return false;
    }

    return true;
}

function parsearMaridaje(texto) {
    if (!texto.trim()) return [];
    return texto.split(',').map(item => {
        const name = item.trim();
        const nameLower = name.toLowerCase();
        let emoji = "🍽️"; // Emoji por defecto
        
        for (const key in emojiMap) {
            if (nameLower.includes(key)) {
                emoji = emojiMap[key];
                break;
            }
        }
        return { emoji, name };
    }).slice(0, 3);
}

// Agrega un nuevo producto a la lista.
function agregarProducto() {
    const catSelector = document.getElementById("categoriaSelector");
    const activoProd = document.getElementById("activoProducto");

    const nuevoProducto = {
        id: id.value.trim(),
        name: name.value.trim(),
        categoria: catSelector ? catSelector.value : "Cervezas",
        activo: activoProd ? activoProd.checked : true,
        inspiration: inspiration.value.trim(),
        description: description.value.trim(),
        price: Number(price.value),
        abv: abv.value.trim(),
        ibu: ibu.value.trim(),
        image: image.value.trim() || "https://placehold.co/600x400/222223/B3A269?text=Imagen+Pendiente",
        colorHex: colorHex.value.trim(),
        colorName: colorName.value.trim(),
        temperature: temperature.value.trim(),
        legend: legend.value.trim(),
        fullDescription: fullDescription.value.trim(),
        process: process.value.trim(),
        characteristics: {
            color: characteristics_color.value.trim(),
            aroma: characteristics_aroma.value.trim(),
            sabor: characteristics_sabor.value.trim(),
            maridaje: characteristics_maridaje.value.trim()
        },
        maridaje: parsearMaridaje(maridaje.value)
    };

    productos.push(nuevoProducto);
    guardarProductos();
    filtrarYMostrarProductos();
    limpiarFormulario();

    toastManager.show("Producto agregado correctamente.", 'success');
    tabGestion.show(); // Volver a la pestaña de gestión
}

function actualizarProducto() { // Actualiza un producto existente.
    const idActual = id.value.trim();
    const idAnterior = idOriginal.value;

    const indice = productos.findIndex(p => p.id === idAnterior);
    if (indice === -1) return;

    const catSelector = document.getElementById("categoriaSelector");
    const activoProd = document.getElementById("activoProducto");

    productos[indice] = {
        id: idActual,
        name: name.value.trim(),
        categoria: catSelector ? catSelector.value : "Cervezas",
        activo: activoProd ? activoProd.checked : true,
        inspiration: inspiration.value.trim(),
        description: description.value.trim(),
        price: Number(price.value),
        abv: abv.value.trim(),
        ibu: ibu.value.trim(),
        image: image.value.trim() || "https://placehold.co/600x400/222223/B3A269?text=Imagen+Pendiente",
        colorHex: colorHex.value.trim(),
        colorName: colorName.value.trim(),
        temperature: temperature.value.trim(),
        legend: legend.value.trim(),
        fullDescription: fullDescription.value.trim(),
        process: process.value.trim(),
        characteristics: {
            color: characteristics_color.value.trim(),
            aroma: characteristics_aroma.value.trim(),
            sabor: characteristics_sabor.value.trim(),
            maridaje: characteristics_maridaje.value.trim()
        },
        maridaje: parsearMaridaje(maridaje.value)
    };

    guardarProductos();
    filtrarYMostrarProductos();
    limpiarFormulario();

    toastManager.show("Producto actualizado correctamente.", 'success');
    tabGestion.show();
}

function editarProducto(idProducto) {
    const productoEncontrado = productos.find(p => p.id === idProducto);

    if (!productoEncontrado) return;

    // Llenar el formulario con los datos del producto.
    id.value = productoEncontrado.id;
    name.value = productoEncontrado.name;
    
    const catSelector = document.getElementById("categoriaSelector");
    if (catSelector) {
        catSelector.value = productoEncontrado.categoria || 'Cervezas';
        toggleSeccionCerveza(catSelector.value);
    }
    const activoProd = document.getElementById("activoProducto");
    if (activoProd) {
        activoProd.checked = productoEncontrado.activo !== false;
    }

    inspiration.value = productoEncontrado.inspiration || '';
    description.value = productoEncontrado.description || '';
    price.value = productoEncontrado.price;
    abv.value = productoEncontrado.abv || '';
    ibu.value = productoEncontrado.ibu || '';
    image.value = productoEncontrado.image || '';
    colorHex.value = productoEncontrado.colorHex || '';
    const colorHexPicker = document.getElementById("colorHexPicker");
    if (colorHexPicker && productoEncontrado.colorHex && /^#[0-9A-F]{6}$/i.test(productoEncontrado.colorHex)) {
        colorHexPicker.value = productoEncontrado.colorHex;
    }
    colorName.value = productoEncontrado.colorName || '';
    temperature.value = productoEncontrado.temperature || '';
    legend.value = productoEncontrado.legend || '';
    fullDescription.value = productoEncontrado.fullDescription || '';
    process.value = productoEncontrado.process || '';
    
    const chars = productoEncontrado.characteristics || {};
    characteristics_color.value = chars.color || '';
    characteristics_aroma.value = chars.aroma || '';
    characteristics_sabor.value = chars.sabor || '';
    characteristics_maridaje.value = chars.maridaje || '';

    // Convertir de [{emoji, name}] de vuelta a "Comida 1, Comida 2, Comida 3" para fácil edición
    maridaje.value = (productoEncontrado.maridaje || []).map(m => m.name).join(', ');

    modoEdicion.value = "true";
    idOriginal.value = productoEncontrado.id;

    tituloFormulario.textContent = "Editar producto";
    id.disabled = true; // No se puede cambiar el ID al editar.
    btnGuardar.textContent = "Actualizar producto";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    tabFormulario.show(); // Cambiar a la pestaña del formulario
}

async function eliminarProducto(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;

    const confirmado = await mostrarConfirmacion(
        'Eliminar Producto',
        `¿Estás seguro de que deseas eliminar el producto "${producto.name}"? Esta acción no se puede deshacer.`
    );

    if (confirmado) {
        productos = productos.filter(p => p.id !== idProducto);

        guardarProductos();
        filtrarYMostrarProductos();

        toastManager.show("Producto eliminado correctamente.", 'success');
    }
}

// --- LÓGICA DEL MODAL DE CONFIRMACIÓN ---
function mostrarConfirmacion(titulo, mensaje) {
    confirmacionModalTitulo.textContent = titulo;
    confirmacionModalMensaje.textContent = mensaje;
    confirmacionModal.showModal();

    return new Promise(resolve => {
        btnAceptarConfirmacion.onclick = () => {
            confirmacionModal.close();
            resolve(true);
        };
        btnCancelarConfirmacion.onclick = () => {
            confirmacionModal.close();
            resolve(false);
        };
    });
}

// --- LÓGICA DEL MODAL DE IMAGEN ---
function abrirModalImagen(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (!producto) return;

    nombreProductoModal.textContent = producto.name;
    imagenActualModal.src = producto.image;
    idProductoModal.value = producto.id;
    inputUrlImagenModal.value = ''; // Limpiar inputs
    inputFileImagenModal.value = '';
    mensajeModal.textContent = '';
    archivoModalBase64 = null;

    modalCambiarImagen.show();
}

function guardarNuevaImagen() {
    const idProducto = idProductoModal.value;
    const indice = productos.findIndex(p => p.id === idProducto);
    if (indice === -1) return;

    if (archivoModalBase64) {
        productos[indice].image = archivoModalBase64;
        guardarProductos();
        filtrarYMostrarProductos();
        modalCambiarImagen.hide();
        return;
    }

    const nuevaUrl = inputUrlImagenModal.value.trim();
    if (nuevaUrl) {
        productos[indice].image = nuevaUrl;
        guardarProductos();
        filtrarYMostrarProductos();
        modalCambiarImagen.hide();
        return;
    }
}

function codificarImagen(evento) {
    const archivo = evento.target.files[0];
    if (!archivo) {
        archivoModalBase64 = null;
        return;
    }

    if (archivo.size > 2 * 1024 * 1024) {
        toastManager.show('La imagen es muy grande (máx 2MB).', 'error');
        inputFileImagenModal.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        archivoModalBase64 = reader.result;
        mensajeModal.textContent = '';
    };
    reader.readAsDataURL(archivo);
}

// --- ACCIONES EN LOTE ---
function obtenerIdsSeleccionados() {
    const checkboxes = document.querySelectorAll('#tablaProductos input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.getAttribute('data-id'));
}

function actualizarEstadoAccionesLote() {
    const seleccionados = obtenerIdsSeleccionados();
    btnAccionesLote.disabled = seleccionados.length === 0;
}

async function ejecutarAccionEnLote(accion) {
    const ids = obtenerIdsSeleccionados();
    if (ids.length === 0) return;

    if (accion === 'eliminar') {
        const confirmado = await mostrarConfirmacion(
            'Eliminar Productos',
            `¿Seguro que deseas eliminar ${ids.length} producto(s) seleccionados?`
        );
        if (!confirmado) return;

        productos = productos.filter(p => !ids.includes(p.id));
    }

    guardarProductos();
    filtrarYMostrarProductos();
    toastManager.show(`Acción en lote '${accion}' completada.`, 'info');
    seleccionarTodo.checked = false;
}

// --- FILTRADO DE BÚSQUEDA Y CATEGORÍA ---
let crudCategoriaActiva = 'todos';

function filtrarYMostrarProductos() {
    const consulta = inputBusqueda.value.toLowerCase().trim();
    let filtrados = productos;

    // 1. Filtrar por categoría
    if (crudCategoriaActiva !== 'todos') {
        filtrados = filtrados.filter(p => (p.categoria || 'Cervezas') === crudCategoriaActiva);
    }

    // 2. Filtrar por texto de búsqueda
    if (consulta) {
        filtrados = filtrados.filter(p => 
            p.id.toLowerCase().includes(consulta) || 
            p.name.toLowerCase().includes(consulta) ||
            (p.inspiration && p.inspiration.toLowerCase().includes(consulta))
        );
    }

    mostrarProductos(filtrados);
}

// --- OTRAS FUNCIONES ---
function descargarJson() {
    const contenidoJson = JSON.stringify(productos, null, 4);
    const archivo = new Blob([contenidoJson], { type: "application/json" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "productos-sierra-dorada.json";
    enlace.click();
}

// Event listener para el envío del formulario
formProducto.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    if (modoEdicion.value === "true") {
        actualizarProducto();
    } else {
        agregarProducto();
    }
});

btnLimpiar.addEventListener("click", function () {
    limpiarFormulario();
});

btnDescargarJson.addEventListener("click", function () {
    descargarJson();
});

btnCerrarSesion.addEventListener("click", function () {
    localStorage.removeItem(CLAVE_SESION);
    window.location.href = "login.html";
});

document.getElementById('formulario-tab').addEventListener('show.bs.tab', function () {
    if (modoEdicion.value !== "true") {
        limpiarFormulario();
        id.value = sugerirSiguienteId();
    }
});

inputBusqueda.addEventListener("input", filtrarYMostrarProductos);

seleccionarTodo.addEventListener("change", function() {
    const checkboxes = document.querySelectorAll('#tablaProductos input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = seleccionarTodo.checked);
    actualizarEstadoAccionesLote();
});

tablaProductos.addEventListener('change', function(e) {
    if (e.target.matches('input[type="checkbox"]')) {
        actualizarEstadoAccionesLote();
    }
});

btnEliminarSeleccionados.addEventListener("click", () => ejecutarAccionEnLote('eliminar'));
btnGuardarImagenModal.addEventListener("click", guardarNuevaImagen);
inputFileImagenModal.addEventListener("change", codificarImagen);

// Exponer funciones al objeto global
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.abrirModalImagen = abrirModalImagen;

window.seleccionarColorPredefinido = function(hex, name) {
    const colorHex = document.getElementById("colorHex");
    const colorHexPicker = document.getElementById("colorHexPicker");
    const colorName = document.getElementById("colorName");
    if (colorHex) colorHex.value = hex;
    if (colorHexPicker) colorHexPicker.value = hex;
    if (colorName) colorName.value = name;
};

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", async function() {
    protegerRutaAdmin();
    await cargarProductos();
    mostrarProductos(productos);

    // Enlazar picker de color con input de texto
    const colorHex = document.getElementById("colorHex");
    const colorHexPicker = document.getElementById("colorHexPicker");
    if (colorHex && colorHexPicker) {
        colorHexPicker.addEventListener("input", function() {
            colorHex.value = colorHexPicker.value.toUpperCase();
        });
        colorHex.addEventListener("input", function() {
            if (/^#[0-9A-F]{6}$/i.test(colorHex.value)) {
                colorHexPicker.value = colorHex.value;
            }
        });
    }

    // Enlazar selector de categoría para ocultar/mostrar detalles de cerveza
    const catSelector = document.getElementById("categoriaSelector");
    if (catSelector) {
        catSelector.addEventListener("change", function() {
            toggleSeccionCerveza(catSelector.value);
        });
    }

    // Enlazar input de archivo local para cargar imagen desde PC
    const imageFile = document.getElementById("imageFile");
    if (imageFile) {
        imageFile.addEventListener("change", function(evento) {
            const archivo = evento.target.files[0];
            if (!archivo) return;

            if (archivo.size > 2 * 1024 * 1024) {
                if (window.toastManager) {
                    window.toastManager.show('La imagen es muy grande (máx 2MB).', 'error');
                } else {
                    alert('La imagen es muy grande (máx 2MB).');
                }
                imageFile.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const imageInput = document.getElementById("image");
                if (imageInput) {
                    imageInput.value = reader.result;
                    if (window.toastManager) {
                        window.toastManager.show('Imagen cargada correctamente desde la PC.', 'success');
                    }
                }
            };
            reader.readAsDataURL(archivo);
        });
    }

    // Enlazar ordenamiento de columnas por clic en los encabezados
    const sortableHeaders = document.querySelectorAll(".sortable-header");
    sortableHeaders.forEach(header => {
        header.addEventListener("click", () => {
            const campo = header.getAttribute("data-sort");

            if (columnaOrdenamiento === campo) {
                ordenAscendente = !ordenAscendente;
            } else {
                columnaOrdenamiento = campo;
                ordenAscendente = true;
            }

            // Actualizar iconos visuales de todos los encabezados
            sortableHeaders.forEach(h => {
                const icono = h.querySelector("i");
                if (icono) {
                    const hCampo = h.getAttribute("data-sort");
                    if (hCampo === columnaOrdenamiento) {
                        icono.className = ordenAscendente ? "bi bi-arrow-up ms-1" : "bi bi-arrow-down ms-1";
                    } else {
                        icono.className = "bi bi-arrow-down-up ms-1";
                    }
                }
            });

            filtrarYMostrarProductos();
        });
    });
});