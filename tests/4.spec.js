import { test, expect, firefox } from '@playwright/test';
import { de, faker, th, tr } from '@faker-js/faker';


test("ycombinator sort", async ({ page }) => {

    await page.goto("https://news.ycombinator.com");

    await page.getByRole('link', { name: "new", exact: true }).click();

    const allRanks = [];

    for (let pageNum = 0; pageNum < 4; pageNum++) {
        const rankElement = page.locator(".rank");
        await expect(rankElement.first()).toBeVisible();

        const count = await rankElement.count();

        for (let i = 0; i < count; i++) {
            let text = await rankElement.nth(i).innerText();
            let rankNumber = parseInt(text);
            allRanks.push(rankNumber);
        }

        await page.locator('.morelink').click();

        await page.waitForTimeout(1500);
    }
    const firstHundred = allRanks.slice(0, 100);

    expect(firstHundred.length).toBe(100);

    console.log(`Numbers starting from ${firstHundred[0]} until ${firstHundred[99]}`);

    for (let i = 0; i < firstHundred.length; i++) {
        let currentRank = firstHundred[i];

        let expectedRank = i + 1;

        expect(currentRank).toBe(expectedRank);
    }



    console.log("true");

    await page.waitForTimeout(3000);
})


test("ycombinator comments", async ({ page }) => {

    test.setTimeout(60000);

    await page.goto("https://news.ycombinator.com");

    const commentLinks = page.locator('.subline a').filter({ hasText: /comment|discuss/i });

    await expect(commentLinks.first()).toBeVisible();

    const allRanks = [];

    for (let pageNum = 0; pageNum < 4; pageNum++) {
        const rankElement = page.locator(".rank");
        await expect(rankElement.first()).toBeVisible();

        const count = await rankElement.count();

        for (let i = 0; i < count; i++) {
            let text = await rankElement.nth(i).innerText();
            let rankNumber = parseInt(text);
            allRanks.push(rankNumber);
        }

        await page.locator('.morelink').click();
        await page.waitForTimeout(1500);
    }

    const firstHundred = allRanks.slice(0, 100);
    expect(firstHundred.length).toBe(100);

    console.log(`Numbers starting from ${firstHundred[0]} until ${firstHundred[99]}`);

    for (let i = 0; i < firstHundred.length; i++) {
        let currentRank = firstHundred[i];
        let expectedRank = i + 1;
        expect(currentRank).toBe(expectedRank);
    }

    console.log("true");
    await page.waitForTimeout(3000);
});


test("ycombinator comments1", async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("https://news.ycombinator.com");


    const commentLinks = page.locator('.subline a[href^="item?id="]');
    await expect(commentLinks.first()).toBeVisible();

    const postUrls = new Set();
    const countLinks = await commentLinks.count();

    for (let i = 0; i < countLinks && postUrls.size < 5; i++) {
        const href = await commentLinks.nth(i).getAttribute('href');
        if (href) postUrls.add(`https://news.ycombinator.com/${href}`);
    }

    const uniqueUrls = Array.from(postUrls);
    console.log(`Found: ${uniqueUrls.length} unique posts to check.\n`);

    for (let i = 0; i < uniqueUrls.length; i++) {
        await page.goto(uniqueUrls[i]);
        console.log(`[Post ${i + 1}/5] Checking: ${uniqueUrls[i]}`);

        const commentTree = page.locator('.comment-tree');
        if (!(await commentTree.isVisible())) {
            console.log("   No comments found, skipping.");
            continue;
        }

        const rootComments = page.locator('.comtr').filter({
            has: page.locator('.ind[indent="0"]')
        });

        const count = await rootComments.count();
        const commentsToProcess = Math.min(count, 10);
        console.log(`   Processing ${commentsToProcess} root comments...`);

        for (let j = 0; j < commentsToProcess; j++) {
            const ageElement = rootComments.nth(j).locator('.age');
            const timestampAttr = await ageElement.getAttribute('title');

            expect.soft(timestampAttr, `Comment ${j + 1}: Missing title attribute`).not.toBeNull();

            if (timestampAttr) {

                const cleanDateStr = timestampAttr.split(' ')[0] + 'Z';
                const commentDate = new Date(cleanDateStr);

                expect.soft(commentDate.getTime(), `Comment ${j + 1}: Invalid date format "${timestampAttr}"`)
                    .toBeGreaterThan(0);


                const now = Date.now();
                const tolerance = 300000;

                expect.soft(commentDate.getTime(), `Comment ${j + 1}: Date ${commentDate.toISOString()} is in the future compared to ${new Date(now).toISOString()}`)
                    .toBeLessThan(now + tolerance);
            }
        }
    }
    console.log("\nAll posts validated.");
});



