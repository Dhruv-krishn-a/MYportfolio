"use client";

import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, TransformControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { TransformControls as TransformControlsImpl } from "three-stdlib";
import type { GLTF } from "three-stdlib";

interface DragEvent extends THREE.Event {
  value: boolean;
}

function BuildingModel({
  url,
  modelRef,
}: {
  url: string;
  modelRef: React.MutableRefObject<THREE.Group | null>;
}) {
  const gltf = useGLTF(url) as GLTF;

  useEffect(() => {
    gltf.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        // Disable shadows for performance
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        
        // Optimize material settings
        if (mesh.material) {
          const material = mesh.material as THREE.Material;
          material.precision = "lowp";
          material.depthWrite = true;
          material.depthTest = true;
          
          // Disable expensive features
          if ("roughness" in material) {
            (material as any).roughness = 1;
          }
          if ("metalness" in material) {
            (material as any).metalness = 0;
          }
        }
      }
    });
  }, [gltf]);

  return <primitive ref={modelRef} object={gltf.scene} scale={1} />;
}

const SceneContent = React.memo(function SceneContent({
  src,
  mode,
  autoRotate,
  modelRef,
}: {
  src: string;
  mode: "translate" | "rotate" | "scale";
  autoRotate: boolean;
  modelRef: React.MutableRefObject<THREE.Group | null>;
}) {
  const orbitRef = useRef<OrbitControlsImpl>(null);
  const transformRef = useRef<TransformControlsImpl>(null);

  const handlePointerOver = useCallback(() => {
    document.body.style.cursor = "pointer";
  }, []);

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = "auto";
  }, []);

  useEffect(() => {
    const tf = transformRef.current;
    const orb = orbitRef.current;
    if (!tf || !orb) return;

    const onDragChanged = (event: THREE.Event) => {
      const e = event as unknown as DragEvent;
      orb.enabled = !e.value;
    };

    const dispatcher = tf as unknown as THREE.EventDispatcher;
    dispatcher.addEventListener("dragging-changed", onDragChanged);
    return () => dispatcher.removeEventListener("dragging-changed", onDragChanged);
  }, []);

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    e.nativeEvent.stopPropagation();

    const clickableObjects = new Map([
      ["Plane018_49", "https://your-project-1.com"],
      ["Object_138", "https://your-project-1.com"],
      ["Cube001_1", "https://your-project-2.com"],
      ["Object_6", "https://your-project-2.com"],
      ["world002", "https://your-project-1.com"],
    ]);

    let currentObj: THREE.Object3D | null = e.object;
    let depth = 0;
    const maxDepth = 10;

    while (currentObj && depth < maxDepth) {
      const name = currentObj.name || "";
      
      for (const [key, url] of clickableObjects.entries()) {
        if (name.includes(key)) {
          window.open(url, "_blank");
          return;
        }
      }
      
      currentObj = currentObj.parent;
      depth++;
    }
  }, []);

  return (
    <>
      {/* Simplified lighting setup */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 6]} 
        intensity={0.8}
        castShadow={false}
      />

      <Suspense fallback={
        <Html center>
          <div className="text-white text-lg">Loading 3D Model...</div>
        </Html>
      }>
        {/* Model positioned at origin - no ground plane */}
        <group
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {mode !== "translate" ? (
            <TransformControls ref={transformRef} mode={mode}>
              <BuildingModel url={src} modelRef={modelRef} />
            </TransformControls>
          ) : (
            <BuildingModel url={src} modelRef={modelRef} />
          )}
        </group>
      </Suspense>

      {/* Simple dark background */}
      <color attach="background" args={["#0a0a0a"]} />

      <OrbitControls
        ref={orbitRef}
        enableDamping
        autoRotate={autoRotate}
        dampingFactor={0.1}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={1}
        maxDistance={100}
        enablePan={true}
        makeDefault
      />
    </>
  );
});

export default function BuildingViewer({ src = "/models/building.glb" }: { src?: string }) {
  const modelRef = useRef<THREE.Group>(null);
  const [mode, setMode] = useState<"translate" | "rotate" | "scale">("translate");
  const [autoRotate, setAutoRotate] = useState(false);

  const handleModeChange = useCallback(() => {
    setMode((prev) => {
      return prev === "translate" ? "rotate" : prev === "rotate" ? "scale" : "translate";
    });
  }, []);

  const resetModel = useCallback(() => {
    const m = modelRef.current;
    if (!m) return;
    
    const tl = gsap.timeline();
    tl.to(m.position, { x: 0, y: 0, z: 0, duration: 0.5 })
      .to(m.rotation, { x: 0, y: 0, z: 0, duration: 0.5 }, "<")
      .to(m.scale, { x: 1, y: 1, z: 1, duration: 0.5 }, "<");
  }, []);

  return (
    // Full width container - no max-width restrictions
    <section className="relative w-full h-[70vh] md:h-[80vh] bg-gradient-to-b from-gray-900 to-black my-20 overflow-hidden" id="portfolio-viewer">
      {/* Control panel */}
      <div className="absolute top-4 right-4 z-50 flex gap-2 flex-wrap justify-end">
        <button
          onClick={handleModeChange}
          className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/20 text-white text-sm hover:bg-white/20 transition-colors duration-200 shadow-lg"
        >
          Mode: <span className="font-bold">{mode.toUpperCase()}</span>
        </button>

        <button
          onClick={() => setAutoRotate((s) => !s)}
          className={`px-4 py-2 rounded-lg backdrop-blur-md border text-white text-sm hover:opacity-90 transition-colors duration-200 shadow-lg ${
            autoRotate 
              ? "bg-green-500/20 border-green-500/40" 
              : "bg-white/10 border-white/20"
          }`}
        >
          Auto: <span className="font-bold">{autoRotate ? "ON" : "OFF"}</span>
        </button>

        <button 
          onClick={resetModel} 
          className="px-4 py-2 bg-blue-500/20 rounded-lg backdrop-blur-md border border-blue-500/40 text-white text-sm hover:bg-blue-500/30 transition-colors duration-200 shadow-lg"
        >
          Reset
        </button>
      </div>

      {/* Full width Canvas - takes 100% of parent width */}
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        frameloop="demand"
        camera={{ 
          position: [8, 6, 10], 
          fov: 60,
          near: 0.1,
          far: 1000 
        }}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0a0a0a");
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <SceneContent 
          src={src} 
          mode={mode} 
          autoRotate={autoRotate} 
          modelRef={modelRef} 
        />
      </Canvas>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="px-4 py-2 bg-black/50 rounded-lg backdrop-blur-md border border-white/10 text-white text-sm">
          Click on building parts to view projects
        </div>
      </div>
    </section>
  );
}