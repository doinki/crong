import { expect, test } from '@playwright/test';

test.describe('/', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지 제목이 `Crong`으로 표시되어야 함', async ({ page }) => {
    expect(await page.title()).toBe('Crong');
  });

  test.describe('<header />', () => {
    test('로고 링크가 보여야 함.', async ({ page }) => {
      await expect(
        page.getByRole('link', { name: '홈으로 이동' }),
      ).toBeVisible();
    });

    test('테마 버튼이 현재 테마 상태를 표시해야 함', async ({ page }) => {
      // @ts-expect-error
      const theme = await page.evaluate(() => globalThis._theme);

      await expect(page.getByRole('button', { name: theme })).toBeVisible();
    });

    test('테마 버튼을 클릭하면 테마가 전환되어야 함', async ({ page }) => {
      // @ts-expect-error
      const theme = await page.evaluate(() => globalThis._theme);

      let classList = await page.evaluate(() => [
        ...document.documentElement.classList,
      ]);

      if (theme === 'dark') {
        expect(classList).toContain('dark');
      } else {
        expect(classList).not.toContain('dark');
      }

      await page.getByRole('button', { name: theme }).click();

      classList = await page.evaluate(() => [
        ...document.documentElement.classList,
      ]);

      if (theme === 'dark') {
        expect(classList).not.toContain('dark');
      } else {
        expect(classList).toContain('dark');
      }
    });
  });

  test.describe('<footer />', () => {
    test('현재 연도를 포함한 저작권 고지가 보여야 함', async ({ page }) => {
      await expect(
        page.getByText(
          `© ${new Date().getFullYear()} ije. All rights reserved.`,
        ),
      ).toBeVisible();
    });

    test('이메일 링크가 클릭 가능한 상태로 보여야 함', async ({ page }) => {
      await expect(
        page.getByRole('link', { name: 'me@ije.run' }),
      ).toBeVisible();
    });
  });
});
