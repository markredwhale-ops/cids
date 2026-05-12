import { test, expect } from '@playwright/test';
import { de, faker } from '@faker-js/faker';


test("Tallin", async ({ page }) => {

    await page.goto("https://www.tpilet.ee/en/");

    //Departure

    const departureInput = page.locator("#web-searchform-departureStop");

    await departureInput.fill("Tallin");

    const departureSuggestions = page.locator("li[role='option']");

    await expect(departureSuggestions.first()).toBeVisible();

    const depCount = await departureSuggestions.count();

    console.log("total suggestions", depCount);

    let found = false;

    for (let i = 0; i < depCount; i++) {

        const option = departureSuggestions.nth(i);
        const text = await option.textContent();

        console.log("suggestion", text);

        if (text.includes("Tallinn Airport")) {

            found = true;
            await option.click();
            console.log("Tallinn Airport");
            break;

        }


    }
    //Destination

    const destinationInput = page.locator("#web-searchform-destinationStop");

    await destinationInput.fill("narva");

    const destinationSuggestions = page.locator("li[role='option']");

    await expect(departureSuggestions.first()).toBeVisible();

    const destCount = await destinationSuggestions.count();

    for (let i = 0; i < destCount; i++) {
        const option = destinationSuggestions.nth(i);
        const text = await option.textContent();

        console.log("destionation", text);

        if (text.includes("Narva Coach Station")) {
            await option.click();
            console.log("Narva");
            break;
        }
    }

    //Search

    await page.getByRole('button', { name: 'Search for a trip' }).click();

    const trips = page.locator(".trip");

    const count = await trips.count();

    console.log("trips", count);

    expect(count).toBe(0);




    await page.waitForTimeout(3000);
})



test("Popular Destinations", async ({ page }) => {

    await page.goto("https://www.tpilet.ee/en/");

    await page.getByText("I agree").click();

    const routes = page.locator("//div[@class='_1jbGZnZ85hSAiSPNRlBoEO']/a");

    await expect(routes.first()).toBeVisible();

    const count = await routes.count();

    console.log("Total routes", count);

    expect(count).toBeGreaterThan(0);

    const randomIndex = Math.floor(Math.random() * count);

    const selected = routes.nth(randomIndex);

    const text = await selected.textContent();

    console.log("Selected", text);

    const parts = text.split(">");
    const fromCity = parts[0].trim();
    const toCity = parts[1].trim();

    await selected.click();

    await page.waitForTimeout(1500);
    const departure = await page.locator("#web-searchform-departureStop").inputValue();
    const destination = await page.locator("#web-searchform-destinationStop").inputValue();

    expect(departure.toLowerCase()).toContain(fromCity.toLowerCase());
    expect(destination.toLowerCase()).toContain(toCity.toLowerCase());


    console.log(departure);


    await page.waitForTimeout(3000);
})





test("Filters", async ({ page }) => {

    await page.goto("https://www.tpilet.ee/en/");

    await page.getByText("I agree").click();

    await page.click("a[id='web-home-popular-17028-17058'] span:nth-child(1)");


    const showFilters = page.getByRole('button', { name: 'Show Filters' });
    await showFilters.click();

    const bonuses = page.locator("#web-filters-fareclass div");
    await expect(bonuses.first()).toBeVisible();
    const bonusesCount = await bonuses.count();
    console.log("bonuses", bonusesCount);
    expect(bonusesCount).toBeGreaterThan(0);

    const services = page.locator("#web-filters-busproperties div");
    await expect(services.first()).toBeVisible();
    const servicesCount = await services.count();
    console.log("services", servicesCount);
    expect(servicesCount).toBeGreaterThan(0);


    await page.waitForTimeout(3000);
})




test("Price", async ({ page }) => {

    await page.goto("https://www.tpilet.ee/en/");

    await page.getByText("I agree").click();

    await page.click("a[id='web-home-popular-17028-17058'] span:nth-child(1)");

    const tomorrowBtn = page.getByRole('button', { name: 'Tomorrow' });

    await tomorrowBtn.click();

    const trips = await page.locator("text=€");

    await expect(trips.first()).toBeVisible();

    const tripsCount = await trips.count();

    console.log("trips", tripsCount);

    for (let i = 0; i < tripsCount; i++) {

        const text = await trips.nth(i).textContent();

        const price = parseFloat(text.replace("€", "").trim());

        console.log("price", price);

        expect(price).toBeGreaterThan(5);
    }

    await page.waitForTimeout(3000);
})


