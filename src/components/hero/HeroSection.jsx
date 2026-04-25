"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import HeroContent from "./HeroContent";
import HeroModel from "./HeroModel";

export default function HeroSection() {
  const [isImmersive, setIsImmersive] = useState(false);
  const [isHoverEnabled, setIsHoverEnabled] = useState(false);
  const [isSceneLoaded, setIsSceneLoaded] = useState(false);
  const [hasStartedIntro, setHasStartedIntro] = useState(false);
  const hoverExitTimeoutRef = useRef(null);
  const introStartFrameRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateHoverSupport = () => {
      setIsHoverEnabled(mediaQuery.matches);
    };

    updateHoverSupport();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateHoverSupport);
      return () => {
        mediaQuery.removeEventListener("change", updateHoverSupport);
      };
    }

    mediaQuery.addListener(updateHoverSupport);
    return () => {
      mediaQuery.removeListener(updateHoverSupport);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        startTransition(() => {
          setIsImmersive(false);
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hoverExitTimeoutRef.current) {
        window.clearTimeout(hoverExitTimeoutRef.current);
      }
      if (introStartFrameRef.current) {
        window.cancelAnimationFrame(introStartFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isSceneLoaded || hasStartedIntro) {
      return;
    }

    introStartFrameRef.current = window.requestAnimationFrame(() => {
      introStartFrameRef.current = window.requestAnimationFrame(() => {
        setHasStartedIntro(true);
        introStartFrameRef.current = null;
      });
    });

    return () => {
      if (introStartFrameRef.current) {
        window.cancelAnimationFrame(introStartFrameRef.current);
        introStartFrameRef.current = null;
      }
    };
  }, [hasStartedIntro, isSceneLoaded]);

  const setImmersiveState = (nextState) => {
    startTransition(() => {
      setIsImmersive(nextState);
    });
  };

  const handleModelHoverChange = (isHovering) => {
    if (!isHoverEnabled) {
      return;
    }

    if (hoverExitTimeoutRef.current) {
      window.clearTimeout(hoverExitTimeoutRef.current);
      hoverExitTimeoutRef.current = null;
    }

    if (isHovering) {
      setImmersiveState(true);
      return;
    }

    hoverExitTimeoutRef.current = window.setTimeout(() => {
      setImmersiveState(false);
      hoverExitTimeoutRef.current = null;
    }, 180);
  };

  const handleModelActivate = () => {
    if (isHoverEnabled) {
      return;
    }

    if (!isImmersive) {
      setImmersiveState(true);
    }
  };

  const handleBackdropActivate = () => {
    if (!isHoverEnabled) {
      setImmersiveState(false);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100svh-4.5rem)] w-full overflow-hidden pb-[30svh] pt-6 sm:min-h-[calc(100svh-5rem)] sm:pb-[28svh] sm:pt-10 md:pb-[24svh] md:pt-14">
      <HeroModel
        isImmersive={isImmersive}
        isHoverEnabled={isHoverEnabled}
        hasStartedIntro={hasStartedIntro}
        onSceneReady={() => setIsSceneLoaded(true)}
        onModelHoverChange={handleModelHoverChange}
        onModelActivate={handleModelActivate}
        onBackdropActivate={handleBackdropActivate}
        onClose={() => setImmersiveState(false)}
      />

      <div
        className={`fixed inset-0 z-[10000] flex items-center justify-center bg-bg transition-opacity duration-500 ease-out ${
          hasStartedIntro
            ? "pointer-events-none opacity-0"
            : "pointer-events-auto opacity-100"
        }`}
        aria-hidden={hasStartedIntro}
      >
        <div className="flex flex-col items-center gap-4 text-center text-primary">
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
            candid studios
          </p>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-primary/12">
            <div className="h-full w-1/2 animate-[hero-loader_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
          </div>
        </div>
      </div>

      <div className="relative z-20 flex w-full flex-col items-center justify-start">
        <div
          className={`w-full transition-all duration-500 ease-out ${
            !hasStartedIntro
              ? "pointer-events-none opacity-0"
              : isImmersive
              ? "pointer-events-none translate-y-6 opacity-0 blur-md"
              : "pointer-events-auto translate-y-0 opacity-100 blur-0"
          }`}
        >
          <HeroContent />
        </div>
      </div>
    </section>
  );
}
