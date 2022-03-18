const { test, expect } = require('@playwright/test');

test.only('only test 01', async ({ page }) => {
});

test.describe.only('only 02', () => {
  test.only('only test 02', async ({ page }) => {
  });
});

test.describe.serial.only('only 03', () => {
  test.only('only test 03', async ({ page }) => {
  });
});

test.describe.parallel.only('only 04', () => {
  test.only('only test 04', async ({ page }) => {
  });
});