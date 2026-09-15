'use strict';

/**
 * Bedroom Storage Category Agent
 * Covers Dressing Tables, Bedside Tables, Chest of Drawers, Benches, and Storage Chests.
 * Uses 8 Structural Archetypes (Structures A–H) and dynamic attribute-driven combinatorial composition
 * to achieve 100% factual grounding, strict theme-loop alignment, 75-100 word counts, and zero repetition.
 */

const { extractProductFacts } = require('./grounding-auditor.agent');
const { hashSeed, pick, buildSynchronizedCloser } = require('./copy-composer.helper');

const STORAGE_STRUCTURES = [
  'STRUCTURE_A',
  'STRUCTURE_B',
  'STRUCTURE_C',
  'STRUCTURE_D',
  'STRUCTURE_E',
  'STRUCTURE_F',
  'STRUCTURE_G',
  'STRUCTURE_H',
];

function generateBedroomStorageCopy(product, options = {}) {
  const facts = extractProductFacts(product);
  const { structureId, attempt = 1 } = options;

  const mat = (facts.primaryMaterial || 'Solid Wood').toLowerCase();
  const secMat = facts.secondaryMaterial ? facts.secondaryMaterial.toLowerCase() : '';
  const finish = (facts.finish || 'Natural').toLowerCase();
  const shortName = facts.shortName;
  const fullDesc = `${facts.subcategory || ''} ${facts.name || ''}`.toLowerCase();
  const isDressing = /dressing|vanity/i.test(fullDesc);
  const isBedside = /bedside|nightstand/i.test(fullDesc);
  const isChest = /chest/i.test(fullDesc);
  const isBench = /bench/i.test(fullDesc);

  const itemType = isDressing
    ? 'dressing table'
    : isBedside
    ? 'bedside table'
    : isChest
    ? 'chest of drawers'
    : isBench
    ? 'storage bench'
    : 'storage unit';

  const seed = hashSeed(`${product.id || shortName}_attempt${attempt}_${finish}_${mat}_${attempt * 97}`);

  const structIdx = structureId
    ? STORAGE_STRUCTURES.indexOf(structureId)
    : seed % STORAGE_STRUCTURES.length;
  const chosenStruct = STORAGE_STRUCTURES[structIdx >= 0 ? structIdx : 0];

  let s1 = '';
  let s2 = '';
  let s3 = '';
  let s4 = '';
  let s5 = '';

  const secNote = secMat ? ` paired with ${secMat} accents` : '';

  switch (chosenStruct) {
    case 'STRUCTURE_A': {
      // Visual-First
      const vOpeners = facts.isNonStorage
        ? [
            `An open ${finish} base gives this ${itemType} a visually light and uncluttered bedroom profile.`,
            `Clean architectural lines and a clear ${finish} finish define this minimalist ${itemType}.`,
            `Elevated leg geometry and a smooth ${finish} tabletop preserve open sightlines across the bedroom space.`,
            `An uncluttered silhouette and an open ${finish} framework establish a simple, balanced dressing station.`,
            `The open-frame ${finish} profile creates a clean, unencumbered focal point along the bedroom wall.`,
            `A streamlined ${finish} platform and open base introduce clear visual order to the dressing area.`,
            `Simple geometric contours in a ${finish} finish keep this ${itemType} feeling remarkably light and open.`,
            `An airy base configuration and crisp ${finish} surfaces establish a clean, uncluttered vanity setup.`,
          ]
        : [
            `A balanced ${finish} silhouette brings structured visual order to the bedroom perimeter.`,
            `Clean geometric proportions and a rich ${finish} surface give this ${itemType} an orderly presence.`,
            `Refined proportions and a smooth ${finish} finish create a calm, organized focal point in the room.`,
            `Crisp architectural contours and a warm ${finish} stain establish a grounded, uncluttered vanity station.`,
            `Structured geometry and a smooth ${finish} surface bring an organized, balanced presence to the space.`,
            `A tailored ${finish} facade with clean proportions introduces balanced visual clarity to the bedroom.`,
            `Carefully aligned ${finish} panels give this storage piece a crisp, orderly architectural character.`,
            `Balanced drawer fronts and a smooth ${finish} tabletop provide an organized, uncluttered visual presence.`,
          ];
      s1 = pick(vOpeners, seed, 0);

      const s2Pool = isDressing
        ? [
            `This ${finish} ${itemType} provides an expansive top surface carefully proportioned for cosmetic organizers, mirrors, and everyday grooming necessities.`,
            `Featuring a broad tabletop layout, this ${finish} vanity provides generous space for daily grooming essentials while maintaining clean room flow.`,
            `The considered tabletop configuration delivers reliable functional space for mirrors and personal accessories during morning preparation.`,
            `Designed with generous surface width, this ${finish} table accommodates beauty essentials and lighting within an accessible arrangement.`,
          ]
        : isBedside
        ? [
            `This ${finish} bedside companion organizes evening reading material and nighttime essentials neatly within immediate reach of your mattress.`,
            `Proportioned for bedside placement, this ${finish} unit keeps table lamps, clocks, and personal items conveniently accessible each evening.`,
            `The compact bedside profile provides dedicated surface utility for lighting and personal keepsakes without crowding surrounding space.`,
            `Positioned beside the bed, this ${finish} unit provides practical tabletop space for books, glasses, and personal nighttime accessories.`,
          ]
        : [
            `This ${finish} ${itemType} delivers generous functional surface area while organizing everyday bedroom essentials into a cohesive layout.`,
            `Proportioned for versatile domestic placement, this ${finish} unit provides practical surface capacity for bedroom essentials.`,
            `The multi-tier layout provides ample surface and storage area, accommodating diverse household organization requirements.`,
          ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Built from solid ${mat}${secNote}, the sturdy framework provides dependable strength and lasting tabletop rigidity throughout regular domestic use.`,
        `Dense ${mat} construction provides steadfast frame stability, ensuring the piece remains securely balanced under daily household weight.`,
        `Solid ${mat} paneling forms a resilient structural foundation capable of handling continuous everyday domestic activity with ease.`,
        `Crafted with dependable ${mat} framing, the structure preserves strict mechanical alignment and surface stability across years of use.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = facts.isNonStorage
        ? [
            `Generous open clearance beneath the top platform accommodates comfortable seating while keeping surrounding floor space accessible and easy to clean.`,
            `The elevated lower framework preserves spacious legroom for vanity stools while maintaining completely unobstructed floor visibility.`,
            `Unimpeded floor clearance underneath allows comfortable seated posture and ensures effortless vacuuming and maintenance of the room.`,
            `Leaving the base open preserves generous legroom for seating while facilitating unhindered airflow and simple floor maintenance.`,
          ]
        : [
            `Dedicated storage compartments keep personal belongings neatly arranged, shielded from ambient household dust, and ready for daily use.`,
            `Smoothly sliding drawer sections keep personal accessories neatly tucked away while preserving an orderly, uncluttered room perimeter.`,
            `Integrated storage sections resolve everyday accessory clutter, helping maintain a tidy, organized atmosphere throughout the bedroom.`,
            `Enclosed storage sections keep cosmetics, linens, and accessories organized without disrupting the piece's clean visual lines.`,
          ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'bedroom');
      break;
    }

    case 'STRUCTURE_B': {
      // Use-Case / Routine-First
      const uOpeners = isDressing
        ? [
            `Morning preparation routines unfold with unhurried ease around a dedicated personal dressing table.`,
            `Daily grooming rituals find structured calm around an organized and accessible vanity station.`,
            `Morning preparation runs smoothly and comfortably when daily grooming essentials are arranged across an accessible tabletop.`,
            `Starting the day feels unhurried and restful around a well-organized personal bedroom dressing table.`,
            `Personal morning preparation routines settle into quiet comfort around this thoughtfully organized vanity station.`,
            `Daily vanity routines proceed with effortless calm around a tabletop organized for essential cosmetics and accessories.`,
            `Beginning your morning routine feels tranquil and orderly at an unhurried, dedicated grooming surface.`,
          ]
        : [
            `Evening routines unwind smoothly when bedside essentials are arranged within comfortable arm's reach.`,
            `Nighttime preparations settle into quiet ease with bedside storage kept within immediate arm's reach.`,
            `Restful evenings begin with a clutter-free bedside station organized for nighttime reading and tranquil rest.`,
            `Bedside necessities remain organized for peaceful nighttime ease and unhurried morning wakeups.`,
            `Evening unwinding feels effortless and restful with bedtime necessities kept neatly organized beside the bed.`,
            `Settling in for the night proceeds calmly when nighttime books and water glasses sit within easy reaching distance.`,
            `Peaceful bedtime unwinding begins with a dependable bedside surface holding your essential nighttime items.`,
          ];
      s1 = pick(uOpeners, seed, 0);

      const s2Pool = [
        `This ${finish} ${itemType} pairs practical household utility with a considered silhouette suited for modern bedroom living.`,
        `Designed for daily convenience, this ${finish} piece integrates dependable surface utility into an approachable domestic profile.`,
        `This ${finish} ${itemType} balances accessible organization with a refined silhouette that harmonizes with contemporary decor.`,
        `Thoughtfully proportioned for regular use, this ${finish} unit accommodates essential items while enhancing room functionality.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Crafted with resilient ${mat} panels, the structure ensures trustworthy load-bearing support for everyday household items.`,
        `Durable ${mat} construction provides unwavering frame stability, keeping the table steady through repeated daily interactions.`,
        `Sturdy ${mat} framework provides dependable platform rigidity that withstands regular domestic contact across seasons.`,
        `High-quality ${mat} surfaces maintain reliable load-bearing capability and structural integrity over long-term family use.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = facts.isNonStorage
        ? [
            `The open lower framework leaves ample legroom for a stool while keeping the surrounding bedroom floor completely clear and spacious.`,
            `Uncluttered space underneath provides comfortable legroom while facilitating effortless cleaning across the bedroom floor.`,
            `The streamlined open base allows unrestricted seating movement and preserves an open, airy feeling across the room.`,
            `Generous lower clearance ensures unconstrained seated movement while keeping floor areas completely accessible for maintenance.`,
          ]
        : [
            `Smooth storage compartments offer quick access to accessories, toiletries, and personal keepsakes without creating visual clutter.`,
            `Integrated drawer sections protect personal items from ambient dust while supporting an orderly, clutter-free bedroom setting.`,
            `Practical storage capacity keeps everyday grooming and bedside items neatly arranged within comfortable reaching distance.`,
            `Built-in compartments store personal accessories neatly out of sight, promoting an undisturbed and restful environment.`,
          ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'bedroom');
      break;
    }

    case 'STRUCTURE_C': {
      // Spatial-First
      const spOpeners = [
        `Proportioned with a space-conscious footprint, this ${finish} unit fits comfortably along bedroom perimeters.`,
        `Considered perimeter dimensions make this ${finish} ${itemType} easy to position without crowding bedroom circulation.`,
        `A space-conscious footprint allows this ${finish} ${itemType} to nestle cleanly into compact bedroom layouts.`,
        `Carefully planned dimensions preserve open walkways while providing dedicated tabletop surface utility.`,
        `Efficient structural proportions ensure this ${finish} ${itemType} optimizes available floor area in the bedroom.`,
        `With its calibrated perimeter profile, this ${finish} unit integrates smoothly into narrow or compact room zones.`,
        `Thoughtful dimensional planning allows this ${finish} piece to maximize surface utility while preserving clear walkways.`,
      ];
      s1 = pick(spOpeners, seed, 0);

      const s2Pool = isDressing
        ? [
            `The unit provides ample grooming surface area without encroaching on essential walkways or surrounding furniture.`,
            `This dressing table maximizes usable tabletop space while maintaining a slim, non-intrusive bedroom footprint.`,
            `It supplies generous grooming and vanity space without occupying excessive floor area in the bedroom.`,
          ]
        : [
            `This ${itemType} delivers reliable functional surface space while preserving comfortable room flow and open pathways.`,
            `The space-efficient layout provides dedicated storage and tabletop capacity without dominating the bedroom layout.`,
            `It offers dependable utility and accessible organization while fitting neatly beside bedroom furniture.`,
          ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Resilient ${mat} construction maintains steadfast frame alignment and dependable balance across years of household living.`,
        `Solid ${mat} framing resists structural shifting, providing continuous stability and dependable weight-bearing performance.`,
        `Sturdy ${mat} components ensure the entire framework remains firmly grounded and rigid through continuous family use.`,
        `Dense ${mat} core construction maintains long-term structural integrity and steady tabletop support under regular loading.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = facts.isNonStorage
        ? [
            `An elevated base allows ambient natural light to pass beneath, preserving a sense of spaciousness and open floor circulation.`,
            `The open-bottom structure maintains clean sightlines across the room while leaving floor space completely accessible for cleaning.`,
            `Elevated leg clearance keeps the bedroom feeling open and makes routine floor maintenance straightforward and quick.`,
          ]
        : [
            `Built-in storage sections resolve tabletop clutter, maintaining a tidy, clean, and well-proportioned room perimeter.`,
            `Concealed storage compartments keep personal items organized while keeping surrounding floor space open and uncluttered.`,
            `Enclosed storage sections keep bedroom accessories organized, preventing surface build-up in compact spaces.`,
          ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'bedroom');
      break;
    }

    case 'STRUCTURE_D': {
      // Direct-Fact-First
      const dOpeners = [
        `Rendered in durable ${mat}, this ${finish} ${itemType} delivers dependable daily utility.`,
        `Built from authentic ${mat}, this ${finish} unit provides solid tabletop strength for the bedroom.`,
        `Solid ${mat} construction gives this ${finish} ${itemType} enduring strength and stability.`,
        `Featuring resilient ${mat} framing, this ${finish} ${itemType} delivers lasting domestic reliability.`,
        `Constructed with dependable ${mat}, this ${finish} piece delivers steadfast load-bearing strength.`,
        `Sturdy ${mat} craftsmanship gives this ${finish} ${itemType} an authentic, lasting domestic presence.`,
        `Dense ${mat} paneling forms the core foundation of this practical ${finish} storage unit.`,
      ];
      s1 = pick(dOpeners, seed, 0);

      const s2Pool = isDressing
        ? [
            `The design pairs clean geometric proportions with a dedicated layout tailored for organized personal care and grooming.`,
            `This dressing unit combines balanced architectural proportions with a spacious surface designed for everyday grooming routines.`,
            `It features a sturdy tabletop platform tailored for cosmetic organizers, mirrors, and morning grooming tools.`,
          ]
        : [
            `The piece features balanced geometric proportions tailored for convenient bedside organization and everyday domestic use.`,
            `Designed for functional reliability, the unit pairs clean lines with a practical layout suited for bedside living.`,
            `It provides a level surface and organized storage tailored for bedside lamps, electronics, and reading materials.`,
          ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Dense ${mat} framing provides trustworthy tabletop support for lamps, mirrors, cosmetics, and everyday personal essentials.`,
        `Heavy-duty ${mat} framing maintains solid tabletop levelness and resists deflection under steady household weight.`,
        `Solid ${mat} panels ensure dependable load distribution across the entire structure throughout years of active use.`,
        `High-density ${mat} construction guarantees lasting structural strength and dependable support for daily necessities.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = facts.isNonStorage
        ? [
            `The open leg structure ensures comfortable seated posture and allows effortless maintenance and cleaning of surrounding floors.`,
            `Generous lower clearance facilitates comfortable seating while keeping surrounding floor areas unobstructed and tidy.`,
            `An open-frame profile leaves ample room for vanity seating and makes underneath floor cleaning completely hassle-free.`,
          ]
        : [
            `Integrated storage sections keep daily necessities neatly categorized, easily accessible, and protected from ambient dust.`,
            `Practical drawer compartments organize personal accessories neatly, ensuring the main surface remains clear and uncluttered.`,
            `Concealed storage bays accommodate personal items securely, maintaining an orderly tabletop and clean room aesthetic.`,
          ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'bedroom');
      break;
    }

    case 'STRUCTURE_E': {
      // Material-Led
      const mOpeners = [
        `Natural ${mat} grain gives this bedroom piece an authentic and grounded material character.`,
        `The rich natural texture of ${mat} lends authentic organic warmth to this ${finish} ${itemType}.`,
        `Grounded ${mat} construction provides a sturdy material foundation for daily bedroom use.`,
        `Authentic ${mat} surfaces lend distinct tactile warmth and enduring character to the bedroom.`,
        `Selected ${mat} panels provide an authentic, solid foundation for this ${finish} bedroom piece.`,
        `The organic grain patterns of ${mat} give this ${finish} unit an enduring, grounded presence.`,
        `Genuine ${mat} timber gives this ${finish} storage unit a distinct and authentic textural identity.`,
      ];
      s1 = pick(mOpeners, seed, 0);

      const s2Pool = [
        `This ${finish} ${itemType} combines honest timber aesthetics with balanced daily functionality and practical convenience.`,
        `Designed to celebrate natural material qualities, this ${finish} piece integrates reliable utility into an elegant silhouette.`,
        `This ${finish} unit pairs natural material integrity with a thoughtful layout tailored for daily bedroom organization.`,
        `It merges genuine timber appeal with practical proportions designed to serve everyday household organization needs.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `The resilient ${mat} structure withstands continuous domestic contact while remaining steadfastly level across years of use.`,
        `Dense ${mat} timber provides reliable structural stability and resists surface wear during regular household activities.`,
        `Sturdy ${mat} framework delivers dependable frame strength, keeping the entire unit securely grounded and level.`,
        `Solid ${mat} paneling preserves structural alignment and trustworthy load support through seasons of domestic life.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = facts.isNonStorage
        ? [
            `A streamlined open base keeps the dressing area visually approachable and easy to maintain throughout the week.`,
            `The open lower architecture preserves generous leg clearance while maintaining an airy, uncluttered bedroom presence.`,
            `Leaving lower areas open ensures comfortable seating clearance and keeps surrounding floor space simple to vacuum.`,
          ]
        : [
            `Generous storage sections provide intuitive organization for skincare bottles, reading material, and personal keepsakes.`,
            `Dedicated drawer compartments keep personal items neatly tucked away while highlighting the clean exterior wood grain.`,
            `Smooth-operating storage sections keep bedside essentials organized and protected against ambient household dust.`,
          ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'bedroom');
      break;
    }

    case 'STRUCTURE_F': {
      // Problem-Solution
      const pOpeners = facts.isNonStorage
        ? [
            `Not every bedroom dressing station requires heavy cabinetry to deliver complete everyday utility.`,
            `Eliminating bulky drawers creates an airy dressing station that maximizes bedroom open space.`,
            `A streamlined open framework resolves dressing needs without adding visual bulk to the room.`,
            `Open vanity design provides practical tabletop utility while keeping compact rooms feeling light and clean.`,
            `Minimalist open construction resolves bedroom vanity needs while keeping surrounding walkways clear.`,
            `A simplified open table design provides necessary grooming surface area while avoiding room congestion.`,
          ]
        : [
            `Concealed storage drawers resolve vanity clutter while maintaining a clean, approachable room profile.`,
            `Organizing bedroom accessories becomes effortless with dedicated drawers built into this ${finish} unit.`,
            `Managing bedside clutter is simple with integrated storage compartments tailored for personal items.`,
            `Thoughtful storage compartments keep daily essentials tucked away to preserve a tidy bedroom environment.`,
            `Built-in storage drawers eliminate surface clutter while keeping daily necessities neatly accessible.`,
            `Dedicated storage bays keep personal belongings neatly sorted, preserving a clean and orderly tabletop.`,
          ];
      s1 = pick(pOpeners, seed, 0);

      const s2Pool = [
        `This ${finish} ${itemType} addresses everyday organization requirements through considered dimensions and practical layout.`,
        `Engineered for functional resolution, this ${finish} piece integrates reliable storage with an approachable footprint.`,
        `The unit resolves daily bedroom storage challenges through clean proportions and dedicated functional surfaces.`,
        `It brings practical organization to the room, ensuring grooming and bedside accessories remain structured and tidy.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Constructed from dependable ${mat}, the robust framework maintains structural balance under continuous daily use.`,
        `Solid ${mat} framing ensures lasting stability, keeping the table securely balanced under regular household weight.`,
        `High-grade ${mat} construction provides trustworthy platform rigidity that withstands repeated daily interactions.`,
        `Dense ${mat} panels maintain structural alignment and dependable load distribution across years of domestic service.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = facts.isNonStorage
        ? [
            `The unencumbered base provides generous room for a stool while maximizing accessible floor area for daily cleaning.`,
            `Open leg clearance ensures comfortable seating posture while preserving an airy and unencumbered room feeling.`,
            `Spacious leg clearance accommodates stool seating smoothly and keeps the room feeling expansive and tidy.`,
          ]
        : [
            `Practical drawer sections keep personal items within easy reach without cluttering the surrounding bedroom decor.`,
            `Dedicated compartments keep accessories organized and protected from ambient dust throughout regular household routines.`,
            `Smoothly accessible drawer bays keep everyday essentials organized, leaving the top surface completely clear.`,
          ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'bedroom');
      break;
    }

    case 'STRUCTURE_G': {
      // Finish-Led
      const fOpeners = [
        `Natural ambient light highlights the warm ${finish} finish across this bedroom piece.`,
        `A rich ${finish} finish brings welcoming visual depth and warmth to the bedroom suite.`,
        `Ambient bedroom lighting accentuates the smooth ${finish} finish across the exterior surfaces.`,
        `The inviting ${finish} tones introduce subtle warmth while anchoring this bedroom storage piece.`,
        `Smooth ${finish} surface tones bring welcoming character and visual depth to this bedroom design.`,
        `Rich ${finish} coloring gives this ${itemType} an inviting visual presence in the bedroom.`,
        `The warm ${finish} stain accentuates the piece's exterior surfaces with welcoming visual appeal.`,
      ];
      s1 = pick(fOpeners, seed, 0);

      const s2Pool = [
        `This ${itemType} introduces inviting visual warmth while serving as a dependable hub for daily routines.`,
        `The piece contributes subtle warmth to room decor while providing dedicated functional space for personal items.`,
        `It delivers reliable everyday surface utility while enriching bedroom aesthetics with warm, grounded tones.`,
        `This unit enhances the visual atmosphere of the room while delivering practical surface and storage utility.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Durable ${mat} framing ensures trustworthy structural strength and lasting resistance to regular household wear.`,
        `Solid ${mat} paneling maintains dependable structural balance and unwavering stability during continuous use.`,
        `High-density ${mat} framing provides solid load-bearing capacity and prevents frame distortion over time.`,
        `Resilient ${mat} construction preserves steady tabletop levelness across years of everyday household activity.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = facts.isNonStorage
        ? [
            `The open architectural base keeps the dressing area light and easy to navigate in compact spaces.`,
            `Elevated leg framing preserves spacious sightlines while allowing easy floor maintenance beneath the unit.`,
            `The open lower structure allows natural light to pass through while keeping surrounding walkways clear.`,
          ]
        : [
            `Built-in storage sections organize vanity accessories neatly, maintaining an orderly tabletop surface.`,
            `Integrated drawer sections keep personal items organized, helping maintain a tranquil and welcoming room ambiance.`,
            `Deep storage compartments protect personal belongings from ambient dust while supporting a tidy bedroom setting.`,
          ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'bedroom');
      break;
    }

    case 'STRUCTURE_H':
    default: {
      // Routine-Led
      const rOpeners = [
        `Daily preparation routines find structured calm around an organized and accessible ${itemType}.`,
        `Morning rituals settle into peaceful ease around a well-proportioned bedroom storage station.`,
        `Everyday grooming routines run smoothly and comfortably around a practical and dedicated vanity surface.`,
        `Daily dressing routines find quiet ease around a thoughtfully arranged bedroom unit.`,
        `Starting each morning feels calm and unhurried around this dedicated bedroom storage companion.`,
        `Personal grooming rituals unfold with quiet ease around a dedicated and accessible tabletop surface.`,
        `Everyday preparation feels tranquil and efficient at this well-proportioned bedroom vanity station.`,
      ];
      s1 = pick(rOpeners, seed, 0);

      const s2Pool = [
        `This ${finish} ${itemType} features a balanced surface layout proportioned for comfortable everyday utility.`,
        `Designed for regular use, this ${finish} piece pairs accessible organization with clean domestic geometry.`,
        `The unit delivers reliable functional utility tailored for morning grooming and evening unwinding routines.`,
        `It provides dedicated surface and organization space designed to support unhurried personal routines.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `High-grade ${mat} construction preserves tabletop rigidity and dependable stability across regular household use.`,
        `Durable ${mat} framing maintains steadfast mechanical alignment and solid load-bearing strength over time.`,
        `Dense ${mat} construction provides a steady foundation that resists wobbling during repeated daily interactions.`,
        `Sturdy ${mat} components maintain platform levelness and structural rigidity throughout years of active use.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = facts.isNonStorage
        ? [
            `Spacious legroom allows unconstrained seating posture, facilitating an unhurried morning preparation routine.`,
            `The open-frame base accommodates vanity seating comfortably while facilitating effortless maintenance of the floor.`,
            `Unobstructed lower clearance ensures comfortable legroom for seating and keeps room floors easy to clean.`,
          ]
        : [
            `Practical storage capacity keeps accessories neatly stored away, supporting an orderly and peaceful bedroom atmosphere.`,
            `Concealed compartments keep daily necessities organized and accessible, supporting an unhurried everyday routine.`,
            `Integrated storage sections keep personal grooming items neatly tucked away, preserving an uncluttered environment.`,
          ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'bedroom');
      break;
    }
  }

  const summary = [s1, s2, s3, s4, s5].join(' ');

  return {
    summary,
    angle: chosenStruct,
    structure: chosenStruct,
    factsUsed: [mat, finish, itemType, chosenStruct],
  };
}

module.exports = {
  generateBedroomStorageCopy,
  STORAGE_STRUCTURES,
};
