import { useEffect, useRef } from "react";
import { OrientedBoundingBox } from "../model";
import styled from "styled-components";
import { dot } from "mathjs";

interface TransformHandleProps {
  obb: OrientedBoundingBox;
  onTransform: (obb: OrientedBoundingBox) => void;
}

export const TransformHandle: React.FC<TransformHandleProps> = ({ obb, onTransform }) => {
  const { center, width, height, rotation } = obb;
  const centerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => e.preventDefault();
    wrapperRef.current?.addEventListener("wheel", handleWheel, { passive: false });
    return () => wrapperRef.current?.removeEventListener("wheel", handleWheel);
  }, []);

  const getCenter = () => {
    const centerRect = centerRef.current!.getBoundingClientRect();
    const centerX = centerRect.left + centerRect.width / 2;
    const centerY = centerRect.top + centerRect.height / 2;

    return { centerX, centerY };
  };

  const handleRotateStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { centerX, centerY } = getCenter();
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angleRad = Math.atan2(dx, -dy);
      const angleDeg = (angleRad * 180) / Math.PI;
      onTransform({ ...obb, rotation: (angleDeg + 180) % 360 });
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleScaleStart = (e: React.MouseEvent<HTMLDivElement>, dir: string) => {
    e.preventDefault();
    e.stopPropagation();
    const { centerX, centerY } = getCenter();
    const dirVec = unitVectors[dir];
    const handleMouseMove = (e: MouseEvent) => {
      const newOBB = resizeOBBWithHandle(obb, dirVec, e.clientX, e.clientY, centerX, centerY);
      onTransform(newOBB);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <Wrapper
      ref={wrapperRef}
      style={{
        left: center.x - width / 2,
        top: center.y - height / 2,
        width: width,
        height: height,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {Object.entries(controlPointStyles).map(([dir, style]) => (
        <ControlPoint key={dir} style={style} onMouseDown={(e) => handleScaleStart(e, dir)} />
      ))}
      <RotateControlPoint
        style={{ bottom: -24, left: "50%", transform: "translateX(-50%)" }}
        onMouseDown={handleRotateStart}
      />
      <CenterPoint ref={centerRef} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: absolute;
  pointer-events: none;
  &::before {
    content: "";
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 2px solid #3066f9;
    pointer-events: none;
  }
`;

const ControlPoint = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  box-sizing: border-box;
  border-radius: 2px;
  background-color: #ffffff;
  border: 1px solid #b8bfc3;
  cursor: pointer;
  pointer-events: all;
`;

const CenterPoint = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  top: 50%;
  left: 50%;
`;

const RotateControlPoint = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: #464bea;
  border-radius: 50%;
  cursor: pointer;
  transform: translateY(50%);
  pointer-events: all;
`;

const controlPointStyles: Record<string, React.CSSProperties> = {
  nw: { top: -5, left: -5 },
  n: { top: -5, left: "50%", transform: "translateX(-50%)" },
  ne: { top: -5, right: -5 },
  e: { top: "50%", right: -5, transform: "translateY(-50%)" },
  se: { bottom: -5, right: -5 },
  s: { bottom: -5, left: "50%", transform: "translateX(-50%)" },
  sw: { bottom: -5, left: -5 },
  w: { top: "50%", left: -5, transform: "translateY(-50%)" },
};

const unitVectors: Record<string, [number, number]> = {
  n: [0, -1],
  ne: [Math.SQRT1_2, -Math.SQRT1_2],
  e: [1, 0],
  se: [Math.SQRT1_2, Math.SQRT1_2],
  s: [0, 1],
  sw: [-Math.SQRT1_2, Math.SQRT1_2],
  w: [-1, 0],
  nw: [-Math.SQRT1_2, -Math.SQRT1_2],
};

export function resizeOBBWithHandle(
  obb: OrientedBoundingBox,
  dirVec: [number, number],
  clientX: number,
  clientY: number,
  centerX: number,
  centerY: number,
): OrientedBoundingBox {
  const [ux, uy] = dirVec;

  const angleRad = (obb.rotation * Math.PI) / 180;

  // 拖拽方向向量旋转后的方向
  const dirX = Math.cos(angleRad) * ux - Math.sin(angleRad) * uy;
  const dirY = Math.sin(angleRad) * ux + Math.cos(angleRad) * uy;
  const rotatedDirVector = [dirX, dirY];

  // 中心-鼠标向量
  const mouseVector = [clientX - centerX, clientY - centerY];

  // 中心-鼠标向量在进动方向的投影大小
  const projLength = dot(mouseVector, rotatedDirVector);

  const originDirVecLen =
    ux === 0 ? obb.height / 2 : uy === 0 ? obb.width / 2 : Math.sqrt(obb.width ** 2 + obb.height ** 2) / 2;

  const deltaLength = projLength - originDirVecLen;
  const rotatedDeltaVector = [dirX * deltaLength, dirY * deltaLength];
  const baseDeltaVector = [ux * deltaLength, uy * deltaLength];
  const sizeGrowVector = [baseDeltaVector[0] * Math.sign(ux), baseDeltaVector[1] * Math.sign(uy)];

  const newWidth = Math.max(1, obb.width + sizeGrowVector[0]);
  const newHeight = Math.max(1, obb.height + sizeGrowVector[1]);
  const centerOffset: [number, number] = [rotatedDeltaVector[0] / 2, rotatedDeltaVector[1] / 2];

  const newCenter = {
    x: obb.center.x + centerOffset[0],
    y: obb.center.y + centerOffset[1],
  };

  return {
    ...obb,
    center: newCenter,
    width: newWidth,
    height: newHeight,
  };
}
