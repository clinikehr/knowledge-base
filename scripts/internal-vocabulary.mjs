/**
 * The ONE list of implementation vocabulary that must never reach a public
 * docs page. Shared by `validate-docs.mjs` (page prose) and
 * `api-docs/scripts/build-public.mjs` (everything that leaves for the public
 * repo) so there is never a second list to drift.
 *
 * Each entry is [what it gives away, pattern]. Keep the patterns narrow enough
 * that ordinary English survives -- "policy" and "function" are fine words.
 */

export const ARCHITECTURE_TERMS_BY_PROFILE = {
  help: [
    ['our database vendor', /\bsupabase\b/i],
    ['our database vendor', /\bpostgres(ql)?\b/i],
    ['our serverless runtime', /\bedge functions?\b/i],
    ['a database access-control mechanism', /\brow[- ]level security\b|\bRLS\b/],
    ['a stored procedure', /\bRPC\b|\bsecurity definer\b/i],
    ['a privileged credential', /\bservice[- ]role\b/i],
    ['an internal column name', /\bclinic_id\b|\bpatient_id\b|\bauth\.uid\b/],
    ['a database column type', /\bjsonb\b/i],
  ],
  api: [
    ['our database vendor', /\bsupabase\b/i],
    ['our database vendor', /\bpostgres(ql)?\b/i],
    ['our serverless runtime', /\bedge functions?\b/i],
    ['a database access-control mechanism', /\brow[- ]level security\b|\bRLS\b/],
    ['a stored procedure', /\bRPC\b|\bsecurity definer\b/i],
    ['a privileged credential', /\bservice[- ]role\b/i],
    ['a database column type', /\bjsonb\b/i],
    ['an internal function-name prefix', /\behrapi_/i],
  ],
};

