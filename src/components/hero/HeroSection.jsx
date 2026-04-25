"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import HeroContent from "./HeroContent";
import HeroModel from "./HeroModel";

export default function HeroSection() {
  const [isImmersive, setIsImmersive] = useState(false);
  const [isHoverEnabled, setIsHoverEnabled] = useState(false);
  const hoverExitTimeoutRef = useRef(null);

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
    };
  }, []);

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
        onModelHoverChange={handleModelHoverChange}
        onModelActivate={handleModelActivate}
        onBackdropActivate={handleBackdropActivate}
        onClose={() => setImmersiveState(false)}
      />

      <div className="relative z-20 flex w-full flex-col items-center justify-start">
        <div
          className={`w-full transition-all duration-500 ease-out ${
            isImmersive
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
