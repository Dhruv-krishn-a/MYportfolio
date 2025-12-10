"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SiGithub, SiGit } from "react-icons/si";
import { FiStar, FiGitPullRequest, FiUsers, FiMapPin, FiCalendar } from "react-icons/fi";
import HackerText, { HackerTextHandle } from "../ui/HackerText"; 

gsap.registerPlugin(ScrollTrigger);

// --- TYPES ---
type Repo = {
  name: string;
  description: string;
  stargazerCount: number;
  primaryLanguage: { name: string; color: string } | null;
  url: string;
};

type GithubData = {
  total: number;
  weeks: { contributionDays: { contributionCount: number; date: string }[] }[];
  followers: number;
  prs: number;
  createdAt: string;
  location: string;
  totalStars: number;
  topRepos: Repo[];
};

type LogEntry = {
  time: string;
  message: string;
  color: string;
};

interface StatCardProps {
  label: string;
  value: number | string | undefined;
  icon: React.ReactNode;
  delay: number;
  isRank?: boolean;
}

interface TooltipState {
  x: number;
  y: number;
  count: number;
  date: string;
  visible: boolean;
}

export default function GithubCity({ username = "dhruvkkrishna" }: { username?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HackerTextHandle>(null);
  const titleContainerRef = useRef<HTMLHeadingElement>(null);
  
  const [data, setData] = useState<GithubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, count: 0, date: "", visible: false });

  // 1. Initial Mount Logs
  useEffect(() => {
    const timer = setTimeout(() => {
        const now = new Date().toLocaleTimeString();
        setLogs([
          { time: now, message: "Handshake established", color: "#00f0ff" },
          { time: now, message: `Scanning target: ${username}`, color: "#00f0ff" },
        ]);
    }, 100);
    return () => clearTimeout(timer);
  }, [username]);

  // 2. Fetch Data
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/github?user=${username}`);
        const json = await res.json();
        
        if (mounted && json.weeks) {
          setData(json);
          setLoading(false);
          const now = new Date().toLocaleTimeString();
          setLogs(prev => [
            ...prev,
            { time: now, message: "Metrics downloaded.", color: "#0f3" },
            { time: now, message: " rendering_city_grid...", color: "#0f3" }
          ]);
        }
      } catch (err) {
        console.error("Failed to load GitHub data", err);
        setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [username]);

  // 3. Scroll Animation for Title
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: titleContainerRef.current,
        start: "top 80%",
        onEnter: () => titleRef.current?.scramble(),
        onEnterBack: () => titleRef.current?.scramble(),
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // 4. Canvas Logic & Interaction
  useEffect(() => {
    if (!data || !canvasRef.current || !containerRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    
    const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1;
    const VISIBLE_WEEKS = 20; 
    const tileW = 24; 
    const tileH = 14; 
    
    const weeksToRender = data.weeks.slice(-VISIBLE_WEEKS);
    
    let mouseX = -1000;
    let mouseY = -1000;
    let hoveredTile: { r: number, c: number } | null = null;

    const resize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(DPR, DPR);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) * DPR; 
      mouseY = (e.clientY - rect.top) * DPR;
    };

    const drawIsoCube = (x: number, y: number, color: string, height: number, isHovered: boolean) => {
      if (isHovered) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = color === "#222" ? "rgba(255,255,255,0.03)" : color;
      ctx.beginPath();
      ctx.moveTo(x, y - height);
      ctx.lineTo(x + tileW, y - tileH - height);
      ctx.lineTo(x, y - tileH * 2 - height);
      ctx.lineTo(x - tileW, y - tileH - height);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = color === "#222" ? "rgba(255,255,255,0.01)" : adjustColor(color, -20);
      ctx.beginPath();
      ctx.moveTo(x + tileW, y - tileH - height);
      ctx.lineTo(x, y - height);
      ctx.lineTo(x, y);
      ctx.lineTo(x + tileW, y - tileH);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = color === "#222" ? "rgba(0,0,0,0.1)" : adjustColor(color, -40);
      ctx.beginPath();
      ctx.moveTo(x - tileW, y - tileH - height);
      ctx.lineTo(x, y - height);
      ctx.lineTo(x, y);
      ctx.lineTo(x - tileW, y - tileH);
      ctx.closePath();
      ctx.fill();
      
      ctx.shadowBlur = 0;
    };

    const render = () => {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);
      
      const centerX = w / 2;
      const centerY = h / 2 + 80; 

      const adjX = (mouseX / DPR) - centerX - 80; 
      const adjY = (mouseY / DPR) - centerY + 250;
      
      const floatCol = (adjY / tileH + adjX / tileW) / 2;
      const floatRow = (adjY / tileH - adjX / tileW) / 2;
      
      const hoverCol = Math.round(floatCol);
      const hoverRow = Math.round(floatRow);
      
      let foundHover = false;

      weeksToRender.forEach((week, colIndex) => {
        week.contributionDays.forEach((day, rowIndex) => {
          
          const isHovered = (colIndex === hoverCol && rowIndex === hoverRow);

          if (isHovered) {
            foundHover = true;
            if (hoveredTile?.c !== colIndex || hoveredTile?.r !== rowIndex) {
              hoveredTile = { c: colIndex, r: rowIndex };
              setTooltip({
                visible: true,
                x: (mouseX / DPR), 
                y: (mouseY / DPR) - 50, 
                count: day.contributionCount,
                date: day.date
              });
            }
          }

          const isoX = (colIndex - rowIndex) * tileW + centerX - (VISIBLE_WEEKS * tileW / 2) + 80;
          const isoY = (colIndex + rowIndex) * tileH + centerY - 250;

          let color = "#222";
          let heightMod = 0;
          
          if (day.contributionCount > 0) {
            if (day.contributionCount <= 2) { color = "#0e4429"; heightMod = 10; }
            else if (day.contributionCount <= 5) { color = "#006d32"; heightMod = 25; }
            else if (day.contributionCount <= 9) { color = "#26a641"; heightMod = 45; }
            else { color = "#39d353"; heightMod = 70; }
          }
          
          const wave = Math.sin(time + colIndex * 0.2 + rowIndex * 0.2) * 4;
          let finalHeight = Math.max(2, heightMod + (heightMod > 0 ? wave : 0));
          
          if (isHovered) finalHeight += 20; 

          drawIsoCube(isoX, isoY, color, finalHeight, isHovered);
        });
      });

      if (!foundHover && hoveredTile !== null) {
        hoveredTile = null;
        setTooltip(prev => ({ ...prev, visible: false }));
      }

      time += 0.05;
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", () => setTooltip(prev => ({ ...prev, visible: false })));
    
    resize();
    render();
    
    gsap.fromTo(canvas, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" });

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [data]);

  const yearsActive = data ? new Date().getFullYear() - new Date(data.createdAt).getFullYear() : 0;

  return (
    <section ref={sectionRef} className="min-h-screen py-24 px-6 relative w-full bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <SiGithub className="text-5xl text-white/20" />
            <div>
              <h2 ref={titleContainerRef} className="text-4xl md:text-6xl font-bold tracking-tighter text-white flex gap-2">
                GIT_
                <span className="text-green-500">
                   <HackerText ref={titleRef} text="Dhruv-krishn-a" />
                </span>
              </h2>
              <p className="font-mono text-green-500/60 text-sm">
                Open Source Activity Stream
              </p>
            </div>
          </div>
          <div className="font-mono text-right hidden md:block text-xs text-gray-500">
             STATUS: <span className="text-green-400 animate-pulse">LIVE_FEED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: CITY & LOGS --- */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* 3D CITY VIEWER */}
            <div className="relative h-[450px] md:h-[550px] w-full group">
               <div 
                  ref={containerRef}
                  className="absolute inset-0 bg-black/10 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 group-hover:border-green-500/30 group-hover:bg-black/20"
               >
                  <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs font-mono text-green-400">ISOMETRIC_VIEW</span>
                    </div>
                    <h3 className="text-xl font-bold text-white/90">Contribution City</h3>
                  </div>

                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center font-mono text-green-500/50">
                      [ <HackerText text="ESTABLISHING_LINK..." /> ]
                    </div>
                  )}
                  
                  <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />

                  <div 
                    className="absolute pointer-events-none z-20 px-3 py-2 bg-black/80 backdrop-blur-md border border-green-500/50 rounded text-xs text-white transition-opacity duration-150"
                    style={{ 
                        left: tooltip.x, 
                        top: tooltip.y, 
                        opacity: tooltip.visible ? 1 : 0,
                        transform: 'translate(-50%, -100%)' 
                    }}
                  >
                    <div className="font-bold text-green-400">{tooltip.count} Contributions</div>
                    <div className="text-gray-400 font-mono text-[10px]">{tooltip.date}</div>
                  </div>

               </div>
            </div>

            {/* TERMINAL LOGS */}
            <div className="h-[200px] bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6 font-mono text-xs overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2 text-gray-500">
                <SiGit /> <span>SYSTEM_LOGS</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                {logs.map((log, i) => (
                    <div key={i} className="opacity-80">
                        <span style={{ color: log.color }}>[{log.time}]</span> <span className="text-gray-300">{log.message}</span>
                    </div>
                ))}
                <div className="animate-pulse text-green-500">_</div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: STATS & REPOS --- */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* STATS GRID */}
            <div className="grid grid-cols-2 gap-4">
               <StatCard 
                 label="Total Commits" 
                 value={data?.total} 
                 icon={<SiGit />} 
                 delay={0} 
               />
               <StatCard 
                 label="Total Stars" 
                 value={data?.totalStars} 
                 icon={<FiStar />} 
                 delay={0.1} 
                 isRank 
               />
               <StatCard 
                 label="Followers" 
                 value={data?.followers} 
                 icon={<FiUsers />} 
                 delay={0.2} 
               />
               <StatCard 
                 label="Pull Requests" 
                 value={data?.prs} 
                 icon={<FiGitPullRequest />} 
                 delay={0.3} 
               />
            </div>
            
            {/* ADDITIONAL INFO ROW */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex flex-col justify-center items-center text-center group hover:bg-white/5 transition-colors">
                    <FiCalendar className="text-gray-500 mb-2 group-hover:text-green-400" />
                    <div className="text-xl font-bold text-white">{yearsActive}+ Years</div>
                    <div className="text-[10px] text-gray-500 uppercase">Active</div>
                </div>
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 p-4 rounded-xl flex flex-col justify-center items-center text-center group hover:bg-white/5 transition-colors">
                    <FiMapPin className="text-gray-500 mb-2 group-hover:text-green-400" />
                    <div className="text-sm font-bold text-white line-clamp-1">{data?.location || "Remote"}</div>
                    <div className="text-[10px] text-gray-500 uppercase">Base</div>
                </div>
            </div>

            {/* TOP REPOS */}
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl p-6 flex-1 flex flex-col">
              <h3 className="text-sm font-mono text-gray-400 mb-4 uppercase tracking-widest flex justify-between items-center">
                <span>Top Repositories</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white">PUBLIC</span>
              </h3>
              <div className="flex flex-col gap-3 flex-1">
                {loading ? (
                   [1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
                ) : (
                  data?.topRepos?.map((repo, i) => (
                    <a 
                      key={i} 
                      href={repo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-green-500/30 rounded-xl transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white group-hover:text-green-400 transition-colors line-clamp-1">{repo.name}</span>
                        <div className="flex items-center gap-1 text-xs text-yellow-500 whitespace-nowrap">
                          <FiStar /> {repo.stargazerCount}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 line-clamp-1 mb-2">{repo.description || "No description provided."}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span className="w-2 h-2 rounded-full" style={{ background: repo.primaryLanguage?.color || "#fff" }} />
                        {repo.primaryLanguage?.name || "Code"}
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ label, value, icon, delay, isRank }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HackerTextHandle>(null);

  useLayoutEffect(() => {
    // We only trigger if there is a value to animate
    if (value === undefined) return;
    
    const ctx = gsap.context(() => {
       ScrollTrigger.create({
          trigger: cardRef.current,
          start: "top 90%", // Animate when nearly visible
          onEnter: () => textRef.current?.scramble(),
          onEnterBack: () => textRef.current?.scramble(), // Re-animate on scroll up
       });
    }, cardRef);
    return () => ctx.revert();
  }, [value]);

  return (
    <div 
      ref={cardRef}
      className="bg-black/20 backdrop-blur-sm border border-white/10 p-5 rounded-2xl hover:bg-white/5 transition-colors flex flex-col justify-between h-[110px]"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="text-gray-500 text-lg">{icon}</div>
      <div>
          <div className={`text-2xl font-bold ${isRank ? 'text-yellow-400' : 'text-white'}`}>
            {value === undefined ? (
              <span className="animate-pulse">...</span> 
            ) : (
              // We use key to force remount if value changes, ensuring fresh animation
              <HackerText ref={textRef} text={value.toString()} key={value} />
            )}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
      </div>
    </div>
  );
}

// --- UTILS ---

function adjustColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}