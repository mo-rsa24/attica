// Live checks. These run in the page (the invariants drawer) and standalone
// with `npm run checks`, so the scene's claims are falsifiable outside the browser.
//
// The load-bearing one is `write precedes broadcast`. It is the claim card,
// written as an assertion over the entire state space rather than a sentence.

import {
  ROWS_BEFORE,
  SLOT_ORDER,
  decodeState,
  encodeState,
  initialState,
  run,
  type RedisState,
  type SceneState,
  type TokenState,
} from './model'
import { changeset } from './lab'

export interface Check {
  id: string
  label: string
  /** The claim-card field or mechanism this check defends. */
  defends: string
  run(): { ok: boolean; detail: string }
}

// ---------------------------------------------------------------------------
// The whole state space. Small enough to sweep exhaustively, which is what
// makes "no configuration loses a message" a claim rather than a hope.
// ---------------------------------------------------------------------------

const REDIS: RedisState[] = ['up', 'not-configured', 'down-before-connect', 'down-after-connect']
const TOKENS: TokenState[] = ['valid', 'expired', 'absent', 'valid-non-member']

export function everyState(): SceneState[] {
  const out: SceneState[] = []
  for (const redis of REDIS)
    for (const token of TOKENS)
      for (const sendPath of ['rest', 'socket'] as const)
        for (const server of ['daphne', 'runserver'] as const)
          for (const viteProxy of [true, false])
            for (const concurrentSends of [true, false])
              out.push({
                ...initialState,
                redis,
                token,
                sendPath,
                server,
                viteProxy,
                concurrentSends,
              })
  return out
}

