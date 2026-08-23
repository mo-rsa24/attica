// The one model. Every panel in the scene reads run(knobs, cursor) and nothing else.
// A pure reducer over ordered journey steps: order is load-bearing here (a draft must
// exist before it can be resumed, an Event must exist before finalize_draft_bookings
// can attach anything to it).

import type {
  Call, FieldChange, Knobs, Row, StageId, Step, StepId, Table, TableName, World, Why,
} from './types'

const ORGANIZER_ID = 7
const ARTIST_OWNER_ID = 12
const ARTIST_ID = 4
const DRAFT_ID = 19
const RESOURCE_ID = 6

export const STEPS: Step[] = [
  { id: 'login', label: 'Submit the login form', stage: 'login' },
  { id: 'fetch_me', label: 'AuthProvider re-reads the user', stage: 'login' },
  { id: 'open_profile', label: 'Open /profile', stage: 'profile' },
  { id: 'open_profile_edit', label: 'Land on /profile/edit', stage: 'profile' },
  { id: 'open_my_events', label: 'Open /my-events', stage: 'profile' },
  { id: 'create_draft', label: 'Start a new event', stage: 'draft' },
  { id: 'patch_step1', label: 'Save step1 (name, date, capacity)', stage: 'draft' },
  { id: 'patch_step3', label: 'Save step3 (location, artists, vendors)', stage: 'draft' },
  { id: 'patch_step4', label: 'Save step4 (chosen location)', stage: 'draft' },
  { id: 'patch_step5', label: 'Save step5 (budget, seating)', stage: 'draft' },
  { id: 'upload_asset', label: 'Upload the banner image', stage: 'draft' },
  { id: 'leave', label: 'Close the tab', stage: 'draft' },
  { id: 'resume', label: 'Resume from /my-events', stage: 'draft' },
  { id: 'patch_step6', label: 'Save step6 (tiered prices)', stage: 'draft' },
  { id: 'patch_step7', label: 'Save step7 (features)', stage: 'draft' },
  { id: 'patch_step8', label: 'Save step8', stage: 'draft' },
  { id: 'publish', label: 'Publish', stage: 'draft' },
  { id: 'open_artist', label: 'Open the artist profile', stage: 'booking' },
  { id: 'open_book_artist', label: 'Click Request Booking', stage: 'booking' },
  { id: 'submit_booking', label: 'Submit the booking request', stage: 'booking' },
  { id: 'resubmit_booking', label: 'Double-click submit', stage: 'booking' },
  { id: 'accept_chat_bid', label: 'Accept a ChatBid in DM', stage: 'booking' },
]

export const STAGES: { id: StageId; n: number; title: string; sub: string }[] = [
  { id: 'login', n: 1, title: 'Login', sub: 'POST /api/accounts/login/' },
  { id: 'profile', n: 2, title: 'Profile', sub: '/profile and /my-events' },
  { id: 'draft', n: 3, title: 'Create and resume', sub: 'one JSON column, eight steps' },
  { id: 'booking', n: 4, title: 'Book an artist', sub: 'a separate app entirely' },
]

const TABLE_LABELS: Record<TableName, string> = {
  users_customuser: 'users.CustomUser',
  users_role: 'users.Role',
  users_userprofile: 'users.UserProfile',
  artists_artist: 'artists.Artist',
  events_eventdraft: 'events.EventDraft',
  events_eventdraftasset: 'events.EventDraftAsset',
  events_event: 'events.Event',
  scheduling_marketplaceresource: 'scheduling.MarketplaceResource',
  scheduling_availabilityslot: 'scheduling.AvailabilitySlot',
  scheduling_bookingrequest: 'scheduling.BookingRequest',
  scheduling_booking: 'scheduling.Booking',
  scheduling_idempotencyrecord: 'scheduling.IdempotencyRecord',
  scheduling_auditlog: 'scheduling.AuditLog',
  scheduling_outboxevent: 'scheduling.OutboxEvent',
  notifications_notification: 'notifications.Notification',
  chat_chatroom: 'chat.ChatRoom',
  chat_chatbid: 'chat.ChatBid',
  chat_booking: 'chat.Booking',
}

const ALL_TABLES = Object.keys(TABLE_LABELS) as TableName[]

function emptyTables(): Record<TableName, Table> {
  const out = {} as Record<TableName, Table>
  for (const name of ALL_TABLES) out[name] = { name, label: TABLE_LABELS[name], rows: [] }
  return out
}

