export const agentDescriptions: Record<string, string> = {
  amp: "Amp-compatible skills are written for teams using the Amp coding-assistant workflow inside real repositories. Expect implementation helpers, debugging guides, refactoring prompts, and development automations that fit an agent working close to the editor and terminal.",
  antigravity:
    "Antigravity skills are grouped around the Antigravity agent workflow and the tasks that ecosystem tends to automate. This page is most useful for developers looking for prompts and helpers that fit code changes, reviews, repo exploration, and day-to-day engineering operations.",
  "claude-code":
    "Claude Code skills are designed for Anthropic's terminal-first coding agent workflow. Developers usually browse this page for repo-aware prompts, debugging helpers, refactoring guidance, setup automations, and other skills that fit command-line software work.",
  clawdbot:
    "OpenClaw-compatible skills are designed for the OpenClaw agent environment and the workflows built around it. This page is especially relevant for developers using OpenClaw for coding, automation, review, or operational tasks that depend on project context and repeatable tool use.",
  cline:
    "Cline skills fit a VS Code-centered agent workflow where the model can inspect files, run commands, and iterate against project context. This page is a useful filter for coding, debugging, review, and automation skills that assume an editor-integrated assistant.",
  codebuddy:
    "Codebuddy skills are aligned with the Codebuddy agent workflow and the repo tasks that platform supports. Browse this page for implementation prompts, code-review helpers, troubleshooting routines, and practical developer automations meant to run with an active coding assistant.",
  codex:
    "Codex skills are built for OpenAI's coding-agent workflow across the terminal, repository context, and tool-driven implementation tasks. Expect software engineering, debugging, refactoring, and research helpers that pair well with an agent editing files and running commands.",
  "command-code":
    "Command Code skills are written for a command-oriented coding workflow where the agent is expected to act inside the project, not just answer questions. This page is suited to developers looking for automation, debugging, implementation, and repo-management helpers.",
  continue:
    "Continue-compatible skills fit the Continue assistant workflow used alongside day-to-day coding tasks in the editor. Expect prompts and utilities for code generation, refactoring, review, and developer workflows that benefit from project-aware context and iterative execution.",
  cursor:
    "Cursor skills are aimed at developers using Cursor as an editor-native coding assistant. This page tends to surface implementation guides, debugging helpers, review prompts, and automation skills that work well when the agent can read and modify repository files directly.",
  "gemini-cli":
    "Gemini CLI skills are organized for a command-line agent workflow centered on coding, analysis, and automation tasks. Developers browsing here should expect repo-aware helpers for implementation, debugging, review, and developer operations that fit a terminal-driven assistant.",
  "github-copilot":
    "GitHub Copilot skills collect workflows that fit Copilot-based coding and repo assistance. This page is useful for developers who want prompts and helpers tailored to implementation, testing, refactoring, documentation, and other tasks commonly handled with Copilot in the loop.",
  goose:
    "Goose-compatible skills are grouped for the Goose agent workflow and the tasks developers typically automate inside that environment. Expect practical helpers for coding, debugging, repository inspection, and execution-oriented work that benefits from an interactive assistant.",
  "kimi-cli":
    "Kimi CLI skills target a terminal-oriented agent workflow for development and automation work. Browse this page for prompts and helpers that fit command-line execution, repo context, software implementation, and investigative tasks handled by a coding assistant.",
  "kiro-cli":
    "Kiro CLI skills are intended for a CLI-based agent setup where the model assists with code, tooling, and workflow execution. Developers will usually find debugging routines, implementation helpers, and repo-aware automations that fit command-driven engineering work.",
  openclaw:
    "OpenClaw skills are collected for the OpenClaw agent runtime and the workflows built around it. This page is especially relevant for developers using OpenClaw for coding, automation, review, or operational tasks that depend on project context and repeatable tool use.",
  opencode:
    "OpenCode skills are written for the OpenCode agent workflow and the code-first tasks that ecosystem supports. Expect software engineering helpers, debugging guides, and execution-oriented prompts that fit an assistant working directly with files, commands, and repository state.",
  pochi:
    "Pochi-compatible skills are grouped around the Pochi agent workflow and the developer tasks it can support. This page is a better fit for prompts and helpers tied to coding, automation, and repository work than for general-purpose content tools.",
  qoder:
    "Qoder skills are aligned with the Qoder agent environment and the development jobs that platform is used to handle. Developers browsing here will mostly find code-focused helpers for implementation, debugging, refactoring, and workflow automation.",
  replit:
    "Replit-compatible skills fit development workflows that run inside Replit's hosted coding environment. This page is useful for skills focused on building, debugging, prototyping, and shipping within browser-based projects where the agent can work against live code context.",
  roo: "Roo skills are intended for the Roo coding-agent workflow and the repo tasks commonly delegated to it. Expect prompts and helpers for implementation, debugging, code review, and automation work that benefits from an assistant operating inside the project.",
  trae: "Trae-compatible skills are grouped for the Trae agent workflow and the development tasks it supports. This page is most useful for developers looking for code-focused prompts, execution helpers, and repo-aware automations that fit an active coding assistant.",
  "trae-cn":
    "Trae CN skills track the China-focused Trae agent workflow and the compatible tasks or prompts surfaced in that ecosystem. Expect coding, automation, and project-context helpers similar to other developer agents, but filtered to the Trae CN compatibility lane.",
  windsurf:
    "Windsurf skills are designed for developers using Windsurf as an AI-assisted coding environment. This page collects skills for implementation, debugging, refactoring, and workflow automation that benefit from an agent working directly with repository context and editor state.",
};

export function getAgentDescription(agentSlug: string) {
  return agentDescriptions[agentSlug] ?? null;
}
