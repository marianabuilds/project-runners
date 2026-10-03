# PRD: Trato (repo: `project-runners`)

| | |
|---|---|
| **Status** | Draft v0.1 |
| **Author** | Mariana Marquez |
| **Date** | 2026-10-03 |
| **Basis** | Written from the current codebase (a clickable demo). Items marked **[Assumption]** are inferred and need your confirmation. |

## 1. Summary

Trato is a shared transaction portal for residential real-estate deals in Peru. A deal ("negocio") involves an agent, a buyer and a seller. Today it is managed through WhatsApp threads, scattered PDFs and memory. Trato gives all three one place to see **what stage the deal is in, who owes what by when, which documents are missing, and what happens next**. Each party sees only what they are allowed to see.

The current build is a front-end demo (Next.js 14, Tailwind, Spanish UI, placeholder data, state in `localStorage`, no backend). This PRD defines the product the demo is meant to become and the scope of a first real release.

## 2. Problem

Independent agents in Lima and Arequipa run several deals at once, each with dozens of small dependencies: DNI copies for the notary, a bank pre-qualification letter, the SUNARP registry certificate, the appraisal, the deposit transfer. Problems today:

- **Chasing.** The agent spends hours asking buyers and sellers by WhatsApp "did you send the document?". Buyers and sellers don't know what is blocking the deal.
- **No single status.** Document versions and approvals live in chat threads, email and phones. Nobody can answer "where are we?" quickly.
- **Privacy by accident.** Buyers and sellers are in the same chat, or the agent forwards things manually, so list price, seller identity and sensitive documents leak or get over-shared.
- **Missed dates.** Inspection, appraisal, notary appointment and closing dates are tracked ad hoc, and slips cost deals.

## 3. Goals and non-goals

### Goals
1. Every party knows their next action and its due date without asking the agent.
2. The agent can see all deals, their blockers and overdue items on one screen.
3. Document status per deal is visible at a glance and every change is attributable.
4. The agent controls what each party can see, per deal.
5. Meet users where they already are, WhatsApp, rather than replace it.

### Non-goals (v1)
- Property listing, search or marketing portal.
- Payment processing or escrow. Trato only **displays** the agent's payment details and tracks "deposit transferred" as a task.
- Legally binding e-signature. "Signed" is a status the agent or party sets, not a certified signature.
- Mortgage origination or bank integrations.
- Multi-agency or brokerage administration (see Open questions).

## 4. Users and roles

| Role | Who | Primary need | Access |
|---|---|---|---|
| **Agent** (Agente) | Independent agent or small agency | Run many deals without chasing people | All deals; edits everything; creates deals and tasks; controls visibility |
| **Buyer** (Comprador/a) | Person buying a property | Know what to do next and the deal's progress | Own deal only; sees limited version per agent settings |
| **Seller** (Vendedor/a) | Property owner | Provide property documents, sign, hand over keys | Own deal; can manage property info; never sees buyer-only financing documents **[Assumption]** |

**Primary persona:** the agent, who is the paying customer and the one who invites the others. Buyers and sellers are guests.

## 5. Key user stories

**Agent**
- As an agent, I see a dashboard of all my deals with stage, next closing dates, overdue tasks and a daily digest of what changed.
- As an agent, I create a deal, set stage, target closing date and add tasks assigned to me, the buyer or the seller.
- As an agent, I move a deal through stages (Prospecto → Oferta → Bajo contrato → Diligencia debida → Cierre).
- As an agent, I decide per deal whether the buyer can see photos, list price, seller name and each document category.
- As an agent, I store my Yape and bank/CCI details once and share them privately when payment is due.
- As an agent, I see an audit trail of who changed what and when.

**Buyer / Seller**
- I see only my tasks, grouped by deal, with plain-language descriptions and due dates ("vence mañana", "atrasada").
- I complete a task with a clear call to action (upload, sign, schedule, review, send, confirm, transfer), and the linked document status updates.
- I see my deal's calendar (inspection, appraisal, closing) and a weekly strip.
- I can ask a question in the portal ("¿qué documentos faltan?") and get an answer from data I'm allowed to see.
- I'm notified by email when a task is created, due soon or overdue.

