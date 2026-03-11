import { config } from "dotenv";

config({ path: ".env.local" });

import { runSkillsShSync } from "@/lib/ingestion/syncSkillsSh";

async function main() {
  const summary = await runSkillsShSync({
    trigger: "manual",
  });

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
