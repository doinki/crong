import { Rss } from 'feedkit';

import { prisma } from '~/prisma.server';

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
    lastBuildDate: post.createdAt,
    link: 'https://ije.run',
    pubDate: post.createdAt,
    skipDays: [0, 6],
    title: 'Crong',
  });

  return new Response(rss.toString(), {
    headers: {
      'Content-Type': 'application/rss+xml',
    },
  });
}
