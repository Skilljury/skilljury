import { IBM_Plex_Mono, Sora } from "next/font/google";

import {
  prototypeSkillDetail,
  prototypeSkills,
} from "@/components/designs/prototype-data";

const displayFont = Sora({
  subsets: ["latin"],
  variable: "--font-signal-stage-display",
  weight: ["400", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-signal-stage-mono",
  weight: ["400", "500", "600"],
});

export default function SignalStagePrototypePage() {
  return (
    <div
      className={`${displayFont.variable} ${mono.variable} overflow-hidden rounded-[2.75rem] bg-[#05070d] p-4 text-white shadow-[0_40px_120px_rgba(2,6,23,0.52)] sm:p-6`}
      style={{ fontFamily: "var(--font-signal-stage-display)" }}
    >
      <div className="space-y-8">
        <section className="rounded-[2.4rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(80,180,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(92,67,255,0.18),transparent_26%),linear-gradient(135deg,#05070d,#0b1020_60%,#111a33)] px-6 py-8 lg:px-10 lg:py-12">
          <div className="max-w-5xl space-y-6">
            <div
              className="text-[11px] uppercase tracking-[0.34em] text-sky-100/70"
              style={{ fontFamily: "var(--font-signal-stage-mono)" }}
            >
              Direction 05  Signal Stage
            </div>
            <h2 className="text-6xl font-semibold leading-[0.92] tracking-[-0.06em] sm:text-7xl lg:text-[5.8rem]">
              A launch-stage dark theme for SkillJury that feels closer to a
              modern product reveal than a marketplace.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-slate-300">
              This concept leans hardest into Vercel-like drama: bold hero,
              compact proof blocks, high-contrast sections, and showcase moments
              that make the trust layer feel like part of the product story.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5 backdrop-blur">
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-slate-400"
                style={{ fontFamily: "var(--font-signal-stage-mono)" }}
              >
                Homepage concept
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                {[
                  ["4,000+", "skills"],
                  ["743", "sources"],
                  ["84", "safety score ceiling"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-[1.3rem] border border-white/8 bg-white/6 p-4"
                  >
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      {label}
                    </div>
                    <div className="mt-3 text-3xl font-semibold text-white">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/6 p-5 backdrop-blur">
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-slate-400"
                style={{ fontFamily: "var(--font-signal-stage-mono)" }}
              >
                Spotlight skill
              </div>
              <div className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">
                {prototypeSkills[0].name}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {prototypeSkills[0].summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-sky-100">
                <span>{prototypeSkills[0].rating}/5</span>
                <span>{prototypeSkills[0].stars} stars</span>
                <span>{prototypeSkills[0].safety}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.58fr_0.42fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-white/8 bg-[#0b1020] p-5">
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-slate-400"
                style={{ fontFamily: "var(--font-signal-stage-mono)" }}
              >
                Listing concept
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Showcase band plus ranked stack
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {prototypeSkills.slice(0, 4).map((skill) => (
                <article
                  key={skill.name}
                  className="rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,#0b1020,#0e162d)] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {skill.category}
                    </div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-sky-100">
                      {skill.safety}
                    </div>
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                    {skill.name}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {skill.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-200">
                    <span>{skill.rating}/5</span>
                    <span>{skill.stars} stars</span>
                    <span>{skill.installs} weekly</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-sky-400/20 bg-[linear-gradient(180deg,#0a1022,#121b35)] p-5">
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-sky-100/70"
                style={{ fontFamily: "var(--font-signal-stage-mono)" }}
              >
                Skill detail concept
              </div>
              <div className="mt-4 text-5xl font-semibold tracking-[-0.06em] text-white">
                {prototypeSkillDetail.name}
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                {prototypeSkillDetail.summary}
              </p>

              <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      Safety meter
                    </div>
                    <div className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-white">
                      84
                    </div>
                    <div className="mt-2 text-xs uppercase tracking-[0.18em] text-sky-100">
                      High confidence
                    </div>
                  </div>
                  <div className="rounded-[1rem] border border-white/10 px-4 py-3 text-sm text-slate-200">
                    Evidence-backed trust summary
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-[#0b1020] p-5">
              <div
                className="text-[10px] uppercase tracking-[0.28em] text-slate-400"
                style={{ fontFamily: "var(--font-signal-stage-mono)" }}
              >
                External signals
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {prototypeSkillDetail.quickFacts.slice(0, 4).map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[1.2rem] border border-white/8 bg-black/20 p-4"
                  >
                    <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      {label}
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
