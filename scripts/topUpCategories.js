'use strict';

const fs = require('fs');
const path = require('path');
const { fetchProductDetails, isRealMarketingDescription } = require('./scrapeUrbanLadderCatalog');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DELAY_MS = 500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function topUpDining() {
  const filePath = path.join(__dirname, '..', 'output', 'dining.json');
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const seenUids = new Set(items.map(p => p.uid));
  const seenSkus = new Set(items.map(p => p.sku));

  console.log(`\n🍽️ Dining current count: ${items.length}/200. Fetching ${200 - items.length} more...`);

  for (let page = 1; page <= 60 && items.length < 200; page++) {
    try {
      const res = await fetch(`https://www.urbanladder.com/sitemap/products/${page}/page.sitemap.xml`, {
        headers: { 'User-Agent': USER_AGENT }
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>https:\/\/www\.urbanladder\.com\/product\/([^<]+)<\/loc>/g)].map(m => m[1]);

      for (const slug of locs) {
        if (items.length >= 200) break;
        const uidMatch = slug.match(/-(\d{5,10})$/);
        if (!uidMatch) continue;
        const uid = parseInt(uidMatch[1], 10);
        if (seenUids.has(uid)) continue;

        if (/\b(?:dining|dinner|crockery|bar[- ]cabinet|bar[- ]stool|bar[- ]unit|bar[- ]table|bar[- ]chair|buffet|sideboard)\b/i.test(slug)) {
          const det = await fetchProductDetails(slug, 'Dining');
          await sleep(DELAY_MS);

          if (det.product) {
            const p = det.product;
            if (!seenUids.has(p.uid) && !seenSkus.has(p.sku) && isRealMarketingDescription(p.description)) {
              seenUids.add(p.uid);
              seenSkus.add(p.sku);
              items.push(p);
              console.log(`  ✓ Dining: ${items.length}/200 | SKU: ${p.sku} | ${p.name.slice(0, 30)}`);
              fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
            }
          }
        }
      }
    } catch (e) {
      console.warn(`Error on sitemap page ${page}:`, e.message);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`✅ Dining complete with ${items.length} products.`);
}

async function topUpLightingDecor() {
  const filePath = path.join(__dirname, '..', 'output', 'lighting_decor.json');
  let items = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Filter out any misclassified furniture (e.g. sofas that matched "light")
  const initialCount = items.length;
  items = items.filter(p => {
    const isFurniture = /\b(?:sofa|couch|recliner|bed\b|beds\b|wardrobe|almirah)\b/i.test(p.name) ||
      /\b(?:sofa|couch|recliner|bed\b|beds\b|wardrobe|almirah)\b/i.test(p.subcategory);
    return !isFurniture;
  });

  console.log(`\n💡 Lighting & Decor: removed ${initialCount - items.length} misclassified sofas. Current count: ${items.length}/200.`);

  const seenUids = new Set(items.map(p => p.uid));
  const seenSkus = new Set(items.map(p => p.sku));

  for (let page = 1; page <= 60 && items.length < 200; page++) {
    try {
      const res = await fetch(`https://www.urbanladder.com/sitemap/products/${page}/page.sitemap.xml`, {
        headers: { 'User-Agent': USER_AGENT }
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>https:\/\/www\.urbanladder\.com\/product\/([^<]+)<\/loc>/g)].map(m => m[1]);

      for (const slug of locs) {
        if (items.length >= 200) break;
        const uidMatch = slug.match(/-(\d{5,10})$/);
        if (!uidMatch) continue;
        const uid = parseInt(uidMatch[1], 10);
        if (seenUids.has(uid)) continue;

        if (/\b(?:lamp|chandelier|lantern|wall[- ]art|carpet|rug|mirror|cushion|vase|clock|curtain|candle|decor|pendant)\b/i.test(slug)) {
          if (/\b(?:sofa|couch|recliner|bed\b|beds\b|wardrobe|dining|almirah)\b/i.test(slug)) continue;

          const det = await fetchProductDetails(slug, 'Lighting & Decor');
          await sleep(DELAY_MS);

          if (det.product) {
            const p = det.product;
            const isFurniture = /\b(?:sofa|couch|recliner|bed\b|beds\b|wardrobe|dining|almirah)\b/i.test(p.name) ||
              /\b(?:sofa|couch|recliner|bed\b|beds\b|wardrobe|dining|almirah)\b/i.test(p.subcategory);
            if (isFurniture) continue;

            if (!seenUids.has(p.uid) && !seenSkus.has(p.sku) && isRealMarketingDescription(p.description)) {
              seenUids.add(p.uid);
              seenSkus.add(p.sku);
              items.push(p);
              console.log(`  ✓ Lighting & Decor: ${items.length}/200 | SKU: ${p.sku} | ${p.name.slice(0, 30)}`);
              fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
            }
          }
        }
      }
    } catch (e) {
      console.warn(`Error on sitemap page ${page}:`, e.message);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`✅ Lighting & Decor complete with ${items.length} products.`);
}

async function main() {
  await topUpDining();
  await topUpLightingDecor();
  console.log('\n🎉 Top-up complete!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
