//app/hooks/useMagnetic.ts
import { useEffect } from "react";
import gsap from "gsap";

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
      (el as any).__magnetic = { move, leave };
    });

    return () => {
      els.forEach(el => {
        const handlers = (el as any).__magnetic;
        if (handlers) {
          el.removeEventListener("mousemove", handlers.move);
          el.removeEventListener("mouseleave", handlers.leave);
        }
      });
    };
  }, [selector]);
}
