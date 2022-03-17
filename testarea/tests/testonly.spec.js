const { test, expect } = require('@playwright/test');

test.only('basic test', async ({ page }) => {
});

test.describe.only('describe 02', () => {
  test.only('basic test', async ({ page }) => {
  });
});

test.describe.serial.only('describe 02', () => {
  test.only('basic test', async ({ page }) => {
  });
});

test.describe.parallel.only('describe 02', () => {
  test.only('basic test', async ({ page }) => {
  });
});