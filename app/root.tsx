import './tailwind.css';

import font from '@fontsource-variable/noto-sans-kr?url';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { Footer } from './components/layout/footer';
import { Header } from './components/layout/header';
import { Progress } from './components/ui/progress';
import { ThemeScript } from './components/ui/theme/theme-script';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta content="light dark" name="color-scheme" />
        <title>Crong</title>
        <meta content="Crong" name="description" />
        <link href={font} rel="stylesheet" />
        <Meta />
        <Links />
        {import.meta.env.PROD && (
          <>
            <script
              src="https://www.googletagmanager.com/gtag/js?id=G-B1HVKNYX24"
              async
            />
            <script
              dangerouslySetInnerHTML={{
                __html:
                  'function gtag(){dataLayer.push(arguments)}globalThis.dataLayer=globalThis.dataLayer||[],gtag("js",new Date),gtag("config","G-B1HVKNYX24");',
              }}
            />
          </>
        )}
        <ThemeScript />
      </head>
      <body>
        <Header />
        {children}
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <Progress />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
