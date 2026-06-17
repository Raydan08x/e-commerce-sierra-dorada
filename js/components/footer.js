export class Footer {
  constructor() {
    this.currentYear = new Date().getFullYear();
  }

  getTemplate() {
    return `
      <footer class="site-footer">
        <div class="site-footer__brand">
          <span class="site-footer__mark">SD</span>
          <span class="site-footer__name">Sierra Dorada</span>
        </div>

        <nav class="site-footer__nav" aria-label="Navegacion del footer">
          <a class="site-footer__link" href="${this.getPath('index.html')}">Inicio</a>
          <a class="site-footer__link" href="${this.getPath('nosotros.html')}">Nosotros</a>
          <a class="site-footer__link" href="${this.getPath('contacto.html')}">Contacto</a>
          <a class="site-footer__link" href="${this.getPath('productos.html')}">Productos</a>
        </nav>

        <div class="site-footer__social">
          <a class="site-footer__social-link" href="#" aria-label="Instagram">IG</a>
          <a class="site-footer__social-link" href="#" aria-label="Facebook">FB</a>
          <a class="site-footer__social-link" href="#" aria-label="WhatsApp">WA</a>
        </div>

        <p class="site-footer__copy">
          &copy; ${this.currentYear} Sierra Dorada. Todos los derechos reservados.
        </p>
      </footer>
    `;
  }

  getPath(page) {
    const isInHtmlFolder = window.location.pathname.includes('/html/');
    if (page === 'index.html') {
      return isInHtmlFolder ? '../index.html' : 'index.html';
    }
    return isInHtmlFolder ? page : `html/${page}`;
  }

  render() {
    document.body.insertAdjacentHTML('beforeend', this.getTemplate());
  }
}
