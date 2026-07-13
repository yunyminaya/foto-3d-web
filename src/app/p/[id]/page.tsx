'use client';

import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { use } from 'react';
import * as THREE from 'three';
import GeneratedLanding from '@/components/GeneratedLanding';

export default function PublicProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
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

  // Renderiza la landing page completa generada
  return <GeneratedLanding project={project} onClose={() => (window.location.href = '/')} />;
}
