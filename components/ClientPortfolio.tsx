"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Stars, Sparkles, Icosahedron, Octahedron, Tetrahedron, TorusKnot, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { motion, useScroll, useTransform } from "framer-motion";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { useTheme } from "next-themes";
import { ThemeToggle } from "./ThemeToggle";

// ==========================================
// 3D SCENE & MECHANICS
// ==========================================

// 1. The Interactive Mouse Aura (Particles follow the cursor)
function MouseAura({ isDark }: { isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    if (groupRef.current) {
      // Smooth lerp to mouse position
      const targetX = (pointer.x * viewport.width) / 2;
      const targetY = (pointer.y * viewport.height) / 2;
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.1;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Sparkles 
        count={50} 
        scale={2} 
        size={isDark ? 6 : 10} 
        speed={0.4} 
        opacity={isDark ? 1 : 0.5} 
        color={isDark ? "#10b981" : "#facc15"} 
      />
    </group>
  );
}

// 2. Exploded Geometry (Reacts to window scroll)
function ExplodedGeometry({ isDark }: { isDark: boolean }) {
  const outerRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    // Calculate scroll progress (0 to 1)
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1) || 0;

    // Explode outwards based on scroll progress
    if (outerRef.current) {
      outerRef.current.position.y = progress * 4;
      outerRef.current.position.x = progress * -3;
      outerRef.current.rotation.x += 0.01;
      outerRef.current.rotation.y += 0.01;
    }
    if (midRef.current) {
      midRef.current.position.x = progress * 4;
      midRef.current.position.z = progress * -2;
      midRef.current.rotation.y -= 0.01;
    }
    if (innerRef.current) {
      innerRef.current.position.y = progress * -3;
      innerRef.current.rotation.z += 0.02;
    }
  });

  const glassProps = {
    transmission: 0.9,
    opacity: 1,
    metalness: 0.1,
    roughness: isDark ? 0.2 : 0,
    ior: 1.5,
    thickness: 2,
  };

  return (
    <group position={[-2, 1, -1]}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Icosahedron ref={outerRef} args={[1.5, 0]}>
          <meshPhysicalMaterial 
            {...glassProps} 
            color={isDark ? "#10b981" : "#ffffff"} 
            emissive={isDark ? "#064e3b" : "#000000"} 
            emissiveIntensity={isDark ? 0.5 : 0} 
          />
        </Icosahedron>
      </Float>
      <Float speed={3} rotationIntensity={2} floatIntensity={2}>
        <Octahedron ref={midRef} args={[1, 0]}>
          <meshPhysicalMaterial 
            {...glassProps} 
            color={isDark ? "#3b82f6" : "#fca5a5"} 
            emissive={isDark ? "#1e3a8a" : "#000000"}
          />
        </Octahedron>
      </Float>
      <Float speed={4} rotationIntensity={3} floatIntensity={3}>
        <Tetrahedron ref={innerRef} args={[0.6, 0]}>
          <meshPhysicalMaterial 
            {...glassProps} 
            color={isDark ? "#a855f7" : "#fcd34d"} 
            emissive={isDark ? "#581c87" : "#000000"}
          />
        </Tetrahedron>
      </Float>
    </group>
  );
}

// Background Distorted Sphere
function BackgroundSphere({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.1;
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={ref} args={[1.8, 64, 64]} position={[3, -1, -3]}>
        <MeshDistortMaterial 
          color={isDark ? "#000000" : "#ffffff"} 
          emissive={isDark ? "#111827" : "#ffffff"}
          envMapIntensity={isDark ? 1 : 2} 
          clearcoat={isDark ? 0.1 : 1} 
          clearcoatRoughness={0.1} 
          metalness={isDark ? 0.9 : 0.1} 
          roughness={isDark ? 0.5 : 0.1}
          distort={0.4} 
          speed={isDark ? 2 : 1} 
        />
      </Sphere>
    </Float>
  );
}


// ==========================================
// REACT COMPONENTS
// ==========================================

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.section
    initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className="relative z-10 w-full max-w-5xl mx-auto my-32 p-8 md:p-12 rounded-3xl border shadow-2xl backdrop-blur-[40px]
      dark:bg-black/40 dark:border-white/10 dark:shadow-[0_0_50px_rgba(0,0,0,0.8)]
      bg-white/40 border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
  >
    {children}
  </motion.section>
);

