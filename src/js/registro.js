const formRegistro = document.getElementById("formRegistro");
const nombreInput = document.getElementById("nombre");
const apellidosInput = document.getElementById("apellidos");
const fechaNacimientoInput = document.getElementById("fechaNacimiento");
const generoInput = document.getElementById("genero");
const direccionInput = document.getElementById("direccion");
const telefonoInput = document.getElementById("telefono");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmarPasswordInput = document.getElementById("confirmarPassword");
const aceptaTerminosInput = document.getElementById("aceptaTerminos");
const autorizaDatosInput = document.getElementById("autorizaDatos");
const autorizaComunicacionesInput = document.getElementById("autorizaComunicaciones");
const mensajesRegistro = document.getElementById("mensajesRegistro");
const terminosDialog = document.getElementById("terminosDialog");
const emailsReservados = ["admin@sierradorada.com", "user@sierradorada.com"];

function obtenerFechaMaximaRegistro() {
    const hoy = new Date();
    const fechaMaxima = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    const anio = fechaMaxima.getFullYear();
    const mes = String(fechaMaxima.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaMaxima.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

fechaNacimientoInput.max = obtenerFechaMaximaRegistro();

function obtenerUsuarios() {
    try {
        const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosSierraDorada"));

        if (Array.isArray(usuariosGuardados)) {
            return usuariosGuardados.filter((usuario) => usuario && typeof usuario === "object");
        }

        // Compatibilidad con versiones antiguas que guardaban un solo objeto.
        if (usuariosGuardados && typeof usuariosGuardados === "object") {
            return [usuariosGuardados];
        }

        return [];
    } catch (error) {
        return [];
    }
}

function guardarUsuarios(usuarios) {
    try {
        localStorage.setItem("usuariosSierraDorada", JSON.stringify(usuarios));
        return true;
    } catch (error) {
        console.error("No fue posible guardar el usuario:", error);
        return false;
    }
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
    const tieneIndicativo = telefonoInput.value.trim().startsWith("+");
    const digitos = telefonoInput.value.replace(/\D/g, "").slice(0, 15);
    telefonoInput.value = `${tieneIndicativo ? "+" : ""}${digitos}`;
});

document.querySelectorAll("[data-password-toggle]").forEach((boton) => {
    boton.addEventListener("click", () => {
        const campo = document.getElementById(boton.dataset.passwordToggle);
        const icono = boton.querySelector("i");
        if (!campo || !icono) return;

        const mostrarPassword = campo.type === "password";
        campo.type = mostrarPassword ? "text" : "password";
        icono.classList.toggle("bi-eye", !mostrarPassword);
        icono.classList.toggle("bi-eye-slash", mostrarPassword);
        boton.setAttribute("aria-pressed", mostrarPassword.toString());
        boton.setAttribute(
            "aria-label",
            `${mostrarPassword ? "Ocultar" : "Mostrar"} ${campo.id === "confirmarPassword" ? "confirmación de contraseña" : "contraseña"}`
        );
    });
});

document.getElementById("abrirTerminos").addEventListener("click", () => terminosDialog.showModal());
document.getElementById("cerrarTerminos").addEventListener("click", () => terminosDialog.close());
document.getElementById("entendidoTerminos").addEventListener("click", () => terminosDialog.close());
terminosDialog.addEventListener("click", (evento) => {
    if (evento.target === terminosDialog) terminosDialog.close();
});

formRegistro.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const usuario = {
        nombre: nombreInput.value.trim(),
        apellidos: apellidosInput.value.trim(),
        nombreCompleto: `${nombreInput.value.trim()} ${apellidosInput.value.trim()}`.trim(),
        fechaNacimiento: fechaNacimientoInput.value,
        genero: generoInput.value,
        direccion: direccionInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value,
        aceptaTerminos: aceptaTerminosInput.checked,
        autorizaDatos: autorizaDatosInput.checked,
        autorizaComunicaciones: autorizaComunicacionesInput.checked,
        fechaRegistro: new Date().toISOString()
    };

    const confirmarPassword = confirmarPasswordInput.value;
    const errores = [];
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const telefonoValido = /^\+?\d{7,15}$/;
    const usuarios = obtenerUsuarios();

    if (!usuario.nombre || !usuario.apellidos || !usuario.fechaNacimiento || !usuario.genero || !usuario.direccion || !usuario.telefono || !usuario.email || !usuario.password || !confirmarPassword) {
        errores.push("Todos los campos son obligatorios.");
    }

    if (usuario.nombre && usuario.nombre.length < 2) {
        errores.push("El nombre debe tener al menos 2 caracteres.");
    }

    if (usuario.apellidos && usuario.apellidos.length < 2) {
        errores.push("Los apellidos deben tener al menos 2 caracteres.");
    }

    if (usuario.fechaNacimiento && usuario.fechaNacimiento > obtenerFechaMaximaRegistro()) {
        errores.push("Debes ser mayor de 18 años para crear una cuenta.");
    }

    if (usuario.email && !emailValido.test(usuario.email)) {
        errores.push("El correo electronico no tiene un formato valido.");
    }

    if (usuario.telefono && !telefonoValido.test(usuario.telefono)) {
        errores.push("El teléfono debe incluir entre 7 y 15 dígitos y puede comenzar con +.");
    }

    if (usuario.password && usuario.password.length < 6) {
        errores.push("La contraseña debe tener al menos 6 caracteres.");
    }

    if (usuario.password !== confirmarPassword) {
        errores.push("La contraseña y su confirmación deben coincidir.");
    }

    if (!usuario.aceptaTerminos) {
        errores.push("Debes aceptar los términos y condiciones.");
    }

    if (!usuario.autorizaDatos) {
        errores.push("Debes autorizar el tratamiento de tus datos personales.");
    }

    if (emailsReservados.includes(usuario.email) || usuarios.some((usuarioGuardado) => String(usuarioGuardado.email || "").toLowerCase() === usuario.email)) {
        errores.push("Ya existe un usuario registrado con ese correo.");
    }

    if (errores.length > 0) {
        mostrarErrores(errores);
        return;
    }

    usuarios.push(usuario);
    if (!guardarUsuarios(usuarios)) {
        mostrarErrores([
            "No fue posible guardar la cuenta. El almacenamiento del navegador puede estar lleno o bloqueado."
        ]);
        return;
    }

    sessionStorage.setItem("ultimoRegistroSierraDorada", usuario.email);
    formRegistro.reset();
    mostrarExito("Usuario registrado correctamente. Te llevaremos al inicio de sesión.");

    window.setTimeout(() => {
        window.location.href = "login.html";
    }, 1200);
});
