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

  async getProperResolution(url) {
    const startMs = Date.now();
    const response = await fetch(url);
    await response.arrayBuffer();
    const endMs = Date.now();

    const durationInMs = endMs - startMs;

    const resolutions = [
      { start: 3001, end: 20000, resolution: 144 },
      { start: 901, end: 3000, resolution: 360 },
      { start: 0, end: 900, resolution: 720 }
    ];

    const item = resolutions.find((item) => item.start <= durationInMs && item.end >= durationInMs);
    const LOWEST_RESOLUTION = 144;

    if (!item) return LOWEST_RESOLUTION;

    return item.resolution;
  }
}
