'use strict';

const fs = require('fs');
const path = require('path');

const { loadOriginalInputsFromArchive } = require('../app/helpers/ai-content/agents/dataset-generator.service');
const { generateProductRecord, normalizeSubcategory } = require('../app/helpers/ai-content/agents/category-orchestrator.agent');
const { clearAllMemory, getCategoryMemory } = require('../app/helpers/ai-content/agents/category-memory.helper');
const { auditFactualGrounding } = require('../app/helpers/ai-content/agents/grounding-auditor.agent');
const { auditRepetition } = require('../app/helpers/ai-content/agents/repetition-auditor.agent');
const { validateItem } = require('../app/helpers/ai-content/ai-validator.helper');

const { generateBedroomStorageCopy } = require('../app/helpers/ai-content/agents/bedroom-storage.agent');
const { generateBedsCopy } = require('../app/helpers/ai-content/agents/beds.agent');
const { generateMattressesCopy } = require('../app/helpers/ai-content/agents/mattresses.agent');
const { generateKidsRoomCopy } = require('../app/helpers/ai-content/agents/kids-room.agent');
const { generateWardrobesCopy } = require('../app/helpers/ai-content/agents/wardrobes.agent');

const generators = {
  'Bedroom Storage': generateBedroomStorageCopy,
  Beds: generateBedsCopy,
  Mattresses: generateMattressesCopy,
  'Kids Room': generateKidsRoomCopy,
  Wardrobes: generateWardrobesCopy,
};

const inputs = loadOriginalInputsFromArchive();

console.log('Testing all 185 products across all categories...');

let grandTotal = 0;
let grandPassed = 0;
let grandFailed = 0;

async function run() {
  for (const [catName, prods] of Object.entries(inputs)) {
    if (prods.length === 0) continue;
    clearAllMemory();
    const memory = getCategoryMemory(catName);
    let catPassed = 0;
    let catFailed = 0;
    
    for (let i = 0; i < prods.length; i++) {
      const p = prods[i];
      grandTotal++;
      
      // Generate real record
      const result = await generateProductRecord(p, { maxAttempts: 1, itemIndex: i });
      const summary = result.output?.description?.summary || '';
      const words = summary.trim().split(/\s+/).filter(Boolean).length;
      
      const gVal = auditFactualGrounding(summary, p);
      const sVal = validateItem(result.output, p, { relaxLengthCheck: false });
      const isNeedsReview = result.output?._meta?.needs_review;
      
      const errors = [
        ...(words < 70 || words > 110 ? [`Word count out of bounds: ${words}`] : []),
        ...gVal.errors,
        ...sVal.errors,
        ...(isNeedsReview ? ['Needs review flagged'] : []),
      ];
      
      if (errors.length === 0 && !isNeedsReview) {
        catPassed++;
        grandPassed++;
      } else {
        catFailed++;
        grandFailed++;
        const lastAttempt = result.output?._meta?.attempt_history?.slice(-1)[0];
        console.log(`[FAIL] ${catName} [${i}] ${p.name} (Words: ${words}):\n  Errors: ${lastAttempt?.errors?.join(' | ') || errors.join(' | ')}`);
      }
    }
    
    console.log(`--> ${catName}: ${catPassed}/${prods.length} passed (${catFailed} failed)`);
  }

  console.log(`\n========================================`);
  console.log(`TOTAL: ${grandPassed}/${grandTotal} passed (${grandFailed} failed)`);
  console.log(`========================================`);
}

run();
