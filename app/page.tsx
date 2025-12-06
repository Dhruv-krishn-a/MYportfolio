"use client";

import Hero from "./components/Hero/Hero";
import About from "./components/About/About";
import ScrollText from "./components/ScrollText/ScrollText";
import Arsenal from "./components/Arsenal/Arsenal";
import BuildingViewer from "./components/BuildingViewer/BuildingViewer";

export default function Home() {
  return (
    <main className="relative w-full bg-[#050505] text-gray-200 overflow-x-clip">

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center px-6 relative z-10">
        <Hero />
      </section>

      {/* SCROLLING TEXT SHOULD ONLY START WITH ABOUT SECTION */}
      <section id="about-scroll-wrapper" className="relative w-full min-h-screen">
        {/* This appears ONLY above About & NOT behind hero */}
        <ScrollText />
        
        <About />
        {/* Horizontal Arsenal Section (Two-way scroll) */}
      <Arsenal />
      </section>
      <section className="py-24 px-6">
        
          <BuildingViewer src="/models/building.glb" />
        
      </section>

    </main>
  );
}
