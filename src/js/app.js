import { Navbar } from './components/navbar.js';
import { Footer } from './components/footer.js';
<<<<<<< HEAD
import { Preloader } from './components/Preloader.js';

const preloader = new Preloader({ duration: 2000 });
preloader.render();
=======
import { ToastManager } from './components/ToastManager.js';

const toastManager = new ToastManager();
window.toastManager = toastManager;
>>>>>>> 9fca5ab816fa173c5ffb2253d6a2b23f8f71b4d9

const navbar = new Navbar();
navbar.render();

const footer = new Footer();
footer.render();
