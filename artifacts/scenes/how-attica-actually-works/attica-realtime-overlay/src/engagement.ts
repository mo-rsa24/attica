// The engagement layer: the generated tour, the prediction space, the excursions.
//
// The tour copy is not authored here. It is read off the atlas registry, so a
// change to a node's `what` or `breaks` changes the tour with it, which is the
// whole point of generating it.
//
// Contract: ~/.claude/skills/concept-scene/references/engagement.md

import { EDGES, NODES, byId } from './atlas'

export interface TourStep {
  /** data-tour attribute to anchor against. */
  anchor: string
  heading: string
  body: string
  /** What to try, when the thing breaks. */
  tryIt?: string
  /** The real string it produces. */
  real?: string
  /** Move the scene here before showing this step. */
  goTo?: { stage?: number; focus?: string | null }
}

// The scene is map-first, so the generator uses engagement.md's map-first row:
// one per top-level system, one per interactive edge, one for "go deeper", one
// for the breadcrumb.
//
// That would be 4 + 5 + 1 + 1 = 11, over the cap of 8. The three edges dropped
// are `http`, `write` and `cache`: http's story is told by the vite-proxy node
// one level down, and write and cache are the two edges nothing in the scene
// severs. The two kept are exactly the two whose severing is a lesson.
const KEEP_EDGES = ['ws', 'layer']

export function buildTour(): TourStep[] {
  const steps: TourStep[] = []

  for (const n of NODES.filter((x) => x.level === 'ECOSYSTEM')) {
    steps.push({
      anchor: `node:${n.id}`,
      heading: n.label,
      body: n.what,
      tryIt: n.breaks,
      real: n.real,
      goTo: { stage: 0, focus: null },
    })
  }

  for (const e of EDGES.filter((x) => KEEP_EDGES.includes(x.id))) {
    steps.push({
      anchor: `edge:${e.id}`,
      heading: `${byId(e.from)?.label} to ${byId(e.to)?.label}`,
      body: `Carries ${e.carries}. ${e.consequence}`,
      tryIt: e.severNote,
      goTo: { stage: 0, focus: null },
    })
  }

  steps.push({
    anchor: 'node:daphne',
    heading: 'Any box with a corner mark opens',
    body:
      'Click Daphne and the map becomes what is inside it. The box you opened keeps its outline and ' +
      'its label, so you can always see what you are inside of.',
    goTo: { stage: 0, focus: null },
  })

  steps.push({
    anchor: 'breadcrumb',
    heading: 'And this walks you back out',
    body:
      'The trail is always live: click any step of it to climb back. Nothing about the map moves ' +
      'when you open a box, so you never lose your place.',
    goTo: { stage: 0, focus: 'daphne' },
  })

  return steps
}

export const TOUR = buildTour()

// ---------------------------------------------------------------------------
// Predictions. The options come from the model's own variant list, so nobody
// writes down a correct answer and nobody can write down a wrong one.
// ---------------------------------------------------------------------------

export interface PredictPoint {
  id: string
  /** The question, in the reader's terms. */
  question: string
  /** The node whose control fires it. */
  node: string
}

export const PREDICTIONS: PredictPoint[] = [
  {
    id: 'redis-after',
    node: 'redis',
    question:
      'Redis is about to die, after both sockets already joined the room. The organizer sends a ' +
      'message. What becomes of it?',
  },
  {
    id: 'redis-before',
    node: 'redis',
    question:
      'Redis is about to be down before anyone connects, so the socket cannot join the group at all. ' +
      'What becomes of the message?',
  },
  {
    id: 'token',
    node: 'ws-branch',
    question: 'The access token is about to expire. What becomes of the message?',
  },
  {
    id: 'proxy',
    node: 'vite-proxy',
    question: 'The Vite proxy is about to be switched off. What becomes of the message?',
  },
  {
    id: 'server',
    node: 'daphne',
    question:
      'The server is about to be restarted with manage.py runserver instead of daphne. What becomes ' +
      'of the message?',
  },
]

// ---------------------------------------------------------------------------
// Excursions. Four fields each, and the return is machine-checked where it can be.
// ---------------------------------------------------------------------------

export interface Excursion {
  id: string
  where: string
  does: string
  returns: string
  means: string
  /** 'state' pastes an encoded state back; 'number' types a value; 'none' is unverified. */
  check: 'state' | 'number' | 'none'
  /** For 'number' checks: the answer, read off the live outcome. */
  answerHint?: string
  stage: number
}

export const EXCURSIONS: Excursion[] = [
  {
    id: 'falsify',
    where: 'a terminal in this scene folder, with the file src/model.ts open beside it',
    does:
      'Write a script that imports everyState() and run() from this scene and searches for a ' +
      'configuration where a message is lost: one where the POST succeeded but the row is not in the ' +
      'database afterwards. Print encodeState(state) for any hit.',
    returns:
      'paste the encoded state into the box. The scene decodes it and runs the same run() your ' +
      'script ran.',
    means:
      'A hit falsifies the claim this whole scene makes, and you should trust your script over the ' +
      'prose. No hit means the 256 configurations here all commit before they broadcast, which is ' +
      'the claim, checked rather than asserted.',
    check: 'state',
    stage: 3,
  },
  {
    id: 'swallow',
    where: 'VS Code, at backend/main/chat/utils.py lines 10 to 20',
    does:
      'Read _safe_group_send. Note which exceptions it catches and what it does with them. Then ' +
      'answer: when Redis is unreachable, what HTTP status does POST /api/chat/rooms/7/messages/ return?',
    returns: 'type the status code. The scene compares it against the model\'s httpStatus observable.',
    means:
      'If you said 500, you were reading the code as if the broadcast were part of the write. It is ' +
      'not, and that bare `except Exception` is the line that decides it.',
    check: 'number',
    answerHint: 'httpStatus with redis down after connect',
    stage: 2,
  },
  {
    id: 'real-attica',
    where: 'the real Attica app: two browsers, the backend on :8000, and a terminal',
    does:
      'Open the same chat room in two browsers. Stop Redis (redis-cli shutdown nosave). Send a ' +
      'message from one. Watch the other. Then reload the other.',
    returns:
      'the count of messages the second browser showed before the reload, and after it. Only you can ' +
      'see your own database, so the scene cannot check this one.',
    means:
      'The gap you see before the reload is the exact cost of the overlay, on your machine rather ' +
      'than in a model. The message reappearing on reload is the claim, on your machine too.',
    check: 'none',
    stage: 3,
  },
]
