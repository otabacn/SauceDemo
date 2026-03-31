import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.inventoryItems = page.locator('.inventory_item');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemPrices = page.locator('.inventory_item_price');
    this.cartBadge = page.locator('.shopping_cart_badge');
  }

  async selectSort(value: string) {
    await this.sortDropdown.selectOption(value);
  }

  async getAllProductNames(): Promise<string[]> {
    return await this.itemNames.allInnerTexts();
  }

  async getAllProductPrices(): Promise<number[]> {
    const rawPrices = await this.itemPrices.allInnerTexts();
    return rawPrices.map(p => parseFloat(p.replace('$', '')));
  }

  async getProductInfo(name: string): Promise<{ name: string; description: string; price: string }> {
    const item = this.inventoryItems.filter({
      has: this.page.locator('.inventory_item_name', { hasText: name }),
    });
    const description = await item.locator('.inventory_item_desc').innerText();
    const price = await item.locator('.inventory_item_price').innerText();
    return { name, description, price };
  }

  async addToCart(name: string) {
    const item = this.inventoryItems.filter({
      has: this.page.locator('.inventory_item_name', { hasText: name }),
    });
    await item.locator('button').click();
  }

  async getCartCount(): Promise<number> {
    const text = await this.cartBadge.innerText();
    return parseInt(text);
  }
}
