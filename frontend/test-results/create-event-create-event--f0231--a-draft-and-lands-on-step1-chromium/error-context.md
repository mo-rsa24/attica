# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: create-event.spec.ts >> create-event happy path (should pass today) >> creates a draft and lands on step1
- Location: tests/e2e/create-event.spec.ts:32:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/listing\/36\/step1/
Received string:  "http://localhost:5173/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:5173/login"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - img "Event atmosphere" [ref=e5]
    - generic [ref=e7]:
      - link "Attica" [ref=e8] [cursor=pointer]:
        - /url: /
        - img "Attica" [ref=e9]
      - generic [ref=e10]:
        - heading "Welcome back. Your events await." [level=2] [ref=e11]:
          - text: Welcome back.
          - text: Your events await.
        - paragraph [ref=e12]: Pick up right where you left off — manage your events, connect with vendors, and bring your vision to life.
  - generic [ref=e14]:
    - generic [ref=e15]:
      - heading "Log in to Attica" [level=1] [ref=e16]
      - paragraph [ref=e17]:
        - text: Don't have an account?
        - link "Sign up" [ref=e18] [cursor=pointer]:
          - /url: /register
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]: Username
        - textbox "Username" [ref=e22]:
          - /placeholder: Enter your username
      - generic [ref=e23]:
        - generic [ref=e24]: Password
        - textbox "Password" [ref=e25]:
          - /placeholder: Enter your password
      - button "Log in" [ref=e26] [cursor=pointer]
    - paragraph [ref=e27]: By logging in, you agree to Attica's Terms of Service and Privacy Policy.
