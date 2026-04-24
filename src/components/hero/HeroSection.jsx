import HeroContent from "./HeroContent";
import HeroModel from "./HeroModel";

export default function HeroSection() {
  return (
    <section className="relative flex w-full flex-1 items-center overflow-hidden pb-4 pt-2 sm:pb-6 sm:pt-3 md:pb-8 md:pt-4">
      <div className="relative z-20 flex w-full flex-col items-center justify-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
        <HeroContent />
        <HeroModel />
      </div>
    </section>
  );
}
