# ROADMAP.md

**Status:** Permanent product and engineering roadmap for the Warrior Mindset App.  
**Basis:** Current repository + `PROJECT.md` + `AI_CONTEXT.md` + `DATABASE.md`.  
**Rule:** Only mark work **Completed** when it is verifiably implemented in code. Everything else is Planned, Proposed, or Vision.

### Status legend

| Status | Meaning |
|--------|---------|
| **Completed** | Implemented and observable in the repository |
| **In Progress** | Partially implemented; incomplete paths or unfinished hardening remain |
| **Planned** | Next logical engineering work grounded in current architecture |
| **Proposed** | Product/engineering idea not yet committed in code |
| **Vision** | Long-horizon direction; not a near-term build commitment |

---

## 1. Product Vision

The Warrior Mindset App is a **daily life operating system** for clarity, discipline, and purpose — not a motivation feed. It helps users practice across life domains (vision, goals, habits, health, wealth awareness, resilience, relationships, community, and legacy), guided by **Coach Marcus AI**, an accountability partner modeled on Dato Marcus R. Mehta’s teaching philosophy.

Long-term purpose:

- Continuity of the user’s personal transformation journey (data, memory, habits).
- Educational empowerment — not medical, psychological, or financial advice.
- A durable platform that can support mobile wrappers and future sister products sharing identity, coaching patterns, and data contracts (`AI_CONTEXT.md` §8).

Success, in product language already encoded in the coach system prompt: users should feel real value within about a minute — clarity, a next step, or a reframe.

---

## 2. Current Product Status

### Maturity snapshot

| Dimension | Assessment |
|-----------|------------|
| **Product surface** | Broad module coverage (Foundation → Legacy + Coach + Support) | 
| **Auth** | Email/password Supabase Auth with recovery UI | 
| **Persistence** | Local-first `UserData` blob + cloud sync to Supabase | 
| **AI** | Production-style serverless Gemini integration for coach, meals, missions, memory | 
| **Monetisation** | UI/Terms language only — **no payment processor in code** | 
| **Social** | Local mock/community feed — **not multi-user** | 
| **Ops / docs** | Strong permanent docs (`PROJECT` / `AI_CONTEXT` / `DATABASE`); incomplete in-repo Netlify build config; no automated tests found | 
| **Displayed version** | Support footer shows `v3.0.0`; `package.json` still `0.0.0` | 

### Implemented modules (Completed at product-surface level)

Foundation, Mission Control, Journal, Ageless Living, Wealth (`MasteryView`), Resilience, Tribe, Community (local), Legacy, Coach Marcus, Support/Codex, Subscription/rank UI, onboarding, daily affirmation shell, PWA basics, cloud sync.

### Production readiness

- **Shippable as:** authenticated personal OS + AI coaching SPA hosted on Netlify (OG URL present).
- **Not yet production-complete as:** full SaaS (billing, real community, verified RLS documentation, single deploy truth, test suite).
- **Critical ops unknown:** whether all Netlify functions from the app tree are deployed; whether Supabase RLS matches recommendations in `DATABASE.md`.

### Known limitations (summary)

See `PROJECT.md` §18 and `DATABASE.md` §14. Highlights: default `tier: Legend`, client-writable unlocks, simulated support form, guest mode disabled, journal XP fields unused, dual function trees, blob-sized community images.

### Technical maturity

Solid feature breadth and thoughtful cloud-sync guards; moderate architectural debt (monolith views, CDN Tailwind, no migrations in-repo, service-role env naming split). Documentation maturity is high relative to code age.

---

## 3. Completed Features

Only items **verified in the repository**.

### Authentication — Completed
- Email/password sign-up and login (`AuthView`)
- Supabase session gate in `App.tsx`
- Forgot-password via `resetPasswordForEmail`
- Recovery UI (`PASSWORD_RECOVERY` → `ResetPasswordView` → `updateUser` password)
- Logout with best-effort cloud save and local clear

### Foundation — Completed
- Life-circle scoring (`VisionNavigator`)
- 1 / 3 / 5-year vision fields
- Goals + milestones (`GoalMaster`) with XP awards
- Habits + streaks (`HabitLaboratory`)
- Entry CTAs to Coach / scroll to setup

