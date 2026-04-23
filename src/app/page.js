import HeroSection from "@/components/hero/HeroSection";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-bg">
      <Navbar />
      <HeroSection />
    </main>
  );
}
