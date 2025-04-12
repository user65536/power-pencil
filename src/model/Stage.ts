import { Shape } from "./Shape";
import { Camera, CameraOptions } from "./Camera";

export interface StageOptions {
  camera: CameraOptions;
}

export class Stage {
  shapes = new Map<string, Shape>();

  camera: Camera;

  constructor(options: StageOptions) {
    this.camera = new Camera(options.camera);
  }

  addShape(shape: Shape) {
    this.shapes.set(shape.id, shape);
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const shape of this.shapes.values()) {
      shape.render(ctx, this.camera);
    }
  }
}
