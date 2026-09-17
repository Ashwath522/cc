'use strict';

/**
 * Export Existing Urban Ladder Product Descriptions
 * 
 * Fetches real, live product descriptions directly from the public Urban Ladder website:
 * - Public sitemap discovery
 * - Unauthenticated read-only HTTP GET requests
 * - Polite rate-limited crawling (600ms delay between requests, ~1.5 req/sec)
 * - Extracts real SKU, UID, Name, Category, Slug, and Description
 * - Saves output as both JSON and JSONL
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = {
  sofas: [/\bsofa\b/i, /\bcouch\b/i, /\brecliner\b/i, /\bloveseat\b/i],
  beds: [/\bbed\b/i, /\bcot\b/i, /\bbunk[- ]bed\b/i],
  wardrobes: [/\bwardrobe\b/i, /\balmirah\b/i, /\bcloset\b/i],
  dining: [/\bdining\b/i, /\bdinner[- ]table\b/i],
  storage: [/\bshoe[- ]rack\b/i, /\bbookshelf\b/i, /\bbookcase\b/i, /\bchest[- ]of[- ]drawers?\b/i, /\bsideboard\b/i, /\bcabinet\b/i, /\bdrawer\b/i, /\bcrockery\b/i],
  lighting_decor: [/\blamp\b/i, /\blight\b/i, /\bchandelier\b/i, /\blantern\b/i, /\bmirror\b/i, /\bwall[- ]art\b/i, /\bpainting\b/i, /\bclock\b/i, /\bcarpet\b/i, /\brug\b/i, /\bvase\b/i, /\bcurtain\b/i, /\bcushion\b/i],
  study_office: [/\bstudy\b/i, /\boffice[- ]chair\b/i, /\bdesk\b/i, /\bcomputer[- ]table\b/i, /\bworkstation\b/i],
  coffee_side_tables: [/\bcoffee[- ]table\b/i, /\bcenter[- ]table\b/i, /\bside[- ]table\b/i, /\bend[- ]table\b/i, /\bnest[- ]of[- ]tables\b/i],
  benches_ottomans: [/\bbench\b/i, /\bottoman\b/i, /\bpouf\b/i, /\bstool\b/i],
  seating_chairs: [/\blounge[- ]chair\b/i, /\barmchair\b/i, /\baccent[- ]chair\b/i, /\brocking[- ]chair\b/i, /\bwing[- ]chair\b/i, /\bchair\b/i],
  tv_units: [/\btv[- ]unit\b/i, /\bentertainment[- ]unit\b/i, /\btv[- ]stand\b/i, /\bmedia[- ]console\b/i],
  bar_furniture: [/\bbar\b/i, /\bwine\b/i],
  mattresses: [/\bmattress\b/i],
  outdoor_balcony: [/\boutdoor\b/i, /\bbalcony\b/i, /\bpatio\b/i, /\bgarden\b/i, /\bswing\b/i],
  kids_furniture: [/\bkids?\b/i, /\bchildren\b/i, /\bbaby\b/i, /\bcrib\b/i, /\bbunk\b/i, /\btoddler\b/i, /\btoy[- ]storage\b/i]
};

const TARGET_PER_CATEGORY = 38; // 15 categories * 38 = 570 items total (~500-600)
const DELAY_MS = 600; // polite 600ms delay between page fetches (~1.5 requests/sec)
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeHtml(html) {
  if (!html) return '';
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function cleanDescription(raw) {
  if (!raw) return '';
  let text = decodeHtml(raw);
  text = decodeHtml(text); // decode twice for doubly-escaped characters
  text = text.replace(/<\/(?:p|div|li|h\d)>/gi, '\n\n');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  return text
    .split('\n')
    .map(l => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l, i, arr) => l.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join('\n')
    .trim();
}

/**
 * Step 1: Collect candidate slugs from public sitemaps
 */
