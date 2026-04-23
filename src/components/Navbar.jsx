import Link from "next/link";

const navLinks = [
  { href: "https://facebook.com", label: "Facebook" },
  { href: "/contact", label: "Contact" },
  { href: "https://instagram.com", label: "Instagram" },
];

export default function Navbar() {
  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-6 py-6 sm:px-8 md:flex-row md:items-center md:justify-between md:px-12 md:py-8 lg:px-20">
        <Link
          href="/"
          aria-label="Candid Studios home"
          className="inline-flex w-fit items-center text-[26px] leading-none tracking-[-0.05em] text-primary transition-opacity duration-200 hover:opacity-80"
        >
          <span className="font-bold">candid</span>
          <span className="pl-1 font-normal tracking-[-0.06em]">studios</span>
        </Link>

        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap items-center gap-x-7 gap-y-3 text-base text-dark md:justify-end lg:gap-x-12">
            {navLinks.map((link) => (
              <li key={link.label}>
                {link.href.startsWith("/") ? (
                  <Link
                    href={link.href}
                    className="transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors duration-200 hover:text-primary"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
