export class HeroVideo {
  constructor() {
    this.video = document.querySelector('.hero-nosotros__video');
    this.pauseDuration = 30000;
  }

  init() {
    if (!this.video) return;

    this.video.addEventListener('ended', () => {
      this.handleVideoEnd();
    });
  }

  handleVideoEnd() {
    this.video.pause();
    this.video.currentTime = Math.max(0, this.video.duration - 0.05);

    setTimeout(() => {
      this.video.currentTime = 0;
      this.video.play();
    }, this.pauseDuration);
  }
}
