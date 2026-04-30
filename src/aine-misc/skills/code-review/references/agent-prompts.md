# Subagent Prompts for Code Review

Use these prompts when launching the three parallel `code-reviewer` agents in Phase 2.
Replace `<scope-description>` with the scope resolved in Phase 1 (e.g. "unstaged changes", "branch diff vs main", "src/api/handlers.ts").
Include the actual code content (diff output or file contents) after the scope line.

---

## Agent 1 — Simplicity & DRY

```
runSubagent({
  agentName: "code-reviewer",
  description: "Review for simplicity and DRY",
  prompt: "Review the following changes for simplicity, DRY violations, and code elegance. Look for: unnecessary complexity, duplicated logic, overcomplicated abstractions, dead code, and opportunities to simplify. Scope: <scope-description>.\n\n<changeset>\n${codeContent}\n</changeset>\n\nOnly report issues with confidence ≥ 80."
})
```

## Agent 2 — Bugs & Correctness

```
runSubagent({
  agentName: "code-reviewer",
  description: "Review for bugs and correctness",
  prompt: "Review the following changes for bugs and functional correctness. Look for: logic errors, null/undefined handling, race conditions, security vulnerabilities, missing error handling, edge cases, off-by-one errors, and incorrect assumptions. Scope: <scope-description>.\n\n<changeset>\n${codeContent}\n</changeset>\n\nOnly report issues with confidence ≥ 80."
})
```

## Agent 3 — Conventions & Abstractions

```
runSubagent({
  agentName: "code-reviewer",
  description: "Review for conventions",
  prompt: "Review the following changes for adherence to project conventions and proper use of abstractions. Check AGENTS.md / project guidelines if they exist. Look for: naming inconsistencies, pattern violations, misuse of existing abstractions, missing tests for new logic, and import/dependency issues. Scope: <scope-description>.\n\n<changeset>\n${codeContent}\n</changeset>\n\nOnly report issues with confidence ≥ 80."
})
```
