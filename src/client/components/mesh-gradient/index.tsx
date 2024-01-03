import React, { useEffect, useRef } from "react";
import clsx from "clsx";

const { Gradient } = require("./raw");

import "./mesh-gradient.module.less";

const MeshGradient = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    if (!canvasContainerRef.current) return;
    if (canvasRef.current) {
      canvasContainerRef.current.removeChild(canvasRef.current);
    }
    const newCanvas = document.createElement("canvas");
    newCanvas.id = "gradient-canvas";
    newCanvas.className = clsx("w-full h-full canvas");
    canvasContainerRef.current.appendChild(newCanvas);
    canvasRef.current = newCanvas;
    const newGradient = new Gradient();
    // @ts-ignore
    newGradient.initGradient("#gradient-canvas");
  }, []);

  return (
    <div
      id="gradient-container"
      className="w-full h-full"
      ref={canvasContainerRef}
    />
  );
};

export default MeshGradient;
