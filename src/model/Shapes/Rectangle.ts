import { multiply } from "mathjs";
import { AxisAlignedBoundingBox, OrientedBoundingBox } from "../BoundingBox";
import { MathUtils } from "../MathUtils";
import { Shape, ShapeOptions } from "../Shape";

export interface RectangleOptions extends ShapeOptions {
  width: number;
  height: number;
}

export class Rectangle extends Shape {
  width: number;

  height: number;

  halfWidth: number;

  halfHeight: number;

  constructor(private options: RectangleOptions) {
    super(options);
    this.width = options.width;
    this.height = options.height;
    this.halfWidth = options.width / 2;
    this.halfHeight = options.height / 2;
    this.updateBounding();
  }

  renderShape(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#0089ff";
    ctx.fillRect(-this.halfWidth, -this.halfHeight, this.width, this.height);
  }

  protected getAABB(): AxisAlignedBoundingBox {
    const { halfWidth, halfHeight } = this;
    const corners = [
      [-halfWidth, -halfHeight],
      [halfWidth, -halfHeight],
      [halfWidth, halfHeight],
      [-halfWidth, halfHeight],
    ];
    const transformed = corners.map(([x, y]) => MathUtils.transformPoint(this.transformMatrix, x, y));

    const xs = transformed.map((p) => p.x);
    const ys = transformed.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  protected getOBB(): OrientedBoundingBox {
    const width = this.width * this.scaling.x;
    const height = this.height * this.scaling.y;
    return {
      center: this.translation,
      width,
      height,
      rotation: this.rotation,
    };
  }
}
