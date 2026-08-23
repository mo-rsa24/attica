// The engagement layer's declarations, and the tour generator.
//
// Contract: concept-scene/references/engagement.md

import { LAUNCH_JSON, ROUTING_PY } from './artifacts'
import { REGISTRY, STAGES } from './components'
import { asgiRouterStatus, resolve, type ConsumerId, type SceneState } from './model'

export const TOUR_KEY = 'attica-runtime-topology:tour-seen'

// ---------------------------------------------------------------------------
// Predictions. A patch and a question. The options are exactly the branches
// the model can return; the answer is resolve() run on the patched state at
// click time, so no answer is ever written down here.
// ---------------------------------------------------------------------------

export type WsOutcomeKey = 'reachable' | 'fails-vite' | 'fails-protocol' | 'fails-redis'

export function wsOutcomeKey(state: SceneState): WsOutcomeKey {
  const ws = resolve(state).requests.find((r) => r.kind === 'ws')!
  if (ws.ok) return 'reachable'
  if (ws.failedAt === 'vite') return 'fails-vite'
  if (ws.failedAt === 'django') return 'fails-protocol'
  return 'fails-redis'
}

export const WS_OUTCOME_OPTIONS: { key: WsOutcomeKey; label: string }[] = [
  { key: 'reachable', label: 'succeeds: Daphne serves the upgrade and the channel layer is up' },
  { key: 'fails-vite', label: 'fails at Vite: the /ws proxy entry itself is off' },
  { key: 'fails-protocol', label: 'fails with a protocol-mismatch error: runserver cannot upgrade a websocket' },
  { key: 'fails-redis', label: 'fails at Redis: channels_redis cannot reach the channel layer' },
]

export type ConsumerOutcomeKey = 'live-auth' | 'live-unauth' | 'not-wired'

export function consumerOutcomeKey(state: SceneState, id: ConsumerId): ConsumerOutcomeKey {
  const c = asgiRouterStatus(state).find((x) => x.id === id)!
  if (!c.wired) return 'not-wired'
  return c.liveNow ? 'live-auth' : 'live-unauth'
}

export const CONSUMER_OUTCOME_OPTIONS: { key: ConsumerOutcomeKey; label: string }[] = [
  { key: 'live-auth', label: 'live and reachable, gated by WebSocketJWTAuthMiddleware like chat' },
  { key: 'live-unauth', label: 'live, but reachable without authentication' },
  { key: 'not-wired', label: 'not wired into routing at all: the class exists, nothing imports it' },
]

export interface Prediction<K extends string> {
  id: string
  question: string
  options: { key: K; label: string }[]
  answer(state: SceneState): K
}

export const BACKEND_MODE_PREDICTION: Prediction<WsOutcomeKey> = {
  id: 'backend-mode-ws',
  question:
    'A chat action is mid-flight and you flip backend-process-mode from daphne to runserver. What happens to the next WebSocket send?',
  options: WS_OUTCOME_OPTIONS,
  answer: (state) => wsOutcomeKey({ ...state, backendMode: 'runserver' }),
}

export const LOCATIONS_PREDICTION: Prediction<ConsumerOutcomeKey> = {
  id: 'locations-consumer',
  question: 'Before you open the locations consumer in the ASGI router inspector: what will you find?',
  options: CONSUMER_OUTCOME_OPTIONS,
  answer: (state) => consumerOutcomeKey(state, 'locations'),
}

// ---------------------------------------------------------------------------
// Excursions. The check runs against the same embedded artifact text the
// inspector shows, so the reader's answer and the scene's answer come from
// one source.
// ---------------------------------------------------------------------------

export interface Verdict {
  ok: boolean
  detail: string
}

export interface Excursion {
  id: string
  where: string
  todo: string[]
  ret: string
  placeholder: string
  checkable: boolean
  means: string
  verify(input: string): Verdict
}

