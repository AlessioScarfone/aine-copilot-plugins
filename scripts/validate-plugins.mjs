#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { PLUGINS_DIST_DIR } from "./constants.mjs";

// Validation functions
function validateName(name, folderName) {
  const errors = [];
  if (!name || typeof name !== "string") {
    errors.push("name is required and must be a string");
    return errors;
  }
  if (name.length < 1 || name.length > 50) {
    errors.push("name must be between 1 and 50 characters");
  }
  if (!/^[a-z0-9-]+$/.test(name)) {
    errors.push("name must contain only lowercase letters, numbers, and hyphens");
  }
  if (name !== folderName) {
    errors.push(`name "${name}" must match folder name "${folderName}"`);
  }
  return errors;
}

function validateDescription(description) {
  if (!description || typeof description !== "string") {
    return "description is required and must be a string";
  }
  if (description.length < 1 || description.length > 500) {
    return "description must be between 1 and 500 characters";
  }
  return null;
}

function validateVersion(version) {
  if (!version || typeof version !== "string") {
    return "version is required and must be a string";
  }
  return null;
}

function validateKeywords(keywords) {
  if (keywords === undefined) return null;
  if (!Array.isArray(keywords)) {
    return "keywords must be an array";
  }
  if (keywords.length > 10) {
    return "maximum 10 keywords allowed";
  }
  for (const keyword of keywords) {
    if (typeof keyword !== "string") {
      return "all keywords must be strings";
    }
    if (!/^[a-z0-9-]+$/.test(keyword)) {
      return `keyword "${keyword}" must contain only lowercase letters, numbers, and hyphens`;
    }
    if (keyword.length < 1 || keyword.length > 30) {
      return `keyword "${keyword}" must be between 1 and 30 characters`;
    }
  }
  return null;
}

function validateSpecPaths(plugin, pluginDir) {
  const errors = [];

  // Validate agents: expects "./agents" pointing to the agents directory
  if (plugin.agents !== undefined) {
    if (!Array.isArray(plugin.agents)) {
      errors.push("agents must be an array");
    } else {
      for (let i = 0; i < plugin.agents.length; i++) {
        const p = plugin.agents[i];
        if (typeof p !== "string") {
          errors.push(`agents[${i}] must be a string`);
          continue;
        }
        if (!p.startsWith("./")) {
          errors.push(`agents[${i}] must start with "./"`);
          continue;
        }
        const agentsDir = path.join(pluginDir, p.slice(2));
        if (!fs.existsSync(agentsDir) || !fs.statSync(agentsDir).isDirectory()) {
          errors.push(`agents[${i}] directory not found: ${p}`);
        }
      }
    }
  }

  // Validate skills: expects "./skills/{name}" pointing to individual skill folders
  if (plugin.skills !== undefined) {
    if (!Array.isArray(plugin.skills)) {
      errors.push("skills must be an array");
    } else {
      for (let i = 0; i < plugin.skills.length; i++) {
        const p = plugin.skills[i];
        if (typeof p !== "string") {
          errors.push(`skills[${i}] must be a string`);
          continue;
        }
        if (!p.startsWith("./skills/")) {
          errors.push(`skills[${i}] must start with "./skills/"`);
          continue;
        }
        const skillFile = path.join(pluginDir, p.slice(2), "SKILL.md");
        if (!fs.existsSync(skillFile)) {
          errors.push(`skills[${i}] SKILL.md not found: ${p}/SKILL.md`);
        }
      }
    }
  }

  return errors;
}

function validatePlugin(pluginDir) {
  const folderName = path.basename(pluginDir);
  const errors = [];

  // Rule 1: Must have .github/plugin/plugin.json
  const pluginJsonPath = path.join(pluginDir, ".github/plugin", "plugin.json");
  if (!fs.existsSync(pluginJsonPath)) {
    errors.push("missing required file: .github/plugin/plugin.json");
    return errors;
  }

  // Rule 2: Must have README.md
  const readmePath = path.join(pluginDir, "README.md");
  if (!fs.existsSync(readmePath)) {
    errors.push("missing required file: README.md");
  }

  // Parse plugin.json
  let plugin;
  try {
    const raw = fs.readFileSync(pluginJsonPath, "utf-8");
    plugin = JSON.parse(raw);
  } catch (err) {
    errors.push(`failed to parse plugin.json: ${err.message}`);
    return errors;
  }

  // Rule 3 & 4: name, description, version
  const nameErrors = validateName(plugin.name, folderName);
  errors.push(...nameErrors);

  const descError = validateDescription(plugin.description);
  if (descError) errors.push(descError);

  const versionError = validateVersion(plugin.version);
  if (versionError) errors.push(versionError);

  // Rule 5: keywords (or tags for backward compat)
  const keywordsError = validateKeywords(plugin.keywords ?? plugin.tags);
  if (keywordsError) errors.push(keywordsError);

  // Rule 6: agents, commands, skills paths
  const specErrors = validateSpecPaths(plugin, pluginDir);
  errors.push(...specErrors);

  return errors;
}

// Main validation function
function validatePlugins(pluginsDir = PLUGINS_DIST_DIR) {
  if (!fs.existsSync(pluginsDir)) {
    console.log("No plugins directory found - validation skipped");
    return true;
  }

  const pluginDirs = fs
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (pluginDirs.length === 0) {
    console.log("No plugin directories found - validation skipped");
    return true;
  }

  console.log(`Validating ${pluginDirs.length} plugins...\n`);

  let hasErrors = false;
  const seenNames = new Set();

  for (const dir of pluginDirs) {
    console.log(`Validating ${dir}...`);

    const errors = validatePlugin(path.join(pluginsDir, dir));

    if (errors.length > 0) {
      console.error(`   ❌ ${dir}:`);
      errors.forEach((e) => console.error(`   - ${e}`));
      hasErrors = true;
    } else {
      console.log(`   ✅ ${dir} is valid`);
    }

    // Rule 10: duplicate names
    if (seenNames.has(dir)) {
      console.error(`   ❌ Duplicate plugin name "${dir}"`);
      hasErrors = true;
    } else {
      seenNames.add(dir);
    }
  }

  if (!hasErrors) {
    console.log(`\n✅ All ${pluginDirs.length} plugins are valid`);
  }

  return !hasErrors;
}

export { validatePlugin, validatePlugins };

// Run validation when executed directly
const isCLI = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(new URL(import.meta.url).pathname);
if (isCLI) {
  try {
    const isValid = validatePlugins();
    if (!isValid) {
      console.error("\n❌ Plugin validation failed");
      process.exit(1);
    }
    console.log("\n🎉 Plugin validation passed");
  } catch (error) {
    console.error(`Error during validation: ${error.message}`);
    process.exit(1);
  }
}
