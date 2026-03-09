#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { DIST_DIR, PLUGINS_SRC_DIR, ROOT_FOLDER } from "./constants.mjs";
import { parseFrontmatter } from "./yaml-parser.mjs";
import { validateSkills } from "./validate-skills.mjs";
import { validatePlugins } from "./validate-plugins.mjs";

const PLUGIN_SUBDIRS = ["agents", "skills", "templates"];
const TEXT_EXTENSIONS = new Set([".md", ".txt", ".json", ".html", ".yaml", ".yml"]);

/**
 * Load variables from a plugin's config.json. Returns an empty object if not found.
 */
function loadPluginConfig(pluginSrc) {
  const configPath = path.join(pluginSrc, "config.json");
  if (!fs.existsSync(configPath)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return raw.variables ?? {};
  } catch {
    console.warn(`   ⚠️  Could not parse config.json in ${pluginSrc}`);
    return {};
  }
}

/**
 * Replace all {VARIABLE_NAME} placeholders in a string.
 */
function applyVariables(content, variables) {
  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    content
  );
}

/**
 * Walk a directory recursively and apply variable substitution to all text files.
 */
function substituteVariablesInDir(dir, variables) {
  if (!fs.existsSync(dir) || Object.keys(variables).length === 0) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      substituteVariablesInDir(fullPath, variables);
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      const original = fs.readFileSync(fullPath, "utf-8");
      const substituted = applyVariables(original, variables);
      if (substituted !== original) {
        fs.writeFileSync(fullPath, substituted, "utf-8");
      }
    }
  }
}

function copyIfExists(src, dest) {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
  }
}

function copyRootFiles(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && entry.name !== "plugin.json") {
      fs.copyFileSync(path.join(src, entry.name), path.join(dest, entry.name));
    }
  }
}

function copySkillTemplates(skillsDir) {
  if (!fs.existsSync(skillsDir)) return;
  
  const skillFolders = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const skillFolder of skillFolders) {
    const skillPath = path.join(skillsDir, skillFolder.name);
    const templatesPath = path.join(skillPath, "templates");
    
    if (fs.existsSync(templatesPath)) {
      const files = fs.readdirSync(templatesPath);
      if (files.length > 0) {
        console.log(`      📋 ${skillFolder.name}: ${files.length} template(s)`);
      }
    }
  }
}

function buildPlugin(pluginName) {
  const src = path.join(PLUGINS_SRC_DIR, pluginName);
  const dest = path.join(DIST_DIR, pluginName);

  fs.mkdirSync(dest, { recursive: true });

  // Copy plugin.json → .github/plugin/plugin.json (required output format)
  const pluginJsonSrc = path.join(src, "plugin.json");
  if (fs.existsSync(pluginJsonSrc)) {
    fs.mkdirSync(path.join(dest, ".github", "plugin"), { recursive: true });
    fs.copyFileSync(pluginJsonSrc, path.join(dest, ".github", "plugin", "plugin.json"));
  }

  // Copy agents, prompts, skills, templates directly from src into dist/{name}/
  for (const subdir of PLUGIN_SUBDIRS) {
    copyIfExists(
      path.join(src, subdir),
      path.join(dest, subdir)
    );
  }

  // Verify that skill templates were copied
  copySkillTemplates(path.join(dest, "skills"));

  // Copy root-level files (e.g. README.md)
  copyRootFiles(src, dest);
}

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
    const skillContent = `---
name: ${baseName}
description: '${description.replace(/'/g, "'''")}'
---

${agentLine}${mainContent}
`;

    fs.writeFileSync(path.join(skillFolder, "SKILL.md"), skillContent, "utf8");
    converted++;
  }

  return converted;
}

/**
 * Update plugin.json in dist with discovered agents and skills.
 */
