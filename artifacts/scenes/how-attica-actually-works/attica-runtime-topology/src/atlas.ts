// The system atlas: level 0 (ecosystem) and level 1 (subsystem) merged into
// one diagram, since Redis's two DBs and ASGI's protocol split are exactly
// the detail that makes level 0 legible rather than a separate level with
// nothing new to show at level 0 alone. Level 2 (implementation) is reached
// by clicking a node or edge: the real file, the real line, the real class.
//
// Nodes and edges are laid out here as data; Topology.tsx only draws them and
// reads live status from resolve(). No node position or edge state is
// computed twice.

import type { ProcessId, RequestTrace } from './model'

export interface AtlasNode {
  id: ProcessId
  label: string
  sub: string
  x: number
  y: number
  /** the real logo key Topology.tsx renders, or null for a generic glyph (the browser has no single vendor) */
  logo: 'vite' | 'django' | 'redis' | 'react' | null
}

export const NODES: AtlasNode[] = [
  { id: 'browser', label: 'Browser', sub: 'React 19', x: 40, y: 160, logo: 'react' },
  { id: 'vite', label: 'Vite dev server', sub: ':5173, HMR + proxy', x: 260, y: 160, logo: 'vite' },
  { id: 'django', label: 'Django / DRF', sub: ':8000 http', x: 500, y: 80, logo: 'django' },
  { id: 'channels', label: 'Channels (ASGI ws)', sub: ':8000 websocket', x: 500, y: 240, logo: 'django' },
  { id: 'redis', label: 'Redis', sub: '127.0.0.1:6379, two DBs', x: 740, y: 160, logo: 'redis' },
]

export type EdgeId = 'browser-vite' | 'vite-django' | 'vite-channels' | 'django-redis' | 'channels-redis'

export interface AtlasEdge {
  id: EdgeId
  source: ProcessId
  target: ProcessId
  role: string
  carries: string
  /** what clicking the edge inspects: which registry component ids explain it */
  inspects: string[]
  severable: boolean
}

export const EDGES: AtlasEdge[] = [
  {
    id: 'browser-vite',
    source: 'browser',
    target: 'vite',
    role: 'the only origin the browser ever talks to in dev',
    carries: 'every fetch(), every WebSocket, all HMR traffic',
    inspects: ['vite-dev-server'],
    severable: true,
  },
  {
    id: 'vite-django',
    source: 'vite',
    target: 'django',
    role: 'the dev-only proxy that makes one origin look like two backends',
    carries: '/api, /vendors, /cart, /checkout, forwarded unchanged',
    inspects: ['vite-proxy-map'],
    severable: true,
  },
  {
    id: 'vite-channels',
    source: 'vite',
    target: 'channels',
    role: 'the ws:true proxy entry, the only one that upgrades protocol',
    carries: '/ws/chat/rooms/<id>/, /ws/notifications/',
    inspects: ['vite-proxy-map', 'backend-process-mode'],
    severable: true,
  },
  {
    id: 'django-redis',
    source: 'django',
    target: 'redis',
    role: 'the cache backend, DB 1',
    carries: 'get_user_permissions() cache.get()/cache.set()',
    inspects: ['redis-cache'],
    severable: true,
  },
  {
    id: 'channels-redis',
    source: 'channels',
    target: 'redis',
    role: 'the channel layer, DB 0',
    carries: 'group_add(), group_send(), for chat and notifications',
    inspects: ['redis-channel-layer'],
    severable: true,
  },
]

export function nodeOf(id: ProcessId): AtlasNode {
  return NODES.find((n) => n.id === id)!
}

export type EdgeStatus = 'live' | 'dead' | 'unreached'

const EDGE_LOOKUP: Record<string, EdgeId> = {
  'browser>vite': 'browser-vite',
  'vite>django': 'vite-django',
  'vite>channels': 'vite-channels',
  'django>redis': 'django-redis',
  'channels>redis': 'channels-redis',
}

/**
 * Derived strictly from resolve()'s own hop lists, never recomputed from raw
 * state: an edge is 'live' if any request actually traversed it successfully,
 * 'dead' if every attempt died right there, 'unreached' if no request's path
 * ever got far enough to try it.
 */
export function edgeStatuses(requests: RequestTrace[]): Record<EdgeId, EdgeStatus> {
  const status: Record<EdgeId, EdgeStatus> = {
    'browser-vite': 'unreached',
    'vite-django': 'unreached',
    'vite-channels': 'unreached',
    'django-redis': 'unreached',
    'channels-redis': 'unreached',
  }
  for (const r of requests) {
    for (let i = 0; i < r.hops.length - 1; i++) {
      const key = `${r.hops[i].process}>${r.hops[i + 1].process}`
      const id = EDGE_LOOKUP[key]
      if (!id) continue
      const ok = r.hops[i + 1].ok
      if (ok) status[id] = 'live'
      else if (status[id] !== 'live') status[id] = 'dead'
    }
  }
  return status
}
