#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import { PLUGINS_SRC_DIR } from "./constants.mjs";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

function validatePluginName(name) {
  const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return kebabCaseRegex.test(name);
}

async function main() {
  console.log("\n🔨 Creating a new AINE plugin\n");

  // Get plugin name
  let pluginName = "";
  while (!pluginName || !validatePluginName(pluginName)) {
    pluginName = await question(
      "Plugin name (kebab-case, e.g., my-plugin): "
    );
    if (!validatePluginName(pluginName)) {
      console.log("❌ Invalid plugin name. Use kebab-case (lowercase, hyphens only).");
      pluginName = "";
    }
  }

  // Get description
  let description = "";
  while (!description) {
    description = await question("Plugin description: ");
    if (description.length < 10) {
      console.log("❌ Description must be at least 10 characters.");
      description = "";
    }
  }

  rl.close();

  const pluginPath = path.join(PLUGINS_SRC_DIR, pluginName);

  // Check if plugin already exists
  if (fs.existsSync(pluginPath)) {
    console.error(`\n❌ Plugin directory already exists: ${pluginPath}`);
    process.exit(1);
  }

  try {
    // Create directory structure
    console.log(`\n📁 Creating plugin directories for "${pluginName}"...`);
    fs.mkdirSync(pluginPath, { recursive: true });
    fs.mkdirSync(path.join(pluginPath, "agents"), { recursive: true });
    fs.mkdirSync(path.join(pluginPath, "prompts"), { recursive: true });
    fs.mkdirSync(path.join(pluginPath, "templates"), { recursive: true });

    // Create plugin.json
    const pluginJson = {
      name: pluginName,
      description: description,
      version: "0.0.1",
      keywords: ["github-copilot", "agents"],
    };

    fs.writeFileSync(
      path.join(pluginPath, "plugin.json"),
      JSON.stringify(pluginJson, null, 2) + "\n",
      "utf8"
    );
    console.log(`   ✅ Created plugin.json`);

    // Create README.md
    const readmeContent = `# ${pluginName}

${description}

---

## Agents

<!-- Document your agents here. -->

---

## Skills (Slash Commands)

<!-- Document your skills here. These are invoked as slash commands inside any agent conversation. -->

---

## VS Code Documentation

For more information on Agent Plugins, see the official VS Code documentation:  
https://code.visualstudio.com/docs/copilot/customization/agent-plugins
`;

    fs.writeFileSync(
      path.join(pluginPath, "README.md"),
      readmeContent,
      "utf8"
    );
    console.log(`   ✅ Created README.md`);

    console.log(`\n✅ Plugin structure created successfully!\n`);
    console.log(`📍 Location: ${pluginPath}`);
    console.log(`\nNext steps:`);
    console.log(`  1. Add agents to src/${pluginName}/agents/`);
    console.log(`  2. Add skills to src/${pluginName}/skills/`);
    console.log(`  3. Add templates to src/${pluginName}/templates/`);
    console.log(`  4. Update src/${pluginName}/README.md with plugin details`);
    console.log(`  5. Run \`npm run build\` to build the plugin\n`);
  } catch (error) {
    console.error(`\n❌ Error creating plugin: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
});
