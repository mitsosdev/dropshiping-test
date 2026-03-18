import fs from "fs";

const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_FILE = new URL("./cj-token.json", import.meta.url);

function getToken() {
  const cached = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  return cached.accessToken;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const token = getToken();
  console.log("Using cached token\n");

  // Test GET /product/listV2 with different keywords
  const keywords = ["blender", "lamp", "moon lamp", "LED strip"];

  for (const kw of keywords) {
    const url = `${BASE_URL}/product/listV2?keyWord=${encodeURIComponent(kw)}&page=1&size=3`;
    console.log(`--- GET "${kw}" ---`);
    console.log(`URL: ${url}`);
    const res = await fetch(url, {
      headers: { "CJ-Access-Token": token },
    });
    const data = await res.json();
    console.log("Code:", data.code, "Message:", data.message);

    if (data.data) {
      // Log the structure of data
      console.log("Data keys:", Object.keys(data.data));
      if (data.data.list) {
        console.log("Results:", data.data.list.length);
        data.data.list.forEach((p, i) => {
          console.log(`  ${i+1}. ${p.productNameEn || p.name} | PID: ${p.pid}`);
        });
      } else if (Array.isArray(data.data)) {
        console.log("Results (array):", data.data.length);
        data.data.slice(0, 3).forEach((p, i) => {
          console.log(`  ${i+1}.`, JSON.stringify(p).slice(0, 200));
        });
      } else {
        console.log("Data:", JSON.stringify(data.data).slice(0, 500));
      }
    } else {
      console.log("Full:", JSON.stringify(data).slice(0, 500));
    }
    console.log();
    await delay(1500); // Wait 1.5s between requests
  }
}

main().catch(console.error);
