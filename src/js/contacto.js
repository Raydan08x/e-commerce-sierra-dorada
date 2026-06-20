document.addEventListener('submit', function (event) {

    const formulario = event.target;

    if (formulario && formulario.id === 'form-contacto') {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        if (nombre === "" || email === "" || mensaje === "") {
            alert("Por favor, completa todos los campos, así podremos ayudarte mucho más rápido.");

        } else if (!email.includes('@') || !email.includes('.')) {

            alert("Por favor, ingresa un correo electrónico válido para que podamos responderte.");
        } else if (mensaje.length < 10) {

            alert("El mensaje debe tener al menos 10 caracteres para poder procesar tu solicitud.");
        } else {

            const nuevoMensaje = {
                nombre: nombre,
                email: email,
                mensaje: mensaje,
                fecha: new Date().toLocaleString()
            };

            let listaMensajes = JSON.parse(localStorage.getItem('mensajesContacto')) || [];

            listaMensajes.push(nuevoMensaje);

            localStorage.setItem('mensajesContacto', JSON.stringify(listaMensajes));

            alert(`¡Gracias por tu mensaje, ${nombre}! Tus datos se han guardado correctamente.\n\nNos pondremos en contacto contigo a la brevedad.`);

            formulario.reset();
        }
    }
}
);