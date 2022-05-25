import { Camera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function createControls(camera: Camera, container: any) {
  const controls = new OrbitControls(camera, container);
  controls.enableDamping = true;
  controls.target.set(-2, 0, 0);
  return controls;
}

export { createControls };
