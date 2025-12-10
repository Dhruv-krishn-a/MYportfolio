// components/Starfield/Starfield.tsx
"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  color: string;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- CONFIG ---
    const STAR_COUNT = 800;
    const DEPTH = 1000;       // Z-depth of the field
    const FOV = 400;          // Field of view
    const COLORS = ["#ffffff", "#80d0ff", "#e0c0ff"]; // White, Cyan, Purple tint

    let width = window.innerWidth;
    let height = window.innerHeight;
    let cx = width / 2;
    let cy = height / 2;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Scroll warp interaction
    let scrollSpeed = 0;
    let lastScrollY = window.scrollY;

    // --- INIT STARS ---
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * width * 2, // Spread wider than screen
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * DEPTH,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));

    // --- RESIZE HANDLER ---
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      cx = width / 2;
      cy = height / 2;

      canvas.width = width * DPR;
      canvas.height = height * DPR;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(DPR, DPR);
    };

    // --- RENDER LOOP ---
    const draw = () => {
      // 1. Clear Screen (Fully transparent or dark fade)
      // We use clearRect for crisp lines.
      ctx.fillStyle = "#030303"; 
      ctx.fillRect(0, 0, width, height);

      // 2. Update Physics
      // Smooth mouse parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Decay scroll warp speed
      scrollSpeed *= 0.92;
      
      // Base speed + Warp speed
      const speed = 0.5 + Math.min(scrollSpeed, 50);

      // 3. Draw Stars
      stars.forEach((star) => {
        // Move star towards screen
        star.z -= speed;

        // Reset if passed screen
        if (star.z <= 1) {
          star.z = DEPTH;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        // Project 3D -> 2D
        // Current position
        const scale = FOV / star.z;
        const x2d = cx + star.x * scale + (targetX / star.z * 50); // Add parallax
        const y2d = cy + star.y * scale + (targetY / star.z * 50);

        // Previous position (for streaks)
        // We calculate where the star WAS a moment ago based on speed
        // This creates a "tail" that gets longer the faster you go
        const scalePrev = FOV / (star.z + speed * 1.5); // 1.5 multiplier for trail length
        const x2dPrev = cx + star.x * scalePrev + (targetX / (star.z + speed) * 50);
        const y2dPrev = cy + star.y * scalePrev + (targetY / (star.z + speed) * 50);

        // Draw
        const size = Math.max(0.5, (1 - star.z / DEPTH) * 2.5); // Closer = bigger
        
        ctx.strokeStyle = star.color;
        ctx.lineWidth = size;
        ctx.lineCap = "round";
        
        ctx.beginPath();
        ctx.moveTo(x2dPrev, y2dPrev);
        ctx.lineTo(x2d, y2d);
        ctx.stroke();
      });

      requestAnimationFrame(draw);
    };

    // --- EVENTS ---
    const handleScroll = () => {
      const now = window.scrollY;
      const delta = Math.abs(now - lastScrollY);
      // Add velocity to warp speed
      scrollSpeed += delta * 0.5;
      lastScrollY = now;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse from -1 to 1
      mouseX = (e.clientX - width / 2);
      mouseY = (e.clientY - height / 2);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0, // Behind everything
        pointerEvents: "none",
        background: "#030303", // Fallback color
      }}
    />
  );
}