import { Shape, ShapeOptions } from "../Shape";

export interface RectangleOptions extends ShapeOptions {
  width: number;
  height: number;
}

export class Rectangle extends Shape {
  width: number;

  height: number;

  constructor(options: RectangleOptions) {
    super(options);
    this.height = options.height;
    this.width = options.width;
  }

  renderShape(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#0089ff";
    ctx.fillRect(0, 0, this.width, this.height);
  }
}
