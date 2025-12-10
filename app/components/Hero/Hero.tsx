// app/components/Hero/Hero.tsx
"use client";

import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HackerText, { HackerTextHandle } from "../ui/HackerText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TARGET_TEXT = "Hi! I am Dhruv Krishna";

export default function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const hackerRef = useRef<HackerTextHandle | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // ---- Reduced motion detection (typed, no ESLint issues) ----
  useEffect(() => {
    if (typeof window === "undefined") return;

    const m: MediaQueryList = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const rafId = window.requestAnimationFrame(() => {
      setPrefersReducedMotion(m.matches);
    });

    const handler = (ev: MediaQueryListEvent) => {
      setPrefersReducedMotion(ev.matches);
    };

    m.addEventListener("change", handler);

    return () => {
      m.removeEventListener("change", handler);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  // ---- GSAP / ScrollTrigger ----
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const elements = [
        headingRef.current,
        subtitleRef.current,
        buttonRef.current,
      ].filter(Boolean) as Element[];

      if (!elements.length) return;

      // Initial hidden state (no text flash)
      if (!prefersReducedMotion) {
        gsap.set(elements, { y: 20, autoAlpha: 0 });
      } else {
        gsap.set(elements, { y: 0, autoAlpha: 1 });
        hackerRef.current?.scramble?.();
        return;
      }

      // Timeline for hero elements
      const tl = gsap.timeline({ paused: true });
      tl.to(elements, {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out",
        overwrite: "auto",
      });

      const playIn = () => {
        hackerRef.current?.scramble?.();
        tl.play();
      };

      const playOut = () => {
        tl.reverse();
      };

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 60%",
        end: "bottom top",
        onEnter: playIn,
        onLeave: playOut,
        onEnterBack: playIn,
        onLeaveBack: playOut,
        invalidateOnRefresh: true,
      });

      // When Loader finishes, recompute and animate if hero is in view
      const onAppLoaded = () => {
        ScrollTrigger.refresh();

        const rect = containerRef.current!.getBoundingClientRect();
        const inView =
          rect.top < window.innerHeight * 0.6 && rect.bottom > 0;

        if (inView) {
          playIn();
        }
      };

      window.addEventListener("app:loaded", onAppLoaded, { once: true });

      return () => {
        st.kill();
        window.removeEventListener("app:loaded", onAppLoaded);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const handleScrollToAbout = () => {
    const about = document.getElementById("about-scroll-wrapper");
    if (about) about.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      ref={containerRef}
      className="w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-6 relative"
      aria-labelledby="hero-heading"
    >
      <div className="min-h-[4rem] sm:min-h-[5rem]">
        <h1
          id="hero-heading"
          ref={headingRef}
          className="opacity-0 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight cursor-default bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(59,130,246,0.5)] leading-tight"
        >
          <HackerText
            ref={hackerRef}
            text={TARGET_TEXT}
            className="select-none"
            duration={1000}
          />
        </h1>
      </div>

      <p
        ref={subtitleRef}
        className="opacity-0 mt-6 text-lg sm:text-xl font-medium text-gray-300 max-w-2xl"
      >
        <span className="text-[#60a5fa]">Developer</span> •
        <span className="text-[#60a5fa]"> Business Analyst</span> •
        <span className="text-[#60a5fa]"> Builder</span>
      </p>

      <div ref={buttonRef} className="opacity-0 mt-6">
        <button
          onClick={handleScrollToAbout}
          className="mt-12 px-8 py-3 rounded-full font-bold text-black text-sm uppercase tracking-wide bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Explore about section"
        >
          Explore ↓
        </button>
      </div>
    </section>
  );
}
