# Full SDD Process

The SDD lifecycle has two phases: **Project Setup** (done once) and the **Change Lifecycle** (repeated for every feature or fix).

## Phase A — Project Setup (done once)

```
/sdd-prd → /sdd-ux → /sdd-arch
```

| Step | Skill | Output | Purpose |
|---|---|---|---|
| 1 | `/sdd-prd` | `{ARTIFACT_MAIN_FOLDER}/{SHARED_SUBFOLDER}/prd.md` | Define WHAT the product is and WHY |
| 2 | `/sdd-ux` | `{ARTIFACT_MAIN_FOLDER}/{SHARED_SUBFOLDER}/ux.md`, `{ARTIFACT_MAIN_FOLDER}/{SHARED_SUBFOLDER}/prototype-*.html` | Define how users will experience it |
| 3 | `/sdd-arch` | `{ARTIFACT_MAIN_FOLDER}/{SHARED_SUBFOLDER}/architecture.md` | Define HOW the system is built |

These three documents are **shared** — they apply to the whole project and are updated as the product evolves.

## Phase B — Change Lifecycle (repeated per change)

```
/sdd-propose → [/sdd-explore] → /sdd-implement → /sdd-verify → /sdd-archive
```

| Step | Skill | Output | Purpose |
|---|---|---|---|
| 4 | `/sdd-propose <name>` | `{ARTIFACT_MAIN_FOLDER}/{CHANGE_SUBFOLDER}/<name>/` artifacts | Scope the change and generate implementation plan |
| 5 *(optional)* | `/sdd-explore [topic]` | Thinking, diagrams, decisions | Investigate before or during implementation |
| 6 | `/sdd-implement [name]` | Code and tests | Build the change test-first |
| 7 | `/sdd-verify [name]` | Verification report | Confirm implementation matches the spec |
| 8 | `/sdd-archive [name]` | Archived change + synced specs | Close out the change |

## Flowchart

```
{ARTIFACT_MAIN_FOLDER}/ exists?
└── No  → Start with /sdd-prd
└── Yes →
        {SHARED_SUBFOLDER}/prd.md exists?
        └── No  → /sdd-prd first
        └── Yes →
                {SHARED_SUBFOLDER}/ux.md exists?
                └── No  → /sdd-ux (optional but recommended), then check architecture
                └── Yes →
                        {SHARED_SUBFOLDER}/architecture.md exists?
                        └── No  → /sdd-arch (optional but recommended)
                        └── Yes →
                                Ready to work? → /sdd-propose <change-name>
                                                 → /sdd-implement
                                                 → /sdd-verify
                                                 → /sdd-archive
```