### Mission Control — Completed
- AI conversational plan builder (`generate-mission-plan`)
- PDF upload parse (`parse-plan-document`)
- Premortem-style plan review text
- Milestone dashboard + status toggles
- Dual persistence: `user_mission_plans` + `UserData.missionPlan`

### Journal — Completed
- Daily workflow (morning, priorities, afternoon, evening, shutdown)
- Streak tracking on save
- Tier-gated overlays for later blocks (logic present; default tier unlocks)
- Local persistence via `UserData.dailyWorkflows`

### Ageless Living — Completed
- Tabs: Movement, Nutrition, Fasting, Sleep, Settings
- Workouts, water, fasting timer, sleep metrics, supplements/meds, body stats
- Meal photo analysis + text estimate (Netlify → Gemini)
- Charts (Recharts) for trends

### Wealth — Completed
- Income / expense / asset / liability tables (`MasteryView`)
- Charts and save/XP behaviours
- Tier gate UI (`Adept` / `Legend`)

### Resilience — Completed
- Cognitive reframe journal
- After Action Reports (`failures`)
- Five-stage challenges (`ChallengeNavigator`)

### Tribe — Completed
- Relationship map (Inner Circle / Tribe / Extended)
- Legend-tier gate UI

### Community — Completed *(local only)*
- Post composer with optional image (data URL)
- Reactions, edit/delete own posts
- Seed mock posts + local leaderboard UI
- **Not completed:** multi-user backend community

### Legacy — Completed
- Warrior Code principle toggles + XP
- Socratic Coach Marcus alignment chat (`getLegacyCoachResponse`)

### Coach Marcus AI — Completed
- Chat UI with markdown rendering
- Cross-module context injection (`buildUserContext` / `coachContextService`)
- System prompt v8 (`COACH_SYSTEM_PROMPT`)
- Voice input (Web Speech API)
- Conversation insert + memory summary load
- Session summarisation Netlify function

### Support — Completed
- FAQ accordion
- Privacy / ToS modals (in-app copy)
- Simulated contact form (UI only)
- Codex / “How it works” surfaces

### Subscription — Completed *(informational)*
- XP / rank progress UI (`WARRIOR_RANKS`)
- Tier cards display
- **Not completed:** Stripe or any payment checkout

### PWA — Completed *(basic)*
- `manifest.json`, icons, theme colour
- Service worker registration; network-first cache of `/` and `/index.html`

### Cloud Sync — Completed *(core path)*
- Load / migrate / debounced save for `user_app_state`
- Logout save + local clear
- Mission plan and coach conversation tables

### AI Services — Completed
- `chat`, `analyze-meal-image`, `generate-mission-plan`, `parse-plan-document`, `summarise-session`
- Gemini model: `gemini-2.5-flash`

### Documentation — Completed
- `PROJECT.md`, `AI_CONTEXT.md`, `DATABASE.md` (and this `ROADMAP.md`)

### In Progress (partial — not listed as Completed)
- Alternate password-reset **code** flow (Netlify + Resend + `password_reset_codes` read/delete) — **not wired to Auth UI**; no in-repo code insert
- Guest-mode plumbing present but `isGuest = false`
- Cloud sync “phased” comments vs fully wired behaviour — hardening / schema evolution still open
- Profile / data-forget flows referenced in coach prompt — **no Profile page**

---

## 4. Current Technical Debt

Prioritised from `PROJECT.md` §20 and `DATABASE.md` §14–15.

### Critical
- Uncertain single Netlify functions deploy path (root subset vs app full set)
- Service-role env naming split (`SUPABASE_SERVICE_KEY` vs `SUPABASE_SERVICE_ROLE_KEY`)
- `summarise-session` uses service credentials without visible caller authz
- Production RLS **unverified** in-repo (`DATABASE.md`)

### High
- Monolithic views (`AgelessLiving`, large `App` / coach prompt)
- Dual local/cloud persistence complexity and last-write-wins conflicts
- Duplicate Netlify function trees
- Full `UserData` JSON blob growth (esp. images)
- No automated test suite
- Mission “Reset plan” clears blob only, not necessarily table row

### Medium
- Dead code (`RelationalFinancial`, unused reset-code UI path, unused `loadRecentConversations`)
- CDN Tailwind + mixed importmap/Vite loading
- Client `GEMINI_API_KEY` Vite `define` surface
- Hardcoded god-mode emails
- `schema_version` without real migrations
- Default `tier: Legend` undermines gating semantics

