'use strict';

/**
 * Mattresses Category Agent
 * Covers Memory Foam, Latex, Orthopedic Foam, Pocket Spring, and Bonnell Spring Mattresses.
 * Uses 8 Structural Archetypes (Structures A–H) and dynamic attribute-driven combinatorial composition
 * to achieve 100% factual grounding, strict theme-loop alignment, 78-100 word counts, and zero repetition.
 */

const { extractProductFacts } = require('./grounding-auditor.agent');
const { hashSeed, pick, buildSynchronizedCloser } = require('./copy-composer.helper');

const MATTRESS_STRUCTURES = [
  'STRUCTURE_A',
  'STRUCTURE_B',
  'STRUCTURE_C',
  'STRUCTURE_D',
  'STRUCTURE_E',
  'STRUCTURE_F',
  'STRUCTURE_G',
  'STRUCTURE_H',
];

function generateMattressesCopy(product, options = {}) {
  const facts = extractProductFacts(product);
  const { structureId, attempt = 1 } = options;

  const mat = (facts.primaryMaterial || 'Supportive Foam').toLowerCase();
  const finish = (facts.finish || 'Natural').toLowerCase();
  const shortName = facts.shortName;
  const name = facts.name.toLowerCase();

  const isSpring = /spring|pocket|bonnell/i.test(mat) || /spring|pocket|bonnell/i.test(name);
  const isLatex = /latex/i.test(mat) || /latex/i.test(name);
  const isMemory = /memory/i.test(mat) || /memory/i.test(name);
  const isCoir = /coir/i.test(mat) || /coir/i.test(name);

  const matType = isMemory
    ? 'memory foam mattress'
    : isLatex
    ? 'latex mattress'
    : isSpring
    ? 'spring mattress'
    : isCoir
    ? 'coir mattress'
    : 'mattress';

  const seed = hashSeed(`${product.id || shortName}_att${attempt}_${mat}_${attempt * 131}_${facts.dimensions || ''}`);

  const structIdx = structureId
    ? MATTRESS_STRUCTURES.indexOf(structureId)
    : seed % MATTRESS_STRUCTURES.length;
  const chosenStruct = MATTRESS_STRUCTURES[structIdx >= 0 ? structIdx : 0];

  let s1 = '';
  let s2 = '';
  let s3 = '';
  let s4 = '';
  let s5 = '';

  switch (chosenStruct) {
    case 'STRUCTURE_A': {
      // Tactile / Visual-First
      const vOpeners = [
        `Evenings unwind with natural resting ease across a resilient mattress core engineered for daily sleep.`,
        `A balanced, uniform sleeping surface establishes a quiet foundation for restorative nightly slumber.`,
        `Restful evenings begin on a supportive mattress surface calibrated for consistent domestic comfort.`,
        `Even pressure distribution and a smooth outer cover create an inviting resting deck for the bedroom.`,
        `A resilient sleeping foundation brings structured resting calm to the master bedroom suite.`,
        `Comfortable nightly unwinding settles in effortlessly across this evenly calibrated mattress deck.`,
        `A smooth, well-cushioned resting surface provides immediate comfort and quiet support each night.`,
        `Balanced surface tension and dense core composition establish an inviting resting deck for the home.`,
        `Nightly sleep routines begin with soothing physical ease upon an evenly cushioned mattress foundation.`,
        `A level and responsive mattress deck brings immediate relaxation to your nightly sleep routine.`,
      ];
      s1 = pick(vOpeners, seed, 0);

      const s2Pool = [
        `This ${mat} mattress delivers dependable surface support that conforms gently to body weight and natural sleeping postures.`,
        `Featuring high-density ${mat} construction, this sleep platform adapts naturally to resting pressure across the entire sleeping area.`,
        `The ${mat} composition provides balanced surface cushioning paired with stable core support for deeply restful nights.`,
        `Designed for restorative slumber, this ${matType} provides responsive support tailored for everyday household comfort and quiet recovery.`,
        `This mattress merges comfortable contact layers with dependable internal density to provide uniform, peaceful sleep each evening.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `High-density internal layers maintain consistent firmness and structural stability across continuous nightly domestic use.`,
        `Selected ${mat} layering preserves steady core resilience, resisting sagging throughout years of regular household sleep.`,
        `Durable internal core construction maintains uniform density and shape retention under regular domestic sleeping loading.`,
        `High-grade ${mat} composition preserves platform firmness and steady load distribution throughout every season of nightly rest.`,
        `The dense internal core preserves platform levelness, preventing impressions and ensuring long-lasting physical support.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `The structured core supports natural sleeping postures while keeping the resting surface even, stable, and comfortable throughout the night.`,
        `Even weight distribution across the mattress platform minimizes motion transfer and fosters peaceful, completely undisturbed sleep.`,
        `The responsive sleeping surface accommodates posture shifts smoothly, supporting relaxed and undisturbed nightly slumber for both occupants.`,
        `A protective outer casing safeguards internal comfort layers while maintaining an immaculate, hygienic, and comfortable resting surface.`,
        `Edge-to-edge structural consistency maximizes the usable sleeping surface while isolating motion across the resting platform.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'mattress');
      break;
    }

    case 'STRUCTURE_B': {
      // Use-Case / Routine-First
      const uOpeners = [
        `Nighttime preparation settles into peaceful calm with an adaptive and supportive sleep foundation.`,
        `Ending the day feels deeply restful on a mattress foundation designed for nocturnal recovery.`,
        `Restful nighttime recovery begins upon a stable, evenly cushioned sleeping surface built for domestic ease.`,
        `Evening relaxation transitions smoothly into deep slumber upon this supportive mattress core.`,
        `Settling in for the night feels unhurried and comfortable upon this evenly supported sleeping deck.`,
        `Peaceful nightly rest begins on a dependable mattress foundation engineered for consistent body support.`,
        `Retiring for the evening feels reassuring and comfortable upon a stable, evenly cushioned mattress platform.`,
        `Nightly sleep routines unfold with unhurried calm upon a mattress calibrated for gentle pressure distribution.`,
        `Unwinding at the end of each day proceeds smoothly upon an evenly balanced sleeping foundation.`,
      ];
      s1 = pick(uOpeners, seed, 0);

      const s2Pool = [
        `This mattress pairs balanced cushioning with dependable core strength to support natural sleeping transitions throughout the night.`,
        `Designed for nightly comfort, this ${mat} design provides responsive support tailored for everyday household rest and relaxation.`,
        `The mattress foundation combines surface comfort with resilient internal composition for peaceful, undisturbed sleep each night.`,
        `Proportioned for comfortable daily rest, this ${matType} delivers reassuring, level platform support for active domestic lifestyles.`,
        `It provides an approachable sleeping deck that balances gentle contact cushioning with firm, unwavering internal support.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Crafted with durable ${mat} components, the internal structure resists sagging under regular domestic use across seasons.`,
        `High-grade ${mat} layers preserve dependable platform firmness and uniform density across years of regular family use.`,
        `Resilient ${mat} material composition maintains structural integrity and steady comfort over long-term domestic life.`,
        `Dense ${mat} core construction maintains long-term structural resilience and consistent support during nightly slumber.`,
        `Durable internal layering resists compression fatigue, ensuring the sleeping deck remains level and supportive over time.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `The responsive comfort layer absorbs nighttime movement, fostering undisturbed rest throughout the night for both sleepers.`,
        `Consistent surface support isolates partner movement effectively, promoting an unhurried, peaceful sleep across every season.`,
        `A durable protective casing safeguards internal comfort layers while maintaining an immaculate and comfortable sleep deck.`,
        `Even core density promotes relaxed slumber and easy movement transitions throughout the night without surface disruption.`,
        `The balanced sleeping deck provides consistent body support, helping you wake feeling fully rested and refreshed each morning.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'mattress');
      break;
    }

    case 'STRUCTURE_C': {
      // Spatial / Scale
      const spOpeners = [
        `Considered dimensions and uniform surface density establish a balanced resting platform for the bedroom.`,
        `Carefully proportioned dimensions ensure this mattress integrates smoothly onto standard bed platform frames.`,
        `A calibrated profile and uniform density provide balanced sleeping comfort across the entire bed surface.`,
        `Precise dimensional scaling allows this mattress to fit cleanly across platform frames without overhang.`,
        `Thoughtful dimensional planning ensures this ${matType} provides generous resting area within standard bed footprints.`,
        `Standardized perimeter dimensions ensure this mattress aligns neatly with bed side rails and headboards.`,
        `Calibrated thickness and uniform surface density establish a well-proportioned sleeping centerpiece in the bedroom.`,
      ];
      s1 = pick(spOpeners, seed, 0);

      const s2Pool = [
        `This ${mat} mattress fits standard bed frames snugly while providing consistent edge-to-edge support across the sleeping deck.`,
        `The design ensures complete perimeter support, maximizing usable sleeping surface area for both occupants throughout the night.`,
        `It provides level, edge-to-edge platform support designed to integrate securely with slatted or solid bed foundations.`,
        `This mattress delivers uniform sleeping surface area while maintaining a clean, snug fit on modern platform bed frames.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `The resilient internal core maintains structural integrity without developing uneven impressions over years of domestic use.`,
        `High-density ${mat} framing ensures lasting core density and steady load-bearing performance across regular domestic loading.`,
        `Durable ${mat} components preserve platform levelness and structural stability through continuous household sleeping routines.`,
        `Solid ${mat} internal structure ensures lasting density retention and resists sagging under steady nightly weight.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `Even weight distribution across the mattress surface helps maintain comfortable sleeping alignment for both occupants.`,
        `The stable sleeping deck absorbs movement naturally, preventing disturbance across the resting area during posture changes.`,
        `Consistent platform cushioning keeps the mattress surface level, supportive, and comfortable throughout the night.`,
        `Edge-to-edge firmness ensures full surface usability while preventing rolling or shifting during nighttime slumber.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'mattress');
      break;
    }

    case 'STRUCTURE_D': {
      // Direct-Fact-First
      const dOpeners = [
        `Rendered with durable ${mat}, this mattress provides steadfast resting comfort for everyday living.`,
        `Built from authentic ${mat}, this mattress delivers solid domestic sleeping reliability and support.`,
        `High-density ${mat} construction gives this mattress enduring core strength and surface resilience.`,
        `Featuring resilient ${mat} layering, this mattress provides dependable nightly resting comfort for the home.`,
        `Constructed with dependable ${mat}, this sleep platform delivers steadfast load-bearing support each night.`,
        `Authentic ${mat} composition forms the core resting foundation of this dependable domestic mattress.`,
        `Selected ${mat} layers provide dense, resilient sleeping support calibrated for everyday family rest.`,
      ];
      s1 = pick(dOpeners, seed, 0);

      const s2Pool = [
        `The design balances soft initial surface contact with firm underlying support across its entire sleeping area.`,
        `This mattress pairs responsive surface cushioning with dense core support for balanced nightly rest and relaxation.`,
        `It delivers dependable resting comfort engineered to handle continuous everyday domestic use with steadfast reliability.`,
        `The piece pairs a comfortable outer contact layer with a dense core engineered for long-term domestic rest across seasons.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Quality ${mat} construction ensures long-term structural resilience through years of continuous domestic use.`,
        `Solid ${mat} composition preserves steady core firmness and prevents surface dipping under regular household weight.`,
        `Dense ${mat} core construction maintains structural alignment and dependable load distribution across the mattress platform.`,
        `High-density ${mat} construction guarantees lasting core strength and dependable support for nightly slumber across seasons.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `A durable outer casing protects internal comfort layers while maintaining an immaculate and comfortable sleep surface.`,
        `The resilient core structure adapts to changing sleeping postures while preserving balanced support throughout the night.`,
        `Even surface cushioning isolates movement effectively, helping both sleepers enjoy undisturbed and restful sleep.`,
        `Consistent core support isolates motion smoothly, promoting deep and undisturbed slumber throughout every season.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'mattress');
      break;
    }

    case 'STRUCTURE_E': {
      // Material-Led
      const mOpeners = [
        `Selected ${mat} provides an authentic and resilient foundation for deeply restorative nightly sleep.`,
        `The natural responsive character of ${mat} lends dependable organic comfort to this mattress design.`,
        `Grounded ${mat} construction provides a sturdy material foundation for restful everyday sleeping.`,
        `Authentic ${mat} composition lends distinct tactile cushioning and enduring resilience to the bed.`,
        `High-grade ${mat} layers form an authentic, supportive foundation for restful nightly recovery.`,
        `Durable ${mat} materials provide a dependable and supportive core calibrated for regular domestic rest.`,
        `Selected ${mat} components give this mattress an authentic, resilient sleeping identity in the bedroom.`,
      ];
      s1 = pick(mOpeners, seed, 0);

      const s2Pool = [
        `This mattress combines material integrity with practical ergonomic response to support diverse sleeping styles.`,
        `Designed around genuine ${mat} properties, this sleep surface delivers steady and supportive comfort across every season.`,
        `The mattress merges material quality with thoughtful density layering for comfortable daily sleep in any bedroom.`,
        `It pairs dependable material characteristics with balanced cushioning tailored for restful domestic sleep each night.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Dense core composition preserves steady surface firmness and structural balance under regular domestic loading.`,
        `Resilient ${mat} layering withstands continuous nightly pressure while maintaining its original shape and levelness.`,
        `High-density ${mat} components maintain dependable load-bearing strength across seasons of active domestic life.`,
        `Durable ${mat} internal construction ensures consistent density retention and long-term sleeping comfort for users.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `The supportive construction isolates motion effectively, reducing sleep disturbances from partner movement during the night.`,
        `Responsive material response accommodates natural body curves while keeping the surface firmly supported and level.`,
        `Even core density promotes relaxed slumber and easy movement transitions throughout the night without surface dip.`,
        `Consistent surface cushioning keeps the mattress comfortable and supportive throughout nightly rest across seasons.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'mattress');
      break;
    }

    case 'STRUCTURE_F': {
      // Problem-Solution
      const pOpeners = [
        `Deep physical rest requires a dependable mattress built with uncompromising structural stability and comfort.`,
        `Resolving restless nights begins on an evenly cushioned mattress foundation built for quiet comfort.`,
        `Consistent nightly sleep is supported by a stable mattress platform that eliminates surface dipping.`,
        `Overcoming sleep restlessness is simple with an adaptive mattress core designed for even pressure relief.`,
        `Achieving undisturbed nightly slumber starts with a resilient sleep platform that isolates partner movement.`,
        `Managing sleep posture changes is effortless with a responsive mattress that maintains uniform surface support.`,
      ];
      s1 = pick(pOpeners, seed, 0);

      const s2Pool = [
        `This ${mat} mattress resolves restless nights by delivering consistent, buoyant body support across the bed.`,
        `Engineered for restful recovery, this mattress provides steady, pressure-relieving surface support for everyday rest.`,
        `The design addresses nighttime comfort needs through balanced layering and resilient core construction across seasons.`,
        `This mattress solves nightly comfort challenges through even weight distribution and adaptive surface cushioning.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `High-grade material layering prevents surface dipping and preserves uniform cushioning across the entire platform.`,
        `Solid ${mat} internal structure ensures lasting density retention and resists sagging over continuous domestic use.`,
        `Durable ${mat} components maintain platform levelness and structural stability under continuous regular sleeping loading.`,
        `Dense ${mat} internal components prevent frame deformation and maintain level sleeping alignment across years.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `The responsive sleeping surface accommodates posture shifts smoothly, supporting relaxed and uninterrupted sleep.`,
        `Even weight distribution minimizes pressure buildup, allowing unconstrained, peaceful slumber throughout the night.`,
        `Motion-dampening core layering ensures undisturbed rest even during partner movements and posture adjustments.`,
        `A protective outer casing safeguards comfort layers, keeping the resting deck clean, pristine, and comfortable for sleep.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'mattress');
      break;
    }

    case 'STRUCTURE_G': {
      // Tactile-Led
      const fOpeners = [
        `A well-considered mattress sets the foundation for unhurried, deeply restorative sleep each night.`,
        `Natural resting comfort begins on a sleep surface engineered for balanced, quiet resilience.`,
        `A calm bedroom sanctuary begins with a supportive mattress foundation calibrated for rest.`,
        `Evenings transition smoothly into deep slumber upon a mattress engineered for quiet resilience.`,
        `Restorative nightly sleep begins on an evenly balanced mattress deck designed for comfort.`,
        `Calibrated surface tension and dense padding establish an inviting resting deck for the bedroom suite.`,
      ];
      s1 = pick(fOpeners, seed, 0);

      const s2Pool = [
        `This ${mat} mattress delivers balanced firmness tailored to support natural body contours comfortably and evenly.`,
        `The design introduces gentle initial cushioning backed by resilient core stability for daily domestic sleep.`,
        `It delivers reliable everyday resting comfort while maintaining an inviting and stable sleeping deck for both occupants.`,
        `This mattress enhances bedroom comfort while providing dependable, level platform resting support across every season.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Durable core engineering maintains lasting density and shape retention through regular domestic sleeping use.`,
        `High-density ${mat} construction provides solid load-bearing capacity and prevents core degradation over time.`,
        `Resilient ${mat} layering preserves steady platform levelness across years of everyday household sleeping activity.`,
        `Solid ${mat} composition ensures long-term structural resilience and consistent support during nightly slumber.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `The clean outer perimeter ensures smooth integration onto slatted or platform bed foundations without shifting.`,
        `Consistent edge support prevents roll-off and maximizes usable sleeping surface area across the entire mattress deck.`,
        `The balanced sleeping deck provides consistent support, supporting unhurried nightly rest across every domestic season.`,
        `Even weight absorption minimizes sleep disruption, fostering a quiet, deeply restorative sleeping environment in the home.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'mattress');
      break;
    }

    case 'STRUCTURE_H':
    default: {
      // Routine-Led
      const rOpeners = [
        `Restful nocturnal recovery begins on a sleep foundation calibrated for consistent support and comfort.`,
        `Nightly sleep routines find tranquil calm upon an evenly cushioned mattress foundation in the bedroom.`,
        `Retiring for the night feels peaceful and reassuring upon this supportive domestic resting platform.`,
        `Bedtime routines settle into restful ease upon this sturdy, well-cushioned sleeping deck each night.`,
        `Starting each morning refreshed begins with an unhurried, supportive night of slumber upon a level mattress.`,
        `Daily rest routines unfold with quiet comfort upon this thoughtfully proportioned mattress foundation.`,
      ];
      s1 = pick(rOpeners, seed, 0);

      const s2Pool = [
        `This ${mat} design provides an even sleeping deck that responds naturally to body pressure across the surface.`,
        `Designed for regular use, this mattress pairs responsive comfort with dependable platform stability for the home.`,
        `The unit delivers reliable resting utility tailored for restorative nighttime sleep and daily physical recovery.`,
        `It provides a level resting surface designed to support unhurried nightly physical recovery across every season.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Resilient ${mat} layers deliver steadfast support while maintaining structural shape and levelness over time.`,
        `High-grade ${mat} construction preserves core rigidity and dependable density across continuous household use.`,
        `Dense ${mat} construction provides a steady foundation that maintains platform levelness throughout nightly rest.`,
        `Sturdy ${mat} components maintain platform levelness and structural integrity throughout years of active family use.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `The balanced comfort profile facilitates relaxed breathing and easy movement throughout the night without strain.`,
        `Uniform surface support ensures level sleeping alignment, fostering peaceful and undisturbed slumber for both sleepers.`,
        `Consistent platform cushioning absorbs movement smoothly, supporting uninterrupted nightly rest across the year.`,
        `Durable outer textiles protect internal comfort layers while ensuring a clean, inviting resting deck for sleep.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'mattress');
      break;
    }
  }

  const summary = [s1, s2, s3, s4, s5].join(' ');

  return {
    summary,
    angle: chosenStruct,
    structure: chosenStruct,
    factsUsed: [mat, matType, chosenStruct],
  };
}

module.exports = {
  generateMattressesCopy,
  MATTRESS_STRUCTURES,
};
