# AI_CONTEXT.md

**Status:** Permanent engineering constitution for every AI assistant working on this repository.  
**Companion:** `PROJECT.md` is the permanent *technical* knowledge base (architecture, features, schema, stack).  
**This file** is the permanent *behavioural and quality* constitution (how to think, decide, and ship).

If `AI_CONTEXT.md` and a transient chat instruction conflict on process or safety, follow this constitution unless a human explicitly overrides it for that task.  
If `AI_CONTEXT.md` and `PROJECT.md` conflict on a factual description of the system, trust the **code**, then update `PROJECT.md`.

---

## 1. Purpose

The Warrior Mindset App exists to help people build clarity, discipline, and purpose through a **daily life operating system** — not through fleeting motivation. It is rooted in the Awaken the Warrior Mindset philosophy: practice across life domains (vision, goals, habits, health, wealth awareness, resilience, relationships, community, and legacy), guided by an AI accountability partner (Coach Marcus) that is personal, diagnostic, and action-oriented.

**Long-term purpose of the application**

- Give every user a coherent system they can return to every day.
- Make coaching feel remembered and grounded in the user’s own data — without claiming to be medical, psychological, or financial advice.
- Grow from a focused personal-transformation product into a durable platform that can support related experiences (mobile wrappers, future products, shared identity and data patterns) without rewriting the core every year.

**Philosophy behind the work**

- Systems beat moods.
- Specific truth beats generic encouragement.
- Educational empowerment beats dependency.
- Continuity of the user’s journey (data, memory, habits) is sacred.
- Software should serve the warrior path quietly: reliable, clear, and respectful of privacy.

AI assistants are temporary. This product and its users are not. Optimise for the long arc.

---

## 2. AI Responsibilities

Before changing anything, every AI assistant **must**:

1. **Read `AI_CONTEXT.md`** (this file) and treat it as binding process.
2. **Read `PROJECT.md`** and use it as the factual map of the current system.
3. **Inspect the real code paths** relevant to the task — do not rely on memory or guesses when files are available.
4. **Understand existing architecture** (auth, local-first state, cloud sync, services, serverless AI boundaries, navigation model) before proposing structural change.
5. **Preserve backwards compatibility** for stored user data, auth sessions, and public APIs unless a migration is explicitly requested and documented.
6. **Prefer the smallest safe change** that satisfies the human request.
7. **Explain major architectural decisions** in plain language before or when implementing them (what changes, why, what risks).
8. **Update documentation** after significant changes (`PROJECT.md` at minimum; also `DATABASE.md`, `ROADMAP.md`, `CHANGELOG.md` when those files exist and apply — see §6).
9. **Never commit secrets** or write credentials into source, docs, or logs.
10. **Leave the tree better than found** for the specific task — without opportunistic refactors that expand blast radius.

When uncertain about destructive or irreversible work (schema drops, data wipes, auth changes, prompt rewrites, deleting features), **stop and ask**.

---

## 3. Development Philosophy

These principles outlive any single framework or vendor.

### Mobile-first
Design and verify for small screens and touch first. Assume intermittent networks and PWA / native-wrapper contexts. Do not ship layouts that only work on wide desktops.

### AI-first
Where intelligence adds clarity or speed (coaching, planning, nutrition insight, memory), design for AI as a first-class capability — always behind secure server boundaries, always with graceful degradation when the model or network fails.

### Simplicity over complexity
Choose the clearest design that works. Avoid new layers, stores, or microservices unless complexity is already hurting delivery. Cleverness that only the author understands is debt.

### Modular architecture
Keep feature surfaces separable (views/modules), shared domain types central, and I/O in services or server functions. New features should plug into existing seams rather than fork parallel stacks.

### Maintainability
Write code the next human (or AI) can reason about in one sitting. Prefer explicit names, small functions, and comments only where intent is non-obvious.

### Scalability
Scale what must scale: data shape versioning, auth boundaries, server-side AI, and deploy configuration. Do not prematurely scale what is still a single-user blob or local-only feature — but design so those can graduate cleanly.

### Production-ready code
Ship as if real users will trust this with private life data tomorrow. Handle errors, empty states, loading, and logout hygiene. No “temporary” secret shortcuts.

### Reusable components
Extract shared UI and logic when duplication is real and stable. Do not abstract on first use. Prefer existing patterns (`data` / `update` props, shared services, design tokens) over inventing a second style system.

### Single source of truth
- One constitution: `AI_CONTEXT.md`
- One technical map: `PROJECT.md`
- One domain model for app state (evolve carefully; version when needed)
- One place for secrets: environment / host config — never the repo
- One deploy truth for serverless functions — do not grow duplicate copies

