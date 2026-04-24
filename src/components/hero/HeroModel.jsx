"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import HeroModelPlaceholder from "./HeroModelPlaceholder";

const HeroModelCanvas = dynamic(() => import("./HeroModelCanvas"), {
  ssr: false,
});

export default function HeroModel() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative z-10 w-full px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 2xl:px-10">
      <div className="mx-auto w-full max-w-screen-2xl">
        <HeroModelPlaceholder>
          <button
            type="button"
            aria-label="Preview 3D model in fullscreen"
            onMouseEnter={() => setIsExpanded(true)}
            onFocus={() => setIsExpanded(true)}
            className="block h-full w-full cursor-pointer"
          >
            <HeroModelCanvas />
          </button>
        </HeroModelPlaceholder>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-bg/95 backdrop-blur-sm transition-opacity duration-300 ${
          isExpanded
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex h-full w-full items-center justify-center p-6 sm:p-8 md:p-10">
          <HeroModelPlaceholder className="max-w-none">
            <button
              type="button"
              aria-label="Close fullscreen 3D model preview"
              onMouseLeave={() => setIsExpanded(false)}
              onBlur={() => setIsExpanded(false)}
              className="block h-full w-full cursor-pointer"
            >
              <HeroModelCanvas />
            </button>
          </HeroModelPlaceholder>
        </div>
      </div>
    </div>
  );
}
