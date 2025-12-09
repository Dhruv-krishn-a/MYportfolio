// app/hooks/useMagnetic.ts
import { useEffect } from "react";
import gsap from "gsap";

// 1. Define the shape of the event handlers
interface MagneticHandlers {
  move: (e: MouseEvent) => void;
  leave: () => void;
}

// 2. Define a type that extends HTMLElement to include the custom property
type MagneticElement = HTMLElement & {
  __magnetic?: MagneticHandlers;
};

export function useMagnetic(selector = ".magnetic") {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!els.length) return;

    const onMove = (e: MouseEvent, el: HTMLElement) => {
      const bound = el.getBoundingClientRect();
      const x = e.clientX - bound.left - bound.width / 2;
      const y = e.clientY - bound.top - bound.height / 2;
      gsap.to(el, { x: x * 0.36, y: y * 0.36, duration: 0.3, ease: "power2.out" });
    };
    
    const onLeave = (el: HTMLElement) => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
    };

    els.forEach(el => {
      const move = (e: MouseEvent) => onMove(e, el);
      const leave = () => onLeave(el);
      
      el.addEventListener("mousemove", move);
      el.addEventListener("mouseleave", leave);
      
      // FIX 1: Cast to MagneticElement instead of 'any'
      (el as MagneticElement).__magnetic = { move, leave };
    });

    return () => {
      els.forEach(el => {
        // FIX 2: Cast to MagneticElement to retrieve the custom property safely
        const handlers = (el as MagneticElement).__magnetic;
        
        if (handlers) {
          el.removeEventListener("mousemove", handlers.move);
          el.removeEventListener("mouseleave", handlers.leave);
        }
      });
    };
  }, [selector]);
}