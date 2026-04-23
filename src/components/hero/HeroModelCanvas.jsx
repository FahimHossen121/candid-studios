"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function RotatingCube() {
  const meshRef = useRef(null);

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.x += delta * 0.45;
    meshRef.current.rotation.y += delta * 0.7;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2.8, 2.8, 2.8]} />
      <meshStandardMaterial color="#7b2fbe" roughness={0.28} metalness={0.18} />
    </mesh>
  );
}

export default function HeroModelCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 6.5], fov: 32 }}>
      <ambientLight intensity={1.6} />
      <directionalLight position={[3, 4, 6]} intensity={2.2} />
      <directionalLight position={[-4, -2, 3]} intensity={0.8} />
      <RotatingCube />
    </Canvas>
  );
}
