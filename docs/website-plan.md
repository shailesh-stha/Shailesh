# Website Plan — Phase 1 Update & Phase 2 Roadmap

Written 2026-08-05. Covers the Phase 1 cleanup done this session on the
existing static site, and the Phase 2 plan for a domain + hosting + database
rebuild, carried over from a prior discussion. Two phases, deliberately kept
separate: Phase 1 ships something real today at zero new infrastructure;
Phase 2 is a bigger, riskier jump and shouldn't block on Phase 1 or vice
versa.

---

## 1. Where things stood before this session

Live site: `shailesh-stha.github.io/Shailesh`, hosted on GitHub Pages.
Vanilla HTML/CSS/JS, no build step, no framework, no backend.

Audit findings before any changes:

- **Broken assets shipping live.** The Projects and Blog sections referenced
  six files that don't exist in `assets/`: `project-video.mp4`,
  `project-video-poster.jpg`, `bbox-extractor.png`, `blog1.jpg`, `blog2.jpg`,
  `blog3.jpg`. Both sections were placeholder content behind a "Coming Soon"
  blur overlay, but the broken references were live on the public site
  regardless.
- **Dead code**: a Google Analytics snippet (`G-GSYQV36317`) and a Three.js
  CDN `<script>` tag that nothing on `main` actually used.
- **An unmerged branch**, `feat-immersive-hero-visualization`, added a
  Three.js particle hero effect. Reviewed and **not merged** — it recomputes
  proximity for all ~500 particle pairs (~125,000 comparisons) every single
  animation frame, allocating new `THREE.Vector3` objects each time. That's
  real jank and battery drain, not production-ready as committed. It also
  bundled an unrelated full color-palette change. Decision: drop it, keep
  the current text-only hero.
- **An older branch**, `redesign-portfolio`, contained a superseded
  Express + SQLite + `docs/`-folder experiment (the server had no real
  routes, the database was never wired to anything). Decision: leave it
  alone in git history, don't build on it.
- **Wheel-scroll hijack without a Ctrl/Cmd exception.** `index.js` overrides
  all mouse-wheel scrolling to enforce a fixed scroll distance
  (`initCustomScrollDistance`), calling `preventDefault()` unconditionally.
  This silently broke the browser's Ctrl/Cmd+scroll zoom gesture — a real
  accessibility regression. Fixed narrowly (skip the override when
  `ctrlKey`/`metaKey` is held); the deliberate fixed-distance scroll
  behavior itself was left alone since it looked like an intentional design
  choice, not a bug.
- **No `README.md`, no `robots.txt`, no Open Graph/Twitter card tags, no
  canonical URL, stale hardcoded copyright year (2025).**

## 2. What changed in Phase 1

All changes are on `main`, uncommitted at the time of writing (see §5).

