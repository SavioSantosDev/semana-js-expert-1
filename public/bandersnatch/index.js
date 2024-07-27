const MANIFEST_URL = 'manifest.json';
const localhost = ['localhost', 'http://127.0.0.1'];

async function main() {
  const manifestJSON = await (await fetch(MANIFEST_URL)).json();

  const isLocal = localhost.includes(window.location.hostname);
  const host = isLocal ? manifestJSON.localhost : manifestJSON.production;

  const network = new Network({ host });
  const videoComponent = new VideoComponent();
  const videoPLayer = new VideoPlayer({
    manifestJSON,
    network,
    videoElement: document.getElementById('vid'),
    videoComponent
  });

  videoPLayer.initializeCodec();
  videoComponent.initializePlayer();

  window.nextChunk = (data) => videoPLayer.nextChunk(data);
}

window.onload = main;
