'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { use } from 'react';

function PhotoShape({ texture, shape }: { texture: THREE.Texture; shape: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.3;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} castShadow>
        {shape === 'plane' && <planeGeometry args={[4, 3, 32, 32]} />}
        {shape === 'sphere' && <sphereGeometry args={[1.5, 64, 64]} />}
        {shape === 'cylinder' && <cylinderGeometry args={[1.2, 1.2, 3, 64]} />}
        {shape === 'box' && <boxGeometry args={[3, 2.5, 2.5]} />}
        {shape === 'torus' && <torusGeometry args={[1.3, 0.5, 32, 64]} />}
        {shape === 'distort' && <sphereGeometry args={[1.6, 128, 128]} />}
        {shape === 'distort' ? (
          <MeshDistortMaterial map={texture} distort={0.3} speed={1.5} roughness={0.2} metalness={0.6} />
        ) : (
          <meshStandardMaterial map={texture} roughness={0.3} metalness={0.4} side={THREE.DoubleSide} />
        )}
      </mesh>
    </Float>
  );
}

export default function PublicProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
          new THREE.TextureLoader().load(data.project.image_path, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            setTexture(tex);
          });
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white/40">Cargando...</div>;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-white/50">Proyecto no encontrado</p>
        <a href="/" className="mt-4 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm">← Volver</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: project.background }}>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div>
          <h1 className="text-xl font-bold text-white">{project.title}</h1>
          <p className="text-xs text-white/50">por {project.author} · {project.views} vistas</p>
        </div>
        <a href="/" className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white">← Galería</a>
      </div>

      {/* 3D Scene */}
      {texture && (
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} shadows className="absolute inset-0">
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} color="#8b5cf6" />
            <pointLight position={[-5, -5, 5]} intensity={1} color="#ec4899" />
            <PhotoShape texture={texture} shape={project.shape} />
            <Sparkles count={50} scale={8} size={4} speed={0.3} color="#c084fc" />
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={12} blur={2} />
            <Environment preset="city" />
            <OrbitControls enableZoom enablePan={false} />
          </Suspense>
        </Canvas>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/60 to-transparent">
        {project.description && <p className="text-white/70 max-w-2xl mb-4">{project.description}</p>}
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white"
        >
          🔗 Compartir
        </button>
      </div>
    </div>
  );
}