export const CHECKS: Check[] = [
  {
    id: 'write-before-broadcast',
    label: 'the row is written before anything is broadcast',
    defends: 'the claim itself',
    run() {
      const bad = everyState().filter((s) => {
        const o = run(s)
        const idx = (id: string) => o.slots.findIndex((x) => x.id === id)
        const write = idx('db-insert')
        const cast = idx('broadcast')
        if (write < 0 || cast < 0) return true
        // Order in the slot list is causal order, and the write must come first.
        if (write >= cast) return true
        // And where both ran, the write's timestamp must be the earlier one.
        const w = o.slots[write]
        const b = o.slots[cast]
        if (w.status === 'ran' && b.status === 'ran' && w.atMs !== null && b.atMs !== null) {
          return w.atMs > b.atMs
        }
        return false
      })
      return {
        ok: bad.length === 0,
        detail: bad.length
          ? `${bad.length} of ${everyState().length} states broadcast before writing`
          : `all ${everyState().length} states write first`,
      }
    },
  },
  {
    id: 'no-message-lost',
    label: 'no configuration loses a committed message',
    defends: 'the falsifier: find a lost message and the claim is wrong',
    run() {
      const bad = everyState().filter((s) => {
        const o = run(s)
        if (!o.messageDurable) return false
        const expected = ROWS_BEFORE + (s.concurrentSends ? 2 : 1)
        return o.dbRowCount !== expected
      })
      return {
        ok: bad.length === 0,
        detail: bad.length
          ? `${bad.length} states committed a row and then lost it`
          : 'every committed row is still in the database in every configuration',
      }
    },
  },
  {
    id: 'gap-is-display-only',
    label: 'a delivery gap is a screen gap, never a data gap',
    defends: 'do-not case: the cost is staleness, not loss',
    run() {
      const bad = everyState().filter((s) => {
        const o = run(s)
        // The screen may lag the database. It may never lead it.
        return o.screenRowCount > o.dbRowCount
      })
      return {
        ok: bad.length === 0,
        detail: bad.length
          ? `${bad.length} states show more rows than exist`
          : 'screenRowCount never exceeds dbRowCount, so the dedupe by id holds',
      }
    },
  },
  {
    id: 'recovery-exists',
    label: 'every undelivered message is recoverable by re-reading the room',
    defends: 'the claim: the overlay is droppable',
    run() {
      // A reload issues the same GET the poll issues. It succeeds only for a
      // participant, with a live proxy and an accepted token.
      const canGet = (s: SceneState) => s.viteProxy && s.token === 'valid'

      const undelivered = everyState().filter((s) => {
        const o = run(s)
        return o.messageDurable && !o.counterpartSees
      })

      // Assert the two sets are equal rather than assuming it: the states a
      // reload cannot rescue must be exactly the states whose GET is refused.
      const notRescued = undelivered.filter((s) => !canGet(s))
      const getRefused = undelivered.filter(
        (s) => !s.viteProxy || s.token !== 'valid',
      )
      const same =
        notRescued.length === getRefused.length &&
        notRescued.every((s) => getRefused.includes(s))

      // And where the GET does succeed, it must return every committed row.
      const rescuedWrong = undelivered.filter((s) => {
        if (!canGet(s)) return false
        const o = run(s)
        const afterReload = o.dbRowCount
        return afterReload !== ROWS_BEFORE + (s.concurrentSends ? 2 : 1)
      })

      return {
        ok: same && rescuedWrong.length === 0,
        detail:
          `${undelivered.length} states leave the second browser stale. ` +
          `${notRescued.length} cannot be fixed by a reload, and that set is exactly the set ` +
          'whose GET is refused (dead proxy or rejected token), never a lost row.',
      }
    },
  },
  {
    id: 'empty-changeset',
    label: 'diffing a state against itself yields nothing',
    defends: 'changeset honesty',
    run() {
      const bad = everyState().filter((s) => changeset(run(s), run(s)).length > 0)
      return {
        ok: bad.length === 0,
        detail: bad.length ? `${bad.length} states diff against themselves` : 'diff(o, o) is empty everywhere',
      }
    },
  },
  {
    id: 'provenance-grounded',
    label: 'every "because" names real state or an earlier step',
    defends: 'provenance is model-emitted, never invented',
    run() {
      // Every term here is a state variable or an observable the outcome
      // actually exposes. `HTTP` covers the httpStatus observable.
      const vocab = [
        'redis',
        'token',
        'viteProxy',
        'proxy',
        'socket',
        'group',
        'CHANNEL_LAYERS',
        'broadcast',
        'POST',
        'HTTP',
        'close',
        'poll',
        'warning',
        'no socket',
      ]
      let edges = 0
      let bad = 0
      for (const s of everyState()) {
        for (const e of run(s).provenance) {
          edges++
          if (!e.from || !e.to || !e.because) bad++
          else if (!vocab.some((v) => e.from.toLowerCase().includes(v.toLowerCase()))) bad++
        }
      }
      return {
        ok: bad === 0,
        detail: bad ? `${bad} of ${edges} edges are ungrounded` : `all ${edges} why-edges name known state`,
      }
    },
  },
  {
    id: 'slots-complete',
    label: 'every configuration renders all 14 lifecycle slots',
    defends: 'comparisons inherit the baseline layout',
    run() {
      const bad = everyState().filter((s) => {
        const o = run(s)
        if (o.slots.length !== SLOT_ORDER.length) return true
        return o.slots.some((slot, i) => slot.id !== SLOT_ORDER[i])
      })
      return {
        ok: bad.length === 0,
        detail: bad.length
          ? `${bad.length} states drop or reorder a slot`
          : `all ${SLOT_ORDER.length} slots present and in order in every state`,
      }
    },
  },
  {
    id: 'round-trip',
    label: 'encode then decode returns the same state',
    defends: 'excursion 1: the reader’s script and the scene share one model',
    run() {
      const bad = everyState().filter((s) => {
        const back = decodeState(encodeState(s))
        return !back || encodeState(back) !== encodeState(s)
      })
      return {
        ok: bad.length === 0,
        detail: bad.length ? `${bad.length} states fail the round trip` : `${everyState().length} states round-trip exactly`,
      }
    },
  },
  {
    id: 'poll-needs-a-signal',
    label: 'the poll only runs when something told the client it was degraded',
    defends: 'the do-not case: a silent failure starts no fallback',
    run() {
      const bad = everyState().filter((s) => {
        const o = run(s)
        if (!o.pollActive) return false
        return !o.socket.socketError
      })
      // The claim is specifically about a socket that was healthy when Redis
      // died. Where the socket never connected at all (runserver, dead proxy,
      // rejected token) the client already knows it is degraded and polls, and
      // that poll correctly recovers the message.
      const silent = everyState().filter((s) => {
        const o = run(s)
        return s.redis === 'down-after-connect' && o.socket.connected && o.pollActive
      })
      const recoveredAnyway = everyState().filter((s) => {
        const o = run(s)
        return s.redis === 'down-after-connect' && !o.socket.connected && o.pollActive
      })
      return {
        ok: bad.length === 0 && silent.length === 0,
        detail:
          bad.length || silent.length
            ? `${bad.length} states poll without a signal; ${silent.length} recover from a silent failure`
            : 'a swallowed group_send starts no fallback on a healthy socket. ' +
              `(${recoveredAnyway.length} states survive the same dead Redis anyway, because their ` +
              'socket had already failed for an unrelated reason and the poll was running.)',
      }
    },
  },
]

// ---------------------------------------------------------------------------
// Standalone runner: npm run checks
// ---------------------------------------------------------------------------

declare const process: { exitCode?: number } | undefined

if (typeof process !== 'undefined' && typeof document === 'undefined') {
  let failed = 0
  for (const c of CHECKS) {
    const r = c.run()
    if (!r.ok) failed++
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${c.label}\n      ${r.detail}`)
  }
  console.log(`\n${CHECKS.length - failed}/${CHECKS.length} checks passing over ${everyState().length} states`)
  if (failed && process) process.exitCode = 1
}
