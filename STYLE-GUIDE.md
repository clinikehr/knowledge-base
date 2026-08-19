# ClinikEHR Help Center — authoring contract

Every page in this knowledge base is written to this contract. It exists so
that 100+ pages written at different times read as one voice, and so a reader
can predict where an answer will be before they find it.

---

## 1. Who we are writing for

A **busy clinical or retail worker mid-shift**, not an evaluator and not an
engineer. They have a specific question, they are standing at a desk with a
patient or customer waiting, and they will leave if the answer is not visible
within one screen.

That has consequences:

- **Answer first, explain second.** The first paragraph after the H1 says what
  the page lets them do. Background, rationale and edge cases come after.
- **Never explain our architecture.** No Edge Functions, no RLS, no Supabase,
  no table names, no `clinic_id`. If an implementation detail changes what the
  user must *do*, describe the behaviour, not the mechanism.
- **Every claim must be true of the shipped product.** If you cannot find the
  button in the code, do not write the step. Write what is there.

## 2. Page types

Five. Pick one per page and do not blend them. The last two have their own
contracts, spelled out below — they cover most of this site.

| Type | Answers | Shape |
|---|---|---|
| **Task** | "How do I …?" | `<TaskHeader>` → `<Steps>` → verification → troubleshooting |
| **Concept** | "What is … / how does it work?" | prose + tables + diagrams, no `<Steps>` |
| **Reference** | "What are all the …?" | tables, exhaustive, minimal prose |
| **Module** | "How do I use this screen?" | one per navigation destination — see below |
| **Settings** | "What does this tab do?" | one per settings tab — see below |

Most pages are **Task** pages. A section index (`.../index.mdx`) is a Concept
page whose job is to route: a short orientation, then `<Cards>`.

### Module pages — one page per navigation destination

If the sidebar has a row for it, or a subsection under a row, it gets its own
page. Do not fold "Lab Station" and "Worklist" together because they sit near
each other; someone searching for the worklist should land on the worklist.

Required sections, in order:

1. **What you're looking at** — the screen, named. Tabs, toolbar buttons,
   columns, status badges, and the **empty state** a brand-new workspace sees.
   A reader who cannot map your words onto their screen never reaches step 1.
2. **The task(s)** — one `<Steps>` block per distinct job. A consultation page
   has "Start a consultation", "Write the note", "Place orders", "Sign it off"
   as four H2s, not one twenty-step ladder.
3. **Who can do this** — roles and permissions are *different things*. Role
   decides whether the module opens; permission decides whether an action inside
   it is allowed. Give a table of Action → who by default → the governing
   permission, then the two behaviours that surprise people: enforcement is
   opt-in per person ("Saving starts enforcing"), and a denied action is
   recorded while an allowed one is not.
4. **Check it worked**
5. **Common issues** — something is *wrong*. Symptom as the reader would phrase
   it, one-line cause, the fix. Real error strings. 4–7 entries.
6. **FAQ** — nothing is wrong, they just want to know. "Can I edit a signed
   note?", "Does cancelling refund the patient?" 4–6 entries.

Keep both 5 and 6 — they answer different questions and collapsing them loses
one of them. 600–1100 words.

### Settings pages are a fifth shape, and they have a stricter contract

**One page per settings tab. Never two.** An earlier version compressed eight
tabs into "Billing, payments and insurance", and a reader who came to switch on
Auto Pay had to scroll past currency, tax, Stripe onboarding and invoice
channels to reach three paragraphs. Settings pages are looked up, not read:
someone arrives with that exact tab open on another screen.

Required sections, in this order:

1. **What this tab controls** — a table with a row for *every* control on the
   tab. Note owner-only and plan-gated ones in their row. Quote the product's
   own helper text where it has some.
2. **Set it up** — `<Steps>`, one action each. On a reference-only tab, replace
   with "How to read this tab".
3. **What changes once you save** — *the section that justifies the page.* Name
   the screens that change, the documents that change, who is affected and when
   ("staff see it on their next sign-in", "applies within five minutes"), and —
   critically — **what is NOT affected** where people assume it is. A setting is
   only interesting because of what it does elsewhere; trace it.
