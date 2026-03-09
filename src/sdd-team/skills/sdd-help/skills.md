# Skills & Commands

| Command | Phase | Purpose | Suggested Agent |
|---|---|---|---|
| `/sdd-init` | Setup | **Brownfield only** — bootstrap all shared docs from an existing codebase | `sdd-pm-agent` |
| `/sdd-prd` | Setup | Create or update the PRD | `sdd-pm-agent` |
| `/sdd-ux` | Setup | Create or update the UX design and prototype | `sdd-ux-agent.agent` |
| `/sdd-arch` | Setup | Create or update the architecture document | `sdd-architect-agent` |
| `/sdd-propose <name>` | Change | Create all change artifacts in one pipeline; may also update PRD/UX/Architecture docs | `sdd-pm-agent` |
| `/sdd-explore [topic]` | Change | Free-form thinking; read files, no code written | Any |
| `/sdd-implement [name]` | Change | Implement tasks test-first | `sdd-dev-agent` |
| `/sdd-verify [name]` | Change | Verify implementation matches specs | Any |
| `/sdd-archive [name]` | Change | Sync delta specs and archive completed change | Any |
| `/sdd-help [topic]` | Any | Learn about SDD process and artifacts | Any |

## Choosing the right skill

```
Brownfield project (existing code, no SDD docs yet)?
  → /sdd-init  (inspects the codebase and creates all shared docs in one go)

Starting a new (greenfield) project?
  → /sdd-prd first, then /sdd-ux and /sdd-arch

Adding a feature or fixing a bug?
  → /sdd-propose <change-name>
  → /sdd-implement when artifacts are ready

Not sure what to implement?
  → /sdd-explore to think it through first

Done with implementation?
  → /sdd-verify to confirm spec compliance
  → /sdd-archive to close out

Lost or unsure what's next?
  → /sdd-help what's next
```
