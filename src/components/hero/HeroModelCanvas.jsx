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
  const pointerRayRef = useRef(null);
  const needsEyeUpdateRef = useRef(false);
  const isPointerOverModelRef = useRef(false);

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

  // Apply eye-tracking updates on the render loop (driven by stored pointer ray)
  useFrame(() => {
    if (!needsEyeUpdateRef.current || !pointerRayRef.current) return;
    needsEyeUpdateRef.current = false;

    const ray = pointerRayRef.current;

    const updateEye = (eyeRef, originalRef) => {
      if (!eyeRef.current || !eyeRef.current.parent) return;
      const eyeWorldPos = eyeRef.current.getWorldPosition(new THREE.Vector3());
      const distance = eyeWorldPos.distanceTo(camera.position);
      const pointOnRay = new THREE.Vector3();
      ray.at(distance, pointOnRay);

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

  // Use R3F pointer handlers directly on the primitive so events only fire when
  // the pointer intersects the GLTF model.
  const handlePointerDown = (e) => {
    e.stopPropagation();
    let obj = e.object;
    let handled = false;

    // Debug: log clicked object and available animation keys
    try {
      console.debug("TVModel: pointerdown on", e.object?.name, "actions:", actions ? Object.keys(actions) : undefined);
    } catch (err) {}

    while (obj && !handled) {
      const name = (obj.name || "").toLowerCase();
          if (name.includes("play") || name.includes("pause") || name.includes("play/pause")) {
        if (actions) {
          const key = Object.keys(actions).find((k) =>
            k.toLowerCase().includes("play") || k.toLowerCase().includes("pause")
          );
          const action = key ? actions[key] : null;
          if (action) {
            action.reset();
            try {
              action.setLoop(THREE.LoopOnce, 1);
            } catch (err) {}
            action.clampWhenFinished = true;
            action.play();
          }
        }
        handled = true;
        break;
      }
          if (name.includes("mute")) {
        if (actions) {
          const key = Object.keys(actions).find((k) => k.toLowerCase().includes("mute"));
          const action = key ? actions[key] : null;
          if (action) {
            action.reset();
            try {
              action.setLoop(THREE.LoopOnce, 1);
            } catch (err) {}
            action.clampWhenFinished = true;
            action.play();
          }
        }
        handled = true;
        break;
      }
      obj = obj.parent;
    }
  };

  const handlePointerMove = (e) => {
    e.stopPropagation();
    // store the pointer ray for the frame loop to consume
    pointerRayRef.current = e.ray ? e.ray.clone() : null;
    if (pointerRayRef.current) {
      needsEyeUpdateRef.current = true;
      isPointerOverModelRef.current = true;
      // Debug: confirm pointer move over model
      try {
        console.debug("TVModel: pointermove on model at", e.point && e.point.toArray());
      } catch (err) {}
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    isPointerOverModelRef.current = true;
  };

  const handlePointerOut = () => {
    isPointerOverModelRef.current = false;
    needsEyeUpdateRef.current = false;
    pointerRayRef.current = null;
    if (eyeLRef.current) eyeLRef.current.position.copy(eyeLOriginalPosRef.current);
    if (eyeRRef.current) eyeRRef.current.position.copy(eyeROriginalPosRef.current);
  };

  return (
    <primitive
      ref={group}
      object={gltfScene}
      dispose={null}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
        onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
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
