import { config } from "dotenv";

config({ path: ".env.local" });

import { runSkillsShSync } from "@/lib/ingestion/syncSkillsSh";

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number.parseInt(limitArg.split("=")[1] ?? "", 10) : undefined;

async function main() {
  const summary = await runSkillsShSync({
    trigger: "manual",
    limit: Number.isNaN(limit ?? Number.NaN) ? undefined : limit,
  });

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
