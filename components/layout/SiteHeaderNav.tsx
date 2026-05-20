"use client";

import Link from "next/link";
import { useState } from "react";

type SiteHeaderNavProps = {
  accountHref: string;
  accountLabel: string;
};

const primaryLinks = [
  { href: "/search", label: "Explore", event: "filter_applied" },
  { href: "/top-rated", label: "Leaderboard", event: "leaderboard_tab_clicked" },
  { href: "/search?agent=", label: "Agents", event: "agent_clicked" },
  { href: "/submit-skill", label: "Submit", event: "submit_skill_clicked" },
];

export function SiteHeaderNav({
  accountHref,
  accountLabel,
}: SiteHeaderNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayAccountLabel = accountLabel === "Choose ID" ? "Account" : accountLabel;

  return (
    <div className="relative flex items-center gap-4">
      <nav className="hidden items-center gap-6 md:flex">
        {primaryLinks.map((link) => (
          <Link
            key={`${link.href}:${link.label}`}
            className="text-sm text-muted-foreground transition-default hover:text-foreground"
            href={link.href}
            data-sj-event={link.event}
            data-sj-label={link.label}
            data-sj-surface="header"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link
            className="hidden rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-default hover:border-primary/20 hover:bg-surface-hover md:inline-flex"
        href={accountHref}
        data-sj-event={accountHref === "/login" ? "login_clicked" : "filter_applied"}
        data-sj-label={displayAccountLabel}
        data-sj-surface="header"
      >
        {displayAccountLabel}
      </Link>

      <div className="md:hidden">
        <button
          aria-controls="mobile-site-nav"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-default hover:border-primary/20 hover:bg-surface-hover"
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
            className="absolute right-0 top-full z-50 mt-3 min-w-56 rounded-2xl border border-border bg-card p-3 shadow-xl"
            id="mobile-site-nav"
          >
            <nav className="flex flex-col gap-1">
              {[...primaryLinks, { href: accountHref, label: accountLabel, event: accountHref === "/login" ? "login_clicked" : "filter_applied" }].map((link) => (
                <Link
                  key={`mobile:${link.href}:${link.label}`}
                  className="rounded-xl px-4 py-3 text-sm text-foreground transition-default hover:bg-surface-hover"
                  href={link.href}
                  data-sj-event={link.event}
                  data-sj-label={link.label}
                  data-sj-surface="mobile_header"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label === "Choose ID" ? "Account" : link.label}
                </Link>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </div>
  );
}
