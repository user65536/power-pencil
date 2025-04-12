import { matrix, multiply } from "mathjs";
import { Coordinate } from "./Coordinate";
import { Camera } from "./Camera";
import { Utils } from "./Utils";
import { nanoid } from "nanoid";

export interface ShapeOptions {}

export abstract class Shape {
  id = nanoid();

  _rotate: number = 0;

  _translate: Coordinate = [0, 0];

  rotateMatrix = matrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);

  _scale: Coordinate = [1, 1];

  get transformMatrix() {
    return multiply(this.translateMatrix, this.rotateMatrix, this.scaleMatrix);
  }

  get translateMatrix() {
    return matrix([
      [1, 0, this._translate[0]],
      [0, 1, this._translate[1]],
      [0, 0, 1],
    ]);
  }

  get scaleMatrix() {
    return matrix([
      [this._scale[0], 0, 0],
      [0, this._scale[1], 0],
      [0, 0, 1],
    ]);
  }

  constructor(options: ShapeOptions) {}

  protected abstract renderShape(ctx: CanvasRenderingContext2D, camera: Camera): void;

  rotate(rotate: number) {
    this._rotate = rotate;
    const rad = (rotate * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    this.rotateMatrix = matrix([
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1],
    ]);
  }

  scale(x: number, y: number) {
    this._scale[0] *= x;
    this._scale[1] *= y;
  }

  translate(x: number, y: number) {
    this._translate[0] += x;
    this._translate[1] += y;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera) {
    ctx.save();

    ctx.transform(...Utils.matrixToCanvasTransform(camera.viewMatrix));
    ctx.transform(...Utils.matrixToCanvasTransform(this.transformMatrix));
    this.renderShape(ctx, camera);

    ctx.restore();
  }
}
