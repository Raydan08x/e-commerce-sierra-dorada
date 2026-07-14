import { Navbar } from './components/navbar.js';
import { Footer } from './components/footer.js';
import { ToastManager } from './components/ToastManager.js';

const toastManager = new ToastManager();
window.toastManager = toastManager;

const navbar = new Navbar();
navbar.render();

const footer = new Footer();
footer.render();
