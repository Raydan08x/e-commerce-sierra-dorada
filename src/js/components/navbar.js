export class Navbar {
  constructor() {
    this.isInHtmlFolder = window.location.pathname.includes('/html/');
    this.basePath = this.isInHtmlFolder ? '../' : '';
    this.htmlPath = this.isInHtmlFolder ? '' : 'html/';
    this.currentPage = window.location.pathname.split('/').pop() || 'index.html';

    this.sesion = this.obtenerSesion();

    this.links = [
      { name: 'Inicio', href: `${this.basePath}index.html`, page: 'index.html' },
      { name: 'Nosotros', href: `${this.htmlPath}nosotros.html`, page: 'nosotros.html' },
      { name: 'Contacto', href: `${this.htmlPath}contacto.html`, page: 'contacto.html' },
      { name: 'Productos', href: `${this.htmlPath}productos.html`, page: 'productos.html' },
    ];

    if (this.sesion !== null && this.sesion.rol === "admin") {
      this.links.push({ name: 'Admin', href: `${this.htmlPath}admin.html`, page: 'admin.html' });
    }
  }

  obtenerSesion() {
    const sesionTexto = localStorage.getItem("sesionSierraDorada");

    if (sesionTexto === null) {
      return null;
    }

    return JSON.parse(sesionTexto);
  }

  getLinksHTML() {
    return this.links
      .map((link) => {
        const isActive = this.currentPage === link.page ? 'is-active' : '';
        return `<a class="nav-link ${isActive}" href="${link.href}">${link.name}</a>`;
      })
      .join('');
  }

  getBotonSesionHTML() {
    if (this.sesion !== null) {
      return `
        <button class="icon-button icon-button--primary" type="button" id="btnNavbarLogout">
          <i class="bi bi-person"></i> Salir
        </button>
      `;
    }

    return `
      <a class="icon-button icon-button--primary" href="${this.htmlPath}login.html">
        <i class="bi bi-person"></i> Login
      </a>
    `;
  }

  getTemplate() {
    const logoSrc = `${this.basePath}src/assets/icons/isotipo-dorado-y-blanco.png`;
    const homeHref = this.isInHtmlFolder ? '../index.html' : 'index.html';

    return `
      <header class="glass-navbar">
        <a href="${homeHref}" class="brand">
          <img src="${logoSrc}" alt="Logo Sierra Dorada" class="brand__logo" />
          <span class="brand__text">Sierra Dorada</span>
        </a>

        <nav class="navbar-links" aria-label="Navegacion principal">
          ${this.getLinksHTML()}
        </nav>

        <div class="navbar-actions">
          <a href="${this.htmlPath}carrito.html" class="icon-button icon-button--outline">
            <i class="bi bi-cart"></i> Carrito
          </a>

          ${this.getBotonSesionHTML()}
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

    const btnNavbarLogout = document.getElementById("btnNavbarLogout");

    if (btnNavbarLogout !== null) {
      btnNavbarLogout.addEventListener("click", () => {
        localStorage.removeItem("sesionSierraDorada");
        window.location.href = this.isInHtmlFolder ? "login.html" : "html/login.html";
      });
    }
  }
}