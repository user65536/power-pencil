import { AxisAlignedBoundingBox, aabbIntersects } from "../BoundingBox";

export interface QuadTreeNodeOptions {
  bounding: AxisAlignedBoundingBox;
  maxDepth: number;
  capacity: number;
  depth: number;
}

export interface QuadTreeItem<T> {
  id: string;
  bounding: AxisAlignedBoundingBox;
  data: T;
}

export class QuadTreeNode<Data extends { id: string }> {
  items: QuadTreeItem<Data>[] = [];
  children: QuadTreeNode<Data>[] = [];

  get bounding() {
    return this.options.bounding;
  }

  constructor(private options: QuadTreeNodeOptions, private shapeToNodes: Map<string, Set<QuadTreeNode<Data>>>) {}

  insert(data: Data, bounding: AxisAlignedBoundingBox): boolean {
    const item: QuadTreeItem<Data> = { id: data.id, bounding, data };
    if (!aabbIntersects(this.bounding, bounding)) return false;
    if (this.isLeaf() && (this.items.length < this.options.capacity || this.options.depth >= this.options.maxDepth)) {
      this.items.push(item);
      this.addToMap(item.id, this);
      return true;
    }
    if (this.isLeaf()) {
      this.split();
      for (const child of this.children) {
        this.items.forEach((i) => {
          this.removeFromMap(i.id, this);
          child.insert(i.data, i.bounding);
        });
      }
      this.items = [];
    }
    this.children.forEach((child) => child.insert(data, bounding));

    return true;
  }

  query(bounding: AxisAlignedBoundingBox): Map<string, Data> {
    const result = new Map<string, Data>();
    if (!aabbIntersects(this.bounding, bounding)) return result;
    if (this.items.length > 0) {
      this.items.forEach((i) => result.set(i.id, i.data));
      return result;
    }
    for (const child of this.children) {
      const childResultMap = child.query(bounding);
      for (const [id, childResult] of childResultMap.entries()) {
        result.set(id, childResult);
      }
    }
    return result;
  }

  isLeaf() {
    return this.children.length === 0;
  }

  private split() {
    const halfWidth = this.bounding.width / 2;
    const halfHeight = this.bounding.height / 2;
    this.children = [
      [0, 0],
      [halfWidth, 0],
      [0, halfHeight],
      [halfWidth, halfHeight],
    ].map(([dx, dy]) => {
      return new QuadTreeNode<Data>(
        {
          ...this.options,
          bounding: { x: this.bounding.x + dx, y: this.bounding.y + dy, width: halfWidth, height: halfHeight },
          depth: this.options.depth + 1,
        },
        this.shapeToNodes,
      );
    });
  }

  private addToMap(id: string, node: QuadTreeNode<Data>) {
    const shapeSet = this.shapeToNodes.get(id);
    if (!shapeSet) {
      this.shapeToNodes.set(id, new Set<QuadTreeNode<Data>>([node]));
    } else {
      shapeSet.add(node);
    }
  }

  private removeFromMap(id: string, node: QuadTreeNode<Data>) {
    const shapeSet = this.shapeToNodes.get(id);
    if (!shapeSet) return;
    shapeSet.delete(node);
  }
}
