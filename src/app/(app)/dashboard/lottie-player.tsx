"use client";
import { useEffect, useRef } from "react";

interface Props {
  src: string;
  style?: React.CSSProperties;
  loop?: boolean;
  autoplay?: boolean;
}

export default function LottiePlayer({ src, style, loop = true, autoplay = true }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: any;
    (async () => {
      const { DotLottie } = await import("@lottiefiles/dotlottie-web");
      DotLottie.setWasmUrl("/dotlottie-player.wasm");
      if (!containerRef.current) return;
      const canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      containerRef.current.appendChild(canvas);
      player = new DotLottie({ canvas, src, autoplay, loop });
    })();
    return () => { player?.destroy(); };
  }, [src, loop, autoplay]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", ...style }} />;
}
