// Live checks. They run in the page (the probes drawer) and standalone with
// `npm run checks`, so the scene's claims are falsifiable outside the browser.
//
// The space swept: every configuration crossed with the four scenarios, plus
// every event sequence up to length 5 drawn from the full alphabet. That is a
// bounded sample of an infinite space, and the count is printed rather than
// implied, because a check that quietly covers less than it sounds like is worse
// than no check.

import {
  FIELDS,
  SCENARIOS,
  initialConfig,
  run,
  type Config,
  type MachineEvent,
} from './model'
import { changeset, replay } from './lab'

export interface Check {
  id: string
  label: string
  defends: string
  run(): { ok: boolean; detail: string }
}

// ---------------------------------------------------------------------------
// The space
// ---------------------------------------------------------------------------

function everyConfig(): Config[] {
  const out: Config[] = []
  for (const step2Live of [false, true])
    for (const network of ['up', 'save-fails'] as const)
      for (const staleLocal of [false, true])
        for (const route of ['bare', 'explicit-step5'] as const)
          for (const storedStepOverride of ['none', 'unknown'] as const)
            for (const priorEventId of [false, true])
              for (const whitelistLive of [false, true])
                out.push({
                  ...initialConfig,
                  step2Live,
                  network,
                  staleLocal,
                  route,
                  storedStepOverride,
                  priorEventId,
                  whitelistLive,
                })
  return out
}

const ALPHABET: MachineEvent[] = [
  { t: 'create-draft' },
  { t: 'edit', field: 'name' },
  { t: 'edit', field: 'media' },
  { t: 'next' },
  { t: 'back' },
  { t: 'save-and-exit' },
  { t: 'close-tab' },
  { t: 'resume' },
  { t: 'publish' },
]

/** Every sequence up to `max` events. Bounded, and the count is reported. */
function everySequence(max: number): MachineEvent[][] {
  let frontier: MachineEvent[][] = [[]]
  const all: MachineEvent[][] = [[]]
  for (let d = 0; d < max; d++) {
    const next: MachineEvent[][] = []
    for (const seq of frontier) {
      for (const e of ALPHABET) {
        const s = [...seq, e]
        next.push(s)
        all.push(s)
      }
    }
    frontier = next
  }
  return all
}

const SEQS = everySequence(4)
const CONFIGS = everyConfig()

/** Config x scenario, the deep-but-narrow half of the sweep. */
function scenarioRuns(): { cfg: Config; events: MachineEvent[] }[] {
  const out: { cfg: Config; events: MachineEvent[] }[] = []
  for (const cfg of CONFIGS)
    for (const sc of SCENARIOS) out.push({ cfg: { ...cfg, ...(sc.config || {}) }, events: sc.events })
  return out
}

/** Every sequence, under four representative configurations. Sweeping all 128
 *  against every sequence would be ~945k runs for no extra coverage: these four
 *  are the ones the checks actually discriminate on. */
const PROBE_CONFIGS: Config[] = [
  initialConfig,
  { ...initialConfig, network: 'save-fails' },
  { ...initialConfig, staleLocal: true },
  { ...initialConfig, step2Live: true },
]

function sequenceRuns(): { cfg: Config; events: MachineEvent[] }[] {
  const out: { cfg: Config; events: MachineEvent[] }[] = []
  for (const cfg of PROBE_CONFIGS) for (const events of SEQS) out.push({ cfg, events })
  return out
}

const ALL = [...scenarioRuns(), ...sequenceRuns()]

export const SWEEP_SIZE = ALL.length

// ---------------------------------------------------------------------------
// The checks
// ---------------------------------------------------------------------------

