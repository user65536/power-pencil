import { DrawBoard, OrientedBoundingBox, Shape } from "../model";
import { action, makeObservable, observable } from "mobx";
export interface BoardControllerOptions {
  drawBoard: DrawBoard;
}

interface ActiveShape {
  id: string;
  obb: OrientedBoundingBox;
}

export class BoardController {
  drawBoard: DrawBoard;

  activeShape: ActiveShape | null = null;

  constructor(options: BoardControllerOptions) {
    this.drawBoard = options.drawBoard;
    this.listenEvents();
    makeObservable(this, {
      activeShape: observable,
      drawBoard: false,
      setActiveShape: action,
    });
  }

  updateActiveShape() {
    if (!this.activeShape) return;
    const shape = this.drawBoard.stage.getShape(this.activeShape.id);
    if (!shape) return;
    this.setActiveShape(shape);
  }

  handleShapeTransformed = (viewOBB: OrientedBoundingBox) => {
    if (!this.activeShape) return;
    const shape = this.drawBoard.stage.getShape(this.activeShape.id);
    if (!shape) return;
    console.log("transformed view obb", viewOBB);
    const { width: originWidth, height: originHeight } = shape.obb;
    const worldOBB = this.drawBoard.stage.camera.toWorldOBB(viewOBB);
    console.log("transformed world obb", worldOBB);

    const scaleX = worldOBB.width / originWidth;
    const scaleY = worldOBB.height / originHeight;
    shape.scale(scaleX, scaleY);
    shape.rotateTo(worldOBB.rotation);
    shape.translateTo(worldOBB.center.x, worldOBB.center.y);
    this.updateActiveShape();
  };

  setActiveShape = (shape: Shape | null) => {
    if (!shape) {
      this.activeShape = null;
      return;
    }
    this.activeShape = {
      id: shape.id,
      obb: shape.obb,
    };
  };

  private handleShapeUnselect = () => {
    this.setActiveShape(null);
  };

  private listenEvents() {
    window.addEventListener("resize", () => this.drawBoard.interactionManager.updateCanvasBoundingRect);
    this.drawBoard.interactionManager.event.on("shape:select", this.setActiveShape);
    this.drawBoard.interactionManager.event.on("shape:unselect", this.handleShapeUnselect);
  }

  destroy() {
    window.removeEventListener("resize", () => this.drawBoard.interactionManager.updateCanvasBoundingRect);
    this.drawBoard.interactionManager.event.off("shape:select", this.setActiveShape);
    this.drawBoard.interactionManager.event.off("shape:unselect", this.handleShapeUnselect);
  }
}
