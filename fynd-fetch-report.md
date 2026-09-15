# Real Fynd Products Fetch Report

## Final Verdict
**Real product fetch: FAILED — extension not installed on company 95 (no offline OAuth token in session storage, ngrok tunnel returning 502 Bad Gateway)**

---

## Executive Summary
All attempts to fetch real product data directly from Fynd Platform failed due to a missing OAuth access token for `company_id: "95"`. While the Fynd Extension API key and secret are properly populated, the extension has not been installed on Company 95 in the Fynd Partners panel, resulting in an empty Redis session store. Furthermore, the registered `EXTENSION_BASE_URL` (`https://krypton-groggily-creation.ngrok-free.dev`) is returning `HTTP 502 Bad Gateway (ERR_NGROK_8012)`, preventing the OAuth handshake from completing.

---

## Attempt-by-Attempt Log

### Attempt 1: Existing Helper by SKU (`getProductsBySKUs`)
- **Method Called**: `getProductsBySKUs({ skus: ['FNSGCB43CW35100', 'ul-fnbdst12sq16417'], companyId: '95' })`
- **Location**: `app/routes/services/product.service.js:8`
- **Underlying Call**: `const platformClient = await getPlatformClient(companyId); await platformClient.catalog.getProducts({ itemCode: skus, pageSize: skus.length });`
- **Status**: **FAILED**
- **Exact Error Message**:
  ```
  TypeError: Cannot read properties of null (reading 'expires_in')
      at OAuthClient.setToken (/Users/ashwathm/Desktop/context-x-x/node_modules/fdk-client-javascript/sdk/platform/OAuthClient.js:47:35)
      at Extension.getPlatformClient (/Users/ashwathm/Desktop/context-x-x/node_modules/fdk-extension-javascript/express/extension.js:121:36)
      at Object.getPlatformClient (/Users/ashwathm/Desktop/context-x-x/node_modules/fdk-extension-javascript/express/index.js:31:38)
      at async getProductsBySKUs (/Users/ashwathm/Desktop/context-x-x/app/routes/services/product.service.js:9:26)
  ```
- **Diagnostics**:
  FDK debug logs reported:
  `{"level":"debug","library":"fdk-extension-javascript","message":"Session data not found for session id 1eae1cc8e71ef7353aca113a322d6d50fe83ecf5e734daced5300e864a37a29b"}`
  When `SessionStorage.getSession(sid)` returned `null`, `extension.getPlatformClient` attempted to pass `null` into `oauthClient.setToken(session)`, throwing the `TypeError`.

---

### Attempt 2: Existing Helper by Category Paginated (`getProductsByCategoryPaginated`)
- **Method Called**: `getProductsByCategoryPaginated({ companyId: '95', categoryIds: ['beds', 'wardrobes', 'bedroom-storage'], pageSize: 10, pageId: '*' })`
- **Location**: `app/routes/services/product.service.js:121`
- **Underlying Call**: `const platformClient = await getPlatformClient(companyId); await platformClient.catalog.getProducts(query);`
- **Status**: **FAILED** (Intercepted by catch block and fell back to local seeded data)
- **Exact Error Message**:
  ```
  warn: [getProductsByCategoryPaginated] Platform client unavailable or empty (Cannot read properties of null (reading 'expires_in')). Using seeded real products from training set.
  ```
- **Diagnostics**:
  Because `getPlatformClient('95')` threw the identical `TypeError: Cannot read properties of null (reading 'expires_in')`, the catch block at line 148 triggered and returned `getSeededBeds(pageSize)`.
  *Note per task instructions: Local fallback / seeded mock data is explicitly classified as a failure of real Fynd fetching.*

---

### Attempt 3: Raw FDK Client Call (No Service Wrapper)
- **Method Called**: Direct instantiation of `PlatformConfig` and `PlatformClient` from `fdk-client-javascript`, bypassing `product.service.js` and `fdk-extension-javascript` session storage:
  ```javascript
  const { PlatformConfig, PlatformClient } = require("fdk-client-javascript");
  const pConfig = new PlatformConfig({
    companyId: 95,
    domain: "https://api.swadeshz5.de",
    apiKey: "69df5ece363550cfa795d0c1",
    apiSecret: "2lBaWoI4-Gp_TzP",
    useAutoRenewTimer: false,
  });
  const client = new PlatformClient(pConfig);
  await client.catalog.getProducts({ pageSize: 10 });
  ```
