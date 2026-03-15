type SkillJuryBrandProps = {
  showTagline?: boolean;
};

export function SkillJuryMark({
  className = "h-11 w-11",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#F4F1EA" height="52" rx="16" width="52" x="2" y="2" />
      <rect
        height="52"
        rx="16"
        stroke="#0B0C10"
        strokeOpacity="0.08"
        width="52"
        x="2"
        y="2"
      />
      <path
        d="M37 15.5c-1.9-1.95-4.82-2.92-8.76-2.92-5.64 0-9.22 2.53-9.22 6.54 0 3.55 2.36 5.2 6.9 6.08l4.2.82c2.03.4 2.98 1.14 2.98 2.46 0 2.02-2.03 3.34-5.22 3.34-3.28 0-6.14-1.02-8.4-3.04"
        stroke="#07080B"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.5"
      />
      <path
        d="M37 15.5v16.92c0 7.34-4.28 11.42-11.7 11.42-2.9 0-5.44-.6-7.64-1.82"
        stroke="#07080B"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4.5"
      />
      <circle cx="39.75" cy="14.25" fill="#8FB1FF" r="2.4" />
    </svg>
  );
}

export function SkillJuryBrand({
  showTagline = true,
}: SkillJuryBrandProps) {
  return (
    <>
      <SkillJuryMark className="h-11 w-11 shrink-0 drop-shadow-[0_20px_45px_rgba(0,0,0,0.3)]" />
      <div className="min-w-0">
        <div className="font-display text-xl font-semibold tracking-tight text-white">
          SkillJury
        </div>
        {showTagline ? (
          <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
            Trust-first skill discovery
          </div>
        ) : null}
      </div>
    </>
  );
}
