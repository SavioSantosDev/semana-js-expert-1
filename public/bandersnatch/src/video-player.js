class VideoPlayer {
  #manifestJSON;
  #selected = {};

  /** @type Network */
  #network;

  /** @type HTMLVideoElement */
  #videoElement;

  /** @type SourceBuffer */
  #sourceBuffer;

  #videoDuration = 0;

  constructor({ manifestJSON, network, videoElement }) {
    this.#videoElement = videoElement;
    this.#manifestJSON = manifestJSON;
    this.#network = network;
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
    };
  }

  async #fileDownload(url) {
    const finalUrl = this.#network.parseManifestURL({
      url,
      fileResolution: 720,
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
    this.#videoDuration += videoDuration;
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

      sourceBuffer.addEventListener('updatedend', updateEnd);
      sourceBuffer.addEventListener('error', reject);
    });
  }
}