test("Times", async ({ page }) => {

    await page.goto("https://www.tpilet.ee/en/");

    await page.getByText("I agree").click();


    await page.click("a[id='web-home-popular-17028-17058'] span:nth-child(1)");


    const tomorrowBtn = page.getByRole('button', { name: 'Tomorrow' });
    await tomorrowBtn.click();


    const trips = await page.locator("//section[@class='_3fxzjzEQnPxxGqdLwN0Vns  ']//div[@class='_325rVsLKzjISRzLm8QZRqd']");

    await page.waitForSelector("//section[@class='_3fxzjzEQnPxxGqdLwN0Vns  ']//div[@class='_325rVsLKzjISRzLm8QZRqd']");

    const count = await trips.count();
    console.log("Total trips:", count);

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {

        const trip = trips.nth(i);

        const timeElement = trip.locator("//*[contains(text(),'-')]");
        const durationElement = trip.locator("//*[contains(text(),'(')]");

        if (await timeElement.count() === 0 || await durationElement.count() === 0) {
            continue;
        }

        const timeText = await timeElement.first().textContent();
        const durationText = await durationElement.first().textContent();

        if (!timeText || !durationText) continue;

        const parts = timeText.split("-");
        const start = parts[0].trim();
        const end = parts[1].trim();

        const durationClean = durationText
            .replace("(", "")
            .replace("h)", "")
            .trim();

        const startParts = start.split(":");
        const endParts = end.split(":");
        const durationParts = durationClean.split(":");

        const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
        const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
        const durationMinutes = parseInt(durationParts[0]) * 60 + parseInt(durationParts[1]);

        let actualDuration = endMinutes - startMinutes;

        if (actualDuration < 0) {
            actualDuration = (24 * 60 - startMinutes) + endMinutes;
        }

        console.log(`Trip ${i}: calculated=${actualDuration}, expected=${durationMinutes}`);

        expect(actualDuration).toBe(durationMinutes);
    }

    await page.waitForTimeout(3000);
});



test("Stops", async ({ page }) => {

    await page.goto('https://www.tpilet.ee/en/');
    await page.getByText('I agree').click();

    await page.locator("a[id*='web-home-popular']").first().click();
    await page.getByRole('button', { name: 'Tomorrow' }).click();

    const trips = page.getByRole('listitem');
    await expect(trips.first()).toBeVisible();

    await trips.first().getByRole('button', { name: 'Stops' }).click();


    const stopsPanel = page.locator("text=Bus stop").locator("xpath=ancestor::div[2]");

    await expect(stopsPanel).toBeVisible();


    const times = stopsPanel.locator("text=/\\d{2}:\\d{2}/");

    await expect.poll(async () => await times.count()).toBeGreaterThan(2);

    const count = await times.count();
    console.log("times count:", count);

    for (let i = 0; i < count - 1; i += 2) {

        const arriveText = await times.nth(i).textContent();
        const departText = await times.nth(i + 1).textContent();

        if (!arriveText || !departText) continue;

        const [aH, aM] = arriveText.trim().split(':').map(Number);
        const [dH, dM] = departText.trim().split(':').map(Number);

        const arriveMinutes = aH * 60 + aM;
        const departMinutes = dH * 60 + dM;

        console.log(`Stop: arrive=${arriveMinutes}, depart=${departMinutes}`);

        expect(arriveMinutes).toBeLessThanOrEqual(departMinutes);
    }

});



test("Ticket", async ({ page }) => {
    await page.goto('https://www.tpilet.ee/en/');

    const cookieBtn = page.getByRole('button', { name: 'I agree' });
    if (await cookieBtn.isVisible()) {
        await cookieBtn.click();
    }

    await page.locator("a[id*='web-home-popular']").first().click();
    await page.getByRole('button', { name: "Tomorrow" }).click();

    const firstTrip = page.getByRole('listitem').first();
    await expect(firstTrip).toBeVisible({ timeout: 15000 });

    await firstTrip.getByRole('button', { name: /Tickets|Buy/i }).click();

    const priceRows = page.locator('//div[@id="ticket-panel-scroll-container"]//div[@class="_2S1EW3226v2PmbAwLwPROR "]');

    await expect(priceRows.first()).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(500);

    const priceTexts = await priceRows.allInnerTexts();
    console.log("Raw text from locators:", priceTexts);

    const prices = [];
    for (const text of priceTexts) {

        const match = text.match(/(\d+\.\d{2})/);
        if (match) {
            prices.push(parseFloat(match[1]));
        }
    }

    console.log("Parsed numeric prices:", prices);

    expect(prices.length).toBeGreaterThanOrEqual(1);

    if (prices.length > 1) {
        const sortedPrices = [...prices].sort((a, b) => b - a);
        expect(prices).toEqual(sortedPrices);
        console.log("Успех: Цены отсортированы по убыванию.");
    } else {
        console.log("Найдена только 1 цена. Сортировка корректна по умолчанию.");
    }
});



