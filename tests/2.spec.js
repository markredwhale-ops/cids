import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { describe } from 'node:test';

test('Place order', async ({ page }) => {


    page.on('dialog', async dialog => {
        await dialog.accept();
    });


    await page.goto('https://demoblaze.com');


    const firstProduct = page.locator(".card-title a").first();
    const productName = await firstProduct.textContent();

    await firstProduct.click();


    await page.getByText("Add to cart").click();


    await page.click("#cartur");


    await expect(page.getByRole('button', { name: 'Place Order' })).toBeVisible();


    await page.getByRole('button', { name: 'Place Order' }).click();


    const name = faker.person.fullName();
    const country = faker.location.country();
    const city = faker.location.city();
    const card = faker.finance.creditCardNumber();
    const month = faker.number.int({ min: 1, max: 12 });
    const year = faker.number.int({ min: 2026, max: 2036 });


    await page.fill("#name", name);
    await page.fill("#country", country);
    await page.fill("#city", city);
    await page.fill("#card", card);
    await page.fill("#month", month.toString());
    await page.fill("#year", year.toString());


    await page.getByRole('button', { name: 'Purchase' }).click();


    const confirmation = page.locator(".sweet-alert h2");
    await expect(confirmation).toHaveText("Thank you for your purchase!");

    console.log("Order placed for:", name);
    console.log("Product:", productName);

    await page.waitForTimeout(3000);

});