### Low
- Stale comments (“not wired into App.tsx”)
- Missing `index.css` linked from HTML
- Empty root `package-lock.json`
- Version string mismatch (`v3.0.0` UI vs `0.0.0` package)

---

## 5. Current Known Bugs

Verified / code-evident (`PROJECT.md` §19, `DATABASE.md`):

1. **Subscription feature bullets never render** — checks for ranks `Novice` / `Adept` / `Legend` vs actual `Apprentice` / `Walker` / `Warrior` / `Elder` / `Master`.
2. **Password length mismatch** — signup ≥6 vs reset ≥8.
3. **Affirmation / scoring UI vs XP logic drift** — hardcoded affirmation quote; scoring modal values don’t match all award sites; journal `xpAwarded` not applied on save.
4. **Service credential env inconsistency** — can break one server path while another works.
5. **Potential missing Netlify functions** if only root `netlify/functions` deploys.
6. **Recharts width(-1)** — globally silenced; delayed chart mount workarounds remain.
7. **Mission reset orphan risk** — cloud mission row may remain after UI reset.

---

## 6. Next Development Priorities

**Planning recommendations** grounded in current architecture — not major rewrites.

1. **Confirm & document deploy truth** — one functions directory; ensure meal/mission/summarise endpoints are live.
2. **Unify service-role env names** and verify Netlify env matrix (`DATABASE.md` §12).
3. **Harden `summarise-session`** — verify caller owns `sessionId` / user.
4. **Validate Supabase RLS** in a non-prod project; record results in `DATABASE.md`.
5. **Fix verified UI bugs** — Subscription rank bullets; password min-length consistency; journal XP or remove dead `xpAwarded` fields.
6. **Align tier defaults** — stop defaulting new users to `Legend` if gates are meant to matter.
7. **Mission reset consistency** — clear or archive `user_mission_plans` with UI reset.
8. **Either finish or remove** unused password-code reset path.
9. **Add minimal smoke tests** for auth gate, hydrate/save, and one AI function contract.
10. **Trim dead modules** only with explicit approval (`RelationalFinancial`, etc.).

Avoid rewriting the SPA into a new framework or introducing a global state library unless sync complexity demands it.

---

## 7. Future Product Features

All items below are **Proposed** or **Vision** unless noted.

### Short Term — Proposed
- Working support ticket/email delivery
- Profile page (name, data export, “forget” preferences referenced by coach prompt)
- Use full `DAILY_AFFIRMATIONS` rotation
- Honest Subscription copy aligned to real ranks/tiers
- Fix XP consistency across modules
- Ops checklist for env + RLS + function deploy

### Medium Term — Proposed
- Real payments / entitlements (Stripe or equivalent) replacing client-writable `tier`
- True multi-user community (posts, reactions server-side)
- Richer offline PWA asset caching
- In-repo SQL migrations for inferred schema
- Storage for images instead of data URLs in JSON
- Conflict-aware multi-device sync

### Long Term — Proposed
- Normalize high-churn domains out of the monolith blob (journal, health logs)
- Admin / coach analytics dashboards
- Team / tribe shared accountability spaces
- Localisation beyond RM-centric wealth display
- Formal accessibility audit and remediation

### Future Vision
- Ecosystem of sister products on shared auth + coaching contracts (`AI_CONTEXT.md`)
- Native apps consuming the same backend
- Advanced adaptive coaching curriculum across the 11 modules
- Enterprise / cohort delivery modes

---

## 8. AI Roadmap

### Implemented today — Completed
- Coach Marcus chat with layered system prompt
- Cross-module user context injection
- Legacy Socratic alignment coach
- Meal image/text nutrition estimation
- Mission plan generation + PDF parse + premortem text
- Session memory summaries stored on `coach_conversations`

### In Progress / gaps
- Memory is summary-based, not full transcript retrieval in UI
- `loadRecentConversations` exists but is unused by views
- Prompt mentions Profile forget flows not implemented

### Proposed evolution
- Short term: safer summarise authz; tighter freshness guarantees for health context
- Medium: retrieval over past sessions; user-visible memory controls; structured tool calls into modules (e.g. “log habit”)
- Long: multi-modal coaching (voice in/out), personalised curricula, evaluation harness for prompt regressions
- Vision: shared Coach Marcus service used by multiple Warrior Mindset products