4. **Check it worked** — something observable.
5. **Common issues** — `<AccordionGroup>`, three to six entries, each with the
   symptom as the reader would phrase it. Always include "I can't see this tab"
   where a gate applies, and "it's greyed out" where a control is owner-only.

Length is 500–900 words. Comprehensive is not the same as padded: a tab with
four switches gets a short page, and that is correct.

## 3. Required page skeleton

````mdx
---
title: "Record a sale"
description: "Ring up a customer at the point of sale, take payment, and print a receipt."
icon: "/images/icons/cash-register.svg"
---

import { Availability } from '/snippets/availability.mdx';
import { Path } from '/snippets/path.mdx';
import { TaskHeader } from '/snippets/task-header.mdx';
import { StillStuck } from '/snippets/support.mdx';

<Availability editions={['pharmacy']} plans="All plans" roles="Any staff member" />

One or two sentences: what this page lets you do, in the reader's words.

<Path steps={['Sidebar', 'POS']} />

<TaskHeader
  before="At least one stock item"
  time="Under a minute"
  after="A completed sale with stock drawn down"
/>

## Ring up the sale

<Steps>
  <Step title="Find the product">
    …
  </Step>
</Steps>

## Check it worked

…

## If something goes wrong

<AccordionGroup>…</AccordionGroup>

<StillStuck />
````

### Frontmatter rules

- `title` — sentence case, verb-first on task pages ("Record a sale", not
  "Sales recording"). No product name in it; the site already says ClinikEHR.
- `description` — one full sentence, ≤160 characters. This is the search
  result and the social card. Never a fragment, never a repeat of the title.
- `icon` — a path to a **HugeIcons** SVG in `/images/icons/`, e.g.
  `icon: "/images/icons/stethoscope.svg"` — the same icon set the product's own
  sidebar uses, so the docs and the app look like one family. Never a bare
  library name (Mintlify would look it up in Font Awesome/Lucide and render
  nothing, silently — the validator blocks this). If the icon you need is not
  in `/images/icons/` yet, generate it from `@hugeicons/core-free-icons` in the
  app repo: extract the icon's element array into a 24×24 `viewBox` SVG with
  `stroke="var(--ck,#64748b)"` and the dark-mode `<style>` block the existing
  files carry. Same rule for `<Card icon="…">` props in page bodies.
- `sidebarTitle` — only when `title` is too long for the rail.

## 4. Voice

- **Second person, present tense, active.** "Select **Add item**." Not "The
  item can be added" and not "We will now add an item."
- **Imperative for steps.** Each `<Step title>` is a short imperative phrase.
- **No hedging.** "Select", not "you may want to select". If behaviour is
  genuinely conditional, state the condition.
- **No filler.** Delete "simply", "just", "easily", "seamlessly", "powerful",
  "robust". If a thing is easy the steps will show it.
- **Gender-neutral throughout.** Patients and staff are "they".

### UI vocabulary

- Bold every literal UI string exactly as the product renders it: **Add item**,
  **Save & close**. Do not correct the product's capitalisation in the docs —
  fix it in the product instead.
- **Escape curly braces in prose.** MDX reads `{…}` as a JavaScript expression,
  so a placeholder like `{n} documents` or `Welcome to {your clinic}` fails to
  compile and takes the whole page down with a 404 — invisible in local preview.
  Write `\{n\} documents`. This is checked by `npm run validate`.
- The verb for interacting with a control is **select** (works for click, tap
  and keyboard). Use "enter" for typing into a field, "choose" for a picker.
- Name the surface: "the **New sale** sheet", "the **Billing** page".

### Edition vocabulary — this one matters

The product deliberately changes its nouns per edition, and the docs must
match or the reader will not find the word on their screen:

| | Clinic & Hospital | Pharmacy | Diagnostics |
|---|---|---|---|
| The business | clinic | pharmacy | lab / diagnostic centre |
| The people served | patients | customers | patients |
| Solo/team plans call patients | clients | — | — |

Never write "clinic" on a Pharmacy page. Never write "patient" where the
Pharmacy UI says **Customers**. On a shared Platform page, use "workspace"
for the business and say "patients or customers" once, then pick the neutral
term for the rest of the page.

