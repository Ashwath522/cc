'use strict';

/**
 * Urban Ladder Multi-Category Catalog Scraper
 * 
 * Collects ~200 real, unique products per category across 5 top-level categories:
 * - Living Room
 * - Bedroom
 * - Dining
 * - Storage
 * - Lighting & Decor
 * 
 * Plain HTTP GET on /collection/<slug> and /product/<slug> pages.
 * Enforces strict spec-dump rejection and exact output schema matching.
 */

const fs = require('fs');
const path = require('path');

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const TARGET_COUNT_PER_CATEGORY = 200;
const DELAY_MS = 500; // polite 500ms delay between requests (user requested 400-800ms)

const SEED_COLLECTIONS = {
  'Living Room': [
    'sofa-sets', 'recliners', 'sofa-cum-beds', 'lounge-chairs',
    'coffee-table', 'chairs', 'accent-chairs', 'side-tables', 'ottomans',
    'fabric-sofas', 'wooden-sofas', 'leather-sofas', 'l-shaped-sofas',
    'center-tables', 'nest-of-tables', 'arm-chairs', 'benches', 'poufs',
    '3-seater-sofas', '2-seater-sofas', '1-seater-sofas', 'wing-chairs',
    'rocking-chairs', 'sofa-bed', 'seating-and-chairs'
  ],
  'Bedroom': [
    'all-beds', 'king-size-beds', 'queen-size-beds', 'single-beds',
    'wardrobes', 'bedside-tables', 'dressing-tables', 'mattresses',
    'hydraulic-beds-with-storage', 'beds-without-storage', 'storage-beds',
    'wooden-beds', 'solid-wood-beds', 'upholstered-beds', 'sliding-wardrobes',
    '2-door-wardrobes', '3-door-wardrobes', '4-door-wardrobes',
    'king-size-mattress', 'queen-size-mattress', 'memory-foam-mattress',
    'spring-mattress', 'kids-beds', 'bunk-beds'
  ],
  'Dining': [
    'dining-table-sets', 'dining-chairs', 'bar-cabinets',
    'bar-stools', 'crockery-units', 'sideboards',
    'dining-tables', '4-seater-dining-table-sets', '6-seater-dining-table-sets',
    '8-seater-dining-table-sets', 'extendable-dining-tables', 'glass-dining-tables',
    'wooden-dining-table-sets', 'bar-furniture', 'bar-units', 'counter-stools',
    'benches-dining', '2-seater-dining-sets', 'dining-and-kitchen', 'dining-room-furniture'
  ],
  'Storage': [
    'bookshelf', 'shoe-rack', 'chest-of-drawers', 'tv-units',
    'storage-cabinets', 'bookshelves', 'shoe-racks', 'cabinets-and-sideboards',
    'living-storage', 'wall-shelves', 'display-units', 'entryway-storage',
    'modular-wardrobes', 'drawer-storage', 'trunk-and-boxes', 'kids-storage'
  ],
  'Lighting & Decor': [
    'table-lamps', 'floor-lamps', 'ceiling-lights',
    'wall-lights-collections', 'wall-decor', 'wall-art', 'carpets', 'mirrors',
    'home-decor', 'cushion-cover', 'cushion-covers', 'carpets-and-rugs',
    'hanging-lights', 'chandeliers', 'vases', 'wall-clocks', 'photo-frames',
    'showpieces', 'curtains', 'candle-holders', 'table-decor', 'paintings',
    'runners', 'doormats', 'lamps', 'lighting', 'festive-lights', 'study-lamps'
  ]
};

const CATEGORY_FILE_NAMES = {
  'Living Room': 'living_room.json',
  'Bedroom': 'bedroom.json',
  'Dining': 'dining.json',
  'Storage': 'storage.json',
  'Lighting & Decor': 'lighting_decor.json'
};

