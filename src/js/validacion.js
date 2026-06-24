document.addEventListener("DOMContentLoaded", async () => {
    if(localStorage.getItem("sd-is-of-age") === "true") return;

    const container = document.getElementById("sd-age-gate-container");
    if (!container) return;

    const response = await fetch("html/validacion.html");
    container.innerHTML = await response.text();

    const ageModalElement = document.getElementById("sdAgeModal");
    const ageModal = new bootstrap.Modal(ageModalElement);
    ageModal.show();

    document.getElementById("sd-btn-yes").addEventListener("click",() => {
        localStorage.setItem("sd-is-of-age", "true");
        ageModal.hide();
    });
document.getElementById("sd-btn-no").addEventListener("click", () => {
        alert("Lo sentimos, debes ser mayor de 18 años para ingresar.");
        window.location.href = "https://www.google.com";
    });
});