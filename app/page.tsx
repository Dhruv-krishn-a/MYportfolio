// app/page.tsx
"use client";

import dynamic from "next/dynamic";
import { Suspense, useState, useEffect } from "react";

// --- COMPONENTS ---
import ScrollProvider from "./components/ScrollProvider"; 
import CustomCursor from "./components/CustomCursor/CustomCursor";
import Starfield from "./components/Starfield/Starfield";
import Loader from "./components/ui/Loader"; // Ensure you created this file

import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import ScrollText from "./components/ScrollText/ScrollText";
import Arsenal from "./components/Arsenal/Arsenal";
import GithubCity from "./components/GithubCity/GithubCity";

// --- LAZY LOADS ---
const GamingMachineViewer = dynamic(
  () => import("./components/Gaming-Machine/Gaming-Machine"),
  { ssr: false }
);

export default function Home() {
  const GITHUB_USER = "Dhruv-krishn-a";
  const [isLoading, setIsLoading] = useState(true);

  // Lock body scroll while loading
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = "";
    }
  }, [isLoading]);

  return (
    <ScrollProvider>
      
      {/* 1. LOADER (Sits on top of everything) */}
      {/* It will animate itself out, then trigger onComplete to unlock the page */}
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}

      {/* 2. BACKGROUNDS */}
      {/* Starfield is fixed at z-0 so it stays behind all content */}
      <Starfield />
      
      {/* 3. UI ELEMENTS */}
      <CustomCursor />

      {/* 4. MAIN CONTENT */}
      {/* bg-transparent ensures the Starfield is visible through the sections */}
      <main className="relative z-[10] w-full bg-transparent text-gray-200 overflow-x-clip">

        {/* HERO SECTION */}
        {/* The Hero component handles the 'Hacker Text' animation on scroll internally */}
        <section className="relative w-full min-h-screen flex items-center justify-center px-6">
          <Hero />
        </section>

        {/* ABOUT & ARSENAL */}
        <section id="about-scroll-wrapper" className="relative w-full min-h-screen">
          <ScrollText />
          <About />
          <Arsenal />
        </section>

        {/* 3D ARCADE VIEWER */}
        <section className="relative py-32 px-6">
          <Suspense fallback={
            <div className="h-[60vh] flex items-center justify-center font-mono text-[#00f0ff] animate-pulse">
              LOADING_ASSETS...
            </div>
          }>
            <GamingMachineViewer src="/models/pacman_arcade__animation.glb" />
          </Suspense>
        </section>

        {/* GITHUB CITY */}
        <section className="relative py-24 px-6">
          <GithubCity username={GITHUB_USER} />
        </section>

      </main>
    </ScrollProvider>
  );
}