const CATEGORY_MATCH_REGEX = {
  'Living Room': [
    /\bsofa/i, /\brecliner/i, /\bcouch/i, /\bloveseat/i, /\bcoffee[- ]table/i,
    /\bcenter[- ]table/i, /\bside[- ]table/i, /\bend[- ]table/i, /\bottoman/i,
    /\bpouf/i, /\blounge[- ]chair/i, /\baccent[- ]chair/i, /\bwing[- ]chair/i,
    /\brocking[- ]chair/i, /\barmchair/i, /\barm[- ]chair/i
  ],
  'Bedroom': [
    /\bbed\b/i, /\bbeds\b/i, /\bmattress/i, /\bwardrobe/i, /\balmirah/i,
    /\bbedside/i, /\bdressing/i, /\bnightstand/i, /\bbunk/i, /\bcot\b/i
  ],
  'Dining': [
    /\bdining/i, /\bbar[- ]cabinet/i, /\bbar[- ]stool/i, /\bbar[- ]unit/i,
    /\bbar[- ]furniture/i, /\bcrockery/i, /\bsideboard/i, /\bcounter[- ]stool/i
  ],
  'Storage': [
    /\bbookshelf/i, /\bbookcase/i, /\bshoe[- ]rack/i, /\bchest[- ]of[- ]drawers/i,
    /\btv[- ]unit/i, /\bstorage[- ]cabinet/i, /\bwall[- ]shelf/i, /\bwall[- ]shelves/i,
    /\bdrawer/i, /\bcabinet/i, /\bcupboard/i, /\bstorage\b/i
  ],
  'Lighting & Decor': [
    /\blamp/i, /\blight/i, /\bchandelier/i, /\bdecor/i, /\bwall[- ]art/i,
    /\bcarpet/i, /\brug\b/i, /\brugs\b/i, /\bmirror/i, /\bcushion/i, /\bvase/i,
    /\bclock/i, /\bphoto[- ]frame/i, /\bshowpiece/i, /\bcurtain/i, /\bcandle/i
  ]
};

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
 * Strict check: Verify description contains real marketing prose,
 * NOT a concatenated spec dump (e.g. "NameXGeneric NameYItem CodeZ...").
 */
