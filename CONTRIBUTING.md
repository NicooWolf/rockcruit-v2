# CONTRIBUTING — ROCKCRUIT Website v2

> This document uses ASD-STE100 (Simplified Technical English).
> This document gives the branch, pull request, and release rules.
> `AGENTS.md` gives the rules for AI agents. `README.md` gives the project context.

---

## 1. BRANCHES

| Branch      | Purpose                                      | Deploys to                                    |
| ----------- | -------------------------------------------- | --------------------------------------------- |
| `feature/*` | One logical change. Also `fix/*`, `chore/*`. | Nothing.                                      |
| `dev`       | Integration and preview.                     | https://nicoowolf.github.io/rockcruit-v2/dev/ |
| `main`      | Production source.                           | Nothing directly. See section 4.              |
| `release`   | Built site only. CI writes this branch.      | https://rockcruit.com (Hostinger pulls it).   |

Rules:

- Create each work branch from `dev`.
- Never push to `dev` or `main` directly. Use a pull request.
- Never edit, protect, or delete the `release` branch. CI force-pushes to it.
- Delete the work branch after the merge. GitHub does this automatically.

---

## 2. PULL REQUEST TITLE

The PR title must be a Conventional Commit. The `PR title` check fails if it is not.

```
<type>(<optional scope>): <subject in lower case>
```

| Type       | Use it for                         | Version change |
| ---------- | ---------------------------------- | -------------- |
| `feat`     | A new feature.                     | Minor          |
| `fix`      | A bug fix.                         | Patch          |
| `perf`     | A performance change.              | Patch          |
| `feat!`    | A change that breaks the site.     | Major          |
| `refactor` | A code change with no new feature. | None           |
| `style`    | Format only.                       | None           |
| `docs`     | Documentation only.                | None           |
| `test`     | Tests only.                        | None           |
| `build`    | Build system or dependencies.      | None           |
| `ci`       | Workflow files.                    | None           |
| `chore`    | Other maintenance.                 | None           |
| `revert`   | Revert of an earlier commit.       | None           |

Examples:

```
feat(blog): add the post reading time
fix(nav): close the mobile menu on a link click
chore(ci): split the dev and production pipelines
```

Write one logical change for each pull request.
A squash merge makes one CHANGELOG line from one pull request.

---

## 3. MERGE METHOD

| Pull request                | Merge method          | Why                                                        |
| --------------------------- | --------------------- | ---------------------------------------------------------- |
| `feature/*` → `dev`         | Squash and merge      | One clean commit for each PR. The PR title is the message. |
| `dependabot/*` → `dev`      | Squash and merge      | Same as a feature.                                         |
| `dev` → `main`              | Create a merge commit | Keeps each commit. release-please reads each one.          |
| `main` → `dev` (back-merge) | Create a merge commit | Git records that `dev` has the release commit.             |
| release-please PR → `main`  | Squash and merge      | The release-please default.                                |

Do not use "Rebase and merge".
Never squash `dev` → `main` or `main` → `dev`. A squash loses the link between the branches.
The next pull request then gets conflicts in `CHANGELOG.md` and `package.json`.

GitHub cannot select the merge method from the branch name.
The rulesets allow only the correct methods. You select the method from the table above.

---

## 4. RELEASE FLOW

```
feature/*  ──squash──▶  dev  ──merge commit──▶  main
                          │                       │
                          ▼                       ▼
                 GitHub Pages /dev        release-please PR
                 pre-release dev-N               │ merge
                                                 ▼
                                    tag vX.Y.Z + GitHub Release
                                                 │ approval (production)
                                                 ▼
                                   release branch ──▶ Hostinger
```

1. Merge a feature PR into `dev`. `deploy-dev.yml` publishes the preview and makes a `dev-N` pre-release.
2. Open a PR from `dev` to `main`. Use "Create a merge commit".
3. `release-please.yml` opens a release PR. It shows the new version and the CHANGELOG.
4. Merge the release PR. release-please makes the tag `vX.Y.Z` and the GitHub Release.
5. Approve the `production` deployment in the Actions tab.
6. `deploy-production.yml` pushes the built site to the `release` branch. Hostinger pulls it.
7. Open a PR from `main` to `dev`. Use "Create a merge commit".

Rollback: run **Actions → Deploy production → Run workflow** with an earlier tag. Approve the deployment.

---

## 5. WORKFLOWS

| File                                      | Trigger                | Job                                                    |
| ----------------------------------------- | ---------------------- | ------------------------------------------------------ |
| `.github/workflows/ci.yml`                | PR to `dev` or `main`  | `Check and build`: astro check, lint, build (no blog). |
| `.github/workflows/pr-title.yml`          | PR to `dev` or `main`  | `PR title`: Conventional Commit title check.           |
| `.github/workflows/deploy-dev.yml`        | Push to `dev`          | Pages deploy to `/dev`. Pre-release `dev-N`.           |
| `.github/workflows/release-please.yml`    | Push to `main`         | Release PR, tag, GitHub Release. Calls the deploy.     |
| `.github/workflows/deploy-production.yml` | Release, or manual run | Build a tag. Push `dist/` to `release`.                |
| `.github/dependabot.yml`                  | Weekly                 | Update GitHub Actions. PRs target `dev`.               |

---

## 6. VARIABLES AND SECRETS

Set them in **Settings → Secrets and variables → Actions**. Never put a value in a file.

| Name                         | Type     | Value                                                           |
| ---------------------------- | -------- | --------------------------------------------------------------- |
| `PUBLIC_EMAILJS_PUBLIC_KEY`  | Secret   | EmailJS public key.                                             |
| `PUBLIC_EMAILJS_SERVICE_ID`  | Secret   | EmailJS service ID.                                             |
| `PUBLIC_EMAILJS_TEMPLATE_ID` | Secret   | EmailJS template ID.                                            |
| `RELEASE_PLEASE_TOKEN`       | Secret   | Fine-grained token. Contents and Pull requests: read and write. |
| `BLOG_ENABLED`               | Variable | `false` or `true`. Production only.                             |

---

## 7. GITHUB SETTINGS

These settings are not in the repository. Keep them equal to this list.

| Setting                          | Value                                                               |
| -------------------------------- | ------------------------------------------------------------------- |
| Pages → Source                   | GitHub Actions                                                      |
| Actions → Workflow permissions   | Read and write. Allow Actions to create and approve PRs.            |
| Environments                     | `development` (no rules), `production` (required reviewer).         |
| General → Pull Requests          | Merge commits and squash on. Rebase off. Delete head branches on.   |
| Ruleset `main` and ruleset `dev` | Require a PR. Allowed methods: Merge, Squash.                       |
|                                  | Required checks from GitHub Actions: `Check and build`, `PR title`. |
|                                  | Block force pushes. Restrict deletions.                             |
| Ruleset for `release`            | None.                                                               |
