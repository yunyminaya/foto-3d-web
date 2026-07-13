# 📸 Foto → Web 3D

Convierte cualquier foto en una página web 3D interactiva. Subes una imagen → obtienes una escena 3D con animaciones, partículas y scroll.

![Foto to 3D](https://img.shields.io/badge/3D-WebGL-purple) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Three.js](https://img.shields.io/badge/Three.js-r0-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Instalar

```bash
git clone https://github.com/yunyminaya/foto-3d-web.git
cd foto-3d-web
npm install
npm run dev
```

Abrir **http://localhost:3000**

## 🎯 Cómo usar

1. Arrastra cualquier foto a la página (o haz clic para seleccionar)
2. Elige la forma 3D: esfera, cubo, cilindro, toro, cuadro o esfera con distorsión
3. La foto se envuelve en el objeto 3D al instante
4. Arrastra para rotar, scroll para zoom

## 🎨 Formas 3D disponibles

| Forma | Efecto |
|---|---|
| 🔵 Esfera | Foto envolviendo esfera rotando |
| 🌀 Distorsión | Esfera animada tipo lava, deforme |
| 🖼️ Cuadro | Foto flotando como cuadro 3D |
| 📦 Caja 3D | Foto en las caras de un cubo |
| 🥫 Cilindro | Foto en cilindro rotando |
| 🍩 Toro | Foto en dona 3D |

## 🛠️ Stack técnico

| Herramienta | Para qué |
|---|---|
| [Next.js 16](https://nextjs.org) | Framework React |
| [Three.js](https://threejs.org) | Motor 3D WebGL |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | Three.js en React |
| [@react-three/drei](https://github.com/pmndrs/drei) | Helpers 3D |
| [Framer Motion](https://www.framer.com/motion/) | Animaciones UI |
| [Tailwind CSS](https://tailwindcss.com) | Estilos |
| [TypeScript](https://www.typescriptlang.org) | Tipado |

## 📁 Estructura

```
src/
├── app/
│   ├── layout.tsx       # Layout raíz
│   ├── page.tsx         # Página principal
│   └── globals.css      # Estilos globales
├── components/
│   ├── PhotoTo3D.tsx    # Componente principal: upload + render 3D
│   └── Scene3D.tsx      # Escena 3D con scroll (landing page)
```

## 🌐 Deploy gratis

### Vercel (recomendado)
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
# Subir carpeta .next/ a Netlify
```

## 📝 Licencia

MIT — libre para usar, modificar y vender.