test("Links with G and /", async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("https://news.ycombinator.com");

    const linksLocator = page.locator("a");
    await expect(linksLocator.first()).toBeVisible();

    const allLinkTexts = await linksLocator.evaluateAll(elements =>
        elements.map(el => el.innerText)
    );

    const filteredLinks = allLinkTexts.filter(text => {
        const trimmed = text.trim();

        const startsWithG = trimmed.toLowerCase().startsWith('g');
        const slashIndex = trimmed.indexOf('/');
        const hasSlashInMiddle = slashIndex > 0 && slashIndex < trimmed.length - 1;
        return startsWithG && hasSlashInMiddle;
    });

    console.log(`Total Links ${allLinkTexts.length}`);
    console.log(`Links with G ${filteredLinks.length}`);

    if (filteredLinks.length > 0) {
        console.log("\nMatched list");
        filteredLinks.forEach((link, index) => {
            console.log(`${index + 1}: "${link}"`);

        });


    } else {
        console.log("\nNo matching links found");

    }


    expect(allLinkTexts.length).toBeGreaterThan(0);

    console.log("true");
    await page.waitForTimeout(3000);
});

test("Search", async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("https://news.ycombinator.com");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const searchInput = page.locator("input[name='q']");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("github.com");
    await searchInput.press("Enter");

    await page.waitForTimeout(2000);

    await page.waitForURL(/hn.algolia.com/);
    const newUrl = page.url();
    console.log(`New URL ${newUrl}`);
    expect(newUrl).toContain("hn.algolia.com");

    const sortDropdown = page.getByRole('combobox', { name: 'Popularity' });


    await sortDropdown.click();

    const popularityOption = page.getByRole('option', { name: 'Popularity' });
    await expect(popularityOption).toBeVisible();
    await popularityOption.click();

    await expect(page).not.toHaveURL(/sort=byDate/);
    await expect(sortDropdown).toContainText(/Popularity/i);

    await page.waitForTimeout(2000);

    const pointsLocator = await page.locator(".Story_meta");

    const metaTexts = await pointsLocator.allInnerTexts();

    const pointsArray = metaTexts.map(text => {
        const match = text.match(/(\d+)\s+point/);
        return match ? parseInt(match[1]) : 0;

    });

    console.log("Points Found", pointsArray);

    for (let i = 0; i < Math.min(pointsArray.length - 1, 5); i++) {
        const currentPoints = pointsArray[i];
        const nextPoints = pointsArray[i + 1];

        expect(currentPoints).toBeGreaterThanOrEqual(0);

    }

    expect(page.url()).not.toContain('sort=byDate');
    console.log("true");
    await page.waitForTimeout(3000);
});



