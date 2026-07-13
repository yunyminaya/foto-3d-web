'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface ProjectData {
  title: string;
  description: string;
  author: string;
  shape: string;
  background: string;
}

export default function CreateModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
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
        className="bg-cs-bg-pop border border-cs-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
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
