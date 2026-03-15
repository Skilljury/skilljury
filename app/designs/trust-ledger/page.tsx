import { DM_Sans, Syne } from "next/font/google";

import {
  prototypeSkillDetail,
  prototypeSkills,
} from "@/components/designs/prototype-data";

const displayFont = Syne({
  subsets: ["latin"],
  variable: "--font-trust-ledger-display",
  weight: ["500", "600", "700", "800"],
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-trust-ledger-body",
  weight: ["400", "500", "700"],
});

export default function TrustLedgerPrototypePage() {
  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} rounded-[2.75rem] bg-[#060b14] p-4 text-white shadow-[0_40px_120px_rgba(2,6,23,0.48)] sm:p-6`}
      style={{ fontFamily: "var(--font-trust-ledger-body)" }}
    >
      <div className="space-y-8">
        <section className="rounded-[2.4rem] border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(104,149,255,0.12),transparent_26%),linear-gradient(180deg,#0b1221,#070b14)] px-6 py-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 xl:grid-cols-[0.64fr_0.36fr]">
            <div className="space-y-6">
              <div className="text-[11px] uppercase tracking-[0.34em] text-slate-400">
                Direction 03  Trust ledger
              </div>
              <h2
                className="max-w-5xl text-6xl leading-[0.9] tracking-[-0.06em] sm:text-7xl"
                style={{ fontFamily: "var(--font-trust-ledger-display)" }}
              >
                A premium dark registry built around trust lanes, not clutter.
              </h2>
              <p className="max-w-3xl text-base leading-8 text-slate-300">
                This version splits the product into clear lanes: community
                sentiment, external signals, and safety confidence. It feels
                institutional and premium instead of decorative.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              {[
                ["Community lane", "SkillJury rating and review count"],
                ["External lane", "GitHub stars, repo cadence, source facts"],
                ["Safety lane", "Evidence-backed confidence summary"],
              ].map(([title, body]) => (
                <div
                  key={title}
                  className="rounded-lg border border-white/8 bg-white/4 p-4"
                >
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.34fr_0.66fr]">
          <aside className="rounded-xl border border-white/8 bg-[#0b1221] p-6">
            <div className="text-[11px] uppercase tracking-[0.34em] text-slate-400">
              Homepage / browse concept
            </div>
            <h3
              className="mt-4 text-4xl leading-[0.92] tracking-[-0.05em]"
              style={{ fontFamily: "var(--font-trust-ledger-display)" }}
            >
              Confidence-first ranking
            </h3>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              <p>- Strong entries get full-width treatment.</p>
              <p>- Sparse or non-English entries lose placement weight.</p>
              <p>- Ratings from outside the site never overwrite SkillJury’s own score.</p>
            </div>
          </aside>

          <div className="grid gap-4">
            {prototypeSkills.map((skill, index) => (
              <article
                key={skill.name}
                className={`rounded-xl border p-5 ${
                  index < 4
                    ? "border-white/10 bg-[#0b1221]"
                    : "border-white/6 bg-[#09101d] opacity-80"
                }`}
              >
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      <span>{skill.source}</span>
                      <span>{skill.category}</span>
                    </div>
                    <div className="text-3xl font-semibold tracking-[-0.05em] text-white">
                      {skill.name}
                    </div>
                    <p className="text-sm leading-7 text-slate-300">
                      {skill.summary}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["SkillJury", `${skill.rating}/5`],
                      ["External", skill.stars],
                      ["Safety", skill.safety],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-[1.2rem] border border-white/8 bg-black/20 p-4"
                      >
                        <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                          {label}
                        </div>
                        <div className="mt-3 text-sm font-semibold text-white">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-white/8 bg-[#0b1221] p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[0.42fr_0.32fr_0.26fr]">
            <div className="space-y-5">
              <div className="text-[11px] uppercase tracking-[0.34em] text-slate-400">
                Skill detail / trust lanes
              </div>
              <h3
                className="text-5xl leading-[0.9] tracking-[-0.06em]"
                style={{ fontFamily: "var(--font-trust-ledger-display)" }}
              >
                {prototypeSkillDetail.name}
              </h3>
              <p className="text-sm leading-7 text-slate-300">
                {prototypeSkillDetail.summary}
              </p>
              <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  Install command
                </div>
                <code className="mt-3 block text-sm leading-7 text-sky-100">
                  {prototypeSkillDetail.installCommand}
                </code>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  Community lane
                </div>
                <div className="mt-4 space-y-3">
                  {prototypeSkillDetail.reviewHighlights.map((review) => (
                    <div key={review.author} className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                      <p className="text-sm leading-7 text-slate-200">{review.body}</p>
                      <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {review.author}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  External lane
                </div>
                <div className="mt-4 space-y-3">
                  {prototypeSkillDetail.quickFacts.slice(0, 4).map(([label, value]) => (
                    <div key={label} className="border-b border-white/8 pb-3 text-sm last:border-b-0">
                      <div className="text-slate-400">{label}</div>
                      <div className="mt-1 font-medium text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,#101a35,#0b1221)] p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                  Safety lane
                </div>
                <div className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-white">
                  84
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-200">
                  {prototypeSkillDetail.safetyChecks.slice(0, 4).map(([check, status]) => (
                    <div key={check} className="flex items-center justify-between gap-3">
                      <span>{check}</span>
                      <span className="text-sky-100">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