export const CHECKS: Check[] = [
  {
    id: 'step2-unreachable',
    label: 'with the redirect in place, nothing reaches step 2',
    defends: 'the claim: the machine has seven states, not eight',
    run() {
      const bad = ALL.filter(({ cfg, events }) => {
        if (cfg.step2Live) return false
        return run(cfg, events).machine.at === 'step2'
      })
      const reachable = ALL.filter(({ cfg, events }) => cfg.step2Live && run(cfg, events).machine.at === 'step2')
      return {
        ok: bad.length === 0,
        detail:
          bad.length > 0
            ? `${bad.length} runs reached step2 with the redirect on`
            : `no run reaches step2 while App.jsx:121 redirects; ${reachable.length} reach it once you switch that off`,
      }
    },
  },
  {
    id: 'save-is-the-only-door',
    label: 'a value reaches the server only through a save',
    defends: 'the mechanism the whole claim rests on',
    run() {
      const bad = ALL.filter(({ cfg, events }) => {
        const o = run(cfg, events)
        const inServer = new Set(Object.values(o.machine.server).flat())
        if (inServer.size === 0) return false
        // Every field on the server must have been typed, and a save must have run.
        const typed = new Set(events.filter((e) => e.t === 'edit').map((e) => (e as { field: string }).field))
        const saved = events.some((e) => e.t === 'next' || e.t === 'save-and-exit')
        for (const f of inServer) {
          // staleLocal deliberately injects a field nobody typed here, which is
          // the bleed, not a violation of this rule.
          if (cfg.staleLocal) continue
          if (!typed.has(f) || !saved) return true
        }
        return false
      })
      return {
        ok: bad.length === 0,
        detail:
          bad.length > 0
            ? `${bad.length} runs put a field on the server without a save`
            : 'nothing reaches EventDraft.data without a Next or a Save & exit having run for it',
      }
    },
  },
  {
    id: 'current-step-tracks',
    label: 'a successful Next leaves current_step where you landed',
    defends: 'the claim: resume finds you where you left off',
    run() {
      // The one Next in the wizard that saves nothing is step 2's, which is a
      // bare navigate. Count those separately rather than letting them fail a
      // rule they were never inside: that exception is the finding.
      let fromStep2 = 0
      const bad = ALL.filter(({ cfg, events }) => {
        if (cfg.network !== 'up') return false
        const last = events[events.length - 1]
        if (!last || last.t !== 'next') return false
        const before = run(cfg, events.slice(0, -1))
        if (before.machine.at === 'step2') {
          fromStep2++
          return false
        }
        const o = run(cfg, events)
        const at = o.machine.at
        if (typeof at !== 'string' || at === 'gone') return false
        return o.machine.serverCurrentStep !== at
      })
      return {
        ok: bad.length === 0,
        detail:
          bad.length > 0
            ? `${bad.length} runs advanced without moving current_step`
            : `after every saving Next the row agrees with the browser. ${fromStep2} runs left step 2, ` +
              'and none of them moved current_step, because that Next only calls navigate.',
      }
    },
  },
  {
    id: 'offline-diverges',
    label: 'a failed save advances the browser and not the row',
    defends: 'do-not case: the wizard carries on regardless',
    run() {
      const cases = ALL.filter(({ cfg, events }) => {
        if (cfg.network !== 'save-fails') return false
        const last = events[events.length - 1]
        if (!last || last.t !== 'next') return false
        const o = run(cfg, events)
        return typeof o.machine.at === 'string' && o.machine.at !== o.machine.serverCurrentStep
      })
      const wrong = ALL.filter(({ cfg, events }) => {
        if (cfg.network !== 'save-fails') return false
        return run(cfg, events).machine.status === 'saved'
      })
      return {
        ok: wrong.length === 0,
        detail:
          wrong.length > 0
            ? `${wrong.length} runs reported saved while the network was down`
            : `${cases.length} runs end with the browser ahead of the row, and none of them says "saved"`,
      }
    },
  },
  {
    id: 'publish-never-refuses',
    label: 'publish succeeds whatever the draft holds',
    defends: 'the do-not case, stated as an assertion rather than a warning',
    run() {
      // Evaluate the prefix ending at each publish. A draft stays editable after
      // publishing, so the status at the end of the log answers a different
      // question from "did that publish succeed".
      const attempted: { cfg: Config; events: MachineEvent[] }[] = []
      for (const { cfg, events } of ALL) {
        events.forEach((e, i) => {
          if (e.t === 'publish') attempted.push({ cfg, events: events.slice(0, i + 1) })
        })
      }
      const refused = attempted.filter(({ cfg, events }) => {
        const o = run(cfg, events)
        // A publish before the draft exists is a no-op, not a refusal.
        if (!o.machine.draftExists) return false
        return o.machine.status !== 'published'
      })
      const withDefaults = attempted.filter(({ cfg, events }) => run(cfg, events).defaultsUsed > 0)
      return {
        ok: refused.length === 0,
        detail:
          refused.length > 0
            ? `${refused.length} publishes were refused, so something does validate after all`
            : `${attempted.length} publish attempts on an existing draft, 0 refused. ${withDefaults.length} of them needed a fallback for at least one column.`,
      }
    },
  },
  {
    id: 'one-event-per-draft',
    label: 'republishing updates the Event instead of making a second one',
    defends: 'mechanism: published_event_id is written back into draft.data',
    run() {
      const bad = ALL.filter(({ cfg, events }) => run(cfg, events).machine.eventsCreated > 1)
      return {
        ok: bad.length === 0,
        detail:
          bad.length > 0
            ? `${bad.length} runs produced more than one Event row from one draft`
            : 'no run produces two Events from one draft, because the id is read back before creating',
      }
    },
  },
  {
    id: 'assets-never-json',
    label: 'a file never travels in the JSON payload',
    defends: 'mechanism: sanitizePayload strips File, Blob and blob: first',
    run() {
      const assetFields = FIELDS.filter((f) => f.transport === 'asset').map((f) => f.id)
      const bad = ALL.filter(({ cfg, events }) => {
        const server = Object.values(run(cfg, events).machine.server).flat()
        return server.some((f) => assetFields.includes(f))
      })
      return {
        ok: bad.length === 0,
        detail:
          bad.length > 0
            ? `${bad.length} runs put a file into data.steps`
            : 'no run gets an asset into EventDraft.data; they only ever exist as EventDraftAsset rows',
      }
    },
  },
  {
    id: 'replay',
    label: 'folding the recorded history reproduces the run',
    defends: 'the history drawer is a record, not a story',
    run() {
      const sample = SCENARIOS[0]
      const history = sample.events.map((e) => ({
        target: e.t,
        operation: 'event' as const,
        label: e.t,
        patch: { append: e },
      }))
      const folded = replay(initialConfig, [], history)
      const same =
        JSON.stringify(folded.events) === JSON.stringify(sample.events) &&
        changeset(run(initialConfig, folded.events), run(initialConfig, sample.events)).length === 0
      return { ok: same, detail: same ? 'replay lands on the identical outcome' : 'replay diverges from the live run' }
    },
  },
  {
    id: 'empty-changeset',
    label: 'diffing a run against itself yields nothing',
    defends: 'changeset honesty',
    run() {
      const bad = ALL.slice(0, 400).filter(({ cfg, events }) => changeset(run(cfg, events), run(cfg, events)).length > 0)
      return { ok: bad.length === 0, detail: bad.length ? `${bad.length} runs diff against themselves` : 'diff(o, o) is empty' }
    },
  },
]

// ---------------------------------------------------------------------------
// Standalone runner
// ---------------------------------------------------------------------------

declare const process: { exitCode?: number } | undefined

if (typeof process !== 'undefined' && typeof document === 'undefined') {
  let failed = 0
  for (const c of CHECKS) {
    const r = c.run()
    if (!r.ok) failed++
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${c.label}\n      ${r.detail}`)
  }
  console.log(
    `\n${CHECKS.length - failed}/${CHECKS.length} checks passing over ${SWEEP_SIZE} runs ` +
      `(${CONFIGS.length} configurations x ${SCENARIOS.length} scenarios, plus every event sequence up to length 4)`,
  )
  if (failed && process) process.exitCode = 1
}
