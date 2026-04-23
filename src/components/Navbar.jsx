"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "https://facebook.com", label: "Facebook" },
  { href: "/contact", label: "Contact" },
  { href: "https://instagram.com", label: "Instagram" },
];

function NavItem({ href, label, onClick, mobile = false }) {
  const className = mobile
    ? "transition-colors duration-200 hover:text-primary"
    : "transition-colors duration-200 hover:text-primary";

  if (href.startsWith("/")) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={onClick}
      className={className}
    >
      {label}
    </a>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen((open) => !open);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="w-full px-4 pt-4 sm:px-5 sm:pt-5 md:px-6 md:pt-6 lg:px-7 xl:px-8 2xl:px-10">
      <div className="mx-auto w-full max-w-screen-2xl rounded-3xl">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 md:px-10 md:py-5 lg:px-14 lg:py-6 xl:px-20 xl:py-7 2xl:px-24">
          <Link
            href="/"
            aria-label="Candid Studios home"
            className="inline-flex w-fit items-center text-2xl leading-none tracking-tight text-primary transition-opacity duration-200 hover:opacity-80 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl"
          >
            <span className="font-bold">candid</span>
            <span className="pl-1 font-normal tracking-tighter">studios</span>
          </Link>

          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={toggleMenu}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-white text-primary transition-colors duration-300 hover:border-primary/40 hover:bg-primary/5 md:hidden"
          >
            <span
              className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                menuOpen ? "rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                menuOpen ? "-rotate-45" : "translate-y-1.5"
              }`}
            />
          </button>

          <nav aria-label="Primary navigation" className="hidden md:block">
            <ul className="flex items-center gap-6 text-base text-dark md:gap-7 md:text-base lg:gap-10 lg:text-lg xl:gap-12 xl:text-xl 2xl:gap-14 2xl:text-2xl">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <NavItem href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-dark/30 transition-opacity duration-300 md:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMenu}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-[82vw] max-w-sm flex-col bg-dark text-white shadow-2xl transition-transform duration-500 ease-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6">
          <Link
            href="/"
            onClick={closeMenu}
            className="inline-flex items-center text-2xl leading-none tracking-tight text-white"
          >
            <span className="font-bold">candid</span>
            <span className="pl-1 font-normal tracking-tighter">studios</span>
          </Link>

          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-200 hover:bg-white/10"
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1 px-5 py-8 sm:px-6">
          <ul className="flex flex-col gap-6 text-2xl text-white sm:text-3xl">
            {navLinks.map((link) => (
              <li key={link.label}>
                <NavItem
                  href={link.href}
                  label={link.label}
                  onClick={closeMenu}
                  mobile
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-5 pb-8 pt-2 text-sm text-white/60 sm:px-6">
          Think Candid
        </div>
      </aside>
    </header>
  );
}