async function discoverCandidateSlugs() {
  console.log('📡 Discovering candidate product slugs from public Urban Ladder sitemaps...');
  const pool = {};
  for (const cat of Object.keys(CATEGORIES)) {
    pool[cat] = [];
  }

  const seenSlugs = new Set();
  const maxPoolPerCat = 75; // buffer pool so we can skip any missing/short descriptions

  const pages = Array.from({ length: 96 }, (_, i) => i + 1);
  const concurrency = 10;

  for (let i = 0; i < pages.length; i += concurrency) {
    const allFilled = Object.values(pool).every(list => list.length >= maxPoolPerCat);
    if (allFilled) {
      console.log(`✅ All category pools filled after scanning ${i} sitemaps.`);
      break;
    }

    const batch = pages.slice(i, i + concurrency);
    await Promise.all(batch.map(async (pageIdx) => {
      try {
        const res = await fetch(`https://www.urbanladder.com/sitemap/products/${pageIdx}/page.sitemap.xml`, {
          headers: { 'User-Agent': USER_AGENT }
        });
        if (!res.ok) return;
        const xml = await res.text();
        const locMatches = [...xml.matchAll(/<loc>https:\/\/www\.urbanladder\.com\/product\/([^<]+)<\/loc>/g)];

        for (const m of locMatches) {
          const slug = m[1];
          if (seenSlugs.has(slug)) continue;
          const normalized = slug.replace(/-/g, ' ');

          for (const [cat, patterns] of Object.entries(CATEGORIES)) {
            if (pool[cat].length < maxPoolPerCat && patterns.some(p => p.test(normalized))) {
              pool[cat].push(slug);
              seenSlugs.add(slug);
              break;
            }
          }
        }
      } catch (e) {
        // Continue silently on transient sitemap error
      }
    }));
  }

  console.log('\nCandidate slugs pool summary:');
  for (const [cat, list] of Object.entries(pool)) {
    console.log(`  • ${cat.padEnd(22)}: ${list.length} candidates`);
  }
  return pool;
}

/**
 * Step 2: Fetch and extract product details
 */
