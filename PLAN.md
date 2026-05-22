# Bolão da Copa — Implementation Plan

## 1) Product Goal
Build a mobile-first PWA for World Cup sweepstakes ("bolão") where users can access via web and install on mobile devices, using:

- **Frontend:** Vite + React + TypeScript
- **Hosting:** Firebase Hosting
- **Database:** Cloud Firestore
- **Authentication:** Firebase Authentication
- **No custom backend server** (security and access control through Firestore Rules)

---

## 2) Scope (MVP)

### Core features
1. User authentication (Google login first).
2. Create a pool (`bolão`).
3. Join a pool via invite code.
4. View match list.
5. Submit/update predictions before match lock time.
6. Admin updates official results.
7. Ranking with automatic points calculation.
8. Installable PWA experience.

### Out of MVP (later)
- Push notifications.
- Advanced tie-breakers.
- Multiple tournaments/leagues.
- Social features (comments/chat).

---

## 3) Technical Architecture

### Frontend
- React Router for navigation.
- Firebase Web SDK for Auth + Firestore.
- `vite-plugin-pwa` for manifest and service worker.

### Data model (Firestore)
- `/users/{uid}`
- `/pools/{poolId}`
- `/pools/{poolId}/members/{uid}`
- `/matches/{matchId}`
- `/pools/{poolId}/predictions/{predictionId}`
- `/pools/{poolId}/leaderboard/{uid}`

### Security
- Only authenticated users can read/write protected data.
- Pool data readable only by pool members.
- Prediction updates only by prediction owner and only before lock.
- Official result and leaderboard writes restricted to admin/owner.

---

## 4) Delivery Phases

## Phase 0 — Project setup
- Finalize stack decisions and coding conventions.
- Prepare Firebase project and environments.
- Validate local setup and CI baseline.

**Output:** working local dev + Firebase connectivity.

## Phase 1 — Authentication and app shell
- Implement auth gate and session state.
- Build base layout and navigation.
- Add protected routes.

**Output:** signed-in users can access protected app sections.

## Phase 2 — Pool management
- Create pool flow.
- Invite code generation and join pool flow.
- Member role model (`owner/admin/member`).

**Output:** users can create and join pools.

## Phase 3 — Matches and predictions
- Match list UI by stage/date.
- Prediction create/update forms.
- Lock enforcement based on kickoff/locked time.

**Output:** users can submit predictions safely before deadline.

## Phase 4 — Results and scoring
- Admin workflow for official results.
- Apply scoring rules (`exact score`, `correct outcome`, optional bonuses).
- Update leaderboard data.

**Output:** rankings update consistently from official results.

## Phase 5 — PWA hardening
- Manifest and icons complete.
- Service worker update flow.
- Offline strategy for basic read experience.

**Output:** installable app-like experience on mobile.

## Phase 6 — Validation and release
- Unit tests for scoring and data guards.
- Firestore rules validation.
- Staging deploy checks and production release checklist.

**Output:** production-ready MVP.

---

## 5) CI/CD Plan

### Staging
- Trigger on pull requests to `main`.
- Install, build, deploy to Firebase Hosting staging channel.
- Comment preview URL automatically on the PR.

### Production
- Trigger on push to `main`.
- Install, build, deploy to Firebase Hosting live channel.

---

## 6) Risk & Mitigation

1. **Firestore security complexity**
   - Mitigation: keep rules explicit, test rule paths, review role checks.
2. **Data consistency for ranking**
   - Mitigation: deterministic scoring function + controlled update paths.
3. **Cost growth from reads/listeners**
   - Mitigation: query/index planning, pagination, avoid unnecessary listeners.
4. **PWA platform differences**
   - Mitigation: test install/update flows on Android and iOS.

---

## 7) Milestones (suggested)

- **Week 1:** phases 0–2
- **Week 2:** phases 3–4
- **Week 3:** phases 5–6 and production launch

---

## 8) Definition of Done (MVP)

- Users can authenticate, create/join pools, submit predictions, and view leaderboard.
- Admin can publish results.
- Firestore rules enforce role and membership boundaries.
- PWA is installable and usable on mobile browsers.
- Staging and production deploy pipelines are green.
