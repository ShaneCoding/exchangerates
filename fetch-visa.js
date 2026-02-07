const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://usa.visa.com/cmsapi/fx/rates?amount=100&fee=0&utcConvertedDate=02/07/2026&exchangedate=02/07/2026&fromCurr=USD&toCurr=JPY", {
    waitUntil: "networkidle0"
  });

  // Adjust selector for the actual FX rate element
  const rate = await page.evaluate(() => {
    return parseFloat(document.querySelector("body").innerText.match(/\d+(\.\d+)?/)[0]);
  });

  const data = {
    USDJPY: rate,
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync("visa-rate.json", JSON.stringify(data, null, 2));

  await browser.close();
})();
