import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });

  const page = await browser.newPage();

  // Be polite + realistic
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  // Go to Visa exchange rate page
  await page.goto(
    "https://usa.visa.com/support/consumer/travel-support/exchange-rate-calculator.html",
    { waitUntil: "networkidle2", timeout: 0 }
  );

  // TODO: adjust selectors if needed
  // Example extraction (replace with your working logic)
  const rate = await page.evaluate(() => {
    const el = document.querySelector("[data-test='exchange-rate']");
    return el ? el.textContent.trim() : null;
  });

  if (!rate) {
    throw new Error("Visa rate not found");
  }

  const data = {
    source: "Visa",
    rate,
    fetchedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    "visa-rate.json",
    JSON.stringify(data, null, 2)
  );

  await browser.close();
})();
