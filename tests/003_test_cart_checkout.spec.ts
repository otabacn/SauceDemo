import { expect } from '@playwright/test';
import { test } from '../fixtures/base';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import testData from '../test-data/test_data.json';

const { cart, inventory } = testData;
const {
  addRandomItem,    // ランダム商品を追加するか: true = 追加 / false = スキップ
  removeInCart,     // カートで全商品を削除するか: true = 削除して商品一覧に戻る / false = チェックアウトへ進む
  checkoutInfo,     // チェックアウト時の個人情報（firstName / lastName / zip）
  checkoutAction,   // Overviewページでの操作: "finish" = 注文確定 / "cancel" = キャンセル
} = cart;

test.describe('Cart & Checkout Flow', () => {
  test('complete purchase flow based on configured parameters', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage);
    const cartPage = new CartPage(loggedInPage);
    const checkoutPage = new CheckoutPage(loggedInPage);

    // Step 1: Add target product to cart
    await inventoryPage.addToCart(inventory.targetProduct.name);
    expect(await inventoryPage.getCartCount()).toBe(1);

    // Step 2: Optionally add a random product
    if (addRandomItem) {
      const allNames = await inventoryPage.getAllProductNames();
      const others = allNames.filter(n => n !== inventory.targetProduct.name);
      const randomName = others[Math.floor(Math.random() * others.length)];
      await inventoryPage.addToCart(randomName);
      expect(await inventoryPage.getCartCount()).toBe(2);
    }

    // Step 3: Go to cart
    await cartPage.goto();
    const itemsInCart = await cartPage.getCartItemNames();
    expect(itemsInCart).toContain(inventory.targetProduct.name);
    if (addRandomItem) {
      expect(itemsInCart.length).toBe(2);
    }

    // Step 3a: Assert target product price in cart matches test_data
    const targetPrice = await cartPage.getItemPrice(inventory.targetProduct.name);
    expect(targetPrice).toBe(parseFloat(inventory.targetProduct.price.replace('$', '')));

    // Step 3b: Record all item prices for later total assertion
    const cartPrices = await Promise.all(itemsInCart.map(name => cartPage.getItemPrice(name)));
    const expectedItemTotal = parseFloat(cartPrices.reduce((sum, p) => sum + p, 0).toFixed(2));

    // Step 4: Remove all or proceed to checkout
    if (removeInCart) {
      await cartPage.removeAll();
      expect(await cartPage.getCartItemNames()).toHaveLength(0);
      await expect(loggedInPage.locator('.shopping_cart_badge')).not.toBeVisible();
      await cartPage.continueShopping();
      await expect(loggedInPage).toHaveURL(/inventory\.html/);
      return;
    }

    // Step 5: Proceed to checkout and fill info
    await cartPage.proceedToCheckout();
    await expect(loggedInPage).toHaveURL(/checkout-step-one\.html/);
    await checkoutPage.fillInfo(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.zip
    );
    await checkoutPage.continue();
    await expect(loggedInPage).toHaveURL(/checkout-step-two\.html/);

    // Step 6: Assert totals on Overview page
    const itemTotal = await checkoutPage.getItemTotal();
    const tax = await checkoutPage.getTax();
    const grandTotal = await checkoutPage.getGrandTotal();
    expect(itemTotal).toBe(expectedItemTotal);
    expect(grandTotal).toBe(parseFloat((itemTotal + tax).toFixed(2)));

    // Step 7: Overview — cancel or finish
    if (checkoutAction === 'cancel') {
      await checkoutPage.cancel();
      await expect(loggedInPage).toHaveURL(/inventory\.html/);
      expect(await cartPage.getCartCount()).toBeGreaterThan(0);
    } else {
      await checkoutPage.finish();
      await expect(loggedInPage).toHaveURL(/checkout-complete\.html/);
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    }
  });
});
