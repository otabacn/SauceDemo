import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async goto() {
    await this.page.goto('/cart.html');
  }

  async getCartItemNames(): Promise<string[]> {
    return await this.cartItems.locator('.inventory_item_name').allInnerTexts();
  }

  async getCartCount(): Promise<number> {
    const text = await this.cartBadge.innerText();
    return parseInt(text);
  }

  async removeItem(name: string) {
    const item = this.cartItems.filter({
      has: this.page.locator('.inventory_item_name', { hasText: name }),
    });
    await item.locator('button').click();
  }

  async removeAll() {
    const count = await this.cartItems.count();
    for (let i = 0; i < count; i++) {
      await this.cartItems.first().locator('button').click();
    }
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async getItemPrice(name: string): Promise<number> {
    const item = this.cartItems.filter({
      has: this.page.locator('.inventory_item_name', { hasText: name }),
    });
    const priceText = await item.locator('.inventory_item_price').innerText();
    return parseFloat(priceText.replace('$', ''));
  }
}
