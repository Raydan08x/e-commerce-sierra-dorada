import { obtenerCarrito } from './carritoStorage.js?v=20260715-3';
import { BOLD_CONFIG } from './config/bold.js?v=20260715-2';

const SHIPPING_COST = 10000;
const BOLD_LIBRARY_URL = 'https://checkout.bold.co/library/boldPaymentButton.js';

class BoldPayment {
    constructor(buttonId = 'btnPagarBold') {
        this.button = document.getElementById(buttonId);
        this.originalText = this.button?.textContent.trim() || 'Pagar';
        this.libraryPromise = null;
    }

    init() {
        if (!this.button) return;

        this.updateButtonState();
        this.button.addEventListener('click', () => this.startCheckout());
        window.addEventListener('sierra-dorada:carrito-actualizado', () => this.updateButtonState());
        window.addEventListener('storage', (event) => {
            if (event.key === 'carritoSierraDorada') this.updateButtonState();
        });
    }

    getOrderTotal() {
        const carrito = obtenerCarrito();
        if (carrito.length === 0) return 0;

        const subtotal = carrito.reduce(
            (total, producto) => total + Number(producto.price || 0) * Number(producto.cantidad || 0),
            0
        );

        return subtotal + SHIPPING_COST;
    }

    createOrderId() {
        const randomPart = window.crypto.randomUUID?.().replaceAll('-', '').slice(0, 10)
            || Math.random().toString(36).slice(2, 12);
        return `SD-${Date.now()}-${randomPart}`;
    }

    updateButtonState() {
        const hasProducts = this.getOrderTotal() > 0;
        this.button.disabled = !hasProducts;
        this.button.setAttribute('aria-disabled', (!hasProducts).toString());
        this.button.title = hasProducts ? 'Pagar de forma segura con Bold' : 'Tu carrito está vacío';
    }

    setLoading(isLoading) {
        this.button.disabled = isLoading;
        this.button.classList.toggle('btn-dorado--loading', isLoading);
        this.button.innerHTML = isLoading
            ? '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Preparando pago'
            : this.originalText;
    }

    showMessage(message, type = 'info') {
        if (window.toastManager) {
            window.toastManager.show(message, type, 4000);
            return;
        }
        window.alert(message);
    }

    async loadBoldLibrary() {
        if (window.BoldCheckout) return window.BoldCheckout;
        if (this.libraryPromise) return this.libraryPromise;

        this.libraryPromise = new Promise((resolve, reject) => {
            const existingScript = document.querySelector(`script[src="${BOLD_LIBRARY_URL}"]`);
            const script = existingScript || document.createElement('script');

            const handleLoad = () => {
                if (window.BoldCheckout) {
                    resolve(window.BoldCheckout);
                } else {
                    reject(new Error('BoldCheckout no está disponible.'));
                }
            };

            script.addEventListener('load', handleLoad, { once: true });
            script.addEventListener('error', () => reject(new Error('No fue posible cargar Bold.')), { once: true });

            if (!existingScript) {
                script.src = BOLD_LIBRARY_URL;
                script.defer = true;
                document.head.appendChild(script);
            } else if (window.BoldCheckout) {
                handleLoad();
            }
        });

        return this.libraryPromise;
    }

    async requestIntegritySignature(orderId) {
        if (!BOLD_CONFIG.signatureEndpoint) {
            throw new Error('SIGNATURE_ENDPOINT_MISSING');
        }

        const items = obtenerCarrito().map((producto) => ({
            id: producto.id,
            quantity: Number(producto.cantidad)
        }));

        const response = await fetch(BOLD_CONFIG.signatureEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId,
                currency: BOLD_CONFIG.currency,
                items
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.error || `El servidor de pagos respondió con estado ${response.status}.`);
        }

        if (!data.integritySignature || !Number.isSafeInteger(data.amount)) {
            throw new Error('El servidor no devolvió una firma válida.');
        }

        return {
            integritySignature: data.integritySignature,
            amount: data.amount
        };
    }

    async startCheckout() {
        const amount = this.getOrderTotal();
        if (amount <= 0) {
            this.showMessage('Tu carrito está vacío.', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const orderId = this.createOrderId();
            const [BoldCheckout, signedPayment] = await Promise.all([
                this.loadBoldLibrary(),
                this.requestIntegritySignature(orderId)
            ]);

            const checkout = new BoldCheckout({
                orderId,
                currency: BOLD_CONFIG.currency,
                amount: String(signedPayment.amount),
                apiKey: BOLD_CONFIG.apiKey,
                integritySignature: signedPayment.integritySignature,
                redirectionUrl: BOLD_CONFIG.redirectionUrl,
                description: `Compra Sierra Dorada - ${obtenerCarrito().length} productos`
            });

            checkout.open();
        } catch (error) {
            if (error.message === 'SIGNATURE_ENDPOINT_MISSING') {
                this.showMessage('La firma segura de Bold aún no está configurada.', 'error');
            } else {
                console.error('Error al iniciar Bold Checkout:', error);
                const isNetworkError = error instanceof TypeError || error.message === 'Failed to fetch';
                const message = isNetworkError
                    ? 'No fue posible conectar con el servidor de pagos. Revisa tu conexión e intenta nuevamente.'
                    : `No fue posible iniciar el pago con Bold: ${error.message}`;
                this.showMessage(message, 'error');
            }
        } finally {
            this.setLoading(false);
            this.updateButtonState();
        }
    }
}

const boldPayment = new BoldPayment();
boldPayment.init();
