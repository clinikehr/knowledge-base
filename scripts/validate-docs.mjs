#!/usr/bin/env node
/**
 * Knowledge-base validator.
 *
 * Mintlify itself will happily publish a site whose navigation points at pages
 * that do not exist (they 404 silently for readers) and which contains orphan
 * pages nobody can reach. Both failures are invisible in review and obvious to
 * a user, so they are checked here and block the sync workflow.
 *
 * Checks:
 *   1. docs.json parses, and every `pages` entry resolves to an .mdx file.
 *   2. Every .mdx file under the docs root is reachable from the navigation
 *      (snippets/ is exempt — those are imported, not navigated to).
 *   3. Every page has frontmatter with a non-empty `title` and `description`
 *      (description drives search results and social cards; a missing one is
 *      a silently bad result page).
 *   4. Internal markdown links resolve to a real page or an in-page anchor.
 *   5. Every `import ... from '/snippets/x.mdx'` target exists.
 *
 * Usage: node scripts/validate-docs.mjs [--quiet]
 * Exits non-zero on any error.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const QUIET = process.argv.includes('--quiet');

const errors = [];
const warnings = [];

const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

// ── 1. Load navigation ──────────────────────────────────────────────────────

const docsJsonPath = join(ROOT, 'docs.json');
if (!existsSync(docsJsonPath)) {
  console.error('FATAL: docs.json not found at ' + docsJsonPath);
  process.exit(1);
}

let config;
try {
  config = JSON.parse(readFileSync(docsJsonPath, 'utf8'));
} catch (e) {
  console.error('FATAL: docs.json is not valid JSON — ' + e.message);
  process.exit(1);
}

/** Walk the navigation tree and collect every page path it references. */
function collectPages(node, out = []) {
  if (node == null) return out;
  if (Array.isArray(node)) {
    for (const item of node) collectPages(item, out);
    return out;
  }
  if (typeof node === 'string') {
    out.push(node);
    return out;
  }
  if (typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      // `pages` holds page paths and nested groups; other keys are metadata.
      if (key === 'pages' || key === 'groups' || key === 'dropdowns' ||
          key === 'tabs' || key === 'anchors' || key === 'navigation') {
        collectPages(value, out);
      }
    }
  }
  return out;
}

const navPages = collectPages(config.navigation);
const navSet = new Set(navPages);

if (navPages.length !== navSet.size) {
  const seen = new Set();
  for (const p of navPages) {
    if (seen.has(p)) err(`docs.json lists "${p}" in the navigation more than once.`);
    seen.add(p);
  }
}

// ── 2. Walk the filesystem ──────────────────────────────────────────────────

const IGNORED_DIRS = new Set(['node_modules', '.git', 'snippets', 'scripts', 'images', 'logo']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (IGNORED_DIRS.has(entry)) continue;
      walk(full, out);
    } else if (entry.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT);
/** Filesystem path → the slug Mintlify serves it as ("clinic/get-started/index"). */
const fileSlugs = new Map(
  files.map((f) => [relative(ROOT, f).replace(/\.mdx$/, ''), f])
);

// ── 3. Navigation ↔ filesystem agreement ────────────────────────────────────

for (const page of navSet) {
  if (!fileSlugs.has(page)) {
    err(`docs.json navigation points at "${page}" but ${page}.mdx does not exist.`);
  }
}

for (const [slug] of fileSlugs) {
  if (!navSet.has(slug)) {
    err(`${slug}.mdx exists but is not reachable from the navigation in docs.json.`);
  }
}

// ── 4. Per-file checks ──────────────────────────────────────────────────────

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

/**
 * Implementation vocabulary that must never appear in a reader-facing page.
 * Each entry is [what it gives away, pattern]. Keep the patterns narrow enough
 * that ordinary English survives — "policy" and "function" are fine words.
 */
const ARCHITECTURE_TERMS = [
  ['our database vendor', /\bsupabase\b/i],
  ['our database vendor', /\bpostgres(ql)?\b/i],
  ['our serverless runtime', /\bedge functions?\b/i],
  ['a database access-control mechanism', /\brow[- ]level security\b|\bRLS\b/],
  ['a stored procedure', /\bRPC\b|\bsecurity definer\b/i],
  ['a privileged credential', /\bservice[- ]role\b/i],
  ['an internal column name', /\bclinic_id\b|\bpatient_id\b|\bauth\.uid\b/],
  ['a database column type', /\bjsonb\b/i],
];

