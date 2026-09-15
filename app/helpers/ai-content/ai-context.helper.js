'use strict';

/**
 * AI Context Helper
 * Builds structured context for LLM / Multi-Agent content generation.
 * 
 * CRITICAL RULE:
 * This helper NEVER contains reusable prose templates, sentence skeletons,
 * or hardcoded marketing phrases.
 * It provides only:
 * - Category facts & taxonomy
 * - Product fact inventory (whitelisted source fields)
 * - Available narrative opportunities (conceptual ideas & perspectives)
 * - Recently overused opportunities (to exclude)
 * - Recently used structures (to avoid structural repetition)
 * - Forbidden claim types (joinery, ungrounded mechanisms, etc.)
 */

const { extractProductFacts } = require('./agents/fact-inventory.agent');
const { getCategoryMemory } = require('./agents/category-memory.helper');

const FORBIDDEN_CLAIM_TYPES = [
  'unsupported durability claims (e.g. heirloom, generational, indestructible)',
  'unsupported joinery techniques (e.g. traditional joinery, mortise-and-tenon, precision-milled)',
  'unsupported thermal/chemical processing (e.g. kiln-dried, anti-termite, non-porous)',
  'unsupported mechanical hardware (e.g. gas-assist struts, smooth-gliding drawer runners, pneumatic pistons)',
  'unsupported ergonomic/health claims (e.g. spinal alignment, orthopedic posture, zero gravity)',
  'unsupported structural reinforcement (e.g. corner bracing, reinforced slats, wobble-free)',
  'unsupported material qualities (e.g. scratch-resistant, waterproof, moisture-proof, acoustic dampening)',
  'generic emotional opening formulas (e.g. "Pure simplicity shapes...", "Balanced proportions inspire...")',
  'formulaic closer templates (e.g. "Bring X and Y to your home with PRODUCT")',
];

/**
 * Build structured context object for a product.
 * 
 * @param {Object} product Raw product record
 * @param {Object} options Configuration & retry options
 * @returns {Object} Structured context payload
 */
function buildStructuredContext(product, options = {}) {
  const facts = extractProductFacts(product);
  const category = facts.category || 'Furniture';
  const memory = getCategoryMemory(category);

  const overusedOpportunities = memory.getOverusedAngles(0.30);
  const overusedStructures = memory.getOverusedStructures(0.30);

  return {
    category,
    subcategory: facts.subcategory,
    product_facts: {
      product_id: facts.productId,
      name: facts.name,
      product_short_name: facts.shortName,
      primary_material: facts.primaryMaterial,
      secondary_material: facts.secondaryMaterial || null,
      color_finish: facts.finish,
      storage_type: facts.storageType,
      size: facts.size || null,
      dimensions: facts.dimensions || null,
      weight: facts.weight || null,
      warranty_months: facts.warrantyMonths || 12,
      price: facts.price || null,
      variant_axes: facts.variantAxes || {},
      supported_features: facts.supportedFeatures || [],
      is_non_storage: facts.isNonStorage,
    },
    narrative_opportunities: options.narrativeOpportunities || [],
    recently_overused_opportunities: overusedOpportunities,
    recently_used_structures: overusedStructures,
    forbidden_claim_types: FORBIDDEN_CLAIM_TYPES,
    retry_feedback: options.retryFeedback || null,
  };
}

module.exports = {
  buildStructuredContext,
  FORBIDDEN_CLAIM_TYPES,
};
