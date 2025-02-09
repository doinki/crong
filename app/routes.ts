import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/_index.tsx'),
  route('pages/:page', 'routes/pages.$page.tsx'),
  route('robots.txt', 'routes/robots.txt.ts'),
  route('sitemap.xml', 'routes/sitemap.xml.ts'),
  route('rss.xml', 'routes/rss.xml.ts'),
] satisfies RouteConfig;
