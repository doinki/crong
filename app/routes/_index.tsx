import { type Route } from './+types/_index';
import { loader as postLoader } from './pages.$page';

export const links: Route.LinksFunction = () => [
  { href: '/pages/1', rel: 'canonical' },
];

export async function loader(args: Route.LoaderArgs) {
  return postLoader({ ...args, params: { page: '1' } });
}

export { default, headers } from './pages.$page';
