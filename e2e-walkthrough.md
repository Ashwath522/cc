# Real End-to-End AI Content Flow Verification (`e2e-walkthrough.md`)

This report documents the live end-to-end verification of the AI Content Generation system running against the **actual live services**:
- **Real Express Server**: Port 8082 (`node index.js`)
- **Real MongoDB**: Port 27017 (`mongodb://127.0.0.1:27017/content-x`)
- **Real Redis Instance**: Port 6379 (`redis://127.0.0.1:6379/0`)
- **Real BullMQ Worker**: `ai-content.worker.js` (listening on queue `groot-ai-content`)
- **Real Vue Frontend Dev Server**: Port 8080 (`vue-cli-service serve`) with live proxying to Express backend
- **Real Product Catalog Seed**: Real enriched products from `data/trainingSet/beds_generated_enriched.jsonl` (e.g. Hanoi Queen Bed, Aruba Storage Bed, Toledo Storage Bed)

---

## Pre-Flight Setup Verification

1. **MongoDB Connectivity**:
   - Host/Port: `127.0.0.1:27017`
   - Verification: `Connection to 127.0.0.1 port 27017 [tcp/*] succeeded!`
2. **Redis Connectivity**:
   - Host/Port: `127.0.0.1:6379`
   - Verification: `Connection to 127.0.0.1 port 6379 [tcp/*] succeeded!`
3. **Backend Processes Running**:
   - Express Server: `Application app listening at http://localhost:8082`
   - BullMQ Worker: `info: AI content worker started`
   - Mongo Connection: `info: content-x default connection is open`
   - Redis Connections: `info: Redis BullHost Read Write is ready`, `info: Redis Host Read Write is ready`
4. **Frontend Dev Server Running**:
   - Local: `http://localhost:8080/`
   - Proxy: `/api` -> `http://127.0.0.1:8082`

---

## Detailed Step-by-Step Flow Results

### Step 1 — Start a Job and Preview
- **Objective**: Create a job on "Beds" and generate 3 on-screen preview products showing all 5 structural parts distinctly.
- **Request 1 (Create Job)**:
  - **Method**: `POST`
  - **Path**: `/api/v1/ai-content/jobs`
  - **Headers**: `x-company-id: 95`, `x-application-id: 65eb1972926345654bc9c1a8`
  - **Body**:
    ```json
    {
      "category": "Beds",
      "category_ids": ["Beds"],
      "selected_tone": "auto"
    }
    ```
  - **Response Status**: `201 Created`
  - **Created Job ID**: `6aa2451a367726a2b978a329`
- **Request 2 (Generate Preview)**:
  - **Method**: `POST`
  - **Path**: `/api/v1/ai-content/jobs/6aa2451a367726a2b978a329/preview`
  - **Body**:
    ```json
    {
      "tone": "auto",
      "count": 3
    }
    ```
  - **Response Status**: `200 OK`
  - **Response Count**: Exactly 3 preview items.
- **MongoDB State Verification**:
  - Queried `aicontentjobs` collection for `_id: 6aa2451a367726a2b978a329`.
  - Stored status: `"preview"`.
  - Preview product references: 3 items stored in `preview_product_refs`.
- **Rendered 5-Part Structure (Item 1: Hanoi Queen Bed)**:
  - **Part 1 — Mood Line**: `"Clean lines bring quiet order."`
  - **Part 2 — Intro**: `"This bed is defined by an understated geometric profile designed for clutter-free clarity."`
  - **Part 3 — Story**: `"Constructed from resilient hardwood, the frame provides enduring strength and sturdy support through purposeful everyday utility. Flush surfaces and a matte finish let natural light flow unobstructed across the room."`
  - **Part 4 — Close**: `"Bring modern simplicity and quiet order to your space with the Hanoi."`
  - **Part 5 — Deterministic Specifications / Bullets** (5 items):
    1. *Available in Queen sizes to suit different spaces.*
    2. *Comfortably fits a 78 x 60 in mattress.*
    3. *Includes hydraulic storage for easy access underneath.*
    4. *Available in a Amber Walnut finish.*
    5. *Available in Beige colour.*
- **Verdict**: **PASS**

---

### Step 2 — Tone Button and Selection
- **Objective**: Verify tone dropdown lists 5 real presets from `tone.js` via `GET /ai-content/tones`, select `playful_casual`, and confirm same 3 products regenerate with distinct vocal register.
- **Request 1 (List Tones)**:
  - **Method**: `GET`
  - **Path**: `/api/v1/ai-content/tones`
  - **Response Status**: `200 OK`
  - **Returned Presets**:
    1. `warm_inviting` — Warm & Inviting
    2. `elegant_sophisticated` — Elegant & Sophisticated
    3. `minimal_modern` — Minimal & Modern
    4. `premium_indulgent` — Premium & Indulgent
    5. `playful_casual` — Playful & Casual
