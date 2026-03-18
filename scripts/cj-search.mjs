/**
 * CJ Dropshipping Product Search Script
 * Searches for all 20 products, gets CJ product IDs and image URLs
 */
import fs from "fs";

const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_FILE = new URL("./cj-token.json", import.meta.url);

function getToken() {
  const cached = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  return cached.accessToken;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Our 20 products with search keywords (simpler keywords work better)
const products = [
  { slug: "stove-gap-covers", search: "stove gap cover silicone" },
  { slug: "rotating-snack-tray", search: "rotating snack tray" },
  { slug: "silicone-food-storage-bags", search: "silicone food storage bag reusable" },
  { slug: "portable-blender", search: "portable blender USB" },
  { slug: "digital-meat-thermometer", search: "digital meat thermometer" },
  { slug: "electric-milk-frother", search: "milk frother electric" },
  { slug: "vegetable-spiralizer", search: "vegetable spiralizer" },
  { slug: "handheld-vacuum-sealer", search: "vacuum sealer handheld" },
  { slug: "sunset-lamp", search: "sunset lamp projection" },
  { slug: "rain-cloud-diffuser", search: "rain cloud humidifier" },
  { slug: "crystal-touch-lamp", search: "crystal touch lamp" },
  { slug: "floating-wall-shelves", search: "floating wall shelf" },
  { slug: "moon-lamp-3d", search: "moon lamp 3D" },
  { slug: "galaxy-star-projector", search: "galaxy star projector" },
  { slug: "led-strip-lights", search: "LED strip light RGB" },
  { slug: "mini-portable-projector", search: "mini projector portable" },
  { slug: "wireless-charging-pad", search: "wireless charger pad" },
  { slug: "smart-wifi-plug", search: "smart wifi plug" },
  { slug: "stackable-fridge-organizer", search: "fridge organizer stackable" },
  { slug: "cable-management-box", search: "cable management box" },
];

async function searchProduct(token, keyword) {
  const url = `${BASE_URL}/product/listV2?keyWord=${encodeURIComponent(keyword)}&page=1&size=5`;
  const res = await fetch(url, {
    headers: { "CJ-Access-Token": token },
  });
  const data = await res.json();
  if (data.code !== 200 || !data.data?.content?.length) {
    return null;
  }
  // Products are nested in content[].productList[]
  const allProducts = data.data.content.flatMap((c) => c.productList || []);
  return allProducts[0] || null;
}

async function getProductDetails(token, pid) {
  const url = `${BASE_URL}/product/query?pid=${pid}`;
  const res = await fetch(url, {
    headers: { "CJ-Access-Token": token },
  });
  const data = await res.json();
  if (data.code !== 200) return null;
  return data.data;
}

async function main() {
  const token = getToken();
  console.log("Using cached token\n");
  console.log("📦 Searching for products on CJ Dropshipping...\n");

  const results = [];

  for (const product of products) {
    console.log(`🔍 Searching: "${product.search}" (${product.slug})`);

    const match = await searchProduct(token, product.search);

    if (!match) {
      console.log(`   ❌ Not found\n`);
      results.push({ ...product, found: false });
      await delay(1500);
      continue;
    }

    console.log(`   ✅ Found: ${match.nameEn}`);
    console.log(`   💰 Price: $${match.sellPrice}`);
    console.log(`   🆔 CJ ID: ${match.id}`);
    console.log(`   🖼️  Image: ${match.bigImage}`);

    await delay(1500);

    // Get detailed product info for more images
    const details = await getProductDetails(token, match.id);
    const images = details?.productImageSet || [match.bigImage];

    console.log(`   📸 Images: ${images.length} found\n`);

    results.push({
      ...product,
      found: true,
      cjProductId: match.id,
      cjProductName: match.nameEn,
      cjSellPrice: match.sellPrice,
      cjSku: match.sku,
      mainImage: match.bigImage,
      allImages: images.slice(0, 5), // Keep max 5 images per product
    });

    await delay(1500);
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));

  const found = results.filter((r) => r.found);
  const notFound = results.filter((r) => !r.found);

  console.log(`\n✅ Found: ${found.length}/20 products`);
  console.log(`❌ Not found: ${notFound.length}/20 products`);

  if (notFound.length > 0) {
    console.log("\nMissing products:");
    notFound.forEach((p) => console.log(`  - ${p.slug} (searched: "${p.search}")`));
  }

  // Save results to JSON
  fs.writeFileSync(
    new URL("./cj-products.json", import.meta.url),
    JSON.stringify(results, null, 2)
  );
  console.log(`\n💾 Results saved to scripts/cj-products.json`);
}

main().catch(console.error);
