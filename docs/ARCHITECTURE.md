# BuildersConnect — System Architecture

**Production Baseline**
Platform: Ghana-focused home services marketplace
Date: 2026-04-26

---

## 1. Product Vision

BuildersConnect is a two-sided marketplace connecting Ghanaian homeowners (customers) with
verified tradespeople (builders, plumbers, electricians, carpenters, etc.).

The platform earns 10% commission on completed jobs.
Money is held via a PSP-controlled flow (Paystack) and released on job completion.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│    Next.js App (RSC + Client Components + Server Actions)        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                    NEXT.JS APP SERVER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  App Router  │  │ Server Actions│  │    API Route Handlers  │ │
│  │  (RSC + UI)  │  │  (mutations) │  │  (webhooks, uploads)   │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
│                             │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐ │
│  │                    Domain Services Layer                    │ │
│  │  auth/ | jobs/ | payments/ | disputes/ | notifications/    │ │
│  └──────────────────────────┬─────────────────────────────────┘ │
│                             │                                    │
│  ┌──────────────┬───────────┼──────────────┬──────────────────┐ │
│  │   Prisma ORM │  Pusher   │  Cloudinary  │    Paystack PSP  │ │
│  └──────┬───────┘  Server  │  (Storage)   │    (Payments)    │ │
│         │         Events   │              │                   │ │
└─────────│─────────────────────────────────────────────────────┘ │
          │                                                        │
┌─────────▼──────────┐   ┌───────────────┐   ┌────────────────┐
│   PostgreSQL DB     │   │ Pusher Channels│   │  Resend (Email)│
│  (Neon / Supabase)  │   │ (WebSockets)  │   │  Notifications │
└─────────────────────┘   └───────────────┘   └────────────────┘
```

---

## 3. Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 (App Router) | RSC, Server Actions, API route handlers, and Proxy in one codebase. Vercel-native. |
| Language | TypeScript | End-to-end type safety from DB to UI |
| Styling | Tailwind CSS + shadcn/ui | Production-grade, unstyled primitives, fully customisable |
| ORM | Prisma | Type-safe queries, excellent migration tooling |
| Database | PostgreSQL (Neon) | Relational, ACID, serverless-compatible |
| Auth | NextAuth v5 (Auth.js) | Role-aware sessions, credentials + email magic link |
| Real-time | Pusher Channels | Managed WebSockets — avoids needing a persistent server |
| Storage | Cloudinary | Image CDN, transformations, secure signed URLs |
| Payments | Paystack | Ghana's #1 PSP — GHS, mobile money (MTN/Vodafone/AirtelTigo), cards |
| Email | Resend | Transactional email with React components |
| Validation | Zod | Runtime schema validation, shared client/server |
| Deployment | Vercel | Zero-config Next.js, edge functions, automatic scaling |

---

## 4. User Roles and Access Model

```
Role            │ Code         │ Capabilities
────────────────┼──────────────┼────────────────────────────────────────────────
Customer        │ CUSTOMER     │ Post jobs, compare tradespeople, hire, pay, review
Tradesperson    │ TRADESPERSON │ Build profile, browse jobs, quote, chat, receive payout
Admin           │ ADMIN        │ All user management, verification queue, dispute resolution
Super Admin     │ SUPER_ADMIN  │ Admin management, platform config, financials
```

**Auth flow:**
1. User signs up → selects role (customer / tradesperson)
2. JWT session contains `{ userId, role, onboardingComplete }`
3. Next.js Proxy checks role before rendering protected route groups
4. Server Actions re-validate role server-side (never trust client)

---

## 5. Primary Application Modules

```
Module              │ Responsibility
────────────────────┼──────────────────────────────────────────────────────────
auth                │ Registration, login, session, role selection
onboarding          │ Role-specific profile collection, verification submission
jobs                │ Job CRUD, state machine, image uploads
matching            │ Interest/proposal submission, shortlisting, hiring
chat                │ Job-scoped threads, messages, image attachments, read states
payments            │ Payment initiation, commission, hold/release, payout, refunds
disputes            │ Case creation, evidence, timeline, resolution workflow
reviews             │ Post-completion mutual reviews, moderation
notifications       │ In-app + email for key events
admin               │ Operations dashboard — users, jobs, verification, financials
verification        │ Ghana Card collection, manual review queue, status workflow
```

---

## 6. Core Data Flows

### 6a. Customer posts a job and hires a tradesperson

```
Customer                Platform                  Tradesperson
────────                ────────                  ────────────
POST /jobs/post
  → job created (OPEN)
  → notifications sent ─────────────────────────→ receives job alert
                                                   browses job
                                                   submits interest + quote
  ← interest received
  compares proposals
  selects tradesperson
  shortlists             → chat thread opened ───→ can now chat
  hires tradesperson     → job → HIRED state
  pays platform          → payment HOLD created
                           commission split computed
                         → job → FUNDED
  (job in progress)
  confirms completion    → job → SUBMITTED_COMPLETE
                         → 24h dispute window
  releases funds         → payout to tradesperson
  leaves review
```

### 6b. Dispute flow

```
Either party
  → raises dispute
  → job → DISPUTED
  → payout FROZEN
  → dispute case OPEN
  → evidence uploads
  → admin review
  → decision (favour customer / tradesperson / partial)
  → payout released accordingly
  → dispute CLOSED
