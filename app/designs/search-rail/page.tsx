import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

import {
  prototypeFilters,
  prototypeSkillDetail,
  prototypeSkills,
} from "@/components/designs/prototype-data";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-search-rail-sans",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-search-rail-mono",
  weight: ["400", "500", "600"],
});

export default function SearchRailPrototypePage() {
  return (
    <div
      className={`${sans.variable} ${mono.variable} rounded-[2.75rem] bg-[#070d17] p-3 text-white shadow-[0_40px_120px_rgba(2,6,23,0.46)] sm:p-4`}
      style={{ fontFamily: "var(--font-search-rail-sans)" }}
    >
      <div className="space-y-3">
        <section className="rounded-xl border border-white/8 bg-[#0b1320] px-5 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div
                className="text-[11px] uppercase tracking-[0.34em] text-slate-400"
                style={{ fontFamily: "var(--font-search-rail-mono)" }}
              >
                Direction 04  Search Rail
              </div>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                ClawHub-style registry structure with a stronger review and
                trust layer.
              </h2>
            </div>

            <div className="flex min-w-[18rem] items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
              <span>Search skills, categories, or repos</span>
              <span className="ml-auto rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.2em]">
                Cmd K
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
          <aside className="rounded-xl border border-white/8 bg-[#0b1320] p-5">
            <div
              className="text-[11px] uppercase tracking-[0.34em] text-slate-400"
              style={{ fontFamily: "var(--font-search-rail-mono)" }}
            >
              Homepage / rail concept
            </div>
            <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
              <div className="text-sm font-semibold text-white">
                Featured this week
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                {prototypeSkills[0].name}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {prototypeSkills[0].summary}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {prototypeFilters.map((filter, index) => (
                <div
                  key={filter}
                  className={`rounded-[1.1rem] px-4 py-3 text-sm ${
                    index < 3
                      ? "bg-cyan-300/10 text-cyan-100"
                      : "bg-white/4 text-slate-300"
                  }`}
                >
                  {filter}
                </div>
              ))}
            </div>
          </aside>

          <div className="rounded-xl border border-white/8 bg-[#0b1320] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div>
                <div
                  className="text-[11px] uppercase tracking-[0.34em] text-slate-400"
                  style={{ fontFamily: "var(--font-search-rail-mono)" }}
                >
                  Browse / results concept
                </div>
                <div className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                  Results ranked by reviews, trust, and quality of evidence
                </div>
              </div>
              <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
                4,000 skills  743 sources
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {prototypeSkills.map((skill, index) => (
                <div
                  key={skill.name}
                  className={`rounded-lg border p-4 ${
                    index < 4
                      ? "border-white/10 bg-[#0f1828]"
                      : "border-white/6 bg-[#0c1523] opacity-80"
                  }`}
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        <span>{skill.source}</span>
                        <span>{skill.category}</span>
                        <span>{skill.lastUpdated}</span>
                      </div>
                      <div className="text-2xl font-semibold tracking-[-0.03em] text-white">
                        {skill.name}
                      </div>
                      <p className="max-w-3xl text-sm leading-7 text-slate-300">
                        {skill.summary}
                      </p>
                    </div>

                    <div className="grid min-w-[18rem] gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      {[
                        ["SkillJury", `${skill.rating}/5`],
                        ["Stars", skill.stars],
                        ["Safety", skill.safety],
                        ["Installs", skill.installs],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-[1rem] border border-white/8 bg-black/20 px-3 py-3 text-sm"
                        >
                          <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                            {label}
                          </div>
                          <div className="mt-2 font-medium text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-xl border border-white/8 bg-[#0b1320] p-5">
            <div
              className="text-[11px] uppercase tracking-[0.34em] text-slate-400"
              style={{ fontFamily: "var(--font-search-rail-mono)" }}
            >
              Skill detail / inspector
            </div>
            <div className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
              {prototypeSkillDetail.name}
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {prototypeSkillDetail.summary}
            </p>

            <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                Safety meter
              </div>
              <div className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-white">
                84
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.2em] text-cyan-100">
                High confidence
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {prototypeSkillDetail.quickFacts.slice(0, 4).map(([label, value]) => (
                <div key={label} className="border-b border-white/8 pb-3 text-sm last:border-b-0">
                  <div className="text-slate-400">{label}</div>
                  <div className="mt-1 font-medium text-white">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.4rem] border border-white/8 bg-black/20 p-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
                Install command
              </div>
              <code className="mt-3 block text-sm leading-7 text-cyan-100">
                {prototypeSkillDetail.installCommand}
              </code>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
