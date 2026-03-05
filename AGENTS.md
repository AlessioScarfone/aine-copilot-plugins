# Plugin Guidelines
- **Declarative content:** Plugin content is specified via agents, commands, and skills arrays in plugin.json — source files live in top-level directories and are materialized into plugins by CI
- **Valid references:** All paths referenced in plugin.json must point to existing source files in the repository
- **Clear purpose:** The plugin should solve a specific problem or workflow
- **Build:** Run npm run build to build the final version of the plugin

# Plugin structure

```
plugins/my-plugin-id/
├── .github/plugin/plugin.json  # Plugin metadata (Claude Code spec format)
└── README.md                   # Plugin documentation
```

**plugin.json example**

```
{
  "name": "my-plugin-id",
  "description": "Plugin description",
  "version": "1.0.0",
  "keywords": [],
  "author": { "name": "Awesome Copilot Community" },
  "repository": "https://github.com/github/awesome-copilot",
  "license": "MIT",
  "agents": ["./agents/my-agent.md"],
  "commands": ["./commands/my-command.md"],
  "skills": ["./skills/my-skill/"]
}
```