// components/Arsenal/Arsenal.tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  SiNextdotjs, SiReact, SiTypescript, SiTailwindcss, SiGreensock, SiThreedotjs, SiFigma,
  SiNodedotjs, SiPython, SiPostgresql, SiPrisma, SiDocker, SiAmazon, SiGit
} from "react-icons/si"; 

gsap.registerPlugin(ScrollTrigger);

// --- TYPES ---
interface TechItem {
  name: string;
  type: string;
  icon: React.ReactNode; 
  color: string;
}

// --- DATA ---
const row1: TechItem[] = [
  { name: "Next.js", type: "Framework", icon: <SiNextdotjs />, color: "#000000" }, 
  { name: "React", type: "Library", icon: <SiReact />, color: "#61DAFB" },
  { name: "TypeScript", type: "Language", icon: <SiTypescript />, color: "#3178C6" },
  { name: "Tailwind", type: "Styling", icon: <SiTailwindcss />, color: "#38B2AC" },
  { name: "GSAP", type: "Motion", icon: <SiGreensock />, color: "#88CE02" },
  { name: "Three.js", type: "3D", icon: <SiThreedotjs />, color: "#000000" }, 
  { name: "Figma", type: "Design", icon: <SiFigma />, color: "#F24E1E" },
];

const row2: TechItem[] = [
  { name: "Node.js", type: "Runtime", icon: <SiNodedotjs />, color: "#339933" },
  { name: "Python", type: "Language", icon: <SiPython />, color: "#3776AB" },
  { name: "PostgreSQL", type: "Database", icon: <SiPostgresql />, color: "#4169E1" },
  { name: "Prisma", type: "ORM", icon: <SiPrisma />, color: "#2D3748" },
  { name: "Docker", type: "DevOps", icon: <SiDocker />, color: "#2496ED" },
  { name: "AWS", type: "Cloud", icon: <SiAmazon />, color: "#FF9900" },
  { name: "Git", type: "VCS", icon: <SiGit />, color: "#F05032" },
];

// Quadrupling data to ensure seamless scrolling on large screens
const doubleRow1 = [...row1, ...row1, ...row1, ...row1];
const doubleRow2 = [...row2, ...row2, ...row2, ...row2];

export default function Arsenal() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const row1Ref = useRef<HTMLDivElement | null>(null);
  const row2Ref = useRef<HTMLDivElement | null>(null);
  const bgTextRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const r1 = row1Ref.current;
      const r2 = row2Ref.current;
      const bgText = bgTextRef.current;

      if (!section || !r1 || !r2) return;

      // Select cards specifically within this section to avoid conflicts
      const cards = gsap.utils.toArray(".tech-card") as HTMLElement[];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%", // Scroll distance
          scrub: 1.5,    // Slightly softer scrub for smoother feel
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Add skew effect based on scroll velocity
            const skew = self.getVelocity() / -200; 
            gsap.to(cards, {
              skewX: skew,
              overwrite: "auto",
              duration: 0.1, // Quick response
            });
          }
        },
      });

      // --- ROW 1: Moves Left ---
      // Moves from 0% to -50% of its total width
      tl.fromTo(r1, 
        { xPercent: 0 }, 
        { xPercent: -50, ease: "none" }, 
        0
      );

      // --- ROW 2: Moves Right ---
      // Starts at -50% (shifted left) and moves to 0% (shifted right)
      // This creates the "Right Movement" effect without gaps
      tl.fromTo(r2, 
        { xPercent: -50 }, 
        { xPercent: 0, ease: "none" }, 
        0
      );

      // --- PARALLAX TEXT ---
      // Moves slightly up/down against the scroll
      if (bgText) {
        tl.fromTo(bgText, 
          { y: 150 }, 
          { y: -150, ease: "none" }, 
          0
        );
      }

    }, sectionRef);

    return () => ctx.revert(); 
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full h-screen overflow-hidden flex flex-col justify-center py-20 z-10"
    >

      {/* --- PARALLAX BACKGROUND TEXT --- */}
      {/* z-0 ensures it is behind the cards */}
      <div 
        ref={bgTextRef} 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
      >
        <h2 className="text-[23vw] font-black text-white/5 tracking-tighter scale-y-150 whitespace-nowrap">
          ARSENAL
        </h2>
      </div>

      {/* --- CARDS CONTAINER --- */}
      {/* z-10 ensures cards slide OVER the text */}
      <div className="z-10 flex flex-col gap-10 md:gap-14 rotate-[-3deg] scale-105 origin-center will-change-transform">
        
        {/* Row 1 */}
        <div className="w-full">
          <div ref={row1Ref} className="flex gap-6 w-max px-4 will-change-transform">
            {doubleRow1.map((tech, i) => (
              <Card key={`r1-${i}`} tech={tech} index={i} />
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="w-full">
          <div ref={row2Ref} className="flex gap-6 w-max px-4 will-change-transform">
            {doubleRow2.map((tech, i) => (
              <Card key={`r2-${i}`} tech={tech} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// --- CARD COMPONENT ---
function Card({ tech, index }: { tech: TechItem; index: number }) {
  const glowColor = tech.color === "#000000" ? "#ffffff" : tech.color;

  return (
    <div
      className="tech-card group relative w-[260px] h-[160px] md:w-[340px] md:h-[200px] shrink-0 cursor-default"
      style={{ perspective: "1000px" }}
    >
      {/* GLASS CONTAINER */}
      <div className="
        w-full h-full p-6 md:p-8 flex flex-col justify-between
        bg-[#0a0a0a]/60 backdrop-blur-xl
        border border-white/5 rounded-2xl
        transition-all duration-500 ease-out
        group-hover:-translate-y-2 group-hover:bg-[#0a0a0a]/80
        group-hover:border-white/10
        group-hover:shadow-2xl
      "
      style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03)" }} 
      >
        
        {/* Hover Glow Gradient */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-2xl"
          style={{ background: `radial-gradient(circle at center, ${glowColor}, transparent 70%)` }}
        />

        {/* --- CARD HEADER --- */}
        <div className="flex justify-between items-start z-10">
          <div 
            className="text-4xl md:text-5xl transition-all duration-300 filter grayscale group-hover:grayscale-0 group-hover:scale-110"
            style={{ color: glowColor }} 
          >
            <span className="text-gray-500 group-hover:text-[var(--tech-color)]" style={{ "--tech-color": glowColor } as React.CSSProperties}>
              {tech.icon}
            </span>
          </div>
          
          <span className="font-mono text-xs text-white/20 group-hover:text-white/40 transition-colors">
             {/* Keeps numbers 01-07 repeating neatly */}
            {String((index % 7) + 1).padStart(2, '0')}
          </span>
        </div>

        {/* --- CARD FOOTER --- */}
        <div className="z-10">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-300 group-hover:text-white transition-colors tracking-tight">
            {tech.name}
          </h3>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="h-[1px] w-4 bg-gray-700 group-hover:w-8 group-hover:bg-white transition-all duration-300" />
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 group-hover:text-gray-300">
              {tech.type}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}