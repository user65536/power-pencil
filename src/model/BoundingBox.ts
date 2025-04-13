import { Coordinate } from "./Coordinate";

export interface AxisAlignedBoundingBox extends Coordinate {
  width: number;
  height: number;
}

export interface OrientedBoundingBox {
  center: Coordinate;
  width: number;
  height: number;
  rotation: number;
}

export function aabbIntersects(a: AxisAlignedBoundingBox, b: AxisAlignedBoundingBox) {
  const xIntersect = a.x < b.x + b.width && a.x + a.width > b.x;
  const yIntersect = a.y < b.y + b.height && a.y + a.height > b.y;
  return xIntersect && yIntersect;
}
