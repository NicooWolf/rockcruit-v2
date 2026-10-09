# ROCKCRUIT — Website v2

> This document uses ASD-STE100 (Simplified Technical English).
> This document gives context to AI agents and to human developers.
> Read this document before you change the code.

---

## 1. ABOUT ROCKCRUIT

Rockcruit is a boutique tech-recruiting company. It operates in LATAM.
The company finds tech and digital talent with active hunting. It does not wait for applications.
Clients are companies in Argentina and the USA that hire talent in LATAM.
The company gives two service models: Contingency Recruiting and Recruiting as a Service (RaaS).
This repository contains the public website of the company.

---

## 2. PROJECT SUMMARY

| Item                     | Value                                                 |
| ------------------------ | ----------------------------------------------------- |
| Project type             | Static website                                        |
| Framework                | Astro v2                                              |
| Content source (blog)    | Headless WordPress on Hostinger                       |
| Blog API                 | WPGraphQL + WPGraphQL-for-ACF                         |
| Forms                    | EmailJS                                               |
| Current deploy target    | GitHub Pages                                          |
| Production deploy target | Hostinger static hosting (hPanel Git deploy)          |
| CI/CD                    | GitHub Actions                                        |
| Build model              | Pure static. A new build starts when content changes. |

---

## 3. KEY FILES

| File                      | Purpose                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------ |
| `AGENTS.md`               | AI-Agents context & architecture rules. Read this file first.                              |
| `CLAUDE.md`               | Claude-scoped architecture rules.                                                          |
| `astro.config.mjs`        | Astro configuration. Contains `site` and `base`. Do not remove `site`.                     |
| `src/lib/wp.ts`           | WordPress data layer. Contains the `WP_ENABLED` kill switch. Contains `TODO(ACF)` markers. |
| `src/lib/url.ts`          | Base-aware `href()` helper. Use it for all internal links.                                 |
| `.env`                    | Secret keys (EmailJS). Never commit this file.                                             |
| `.github/workflows/*.yml` | CI pipeline. `WP_ENABLED` must be under `env:`.                                            |

---

## 4. KEY DIRECTORIES

| Directory         | Content                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `src/pages/`      | Route pages: `index.astro`, `services.astro`, `team.astro`, `process.astro`, `faq.astro`. |
| `src/pages/blog/` | Blog routes. They read data from WordPress at build time.                                 |
| `src/components/` | UI components. Includes `Nav`, `Footer`, and the shared `HireForm`.                       |
| `src/layouts/`    | Base page layout.                                                                         |
| `src/lib/`        | Data and utility code (`wp.ts`, `url.ts`).                                                |
| `src/assets/`     | Images that Astro processes.                                                              |
| `public/`         | Static files. Astro copies them without change.                                           |

---

## 5. TECHNOLOGIES / PACKAGES / DEPENDENCIES

| Technology             | Role                     | Notes                                                |
| ---------------------- | ------------------------ | ---------------------------------------------------- |
| Astro v2               | Static site generator    | All pages build to static HTML.                      |
| WPGraphQL              | Blog content API         | Only active when `WP_ENABLED=true`.                  |
| WPGraphQL-for-ACF      | Custom fields API        | Field list is not final. See `TODO(ACF)` in `wp.ts`. |
| EmailJS                | Contact and hire forms   | Keys live in `.env`. A domain allowlist is active.   |
| IntersectionObserver   | Scroll reveal animations | Lightweight. No animation library is required.       |
| Astro View Transitions | Page transitions         | Optional enhancement.                                |
| Motion One             | Extra animation          | Use only if necessary.                               |
| GitHub Actions         | CI/CD                    | Builds and deploys the site.                         |

---

## 6. ENTRY POINTS

| Entry point                | Description                                                                   |
| -------------------------- | ----------------------------------------------------------------------------- |
| `src/pages/index.astro`    | Home page. Main entry for users. Contains the shared `HireForm`.              |
| `src/pages/services.astro` | Services page. Anchors: `#contingency`, `#raas`, `#contact`.                  |
| `astro.config.mjs`         | Main entry for the build. Sets `site` and `base`.                             |
| `.github/workflows/*.yml`  | Main entry for CI. Sets `WP_ENABLED` under `env:`.                            |
| `src/lib/wp.ts`            | Single entry for all WordPress data. Do not query WordPress from other files. |

---

## 7. ARCHITECTURE

### 7.1 Data flow

```
WordPress (Hostinger)
   │  WPGraphQL + ACF, build time only
   ▼
src/lib/wp.ts  ── WP_ENABLED=false → static fallback, no network
   │
   ▼
Astro build (GitHub Actions)
   │
   ▼
Static HTML/CSS/JS → GitHub Pages (now) / Hostinger (production)
```

### 7.2 Rules

1. The site is fully static. The browser never calls WordPress.
2. `wp.ts` is the only WordPress access point.
3. `WP_ENABLED=false` must give a successful build with no network access.
4. When `WP_ENABLED=false`, the `showBlog` flag hides the Blog link in `Nav` and `Footer`.
5. Use the `href()` helper from `src/lib/url.ts` for all internal links. GitHub Pages uses `BASE_URL=/rockcruit-v2/`.
6. The HTML prototypes (`index.html`, `services.html`) are the source of truth for design and copy. The v1 React code is not.
7. EmailJS sends the forms from the client. Keep the keys in `.env`.

### 7.3 Locked design decisions

- Dark editorial style. Fonts: Bebas Neue, Instrument Serif, DM Sans, DM Mono.
- Accent colors: green `#72d6aa`, violet `#b186f1`.
- Accent tints: `--green-light` `#b7fadf`, `--violet-light` `#caacf9`, `--violet-dark` `#5603ad`.
- `global.css` holds every color. Use a variable. Do not write a raw color value.
- `--bdark` opacity: `.06`.
- No custom cursor. Interactive elements use `cursor:pointer`.
- Services dropdown order: 01 RaaS / 02 Contingency.
- The Process page uses the real `recruitingProcessCards` copy from v1.
- FAQ answers use only facts from the prototypes.

---

## 8. OPEN WORK (BLOCKED)

| Item                            | Blocker                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------- |
| Real GraphQL queries in `wp.ts` | ACF field names and types are not final.                                        |
| Real team cards in `team.astro` | Team content is not available. One real card exists (Juli Wolf).                |
| "Open Positions" nav link       | Final destination is not defined. It points to `/#contact`.                     |
| WP publish → rebuild webhook    | Hostinger path is not verified. Fallback: GitHub Actions `repository_dispatch`. |

---

## 9. SECURITY RULES

1. Never commit `.env`.
2. Do an audit of the repository before you make it public.
3. The EmailJS domain allowlist must stay active.
