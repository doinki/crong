import { Rss } from 'feedkit';
import { SeoHandle } from 'react-router-seo';
import { serverOnly$ } from 'vite-env-only/macros';

import { prisma } from '~/prisma.server';

export const handle: SeoHandle | undefined = serverOnly$({
  seo: {
    sitemap: false,
  },
});

export async function loader() {
  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });
  const post = posts[0];

  const rss = new Rss({
    description: 'Crong',
    generator: 'feedkit v0.0.1',
    items: posts.map((post) => ({
      author: post.source,
      description: post.summary,
      link: post.url,
      pubDate: post.publishedAt,
      title: post.title,
    })),
    language: 'ko',
    lastBuildDate: new Date(),
    link: 'https://ije.run',
    pubDate: post.createdAt,
    skipDays: [0, 6],
    title: 'Crong',
  }).toString();

  const bytes = new TextEncoder().encode(rss).byteLength;

  return new Response(rss, {
    headers: {
      'Content-Length': String(bytes),
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