## 5. Components

Import only what the page uses.

| Component | Use for | Never use for |
|---|---|---|
| `<Availability>` | directly under the H1, on every gated feature | pages with no gating |
| `<Path>` | the click path to the screen | a link to another doc page |
| `<TaskHeader>` | task pages only | concept or reference pages |
| `<Steps>`/`<Step>` | an ordered procedure | a list of options |
| `<Cards>`/`<Card>` | routing on index pages | body content |
| `<AccordionGroup>` | "if something goes wrong" | hiding required steps |
| `<Tabs>` | the same task differing by edition, plan or platform | unrelated topics |
| `<Note>` | useful aside | anything the reader must not miss |
| `<Warning>` | irreversible, billable, or patient-safety consequences | emphasis |
| `<Info>` | context, including the `AuditNote` | steps |
| `<StillStuck>` | the last line of every task page | mid-page |

**Never hide a required step inside an `<Accordion>` or a `<Tab>` the reader
has no reason to open.**

### Callout discipline

`<Warning>` is reserved for three things: an action that cannot be undone, an
action that charges money or consumes credits, and an action with a patient
safety consequence. If everything is a warning, nothing is. Expect at most one
per page.

## 6. Steps

- One action per `<Step>`. If a step has three sentences of "and then", split it.
- `title` is the action; the body is the detail, the field values and the
  screenshot.
- State the **result** of a step when it is not obvious ("The item appears in
  the cart with its batch and expiry").
- End every procedure with a **Check it worked** section naming what the reader
  should now see. A procedure with no verification cannot be self-served.

## 7. Prerequisites and gating

A reader who cannot do the task must find that out at the top.

- Put the edition/plan/role in `<Availability>`.
- Put data prerequisites in `<TaskHeader before=…>` ("At least one service must
  exist").
- If the feature is genuinely absent on their plan, say what they see instead
  (a locked card, an upgrade prompt) and link to
  [Change your plan](/platform/plans/change-plan).

Never phrase gating as a sales pitch. State the fact and move on.

## 8. Linking

- Link the first mention of any concept that has its own page.
- Use root-relative links: `/platform/team/roles`. Never a full URL for an
  internal page, never a relative `../` hop.
- Link text is the destination's subject, never "here" or "this page".
- Deep-link to the app with `https://app.clinikehr.com/...` only where a reader
  genuinely needs to jump; prefer describing the in-app path with `<Path>`.

## 9. Screenshots

- Store under `/images/<section>/<page>-<subject>.png`.
- Use a demo workspace with **synthetic data only**. A screenshot containing a
  real patient name, a real date of birth, a real phone number or a real
  address is a HIPAA breach — this is the one rule in this file with legal
  consequences.
- Crop to the relevant control plus enough surroundings to locate it.
- Every image needs alt text describing what the reader should see, not
  "Screenshot".
- Capture in light mode at 2× on a 1440px-wide viewport.

## 10. Accuracy maintenance

- When a page documents a screen driven by a config file (navigation, onboarding
  steps, plan ladders, permission slugs), note the source of truth in a JSX
  comment at the bottom of the page so the next writer knows what to re-check:
  `{/* source of truth: lib/onboarding-steps.ts */}`
  **Never an HTML comment (`<!-- -->`)** — MDX has no HTML comment syntax, and
  Mintlify's cloud build 404s the entire page on one. The validator blocks it.
- `node scripts/validate-docs.mjs` must pass before merge; it is enforced in CI.
- Warnings from the validator are advisory, but a page that mentions plans
  without an `<Availability>` strip is almost always an oversight.

---

## Checklist before you open a PR

- [ ] Frontmatter has a sentence-case `title` and a full-sentence `description`
- [ ] `<Availability>` present if the feature is gated at all
- [ ] Every UI string is bolded and matches the product exactly
- [ ] Edition vocabulary is correct for the section the page lives in
- [ ] Task pages have `<TaskHeader>`, a verification section and `<StillStuck>`
- [ ] No architecture, no table names, no internal service names
- [ ] No real patient data in any screenshot
- [ ] The page is listed in `docs.json`
- [ ] `node scripts/validate-docs.mjs` passes
