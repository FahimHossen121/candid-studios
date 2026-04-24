"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment } from "@react-three/drei";

function TVModel({ url = "/models/TV.glb" }) {
  const group = useRef();
  const gltf = useGLTF(url);
  const { scene: gltfScene, cameras, animations } = gltf;
  const { actions } = useAnimations(animations, group);
  const { camera } = useThree();

  useEffect(() => {
    if (!gltfScene) return;

    // Ensure shadows are disabled on all meshes and lights in the GLB
    gltfScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
      if (child.isLight) {
        child.castShadow = false;
      }
    });

    // If the GLB provides a camera, copy its transform and projection
    if (cameras && cameras.length > 0) {
      const gltfCam = cameras[0];
      if (gltfCam) {
        if (gltfCam.fov !== undefined) camera.fov = gltfCam.fov;
        if (gltfCam.near !== undefined) camera.near = gltfCam.near;
        if (gltfCam.far !== undefined) camera.far = gltfCam.far;
        camera.position.copy(gltfCam.position);
        camera.quaternion.copy(gltfCam.quaternion);
        camera.updateProjectionMatrix();
      }
    }

    // Auto-play all animations present in the GLB
    if (actions) {
      Object.values(actions).forEach((action) => {
        action.reset().play();
      });
    }
  }, [gltfScene, cameras, actions, camera]);

  return <primitive ref={group} object={gltfScene} dispose={null} />;
}

export default function HeroModelCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 15 }}>
      <ambientLight intensity={0} />
      <directionalLight position={[-1, 2, 2]} intensity={5} />
      <Suspense fallback={null}>
        <Environment files="/models/studio_kontrast_04_1k.hdr" background={false} />
        <TVModel url="/models/TV.glb" />
      </Suspense>
    </Canvas>
  );
}
