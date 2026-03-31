# SauceDemo Playwright Test Suite

Automated end-to-end tests for [saucedemo.com](https://www.saucedemo.com) using Playwright + TypeScript with the Page Object Model pattern.

---

## Note on Negative Test Cases

Negative test cases are intentionally limited to the login page.

SauceDemo officially documents the behavior of all 6 test users, including expected error messages for failure scenarios. This makes login a reliable target for negative testing.

For other pages (inventory, cart, checkout), the error conditions and edge case behaviors are not officially documented. Writing negative tests against undocumented behavior risks testing implementation bugs rather than intended functionality, and would result in brittle tests tied to the current state of the demo site. For this reason, negative coverage is scoped to where the expected behavior is explicitly known.

---

## Project Structure

```
SauceDemo/
├── pages/
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── tests/
│   ├── 001_test_login_data_driven.spec.ts
│   ├── 001_test_login_standard.spec.ts
│   ├── 002_test_inventory.spec.ts
│   └── 003_test_cart_checkout.spec.ts
├── fixtures/
│   └── base.ts
├── test-data/
│   └── test_data.json
├── global-setup.ts
└── playwright.config.ts
```

---

## Setup

```bash
npm install
npx playwright install chromium
```

---

## Run Tests

```bash
# Run all tests
npx playwright test

# Run a specific file
npx playwright test tests/001_test_login_data_driven.spec.ts

# Open HTML report
npx playwright show-report
```

---

## Test Overview

### 001 — Login (Data Driven)
**File:** `001_test_login_data_driven.spec.ts`

Iterates over all users configured in `test_data.json` and verifies login behavior for each.

Each user entry defines:
- `username` / `password` — credentials
- `expectedOutcome` — `"success"` or `"error"`
- `expectedAssertion` — URL path (on success) or error message text (on failure)

To add or modify test cases, edit the `users` array in `test_data.json`. No changes to the test file are required.

**Assertions:**
- Success: URL contains `/inventory.html` and inventory list is visible
- Error: error message contains the configured text

---

### 001 — Login (Standard)
**File:** `001_test_login_standard.spec.ts`

Logs in as `standard_user` and verifies the inventory page loads correctly.

This test also serves as the authentication source for downstream tests — `global-setup.ts` runs the same login and saves the browser storage state to `test-data/auth.json`, which is reused by tests 002 and 003 to skip repeated logins.

**Assertions:**
- URL contains `/inventory.html`
- Inventory list is visible
- Page title is "Products"

---

### 002 — Inventory Page
**File:** `002_test_inventory.spec.ts`

Tests product information accuracy and sort functionality on the inventory page.

Configurable via `test_data.json` → `inventory`:

| Key | Description |
|-----|-------------|
| `targetProduct.name` | Product to verify on the page |
| `targetProduct.description` | Expected product description |
| `targetProduct.price` | Expected product price |
| `testSort` | `true` to run sort test / `false` to skip |
| `sortMethod` | `"az"` / `"za"` / `"lohi"` / `"hilo"` |

**Assertions:**
- Target product name, description, and price match configured values
- After sorting: product count is unchanged, all names and prices are in the correct order

---

### 003 — Cart & Checkout Flow
**File:** `003_test_cart_checkout.spec.ts`

Tests the full purchase flow from adding items to cart through to order completion.

Configurable via `test_data.json` → `cart`:

| Key | Description |
|-----|-------------|
| `addRandomItem` | `true` to add a random second product in addition to the target |
| `removeInCart` | `true` to remove all items in the cart and return to inventory / `false` to proceed to checkout |
| `checkoutInfo.firstName` | First name for checkout form |
| `checkoutInfo.lastName` | Last name for checkout form |
| `checkoutInfo.zip` | Postal code for checkout form |
| `checkoutAction` | `"finish"` to complete the order / `"cancel"` to cancel at the overview page |

**Assertions:**
- Target product is present in cart with correct price
- Cart item count matches expected quantity
- Checkout overview: item total equals sum of cart item prices
- Checkout overview: grand total equals item total + tax
- On finish: order complete page is displayed with confirmation message
- On cancel: redirected to inventory with cart items preserved
- On remove all: cart is empty and badge is not visible

---

## Test Data Configuration

All test parameters are centrally managed in `test-data/test_data.json`.  
Adjust the configuration to control which scenarios are tested without modifying any test files.
