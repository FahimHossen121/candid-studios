"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment } from "@react-three/drei";
import * as THREE from "three";

const INTRO_DURATION = 1.6;
const CAMERA_DAMPING = 4.5;
const EYE_DAMPING = 10;
const EYE_MAX_OFFSET = 0.08;

function easeOutCubic(value) {
  return 1 - (1 - value) ** 3;
}

function applyCameraPose(camera, pose) {
  camera.position.copy(pose.position);
  camera.quaternion.copy(pose.quaternion);
  camera.fov = pose.fov;
  camera.near = pose.near;
  camera.far = pose.far;
  camera.updateProjectionMatrix();
}

function createIntroPose(basePose) {
  const forward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(basePose.quaternion)
    .normalize();
  const up = new THREE.Vector3(0, 1, 0)
    .applyQuaternion(basePose.quaternion)
    .normalize();
  const right = new THREE.Vector3(1, 0, 0)
    .applyQuaternion(basePose.quaternion)
    .normalize();

  return {
    position: basePose.position
      .clone()
      .addScaledVector(forward, -1.95)
      .addScaledVector(up, 0.72)
      .addScaledVector(right, -0.18),
    quaternion: basePose.quaternion.clone(),
    fov: basePose.fov + 4,
    near: basePose.near,
    far: basePose.far,
  };
}

function createImmersivePose(basePose) {
  const forward = new THREE.Vector3(0, 0, -1)
    .applyQuaternion(basePose.quaternion)
    .normalize();
  const up = new THREE.Vector3(0, 1, 0)
    .applyQuaternion(basePose.quaternion)
    .normalize();

  return {
    position: basePose.position
      .clone()
      .addScaledVector(forward, 1.55)
      .addScaledVector(up, 0.05),
    quaternion: basePose.quaternion.clone(),
    fov: Math.max(basePose.fov - 2, 22),
    near: basePose.near,
    far: basePose.far,
  };
}

function CameraRig({ basePose, isImmersive }) {
  const introStartTimeRef = useRef(null);
  const introPoseRef = useRef(null);
  const immersivePoseRef = useRef(null);
  const shouldResetPoseRef = useRef(false);

  useEffect(() => {
    if (!basePose) {
      return;
    }

    introPoseRef.current = createIntroPose(basePose);
    immersivePoseRef.current = createImmersivePose(basePose);
    introStartTimeRef.current = performance.now();
    shouldResetPoseRef.current = true;
  }, [basePose]);

  useFrame((state, delta) => {
    if (!basePose || !introPoseRef.current || !immersivePoseRef.current) {
      return;
    }

    const sceneCamera = state.camera;
    const targetPose = isImmersive ? immersivePoseRef.current : basePose;
    const introElapsed =
      introStartTimeRef.current == null
        ? INTRO_DURATION
        : (performance.now() - introStartTimeRef.current) / 1000;

    if (shouldResetPoseRef.current) {
      applyCameraPose(sceneCamera, introPoseRef.current);
      shouldResetPoseRef.current = false;
    }

    if (introElapsed < INTRO_DURATION) {
      const progress = easeOutCubic(
        THREE.MathUtils.clamp(introElapsed / INTRO_DURATION, 0, 1),
      );

      sceneCamera.position.lerpVectors(
        introPoseRef.current.position,
        targetPose.position,
        progress,
      );
      sceneCamera.quaternion
        .copy(introPoseRef.current.quaternion)
        .slerp(targetPose.quaternion, progress);
      sceneCamera.fov = THREE.MathUtils.lerp(
        introPoseRef.current.fov,
        targetPose.fov,
        progress,
      );
      sceneCamera.near = targetPose.near;
      sceneCamera.far = targetPose.far;
      sceneCamera.updateProjectionMatrix();
      return;
    }

    const blend = 1 - Math.exp(-CAMERA_DAMPING * delta);
    sceneCamera.position.lerp(targetPose.position, blend);
    sceneCamera.quaternion.slerp(targetPose.quaternion, blend);
    sceneCamera.fov = THREE.MathUtils.lerp(
      sceneCamera.fov,
      targetPose.fov,
      blend,
    );
    sceneCamera.near = targetPose.near;
    sceneCamera.far = targetPose.far;
    sceneCamera.updateProjectionMatrix();
  });

  return null;
}

