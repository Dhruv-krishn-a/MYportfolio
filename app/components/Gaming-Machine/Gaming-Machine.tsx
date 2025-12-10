// components/Gaming-Machine/Gaming-Machine.tsx
"use client";

import React, { Suspense, useRef, useCallback, useEffect, useState, useMemo } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { 
  OrbitControls, 
  useGLTF, 
  Html, 
  useAnimations, 
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Float
  // Removed "Stars" import
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

import type { GLTF } from "three-stdlib";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// --- Types ---
type GamingMachineViewerProps = {
  src?: string;
};

export default function GamingMachineViewer({ src = "/models/pacman_arcade__animation.glb" }: GamingMachineViewerProps) {
  const modelRef = useRef<THREE.Group | null>(null);

  return (
    <motion.section 
      id="portfolio-viewer"
      // UPDATED: Changed background to bg-transparent
      className="relative w-full h-[80vh] bg-transparent overflow-hidden"
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <div className="absolute top-10 left-0 w-full text-center z-10 pointer-events-none">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-wider opacity-90 drop-shadow-lg">
          ARCADE <span className="text-purple-500">PROJECTS</span>
        </h2>
        <p className="text-sm text-gray-400 mt-2">Interactive 3D Viewer</p>
      </div>

      <Canvas
        shadows
        dpr={[1, 2]} 
        // alpha: true is critical here, it makes the 3D canvas background transparent
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
        style={{ width: "100%", height: "100%" }}
      >
        <SceneContent src={src} modelRef={modelRef} />
      </Canvas>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
        <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-white/80 text-xs md:text-sm shadow-2xl flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Click on Gaming machine screen to see project</span>
        </div>
      </div>
    </motion.section>
  );
}

function SceneContent({ src, modelRef }: { src: string; modelRef: React.MutableRefObject<THREE.Group | null> }) {
  const orbitRef = useRef<OrbitControlsImpl | null>(null);
  const prevHovered = useRef<THREE.Mesh | null>(null);

  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const gltf = useGLTF(src) as GLTF;

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true);

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const scaleFactor = maxDim > 0 ? 3.0 / maxDim : 1;
    cloned.scale.setScalar(scaleFactor);

    const offset = center.clone().multiplyScalar(scaleFactor);
    cloned.position.sub(offset);
    cloned.position.y += 0.5;

    (cloned.userData as { __loaded?: { size: THREE.Vector3; scaleFactor: number; center: THREE.Vector3 } }).__loaded = { size, scaleFactor, center };

    return cloned;
  }, [gltf.scene]);

  const { actions } = useAnimations(gltf.animations, scene);

  useEffect(() => {
    if (actions) {
      Object.keys(actions).forEach((key) => {
        actions[key]?.play();
      });
    }
  }, [actions]);

  useEffect(() => {
    modelRef.current = scene as THREE.Group;
  }, [scene, modelRef]);

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';

    const obj = e.object as THREE.Object3D | null;
    if (!obj) return;

    let mesh: THREE.Mesh | null = null;
    if ((obj as THREE.Mesh).isMesh) mesh = obj as THREE.Mesh;
    else {
      let cur: THREE.Object3D | null = obj;
      let depth = 0;
      while (cur && depth < 6) {
        if ((cur as THREE.Mesh).isMesh) {
          mesh = cur as THREE.Mesh;
          break;
        }
        cur = cur.parent;
        depth++;
      }
    }

    if (mesh === prevHovered.current) return;

    if (prevHovered.current) {
      const prev = prevHovered.current;
      const prevMat = prev.material as THREE.MeshStandardMaterial | undefined;
      const prevUD = prev.userData as { __originalEmissive?: THREE.Color } | undefined;
      if (prevMat && prevUD?.__originalEmissive && prevMat.emissive) {
        prevMat.emissive.copy(prevUD.__originalEmissive);
      }
      prevHovered.current = null;
    }

    if (mesh) {
      const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
      const ud = mesh.userData as { __originalEmissive?: THREE.Color } | undefined;
      if (mat && mat.emissive) {
        if (!ud || !ud.__originalEmissive) {
          mesh.userData = { ...(mesh.userData as object), __originalEmissive: mat.emissive.clone() };
        }
        mat.emissive.setHex(0x8800ff);
        mat.emissiveIntensity = 2;
        prevHovered.current = mesh;
      }
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    document.body.style.cursor = 'auto';
    if (prevHovered.current) {
       const prev = prevHovered.current;
       const prevMat = prev.material as THREE.MeshStandardMaterial | undefined;
       const prevUD = prev.userData as { __originalEmissive?: THREE.Color } | undefined;
       if (prevMat && prevUD?.__originalEmissive) {
         prevMat.emissive.copy(prevUD.__originalEmissive);
       }
       prevHovered.current = null;
    }
  }, []);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    window.open("https://divine-store-pink.vercel.app/", "_blank");

    let target = e.object as THREE.Object3D | null;
    const chain: string[] = [];
    let depth = 0;
    while (target && depth < 20) {
      if (target.name) chain.push(target.name);
      target = target.parent;
      depth++;
    }
    const result = chain[0] || "Unknown Part";
    setLastClicked(result);
  }, []);

  const loadedInfo = (scene.userData as { __loaded?: { size: THREE.Vector3; scaleFactor: number } }).__loaded;

  return (
    <>
      <PerspectiveCamera makeDefault position={[6, 3, 6]} fov={50} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <Environment preset="city" /> 
      
      {/* UPDATED: Removed <Stars /> component here */}

      <Suspense fallback={<Html center><div className="text-white">Loading...</div></Html>}>
        <Float 
            speed={2} 
            rotationIntensity={0.5} 
            floatIntensity={0.5} 
            floatingRange={[-0.1, 0.1]} 
        >
          <group 
            onPointerMove={handlePointerMove} 
            onPointerLeave={handlePointerLeave}
            onClick={handleClick} 
          >
            <primitive object={scene} ref={modelRef} dispose={null} />
          </group>
        </Float>
      </Suspense>

      <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#000000" />

      <OrbitControls 
        ref={orbitRef} 
        enableDamping 
        dampingFactor={0.05} 
        minDistance={2} 
        maxDistance={20}
        autoRotate={true} 
        autoRotateSpeed={0.8} 
      />

      {lastClicked && (
         <Html position={[2, 1, 0]} center>
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="pointer-events-none"
           >
             <div className="bg-black/80 backdrop-blur-md p-3 rounded border-l-2 border-green-500 text-white w-48 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
               <div className="text-[10px] uppercase tracking-widest text-green-400 mb-1">OPENING PROJECT...</div>
               <div className="font-mono text-xs text-gray-300">Divine Store</div>
             </div>
             <div className="w-8 h-[1px] bg-green-500 absolute top-1/2 -left-8"></div>
           </motion.div>
         </Html>
      )}

      {loadedInfo && (
        <Html position={[-3, 1.5, 0]} center>
          <div className="bg-black/60 px-3 py-2 rounded-md border border-white/6 backdrop-blur-md text-white text-xs">
            <div>Size: {loadedInfo.size.x.toFixed(2)}, {loadedInfo.size.y.toFixed(2)}, {loadedInfo.size.z.toFixed(2)}</div>
            <div>Scale: {loadedInfo.scaleFactor.toFixed(3)}</div>
          </div>
        </Html>
      )}
    </>
  );
}