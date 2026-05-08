import { test, expect } from '@playwright/test';
//import { describe } from 'node:test';
import { faker } from '@faker-js/faker';

test('has title', async ({ page }) => {
    await page.goto('https://demo.nopcommerce.com/register');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Register/);

    await expect(page).toHaveURL('https://demo.nopcommerce.com/register');

    const logoElement = await page.locator('.header-logo');
    await expect(logoElement).toBeVisible();

    const searchInput = await page.locator("#small-searchterms");
    await expect(searchInput).toBeEnabled();
    const searchButton = await page.locator(".button-1.search-box-button");
    await expect(searchButton).toBeVisible();
    const genderMale = await page.locator("#gender-male");
    await genderMale.click();
    //await page.locator("#gender-male").click();
    //await page.click("#gender-male");
    //toBeChecked()

    await expect(genderMale).toBeChecked();

    const newsletterCheckbox = page.locator("#NewsLetterSubscriptions_0__IsActive");
    await page.click("#NewsLetterSubscriptions_0__IsActive")

    await expect(newsletterCheckbox).not.toBeChecked();


    const registerButton = page.locator("#register-button");
    await expect(registerButton).toHaveAttribute("type", "submit");

    const titleName = page.locator("div[class='page-title'] h1");
    await expect(titleName).toHaveText("Register");
    await expect(titleName).toContainText("Reg");

    await page.fill("#Email", "test@gmail.com");
    await expect(await page.locator("#Email")).toHaveValue("test@gmail.com");



    await page.waitForTimeout(3000);
});

test('login', async ({ page }) => {
    await page.goto('https://demoblaze.com/index.html');

    await page.click("#login2");
    await page.fill("#loginusername", "redwhale2");
    await page.fill("#loginpassword", "123456");
    await page.click("button[onclick='logIn()']");

    const logIn = page.locator("#nameofuser");
    await expect(logIn).toContainText("Welcome");

    const firstCard = page.locator(".card").first();
    const priceOnMain = await firstCard.locator("h5").textContent();
    const cleanMainPrice = priceOnMain.replace("$", "").trim();
    console.log("Main Page Price", cleanMainPrice);

    await firstCard.locator("a.hrefch").click();

    await page.waitForSelector(".price-container");

    const detailPriceText = await page.locator(".price-container").textContent();

    const cleanDetailPrice = detailPriceText.match(/\d+/)[0];

    console.log("Detail page price:", cleanDetailPrice);

    expect(cleanDetailPrice).toBe(cleanMainPrice);









    await page.waitForTimeout(3000);
});


test('Cart', async ({ page }) => {
    await page.goto('https://demoblaze.com/index.html');

    const firstProduct = page.locator(".card-title a").first();

    const productName = await firstProduct.textContent();

    await firstProduct.click();

    await page.click("//a[text()='Add to cart']");

    page.once("dialog", async dialog => {
        expect(dialog.message()).toContain("Product added");
        await dialog.accept();
    });

    await page.click("#cartur");

    const cartProduct = page.locator("td:nth-child(2)");

    await expect(cartProduct).toContainText(productName);




    await page.waitForTimeout(3000);

});


test('Random Item', async ({ page }) => {
    await page.goto('https://demoblaze.com/index.html');

    const products = page.locator(".card-title a");
    const count = await products.count();

    const randomIndex = Math.floor(Math.random() * count);

    const randomProduct = products.nth(randomIndex);
    const productName = await randomProduct.textContent();

    console.log("Random Item", productName);

    await randomProduct.click();

    const text = await page.locator("#more-information p").textContent();

    expect(text.trim().length).toBeGreaterThan(0);


    await page.waitForTimeout(3000);
});


test('9 products', async ({ page }) => {
    await page.goto('https://demoblaze.com/index.html');

    const products = page.locator(".card");

    await expect(products).toHaveCount(9);

    await page.waitForTimeout(3000);

});

test('Random cart', async ({ page }) => {
    await page.goto('https://demoblaze.com/index.html');

    const products = page.locator(".card-title a");
    const productCount = await products.count();

    const randomAmount = Math.floor(Math.random() * 4) + 2;

    console.log("Products", randomAmount);

    for (let i = 0; i < randomAmount; i++) {

        const randomIndex = Math.floor(Math.random() * productCount);
        const product = products.nth(randomIndex);

        await product.click();

        page.once("dialog", dialog => dialog.accept());

        await page.getByText("Add to cart").click();

        await page.goto("https://demoblaze.com/index.html");
    }

    await page.click("#cartur");

    await page.waitForSelector(".success");

    const cartItems = await page.locator(".success").count();

    expect(cartItems).toBeGreaterThanOrEqual(1);

    await page.waitForTimeout(3000);
});




test('Avg price', async ({ page }) => {
    await page.goto('https://demoblaze.com/index.html');

    await page.waitForSelector(".card");

    const prices = page.locator(".card h5");
    const count = await prices.count();
    let total = 0;
    for (let i = 0; i < count; i++) {
        const text = await prices.nth(i).textContent();
        const price = Number(text.replace("$", ""));
        total += price;
    }

    const average = total / count;

    console.log("average", average);
    console.log("total", total);
    console.log("count", count);

    expect(average).toBeGreaterThan(0);

    await page.waitForTimeout(3000);



});



test('Samsung', async ({ page }) => {
    await page.goto('https://demoblaze.com/index.html');
    await page.waitForSelector(".card-title a");

    const titles = page.locator(".card-title a");
    const count = await titles.count();

    let samsungCount = 0;
    for (let i = 0; i < count; i++) {
        const text = await titles.nth(i).textContent();

        if (text.includes("Samsung")) {
            samsungCount++;

        };
        //console.log("title", text);
    }

    console.log("Samsung count", samsungCount);
    expect(samsungCount).toBeGreaterThanOrEqual(0);

    await page.waitForTimeout(5000);




});


test('Delete', async ({ page }) => {
    await page.goto('https://demoblaze.com/index.html');
    await page.waitForSelector(".card-title a");
    const firstProduct = page.locator(".card-title a").first();
    const productName = await firstProduct.textContent();

    await firstProduct.click();

    await page.click("//a[text()='Add to cart']");

    await page.click("#cartur");

    await page.waitForSelector(".success");

    const cartProduct = page.locator("td:nth-child(2)");

    await expect(cartProduct).toContainText(productName);

    await page.click("//a[text()='Delete']");

    await expect(cartProduct).toHaveCount(0);




});


test.only('Place order', async ({ page }) => {
    await page.goto('https://demoblaze.com/index.html');
    await page.waitForSelector(".card-title a");
    const firstProduct = page.locator(".card-title a").first();
    const productName = await firstProduct.textContent();

    await firstProduct.click();

    await page.click("//a[text()='Add to cart']");

    await page.click("#cartur");

    await page.waitForSelector(".success");

    await page.click("//button[text()='Place Order']");

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
    await page.fill("#month", String(month));
    await page.fill("#year", String(year));

    await page.click("button:has-text('Purchase')");


    const confirmation = page.locator(".sweet-alert h2");

    await expect(confirmation).toHaveText("Thank you for your purchase!");

    console.log("Order placed for:", name);

    await page.waitForTimeout(3000);



});

