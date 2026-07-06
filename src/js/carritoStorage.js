const CLAVE_CARRITO = "carritoSierraDorada";

export function obtenerCarrito() {
    const carrito = localStorage.getItem(CLAVE_CARRITO);

    if (!carrito) {
        return [];
    }

    return JSON.parse(carrito);
}

export function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

export function agregarProducto(producto) {

    const carrito = obtenerCarrito();

    const existente = carrito.find(item => item.id === producto.id);

    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({
            id: producto.id,
            name: producto.name,
            price: producto.price,
            image: producto.image,
            description: producto.description,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);
}

export function actualizarCantidad(idProducto, nuevaCantidad) {

    const carrito = obtenerCarrito();

    const producto = carrito.find(item => item.id === idProducto);

    if (!producto) {
        return;
    }

    // Validación para no permitir cantidades menores a 1
    if (nuevaCantidad < 1) {
        alert("La cantidad no puede ser menor a 1.");
        return;
    }

    producto.cantidad = nuevaCantidad;

    guardarCarrito(carrito);
}

export function eliminarProducto(idProducto) {

    const carrito = obtenerCarrito().filter(
        producto => producto.id !== idProducto
    );

    guardarCarrito(carrito);
}