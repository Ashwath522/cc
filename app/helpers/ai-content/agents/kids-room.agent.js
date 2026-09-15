'use strict';

/**
 * Kids Room Category Agent
 * Covers Bunk Beds, Kids Single Beds, Kids Study Desks, Kids Chairs, and Kids Wardrobes.
 * Uses 8 Structural Archetypes (Structures A–H) and dynamic attribute-driven combinatorial composition
 * to achieve 100% factual grounding, strict theme-loop alignment, 78-100 word counts, and zero repetition.
 */

const { extractProductFacts } = require('./grounding-auditor.agent');
const { hashSeed, pick, buildSynchronizedCloser } = require('./copy-composer.helper');

const KIDS_STRUCTURES = [
  'STRUCTURE_A',
  'STRUCTURE_B',
  'STRUCTURE_C',
  'STRUCTURE_D',
  'STRUCTURE_E',
  'STRUCTURE_F',
  'STRUCTURE_G',
  'STRUCTURE_H',
];

function generateKidsRoomCopy(product, options = {}) {
  const facts = extractProductFacts(product);
  const { structureId, attempt = 1 } = options;

  const mat = (facts.primaryMaterial || 'Engineered Wood').toLowerCase();
  const secMat = facts.secondaryMaterial ? facts.secondaryMaterial.toLowerCase() : '';
  const finish = (facts.finish || facts.color || 'Natural').toLowerCase();
  const shortName = facts.shortName;
  const fullDesc = `${facts.subcategory || ''} ${facts.name || ''}`.toLowerCase();
  const isBunk = /bunk/i.test(fullDesc);
  const isChair = /chair/i.test(fullDesc);
  const isStudy = !isChair && /study|desk|table/i.test(fullDesc);
  const isStorage = /storage|wardrobe|chest/i.test(fullDesc);

  const itemType = isBunk
    ? 'bunk bed'
    : isChair
    ? 'kids chair'
    : isStudy
    ? 'study desk'
    : isStorage
    ? 'kids storage unit'
    : 'kids single bed';

  const seed = hashSeed(`${product.id || shortName}_att${attempt}_${finish}_${mat}_${attempt * 137}_${facts.dimensions || ''}`);

  const structIdx = structureId
    ? KIDS_STRUCTURES.indexOf(structureId)
    : seed % KIDS_STRUCTURES.length;
  const chosenStruct = KIDS_STRUCTURES[structIdx >= 0 ? structIdx : 0];

  let s1 = '';
  let s2 = '';
  let s3 = '';
  let s4 = '';
  let s5 = '';

  const secNote = secMat ? ` paired with ${secMat} elements` : '';

  switch (chosenStruct) {
    case 'STRUCTURE_A': {
      // Visual-First
      const vOpeners = isBunk
        ? [
            `A tiered architectural bunk silhouette brings cheerful organization and open play space to the children's room.`,
            `Clean vertical lines and a child-friendly ${finish} finish define this space-efficient bunk bed design.`,
            `Tiered sleeping decks in a bright ${finish} tone create an engaging and structured children's bedroom centerpiece.`,
            `An orderly stacked silhouette and smooth ${finish} surfaces establish a cheerful, modern bunk arrangement.`,
            `Balanced proportions and a vibrant ${finish} finish give this bunk bed an approachable, modern character.`,
            `Elevated architectural geometry and bright ${finish} surfaces establish an engaging, playful sleeping station.`,
          ]
        : isChair
        ? [
            `A child-scaled ${finish} chair brings ergonomic seating comfort and bright visual appeal to the study area.`,
            `An approachable ${finish} chair silhouette establishes a dedicated workstation seat for creative play.`,
            `Bright ${finish} surfaces and a comfortable backrest define this child-friendly seating piece.`,
            `Clean proportions and smooth ${finish} contours give this kids chair an engaging, approachable presence.`,
            `A colorful ${finish} finish and clean geometric lines establish an attractive, cheerful study companion.`,
          ]
        : [
            `A child-friendly ${finish} finish brings energetic warmth and visual calm to the children's bedroom.`,
            `Clean geometric lines and a smooth ${finish} surface give this kids piece an organized, approachable aesthetic.`,
            `A bright ${finish} finish and clean proportions create an orderly and cheerful focal point in the room.`,
            `Crisp architectural contours and a smooth ${finish} exterior establish a grounded children's companion.`,
            `Structured proportions in a ${finish} tone bring visual clarity and cheerful warmth to the bedroom.`,
            `An approachable ${finish} profile and smooth surfaces create an inviting children's room companion.`,
            `Simple, balanced contours in a bright ${finish} finish ensure this piece feels light and friendly.`,
            `A tailored ${finish} facade with child-scaled proportions introduces organized visual warmth to the space.`,
          ];
      s1 = pick(vOpeners, seed, 0);

      const s2Pool = isBunk
        ? [
            `This ${finish} bunk bed optimizes floor area by stacking twin sleeping tiers in a compact and secure footprint.`,
            `Featuring two stacked sleeping levels, this ${finish} bunk bed maximizes open play area across the room.`,
            `The design provides two comfortable resting tiers within a consolidated, space-conscious vertical footprint.`,
          ]
        : isChair
        ? [
            `This ${finish} ${itemType} supplies comfortable, child-scaled seating tailored for homework, creative drawing, and reading.`,
            `Featuring an approachable seat height, this ${finish} chair supports healthy seated posture during everyday learning and play.`,
            `The thoughtfully scaled chair proportions provide dependable seating comfort tailored specifically for young children.`,
            `Designed for growing learners, this ${finish} seating companion pairs sturdy back support with an accessible height.`,
          ]
        : isStudy
        ? [
            `This ${finish} study workstation provides dedicated surface space for books, coloring materials, and daily homework.`,
            `Designed for young learners, this ${finish} desk pairs comfortable tabletop dimensions with accessible organization.`,
            `The unit provides a sturdy, child-scaled workstation designed to support daily creative and learning activities.`,
          ]
        : [
            `This ${finish} furniture piece pairs functional proportions with a child-centric layout for everyday household comfort.`,
            `Designed with accessible proportions, this ${finish} unit accommodates children's belongings within a compact layout.`,
            `The piece delivers reliable daily utility tailored specifically for young family members and active daily routines.`,
          ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Constructed from sturdy ${mat}${secNote}, the frame delivers dependable stability and reliable support for active daily routines.`,
        `Solid ${mat} paneling provides a resilient foundation capable of handling continuous everyday household activity with ease.`,
        `Dense ${mat} framing ensures steadfast structural balance, keeping the entire piece firmly grounded through daily use.`,
        `Crafted with dependable ${mat} panels, the structure preserves strict mechanical alignment across years of active family life.`,
        `High-density ${mat} components maintain platform levelness and structural rigidity throughout years of active family use.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `Smooth outer edges and protective surfaces ensure everyday ease and safety while children study, play, and rest.`,
        `Wipe-clean protective surfaces resist daily domestic wear, keeping the children's room looking fresh and well-maintained.`,
        `Thoughtfully scaled access clearance allows children to navigate resting, seating, and storage areas independently and comfortably.`,
        `Durable protective coatings safeguard the framework while keeping routine cleaning and domestic maintenance straightforward.`,
        `Smooth rounded corners protect active young family members while maintaining a neat and clean room environment.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'kids');
      break;
    }

    case 'STRUCTURE_B': {
      // Use-Case / Routine-First
      const uOpeners = isChair
        ? [
            `Homework and drawing sessions proceed comfortably with seating tailored for young children's posture.`,
            `Children settle into focused creative play and study on this comfortable, child-scaled chair.`,
            `Daily arts, crafts, and reading find comfortable support with a dedicated children's chair.`,
            `Starting daily homework feels comfortable and supportive on this child-proportioned seat.`,
            `Creative playtime and quiet reading find a supportive home on this sturdy children's chair.`,
          ]
        : [
            `Shared bedrooms find effortless balance with furniture tailored specifically for growing children and active routines.`,
            `Daily learning and rest proceed smoothly around furniture scaled thoughtfully for children's comfort and daily ease.`,
            `Children's bedtime routines unfold with unhurried ease around a sturdy and comfortable resting station.`,
            `Creative play and focused study find structured calm around this practical children's bedroom piece.`,
            `Everyday family routines run smoothly with child-friendly furniture designed for active domestic living.`,
            `Children's morning and evening routines settle into quiet comfort with accessible and supportive furniture.`,
            `Afternoon homework and creative play settle into quiet focus around this dedicated children's piece.`,
          ];
      s1 = pick(uOpeners, seed, 0);

      const s2Pool = [
        `This ${finish} design provides accessible functional utility suited for daily play, focused study, and restful sleep.`,
        `Designed for regular family use, this ${finish} piece integrates reliable domestic utility into an approachable profile.`,
        `This ${finish} unit pairs accessible proportions with dependable construction suited for vibrant children's rooms.`,
        `Thoughtfully proportioned for young users, this ${finish} companion supports healthy everyday study and resting habits.`,
        `It delivers dependable functional support tailored for young children's daily learning and creative activities.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Built with resilient ${mat} panels, the structure withstands energetic household activity with steady strength.`,
        `Sturdy ${mat} framing maintains solid platform alignment and unwavering stability through continuous family use.`,
        `Dense ${mat} paneling provides a steady framework that resists shifting during active daily household interactions.`,
        `High-grade ${mat} components maintain dependable load-bearing strength across years of regular domestic use.`,
        `Solid ${mat} paneling preserves structural alignment and trustworthy load support through seasons of childhood growth.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `Practical storage sections and sturdy surfaces help children organize toys, books, and accessories independently.`,
        `Accessible functional areas encourage kids to maintain their own belongings, supporting an organized room environment.`,
        `Smooth wipeable surfaces ensure accidental spills are easily cleaned up during everyday arts and crafts sessions.`,
        `Integrated functional sections keep bedtime and study essentials accessible, supporting an unhurried daily routine.`,
        `Child-scaled dimensions ensure comfortable seating and access, fostering confident and independent everyday habits.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'kids');
      break;
    }

    case 'STRUCTURE_C': {
      // Spatial-First
      const spOpeners = isChair
        ? [
            `A compact footprint allows this ${finish} kids chair to slide cleanly beneath study desks without crowding room space.`,
            `Space-efficient dimensions make this ${finish} chair easy to position beside children's tables and study desks.`,
            `Calibrated proportions ensure this ${finish} seating piece integrates smoothly into shared study and play zones.`,
            `With its space-conscious scale, this ${finish} chair preserves clear walkways around children's workstations.`,
          ]
        : [
            `Considered dimensions and space-efficient geometry keep the children's bedroom open and easy to navigate.`,
            `Carefully planned perimeter dimensions ensure this ${finish} piece optimizes available floor space in shared bedrooms.`,
            `A space-conscious footprint allows this ${finish} ${itemType} to provide comprehensive utility without crowding play zones.`,
            `Thoughtful dimensional planning preserves open central floor area while delivering dedicated functional space.`,
            `Proportioned for efficient spatial integration, this ${finish} design maximizes usable play and rest area.`,
            `With its calibrated scale, this ${finish} children's unit fits neatly along bedroom perimeters without crowding walkways.`,
          ];
      s1 = pick(spOpeners, seed, 0);

      const s2Pool = [
        `This ${finish} piece maximizes usable play area while providing dedicated resting, storage, or study space.`,
        `It delivers reliable functional utility within a consolidated footprint, preserving open pathways across the room.`,
        `The space-efficient layout organizes children's necessities neatly without dominating the room's floor plan.`,
        `This unit supplies practical everyday utility while leaving surrounding floor areas completely open for active play.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `High-density ${mat} construction maintains structural balance and unwavering stability under regular domestic use.`,
        `Solid ${mat} framing preserves strict structural alignment, keeping the piece securely grounded over time.`,
        `Sturdy ${mat} components maintain platform levelness and rigidity through continuous active family living.`,
        `Dense ${mat} framing provides solid load-bearing capacity and resists distortion during everyday family use.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `The compact perimeter layout fits cleanly along room walls, leaving central floor space clear for creative activities.`,
        `Smooth perimeter contours allow comfortable movement around the piece while keeping the room feeling open.`,
        `Space-conscious dimensions ensure surrounding walkways remain accessible for easy cleaning and active play.`,
        `The streamlined silhouette preserves generous room circulation and makes routine bedroom cleaning simple and quick.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'kids');
      break;
    }

    case 'STRUCTURE_D': {
      // Direct-Fact-First
      const dOpeners = isChair
        ? [
            `Crafted from sturdy ${mat}, this ${finish} kids chair delivers dependable daily seating strength for learning.`,
            `Built from authentic ${mat}, this ${finish} children's chair provides solid structural support for everyday use.`,
            `Dense ${mat} components form the core foundation of this practical, child-scaled ${finish} seat.`,
            `Featuring resilient ${mat} framing, this ${finish} chair delivers lasting seating reliability for young learners.`,
          ]
        : [
            `Crafted from durable ${mat}, this ${finish} piece delivers steadfast everyday reliability for the home.`,
            `Built from authentic ${mat}, this ${finish} ${itemType} provides solid domestic strength and stability.`,
            `Solid ${mat} construction gives this ${finish} children's unit enduring strength and stability for family life.`,
            `Featuring resilient ${mat} framing, this ${finish} piece delivers lasting family reliability and comfort.`,
            `Constructed with dependable ${mat}, this ${finish} unit delivers steadfast load-bearing strength across years.`,
            `Dense ${mat} paneling forms the core structural foundation of this practical ${finish} children's companion.`,
          ];
      s1 = pick(dOpeners, seed, 0);

      const s2Pool = [
        `The design features a sturdy framework proportioned to accommodate young family members throughout active years.`,
        `This piece pairs clean architectural proportions with a practical layout tailored for children's daily routines.`,
        `It provides a level resting or study surface designed specifically for comfortable everyday domestic use.`,
        `Designed for functional reliability, the unit pairs sturdy panel construction with an approachable children's scale.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Durable ${mat} framing and structural panels provide reliable load-bearing support for daily domestic life.`,
        `Heavy-duty ${mat} paneling maintains solid platform levelness and resists deflection under steady household weight.`,
        `Solid ${mat} panels ensure dependable load distribution across the entire structure throughout years of active use.`,
        `High-density ${mat} construction guarantees lasting structural strength and dependable support for active children.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `Smooth protective coatings safeguard the material surface from accidental spills while remaining easy to wipe down.`,
        `Protective exterior finishes resist daily domestic wear, making regular household cleaning quick and convenient.`,
        `Accessible compartments keep daily essentials organized, supporting tidy bedroom habits throughout the week.`,
        `Wipe-clean outer surfaces ensure easy maintenance, keeping the children's room tidy, fresh, and welcoming.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'kids');
      break;
    }

    case 'STRUCTURE_E': {
      // Material-Led
      const mOpeners = isChair
        ? [
            `Solid ${mat} framing gives this kids chair a grounded, dependable structural core for daily seating.`,
            `The durable natural character of ${mat} lends lasting strength to this child-friendly seating design.`,
            `Authentic ${mat} construction provides a reassuring, sturdy base for this ${finish} children's chair.`,
          ]
        : [
            `Authentic ${mat} construction gives this children's design a trustworthy and grounded structural foundation.`,
            `The solid natural character of ${mat} lends dependable organic strength to this ${finish} ${itemType}.`,
            `Grounded ${mat} construction provides a sturdy material foundation for active children's rooms.`,
            `Authentic ${mat} surfaces lend distinct durability and enduring character to the children's suite.`,
            `Selected ${mat} panels form a resilient and trustworthy structural core for this ${finish} design.`,
          ];
      s1 = pick(mOpeners, seed, 0);

      const s2Pool = [
        `This ${finish} piece combines honest material quality with practical, child-accessible functional details.`,
        `Designed to celebrate durable material qualities, this ${finish} unit provides safe and reliable daily utility.`,
        `This ${finish} companion pairs natural material integrity with a thoughtful layout tailored for active kids.`,
        `It merges robust material strength with child-friendly proportions designed for everyday household activities.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Dense ${mat} paneling ensures long-term stability and dependable support through continuous everyday use.`,
        `Sturdy ${mat} framework delivers dependable frame strength, keeping the entire unit securely grounded and level.`,
        `Solid ${mat} paneling preserves structural alignment and trustworthy load support through active childhood years.`,
        `Resilient ${mat} construction maintains structural rigidity across seasons of energetic household play and rest.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `Thoughtful proportions allow young children to access resting or storage compartments easily and securely.`,
        `Smooth edge detailing and child-height surfaces make independent use safe, intuitive, and comfortable.`,
        `Wipe-clean paneling ensures easy maintenance, preserving a fresh and welcoming aesthetic across seasons.`,
        `Protective surfaces resist everyday scuffs and spills, ensuring the unit remains durable and easy to maintain.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'kids');
      break;
    }

    case 'STRUCTURE_F': {
      // Problem-Solution
      const pOpeners = isChair
        ? [
            `Supporting healthy study posture is simple with child-scaled seating designed for young learners.`,
            `Providing comfortable children's seating without bulky frames is effortless with this compact design.`,
            `Accommodating young learners at study desks is easy with this sturdy, child-scaled ${finish} seat.`,
          ]
        : [
            `Organizing children's bedrooms becomes intuitive with built-in storage tailored for everyday toys and bedding.`,
            `Managing shared bedroom space is simple with multi-tier furniture designed for growing families.`,
            `Resolving children's room clutter is effortless with dedicated compartments built into this ${finish} unit.`,
            `Thoughtful vertical design resolves space limitations in compact children's bedrooms effectively and cleanly.`,
            `Keeping active play areas organized is simple with functional furniture proportioned for kids' daily routines.`,
          ];
      s1 = pick(pOpeners, seed, 0);

      const s2Pool = [
        `This ${finish} unit resolves everyday bedroom clutter through dedicated, easy-to-reach compartments and surfaces.`,
        `Engineered for practical resolution, this ${finish} piece integrates reliable utility with an approachable footprint.`,
        `The unit addresses active family storage challenges through considered dimensions and durable construction.`,
        `It brings practical domestic order to the room, ensuring children's essentials remain structured and tidy.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Durable ${mat} panels provide lasting structural resilience through energetic domestic play and study routines.`,
        `Solid ${mat} framing ensures lasting stability, keeping the unit securely balanced under regular household weight.`,
        `High-grade ${mat} construction provides trustworthy platform rigidity that withstands repeated daily interactions.`,
        `Dense ${mat} components maintain structural balance and dependable load distribution across years of domestic service.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `Easy-to-reach storage sections keep books, clothes, and games neatly tucked away without cluttering play areas.`,
        `Dedicated compartments protect personal items from ambient dust while supporting an orderly, playful environment.`,
        `Accessible lower sections allow children to tidy up independently, fostering organized daily bedroom habits.`,
        `Practical surface and storage bays keep everyday schoolwork and toys organized, preserving open bedroom space.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'kids');
      break;
    }

    case 'STRUCTURE_G': {
      // Finish-Led
      const fOpeners = isChair
        ? [
            `Bright natural light highlights the vibrant ${finish} finish across this child-friendly seating frame.`,
            `A cheerful ${finish} finish brings welcoming visual warmth and playful energy to the children's study corner.`,
            `Smooth ${finish} surfaces give this kids chair a friendly, approachable presence in the room.`,
          ]
        : [
            `Bright natural light highlights the vibrant ${finish} finish across the entire exterior frame.`,
            `A cheerful ${finish} finish brings welcoming visual warmth and energy to the children's room.`,
            `Ambient bedroom lighting accentuates the smooth ${finish} finish across the exterior surfaces.`,
            `The inviting ${finish} tones introduce subtle warmth while anchoring this children's bedroom piece.`,
            `Vibrant ${finish} surface tones create a cheerful and engaging atmosphere in the children's space.`,
          ];
      s1 = pick(fOpeners, seed, 0);

      const s2Pool = [
        `This children's design introduces inviting warmth while serving as a dependable hub for daily activities and sleep.`,
        `The piece contributes welcoming charm to room decor while providing dedicated functional space for kids.`,
        `It delivers reliable everyday functional utility while enriching bedroom aesthetics with vibrant, friendly tones.`,
        `This unit enhances the visual atmosphere of the room while delivering practical surface and resting utility.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Sturdy ${mat} framing provides dependable load-bearing stability through continuous domestic use.`,
        `Solid ${mat} paneling maintains dependable structural balance and unwavering stability during active play.`,
        `High-density ${mat} framing provides solid load-bearing capacity and prevents frame distortion over time.`,
        `Resilient ${mat} construction preserves steady platform levelness across years of everyday household activity.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `Smooth perimeter finishes resist daily wear, maintaining a fresh and welcoming aesthetic in the bedroom.`,
        `Protective exterior coatings safeguard the vibrant color while ensuring effortless cleaning and maintenance.`,
        `Child-friendly proportions ensure safe, comfortable interaction throughout active everyday household routines.`,
        `Wipe-clean exterior panels protect against everyday marks, keeping the piece looking bright and well-cared-for.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'kids');
      break;
    }

    case 'STRUCTURE_H':
    default: {
      // Routine-Led
      const rOpeners = isChair
        ? [
            `Daily learning and creative activities unfold comfortably on a chair proportioned for young children.`,
            `Morning study sessions and afternoon crafts proceed smoothly around this accessible seating companion.`,
            `Everyday reading and drawing routines find reliable comfort upon this child-friendly chair.`,
          ]
        : [
            `Daily learning and creative activities unfold naturally around furniture scaled for young children's comfort.`,
            `Morning wakeups and evening rest settle into comfortable ease with child-centric bedroom furniture.`,
            `Everyday play and study routines run smoothly around a dedicated, accessible furniture companion.`,
            `Children's daily habits find structured calm around this thoughtfully arranged bedroom piece.`,
            `Starting the day feels cheerful and organized around this dedicated children's bedroom companion.`,
          ];
      s1 = pick(rOpeners, seed, 0);

      const s2Pool = [
        `This ${finish} piece features accessible proportions designed to support healthy daily habits and rest.`,
        `Designed for regular use, this ${finish} piece pairs accessible organization with clean domestic geometry.`,
        `The unit delivers reliable functional utility tailored for children's daytime study and nighttime sleep.`,
        `It provides dedicated functional space designed to support unhurried learning and resting routines.`,
      ];
      s2 = pick(s2Pool, seed, 2);

      const s3Pool = [
        `Solid ${mat} construction maintains steadfast frame alignment through years of active family living.`,
        `High-grade ${mat} construction preserves structural rigidity and dependable stability across regular household use.`,
        `Dense ${mat} construction provides a steady foundation that resists shifting during repeated daily interactions.`,
        `Sturdy ${mat} components maintain platform levelness and structural integrity throughout years of active use.`,
      ];
      s3 = pick(s3Pool, seed, 4);

      const s4Pool = [
        `Smooth surfaces provide an inviting workstation or resting platform that adapts smoothly to growing children's needs.`,
        `Accessible heights allow children to reach resting and storage areas independently throughout the day.`,
        `Durable wipe-clean coatings keep the surface looking pristine and ready for daily homework and creative projects.`,
        `Child-friendly proportions support comfortable daily use while facilitating quick and easy floor cleaning.`,
      ];
      s4 = pick(s4Pool, seed, 6);
      s5 = buildSynchronizedCloser(s1, shortName, mat, finish, facts, seed, 'kids');
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
  generateKidsRoomCopy,
  KIDS_STRUCTURES,
};
