import { invariantResponse } from '@mado/invariant';
import { data } from 'react-router';
import { SeoHandle } from 'react-router-seo';
import { serverOnly$ } from 'vite-env-only/macros';

import { Pagination } from '~/components/ui/pagination';
import { prisma } from '~/prisma.server';
import { joinChildren } from '~/utils/join-children';

import { type Route } from './+types/pages.$page';

export const handle: SeoHandle | undefined = serverOnly$({
  seo: {
    generateSitemapEntries: async () => {
      const count = await prisma.post
        .count()
        .then((count) => Math.ceil(count / 20));

      return Array.from({ length: count }, (_, index) => ({
        path: `/pages/${index + 1}`,
      }));
    },
  },
});

export async function loader({ context, params }: Route.LoaderArgs) {
  const page = Number(params.page);

  invariantResponse(page >= 1 && !Number.isNaN(page), 'Bad request', {
    status: 400,
  });

  context.timing.startTime(context.c, 'getPosts');
  const [posts, count] = await Promise.all([
    prisma.post.findMany({
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * 20,
      take: 20,
    }),
    prisma.post.count().then((count) => Math.ceil(count / 20)),
  ]);
  context.timing.endTime(context.c, 'getPosts');

  invariantResponse(page <= count, 'Not found', { status: 404 });

  return data(
    { count, page, posts },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}

export const headers: Route.HeadersFunction = ({ loaderHeaders }) => {
  return {
    'Cache-Control': loaderHeaders.get('Cache-Control') ?? '',
  };
};

export default function Route({
  loaderData: { count, page, posts },
}: Route.ComponentProps) {
  return (
    <main className="mx-auto max-w-4xl space-y-16 px-5 md:px-7">
      <h1 className="sr-only">Crong</h1>
      <ul className="space-y-6 md:space-y-8">
        {joinChildren(
          posts.map((item, index) => (
            <li key={index}>
              <article className="space-y-3 md:space-y-4">
                <header>
                  <h2 className="text-xl text-zinc-800 md:text-2xl dark:text-zinc-100">
                    <a href={item.url} rel="noreferrer" target="_blank">
                      {item.title}
                    </a>
                  </h2>
                  <time
                    className="text-sm text-zinc-500 dark:text-zinc-400"
                    dateTime={item.publishedAt.toISOString().split('T')[0]}
                  >
                    {item.publishedAt.toISOString().split('T')[0]}
                  </time>
                </header>
                <p className="text-zinc-700 dark:text-zinc-200">
                  <a
                    href={item.url}
                    rel="noreferrer"
                    tabIndex={-1}
                    target="_blank"
                  >
                    {item.summary}
                  </a>
                </p>
                <footer className="flex flex-wrap items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                  <cite>{item.source}</cite>
                </footer>
              </article>
            </li>
          )),
          <li aria-hidden>
            <hr className="text-zinc-400 dark:text-zinc-600" />
          </li>,
        )}
      </ul>

      <Pagination count={count} page={page} />
    </main>
  );
}
