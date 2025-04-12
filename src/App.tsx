import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { Rectangle, Stage } from "./model";
import { DrawBoard } from "./model/DrawBoard";

const width = 1000;
const height = 800;

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const board = useMemo(() => {
    if (!canvas) return null;
    return new DrawBoard({ canvas, camera: { width, height } });
  }, [canvas]);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvas(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    if (!canvas || !board) return;

    const stage = board.stage;
    const rect = new Rectangle({ width: 50, height: 50 });
    stage.camera.translate(-20, -20);
    stage.camera.scale(0.5);
    stage.addShape(rect);

    (window as any).stage = stage;
    (window as any).rect = rect;

    const ctx = canvas.getContext("2d")!;
    const timer = setInterval(() => {
      ctx.resetTransform();
      ctx.clearRect(0, 0, width, height);
      stage.render();
    }, 20);
    return () => clearInterval(timer);
  }, [canvas]);

  const handleClick = (e: MouseEvent<HTMLCanvasElement>) => {
    board?.interactionManager.handleCanvasClick(e);
  };

  return (
    <div style={{ border: "1px solid black" }}>
      <canvas width={width} height={height} ref={canvasRef} onClick={handleClick}></canvas>
    </div>
  );
}

export default App;
