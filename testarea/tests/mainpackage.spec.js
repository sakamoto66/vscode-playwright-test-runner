const { test, expect } = require('@playwright/test');

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  const name = await page.innerText('.navbar__title');
  expect(name).toBe('Playwright');
});

test.describe('describe 01', () => {
  test('runs first 01', async ({ page }) => { /* ... */ });
  test('runs second 01', async ({ page }) => { /* ... */ });
});

test.describe.serial('describe 02', () => {
  test('runs first 02', async ({ page }) => { /* ... */ });
  test('runs second 02', async ({ page }) => { /* ... */ });
});