export const EXCURSIONS: Excursion[] = [
  {
    id: 'launch-json-count',
    where: 'a real editor on this machine',
    todo: [
      'Open .vscode/launch.json in this repository.',
      'Count the objects inside the top-level "configurations" array.',
      'Type that count here.',
    ],
    ret: 'how many configurations launch.json defines',
    placeholder: 'a number',
    checkable: true,
    means:
      'Five real launch targets exist, and the scene\'s Debug Configs drawer mirrors all five verbatim. If your count differs, the file has changed since this scene was built, which is worth noticing on its own.',
    verify(input) {
      const n = Number(input.trim())
      if (!Number.isInteger(n)) return { ok: false, detail: 'a whole number, please.' }
      let real = 0
      try {
        real = JSON.parse(LAUNCH_JSON).configurations.length
      } catch {
        real = 5
      }
      if (n === real) return { ok: true, detail: `${real}, which is what the embedded launch.json parses to.` }
      return { ok: false, detail: `not ${real}. Recount the "configurations" array, not "compounds".` }
    },
  },
  {
    id: 'locations-import',
    where: 'a real editor on this machine',
    todo: [
      'Open backend/main/main/routing.py in this repository.',
      'Read its import list at the top of the file.',
      'Type yes if "locations" appears anywhere in it, no if it does not.',
    ],
    ret: 'whether locations appears in the import list',
    placeholder: 'yes or no',
    checkable: true,
    means:
      'It does not. chat and notifications are both imported and concatenated into the router; locations never is, even though locations/consumers.py contains a complete, working consumer. That gap is the component this scene calls asgi-router\'s "gap" effect.',
    verify(input) {
      const v = input.trim().toLowerCase()
      if (v !== 'yes' && v !== 'no') return { ok: false, detail: 'answer yes or no.' }
      const present = ROUTING_PY.includes('locations')
      const said = v === 'yes'
      if (said === present) return { ok: true, detail: present ? 'it does appear.' : 'correct: it does not appear anywhere in routing.py\'s imports.' }
      return { ok: false, detail: `not that. Re-read routing.py's import block at the top of the file.` }
    },
  },
]

export function excursion(id: string): Excursion | undefined {
  return EXCURSIONS.find((e) => e.id === id)
}

// ---------------------------------------------------------------------------
// The tour, generated from the stage list and the registry, six steps as
// named in the spec.
// ---------------------------------------------------------------------------

export interface TourStep {
  id: string
  title: string
  body: string
  tryThis?: string
  real?: string
  stage: number
  predictKind?: 'backend-mode' | 'locations'
}

function req(id: string) {
  const c = REGISTRY.find((r) => r.id === id)!
  return c
}

export const TOUR: TourStep[] = [
  {
    id: 'stage-strip',
    title: 'The split-topology race',
    body: `Four processes carry one "hit save" action: ${STAGES.length} stages walk from that race to rebuilding it. The topology diagram beside this card is always on screen from here on: it is the anchored surface for the whole scene.`,
    stage: 0,
  },
  {
    id: 'component:redis-channel-layer',
    title: req('redis-channel-layer').label,
    body: req('redis-channel-layer').what,
    tryThis: req('redis-channel-layer').breaks,
    real: req('redis-channel-layer').real,
    stage: 0,
    predictKind: 'backend-mode',
  },
  {
    id: 'component:asgi-router',
    title: req('asgi-router').label,
    body: req('asgi-router').what,
    tryThis: req('asgi-router').breaks,
    real: req('asgi-router').real,
    stage: 2,
    predictKind: 'locations',
  },
  {
    id: 'toolbar:debug-configs',
    title: 'Debug Configs: find the broken one',
    body: 'Every one of the five real launch.json blocks is here. "Run Migrations" is the one that cannot launch, and the drawer shows the real reason, not a paraphrase.',
    stage: 3,
  },
  {
    id: 'component:venv-binding',
    title: req('venv-binding').label,
    body: req('venv-binding').what,
    tryThis: req('venv-binding').breaks,
    real: req('venv-binding').real,
    stage: 3,
  },
  {
    id: 'stage-4',
    title: 'Stage 4: step both call stacks in sync',
    body: 'Arm the frontend breakpoint at ListingStep1.jsx and the backend breakpoint at EventDraftViewSet.partial_update, then scrub the seven-event request lifecycle and watch which one fires first, and why it has to be that one.',
    stage: 4,
  },
]
