import { PerspectiveCamera } from 'three';

function createCamera() {

  const camera = new PerspectiveCamera(75, 1);
  camera.position.z = 15;
  camera.position.y = 13;
  camera.position.x = 8;
  return camera;
}

export { createCamera };
