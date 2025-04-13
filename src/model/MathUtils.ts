import { Matrix, multiply, transpose } from "mathjs";
import { AxisAlignedBoundingBox } from "./BoundingBox";

export class MathUtils {
  static matrixToCanvasTransform(matrix: Matrix): [number, number, number, number, number, number] {
    const m = matrix.toArray() as number[][];

    if (m.length !== 3 || m[0].length !== 3) {
      throw new Error("Input matrix must be 3x3");
    }

    // Canvas: [a, b, c, d, e, f]
    // 矩阵:
    // [a, c, e]
    // [b, d, f]
    // [0, 0, 1]
    return [
      m[0][0], // a
      m[1][0], // b
      m[0][1], // c
      m[1][1], // d
      m[0][2], // e
      m[1][2], // f
    ];
  }

  static transformPoint(matrix: Matrix, x: number, y: number) {
    return this.transformPointOrVector(matrix, x, y, 1);
  }

  static transformVector(matrix: Matrix, x: number, y: number) {
    return this.transformPointOrVector(matrix, x, y, 1);
  }

  private static transformPointOrVector(matrix: Matrix, x: number, y: number, w: number) {
    const vec = multiply(matrix, transpose([x, y, w]));
    const [resultX, resultY, _] = vec.toArray() as number[];
    return { x: resultX, y: resultY };
  }

  static transformAABB(matrix: Matrix, rect: AxisAlignedBoundingBox): AxisAlignedBoundingBox {
    const m = matrix.toArray() as number[][];

    const scaleX = m[0][0];
    const scaleY = m[1][1];
    const translateX = m[0][2];
    const translateY = m[1][2];

    const x = rect.x * scaleX + translateX;
    const y = rect.y * scaleY + translateY;

    const width = rect.width * scaleX;
    const height = rect.height * scaleY;

    return {
      x,
      y,
      width,
      height,
    };
  }
}
