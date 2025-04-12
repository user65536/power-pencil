export class CanvasObject {
  x: number;
  y: number;
  width: number; // 允许浮点数
  height: number; // 允许浮点数
  private pixelData: Uint8ClampedArray | null = null;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    public drawFunc: (ctx: CanvasRenderingContext2D) => void,
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // 获取浮点数边界框（四舍五入确保包含所有像素）
  get bounds() {
    return {
      x: Math.floor(this.x),
      y: Math.floor(this.y),
      width: Math.ceil(this.width),
      height: Math.ceil(this.height),
    };
  }

  // 绘制并捕获像素数据
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.drawFunc(ctx);
    ctx.restore();
    this.capturePixelData(ctx);
  }

  private capturePixelData(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.bounds;
    if (width > 0 && height > 0) {
      const imageData = ctx.getImageData(x, y, width, height);
      this.pixelData = imageData.data;
    }
  }

  // 精确浮点数坐标碰撞检测
  isPointInPixel(px: number, py: number): boolean {
    if (!this.pixelData) return false;

    // 转换为相对于对象的局部坐标
    const localX = px - this.x;
    const localY = py - this.y;

    // 检查是否在边界内
    if (localX < 0 || localY < 0 || localX >= this.width || localY >= this.height) {
      return false;
    }

    // 计算像素索引（考虑浮点数位置）
    const pixelX = Math.floor(localX);
    const pixelY = Math.floor(localY);
    const pixelIndex = (pixelY * this.bounds.width + pixelX) * 4;

    // 检查Alpha通道（透明度）
    return this.pixelData[pixelIndex + 3] > 0;
  }
}
