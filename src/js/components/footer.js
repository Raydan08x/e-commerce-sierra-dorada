export class Footer {
  constructor() {
    this.currentYear = new Date().getFullYear();
    this.isInHtmlFolder = window.location.pathname.includes(`/html/`);
    this.basePath = this.isInHtmlFolder ? `../` : ``;
  }

  getPath(page) {
    if (page === 'index.html') {
      return this.isInHtmlFolder ? '../index.html' : 'index.html';
    }
    return this.isInHtmlFolder ? page : `html/${page}`;
  }

  getTemplate() {
    const logoSrc = `${this.basePath}src/assets/videos/assets/icons/isotipo-dorado y blanco.png`;

    return `
      <footer class="footer-custom py-5 bg-dark text-light">
        <div class="container">
          <!-- Logo y Descripción -->
          <div class="footer-brand-section">
            <div class="brand-header">
              <img src="${logoSrc}" alt="Sierra Dorada" class="footer__logo-bear">
              <span class="brand-name">Sierra Dorada</span>
            </div>
            <p class="brand-description">
              Cerveza artesanal con alma colombiana. Inspirada en la cultura Muisca y el oro de nuestros Andes.
            </p>
            <div class="brand-divider">
              <span class="line"></span>
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" stroke="var(--color-dorado)" stroke-width="1.5"/>
              </svg>
              <span class="line"></span>
            </div>
          </div>

          <!-- Contenido principal -->
          <div class="footer-content">
            <div class="footer-column">
              <h5>Navegación</h5>
              <ul class="list-unstyled">
                <li><a href="${this.getPath('index.html')}">Inicio</a></li>
                <li><a href="${this.getPath('nosotros.html')}">Nosotros</a></li>
                <li><a href="${this.getPath('productos.html')}">Productos</a></li>
                <li><a href="${this.getPath('contacto.html')}">Contacto</a></li>
              </ul>
            </div>

            <div class="footer-column">
              <h5>Contacto</h5>
              <div class="contact-item">
                <span class="icon">📍</span>
                <span>Bogotá, Colombia</span>
              </div>
              <div class="contact-item">
                <span class="icon">📞</span>
                <span>+57 300 123 4567</span>
              </div>
              <div class="contact-item">
                <span class="icon">✉</span>
                <span>contacto@sierradorada.com</span>
              </div>
            </div>

            <div class="footer-column">
              <h5>Síguenos</h5>
              <div class="social-icons">
                <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
                <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
                <a href="#" aria-label="WhatsApp"><i class="bi bi-whatsapp"></i></a>
              </div>
            </div>
          </div>

          <hr class="my-4 opacity-25">

          <div class="footer-bottom">
            <div class="footer-left">
              <span>&copy; ${this.currentYear} Sierra Dorada. Todos los derechos reservados.</span>
            </div>
            <div class="footer-center">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 2L20 12H30L22.5 18L25 28L15 22L5 28L7.5 18L0 12H10L15 2Z" fill="var(--color-dorado)"/>
              </svg>
            </div>
            <div class="footer-right">
              <a href="#">Política de Privacidad</a>
              <span>•</span>
              <a href="#">Términos y Condiciones</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  render() {
    document.body.insertAdjacentHTML('beforeend', this.getTemplate());
  }
}