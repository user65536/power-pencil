import { Coordinate } from "./Coordinate";
import { Stage } from "./Stage";
import { Rectangle } from "./Shapes";
import { Manager, Pinch } from "hammerjs";
import { Shape } from "./Shape";
import { EventEmitter } from "../utils";

export interface InteractionEvents {
  "shape:select": (shape: Shape) => void;
  "shape:unselect": () => void;
}

export class InteractionManager {
  private rect: DOMRect | null = null;
  private isDragging = false;
  private lastPos: Coordinate = { x: 0, y: 0 };
  private lastScale = 1;
  private hammerManager: HammerManager;

  event = new EventEmitter<InteractionEvents>();

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
      const deltaX = event.deltaX * this.stage.camera._scale;
      const deltaY = event.deltaY * this.stage.camera._scale;

      this.stage.camera.translate(deltaX / 3, deltaY / 3);
    }
  };

  handleCanvasClick = (event: React.MouseEvent) => {
    const viewCoordinate = this.getViewCoordinate(event.clientX, event.clientY);
    // FIXME for test
    const worldCoordinate = this.stage.camera.toWorldPoint(viewCoordinate);
    const result = this.stage.collisionDetector.hit(viewCoordinate, worldCoordinate);
    if (result) {
      this.event.emit("shape:select", result);
    } else {
      this.event.emit("shape:unselect");
    }
    if (event.shiftKey) {
      const rect = new Rectangle({ width: 20, height: 20 });
      rect.translate(worldCoordinate.x, worldCoordinate.y);
      this.stage.addShape(rect);
      console.log("view pos", viewCoordinate, "world pos", worldCoordinate);
    }
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