async function fetchProductDetails(slug, category) {
  const url = `https://www.urbanladder.com/product/${slug}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) {
      return { error: `HTTP ${res.status}` };
    }

    const html = await res.text();

    // Extract title / H1
    let name = '';
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      name = cleanDescription(h1Match[1]);
    }
    if (!name) {
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (titleMatch) {
        name = cleanDescription(titleMatch[1]).replace(/\s*\|\s*Urban Ladder.*$/i, '').trim();
      }
    }

    // Try extracting from window.APP_DATA (most accurate and complete for sku, uid, and attributes)
    let uid = '';
    let sku = '';
    let description = '';

    const appDataIdx = html.indexOf('window.APP_DATA');
    if (appDataIdx !== -1) {
      const jsonStart = html.indexOf('{', appDataIdx);
      const endScript = html.indexOf('</script>', appDataIdx);
      if (jsonStart !== -1 && endScript !== -1) {
        try {
          const rawJson = html.slice(jsonStart, endScript).trim();
          const data = JSON.parse(rawJson);
          const details = data?.reduxData?.catalog?.product_details;
          if (details) {
            uid = details.uid || '';
            sku = details.item_code || details.attributes?.item_code || '';
            if (!name && details.name) name = details.name;

            // Extract features / description
            const rawFeatures = details.attributes?.features ||
              details.grouped_attributes?.find(g => g.title === 'Features')?.details?.[0]?.value ||
              details.description ||
              '';
            description = cleanDescription(rawFeatures);
          }
        } catch (e) {
          // Fallback to DOM parsing
        }
      }
    }

    // Fallback description from server-rendered tabpanel-0 if APP_DATA missing or empty
    if (!description || description.length < 50) {
      const tabMatch = html.match(/id="tabpanel-0"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
      if (tabMatch) {
        const rawTab = tabMatch[1].replace(/<dt[^>]*>Features<\/dt>/i, '');
        description = cleanDescription(rawTab);
      }
    }

    // Fallback UID from slug (e.g. "product-name-10076606" -> 10076606)
    if (!uid) {
      const uidMatch = slug.match(/-(\d{6,10})$/);
      if (uidMatch) uid = uidMatch[1];
    }

    // Fallback SKU from page text / specification
    if (!sku) {
      const skuMatch = html.match(/(?:Item Code|SKU)[\s:"]+([A-Z0-9]{8,25})/i);
      if (skuMatch) sku = skuMatch[1];
    }

    if (!description || description.length < 50) {
      return { error: `Description too short (${description?.length || 0} chars)` };
    }

    return {
      sku: sku || uid || slug,
      uid: uid || null,
      name: name || slug.replace(/-/g, ' '),
      category,
      slug,
      url,
      description
    };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Main Runner
 */
async function main() {
  console.log('🚀 Starting Urban Ladder Live Product Descriptions Collection...');
  console.log(`Target: ~${Object.keys(CATEGORIES).length * TARGET_PER_CATEGORY} products across ${Object.keys(CATEGORIES).length} categories (${TARGET_PER_CATEGORY} per category).`);
  console.log(`Polite request delay: ${DELAY_MS}ms (~${(1000 / DELAY_MS).toFixed(1)} req/sec).\n`);

  const pool = await discoverCandidateSlugs();

  const outputDir = path.join(__dirname, '../output');
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const outJsonPath = path.join(outputDir, 'urban_ladder_real_descriptions.json');
  const outJsonlPath = path.join(outputDir, 'urban_ladder_real_descriptions.jsonl');
  const dataJsonPath = path.join(dataDir, 'urban_ladder_real_descriptions.json');
  const dataJsonlPath = path.join(dataDir, 'urban_ladder_real_descriptions.jsonl');

  // Truncate/initialize JSONL files
  fs.writeFileSync(outJsonlPath, '', 'utf8');
  fs.writeFileSync(dataJsonlPath, '', 'utf8');

  const allProducts = [];
  const categoryCounts = {};
  for (const cat of Object.keys(CATEGORIES)) {
    categoryCounts[cat] = 0;
  }

  let totalFetched = 0;
  let totalSuccess = 0;
  const startTime = Date.now();

  for (const [cat, slugs] of Object.entries(pool)) {
    console.log(`\n📦 Fetching category: [${cat}] (Target: ${TARGET_PER_CATEGORY})...`);

    for (const slug of slugs) {
      if (categoryCounts[cat] >= TARGET_PER_CATEGORY) {
        break;
      }

      totalFetched++;
      const result = await fetchProductDetails(slug, cat);
      await sleep(DELAY_MS);

      if (result.error) {
        // Skip and try next candidate
        continue;
      }

      categoryCounts[cat]++;
      totalSuccess++;
      allProducts.push(result);

      // Append to JSONL immediately
      const line = JSON.stringify(result) + '\n';
      fs.appendFileSync(outJsonlPath, line, 'utf8');
      fs.appendFileSync(dataJsonlPath, line, 'utf8');

      if (totalSuccess % 25 === 0 || categoryCounts[cat] === TARGET_PER_CATEGORY) {
        const elapsedSec = Math.round((Date.now() - startTime) / 1000);
        console.log(`  [Progress] ${totalSuccess} collected | Current: ${cat} (${categoryCounts[cat]}/${TARGET_PER_CATEGORY}) | Elapsed: ${elapsedSec}s`);
      }
    }

    console.log(`  ✓ Finished [${cat}]: ${categoryCounts[cat]} items.`);
  }

  // Save full formatted JSON array files
  const jsonContent = JSON.stringify(allProducts, null, 2);
  fs.writeFileSync(outJsonPath, jsonContent, 'utf8');
  fs.writeFileSync(dataJsonPath, jsonContent, 'utf8');

  const totalTimeSec = Math.round((Date.now() - startTime) / 1000);

  // Final Report
  console.log('\n========================================================================');
  console.log('🎉 URBAN LADDER DATA EXTRACTION COMPLETED');
  console.log('========================================================================');
  console.log(`Total Products Attempted: ${totalFetched}`);
  console.log(`Total Successfully Saved: ${totalSuccess}`);
  console.log(`Total Execution Time:    ${totalTimeSec}s (${(totalTimeSec / 60).toFixed(1)} mins)`);
  console.log(`Output Files Created:`);
  console.log(`  - ${outJsonPath} (${(fs.statSync(outJsonPath).size / 1024).toFixed(1)} KB)`);
  console.log(`  - ${outJsonlPath}`);
  console.log(`  - ${dataJsonPath}`);
  console.log(`  - ${dataJsonlPath}`);

  console.log('\n📊 Category Breakdown:');
  console.log('------------------------------------------------------------------------');
  const shortfalls = [];
  for (const [cat, count] of Object.entries(categoryCounts)) {
    const status = count >= 30 ? 'OK' : 'SHORTFALL (<30)';
    if (count < 30) shortfalls.push({ cat, count });
    console.log(`  ${cat.padEnd(24)}: ${String(count).padStart(3)} products  [${status}]`);
  }

  if (shortfalls.length > 0) {
    console.log('\n⚠️ Shortfalls detected in:');
    shortfalls.forEach(s => console.log(`  - ${s.cat}: only ${s.count} products`));
  } else {
    console.log('\n✅ All categories met or exceeded the 30-product minimum threshold!');
  }

  console.log('\n🔎 Sanity Check - Sample Records (First 3):');
  console.log('------------------------------------------------------------------------');
  allProducts.slice(0, 3).forEach((p, idx) => {
    console.log(`\n[Sample ${idx + 1}]`);
    console.log(`  SKU:         ${p.sku}`);
    console.log(`  UID:         ${p.uid}`);
    console.log(`  Name:        ${p.name}`);
    console.log(`  Category:    ${p.category}`);
    console.log(`  Slug:        ${p.slug}`);
    console.log(`  Description Preview (first 250 chars):`);
    console.log(`    "${p.description.slice(0, 250).replace(/\n/g, ' ')}..."`);
  });
  console.log('\n========================================================================\n');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error running export:', err);
    process.exit(1);
  });
}

module.exports = {
  discoverCandidateSlugs,
  fetchProductDetails,
  cleanDescription
};
