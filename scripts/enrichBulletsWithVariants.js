/**
 * scripts/enrichBulletsWithVariants.js
 *
 * Post-processing script to enrich training data bullet lists (description.key_features) with:
 * 1. Cross-variant sibling information within the same product family (same product_short_name + primary_material).
 * 2. Variant-specific phrasing: "This is a {size} size, also available in {other sizes}."
 * 3. Minimum 4-5 bullet count enforcement drawing from real fields (warranty, dimensions, weight)
 *    with non-duplication checks against description.summary.
 *
 * Does NOT modify description.summary, promptBuilder.js, or any rule files.
 * Writes output to <name>_enriched.jsonl without overwriting original files.
 */

const fs = require('fs');
const path = require('path');

const TRAINING_SET_DIR = path.join(__dirname, '..', 'data', 'trainingSet');

function getRecordSizes(input) {
  const axes = input.variant_axes || {};
  if (Array.isArray(axes.size) && axes.size.length > 0) return axes.size;
  if (input.size_of_the_bed) return [input.size_of_the_bed];
  if (input.seating_capacity) return [input.seating_capacity];
  return [];
}

function getRecordStorages(input) {
  const axes = input.variant_axes || {};
  if (Array.isArray(axes.storage_type) && axes.storage_type.length > 0) return axes.storage_type;
  if (input.storage_type) return [input.storage_type];
  return [];
}

function getRecordFinishes(input) {
  const axes = input.variant_axes || {};
  if (Array.isArray(axes.finish) && axes.finish.length > 0) return axes.finish;
  if (input.finish_name) return [input.finish_name];
  if (input.color_finish) return [input.color_finish];
  return [];
}

function getRecordColours(input) {
  const axes = input.variant_axes || {};
  if (Array.isArray(axes.colour) && axes.colour.length > 0) return axes.colour;
  if (input.primary_color) return [input.primary_color];
  return [];
}

function formatStorageVal(st) {
  const norm = String(st).toLowerCase().replace(/-/g, ' ');
  if (norm.includes('non storage') || norm.includes('no storage') || norm.includes('without storage')) {
    return 'an open, uncluttered base';
  }
  return st.toLowerCase();
}

