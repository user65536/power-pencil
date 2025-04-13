import { AxisAlignedBoundingBox } from "../BoundingBox";
import { Coordinate, ViewCoordinate, WorldCoordinate } from "../Coordinate";
import { Shape } from "../Shape";
import { Stage } from "../Stage";
import { QuadTreeNode, QuadTreeNodeOptions } from "./QuadTreeNode";

export interface CollisionDetectorOptions {
  quadTree: Pick<QuadTreeNodeOptions, "maxDepth" | "capacity">;
  stage: Stage;
}

export class CollisionDetector {
  quadTree: QuadTreeNode<Shape>;

  get stage() {
    return this.options.stage;
  }

  constructor(private options: CollisionDetectorOptions) {
    this.quadTree = new QuadTreeNode({ ...options.quadTree, depth: 0, bounding: this.stage.bounding });
  }

  addShape(shape: Shape) {
    const worldBounding = shape.aabb;
    console.log("view bounding", shape.aabb);
    return this.quadTree.insert(shape, worldBounding);
  }

  query(bounding: AxisAlignedBoundingBox) {
    const resultMap = this.quadTree.query(bounding);
    return Array.from(resultMap.values());
  }

  hit(viewCoordinate: ViewCoordinate, worldCoordinate: WorldCoordinate): Shape | null {
    const candidates = this.query({
      x: Math.floor(worldCoordinate.x),
      y: Math.floor(worldCoordinate.y),
      width: 1,
      height: 1,
    });
    for (const shape of candidates) {
      const canvas = document.createElement("canvas");
      canvas.width = this.stage.camera.width;
      canvas.height = this.stage.camera.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      shape.render(ctx, this.stage.camera);
      const imageData = ctx.getImageData(Math.floor(viewCoordinate.x), Math.floor(viewCoordinate.y), 1, 1);
      if (imageData.data?.[3] > 0) return shape;
    }
    return null;
  }
}
