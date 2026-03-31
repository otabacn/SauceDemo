import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import testData from '../test-data/test_data.json';

test.describe('Login - Data Driven', () => {
  for (const user of testData.users) {
    test(`[${user.expectedOutcome.toUpperCase()}] ${user.username}`, async ({ page }) => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      await loginPage.login(user.username, user.password);

      if (user.expectedOutcome === 'success') {
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(page.locator('.inventory_list')).toBeVisible();
      } else {
        const errorMsg = await loginPage.getErrorMessage();
        expect(errorMsg).toContain(user.expectedAssertion);
      }
    });
  }
});
