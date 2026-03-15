import Link from "next/link";

const directions = [
  {
    description:
      "Dark editorial magazine with feature-story hierarchy and a review-journal feel.",
    href: "/designs/editorial-proof",
    label: "Editorial Proof",
    mood: "Narrative / dark editorial",
  },
  {
    description:
      "Operational dashboard that treats skills like systems to inspect, rank, and approve.",
    href: "/designs/control-room",
    label: "Control Room",
    mood: "Ops shell / dark dashboard",
  },
  {
    description:
      "Dark premium product-site direction with stronger Vercel-style polish and sectional rhythm.",
    href: "/designs/trust-ledger",
    label: "Trust Ledger",
    mood: "Product-site / premium dark",
  },
  {
    description:
      "Search-first registry inspired by fast skill catalogs, with a fixed rail and result/detail focus.",
    href: "/designs/search-rail",
    label: "Search Rail",
    mood: "Registry / clawhub-like",
  },
  {
    description:
      "More expressive launch-page layout with dark Vercel-inspired drama, showcase bands, and stronger contrast shifts.",
    href: "/designs/signal-stage",
    label: "Signal Stage",
    mood: "Launch page / dramatic dark",
  },
];

export default function DesignsOverviewPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {directions.map((direction) => (
        <Link
          key={direction.href}
          className="group rounded-xl border border-white/8 bg-[#09111e] p-7 shadow-lg transition hover:-translate-y-1 hover:border-white/15 hover:bg-[#0c1525]"
          href={direction.href}
        >
          <div className="text-[11px] uppercase tracking-[0.32em] text-slate-400">
            {direction.mood}
          </div>
          <h2 className="mt-4 font-display text-4xl leading-none tracking-tight text-white">
            {direction.label}
          </h2>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            {direction.description}
          </p>
          <div className="mt-10 inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white transition group-hover:border-white/25">
            Open prototype
          </div>
        </Link>
      ))}
    </div>
  );
}