function seed(knobs: Knobs): World {
  const t = emptyTables()

  t.users_role.rows = [
    { id: 1, sid: 'role:EVENT_ORGANIZER', fields: { name: 'EVENT_ORGANIZER' } },
    { id: 2, sid: 'role:ARTIST', fields: { name: 'ARTIST' } },
  ]
  t.users_customuser.rows = [
    {
      id: ORGANIZER_ID, sid: 'user:organizer',
      fields: {
        username: 'thandi', email: 'thandi@example.com',
        user_type: 'organizer', roles: ['EVENT_ORGANIZER'],
      },
    },
    {
      id: ARTIST_OWNER_ID, sid: 'user:artist_owner',
      fields: {
        username: 'nomvula', email: 'nomvula@example.com',
        user_type: 'artist', roles: ['ARTIST'],
      },
    },
  ]
  t.users_userprofile.rows = [
    { id: 3, sid: 'profile:organizer', fields: { user: ORGANIZER_ID, bio: '', profile_picture: null } },
  ]
  t.artists_artist.rows = [
    {
      id: ARTIST_ID, sid: 'artist:nomvula',
      fields: {
        name: 'Nomvula Sound', owner: ARTIST_OWNER_ID, user: ARTIST_OWNER_ID,
        booking_fee: '18000.00',
      },
    },
  ]

  // The artist's Artist row exists whatever happens; whether they are BOOKABLE is a
  // separate row in a separate app, created only if they opted in on
  // ProviderAvailabilityPage. Default: they did not.
  if (knobs.resourceExists) {
    t.scheduling_marketplaceresource.rows = [
      {
        id: RESOURCE_ID, sid: 'resource:nomvula',
        fields: {
          owner: ARTIST_OWNER_ID, resource_type: 'artist',
          display_name: 'Nomvula Sound', is_active: true, artist: ARTIST_ID,
        },
      },
    ]
  }

  // The organizer's Artist row: normally absent. The knob adds one to show what
  // ProfileRedirect does when it finds one.
  if (knobs.artistRow !== 'none') {
    t.artists_artist.rows.push({
      id: 9, sid: 'artist:organizer_side',
      fields: { name: 'Thandi (artist side project)', owner: ORGANIZER_ID, user: ORGANIZER_ID, booking_fee: null },
    })
  }

  return {
    tables: t,
    client: { localStorage: {}, user: null, route: '/login', screen: 'Login form' },
    calls: [],
    verdicts: {
      login: { names: '', trace: '', diverges: false },
      profile: { names: '', trace: '', diverges: false },
      draft: { names: '', trace: '', diverges: false },
      booking: { names: '', trace: '', diverges: false },
    },
    why: {},
    lastStep: null,
    probes: {},
    log: [],
  }
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function rowBySid(w: World, table: TableName, sid: string): Row | undefined {
  return w.tables[table].rows.find((r) => r.sid === sid)
}

function addRow(w: World, table: TableName, row: Row) {
  w.tables[table].rows.push(row)
}

function nextId(w: World, table: TableName, base = 1) {
  return w.tables[table].rows.length + base
}

const J = (v: unknown) => JSON.stringify(v, null, 2)

// ---------------------------------------------------------------------------
// the reducer
// ---------------------------------------------------------------------------

/** Fold the first `cursor` steps under `knobs`. cursor = 0 means "nothing has run yet". */
export function run(knobs: Knobs, cursor: number): World {
  const w = seed(knobs)
  for (let i = 0; i < cursor && i < STEPS.length; i++) {
    applyStep(w, STEPS[i].id, knobs)
  }
  computeVerdicts(w, knobs, cursor)
  computeProbes(w, knobs)
  return w
}

/** Which steps are runnable given what has already happened. */
export function stepEnabled(id: StepId, cursor: number): boolean {
  return STEPS.findIndex((s) => s.id === id) === cursor
}

function push(w: World, call: Call) {
  w.calls.push(call)
}

function applyStep(w: World, id: StepId, k: Knobs) {
  w.lastStep = id
  switch (id) {
    // -----------------------------------------------------------------------
    case 'login': {
      const user = rowBySid(w, 'users_customuser', 'user:organizer')!
      const body: Record<string, unknown> = {
        id: user.id,
        username: user.fields.username,
        email: user.fields.email,
        first_name: '',
        last_name: '',
        profile_picture: '/media/default_profile.jpg',
        roles: user.fields.roles,
      }
      if (k.serializeUserType) body.user_type = user.fields.user_type

      push(w, {
        cid: 'login', stage: 'login', method: 'POST', path: '/api/accounts/login/',
        trigger: { file: 'frontend/src/AuthProvider.jsx', line: 101, note: 'login() fetches the token endpoint' },
        handler: { file: 'backend/main/users/views.py', line: 55, note: 'LoginAPIView(TokenObtainPairView)' },
        serializer: { file: 'backend/main/users/views.py', line: 46, note: 'CustomTokenObtainPairSerializer.validate adds data["user"]' },
        reads: ['users_customuser', 'users_role'], writes: [],
        status: 200,
        requestBody: J({ username: 'thandi', password: '••••••••' }),
        responseBody: J({ refresh: 'eyJhbGci…', access: 'eyJhbGci…', user: body }),
        surprise: k.serializeUserType
          ? undefined
          : 'user_type is not in UserSerializer.fields, so it never leaves the server.',
      })

      w.client.localStorage['tokens'] = '{"access":"eyJhbGci…","refresh":"eyJhbGci…"}'
      w.client.localStorage['currentRole'] = 'EVENT_ORGANIZER'
      w.client.user = body
      w.client.route = '/'
      w.client.screen = 'HomePage (the same one every role lands on)'
      w.log.push('Login.jsx:18 navigate(\'/\') runs for every role. No role-based redirect exists.')

      w.why['login:client.AuthProvider user'] = {
        claim: 'The client cannot branch on user_type.',
        chain: [
          { text: 'CustomUser has both user_type (5 choices) and a roles M2M to Role (5 different choices).', source: { file: 'backend/main/users/models.py', line: 33, note: 'user_type field' } },
          { text: 'The login response is built by UserSerializer, whose Meta.fields lists roles and not user_type.', source: { file: 'backend/main/users/serializers.py', line: 14, note: 'Meta.fields' } },
          { text: 'So AuthProvider only ever sees roles, and derives currentRole from roles[0].', source: { file: 'frontend/src/AuthProvider.jsx', line: 112, note: 'setCurrentRole(data.user.roles[0])' } },
        ],
      }
      w.why['login:client.route'] = {
        claim: 'Every user type lands on the same page after login.',
        chain: [
          { text: 'Login.jsx calls navigate(\'/\') on success with no branch on roles or user_type.', source: { file: 'frontend/src/Login.jsx', line: 18, note: "navigate('/')" } },
        ],
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'fetch_me': {
      push(w, {
        cid: 'me', stage: 'login', method: 'GET', path: '/api/accounts/me/',
        trigger: { file: 'frontend/src/AuthProvider.jsx', line: 72, note: 'the useEffect on [tokens] refetches the user' },
        handler: { file: 'backend/main/users/views.py', line: 68, note: 'CurrentUserAPIView(generics.RetrieveAPIView)' },
        serializer: { file: 'backend/main/users/serializers.py', line: 5, note: 'UserSerializer, the same field list as login' },
        reads: ['users_customuser', 'users_role'], writes: [],
        status: 200,
        responseBody: J(w.client.user),
        surprise: 'Fires immediately after login and returns the object login already handed over. Two round trips for one user.',
      })
      w.log.push('setTokens triggered the [tokens] effect, which re-reads the same user.')
      break
    }

    // -----------------------------------------------------------------------
    case 'open_profile': {
      w.client.route = '/profile'
      if (k.artistRow === 'via_field') {
        w.client.screen = 'ProfileRedirect: user.artist_profile_id was set, no request needed'
        w.client.route = `/artists/9`
        w.log.push('ProfileRedirect took the first branch and never asked the server anything.')
        break
      }
      const matched = k.artistRow === 'via_query'
      push(w, {
        cid: 'profile_lookup', stage: 'profile', method: 'GET',
        path: `/api/artists/artists/?user=${ORGANIZER_ID}`,
        trigger: { file: 'frontend/src/ProfileRedirect.jsx', line: 45, note: "api.get('/api/artists/artists/', {params:{user: user.id}})" },
        handler: { file: 'backend/main/artists/views.py', line: 1, note: 'ArtistViewSet, registered at api/artists/ by artists/api_urls.py' },
        reads: ['artists_artist'], writes: [],
        status: 200,
        responseBody: matched
          ? J({ count: 1, results: [{ id: 9, name: 'Thandi (artist side project)', owner: ORGANIZER_ID }] })
          : J({ count: 0, results: [] }),
        surprise: matched ? undefined : 'The only question /profile asks is "is this person an artist?". Not their role, not their user_type.',
      })
      w.client.route = matched ? '/artists/9' : '/profile/edit'
      w.client.screen = matched ? 'ArtistProfilePage' : 'redirecting to /profile/edit'
      w.why['open_profile:client.route'] = {
        claim: 'A plain organizer visiting /profile is sent to an account-settings form.',
        chain: [
          { text: 'ProfileRedirect checks user.artist_profile_id first, then queries the Artist table by user id.', source: { file: 'frontend/src/ProfileRedirect.jsx', line: 27, note: 'the two branches' } },
          { text: 'Neither branch reads roles or user_type. Being an organizer is not a thing this component can detect.', source: { file: 'frontend/src/ProfileRedirect.jsx', line: 45, note: 'the artist query is the only server call' } },
          { text: 'No Artist row means the fallback fires: Navigate to /profile/edit.', source: { file: 'frontend/src/ProfileRedirect.jsx', line: 51, note: "setTargetPath(matchedArtistId ? ... : '/profile/edit')" } },
        ],
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'open_profile_edit': {
      const prof = rowBySid(w, 'users_userprofile', 'profile:organizer')!
      push(w, {
        cid: 'profile_get', stage: 'profile', method: 'GET', path: '/api/accounts/profile/',
        trigger: { file: 'frontend/src/ProfilePage.jsx', line: 1, note: 'ProfilePage loads the account form' },
        handler: { file: 'backend/main/users/views.py', line: 91, note: 'UserProfileView.get' },
        serializer: { file: 'backend/main/users/serializers.py', line: 1, note: 'UserProfileSerializer over users.UserProfile' },
        reads: ['users_userprofile'], writes: [],
        status: 200,
        responseBody: J({ bio: prof.fields.bio, profile_picture: prof.fields.profile_picture }),
        surprise: 'Two fields: bio and profile picture. No events, no bookings, no drafts. This is account settings.',
      })
      w.client.route = '/profile/edit'
      w.client.screen = 'ProfilePage: bio and profile picture'
      break
    }

    // -----------------------------------------------------------------------
    case 'open_my_events': {
      const drafts = w.tables.events_eventdraft.rows.map((r) => ({
        id: r.id,
        name: (r.fields.data as Record<string, { step1?: { name?: string } }>)?.steps?.step1?.name ?? 'Untitled event',
        status: r.fields.status,
        lifecycle_state: 'draft',
        current_step: r.fields.current_step,
        record_type: 'draft',
        is_draft: true,
        readiness_state: r.fields.status === 'draft' ? 'in_progress' : 'ready',
      }))
      const published = w.tables.events_event.rows.map((r) => ({
        id: r.id, name: r.fields.name, status: r.fields.status,
        lifecycle_state: 'published', current_step: null,
        record_type: 'event', is_draft: false, readiness_state: 'published',
      }))
      const payload = { drafts, published }
      push(w, {
        cid: `my_events_${w.calls.length}`, stage: 'profile', method: 'GET', path: '/api/events/my-events/',
        trigger: { file: 'frontend/src/MyEventsPage.jsx', line: 367, note: "fetch('/api/events/my-events/')" },
        handler: { file: 'backend/main/events/views.py', line: 547, note: 'MyEventsAPIView.get' },
        serializer: { file: 'backend/main/events/serializer.py', line: 227, note: 'MyEventSummarySerializer.to_representation, one branch per model' },
        reads: ['events_eventdraft', 'events_event'], writes: [],
        status: 200,
        responseBody: J(payload),
        surprise: drafts.some((d) => d.status === 'published')
          ? 'A published draft is still under "drafts". MyEventsAPIView filters EventDraft by organizer and nothing else.'
          : undefined,
      })
      w.client.route = '/my-events'
      w.client.screen = `MyEventsPage: ${drafts.length} draft card(s), ${published.length} published card(s)`
      break
    }

    // -----------------------------------------------------------------------
    case 'create_draft': {
      addRow(w, 'events_eventdraft', {
        id: DRAFT_ID, sid: 'draft:19',
        fields: {
          organizer: ORGANIZER_ID, status: 'draft', current_step: 'step1',
          data: { steps: {} }, published_at: null,
        },
      })
      push(w, {
        cid: 'draft_create', stage: 'draft', method: 'POST', path: '/api/events/event-drafts/',
        trigger: { file: 'frontend/src/CreateEventPage.jsx', line: 60, note: "api.post('/api/events/event-drafts/', ...)" },
        handler: { file: 'backend/main/events/views.py', line: 243, note: 'EventDraftViewSet.perform_create sets organizer and FIRST_STEP' },
        serializer: { file: 'backend/main/events/serializer.py', line: 138, note: 'EventDraftSerializer' },
        reads: [], writes: ['events_eventdraft'],
        status: 201,
        requestBody: J({ data: {}, current_step: 'step1' }),
        responseBody: J({ id: DRAFT_ID, organizer_id: ORGANIZER_ID, status: 'draft', current_step: 'step1', data: { steps: {} }, assets: [] }),
      })
      w.client.route = `/listing/${DRAFT_ID}/step1`
      w.client.screen = 'ListingStep1'
      break
    }

    // -----------------------------------------------------------------------
    case 'patch_step1': return patchStep(w, 'step1', 'step3', {
      name: 'Umoja Launch', category: 'concert',
      start_date: '2026-09-12T18:00:00Z', guest_count: 400,
    })
    case 'patch_step3': return patchStep(w, 'step3', 'step4', {
      location: 31, selectedArtists: [ARTIST_ID], selectedVendors: [],
    })
    case 'patch_step4': return patchStep(w, 'step4', 'step5', {
      location: { id: 31, name: 'The Bassline' },
    })
    case 'patch_step5': return patchStep(w, 'step5', 'step6', {
      budget: '85000.00', base_price: '250.00', is_seated: true, max_tickets_per_buyer: 6,
    })
    case 'patch_step6': return patchStep(w, 'step6', 'step7', {
      currency: 'ZAR', tiered_prices: [{ tier: 'Early bird', price: '180.00' }],
    })
    case 'patch_step7': return patchStep(w, 'step7', 'step8', {
      features: ['Bar', 'Parking'], access_type: 'private', is_age_restricted: true,
    })
    case 'patch_step8': return patchStep(w, 'step8', 'review', {
      confirmed: true,
    })

    // -----------------------------------------------------------------------
    case 'upload_asset': {
      const id = nextId(w, 'events_eventdraftasset')
      addRow(w, 'events_eventdraftasset', {
        id, sid: `asset:${id}`,
        fields: {
          draft: DRAFT_ID, asset_type: 'media', name: 'umoja-banner.jpg',
          file: 'event_drafts/19/umoja-banner.jpg', mime_type: 'image/jpeg', size: 481203,
        },
      })
      push(w, {
        cid: 'asset_upload', stage: 'draft', method: 'POST', path: `/api/events/event-drafts/${DRAFT_ID}/assets/`,
        trigger: { file: 'frontend/src/context/reactContext.jsx', line: 350, note: 'uploadDraftAsset posts multipart/form-data' },
        handler: { file: 'backend/main/events/views.py', line: 438, note: 'EventDraftViewSet.upload_asset, MultiPartParser' },
        reads: [], writes: ['events_eventdraftasset'],
        status: 201,
        requestBody: 'multipart/form-data: file=umoja-banner.jpg, asset_type=media',
        responseBody: J({ id, asset_type: 'media', name: 'umoja-banner.jpg', mime_type: 'image/jpeg', size: 481203 }),
        surprise: 'Files never enter data. They are their own rows in their own table, joined only at publish time.',
      })
      break
    }

    // -----------------------------------------------------------------------
    case 'leave': {
      w.client.localStorage['eventCreation'] = '{…cached wizard state…}'
      w.client.user = null
      w.client.route = '(tab closed)'
      w.client.screen = 'nothing'
      w.log.push('Client state is gone. The draft row is not.')
      break
    }

    // -----------------------------------------------------------------------
    case 'resume': {
      const draft = rowBySid(w, 'events_eventdraft', 'draft:19')!
      // MyEventsPage builds the URL from current_step. That is a pure client-side
      // string map: no request is involved in deciding where to go.
      const step = String(draft.fields.current_step)
      w.client.user = { id: ORGANIZER_ID, username: 'thandi', roles: ['EVENT_ORGANIZER'] }
      w.client.route = `/listing/${DRAFT_ID}/${step}`

      push(w, {
        cid: 'draft_retrieve', stage: 'draft', method: 'GET', path: `/api/events/event-drafts/${DRAFT_ID}/`,
        trigger: { file: 'frontend/src/context/reactContext.jsx', line: 310, note: 'loadEvent, called by ListingWizardLayout on mount (ListingWizardLayout.jsx:71)' },
        handler: { file: 'backend/main/events/views.py', line: 274, note: 'EventDraftViewSet.retrieve, scoped by get_object to organizer=request.user' },
        serializer: { file: 'backend/main/events/serializer.py', line: 138, note: 'EventDraftSerializer' },
        reads: ['events_eventdraft', 'events_eventdraftasset'], writes: [],
        status: 200,
        responseBody: J({
          id: DRAFT_ID, organizer_id: ORGANIZER_ID, status: draft.fields.status,
          current_step: draft.fields.current_step, data: draft.fields.data,
          assets: w.tables.events_eventdraftasset.rows.map((a) => ({ id: a.id, asset_type: a.fields.asset_type, name: a.fields.name })),
        }),
        surprise: 'This is the resume read. It fires on ListingWizardLayout mount, not on CreateEventPage.',
      })
      w.client.screen = `Listing${step.replace('step', 'Step')}, refilled from data.steps.${step}`
      w.why['resume'] = {
        claim: 'Resume is one GET on the wizard layout, and the URL that gets you there is built without asking the server.',
        chain: [
          { text: 'MyEventsPage maps draft.current_step through a literal object to a route string, then navigates.', source: { file: 'frontend/src/MyEventsPage.jsx', line: 121, note: 'resolveStepRoute over STEP_ROUTE_MAP' } },
          { text: 'ListingWizardLayout mounts at that URL and calls loadEvent(eventId).', source: { file: 'frontend/src/ListingWizardLayout.jsx', line: 71, note: 'await loadEventRef.current(eventId)' } },
          { text: 'loadEvent is the only thing that actually reads the draft back.', source: { file: 'frontend/src/context/reactContext.jsx', line: 310, note: "authFetch('/api/events/event-drafts/${id}/')" } },
          { text: 'current_step was saved as the NEXT step, so resuming drops you on the step you had not done yet.', source: { file: 'frontend/src/context/reactContext.jsx', line: 418, note: 'current_step: nextStep || normalizedStep' } },
        ],
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'publish': {
      const draft = rowBySid(w, 'events_eventdraft', 'draft:19')!
      const data = draft.fields.data as { steps: Record<string, Record<string, unknown>>; published_event_id?: number }
      const s = data.steps
      const eventId = 88

      const banner = w.tables.events_eventdraftasset.rows[0]
      addRow(w, 'events_event', {
        id: eventId, sid: 'event:88',
        fields: {
          organizer: ORGANIZER_ID,
          name: s.step1?.name ?? 'Untitled event',
          date: '2026-09-12',
          budget: s.step5?.budget ?? null,
          base_price: s.step5?.base_price ?? 0,
          currency: s.step6?.currency ?? 'ZAR',
          tiered_prices: s.step6?.tiered_prices ?? null,
          features: s.step7?.features ?? null,
          access_type: s.step7?.access_type ?? 'public',
          is_seated: s.step5?.is_seated ?? false,
          banner_image: banner ? `/media/${banner.fields.file}` : null,
          status: 'published', is_draft: false,
        },
      })

      draft.fields.status = 'published'
      draft.fields.published_at = '2026-08-15T09:41:22Z'
      data.published_event_id = eventId

      push(w, {
        cid: 'publish', stage: 'draft', method: 'POST', path: `/api/events/event-drafts/${DRAFT_ID}/publish/`,
        trigger: { file: 'frontend/src/context/reactContext.jsx', line: 477, note: 'publish(), reached from ListingReview' },
        handler: { file: 'backend/main/events/views.py', line: 497, note: 'EventDraftViewSet.publish, one transaction.atomic block' },
        serializer: { file: 'backend/main/events/views.py', line: 384, note: '_build_event_payload maps data.steps.* onto Event columns' },
        reads: ['events_eventdraft', 'events_eventdraftasset'],
        writes: ['events_event', 'events_eventdraft'],
        status: 200,
        responseBody: J({
          id: DRAFT_ID, status: 'published', current_step: draft.fields.current_step,
          published_event_id: eventId,
          booking_publish_summary: { finalized: [], skipped: [], released: [] },
        }),
        surprise: 'The draft row survives with status=published, and published_event_id is written INTO data, not onto a column.',
      })

      w.why['events_eventdraft.draft:19.status'] = {
        claim: 'Publishing does not consume the draft.',
        chain: [
          { text: 'publish sets instance.status = PUBLISHED and saves. There is no delete and no conversion.', source: { file: 'backend/main/events/views.py', line: 503, note: 'instance.status = EventDraft.Status.PUBLISHED' } },
          { text: 'The link back to the new Event is stashed inside the JSON blob, so the row itself has no FK to it.', source: { file: 'backend/main/events/views.py', line: 522, note: 'draft_payload["published_event_id"] = published_event.id' } },
          { text: 'That is deliberate: republishing reuses the id to update the same Event rather than making a second one.', source: { file: 'backend/main/events/views.py', line: 509, note: 'event_id = request.data.get("event_id") or published_event_id' } },
          { text: 'The cost lands on MyEventsAPIView, which filters EventDraft by organizer and nothing else, so the row keeps showing up under "drafts".', source: { file: 'backend/main/events/views.py', line: 549, note: 'EventDraft.objects.filter(organizer=organizer)' } },
        ],
      }

      // The literal code bridge into stage 4.
      const approvedForDraft = w.tables.scheduling_bookingrequest.rows.filter(
        (r) => r.fields.event_draft === DRAFT_ID && r.fields.status === 'approved',
      )
      w.log.push(
        `finalize_draft_bookings ran inside the same transaction and found ${approvedForDraft.length} approved request(s) with event_draft=${DRAFT_ID}.`,
      )
      w.why['finalize'] = {
        claim: 'Publish can only finalize bookings that were made inside the wizard.',
        chain: [
          { text: 'finalize_draft_bookings selects on event_draft=draft AND status=APPROVED.', source: { file: 'backend/main/scheduling/services.py', line: 1821, note: '.filter(event_draft=draft, status=BookingRequest.Status.APPROVED)' } },
          { text: 'ProviderCard, the in-wizard booking widget, sends event_draft_id, so its requests match.', source: { file: 'frontend/src/components/booking/ProviderCard.jsx', line: 118, note: 'event_draft_id: Number(eventDraftId)' } },
          { text: 'BookArtistPage only ever sends event_id, so its requests have event_draft=None and can never match.', source: { file: 'frontend/src/BookArtistPage.jsx', line: 120, note: '...(selectedEventId ? { event_id: ... } : {})' } },
        ],
      }
      w.client.route = `/events/${eventId}`
      w.client.screen = 'the published event page'
      break
    }

    // -----------------------------------------------------------------------
    case 'open_artist': {
      const artist = rowBySid(w, 'artists_artist', 'artist:nomvula')!
      push(w, {
        cid: 'artist_get', stage: 'booking', method: 'GET', path: `/api/artists/artists/${ARTIST_ID}/`,
        trigger: { file: 'frontend/src/ArtistProfilePage.jsx', line: 1, note: 'ArtistProfilePage loads the artist' },
        handler: { file: 'backend/main/artists/views.py', line: 1, note: 'ArtistViewSet.retrieve' },
        reads: ['artists_artist'], writes: [],
        status: 200,
        responseBody: J({ id: ARTIST_ID, name: artist.fields.name, owner: ARTIST_OWNER_ID, user: ARTIST_OWNER_ID, booking_fee: artist.fields.booking_fee }),
      })
      w.client.route = `/artists/${ARTIST_ID}`
      w.client.screen = 'ArtistProfilePage with a Request Booking link to /artists/4/book'
      break
    }

    // -----------------------------------------------------------------------
    case 'open_book_artist': {
      const artist = rowBySid(w, 'artists_artist', 'artist:nomvula')!
      push(w, {
        cid: 'book_artist_get', stage: 'booking', method: 'GET', path: `/api/artists/artists/${ARTIST_ID}/`,
        trigger: { file: 'frontend/src/BookArtistPage.jsx', line: 65, note: 'read 1 of 3, on mount' },
        handler: { file: 'backend/main/artists/views.py', line: 1, note: 'ArtistViewSet.retrieve' },
        reads: ['artists_artist'], writes: [],
        status: 200,
        responseBody: J({ id: ARTIST_ID, name: artist.fields.name, owner: ARTIST_OWNER_ID }),
      })

      const resources = w.tables.scheduling_marketplaceresource.rows
      push(w, {
        cid: 'resources_get', stage: 'booking', method: 'GET', path: '/api/scheduling/resources/',
        trigger: { file: 'frontend/src/BookArtistPage.jsx', line: 77, note: 'read 2 of 3, then filtered client-side by owner id' },
        handler: { file: 'backend/main/scheduling/views.py', line: 1, note: 'MarketplaceResourceViewSet.list' },
        reads: ['scheduling_marketplaceresource'], writes: [],
        status: 200,
        responseBody: J(resources.map((r) => ({ id: r.id, owner: r.fields.owner, resource_type: r.fields.resource_type, display_name: r.fields.display_name, artist: r.fields.artist }))),
        surprise: 'The match is String(r.owner) === String(ownerId). The resource has an artist FK pointing straight at this artist and the page does not use it.',
      })

      const drafts = w.tables.events_eventdraft.rows.map((r) => ({
        id: r.id, name: (r.fields.data as { steps?: { step1?: { name?: string } } })?.steps?.step1?.name ?? 'Untitled event',
        lifecycle_state: 'draft', readiness_state: r.fields.status === 'draft' ? 'in_progress' : 'ready',
      }))
      const published = w.tables.events_event.rows.map((r) => ({ id: r.id, name: r.fields.name, lifecycle_state: 'published' }))

      let payload: unknown
      if (k.myEventsShape === 'bare_array') payload = [...drafts, ...published]
      else if (k.myEventsShape === 'paginated_results') payload = { count: drafts.length + published.length, results: [...drafts, ...published] }
      else payload = { drafts, published }

      const parsed = Array.isArray(payload) ? payload : ((payload as { results?: unknown[] })?.results ?? [])

      push(w, {
        cid: 'book_my_events', stage: 'booking', method: 'GET', path: '/api/events/my-events/',
        trigger: { file: 'frontend/src/BookArtistPage.jsx', line: 86, note: 'read 3 of 3, meant to fill the event dropdown' },
        handler: { file: 'backend/main/events/views.py', line: 547, note: 'MyEventsAPIView.get' },
        serializer: { file: 'backend/main/events/serializer.py', line: 227, note: 'MyEventSummarySerializer' },
        reads: ['events_eventdraft', 'events_event'], writes: [],
        status: 200,
        responseBody: J(payload),
        surprise: k.myEventsShape === 'drafts_published'
          ? `The page parses this with Array.isArray(x) ? x : (x?.results ?? []). Neither arm matches {drafts, published}, so events = [] and the dropdown has ${parsed.length} option(s) besides the placeholder.`
          : undefined,
      })

      w.probes['dropdown_options'] = (parsed as unknown[]).length
      w.client.route = `/artists/${ARTIST_ID}/book`
      w.client.screen = k.resourceExists
        ? `BookArtistPage form. Event dropdown: 1 placeholder + ${(parsed as unknown[]).length} real option(s).`
        : '"Not available for online booking"'

      w.why['dropdown_options'] = {
        claim: 'The "attach to one of my events" dropdown is empty however many events you have.',
        chain: [
          { text: 'MyEventsAPIView returns an object with two keys, drafts and published.', source: { file: 'backend/main/events/views.py', line: 554, note: 'Response({"drafts": ..., "published": ...})' } },
          { text: 'BookArtistPage tests for an array, then for a .results key. The real payload is neither.', source: { file: 'frontend/src/BookArtistPage.jsx', line: 90, note: 'Array.isArray(eventsData) ? eventsData : (eventsData?.results ?? [])' } },
          { text: 'MyEventsPage reads the same endpoint correctly, which is why the bug is invisible from the events screen.', source: { file: 'frontend/src/MyEventsPage.jsx', line: 372, note: 'setDrafts(payload?.drafts || [])' } },
        ],
      }
      w.why['resource_missing'] = {
        claim: 'An artist exists but is not bookable until they separately opt in.',
        chain: [
          { text: 'Being an artist is an artists.Artist row. Being bookable is a scheduling.MarketplaceResource row in a different app.', source: { file: 'backend/main/scheduling/models.py', line: 14, note: 'MarketplaceResource, owner FK plus an optional artist one-to-one' } },
          { text: 'Nothing creates the second row when the first is created. There is no signal, no hook, no save override.', source: { file: 'backend/main/artists/models.py', line: 5, note: 'Artist has no post_save that touches scheduling' } },
          { text: 'The artist has to visit ProviderAvailabilityPage and POST the resource themselves.', source: { file: 'frontend/src/ProviderAvailabilityPage.jsx', line: 47, note: "method = resource ? 'PATCH' : 'POST'" } },
          { text: 'Until then BookArtistPage renders the amber panel instead of a form.', source: { file: 'frontend/src/BookArtistPage.jsx', line: 163, note: '"Not available for online booking"' } },
        ],
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'submit_booking':
    case 'resubmit_booking': {
      const isRepeat = id === 'resubmit_booking'
      if (!k.resourceExists) {
        w.log.push('There is no form to submit: the page rendered "Not available for online booking".')
        break
      }

      const fromWizard = k.bookingEntry === 'wizard_provider_card'
      const eventRow = w.tables.events_event.rows[0]

      // What the client actually puts in the body.
      const body: Record<string, unknown> = {
        resource_id: RESOURCE_ID,
        start_at: '2026-09-12T18:00:00.000Z',
        end_at: '2026-09-12T23:00:00.000Z',
        attendee_count: fromWizard ? 1 : 400,
      }
      if (fromWizard) body.event_draft_id = DRAFT_ID
      else {
        body.message = 'Two 45 minute sets, own sound engineer.'
        // The dropdown only offers events the parse produced. With the real payload
        // shape that is nothing, so no event_id goes in the body at all.
        if (w.probes['dropdown_options'] && Number(w.probes['dropdown_options']) > 0 && eventRow) {
          body.event_id = eventRow.id
        }
      }

      const hasContext = 'event_id' in body || 'event_draft_id' in body
      const idemKey = k.idempotencyHeader ? 'request-3f1c9a20-6b44-4d0e-9c3a-1e77b0a54c81' : undefined

      if (!hasContext) {
        push(w, {
          cid: `booking_create_${w.calls.length}`, stage: 'booking', method: 'POST',
          path: '/api/scheduling/requests/create/',
          trigger: { file: 'frontend/src/BookArtistPage.jsx', line: 114, note: 'handleSubmit builds the body' },
          handler: { file: 'backend/main/scheduling/views.py', line: 473, note: 'CreateRequestAPIView.post, the else branch' },
          serializer: { file: 'backend/main/scheduling/serializers.py', line: 1, note: 'CreateRequestSerializer validated first, then the event lookup' },
          reads: [], writes: [],
          status: 400,
          requestBody: J(body),
          responseBody: J({ detail: 'Either event_id or event_draft_id is required.' }),
          surprise: 'The empty dropdown is not cosmetic. Without an event the request is rejected before any row is touched.',
        })
        w.client.screen = 'BookArtistPage, red inline error: "Either event_id or event_draft_id is required."'
        w.why['booking_400'] = {
          claim: 'The Book Artist form cannot submit today.',
          chain: [
            { text: 'The only dropdown option is the placeholder, whose value is the empty string.', source: { file: 'frontend/src/BookArtistPage.jsx', line: 198, note: '<option value="">— No specific event (one-off booking) —</option>' } },
            { text: 'An empty selectedEventId makes the spread contribute nothing, so the body carries no event context.', source: { file: 'frontend/src/BookArtistPage.jsx', line: 120, note: '...(selectedEventId ? { event_id: ... } : {})' } },
            { text: 'The view requires one of the two and returns 400 otherwise.', source: { file: 'backend/main/scheduling/views.py', line: 473, note: 'the else branch returns HTTP 400' } },
            { text: 'parseResponse turns payload.detail into the thrown Error, which handleSubmit shows inline.', source: { file: 'frontend/src/api/schedulingApi.js', line: 21, note: 'const message = payload?.detail || ...' } },
          ],
        }
        break
      }

      // Idempotency replay.
      const priorRecord = w.tables.scheduling_idempotencyrecord.rows.find((r) => r.fields.key === idemKey)
      if (isRepeat && k.idempotencyHeader && priorRecord) {
        push(w, {
          cid: `booking_create_${w.calls.length}`, stage: 'booking', method: 'POST',
          path: '/api/scheduling/requests/create/',
          trigger: { file: 'frontend/src/api/schedulingApi.js', line: 79, note: "'Idempotency-Key': generateIdempotencyKey('request')" },
          handler: { file: 'backend/main/scheduling/services.py', line: 114, note: '_get_or_assert_idempotency found the record and short-circuits' },
          reads: ['scheduling_idempotencyrecord', 'scheduling_bookingrequest'], writes: [],
          status: 200,
          requestBody: J(body),
          responseBody: J(priorRecord.fields.response_body),
          surprise: 'Replayed. Zero new rows: no BookingRequest, no AuditLog, no OutboxEvent, no Notification.',
        })
        w.log.push('The second submit replayed the first. Row counts are unchanged.')
        break
      }

      const reqId = nextId(w, 'scheduling_bookingrequest', 40)
      addRow(w, 'scheduling_bookingrequest', {
        id: reqId, sid: `bookingrequest:${reqId}`,
        fields: {
          event: fromWizard ? null : (body.event_id ?? null),
          event_draft: fromWizard ? DRAFT_ID : null,
          organizer: ORGANIZER_ID,
          resource: RESOURCE_ID,
          requested_start_at: body.start_at,
          requested_end_at: body.end_at,
          attendee_count: body.attendee_count,
          status: 'pending',
          expires_at: '(now + 48h)',
          estimated_total_amount: null,
        },
      })
      const auditId = nextId(w, 'scheduling_auditlog', 100)
      addRow(w, 'scheduling_auditlog', {
        id: auditId, sid: `audit:${auditId}`,
        fields: { actor: ORGANIZER_ID, action: 'request.created', target_type: 'BookingRequest', target_id: reqId },
      })
      const outboxId = nextId(w, 'scheduling_outboxevent', 200)
      addRow(w, 'scheduling_outboxevent', {
        id: outboxId, sid: `outbox:${outboxId}`,
        fields: { event_type: 'request.created', aggregate_type: 'booking_request', aggregate_id: reqId, status: 'pending' },
      })
      const notifId = nextId(w, 'notifications_notification', 300)
      addRow(w, 'notifications_notification', {
        id: notifId, sid: `notif:${notifId}`,
        fields: {
          recipient: ARTIST_OWNER_ID, sender: ORGANIZER_ID, notification_type: 'booking_request',
          title: 'New booking request for Nomvula Sound', link_type: 'booking', link_id: reqId,
        },
      })
      if (k.idempotencyHeader) {
        const recId = nextId(w, 'scheduling_idempotencyrecord', 500)
        addRow(w, 'scheduling_idempotencyrecord', {
          id: recId, sid: `idem:${recId}`,
          fields: {
            owner: ORGANIZER_ID, endpoint: 'scheduling.request.create', key: idemKey,
            response_status: 201, response_body: { request_id: reqId, status: 'pending' },
          },
        })
      }

      push(w, {
        cid: `booking_create_${w.calls.length}`, stage: 'booking', method: 'POST',
        path: '/api/scheduling/requests/create/',
        trigger: fromWizard
          ? { file: 'frontend/src/components/booking/ProviderCard.jsx', line: 117, note: 'handleRequest sends event_draft_id' }
          : { file: 'frontend/src/BookArtistPage.jsx', line: 114, note: 'handleSubmit builds the body' },
        handler: { file: 'backend/main/scheduling/views.py', line: 454, note: 'CreateRequestAPIView.post' },
        serializer: { file: 'backend/main/scheduling/services.py', line: 468, note: 'create_request writes five rows in one transaction' },
        reads: ['scheduling_marketplaceresource', 'scheduling_idempotencyrecord'],
        writes: k.idempotencyHeader
          ? ['scheduling_bookingrequest', 'scheduling_auditlog', 'scheduling_outboxevent', 'notifications_notification', 'scheduling_idempotencyrecord']
          : ['scheduling_bookingrequest', 'scheduling_auditlog', 'scheduling_outboxevent', 'notifications_notification'],
        status: 201,
        requestBody: (k.idempotencyHeader ? `Idempotency-Key: ${idemKey}\n\n` : 'no Idempotency-Key header\n\n') + J(body),
        responseBody: J({ id: reqId, status: 'pending', resource: RESOURCE_ID, event: body.event_id ?? null, event_draft: fromWizard ? DRAFT_ID : null }),
        surprise: 'No AvailabilitySlot row is read or written. Nothing is reserved at request time.',
      })
      w.client.route = `/bookings/${reqId}`
      w.client.screen = 'BookingRequestPage, status pending, with a Message organizer button'

      w.why['no_slot'] = {
        claim: 'Submitting a request reserves no capacity.',
        chain: [
          { text: 'create_request creates the BookingRequest, an AuditLog, an OutboxEvent and a Notification. AvailabilitySlot is not in that list.', source: { file: 'backend/main/scheduling/services.py', line: 469, note: 'the transaction.atomic block' } },
          { text: 'Capacity moves later, in the approval path, not here.', source: { file: 'backend/main/scheduling/models.py', line: 221, note: 'capacity_total / capacity_reserved on AvailabilitySlot' } },
        ],
      }
      break
    }

    // -----------------------------------------------------------------------
    case 'accept_chat_bid': {
      const bidId = 55
      addRow(w, 'chat_chatbid', {
        id: bidId, sid: `bid:${bidId}`,
        fields: { organizer: ORGANIZER_ID, vendor: ARTIST_OWNER_ID, amount: '16500.00', status: 'accepted', event: w.tables.events_event.rows[0]?.id ?? null },
      })

      // The signal narrows by event only when the bid carries one.
      const candidates = w.tables.scheduling_bookingrequest.rows.filter((r) => {
        if (r.fields.organizer !== ORGANIZER_ID) return false
        if (r.fields.resource !== RESOURCE_ID) return false
        if (['withdrawn', 'declined', 'expired'].includes(String(r.fields.status))) return false
        const bidEvent = w.tables.events_event.rows[0]?.id ?? null
        if (bidEvent) return r.fields.event === bidEvent
        return true
      })
      const matched = k.chatBidHasMatch && candidates.length > 0

      if (matched) {
        candidates[0].fields.estimated_total_amount = '16500.00'
        w.log.push(`chat/signals.py updated BookingRequest ${candidates[0].id}.estimated_total_amount. Nothing else changed.`)
      } else {
        w.log.push('chat/signals.py found no candidate and returned. logger.debug only, no row written, no error raised.')
      }

      w.why['bid_bridge'] = {
        claim: 'The chat system and the scheduling system are joined by one signal that usually does nothing.',
        chain: [
          { text: 'chat has its own Booking model, used by RequestToBook. It is not scheduling.Booking and the two never meet.', source: { file: 'backend/main/chat/models.py', line: 123, note: 'a second, different Booking' } },
          { text: 'On a ChatBid becoming accepted, the signal searches for an existing BookingRequest by organizer and resource owner.', source: { file: 'backend/main/chat/signals.py', line: 37, note: 'the queryset' } },
          { text: 'On no match it logs at debug level and returns. It never creates a BookingRequest.', source: { file: 'backend/main/chat/signals.py', line: 48, note: 'if not candidates: logger.debug(...); return' } },
          { text: 'On a match it writes exactly one field, estimated_total_amount.', source: { file: 'backend/main/chat/signals.py', line: 63, note: 'save(update_fields=["estimated_total_amount", "updated_at"])' } },
          { text: 'The only ChatRoom near this flow comes from a button someone clicks, not from booking.', source: { file: 'frontend/src/BookingRequestPage.jsx', line: 747, note: "fetch('/api/chat/rooms/with/${organizerUsername}/', {method:'POST'})" } },
        ],
      }
      break
    }
  }
}

// ---------------------------------------------------------------------------
// PATCH into the one JSON column
// ---------------------------------------------------------------------------

function patchStep(w: World, key: string, next: string, payload: Record<string, unknown>) {
  const draft = rowBySid(w, 'events_eventdraft', 'draft:19')
  if (!draft) return
  const data = draft.fields.data as { steps: Record<string, unknown> }
  // The client sends the WHOLE merged steps map every time (reactContext.jsx:410),
  // because the server merge is top-level only: {**instance.data, **incoming_data}
  // would otherwise replace the entire steps key.
  const mergedSteps = { ...data.steps, [key]: payload }
  draft.fields.data = { ...data, steps: mergedSteps }
  draft.fields.current_step = next

  push(w, {
    cid: `patch_${key}`, stage: 'draft', method: 'PATCH', path: `/api/events/event-drafts/${DRAFT_ID}/`,
    trigger: { file: 'frontend/src/context/reactContext.jsx', line: 416, note: `saveStep, called by Listing${key.replace('step', 'Step')}` },
    handler: { file: 'backend/main/events/views.py', line: 281, note: 'EventDraftViewSet.partial_update' },
    serializer: { file: 'backend/main/events/serializer.py', line: 138, note: 'EventDraftSerializer, data validated as a plain dict' },
    reads: ['events_eventdraft'], writes: ['events_eventdraft'],
    status: 200,
    requestBody: J({ data: { steps: mergedSteps }, current_step: next }),
    responseBody: J({ id: DRAFT_ID, status: 'draft', current_step: next, data: draft.fields.data }),
    surprise: key === 'step1'
      ? 'The server merge is top level: {**(instance.data or {}), **incoming_data}. Sending only the one step would wipe the others, so the client resends the whole steps map every time.'
      : undefined,
  })
  w.client.route = `/listing/${DRAFT_ID}/${next}`
  w.client.screen = next === 'review' ? 'ListingReview' : `Listing${next.replace('step', 'Step')}`

  w.why['events_eventdraft.draft:19.data'] = {
    claim: 'The JSON blob holds every answer the wizard collects, except the files.',
    chain: [
      { text: 'EventDraft has exactly one JSONField called data. There is no per-field Event row until publish.', source: { file: 'backend/main/events/models.py', line: 115, note: 'data = models.JSONField(default=dict, blank=True)' } },
      { text: 'partial_update merges at the top level only, so the client resends the whole steps map on every save.', source: { file: 'backend/main/events/views.py', line: 293, note: '{**(instance.data or {}), **incoming_data}' } },
      { text: 'Uploads never enter the blob. They take a separate endpoint and write EventDraftAsset rows.', source: { file: 'backend/main/events/views.py', line: 437, note: '@action(url_path="assets")' } },
      { text: 'Publish is where the two rejoin: _build_event_payload reads the step dicts and the asset rows together.', source: { file: 'backend/main/events/views.py', line: 372, note: 'media_assets alongside step1..step8' } },
    ],
  }
}

// ---------------------------------------------------------------------------
// verdicts: the stage-0 comparison, recomputed from the same world
// ---------------------------------------------------------------------------

function computeVerdicts(w: World, k: Knobs, cursor: number) {
  const reached = (stepId: StepId) => STEPS.findIndex((s) => s.id === stepId) < cursor

  const loginTrace = !reached('login')
    ? 'not run yet'
    : k.serializeUserType
      ? 'user_type and roles both reach the client. navigate(\'/\') for everyone regardless.'
      : `roles: ["EVENT_ORGANIZER"] reaches the client. user_type never does. navigate('/') for everyone.`
  w.verdicts.login = {
    names: 'LoginAPIView authenticates and tells the app who this person is.',
    trace: loginTrace,
    diverges: reached('login') && !k.serializeUserType,
  }

  const profileTrace = !reached('open_profile')
    ? 'not run yet'
    : k.artistRow === 'none'
      ? '/profile asks one question, "is there an Artist row?", gets no, and lands on /profile/edit: a bio and a picture.'
      : '/profile found an Artist row and redirected to /artists/9.'
  w.verdicts.profile = {
    names: 'ProfileRedirect sends you to your profile. OrganizerProfilePage is the organizer\'s.',
    trace: reached('open_profile') && !k.organizerPageReachable
      ? `${profileTrace} OrganizerProfilePage has a route and no way in.`
      : profileTrace,
    diverges: reached('open_profile') && (k.artistRow === 'none' || !k.organizerPageReachable),
  }

  const draftRow = rowBySid(w, 'events_eventdraft', 'draft:19')
  const draftTrace = !reached('create_draft')
    ? 'not run yet'
    : !reached('publish')
      ? `One EventDraft row, data.steps holds ${Object.keys((draftRow?.fields.data as { steps?: object })?.steps ?? {}).length} step(s), current_step=${draftRow?.fields.current_step}.`
      : 'Event 88 created. EventDraft 19 still there, status=published, and my-events still lists it under "drafts".'
  w.verdicts.draft = {
    names: 'The wizard fills in an event step by step and publish turns the draft into it.',
    trace: draftTrace,
    diverges: reached('publish'),
  }

  const reqCount = w.tables.scheduling_bookingrequest.rows.length
  const bookingTrace = !reached('open_book_artist')
    ? 'not run yet'
    : !k.resourceExists
      ? 'The artist has no MarketplaceResource, so the page renders "Not available for online booking" instead of a form.'
      : reqCount > 0
        ? `${reqCount} BookingRequest row(s), status pending. No AvailabilitySlot touched.`
        : 'HTTP 400 "Either event_id or event_draft_id is required." No row written.'
  w.verdicts.booking = {
    names: 'Request Booking creates a booking request against the artist.',
    trace: bookingTrace,
    diverges: reached('open_book_artist') && (!k.resourceExists || reqCount === 0),
  }
}

// ---------------------------------------------------------------------------
// probes: each one traces to a claim-card field or a registered failure
// ---------------------------------------------------------------------------

export const PROBE_META: { id: string; label: string; serves: string }[] = [
  { id: 'rows_written', label: 'rows written so far', serves: 'claim: the trace, not the names' },
  { id: 'draft_rows', label: 'EventDraft rows', serves: 'gap: publish does not consume the draft' },
  { id: 'drafts_key_len', label: 'my-events "drafts" length', serves: 'gap: the published draft still lists' },
  { id: 'dropdown_options', label: 'event dropdown options', serves: 'gap: the payload parse' },
  { id: 'booking_rows', label: 'BookingRequest rows', serves: 'idempotency, and the 400' },
  { id: 'slot_rows', label: 'AvailabilitySlot rows', serves: 'nothing is reserved at request time' },
  { id: 'user_type_crossings', label: 'times user_type crossed the API', serves: 'gap: two role systems, one exposed' },
]

function computeProbes(w: World, k: Knobs) {
  let written = 0
  for (const c of w.calls) written += c.writes.length
  w.probes['rows_written'] = w.calls.reduce((n, c) => n + (c.status < 400 ? c.writes.length : 0), 0)
  w.probes['draft_rows'] = w.tables.events_eventdraft.rows.length
  w.probes['drafts_key_len'] = w.tables.events_eventdraft.rows.length
  w.probes['booking_rows'] = w.tables.scheduling_bookingrequest.rows.length
  w.probes['slot_rows'] = w.tables.scheduling_availabilityslot.rows.length
  w.probes['user_type_crossings'] = k.serializeUserType ? w.calls.filter((c) => c.cid === 'login' || c.cid === 'me').length : 0
  if (!('dropdown_options' in w.probes)) w.probes['dropdown_options'] = 0
  void written
}

// ---------------------------------------------------------------------------
// changeset: diff two worlds, field by field
// ---------------------------------------------------------------------------

export function diff(before: World, after: World): FieldChange[] {
  const out: FieldChange[] = []
  for (const name of ALL_TABLES) {
    const b = before.tables[name].rows
    const a = after.tables[name].rows
    for (const row of a) {
      const prior = b.find((r) => r.sid === row.sid)
      if (!prior) {
        out.push({
          table: name, sid: row.sid, field: '(row)', before: undefined, after: 'created',
          source: sourceForTable(after, name),
        })
        continue
      }
      for (const key of Object.keys(row.fields)) {
        const bv = JSON.stringify(prior.fields[key])
        const av = JSON.stringify(row.fields[key])
        if (bv !== av) {
          out.push({ table: name, sid: row.sid, field: key, before: prior.fields[key], after: row.fields[key], source: sourceForTable(after, name) })
        }
      }
    }
    for (const row of b) {
      if (!a.find((r) => r.sid === row.sid)) {
        out.push({ table: name, sid: row.sid, field: '(row)', before: 'existed', after: undefined, source: sourceForTable(after, name) })
      }
    }
  }
  return out
}

/** The last call that wrote this table is the line responsible for the change. */
function sourceForTable(w: World, name: TableName) {
  for (let i = w.calls.length - 1; i >= 0; i--) {
    if (w.calls[i].writes.includes(name)) return w.calls[i].serializer ?? w.calls[i].handler
  }
  return { file: '(seed)', line: 0, note: 'set up before the journey started' }
}

export function clientDiff(before: World, after: World): { field: string; before: unknown; after: unknown }[] {
  const out: { field: string; before: unknown; after: unknown }[] = []
  if (before.client.route !== after.client.route) out.push({ field: 'route', before: before.client.route, after: after.client.route })
  if (before.client.screen !== after.client.screen) out.push({ field: 'screen', before: before.client.screen, after: after.client.screen })
  const keys = new Set([...Object.keys(before.client.localStorage), ...Object.keys(after.client.localStorage)])
  for (const key of keys) {
    if (before.client.localStorage[key] !== after.client.localStorage[key]) {
      out.push({ field: `localStorage['${key}']`, before: before.client.localStorage[key], after: after.client.localStorage[key] })
    }
  }
  const bu = JSON.stringify(before.client.user)
  const au = JSON.stringify(after.client.user)
  if (bu !== au) out.push({ field: 'AuthProvider user', before: before.client.user, after: after.client.user })
  return out
}

export { TABLE_LABELS, ALL_TABLES, DRAFT_ID, ORGANIZER_ID, ARTIST_ID, RESOURCE_ID }
export type { Why }