function generatePluginManifest(pluginDist) {
  const pluginJsonPath = path.join(pluginDist, ".github", "plugin", "plugin.json");
  if (!fs.existsSync(pluginJsonPath)) return;

  const manifest = JSON.parse(fs.readFileSync(pluginJsonPath, "utf-8"));

  // Agents: add "./agents" if the directory exists and has files
  const agentsDir = path.join(pluginDist, "agents");
  if (fs.existsSync(agentsDir)) {
    manifest.agents = ["./agents"];
  } else {
    delete manifest.agents;
  }

  // Skills: list each skill subfolder as "./skills/{name}"
  const skillsDir = path.join(pluginDist, "skills");
  if (fs.existsSync(skillsDir)) {
    const skillFolders = fs
      .readdirSync(skillsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `./skills/${d.name}`);
    if (skillFolders.length > 0) {
      manifest.skills = skillFolders;
    } else {
      delete manifest.skills;
    }
  } else {
    delete manifest.skills;
  }

  fs.writeFileSync(pluginJsonPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
}

function main() {
  console.log("🔨 Building plugins...\n");

  // Step 1: Clean and create dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  console.log("📁 Created dist directory");

  // Step 2: Discover plugins
  if (!fs.existsSync(PLUGINS_SRC_DIR)) {
    console.error("❌ No src/plugins directory found");
    process.exit(1);
  }

  const plugins = fs
    .readdirSync(PLUGINS_SRC_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (plugins.length === 0) {
    console.log("No plugins found in src/plugins/");
    return;
  }

  console.log(`Found ${plugins.length} plugin(s): ${plugins.join(", ")}\n`);

  // Step 3-4: Copy each plugin to dist and generate skills from prompts
  for (const plugin of plugins) {
    console.log(`📦 Copying ${plugin}...`);
    buildPlugin(plugin);
    console.log(`   ✅ ${plugin} → dist/${plugin}`);

    const pluginDist = path.join(DIST_DIR, plugin);
    const pluginSrc = path.join(PLUGINS_SRC_DIR, plugin);
    
    const skillCount = generateSkillsFromPrompts(pluginSrc, pluginDist, plugin);
    if (skillCount > 0) {
      console.log(`   🔄 Generated ${skillCount} skill(s) from prompts`);
    }

    // Copy plugin README.md into the plugin dist folder (falls back to root README.md)
    const pluginReadme = path.join(pluginSrc, "README.md");
    const rootReadme = path.join(ROOT_FOLDER, "README.md");
    const readmeSrc = fs.existsSync(pluginReadme) ? pluginReadme : rootReadme;
    const readmeLabel = fs.existsSync(pluginReadme) ? `src/${plugin}/README.md` : "README.md (root fallback)";
    if (fs.existsSync(readmeSrc)) {
      fs.copyFileSync(readmeSrc, path.join(pluginDist, "README.md"));
      console.log(`   📄 Copied ${readmeLabel} → dist/${plugin}/README.md`);
    }

    // Apply variable substitutions from config.json (after all files are in place)
    const variables = loadPluginConfig(pluginSrc);
    if (Object.keys(variables).length > 0) {
      substituteVariablesInDir(pluginDist, variables);
      const varList = Object.entries(variables).map(([k, v]) => `${k}=${v}`).join(", ");
      console.log(`   🔧 Applied variables: ${varList}`);
    }
  }

  // Step 5: Validate skills and plugins
  for (const plugin of plugins) {
    const skillsDir = path.join(DIST_DIR, plugin, "skills");
    console.log(`\n🔄 Validating skills for ${plugin}...`);
    const skillsValid = validateSkills(skillsDir);
    if (!skillsValid) {
      console.error(`❌ Skill validation failed for ${plugin}`);
      process.exit(1);
    }

    console.log(`\n📝 Updating plugin.json manifest for ${plugin}...`);
    generatePluginManifest(path.join(DIST_DIR, plugin));
  }

  console.log("\n🔄 Validating plugins...");
  const pluginsValid = validatePlugins(DIST_DIR);
  if (!pluginsValid) {
    console.error("❌ Plugin validation failed");
    process.exit(1);
  }

  console.log("\n🎉 Build complete!");
}

main();
