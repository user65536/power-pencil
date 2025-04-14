import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { Rectangle, Stage } from "./model";
import { DrawBoard } from "./model/DrawBoard";
import { TransformHandle } from "./components";
import { BoardController } from "./controllers";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";

const width = 1000;
const height = 800;
const worldWidth = width * 4;
const worldHeight = height * 4;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const board = useMemo(() => {
    if (!canvas) return null;
    return new DrawBoard({
      canvas,
      camera: { width, height, scaleRange: [0.1, 25] },
      bounding: { x: -worldWidth / 2, y: -worldHeight / 2, width: worldWidth, height: worldHeight },
    });
  }, [canvas]);

  const controller = useMemo(() => board && new BoardController({ drawBoard: board }), [board]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    if (!canvas || !board || !controller) return;

    const stage = board.stage;
    const rect = new Rectangle({ width: 50, height: 50 });
    rect.translate(-25, -25);
    rect.scale(2, 1);
    stage.camera.translate(-width / 2, -height / 2);
    stage.addShape(rect);

    (window as any).stage = stage;
    (window as any).rect = rect;

    const ctx = canvas.getContext("2d")!;
    let rafId: number;

    const renderLoop = () => {
      ctx.resetTransform();
      ctx.clearRect(0, 0, width, height);
      stage.render();
      controller.updateActiveShape();
      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => cancelAnimationFrame(rafId);
  }, [canvas]);

  return (
    <div style={{ border: "1px solid black", width, height, overflow: "hidden", position: "relative" }}>
      <canvas width={width} height={height} ref={canvasRef}></canvas>
      {controller?.activeShape && (
        <TransformHandle
          obb={controller.drawBoard.stage.camera.toViewOBB(controller.activeShape.obb)}
          onTransform={controller.handleShapeTransformed}
        />
      )}
    </div>
  );
}

export default observer(App);