**Removed:**
- Google Analytics snippet and the unused Three.js `<script>` tag.
- Six broken asset references and their surrounding placeholder markup
  (the fake n8n iframe project, the fake video-demo project, "Project
  Three", three fake blog posts).
- Dead CSS for the removed placeholder markup (`.project-card--coming-soon`,
  `.project-embed` and its children) — confirmed unused via grep before
  deleting.

**Added:**
- Four real project cards in place of the placeholders: **RootsReady**,
  **HistoryBroom**, **Deutly**, **EcoSphere** — picked as the four most
  "shipped" projects in the portfolio (per `PROJECTS.md` in the parent
  `_work` folder). Each card has a real screenshot, tech stack line, a
  one-line description, and a GitHub link.
- `robots.txt`, `README.md`, `docs/website-plan.md` (this file).
- Open Graph + Twitter Card meta tags, `rel="canonical"`, and an
  `apple-touch-icon` (reusing the existing unused `logo256.png` rather than
  adding a new asset).
- `.project-stack` CSS rule (reuses existing design tokens, no new colors).
- A self-updating copyright year (`new Date().getFullYear()` via a new
  `initCopyrightYear()` in `index.js`) instead of a value that goes stale
  every January.

**Left alone, deliberately:**
- The Blog section keeps its existing "Coming Soon" blur overlay
  (`is-under-construction`) — now with a clean, honest empty state instead
  of fake posts with broken images. No content was invented.
- The custom fixed-distance wheel scroll (`SCROLL_DISTANCE = 400`) — looked
  intentional, only the accessibility gap around it was fixed.

### How the four project screenshots were captured

No stock photos, no invented content — all four are real, live captures
taken this session:

| Project | Method | Notes |
|---|---|---|
| **RootsReady** | Served `RootsReady/dist/` locally (`python -m http.server`), opened `app.html`, worked through onboarding, screenshotted an actual practice question. | Built extension `dist/`, loaded via `file://`/local server rather than as an unpacked Chrome extension — the "Load unpacked" flow needs a native OS file picker that browser automation can't drive. |
| **HistoryBroom** | Used the project's own existing `promo_small_440x280.jpg` — it already had finished promo art, no capture needed. | Only project in the four with pre-existing marketing assets. |
| **Deutly** | Ran `npm run dev` (frontend + backend via `concurrently`), screenshotted the landing page. | Backend logged "Supabase credentials are not fully configured" — ran in degraded mode, but the marketing/landing UI doesn't need it. |
| **EcoSphere** | Ran `npm run dev` (client + server workspaces), opened the sandbox, placed sheep/foxes/trees/bushes, let the simulation run a few seconds, screenshotted the populated ecosystem. | Also ran in Supabase-degraded "guest mode" — sandbox itself needs no backend. |

All four dev servers were stopped after their screenshots were captured; the
images live in `assets/projects/`.

### Repo visibility, and the Deutly ownership question (resolved)

Checked GitHub visibility for all four repos before linking them:

| Repo | Owner | Public? |
|---|---|---|
| RootsReady | `shailesh-stha` | No (private) |
| HistoryBroom | `shailesh-stha` | **Yes** |
| Deutly-1 | `Shrestha-Sandeep` | No (private) |
| EcoSphere | `shailesh-stha` | No (private) |

Per your call, RootsReady, HistoryBroom, and EcoSphere link to their real
GitHub URLs regardless of visibility — visitors without access will hit a
private-repo wall for the two that are private. **Deutly-1's remote is
under a different account** (`Shrestha-Sandeep`, not `shailesh-stha`) — this
matches a stale flag already in `PROJECTS.md` ("remote sits under a
different GitHub owner — clarify ownership before commercialising"). Per
your decision, the Deutly card **has no "View on GitHub" button** — it
still shows the screenshot, stack, and description, just no repo link,
until ownership is actually resolved.

## 3. Phase 2 — domain, hosting, database (recap + how it applies here)

This is the plan from the earlier conversation, restated against this
specific site now that its real content exists.

| Piece | Choice | Why |
|---|---|---|
| Domain | Cloudflare Registrar or Porkbun | At-cost pricing, no markup |
| Hosting | Vercel free tier + Next.js | Frontend + API routes + blog SSG in one deploy, no server to run/pay for at portfolio-level traffic |
| DB/Auth/Storage | Supabase free tier | Already the de facto standard elsewhere in the `_work` portfolio (Deutly, SpotlightMap, graph-chat, EcoSphere, the-prompt-stash) |
| Design | Vendor `fernglas` | Same `check-consumers.mjs` staleness check already used on other projects |

Data model carries over unchanged: three tables — `projects`, `posts`,
`messages` (contact form target) — plus a single admin-gated `/admin` route
using Supabase Auth, RLS policies doing public-read/admin-write.

**What's different now that Phase 1 exists:** the Next.js rebuild has real
project copy, real screenshots, and a real information architecture
(intro/skills/experience/certifications/projects/blog/contact) to port over
instead of designing from scratch. The blog's "Coming Soon" state and the
`posts` table are the same open slot — Phase 2's CMS is literally what fills
in what Phase 1 left honestly empty.

**Not started.** No domain purchased, no Supabase project created for this
site, no Next.js scaffold. This section is a plan, not a status update.

## 4. Suggested order for Phase 2, when you're ready

1. Buy the domain (independent of everything else — do this whenever).
2. Scaffold Next.js, vendor `fernglas`, port over the four project cards and
   the rest of the static content as a like-for-like rebuild first —
   resist adding the CMS/blog/contact-form backend until the static port
   is visually verified against the current site.
3. Create the Supabase project, wire the three tables + RLS policies.
4. Build `/admin`, then the contact form, then the blog last (it's the
   piece with the most ongoing content cost — see `PROJECTS.md`'s
   observation that "documentation far outruns tests" and unfinished work
   accumulates across this portfolio; don't let the blog CMS become another
   unmerged branch).
5. Point the new domain at Vercel, keep the GitHub Pages site live until
   DNS cutover is verified.

## 5. Not done — needs your decision

- **Nothing has been committed or pushed.** All Phase 1 changes above exist
  only in the local working tree at `N:\_work\Shailesh`, pending your review.
- Google Analytics tag: removed per your instruction, not re-added anywhere
  (Phase 2 would need a fresh analytics decision — GA4, Plausible, or
  none — since the removed property may or may not still be yours).
