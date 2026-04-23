import HeroContent from "./HeroContent";
import HeroModel from "./HeroModel";

export default function HeroSection() {
  return (
    <section className="flex min-h-0 flex-1 w-full items-center overflow-hidden py-2 sm:py-3 md:py-4">
      <div className="flex w-full flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-14">
        <HeroContent />
        <HeroModel />
      </div>
    </section>
  );
}
