'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const CreateModal = dynamic(() => import('@/components/CreateModal'), { ssr: false });
const GeneratedLanding = dynamic(() => import('@/components/GeneratedLanding'), { ssr: false });

export interface Project {
  id: string;
  title: string;
  description: string;
  image_path: string;
  shape: string;
  background: string;
  author: string;
  views: number;
  created_at: string;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    setProjects(data.projects || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-cs-bg/80 border-b border-cs-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-lg font-bold">FOTO → 3D</div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2 rounded-full bg-cs-text text-cs-bg text-sm font-bold hover:scale-105 transition"
          >
            + Crear proyecto 3D
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            Foto → <span className="text-cs-text">Web 3D</span>
          </h1>
          <p className="text-cs-muted text-lg max-w-xl mx-auto mb-8">
            Sube una foto. Elige una forma 3D. Comparte con el mundo.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-8 py-3.5 rounded-full bg-cs-text text-cs-bg font-bold hover:scale-105 transition"
          >
            📸 Empezar
          </button>
        </motion.div>
      </section>

      {/* Galería */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Galería de proyectos</h2>
          <span className="text-sm text-cs-muted">{projects.length} proyectos</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-cs-muted">Cargando...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-cs-muted mb-4">No hay proyectos todavía</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 rounded-full bg-cs-bg-pop border border-cs-border text-sm hover:bg-cs-hover"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {projects.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                onClick={() => setViewing(p)}
                className="cursor-pointer group"
              >
                <div className="relative h-56 rounded-2xl overflow-hidden border border-cs-border bg-cs-bg-pop">
                  <img src={p.image_path} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-cs-bg/80 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <h3 className="font-bold text-cs-text">{p.title}</h3>
                    <p className="text-xs text-cs-muted">por {p.author} · {p.views} 👁️</p>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-cs-bg/50 text-[10px] uppercase tracking-wide text-cs-muted">{p.shape}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-cs-border py-8 px-6 text-center text-cs-muted text-sm">
        <p>Foto → 3D · Next.js + Three.js · <a href="https://github.com/yunyminaya/foto-3d-web" className="hover:text-cs-text">GitHub</a></p>
      </footer>

      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={loadProjects} />}
        {viewing && <GeneratedLanding project={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </div>
  );
}
