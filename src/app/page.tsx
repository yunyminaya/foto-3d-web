'use client';

import dynamic from 'next/dynamic';

// Solo cliente - WebGL
const PhotoTo3D = dynamic(() => import('@/components/PhotoTo3D'), { ssr: false });

export default function Home() {
  return <PhotoTo3D />;
}
