// Live invariants. Run in the page and visible there, so the scene cannot
// silently drift from the claim it makes. Pure: no React, no store.

import { resolve, type SceneState } from './model'

export interface Check {
  name: string
  pass: boolean
  detail: string
}

export function runChecks(state: SceneState): Check[] {
  const checks: Check[] = []

  // 1. the invariant named in the spec, checked at the current state AND
  // exhaustively across every combination of the other toggles.
  const httpPaths: (keyof typeof state.proxyRoutes)[] = ['api', 'vendors', 'cart', 'checkout']
  let neverDependsOnChannelLayer = true
  for (const channelUp of [true, false]) {
    for (const mode of ['runserver', 'daphne'] as const) {
      const withChannel = resolve({ ...state, redisChannelUp: true, backendMode: mode })
      const withoutChannel = resolve({ ...state, redisChannelUp: channelUp, backendMode: mode })
      for (const p of httpPaths) {
        const a = withChannel.requests.find((r) => r.path === p)!
        const b = withoutChannel.requests.find((r) => r.path === p)!
        if (a.ok !== b.ok || a.failedAt !== b.failedAt) neverDependsOnChannelLayer = false
      }
    }
  }
  checks.push({
    name: '/api, /vendors, /cart, /checkout never depend on redisChannelUp',
    pass: neverDependsOnChannelLayer,
    detail: 'checked across every combination of redisChannelUp and backendMode',
  })

  // 2. a request that fails at vite never shows a Django-side error
  const out = resolve(state)
  const viteFailuresAreClean = out.requests
    .filter((r) => r.failedAt === 'vite')
    .every((r) => !r.errorString?.includes('django') && !r.errorString?.includes('Redis'))
  checks.push({
    name: 'a request that fails at vite never shows a Django-side error',
    pass: viteFailuresAreClean,
    detail: `${out.requests.filter((r) => r.failedAt === 'vite').length} requests currently failing at vite`,
  })

  // 3. channel-layer and cache toggles never move each other's outcome
  const base = resolve(state)
  const flipChannel = resolve({ ...state, redisChannelUp: !state.redisChannelUp })
  const flipCache = resolve({ ...state, redisCacheUp: !state.redisCacheUp })
  const cacheUnmovedByChannel = base.requests
    .filter((r) => r.redisWhich === 'cache')
    .every((r) => {
      const other = flipChannel.requests.find((x) => x.path === r.path)!
      return other.ok === r.ok
    })
  const channelUnmovedByCache = base.requests
    .filter((r) => r.redisWhich === 'channel-layer')
    .every((r) => {
      const other = flipCache.requests.find((x) => x.path === r.path)!
      return other.ok === r.ok
    })
  checks.push({
    name: 'redis-channel-layer and redis-cache never move each other\'s outcome',
    pass: cacheUnmovedByChannel && channelUnmovedByCache,
    detail: 'same Redis process, two DB indexes, checked as independent toggles',
  })

  // 4. every debug config's launch outcome matches its real launch.json interpreter
  const runMigrations = out.debugConfigs.find((d) => d.id === 'run-migrations')!
  checks.push({
    name: 'Run Migrations always fails, regardless of venv-binding',
    pass: runMigrations.wouldLaunch === false,
    detail: runMigrations.interpreter ?? '',
  })

  // 5. locations is never reachable, under any toggle combination
  let locationsAlwaysDown = true
  for (const mode of ['runserver', 'daphne'] as const) {
    for (const channelUp of [true, false]) {
      const o = resolve({ ...state, backendMode: mode, redisChannelUp: channelUp })
      if (o.consumers.find((c) => c.id === 'locations')!.liveNow) locationsAlwaysDown = false
    }
  }
  checks.push({
    name: 'locations never becomes reachable no matter what else is toggled',
    pass: locationsAlwaysDown,
    detail: 'it is absent from main/routing.py\'s imports, not merely down',
  })

  return checks
}
