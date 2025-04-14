import { Shape } from "./Shape";
import { Camera, CameraOptions } from "./Camera";
import { CollisionDetector, QuadTreeNode } from "./CollisionDetector.ts";
import { AxisAlignedBoundingBox } from "./BoundingBox.ts";

export interface StageOptions {
  canvas: HTMLCanvasElement;
  camera: CameraOptions;
  bounding: AxisAlignedBoundingBox;
}

export class Stage {
  shapes = new Map<string, Shape>();

  camera: Camera;

  canvas: HTMLCanvasElement;

  ctx: CanvasRenderingContext2D;

  collisionDetector: CollisionDetector;

  get bounding() {
    return this.options.bounding;
  }

  constructor(private options: StageOptions) {
    this.canvas = options.canvas;
    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("can not get 2d ctx");
    this.ctx = ctx;
    this.collisionDetector = new CollisionDetector({ stage: this, quadTree: { capacity: 3, maxDepth: 10 } });
    this.camera = new Camera(options.camera, options.bounding);
  }

  getShape(id: string) {
    return this.shapes.get(id);
  }

  addShape(shape: Shape) {
    this.collisionDetector.addShape(shape);
    this.shapes.set(shape.id, shape);
  }

  render() {
    this.showQuadTree();
    for (const shape of this.shapes.values()) {
      shape.render(this.ctx, this.camera);
    }
  }

  private showQuadTree() {
    const ctx = this.ctx;

    const drawNode = (node: QuadTreeNode<Shape>) => {
      const { x, y, width, height } = this.camera.toViewAABB(node.bounding);
      ctx.save();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
      ctx.restore();

      // 递归子节点
      if (node.children) {
        for (const child of node.children) {
          drawNode(child);
        }
      }
    };

    drawNode(this.collisionDetector.quadTree);
  }
}
