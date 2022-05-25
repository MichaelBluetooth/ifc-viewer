import { WebGLRenderer } from 'three';

function createRenderer(canvas: any) {
  const renderer = new WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });

  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height-18); //leave some padding on the bottom so we don't show an annoying scroll bar
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  return renderer;
}

export { createRenderer };
