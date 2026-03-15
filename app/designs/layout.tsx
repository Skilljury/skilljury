import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Script from "next/script";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
  title: "SkillJury Design Prototypes",
  description:
    "Internal design exploration routes for comparing SkillJury prototype directions.",
};

const prototypeLinks = [
  {
    href: "/designs/editorial-proof",
    label: "Editorial Proof",
  },
  {
    href: "/designs/control-room",
    label: "Control Room",
  },
  {
    href: "/designs/trust-ledger",
    label: "Trust Ledger",
  },
  {
    href: "/designs/search-rail",
    label: "Search Rail",
  },
  {
    href: "/designs/signal-stage",
    label: "Signal Stage",
  },
];

export default function DesignsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sandboxEnabled =
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_DESIGN_SANDBOX === "true";

  if (!sandboxEnabled) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-4 py-5 lg:px-6">
      <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
      <div className="rounded-[1.9rem] border border-white/8 bg-[#09111e]/90 px-5 py-4 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.32em] text-slate-400">
              Internal prototype sandbox
            </div>
            <h1 className="mt-2 font-display text-3xl tracking-tight text-white">
              SkillJury design directions
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Five dark-mode concept routes for the homepage, listing, and
              skill-detail experience. These use static sample data so we can
              compare structure and design direction before touching the live
              product.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
              href="/designs"
            >
              Overview
            </Link>
            {prototypeLinks.map((link) => (
              <Link
                key={link.href}
                className="rounded-full border border-white/10 bg-[#0d1728] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-[#111d31]"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
