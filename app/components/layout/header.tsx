import { href, Link } from 'react-router';

import { Crong } from '../icon/crong';
import { ThemeSwitch } from '../ui/theme/theme-switch';

export function Header() {
  return (
    <header className="sticky top-0 flex h-12 items-center justify-between px-5 md:h-16 md:px-7">
      <Link title="홈으로 이동" to={href('/')}>
        <Crong className="size-8 md:size-10" height={32} width={32} />
      </Link>
      <ThemeSwitch className="size-6 md:size-8" />
    </header>
  );
}
