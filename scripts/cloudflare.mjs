import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const [action, stage = "preview"] = process.argv.slice(2);
if (!["build", "deploy", "preview"].includes(action) || !["preview", "production"].includes(stage)) {
  throw new Error("Use cloudflare.mjs build|deploy|preview preview|production");
}
const config = stage === "production" ? "wrangler.production.jsonc" : "wrangler.jsonc";
const site = JSON.parse(readFileSync("config/site-public.json", "utf8"));
const env = {
  ...process.env,
  NEXT_PUBLIC_SITE_URL: site.siteUrl,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: stage === "production" ? site.gaMeasurementId : "",
  NEXT_PUBLIC_DEPLOYMENT_STAGE: stage,
};
function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env, shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
if (action !== "build") {
  const builtStage = readFileSync(".open-next/deployment-stage", "utf8").trim();
  if (builtStage !== stage) throw new Error(`Build ${stage} before ${action}; existing build is ${builtStage}.`);
}
run("npx", ["opennextjs-cloudflare", action, "--config", config]);
if (action === "build") run(process.execPath, ["scripts/prepare-cloudflare-env.mjs", stage]);
