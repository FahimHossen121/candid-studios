import { ViewTransition } from "react";

export default function HeroContent() {
  return (
    <div className="relative w-full px-4 sm:px-5 md:px-6 lg:px-7 xl:px-8 2xl:px-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-2 text-center sm:gap-2 md:gap-2">
        <h1 className="text-4xl font-medium tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-[4.25rem]">
          Think Candid
        </h1>

        <div className="max-w-3xl px-4 py-2 sm:px-8 sm:py-5">
          <p className="text-sm leading-6 text-text-body sm:text-base sm:leading-7 md:text-lg md:leading-8">
            We&apos;re on a mission to unbore the internet. With original
            storytelling that captivates we&apos;re here to craft content like never
            before.
          </p>
        </div>

        <ViewTransition name="hero-cta" share="morph">
          <a
            href="/pitch-deck.pdf"
            target="_blank"
            rel="noreferrer"
            className="group relative inline-flex min-w-56 items-center justify-center overflow-hidden rounded-full bg-primary px-6 py-3 text-sm font-medium text-white shadow-[0_18px_45px_rgba(86,29,134,0.28)] transition-transform duration-300 hover:-translate-y-0.5 md:min-w-64 md:px-8 md:text-base"
          >
            <span className="absolute inset-0 rounded-full bg-linear-to-r from-white/10 via-white/30 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative">Open the Candid Deck</span>
          </a>
        </ViewTransition>
      </div>
    </div>
  );
}
