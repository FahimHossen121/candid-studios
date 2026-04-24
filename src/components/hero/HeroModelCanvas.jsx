"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment } from "@react-three/drei";
import * as THREE from "three";

function TVModel({ url = "/models/TV.glb" }) {
  const group = useRef();
  const gltf = useGLTF(url);
  const { scene: gltfScene, cameras, animations } = gltf || {};
  const { actions } = useAnimations(animations, group);
  const { camera } = useThree();

  // Raycaster and pointer refs
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const pointerEventRef = useRef(null);
  const needsEyeUpdateRef = useRef(false);

  // Eye refs and original positions
  const eyeLRef = useRef(null);
  const eyeRRef = useRef(null);
  const eyeLOriginalPosRef = useRef(new THREE.Vector3());
  const eyeROriginalPosRef = useRef(new THREE.Vector3());

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

    // Find eye meshes by name and record original positions
    gltfScene.traverse((child) => {
      if (child.name === "eyeL") {
        eyeLRef.current = child;
        eyeLOriginalPosRef.current.copy(child.position);
      }
      if (child.name === "eyeR") {
        eyeRRef.current = child;
        eyeROriginalPosRef.current.copy(child.position);
      }
    });

    // Do not auto-play animations; we'll trigger them on click
  }, [gltfScene, cameras, camera]);

  // Apply eye-tracking updates on the render loop (debounced via pointerEventRef)
  useFrame(() => {
    if (!needsEyeUpdateRef.current || !pointerEventRef.current) return;
    needsEyeUpdateRef.current = false;

    const { x, y } = pointerEventRef.current;
    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

    const updateEye = (eyeRef, originalRef) => {
      if (!eyeRef.current || !eyeRef.current.parent) return;
      const eyeWorldPos = eyeRef.current.getWorldPosition(new THREE.Vector3());
      const distance = eyeWorldPos.distanceTo(camera.position);
      const pointOnRay = new THREE.Vector3();
      raycaster.ray.at(distance, pointOnRay);

      const eyeParent = eyeRef.current.parent;
      const localTarget = eyeParent.worldToLocal(pointOnRay.clone());
      const offset = localTarget.clone().sub(originalRef.current);

      const maxOffset = 0.08;
      if (offset.length() > maxOffset) offset.setLength(maxOffset);

      eyeRef.current.position.copy(originalRef.current).add(offset);
    };

    updateEye(eyeLRef, eyeLOriginalPosRef);
    updateEye(eyeRRef, eyeROriginalPosRef);
  });

  // Attach pointer handlers to the canvas once the GLTF scene is available
  useEffect(() => {
    if (!gltfScene) return;

    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const handlePointerDown = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      pointerRef.current.x = (x / rect.width) * 2 - 1;
      pointerRef.current.y = -(y / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(pointerRef.current, camera);
      const intersects = raycasterRef.current.intersectObject(gltfScene, true);

      for (const intersection of intersects) {
        let obj = intersection.object;
        let found = false;

        while (obj && !found) {
          const name = (obj.name || "").toLowerCase();
          if (name.includes("play") || name.includes("pause") || name.includes("play/pause")) {
            if (actions && actions["Play-Pause"]) {
              actions["Play-Pause"].reset().play();
            }
            found = true;
            break;
          }
          if (name.includes("mute")) {
            if (actions && actions["Mute"]) {
              actions["Mute"].reset().play();
            }
            found = true;
            break;
          }
          obj = obj.parent;
        }

        if (found) break;
      }
    };

    const handlePointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      pointerEventRef.current = {
        x: (x / rect.width) * 2 - 1,
        y: -(y / rect.height) * 2 + 1,
      };
      needsEyeUpdateRef.current = true;
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
    };
  }, [gltfScene, actions, camera]);

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
