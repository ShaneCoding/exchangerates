import puppeteer from "puppeteer";
import fs from "fs";

function formatDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

const today = formatDate(new Date());

const url = `https://usa.visa.com/cmsapi/fx/rates?amount=1000&fee=3&utcConvertedDate=${encodeURIComponent(
  today
)}&exchangedate=${encodeURIComponent(
  today
)}&fromCurr=USD&toCurr=JPY`;

(async () => {
  console.log("Launching browser…");

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  console.log("Fetching Visa FX API…");
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

  const bodyText = await page.evaluate(() => document.body.innerText);

  // 👇 Added exactly what you requested
  console.log(bodyText.slice(0, 1000));

  let data;
  try {
    data = JSON.parse(bodyText);
  } catch (err) {
    console.error("Failed to parse JSON. Raw response:");
    console.error(bodyText.slice(0, 500));
    throw err;
  }

  if (!data || !data.fxRate) {
    throw new Error("Visa rate not found in response");
  }

  const output = {
    provider: "visa",
    from: "USD",
    to: "JPY",
    feePercent: 3,
    date: today,
    rate: data.fxRate,
    fetchedAt: new Date().toISOString(),
  };

  fs.writeFileSync("visa-rate.json", JSON.stringify(output, null, 2));

  console.log("✅ Visa rate saved:");
  console.log(output);

  await browser.close();
})();
