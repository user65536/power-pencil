import { Coordinate } from "./Coordinate";
import { matrix, multiply, inv, Matrix, transpose } from "mathjs";

export interface CameraOptions {
  width: number;
  height: number;
}

export class Camera {
  width: number;

  height: number;

  _translate: Coordinate = [0, 0];

  _scale: number = 1;

  get invViewMatrix(): Matrix {
    return multiply(this.translateMatrix, this.scaleMatrix);
  }

  get viewMatrix(): Matrix {
    return inv(this.invViewMatrix);
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
    this._translate[0] += x;
    this._translate[1] += y;
  }

  scale(rate: number) {
    this._scale *= rate;
  }

  toWorld(coordinate: Coordinate) {
    const vec = multiply(this.viewMatrix, transpose([...coordinate, 1]));
    return vec.toArray().slice(0, 2);
  }
}
