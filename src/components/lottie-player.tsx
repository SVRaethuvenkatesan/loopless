"use client";

import { useEffect, useRef } from "react";

type LottiePlayerProps = {
  src: string;
  style?: React.CSSProperties;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
};

export default function LottiePlayer({
  src,
  style,
  loop = true,
  autoplay = true,
  className,
}: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: { destroy?: () => void } | undefined;
    let mounted = true;

    async function load() {
      const { DotLottie } = await import("@lottiefiles/dotlottie-web");
      DotLottie.setWasmUrl("/dotlottie-player.wasm");
      if (!mounted || !containerRef.current) return;

      containerRef.current.innerHTML = "";
      const canvas = document.createElement("canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      containerRef.current.appendChild(canvas);
      player = new DotLottie({ canvas, src, autoplay, loop });
    }

    load();
    return () => {
      mounted = false;
      player?.destroy?.();
    };
  }, [src, loop, autoplay]);

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%", ...style }} />;
}