### Avoid technical debt
Do not leave stubs documented as live features. Do not add dead code paths “for later” without a tracked intention. When you must take on debt, record it in `PROJECT.md` or `ROADMAP.md` with a reason.

### Local-first resilience
User progress must not vanish because a network call failed. Cloud sync enhances continuity; it must not be the only line of defence without an explicit migration plan.

---

## 4. Coding Rules

### Naming conventions
- Components and types: `PascalCase`
- Functions, variables, services: `camelCase`
- Files for views/components: match the primary export
- Persistence keys, tables, server routes: stable, descriptive, consistent casing already used in the project
- Do not conflate distinct domain concepts (e.g. subscription **tier** vs XP **rank**)

### Folder organisation
- Keep application source in the canonical app directory documented in `PROJECT.md`
- `views/` (or equivalent) for feature screens
- `services/` for external I/O and persistence adapters
- Shared types in a central types module
- Server functions in the **single** configured functions location
- Do not scatter parallel implementations of the same concern across repo root and app subtree

### React component structure
- Prefer function components and hooks
- Feature screens receive shared state through clear props; avoid hidden global mutation
- Keep side effects (auth listeners, sync, media) intentional and cleaned up
- Extract presentational pieces when a screen becomes hard to reason about — without drive-by rewrites of unrelated modules
- Navigation must follow the project’s established routing/view model; do not assume a router that is not in use

### TypeScript usage
- Model domain data with explicit types/interfaces
- Prefer narrowing and safe defaults over `any`
- When extending persisted shapes, update types **and** merge/default logic so old payloads still load
- Keep public service return types honest (`null` / `false` on soft failure is acceptable when that is the project pattern)

### Error handling
- Fail soft at edges: network and AI failures must not crash the shell
- Show recoverable user messaging; log actionable detail for developers
- Never swallow errors silently in auth, persistence, or payment-adjacent code
- Server functions: validate input, return structured errors, never leak secrets in responses

### Logging
- Use clear prefixes for subsystems (sync, services, functions)
- Do not log tokens, passwords, reset codes, or full sensitive payloads
- Remove temporary debug noise before considering work done
- Prefer sparse, high-signal logs over chatty traces in production paths

### Environment variables
- Document new variables in `.env.example` (names only)
- Never commit real `.env` files
- Client bundles must not receive service-role or provider secret keys
- Name server credentials consistently across functions; do not invent a second name for the same secret without migrating all call sites

### Security
- Auth session handling stays in the established auth client patterns
- Secrets and model API keys stay on the server
- Treat user journal, health, finance, and chat data as highly private
- Do not weaken CORS, RLS, or admin endpoints “for convenience”
- Ask before changing god-mode lists, admin email flows, or password-reset pipelines
- Dependency adds require justification; prefer maintained, minimal packages

---

## 5. Database Rules

1. **Never modify schema without explanation** — state what changes, why, and how existing rows behave.
2. **Never delete data structures without confirmation** — tables, columns, or major JSON keys used in production require explicit human approval.
3. **Preserve migrations** — when migration files or version fields exist, do not rewrite history; add forward migrations.
4. **Maintain backward compatibility** — old `app_data` blobs and clients must remain readable; use `schema_version` (or equivalent) deliberately.
5. **Prefer additive changes** — new fields with defaults over renames/removals.
6. **One row per user** patterns (upsert on `user_id`) must remain safe under retries; do not introduce duplicate-row races.
7. **Do not put secrets in the database** documentation or seed files.
8. **Distinguish blob vs relational data** — know what lives in JSON documents versus first-class tables before “normalising” or “denormalising.”
9. **Admin / service-role access** stays server-side only.
10. **If `DATABASE.md` exists**, update it in the same change set as schema work.

---

## 6. Documentation Rules

Documentation is part of the product. Code alone is not enough.

| Document | When it must be updated |
|----------|-------------------------|
| **`PROJECT.md`** | Architecture, features, navigation, auth/sync behaviour, integrations, env vars, limitations, debt, or diagrams change. After any significant structural or behavioural change. |
| **`AI_CONTEXT.md`** | Only when the engineering constitution itself must evolve (process, philosophy, quality bar). Prefer rare, deliberate edits. |
| **`DATABASE.md`** | When it exists: any schema, table, RLS, migration, or data-shape contract change. Create it when schema work outgrows `PROJECT.md`. |
| **`ROADMAP.md`** | When it exists: planned work is completed, cancelled, or newly committed by humans; note intentional debt paydown. |
| **`CHANGELOG.md`** | When it exists: user-visible features, fixes, breaking changes, and migrations — written for humans, dated, concise. |

**Rules**

- Do not claim features in docs that are stubs in code.
- Separate **verified** facts from **assumptions**.
- After significant work, leave docs accurate enough that a new AI can onboard from files alone.
- Prefer updating docs in the same PR/commit series as the code when practical.

