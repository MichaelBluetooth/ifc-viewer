import { Camera, Vector3, WebGLRenderer } from 'three';
import { createCamera } from './camera';
import { RaycasterHelper } from './raycaster-helper';
import { createControls } from './controls';
import { addLight } from './lights';
import { createRenderer } from './renderer';
import { Resizer } from './resizer';
import { createScene } from './scene';
import { Injectable } from '@angular/core';
import { IFCService } from '../services/ifc.service';
import * as THREE from 'three';

let renderer: WebGLRenderer;
let camera: any;
let scene: any;
let controls: any;
let animateFn: any;

@Injectable()
export class WorldService {
  constructor(private ifc: IFCService) {}

  init(container: any) {
    scene = createScene();
    camera = createCamera();
    controls = createControls(camera, container);
    addLight(scene, controls, camera);

    renderer = createRenderer(container);
    // container.append(renderer.domElement);

    const resizer = new Resizer(container, camera, renderer);

    animateFn = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animateFn);
    };

    const raycaster = new RaycasterHelper(container, camera);

    this.ifc.init(scene, raycaster);
  }

  animate() {
    animateFn();
  }

  reset() {
    //original hard-coded position
    //todo: center on ifc model?
    camera.position.z = 15;
    camera.position.y = 13;
    camera.position.x = 8;
    camera.zoom = 1;
    camera.updateProjectionMatrix();

    this.ifc.reset(true);
  }

  getCameraPosition(): Vector3 {
    return new Vector3(camera.position.x, camera.position.y, camera.position.z);
  }

  setCameraPosition(position: Vector3) {
    camera.position.set(position.x, position.y, position.z);
    this.animate();
  }

  setRotateOnlyMode(enable: boolean) {
    if (enable) {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: null,
        RIGHT: null,
      };
      controls.enableRotate = true;
      controls.enableZoom = false;
      controls.enablePan = false;
    } else {
      this.restoreControlDefaults();
    }
  }

  setPanOnlyMode(enable: boolean) {
    if (enable) {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: null,
        RIGHT: null,
      };
      controls.enablePan = true;
      controls.enableZoom = false;
      controls.enableRotate = false;
    } else {
      this.restoreControlDefaults();
    }
  }

  private restoreControlDefaults(){
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
  }

  zoomIn(){
    camera.zoom = camera.zoom+.5;
    camera.updateProjectionMatrix();
  }

  zoomOut(){
    camera.zoom = camera.zoom-.5;
    camera.updateProjectionMatrix();
  }
}
