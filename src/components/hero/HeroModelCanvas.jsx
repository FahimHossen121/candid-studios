"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

const INTRO_DURATION = 1.6;
const CAMERA_DAMPING = 4.5;
const EYE_DAMPING = 10;
const EYE_MAX_OFFSET = 0.08;
const NON_INTERACTIVE_NODE_NAMES = new Set(["Plane.001"]);
const CAMERA_POSITION_PRESETS = {
  canvasFallback: {
    position: [0, 1.8, 8],
    fov: 18,
  },
  intro: {
    depthOffset: -1.95,
    heightOffset: 0.72,
    lateralOffset: -0.18,
    fovOffset: 4,
  },
  immersive: {
    depthOffset: 4,
    heightOffset: -1.4,
    fovOffset: -2,
    minFov: 18,
  },
};

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
      .addScaledVector(forward, CAMERA_POSITION_PRESETS.intro.depthOffset)
      .addScaledVector(up, CAMERA_POSITION_PRESETS.intro.heightOffset)
      .addScaledVector(right, CAMERA_POSITION_PRESETS.intro.lateralOffset),
    quaternion: basePose.quaternion.clone(),
    fov: basePose.fov + CAMERA_POSITION_PRESETS.intro.fovOffset,
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
      .addScaledVector(forward, CAMERA_POSITION_PRESETS.immersive.depthOffset)
      .addScaledVector(up, CAMERA_POSITION_PRESETS.immersive.heightOffset),
    quaternion: basePose.quaternion.clone(),
    fov: Math.max(
      basePose.fov + CAMERA_POSITION_PRESETS.immersive.fovOffset,
      CAMERA_POSITION_PRESETS.immersive.minFov,
    ),
    near: basePose.near,
    far: basePose.far,
  };
}

function CameraRig({ basePose, isImmersive, shouldPlayIntro }) {
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
    shouldResetPoseRef.current = true;
  }, [basePose]);

  useEffect(() => {
    if (!basePose) {
      return;
    }

    introStartTimeRef.current = shouldPlayIntro ? performance.now() : null;
    shouldResetPoseRef.current = true;
  }, [basePose, shouldPlayIntro]);

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

    if (!shouldPlayIntro) {
      return;
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
  onSceneReady,
  onModelHoverChange,
  onModelActivate,
  isImmersive,
}) {
  const gltf = useGLTF(url);
  const { scene: gltfScene, cameras, animations } = gltf || {};
  const { camera } = useThree();

  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerNdcRef = useRef(new THREE.Vector2());
  const hasPointerRef = useRef(false);
  const hoverTargetsRef = useRef([]);
  const isHoveringModelRef = useRef(false);
  const controlMixerRef = useRef(null);
  const controlActionsRef = useRef({ mute: null, playPause: null });

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

  const playControlAnimation = (actionName) => {
    const mixer = controlMixerRef.current;
    const action = controlActionsRef.current[actionName];

    if (!mixer || !action) {
      return false;
    }

    mixer.stopAllAction();
    if (!action) {
      return false;
    }

    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);
    action.clampWhenFinished = true;
    action.enabled = true;
    action.paused = false;
    action.play();
    return true;
  };

  useEffect(() => {
    if (!gltfScene) {
      return;
    }

    hoverTargetsRef.current = [];
    controlMixerRef.current = null;
    controlActionsRef.current = { mute: null, playPause: null };

    let buttonArmature = null;

    gltfScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;

        if (NON_INTERACTIVE_NODE_NAMES.has(child.name)) {
          child.raycast = () => null;
        } else {
          hoverTargetsRef.current.push(child);
        }
      }
      if (child.isLight) {
        child.castShadow = false;
      }
      if (child.name === "Button_armature") {
        buttonArmature = child;
      }
    });

    if (buttonArmature && animations?.length) {
      const mixer = new THREE.AnimationMixer(buttonArmature);
      const muteClip =
        animations.find((clip) => clip.name === "Mute") ??
        animations.find((clip) => clip.name.toLowerCase().includes("mute"));
      const playPauseClip =
        animations.find((clip) => clip.name === "Play-Pause") ??
        animations.find((clip) => {
          const lowerName = clip.name.toLowerCase();
          return lowerName.includes("play") || lowerName.includes("pause");
        });

      controlMixerRef.current = mixer;
      controlActionsRef.current = {
        mute: muteClip ? mixer.clipAction(muteClip) : null,
        playPause: playPauseClip ? mixer.clipAction(playPauseClip) : null,
      };
    }

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
    if (eyeLRef.current && eyeRRef.current) {
      onSceneReady?.();
    }
  }, [animations, gltfScene, cameras, camera, onCameraReady, onSceneReady]);

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
    if (controlMixerRef.current) {
      controlMixerRef.current.update(delta);
    }

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
      if (isHoveringModelRef.current) {
        isHoveringModelRef.current = false;
        onModelHoverChange?.(false);
      }
      relaxEye(eyeLRef, eyeLOriginalPosRef);
      relaxEye(eyeRRef, eyeROriginalPosRef);
      return;
    }

    raycasterRef.current.setFromCamera(pointerNdcRef.current, camera);
    const isHoveringModel =
      raycasterRef.current.intersectObjects(hoverTargetsRef.current, false).length > 0;

    if (isHoveringModelRef.current !== isHoveringModel) {
      isHoveringModelRef.current = isHoveringModel;
      onModelHoverChange?.(isHoveringModel);
    }

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

    if (NON_INTERACTIVE_NODE_NAMES.has(obj?.name)) {
      return;
    }

    if (!isImmersive) {
      onModelActivate?.();
      return;
    }

    while (obj && !handled) {
      const name = (obj.name || "").toLowerCase();
      if (
        name.includes("play") ||
        name.includes("pause") ||
        name.includes("play/pause")
      ) {
        handled = playControlAnimation("playPause");
        if (handled) {
          break;
        }
      }
      if (name.includes("mute")) {
        handled = playControlAnimation("mute");
        if (handled) {
          break;
        }
      }
      obj = obj.parent;
    }
  };

  return (
    <primitive
      object={gltfScene}
      dispose={null}
      onPointerDown={handlePointerDown}
    />
  );
}

export default function HeroModelCanvas({
  isImmersive,
  hasStartedIntro,
  onSceneReady,
  onModelHoverChange,
  onModelActivate,
  onBackdropActivate,
}) {
  const [baseCameraPose, setBaseCameraPose] = useState(null);
  const [isModelReady, setIsModelReady] = useState(false);

  useEffect(() => {
    if (baseCameraPose && isModelReady) {
      onSceneReady?.();
    }
  }, [baseCameraPose, isModelReady, onSceneReady]);

  return (
    <Canvas
      camera={CAMERA_POSITION_PRESETS.canvasFallback}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onPointerMissed={onBackdropActivate}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[-1, 2, 2]} intensity={5} />
      <Suspense fallback={null}>
        <CameraRig
          basePose={baseCameraPose}
          isImmersive={isImmersive}
          shouldPlayIntro={hasStartedIntro}
        />
        <Environment files="/models/studio_kontrast_04_1k.hdr" background={false} />
        <TVModel
          url="/models/TV.glb"
          onCameraReady={setBaseCameraPose}
          onSceneReady={() => setIsModelReady(true)}
          onModelHoverChange={onModelHoverChange}
          onModelActivate={onModelActivate}
          isImmersive={isImmersive}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/models/TV.glb");
