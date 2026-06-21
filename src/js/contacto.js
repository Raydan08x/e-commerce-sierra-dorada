const formularioContacto = document.getElementById("form-contacto");

const inputTelefono = document.getElementById("telefono");

if (inputTelefono) {
    // Permite solo numeros aunque el usuario escriba o pegue otros caracteres.
    inputTelefono.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "");
    });
}
if (formularioContacto) {
    formularioContacto.addEventListener("submit", function (event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const email = document.getElementById("email").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();

        if (nombre === "") {
            alert("Por favor, escribe tu nombre completo.");
            return;
        }

        if (telefono === "") {
            alert("Por favor, escribe tu número telefónico.");
            return;
        }

        if (email === "") {
            alert("Por favor, escribe tu correo electrónico.");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            alert("Por favor, ingresa un correo electrónico válido.");
            return;
        }

        const telefonoLimpio = telefono.replace(/\D/g, "");

        if (telefonoLimpio.length < 7) {
            alert("Por favor, ingresa un número telefónico válido.");
            return;
        }

        const nuevoMensaje = {
            nombre: nombre,
            telefono: telefono,
            email: email,
            mensaje: mensaje,
            fecha: new Date().toLocaleString()
        };

        let listaMensajes = JSON.parse(localStorage.getItem("mensajesContacto")) || [];

        listaMensajes.push(nuevoMensaje);

        localStorage.setItem("mensajesContacto", JSON.stringify(listaMensajes));

        const numeroWhatsapp = "573138718154";

        let textoWhatsapp =
            "Hola, quiero contactarme con Sierra Dorada.\n" +
            "Nombre: " + nombre + "\n" +
            "Teléfono: " + telefono + "\n" +
            "Correo: " + email;

        if (mensaje !== "") {
            textoWhatsapp += "\nMensaje: " + mensaje;
        }

        const urlWhatsapp = "https://wa.me/" + numeroWhatsapp + "?text=" + encodeURIComponent(textoWhatsapp);

        alert("Gracias por contactarnos. Se abrirá WhatsApp para enviar tu mensaje.");

        window.open(urlWhatsapp, "_blank");

        formularioContacto.reset();
    });
}