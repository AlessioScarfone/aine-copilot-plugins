#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { parseFrontmatter } from "./yaml-parser.mjs";

/**
 * Generate skills from prompt files found in a plugin's src prompts/ folder.
 * For each .prompt.md, creates a skills/{name}/SKILL.md in the plugin dist dir.
 */
function generateSkillsFromPrompts(pluginSrc, pluginDist, pluginName) {
  const promptsDir = path.join(pluginSrc, "prompts");
  if (!fs.existsSync(promptsDir)) return 0;

  const promptFiles = fs
    .readdirSync(promptsDir)
    .filter((f) => f.endsWith(".prompt.md"));

  if (promptFiles.length === 0) return 0;

  const skillsDir = path.join(pluginDist, "skills");
  let converted = 0;

  for (const file of promptFiles) {
    const baseName = file.replace(".prompt.md", "");
    const promptPath = path.join(promptsDir, file);

    const frontmatter = parseFrontmatter(promptPath);
    const content = fs.readFileSync(promptPath, "utf8");

    // Extract content after frontmatter
    const fmMatch = content.match(/^---\n[\s\S]*?\n---\n/);
    const mainContent = fmMatch
      ? content.substring(fmMatch[0].length).trim()
      : content.trim();

    const description =
      frontmatter?.description || `Skill converted from ${file}`;
    const agent = frontmatter?.agent || null;

    const skillFolder = path.join(skillsDir, baseName);
    if (fs.existsSync(skillFolder)) {
      console.log(`   ⚠️  Skill "${baseName}" already exists (from source), skipping generation`);
      continue;
    }
    fs.mkdirSync(skillFolder, { recursive: true });

    const agentLine = agent
      ? `> [!IMPORTANT]\n> This skill is designed to be used with the **${pluginName}:${agent}.agent** agent.\n> Switch to it in the agent selector before invoking this skill for the full interactive experience.\n> If you are already using **${pluginName}:${agent}.agent**, proceed with the workflow below.\n\n`
      : "";
    const skillContent = `---\nname: ${baseName}\ndescription: '${description.replace(/'/g, "'''")}'\n---\n\n${agentLine}${mainContent}\n`;

    fs.writeFileSync(path.join(skillFolder, "SKILL.md"), skillContent, "utf8");
    converted++;
  }

  return converted;
}

export { generateSkillsFromPrompts };
