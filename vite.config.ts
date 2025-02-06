import devServer, { defaultOptions } from '@hono/vite-dev-server';
import { reactRouter } from '@react-router/dev/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { envOnlyMacros } from 'vite-env-only';
import tsconfigPaths from 'vite-tsconfig-paths';

const PROD = process.env.NODE_ENV === 'production';

export default defineConfig(({ isSsrBuild }) => {
  return {
    build: {
      sourcemap: true,
      target: isSsrBuild ? 'node22' : ['chrome120', 'safari16.4', 'firefox128'],
    },
    define: {
      'import.meta.env.SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN),
    },
    plugins: [
      envOnlyMacros(),
      tsconfigPaths(),
      PROD &&
        process.env.SENTRY_AUTH_TOKEN &&
        sentryVitePlugin({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          disable: !PROD,
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          release: {
            name: process.env.SHA,
          },
          sourcemaps: {
            filesToDeleteAfterUpload: ['./build/**/*.map'],
          },
        }),
      tailwindcss(),
      reactRouter(),
      devServer({
        entry: 'server/server.development.ts',
        exclude: [...defaultOptions.exclude, /^\/app\/.*/, /.*\.png$/],
        injectClientScript: false,
      }),
    ],
  };
});
