export class Footer {
  constructor() {
    this.currentYear = new Date().getFullYear();
    this.isInHtmlFolder = window.location.pathname.includes(`/html/`);
    this.basePath = this.isInHtmlFolder ? `../` : ``;
  }

  // Calcula la ruta correcta de una pagina segun si el usuario esta
  // navegando desde la raiz (index.html) o desde dentro de la carpeta html/.
  getPath(page) {
    if (page === 'index.html') {
      return this.isInHtmlFolder ? '../index.html' : 'index.html';
    }
    return this.isInHtmlFolder ? page : `html/${page}`;
  }

  getTemplate() {
    const logoSrc = `${this.basePath}src/assets/videos/assets/icons/isotipo-dorado-y-blanco.png`;

    return `
      <footer class="footer-custom py-5 px-4 mt-5">
        <div class="container">

          <div class="row gy-4 pb-4 mb-4 border-bottom footer-border-main">

            <!-- Marca -->
            <div class="col-12 col-md-3">
              <a href="${this.getPath('index.html')}" class="d-flex align-items-center mb-3 text-decoration-none">
                <img src="${logoSrc}" alt="Sierra Dorada" class="footer-logo me-3">
                <h3 class="footer-title-text mb-0">Sierra<br>Dorada</h3>
              </a>
              <p class="small mb-0 footer-desc-text">
                Cerveza artesanal con alma colombiana. Inspirada en la cultura Muisca y el oro de nuestros Andes.
              </p>
              <div class="d-flex align-items-center mt-3 gap-2">
                <span class="footer-line-decor"></span>
                <svg class="footer-hop-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 21V3"/>
                  <path d="M12 6l-4-2.5M12 6l4-2.5"/>
                  <path d="M12 10l-4-2.5M12 10l4-2.5"/>
                  <path d="M12 14l-4-2.5M12 14l4-2.5"/>
                  <path d="M12 18l-4-2.5M12 18l4-2.5"/>
                </svg>
                <span class="footer-line-decor"></span>
              </div>
            </div>

            <!-- Navegacion -->
            <div class="col-12 col-sm-4 col-md-3">
              <h5 class="footer-section-heading text-uppercase small fw-bold mb-3">Navegación</h5>
              <span class="footer-line-decor d-block mb-4"></span>
              <ul class="list-unstyled small footer-links-list p-0 m-0">
                <li class="mb-3"><a href="${this.getPath('index.html')}" class="d-flex align-items-center gap-2"><span>&rsaquo;</span> Inicio</a></li>
                <li class="mb-3"><a href="${this.getPath('nosotros.html')}" class="d-flex align-items-center gap-2"><span>&rsaquo;</span> Nosotros</a></li>
                <li class="mb-3"><a href="${this.getPath('productos.html')}" class="d-flex align-items-center gap-2"><span>&rsaquo;</span> Productos</a></li>
                <li class="mb-0"><a href="${this.getPath('contacto.html')}" class="d-flex align-items-center gap-2"><span>&rsaquo;</span> Contacto</a></li>
              </ul>
            </div>

            <!-- Contacto -->
            <div class="col-12 col-sm-4 col-md-3">
              <h5 class="footer-section-heading text-uppercase small fw-bold mb-3">Contacto</h5>
              <span class="footer-line-decor d-block mb-4"></span>
              <ul class="list-unstyled small footer-contact-info p-0 m-0">
                <li class="mb-3 pb-3 border-bottom footer-border-main d-flex align-items-center gap-2">
                  <i class="bi bi-geo-alt"></i> Bogotá, Colombia
                </li>
                <li class="mb-3 pb-3 border-bottom footer-border-main d-flex align-items-center gap-2">
                  <i class="bi bi-telephone"></i>
                  <a href="tel:+573001234567">+57 300 123 4567</a>
                </li>
                <li class="mb-0 d-flex align-items-center gap-2">
                  <i class="bi bi-envelope"></i>
                  <a href="mailto:contacto@sierradorada.com">contacto@sierradorada.com</a>
                </li>
              </ul>
            </div>

            <!-- Redes sociales -->
            <div class="col-12 col-sm-4 col-md-3">
              <h5 class="footer-section-heading text-uppercase small fw-bold mb-3">Síguenos</h5>
              <span class="footer-line-decor d-block mb-4"></span>
              <ul class="list-unstyled small p-0 m-0">
                <li class="mb-3"><a href="#" class="d-flex align-items-center gap-2"><span class="footer-social-icon"><i class="bi bi-instagram"></i></span> Instagram</a></li>
                <li class="mb-3"><a href="#" class="d-flex align-items-center gap-2"><span class="footer-social-icon"><i class="bi bi-facebook"></i></span> Facebook</a></li>
                <li class="mb-0"><a href="#" class="d-flex align-items-center gap-2"><span class="footer-social-icon"><i class="bi bi-whatsapp"></i></span> WhatsApp</a></li>
              </ul>
            </div>

          </div>

          <div class="d-flex flex-column align-items-center pt-2 small footer-credits-row">
            <svg class="footer-center-svg mb-3 mb-md-0" width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 2L20 12H30L22.5 18L25 28L15 22L5 28L7.5 18L0 12H10L15 2Z" fill="currentColor"/>
            </svg>

            <span class="mb-3 mb-md-0">&copy; ${this.currentYear} Sierra Dorada. Todos los derechos reservados.</span> 
            <span> Prohíbase el expendio de bebidas embriagantes a menores de edad. El exceso de alcohol es perjudicial para la salud.</span>
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
