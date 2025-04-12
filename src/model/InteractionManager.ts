import { Coordinate } from "./Coordinate";
import { Stage } from "./Stage";
import { Rectangle } from "./Shapes";
import { Manager, Pinch } from "hammerjs";

export class InteractionManager {
  private rect: DOMRect | null = null;
  private isDragging = false;
  private lastPos: Coordinate = { x: 0, y: 0 };
  private lastScale = 1;
  private hammerManager: HammerManager;

  get canvas() {
    return this.stage.canvas;
  }

  constructor(private stage: Stage) {
    this.hammerManager = new Manager(this.canvas);
    this.hammerManager.add(new Pinch());
    this.hammerManager.get("pinch").set({ enable: true });

    this.updateCanvasBoundingRect();
    this.listenPinch();
  }

  updateCanvasBoundingRect = () => {
    this.rect = this.canvas.getBoundingClientRect();
  };

  public getViewCoordinate = (clientX: number, clientY: number): Coordinate => {
    if (!this.rect) this.updateCanvasBoundingRect();
    const x = clientX - this.rect!.left;
    const y = clientY - this.rect!.top;
    return { x, y };
  };

  handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (event.ctrlKey) {
      const scaleDelta = 1 - event.deltaY * 0.005;
      const viewCoordinate = this.getViewCoordinate(event.clientX, event.clientY);
      this.stage.camera.zoom(scaleDelta, viewCoordinate);
    } else {
      const deltaX = event.deltaX;
      const deltaY = event.deltaY;

      this.stage.camera.translate(deltaX / 3, deltaY / 3);
    }
  };

  handleCanvasClick = (event: React.MouseEvent) => {
    const viewCoordinate = this.getViewCoordinate(event.clientX, event.clientY);
    // FIXME for test
    const wordCoordinate = this.stage.camera.toWorld(viewCoordinate);
    const rect = new Rectangle({ width: 20, height: 20 });
    rect.translate(wordCoordinate.x, wordCoordinate.y);
    this.stage.addShape(rect);
    console.log("view pos", viewCoordinate, "world pos", wordCoordinate);
  };

  private listenPinch() {
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });

    this.hammerManager.on("pinchstart", (e) => {
      this.lastScale = e.scale;
    });
    this.hammerManager.on("pinchmove", (e) => {
      const scaleDelta = e.scale / this.lastScale;
      this.stage.camera.scale(scaleDelta);
      this.lastScale = e.scale;
    });
  }

  destroy() {
    this.canvas.removeEventListener("wheel", this.handleWheel);
  }
}