test("Dates", async ({ page }) => {
    await page.goto('https://www.tpilet.ee/en/');

    const cookieBtn = page.getByRole('button', { name: 'I agree' });
    if (await cookieBtn.isVisible()) {
        await cookieBtn.click();
    }

    await page.locator("a[id*='web-home-popular']").first().click();
    await page.getByRole('button', { name: "Tomorrow" }).click();

    const firstTrip = page.getByRole('listitem').first();
    await expect(firstTrip).toBeVisible({ timeout: 15000 });

    await firstTrip.getByRole('button', { name: /Tickets|Buy/i }).click();

    const ticketPanel = page.locator("#ticket-panel-scroll-container");
    await expect(ticketPanel).toBeVisible();

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    function getFormattedDate(dateObj) {
        let day = String(dateObj.getDate()).padStart(2, "0");
        let month = String(dateObj.getMonth() + 1).padStart(2, "0");
        let year = dateObj.getFullYear();
        return `${day}.${month}.${year}`;

    }

    const todayText = getFormattedDate(today);
    const tomorrowText = getFormattedDate(tomorrow);
    const yesterdayText = getFormattedDate(yesterday);

    const panelText = await ticketPanel.innerText();

    const hasToday = panelText.includes(todayText);
    const hasTomorrow = panelText.includes(tomorrowText);
    const hasYesterday = panelText.includes(yesterdayText);

    expect(hasToday || hasTomorrow).toBe(true);
    expect(hasYesterday).toBe(false);

    const isToday = panelText.includes(todayText);

    const timeMatch = panelText.match(/(\d{2}):(\d{2})/);

    if (timeMatch) {
        const ticketHours = parseInt(timeMatch[1]);
        const ticketMinutes = parseInt(timeMatch[2]);

        const ticketTotalMinutes = ticketHours * 60 + ticketMinutes;

        const currentHours = today.getHours();
        const currentMinutes = today.getMinutes();
        const currentTotalMinutes = currentHours * 60 + currentMinutes;

        console.log(`Ticket time", ${ticketHours}, ${ticketMinutes}, (${ticketTotalMinutes} min)`);
        console.log(`Current time", ${currentHours}, ${currentMinutes}, (${currentTotalMinutes} min)`);

        if (isToday) {
            expect(ticketTotalMinutes).toBeGreaterThan(currentTotalMinutes);
            console.log("Passed");

        } else {
            console.log("Ticked is for tomorrow");

            expect(ticketHours).toBeLessThan(24);
            expect(ticketMinutes).toBeLessThan(60);

        }

    }

    await page.waitForTimeout(3000);
});


test("Remove btn is not working", async ({ page }) => {
    await page.goto('https://www.tpilet.ee/en/');

    const cookieBtn = page.getByRole('button', { name: 'I agree' });
    if (await cookieBtn.isVisible()) {
        await cookieBtn.click();
    }

    await page.locator("a[id*='web-home-popular']").first().click();
    await page.getByRole('button', { name: "Tomorrow" }).click();

    const firstTrip = page.getByRole('listitem').first();
    await expect(firstTrip).toBeVisible({ timeout: 15000 });

    await firstTrip.getByRole('button', { name: /Tickets|Buy/i }).click();

    const ticketPanel = page.locator("#ticket-panel-scroll-container");
    await expect(ticketPanel).toBeVisible();

    const firstRemoveBtn = ticketPanel.getByRole('button', { name: "Remove ticket" }).first();

    await expect(firstRemoveBtn).toBeVisible({ timeout: 10000 });

    const firstPrice = page.locator('//div[@id="ticket-panel-scroll-container"]//div[@class="_2S1EW3226v2PmbAwLwPROR "]').first();

    const priceBeforeClick = await firstPrice.innerText();

    console.log("Before", priceBeforeClick);

    await firstRemoveBtn.click({ force: true });

    await page.waitForTimeout(500);

    const priceAfterClick = await firstPrice.innerText();

    console.log("After", priceAfterClick);

    expect(priceAfterClick).toBe(priceBeforeClick);

    console.log("True");

    await page.waitForTimeout(3000);

});



