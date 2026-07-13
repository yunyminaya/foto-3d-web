'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows, MeshDistortMaterial, Sparkles, Lightformer, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

/* ============================ 3D — Producto ============================ */

function Product3D({ texture, shape }: { texture: THREE.Texture; shape: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.25;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.05;
  });

  return (
    <Float speed={1} rotationIntensity={0.15} floatIntensity={0.3}>
      <mesh ref={ref}>
        {shape === 'plane' && <planeGeometry args={[2.8, 5, 32, 32]} />}
        {shape === 'sphere' && <sphereGeometry args={[1.5, 64, 64]} />}
        {shape === 'box' && <boxGeometry args={[2.8, 2.8, 2.8]} />}
        {shape === 'cylinder' && <cylinderGeometry args={[1.2, 1.2, 3.5, 64]} />}
        {shape === 'torus' && <torusGeometry args={[1.3, 0.4, 32, 64]} />}
        {shape === 'distort' && <sphereGeometry args={[1.6, 128, 128]} />}
        {shape === 'distort' ? (
          <MeshDistortMaterial map={texture} distort={0.15} speed={1} roughness={0.05} metalness={0.9} envMapIntensity={2} transparent alphaTest={0.5} />
        ) : (
          <meshStandardMaterial map={texture} roughness={0.08} metalness={0.8} envMapIntensity={2} side={THREE.DoubleSide} transparent alphaTest={0.1} />
        )}
      </mesh>
    </Float>
  );
}

function Scene3D({ texture, shape }: { texture: THREE.Texture; shape: string }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <spotLight position={[5, 8, 5]} angle={0.3} penumbra={1} intensity={3} color="white" castShadow />
      <pointLight position={[-6, 2, 3]} intensity={2} color="white" distance={15} />
      <pointLight position={[0, -3, -6]} intensity={2} color="#cccccc" distance={12} />
      <Product3D texture={texture} shape={shape} />
      <Sparkles count={60} scale={8} size={3} speed={0.2} color="white" opacity={0.4} />
      <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={10} blur={2.5} far={5} />
      <Environment resolution={512}>
        <Lightformer intensity={3} position={[5, 5, 5]} scale={[3, 3, 1]} color="white" />
        <Lightformer intensity={2} position={[-5, 3, 3]} scale={[3, 2, 1]} color="white" />
        <Lightformer intensity={1.5} position={[0, 8, 0]} scale={[5, 1, 1]} color="white" />
      </Environment>
    </>
  );
}

/* ============================ LANDING PAGE ============================ */

