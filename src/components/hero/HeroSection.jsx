import HeroContent from "./HeroContent";
import HeroModel from "./HeroModel";

export default function HeroSection() {
  return (
    <section className="relative flex w-full overflow-hidden pb-2 pt-1 sm:flex-1 sm:items-center sm:pb-6 sm:pt-3 md:pb-8 md:pt-4">
      <div className="relative z-20 flex w-full flex-col items-center gap-2 sm:justify-center sm:gap-5 md:gap-6 lg:gap-8">
        <HeroContent />
        <HeroModel />
      </div>
    </section>
  );
}
