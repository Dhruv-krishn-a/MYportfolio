//app/components/Header/Header.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Header() {
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const items = nav.querySelectorAll(".nav-item");
    gsap.from(nav, { y: -20, opacity: 0, duration: 0.9, ease: "power4.out" });
    gsap.from(items, { y: -10, opacity: 0, stagger: 0.06, duration: 0.6, ease: "power3.out", delay: 0.1 });
  }, []);

  return (
    <header ref={navRef} className="fixed top-6 left-0 right-0 z-50 px-6 flex items-center justify-between">
      <div className="magnetic nav-logo nav-item text-2xl font-bold cursor-pointer hover-trigger">JD.</div>
      <nav className="hidden md:flex gap-6">
        <a className="nav-item magnetic hover-trigger" href="#about">About</a>
        <a className="nav-item magnetic hover-trigger" href="#work">Work</a>
        <a className="nav-item magnetic hover-trigger" href="#skills">Skills</a>
        <a className="nav-item magnetic hover-trigger" href="#contact">Contact</a>
      </nav>
      <div className="md:hidden nav-item hover-trigger">Menu</div>
    </header>
  );
}
