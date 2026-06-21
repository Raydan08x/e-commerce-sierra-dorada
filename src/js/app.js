import { Navbar } from './components/navbar.js';
import { Footer } from './components/footer.js';

const navbar = new Navbar();
navbar.render();

const footer = new Footer();
footer.render();

const formularioContacto = document.getElementById("form-contacto");

if (formularioContacto) {
    formularioContacto.addEventListener("submit", function (event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();

        if (nombre === "") {
            alert("Por favor, escribe tu nombre.");
            return;
        }

        if (correo === "") {
            alert("Por favor, escribe tu correo electrónico.");
            return;
        }

        if (!correo.includes("@") || !correo.includes(".")) {
            alert("Por favor, escribe un correo electrónico válido.");
            return;
        }

        if (mensaje === "") {
            alert("Por favor, escribe un mensaje.");
            return;
        }

        alert("Gracias por contactarnos. Pronto nos comunicaremos contigo.");
        formularioContacto.reset();
    });
}