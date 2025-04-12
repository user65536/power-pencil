import { Matrix } from "mathjs";

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
}