## 6. Scope: what exists today vs. v1

Status legend: ✅ built in the demo (UI only, placeholder data) · 🔧 needs real implementation · ➕ new for v1

### 6.1 Deals ("Negocios")
- ✅ Deal list and detail, stage selector, price vs. list price, target close date, notes, audit log.
- ✅ Create deal flow (`/deals/new`).
- 🔧 Persist deals server-side; address model supports Peruvian department / province / district.
- ➕ Archive or close deals as won/lost with reason.

### 6.2 Tasks
- ✅ Per-deal tabbed tasks; assignee (agent / buyer / seller); status (pending / in progress / completed); due date; action type; checklist to-dos; private tasks; add-task.
- ✅ Completing a task updates its linked document status (e.g. upload → *Subido*, sign → *Firmado*, review → *Aprobado*).
- 🔧 Real user-scoped views and permissions enforced on the server.
- ➕ Task templates per stage (e.g. "Bajo contrato" starter checklist) to cut setup time.

### 6.3 Documents ("Documentos")
- ✅ Status grid by category (Oferta, Financiamiento, Identidad, Propiedad, Notaría); statuses: Pendiente, Subido, En revisión, Firmado, Aprobado; notes; owner (buyer / seller / shared).
- 🔧 Actual file upload, storage, virus scan, versioning and download. **Today only the status is tracked, not files.**
- ➕ Per-category visibility enforced server-side (already modelled as `buyerAccess.docCategories`).

### 6.4 Calendar
- ✅ Month calendar with side panel, weekly strip, events: offer, inspection, appraisal, closing, custom.
- ➕ Export / subscribe (ICS, Google Calendar) **[Assumption]**.

### 6.5 Dashboard and daily digest
- ✅ Role-specific dashboards, activity feed, notifications drawer, charts, daily digest summary.
- 🔧 Digest generated from real events; delivered in-app and by email.

### 6.6 Visibility controls ("Gestionar negocio")
- ✅ Property description, features, up to 6 photos; toggles for buyer visibility of photos, list price, seller name, and document categories. Buyers are blocked from the page.
- 🔧 Visibility must be enforced in the API, not only the UI.

### 6.7 WhatsApp
- ✅ `wa.me` deep links and a **simulated** "sync" with a message count.
- ➕ v1 decision needed: keep as deep links only (recommended, no API dependency) vs. WhatsApp Business API for outbound reminders **[Open question]**.

### 6.8 "Pregunta al portal" (Q&A)
- ✅ Floating chat answering questions about tasks, documents, dates, price, stage, property, activity and contacts. It is deterministic (keyword rules, no LLM), read-only, and scoped to the viewer's visible data; it refuses action requests.
- ➕ Optional: replace rules with an LLM grounded on the same role-scoped slice. Keep read-only and the "no hidden data" guarantee.

### 6.9 Agent payment details
- ✅ Agent-only form for Yape, bank, account, CCI with validation (9-digit Yape, 8–20-digit account, 20-digit CCI) and masking. Deliberately excluded from shared state, feed, documents and Q&A.
- 🔧 Store encrypted server-side; never returned to buyer or seller API responses unless the agent shares them explicitly.

### 6.10 Accounts, auth and settings
- ✅ Role switcher for demo; settings with profile and email-notification preferences; dark mode; collapsible sidebar; mobile menu.
- ➕ Real auth (email magic link recommended), invite-by-link for buyer and seller, one account can hold several roles across deals.

## 7. Functional requirements (v1)

| ID | Requirement | Priority |
|---|---|---|
| F1 | Authenticated accounts with role per deal (agent / buyer / seller) | P0 |
| F2 | Agent can invite buyer and seller to a deal by email or WhatsApp link | P0 |
| F3 | Server-side persistence of deals, tasks, documents, events, audit log | P0 |
| F4 | All reads and writes authorised by role and per-deal visibility settings | P0 |
| F5 | File upload and storage for documents, with status workflow | P0 |
| F6 | Task creation, assignment, completion, due dates, overdue state | P0 |
| F7 | Email notifications: task created, due soon, overdue | P0 |
| F8 | Audit trail on every state change (who, what, when) | P0 |
| F9 | Calendar of deal events; reminders for closing and inspection | P1 |
| F10 | Daily digest (in-app, optional email) | P1 |
| F11 | Stage task templates | P1 |
| F12 | Read-only Q&A scoped to viewer-visible data | P1 |
| F13 | Offline-tolerant, mobile-first UI (most buyers and sellers will use a phone) | P1 |
| F14 | Spanish (es-PE) UI, PEN currency, DD/MM date format; English optional | P1 |
| F15 | Data export of a deal's record (PDF/ZIP) | P2 |

