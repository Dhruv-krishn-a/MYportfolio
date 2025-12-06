//app/components/CustomCursor/CustomCursor.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const outlineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const dot = dotRef.current!;
    const outline = outlineRef.current!;
    if (!dot || !outline) return;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      gsap.to(outline, { x, y, duration: 0.12, ease: "power2.out" });
    };

    const hoverEls = document.querySelectorAll<HTMLElement>(".hover-trigger");

    const onEnter = () => {
      gsap.to(outline, { width: 80, height: 80, backgroundColor: "rgba(255,255,255,0.06)", duration: 0.24 });
      gsap.to(dot, { scale: 0, duration: 0.18 });
    };
    const onLeave = () => {
      gsap.to(outline, { width: 40, height: 40, backgroundColor: "transparent", duration: 0.24 });
      gsap.to(dot, { scale: 1, duration: 0.18 });
    };

    window.addEventListener("mousemove", onMove);
    hoverEls.forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      hoverEls.forEach(el => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={outlineRef} className="cursor-outline" />
    </>
  );
}
