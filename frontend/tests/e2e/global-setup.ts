import { request, FullConfig } from '@playwright/test';

export const E2E_ORGANIZER = {
  username: 'e2e-organizer',
  email: 'e2e-organizer@attica.test',
  password: 'E2eOrganizerPass!23',
};

async function globalSetup(_config: FullConfig) {
  const ctx = await request.newContext({ baseURL: 'http://localhost:8000' });
  const res = await ctx.post('/api/accounts/login/', {
    data: { username: E2E_ORGANIZER.username, password: E2E_ORGANIZER.password },
  });
  if (!res.ok()) {
    throw new Error(
      `E2E organizer login failed (${res.status()}). Did 'python manage.py seed_e2e' run? Body: ${await res.text()}`,
    );
  }
  await ctx.dispose();
}

export default globalSetup;
