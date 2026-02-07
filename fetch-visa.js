import fs from "fs";
import fetch from "node-fetch"; // npm install node-fetch@3

// Helper to format date as MM/DD/YYYY
function formatDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}%2F${dd}%2F${yyyy}`; // URL-encoded
}

async function main() {
  try {
    const today = new Date();
    const dateStr = formatDate(today);

    const url = `https://usa.visa.com/cmsapi/fx/rates?amount=100&fee=3&utcConvertedDate=${dateStr}&exchangedate=${dateStr}&fromCurr=USD&toCurr=JPY`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);

    const data = await res.json();

    // Save the JSON to visa-rate.json
    fs.writeFileSync("visa-rate.json", JSON.stringify(data, null, 2));
    console.log("Visa rate fetched and saved!");
  } catch (err) {
    console.error("Failed to fetch Visa rate:", err);
    process.exit(1);
  }
}

main();
