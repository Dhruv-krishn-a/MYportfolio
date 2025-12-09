"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollText() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;

    // Timeline synced with ABOUT section scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#about",
        start: "top top",
        end: () => {
          const about = document.getElementById("about");
          return "+=" + (about ? Math.max(900, about.offsetHeight - window.innerHeight) : 900);
        },
        scrub: 1.2,
        invalidateOnRefresh: true,
      }
    });

    tl.to(content, {
      x: () => -(content.scrollWidth - window.innerWidth),
      ease: "none",
    }, 0);

    // Slight parallax up
    tl.to(wrap, {
      y: -120,
      ease: "none",
    }, 0);

    // FIX: Wrap in braces { } to ensure the function returns void
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={wrapRef} className="w-full flex justify-center overflow-visible pointer-events-none">
      <div ref={contentRef} className="blurred-scroll-text flex items-center gap-12 px-20">
        <h1 className="scroll-word">BUILD • DESIGN • DEPLOY • SCALE •</h1>
        <h1 className="scroll-word">CREATE • ANALYZE • LEARN • OPTIMIZE •</h1>
      </div>
    </div>
  );
}