function TVModel({
  url = "/models/TV.glb",
  onCameraReady,
  onModelHoverChange,
  onModelActivate,
}) {
  const group = useRef();
  const gltf = useGLTF(url);
  const { scene: gltfScene, cameras, animations } = gltf || {};
  const { actions } = useAnimations(animations, group);
  const { camera } = useThree();

  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerNdcRef = useRef(new THREE.Vector2());
  const hasPointerRef = useRef(false);

  const eyeLRef = useRef(null);
  const eyeRRef = useRef(null);
  const eyeLOriginalPosRef = useRef(new THREE.Vector3());
  const eyeROriginalPosRef = useRef(new THREE.Vector3());
  const tempVectors = useMemo(
    () => ({
      eyeWorldPos: new THREE.Vector3(),
      pointOnRay: new THREE.Vector3(),
      localTarget: new THREE.Vector3(),
      offset: new THREE.Vector3(),
      target: new THREE.Vector3(),
    }),
    [],
  );

  useEffect(() => {
    if (!gltfScene) {
      return;
    }

    gltfScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
      if (child.isLight) {
        child.castShadow = false;
      }
    });

    if (cameras && cameras.length > 0) {
      const gltfCam = cameras[0];
      if (gltfCam) {
        const cameraPosition = gltfCam.getWorldPosition(new THREE.Vector3());
        const cameraQuaternion = gltfCam.getWorldQuaternion(
          new THREE.Quaternion(),
        );

        onCameraReady?.({
          position: cameraPosition,
          quaternion: cameraQuaternion,
          fov: gltfCam.fov ?? camera.fov,
          near: gltfCam.near ?? camera.near,
          far: gltfCam.far ?? camera.far,
        });
      }
    }

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
  }, [gltfScene, cameras, camera, onCameraReady]);

  useEffect(() => {
    const updatePointer = (clientX, clientY) => {
      pointerNdcRef.current.set(
        (clientX / window.innerWidth) * 2 - 1,
        -((clientY / window.innerHeight) * 2 - 1),
      );
      hasPointerRef.current = true;
    };

    const handlePointerMove = (event) => {
      updatePointer(event.clientX, event.clientY);
    };

    const handleTouchMove = (event) => {
      const touch = event.touches[0];
      if (touch) {
        updatePointer(touch.clientX, touch.clientY);
      }
    };

    const handleWindowLeave = () => {
      hasPointerRef.current = false;
    };

    const handleMouseOut = (event) => {
      if (!event.relatedTarget) {
        hasPointerRef.current = false;
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("pointerleave", handleWindowLeave);
    window.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("pointerleave", handleWindowLeave);
      window.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-EYE_DAMPING * delta);

    const relaxEye = (eyeRef, originalRef) => {
      if (!eyeRef.current) {
        return;
      }

      eyeRef.current.position.lerp(originalRef.current, blend);
    };

    if (!eyeLRef.current || !eyeRRef.current) {
      return;
    }

    if (!hasPointerRef.current) {
      relaxEye(eyeLRef, eyeLOriginalPosRef);
      relaxEye(eyeRRef, eyeROriginalPosRef);
      return;
    }

    raycasterRef.current.setFromCamera(pointerNdcRef.current, camera);

    const updateEye = (eyeRef, originalRef) => {
      if (!eyeRef.current || !eyeRef.current.parent) {
        return;
      }

      const eyeWorldPos = eyeRef.current.getWorldPosition(tempVectors.eyeWorldPos);
      const distance = eyeWorldPos.distanceTo(camera.position);
      raycasterRef.current.ray.at(distance, tempVectors.pointOnRay);

      tempVectors.localTarget.copy(tempVectors.pointOnRay);
      eyeRef.current.parent.worldToLocal(tempVectors.localTarget);
      tempVectors.offset.copy(tempVectors.localTarget).sub(originalRef.current);

      if (tempVectors.offset.length() > EYE_MAX_OFFSET) {
        tempVectors.offset.setLength(EYE_MAX_OFFSET);
      }

      tempVectors.target.copy(originalRef.current).add(tempVectors.offset);
      eyeRef.current.position.lerp(tempVectors.target, blend);
    };

    updateEye(eyeLRef, eyeLOriginalPosRef);
    updateEye(eyeRRef, eyeROriginalPosRef);
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    let obj = e.object;
    let handled = false;

    while (obj && !handled) {
      const name = (obj.name || "").toLowerCase();
      if (
        name.includes("play") ||
        name.includes("pause") ||
        name.includes("play/pause")
      ) {
        if (actions) {
          const key = Object.keys(actions).find((k) =>
            k.toLowerCase().includes("play") || k.toLowerCase().includes("pause"),
          );
          const action = key ? actions[key] : null;
          if (action) {
            action.reset();
            try {
              action.setLoop(THREE.LoopOnce, 1);
            } catch {}
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
            } catch {}
            action.play();
          }
        }
        handled = true;
        break;
      }
      obj = obj.parent;
    }

    onModelActivate?.();
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    onModelHoverChange?.(true);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    onModelHoverChange?.(false);
  };

  return (
    <primitive
      ref={group}
      object={gltfScene}
      dispose={null}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}

export default function HeroModelCanvas({
  isImmersive,
  onModelHoverChange,
  onModelActivate,
  onBackdropActivate,
}) {
  const [baseCameraPose, setBaseCameraPose] = useState(null);

  return (
    <Canvas
      camera={{ position: [0, 1.8, 8], fov: 18 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={onBackdropActivate}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[-1, 2, 2]} intensity={5} />
      <Suspense fallback={null}>
        <CameraRig basePose={baseCameraPose} isImmersive={isImmersive} />
        <Environment files="/models/studio_kontrast_04_1k.hdr" background={false} />
        <TVModel
          url="/models/TV.glb"
          onCameraReady={setBaseCameraPose}
          onModelHoverChange={onModelHoverChange}
          onModelActivate={onModelActivate}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/models/TV.glb");
