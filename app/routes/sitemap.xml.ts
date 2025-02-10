import { generateSitemap, type SeoHandle } from 'react-router-seo';
import { serverOnly$ } from 'vite-env-only/macros';

import { getDomainUrl } from '~/utils/get-domain-url';

import { type Route } from './+types/sitemap.xml';

export const handle: SeoHandle | undefined = serverOnly$({
  seo: {
    sitemap: false,
  },
});

export async function loader({ context, request }: Route.LoaderArgs) {
  return generateSitemap(request, context.serverBuild.routes, {
    url: getDomainUrl(request),
  });
}
