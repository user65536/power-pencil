import { Coordinate } from "./Coordinate";
import { Stage } from "./Stage";
import { Rectangle } from "./Shapes";
import { Shape } from "./Shape";
import { EventEmitter } from "../utils";
import { add } from "mathjs";

export interface InteractionEvents {
  "shape:select": (shape: Shape) => void;
  "shape:move": (shape: Shape, coordinate: Coordinate) => void;
  "shape:unselect": () => void;
}

export class InteractionManager {
  private rect: DOMRect | null = null;

  event = new EventEmitter<InteractionEvents>();

  get canvas() {
    return this.stage.canvas;
  }

  constructor(private stage: Stage) {
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

  handleCanvasClick = (event: MouseEvent) => {
    const viewCoordinate = this.getViewCoordinate(event.clientX, event.clientY);
    const worldCoordinate = this.stage.camera.toWorldPoint(viewCoordinate);
    const result = this.stage.collisionDetector.hit(viewCoordinate, worldCoordinate);
    if (result) {
      this.event.emit("shape:select", result);
    } else {
      this.event.emit("shape:unselect");
    }
    // FIXME for test
    if (event.shiftKey) {
      const rect = new Rectangle({ width: 20, height: 20 });
      rect.translate(worldCoordinate.x, worldCoordinate.y);
      this.stage.addShape(rect);
      console.log("view pos", viewCoordinate, "world pos", worldCoordinate);
    }
  };

  private collisionDetect(clientX: number, clientY: number) {
    const viewCoordinate = this.getViewCoordinate(clientX, clientY);
    const worldCoordinate = this.stage.camera.toWorldPoint(viewCoordinate);
    const result = this.stage.collisionDetector.hit(viewCoordinate, worldCoordinate);
    return result;
  }

  private handleMousedown = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const { clientX: startX, clientY: startY } = event;
    const shape = this.collisionDetect(startX, startY);
    if (!shape) return;
    const { x: startTranslationX, y: startTranslationY } = shape.translation;
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      console.log(dx, dy);
      const moveWorldVector = this.stage.camera.toWorldVector({ x: dx, y: dy });
      const target = add([moveWorldVector.x, moveWorldVector.y], [startTranslationX, startTranslationY]);
      this.event.emit("shape:move", shape, { x: target[0], y: target[1] });
      console.log(moveWorldVector);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  private listenPinch() {
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    this.canvas.addEventListener("mousedown", this.handleMousedown, { passive: false });
    this.canvas.addEventListener("click", this.handleCanvasClick);
  }

  destroy() {
    this.canvas.removeEventListener("wheel", this.handleWheel);
    this.canvas.removeEventListener("click", this.handleCanvasClick);
    this.canvas.addEventListener("mousedown", this.handleMousedown);
  }
}
