// app/components/ScrollProvider.tsx
"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  const rafId = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // FIX: 'direction' is renamed to 'orientation' in newer Lenis versions
      orientation: 'vertical', 
      // FIX: 'gestureDirection' is renamed to 'gestureOrientation'
      gestureOrientation: 'vertical',
      // FIX: 'smoothTouch' is removed. Use 'smoothWheel: true' for standard smoothing.
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafId.current = requestAnimationFrame(raf);
    }
    rafId.current = requestAnimationFrame(raf);

    // update ScrollTrigger on each lenis scroll
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return <>{children}</>;
}