Clearly: **do not claim** tool-calling into modules, Profile forget, or multi-product coach as completed.

---

## 9. Scalability Roadmap

| Horizon | Improvement | Status |
|---------|-------------|--------|
| Near | Single deployable functions tree; env consistency | Planned |
| Near | Documented RLS + indexes as usage grows | Planned |
| Mid | Split blob domains; object storage for media | Proposed |
| Mid | `schema_version` migration runners | Proposed |
| Mid | Multi-device sync strategy beyond last-write-wins | Proposed |
| Long | Separate read models for community / analytics | Vision |
| Long | Horizontal-friendly service boundaries for AI vs CRUD | Vision |

---

## 10. Security Roadmap

| Item | Status |
|------|--------|
| Keep secrets server-side (current pattern for Gemini chat) | Completed pattern; guard continuously |
| Remove/avoid client injection of Gemini key via Vite `define` for new work | Planned |
| Verify RLS on all public tables | Planned (Unconfirmed today) |
| Authorise `summarise-session` | Planned |
| Rate-limit password reset / admin enumeration paths | Proposed |
| Finish or delete unused reset-code + service-role surface | Planned |
| Move god-mode entitlements off client-only email list | Proposed |
| Dependency auditing / lockfile hygiene at repo root | Proposed |
| Security review for community when it becomes multi-user | Vision |

---

## 11. Performance Roadmap

| Item | Status |
|------|--------|
| Debounced cloud saves (1s) | Completed |
| Coach prefers local mealLogs to avoid stale cloud | Completed tactic |
| Split giant views; code-split routes/views if router introduced later | Proposed |
| Stop storing large images in JSON | Proposed |
| Proper Tailwind build (purge) instead of full CDN | Proposed |
| Expand SW caching carefully (avoid stale app shells) | Proposed |
| Chart mount without global console silencing | Proposed |
| Pagination for coach_conversations and health logs | Proposed |

---

## 12. User Experience Roadmap

| Item | Status |
|------|--------|
| Onboarding modal, affirmation, bottom + side nav | Completed |
| Mobile-first layout patterns | Mostly Completed; keep verifying |
| Empty states across modules | Completed pattern |
| Align XP / scoring explanations with real awards | Planned |
| Rotate daily affirmations from existing constant list | Planned |
| Profile & data transparency controls | Proposed |
| Real support channel | Proposed |
| Guest mode (currently disabled) — product decision | Proposed |
| Accessibility (focus, contrast, screen readers) | Proposed |
| Deeper motion / polish without clutter | Vision |

---

## 13. Mobile Roadmap

Evidence in code: `WarriorMobileWrapper` UA and `?platform=mobile` hide some unlock CTAs; PWA manifest; camera/mic permissions in metadata.

| Item | Status |
|------|--------|
| Mobile web responsive shell | Completed |
| PWA install basics | Completed |
| Wrapper detection hooks | Completed |
| Native wrapper codebase in this repo | **Not present** |
| Feature parity guidelines for wrapper (offline, auth, file pickers) | Proposed |
| Push notifications / deep links | Vision |
| Store-distributed native apps | Vision |

---

## 14. Release Strategy

**Planning recommendation only** — not implemented release process.

| Version | Intent | Suggested scope |
|---------|--------|-----------------|
| **v1.0** | Stable personal OS | Auth, modules, cloud sync, Coach, deploy truth, RLS verified, critical bugs fixed |
| **v1.1** | Trust & polish | XP consistency, affirmation rotation, support email, profile basics, dead-code cleanup |
| **v1.2** | Hardening | Tests, migrations in-repo, env unification, summarise authz, PWA cache improvements |
| **v2.0** | Platform | Real billing entitlements, multi-user community, storage-backed media, sync conflict strategy |

Align displayed Support footer version and `package.json` version when adopting this scheme.

---

## 15. Success Metrics

**Recommendations** (instrumentation may not all exist yet):

### Product
- D1 / D7 / D30 retention
- Weekly active journaling rate
- Coach sessions per active user
- Mission plans created and milestone completion rate
- Ageless meal/workout log frequency
- Time-to-first-value (&lt; 60s qualitative surveys)

