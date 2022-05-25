import { AmbientLight, Camera, DirectionalLight, Scene } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function addLight(scene: Scene, controls: OrbitControls, camera: Camera) {
  const lightColor = 0xffffff;
  const ambientLight = new AmbientLight(lightColor, 0.5);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(lightColor, 1);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  controls.addEventListener('change', () => {
    directionalLight.position.copy(camera.position);
  });
}

export { addLight };
