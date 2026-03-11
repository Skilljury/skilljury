"use client";

import Link from "next/link";
import { useState } from "react";

type SiteHeaderNavProps = {
  accountHref: string;
  accountLabel: string;
};

const primaryLinks = [
  { href: "/", label: "Catalog" },
  { href: "/search", label: "Search" },
  { href: "/trending", label: "Trending" },
  { href: "/top-rated", label: "Top rated" },
];

export function SiteHeaderNav({
  accountHref,
  accountLabel,
}: SiteHeaderNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const links = [...primaryLinks, { href: accountHref, label: accountLabel }];

  return (
    <div className="relative flex items-center gap-4">
      <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
        {links.map((link) => (
          <Link
            key={`${link.href}:${link.label}`}
            className="transition hover:text-white"
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="md:hidden">
        <button
          aria-controls="mobile-site-nav"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-white/20 hover:bg-white/10"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <span className="relative h-4 w-5">
            <span
              className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition ${
                isOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition ${
                isOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>

        {isOpen ? (
          <div
            className="absolute right-0 top-full z-50 mt-3 min-w-56 rounded-[1.5rem] border border-white/10 bg-[rgba(7,10,18,0.96)] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            id="mobile-site-nav"
          >
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={`mobile:${link.href}:${link.label}`}
                  className="rounded-2xl px-4 py-3 text-sm text-slate-200 transition hover:bg-white/6 hover:text-white"
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </div>
  );
}
