"use client";

import dynamic from "next/dynamic";

const HeroModelCanvas = dynamic(() => import("./HeroModelCanvas"), {
  ssr: false,
});

export default function HeroModel({
  isImmersive,
  isHoverEnabled,
  hasStartedIntro,
  onSceneReady,
  onModelHoverChange,
  onModelActivate,
  onBackdropActivate,
  onClose,
}) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_72%,rgba(123,47,190,0.15),transparent_42%)] transition-opacity duration-500 ease-out ${
          isImmersive ? "opacity-0" : "opacity-100"
        }`}
      />
      <div className="absolute inset-0 pointer-events-auto">
        <HeroModelCanvas
          isImmersive={isImmersive}
          isHoverEnabled={isHoverEnabled}
          hasStartedIntro={hasStartedIntro}
          onSceneReady={onSceneReady}
          onModelHoverChange={onModelHoverChange}
          onModelActivate={onModelActivate}
          onBackdropActivate={onBackdropActivate}
        />
      </div>

      {!isHoverEnabled && isImmersive && (
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto absolute right-4 top-24 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-white/90 text-primary shadow-[0_18px_40px_rgba(14,11,30,0.12)] backdrop-blur md:right-6"
          aria-label="Close fullscreen 3D model preview"
        >
          <span className="text-xl leading-none">&times;</span>
        </button>
      )}
    </div>
  );
}