- **Request 2 (Re-preview with Playful Tone)**:
  - **Method**: `POST`
  - **Path**: `/api/v1/ai-content/jobs/6aa2451a367726a2b978a329/preview`
  - **Body**:
    ```json
    {
      "tone": "playful_casual",
      "count": 3
    }
    ```
  - **Response Status**: `200 OK`
- **Comparison & Verification**:
  - **Same 3 Products**: Confirmed identical product IDs and sequence (`ul-fnbdst12sq16417`, `ul-fnbdst43wa35175`, `ul-fnbdst12dq16437`).
  - **Auto Summary**:
    > *"Clean lines bring quiet order. This bed is defined by an understated geometric profile designed for clutter-free clarity. Constructed from resilient hardwood, the frame provides enduring strength and sturdy support through purposeful everyday utility. Flush surfaces and a matte finish let natural light flow unobstructed across the room. Bring modern simplicity and quiet order to your space with the Hanoi."*
  - **Playful Summary**:
    > *"Ready for breezy comfort? This bed is defined by an upbeat silhouette designed for relaxed daily ease. Crafted from durable hardwood, the sturdy build handles daily life with effortless charm and carefree stability. Smooth surfaces and sunny tones keep your space bright and welcoming without taking things too seriously. Rest easy and unwind tonight with breezy comfort with the Hanoi."*
  - **Register Change**: Clearly transitioned from clean/understated to cheerful, upbeat, and conversational with contractions and energetic vocabulary.
- **Verdict**: **PASS**

---

### Step 3 — View and Edit the Tone's Rule Text
- **Objective**: Fetch effective tone text via `GET /ai-content/tones/:toneId`, edit by appending `" Always mention the word 'sanctuary' at least once."`, save via `PUT /ai-content/tones/:toneId`, and verify document stored in Mongo byte-for-byte.
- **Request 1 (Get Tone Details)**:
  - **Method**: `GET`
  - **Path**: `/api/v1/ai-content/tones/playful_casual`
  - **Response Status**: `200 OK`
  - **Fetched Rule Text**:
    > *"Adopt a breezy, upbeat, and accessible voice. Contractions are welcome, tone is conversational and optimistic, and direct address brings easy vitality ('you\'ll love', 'effortless charm', 'fresh spin', 'fun-loving'). Keep descriptions bright, relatable, and approachable."*
- **Request 2 (Save Edited Tone)**:
  - **Method**: `PUT`
  - **Path**: `/api/v1/ai-content/tones/playful_casual`
  - **Body**:
    ```json
    {
      "rule_text": "Adopt a breezy, upbeat, and accessible voice. Contractions are welcome, tone is conversational and optimistic, and direct address brings easy vitality ('you\'ll love', 'effortless charm', 'fresh spin', 'fun-loving'). Keep descriptions bright, relatable, and approachable. Always mention the word 'sanctuary' at least once."
    }
    ```
  - **Response Status**: `200 OK`
  - **Response Body**:
    ```json
    {
      "success": true,
      "message": "Tone preset updated successfully",
      "tone": {
        "tone_id": "playful_casual",
        "label": "Playful & Casual",
        "is_overridden": true
      }
    }
    ```
- **MongoDB Verification**:
  - Queried `toneoverrides` collection directly:
    ```javascript
    db.collection('toneoverrides').findOne({
      company_id: '95',
      application_id: '65eb1972926345654bc9c1a8',
      tone_id: 'playful_casual'
    })
    ```
  - Result: Document found. `rule_text` matches the edited string **byte-for-byte**.
- **Verdict**: **PASS**

---

### Step 4 — Regenerate and Confirm Edit Took Effect
- **Objective**: Re-generate preview using edited `playful_casual` tone and assert that the distinctive marker (`"sanctuary"`) is present in the LLM prompt output.
- **Request**:
  - **Method**: `POST`
  - **Path**: `/api/v1/ai-content/jobs/6aa2451a367726a2b978a329/preview`
  - **Body**:
    ```json
    {
      "tone": "playful_casual",
      "count": 3
    }
    ```
  - **Response Status**: `200 OK`
- **Generated Summary Output**:
  > *"Ready for breezy comfort? This bed is defined by an upbeat silhouette designed for relaxed daily ease. Crafted from durable hardwood, the sturdy build creates a true **sanctuary** of effortless charm and carefree stability. Smooth surfaces and sunny tones keep your space bright and welcoming without taking things too seriously. Rest easy and unwind tonight in your **sanctuary** with the Hanoi."*
- **Verification**:
  - The keyword **"sanctuary"** appears in both the story section and closing loop.
  - Confirms the database override was retrieved by `getEffectiveTone()`, injected into `{{TONE_VOICE}}`, and consumed by generation.
- **Verdict**: **PASS**

---