- **Endpoint Target**: `GET https://api.swadeshz5.de/service/platform/catalog/v2.0/company/95/products/?page_size=10`
- **Status**: **FAILED**
- **Exact Error Message**:
  ```
  {"level":"ERROR","detail":{"reason":"authorization token not found","error":"Access not allowed"},"time":"Fri Sep 11 2026 10:34:32 GMT+0530 (India Standard Time)","version":"1.1.2"}
  Request failed with status code 403 (Forbidden)
  ```
- **Distinction Analysis**:
  Unlike Attempts 1 & 2 which failed locally in Node.js when looking up the Redis session, Attempt 3 successfully connected over the network to the live Fynd Platform API cluster (`api.swadeshz5.de`). The gateway rejected the request with HTTP `403 Forbidden` because `Authorization: Bearer <token>` was missing. This proves the API host and route are alive and reachable, but cannot be accessed without an active OAuth token.

---

### Attempt 4: Fynd Platform API Documentation Verification
- **Documentation Checked**:
  - Official `@gofynd/fdk-client-javascript` and `@gofynd/fdk-extension-javascript` repositories.
  - Fynd Platform Developer Documentation (Platform Catalog APIs).
- **Findings**:
  - The SDK method `platformClient.catalog.getProducts(...)` maps to:
    `GET /service/platform/catalog/v2.0/company/{company_id}/products/`
    Parameter mapping:
    - `brandIds` $\rightarrow$ `brand_ids`
    - `categoryIds` $\rightarrow$ `category_ids`
    - `itemCode` $\rightarrow$ `item_code`
    - `pageNo` $\rightarrow$ `page_no`
    - `pageSize` $\rightarrow$ `page_size`
  - The method name and endpoint path used in Attempts 1–3 are completely current and correct.
  - Attempted Storefront/Application alternative via `ApplicationClient`:
    `ApplicationConfig` requires `applicationToken`, which itself must be minted via `platformClient.application(applicationId).configuration.getApplicationById()`.
    Direct call without `applicationToken` threw:
    ```
    FDKInvalidCredentialError: No Application Token Present
        at ApplicationConfig.validate (/Users/ashwathm/Desktop/context-x-x/node_modules/fdk-client-javascript/sdk/application/ApplicationConfig.js:48:13)
    ```
- **Conclusion**: The failure is not due to an outdated API signature or wrapper bug, but strictly an authorization barrier.

---

### Attempt 5: Auth & Configuration Verification Checklist

| Check | Item | Value / State | Status | Detail |
|---|---|---|---|---|
| **1** | `EXTENSION_API_KEY` & Secret in `config.js` | `api_key: "69df5ece363550cfa795d0c1"`<br>`api_secret: "2lBaWoI4-Gp_TzP"` | **PASSED** | Both credentials are populated, non-empty, and validly formatted. |
| **2** | Extension Installed on `company_id: 95` | `RedisStorage` under prefix `'groot'` | **FAILED** | Checking Redis for `groot:1eae1cc8e71ef7353aca113a322d6d50fe83ecf5e734daced5300e864a37a29b` returned `null`. `KEYS groot:*` returned `[]`. No offline OAuth token exists. |
| **3** | `company_id` Validity | `company_id: "95"` on domain `swadeshz5.de` | **PASSED** (Configured) | Remote cluster `api.swadeshz5.de` responded specifically for Company 95 with `403 Access not allowed (authorization token not found)`. |
| **Bonus** | Tunnel / Base URL Reachability | `https://krypton-groggily-creation.ngrok-free.dev` | **FAILED** | `curl -I` returned `HTTP/2 502 Bad Gateway (ERR_NGROK_8012)`. The tunnel is down, blocking any interactive install callback from the Fynd Partners panel. |

---

## Actionable Steps to Enable Real Fynd Product Fetching

To enable real product fetching from Fynd:
1. **Restart ngrok Tunnel**: Start a tunnel forwarding to port 8082:
   ```bash
   ngrok http 8082
   ```
   Update `EXTENSION_BASE_URL` in `app/common/config.js` or `.env` with the active tunnel URL.
2. **Install Extension on Company 95**:
   - Open the **Fynd Partners Panel** (`https://partners.swadeshz5.de` or appropriate cluster).
   - Navigate to the extension (`content-x`) and launch/install it on Company `95`.
   - Complete the OAuth approval screen.
   - The FDK callback will save the offline session to Redis key `groot:1eae1cc8e71ef7353aca113a322d6d50fe83ecf5e734daced5300e864a37a29b`.
3. **Re-run Attempt 1/2**: Once the session token is in Redis, `getProductsBySKUs` and `getProductsByCategoryPaginated` will immediately return live product records from Company 95.
