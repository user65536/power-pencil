import { useEffect, useRef } from "react";
import { Rectangle, Stage } from "./model";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 1000;
  const height = 800;

  useEffect(() => {
    const stage = new Stage({ camera: { width, height } });
    const rect = new Rectangle({ width: 50, height: 50 });
    stage.addShape(rect);

    (window as any).stage = stage;
    (window as any).rect = rect;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const timer = setInterval(() => {
      ctx.resetTransform();
      ctx.clearRect(0, 0, width, height);
      stage.render(ctx);
    }, 20);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <canvas style={{ border: "1px solid black" }} width={width} height={height} ref={canvasRef}></canvas>
    </>
  );
}

export default App;
