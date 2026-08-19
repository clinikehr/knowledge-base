# Screenshots

Nothing in here yet — the guides ship text-first on purpose, so they stay
correct through a UI refresh. Add screenshots where a sentence genuinely cannot
locate a control.

## The one rule with legal consequences

**Never capture real patient data.** No real names, dates of birth, phone
numbers, addresses, diagnoses, medication lists or document contents. Use a
demo workspace with synthetic data. A screenshot containing real patient
information published on `help.clinikehr.com` is a HIPAA breach, and it is
public the moment it deploys.

Check the whole frame before you save: sidebars, notification badges, browser
tabs, the workspace switcher and any partially-visible row behind a dialog have
all leaked data in other companies' documentation.

## Conventions

| | |
|---|---|
| Path | `images/<section>/<page>-<subject>.png` — e.g. `images/pharmacy/pos-cart.png` |
| Viewport | 1440px wide, captured at 2× |
| Theme | Light mode |
| Crop | The relevant control plus enough surroundings to locate it on screen |
| Format | PNG for UI, JPG only for photographs |

Reference one from a page with alt text that says what the reader should be
looking at, not that it is a screenshot:

```mdx
<Frame>
  <img src="/images/pharmacy/pos-cart.png" alt="The cart with two lines, the second showing a 10% discount badge" />
</Frame>
```

Mobile captures go alongside with a `-mobile` suffix, and belong in a `<Tabs>`
next to the desktop one rather than replacing it.
