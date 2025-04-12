export class QuadTree {
  private bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  private maxObjects: number;
  private maxLevels: number;
  private level: number;
  private objects: Array<{ bounds: any }> = [];
  private nodes: QuadTree[] = [];

  constructor(
    bounds: { x: number; y: number; width: number; height: number },
    maxObjects = 10,
    maxLevels = 4,
    level = 0,
  ) {
    this.bounds = bounds;
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
  }

  // 检查两个矩形是否相交
  private intersects(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number },
  ): boolean {
    return !(a.x + a.width < b.x || a.y + a.height < b.y || a.x > b.x + b.width || a.y > b.y + b.height);
  }

  private split() {
    const nextLevel = this.level + 1;
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const { x, y } = this.bounds;

    this.nodes = [
      new QuadTree({ x: x, y: y, width: subWidth, height: subHeight }, this.maxObjects, this.maxLevels, nextLevel),
      new QuadTree(
        { x: x + subWidth, y: y, width: subWidth, height: subHeight },
        this.maxObjects,
        this.maxLevels,
        nextLevel,
      ),
      new QuadTree(
        { x: x, y: y + subHeight, width: subWidth, height: subHeight },
        this.maxObjects,
        this.maxLevels,
        nextLevel,
      ),
      new QuadTree(
        { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
        this.maxObjects,
        this.maxLevels,
        nextLevel,
      ),
    ];
  }

  private getIndex(rect: { x: number; y: number; width: number; height: number }): number {
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    // 检查对象是否可以完全放入某个象限
    const top = rect.y < horizontalMidpoint && rect.y + rect.height < horizontalMidpoint;
    const bottom = rect.y > horizontalMidpoint;
    const left = rect.x < verticalMidpoint && rect.x + rect.width < verticalMidpoint;
    const right = rect.x > verticalMidpoint;

    if (left) {
      if (top) return 0;
      if (bottom) return 2;
    } else if (right) {
      if (top) return 1;
      if (bottom) return 3;
    }

    return -1; // 无法完全放入任何象限
  }

  public insert(obj: { bounds: any }) {
    // 如果有子节点，尝试将对象放入子节点
    if (this.nodes.length) {
      const index = this.getIndex(obj.bounds);
      if (index !== -1) {
        this.nodes[index].insert(obj);
        return;
      }
    }

    // 否则放入当前节点
    this.objects.push(obj);

    // 如果对象数量超过最大值且未达到最大层级，则分割
    if (this.objects.length > this.maxObjects && this.level < this.maxLevels && !this.nodes.length) {
      this.split();

      // 将现有对象重新分配到子节点
      for (let i = 0; i < this.objects.length; ) {
        const index = this.getIndex(this.objects[i].bounds);
        if (index !== -1) {
          this.nodes[index].insert(this.objects.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  }

  public retrieve(rect: { x: number; y: number; width: number; height: number }): Array<{ bounds: any }> {
    let returnObjects: Array<{ bounds: any }> = [];

    // 检查当前节点的对象是否与查询区域相交
    for (const obj of this.objects) {
      if (this.intersects(obj.bounds, rect)) {
        returnObjects.push(obj);
      }
    }

    // 如果有子节点，检查哪些子节点可能与查询区域相交
    if (this.nodes.length) {
      const indices = this.getIndices(rect);
      for (const index of indices) {
        returnObjects = returnObjects.concat(this.nodes[index].retrieve(rect));
      }
    }

    return returnObjects;
  }

  private getIndices(rect: { x: number; y: number; width: number; height: number }): number[] {
    const indices: number[] = [];
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const startIsNorth = rect.y < horizontalMidpoint;
    const startIsWest = rect.x < verticalMidpoint;
    const endIsEast = rect.x + rect.width > verticalMidpoint;
    const endIsSouth = rect.y + rect.height > horizontalMidpoint;

    // 左上
    if (startIsNorth && startIsWest) indices.push(0);
    // 右上
    if (startIsNorth && endIsEast) indices.push(1);
    // 左下
    if (endIsSouth && startIsWest) indices.push(2);
    // 右下
    if (endIsSouth && endIsEast) indices.push(3);

    return indices;
  }

  public clear() {
    this.objects = [];
    for (const node of this.nodes) {
      node.clear();
    }
    this.nodes = [];
  }
}
