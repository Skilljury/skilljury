import { Archivo, IBM_Plex_Mono } from "next/font/google";

import {
  prototypeFilters,
  prototypeSkillDetail,
  prototypeSkills,
} from "@/components/designs/prototype-data";

const grotesk = Archivo({
  subsets: ["latin"],
  variable: "--font-control-grotesk",
  weight: ["400", "500", "600", "700", "800"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-control-mono",
  weight: ["400", "500", "600"],
});

export default function ControlRoomPrototypePage() {
  return (
    <div
      className={`${grotesk.variable} ${mono.variable} rounded-[2.75rem] bg-[#06101d] p-3 text-white shadow-[0_40px_120px_rgba(2,6,23,0.5)] sm:p-4 lg:p-5`}
      style={{ fontFamily: "var(--font-control-grotesk)" }}
    >
      <div className="grid min-h-[1700px] gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-white/8 bg-[#091626] p-5">
          <div
            className="text-[11px] uppercase tracking-[0.34em] text-cyan-100/80"
            style={{ fontFamily: "var(--font-control-mono)" }}
          >
            Direction 02  Control room
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white">
            Skill triage
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            A scan-first system for operators who want to inspect skills like
            infrastructure, not like marketing tiles.
          </p>

          <div className="mt-8 space-y-2">
            {[
              "Overview",
              "High-confidence skills",
              "Needs review",
              "English-first ranking",
              "Repo-backed only",
              "Recent changes",
            ].map((item, index) => (
              <div
                key={item}
                className={`rounded-[1.15rem] px-4 py-3 text-sm ${
                  index === 0
                    ? "bg-cyan-300/10 text-cyan-100"
                    : "text-slate-300 hover:bg-white/4"
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-white/8 bg-black/20 p-4">
            <div
              className="text-[10px] uppercase tracking-[0.28em] text-slate-400"
              style={{ fontFamily: "var(--font-control-mono)" }}
            >
              Safety rules
            </div>
            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <p>- Community rating is separate from external signals.</p>
              <p>- Sparse skills are ranked lower, not hidden.</p>
              <p>- Non-English entries lose placement weight.</p>
            </div>
          </div>
        </aside>

        <div className="space-y-3">
          <section className="rounded-xl border border-white/8 bg-[linear-gradient(180deg,#0b1628,#08121f)] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-4">
                <div
                  className="text-[11px] uppercase tracking-[0.34em] text-cyan-100/70"
                  style={{ fontFamily: "var(--font-control-mono)" }}
                >
                  Ops-style homepage concept
                </div>
                <h3 className="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-white">
                  The most trustworthy install-decision console for AI agent
                  skills.
                </h3>
                <p className="max-w-2xl text-sm leading-7 text-slate-300">
                  Built for operators and technical buyers who want to filter by
                  evidence, rank by confidence, and inspect where every signal
                  comes from before installing anything.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[28rem]">
                {[
                  ["4.7", "best live rating"],
                  ["2.4k", "highest GitHub stars"],
                  ["84", "top safety score"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-[1.35rem] border border-white/8 bg-white/4 p-4"
                  >
                    <div
                      className="text-[10px] uppercase tracking-[0.28em] text-slate-400"
                      style={{ fontFamily: "var(--font-control-mono)" }}
                    >
                      {label}
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-white">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/8 bg-[#091626] p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div
                  className="text-[11px] uppercase tracking-[0.34em] text-slate-400"
                  style={{ fontFamily: "var(--font-control-mono)" }}
                >
                  Browse / listing concept
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Search-first table, not decorative cards
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {prototypeFilters.map((filter) => (
                  <span
                    key={filter}
                    className="rounded-full border border-white/10 bg-white/4 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-300"
                  >
                    {filter}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-white/8">
              <div
                className="grid grid-cols-[1.7fr_0.7fr_0.7fr_0.7fr_0.9fr] gap-3 bg-white/4 px-4 py-3 text-[10px] uppercase tracking-[0.28em] text-slate-400"
                style={{ fontFamily: "var(--font-control-mono)" }}
              >
                <span>Skill</span>
                <span>SkillJury</span>
                <span>External</span>
                <span>Safety</span>
                <span>Signals</span>
              </div>
              {prototypeSkills.map((skill, index) => (
                <div
                  key={skill.name}
                  className={`grid grid-cols-[1.7fr_0.7fr_0.7fr_0.7fr_0.9fr] gap-3 border-t border-white/6 px-4 py-4 text-sm ${
                    index > 3 ? "bg-[#08111d] text-slate-400" : "bg-[#0c182a] text-white"
                  }`}
                >
                  <div>
                    <div className="font-semibold">{skill.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {skill.source}  {skill.category}
                    </div>
                  </div>
                  <div>{skill.rating}/5</div>
                  <div>{skill.stars}</div>
                  <div>{skill.safety}</div>
                  <div>{skill.installs} weekly</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-white/8 bg-[#091626] p-5">
            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.6rem] border border-white/8 bg-[#0c182a] p-5">
                <div
                  className="text-[11px] uppercase tracking-[0.34em] text-slate-400"
                  style={{ fontFamily: "var(--font-control-mono)" }}
                >
                  Skill detail / inspector concept
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-cyan-300/25 bg-cyan-300/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100">
                    {prototypeSkillDetail.name}
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                    {prototypeSkillDetail.lastUpdated}
                  </div>
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">
                  {prototypeSkillDetail.summary}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {prototypeSkillDetail.quickFacts.map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-[1.2rem] border border-white/8 bg-black/20 p-4"
                    >
                      <div
                        className="text-[10px] uppercase tracking-[0.26em] text-slate-400"
                        style={{ fontFamily: "var(--font-control-mono)" }}
                      >
                        {label}
                      </div>
                      <div className="mt-3 text-sm font-medium text-white">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.4rem] border border-white/8 bg-black/20 p-4">
                  <div
                    className="text-[10px] uppercase tracking-[0.26em] text-slate-400"
                    style={{ fontFamily: "var(--font-control-mono)" }}
                  >
                    Install command
                  </div>
                  <code className="mt-3 block text-sm leading-7 text-cyan-100">
                    {prototypeSkillDetail.installCommand}
                  </code>
                </div>
              </div>

              <div className="grid gap-5">
                <div className="rounded-[1.6rem] border border-cyan-400/14 bg-[linear-gradient(180deg,#08111d,#0c182a)] p-5">
                  <div
                    className="text-[11px] uppercase tracking-[0.34em] text-cyan-100/80"
                    style={{ fontFamily: "var(--font-control-mono)" }}
                  >
                    Safety meter
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-[0.46fr_0.54fr] lg:items-start">
                    <div>
                      <div className="text-6xl font-semibold leading-none tracking-[-0.05em] text-white">
                        84
                      </div>
                      <div className="mt-2 text-sm uppercase tracking-[0.24em] text-cyan-100">
                        High confidence
                      </div>
                    </div>
                    <div className="space-y-3">
                      {prototypeSkillDetail.safetyChecks.map(([check, status]) => (
                        <div
                          key={check}
                          className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-white/4 px-3 py-2 text-sm"
                        >
                          <span>{check}</span>
                          <span className="text-cyan-100">{status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-white/8 bg-[#0c182a] p-5">
                  <div
                    className="text-[11px] uppercase tracking-[0.34em] text-slate-400"
                    style={{ fontFamily: "var(--font-control-mono)" }}
                  >
                    Review log
                  </div>
                  <div className="mt-4 space-y-3">
                    {prototypeSkillDetail.reviewHighlights.map((review) => (
                      <div
                        key={review.author}
                        className="rounded-[1.15rem] border border-white/8 bg-black/20 p-4"
                      >
                        <p className="text-sm leading-7 text-slate-200">
                          {review.body}
                        </p>
                        <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                          {review.author}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