export default function ClientPortfolio({ education, experience, projects, publications, certifications, activities }: any) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`relative w-full min-h-screen transition-colors duration-1000 ${isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <ThemeToggle />

      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {mounted && (
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
            <ambientLight intensity={isDark ? 0.2 : 1.5} />
            <directionalLight position={[10, 10, 5]} intensity={isDark ? 0.5 : 3} color={isDark ? "#ffffff" : "#fff7ed"} />
            <spotLight position={[-5, 10, -5]} intensity={isDark ? 2 : 1} color={isDark ? "#10b981" : "#38bdf8"} />
            
            {/* Dark Mode gets Stars, Light Mode gets soft fog (simulated via background color) */}
            {isDark && <Stars radius={100} depth={50} count={3000} factor={3} fade speed={1} />}
            
            <Environment preset={isDark ? "city" : "studio"} />

            <MouseAura isDark={isDark} />
            <ExplodedGeometry isDark={isDark} />
            <BackgroundSphere isDark={isDark} />

            {isDark && (
              <EffectComposer disableNormalPass>
                <Bloom luminanceThreshold={0.2} mipmapBlur intensity={0.6} radius={0.4} />
                <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.002, 0.002)} />
              </EffectComposer>
            )}
          </Canvas>
        )}
      </div>

      {/* Scrolling Content - The "Silver Platter" */}
      <div className="relative z-10 w-full pt-32 pb-64 px-4 overflow-x-hidden">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-center mb-32"
        >
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter drop-shadow-xl">
            Sharath S T
          </h1>
          <p className={`text-xl md:text-3xl font-medium max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
            Building the next generation of high-performance scalable systems.
          </p>
        </motion.div>

        {/* Experience */}
        {experience?.length > 0 && (
          <AnimatedSection>
            <h2 className={`text-4xl font-bold mb-12 flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="text-blue-500 mr-4">01.</span> Experience
            </h2>
            <div className="space-y-16">
              {experience.map((exp: any, i: number) => (
                <div key={i} className="group">
                  <div className="flex flex-col md:flex-row md:items-baseline mb-4">
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>{exp.company}</h3>
                    <span className="md:ml-4 text-emerald-500 font-bold">{exp.title}</span>
                    <span className={`md:ml-auto font-mono text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                      {exp.startDate} {exp.endDate ? `— ${exp.endDate}` : ""}
                    </span>
                  </div>
                  <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert prose-p:text-gray-300' : 'prose-p:text-slate-600'}`}>
                    <TinaMarkdown content={exp.body} />
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Projects */}
        {projects?.length > 0 && (
          <AnimatedSection delay={0.2}>
            <h2 className={`text-4xl font-bold mb-12 flex items-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="text-purple-500 mr-4">02.</span> Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((proj: any, i: number) => (
                <div key={i} className={`p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl
                  ${isDark ? 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-purple-900/10' : 'bg-white/60 border-black/5 hover:border-purple-300 hover:bg-white'}
                `}>
                  <h3 className="text-2xl font-bold mb-4">{proj.title}</h3>
                  <div className={`prose max-w-none mb-6 ${isDark ? 'prose-invert text-gray-300' : 'text-slate-600'}`}>
                    <TinaMarkdown content={proj.body} />
                  </div>
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" className="inline-block px-6 py-2 rounded-full font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors">
                      View Project
                    </a>
                  )}
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Holographic Resume Orb (Call to Action) */}
        <div className="fixed bottom-8 right-8 z-50">
          <motion.div 
            initial={false}
            whileHover="hover"
            className="relative"
          >
            {/* The Orb */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className={`w-16 h-16 rounded-full cursor-pointer flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 backdrop-blur-md
                ${isDark ? 'bg-emerald-900/40 border-emerald-400' : 'bg-emerald-100/40 border-emerald-500'}
              `}
            >
              <span className="text-2xl">⚡</span>
            </motion.div>

            {/* The Holographic Expansion */}
            <motion.div
              variants={{
                hover: { opacity: 1, scale: 1, y: -20, pointerEvents: "auto" },
                initial: { opacity: 0, scale: 0.8, y: 0, pointerEvents: "none" }
              }}
              initial="initial"
              className={`absolute bottom-full right-0 mb-4 w-64 p-6 rounded-2xl border backdrop-blur-xl origin-bottom-right shadow-2xl
                ${isDark ? 'bg-black/80 border-emerald-500/50' : 'bg-white/90 border-emerald-200'}
              `}
            >
              <h4 className="text-xl font-bold mb-2 text-emerald-500">System Ready</h4>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                Deploy this engineer to your team immediately.
              </p>
              <button className="w-full py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                Download Resume
              </button>
            </motion.div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
