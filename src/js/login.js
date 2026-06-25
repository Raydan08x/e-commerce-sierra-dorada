const formLogin = document.getElementById("formLogin");
const usuarioInput = document.getElementById("usuario");
const passwordInput = document.getElementById("password");
const mensajeLogin = document.getElementById("mensajeLogin");

// Lista de usuarios hardcodeada para la demostración.
const usuarios = [
    {
        usuario: "admin",
        password: "admin123",
        rol: "admin"
    },
    {
        usuario: "cliente",
        password: "cliente123",
        rol: "cliente"
    }
];

formLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const usuario = usuarioInput.value.trim();
    const password = passwordInput.value.trim();

    // Usamos el método 'find' para buscar el usuario. Es más conciso y moderno.
    const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.password === password);

    if (usuarioEncontrado === null) {
        mensajeLogin.textContent = "Usuario o contraseña incorrectos.";
        return;
    }

    // Creamos un objeto de sesión solo con la información necesaria.
    const sesion = {
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol
    };

    // Guardamos la sesión en localStorage como un string JSON.
    localStorage.setItem("sesionSierraDorada", JSON.stringify(sesion));

    if (usuarioEncontrado.rol === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "productos.html";
    }
});