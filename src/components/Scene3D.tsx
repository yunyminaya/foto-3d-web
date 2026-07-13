'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  Environment,
  ContactShadows,
  MeshDistortMaterial,
  Sparkles,
  ScrollControls,
  useScroll,
  Sphere,
  Torus,
  Icosahedron,
  RoundedBox,
} from '@react-three/drei';
import * as THREE from 'three';

/* ============================
   OBJETOS 3D ANIMADOS
   ============================ */

function FloatingShape({
  position,
  color,
  geometry = 'sphere',
  speed = 1,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  geometry?: 'sphere' | 'torus' | 'ico' | 'box';
  speed?: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.y = t * 0.2;
    ref.current.position.y = position[1] + Math.sin(t) * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={ref} position={position} scale={scale}>
        {geometry === 'sphere' && <sphereGeometry args={[1, 64, 64]} />}
        {geometry === 'torus' && <torusGeometry args={[0.8, 0.3, 32, 64]} />}
        {geometry === 'ico' && <icosahedronGeometry args={[1, 0]} />}
        {geometry === 'box' && <boxGeometry args={[1.4, 1.4, 1.4]} />}
        <MeshDistortMaterial
          color={color}
          distort={0.35}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

/* Partículas de fondo */
function ParticleField() {
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a78bfa" transparent opacity={0.6} />
    </points>
  );
}

/* Cámara con scroll */
function Rig({ children }: { children: React.ReactNode }) {
  const scroll = useScroll();
  useFrame((state) => {
    const offset = scroll.offset;
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      Math.sin(offset * Math.PI) * 2,
      0.1
    );
    state.camera.position.y = offset * 8;
    state.camera.lookAt(0, offset * 8, 0);
  });
  return <>{children}</>;
}

/* ============================
   ESCENA PRINCIPAL
   ============================ */

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ScrollControls pages={4} damping={0.3}>
          <Rig>
            {/* Luces */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} color="#8b5cf6" />
            <pointLight position={[-5, -5, -5]} intensity={1} color="#ec4899" />
            <spotLight position={[0, 10, 0]} intensity={0.5} color="#06b6d4" />

            {/* Objetos flotantes por secciones */}
            {/* Sección 1 - Hero */}
            <FloatingShape position={[0, 0, 0]} color="#8b5cf6" geometry="sphere" scale={1.5} speed={0.5} />
            <FloatingShape position={[-2.5, 0.5, -1]} color="#ec4899" geometry="ico" scale={0.7} speed={0.8} />
            <FloatingShape position={[2.5, -0.5, -1]} color="#06b6d4" geometry="torus" scale={0.6} speed={1.2} />

            {/* Sección 2 - Features */}
            <FloatingShape position={[-2, 3, 0]} color="#f59e0b" geometry="box" scale={0.6} speed={1} />
            <FloatingShape position={[2, 3.5, -1]} color="#10b981" geometry="sphere" scale={0.8} speed={0.6} />

            {/* Sección 3 - Showcase */}
            <FloatingShape position={[0, 6, -1]} color="#6366f1" geometry="torus" scale={1.2} speed={0.4} />
            <FloatingShape position={[-3, 5.5, 0]} color="#f43f5e" geometry="ico" scale={0.5} speed={1.5} />

            {/* Sección 4 - CTA */}
            <FloatingShape position={[0, 9, 0]} color="#a855f7" geometry="sphere" scale={2} speed={0.3} />

            {/* Partículas */}
            <ParticleField />
            <Sparkles count={80} scale={12} size={3} speed={0.4} color="#c084fc" />

            {/* Sombras de contacto */}
            <ContactShadows position={[0, -2, 0]} opacity={0.3} scale={20} blur={2} />

            {/* Environment para reflejos */}
            <Environment preset="city" />
          </Rig>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
