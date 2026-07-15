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
        console.log("Show ejecutado", message);
        const iconMap = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-circle-fill',
            info: 'bi-info-circle-fill'
        };
        const iconClass = iconMap[type] || iconMap.info;

        const toast = document.createElement("div");
        toast.className = `sd-toast sd-toast--${type}`;
        toast.innerHTML = `
            <i class="bi ${iconClass} toast__icon"></i>
            <p>${message}</p>
            <button type="button" class="toast__close" aria-label="Cerrar">&times;</button>
        `;

        // Cerrar al hacer clic en la X
        const closeBtn = toast.querySelector('.toast__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => toast.remove());
        }

        this.container.appendChild(toast);
        console.log(this.container.innerHTML);

        //setTimeout(() => {
        //    toast.classList.add('toast--out'); 
        //    setTimeout(() => toast.remove(), 400);
        //}, time);
    }
}