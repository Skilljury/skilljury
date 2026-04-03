type OptionalDetailFieldsProps = {
  agents: Array<{
    name: string;
    slug: string;
  }>;
};

function RatingSelect({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <select
        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
        defaultValue=""
        name={name}
      >
        <option value="">Skip</option>
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>
            {value}/5
          </option>
        ))}
      </select>
    </label>
  );
}

export function OptionalDetailFields({ agents }: OptionalDetailFieldsProps) {
  return (
    <details className="rounded-[1.5rem] border border-border bg-background/70 p-5">
      <summary className="cursor-pointer text-sm font-semibold text-foreground">
        Add more detail
      </summary>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <RatingSelect label="Setup rating" name="setupRating" />
        <RatingSelect label="Documentation rating" name="documentationRating" />
        <RatingSelect label="Output quality rating" name="outputQualityRating" />
        <RatingSelect label="Reliability rating" name="reliabilityRating" />
        <RatingSelect label="Value for effort" name="valueForEffortRating" />

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Agent used</span>
          <select
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            defaultValue=""
            name="agentSlug"
          >
            <option value="">Skip</option>
            {agents.map((agent) => (
              <option key={agent.slug} value={agent.slug}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Use case</span>
          <input
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            name="useCase"
            placeholder="Example: audit metadata, generate docs, write cover letters"
            type="text"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Experience level</span>
          <select
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            defaultValue=""
            name="experienceLevel"
          >
            <option value="">Skip</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-medium text-foreground">Review title</span>
          <input
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            name="reviewTitle"
            placeholder="Optional headline for your review"
            type="text"
          />
        </label>

        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-medium text-foreground">Review body</span>
          <textarea
            className="min-h-32 rounded-[1.25rem] border border-border bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            name="reviewBody"
            placeholder="Add more context about how the skill performed in practice."
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Proof of use type</span>
          <select
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            defaultValue=""
            name="proofOfUseType"
          >
            <option value="">Skip</option>
            <option value="url">URL</option>
            <option value="text">Text note</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Proof of use</span>
          <input
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/30 focus:ring-4 focus:ring-primary/10"
            name="proofOfUseUrl"
            placeholder="Link or short note"
            type="text"
          />
        </label>
      </div>
    </details>
  );
}