for (const [slug, file] of fileSlugs) {
  const raw = readFileSync(file, 'utf8');

  const fm = raw.match(FRONTMATTER);
  if (!fm) {
    err(`${slug}.mdx has no frontmatter block.`);
    continue;
  }

  const block = fm[1];
  const field = (name) => {
    const m = block.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  };

  if (!field('title')) err(`${slug}.mdx is missing a \`title\` in its frontmatter.`);

  const description = field('description');
  if (!description) {
    err(`${slug}.mdx is missing a \`description\`. It is the search-result and social-card copy — a page without one shows up blank in search.`);
  } else if (description.length > 160) {
    warn(`${slug}.mdx description is ${description.length} chars; search results truncate around 160.`);
  }

  const body = raw.slice(fm[0].length);

  // Snippet imports must resolve.
  for (const m of body.matchAll(/from\s+['"](\/snippets\/[^'"]+)['"]/g)) {
    const target = join(ROOT, m[1]);
    if (!existsSync(target)) {
      err(`${slug}.mdx imports "${m[1]}", which does not exist.`);
    }
  }

  // Icons are HugeIcons SVGs shipped in /images/icons — the same icon set the
  // product uses. Mintlify's name-based libraries (fontawesome/lucide/tabler)
  // are NOT in use; a bare name here would silently render no icon at all.
  const iconRefs = [
    ...[...raw.matchAll(/^icon:\s*"?([^"\s]+)"?\s*$/gm)].map((m) => m[1]),
    ...[...body.matchAll(/\bicon="([^"]+)"/g)].map((m) => m[1]),
  ];
  for (const ref of iconRefs) {
    if (!ref.startsWith('/images/icons/') || !ref.endsWith('.svg')) {
      err(`${slug}.mdx uses icon "${ref}" — icons must be HugeIcons paths like /images/icons/<name>.svg (see images/icons/).`);
    } else if (!existsSync(join(ROOT, ref))) {
      err(`${slug}.mdx references icon "${ref}", which does not exist. Generate it from @hugeicons/core-free-icons.`);
    }
  }

  // Internal links must resolve to a navigable page.
  for (const m of body.matchAll(/\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g)) {
    const href = m[1];
    if (href.startsWith('/images/') || href.startsWith('/logo/')) continue;
    const target = href.replace(/^\//, '').replace(/\/$/, '');
    if (!target) continue;
    if (!fileSlugs.has(target) && !fileSlugs.has(`${target}/index`)) {
      err(`${slug}.mdx links to "${href}", which is not a page in this site.`);
    }
  }

  // A page that documents a gated feature should say so. Heuristic only —
  // a warning, never an error.
  //
  // Exempt the orientation section and the landing page: those exist precisely
  // to explain editions and plans ACROSS the product, so they discuss gating
  // without documenting any one gated feature. Warning on them every run would
  // make the six permanent warnings the reason nobody reads the warnings.
  const isOrientation =
    slug === 'index' || slug.startsWith('start/') || slug.startsWith('changelog/');
  if (!isOrientation &&
      /plan|subscription|upgrade|entitle/i.test(body) &&
      !body.includes('<Availability')) {
    warn(`${slug}.mdx mentions plans or upgrading but has no <Availability> strip.`);
  }

  // Internal architecture must never reach a user-facing page. This is a
  // public site: naming our infrastructure is both useless to the reader and a
  // gift to anyone probing the product. Checked on the prose only — the
  // source-of-truth trailer comment is allowed to name app-repo files.
  const prose = body.replace(/<!--[\s\S]*?-->/g, '');
  for (const [term, pattern] of ARCHITECTURE_TERMS) {
    const m = prose.match(pattern);
    if (m) {
      err(`${slug}.mdx contains the internal term "${m[0]}" (${term}). Describe the behaviour a user sees, not how it is built.`);
    }
  }
}

// ── 5. Assets referenced by docs.json ───────────────────────────────────────

for (const asset of [config.favicon, config.logo?.light, config.logo?.dark]) {
  if (!asset) continue;
  if (!existsSync(join(ROOT, asset))) {
    err(`docs.json references asset "${asset}", which does not exist.`);
  }
}

// ── Report ──────────────────────────────────────────────────────────────────

if (!QUIET) {
  console.log(`Checked ${fileSlugs.size} pages against ${navSet.size} navigation entries.`);
}

for (const w of warnings) console.warn(`  warning  ${w}`);
for (const e of errors) console.error(`  error    ${e}`);

if (errors.length) {
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'} — not publishable.`);
  process.exit(1);
}

if (!QUIET) {
  console.log(`\nOK${warnings.length ? ` (${warnings.length} warning${warnings.length === 1 ? '' : 's'})` : ''}.`);
}
