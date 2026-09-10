# Product Content Generator

An AI-powered, production-grade product marketing content generation and training dataset system for furniture and home goods catalogs (Urban Ladder).

The system transforms raw product data, physical specifications, and catalog URLs into structured, high-converting, and factual e-commerce product listings. It guarantees zero hallucination of dimensions or materials, prevents LLM stock-phrase fatigue, enforces brand voice tiers, and employs an autonomous **4-Role Feedback Loop** to detect and correct style drift over time.

---

## Table of Contents
- [Overview & Capabilities](#overview--capabilities)
- [How a Generation Request Flows](#how-a-generation-request-flows)
- [The 4-Role Generation & Quality Loop](#the-4-role-generation--quality-loop)
  - [Role 1: Fetch & Generate Agent](#role-1-fetch--generate-agent)
  - [Role 2: Validator & Diagnostic Agent](#role-2-validator--diagnostic-agent)
  - [Role 3: Rule-Addition Agent](#role-3-rule-addition-agent)
  - [Role 4: Humanness Reviewer (Periodic Batch Check)](#role-4-humanness-reviewer-periodic-batch-check)
- [Feedback Systems: Permanent vs. Ephemeral](#feedback-systems-permanent-vs-ephemeral)
- [Prose Diversity & Strategy Rotation](#prose-diversity--strategy-rotation)
- [Generated Catalog Datasets (185 Products)](#generated-catalog-datasets-185-products)
- [Word Document Generator (`.docx`)](#word-document-generator-docx)
- [Project Directory Structure](#project-directory-structure)
- [Setup & Usage Guide](#setup--usage-guide)
- [Running Tests & Verification](#running-tests--verification)

---

## Overview & Capabilities

Traditional LLM product generation often suffers from repetitive clichés (e.g., *"serves as a foundational piece"*, *"elevates your living space"*, *"seamlessly blends form and function"*). This system solves that with a multi-layered validation and prompt-injection architecture:

* **100% Fact-Grounded:** Dimensions, materials, and variants are injected deterministically and strictly validated against raw input specs.
* **Price Tier Voice Adaptation:** Automatically maps pricing into three voice tiers:
  * **Good (Value):** Practical, reliable, straightforward everyday language.
  * **Mid-Premium:** Considered, elevated, refined (strictly avoids the word *"luxury"*).
  * **Premium:** Crafted, aspirational, understated confidence.
* **Deterministic Care & Returns:** Automatically maps material types to approved care instructions (`data/material_care_reference.json`) and returns policies (`data/returns_by_category.json`).
* **Anti-Repetition & Phrase Frequency Guard:** Uses N-gram tracking across the entire generated corpus to prevent overusing identical opening sentences, closing sentences, or 2-to-4-word phrases.
* **Humanness Drift Monitoring:** Periodically scores batches on 3 specific criteria to catch robotic phrasing early and inject concrete before/after examples automatically.

---

## How a Generation Request Flows

```text
┌─────────────────────────┐
│ Raw Product Data / Spec │
└────────────┬────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────────────┐
│ promptBuilder.js                                                       │
│ 1. Matches material to care guidelines (careMatcher.js)                 │
│ 2. Calculates price tier voice (Good / Mid-Premium / Premium)          │
│ 3. Assigns deterministic Opening & Closing strategy hashes             │
│ 4. Injects Category Rules (data/categoryPrompts/)                      │
│ 5. Injects Learned Permanent Rules & Humanness Examples (rules.json)   │
└────────────────────────────┬───────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│ llmClient.js (Gemini API or Test Mock)                                 │
│ Generates structured JSON adhering to LLM_GENERATED_SCHEMA_SUBSET      │
└────────────────────────────┬───────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│ generate.js                                                            │
│ 1. Assembles generated prose + deterministic specs                     │
│ 2. Attaches warranty, returns policies, and quality promise            │
│ 3. Performs repetition & phrase-frequency checks (openerStore.js)      │
│ 4. Validates output schema and word count constraints (validator.js)   │
│ 5. Retries with targeted error feedback if constraints are breached    │
└────────────────────────────┬───────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────┐
│ Validated Output JSON / │
│ Training Dataset JSONL  │
└─────────────────────────┘
```

---

## The 4-Role Generation & Quality Loop

The core engine implements an autonomous multi-role loop (`src/loopOrchestrator.js`) designed to maintain catalog quality across large batch runs:

```text
  ┌──────────────────────────────────────────────────────────┐
  │              ROLE 1: Fetch & Generate Agent              │
  │  - Discovers & scrapes live Urban Ladder product pages   │
  │  - Enforces cross-subcategory SKU deduplication          │
  │  - Generates full structured product content             │
  └────────────────────────────┬─────────────────────────────┘
                               │
               (Every 10-15 items in batch)
                               │
                               ▼
  ┌──────────────────────────────────────────────────────────┐
  │          ROLE 4: Humanness Reviewer (Read-Only)          │
  │  Scores batch on 3-point check:                          │
  │  1. Abstract spatial/architectural framing? (Y/N)        │
  │  2. Generic "serves as a [noun]" connector? (Y/N)        │
  │  3. Formulaic lifestyle-moment opener template? (Y/N)    │
  └────────────────────────────┬─────────────────────────────┘
                               │
                      (If 3+ items trip
                       the same check)
                               │
                               ▼
  ┌──────────────────────────────────────────────────────────┐
  │            ROLE 3: Rule-Addition Agent (Additive)        │
  │  - Adds ONE concrete Before/After example to rules.json  │
  │  - Never edits base prompt template directly             │
  └──────────────────────────────────────────────────────────┘
                               │
                     (End of Category Run)
                               │
                               ▼
  ┌──────────────────────────────────────────────────────────┐
  │        ROLE 2: Validator & Diagnostic Agent (Read-Only)  │
  │  - Cross-corpus Jaccard similarity & n-gram audit        │
  │  - Root cause analysis (Category / Strategy / LLM-Tic)   │
  │  - Hands off persistent overused phrases to Role 3       │
  └──────────────────────────────────────────────────────────┘
```

### Role 1: Fetch & Generate Agent
* Scrapes live Urban Ladder collection pages for category products.
* Extracts specifications directly from verified specification tables.
* Performs **global SKU registry validation** (`src/skuRegistry.js`) so products are never duplicated across categories or variants.
* Runs generation and appends accepted records to `data/trainingSet/<subcategory>_generated.jsonl`.

### Role 2: Validator & Diagnostic Agent (Read-Only)
* Evaluates the entire category dataset at the end of a run.
* Audits repetition retry history and n-gram frequency across the full corpus.
* Classifies root causes of phrase overuse into three buckets:
  1. `CATEGORY_RULE_WORDING`: Caused by prescriptive phrasing in category prompt files.
  2. `STRATEGY_BUCKET`: Caused by clustering around a specific lifestyle sub-case.
  3. `GENERIC_LLM_TIC`: General LLM default filler words.

### Role 3: Rule-Addition Agent (Additive-Only)
* Translates diagnosis from Role 2 and Role 4 into permanent, preventive rules.
* **Strict Constraint:** Additive-only. It writes to `data/rules.json` or appends to a category `avoid_list`, never modifying `SYSTEM_PROMPT_TEMPLATE` directly.

### Role 4: Humanness Reviewer (Periodic Batch Check)
* Runs **periodically** during batch generation (e.g., after every 10–15 generations) to catch template drift early without waiting for the full category to complete.
* Evaluates each summary on a simple **3-point Y/N check**:
  1. **Abstract Spatial Framing:** Does it use abstract *"defines/anchors/establishes the [layout/flow/architecture]"* framing anywhere?
  2. **Generic Connector:** Does it use *"serves as a [foundational/essential/functional] [noun]"* as a connector?
  3. **Lifestyle Opener Template:** Does it open with a formulaic lifestyle-moment + abstract verb template (*"Preparing for..."*, *"Settling in after..."*)?
* **Handoff:** If **3 or more products** in the current batch trip the **same** check, Role 4 signals Role 3 to append a targeted **Before/After example** to `data/rules.json`.

---

## Feedback Systems: Permanent vs. Ephemeral

The system separates feedback into two isolated channels:

| Feedback Type | Target Storage | Scope | Use Case |
| :--- | :--- | :--- | :--- |
| **Permanent Rules** | `data/rules.json` | Cross-product, all future generations | Global style rules, banned stock phrases, humanness before/after examples. |
| **Ephemeral Session** | `data/conversations.json` | Single product, current session only | Interactive user tweaks (e.g. *"make it 20 words shorter"*, *"mention the cane headboard more"*). |

> [!IMPORTANT]
> This separation is strictly maintained. Ephemeral conversational instructions are never saved to permanent rules, preventing contradictory rule accumulation.

---

## Prose Diversity & Strategy Rotation

To ensure catalog descriptions do not sound uniform, `src/promptBuilder.js` deterministically selects opening and closing strategies using a stable hash of the product ID:

### Opening Strategies (1 to 5)
1. **Sensory / Tactile:** Opens from physical texture, finish depth, or light interaction.
2. **Use-Case / Moment:** Opens from a concrete real-world action (with 5 rotating sub-cases: morning routines, winding down, hosting guests, relaxed weekends, returning home).
3. **Direct Product Statement:** Opens by plainly stating the product type and primary design hook without mood fluff.
4. **Spatial / Room Layout:** Opens from floor footprint, wall clearance, or room flow.
5. **Material-First Fact:** Opens from a specific, ungeneric fact about how the specific wood/metal/fabric behaves.

### Closing Anchor Strategies (1 to 5)
1. **Craft / Longevity:** Closes on joinery, material resilience, and enduring use.
2. **Lifestyle Utility:** Closes on everyday practical routines and storage ease.
3. **Spatial Fit:** Closes on proportions and room placement.
4. **Maintenance Ease:** Closes on care simplicity and surface resilience.
5. **Quality Guarantee:** Closes on warranty assurance and rigorous manufacturing checks.

---

## Generated Catalog Datasets (185 Products)

The project contains complete training datasets generated across 5 core Bedroom categories (`data/trainingSet/`):

| Subcategory | File | Products | Verified Live UL URLs |
| :--- | :--- | :---: | :---: |
| **Beds** | [`beds_generated.jsonl`](file:///Users/ashwathm/Downloads/product-content-generator/data/trainingSet/beds_generated.jsonl) | 50 | 50 (100%) |
| **Kids Room** | [`kids_room_generated.jsonl`](file:///Users/ashwathm/Downloads/product-content-generator/data/trainingSet/kids_room_generated.jsonl) | 26 | 26 (100%) |
| **Mattresses** | [`mattresses_generated.jsonl`](file:///Users/ashwathm/Downloads/product-content-generator/data/trainingSet/mattresses_generated.jsonl) | 44 | 44 (100%) |
| **Bedroom Storage** | [`bedroom_storage_generated.jsonl`](file:///Users/ashwathm/Downloads/product-content-generator/data/trainingSet/bedroom_storage_generated.jsonl) | 35 | 35 (100%) |
| **Wardrobes** | [`wardrobes_generated.jsonl`](file:///Users/ashwathm/Downloads/product-content-generator/data/trainingSet/wardrobes_generated.jsonl) | 30 | 30 (100%) |
| **Total** | **5 JSONL Datasets** | **185** | **185 (100%)** |

*(Pet Furniture is configured in rules but excluded from final bedroom catalog exports per requirements).*

---

## Word Document Generator (`.docx`)

The script [`scripts/generateDocx.js`](file:///Users/ashwathm/Downloads/product-content-generator/scripts/generateDocx.js) compiles all 185 products from the 5 JSONL files into a formatted Microsoft Word document:

* **File Location:** [`Urban_Ladder_Bedroom_Product_Descriptions.docx`](file:///Users/ashwathm/Downloads/product-content-generator/Urban_Ladder_Bedroom_Product_Descriptions.docx) and [`output/Urban_Ladder_Bedroom_Product_Descriptions.docx`](file:///Users/ashwathm/Downloads/product-content-generator/output/Urban_Ladder_Bedroom_Product_Descriptions.docx)
* **Structure:**
  * **Document Title & Overview Table** showing product counts per section.
  * **Page 1 — Beds** (50 products) $\rightarrow$ *Page Break*
  * **Page 2 — Kids Room** (26 products) $\rightarrow$ *Page Break*
  * **Page 3 — Mattresses** (44 products) $\rightarrow$ *Page Break*
  * **Page 4 — Bedroom Storage** (35 products) $\rightarrow$ *Page Break*
  * **Page 5 — Wardrobes** (30 products)
* **Per-Product Content:**
  1. **Product Name** (Bold Heading)
  2. **Description Summary** (Grounded paragraph prose)
  3. **Key Features** (Bulleted list of actual product features)
  4. **Product Link** (Clickable hyperlink: **View Product on Urban Ladder** leading to the verified live URL).

---

## Project Directory Structure

```text
product-content-generator/
├── README.md                              # Complete system documentation
├── package.json                           # NPM dependencies (docx, dotenv)
├── Urban_Ladder_Bedroom_Product_Descriptions.docx # Generated Word document (Root)
│
├── data/                                  # Static references, rules, and training sets
│   ├── categoryPrompts/                   # Category & subcategory emphasis/avoid lists
│   │   └── Bedroom/                       # Beds, Mattresses, Wardrobes, Storage, Kids Room
│   ├── trainingSet/                       # Final generated JSONL datasets (185 products)
│   │   ├── beds_generated.jsonl
│   │   ├── bedroom_storage_generated.jsonl
│   │   ├── kids_room_generated.jsonl
│   │   ├── mattresses_generated.jsonl
│   │   ├── pet_furniture_generated.jsonl
│   │   └── wardrobes_generated.jsonl
│   ├── conversations.json                 # Ephemeral single-session feedback storage
│   ├── generatedOpeners.jsonl             # Corpus of all accepted opening/closing sentences
│   ├── material_care_reference.json       # Approved material care instructions
│   ├── phraseFrequency.json               # N-gram frequency dictionary across corpus
│   ├── price_bands.json                   # Price tier boundaries (Good, Mid-Premium, Premium)
│   ├── products.json                      # Seed product specifications
│   ├── returns_by_category.json           # Return window and condition policies
│   ├── rules.json                         # Permanent learned rules & humanness examples
│   └── usedSkus.json                      # Cross-category SKU uniqueness registry
│
├── src/                                   # Application source code
│   ├── careMatcher.js                     # Maps raw material strings to approved care text
│   ├── conversationSession.js             # Manages ephemeral turn adjustments
│   ├── feedback.js                        # Manages permanent cross-product rules
│   ├── generate.js                        # Main generation and assembly orchestrator
│   ├── humannessReviewer.js               # Role 4: 3-point check & Role 3 handoff
│   ├── llmClient.js                       # Gemini API client & test mock switcher
│   ├── loopOrchestrator.js                # Roles 1, 2, 3, 4 execution loop
│   ├── openerStore.js                     # N-gram overlap and Jaccard similarity checker
│   ├── promptBuilder.js                   # Prompt compiler with strategy & rule injection
│   ├── qualityComposer.js                 # Composes quality promise statements
│   ├── returnsLookup.js                   # Returns policy lookup helper
│   ├── schema.js                          # Output schema definition
│   ├── skuRegistry.js                     # Cross-subcategory SKU claim registry
│   └── validator.js                       # Output schema & constraint validator
│
├── scripts/                               # CLI execution scripts
│   ├── buildBedsDataset.js                # Dedicated Beds scraper & dataset builder
│   ├── buildCategoryDataset.js            # General category dataset builder
│   ├── generateDocx.js                    # Compiles datasets into Word document (.docx)
│   ├── runFullLoop.js                     # Runs Role 1 -> Role 4 -> Role 2 -> Role 3 loop
│   ├── runRun3Verification.js             # Verifies Run 3 quality benchmarks
│   ├── runRun4Verification.js             # Verifies Run 4 quality benchmarks
│   └── feedbackLoop.js                    # Interactive terminal feedback session
│
├── test/                                  # Test suites
│   ├── mockLlmClient.js                   # Deterministic mock LLM for testing
│   ├── runTest.js                         # Core mock generation test suite
│   ├── sampleProducts.json                # Sample inputs for testing
│   ├── testConversationSession.js        # Ephemeral feedback tests
│   └── testHumannessReviewer.js           # Unit tests for Role 4 3-point check & handoff
│
└── output/                                # Generation output directory
    ├── Urban_Ladder_Bedroom_Product_Descriptions.docx # Word catalog document
    └── generated/                         # Output JSON files from batch runs
```

---

## Setup & Usage Guide

### Prerequisites
* **Node.js**: Version 18 or higher.
* **Environment Variables**: Create a `.env` file in the root directory if calling the live Gemini API:
  ```env
  LLM_API_KEY=your_gemini_api_key_here
  GEMINI_MODEL=gemini-2.5-flash
  GENERATE_DELAY_MS=1500
  ```

### Installation
```bash
npm install
```

### Common Commands

#### 1. Generate the Word Document (.docx)
Compiles all 185 products from `data/trainingSet/` into the formatted Word document:
```bash
node scripts/generateDocx.js
```

#### 2. Run the Full 4-Role Loop for a Subcategory
Runs discovery, generation (Role 1), periodic humanness check (Role 4), corpus diagnosis (Role 2), and rule addition (Role 3):
```bash
node scripts/runFullLoop.js "Beds" 50
node scripts/runFullLoop.js "Kids Room" 26
node scripts/runFullLoop.js "Mattresses" 44
node scripts/runFullLoop.js "Bedroom Storage" 35
node scripts/runFullLoop.js "Wardrobes" 30
```

#### 3. Interactive Feedback Session
Test a product interactively in the terminal and tweak descriptions on the fly:
```bash
node scripts/feedbackLoop.js
```

---

## Running Tests & Verification

### 1. Fast Mock Test Suite (Zero API Cost)
Runs the test suite against sample products using the mock LLM:
```bash
npm test
```

### 2. Role 4 Humanness Reviewer Test Suite
Verifies the 3-point check detection, sub-threshold clean states, threshold-triggered handoffs, and additive rule injection:
```bash
node test/testHumannessReviewer.js
```

### 3. Ephemeral Feedback Session Tests
Verifies that single-turn conversation adjustments remain ephemeral and never pollute permanent rules:
```bash
node test/testConversationSession.js
```