```

# Test source

```ts
  1   | import { test, expect, Page, APIRequestContext } from '@playwright/test';
  2   | import { E2E_ORGANIZER } from './global-setup';
  3   | 
  4   | const BACKEND = 'http://localhost:8000';
  5   | 
  6   | async function loginViaApi(request: APIRequestContext) {
  7   |   const res = await request.post(`${BACKEND}/api/token/`, {
  8   |     data: { username: E2E_ORGANIZER.username, password: E2E_ORGANIZER.password },
  9   |   });
  10  |   expect(res.ok()).toBeTruthy();
  11  |   return res.json() as Promise<{ access: string; refresh: string }>;
  12  | }
  13  | 
  14  | async function authedHeaders(request: APIRequestContext) {
  15  |   const { access } = await loginViaApi(request);
  16  |   return { Authorization: `Bearer ${access}` };
  17  | }
  18  | 
  19  | async function loginInBrowser(page: Page) {
  20  |   // Mirror the login flow used by AuthProvider so the wizard sees a real session.
  21  |   const res = await page.request.post(`${BACKEND}/api/accounts/login/`, {
  22  |     data: { username: E2E_ORGANIZER.username, password: E2E_ORGANIZER.password },
  23  |   });
  24  |   expect(res.ok()).toBeTruthy();
  25  |   const data = await res.json();
  26  |   await page.addInitScript((tokens) => {
  27  |     if (tokens?.access) localStorage.setItem('authTokens', JSON.stringify(tokens));
  28  |   }, data);
  29  | }
  30  | 
  31  | test.describe('create-event happy path (should pass today)', () => {
  32  |   test('creates a draft and lands on step1', async ({ page, request }) => {
  33  |     await loginInBrowser(page);
  34  |     const headers = await authedHeaders(request);
  35  |     const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
  36  |     expect(draft.ok()).toBeTruthy();
  37  |     const { id } = await draft.json();
  38  |     await page.goto(`/listing/${id}/step1`);
> 39  |     await expect(page).toHaveURL(new RegExp(`/listing/${id}/step1`));
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  40  |   });
  41  | });
  42  | 
  43  | test.describe('create-event invariants (known broken — recorded with test.fail)', () => {
  44  |   // Defect: ListingStep1.jsx:153-164 + events/serializers.py have no past-date validation.
  45  |   test.fail('rejects events with start_date in the past', async ({ request }) => {
  46  |     const headers = await authedHeaders(request);
  47  |     const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
  48  |     const { id } = await draft.json();
  49  |     const yesterday = new Date(Date.now() - 86_400_000).toISOString();
  50  |     const patch = await request.patch(`${BACKEND}/api/events/event-drafts/${id}/`, {
  51  |       headers,
  52  |       data: {
  53  |         current_step: 'step1',
  54  |         data: { steps: { step1: { name: 'Past event', start_date: yesterday } } },
  55  |       },
  56  |     });
  57  |     const publish = await request.post(`${BACKEND}/api/events/event-drafts/${id}/publish/`, {
  58  |       headers,
  59  |     });
  60  |     expect(patch.ok()).toBeTruthy();
  61  |     expect(publish.status(), 'publish should reject past-dated events').toBe(400);
  62  |   });
  63  | 
  64  |   // Defect: no autosave; reactContext.jsx requires explicit "Save & Continue".
  65  |   test.fail('autosaves form changes within 2s of typing', async ({ page, request }) => {
  66  |     await loginInBrowser(page);
  67  |     const headers = await authedHeaders(request);
  68  |     const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
  69  |     const { id } = await draft.json();
  70  | 
  71  |     await page.goto(`/listing/${id}/step1`);
  72  |     const nameInput = page.getByLabel(/event name|name/i).first();
  73  |     await nameInput.fill('Autosave Test Event');
  74  |     await page.waitForTimeout(2_500);
  75  | 
  76  |     const reread = await request.get(`${BACKEND}/api/events/event-drafts/${id}/`, { headers });
  77  |     const draftAfter = await reread.json();
  78  |     const stepData = draftAfter?.data?.steps?.step1 ?? draftAfter?.data?.step1 ?? {};
  79  |     expect(stepData.name).toBe('Autosave Test Event');
  80  |   });
  81  | 
  82  |   // Defect: ListingStep1.jsx:410 is the only step with a beforeunload guard.
  83  |   test.fail('prompts before discarding unsaved changes on step3', async ({ page, request }) => {
  84  |     await loginInBrowser(page);
  85  |     const headers = await authedHeaders(request);
  86  |     const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
  87  |     const { id } = await draft.json();
  88  | 
  89  |     let dialogShown = false;
  90  |     page.on('dialog', async (d) => {
  91  |       dialogShown = true;
  92  |       await d.dismiss();
  93  |     });
  94  | 
  95  |     await page.goto(`/listing/${id}/step3`);
  96  |     // Best-effort: dirty *something* on step3, then go back.
  97  |     const anyInput = page.locator('input, textarea').first();
  98  |     if (await anyInput.count()) await anyInput.fill('dirty');
  99  |     await page.goBack();
  100 | 
  101 |     expect(dialogShown, 'expected unsaved-changes confirm() before navigation').toBeTruthy();
  102 |   });
  103 | 
  104 |   // Defect: events/serializers.py:99 has no range check on base_price.
  105 |   test.fail('rejects negative base_price on event create', async ({ request }) => {
  106 |     const headers = await authedHeaders(request);
  107 |     const res = await request.post(`${BACKEND}/api/events/`, {
  108 |       headers,
  109 |       data: { name: 'Bad Price', base_price: '-10.00', currency: 'ZAR', date: '2030-01-01' },
  110 |     });
  111 |     expect(res.status(), 'negative base_price should be rejected').toBe(400);
  112 |   });
  113 | 
  114 |   // Fixed in Phase 1: events/views.py upload_asset now enforces MAX_UPLOAD_SIZE_BYTES (default 50MB).
  115 |   test('rejects oversized image upload (>50MB)', async ({ request }) => {
  116 |     const headers = await authedHeaders(request);
  117 |     const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
  118 |     const { id } = await draft.json();
  119 | 
  120 |     const huge = Buffer.alloc(60 * 1024 * 1024, 0xff);
  121 |     const res = await request.post(`${BACKEND}/api/events/event-drafts/${id}/assets/`, {
  122 |       headers,
  123 |       multipart: {
  124 |         asset_type: 'media',
  125 |         file: { name: 'huge.jpg', mimeType: 'image/jpeg', buffer: huge },
  126 |       },
  127 |     });
  128 |     expect(res.status(), '60MB upload should be rejected').toBeGreaterThanOrEqual(400);
  129 |     expect(res.status(), '60MB upload should be 4xx, not 5xx').toBeLessThan(500);
  130 |     const body = await res.json().catch(() => ({}));
  131 |     const errStr = JSON.stringify(body);
  132 |     expect(errStr.toLowerCase()).toContain('too large');
  133 |   });
  134 | 
  135 |   // Defect: events/views.py:503 — _upsert_event_from_draft is not idempotent.
  136 |   test.fail('publishing the same draft twice does not create two events', async ({ request }) => {
  137 |     const headers = await authedHeaders(request);
  138 |     const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
  139 |     const { id } = await draft.json();
```