## 8. Non-functional requirements

- **Privacy and security.** Documents contain DNI and property titles (personal data). Compliance with Peru's Ley de Protección de Datos Personales (Ley 29733) **[Assumption: confirm with counsel]**. Encryption in transit and at rest; signed, expiring download URLs; least-privilege access; audit log immutable.
- **Authorization is a server concern.** The demo hides things in the UI; v1 must not rely on that.
- **Accessibility.** WCAG 2.1 AA; labelled controls (already partly in place), reduced-motion support, keyboard navigation.
- **Performance.** Dashboard interactive in < 2 s on a mid-range Android phone over 4G.
- **Availability.** 99.5% target for v1.
- **Data residency.** Decide hosting region (see Open questions).

## 9. Success metrics

| Metric | Target (first 90 days after launch) |
|---|---|
| Agents with ≥ 3 active deals on Trato | 20 pilot agents |
| Buyer/seller invite → first task completed | ≥ 60% within 7 days |
| Tasks completed on or before due date | ≥ 75% |
| Median time from document request to "Subido" | −40% vs. agent's baseline |
| Agent-reported WhatsApp "status chasing" messages | −50% (survey) |
| Weekly active agents / pilot agents | ≥ 70% |

## 10. Current implementation snapshot

- **Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind, lucide-react, date-fns. Deployed target: Vercel **[Assumption]**.
- **Routes:** `/` (role dashboard), `/deals`, `/deals/new`, `/deals/[id]`, `/tasks`, `/documents`, `/calendar`, `/manage`, `/settings`.
- **State:** `src/lib/store.tsx`. A single shared store persisted to `localStorage` (`trato-demo-v2`), synced across tabs. Role is per tab. Seed data is in `src/lib/data.ts`, with demo "today" fixed at 2026-09-29.
- **Gaps for v1:** no backend, auth or file storage; WhatsApp sync is simulated; Q&A is keyword rules; photos are stored as data URLs in the browser; payments are in `localStorage`; no tests; README is the unmodified Next.js template.

## 11. Rollout plan

1. **Alpha (demo → internal).** Backend + auth + Postgres + file storage; one agent (the author's own deals).
2. **Pilot.** ~20 agents, invite-only; email notifications; weekly feedback sessions.
3. **GA.** Pricing, onboarding, support, data-protection documentation.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Buyers and sellers don't adopt another app | Link-based access, no install, WhatsApp deep links for nudges; first task completable in < 1 minute |
| Sensitive-document breach | Server-side authz, encrypted storage, short-lived URLs, pen-test before pilot |
| Agents see it as double entry | Task templates per stage; bulk-complete; import from WhatsApp is out of scope but linked |
| "Signed" status interpreted as legal e-signature | Explicit UI wording; integrate a certified provider later if needed |
| Notary and bank workflows vary by region | Configurable templates; start with Lima, expand to Arequipa |

## 13. Open questions

1. **Business model:** per-agent subscription, per-deal fee, or free for the pilot?
2. **Brokerage support:** will agencies with several agents (for example "Quispe Inmobiliaria") need shared deals and an admin role?
3. **WhatsApp:** deep links only, or the Business API for automated reminders (cost, template approval, opt-in)?
4. **Signatures:** is a certified e-signature (for example a Peruvian provider) required for v1?
5. **Seller visibility:** can sellers see buyer financing documents? The current model says no.
6. **Hosting and data residency:** is it acceptable to store DNI scans outside Peru?
7. **Product name:** the code uses "Trato" in its storage keys while the repo is `project-runners`. Which is the real name?
8. **Languages:** Spanish only, or Spanish and English for expat buyers?
