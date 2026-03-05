# Template Organization

## Structure

Only skills that **generate documents** include a `templates/` subdirectory. Skills that only **read** documents do not need templates.

```
skills/
├── sdd-arch/
│   ├── SKILL.md
│   └── templates/
│       └── architecture.md
├── sdd-prd/
│   ├── SKILL.md
│   └── templates/
│       └── prd.md
├── sdd-ux/
│   ├── SKILL.md
│   └── templates/
│       ├── ux.md
│       └── prototype-template.html
├── sdd-propose/
│   ├── SKILL.md
│   └── templates/
│       ├── proposal.md
│       └── design.md
├── sdd-implement/
│   └── SKILL.md           # Reads but doesn't generate docs → no templates
├── sdd-archive/
│   └── SKILL.md           # Reads but doesn't generate docs → no templates
├── sdd-explore/
│   └── SKILL.md           # Reads but doesn't generate docs → no templates
└── sdd-verify/
    └── SKILL.md           # Reads but doesn't generate docs → no templates
```

## Template Usage

Each SKILL.md file that generates documents references its local templates:

- **sdd-arch**: Uses `./templates/architecture.md` when creating the global architecture document
- **sdd-prd**: Uses `./templates/prd.md` when creating the product requirements document
- **sdd-ux**: Uses `./templates/ux.md` and `./templates/prototype-template.html` when creating UX design
- **sdd-propose**: Uses `./templates/proposal.md` and `./templates/design.md` when creating change proposals

The prompt files and agent files reference templates using absolute paths from the root of the project:
- `skills/sdd-arch/templates/architecture.md`
- `skills/sdd-prd/templates/prd.md`
- etc.

## Adding New Templates

When adding a new template:

1. Identify which **document-generating** skill should own the template
2. Create the template file in `skills/<skill-name>/templates/`
3. Update the SKILL.md file to reference the template using `./templates/<filename>`
4. Update any prompt or agent files to use the full path: `skills/<skill-name>/templates/<filename>`
