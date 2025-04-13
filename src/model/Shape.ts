import { matrix, multiply } from "mathjs";
import { Coordinate } from "./Coordinate";
import { Camera } from "./Camera";
import { nanoid } from "nanoid";
import { AxisAlignedBoundingBox, OrientedBoundingBox } from "./BoundingBox";
import { MathUtils } from "./MathUtils";

export interface ShapeOptions {}

export abstract class Shape {
  id = nanoid(8);

  rotation: number = 0;

  translation: Coordinate = { x: 0, y: 0 };

  rotateMatrix = matrix([
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);

  scaling: Coordinate = { x: 1, y: 1 };

  get transformMatrix() {
    return multiply(this.translateMatrix, this.rotateMatrix, this.scaleMatrix);
  }

  get translateMatrix() {
    return matrix([
      [1, 0, this.translation.x],
      [0, 1, this.translation.y],
      [0, 0, 1],
    ]);
  }

  get scaleMatrix() {
    return matrix([
      [this.scaling.x, 0, 0],
      [0, this.scaling.y, 0],
      [0, 0, 1],
    ]);
  }

  aabb!: AxisAlignedBoundingBox;
  obb!: OrientedBoundingBox;

  constructor(options: ShapeOptions) {}

  protected abstract renderShape(ctx: CanvasRenderingContext2D, camera: Camera): void;
  protected abstract getAABB(): AxisAlignedBoundingBox;
  protected abstract getOBB(): OrientedBoundingBox;

  updateBounding() {
    this.aabb = this.getAABB();
    this.obb = this.getOBB();
  }

  rotateTo(rotate: number) {
    this.rotation = rotate;
    const rad = (rotate * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    this.rotateMatrix = matrix([
      [cos, -sin, 0],
      [sin, cos, 0],
      [0, 0, 1],
    ]);
    this.updateBounding();
  }

  rotate(degree: number) {
    this.rotateTo(this.rotation + degree);
  }

  scale(x: number, y: number) {
    this.scaleTo(this.scaling.x * x, this.scaling.y * y);
  }

  scaleTo(x: number, y: number) {
    console.log("scale to", x, y);
    this.scaling.x = x;
    this.scaling.y = y;
    this.updateBounding();
  }

  translate(x: number, y: number) {
    this.translateTo(this.translation.x + x, this.translation.y + y);
  }

  translateTo(x: number, y: number) {
    this.translation.x = x;
    this.translation.y = y;
    console.log("translate to", x, y);
    this.updateBounding();
  }

  render(ctx: CanvasRenderingContext2D, camera: Camera) {
    ctx.save();

    ctx.transform(...MathUtils.matrixToCanvasTransform(camera.viewMatrix));
    ctx.transform(...MathUtils.matrixToCanvasTransform(this.transformMatrix));
    this.renderShape(ctx, camera);
    ctx.restore();
  }
}
