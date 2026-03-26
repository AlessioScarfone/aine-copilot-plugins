#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import prompts from "prompts";
import { PLUGINS_DIST_DIR } from "./constants.mjs";
import { fileURLToPath } from "url";

// Parse CLI args with Node's built-in util.parseArgs
import { parseArgs } from "util";

const { values: args } = parseArgs({
  options: {
    json: { type: "boolean", short: "j", default: false },
    all: { type: "boolean", short: "a", default: false },
    plugin: { type: "string", short: "p" },
    skill: { type: "string", short: "s" },
  },
  strict: false,
});

// Sentinel value used when user picks "All skills" from the interactive menu
const ALL_SKILLS = "__all__";

export function getPlugins(baseDir = PLUGINS_DIST_DIR) {
  if (!fs.existsSync(baseDir)) {
    console.error(`❌ Dist directory not found: ${baseDir}`);
    console.error("   Run `npm run build` first.");
    process.exit(1);
  }
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function getSkills(pluginName, baseDir = PLUGINS_DIST_DIR) {
  const skillsDir = path.join(baseDir, pluginName, "skills");
  if (!fs.existsSync(skillsDir)) return [];
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/** Run tessl on a single skill and always return parsed JSON. */
function reviewSkill(pluginName, skillName) {
  const skillPath = path.join(
    "dist",
    "plugins",
    pluginName,
    "skills",
    skillName,
  );
  const cmd = `npx tessl skill review ${skillPath} --json`;
  try {
    const output = execSync(cmd, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { skillName, success: true, data: JSON.parse(output) };
  } catch (err) {
    // tessl writes JSON to stdout even on non-zero exit (review failure)
    const raw = err.stdout ?? "";
    try {
      return { skillName, success: false, data: JSON.parse(raw) };
    } catch {
      return { skillName, success: false, data: null, error: err.message };
    }
  }
}

/** Determine the pass/fail status of a single review result. */
export function isPassed(result) {
  if (!result.data) return false;
  return result.data.validation?.overallPassed === true;
}

/** Print the aggregated summary table for all-skills mode. */
function printAggregateSummary(pluginName, results) {
  const maxLen = Math.max(...results.map((r) => r.skillName.length));

  console.log(
    `\n📦 Plugin: ${pluginName}  (${results.length} skill${results.length !== 1 ? "s" : ""})\n`,
  );
  console.log(
    `  ${"Skill".padEnd(maxLen)}  Score  Valid  Desc   Content  Status`,
  );
  console.log("  " + "─".repeat(maxLen + 40));

  let totalScore = 0;
  let passedCount = 0;

  for (const r of results) {
    const d = r.data;
    const score = d?.review?.reviewScore ?? "N/A";
    const valid = d?.validation?.overallPassed ? "✅" : "❌";
    const desc =
      d?.descriptionJudge?.normalizedScore != null
        ? d.descriptionJudge.normalizedScore.toFixed(2)
        : " N/A";
    const content =
      d?.contentJudge?.normalizedScore != null
        ? d.contentJudge.normalizedScore.toFixed(2)
        : " N/A";
    const passed = isPassed(r);
    const status = passed ? "✅ pass" : "❌ fail";

    if (passed) passedCount++;
    if (typeof score === "number") totalScore += score;

    console.log(
      `  ${r.skillName.padEnd(maxLen)}  ${String(score).padStart(3)}    ${valid}    ${String(desc).padStart(4)}   ${String(content).padStart(5)}    ${status}`,
    );
  }

  const avgScore =
    results.length > 0 ? (totalScore / results.length).toFixed(1) : "N/A";
  const failedCount = results.length - passedCount;

  console.log("\n  " + "─".repeat(maxLen + 40));
  console.log(
    `  Total: ${results.length}   ✅ Passed: ${passedCount}   ❌ Failed: ${failedCount}   Avg score: ${avgScore}\n`,
  );
}

/** Build the aggregated output object for all-skills mode. Pure — no side effects. */
export function buildAggregateOutput(pluginName, results) {
  const passedCount = results.filter(isPassed).length;
  const scores = results
    .map((r) => r.data?.review?.reviewScore)
    .filter((s) => typeof s === "number");
  const avgScore =
    scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;

  return {
    plugin: pluginName,
    summary: {
      total: results.length,
      passed: passedCount,
      failed: results.length - passedCount,
      averageReviewScore:
        avgScore !== null ? Math.round(avgScore * 10) / 10 : null,
    },
    skills: results.map((r) => ({
      skillName: r.skillName,
      success: r.success,
      reviewScore: r.data?.review?.reviewScore ?? null,
      validationPassed: r.data?.validation?.overallPassed ?? null,
      errorCount: r.data?.validation?.errorCount ?? null,
      warningCount: r.data?.validation?.warningCount ?? null,
      descriptionScore: r.data?.descriptionJudge?.normalizedScore ?? null,
      contentScore: r.data?.contentJudge?.normalizedScore ?? null,
      full: r.data,
    })),
  };
}

/** Print the aggregated JSON for all-skills mode. */
function printAggregateJson(pluginName, results) {
  console.log(
    JSON.stringify(buildAggregateOutput(pluginName, results), null, 2),
  );
}

async function main() {
  const plugins = getPlugins();

  if (plugins.length === 0) {
    console.error(
      "❌ No plugins found in dist/plugins. Run `npm run build` first.",
    );
    process.exit(1);
  }

  // Resolve plugin
  let pluginName = args.plugin;
  if (pluginName && !plugins.includes(pluginName)) {
    console.error(`❌ Plugin "${pluginName}" not found in dist/plugins.`);
    process.exit(1);
  }

  if (!pluginName) {
    const response = await prompts(
      {
        type: "select",
        name: "plugin",
        message: "Select a plugin:",
        choices: plugins.map((p) => ({ title: p, value: p })),
      },
      { onCancel: () => process.exit(0) },
    );
    pluginName = response.plugin;
  }

  // Resolve skill(s)
  const skills = getSkills(pluginName);
  if (skills.length === 0) {
    console.error(`❌ No skills found for plugin "${pluginName}".`);
    process.exit(1);
  }

  // --all flag or interactive "All skills" selection
  let skillName = args.skill;

  if (skillName && skillName !== ALL_SKILLS && !skills.includes(skillName)) {
    console.error(
      `❌ Skill "${skillName}" not found in plugin "${pluginName}".`,
    );
    process.exit(1);
  }

  if (!skillName && !args.all) {
    const response = await prompts(
      {
        type: "select",
        name: "skill",
        message: `Select a skill from "${pluginName}":`,
        choices: [
          { title: "⚡ All skills", value: ALL_SKILLS },
          ...skills.map((s) => ({ title: s, value: s })),
        ],
      },
      { onCancel: () => process.exit(0) },
    );
    skillName = response.skill;
  }

  // ── All-skills mode ──────────────────────────────────────────────────────
  if (args.all || skillName === ALL_SKILLS) {
    if (!args.json) {
      console.log(
        `\n🔍 Reviewing all ${skills.length} skills in "${pluginName}"...\n`,
      );
    }

    const results = [];
    for (const skill of skills) {
      if (!args.json) process.stdout.write(`  Reviewing ${skill}... `);
      const result = reviewSkill(pluginName, skill);
      results.push(result);
      if (!args.json) {
        console.log(isPassed(result) ? "✅" : "❌");
      }
    }

    if (args.json) {
      printAggregateJson(pluginName, results);
    } else {
      printAggregateSummary(pluginName, results);
    }

    const anyFailed = results.some((r) => !isPassed(r));
    process.exit(anyFailed ? 1 : 0);
  }

  // ── Single-skill mode ────────────────────────────────────────────────────
  const skillPath = path.join(
    "dist",
    "plugins",
    pluginName,
    "skills",
    skillName,
  );
  const jsonFlag = args.json ? " --json" : "";
  const cmd = `npx tessl skill review ${skillPath}${jsonFlag}`;

  console.log(`\n🔍 Running: ${cmd}\n`);

  try {
    execSync(cmd, { stdio: "inherit" });
  } catch {
    // tessl may exit with non-zero on review failures — let its output speak
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