function enrichRecordBullets(record, family) {
  const input = record.input;
  const summary = record.output?.description?.summary || '';
  const sumLower = summary.toLowerCase();
  const bullets = [];

  // 1. SIZE bullet
  const familySizes = family ? family.sizes : [];
  const thisSizes = getRecordSizes(input);
  if (thisSizes.length > 0) {
    if (familySizes.length > 1) {
      const thisSize = thisSizes[0];
      const otherSizes = familySizes.filter((s) => s !== thisSize);
      if (otherSizes.length > 0) {
        bullets.push(`This is a ${thisSize} size, also available in ${otherSizes.join(', ')}.`);
      } else {
        bullets.push(`Available in ${thisSizes.join(' and ')} sizes to suit different spaces.`);
      }
    } else {
      bullets.push(`Available in ${thisSizes.join(' and ')} sizes to suit different spaces.`);
    }
  }

  // 2. MATTRESS bullet (variant-specific fit, not cross-variant)
  const mattressSize = input.recommended_mattress_size || (input.mattress_recommendation && input.mattress_recommendation.size);
  const mattressThickness = input.mattress_recommendation && input.mattress_recommendation.thickness_range;
  if (mattressSize && mattressThickness) {
    bullets.push(`Comfortably fits a ${mattressSize} mattress with an ideal thickness of ${mattressThickness}.`);
  } else if (mattressSize) {
    bullets.push(`Comfortably fits a ${mattressSize} mattress.`);
  } else if (mattressThickness) {
    bullets.push(`Best paired with a ${mattressThickness} thick mattress.`);
  }

  // 3. STORAGE bullet
  const familyStorages = family ? family.storages : [];
  const thisStorages = getRecordStorages(input);
  if (thisStorages.length > 0) {
    if (familyStorages.length > 1) {
      const thisStorage = thisStorages[0];
      const otherStorages = familyStorages.filter((s) => s !== thisStorage);
      if (otherStorages.length > 0) {
        const thisFormatted = formatStorageVal(thisStorage);
        const otherFormatted = otherStorages.map(formatStorageVal).join(', ');
        bullets.push(`This comes with ${thisFormatted}, also available in ${otherFormatted}.`);
      } else {
        const norm = thisStorage.toLowerCase().replace(/-/g, ' ');
        if (norm.includes('non storage') || norm.includes('no storage') || norm.includes('without storage')) {
          bullets.push(`Features an open, uncluttered base.`);
        } else {
          bullets.push(`Includes ${thisStorage.toLowerCase()} for easy access underneath.`);
        }
      }
    } else {
      const storageStr = thisStorages.join(' and ');
      const normStorageStr = storageStr.toLowerCase().replace(/-/g, ' ');
      if (thisStorages.length === 1 && (normStorageStr.includes('non storage') || normStorageStr.includes('no storage') || normStorageStr.includes('without storage'))) {
        bullets.push(`Features an open, uncluttered base.`);
      } else {
        bullets.push(`Includes ${storageStr.toLowerCase()} for easy access underneath.`);
      }
    }
  }

  // 4. FINISH bullet
  const familyFinishes = family ? family.finishes : [];
  const thisFinishes = getRecordFinishes(input);
  if (thisFinishes.length > 0) {
    if (familyFinishes.length > 1) {
      const thisFinish = thisFinishes[0];
      const otherFinishes = familyFinishes.filter((f) => f !== thisFinish);
      if (otherFinishes.length > 0) {
        bullets.push(`This is a ${thisFinish} finish, also available in ${otherFinishes.join(', ')}.`);
      } else {
        bullets.push(`Available in a ${thisFinish} finish.`);
      }
    } else {
      if (thisFinishes.length === 1) {
        bullets.push(`Available in a ${thisFinishes[0]} finish.`);
      } else {
        bullets.push(`Available in ${thisFinishes.join(' and ')} finishes.`);
      }
    }
  }

  // 5. COLOUR bullet
  const familyColours = family ? family.colours : [];
  const thisColours = getRecordColours(input);
  if (thisColours.length > 0) {
    if (familyColours.length > 1) {
      const thisColour = thisColours[0];
      const otherColours = familyColours.filter((c) => c !== thisColour);
      if (otherColours.length > 0) {
        if (otherColours.length === 1) {
          bullets.push(`This comes in ${thisColour} colour, also available in ${otherColours[0]} colour.`);
        } else {
          bullets.push(`This comes in ${thisColour} colour, also available in ${otherColours.join(', ')} colours.`);
        }
      } else {
        bullets.push(`Available in ${thisColour} colour.`);
      }
    } else {
      if (thisColours.length === 1) {
        bullets.push(`Available in ${thisColours[0]} colour.`);
      } else {
        bullets.push(`Also available in ${thisColours.join(', ')} colours.`);
      }
    }
  }

  // 6. MINIMUM COUNT ENFORCEMENT (target 4-5 bullets)
  if (bullets.length < 4) {
    // a. warranty_months
    if (input.warranty_months && !sumLower.includes('warranty') && !sumLower.includes(`${input.warranty_months}-month`) && !sumLower.includes(`${input.warranty_months} month`)) {
      bullets.push(`Backed by a ${input.warranty_months}-month warranty.`);
    }
  }
  if (bullets.length < 4) {
    // b. dimensions
    if (input.dimensions && !sumLower.includes(input.dimensions.toLowerCase())) {
      bullets.push(`Overall size: ${input.dimensions}.`);
    }
  }
  if (bullets.length < 4) {
    // c. weight
    if (input.weight && !sumLower.includes(input.weight.toLowerCase())) {
      bullets.push(`Weighs ${input.weight}.`);
    }
  }

  return bullets;
}