test("Search time", async ({ page }) => {
    test.setTimeout(60000);
    await page.goto("https://hn.algolia.com/");

    const randomQuery = faker.word.sample();
    console.log(`\nGenerated random search query: "${randomQuery}"`);

    const searchInput = page.getByPlaceholder(/Search stories by title/i);
    await expect(searchInput).toBeVisible();

    const responsePromise = page.waitForResponse(response =>
        response.url().includes('algolia.net') && response.status() === 200
    );

    const startTime = performance.now();

    await searchInput.fill(randomQuery);

    await responsePromise;

    const endTime = performance.now();
    const networkTimeSeconds = (endTime - startTime) / 1000;

    const statsTextLocator = page.getByText(/results \(/);
    await expect(statsTextLocator).toBeVisible();
    const fullText = await statsTextLocator.innerText();

    const timeMatch = fullText.match(/\(([\d.]+)\s*seconds\)/);
    expect(timeMatch, "Could not parse time from UI").not.toBeNull();

    const uiEngineTimeSeconds = parseFloat(timeMatch[1]);

    console.log(`UI Displayed Time (Engine): ${uiEngineTimeSeconds} seconds`);
    console.log(`Measured Network Time (Roundtrip): ${networkTimeSeconds.toFixed(3)} seconds`);


    expect(uiEngineTimeSeconds).toBeGreaterThan(0);

    expect(uiEngineTimeSeconds).toBeLessThan(networkTimeSeconds);

    const networkDelay = networkTimeSeconds - uiEngineTimeSeconds;
    expect.soft(networkDelay, "Network delay is suspiciously high").toBeLessThan(2.0);
    console.log("true");
    await page.waitForTimeout(3000);
});



test("Hotel Info", async ({ page, context }) => {
    test.setTimeout(60000);


    await page.goto("https://www.hotel.info/en");

    const cookieBtn = page.getByRole('button', { name: /Accept|Agree/i }).first();
    try {
        await cookieBtn.waitFor({ state: 'visible', timeout: 3000 });
        await cookieBtn.click();
    } catch (e) {
    }

    const searchTrigger = page.getByRole('button', { name: /Location, hotel/i }).first();
    await expect(searchTrigger).toBeVisible();
    await searchTrigger.click();

    const locationList = page.getByRole('list', { name: /Location/i });
    await expect(locationList).toBeVisible();

    const destinationOptions = locationList.getByRole("button");
    await expect(destinationOptions.first()).toBeVisible();

    const optionsCount = await destinationOptions.count();
    expect(optionsCount, "Location dropdown should have options").toBeGreaterThan(0);

    const randomDestIndex = Math.floor(Math.random() * optionsCount);
    const selectedOption = destinationOptions.nth(randomDestIndex);

    const destionationText = await selectedOption.innerText();
    console.log(`\n[1] Selected destination: "${destionationText.trim()}"`);
    await selectedOption.click();

    const guestMenuBtn = page.getByRole('button', { name: /Persons and rooms/i }).first();
    await expect(guestMenuBtn).toBeVisible();
    await guestMenuBtn.click();

    await page.waitForTimeout(1000);

    const roomDialog = page.getByRole('dialog', { name: /Persons and rooms/i }).or(page.locator('.bottom-sheet'));
    const roomOptions = roomDialog.getByRole('menuitem').filter({ hasText: /adult|room/i });
    await expect(roomOptions.first()).toBeVisible();

    const roomsCount = await roomOptions.count();
    expect(roomsCount, "Rooms/Persons dialog should have options").toBeGreaterThan(0);

    const randomRoomIndex = Math.floor(Math.random() * roomsCount);
    const selectedRoomOption = roomOptions.nth(randomRoomIndex);

    const roomText = await selectedRoomOption.innerText();
    console.log(`[2] Selected room configuration: "${roomText.trim()}"`);
    await selectedRoomOption.click();

    const now = new Date();
    const arrivalDate = new Date();
    arrivalDate.setDate(now.getDate() + 3);

    const departureDate = new Date();
    departureDate.setDate(now.getDate() + 4);

    const arrivalDay = arrivalDate.getDate().toString();
    const departureDay = departureDate.getDate().toString();

    const arrivalInNextMonth = arrivalDate.getMonth() !== now.getMonth();
    const departureInNextMonth = departureDate.getMonth() !== arrivalDate.getMonth();


    const datePicker = page.getByRole('button', { name: /Arrival/i }).first();
    await datePicker.click();
    await page.waitForTimeout(1000);

    const activeDialog = page.getByRole('dialog').or(page.locator('.DateRangePicker'));
    const nextMonthBtn = activeDialog.getByRole('button', { name: /next month/i }).first();
    //await expect(activeDialog).toBeVisible();


    const calendarGrid = page.getByRole('grid').first();
    //await expect(calendarGrid).toBeVisible();

    // let arrivalCell = calendarGrid.getByRole('gridcell').filter({ hasText: new RegExp(`^${arrivalDay}$`) }).first();
    // let arrivalBtn = activeDialog.getByRole('button');

    if (arrivalInNextMonth) {
        console.log(`[+] Arrival is in the next Month`);
        if (await nextMonthBtn.isVisible()) {
            await nextMonthBtn.click();
            await page.waitForTimeout(500);
        }
    }

    console.log(`[3] Selecting Arrival: ${arrivalDay}, Departure: ${departureDay}`);


    const arrivalBtn = calendarGrid.getByRole('gridcell').filter({ hasText: new RegExp(`^${arrivalDay}$`) }).first().getByRole('button');
    await expect(arrivalBtn).toBeVisible();
    await arrivalBtn.click();
    await page.waitForTimeout(500);


    if (departureInNextMonth) {
        console.log(`[+] Departure is in the next Month`);
        if (await nextMonthBtn.isVisible()) {
            await nextMonthBtn.click();
            await page.waitForTimeout(500);
        }
    }

    //const activeDialog = page.getByRole('dialog').or(page.locator('.DateRangePicker'));
    //const departureCell = activeDialog.getByRole('gridcell').filter({ hasText: new RegExp(`^${departureDay}$`) }).first();
    const departureBtn = activeDialog.getByRole('gridcell').filter({ hasText: new RegExp(`^${departureDay}$`) }).first().getByRole('button');

    await expect(departureBtn).toBeVisible();
    await departureBtn.click();

    await page.waitForTimeout(1500);

    console.log(`[4] Applying filters: Dragging Budget to 100, Breakfast, Free Cancellation`);

    const additionalFiltersBtn = page.getByRole('button', { name: /Additional search filters/i }).first();
    await expect(additionalFiltersBtn).toBeVisible();
    await additionalFiltersBtn.click();

    await page.waitForTimeout(1000);

    const maxBudgetInput = page.getByRole('textbox', { name: /Maximum/i }).first();
    const maxThumb = page.locator('div[class*="handle"], div[class*="thumb"], [role="slider"], input[type="range"]').last();

    const thumbBox = await maxThumb.boundingBox();

    if (thumbBox) {
        let currentX = thumbBox.x + thumbBox.width / 2;
        const currentY = thumbBox.y + thumbBox.height / 2;

        await page.mouse.move(currentX, currentY);
        await page.mouse.down();

        for (let i = 0; i < 250; i++) {
            currentX -= 2;
            await page.mouse.move(currentX, currentY);
            await page.waitForTimeout(10);

            const valText = await maxBudgetInput.inputValue();
            const valNum = parseInt(valText.replace(/\D/g, ''), 10);

            if (valNum && valNum <= 60) {
                console.log(`[+] Budget slider physically dragged to ${valNum}`);
                break;
            }
        }
        await page.mouse.up();
    }

    await page.waitForTimeout(1000);

    const breakfastCheckbox = page.locator('label, span, div').filter({ hasText: /^Breakfast included/i }).first();
    await expect(breakfastCheckbox).toBeVisible();
    await breakfastCheckbox.click();
    await page.waitForTimeout(500);

    const cancellationCheckbox = page.locator('label, span, div').filter({ hasText: /^Free cancellation/i }).first();
    await expect(cancellationCheckbox).toBeVisible();
    await cancellationCheckbox.click();

    const applyFiltersBtn = page.getByRole('button', { name: /Apply|Done/i }).first();
    if (await applyFiltersBtn.isVisible()) {
        await applyFiltersBtn.click();
        await page.waitForTimeout(500);
    }

    console.log(`[5] Executing Search...`);

    const searchHotelsBtn = page.getByRole('link', { name: /Search hotels/i }).or(page.getByRole('button', { name: /Search hotels/i })).first();
    await searchHotelsBtn.click();

    await page.waitForURL(/list/i);
    await page.waitForLoadState('domcontentloaded');
    console.log(`\n[+] Arrived at result page`);
    await page.waitForTimeout(2000);

    const hotelArticles = await page.locator('article');

    if (await hotelArticles.count() === 0) {
        console.log(`[-] No hotels found on the result page`);
        return;
    }

    await expect(hotelArticles.first()).toBeVisible({ timeout: 15000 });

    const firstArticle = hotelArticles.first();
    const hotelCard = firstArticle.locator('..').locator("..");

    let hotelName = await firstArticle.innerText();
    hotelName = hotelName.replace(/\n/g, ' ').trim();

    const cardText = await hotelCard.innerText();
    const ratingMatch = cardText.match(/\b([1-9]\.\d|10\.0)\b/);
    const expectedRating = ratingMatch ? ratingMatch[0] : null;

    if (!expectedRating) {
        console.log(`[-] No numeric rating found for "${hotelName}`);
    } else {
        console.log(`\n[6] Validating First hotel "${hotelName}"`);
        console.log(`[+] Expected rating from list ${expectedRating}`);

        const hotelLink = hotelCard.getByRole('link').first();

        if (await hotelLink.count() === 0) {
            console.log(`No link`);
            return;
        }

        const [hotelPage] = await Promise.all([
            context.waitForEvent('page'),
            hotelLink.click()
        ]);

        await hotelPage.waitForLoadState('domcontentloaded');
        await hotelPage.waitForTimeout(2000);

        const detailBody = hotelPage.locator('body').first();
        await expect.soft(detailBody, `Rating $${expectedRating} missing on detals page`).toContainText(expectedRating);
        console.log(`[+] Succes Rating ${expectedRating} matches`);

        await hotelPage.close();

    }

    console.log(`\n[+] Successfully finished deep checking hotel ratings!`);
    await page.waitForTimeout(2000);
});


test.only("Checkbox", async ({ page, context }) => {
    test.setTimeout(60000);


    await page.goto("https://www.hotel.info/en");

    const cookieBtn = page.getByRole('button', { name: /Accept|Agree/i }).first();
    try {
        await cookieBtn.waitFor({ state: 'visible', timeout: 3000 });
        await cookieBtn.click();
    } catch (e) {
    }

    const searchTrigger = page.getByRole('button', { name: /Location, hotel/i }).first();
    await expect(searchTrigger).toBeVisible();
    await searchTrigger.click();

    const locationList = page.getByRole('list', { name: /Location/i });
    await expect(locationList).toBeVisible();

    const destinationOptions = locationList.getByRole("button");
    await expect(destinationOptions.first()).toBeVisible();

    const optionsCount = await destinationOptions.count();
    expect(optionsCount, "Location dropdown should have options").toBeGreaterThan(0);

    const randomDestIndex = Math.floor(Math.random() * optionsCount);
    const selectedOption = destinationOptions.nth(randomDestIndex);

    const destionationText = await selectedOption.innerText();
    console.log(`\n[1] Selected destination: "${destionationText.trim()}"`);
    await selectedOption.click();

    const guestMenuBtn = page.getByRole('button', { name: /Persons and rooms/i }).first();
    await expect(guestMenuBtn).toBeVisible();
    await guestMenuBtn.click();

    await page.waitForTimeout(1000);

    const roomDialog = page.getByRole('dialog', { name: /Persons and rooms/i }).or(page.locator('.bottom-sheet'));
    const roomOptions = roomDialog.getByRole('menuitem').filter({ hasText: /adult|room/i });
    await expect(roomOptions.first()).toBeVisible();

    const roomsCount = await roomOptions.count();
    expect(roomsCount, "Rooms/Persons dialog should have options").toBeGreaterThan(0);

    const randomRoomIndex = Math.floor(Math.random() * roomsCount);
    const selectedRoomOption = roomOptions.nth(randomRoomIndex);

    const roomText = await selectedRoomOption.innerText();
    console.log(`[2] Selected room configuration: "${roomText.trim()}"`);
    await selectedRoomOption.click();

    const now = new Date();
    const arrivalDate = new Date();
    arrivalDate.setDate(now.getDate() + 3);

    const departureDate = new Date();
    departureDate.setDate(now.getDate() + 4);

    const arrivalDay = arrivalDate.getDate().toString();
    const departureDay = departureDate.getDate().toString();

    const arrivalInNextMonth = arrivalDate.getMonth() !== now.getMonth();
    const departureInNextMonth = departureDate.getMonth() !== arrivalDate.getMonth();


    const datePicker = page.getByRole('button', { name: /Arrival/i }).first();
    await datePicker.click();
    await page.waitForTimeout(1000);

    const activeDialog = page.getByRole('dialog').or(page.locator('.DateRangePicker'));
    const nextMonthBtn = activeDialog.getByRole('button', { name: /next month/i }).first();


    const calendarGrid = page.getByRole('grid').first();


    if (arrivalInNextMonth) {
        console.log(`[+] Arrival is in the next Month`);
        if (await nextMonthBtn.isVisible()) {
            await nextMonthBtn.click();
            await page.waitForTimeout(500);
        }
    }

    console.log(`[3] Selecting Arrival: ${arrivalDay}, Departure: ${departureDay}`);


    const arrivalBtn = calendarGrid.getByRole('gridcell').filter({ hasText: new RegExp(`^${arrivalDay}$`) }).first().getByRole('button');
    await expect(arrivalBtn).toBeVisible();
    await arrivalBtn.click();
    await page.waitForTimeout(500);


    if (departureInNextMonth) {
        console.log(`[+] Departure is in the next Month`);
        if (await nextMonthBtn.isVisible()) {
            await nextMonthBtn.click();
            await page.waitForTimeout(500);
        }
    }

    const departureBtn = activeDialog.getByRole('gridcell').filter({ hasText: new RegExp(`^${departureDay}$`) }).first().getByRole('button');

    await expect(departureBtn).toBeVisible();
    await departureBtn.click();

    await page.waitForTimeout(1500);

    console.log(`[4] Applying filters: Dragging Budget to 100, Breakfast, Free Cancellation`);

    const additionalFiltersBtn = page.getByRole('button', { name: /Additional search filters/i }).first();
    await expect(additionalFiltersBtn).toBeVisible();
    await additionalFiltersBtn.click();

    await page.waitForTimeout(1000);

    const maxBudgetInput = page.getByRole('textbox', { name: /Maximum/i }).first();
    const maxThumb = page.locator('div[class*="handle"], div[class*="thumb"], [role="slider"], input[type="range"]').last();

    const thumbBox = await maxThumb.boundingBox();

    if (thumbBox) {
        let currentX = thumbBox.x + thumbBox.width / 2;
        const currentY = thumbBox.y + thumbBox.height / 2;

        await page.mouse.move(currentX, currentY);
        await page.mouse.down();

        for (let i = 0; i < 250; i++) {
            currentX -= 2;
            await page.mouse.move(currentX, currentY);
            await page.waitForTimeout(10);

            const valText = await maxBudgetInput.inputValue();
            const valNum = parseInt(valText.replace(/\D/g, ''), 10);

            if (valNum && valNum <= 100) {
                console.log(`[+] Budget slider physically dragged to ${valNum}`);
                break;
            }
        }
        await page.mouse.up();
    }

    await page.waitForTimeout(1000);

    //const breakfastCheckbox = page.locator('label, span, div').filter({ hasText: /^Breakfast included/i }).first();
    //await expect(breakfastCheckbox).toBeVisible();
    //await breakfastCheckbox.click();
    //await page.waitForTimeout(500);

    //const cancellationCheckbox = page.locator('label, span, div').filter({ hasText: /^Free cancellation/i }).first();
    //await expect(cancellationCheckbox).toBeVisible();
    //await cancellationCheckbox.click();

    const applyFiltersBtn = page.getByRole('button', { name: /Apply|Done/i }).first();
    if (await applyFiltersBtn.isVisible()) {
        await applyFiltersBtn.click();
        await page.waitForTimeout(500);
    }

    console.log(`[5] Executing Search...`);

    const searchHotelsBtn = page.getByRole('link', { name: /Search hotels/i }).or(page.getByRole('button', { name: /Search hotels/i })).first();
    await searchHotelsBtn.click();

    await page.waitForURL(/list/i);
    await page.waitForLoadState('domcontentloaded');
    console.log(`\n[+] Arrived at result page`);
    await page.waitForTimeout(2000);

    let unclickableCount = 0;

    const allCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await allCheckboxes.count();

    for (let i = 0; i < checkboxCount; i++) {
        const checkbox = allCheckboxes.nth(i);
        
        const rowContainer = checkbox.locator('..'); 
        const text = await rowContainer.innerText().catch(() => '');
        
        if (text) {
            const normalizedText = text.replace(/\s+/g, ' ').trim();
            const isChecked = await checkbox.isChecked();
            
            if (normalizedText.endsWith(' 0') && !isChecked) {
                console.log(`  -> Checking Checkbox: "${normalizedText}"`);
                await expect.soft(checkbox, `Checkbox "${normalizedText}" should be disabled`).toBeDisabled();
                unclickableCount++;
            }
        }
    }

    const allRadios = page.locator('input[type="radio"]');
    const radioCount = await allRadios.count();

    for (let i = 0; i < radioCount; i++) {
        const radio = allRadios.nth(i);
        
        const rowContainer = radio.locator('..');
        const text = await rowContainer.innerText().catch(() => '');

        if (text) {
            const normalizedText = text.replace(/\s+/g, ' ').trim();
            const isChecked = await radio.isChecked();
            
            if (normalizedText.endsWith(' 0') && !isChecked) {
                console.log(`  -> Checking Radio: "${normalizedText}"`);
                await expect.soft(radio, `Radio "${normalizedText}" should be disabled`).toBeDisabled();
                unclickableCount++;
            }
        }
    }

    if (unclickableCount === 0) {
        console.log(`[!] No filters with '0' results found to test.`);
    } else {
        console.log(`[+] Successfully validated ${unclickableCount} unclickable (disabled) filters.`);
    }

    console.log(`\n[7] Validating Guest Rating Filters`);

    const ratingFilters = [
        { label: /9\+ Excellent/i, minScore: 9.0 },
        { label: /8\+ Very good/i, minScore: 8.0 },
        { label: /7\+ Good/i, minScore: 7.0 },
        { label: /6\+ Appealing/i, minScore: 6.0 },
    ];

    for (const filter of ratingFilters) {
        console.log(`\n Selecting Filter ${filter.label} (expected ${filter.minScore})`);

        const radioLocator = page.getByRole('radio', { name: filter.label }).first();

        if (await radioLocator.isDisabled()) {
            console.log("Filter is disabled");
            continue;
        }

        await radioLocator.check({ force: true });
        await page.waitForTimeout(2500);

        const hotelArticlesTwo = await page.locator('article');
        const count = await hotelArticlesTwo.count();
        
        if (count === 0) {
            console.log(`[+] No hotels found after applying filters`);
            continue;

        }

        console.log(`[+] Found ${count} hotels`);

        const hotelsToValidate = Math.min(count, 5);

        for(let i = 0; i < hotelsToValidate; i++) {
            const article = hotelArticlesTwo.nth(i);
            const hotelCard = article.locator("..").locator("..");

            const cardText = await hotelCard.innerText().catch(() => '');

            const ratingMatch = cardText.match(/\b([1-9]\.\b|10\.0)\b/);

            if (ratingMatch) {
                const actualScore = parseFloat(ratingMatch[0]);

                let hotelName = await article.innerText();
                hotelName = hotelName.replace(/\n/g, ' ').trim();

                console.log(` Hotel "${hotelName}" score: ${actualScore}`);

                await expect.soft(actualScore, `Hotel score ${actualScore} should be >= ${filter.minScore}`).toBeGreaterThanOrEqual(filter.minScore);

            } else {
                console.log(`[+] Could not extract score for hotel #${i + 1}`);
                
            }
        }


    }

    console.log(`\n[+] Resetting Guest rating filter to all`);
    const allRadio = await page.getByRole('radio', { name: /^All/i }).first();
    if (await allRadio.isVisible() && ! (await allRadio.isDisabled())) {
        await allRadio.check({ force: true });
        await page.waitForTimeout(2000);
    }

    console.log(`\n[8] Validating HOTEL DE stars filters`);

    const starFilters = [
        { label: /5 HOTEL DE stars/i, stars: 5 },
        { label: /4 HOTEL DE stars/i, stars: 4 },
        { label: /3 HOTEL DE stars/i, stars: 3 },
        { label: /2 HOTEL DE stars/i, stars: 2 },
    ];

    for (const starFilter of starFilters) {
        console.log(`\n Testing ${starFilter.stars} Stars filter`);
        const starCheckbox = await page.getByRole('checkbox', { name: starFilter.label }).first();

        if (await starCheckbox.isDisabled()) {
            console.log(`[!] Filter for ${starFilter.stars} is disabled`);
            continue;
        }

        await page.waitForTimeout(500);


        await starCheckbox.evaluate(node => node.click());
        console.log(`[+] Checked filter: ${starFilter.stars} stars`);

        await page.waitForTimeout(2500);

        const hotelArticlesStar = await page.locator('article');
        const countStars = await hotelArticlesStar.count();

        if(countStars === 0) {
            console.log(`[-] No hotels found after applying ${starFilter.stars}`);

        } else {
            console.log(`[+] Found ${countStars} hotels`);
            const hotelsToValidateTwo = Math.min(countStars, 5);

            for(let y = 0; y < hotelsToValidateTwo; y++) {
                const articleTwo = hotelArticlesStar.nth(y);
                const hotelCardTwo = articleTwo.locator("..").locator("..");

                let hotelNameTwo = await articleTwo.innerText().catch(() => 'Unknown');
                hotelNameTwo = hotelNameTwo.replace(/\n/g, " ").trim();

                const expectedStarText = new RegExp(`${starFilter.stars} HOTEL DE stars`, 'i');

                await expect.soft(hotelCardTwo, `Hotel "${hotelNameTwo}" should have ${starFilter.stars} stars`).toContainText(expectedStarText);
                console.log(` Validated hotels "${hotelNameTwo} has ${starFilter.stars} stars`);


            }
        }

        await starCheckbox.evaluate(node => node.click());
        console.log("Unchecked filter");

        await page.waitForTimeout(2500);



    }



    console.log(`\n[+] Successfully finished testing`);
    await page.waitForTimeout(2000);
});