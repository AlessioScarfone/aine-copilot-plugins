#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { ROOT_FOLDER, SKILLS_DIR } from "./constants.mjs";
import { parseFrontmatter } from "./yaml-parser.mjs";

const PROMPTS_DIR = path.join(ROOT_FOLDER, "prompts");
/**
 * Convert a prompt file to a skill folder
 * @param {string} promptFilePath - Full path to the prompt file
 * @returns {object} Result with success status and details
 */
function convertPromptToSkill(promptFilePath) {
  const filename = path.basename(promptFilePath);
  const baseName = filename.replace(".prompt.md", "");

  console.log(`\nConverting: ${baseName}`);

  // Parse the prompt file frontmatter
  const frontmatter = parseFrontmatter(promptFilePath);
  const content = fs.readFileSync(promptFilePath, "utf8");

  // Extract the content after frontmatter
  const frontmatterEndMatch = content.match(/^---\n[\s\S]*?\n---\n/);
  const mainContent = frontmatterEndMatch
    ? content.substring(frontmatterEndMatch[0].length).trim()
    : content.trim();

  // Create skill folder
  const skillFolderPath = path.join(SKILLS_DIR, baseName);
  if (fs.existsSync(skillFolderPath)) {
    console.log(`  ⚠️  Skill folder already exists: ${baseName}`);
    return { success: false, reason: "already-exists", name: baseName };
  }

  fs.mkdirSync(skillFolderPath, { recursive: true });

  // Build new frontmatter for SKILL.md
  const skillFrontmatter = {
    name: baseName,
    description: frontmatter?.description || `Skill converted from ${filename}`,
  };

  // Build SKILL.md content
  const skillContent = `---
name: ${skillFrontmatter.name}
description: '${skillFrontmatter.description.replace(/'/g, "'''")}'
---

${mainContent}
`;

  // Write SKILL.md
  const skillFilePath = path.join(skillFolderPath, "SKILL.md");
  fs.writeFileSync(skillFilePath, skillContent, "utf8");

  console.log(`  ✓ Created skill: ${baseName}`);
  return { success: true, name: baseName, path: skillFolderPath };
}
