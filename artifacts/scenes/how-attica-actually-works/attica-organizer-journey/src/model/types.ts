// Types for the one model. Everything the scene renders derives from World.

export type StageId = 'login' | 'profile' | 'draft' | 'booking'

export type TableName =
  | 'users_customuser'
  | 'users_role'
  | 'users_userprofile'
  | 'artists_artist'
  | 'events_eventdraft'
  | 'events_eventdraftasset'
  | 'events_event'
  | 'scheduling_marketplaceresource'
  | 'scheduling_availabilityslot'
  | 'scheduling_bookingrequest'
  | 'scheduling_booking'
  | 'scheduling_idempotencyrecord'
  | 'scheduling_auditlog'
  | 'scheduling_outboxevent'
  | 'notifications_notification'
  | 'chat_chatroom'
  | 'chat_chatbid'
  | 'chat_booking'

/** A file:line pointer into the real Attica repo, plus why that line did this. */
export type Source = {
  file: string
  line: number
  note: string
}

export type Row = {
  id: number
  /** Stable identity across every view, so a row stays the same object visually. */
  sid: string
  fields: Record<string, unknown>
}

export type Table = {
  name: TableName
  label: string
  rows: Row[]
}

/** One HTTP request, traced through all four layers. */
export type Call = {
  /** Stable id, so the same call is the same object in every view. */
  cid: string
  stage: StageId
  method: 'GET' | 'POST' | 'PATCH' | 'PUT'
  path: string
  /** Frontend file that fired it. */
  trigger: Source
  /** Django view (and serializer, where one is involved). */
  handler: Source
  serializer?: Source
  /** Tables this call reads. */
  reads: TableName[]
  /** Tables this call writes. */
  writes: TableName[]
  status: number
  requestBody?: string
  responseBody: string
  /** Set when the call did not do what its name suggests. */
  surprise?: string
}

/** A model-emitted reason a field ended up the way it did. */
export type Why = {
  claim: string
  chain: { text: string; source?: Source }[]
}

export type FieldChange = {
  table: TableName
  sid: string
  field: string
  before: unknown
  after: unknown
  source: Source
}

export type ClientState = {
  localStorage: Record<string, string>
  /** The in-memory user object AuthProvider holds. */
  user: Record<string, unknown> | null
  /** Where the browser is. */
  route: string
  /** What the current screen renders, in the screen's own words. */
  screen: string
}

export type World = {
  tables: Record<TableName, Table>
  client: ClientState
  calls: Call[]
  /** Per stage: what the route/model names promise vs what the trace produced. */
  verdicts: Record<StageId, { names: string; trace: string; diverges: boolean }>
  /**
   * Model-emitted provenance. Keys are either stable ("table.sid.field", a probe id)
   * or step-scoped ("open_profile:client.route") when the field they explain changes
   * again later for a different reason.
   */
  why: Record<string, Why>
  /** The step that ran last, so a step-scoped chain is only offered for its own step. */
  lastStep: StepId | null
  /** Probe id => value. */
  probes: Record<string, number | string>
  /** Human-readable log line per applied step. */
  log: string[]
}

export type StepId =
  | 'login'
  | 'fetch_me'
  | 'open_profile'
  | 'open_profile_edit'
  | 'open_my_events'
  | 'create_draft'
  | 'patch_step1'
  | 'patch_step3'
  | 'patch_step4'
  | 'patch_step5'
  | 'upload_asset'
  | 'patch_step6'
  | 'patch_step7'
  | 'patch_step8'
  | 'leave'
  | 'resume'
  | 'publish'
  | 'open_artist'
  | 'open_book_artist'
  | 'submit_booking'
  | 'resubmit_booking'
  | 'accept_chat_bid'

export type Step = { id: StepId; label: string; stage: StageId }

/** The learner-manipulable variables. Nothing else is state. */
export type Knobs = {
  /** Is user_type in UserSerializer.fields? Real repo: false. */
  serializeUserType: boolean
  /** Does this user have an Artist row, and how ProfileRedirect finds it. */
  artistRow: 'none' | 'via_field' | 'via_query'
  /** Is there a Link/navigate to /organizers/:id anywhere? Real repo: false. */
  organizerPageReachable: boolean
  /** Does a MarketplaceResource exist for the artist's owner? Real repo default: false. */
  resourceExists: boolean
  /** What GET /api/events/my-events/ returns. Real repo: 'drafts_published'. */
  myEventsShape: 'drafts_published' | 'bare_array' | 'paginated_results'
  /** Does schedulingApi send the Idempotency-Key header? Real repo: true. */
  idempotencyHeader: boolean
  /** Is there a BookingRequest for the bid's organizer + resource owner? */
  chatBidHasMatch: boolean
  /** The counterfactual axis: which page the booking is submitted from. */
  bookingEntry: 'book_artist_page' | 'wizard_provider_card'
}

export const DEFAULT_KNOBS: Knobs = {
  serializeUserType: false,
  artistRow: 'none',
  organizerPageReachable: false,
  resourceExists: false,
  myEventsShape: 'drafts_published',
  idempotencyHeader: true,
  chatBidHasMatch: false,
  bookingEntry: 'book_artist_page',
}

/** A semantic intervention, recorded so history and replay derive from it. */
export type Intervention = {
  n: number
  kind: 'knob' | 'step'
  label: string
  /** "artistRow: none -> via_query" */
  detail: string
  changes: FieldChange[]
  callsAdded: string[]
}
