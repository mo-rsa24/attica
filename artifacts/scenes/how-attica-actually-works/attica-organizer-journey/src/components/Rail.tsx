// The manipulation surface. Every switch is a real condition in the repo, and the
// value marked "repo" is what is true at /home/molef/Work/attica today.

import { DEFAULT_KNOBS, type Knobs } from '../model/types'
import { useScene } from '../store'

type Opt<K extends keyof Knobs> = { v: Knobs[K]; t: string }

function Seg<K extends keyof Knobs>({
  k, label, opts, real,
}: {
  k: K
  label: string
  opts: Opt<K>[]
  real: string
}) {
  const { knobs, setKnob } = useScene()
  const current = knobs[k]
  return (
    <div className="knob">
      <span className="k-label">
        {label}
        {current === DEFAULT_KNOBS[k] && <span className="badge-repo">repo</span>}
      </span>
      <div className="seg">
        {opts.map((o) => (
          <button
            key={String(o.v)}
            className={`${current === o.v ? 'on' : ''}${o.v === DEFAULT_KNOBS[k] && current === o.v ? ' repo' : ''}`}
            onClick={() => setKnob(k, o.v)}
          >
            {o.t}
          </button>
        ))}
      </div>
      <div className="k-real">{real}</div>
    </div>
  )
}

export function Rail() {
  return (
    <aside className="rail" data-tour="tour-knobs">
      <h2>Stage 1 · login</h2>
      <Seg
        k="serializeUserType"
        label="user_type in UserSerializer.fields"
        opts={[{ v: false, t: 'absent' }, { v: true, t: 'present' }]}
        real="Meta.fields lists roles and not user_type. Two role systems exist; one crosses the API."
      />

      <h2>Stage 2 · profile</h2>
      <Seg
        k="artistRow"
        label="Artist row for this user"
        opts={[
          { v: 'none', t: 'none' },
          { v: 'via_query', t: 'found by query' },
          { v: 'via_field', t: 'on user object' },
        ]}
        real="/profile asks only this. An organizer has no Artist row, so it always falls through to /profile/edit."
      />
      <Seg
        k="organizerPageReachable"
        label="a link to /organizers/:id"
        opts={[{ v: false, t: 'none' }, { v: true, t: 'exists' }]}
        real="grep finds one hit: the route in App.jsx:148. OrganizerProfilePage is built and unreachable."
      />

      <h2>Stage 4 · booking</h2>
      <Seg
        k="resourceExists"
        label="MarketplaceResource for the artist"
        opts={[{ v: false, t: 'absent' }, { v: true, t: 'opted in' }]}
        real="Nothing creates it when an Artist is created. The artist must POST it from ProviderAvailabilityPage."
      />
      <Seg
        k="myEventsShape"
        label="my-events payload shape"
        opts={[
          { v: 'drafts_published', t: '{drafts,published}' },
          { v: 'bare_array', t: '[ ... ]' },
          { v: 'paginated_results', t: '{results}' },
        ]}
        real="BookArtistPage tests for an array then for .results. The real payload is neither, so the dropdown is empty."
      />
      <Seg
        k="idempotencyHeader"
        label="Idempotency-Key header"
        opts={[{ v: true, t: 'sent' }, { v: false, t: 'omitted' }]}
        real="schedulingApi generates one per call. Without it a double submit writes a second BookingRequest."
      />
      <Seg
        k="chatBidHasMatch"
        label="a BookingRequest the bid can match"
        opts={[{ v: false, t: 'no match' }, { v: true, t: 'match' }]}
        real="On no match chat/signals.py logs at debug and returns. It never creates a BookingRequest."
      />

      <h2>The fork axis</h2>
      <Seg
        k="bookingEntry"
        label="booking submitted from"
        opts={[
          { v: 'book_artist_page', t: 'BookArtistPage' },
          { v: 'wizard_provider_card', t: 'ProviderCard' },
        ]}
        real="Only ProviderCard sends event_draft_id, and only event_draft_id survives to a Booking at publish."
      />
    </aside>
  )
}
