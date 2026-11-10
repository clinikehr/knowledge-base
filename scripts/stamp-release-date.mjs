#!/usr/bin/env node
/**
 * Stamp the release date into every changelog entry that still carries a placeholder.
 *
 * Changelog entries are written while the work is built, before anyone knows the ship day, so they are dated
 * `[Release date]` (or `[Hotfix release date]`, `[RELEASE DATE]` …). They must never be published that way:
 * `validate-docs.mjs --strict-dates` refuses them on the pull request into main and on main itself. This is the
 * release step that resolves them, so the date is filled in by a command rather than remembered.
 *
 * Usage (from knowledge-base/ or api-docs/):
 *   npm run stamp-release                       # today's date, written out ("November 4, 2026")
 *   npm run stamp-release -- --date "November 10, 2026"
 *   npm run stamp-release -- --check            # list what would change, write nothing
 *
 * Only the `label` of an `<Update>` whose whole value is one bracketed placeholder is changed — never body text,
 * never a real date. Run it on the release branch right before opening the PR into main, then commit the result.
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PLACEHOLDER_LABEL = /(<Update\s+label=)(["'])\[[^\]\n]*\]\2/g;
const WRITTEN_DATE = /^(January|February|March|April|May|June|July|August|September|October|November|December) ([1-9]|[12]\d|3[01]), (20\d\d)$/;

export function writtenOut(d) {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function stampText(text, date) {
  let count = 0;
  const out = text.replace(PLACEHOLDER_LABEL, (_m, open, q) => {
    count += 1;
    return `${open}${q}${date}${q}`;
  });
  return { text: out, count };
}

function mdxFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return mdxFiles(p);
    return p.endsWith('.mdx') ? [p] : [];
  });
}

function main() {
  const argv = process.argv.slice(2);
  const check = argv.includes('--check');
  const di = argv.indexOf('--date');
  const date = di >= 0 ? argv[di + 1] : writtenOut(new Date());
  if (!date || !WRITTEN_DATE.test(date)) {
    console.error(`--date must be written out like "November 10, 2026" (got ${JSON.stringify(date)}).`);
    process.exit(2);
  }
  const root = resolve(argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--date') ?? '.');
  let total = 0;
  for (const file of mdxFiles(join(root, 'changelog'))) {
    const before = readFileSync(file, 'utf8');
    const { text, count } = stampText(before, date);
    if (count === 0) continue;
    total += count;
    console.log(`${check ? 'would stamp' : 'stamped'} ${count} entr${count === 1 ? 'y' : 'ies'} in ${relative(process.cwd(), file)} → ${date}`);
    if (!check) writeFileSync(file, text);
  }
  if (total === 0) console.log('No placeholder dates found.');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
