# Snippets

Reusable components imported by the pages. Documentation lives here rather than
inside the `.mdx` files, because **MDX has no `/* */` comment syntax at the top
level** — a JSDoc block in an `.mdx` file is parsed as markdown text, not a
comment, and ships as visible content.

If you need a comment inside an `.mdx` file, use `{/* … */}` (a JSX expression).

## Rules for anything added here

1. **No Mintlify global components inside an exported function.** `<Note>`,
   `<Info>`, `<Card>` and friends are injected into a *page's* scope, not into
   the module scope of a snippet that another file imports. Referencing one from
   an exported arrow function is how you get a component that renders locally and
   breaks in the cloud build. Use plain elements plus the `ck-` classes in
   `style.css`.
2. **No markdown inside JSX children.** `**bold**` and `[link](/path)` are
   literal text once they are inside a JSX element on the same line. Use
   `<strong>` and `<a href>`.
3. **Keep them presentational.** A snippet renders; it does not fetch, branch on
   environment, or hold state.

## What's here

| Export | File | Use |
|---|---|---|
| `Availability` | `availability.mdx` | The edition / plan / role strip, directly under the H1 of any gated page |
| `Path` | `path.mdx` | The literal click path through the product |
| `TaskHeader` | `task-header.mdx` | Before-you-start / time / outcome, on task pages only |
| `StillStuck` | `support.mdx` | The escape hatch that closes every task page |
| `AuditNote` | `support.mdx` | States that an action is recorded, on pages about viewing or exporting patient data |

## Usage

```mdx
import { Availability } from '/snippets/availability.mdx';
import { Path } from '/snippets/path.mdx';
import { TaskHeader } from '/snippets/task-header.mdx';
import { StillStuck, AuditNote } from '/snippets/support.mdx';

<Availability editions={['pharmacy']} plans="All plans" roles="Any staff member" />

<Path steps={['Sidebar', 'POS']} />

<TaskHeader before="At least one stock item" time="Under a minute" after="A completed sale" />

<AuditNote action="Opening this record" />

<StillStuck topic="a sale that will not sync" />
```

`Availability` accepts `editions={['clinic'|'pharmacy'|'lims'|'portal'|'all']}`,
plus optional `plans`, `roles` and `note` strings.
