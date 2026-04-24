import Link from "next/link";
import { ViewTransition } from "react";
import PdfViewer from "./PdfViewer";

export const metadata = {
  title: "Candid Deck",
  description: "View the Candid Studios deck.",
};

export default function DeckPage() {
  return (
    <main className="min-h-screen bg-bg px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-7 xl:px-8 2xl:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-screen-2xl flex-col rounded-[2rem] bg-white/70 p-5 shadow-[0_30px_100px_rgba(26,16,53,0.12)] ring-1 ring-white/70 backdrop-blur-xl sm:p-6 md:min-h-[calc(100vh-3rem)] md:p-8 lg:p-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            transitionTypes={["nav-back"]}
            className="inline-flex items-center justify-center rounded-full border border-primary/15 bg-white px-5 py-3 text-sm font-medium text-primary transition-colors duration-200 hover:border-primary/30 hover:bg-primary/5"
          >
            Back Home
          </Link>

          <p className="hidden text-sm text-text-muted md:block">
            Interactive PDF deck viewer
          </p>
        </div>

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
          <section className="flex flex-1 flex-col justify-center pt-6 md:pt-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
              <div className="space-y-3">
                <ViewTransition name="hero-cta" share="morph">
                  <div className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                    Candid Studios Deck
                  </div>
                </ViewTransition>
                <h1 className="text-3xl font-semibold tracking-tight text-dark sm:text-4xl lg:text-5xl">
                  Browse the presentation without leaving the site.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-text-body sm:text-lg">
                  The viewer keeps page navigation and download actions in one
                  place, using equal-sized controls for a cleaner presentation
                  flow.
                </p>
              </div>

              <PdfViewer />
            </div>
          </section>
        </ViewTransition>
      </div>
    </main>
  );
}
