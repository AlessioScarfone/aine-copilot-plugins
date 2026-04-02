# aine-agents

Specialized engineering agents for existing codebases, plus a guided feature delivery skill that moves from exploration to implementation and review.

## Quick Start

1. Pick the agent that matches the job:
	- `code-explorer` to trace existing features and architecture
	- `code-architect` to design an implementation plan
	- `code-reviewer` to review code for high-confidence issues
2. Run `/feature-dev <request>` when the task needs an end-to-end workflow instead of a one-off edit.

Example requests:

```text
/feature-dev add CSV export to the reporting dashboard
/feature-dev build a new POST /projects endpoint in the existing API
```

## Agents

| Agent | Handle | Purpose |
|---|---|---|
| Code Explorer | `code-explorer` | Traces existing features end-to-end, maps architecture layers, and returns the key files needed to understand a feature area. |
| Code Architect | `code-architect` | Produces implementation blueprints with concrete files to create or modify, component responsibilities, data flow, and build sequence. |
| Code Reviewer | `code-reviewer` | Reviews changes for bugs, logic flaws, security issues, and convention violations, reporting only high-confidence findings. |

## Skills

### `/feature-dev` — Guided Feature Delivery

An end-to-end feature workflow for existing codebases. The skill:

- explores the codebase
- asks clarifying questions before design work starts
- compares multiple implementation approaches with trade-offs
- waits for approval before coding
- runs a review pass before closing out the task

**Use when:**
- adding a new feature to an existing codebase
- implementing a user story or endpoint
- planning how to build something before writing code

**Do not use for:**
- small bug fixes or one-off edits
- pure refactoring work
- tasks that only need a spec or plan without implementation

## Recommended Workflow

1. Start with `/feature-dev <request>` when the request is still ambiguous or architectural choices matter.
2. Let the skill explore the codebase and gather clarifying questions.
3. Choose one of the proposed implementation approaches.
4. Approve implementation only after the scope and trade-offs are clear.

## VS Code Documentation

For more information on Agent Plugins, see the official VS Code documentation:  
https://code.visualstudio.com/docs/copilot/customization/agent-plugins
