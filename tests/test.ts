import { test, expect } from '@playwright/test';

test('app renders successfully', async ({ page }) => {
	await page.goto('/');
	// Wait for the app to load. Assuming there's a body.
	await expect(page.locator('body')).toBeVisible();
});
