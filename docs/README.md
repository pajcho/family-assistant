# Docs structure

Agent and project conventions live here. Root [AGENTS.md](../AGENTS.md) links to these when relevant.

```
docs/
├── README.md           # This file — docs layout
└── agents/             # Instructions for AI agents (progressive disclosure)
    └── plan-mode.md    # How to write plans (concise, unresolved questions)
```

**Project structure** is documented in each folder’s README; the root [AGENTS.md](../AGENTS.md) has a table linking to [composables](../composables/README.md), [components](../components/README.md), [pages](../pages/README.md), [utils](../utils/README.md), [layouts](../layouts/README.md), [middleware](../middleware/README.md), [plugins](../plugins/README.md), [types](../types/README.md), [assets](../assets/README.md).

**Suggested additions** as the project grows:

- `agents/typescript.md` — TS conventions, strictness, patterns
- `agents/testing.md` — Test commands, patterns, coverage
- `agents/api.md` — Supabase/API usage, RLS, naming
- `agents/git.md` — Commit style, branching, PRs
