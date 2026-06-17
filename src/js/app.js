import { Navbar } from './components/navbar.js';
import { Footer } from './components/footer.js';
import { HeroVideo } from './components/hero-video.js';

const navbar = new Navbar();
navbar.render();

const footer = new Footer();
footer.render();

const heroVideo = new HeroVideo();
heroVideo.init();
