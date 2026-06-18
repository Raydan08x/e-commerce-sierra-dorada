export class Navbar {
  constructor() {
    this.isInHtmlFolder = window.location.pathname.includes('/html/');
    this.basePath = this.isInHtmlFolder ? '../' : '';
    this.htmlPath = this.isInHtmlFolder ? '' : 'html/';
    this.currentPage = window.location.pathname.split('/').pop() || 'index.html';

    this.links = [
      { name: 'Inicio', href: `${this.basePath}index.html`, page: 'index.html' },
      { name: 'Nosotros', href: `${this.htmlPath}nosotros.html`, page: 'nosotros.html' },
      { name: 'Contacto', href: `${this.htmlPath}contacto.html`, page: 'contacto.html' },
      { name: 'Productos', href: `${this.htmlPath}productos.html`, page: 'productos.html' },
    ];
  }

  getLinksHTML() {
    return this.links
      .map((link) => {
        const isActive = this.currentPage === link.page ? 'is-active' : '';
        return `<a class="nav-link ${isActive}" href="${link.href}">${link.name}</a>`;
      })
      .join('');
  }

  getTemplate() {
    const logoSrc = `${this.basePath}src/assets/videos/assets/icons/isotipo-dorado y blanco.png`;

    return `
      <header class="glass-navbar">
        <a href="#inicio" class="brand">
          <img src="${logoSrc}" alt="Logo Sierra Nevada" class="brand__logo" />
          <span class="brand__text">Sierra Dorada</span>
        </a>
        <nav class="navbar-links" aria-label="Navegacion principal">
          ${this.getLinksHTML()}
        </nav>
        <div class="navbar-actions">
          <button class="icon-button icon-button--outline" type="button"><i class="bi bi-cart"></i> Carrito</button>
          <button class="icon-button icon-button--primary" type="button"><i class="bi bi-person"></i> Login</button>
        </div>
      </header>
    `;
  }

  render() {
    document.body.insertAdjacentHTML('afterbegin', this.getTemplate());
    this.attachListeners();
  }

  attachListeners() {
    const renderedLinks = document.querySelectorAll('.glass-navbar .nav-link');
    renderedLinks.forEach((link) => {
      link.addEventListener('click', () => {
        renderedLinks.forEach((item) => item.classList.remove('is-active'));
        link.classList.add('is-active');
      });
    });
  }
}
