import { CanvasObject } from "./CanvasObject";
import { QuadTree } from "./QuadTree";

export class CanvasApp {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.objects = [];
    this.quadtree = new QuadTree(
      {
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
      },
      10,
      5,
    );

    this.init();
  }

  init() {
    // 添加一些测试图形
    this.addRandomObjects(10);

    // 绑定点击事件
    this.canvas.addEventListener("click", (e) => this.handleClick(e));

    // 初始绘制
    this.draw();
  }

  addRandomObjects(count) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * (this.canvas.width - 50);
      const y = Math.random() * (this.canvas.height - 50);
      const size = 30 + Math.random() * 70;

      const drawFunc = (ctx) => {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
        // 随机绘制圆形或矩形
        if (Math.random() > 0.5) {
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, size, size);
        }
      };

      const obj = new CanvasObject(x, y, size, size, drawFunc);
      this.objects.push(obj);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 重建四叉树
    this.quadtree.clear();
    this.objects.forEach((obj) => this.quadtree.insert(obj));

    // 绘制所有对象
    this.objects.forEach((obj) => obj.draw(this.ctx));
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 创建点击区域（可以是1x1像素的矩形）
    const clickArea = { x: x - 1, y: y - 1, width: 2, height: 2 };

    // 1. 使用四叉树快速查找可能碰撞的对象
    const candidates = this.quadtree.retrieve(clickArea);

    // 2. 精确像素检测
    const clickedObjects = candidates.filter((obj) => obj.isPointInPixel(x, y));

    // 3. 处理点击穿透效果 - 获取所有碰撞对象
    if (clickedObjects.length > 0) {
      console.log("点击到的对象:", clickedObjects);
      // 可以按z-index排序或进行其他处理

      // 示例：高亮所有被点击的对象
      clickedObjects.forEach((obj) => {
        this.ctx.save();
        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
        this.ctx.restore();
      });
    }
  }
}