### Step 5 — Confirm Boundaries Still Hold Under a Real Edit
- **Objective**: Confirm that the tone edit did NOT disrupt the 5-part structure or bypass deterministic bullet generation.
- **Verification**:
  - **5-Part Structure Section Check**:
    1. **Mood Line**: `"Ready for breezy comfort?"` (4 words, emotional register)
    2. **Intro**: `"This bed is defined by an upbeat silhouette designed for relaxed daily ease."` (1 sentence, product type + primary feature)
    3. **Story**: `"Crafted from durable hardwood, the sturdy build creates a true sanctuary of effortless charm and carefree stability. Smooth surfaces and sunny tones keep your space bright and welcoming without taking things too seriously."` (2 sentences, material craftsmanship)
    4. **Close**: `"Rest easy and unwind tonight in your sanctuary with the Hanoi."` (1 sentence, returns to theme family + product name)
    5. **Bullets**: 5 deterministic bullet points extracted directly from catalog specifications outside of LLM prose.
  - **Validation Result**: `item.validation.valid === true`
- **Verdict**: **PASS**

---

### Step 6 — Reset and Confirm Reversion
- **Objective**: Call Reset endpoint, verify `toneOverride` document is deleted from Mongo, and confirm regeneration reverts to the original default text without "sanctuary".
- **Request 1 (Reset Tone)**:
  - **Method**: `POST`
  - **Path**: `/api/v1/ai-content/tones/playful_casual/reset`
  - **Response Status**: `200 OK`
  - **Response Body**: `{"success": true, "message": "Tone preset reset to default"}`
- **MongoDB Verification**:
  - Queried `toneoverrides` collection for `company_id: '95'`, `tone_id: 'playful_casual'`.
  - Returned: `null` (document completely deleted from database).
- **Request 2 (Re-preview after Reset)**:
  - **Method**: `POST`
  - **Path**: `/api/v1/ai-content/jobs/6aa2451a367726a2b978a329/preview`
  - **Body**:
    ```json
    {
      "tone": "playful_casual",
      "count": 3
    }
    ```
  - **Response Status**: `200 OK`
- **Generated Summary Output**:
  > *"Ready for breezy comfort? This bed is defined by an upbeat silhouette designed for relaxed daily ease. Crafted from durable hardwood, the sturdy build handles daily life with effortless charm and carefree stability. Smooth surfaces and sunny tones keep your space bright and welcoming without taking things too seriously. Rest easy and unwind tonight with breezy comfort with the Hanoi."*
- **Verification**:
  - Keyword **"sanctuary"** is absent.
  - Text reverted exactly to shipped default preset.
- **Verdict**: **PASS**

---

### Step 7 — Confirm and Full Run
- **Objective**: Confirm the job with active tone (`playful_casual`), verify transition to BullMQ worker queue via Redis, and observe execution to `COMPLETED`.
- **Request**:
  - **Method**: `POST`
  - **Path**: `/api/v1/ai-content/jobs/6aa2451a367726a2b978a329/confirm`
  - **Body**:
    ```json
    {
      "tone": "playful_casual"
    }
    ```
  - **Response Status**: `200 OK`
- **Worker Execution Log & Mongo State Transitions**:
  1. Status transitioned: `preview` -> `pending`.
  2. Enqueued to BullMQ Redis Queue (`groot-ai-content`).
  3. Worker picked up job `6aa2451a367726a2b978a329`.
  4. Status transitioned: `pending` -> `processing` -> `completed`.
  5. Polled Mongo document:
     - `status`: `"completed"`
     - `selected_tone`: `"playful_casual"`
     - `total_count`: `50`
     - `completed_at`: Recorded timestamp
- **Verdict**: **PASS**

---

## Summary Matrix

| Step | Test Description | Live Request | Live DB Verification | Status |
|:---:|:---|:---|:---|:---:|
| **1** | Start job & preview 3 products | `POST /jobs`, `POST /jobs/:id/preview` | Mongo status: `"preview"`, 3 items | **PASS** |
| **2** | Tone selector lists presets & switches voice | `GET /tones`, `POST /jobs/:id/preview` | 5 presets loaded, same products, new voice | **PASS** |
| **3** | View & edit tone rule text | `GET /tones/:id`, `PUT /tones/:id` | `toneoverrides` document matches byte-for-byte | **PASS** |
| **4** | Regenerate & confirm edit took effect | `POST /jobs/:id/preview` | Output explicitly contains `"sanctuary"` | **PASS** |
| **5** | Confirm boundaries hold under real edit | `POST /jobs/:id/preview` | 5 parts distinct + deterministic bullets intact | **PASS** |
| **6** | Reset tone to default & confirm reversion | `POST /tones/:id/reset` | `toneoverrides` doc deleted, `"sanctuary"` removed | **PASS** |
| **7** | Confirm & full BullMQ worker run | `POST /jobs/:id/confirm` | Redis queue processed, Mongo status: `"completed"` | **PASS** |
