import { Navbar } from './components/navbar.js?v=20260715-1';
import { Footer } from './components/footer.js?v=20260715-1';
import { Preloader } from './components/Preloader.js?v=20260715-1';
import { ToastManager } from './components/ToastManager.js?v=20260715-1';

const preloader = new Preloader({ duration: 200 });
preloader.render();

const toastManager = new ToastManager();
window.toastManager = toastManager;

const navbar = new Navbar();
navbar.render();

const footer = new Footer();
footer.render();
