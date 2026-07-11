## Rollout plan

This is too much for a single turn. I'll ship it in 4 phases, each a separate follow-up turn so we can verify between them.

### Phase 1 — Branding, responsive pass, admin dashboard redesign
- Upload the new Africa/Daryl Tech logo as a Lovable asset; swap `src/assets/dten-logo.webp` references in Navbar, Footer, DashboardSidebar, Hero (where it appears "below" the header).
- Responsive audit: comb through `Index`, `Courses`, `Enroll`, `AdminDashboard`, `StaffDashboard`, `StudentDashboard` for fixed widths, overflow, and tap-target sizes. Add `min-w-0`, `truncate`, `flex-wrap`, `overflow-x-auto` where needed; verify at 360/414/768/1024/1440.
- Redesign `AdminDashboard.tsx` based on the Figma reference: KPI cards row, charts row (enrollment trend + revenue), recent activity feed, quick actions panel, students/staff tables with sticky headers. Same shell extended to Staff & Student dashboards (lighter).

### Phase 2 — Email OTP signup + Cloudflare Turnstile
- Enable Lovable auth email infra + scaffold auth templates, switch signup to **email OTP** (6-digit code via `signInWithOtp` + `verifyOtp`). New `Auth.tsx` flow: enter email → enter 6-digit code → set password.
- Add Cloudflare Turnstile widget to `Auth.tsx` (signup) and `Enroll.tsx`. New edge function `verify-turnstile` validates token server-side using the Cloudflare siteverify API. Add `TURNSTILE_SECRET_KEY` and `VITE_TURNSTILE_SITE_KEY` (requested via secrets form).

### Phase 3 — Learning platform features
- **Quiz scoring**: new `quiz_attempts` table (user_id, lesson_id, score, max_score, answers jsonb). Update `QuizComponent` to POST attempts. Admin view: per-student quiz results table.
- **Assignment submission**: enhance `AssignmentComponent` with file upload UI → `task-submissions` bucket; staff/admin review surface already partially exists, polish it.
- **Active-enrollment gate**: `CourseContent.tsx` checks `enrollments.status='Active' AND payment_status='paid'` for current user before rendering; redirect deactivated students.
- **Progress analytics**: aggregate from `lesson_progress` + `quiz_attempts` → completion %, avg quiz score, lessons completed per course. New charts on Admin dashboard.

### Phase 4 — Drag-and-drop module/lesson reordering
- Add `@dnd-kit/core` + `@dnd-kit/sortable`. In `AdminCourseCMS.tsx`, wrap module list and per-module lesson list in sortable contexts. On drop, batch-update `position` column for affected rows.

### Technical notes
- DB migrations needed in Phase 3 (quiz_attempts) — single migration with GRANTs + RLS.
- OTP flow disables email-link confirmation; uses `auth.signInWithOtp({ email, shouldCreateUser: true })` then `verifyOtp({ email, token, type: 'email' })`.
- Turnstile keys: site key is public (goes in `.env` as `VITE_TURNSTILE_SITE_KEY`), secret is server-only.
- Items 10–15 (Paystack receipt, verify, webhook, social links) confirmed already done — no rework.

### Sequence
Start Phase 1 now. After it lands and you've eyeballed it, say "continue" and I'll do Phase 2, and so on.