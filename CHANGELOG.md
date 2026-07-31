# CHANGELOG

All notable changes to the Warrior Mindset App are recorded in this file.

This project follows the spirit of [Keep a Changelog](https://keepachangelog.com/) and recommends [Semantic Versioning](https://semver.org/).  
Only entries that can be verified from the repository, local git history, or explicit documentation milestones are recorded as fact. Unverified folklore is omitted.

**Status labels used in this file**

| Label | Meaning |
|-------|---------|
| **Released** | A deliberate product/engineering version cut (when adopted) |
| **Repository milestone** | Verifiable git or filesystem event; not necessarily a SemVer product release |
| **Documentation milestone** | Permanent docs added or materially updated |

---

## 1. Purpose

`CHANGELOG.md` is the **permanent engineering history** of the Warrior Mindset App.

It answers: *What changed, when, and with what impact?*

It does **not** replace:

- `PROJECT.md` — what the system is now
- `AI_CONTEXT.md` — how assistants and engineers must work
- `DATABASE.md` — data architecture and contracts
- `ROADMAP.md` — what we plan to do next

Use this file for chronological, auditable history. Prefer short, human-readable bullets grouped by theme (Added / Changed / Fixed / Security / Database / etc.).

---

## 2. Versioning Strategy

**Recommendation:** adopt Semantic Versioning (`MAJOR.MINOR.PATCH`) for product releases going forward.  
**Note:** `package.json` currently reports `0.0.0` and the Support UI footer shows `v3.0.0` — those strings are **not** treated as authoritative SemVer history until aligned. Do not invent past `1.x` / `2.x` / `3.x` release notes from the footer alone.

| Increment | Use when |
|-----------|----------|
| **Major** (`X.0.0`) | Breaking changes to APIs, persisted `UserData` contracts without migration, auth model, or incompatible remove of user-facing modules |
| **Minor** (`0.X.0`) | Backward-compatible features (new module capabilities, AI features, non-breaking schema additions) |
| **Patch** (`0.0.X`) | Bug fixes, copy fixes, small refactors without contract change |

### Change categories (for grouping bullets)

| Category | Examples |
|----------|----------|
| **Documentation** | `PROJECT.md`, `AI_CONTEXT.md`, `DATABASE.md`, `ROADMAP.md`, `CHANGELOG.md` |
| **Architecture** | Sync model, navigation model, deploy layout, service boundaries |
| **Database** | Tables, columns, RLS, migrations, blob shape / `schema_version` |
| **Security** | Auth flows, secrets handling, RLS, privileged paths |
| **AI** | Coach Marcus, prompts, Netlify AI functions, memory |
| **Infrastructure** | Supabase, Netlify, env vars, hosting, build pipeline |
| **Product** | User-visible module behaviour |

Until formal SemVer tags are cut, significant commits may be listed under **Repository milestones**.

---

## 3. Repository Milestones

### Version 0.1.0 — Documentation foundation

- **Date:** 2026-07-31  
- **Type:** Documentation milestone / Repository milestone  
- **Not a product feature release.** Establishes the permanent knowledge base for humans and AI assistants.

| Artifact | Git commit (verified) | Role |
|----------|----------------------|------|
| `PROJECT.md` | `8093ac2` | Permanent technical knowledge base |
| `AI_CONTEXT.md` | `53cfba9` | Permanent engineering constitution |
| `DATABASE.md` | `49cdb1f` | Permanent database & data-architecture reference |
| `ROADMAP.md` | `ceb41a2` | Permanent product & engineering roadmap |
| `CHANGELOG.md` | *(this commit)* | Permanent engineering history |

**Added**

- Complete onboarding documentation set for architecture, AI behaviour, database, and roadmap.
- Explicit labeling of verified vs inferred schema and known gaps (especially in `DATABASE.md`).

**Changed**

- None to application runtime code in these commits (docs-only).

**Known context (verified from docs, not invented as older SemVer releases)**

- Application lives primarily under `copy-of-awaken-the-warrior-mindset/`.
- Production URL referenced in `index.html` OG tags: `https://warrior-mindset-app.netlify.app`.

---

### Earlier repository milestones (unversioned)

The following are **Repository milestones** derived from **local git history**. They are **not** claimed as formal SemVer releases.

#### 2026-06 — Coach memory, Mission Control, and sync-related work (selected verified commits)

| Date | Commit | Summary |
|------|--------|---------|
| 2026-06-25 | `a14cf44` | Clean up debug logs after mealLogs fix confirmed |
| 2026-06-25 | `c819eb2` | Coach Marcus cross-module context; mealLogs from local state |
| 2026-06-23 | `5dd47a3` / `273d23c` | `index.html` update; files via upload |
| 2026-06-22 | `2a1e818` | Personalize Coach Marcus with user name |
| 2026-06-22 | `5fe254d` | Add `@google/generative-ai` for summarise-session |
| 2026-06-22 | `aa9eaae` | Remove `netlify.toml` to fix deploy failure |
| 2026-06-22 | `f960dd4` | Fresh Coach chats while keeping session memory |
| 2026-06-22 | `05de511` | Wire session memory into coaching prompts |
| 2026-06-22 | `98efe49` | Add `summarise-session` Netlify function |
| 2026-06-22 | `4cf77ea` | Return inserted conversation id from `saveConversation` |
| 2026-06-21 | `66a1045` | Add `netlify.toml` with 60s function timeout *(later removed in `aa9eaae`)* |
| 2026-06-20 | `38923b8` | Reset Mission Control plan upload input on plan reset |
| 2026-06-20 | `4fb9950` | Plan upload and document parsing for Mission Control |
| 2026-06-20 | `98ab79d` | Replace Mission Control with adaptive conversation flow |

*Full history continues in `git log`; this table is a verified sample of recent significant themes, not an exhaustive release ledger.*

---

## 4. Future Release History

Templates below are **planning structure only**. They are **not** released versions.

---

### Version 1.0.0

- **Status:** Not released (template — see `ROADMAP.md` §14)
- **Target intent:** Stable personal OS — auth, modules, cloud sync, Coach, deploy truth, RLS verified, critical bugs fixed

#### Released
- _TBD_

#### Features
- _TBD_

#### Database
- _TBD_

#### AI
- _TBD_

#### Security
- _TBD_

#### Performance
- _TBD_

#### Documentation
- _TBD_

#### Known Issues
- _TBD_

---

### Version 1.1.0

- **Status:** Template (not released)
- **Target intent:** Trust & polish — XP consistency, affirmation rotation, support channel, profile basics, dead-code cleanup

#### Added
- _TBD_

#### Changed
- _TBD_

#### Fixed
- _TBD_

#### Security
- _TBD_

#### Documentation
- _TBD_

---

### Version 1.2.0

- **Status:** Template (not released)
- **Target intent:** Hardening — tests, in-repo migrations, env unification, summarise authz, PWA improvements

#### Added
- _TBD_

#### Changed
- _TBD_

#### Fixed
- _TBD_

#### Database
- _TBD_

#### Security
- _TBD_

#### Documentation
- _TBD_

---

### Version 2.0.0

- **Status:** Template (not released)
- **Target intent:** Platform — real billing entitlements, multi-user community, storage-backed media, sync conflict strategy

#### Added
- _TBD_

#### Changed
- _TBD_

#### Breaking
- _TBD_ (also copy into §9)

#### Database
- _TBD_

#### AI
- _TBD_

#### Security
- _TBD_

#### Documentation
- _TBD_

---

## 5. Database Change Log

Reserved for all future database / persistence contract changes.  
When filled, each entry should reference migrations (when present) and updates to `DATABASE.md`.

| Date | Version / milestone | Change | Impact | Docs updated |
|------|---------------------|--------|--------|--------------|
| 2026-07-31 | 0.1.0 Documentation milestone | `DATABASE.md` created — inferred schema documented; **no production schema migration in this change** | Documentation only | `DATABASE.md` |

_No SQL migrations exist in-repo as of 0.1.0 (`DATABASE.md` §13)._

---

## 6. AI Evolution Log

Reserved for Coach Marcus AI and related model/function changes.

| Date | Version / milestone | Change | Evidence |
|------|---------------------|--------|----------|
| 2026-07-31 | 0.1.0 Documentation milestone | Current AI surface documented in `PROJECT.md` / `ROADMAP.md` §8 (chat, context, meals, mission plans, session summaries) | Docs + existing functions |
| 2026-06-25 | Repository milestone | Cross-module coach context; mealLogs freshness from local state | `c819eb2`, `a14cf44` |
| 2026-06-22 | Repository milestone | Session memory wiring; `summarise-session`; personalized name | `05de511`, `98efe49`, `2a1e818`, … |
| 2026-06-20 | Repository milestone | Mission Control adaptive AI plan flow + PDF parse | `98ab79d`, `4fb9950`, … |

---

## 7. Security History

Reserved for authentication, RLS, secrets handling, and privileged-path changes.

| Date | Version / milestone | Change | Notes |
|------|---------------------|--------|-------|
| 2026-07-31 | 0.1.0 Documentation milestone | Security risks and recommended RLS documented (`DATABASE.md` §10–§15, `ROADMAP.md` §10) | **Recommendations are not verified as deployed** |

_No RLS SQL or security patches are claimed as shipped in 0.1.0._

---

## 8. Infrastructure History

Track Supabase, Netlify, environment variables, deployment, hosting, and build pipeline.

| Date | Version / milestone | Change | Evidence |
|------|---------------------|--------|----------|
| 2026-07-31 | 0.1.0 Documentation milestone | Deploy/function dual-tree risk and env matrix documented | `PROJECT.md`, `DATABASE.md` |
| 2026-06-22 | Repository milestone | `netlify.toml` removed to fix deploy failure | `aa9eaae` |
| 2026-06-21 | Repository milestone | `netlify.toml` added with 60s function timeout | `66a1045` |
| Ongoing | Repository fact | Netlify site id present in `.netlify/state.json`; OG URL points at Netlify host | Files in repo |
| Ongoing | Repository fact | Root `netlify.toml` currently sets `functions` directory only (no full `[build]` block in checked-in file as of docs analysis) | `PROJECT.md` §17 |

---

## 9. Breaking Changes

Initially empty of product-breaking SemVer majors.

| Date | Version | Breaking change | Migration |
|------|---------|-----------------|-----------|
| — | — | _None recorded as a formal SemVer breaking release_ | — |

When a breaking change ships, list it here **and** under the version section, with a pointer to §11 Migration Notes.

---

## 10. Deprecated Features

Initially empty.

| Date | Feature | Replacement | Removal target |
|------|---------|-------------|----------------|
| — | — | — | — |

Candidates discussed in docs but **not formally deprecated in code** (do not treat as changelog deprecations until decided): unused password-code reset UI path, `RelationalFinancial.tsx`, guest-mode plumbing with `isGuest = false`, unused `loadRecentConversations`.

---

## 11. Migration Notes

Use this section whenever architecture, `UserData` shape, or database contracts change.

### Template

```markdown
### Migration: <title> (Version X.Y.Z — YYYY-MM-DD)

**Who must act:** developers / operators / end users  
**Before:** …  
**After:** …  
**Steps:**  
1. …  
**Rollback:** …  
**Related:** DATABASE.md §…, PR/commit …
```

### Recorded migrations

_None yet. Cloud “migrate localStorage → `user_app_state`” is an **application runtime behaviour** (see `DATABASE.md` §7), not a versioned engineering migration entry._

---

## 12. Documentation History

| Date | Document | Event | Commit / note |
|------|----------|-------|---------------|
| 2026-07-31 | `PROJECT.md` | Created — technical knowledge base | `8093ac2` |
| 2026-07-31 | `AI_CONTEXT.md` | Created — engineering constitution | `53cfba9` |
| 2026-07-31 | `DATABASE.md` | Created — database reference | `49cdb1f` |
| 2026-07-31 | `ROADMAP.md` | Created — product/engineering roadmap | `ceb41a2` |
| 2026-07-31 | `CHANGELOG.md` | Created — engineering history | Documentation milestone (Version 0.1.0 series) |

App-local `copy-of-awaken-the-warrior-mindset/README.md` predates this set and remains a short local-run guide (AI Studio heritage).

---

## 13. Relationship to Other Documentation

| Document | Relationship to CHANGELOG |
|----------|---------------------------|
| **`PROJECT.md`** | Current-system source of truth. When architecture facts change, update PROJECT **and** add a changelog entry. |
| **`AI_CONTEXT.md`** | Process constitution. Changelog when the constitution itself changes (rare). |
| **`DATABASE.md`** | Living data contract. Every schema/persistence contract change → DATABASE + CHANGELOG §5. |
| **`ROADMAP.md`** | Forward plan. Completing a roadmap item → mark Completed on ROADMAP **and** record the ship in CHANGELOG. |
| **`CHANGELOG.md`** | Backward-looking history of what shipped or was documented. |

**Conflict rule:** If CHANGELOG claims a feature release but code does not contain it, **code wins** — correct the changelog.

---

## 14. Rules for Future Updates

1. Every **significant** architectural, database, infrastructure, security, AI, or product change **must** update `CHANGELOG.md` in the same change set when practical.
2. Prefer Keep a Changelog groupings: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
3. Link evidence: commit hash, PR, or file path.
4. Do **not** invent historical SemVer releases to match marketing version strings.
5. Label uncertain historical notes as **Repository milestone** or **Documentation milestone**.
6. For breaking changes: update §9, §11, `DATABASE.md` / `PROJECT.md` as applicable, and bump **Major** when SemVer is in use.
7. Documentation-only days may ship as `0.x.0` / patch documentation releases or as dated Documentation milestones under §3 / §12.
8. After editing, ensure ROADMAP status and CHANGELOG do not contradict each other.

---

### Document control

| Field | Value |
|-------|-------|
| Created | 2026-07-31 |
| Initial SemVer bookmark | **0.1.0** (documentation foundation) |
| Philosophy | Keep a Changelog + recommended SemVer |

**End of CHANGELOG.md**
