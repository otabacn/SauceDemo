import { expect } from '@playwright/test';
import { test } from '../fixtures/base';
import { InventoryPage } from '../pages/InventoryPage';
import testData from '../test-data/test_data.json';

const { inventory } = testData;
const {
  targetProduct, // テスト対象商品（商品情報の検証 および カートへの追加に使用）
  testSort,      // ソートテストの実行スイッチ: true = 実行する / false = スキップする
  sortMethod,    // ソート方式の指定: "az" = 名前昇順 / "za" = 名前降順 / "lohi" = 価格昇順 / "hilo" = 価格降順
} = inventory;

function applySortLocally(
  names: string[],
  prices: number[],
  method: string
): { names: string[]; prices: number[] } {
  const items = names.map((name, i) => ({ name, price: prices[i] }));

  switch (method) {
    case 'az':
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'za':
      items.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'lohi':
      items.sort((a, b) => a.price - b.price);
      break;
    case 'hilo':
      items.sort((a, b) => b.price - a.price);
      break;
  }

  return {
    names: items.map(i => i.name),
    prices: items.map(i => i.price),
  };
}

test.describe('Inventory - Product Validation', () => {
  test(`target product exists with correct info: ${targetProduct.name}`, async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage);
    const info = await inventoryPage.getProductInfo(targetProduct.name);

    expect(info.name).toBe(targetProduct.name);
    expect(info.description).toBe(targetProduct.description);
    expect(info.price).toBe(targetProduct.price);
  });
});

test.describe('Inventory - Sort', () => {
  test(`sort by [${sortMethod}] produces correct order`, async ({ loggedInPage }) => {
    if (!testSort) {
      test.skip();
    }

    const inventoryPage = new InventoryPage(loggedInPage);

    const namesBefore = await inventoryPage.getAllProductNames();
    const pricesBefore = await inventoryPage.getAllProductPrices();

    await inventoryPage.selectSort(sortMethod);

    const namesAfter = await inventoryPage.getAllProductNames();
    const pricesAfter = await inventoryPage.getAllProductPrices();

    const expected = applySortLocally(namesBefore, pricesBefore, sortMethod);

    expect(namesAfter.length).toBe(namesBefore.length);
    expect(namesAfter).toEqual(expected.names);
    expect(pricesAfter).toEqual(expected.prices);
  });
});
