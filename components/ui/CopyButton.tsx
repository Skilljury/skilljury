"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for insecure contexts / iframe restrictions
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-secondary px-4 py-2 text-xs font-medium tracking-[0.16em] text-muted-foreground transition-default hover:border-primary/20 hover:text-foreground"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
