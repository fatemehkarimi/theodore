import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = 'https://theodore-js.dev';
const scriptPath = fileURLToPath(import.meta.url);
const landingRoot = path.resolve(path.dirname(scriptPath), '..');
const repoRoot = path.resolve(landingRoot, '..');

const sitemapRules = [
  {
    type: 'app-static',
    appDir: file('src/app'),
    changefreq: 'weekly',
    priorityByLoc: (loc) => (loc === '/' ? '1' : '0.8'),
    sharedSources: [
      file('src/app/layout.tsx'),
      file('src/index.css'),
      ...filesIn('src/components', ['.ts', '.tsx']),
    ],
  },
  {
    type: 'docs',
    basePath: '/docs',
    contentDir: file('content'),
    changefreq: 'weekly',
    priority: '0.8',
    sharedSources: [
      file('src/app/layout.tsx'),
      file('src/app/docs/layout.tsx'),
      file('src/app/docs/[[...mdxPath]]/page.tsx'),
      file('src/mdx-components.ts'),
      ...filesIn('content', ['.json']),
    ],
  },
];

const routes = sitemapRules.flatMap(expandRule).sort((a, b) => {
  if (a.loc === '/') return -1;
  if (b.loc === '/') return 1;
  return a.loc.localeCompare(b.loc);
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.flatMap((route) => [
    '  <url>',
    `    <loc>${escapeXml(origin + route.loc)}</loc>`,
    `    <lastmod>${route.lastmod}</lastmod>`,
    `    <changefreq>${route.changefreq}</changefreq>`,
    `    <priority>${route.priority}</priority>`,
    '  </url>',
  ]),
  '</urlset>',
  '',
].join('\n');

writeFileSync(file('public/sitemap.xml'), xml);
// eslint-disable-next-line no-console
console.log(`Generated public/sitemap.xml with ${routes.length} URLs`);

function expandRule(rule) {
  if (rule.type === 'app-static') {
    return filesIn(path.relative(landingRoot, rule.appDir), ['.tsx'])
      .filter((source) => path.basename(source) === 'page.tsx')
      .filter(
        (source) => !routeSegments(rule.appDir, source).some(isDynamicSegment),
      )
      .filter(
        (source) =>
          !rule.excludedRoutes?.includes(appRoute(rule.appDir, source)),
      )
      .map((source) => {
        const loc = appRoute(rule.appDir, source);
        return {
          loc,
          changefreq: rule.changefreq,
          priority: rule.priorityByLoc?.(loc) ?? '0.8',
          lastmod: lastModifiedDate([source, ...rule.sharedSources]),
        };
      });
  }

  if (rule.type === 'docs') {
    return filesIn(path.relative(landingRoot, rule.contentDir), ['.mdx'])
      .filter((source) => !path.basename(source).startsWith('_'))
      .map((source) => ({
        loc: docsRoute(rule.basePath, source, rule.contentDir),
        changefreq: rule.changefreq,
        priority: rule.priority,
        lastmod: lastModifiedDate([source, ...rule.sharedSources]),
      }));
  }

  throw new Error(`Unsupported sitemap rule type: ${rule.type}`);
}

function appRoute(appDir, source) {
  const segments = routeSegments(appDir, source)
    .filter((segment) => segment !== 'page')
    .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')));
  return `/${segments.join('/')}`.replace(/\/+$/, '') || '/';
}

function routeSegments(routeRoot, source) {
  const relativePath = path.relative(routeRoot, source);
  const parsedPath = path.parse(relativePath);
  return path.join(parsedPath.dir, parsedPath.name).split(path.sep);
}

function isDynamicSegment(segment) {
  return segment.startsWith('[') && segment.endsWith(']');
}

function docsRoute(basePath, source, contentDir) {
  const relativePath = path.relative(contentDir, source);
  const parsedPath = path.parse(relativePath);
  const parts = path.join(parsedPath.dir, parsedPath.name).split(path.sep);
  const cleanParts = parts.filter((part) => part && part !== 'index');
  return [basePath, ...cleanParts].join('/').replaceAll('//', '/');
}

function lastModifiedDate(sources) {
  const existingSources = sources.filter(existsSync);
  if (existingSources.length === 0) return today();

  if (hasUncommittedChanges(existingSources)) return today();

  const committedDate = git([
    'log',
    '-1',
    '--format=%cs',
    '--',
    ...existingSources.map(repoRelative),
  ]);

  if (committedDate) return committedDate;
  return latestMtimeDate(existingSources);
}

function hasUncommittedChanges(sources) {
  return Boolean(
    git(['status', '--porcelain', '--', ...sources.map(repoRelative)]),
  );
}

function latestMtimeDate(sources) {
  const latestMtime = Math.max(
    ...sources.map((source) => statSync(source).mtime.getTime()),
  );
  return toDate(new Date(latestMtime));
}

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function filesIn(relativeDir, extensions) {
  const directory = file(relativeDir);
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return filesIn(path.relative(landingRoot, entryPath), extensions);
    }

    return extensions.includes(path.extname(entry.name)) ? [entryPath] : [];
  });
}

function file(relativePath) {
  return path.join(landingRoot, relativePath);
}

function repoRelative(source) {
  return path.relative(repoRoot, source).split(path.sep).join('/');
}

function today() {
  return toDate(new Date());
}

function toDate(date) {
  return date.toISOString().slice(0, 10);
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
