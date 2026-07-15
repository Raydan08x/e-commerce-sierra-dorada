import { Navbar } from './components/navbar.js';
import { Footer } from './components/footer.js';
import { Preloader } from './components/Preloader.js';

const preloader = new Preloader({ duration: 2000 });
preloader.render();

const navbar = new Navbar();
navbar.render();

const footer = new Footer();
footer.render();
