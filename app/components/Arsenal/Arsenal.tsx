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

const doubleRow1 = [...row1, ...row1, ...row1, ...row1];
const doubleRow2 = [...row2, ...row2, ...row2, ...row2];

export default function Arsenal() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const row1Ref = useRef<HTMLDivElement | null>(null);
  const row2Ref = useRef<HTMLDivElement | null>(null);
  const bgTextRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    // CRITICAL FIX: Use gsap.context()
    // This allows GSAP to "revert" all changes (like pinning wrappers)
    // before React tries to unmount the component.
    const ctx = gsap.context(() => {
      
      const section = sectionRef.current;
      const r1 = row1Ref.current;
      const r2 = row2Ref.current;
      const bgText = bgTextRef.current;

      if (!section || !r1 || !r2) return;

      const getScrollDist = (el: HTMLDivElement) => el.scrollWidth - window.innerWidth;
      const cards = gsap.utils.toArray(".tech-card");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=250%",
          scrub: 1,      
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const skew = self.getVelocity() / -250; 
            gsap.to(cards, {
              skewX: skew,
              overwrite: "auto",
              duration: 0.2,
              ease: "power2.out"
            });
          }
        },
      });

      // 1. Top Row
      tl.fromTo(r1, 
        { x: 0 }, 
        { x: () => -getScrollDist(r1), ease: "none" }, 
        0
      );

      // 2. Bottom Row
      tl.fromTo(r2, 
        { x: () => -getScrollDist(r2) }, 
        { x: 0, ease: "none" }, 
        0
      );

      // 3. Background Text Parallax
      if (bgText) {
        tl.fromTo(bgText, { y: 0 }, { y: -100, ease: "none" }, 0);
      }

    }, sectionRef); // Scope context to this section

    // CLEANUP
    // This removes the ScrollTrigger and unwraps the pinned element
    // so React finds the DOM exactly as it expects.
    return () => ctx.revert(); 
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full h-screen bg-[#050505] overflow-hidden flex flex-col justify-center py-20 z-10"
    >
      {/* --- BACKGROUND FX --- */}
      <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] pointer-events-none" />

      {/* Parallax Background Text */}
      <div 
        ref={bgTextRef} 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]"
      >
        <h2 className="text-[25vw] font-black text-white tracking-tighter scale-y-150">
          ARSENAL
        </h2>
      </div>

      {/* --- CONTENT --- */}
      <div className="z-10 flex flex-col gap-12 md:gap-16 rotate-[-3deg] scale-105 origin-center will-change-transform">
        
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
      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.03)` }} 
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
            {index < 9 ? `0${index + 1}` : index + 1}
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