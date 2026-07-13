'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { use } from 'react';
import * as THREE from 'three';
import { Scene3DPremium } from '@/components/ScenePremium';

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

      {/* Loading */}
      {!texture && (
        <div className="absolute inset-0 flex items-center justify-center text-white/40">
          <div className="text-center">
            <div className="text-5xl mb-3 animate-pulse">⏳</div>
            <p>Cargando 3D...</p>
          </div>
        </div>
      )}

      {/* 3D Scene PREMIUM */}
      {texture && (
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} shadows gl={{ antialias: true, toneMapping: 3 }} className="absolute inset-0">
          <Suspense fallback={null}>
            <Scene3DPremium texture={texture} shape={project.shape} />
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
