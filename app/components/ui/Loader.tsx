// components/ui/Loader.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Loader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const bar = barRef.current;
    if (!container || !bar) return;

    const tl = gsap.timeline({
      onComplete: () => {
        // user callback
        if (onComplete) onComplete();
        // notify the app that loading finished so other modules can refresh
        window.dispatchEvent(new Event("app:loaded"));
      }
    });

    // 1. Animate Progress Bar (Fake 0-100%)
    tl.to(bar, {
      width: "100%",
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: function () {
        const progress = Math.round(this.progress() * 100);
        // update React state (OK inside GSAP onUpdate)
        setProgress(progress);
      },
    });

    // 2. Slide the loader up to reveal the website
    tl.to(container, {
      yPercent: -100,
      duration: 0.8,
      ease: "power4.inOut",
      delay: 0.2,
      onComplete: () => {
        // remove from layout/interaction so it can't affect measurements
        if (container) container.style.display = "none";
      }
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center text-white"
    >
      <div ref={textRef} className="font-mono text-[#00f0ff] mb-4 text-sm tracking-widest">
        INITIALIZING SYSTEM... {progress}%
      </div>

      {/* Progress Bar Container */}
      <div className="w-64 h-1 bg-gray-900 rounded overflow-hidden relative">
        <div
          ref={barRef}
          className="h-full bg-[#00f0ff] w-0 shadow-[0_0_15px_#00f0ff]"
        />
      </div>
    </div>
  );
}