test("Seats", async ({ page }) => {
    await page.goto('https://www.tpilet.ee/en/');

    const cookieBtn = page.getByRole('button', { name: 'I agree' });
    if (await cookieBtn.isVisible()) {
        await cookieBtn.click();
    }

    await page.locator("a[id*='web-home-popular']").first().click();
    await page.getByRole('button', { name: "Tomorrow" }).click();

    const firstTrip = page.getByRole('listitem').first();
    await expect(firstTrip).toBeVisible({ timeout: 15000 });

    await firstTrip.getByRole('button', { name: /Tickets|Buy/i }).click();

    const ticketPanel = page.locator("#ticket-panel-scroll-container");
    await expect(ticketPanel).toBeVisible();

    const addTicketBtn = ticketPanel.getByRole('button', { name: "Add ticket" }).first();
    await expect(addTicketBtn).toBeVisible();

    await addTicketBtn.click();

    await page.waitForTimeout(1500);

    const seatsHeading = page.getByRole('heading', { name: "Choose seats" });
    
    await expect(seatsHeading).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(1500);


    const availableSeats = page.getByRole('button', { name: /Available economy class seat/i});
    const availableCount = await availableSeats.count();


    const takenSeats = page.getByRole('button', { name: /Seat has already been taken/i});
    const takenCount = await takenSeats.count();

    console.log(`Available ${availableCount}`);
    console.log(`Taken ${takenCount}`);
    console.log(`Overall seats ${availableCount + takenCount}`);


    await page.waitForTimeout(3000);

});


test("Seats sort", async ({ page }) => {
    await page.goto('https://www.tpilet.ee/en/');

    const cookieBtn = page.getByRole('button', { name: 'I agree' });
    if (await cookieBtn.isVisible()) {
        await cookieBtn.click();
    }

    await page.locator("a[id*='web-home-popular']").first().click();
    await page.getByRole('button', { name: "Tomorrow" }).click();

    const firstTrip = page.getByRole('listitem').first();
    await expect(firstTrip).toBeVisible({ timeout: 15000 });

    await firstTrip.getByRole('button', { name: /Tickets|Buy/i }).click();

    const ticketPanel = page.locator("#ticket-panel-scroll-container");
    await expect(ticketPanel).toBeVisible();

    const addTicketBtn = ticketPanel.getByRole('button', { name: "Add ticket" }).first();
    await expect(addTicketBtn).toBeVisible();

    await addTicketBtn.click();

    await page.waitForTimeout(1500);

    const seatsHeading = page.getByRole('heading', { name: "Choose seats" });
    
    await expect(seatsHeading).toBeVisible({ timeout: 10000 });

    await page.waitForTimeout(1500);

    const allButtons = ticketPanel.locator('button');

   
    const buttonIds = await allButtons.evaluateAll((buttons) => 
        buttons.map(btn => btn.id)
    );

    const rawSeatNumbers = [];

    
    for (let i = 0; i < buttonIds.length; i++) {
        let idText = buttonIds[i];

     
        if (idText) {
            
            let match = idText.match(/\d+/);
            
            if (match) {
                let number = parseInt(match[0]);
                

                if (number > 0 && number <= 57) {
                    rawSeatNumbers.push(number);
                }
            }
        }
    }

 
    const uniqueSeats = [...new Set(rawSeatNumbers)];
    const sortedSeats = uniqueSeats.sort((a, b) => a - b);

    console.log("Sorted with ID:", sortedSeats);

    expect(sortedSeats[0]).toBe(1);


    const totalSeatsFound = sortedSeats.length;
    expect(totalSeatsFound).toBeGreaterThanOrEqual(55);

    console.log(`Collected ${totalSeatsFound} , Starts with ${sortedSeats[0]}, ends with ${sortedSeats[sortedSeats.length - 1]}.`);

    await page.waitForTimeout(3000);

});



