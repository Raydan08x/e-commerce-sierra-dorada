import {
    obtenerCarrito,
    actualizarCantidad,
    eliminarProducto
} from "./carritoStorage.js";

const contenedorCarrito = document.getElementById("contenedorCarrito");
const totalCarrito = document.getElementById("totalCarrito");
const subtotalCarrito = document.getElementById("subtotalCarrito");
const envioCarrito = document.getElementById("envioCarrito");

mostrarCarrito();

function mostrarCarrito() {

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {

        contenedorCarrito.innerHTML = `

        <div class="carrito-vacio">
            <i class="bi bi-cart-x"></i>
            <h2>Carrito vacío</h2>
            <div class="linea-vacia"></div>
            <p>Agrega productos al carrito para verlos aquí.
            <br> ¡Explora nuestra tienda y encuentra lo que necesitas!</p>
            </p>
            <a href="productos.html" class="btn-explorar">
              <i class="bi bi-cup-straw"></i>
            <span>Explorar productos</span>
            </a>
        </div>
        `;

        totalCarrito.textContent = "$0";
        subtotalCarrito.textContent = "$0";
        envioCarrito.textContent = "$0";

        return;
    }

    let html = "";
    let subtotal = 0;

    carrito.forEach(producto => {

        const subProd = producto.price * producto.cantidad;

        subtotal += subProd;

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
            <strong>$${subProd.toLocaleString()}</strong>

        </div>

    </div>

</div>

`;

    });

    contenedorCarrito.innerHTML = html;

    // Actualizar subtotal, envío y total
    const envio = 10000; // Envío gratis
    const total = subtotal + envio;

    subtotalCarrito.textContent = "$" + subtotal.toLocaleString();
    envioCarrito.textContent = "$" + envio.toLocaleString();
    totalCarrito.textContent = "$" + total.toLocaleString();

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