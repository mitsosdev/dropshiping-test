/**
 * Download product images from CJ Dropshipping and save locally
 * Also checks Greece availability for replacement products
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_FILE = path.join(__dirname, "cj-token.json");
const IMAGES_DIR = path.join(__dirname, "..", "public", "images", "products");

function getToken() {
  const cached = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  return cached.accessToken;
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Final 20 products mapping
const finalProducts = [
  // === KITCHEN (6) ===
  { slug: "portable-blender", cjId: "1392009095543918592", category: "kitchen" },
  { slug: "silicone-food-storage-bags", cjId: "3F459E7B-ECA7-4DE5-86BB-B76413905F0C", category: "kitchen" },
  { slug: "electric-milk-frother", cjId: "1373843828880052224", category: "kitchen" },
  { slug: "vegetable-spiralizer", cjId: "2409131134451623700", category: "kitchen" },
  { slug: "handheld-vacuum-sealer", cjId: "2408160514451617700", category: "kitchen" },
  { slug: "digital-meat-thermometer", cjId: "A32985E8-0E50-476F-B9A9-19725A9C1DEB", category: "kitchen" },

  // === LIFESTYLE / DECOR (7) ===
  { slug: "sunset-lamp", cjId: "1392396647220252672", category: "lifestyle" },
  { slug: "rain-cloud-diffuser", cjId: "1765614160454361088", category: "lifestyle" },
  { slug: "crystal-touch-lamp", cjId: "1736987385885364224", category: "lifestyle" },
  { slug: "moon-lamp-3d", cjId: "1385116450720714752", category: "lifestyle" },
  { slug: "galaxy-star-projector", cjId: "95839DC7-A7C6-4F67-8F2C-484853E1E210", category: "lifestyle" },
  // NEW: replaces stove-gap-covers
  { slug: "volcanic-flame-diffuser", cjId: "1560917333852565504", category: "lifestyle", isNew: true },
  // NEW: replaces LED strip lights
  { slug: "neon-led-lamp", cjId: "1404985911627878400", category: "lifestyle", isNew: true },

  // === TECH (4) ===
  { slug: "mini-portable-projector", cjId: "1403626672510603264", category: "tech" },
  { slug: "wireless-charging-pad", cjId: "2412261234571625200", category: "tech" },
  { slug: "smart-wifi-plug", cjId: "1768540959958110208", category: "tech" },
  // NEW: replaces cable management box
  { slug: "phone-tablet-stand", cjId: "1735490206582710272", category: "tech", isNew: true },

  // === ORGANIZATION / WELLNESS (3) ===
  { slug: "floating-wall-shelves", cjId: "2411210744191603000", category: "organization" },
  // NEW: replaces fridge organizer
  { slug: "posture-corrector", cjId: "2412170138341629900", category: "wellness", isNew: true },
  // NEW: replaces rotating snack tray
  { slug: "travel-electronics-organizer", cjId: "1703055389602238464", category: "organization", isNew: true },
];

async function getProductDetails(token, pid) {
  const url = `${BASE_URL}/product/query?pid=${pid}&countryCode=GR`;
  const res = await fetch(url, { headers: { "CJ-Access-Token": token } });
  const data = await res.json();
  if (data.code !== 200) return null;
  return data.data;
}

async function downloadImage(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    const ext = url.match(/\.(jpg|jpeg|png|webp)/i)?.[1] || "jpg";
    const filepath = path.join(IMAGES_DIR, `${filename}.${ext}`);
    fs.writeFileSync(filepath, buffer);
    return `${filename}.${ext}`;
  } catch (e) {
    console.error(`  Failed to download: ${e.message}`);
    return false;
  }
}

async function main() {
  const token = getToken();

  // Ensure images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const results = [];

  for (const product of finalProducts) {
    console.log(`\n📦 ${product.slug} (CJ: ${product.cjId})`);

    const details = await getProductDetails(token, product.cjId);
    if (!details) {
      console.log("  ❌ Could not get details");
      results.push({ ...product, error: true });
      await delay(1500);
      continue;
    }

    const images = details.productImageSet || [];
    const variants = details.variants || [];
    const lowestPrice = variants.length > 0
      ? Math.min(...variants.map(v => parseFloat(v.variantSellPrice) || 999))
      : parseFloat(details.sellPrice) || 0;

    console.log(`  ✅ ${details.productNameEn}`);
    console.log(`  💰 Lowest variant: $${lowestPrice}`);
    console.log(`  📸 ${images.length} images available`);
    console.log(`  🔀 ${variants.length} variants`);

    // Download main image + up to 2 extra
    const imagesToDownload = images.slice(0, 3);
    const downloadedImages = [];

    for (let i = 0; i < imagesToDownload.length; i++) {
      const imgUrl = imagesToDownload[i];
      const filename = i === 0 ? product.slug : `${product.slug}-${i + 1}`;
      console.log(`  ⬇️  Downloading image ${i + 1}...`);
      const savedAs = await downloadImage(imgUrl, filename);
      if (savedAs) {
        downloadedImages.push(savedAs);
        console.log(`     Saved: ${savedAs}`);
      }
    }

    results.push({
      slug: product.slug,
      category: product.category,
      isNew: product.isNew || false,
      cjProductId: product.cjId,
      cjProductName: details.productNameEn,
      cjSku: details.productSku || variants[0]?.variantSku || "",
      lowestCjPrice: lowestPrice,
      images: downloadedImages,
      allCjImages: images.slice(0, 5),
      variantCount: variants.length,
      variants: variants.slice(0, 5).map(v => ({
        name: v.variantNameEn,
        price: v.variantSellPrice,
        sku: v.variantSku,
      })),
    });

    await delay(1500);
  }

  // Save final mapping
  const outputPath = path.join(__dirname, "cj-final-mapping.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log("\n\n" + "=".repeat(60));
  console.log("📊 FINAL SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);

  console.log(`\n✅ Successful: ${successful.length}/20`);
  console.log(`❌ Failed: ${failed.length}/20`);

  console.log("\n📋 Product list:");
  successful.forEach(r => {
    const tag = r.isNew ? " [NEW]" : "";
    console.log(`  ${r.slug}${tag}: $${r.lowestCjPrice} | ${r.images.length} images | ${r.variantCount} variants`);
  });

  if (failed.length > 0) {
    console.log("\n❌ Failed products:");
    failed.forEach(r => console.log(`  - ${r.slug}`));
  }

  console.log(`\n💾 Final mapping saved to scripts/cj-final-mapping.json`);
}

main().catch(console.error);
