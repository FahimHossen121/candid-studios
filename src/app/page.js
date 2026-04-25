import HeroSection from "@/components/hero/HeroSection";
// Temporarily disable mouse blend overlay (causes unwanted popup on low hover)
// import MouseBlendEffect from "@/components/MouseBlendEffect";
import Navbar from "@/components/Navbar";
import { ViewTransition } from "react";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col bg-bg">
      <Navbar />
      {/* <MouseBlendEffect /> */}
      <ViewTransition
        enter={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        exit={{
          "nav-forward": "nav-forward",
          "nav-back": "nav-back",
          default: "none",
        }}
        default="none"
      >
        <HeroSection />
      </ViewTransition>
    </main>
  );
}