function processJsonlFile(filePath) {
  const baseName = path.basename(filePath);
  const outName = baseName.replace(/(\.jsonl)$/, '_enriched$1');
  const outPath = path.join(path.dirname(filePath), outName);

  console.log(`\n==================================================`);
  console.log(`Processing: ${baseName}`);
  console.log(`Output:     ${outName}`);
  console.log(`==================================================`);

  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) {
    console.log(`File is empty: ${filePath}`);
    return;
  }

  const lines = content.split('\n');
  const records = lines.map((l) => JSON.parse(l));

  // Step 1: Group records into families (same shortName + primary_material)
  const families = {};
  for (const r of records) {
    const shortName = r.input.product_short_name || r.input.name.split(' ')[0];
    const mat = r.input.primary_material || 'Unknown';
    const key = `${shortName}:::${mat}`;
    if (!families[key]) families[key] = { name: shortName, material: mat, members: [] };
    families[key].members.push(r);
  }

  // Collect family unions
  for (const fam of Object.values(families)) {
    fam.sizes = [...new Set(fam.members.flatMap((m) => getRecordSizes(m.input)))];
    fam.storages = [...new Set(fam.members.flatMap((m) => getRecordStorages(m.input)))];
    fam.finishes = [...new Set(fam.members.flatMap((m) => getRecordFinishes(m.input)))];
    fam.colours = [...new Set(fam.members.flatMap((m) => getRecordColours(m.input)))];
  }

  // Step 1.3: Log detected families with 2+ members
  console.log(`\n--- Detected Multi-Member Families ---`);
  let multiFamilyCount = 0;
  for (const fam of Object.values(families)) {
    if (fam.members.length > 1) {
      multiFamilyCount++;
      const siblingsFound = [];
      if (fam.sizes.length > 1) siblingsFound.push(`sizes [${fam.sizes.join(', ')}]`);
      if (fam.storages.length > 1) siblingsFound.push(`storages [${fam.storages.join(', ')}]`);
      if (fam.finishes.length > 1) siblingsFound.push(`finishes [${fam.finishes.join(', ')}]`);
      if (fam.colours.length > 1) siblingsFound.push(`colours [${fam.colours.join(', ')}]`);
      const sibDetails = siblingsFound.length > 0 ? ` — ${siblingsFound.join(', ')}` : ' (identical variants across axes)';
      console.log(`Family '${fam.name}' (${fam.material}): ${fam.members.length} members${sibDetails}`);
    }
  }
  console.log(`Total families: ${Object.keys(families).length}, Multi-member families: ${multiFamilyCount}`);

  // Step 2: Rebuild bullets per record
  const enrichedRecords = [];
  let reachedMinCount = 0;
  let fellShortCount = 0;

  for (const r of records) {
    const shortName = r.input.product_short_name || r.input.name.split(' ')[0];
    const mat = r.input.primary_material || 'Unknown';
    const key = `${shortName}:::${mat}`;
    const fam = families[key];

    const newBullets = enrichRecordBullets(r, fam);

    // Deep clone output to avoid mutating original, preserve summary byte-for-byte
    const enriched = {
      input: r.input,
      output: {
        ...r.output,
        description: {
          ...r.output.description,
          key_features: newBullets
        }
      }
    };
    enrichedRecords.push(enriched);

    if (newBullets.length >= 4) {
      reachedMinCount++;
    } else {
      fellShortCount++;
      console.warn(`[WARN] Record ${r.input.id} could not reach minimum (got ${newBullets.length} bullets, insufficient real data)`);
    }
  }

  // Step 3: Write enriched output
  const outContent = enrichedRecords.map((r) => JSON.stringify(r)).join('\n') + '\n';
  fs.writeFileSync(outPath, outContent, 'utf8');

  console.log(`\n--- Compliance Report ---`);
  console.log(`Records processed: ${records.length}`);
  console.log(`Reached >= 4 bullets: ${reachedMinCount}/${records.length} (${Math.round((reachedMinCount / records.length) * 100)}%)`);
  if (fellShortCount > 0) {
    console.log(`Fell short (< 4 bullets): ${fellShortCount}/${records.length} (insufficient real data)`);
  } else {
    console.log(`Fell short (< 4 bullets): 0`);
  }
  console.log(`Enriched file written to: ${outPath}\n`);

  return {
    baseName,
    outName,
    records,
    enrichedRecords,
    families,
    reachedMinCount,
    fellShortCount
  };
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);
  let targetFiles = [];

  if (args.length > 0) {
    for (const arg of args) {
      let resolved = arg;
      if (!fs.existsSync(resolved)) {
        resolved = path.join(TRAINING_SET_DIR, arg.endsWith('.jsonl') ? arg : `${arg}_generated.jsonl`);
      }
      if (fs.existsSync(resolved)) {
        targetFiles.push(resolved);
      } else {
        console.error(`File not found: ${arg} (tried ${resolved})`);
      }
    }
  } else {
    // Default: process all training set jsonl files (excluding _enriched files)
    const files = fs.readdirSync(TRAINING_SET_DIR).filter((f) => f.endsWith('.jsonl') && !f.endsWith('_enriched.jsonl'));
    targetFiles = files.map((f) => path.join(TRAINING_SET_DIR, f));
  }

  for (const f of targetFiles) {
    processJsonlFile(f);
  }
}

module.exports = {
  enrichRecordBullets,
  processJsonlFile,
  getRecordSizes,
  getRecordStorages,
  getRecordFinishes,
  getRecordColours
};
