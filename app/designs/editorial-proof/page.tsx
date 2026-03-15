import { Cormorant_Garamond, Manrope } from "next/font/google";

import {
  prototypeSkillDetail,
  prototypeSkills,
} from "@/components/designs/prototype-data";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-editorial-dark-display",
  weight: ["500", "600", "700"],
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-editorial-dark-body",
  weight: ["400", "500", "600", "700"],
});

export default function EditorialProofPrototypePage() {
  return (
    <div
      className={`${displayFont.variable} ${bodyFont.variable} rounded-[2.75rem] bg-[#0a0908] p-4 text-[#f5ede3] shadow-[0_40px_120px_rgba(0,0,0,0.46)] sm:p-6`}
      style={{ fontFamily: "var(--font-editorial-dark-body)" }}
    >
      <div className="space-y-8">
        <section className="rounded-[2.4rem] border border-[#3a3027] bg-[radial-gradient(circle_at_top_left,rgba(199,145,87,0.12),transparent_24%),linear-gradient(180deg,#12100e,#090807)] px-6 py-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_0.3fr]">
            <div className="space-y-6">
              <div className="text-[11px] uppercase tracking-[0.34em] text-[#c89f70]">
                Direction 01  Editorial proof
              </div>
              <h2
                className="max-w-5xl text-6xl leading-[0.88] tracking-tight sm:text-7xl"
                style={{ fontFamily: "var(--font-editorial-dark-display)" }}
              >
                A dark editorial review journal for AI skills.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-[#d9c7b3]">
                This version makes SkillJury feel like a serious long-form
                publication. Featured skills read like cover stories. Lower-rank
                skills fall into digest treatment instead of pretending to be
                equally important.
              </p>
            </div>

            <div className="space-y-3">
              {[
                ["4,000+", "cataloged skills"],
                ["26", "featured reviews"],
                ["88%", "would recommend"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[1.4rem] border border-[#3a3027] bg-black/20 p-4"
                >
                  <div className="text-[10px] uppercase tracking-[0.26em] text-[#c89f70]">
                    {label}
                  </div>
                  <div
                    className="mt-3 text-4xl leading-none"
                    style={{ fontFamily: "var(--font-editorial-dark-display)" }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.62fr_0.38fr]">
          <article className="rounded-[2.2rem] border border-[#2d2620] bg-[#11100f] p-6 lg:p-8">
            <div className="text-[11px] uppercase tracking-[0.34em] text-[#c89f70]">
              Homepage / feature story
            </div>
            <div className="mt-6 grid gap-8 lg:grid-cols-[0.94fr_0.06fr_0.5fr]">
              <div className="space-y-5">
                <div className="text-xs uppercase tracking-[0.22em] text-[#9f8b77]">
                  {prototypeSkills[0].source}  {prototypeSkills[0].category}
                </div>
                <h3
                  className="text-6xl leading-[0.9] tracking-tight"
                  style={{ fontFamily: "var(--font-editorial-dark-display)" }}
                >
                  {prototypeSkills[0].name}
                </h3>
                <p className="text-base leading-8 text-[#d9c7b3]">
                  {prototypeSkills[0].summary}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ["SkillJury", `${prototypeSkills[0].rating}/5`],
                    ["GitHub", prototypeSkills[0].stars],
                    ["Safety", prototypeSkills[0].safety],
                  ].map(([label, value]) => (
                    <div key={label} className="border-t border-[#2d2620] pt-4">
                      <div className="text-[10px] uppercase tracking-[0.24em] text-[#9f8b77]">
                        {label}
                      </div>
                      <div className="mt-2 text-lg font-semibold text-[#f5ede3]">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden h-full w-px bg-[#2d2620] lg:block" />

              <div className="space-y-4 rounded-xl border border-[#2d2620] bg-black/20 p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#c89f70]">
                  Editorial note
                </div>
                <p className="text-sm leading-7 text-[#d9c7b3]">
                  Strong enough to feature because public repo signals,
                  maintenance cadence, install demand, and user sentiment all
                  support the same conclusion.
                </p>
                <blockquote className="border-l border-[#c89f70] pl-4 text-sm leading-7 text-[#f5ede3]">
                  “A cover-story layout works here because the point is not just
                  to list skills. It is to help people judge whether a skill
                  deserves trust.”
                </blockquote>
              </div>
            </div>
          </article>

          <aside className="rounded-[2.2rem] border border-[#2d2620] bg-[#11100f] p-6">
            <div className="text-[11px] uppercase tracking-[0.34em] text-[#c89f70]">
              Browse / digest
            </div>
            <div className="mt-4 text-4xl leading-[0.94]" style={{ fontFamily: "var(--font-editorial-dark-display)" }}>
              Ranked briefs
            </div>
            <div className="mt-5 space-y-4">
              {prototypeSkills.slice(1, 5).map((skill, index) => (
                <div key={skill.name} className="border-t border-[#2d2620] pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-[#f5ede3]">
                      {String(index + 2).padStart(2, "0")}  {skill.name}
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[#9f8b77]">
                      {skill.rating}/5
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#d9c7b3]">
                    {skill.summary}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-[2.2rem] border border-[#2d2620] bg-[#11100f] p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[0.58fr_0.42fr]">
            <div className="space-y-5">
              <div className="text-[11px] uppercase tracking-[0.34em] text-[#c89f70]">
                Skill detail / article mode
              </div>
              <h3
                className="text-6xl leading-[0.9] tracking-tight"
                style={{ fontFamily: "var(--font-editorial-dark-display)" }}
              >
                {prototypeSkillDetail.name}
              </h3>
              <p className="max-w-3xl text-base leading-8 text-[#d9c7b3]">
                {prototypeSkillDetail.summary}
              </p>
              <div className="space-y-4">
                {prototypeSkillDetail.reviewHighlights.map((review) => (
                  <div
                    key={review.author}
                    className="rounded-[1.6rem] border border-[#2d2620] bg-black/20 p-5"
                  >
                    <p className="text-sm leading-7 text-[#f5ede3]">{review.body}</p>
                    <div className="mt-3 text-xs uppercase tracking-[0.2em] text-[#9f8b77]">
                      {review.author}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-[1.6rem] border border-[#2d2620] bg-black/20 p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#c89f70]">
                  Quick facts
                </div>
                <div className="mt-4 space-y-3">
                  {prototypeSkillDetail.quickFacts.slice(0, 4).map(([label, value]) => (
                    <div key={label} className="border-b border-[#2d2620] pb-3 text-sm last:border-b-0">
                      <div className="text-[#9f8b77]">{label}</div>
                      <div className="mt-1 font-medium text-[#f5ede3]">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-[#3a3027] bg-[linear-gradient(180deg,#241b14,#17110d)] p-5">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#c89f70]">
                  Safety meter
                </div>
                <div
                  className="mt-3 text-5xl leading-none"
                  style={{ fontFamily: "var(--font-editorial-dark-display)" }}
                >
                  High
                </div>
                <div className="mt-4 space-y-2 text-sm text-[#ebdece]">
                  {prototypeSkillDetail.safetyChecks.slice(0, 4).map(([check, status]) => (
                    <div key={check} className="flex items-center justify-between gap-4">
                      <span>{check}</span>
                      <span className="text-[#c89f70]">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
