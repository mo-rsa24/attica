import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { E2E_ORGANIZER } from './global-setup';

const BACKEND = 'http://localhost:8000';

async function loginViaApi(request: APIRequestContext) {
  const res = await request.post(`${BACKEND}/api/token/`, {
    data: { username: E2E_ORGANIZER.username, password: E2E_ORGANIZER.password },
  });
  expect(res.ok()).toBeTruthy();
  return res.json() as Promise<{ access: string; refresh: string }>;
}

async function authedHeaders(request: APIRequestContext) {
  const { access } = await loginViaApi(request);
  return { Authorization: `Bearer ${access}` };
}

async function loginInBrowser(page: Page) {
  // Mirror the login flow used by AuthProvider so the wizard sees a real session.
  const res = await page.request.post(`${BACKEND}/api/accounts/login/`, {
    data: { username: E2E_ORGANIZER.username, password: E2E_ORGANIZER.password },
  });
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  await page.addInitScript((tokens) => {
    if (tokens?.access) localStorage.setItem('authTokens', JSON.stringify(tokens));
  }, data);
}

test.describe('create-event happy path (should pass today)', () => {
  test('creates a draft and lands on step1', async ({ page, request }) => {
    await loginInBrowser(page);
    const headers = await authedHeaders(request);
    const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
    expect(draft.ok()).toBeTruthy();
    const { id } = await draft.json();
    await page.goto(`/listing/${id}/step1`);
    await expect(page).toHaveURL(new RegExp(`/listing/${id}/step1`));
  });
});

test.describe('create-event invariants (known broken — recorded with test.fail)', () => {
  // Defect: ListingStep1.jsx:153-164 + events/serializers.py have no past-date validation.
  test.fail('rejects events with start_date in the past', async ({ request }) => {
    const headers = await authedHeaders(request);
    const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
    const { id } = await draft.json();
    const yesterday = new Date(Date.now() - 86_400_000).toISOString();
    const patch = await request.patch(`${BACKEND}/api/events/event-drafts/${id}/`, {
      headers,
      data: {
        current_step: 'step1',
        data: { steps: { step1: { name: 'Past event', start_date: yesterday } } },
      },
    });
    const publish = await request.post(`${BACKEND}/api/events/event-drafts/${id}/publish/`, {
      headers,
    });
    expect(patch.ok()).toBeTruthy();
    expect(publish.status(), 'publish should reject past-dated events').toBe(400);
  });

  // Defect: no autosave; reactContext.jsx requires explicit "Save & Continue".
  test.fail('autosaves form changes within 2s of typing', async ({ page, request }) => {
    await loginInBrowser(page);
    const headers = await authedHeaders(request);
    const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
    const { id } = await draft.json();

    await page.goto(`/listing/${id}/step1`);
    const nameInput = page.getByLabel(/event name|name/i).first();
    await nameInput.fill('Autosave Test Event');
    await page.waitForTimeout(2_500);

    const reread = await request.get(`${BACKEND}/api/events/event-drafts/${id}/`, { headers });
    const draftAfter = await reread.json();
    const stepData = draftAfter?.data?.steps?.step1 ?? draftAfter?.data?.step1 ?? {};
    expect(stepData.name).toBe('Autosave Test Event');
  });

  // Defect: ListingStep1.jsx:410 is the only step with a beforeunload guard.
  test.fail('prompts before discarding unsaved changes on step3', async ({ page, request }) => {
    await loginInBrowser(page);
    const headers = await authedHeaders(request);
    const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
    const { id } = await draft.json();

    let dialogShown = false;
    page.on('dialog', async (d) => {
      dialogShown = true;
      await d.dismiss();
    });

    await page.goto(`/listing/${id}/step3`);
    // Best-effort: dirty *something* on step3, then go back.
    const anyInput = page.locator('input, textarea').first();
    if (await anyInput.count()) await anyInput.fill('dirty');
    await page.goBack();

    expect(dialogShown, 'expected unsaved-changes confirm() before navigation').toBeTruthy();
  });

  // Defect: events/serializers.py:99 has no range check on base_price.
  test.fail('rejects negative base_price on event create', async ({ request }) => {
    const headers = await authedHeaders(request);
    const res = await request.post(`${BACKEND}/api/events/`, {
      headers,
      data: { name: 'Bad Price', base_price: '-10.00', currency: 'ZAR', date: '2030-01-01' },
    });
    expect(res.status(), 'negative base_price should be rejected').toBe(400);
  });

  // Fixed in Phase 1: events/views.py upload_asset now enforces MAX_UPLOAD_SIZE_BYTES (default 50MB).
  test('rejects oversized image upload (>50MB)', async ({ request }) => {
    const headers = await authedHeaders(request);
    const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
    const { id } = await draft.json();

    const huge = Buffer.alloc(60 * 1024 * 1024, 0xff);
    const res = await request.post(`${BACKEND}/api/events/event-drafts/${id}/assets/`, {
      headers,
      multipart: {
        asset_type: 'media',
        file: { name: 'huge.jpg', mimeType: 'image/jpeg', buffer: huge },
      },
    });
    expect(res.status(), '60MB upload should be rejected').toBeGreaterThanOrEqual(400);
    expect(res.status(), '60MB upload should be 4xx, not 5xx').toBeLessThan(500);
    const body = await res.json().catch(() => ({}));
    const errStr = JSON.stringify(body);
    expect(errStr.toLowerCase()).toContain('too large');
  });

  // Defect: events/views.py:503 — _upsert_event_from_draft is not idempotent.
  test.fail('publishing the same draft twice does not create two events', async ({ request }) => {
    const headers = await authedHeaders(request);
    const draft = await request.post(`${BACKEND}/api/events/event-drafts/`, { headers });
    const { id } = await draft.json();
    await request.patch(`${BACKEND}/api/events/event-drafts/${id}/`, {
      headers,
      data: {
        current_step: 'step1',
        data: {
          steps: {
            step1: {
              name: 'Idempotency Test',
              date: '2030-12-31',
              start_date: '2030-12-31T18:00:00Z',
            },
          },
        },
      },
    });
    const first = await request.post(`${BACKEND}/api/events/event-drafts/${id}/publish/`, {
      headers,
    });
    const second = await request.post(`${BACKEND}/api/events/event-drafts/${id}/publish/`, {
      headers,
    });
    expect(first.ok()).toBeTruthy();
    const firstBody = await first.json();
    const firstEventId = firstBody?.event?.id ?? firstBody?.id;
    if (second.ok()) {
      const secondBody = await second.json();
      const secondEventId = secondBody?.event?.id ?? secondBody?.id;
      expect(secondEventId, 'second publish must reuse the first event id').toBe(firstEventId);
    } else {
      expect(second.status(), 'second publish should be 4xx (already published)').toBeLessThan(500);
    }
  });
});
