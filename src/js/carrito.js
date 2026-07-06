import {
    obtenerCarrito,
    actualizarCantidad,
    eliminarProducto
} from "./carritoStorage.js";

const contenedorCarrito = document.getElementById("contenedorCarrito");
const totalCarrito = document.getElementById("totalCarrito");

mostrarCarrito();

function mostrarCarrito() {

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {

        contenedorCarrito.innerHTML = `
            <div class="alert alert-warning text-center">
                Tu carrito está vacío.
            </div>
        `;

        totalCarrito.textContent = "$0";

        return;
    }

    let html = "";
    let total = 0;

    carrito.forEach(producto => {

        const subtotal = producto.price * producto.cantidad;

        total += subtotal;

        html += `

<div class="carrito-card">

    <div class="carrito-imagen">

        <img
            src="${producto.image}"
            class="img-fluid"
            alt="${producto.name}">

    </div>

    <div class="carrito-contenido">

        <h3>${producto.name}</h3>

        <p>${producto.description}</p>

        <div class="carrito-precio">

            $${producto.price.toLocaleString()}

        </div>

        <div class="carrito-controles">

            <button
                class="btn btn-outline-light btn-disminuir"
                data-id="${producto.id}">
                -
            </button>

            <span>${producto.cantidad}</span>

            <button
                class="btn btn-outline-light btn-aumentar"
                data-id="${producto.id}">
                +
            </button>

            <button
                class="btn btn-danger btn-eliminar"
                data-id="${producto.id}">
                Eliminar
            </button>

        </div>

        <div class="carrito-subtotal">

            Subtotal:
            <strong>$${subtotal.toLocaleString()}</strong>

        </div>

    </div>

</div>

`;

    });

    contenedorCarrito.innerHTML = html;

    totalCarrito.textContent =
        "$" + total.toLocaleString();

    document.querySelectorAll(".btn-aumentar").forEach(btn => {

        btn.addEventListener("click", () => {

            const carrito = obtenerCarrito();

            const producto = carrito.find(p => p.id === btn.dataset.id);

            actualizarCantidad(producto.id, producto.cantidad + 1);

            mostrarCarrito();

        });

    });

    document.querySelectorAll(".btn-disminuir").forEach(btn => {

        btn.addEventListener("click", () => {

            const carrito = obtenerCarrito();

            const producto = carrito.find(p => p.id === btn.dataset.id);

            actualizarCantidad(producto.id, producto.cantidad - 1);

            mostrarCarrito();

        });

    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {

        btn.addEventListener("click", () => {

            eliminarProducto(btn.dataset.id);

            mostrarCarrito();

        });

    });

}