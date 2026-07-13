'use client';

import { useRef, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Sparkles, MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================
   1. PLANO CON FOTO (modo cuadro 3D)
   ============================ */

function PhotoFrame({ texture, shape }: { texture: THREE.Texture; shape: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    ref.current.rotation.x = Math.cos(t * 0.2) * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} castShadow>
        {shape === 'plane' && <planeGeometry args={[4, 3, 32, 32]} />}
        {shape === 'sphere' && <sphereGeometry args={[1.5, 64, 64]} />}
        {shape === 'cylinder' && <cylinderGeometry args={[1.2, 1.2, 3, 64]} />}
        {shape === 'box' && <boxGeometry args={[3, 2.5, 2.5]} />}
        {shape === 'torus' && <torusGeometry args={[1.3, 0.5, 32, 64]} />}
        <meshStandardMaterial
          map={texture}
          roughness={0.3}
          metalness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

/* ============================
   2. ESFERA DISTORSIONADA CON FOTO
   ============================ */

function PhotoSphere({ texture }: { texture: THREE.Texture }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.15;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={ref}>
        <sphereGeometry args={[1.6, 128, 128]} />
        <MeshDistortMaterial
          map={texture}
          distort={0.3}
          speed={1.5}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>
    </Float>
  );
}

/* ============================
   3. ESCENA COMPLETA
   ============================ */

function Scene({ texture, mode }: { texture: THREE.Texture; mode: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#8b5cf6" castShadow />
      <pointLight position={[-5, -5, 5]} intensity={1} color="#ec4899" />
      <spotLight position={[0, 8, 0]} intensity={0.5} color="#06b6d4" angle={0.5} penumbra={1} />

      {mode === 'plane' && <PhotoFrame texture={texture} shape="plane" />}
      {mode === 'sphere' && <PhotoSphere texture={texture} />}
      {mode === 'distort' && <PhotoSphere texture={texture} />}
      {mode === 'box' && <PhotoFrame texture={texture} shape="box" />}
      {mode === 'cylinder' && <PhotoFrame texture={texture} shape="cylinder" />}
      {mode === 'torus' && <PhotoFrame texture={texture} shape="torus" />}

      <Sparkles count={50} scale={8} size={4} speed={0.3} color="#c084fc" />
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={12} blur={2} />
      <Environment preset="city" />
      <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
    </>
  );
}

/* ============================
   4. COMPONENTE PRINCIPAL
   ============================ */

export default function PhotoTo3D() {
  const [image, setImage] = useState<string | null>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [mode, setMode] = useState('sphere');
  const [dragging, setDragging] = useState(false);

  // Procesar imagen subida
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImage(url);
      const loader = new THREE.TextureLoader();
      loader.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const shapes = [
    { id: 'sphere', label: '🔵 Esfera', desc: 'Foto envolviendo esfera' },
    { id: 'distort', label: '🌀 Esfera Distorsión', desc: 'Esfera animada tipo lava' },
    { id: 'plane', label: '🖼️ Cuadro', desc: 'Foto flotando como cuadro 3D' },
    { id: 'box', label: '📦 Caja 3D', desc: 'Foto en 6 caras de cubo' },
    { id: 'cylinder', label: '🥫 Cilindro', desc: 'Foto en cilindro rotando' },
    { id: 'torus', label: '🍩 Toro', desc: 'Foto en dona 3D' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              FOTO → 3D
            </span>
          </div>
          <button
            onClick={() => { setImage(null); setTexture(null); }}
            className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition"
          >
            ↻ Nueva foto
          </button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="pt-20 min-h-screen">
        {!image ? (
          /* ---- UPLOAD ---- */
          <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <h1 className="text-5xl md:text-7xl font-black mb-4">
                Sube una <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">foto</span>
              </h1>
              <p className="text-white/50 text-lg">Cualquier foto → web 3D instantánea</p>
            </motion.div>

            {/* Drop zone */}
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
              animate={{ scale: dragging ? 1.05 : 1 }}
              className={`w-full max-w-lg h-64 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${
                dragging ? 'border-violet-400 bg-violet-500/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <div className="text-6xl mb-4">📸</div>
              <p className="text-xl font-semibold mb-1">Arrastra tu foto aquí</p>
              <p className="text-white/40 text-sm">o clic para seleccionar (JPG, PNG, WebP)</p>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </motion.div>

            {/* Ejemplos */}
            <div className="mt-8 text-center text-white/30 text-sm">
              🎯 Ejemplo: foto de un producto, nevera, camión, cara, logo...
            </div>
          </div>
        ) : (
          /* ---- RESULTADO 3D ---- */
          <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)]">
            {/* Preview 3D */}
            <div className="flex-1 relative">
              {texture && (
                <Canvas
                  camera={{ position: [0, 0, 6], fov: 50 }}
                  shadows
                  className="absolute inset-0"
                >
                  <Suspense fallback={null}>
                    <Scene texture={texture} mode={mode} />
                  </Suspense>
                </Canvas>
              )}
            </div>

            {/* Panel de control */}
            <div className="lg:w-80 p-6 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/40 backdrop-blur-md overflow-y-auto">
              <h3 className="text-sm font-bold uppercase tracking-wide text-white/50 mb-4">
                Forma 3D
              </h3>
              <div className="space-y-2">
                {shapes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setMode(s.id)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      mode === s.id
                        ? 'border-violet-400 bg-violet-500/15 text-white'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs text-white/40">{s.desc}</div>
                  </button>
                ))}
              </div>

              {/* Preview miniatura */}
              <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-xs text-white/40 mb-2">Foto original:</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Original" className="w-full rounded-lg" />
              </div>

              {/* Instrucciones */}
              <div className="mt-6 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <div className="text-xs text-white/60">
                  🖱️ <b>Arrastra</b> para rotar · <b>Scroll</b> para zoom
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
