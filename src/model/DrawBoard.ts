import { CameraOptions, Stage } from ".";
import { AxisAlignedBoundingBox } from "./BoundingBox";
import { InteractionManager } from "./InteractionManager";

export class DrawBoard {
  stage: Stage;

  interactionManager: InteractionManager;

  constructor(options: { canvas: HTMLCanvasElement; camera: CameraOptions; bounding: AxisAlignedBoundingBox }) {
    this.stage = new Stage({ camera: options.camera, canvas: options.canvas, bounding: options.bounding });
    this.interactionManager = new InteractionManager(this.stage);
  }
}
