class VideoPlayer {
  #manifestJSON;
  #selected = {};
  #activeItem = {};
  selections = [];

  /** @type Network */
  #network;

  /** @type VideoComponent */
  #videoComponent;

  /** @type HTMLVideoElement */
  #videoElement;

  /** @type SourceBuffer */
  #sourceBuffer;

  #videoDuration = 0;

  constructor({ manifestJSON, network, videoComponent, videoElement }) {
    this.#videoElement = videoElement;
    this.#manifestJSON = manifestJSON;
    this.#network = network;
    this.#videoComponent = videoComponent;
  }

  initializeCodec() {
    const mediaSourceSupported = !!window.MediaSource;
    if (!mediaSourceSupported) {
      return alert('Seu navegador não tem suportea MSE!');
    }

    const codec = this.#manifestJSON.codec;
    const codecSupported = MediaSource.isTypeSupported(codec);
    if (!codecSupported) {
      return alert(`Seu navegador não suporta o coded: ${codec}`);
    }

    const mediaSource = new MediaSource();
    this.#videoElement.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', this.#sourceOpenWrapper(mediaSource));
  }

  /**
   * @param {MediaSource} mediaSource
   */
  #sourceOpenWrapper(mediaSource) {
    return async () => {
      this.#sourceBuffer = mediaSource.addSourceBuffer(this.#manifestJSON.codec);
      this.#selected = this.#manifestJSON.intro;

      // Evita rotar como LIVE
      mediaSource.duration = this.#videoDuration;

      await this.#fileDownload(this.#selected.url);
      setInterval(() => {
        this.#waitForQuestions();
      }, 200);
    };
  }

  #waitForQuestions() {
    const currentTime = parseInt(this.#videoElement.currentTime);
    const option = this.#selected.at === currentTime;
    if (!option) return;

    if (this.#activeItem.url === this.#selected.url) return;

    this.#videoComponent.configureModal(this.#selected.options);
    this.#activeItem = this.#selected;
  }

  async currentFileResolution() {
    const LOWEST_RESOLUTION = 144;
    const prepareUrl = {
      url: this.#manifestJSON.finalizar.url,
      fileResolution: LOWEST_RESOLUTION,
      fileResolutionTag: this.#manifestJSON.fileResolutionTag,
      hostTag: this.#manifestJSON.hostTag
    };

    const url = this.#network.parseManifestURL(prepareUrl);
    return this.#network.getProperResolution(url);
  }

  async nextChunk(data) {
    const key = data.toLowerCase();
    const selected = this.#manifestJSON[key];
    this.#selected = {
      ...selected,
      // ajusta o tempo que o modal vai aparecer, baseado no tempo corrent,
      at: parseInt(this.#videoElement.currentTime + selected.at)
    };
    this.manageLag(selected);
    this.#videoElement.play();
    await this.#fileDownload(selected.url);
  }

  manageLag(selected) {
    if (!!~this.selections.indexOf(selected.url)) {
      selected.at += 5;
      return;
    }

    this.selections.push(selected.url);
  }

  async #fileDownload(url) {
    debugger;
    const fileResolution = await this.currentFileResolution();

    const finalUrl = this.#network.parseManifestURL({
      url,
      fileResolution,
      fileResolutionTag: this.#manifestJSON.fileResolutionTag,
      hostTag: this.#manifestJSON.hostTag
    });

    this.#setVideoPlayerDuration(finalUrl);

    const data = await this.#network.fetchFile(finalUrl);
    return this.#processBufferSegments(data);
  }

  #setVideoPlayerDuration(url) {
    const bars = url.split('/');
    const [name, videoDuration] = bars[bars.length - 1].split('-');
    this.#videoDuration += parseFloat(videoDuration);
  }

  async #processBufferSegments(allSegments) {
    const sourceBuffer = this.#sourceBuffer;
    sourceBuffer.appendBuffer(allSegments);
    return new Promise((resolve, reject) => {
      const updateEnd = () => {
        sourceBuffer.removeEventListener('updateend', updateEnd);
        sourceBuffer.timestampOffset = this.#videoDuration;

        return resolve(0);
      };

      sourceBuffer.addEventListener('updateend', updateEnd);
      sourceBuffer.addEventListener('error', reject);
    });
  }
}
