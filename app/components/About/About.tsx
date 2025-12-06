// app/components/About/About.tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  const fullText =
    "I’m a developer who blends logical thinking with business insight to build meaningful, scalable, and visually immersive digital experiences. With a background in full-stack development and business analysis, I enjoy turning ideas into products — from shaping the strategy behind them to engineering the systems that bring them to life.";

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const textContainer = textRef.current;
    if (!section || !textContainer) return;

    // collect span elements (they are rendered as .char)
    const spans = Array.from(textContainer.querySelectorAll("span.char")) as HTMLElement[];
    if (!spans.length) return;

    // initial styles
    gsap.set(spans, { opacity: 0.1, color: "#6b7280" });

    // compute pinned distance (how long the section should drive the animation)
    const getPinnedDistance = () => Math.max(0, section.offsetHeight - window.innerHeight);

    // timeline: animate all chars to full opacity & color, staggered, scrubbed to scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top", // when section top reaches viewport top (pin start)
        end: () => "+=" + getPinnedDistance(), // length of the pinned period
        scrub: 0.6,
        invalidateOnRefresh: true,
        // optional: pin the inner container via gsap instead of CSS sticky
        // pin: section.querySelector(".about-sticky") as Element | undefined,
      },
    });

    // animate spans with a small stagger so characters reveal progressively
    tl.to(spans, {
      opacity: 1,
      color: "#ffffff",
      ease: "none",
      stagger: { each: 0.008, from: "start" }, // tweak each to speed up/slow down
    }, 0);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full h-[300vh] bg-transparent"
    >
      <div
        // keep sticky if you like — ScrollTrigger's timeline is tied to the same range.
        className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 overflow-hidden about-sticky"
      >
        <div className="max-w-4xl w-full flex flex-col items-center text-center">
          <h2 className="text-4xl font-semibold text-white mb-12">About Me</h2>

          <p
            ref={textRef}
            className="text-xl md:text-3xl leading-relaxed font-light text-gray-500 whitespace-pre-wrap"
            aria-label={fullText}
          >
            {fullText.split("").map((char, i) => (
              <span
                key={i}
                className="char transition-colors duration-100 will-change-[opacity,color]"
                style={{ opacity: 0.1, color: "#6b7280" }}
              >
                {char}
              </span>
            ))}
          </p>

          <p className="mt-12 text-gray-500 text-sm animate-pulse">Scroll to read ↓</p>
        </div>
      </div>
    </section>
  );
}
