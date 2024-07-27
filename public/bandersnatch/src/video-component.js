class VideoComponent {
  #modal;

  constructor() {}

  initializePlayer() {
    const player = videojs('vid');
    const ModalDialog = videojs.getComponent('ModalDialog');
    this.#modal = new ModalDialog(player, {
      temporary: false,
      closeable: true
    });

    player.addChild(this.#modal);

    player.on('play', () => this.#modal.close());
  }

  configureModal(selected) {
    console.log(selected);
    this.#modal.on('modalopen', () => this.getModalTemplate(selected));
    this.#modal.open();
  }

  getModalTemplate(options) {
    const [option1, option2] = options;
    const htmlTemplate = `
        <div class="overlay">
          <div class="video-button-wrapper">
            <button class="btn btn-dark" onclick="window.nextChunk('${option1}')">
              ${option1}
            </button>
            <button class="btn btn-dark" onclick="window.nextChunk('${option2}')">
              ${option2}
            </button>
          </div>
        </div>
      `;

    this.#modal.contentEl().innerHTML = htmlTemplate;
  }
}
