# ClinikEHR Help Center

Source for [help.clinikehr.com](https://help.clinikehr.com) — the user-facing
how-to knowledge base for ClinikEHR, built with [Mintlify](https://mintlify.com).

This directory is the **only** part of the ClinikEHR repo that is published
publicly. Everything else in this repo — including the internal `docs/`
directory of architecture notes, security advisories and implementation plans —
stays private and must never be linked to or quoted from here.

## Layout

```
knowledge-base/
├── docs.json              # Site config + the whole navigation tree (the spec)
├── style.css              # Brand tokens and component styling
├── STYLE-GUIDE.md         # The authoring contract — read before writing
├── index.mdx              # Landing page
├── start/                 # Orientation: editions, concepts, tour, glossary
├── clinic/                # Clinic & Hospital edition (full)
├── pharmacy/              # Pharmacy edition
├── lims/                  # Diagnostics edition (LIMS)
├── portal/                # Patient portal — for patients, and for clinics
├── platform/              # Shared: account, plans, team, security, apps
├── snippets/              # Reusable MDX components (Availability, Path, …)
├── images/                # Screenshots, by section
├── logo/                  # Wordmarks (light/dark)
└── scripts/
    └── validate-docs.mjs  # Navigation/link/frontmatter checks, enforced in CI
```

Each top-level directory is one dropdown in the sidebar's product switcher.
`platform/` holds everything shared across editions so that billing, staff and
security are documented once rather than three times.

## Working on the docs

```bash
cd knowledge-base

npm install          # installs the Mintlify CLI
npm run dev          # live preview at http://localhost:3000
npm run validate     # the checks CI runs
npm run links        # external/internal broken-link scan
```

`npm run validate` is the important one — it runs two checks.

The first blocks what Mintlify would publish silently: navigation pointing at
missing pages, pages nobody can reach, missing frontmatter, dead internal
links, unresolved snippet imports, non-HugeIcons icons, and HTML comments.

The second compiles every page with the **real MDX compiler**. This matters
more than it sounds: `mint dev` accepts syntax the hosted build rejects, so a
page can render perfectly on your laptop and 404 in production. Two outages
came from exactly that gap — HTML comments, and prose placeholders like `{n}`
that MDX parses as JavaScript. Escape literal braces as `\{n\}`.

## How it ships

```
knowledge-base/  ──push to main──▶  .github/workflows/knowledge-base.yml
                                        │
                                        ├─ validate  (also runs on every PR)
                                        └─ sync      ▶ clinikehr/knowledge-base (public)
                                                            │
                                                            ▶ Mintlify builds
                                                              help.clinikehr.com
```

The two-repo split exists because Mintlify needs read access to whatever repo
it builds from, and this repo is private application code. Only this curated
directory is ever mirrored outward.

**Do not edit the public `clinikehr/knowledge-base` repo directly** — it is
overwritten on the next sync. Edit here.

### One-time setup

| Requirement | Where |
|---|---|
| `DOCS_DEPLOY_TOKEN` repo secret | A PAT with `contents: write` on `clinikehr/knowledge-base` |
| Public repo `clinikehr/knowledge-base` | ✅ Created — https://github.com/clinikehr/knowledge-base |
| Mintlify project | Connect it to the public repo, deploying from `main`, with the custom domain `help.clinikehr.com` |

## Writing

Read [STYLE-GUIDE.md](./STYLE-GUIDE.md) first. The short version:

- Write for someone mid-shift with a patient waiting — answer first, explain second.
- Never document our architecture. No Edge Functions, no table names, no `clinic_id`.
- Bold every UI string exactly as the product renders it.
- Use each edition's own vocabulary: a pharmacy has **customers**, not patients;
  a solo practice has **clients**, not patients.
- Never put real patient data in a screenshot.

## Keeping it true

Several pages describe screens that are generated from config in the app repo.
Those pages carry a trailing JSX comment naming their source of truth, so the
next writer knows what to diff:

| Documented surface | Source of truth |
|---|---|
| Sidebar navigation, per edition | `lib/clinic-nav-registry.ts` |
| Get Started checklists | `lib/onboarding-steps.ts` |
| Edition vocabulary, plan ladders, seat model | `lib/edition.ts` |
| Staff roles and permission slugs | `lib/edition-staff-roles.ts` |
| Currencies and money formatting | `lib/currencies.ts` |

When one of those changes, grep this directory for the matching comment.