function isRealMarketingDescription(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 50) return false;

  // Spec-dump indicators
  const specDumpKeywords = [
    /\bGeneric\s*Name\b/i,
    /\bItem\s*Code\b/i,
    /\bPrimary\s*Material\s*(?:Type|Subtype)?\b/i,
    /\bSecondary\s*Material\s*(?:Type|Subtype)?\b/i,
    /\bPackage\s*Contains\b/i,
    /\bProduct\s*Assembly\b/i,
    /\bPrimary\s*Room\b/i,
    /\bTable\s*Top\s*Material\b/i,
    /\bStorage\s*Availability\b/i,
    /\bConsumer\s*Care\s*Details\b/i,
    /\bManufactured\s*By\b/i,
    /\bSold\s*By\b/i,
    /\bFinish\s*Name\b/i,
    /\bWarranty\s*In\s*Months\b/i,
    /\bNet\s*Weight\b/i
  ];

  for (const regex of specDumpKeywords) {
    if (regex.test(trimmed)) {
      return false; // Spec sheet dump
    }
  }

  // Common spec dump starting pattern: "Name..." or "Name[A-Z]"
  if (/^Name\s*[A-Z0-9]/i.test(trimmed) || /^Generic\s*Name/i.test(trimmed)) {
    return false;
  }

  if (trimmed.includes('StorageDrawer') || trimmed.includes('StorageHydraulic') || trimmed.includes('Box StorageNon')) {
    return false;
  }

  // Must contain prose words / sentences
  const proseMatch = /[a-zA-Z]{3,}\s+[a-zA-Z]{2,}\s+[a-zA-Z]{2,}/;
  if (!proseMatch.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Step 1: Discover collection slugs from collections.sitemap.xml and combine with seeds
 */
async function discoverCollectionsMap() {
  console.log('📡 Step 1: Discovering collection slugs for each category...');
  const map = {};
  for (const cat of Object.keys(SEED_COLLECTIONS)) {
    map[cat] = [...SEED_COLLECTIONS[cat]];
  }

  try {
    const res = await fetch('https://www.urbanladder.com/sitemap/collections.sitemap.xml', {
      headers: { 'User-Agent': USER_AGENT }
    });
    if (res.ok) {
      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>https:\/\/www\.urbanladder\.com\/collection\/([^<]+)<\/loc>/g)].map(m => m[1]);
      console.log(`  Found ${locs.length} total collection slugs in sitemap.`);

      for (const slug of locs) {
        for (const [cat, regexes] of Object.entries(CATEGORY_MATCH_REGEX)) {
          if (regexes.some(r => r.test(slug))) {
            if (!map[cat].includes(slug)) {
              map[cat].push(slug);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('  ⚠️ Could not fetch collections sitemap, using seeds only:', err.message);
  }

  for (const [cat, list] of Object.entries(map)) {
    console.log(`  • ${cat.padEnd(20)}: ${list.length} collection slugs available`);
  }

  return map;
}

/**
 * Step 2: Fetch product links from a /collection/<slug> page
 */
async function fetchProductSlugsFromCollection(collectionSlug) {
  const url = `https://www.urbanladder.com/collection/${collectionSlug}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();

    const matches = [...html.matchAll(/\/product\/([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
    const productSlugs = matches.filter(slug => /-\d{5,10}$/.test(slug) && !slug.startsWith('collection'));
    return [...new Set(productSlugs)];
  } catch (err) {
    return [];
  }
}

/**
 * Step 3: Fetch and extract single product details
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

    let uid = null;
    let sku = null;
    let name = null;
    let product_short_name = null;
    let subcategory = null;
    let price = null;
    let primary_material = null;
    let secondary_material = null;
    let seating_capacity = null;
    let color_finish = null;
    let storage_type = null;
    let warranty_months = 0;
    let description = null;

    // Check window.APP_DATA
    const appDataIdx = html.indexOf('window.APP_DATA');
    if (appDataIdx !== -1) {
      const jsonStart = html.indexOf('{', appDataIdx);
      const endScript = html.indexOf('</script>', appDataIdx);
      if (jsonStart !== -1 && endScript !== -1) {
        try {
          const rawJson = html.slice(jsonStart, endScript).trim();
          const data = JSON.parse(rawJson);
          const pd = data?.reduxData?.catalog?.product_details;
          const pm = data?.reduxData?.catalog?.product_meta;

          if (pd) {
            uid = pd.uid ? Number(pd.uid) : null;
            sku = pd.item_code || pd.attributes?.item_code || null;
            name = pd.name ? cleanDescription(pd.name) : null;
            product_short_name = pd.attributes?.product_model_name || null;

            // Grouped attributes (Properties, Features, etc.)
            const propGroup = pd.grouped_attributes?.find(g => g.title === 'Properties');
            const props = {};
            if (propGroup && propGroup.details) {
              for (const d of propGroup.details) {
                if (d.key && d.value) {
                  props[d.key] = d.value;
                }
              }
            }

            if (!product_short_name && props['Product Model Name']) {
              product_short_name = props['Product Model Name'];
            }

            subcategory = props['Generic Name'] || pd.attributes?.['ul-generic-name'] || null;

            primary_material = props['Primary Material Subtype'] || props['Primary Material Type'] ||
              pd.attributes?.primary_material_subtype || pd.attributes?.primary_material_type || null;

            secondary_material = props['Secondary Material Subtype'] || props['Secondary Material Type'] ||
              pd.attributes?.secondary_material_subtype || pd.attributes?.secondary_material_type || null;

            seating_capacity = props['Seating Capacity'] || pd.attributes?.seating_capacity || null;

            color_finish = props['Finish Name'] || props['Colour'] || props['Primary Color'] ||
              pd.attributes?.finish_name || pd.attributes?.colour || null;

            storage_type = props['Storage Type'] || props['Storage Availability'] ||
              pd.attributes?.storage_type || null;

            const rawWarranty = props['Warranty In Months'] || pd.attributes?.['warranty-in-months'] || pd.attributes?.warranty_in_months;
            if (rawWarranty) {
              const pw = parseInt(rawWarranty, 10);
              if (!isNaN(pw)) warranty_months = pw;
            }

            // Extract marketing features
            const rawFeatures = pd.attributes?.features ||
              pd.grouped_attributes?.find(g => g.title === 'Features')?.details?.[0]?.value ||
              null;
            if (rawFeatures) {
              description = cleanDescription(rawFeatures);
            }
          }

          if (pm && pm.price) {
            const effective = pm.price.effective?.min || pm.price.min || pm.price.effective?.max || pm.price.max;
            if (typeof effective === 'number' && !isNaN(effective)) {
              price = effective;
            }
          }
        } catch (e) {
          // JSON parse error, fall back to regex
        }
      }
    }

    // HTML regex fallbacks
    if (!uid) {
      const uidMatch = slug.match(/-(\d{5,10})$/);
      if (uidMatch) uid = parseInt(uidMatch[1], 10);
    }

    if (!name) {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) name = cleanDescription(h1Match[1]);
      else {
        const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        if (titleMatch) name = cleanDescription(titleMatch[1]).replace(/\s*\|\s*Urban Ladder.*$/i, '').trim();
      }
    }

    if (!sku) {
      const skuMatch = html.match(/(?:Item Code|SKU)[\s:"]+([A-Z0-9]{8,25})/i);
      if (skuMatch) sku = skuMatch[1];
    }

    if (price === null) {
      const priceJsonMatch = html.match(/"effective":\s*\{\s*"min":\s*(\d+)/i) || html.match(/"price":\s*(\d+)/i);
      if (priceJsonMatch) price = parseInt(priceJsonMatch[1], 10);
      else {
        const priceTextMatch = html.match(/₹\s*([\d,]+)/);
        if (priceTextMatch) price = parseInt(priceTextMatch[1].replace(/,/g, ''), 10);
      }
    }

    // HTML fallback: only if tabpanel-0 explicitly contains <dt>Features</dt>
    if (!description) {
      const tabMatch = html.match(/id="tabpanel-0"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
      if (tabMatch && /<dt[^>]*>Features<\/dt>/i.test(tabMatch[1])) {
        const featValMatch = tabMatch[1].match(/<dt[^>]*>Features<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/i);
        if (featValMatch) {
          description = cleanDescription(featValMatch[1]);
        }
      }
    }

    // Spec dump filter
    if (!description || !isRealMarketingDescription(description)) {
      return { skippedNoDescription: true, reason: 'No real marketing description' };
    }

    if (!name || !sku || !uid) {
      return { error: 'Missing essential fields (name/sku/uid)' };
    }

    if (!product_short_name) {
      product_short_name = name.split(' ')[0] || 'Product';
    }

    if (!subcategory) {
      subcategory = category;
    }

    // Build product object strictly following schema
    const product = {
      sku,
      uid,
      name,
      product_short_name,
      category,
      subcategory,
      raw_category: category,
      slug,
      url,
      price: price !== null ? price : 0
    };

    // Optional fields - only include if found on page
    if (primary_material) product.primary_material = primary_material;
    if (secondary_material) product.secondary_material = secondary_material;
    if (seating_capacity) product.seating_capacity = seating_capacity;
    if (color_finish) product.color_finish = color_finish;
    if (storage_type) product.storage_type = storage_type;
    product.warranty_months = warranty_months;
    product.description = description;

    return { product };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Step 4 & 5: Load any existing verified items, then scrape collection pages to reach ~200 items per category
 */
function loadExistingVerifiedItems() {
  const existingPath = path.join(__dirname, '..', 'output', 'urban_ladder_real_descriptions.json');
  const validByCat = {
    'Living Room': [],
    'Bedroom': [],
    'Dining': [],
    'Storage': [],
    'Lighting & Decor': []
  };

  if (fs.existsSync(existingPath)) {
    try {
      const items = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      for (const item of items) {
        if (item.raw_category && validByCat[item.raw_category] && isRealMarketingDescription(item.description)) {
          const cleanItem = {
            sku: item.sku,
            uid: Number(item.uid),
            name: item.name,
            product_short_name: item.product_short_name || item.name.split(' ')[0],
            category: item.raw_category,
            subcategory: item.subcategory || item.raw_category,
            raw_category: item.raw_category,
            slug: item.slug,
            url: item.url,
            price: Number(item.price) || 0
          };
          if (item.primary_material) cleanItem.primary_material = item.primary_material;
          if (item.secondary_material) cleanItem.secondary_material = item.secondary_material;
          if (item.seating_capacity) cleanItem.seating_capacity = item.seating_capacity;
          if (item.color_finish) cleanItem.color_finish = item.color_finish;
          if (item.storage_type) cleanItem.storage_type = item.storage_type;
          cleanItem.warranty_months = typeof item.warranty_months === 'number' ? item.warranty_months : 0;
          cleanItem.description = item.description;

          validByCat[item.raw_category].push(cleanItem);
        }
      }
    } catch (e) {}
  }
  return validByCat;
}

/**
 * Fallback: fetch product slugs from sitemaps if collection pages are exhausted
 */
async function fetchProductSlugsFromSitemap(category, seenUids, maxNeeded) {
  console.log(`  🔍 Scanning sitemaps for additional [${category}] candidates...`);
  const regexes = CATEGORY_MATCH_REGEX[category];
  const candidates = [];

  for (let page = 1; page <= 30; page++) {
    if (candidates.length >= maxNeeded) break;
    try {
      const res = await fetch(`https://www.urbanladder.com/sitemap/products/${page}/page.sitemap.xml`, {
        headers: { 'User-Agent': USER_AGENT }
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>https:\/\/www\.urbanladder\.com\/product\/([^<]+)<\/loc>/g)].map(m => m[1]);

      for (const slug of locs) {
        const uidMatch = slug.match(/-(\d{5,10})$/);
        if (!uidMatch) continue;
        const uid = parseInt(uidMatch[1], 10);
        if (seenUids.has(uid)) continue;

        const normalized = slug.replace(/-/g, ' ');
        if (regexes.some(r => r.test(normalized))) {
          candidates.push(slug);
          if (candidates.length >= maxNeeded) break;
        }
      }
    } catch (e) {}
  }

  console.log(`  Found ${candidates.length} additional candidates from sitemaps.`);
  return candidates;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Urban Ladder 5-Category Catalog Expansion...');
  console.log(`Target: ~${TARGET_COUNT_PER_CATEGORY} products per category across 5 categories (~1,000 total).`);
  console.log(`Politeness delay: ${DELAY_MS}ms between requests.\n`);

  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const collectionsMap = await discoverCollectionsMap();
  const preloaded = loadExistingVerifiedItems();

  const summary = {};
  for (const cat of Object.keys(SEED_COLLECTIONS)) {
    summary[cat] = {
      collectedCount: 0,
      skippedNoDescription: 0,
      subcategoriesTouched: 0
    };
  }

  const overallStartTime = Date.now();

  for (const category of Object.keys(SEED_COLLECTIONS)) {
    console.log(`\n========================================================================`);
    console.log(`📦 STARTING CATEGORY: [${category}] (Target: ${TARGET_COUNT_PER_CATEGORY})`);
    console.log(`========================================================================`);

    const outFile = path.join(outputDir, CATEGORY_FILE_NAMES[category]);
    const collectedProducts = [];
    const seenUids = new Set();
    const seenSkus = new Set();

    // Check if category file already exists with full quota
    if (fs.existsSync(outFile)) {
      try {
        const existingFile = JSON.parse(fs.readFileSync(outFile, 'utf8'));
        if (Array.isArray(existingFile) && existingFile.length >= TARGET_COUNT_PER_CATEGORY) {
          console.log(`  File ${CATEGORY_FILE_NAMES[category]} already has ${existingFile.length} items. Validating...`);
          let allValid = true;
          for (const item of existingFile) {
            if (!isRealMarketingDescription(item.description) || !item.uid || !item.sku) {
              allValid = false;
              break;
            }
          }
          if (allValid) {
            console.log(`  ✓ ${category} already complete with ${existingFile.length} valid products. Skipping to next category.`);
            summary[category].collectedCount = existingFile.length;
            continue;
          }
        }
      } catch (e) {}
    }

    // Preload verified clean items
    if (preloaded[category] && preloaded[category].length > 0) {
      for (const item of preloaded[category]) {
        if (!seenUids.has(item.uid) && !seenSkus.has(item.sku)) {
          seenUids.add(item.uid);
          seenSkus.add(item.sku);
          collectedProducts.push(item);
        }
      }
      console.log(`  Loaded ${collectedProducts.length} verified non-spec-dump products as baseline.`);
      summary[category].collectedCount = collectedProducts.length;
    }

    const collectionSlugs = collectionsMap[category] || [];
    let slugIndex = 0;

    while (collectedProducts.length < TARGET_COUNT_PER_CATEGORY && slugIndex < collectionSlugs.length) {
      const collSlug = collectionSlugs[slugIndex++];
      summary[category].subcategoriesTouched++;

      console.log(`${category}: ${collectedProducts.length}/${TARGET_COUNT_PER_CATEGORY} collected, scanning slug '${collSlug}'...`);

      const productSlugs = await fetchProductSlugsFromCollection(collSlug);
      await sleep(DELAY_MS);

      if (!productSlugs || productSlugs.length === 0) {
        continue;
      }

      for (const pSlug of productSlugs) {
        if (collectedProducts.length >= TARGET_COUNT_PER_CATEGORY) {
          break;
        }

        const uidMatch = pSlug.match(/-(\d{5,10})$/);
        if (uidMatch && seenUids.has(parseInt(uidMatch[1], 10))) {
          continue;
        }

        const res = await fetchProductDetails(pSlug, category);
        await sleep(DELAY_MS);

        if (res.skippedNoDescription) {
          summary[category].skippedNoDescription++;
          continue;
        }

        if (res.error) {
          continue;
        }

        const prod = res.product;
        if (!prod) continue;

        if (seenUids.has(prod.uid) || seenSkus.has(prod.sku)) {
          continue;
        }

        seenUids.add(prod.uid);
        seenSkus.add(prod.sku);
        collectedProducts.push(prod);
        summary[category].collectedCount = collectedProducts.length;

        console.log(`  ✓ ${category}: ${collectedProducts.length}/${TARGET_COUNT_PER_CATEGORY} | ${prod.sku} | ${prod.name.slice(0, 30)}`);

        if (collectedProducts.length % 10 === 0 || collectedProducts.length >= TARGET_COUNT_PER_CATEGORY) {
          fs.writeFileSync(outFile, JSON.stringify(collectedProducts, null, 2), 'utf8');
        }
      }
    }

    // If still need more products, search sitemap fallback
    if (collectedProducts.length < TARGET_COUNT_PER_CATEGORY) {
      const needed = (TARGET_COUNT_PER_CATEGORY - collectedProducts.length) * 3;
      const sitemapSlugs = await fetchProductSlugsFromSitemap(category, seenUids, needed);
      for (const pSlug of sitemapSlugs) {
        if (collectedProducts.length >= TARGET_COUNT_PER_CATEGORY) break;

        const uidMatch = pSlug.match(/-(\d{5,10})$/);
        if (uidMatch && seenUids.has(parseInt(uidMatch[1], 10))) continue;

        const res = await fetchProductDetails(pSlug, category);
        await sleep(DELAY_MS);

        if (res.skippedNoDescription) {
          summary[category].skippedNoDescription++;
          continue;
        }
        if (res.error || !res.product) continue;

        const prod = res.product;
        if (seenUids.has(prod.uid) || seenSkus.has(prod.sku)) continue;

        seenUids.add(prod.uid);
        seenSkus.add(prod.sku);
        collectedProducts.push(prod);
        summary[category].collectedCount = collectedProducts.length;

        console.log(`  ✓ (sitemap) ${category}: ${collectedProducts.length}/${TARGET_COUNT_PER_CATEGORY} | ${prod.sku} | ${prod.name.slice(0, 30)}`);

        if (collectedProducts.length % 10 === 0 || collectedProducts.length >= TARGET_COUNT_PER_CATEGORY) {
          fs.writeFileSync(outFile, JSON.stringify(collectedProducts, null, 2), 'utf8');
        }
      }
    }

    // Final save for category
    fs.writeFileSync(outFile, JSON.stringify(collectedProducts, null, 2), 'utf8');
    console.log(`\n✅ Finished [${category}]: Saved ${collectedProducts.length} products to ${outFile}`);
  }

  const totalTimeSec = Math.round((Date.now() - overallStartTime) / 1000);

  // Summary Report Table
  console.log('\n=======================================================================================================');
  console.log('🎉 URBAN LADDER MULTI-CATEGORY SCRAPING COMPLETE');
  console.log('=======================================================================================================');
  console.log(`Total Execution Time: ${totalTimeSec}s (${(totalTimeSec / 60).toFixed(1)} mins)\n`);
  console.log('Summary Report:');
  console.log('-------------------------------------------------------------------------------------------------------');
  console.log(`| ${'Category'.padEnd(20)} | ${'Collected Count'.padEnd(16)} | ${'Skipped (No Desc)'.padEnd(20)} | ${'Subcategories Touched'.padEnd(22)} |`);
  console.log('-------------------------------------------------------------------------------------------------------');
  for (const [cat, stats] of Object.entries(summary)) {
    console.log(`| ${cat.padEnd(20)} | ${String(stats.collectedCount).padStart(16)} | ${String(stats.skippedNoDescription).padStart(20)} | ${String(stats.subcategoriesTouched).padStart(22)} |`);
  }
  console.log('-------------------------------------------------------------------------------------------------------');

  console.log('\nGenerated Output Files:');
  for (const [cat, filename] of Object.entries(CATEGORY_FILE_NAMES)) {
    const fPath = path.join(outputDir, filename);
    if (fs.existsSync(fPath)) {
      const count = JSON.parse(fs.readFileSync(fPath, 'utf8')).length;
      console.log(`  - ${filename}: ${count} products (${(fs.statSync(fPath).size / 1024).toFixed(1)} KB)`);
    }
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error in scraper:', err);
    process.exit(1);
  });
}

module.exports = {
  discoverCollectionsMap,
  fetchProductSlugsFromCollection,
  fetchProductDetails,
  isRealMarketingDescription,
  cleanDescription
};
