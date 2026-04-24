"use client";

import { useEffect, useState } from "react";

const INITIAL_POSITION = { x: 0, y: 0 };

export default function MouseBlendEffect() {
  const [position, setPosition] = useState(INITIAL_POSITION);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handlePointerMove = (event) => {
      setPosition({ x: event.clientX, y: event.clientY });
      setIsReady(true);
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden"
    >
      <div
        className={`absolute h-56 w-56 rounded-full bg-linear-to-br from-white/70 via-primary/35 to-transparent blur-3xl mix-blend-screen transition-opacity duration-300 md:h-72 md:w-72 ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        style={{
          left: position.x,
          top: position.y,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
