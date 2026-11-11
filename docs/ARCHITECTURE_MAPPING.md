# Architecture → Folder Mapping

Source diagrams: `docs/architecture/system-architecture.png` (layered service diagram) and
`docs/architecture/state-flows.png` (feature/session state diagram).

Folder layout follows the convention already established on `BYT-81-document-metadata-schema`
(the first real commits to this repo): a flat **`backend/`** + **`frontend/`** split — no
`apps/` monorepo wrapper, and no `modules/` subfolder — each domain sits directly under
`backend/src/<domain>` / `frontend/src/<domain>`. Domain folders are named after the resource
noun (`documents`, `events`, `discounts`...), matching `backend/src/documents/` from that
branch, rather than after the diagram's box labels. `frontend/types/` stays flat (one file per
domain, e.g. `document.ts`), also matching that branch.

## Client Layer → `frontend/src/<domain>`

| Diagram UI box | Folder(s) |
|---|---|
| Expense & Budget UI | `budget/` |
| Admin Panel UI | `admin/` |
| Academic Hub UI | `documents/` + `gpa/` (two domains share one UI box) |
| Campus Reels UI | `reels/` |
| Auth & Profile UI | `auth/` (+ `settings/` for privacy/language/theme — not its own UI box in the diagram) |
| AI Assistant UI | `assistant/` |
| Campus Feed & Events UI | `announcements/` + `events/` + `discounts/` (one UI box, three domains) |
| *(cross-cutting, not its own box)* | `notifications/` — bell/center used from every domain |

## Security & Routing Layer → `backend/src/common`

| Diagram box | Folder |
|---|---|
| API Gateway & Route Guards | Nest's global pipes/filters in `main.ts`, `common/filters` |
| RBAC & JWT Middleware | `common/guards`, `common/decorators`, `common/strategies` (note: the diagram labels this "Student, Admin" only — the backlog also requires a `moderator` role) |

## Backend Core Services → `backend/src/<domain>`

| Diagram box | Folder(s) |
|---|---|
| Reels & Media Service | `reels/` |
| Academic Documents Service | `documents/` (schema + DTOs already on `BYT-81`) + `gpa/` |
| Events & Perks Service | `events/` + `discounts/` |
| Budget & Analytics Service | `budget/` |
| Auth & User Service | `auth/` + `users/` |
| AI Assistant Service | `assistant/` |
| Notification Service | `notifications/` |
| Scraper Engine & Scheduler | `announcements/scraper/` (the diagram has no box that serves the paginated/bookmarkable feed itself — folded into `announcements/`) |
| *(not its own box, inferred from "actions are logged" AC)* | `admin/` — audit log + cross-domain moderation queue |
| *(not its own box, Epic 8 Settings story)* | `settings/` — language/theme/GDPR |

## External Providers & APIs → `backend/src/integrations`

| Diagram box | Folder |
|---|---|
| Faculty Noticeboards | consumed by `announcements/scraper` |
| OCR Vision Service | `integrations/ocr` (also used by `budget/receipt-ocr.service.ts`) |
| Email Service | `integrations/email` |
| External LLM Provider | `integrations/llm` |
| Cloud Object Storage | `integrations/storage` |

## Persistence & File Storage

| Diagram box | Folder |
|---|---|
| Primary Database (PostgreSQL) | `backend/prisma/schema.prisma` (has the real `Document` model from `BYT-81`) + `src/database` |
| Cloud Object Storage | `integrations/storage` (Cloudinary/S3 client) |

## State diagram (`state-flows.png`) → domain responsibilities

- `GuestSession` (landing/register/login/password recovery/onboarding) → `auth`
- `EventDraft → PendingEventApproval → EventPublished/EventFlagged/EventArchived` → `events` (backend) + `events`/`announcements` (frontend), notified via `notifications`
- `BrowseDocs → UploadingDoc → ValidatingFile → PublishedDoc → FlaggedDoc/RemovedDoc` → `documents`
- `IdleChat → StreamingPrompt → ContextAnalysis` → `assistant`
- `BudgetDashboard → ScanningReceipt → OCRProcessing → ManualCorrection → BudgetAlertTriggered` → `budget` + `integrations/ocr`
- `SuspendedUser` / `AccountDeleted` (admin ban, GDPR deletion) → `users` (ban) + `settings` (GDPR deletion)
