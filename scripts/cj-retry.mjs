/**
 * Retry search for products that got wrong matches
 * Shows top 5 results so we can pick the best one
 */
import fs from "fs";

const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_FILE = new URL("./cj-token.json", import.meta.url);

function getToken() {
  const cached = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  return cached.accessToken;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Products that need better search - try different keywords
const retryProducts = [
  { slug: "stove-gap-covers", searches: ["stove gap cover", "stove counter gap cover", "silicone stove gap strip"] },
  { slug: "digital-meat-thermometer", searches: ["kitchen meat thermometer", "food thermometer digital", "cooking thermometer"] },
  { slug: "wireless-charging-pad", searches: ["wireless charger phone", "qi wireless charging", "phone wireless charger"] },
  { slug: "smart-wifi-plug", searches: ["smart plug wifi socket", "wifi smart socket", "smart power plug"] },
  { slug: "led-strip-lights", searches: ["LED strip lights", "RGB light strip", "smart LED strip"] },
  { slug: "sunset-lamp", searches: ["sunset projection lamp", "sunset light projector", "rainbow sunset lamp"] },
  { slug: "floating-wall-shelves", searches: ["wall mounted shelf", "wall shelf set", "decorative wall shelf"] },
  { slug: "vegetable-spiralizer", searches: ["vegetable spiral cutter", "zucchini noodle maker", "spiral vegetable slicer"] },
  { slug: "handheld-vacuum-sealer", searches: ["food vacuum sealer", "mini vacuum sealer machine", "portable food sealer"] },
  { slug: "stackable-fridge-organizer", searches: ["refrigerator organizer bin", "fridge storage container", "stackable fridge bin"] },
  { slug: "cable-management-box", searches: ["cable box organizer", "cord organizer box", "wire storage box"] },
];

async function searchProduct(token, keyword) {
  const url = `${BASE_URL}/product/listV2?keyWord=${encodeURIComponent(keyword)}&page=1&size=5`;
  const res = await fetch(url, {
    headers: { "CJ-Access-Token": token },
  });
  const data = await res.json();
  if (data.code !== 200 || !data.data?.content?.length) {
    return [];
  }
  return data.data.content.flatMap((c) => c.productList || []);
}

async function main() {
  const token = getToken();

  for (const product of retryProducts) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔍 ${product.slug}`);
    console.log(`${"=".repeat(60)}`);

    for (const keyword of product.searches) {
      console.log(`\n  Keyword: "${keyword}"`);
      const results = await searchProduct(token, keyword);

      if (results.length === 0) {
        console.log("    No results");
      } else {
        results.slice(0, 3).forEach((p, i) => {
          console.log(`    ${i + 1}. ${p.nameEn}`);
          console.log(`       $${p.sellPrice} | ID: ${p.id}`);
          console.log(`       Img: ${p.bigImage}`);
        });
      }

      await delay(1500);
    }
  }
}

main().catch(console.error);
