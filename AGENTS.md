# IP4 — see CLAUDE.md

The agent and developer guide for this project lives in **[CLAUDE.md](./CLAUDE.md)** — that is the single source of truth.

This file used to duplicate it and drifted out of sync (the two disagreed on how to deploy: this file told agents to run `vercel --prod --yes`, which CLAUDE.md explicitly forbids because CLI deploys have collided with git auto-deploys). Consolidated to a pointer on 2026-06-06 so the guidance can't contradict itself again.

**Deploy by pushing to `main`. Do not run `vercel --prod` locally.** Everything else — stack, commands, structure, schema, env vars — is in CLAUDE.md.