export default function GeneratedLanding({
  project,
  onClose,
}: {
  project: { id: string; title: string; description: string; image_path: string; shape: string; author: string; views: number };
  onClose: () => void;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const y3d = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity3d = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 1, 0]);
  const scale3d = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    setTexture(null);
    const loader = new THREE.TextureLoader();
    loader.load(project.image_path, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    });
  }, [project.image_path]);

  const tags = project.title.split(' ').slice(0, 3).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  const features = [
    { icon: '✨', title: 'Diseño Premium', desc: 'Acabados de lujo con materiales de la más alta calidad.' },
    { icon: '🚀', title: 'Rendimiento Pro', desc: 'Tecnología de última generación en cada detalle.' },
    { icon: '🔥', title: 'Estilo Único', desc: 'Diseño exclusivo que te diferencia del resto.' },
    { icon: '💎', title: 'Calidad Garantizada', desc: 'Construido para durar toda la vida.' },
  ];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-cs-bg text-cs-text"
    >
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-cs-bg/80 border-b border-cs-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="text-lg font-bold tracking-tight">{project.title.slice(0, 15)}</div>
          <div className="hidden md:flex items-center gap-6 text-sm text-cs-muted">
            <a href="#features" className="hover:text-cs-text transition">Features</a>
            <a href="#about" className="hover:text-cs-text transition">Detalles</a>
            <a href="#buy" className="hover:text-cs-text transition">Comprar</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-cs-bg-pop hover:bg-cs-hover flex items-center justify-center text-sm text-cs-text">✕</button>
            <a href="#buy" className="px-4 py-2 rounded-full bg-cs-text text-cs-bg text-sm font-bold hover:scale-105 transition">Comprar</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {texture && (
          <motion.div style={{ y: y3d, opacity: opacity3d, scale: scale3d }} className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} shadows className="!absolute inset-0">
              <Suspense fallback={null}><Scene3D texture={texture} shape={project.shape} /></Suspense>
            </Canvas>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 text-center max-w-4xl"
        >
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-cs-bg-pop border border-cs-border text-xs tracking-wide text-cs-muted uppercase backdrop-blur-sm">
            {tags.map((t, i) => (<span key={i}>{i > 0 && ' · '}{t}</span>))}
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] mb-6">{project.title}</h1>
          <p className="text-lg md:text-2xl text-cs-muted max-w-2xl mx-auto mb-10">
            {project.description || 'La nueva generación de excelencia.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#buy" className="px-8 py-4 rounded-full bg-cs-text text-cs-bg font-bold hover:scale-105 transition">Comprar ahora →</a>
            <a href="#features" className="px-8 py-4 rounded-full border border-cs-border font-semibold hover:bg-cs-hover transition backdrop-blur-sm">Ver más</a>
          </div>
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cs-muted text-xs tracking-widest z-10"
        >SCROLL</motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative py-32 px-6 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs tracking-widest text-cs-muted uppercase mb-3">Características</p>
            <h2 className="text-4xl md:text-6xl font-black">Diseñado para <span className="border-b-2 border-cs-text pb-1">impresionar</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-cs-bg-pop border border-cs-border hover:border-cs-text/30 hover:bg-cs-hover transition-all backdrop-blur-sm"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition">{f.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{f.title}</h3>
                <p className="text-cs-muted">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section id="about" className="relative py-32 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/[0.03] blur-3xl rounded-full" />
              <img src={project.image_path} alt={project.title} className="relative rounded-3xl border border-cs-border w-full" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <p className="text-xs tracking-widest text-cs-muted uppercase mb-3">El producto</p>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Hecho para <span className="border-b-2 border-cs-text pb-1">ti</span></h2>
            <p className="text-cs-muted text-lg leading-relaxed mb-8">
              {project.description || 'Cada detalle ha sido cuidadosamente diseñado para ofrecerte una experiencia única.'}
            </p>
            <div className="space-y-3">
              {['Materiales premium', 'Diseño exclusivo', 'Garantía de por vida', 'Envío gratis'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-cs-text text-cs-bg flex items-center justify-center text-xs font-bold">✓</div>
                  <span className="text-cs-muted">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 px-6 border-y border-cs-border">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { v: '50K+', l: 'Clientes felices' },
            { v: '4.9★', l: 'Valoración' },
            { v: '24/7', l: 'Soporte' },
            { v: '30d', l: 'Devolución' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-black text-cs-text">{s.v}</div>
              <div className="text-xs text-cs-muted mt-1 tracking-wide">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="buy" className="py-40 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-black mb-6">Hazlo <span className="border-b-2 border-cs-text pb-1">tuyo</span></h2>
          <p className="text-cs-muted text-lg mb-10">Únete a miles de personas que ya disfrutan de {project.title}.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <span className="text-4xl font-black text-cs-text">$299</span>
            <button className="px-10 py-4 rounded-full bg-cs-text text-cs-bg text-lg font-bold hover:scale-105 transition">✦ Comprar ahora</button>
          </div>
          <p className="mt-6 text-xs text-cs-muted tracking-widest">ENVÍO GRATIS · 30 DÍAS DE DEVOLUCIÓN · GARANTÍA 2 AÑOS</p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-cs-border py-8 px-6 text-center text-cs-muted text-sm">
        <p>© 2026 {project.title} · Creado con Foto → 3D</p>
        <p className="mt-1 text-cs-muted/50">por {project.author}</p>
      </footer>
    </motion.div>
  );
}
