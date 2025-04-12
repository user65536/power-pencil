import { CameraOptions, Stage } from ".";
import { InteractionManager } from "./InteractionManager";

export class DrawBoard {
  stage: Stage;

  interactionManager: InteractionManager;

  constructor(options: { canvas: HTMLCanvasElement; camera: CameraOptions }) {
    this.stage = new Stage({ camera: options.camera, canvas: options.canvas });
    this.interactionManager = new InteractionManager(this.stage);
  }
}
