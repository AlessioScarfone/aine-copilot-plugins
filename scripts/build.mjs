#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PLUGINS_DIST_DIR, PLUGINS_SRC_DIR, ROOT_FOLDER } from "./constants.mjs";
import { generateSkillsFromPrompts } from "./generate-skills-from-prompts.mjs";
import { validateSkills } from "./validate-skills.mjs";
import { validatePlugins } from "./validate-plugins.mjs";

const PLUGIN_SUBDIRS = ["agents", "skills", "references"];
const TEXT_EXTENSIONS = new Set([".md", ".txt", ".json", ".html", ".yaml", ".yml"]);

/**
 * Load config from a plugin's config.json. Returns { variables, sharedAssets }.
 * Returns { variables: {}, sharedAssets: [] } if not found.
 */
function loadPluginConfig(pluginSrc) {
  const configPath = path.join(pluginSrc, "config.json");
  if (!fs.existsSync(configPath)) return { variables: {}, sharedAssets: [] };
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return {
      variables: raw.variables ?? {},
      sharedAssets: raw.sharedAssets ?? []
    };
  } catch {
    console.warn(`   ⚠️  Could not parse config.json in ${pluginSrc}`);
    return { variables: {}, sharedAssets: [] };
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
 * Process @embed directives in a markdown string.
 * Replaces <!-- @embed relative/path --> with the file contents, relative to fileDir.
 * If the target file does not exist, the directive is left unchanged and a warning is emitted.
 *
 * @param {string} content - Source text potentially containing @embed directives
 * @param {string} fileDir - Absolute directory of the file being processed (used to resolve paths)
 * @returns {string} Content with all resolvable @embed directives expanded inline
 */
function processEmbeds(content, fileDir) {
  return content.replace(/<!--\s*@embed\s+(\S+)\s*-->/g, (match, relativePath) => {
    const targetPath = path.resolve(fileDir, relativePath);
    if (!fs.existsSync(targetPath)) {
      console.warn(`   ⚠️  @embed target not found: ${relativePath} (in ${fileDir})`);
      return match;
    }
    return fs.readFileSync(targetPath, "utf-8");
  });
}

/**
 * Walk a directory recursively and process @embed directives in all text files.
 */
function processEmbedsInDir(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      processEmbedsInDir(fullPath);
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      const original = fs.readFileSync(fullPath, "utf-8");
      const processed = processEmbeds(original, path.dirname(fullPath));
      if (processed !== original) {
        fs.writeFileSync(fullPath, processed, "utf-8");
      }
    }
  }
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
    // Do not copy plugin.json (handled separately) or config.json (should not be bundled)
    if (entry.isFile() && entry.name !== "plugin.json" && entry.name !== "config.json") {
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
  const dest = path.join(PLUGINS_DIST_DIR, pluginName);

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
 * Copy shared assets from the plugin's shared-assets/ folder to individual skills based on sharedAssets config.
 * Source: <pluginSrc>/shared-assets/<asset>
 * Dest: <pluginDist>/skills/<skill>/assets/<asset>
 * Supports wildcard "*" to copy to all skills.
 * Local wins: does not overwrite if the destination already exists.
 */
function copySharedAssetsToSkills(pluginSrc, pluginDist, sharedAssets) {
  if (!Array.isArray(sharedAssets) || sharedAssets.length === 0) return;

  const assetsDir = path.join(pluginSrc, "shared-assets");
  if (!fs.existsSync(assetsDir)) return;

  const skillsDir = path.join(pluginDist, "skills");
  if (!fs.existsSync(skillsDir)) return;

  // Get all available skill folders
  const allSkills = fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const { asset, skills } of sharedAssets) {
    const assetSrc = path.join(assetsDir, asset);
    if (!fs.existsSync(assetSrc)) {
      console.log(`      ⚠️  Shared asset not found: assets/${asset}`);
      continue;
    }

    // Resolve target skills: "*" means all skills
    const targetSkills = skills.includes("*") ? allSkills : skills;

    for (const skill of targetSkills) {
      const skillPath = path.join(skillsDir, skill);
      if (!fs.existsSync(skillPath)) {
        console.log(`      ⚠️  Skill "${skill}" not found, skipping asset "${asset}"`);
        continue;
      }

      // Drop the "assets" intermediate folder: copy directly into skill root
      const assetDest = path.join(skillPath, asset);

      // Local wins: skip if destination already exists
      if (fs.existsSync(assetDest)) {
        console.log(`      ⏭️  Skipped ${skill}/${asset} (local file exists, local wins)`);
        continue;
      }

      // Create parent directories
      fs.mkdirSync(path.dirname(assetDest), { recursive: true });

      // Copy asset (file or directory)
      const stat = fs.statSync(assetSrc);
      if (stat.isDirectory()) {
        fs.cpSync(assetSrc, assetDest, { recursive: true });
      } else {
        fs.copyFileSync(assetSrc, assetDest);
      }

      console.log(`      📦 Copied ${skill}/${asset}`);
    }
  }
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
  if (fs.existsSync(PLUGINS_DIST_DIR)) {
    fs.rmSync(PLUGINS_DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(PLUGINS_DIST_DIR, { recursive: true });
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

    const pluginDist = path.join(PLUGINS_DIST_DIR, plugin);
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

    // Load config and copy shared assets before applying variable substitutions
    const config = loadPluginConfig(pluginSrc);
    const { variables, sharedAssets } = config;

    if (sharedAssets.length > 0) {
      console.log(`   📦 Distributing shared assets...`);
      copySharedAssetsToSkills(pluginSrc, pluginDist, sharedAssets);
    }

    // Process @embed directives (after all files are in place)
    processEmbedsInDir(pluginDist);

    // Apply variable substitutions from config.json (after all files are in place, including shared assets)
    if (Object.keys(variables).length > 0) {
      substituteVariablesInDir(pluginDist, variables);
      const varList = Object.entries(variables).map(([k, v]) => `${k}=${v}`).join(", ");
      console.log(`   🔧 Applied variables: ${varList}`);
    }
  }

  // Step 5: Validate skills and plugins
  for (const plugin of plugins) {
    const skillsDir = path.join(PLUGINS_DIST_DIR, plugin, "skills");
    console.log(`\n🔄 Validating skills for ${plugin}...`);
    const skillsValid = validateSkills(skillsDir);
    if (!skillsValid) {
      console.error(`❌ Skill validation failed for ${plugin}`);
      process.exit(1);
    }

    console.log(`\n📝 Updating plugin.json manifest for ${plugin}...`);
    generatePluginManifest(path.join(PLUGINS_DIST_DIR, plugin));
  }

  console.log("\n🔄 Validating plugins...");
  const pluginsValid = validatePlugins(PLUGINS_DIST_DIR);
  if (!pluginsValid) {
    console.error("❌ Plugin validation failed");
    process.exit(1);
  }

  console.log("\n🎉 Build complete!");
}

export {
  applyVariables,
  loadPluginConfig,
  substituteVariablesInDir,
  copyIfExists,
  copyRootFiles,
  copySharedAssetsToSkills,
  generatePluginManifest,
  processEmbeds,
  processEmbedsInDir,
};

// Only run when invoked directly (not when imported by tests)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
