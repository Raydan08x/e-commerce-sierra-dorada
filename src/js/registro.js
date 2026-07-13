const formRegistro = document.getElementById("formRegistro");
const nombreInput = document.getElementById("nombreCompleto");
const telefonoInput = document.getElementById("telefono");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmarPasswordInput = document.getElementById("confirmarPassword");
const mensajesRegistro = document.getElementById("mensajesRegistro");
const emailsReservados = ["admin@sierradorada.com", "user@sierradorada.com"];

function obtenerUsuarios() {
    try {
        return JSON.parse(localStorage.getItem("usuariosSierraDorada")) || [];
    } catch (error) {
        return [];
    }
}

function guardarUsuarios(usuarios) {
    localStorage.setItem("usuariosSierraDorada", JSON.stringify(usuarios));
}

function mostrarErrores(errores) {
    mensajesRegistro.className = "alert alert-danger mt-3";
    mensajesRegistro.innerHTML = `
        <strong>Revisa estos datos:</strong>
        <ul class="mb-0 mt-2">
            ${errores.map((error) => `<li>${error}</li>`).join("")}
        </ul>
    `;
}

function mostrarExito(texto) {
    mensajesRegistro.className = "alert alert-success mt-3";
    mensajesRegistro.textContent = texto;
}

telefonoInput.addEventListener("input", () => {
    telefonoInput.value = telefonoInput.value.replace(/\D/g, "").slice(0, 15);
});

formRegistro.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const usuario = {
        nombreCompleto: nombreInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value.trim()
    };

    const confirmarPassword = confirmarPasswordInput.value.trim();
    const errores = [];
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefonoValido = /^\d{7,15}$/;
    const usuarios = obtenerUsuarios();

    if (!usuario.nombreCompleto || !usuario.telefono || !usuario.email || !usuario.password || !confirmarPassword) {
        errores.push("Todos los campos son obligatorios.");
    }

    if (usuario.nombreCompleto && usuario.nombreCompleto.length < 3) {
        errores.push("El nombre completo debe tener al menos 3 caracteres.");
    }

    if (usuario.email && !emailValido.test(usuario.email)) {
        errores.push("El correo electronico no tiene un formato valido.");
    }

    if (usuario.telefono && !telefonoValido.test(usuario.telefono)) {
        errores.push("El telefono debe tener entre 7 y 15 digitos.");
    }

    if (usuario.password && usuario.password.length < 6) {
        errores.push("La contrasena debe tener al menos 6 caracteres.");
    }

    if (usuario.password !== confirmarPassword) {
        errores.push("La contrasena y su confirmacion deben coincidir.");
    }

    if (emailsReservados.includes(usuario.email) || usuarios.some((usuarioGuardado) => usuarioGuardado.email === usuario.email)) {
        errores.push("Ya existe un usuario registrado con ese correo.");
    }

    if (errores.length > 0) {
        mostrarErrores(errores);
        return;
    }

    usuarios.push(usuario);
    guardarUsuarios(usuarios);
    formRegistro.reset();
    mostrarExito("Usuario registrado correctamente. Ya puedes iniciar sesion con ese email.");
});
