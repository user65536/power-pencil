import { useState } from "react";
import { TransformHandle } from "./components";

export const ComponentTest: React.FC = () => {
  const [obb, setOBB] = useState({
    center: { x: 150, y: 150 },
    width: 100,
    height: 100,
    rotation: 45, // 设置一个初始的旋转角度
  });

  return (
    <div style={{ position: "relative", width: "500px", height: "500px", border: "1px solid black" }}>
      <TransformHandle obb={obb} onTransform={setOBB} />
    </div>
  );
};
