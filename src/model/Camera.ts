import { Coordinate, ViewCoordinate, WorldCoordinate } from "./Coordinate";
import { matrix, multiply, inv, Matrix, transpose } from "mathjs";

export interface CameraOptions {
  width: number;
  height: number;
}

export class Camera {
  width: number;

  height: number;

  _translate: Coordinate = { x: 0, y: 0 };

  _scale: number = 1;

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

  constructor(options: CameraOptions) {
    this.width = options.width;
    this.height = options.height;
  }

  translate(x: number, y: number) {
    this._translate.x += x;
    this._translate.y += y;
  }

  scale(rate: number) {
    this._scale *= rate;
  }

  zoom(rate: number, center: ViewCoordinate) {
    const centerBeforeZoom = this.toWorld(center);
    const scale = 1 / rate;
    this.scale(scale);
    const centerAfterZoom = this.toWorld(center);
    const dx = centerAfterZoom.x - centerBeforeZoom.x;
    const dy = centerAfterZoom.y - centerBeforeZoom.y;
    this.translate(-dx, -dy);
  }

  toWorld(coordinate: ViewCoordinate): WorldCoordinate {
    const vec = multiply(this.invViewMatrix, transpose([coordinate.x, coordinate.y, 1]));
    const [x, y, _] = vec.toArray() as number[];
    return { x, y };
  }
}
