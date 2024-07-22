class Network {
  #host;

  constructor({ host }) {
    this.#host = host;
  }

  /**
   * url: $HOST/timeline/01.intro/01.intro-12.733333-$RESOLUTION.mp4
   * fileResolutionTag: $RESOLUTION
   * hostTag: $hostTag
   */
  parseManifestURL({ url, fileResolution, fileResolutionTag, hostTag }) {
    return url.replace(fileResolutionTag, fileResolution).replace(hostTag, this.#host);
  }

  async fetchFile(url) {
    const response = await fetch(url);
    return response.arrayBuffer();
  }
}
