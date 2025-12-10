// app/components/ui/HackerText.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from "react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

export type HackerTextHandle = {
  scramble: () => void;
};

interface HackerTextProps {
  text: string;
  className?: string;
  duration?: number; // ms
  onComplete?: () => void;
}

const HackerText = forwardRef<HackerTextHandle, HackerTextProps>(
  ({ text, className = "", duration = 1200, onComplete }, ref) => {
    // IMPORTANT: initial state must be deterministic & same on server and client
    const [displayText, setDisplayText] = useState<string>(() => text);

    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    // reduced motion
    const prefersReducedMotion = useRef(false);
    useEffect(() => {
      if (typeof window === "undefined") return;
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotion.current = mq.matches;

      const handler = (ev: MediaQueryListEvent) => {
        prefersReducedMotion.current = ev.matches;
      };

      mq.addEventListener("change", handler);
      return () => {
        mq.removeEventListener("change", handler);
      };
    }, []);

    const randChar = useCallback(
      () => LETTERS[Math.floor(Math.random() * LETTERS.length)],
      []
    );

    const scramble = useCallback(() => {
      if (prefersReducedMotion.current) {
        setDisplayText(text);
        onComplete?.();
        return;
      }

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;

      const animate = (timestamp?: number) => {
        if (!startRef.current) startRef.current = timestamp ?? performance.now();
        const elapsed = (timestamp ?? performance.now()) - startRef.current;
        const t = Math.min(1, elapsed / duration);
        const revealed = Math.floor(t * text.length);

        const out = text
          .split("")
          .map((ch, i) => {
            if (i < revealed) return ch;
            if (Math.random() < 0.02) return ch;
            return randChar();
          })
          .join("");

        setDisplayText(out);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayText(text);
          startRef.current = null;
          rafRef.current = null;
          onComplete?.();
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, [text, duration, onComplete, randChar]);

    // expose scramble() to parent
    useImperativeHandle(ref, () => ({ scramble }), [scramble]);

    useEffect(() => {
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, []);

    return (
      <span
        className={`font-mono cursor-default ${className}`}
        aria-label={text}
        role="text"
      >
        <span aria-hidden="true">{displayText}</span>
      </span>
    );
  }
);

HackerText.displayName = "HackerText";
export default HackerText;
