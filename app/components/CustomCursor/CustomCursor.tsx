// app/components/CustomCursor/CustomCursor.tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const outlineRef = useRef<HTMLDivElement | null>(null);

  // We explicitly type these as functions that take a number
  const qx = useRef<((value: number) => void) | null>(null);
  const qy = useRef<((value: number) => void) | null>(null);
  const qxr = useRef<((value: number) => void) | null>(null);
  const qyr = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    if (!dotRef.current || !outlineRef.current) return;

    const dot = dotRef.current;
    const outline = outlineRef.current;

    // FIX: Cast the result of quickSetter to the specific function type
    qx.current = gsap.quickSetter(dot, "x", "px") as (value: number) => void;
    qy.current = gsap.quickSetter(dot, "y", "px") as (value: number) => void;
    qxr.current = gsap.quickSetter(outline, "x", "px") as (value: number) => void;
    qyr.current = gsap.quickSetter(outline, "y", "px") as (value: number) => void;

    let lastX = 0;
    let lastY = 0;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      
      qx.current?.(x);
      qy.current?.(y);

      gsap.to({}, { 
        duration: 0.12, 
        overwrite: "auto", 
        onUpdate: () => {
          lastX += (x - lastX) * 0.18;
          lastY += (y - lastY) * 0.18;
          qxr.current?.(lastX);
          qyr.current?.(lastY);
        }
      });
    };

    const hoverEls = document.querySelectorAll<HTMLElement>(".hover-trigger");
    
    const onEnter = () => {
      gsap.to(outline, { width: 80, height: 80, backgroundColor: "rgba(255,255,255,0.06)", duration: 0.22 });
      gsap.to(dot, { scale: 0, duration: 0.18 });
    };
    
    const onLeave = () => {
      gsap.to(outline, { width: 40, height: 40, backgroundColor: "transparent", duration: 0.22 });
      gsap.to(dot, { scale: 1, duration: 0.18 });
    };

    window.addEventListener("mousemove", onMove);
    hoverEls.forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    const restoreSystemCursor = () => {
      document.documentElement.style.cursor = "";
    };

    return () => {
      window.removeEventListener("mousemove", onMove);
      hoverEls.forEach(el => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      restoreSystemCursor();
      gsap.killTweensOf(outline);
      gsap.killTweensOf(dot);
    };
  }, []);

  return (
    <>
      <div 
        ref={dotRef} 
        className="cursor-dot fixed top-0 left-0 pointer-events-none w-2 h-2 bg-white rounded-full z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" 
      />
      <div 
        ref={outlineRef} 
        className="cursor-outline fixed top-0 left-0 pointer-events-none w-10 h-10 rounded-full border-2 border-white/40 z-[9998] -translate-x-1/2 -translate-y-1/2 mix-blend-difference" 
      />
    </>
  );
}