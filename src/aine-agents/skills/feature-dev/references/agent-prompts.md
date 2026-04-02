# Agent Prompt Examples

Reference prompts for launching subagents in the feature-dev workflow.

---

## Phase 2: Codebase Exploration (code-explorer agents)

Launch 2-3 agents in parallel, each targeting a different aspect:

**Similar features**
> "Find features similar to [feature] in this codebase. Trace through their full implementation — endpoint/entry point, business logic, data layer, tests. Identify key abstractions and patterns used. Return a list of 5-10 key files to read."

**Architecture and abstractions**
> "Map the architecture and abstractions for [feature area]. Trace through how the system is structured — layers, modules, extension points, shared utilities. Return a list of 5-10 key files to read."

**Existing related area**
> "Analyze the current implementation of [existing feature/area]. Trace through the code comprehensively from entry point to data layer. Identify conventions, error handling patterns, and testing approaches. Return a list of 5-10 key files to read."

**UI/testing patterns** *(for frontend or full-stack features)*
> "Identify UI component patterns, state management approaches, and testing conventions relevant to [feature]. Return a list of 5-10 key files to read."

---

## Phase 4: Architecture Design (code-architect agents)

Launch 2-3 agents in parallel with different focuses:

**Option A — Minimal changes**
> "Design the smallest possible implementation of [feature] in this codebase. Maximize reuse of existing code, avoid new abstractions, keep changes localized to as few files as possible. Output: a list of files to modify, a summary of changes in each, and a rough line-count estimate."

**Option B — Clean architecture**
> "Design a clean, maintainable implementation of [feature] in this codebase. Introduce well-named abstractions where appropriate, keep concerns separated, prioritize long-term readability over brevity. Output: a list of files to create/modify, a summary of the design, and trade-offs vs. a minimal approach."

**Option C — Pragmatic balance**
> "Design a pragmatic implementation of [feature] in this codebase that balances speed and quality. Reuse existing patterns where natural, introduce new abstractions only when they clearly improve clarity. Output: a list of files to create/modify, a summary of the approach, and what compromises were made."