```

### 6c. Identity verification flow

```
Tradesperson registers
  → submits Ghana Card number + front image + selfie
  → verification record → PENDING
  → admin queue notified
  → admin reviews documents manually
  → admin: APPROVED → tradesperson.verificationStatus = VERIFIED
         : REJECTED → tradesperson notified with reason
  (Future: connect Ghana Card verification API for automated check)
```

---

## 7. Payment Architecture

### PSP: Paystack

Paystack is Ghana's leading payment gateway. It supports:
- **Card payments** (Visa, Mastercard)
- **Mobile Money** (MTN MoMo, Vodafone Cash, AirtelTigo Money)
- **GHS currency** natively

### Commission model

```
Gross payment (customer pays)  = Job agreed amount
Platform commission (10%)       = gross × 0.10
PSP fees (est. 1.5%)            = gross × 0.015  (deducted by Paystack)
Net tradesperson payout         = gross − commission − PSP fees
```

### Fund flow strategy

True escrow (holding funds between parties) requires explicit PSP licensing in Ghana.
**Pragmatic approach for launch:**

1. Customer pays into platform's Paystack account
2. Platform records a `PaymentHold` tied to the job
3. On completion: platform initiates Paystack Transfer to tradesperson's registered account/mobile money
4. On dispute: Transfer is withheld until resolved
5. Refunds: Paystack Refund API if still within settlement window; platform credit otherwise

This is a **"platform-controlled hold/release"** model — legally the platform is the merchant.
Regulatory note: Monitor Bank of Ghana payment service provider requirements as the platform scales.

---

## 8. Real-time Architecture (Chat)

**Pusher Channels** (managed WebSocket service):
- No persistent WebSocket server needed — compatible with Vercel serverless
- Each job gets a private Pusher channel: `private-job-{jobId}`
- Private job/dispute channel signatures are issued only after checking DB participation
- Messages are written to PostgreSQL via Server Action first (source of truth)
- Then a Pusher event is triggered: `new-message`
- Client subscribes on mount, updates UI from event
- On load, historical messages fetched from DB

```
Client A sends message
  → POST /api/messages (Server Action)
  → message saved to DB
  → pusher.trigger("private-job-{id}", "new-message", payload)
  → Client B receives WebSocket event
  → Client B updates chat UI in real time
```

---

## 9. Storage Architecture (Cloudinary)

All user-generated media is stored in Cloudinary with a structured folder hierarchy:

```
buildersconnect/
  profiles/           → profile photos
  ids/                → Ghana Card images (private, signed URLs only)
  qualifications/     → certification docs
  portfolio/          → tradesperson project images
  jobs/               → job posting images
  disputes/           → dispute evidence images
  chat/               → chat image attachments
```

**Security:**
- Ghana Card images are uploaded with `type: "private"` — inaccessible without a signed URL
- Signed URLs expire after 1 hour
- Uploads go through a server-side signed upload endpoint — never expose API secret to client
- Admin-only endpoints generate signed URLs for ID documents

---

## 10. Ghana-Specific Design Decisions

| Decision | Detail |
|---|---|
| Ghana Card verification | Manual review first, API-ready abstraction for future automation |
| Mobile money | Paystack handles MTN/Vodafone/AirtelTigo — supported at payment UI level |
| Currency | All amounts stored in GHS (pesewas as integer for precision) |
| Language | English (official), UI copy uses familiar Ghanaian phrasing |
| Phone format | Collect as +233XXXXXXXXX, validate for Ghana formats |
| Regions | Support all 16 Ghana regions as selectable service areas |

---

## 11. Security Design

- **RBAC**: Protected routes are guarded in Proxy; Server Actions and API routes validate session and ownership before proceeding
- **File uploads**: Signed upload presets, server validates file type/size before Cloudinary
- **Rate limiting**: Sensitive route handlers have an in-process limiter; production should back this with Redis/Upstash for multi-instance enforcement
- **Audit logs**: Schema support is present through `AuditLog`; admin/payment mutation paths should write audit events as those workflows are completed
- **ID documents**: Stored as private Cloudinary assets, served only via short-lived signed URLs to authorised parties
- **Payment webhooks**: Paystack HMAC verification helper exists; webhook route should call it before mutating payment state
- **CSRF**: Server Actions have built-in Next.js CSRF protection
- **SQL injection**: Not possible via Prisma parameterised queries

---

## 12. Major Risk Areas

| Risk | Mitigation |
|---|---|
| Ghana Card API unavailable | Manual review queue built first; modular abstraction ready for API |
| Paystack escrow limitations | Platform-controlled hold/release model with clear legal framing |
| Real-time on Vercel serverless | Pusher Channels — no persistent server required |
| Image storage costs | Cloudinary free tier → paid tier; compression at upload |
| Fraud / fake profiles | Manual verification before first job, reporting system, admin tools |
| Dispute gaming | Evidence requirements, admin decision logging, both parties can appeal |

---

## 13. External Service Assumptions

1. **Paystack** — account active, split payments / transfer API enabled
2. **Pusher** — Channels plan supports required concurrent connections
3. **Cloudinary** — standard plan; private assets feature available
4. **Resend** — domain verified, email delivery active
5. **Neon/Supabase** — managed PostgreSQL with connection pooling
6. **Vercel** — deployment target; environment variables configured per environment
