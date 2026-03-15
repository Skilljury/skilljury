"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      className="inline-flex items-center gap-1.5 rounded border border-border bg-secondary px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground transition-default hover:border-white/20 hover:text-foreground"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
