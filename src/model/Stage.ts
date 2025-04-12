import { Shape } from "./Shape";
import { Camera, CameraOptions } from "./Camera";

export interface StageOptions {
  canvas: HTMLCanvasElement;
  camera: CameraOptions;
}

export class Stage {
  shapes = new Map<string, Shape>();

  camera: Camera;

  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  constructor(options: StageOptions) {
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("can not get 2d ctx");
    this.ctx = ctx;
    this.camera = new Camera(options.camera);
  }

  addShape(shape: Shape) {
    this.shapes.set(shape.id, shape);
  }

  render() {
    for (const shape of this.shapes.values()) {
      shape.render(this.ctx, this.camera);
    }
  }
}
