export class HeroVideo {
  /**
   * Inicializa la referencia al video del hero y el tiempo de espera entre reproducciones.
   */
  constructor() {
    this.video = document.querySelector('.hero-nosotros__video');
    this.pauseDuration = 30000;
  }

  /**
   * Configura el comportamiento del video cuando termina.
   * Si no existe el video en la página, no hace nada.
   */
  init() {
    if (!this.video) return;

    this.video.addEventListener('ended', () => {
      this.handleVideoEnd();
    });
  }

  /**
   * Pausa el video cerca del final, lo retrocede unos frames para mostrar
   * el penúltimo frame, espera 30 segundos y lo reproduce desde el inicio.
   */
  handleVideoEnd() {
    this.video.pause();
    this.video.currentTime = Math.max(0, this.video.duration - 0.05);

    setTimeout(() => {
      this.video.currentTime = 0;
      this.video.play();
    }, this.pauseDuration);
  }
}
