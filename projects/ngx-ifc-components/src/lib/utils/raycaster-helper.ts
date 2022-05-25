import { Camera, Raycaster, Vector2 } from 'three';

export class RaycasterHelper {
  private raycaster: Raycaster;
  private canvas: any;
  private camera: Camera;

  constructor(canvas: any, camera: Camera) {
    this.raycaster = new Raycaster();
    // this.raycaster.firstHitOnly = true;
    this.canvas = canvas;
    this.camera = camera;
  }

  cast(x: number, y: number, models: any[]) {
    const mouse = new Vector2();

    // Computes the position of the mouse on the screen
    const bounds = this.canvas.getBoundingClientRect();

    const x1 = x - bounds.left;
    const x2 = bounds.right - bounds.left;
    mouse.x = (x1 / x2) * 2 - 1;

    const y1 = y - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = -(y1 / y2) * 2 + 1;

    // Places it on the camera pointing to the mouse
    this.raycaster.setFromCamera(mouse, this.camera);

    // Casts a ray
    return this.raycaster.intersectObjects(models);
  }
}
