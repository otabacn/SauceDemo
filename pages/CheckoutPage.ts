import { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  // Step 1: Your Information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly zipInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  // Step 2: Overview
  readonly finishButton: Locator;
  readonly itemTotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly grandTotalLabel: Locator;
  // Step 3: Complete
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.zipInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.completeHeader = page.locator('.complete-header');
    this.itemTotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.grandTotalLabel = page.locator('.summary_total_label');
  }

  async fillInfo(firstName: string, lastName: string, zip: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.zipInput.fill(zip);
  }

  async continue() {
    await this.continueButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  async getItemTotal(): Promise<number> {
    const text = await this.itemTotalLabel.innerText();
    return parseFloat(text.replace('Item total: $', ''));
  }

  async getTax(): Promise<number> {
    const text = await this.taxLabel.innerText();
    return parseFloat(text.replace('Tax: $', ''));
  }

  async getGrandTotal(): Promise<number> {
    const text = await this.grandTotalLabel.innerText();
    return parseFloat(text.replace('Total: $', ''));
  }
}
