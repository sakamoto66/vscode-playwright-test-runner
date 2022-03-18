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


test.describe('describe 03', () => {
  for(let idx=0;idx<3;idx++){
    test(`runs first 03 ${idx}`, async ({ page }) => { /* ... */ });
    test(`(runs) first 03 ${idx} aaa`, async ({ page }) => { /* ... */ });
  }
  test('runs "first" 03', async ({ page }) => {
    test.step('step01', async () =>{
      console.log("$env:HOGE="+process.env.HOGE);
    });
  });
});

test.describe.parallel('describe 04', () => {
  test('runs first 04', async ({ page }) => { /* ... */ });
  test('runs second 04', async ({ page }) => { /* ... */ });
});
