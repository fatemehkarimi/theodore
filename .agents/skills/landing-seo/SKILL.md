---
name: landing-seo
description: Connect Codex to Google Search Console and diagnose SEO/indexing issues for Theodore landing pages. Use when the user asks to set up Search Console API access, repeat the OAuth flow, inspect sitemap/indexing/search analytics data, run URL Inspection API checks, or investigate landing-site SEO problems such as canonical tags, robots.txt, sitemap status, HTTPS/www redirects, and low search traffic.
---

# Landing SEO

## Goal

Use read-only Google Search Console access plus public HTTP checks to diagnose indexing, sitemap, canonical, redirect, and search-performance issues for Theodore landing domains.

Never paste OAuth client secrets, refresh tokens, service account JSON, or API responses containing credentials into chat or committed files.

## Secret Locations

Keep Google credentials outside the repo:

- OAuth client JSON: `/home/fatemeh/.config/codex/secrets/google-search-console/oauth-client.json`
- OAuth token JSON: `/home/fatemeh/.config/codex/secrets/google-search-console/oauth-token.json`
- Optional service-account JSON: `/home/fatemeh/.config/codex/secrets/google-search-console/theodore-js.json`

Use `chmod 600` for credential files. If a downloaded file starts in `Documents` or `Downloads`, move it into the secrets directory and remove the original copy.

## Connection Workflow

Prefer OAuth desktop-client access over service accounts for Search Console. Search Console's UI may reject service-account emails as normal users with "email not found"; OAuth works with the user's real Google account and can use the read-only scope.

1. In Google Cloud Console, enable **Google Search Console API**.
2. Configure **Google Auth Platform**:
   - App audience/status: **Testing**
   - Test users: add the exact Google account used in the consent browser
   - Data access scope: `https://www.googleapis.com/auth/webmasters.readonly`
3. Create an OAuth client:
   - Application type: **Desktop app**
   - Download the client JSON
   - Store it as the OAuth client JSON path above
4. Run the local OAuth helper:

```bash
python3 .agents/skills/landing-seo/scripts/gsc_oauth.py
```

5. Open the printed Google URL in a browser. If Google shows "Google hasn't verified this app", click **Advanced** and continue to the local app. This is expected for a private test app.
6. Confirm the browser shows `Authorization complete`.

Run OAuth/API scripts with network approval when Codex is in a restricted network sandbox.

## Diagnostic Workflow

After OAuth succeeds, run:

```bash
python3 .agents/skills/landing-seo/scripts/gsc_diagnostics.py \
  --site sc-domain:theodore-js.dev \
  --origin https://theodore-js.dev \
  --out /tmp/theodore-gsc-diagnostics.json
```

Inspect both the console summary and the JSON output. Always include these checks:

- GSC property visibility and permission level.
- Sitemap API data: submitted/indexed counts, errors, warnings, pending state, last downloaded/submitted.
- Search Analytics for 28 and 90 days:
  - total clicks, impressions, CTR, average position
  - page, query, device, country, date, and page-query dimensions
  - note that low-volume query data may be suppressed/anonymized.
- URL Inspection API for canonical pages and common variants:
  - apex HTTPS homepage
  - docs page
  - HTTP variant
  - `www` variant
- Public HTTP checks:
  - `robots.txt`
  - `sitemap.xml`
  - status headers
  - canonical tags
  - `og:url`
  - title and description
  - HTTPS and `www` behavior

## Interpreting Findings

Classify findings as:

- **Indexing blocker**: robots disallow, `noindex`, failed fetch, crawl denied, non-indexable canonical, 4xx/5xx on canonical URLs.
- **Canonical/redirect issue**: HTTP serves `200` instead of redirecting to HTTPS, `www` has certificate/404 behavior, canonical and served URL disagree.
- **Sitemap issue**: sitemap unreachable, invalid XML, wrong domain, pending/errors/warnings, stale template comments.
- **Performance/traffic issue**: indexed pages exist but impressions/clicks are low; query rows may be absent due low volume.
- **GSC lag**: sitemap indexed counts disagree with URL Inspection but inspected URLs are `Submitted and indexed`.

When reporting, lead with concrete issues and exact URL behavior. Separate confirmed issues from low-volume or stale GSC signals.
