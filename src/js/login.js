const formLogin = document.getElementById("formLogin");
const usuarioInput = document.getElementById("usuario");
const passwordInput = document.getElementById("password");
const mensajeLogin = document.getElementById("mensajeLogin");
const togglePassword = document.getElementById("togglePassword");

const usuariosBase = [
    {
        usuario: "admin",
        nombreCompleto: "Administrador Sierra Dorada",
        telefono: "0000000000",
        email: "admin@sierradorada.com",
        password: "admin123",
        rol: "admin"
    },
    {
        usuario: "user",
        nombreCompleto: "Usuario de prueba",
        telefono: "3001234567",
        email: "user@sierradorada.com",
        password: "user123",
        rol: "cliente"
    }
];

function obtenerUsuariosRegistrados() {
    try {
        const usuariosGuardados = JSON.parse(localStorage.getItem("usuariosSierraDorada"));
        if (Array.isArray(usuariosGuardados)) return usuariosGuardados;
        if (usuariosGuardados && typeof usuariosGuardados === "object") return [usuariosGuardados];
        return [];
    } catch (error) {
        return [];
    }
}

const emailRegistroReciente = sessionStorage.getItem("ultimoRegistroSierraDorada");
if (emailRegistroReciente) {
    usuarioInput.value = emailRegistroReciente;
    sessionStorage.removeItem("ultimoRegistroSierraDorada");
    mostrarMensaje("success", "Cuenta creada correctamente. Ingresa tu contraseña para continuar.");
}

function mostrarMensaje(tipo, texto) {
    mensajeLogin.className = `alert alert-${tipo} mt-3`;
    mensajeLogin.textContent = texto;
}

formLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value;

    if (!usuario || !password) {
        mostrarMensaje("danger", "Debes escribir el usuario/email y la contrasena.");
        return;
    }

    const usuariosRegistrados = obtenerUsuariosRegistrados().map((usuarioRegistrado) => ({
        usuario: usuarioRegistrado.email,
        nombreCompleto: usuarioRegistrado.nombreCompleto,
        telefono: usuarioRegistrado.telefono,
        email: usuarioRegistrado.email,
        password: usuarioRegistrado.password,
        rol: "cliente"
    }));

    const usuarios = [...usuariosBase, ...usuariosRegistrados];
    const usuarioEncontrado = usuarios.find((u) => {
        const coincideUsuario = u.usuario === usuario || u.email === usuario.toLowerCase();
        return coincideUsuario && u.password === password;
    });

    if (!usuarioEncontrado) {
        mostrarMensaje("danger", "Usuario o contrasena incorrectos.");
        return;
    }

    const sesion = {
        usuario: usuarioEncontrado.usuario,
        email: usuarioEncontrado.email,
        rol: usuarioEncontrado.rol,
        nombreCompleto: usuarioEncontrado.nombreCompleto,
        telefono: usuarioEncontrado.telefono
    };

    localStorage.setItem("sesionSierraDorada", JSON.stringify(sesion));

    if (usuarioEncontrado.rol === "admin") {
        window.location.href = "admin.html";
        return;
    }

    window.location.href = "productos.html";
});

togglePassword.addEventListener("click", () => {
    const icono = togglePassword.querySelector("i");
    const esPassword = passwordInput.type === "password";

    passwordInput.type = esPassword ? "text" : "password";
    icono.classList.toggle("bi-eye", !esPassword);
    icono.classList.toggle("bi-eye-slash", esPassword);
});
