import { GridHelper, Scene } from 'three';

function createScene() {
  const scene = new Scene();

  //Creates grids and axes in the scene
  const grid = new GridHelper(50, 30);
  scene.add(grid);

  return scene;
}

export { createScene };
