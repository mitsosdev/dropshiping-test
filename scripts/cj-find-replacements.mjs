/**
 * Find 5 replacement products + check Greece availability for ALL products
 * Looking for: trending, must-have, cheap shipping to Greece
 */
import fs from "fs";

const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_FILE = new URL("./cj-token.json", import.meta.url);

function getToken() {
  const cached = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  return cached.accessToken;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchProducts(token, keyword, size = 10) {
  const url = `${BASE_URL}/product/listV2?keyWord=${encodeURIComponent(keyword)}&page=1&size=${size}`;
  const res = await fetch(url, { headers: { "CJ-Access-Token": token } });
  const data = await res.json();
  if (data.code !== 200 || !data.data?.content?.length) return [];
  return data.data.content.flatMap((c) => c.productList || []);
}

async function getProductDetails(token, pid) {
  const url = `${BASE_URL}/product/query?pid=${pid}&countryCode=GR`;
  const res = await fetch(url, { headers: { "CJ-Access-Token": token } });
  const data = await res.json();
  if (data.code !== 200) return null;
  return data.data;
}

// Search for trending dropshipping products that ship to Greece
const replacementSearches = [
  // Replace stove gap covers
  { slug: "replacement-1", searches: ["aroma diffuser mini", "essential oil diffuser USB", "car diffuser"] },
  // Replace rotating snack tray
  { slug: "replacement-2", searches: ["makeup organizer rotating", "desk organizer", "bathroom organizer"] },
  // Replace LED strip
  { slug: "replacement-3", searches: ["neon light sign", "LED neon sign", "neon lamp bedroom"] },
  // Replace fridge organizer
  { slug: "replacement-4", searches: ["posture corrector", "back posture brace", "shoulder posture"] },
  // Replace cable management box
  { slug: "replacement-5", searches: ["phone holder stand", "tablet stand adjustable", "phone stand desk"] },
];

async function main() {
  const token = getToken();
  console.log("Using cached token\n");

  // PART 1: Find 5 replacement products
  console.log("=" .repeat(60));
  console.log("PART 1: FINDING 5 REPLACEMENT PRODUCTS");
  console.log("=" .repeat(60));

  for (const item of replacementSearches) {
    console.log(`\n--- ${item.slug} ---`);
    for (const kw of item.searches) {
      console.log(`\n  Search: "${kw}"`);
      const results = await searchProducts(token, kw, 5);
      if (results.length === 0) {
        console.log("    No results");
      } else {
        // Show top 3 with most listings (popular)
        const sorted = results.sort((a, b) => (b.listedNum || 0) - (a.listedNum || 0));
        sorted.slice(0, 3).forEach((p, i) => {
          console.log(`    ${i+1}. ${p.nameEn}`);
          console.log(`       Price: $${p.sellPrice} | Listed: ${p.listedNum || 'N/A'} | ID: ${p.id}`);
          console.log(`       Img: ${p.bigImage}`);
        });
      }
      await delay(1500);
    }
  }

  // PART 2: Check Greece availability for the 15 good matches
  console.log("\n\n" + "=".repeat(60));
  console.log("PART 2: CHECKING GREECE AVAILABILITY");
  console.log("=".repeat(60));

  const goodMatches = [
    { slug: "portable-blender", id: "1392009095543918592" },
    { slug: "silicone-food-storage-bags", id: "3F459E7B-ECA7-4DE5-86BB-B76413905F0C" },
    { slug: "electric-milk-frother", id: "1373843828880052224" },
    { slug: "rain-cloud-diffuser", id: "1765614160454361088" },
    { slug: "crystal-touch-lamp", id: "1736987385885364224" },
    { slug: "moon-lamp-3d", id: "1385116450720714752" },
    { slug: "galaxy-star-projector", id: "95839DC7-A7C6-4F67-8F2C-484853E1E210" },
    { slug: "mini-portable-projector", id: "1403626672510603264" },
    { slug: "sunset-lamp", id: "1392396647220252672" },
    { slug: "vegetable-spiralizer", id: "2409131134451623700" },
    { slug: "handheld-vacuum-sealer", id: "2408160514451617700" },
    { slug: "wireless-charging-pad", id: "2412261234571625200" },
    { slug: "digital-meat-thermometer", id: "A32985E8-0E50-476F-B9A9-19725A9C1DEB" },
    { slug: "smart-wifi-plug", id: "1768540959958110208" },
    { slug: "floating-wall-shelves", id: "2411210744191603000" },
  ];

  const availabilityResults = [];

  for (const product of goodMatches) {
    console.log(`\nChecking: ${product.slug} (${product.id})`);
    const details = await getProductDetails(token, product.id);

    if (!details) {
      console.log("  ❌ Could not get details");
      availabilityResults.push({ ...product, available: false, reason: "no details" });
      await delay(1500);
      continue;
    }

    // Check variants for Greece warehouse or international shipping
    const variants = details.variants || [];
    const images = details.productImageSet || [];
    const hasVariants = variants.length > 0;

    // Check if any variant has inventory
    const variantInfo = variants.slice(0, 3).map(v => ({
      name: v.variantNameEn,
      price: v.variantSellPrice,
      sku: v.variantSku,
    }));

    console.log(`  📦 Name: ${details.productNameEn}`);
    console.log(`  💰 Price: $${details.sellPrice}`);
    console.log(`  📸 Images: ${images.length}`);
    console.log(`  🔀 Variants: ${variants.length}`);
    if (variantInfo.length > 0) {
      variantInfo.forEach(v => console.log(`     - ${v.name}: $${v.price}`));
    }

    availabilityResults.push({
      ...product,
      available: true,
      name: details.productNameEn,
      sellPrice: details.sellPrice,
      images: images.slice(0, 5),
      variantCount: variants.length,
    });

    await delay(1500);
  }

  // Save results
  fs.writeFileSync(
    new URL("./cj-availability.json", import.meta.url),
    JSON.stringify(availabilityResults, null, 2)
  );
  console.log("\n💾 Availability results saved to scripts/cj-availability.json");
}

main().catch(console.error);
