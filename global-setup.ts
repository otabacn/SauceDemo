import { chromium } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://www.saucedemo.com');
  const loginPage = new LoginPage(page);
  await loginPage.login('standard_user', 'secret_sauce');
  await page.waitForURL('**/inventory.html');

  await page.context().storageState({ path: 'test-data/auth.json' });
  await browser.close();
}

export default globalSetup;
