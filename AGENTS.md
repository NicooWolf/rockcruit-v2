# AGENTS.md — ROCKCRUIT Website v2

> This document uses ASD-STE100 (Simplified Technical English).
> This document gives operating rules to AI coding agents.
> `README.md` gives project context. This document gives commands and limits.
> If a rule here disagrees with `README.md`, obey this document.

---

## 0. LANGUAGE RULE — MANDATORY

**Every agent MUST write and answer in ASD-STE100 (Simplified Technical English).**

This rule applies to all output:

- Chat answers to the owner.
- Commit messages and pull request bodies.
- Code comments and documentation.
- Task reports. See section 12.

Write in this manner:

- Use one idea for each sentence. Use 20 words or less.
- Use the active voice. Name the agent of the action.
- Use one approved word for one meaning. Do not use a synonym.
- Use the simple verb tenses. Do not use a complex tense.
- Write instructions as commands. Start with the verb.
- Do not use jargon, an idiom, or a metaphor.
- Do not use an emoji.

This rule has no exception.

---

## 1. AGENT ROLE

You are a coding agent on a static Astro v2 website.
You change code. You do not change product decisions.
Ask the owner before you change a locked decision. See section 8.

---

## 2. SETUP

```bash
npm install
```

Requirements:

- Node 24.12 or a later version.
- A `.env` file in the repository root. Copy `.env.example` and add the values.

Never create, print, or commit real secret values.

---

## 3. COMMANDS

| Command           | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Start the local server.                           |
| `npm run build`   | Build the static site to `dist/`.                 |
| `npm run preview` | Serve the built site. Use it to verify the build. |
| `npx astro check` | Check types and Astro syntax.                     |

Run `npm run build` before you report that a task is complete.
A task is not complete if the build fails.

---

## 4. VERIFICATION LOOP

Do these steps in this order for every task:

1. Read the files that relate to the task.
2. Make the change.
3. Run `npx astro check`.
4. Run `npm run build` with `WP_ENABLED=false`.
5. Run `npm run build` with `WP_ENABLED=true` if you changed `src/lib/wp.ts`.
6. Report the result. Give the command output if an error occurs.

The build must pass with `WP_ENABLED=false` and no network access.
This rule has no exception.

---

## 5. CODE RULES

### 5.1 Links

Use the `href()` helper from `src/lib/url.ts` for every internal link.

```astro
---
import { href } from "../lib/url";
---

<a href={href("/services")}>Services</a>
```

Do not write a hard-coded internal path. GitHub Pages uses `BASE_URL=/rockcruit-v2/`.
A hard-coded path breaks the navigation on GitHub Pages.

### 5.2 WordPress data

`src/lib/wp.ts` is the only file that queries WordPress.
Do not call WPGraphQL from a page, a component, or a layout.
Do not remove the `WP_ENABLED` kill switch.
Do not delete a `TODO(ACF)` marker. The ACF field list is not final.
Do not invent an ACF field name. See section 9.

### 5.3 Astro configuration

Keep the `site` value in `astro.config.mjs`.
`new URL()` fails if `Astro.site` is undefined. Keep the defensive check.

### 5.4 Styles

Use the CSS variables. Do not write a raw color value.

| Variable         | Value                   |
| ---------------- | ----------------------- |
| `--green`        | `#72d6aa`               |
| `--green-light`  | `#b7fadf`               |
| `--violet`       | `#b186f1`               |
| `--violet-light` | `#caacf9`               |
| `--violet-dark`  | `#5603ad`               |
| `--paper`        | `#f0ede3`               |
| `--ink`          | `#141210`               |
| `--bdark`        | `rgba(240,237,227,.06)` |

`--green-light` is the hover color of a green button.
`--violet-light` is the violet color of text on a dark background.

Use a companion triplet for a tint. `rgba()` cannot read a hex from a variable.

| Variable             | Value           |
| -------------------- | --------------- |
| `--green-rgb`        | `114, 214, 170` |
| `--green-light-rgb`  | `183, 250, 223` |
| `--violet-rgb`       | `177, 134, 241` |
| `--violet-light-rgb` | `202, 172, 249` |

```css
background: rgba(var(--green-rgb), 0.1);
```

Each triplet must stay equal to its hex value. Change both lines together.

Fonts: Bebas Neue, Instrument Serif, DM Sans, DM Mono. Do not add a font.
Use `cursor:pointer` on interactive elements. Do not add a custom cursor.

### 5.5 Components

Reuse `HireForm`. The Home page and the Services page share this component.
Do not create a second form component.

### 5.6 Content

The HTML prototypes are the source of truth for design and copy.
Do not copy from the v1 React code. The v1 code is a single-page application.
Do not write new marketing copy. Ask the owner for the text.

---

## 6. CI/CD RULES

The workflow files are in `.github/workflows/`.
Put `WP_ENABLED` under `env:`. Do not put it directly on the step.
A wrong position causes an invalid YAML file.

---

## 7. SECURITY RULES

1. Never commit `.env`.
2. Never print a key value in a log, a comment, or a commit message.
3. Never add a secret to a file in `public/`. Astro copies that directory to the client.
4. Tell the owner immediately if you find a secret in the repository history.

---

## 8. LOCKED DECISIONS — DO NOT CHANGE

Ask the owner before you change one of these items:

- Services dropdown order: 01 RaaS, then 02 Contingency.
- `--bdark` opacity: `.06`.
- The Blog link is in `Nav` and in `Footer`. The `showBlog` flag hides it when `WP_ENABLED=false`.
- `HireForm` is shared between the Home page and the Services page.
- The Process page uses the `recruitingProcessCards` copy from v1.
- The FAQ answers use only facts from the prototypes.
- The "Open Positions" link points to `/#contact`.

---

## 9. BLOCKED WORK — DO NOT GUESS

Stop and ask the owner if a task needs one of these items:

| Item                            | Missing information                        |
| ------------------------------- | ------------------------------------------ |
| Real GraphQL queries            | ACF field names and types.                 |
| Real team cards in `team.astro` | Team member content. One real card exists. |
| "Open Positions" destination    | The final URL.                             |
| WordPress rebuild webhook       | The Hostinger webhook path.                |

Do not write a placeholder that looks like real content.
A wrong guess is worse than an open question.

---

## 10. FILE PERMISSIONS

| Path                 | Permission                                       |
| -------------------- | ------------------------------------------------ |
| `src/`               | You can edit.                                    |
| `public/`            | You can edit. Never add a secret.                |
| `astro.config.mjs`   | You can edit. Keep `site` and `base`.            |
| `.github/workflows/` | You can edit. Obey section 6.                    |
| `.env`               | Never edit. Never read the values aloud.         |
| `CLAUDE.md`          | Never edit. The owner updates this file by hand. |

---

## 11. COMMIT AND PULL REQUEST RULES

Use Conventional Commits.

```
feat(nav): add base-aware href helper to the dropdown
fix(wp): keep the build green when WP_ENABLED is false
docs(readme): add the architecture diagram
chore(ci): move WP_ENABLED under env
```

Rules:

- Write one logical change for each commit.
- Write the subject line in the imperative form. Use 72 characters or less.
- Do not commit `dist/` or `node_modules/`.
- Give this information in the pull request body:
  1. What changed.
  2. Why it changed.
  3. The build result.
  4. Every open question.

---

## 12. REPORT FORMAT

Give this structure when you complete a task:

```
CHANGED:  <file paths>
WHY:      <one sentence>
BUILD:    pass | fail
BLOCKED:  <open questions, or "none">
```

Keep the report short. Do not repeat the code in the report.
