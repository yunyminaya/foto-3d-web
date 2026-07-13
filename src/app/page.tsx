'use client';

import { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================ OBJETOS 3D ============================ */

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

/* ============================ MODAL CREATE ============================ */

interface ProjectData {
  title: string;
  description: string;
  author: string;
  shape: string;
  background: string;
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<ProjectData>({
    title: '',
    description: '',
    author: '',
    shape: 'sphere',
    background: '#0a0a0f',
  });

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const shapes = [
    { id: 'sphere', label: '🔵 Esfera' },
    { id: 'distort', label: '🌀 Distorsión' },
    { id: 'plane', label: '🖼️ Cuadro' },
    { id: 'box', label: '📦 Caja' },
    { id: 'cylinder', label: '🥫 Cilindro' },
    { id: 'torus', label: '🍩 Toro' },
  ];

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('title', data.title || 'Sin título');
    fd.append('description', data.description);
    fd.append('shape', data.shape);
    fd.append('background', data.background);
    fd.append('author', data.author || 'Anónimo');

    try {
      const res = await fetch('/api/projects', { method: 'POST', body: fd });
      if (res.ok) {
        onCreated();
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
    setUploading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#13131a] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">✨ Crear proyecto 3D</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">✕</button>
        </div>

        {/* Upload */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          onClick={() => document.getElementById('modalFile')?.click()}
          className="border-2 border-dashed border-white/20 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-500/5 transition mb-6 overflow-hidden"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <>
              <div className="text-5xl mb-2">📸</div>
              <p className="text-white/60 text-sm">Arrastra o clic para subir foto</p>
            </>
          )}
          <input id="modalFile" type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {/* Campos */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide">Título</label>
            <input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder="Mi proyecto 3D"
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide">Descripción</label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Describe tu proyecto..."
              rows={2}
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide">Autor</label>
            <input
              value={data.author}
              onChange={(e) => setData({ ...data, author: e.target.value })}
              placeholder="Tu nombre"
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-violet-400 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide">Forma 3D</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {shapes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setData({ ...data, shape: s.id })}
                  className={`px-3 py-2 rounded-lg text-sm border transition ${
                    data.shape === s.id
                      ? 'border-violet-400 bg-violet-500/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wide">Color de fondo</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="color"
                value={data.background}
                onChange={(e) => setData({ ...data, background: e.target.value })}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
              />
              <span className="text-sm text-white/40">{data.background}</span>
            </div>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={!file || uploading}
          className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 font-bold disabled:opacity-40 hover:scale-[1.01] transition"
        >
          {uploading ? '⏳ Subiendo...' : '🚀 Publicar proyecto 3D'}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ============================ PROYECTO VIEWER 3D ============================ */

interface Project {
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

function ProjectViewer({ project, onClose }: { project: Project; onClose: () => void }) {
  const textureRef = useRef<THREE.Texture | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(project.image_path, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      textureRef.current = tex;
      setLoaded(true);
    });
  }, [project.image_path]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: project.background }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div>
          <h2 className="text-xl font-bold text-white">{project.title}</h2>
          <p className="text-xs text-white/50">por {project.author} · {project.views} vistas</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">✕</button>
      </div>

      {/* 3D Scene */}
      {loaded && textureRef.current && (
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} shadows className="absolute inset-0">
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.5} color="#8b5cf6" />
            <pointLight position={[-5, -5, 5]} intensity={1} color="#ec4899" />
            <PhotoShape texture={textureRef.current} shape={project.shape} />
            <Sparkles count={50} scale={8} size={4} speed={0.3} color="#c084fc" />
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={12} blur={2} />
            <Environment preset="city" />
            <OrbitControls enableZoom enablePan={false} />
          </Suspense>
        </Canvas>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white/70 max-w-2xl">{project.description}</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/p/${project.id}`)}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white"
          >
            🔗 Compartir
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================ PÁGINA PRINCIPAL ============================ */

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
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-lg font-bold">
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">FOTO → 3D</span>
            <span className="ml-2 text-xs text-white/30">Full Stack</span>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-sm font-bold hover:scale-105 transition"
          >
            + Crear proyecto 3D
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            Foto → <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Web 3D</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
            Sube una foto. Elige una forma 3D. Comparte con el mundo.
            Backend completo con base de datos.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 font-bold hover:scale-105 transition shadow-lg shadow-violet-500/30"
          >
            📸 Empezar
          </button>
        </motion.div>
      </section>

      {/* Galería */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Galería de proyectos</h2>
          <span className="text-sm text-white/40">{projects.length} proyectos</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/30">Cargando...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-white/40 mb-4">No hay proyectos todavía</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10"
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
                <div className="relative h-56 rounded-2xl overflow-hidden border border-white/10" style={{ background: p.background }}>
                  <img src={p.image_path} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <h3 className="font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-white/50">por {p.author} · {p.views} 👁️</p>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 text-[10px] uppercase tracking-wide">{p.shape}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-white/30 text-sm">
        <p>Foto → 3D · Full Stack · Next.js + Three.js + SQLite · <a href="https://github.com/yunyminaya/foto-3d-web" className="hover:text-white/60">GitHub</a></p>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={loadProjects} />}
        {viewing && <ProjectViewer project={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </div>
  );
}
