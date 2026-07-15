const newsletterForm = document.getElementById('newsletterForm');
const newsletterEmail = document.getElementById('newsletterEmail');
const newsletterMessage = document.getElementById('newsletterMessage');
const NEWSLETTER_STORAGE_KEY = 'newsletterSierraDorada';

function getSubscriptions() {
    try {
        return JSON.parse(localStorage.getItem(NEWSLETTER_STORAGE_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function showNewsletterMessage(text, type) {
    newsletterMessage.textContent = text;
    newsletterMessage.className = `newsletter-message newsletter-message--${type}`;
}

if (newsletterForm && newsletterEmail && newsletterMessage) {
    newsletterForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const email = newsletterEmail.value.trim().toLowerCase();
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!validEmail.test(email)) {
            showNewsletterMessage('Ingresa un correo electrónico válido.', 'error');
            newsletterEmail.focus();
            return;
        }

        const subscriptions = getSubscriptions();

        if (subscriptions.some((subscription) => subscription.email === email)) {
            showNewsletterMessage('Este correo ya está suscrito a nuestro newsletter.', 'error');
            return;
        }

        subscriptions.push({
            email,
            subscribedAt: new Date().toISOString()
        });

        localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(subscriptions));
        newsletterForm.reset();
        showNewsletterMessage('¡Bienvenido a la leyenda! Tu suscripción fue registrada.', 'success');
    });
}
