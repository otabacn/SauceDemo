import { test as base, Page, browser } from '@playwright/test';

type MyFixtures = {
  loggedInPage: Page;
};

export const test = base.extend<MyFixtures>({
  loggedInPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'test-data/auth.json',
    });
    const page = await context.newPage();
    await page.goto('/inventory.html');
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
