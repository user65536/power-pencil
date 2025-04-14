import { Coordinate, ViewCoordinate, ViewVector, WorldCoordinate, WorldVector } from "./Coordinate";
import { matrix, multiply, inv, Matrix } from "mathjs";
import { MathUtils } from "./MathUtils";
import { AxisAlignedBoundingBox, OrientedBoundingBox } from "./BoundingBox";

export interface CameraOptions {
  width: number;
  height: number;
  scaleRange: [number, number];
}

export class Camera {
  width: number;

  height: number;

  _translate: Coordinate = { x: 0, y: 0 };

  _scale: number = 1;

  worldBounding: AxisAlignedBoundingBox;

  get invViewMatrix(): Matrix {
    return multiply(this.translateMatrix, this.scaleMatrix);
  }

  get viewMatrix(): Matrix {
    return inv(this.invViewMatrix);
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
      [this._scale, 0, 0],
      [0, this._scale, 0],
      [0, 0, 1],
    ]);
  }

  constructor(private options: CameraOptions, worldBounding: AxisAlignedBoundingBox) {
    this.width = options.width;
    this.height = options.height;
    this.worldBounding = worldBounding;
  }

  translate(x: number, y: number) {
    const newX = this._translate.x + x;
    const newY = this._translate.y + y;
    if (newX >= this.worldBounding.x && newX <= this.worldBounding.x + this.worldBounding.width) {
      this._translate.x = newX;
    }
    if (newY >= this.worldBounding.y && newY <= this.worldBounding.y + this.worldBounding.width) {
      this._translate.y = newY;
    }
  }

  scale(rate: number) {
    const newScale = this._scale * rate;
    const [min, max] = this.options.scaleRange;
    if (newScale < min || newScale > max) return;
    this._scale = newScale;
  }

  zoom(rate: number, center: ViewCoordinate) {
    const centerBeforeZoom = this.toWorldPoint(center);
    const scale = 1 / rate;
    this.scale(scale);
    const centerAfterZoom = this.toWorldPoint(center);
    const dx = centerAfterZoom.x - centerBeforeZoom.x;
    const dy = centerAfterZoom.y - centerBeforeZoom.y;
    this.translate(-dx, -dy);
  }

  toWorldVector(vector: ViewVector): WorldVector {
    return MathUtils.transformVector(this.invViewMatrix, vector.x, vector.y);
  }

  toViewVector(vector: WorldVector): ViewVector {
    return MathUtils.transformVector(this.viewMatrix, vector.x, vector.y);
  }

  toWorldPoint(coordinate: ViewCoordinate): WorldCoordinate {
    return MathUtils.transformPoint(this.invViewMatrix, coordinate.x, coordinate.y);
  }

  toViewPoint(coordinate: WorldCoordinate): ViewCoordinate {
    return MathUtils.transformPoint(this.viewMatrix, coordinate.x, coordinate.y);
  }

  toViewAABB(worldRect: AxisAlignedBoundingBox) {
    return MathUtils.transformAABB(this.viewMatrix, worldRect);
  }

  toWorldAABB(viewRect: AxisAlignedBoundingBox) {
    return MathUtils.transformAABB(this.invViewMatrix, viewRect);
  }

  toViewOBB(worldOBB: OrientedBoundingBox): OrientedBoundingBox {
    const { center, width, height, rotation } = worldOBB;
    const topLeft = { x: center.x - width / 2, y: center.y - height / 2 };
    const rect: AxisAlignedBoundingBox = { ...topLeft, width, height };

    const transformedRect = MathUtils.transformAABB(this.viewMatrix, rect);

    return {
      center: { x: transformedRect.x + transformedRect.width / 2, y: transformedRect.y + transformedRect.height / 2 },
      width: transformedRect.width,
      height: transformedRect.height,
      rotation,
    };
  }

  toWorldOBB(viewOBB: OrientedBoundingBox): OrientedBoundingBox {
    const { center, width, height, rotation } = viewOBB;
    const topLeft = { x: center.x - width / 2, y: center.y - height / 2 };
    const rect: AxisAlignedBoundingBox = { ...topLeft, width, height };
    const transformedRect = MathUtils.transformAABB(this.invViewMatrix, rect);

    return {
      center: { x: transformedRect.x + transformedRect.width / 2, y: transformedRect.y + transformedRect.height / 2 },
      width: transformedRect.width,
      height: transformedRect.height,
      rotation,
    };
  }
}
