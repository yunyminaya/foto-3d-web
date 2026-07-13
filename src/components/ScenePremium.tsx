'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls, Environment, ContactShadows, Float, Sparkles,
  MeshDistortMaterial, Lightformer,
  Grid,
} from '@react-three/drei';
import * as THREE from 'three';

/* ============================
   OBJETO 3D — PREMIUM
   ============================ */

function PhotoShape({ texture, shape }: { texture: THREE.Texture; shape: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    // Rotación lenta continua
    ref.current.rotation.y = t * 0.3;
    // Sutil tilt
    ref.current.rotation.x = Math.sin(t * 0.4) * 0.08;
  });

  return (
    <group>
      {/* Objeto principal con la foto */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
        <mesh ref={ref} castShadow>
          {shape === 'plane' && <planeGeometry args={[3.5, 5.5, 64, 64]} />}
          {shape === 'sphere' && <sphereGeometry args={[1.6, 128, 128]} />}
          {shape === 'cylinder' && <cylinderGeometry args={[1.2, 1.2, 3.5, 128]} />}
          {shape === 'box' && <boxGeometry args={[3, 3, 3, 32, 32, 32]} />}
          {shape === 'torus' && <torusGeometry args={[1.4, 0.45, 64, 128]} />}
          {shape === 'distort' && <sphereGeometry args={[1.7, 256, 256]} />}
          {shape === 'distort' ? (
            <MeshDistortMaterial
              map={texture}
              distort={0.25}
              speed={1.2}
              roughness={0.05}
              metalness={0.9}
              envMapIntensity={2}
            />
          ) : (
            <meshStandardMaterial
              map={texture}
              roughness={0.08}
              metalness={0.85}
              envMapIntensity={2.5}
              side={THREE.DoubleSide}
            />
          )}
        </mesh>
      </Float>

      {/* Anillo brillante orbitando */}
      <OrbitRing />

      {/* Aura/glow detrás */}
      <mesh position={[0, 0, -2]} scale={2.5}>
        <ringGeometry args={[1.2, 1.5, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* Anillo que orbita alrededor del objeto */
function OrbitRing() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.z = t * 0.5;
    ref.current.rotation.x = Math.PI / 2.5;
  });
  return (
    <mesh ref={ref} scale={2.8}>
      <torusGeometry args={[1, 0.015, 16, 100]} />
      <meshStandardMaterial
        color="#ec4899"
        emissive="#ec4899"
        emissiveIntensity={2}
        roughness={0}
        metalness={1}
      />
    </mesh>
  );
}

/* Plataforma base con grid */
function Pedestal() {
  return (
    <group position={[0, -2.5, 0]}>
      {/* Disco base */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[2.2, 2.4, 0.08, 64]} />
        <meshStandardMaterial color="#13131a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Anillo glowing base */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={3} />
      </mesh>
      {/* Grid holográfico */}
      <Grid
        position={[0, 0.05, 0]}
        args={[12, 12]}
        cellSize={0.4}
        cellColor="#8b5cf6"
        sectionSize={1.6}
        sectionColor="#ec4899"
        fadeDistance={8}
        fadeStrength={2}
        infiniteGrid
      />
    </group>
  );
}

/* ============================
   ESCENA CINEMATOGRÁFICA
   ============================ */

export function Scene3DPremium({ texture, shape }: { texture: THREE.Texture; shape: string }) {
  return (
    <>
      {/* === LUCES === */}
      <ambientLight intensity={0.15} />
      {/* Key light - violeta */}
      <spotLight position={[5, 8, 5]} angle={0.3} penumbra={1} intensity={3} color="#8b5cf6" castShadow />
      {/* Fill light - rosa */}
      <pointLight position={[-6, 2, 3]} intensity={2} color="#ec4899" distance={15} />
      {/* Rim light - cian */}
      <pointLight position={[0, -3, -6]} intensity={2.5} color="#06b6d4" distance={12} />
      {/* Top light */}
      <directionalLight position={[0, 10, 0]} intensity={0.5} color="white" />

      {/* === OBJETO === */}
      <PhotoShape texture={texture} shape={shape} />

      {/* === PLATAFORMA === */}
      <Pedestal />

      {/* === PARTÍCULAS === */}
      <Sparkles count={120} scale={10} size={5} speed={0.2} color="#c084fc" opacity={0.6} />
      <Sparkles count={60} scale={6} size={2} speed={0.5} color="#ec4899" opacity={0.8} />

      {/* === SOMBRAS === */}
      <ContactShadows position={[0, -2.45, 0]} opacity={0.6} scale={12} blur={2.5} far={6} color="#000000" />

      {/* === ENVIRONMENT para reflejos metálicos === */}
      <Environment resolution={512} preset="night">
        {/* Lightformers personalizados para reflejos dramáticos */}
        <Lightformer intensity={3} position={[5, 5, 5]} scale={[3, 3, 1]} color="#8b5cf6" />
        <Lightformer intensity={2} position={[-5, 3, 3]} scale={[3, 2, 1]} color="#ec4899" />
        <Lightformer intensity={2} position={[0, -3, -5]} scale={[4, 4, 1]} color="#06b6d4" />
        <Lightformer intensity={1.5} position={[0, 8, 0]} scale={[5, 1, 1]} color="white" />
      </Environment>

      {/* === CONTROLES === */}
      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={3.5}
        maxDistance={10}
      />
    </>
  );
}