---

## 7. AI Behaviour Rules

1. **Never invent functionality that does not exist.** If payments, multiplayer community, or email delivery are stubs, say so.
2. **Clearly distinguish assumptions from verified facts.** Label speculation.
3. **Ask before removing features**, public UI, data fields, or user-facing flows.
4. **Avoid duplicate implementations.** Reuse existing services, functions, and components.
5. **Reuse existing services whenever possible** (`services/*`, shared helpers, existing Netlify functions) before adding parallel clients.
6. **Do not drive-by refactor** unrelated modules while fixing a narrow bug.
7. **Do not rewrite the coach voice / system prompt** unless explicitly asked — it is product identity.
8. **Do not expand scope** into redesign, renames, or dependency upgrades without request.
9. **When blocked**, report the blocker and the smallest safe alternative; do not silently guess irreversible fixes.
10. **Respect brand and UX language** already in the app unless the task is visual redesign.
11. **Tests:** if tests exist, keep them green; if adding critical logic, prefer adding coverage when the repo supports it.
12. **Honesty in status updates:** “done” means Definition of Done (§9), not merely “files edited.”

---

## 8. Long-Term Vision

This application is the first durable node in a larger Warrior Mindset ecosystem. Over years it may coexist with:

- Native or wrapper mobile experiences sharing the same identity and data contracts
- Deeper coaching, planning, and health intelligence products
- Community and accountability features that become truly multi-user
- Commerce / subscription infrastructure worthy of the Terms already envisioned
- Sister products (experiences, education, events, or operational tools) built on **shared architecture patterns**: secure auth, local-first or sync-safe state, server-mediated AI, modular feature surfaces, and honest documentation

**Architectural implication for AI assistants**

- Design changes as if another product may one day consume the same user identity, coaching patterns, or data contracts.
- Prefer clean boundaries (auth, domain types, services, server functions) over one-off hacks glued to a single screen.
- Do not prematurely build the entire ecosystem — but do not paint the codebase into a corner that forbids it.

The brand promise is long-term transformation. The engineering promise must match: continuity, privacy, and evolvability.

---

## 9. Definition of Done

A feature or fix is **not done** until all applicable bars are met:

1. **Correctness** — Behaviour matches the request and does not break auth, sync, or adjacent modules.
2. **Compatibility** — Existing user data and sessions still load; migrations documented if shapes changed.
3. **Resilience** — Loading, empty, and error states handled; AI/network failure does not brick the app.
4. **Security** — No new secret exposure; env vars documented by name; server boundaries respected.
5. **UX coherence** — Fits mobile-first layout and existing visual/interaction patterns (unless redesign was requested).
6. **No duplicate systems** — Reused existing services/functions where possible.
7. **Cleanliness** — No leftover debug noise, unused dead alternate implementations, or accidental unrelated diffs.
8. **Documentation** — `PROJECT.md` (and other docs per §6) updated when the change is significant.
9. **Verifiability** — The AI can explain how to verify (happy path + one failure path). Prefer actually running checks when the environment allows.
10. **Honesty** — Known limitations left in the tree are documented, not hidden.

If any item cannot be met, say so explicitly and leave a clear follow-up — do not mark the work complete by silence.

---

## 10. Future AI Instructions

**Checklist — read before every code change**

- [ ] I have read **`AI_CONTEXT.md`** (this constitution).
- [ ] I have read the relevant sections of **`PROJECT.md`**.
- [ ] I know which files own auth, state sync, domain types, and AI server calls.
- [ ] I understand whether this task touches **persisted user data** or **schema**.
- [ ] I will make the **smallest safe diff** and avoid unrelated refactors.
- [ ] I will **reuse** existing services/components/functions when they fit.
- [ ] I will **not invent** product capabilities or document stubs as live.
- [ ] I will **ask** before deleting features, dropping data, or breaking changes.
- [ ] I will keep **secrets** out of the client and out of git.
- [ ] I will update **`PROJECT.md`** / other docs when the change is significant.
- [ ] I will only call the work **done** when §9 Definition of Done is satisfied.

**Default stance:** preserve user trust, preserve continuity, prefer clarity, ship production-ready increments.

---

## Document control

| Role | File |
|------|------|
| Engineering constitution (behaviour & quality) | `AI_CONTEXT.md` |
| Technical knowledge base (system facts) | `PROJECT.md` |
| Schema deep-dive (when present) | `DATABASE.md` |
| Planned work (when present) | `ROADMAP.md` |
| Released changes (when present) | `CHANGELOG.md` |

Amend this constitution sparingly. When amending, record why in `CHANGELOG.md` (if present) or in the commit message, so the history of our standards remains as durable as the product itself.
