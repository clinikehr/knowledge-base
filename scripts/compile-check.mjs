#!/usr/bin/env node
/**
 * Compile every MDX file the way Mintlify's cloud build does.
 *
 * Why this exists, twice over: `mint dev` tolerates syntax the hosted build
 * rejects, so a site can build perfectly on a laptop and 404 every page in
 * production. Two real outages came from exactly that gap —
 *   1. HTML comments (`<!-- -->`), which MDX has no syntax for;
 *   2. prose placeholders like {n} or {your clinic}, which MDX parses as
 *      JavaScript expressions and cannot evaluate.
 * Both are invisible locally. Running the real compiler is the only honest
 * check, so CI runs this before anything is published.
 *
 * Literal braces in prose must be escaped: \{n\}.
 *
 * Usage: node scripts/compile-check.mjs [rootDir]
 * Exits non-zero if any file fails to compile.
 */

import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(
  process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..')
);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!['node_modules', '.git', '.mint'].includes(entry)) walk(full, out);
    } else if (entry.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT);
let failed = 0;

for (const file of files) {
  try {
    await compile(readFileSync(file, 'utf8'), {
      remarkPlugins: [remarkFrontmatter, remarkGfm],
      development: false,
      jsx: true,
    });
  } catch (e) {
    failed += 1;
    console.error(`\n  error  ${relative(ROOT, file)}`);
    console.error(`         ${String(e.reason || e.message).slice(0, 200)}`);
    if (e.line) console.error(`         at line ${e.line}, column ${e.column}`);
  }
}

console.log(`\n${files.length} files checked, ${failed} failed to compile.`);

if (failed) {
  console.error(
    '\nMDX that does not compile here will 404 on the live site.\n' +
      'Escape literal braces in prose as \\{like this\\}, and use {/* … */} for comments.'
  );
  process.exit(1);
}
