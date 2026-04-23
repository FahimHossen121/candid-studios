import Link from "next/link";

export default function HeroContent() {
  return (
    <div className="w-full px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 2xl:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 text-center sm:gap-6 lg:gap-7">
        <h1 className="text-4xl font-medium tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
          Think Candid
        </h1>

        <p className="max-w-3xl text-base leading-7 text-text-body sm:text-lg sm:leading-8 md:text-xl md:leading-9 lg:text-2xl lg:leading-10">
          We&apos;re on a mission to unbore the internet. With original
          storytelling that captivates we&apos;re here to craft content like never
          before.
        </p>

        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-transform duration-200 hover:scale-[1.02] hover:bg-dark md:px-8 md:py-4 md:text-base lg:px-10 lg:text-lg"
        >
          Explore the Candid Way
        </Link>
      </div>
    </div>
  );
}
