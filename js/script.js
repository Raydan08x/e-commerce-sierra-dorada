document.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector(".glass-navbar");
    if (!nav) return;

    const links = nav.querySelectorAll(".nav-link:not(.dropdown__button)");
    links.forEach((link) => {
        link.addEventListener("click", () => {
            links.forEach((item) => item.classList.remove("is-active"));
            link.classList.add("is-active");
        });
    });
});