export class ToastManager {
    constructor(containerId = "toastContainer") {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement("div");
            container.id = containerId;
            document.body.appendChild(container);
        }
        this.container = container;
    }

    /**
     * Muestra un toast.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de toast ('success', 'error', 'info').
     * @param {number} time - La duración en milisegundos.
     */
    show(message, type = 'info', time = 3500) {
        const toast = document.createElement("div");
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `<p>${message}</p>`;

        this.container.appendChild(toast);

        setTimeout(() => toast.remove(), time);
    }
}