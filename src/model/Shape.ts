import { matrix, multiply } from "mathjs";
import { Coordinate } from "./Coordinate";
import { Camera } from "./Camera";
import { MathUtils } from "../utils";
import { nanoid } from "nanoid";

export interface ShapeOptions {}

export abstract class Shape {
  id = nanoid();

  _rotate: number = 0;

  _translate: Coordinate = { x: 0, y: 0 };

  rotateMatrix = matrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);

  _scale: Coordinate = { x: 1, y: 1 };

  get transformMatrix() {
    return multiply(this.translateMatrix, this.rotateMatrix, this.scaleMatrix);
  }

  get translateMatrix() {
    return matrix([
      [1, 0, this._translate.x],
      [0, 1, this._translate.y],
      [0, 0, 1],
    ]);
  }

  get scaleMatrix() {
    return matrix([
      [this._scale.x, 0, 0],
      [0, this._scale.y, 0],
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
    this._scale.x *= x;
    this._scale.y *= y;
  }

  translate(x: number, y: number) {
    this._translate.x += x;
    this._translate.y += y;
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera) {
    ctx.save();

    ctx.transform(...MathUtils.matrixToCanvasTransform(camera.viewMatrix));
    ctx.transform(...MathUtils.matrixToCanvasTransform(this.transformMatrix));
    this.renderShape(ctx, camera);

    ctx.restore();
  }
}