### Engineering
- Error rate on Netlify functions (4xx/5xx)
- Cloud save success vs failure ratio
- Auth success / recovery completion rate
- p95 latency for `chat` and `generate-mission-plan`
- Bundle size / LCP on mobile
- Crash-free sessions (PWA / wrapper)

### Trust / security
- Zero client-side secret incidents
- RLS denial tests passing in staging
- Mean time to patch critical dependency CVEs

---

## 16. Risks

1. **Deploy/config drift** — functions or env missing in production silently break AI.
2. **Data loss perception** — sync races or logout/clear bugs erode trust.
3. **Blob bloat** — large JSON slows sync and hits payload limits.
4. **Security** — service-role functions without authz; unverified RLS.
5. **Product honesty** — Terms mention Stripe; community looks social but is local.
6. **Prompt / model drift** — Gemini upgrades change coaching tone without evals.
7. **Key-person / god-mode hardcoding** — fragile privilege model.
8. **Documentation vs code drift** if roadmap/docs stop updating.
9. **Vendor lock** — Supabase + Netlify + Gemini coupled deeply.
10. **Scope creep** — ecosystem vision tempting premature rewrites.

---

## 17. Dependencies

| Dependency | Role | Risk if unavailable |
|------------|------|---------------------|
| **Supabase** | Auth + Postgres | App cannot load without Vite URL/anon key; no cloud continuity |
| **Netlify** | Hosting + serverless | SPA and AI proxies offline |
| **Gemini** | Coach, meals, missions, summaries | AI features degrade to error messages |
| **React 19** | UI runtime | Core app |
| **Vite 6** | Build / dev | Tooling |
| **Resend** | Alternate reset emails | Only unused code path today |
| **Tailwind CDN / Google Fonts** | Styling / type | Visual breakage if CDN blocked |
| **Recharts / lucide-react / react-markdown** | Charts, icons, coach markdown | Feature-level degradation |
| **Web Speech API** | Coach mic | Optional; browser-dependent |

---

## 18. Definition of Done

A roadmap item is complete when:

1. Behaviour is implemented in the repository (not only designed).
2. It meets `AI_CONTEXT.md` §9 quality bars applicable to the change.
3. Persistence/auth impacts follow `DATABASE.md` change-control rules when relevant.
4. `PROJECT.md` / `DATABASE.md` updated if architecture or schema contracts change.
5. This `ROADMAP.md` status is moved to **Completed** with a short evidence note (file or feature name).
6. `CHANGELOG.md` entry added when that file exists.
7. Critical bugs introduced by the work are fixed or explicitly accepted.
8. Security boundaries (no new client secrets; RLS considered) are respected.

---

## 19. Relationship to Other Documentation

| Document | Role vs ROADMAP |
|----------|-----------------|
| **`PROJECT.md`** | What the system *is* today (facts, architecture, bugs). Roadmap cites it; does not replace it. |
| **`AI_CONTEXT.md`** | How AIs and engineers *must behave*. Roadmap work must obey that constitution. |
| **`DATABASE.md`** | Data contracts and risks. DB-related roadmap items must update it when done. |
| **`CHANGELOG.md`** | When present: chronological released changes. Roadmap is forward-looking; changelog is historical. |
| **`ROADMAP.md` (this file)** | Priorities, proposals, and sequencing — **not** a claim that Proposed items exist. |

Conflict rule: if ROADMAP says Completed but code does not show it, **code wins** — correct the roadmap immediately.

---

## 20. Quarterly Review Process

**Cadence:** At least once per quarter (and after any major release).

**Agenda**
1. Diff Completed items against the repository; demote false Completeds.
2. Re-prioritise Critical/High debt and security items from `PROJECT.md` / `DATABASE.md`.
3. Move Proposed → Planned only with owner + rough capacity.
4. Update Success Metrics with whatever instrumentation exists.
5. Record decisions in `CHANGELOG.md` (or commit message) and bump the “Last reviewed” date below.
6. Confirm Netlify + Supabase production posture still matches docs.

**Owners:** Product lead + engineering lead (or sole maintainer). AI assistants may draft updates but humans approve status promotions to Completed.

---

### Last reviewed

| Field | Value |
|-------|-------|
| Created from codebase analysis | 2026-07-31 |
| Next review due | ~2026-10-31 (recommended) |

**End of ROADMAP.md**
