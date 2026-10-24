# 12. JavaScript ES6 and Async Patterns

## Purpose
This chapter focuses on JavaScript and ES6 concepts that are load-bearing in the Attica codebase. It explains async/await, promises, error handling, and patterns that appear in frontend API integration and background operations.

Prerequisites: basic JavaScript syntax, arrow functions, destructuring.  
Follow-up: [09 Full-Stack Integration Patterns](./09-full-stack-integration-patterns.md).

## Async/Await Essentials for This System

### Why Async/Await Matters Here
Fetch API calls are the primary way the frontend communicates with Django. Every page load, form submission, and [polling](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub> loop involves async operations. Understanding how to compose, handle, and sequence them is critical.

### Basic Async/Await Pattern
```javascript
async function fetchUser(userId) {
  const response = await fetch(`/api/users/${userId}/`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Usage in a hook
useEffect(() => {
  (async () => {
    try {
      const user = await fetchUser(1);
      setUser(user);
    } catch (err) {
      setError(err.message);
    }
  })();
}, []);
```

### Error Handling: Network vs HTTP vs Domain Errors
Critical pattern in Attica: the fetch API distinguishes these three classes of errors, and they need different UI responses.

```javascript
// Network error: server unreachable, timeout, etc.
// HTTP error: 401, 404, 422 — need different handling per status
// Domain error: booking already has a review, policy conflict, etc.

async function bookResource(resourceId, startTime, endTime) {
  try {
    const response = await fetch('/api/scheduling/bookings/', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ resource_id: resourceId, start: startTime, end: endTime })
    });

    // HTTP error — server responded, but request failed
    if (!response.ok) {
      const data = await response.json(); // parse error detail from backend
      if (response.status === 422) {
        // Unprocessable entity: domain error (policy conflict, etc.)
        throw new Error(data.detail); // "This time slot is unavailable"
      } else if (response.status === 401) {
        // Unauthorized: token expired or user not authenticated
        throw new Error('Session expired. Please log in.');
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    // Network error: network is down, CORS blocked, timeout, etc.
    if (err instanceof TypeError) {
      throw new Error('Network error. Check your connection.');
    }
    // Re-throw domain or HTTP errors
    throw err;
  }
}
```

Why this pattern matters: the frontend can now show contextual messages instead of a generic "something went wrong."

### Sequential vs Parallel Data Loading
Pattern: use `Promise.all()` when fetches are independent; use sequential `await` when one depends on the other.

```javascript
// Sequential: booking depends on knowing the event
async function loadBookingWorkflow(bookingId) {
  const booking = await fetch(`/api/scheduling/bookings/${bookingId}/`).then(r => r.json());
  const event = await fetch(`/api/events/${booking.event_id}/`).then(r => r.json());
  return { booking, event };
}

// Parallel: user and notifications are independent
async function loadDashboard(userId) {
  const [user, notifications] = await Promise.all([
    fetch(`/api/users/${userId}/`).then(r => r.json()),
    fetch(`/api/notifications/?user_id=${userId}`).then(r => r.json())
  ]);
  return { user, notifications };
}
```

Common mistake: loading everything sequentially when some can load in parallel, making the page feel slow.

## Promise Patterns and Race Conditions

### Race Conditions in State Updates
Problem: two fetch calls start for the same resource with different filters. The second request finishes first, the first finishes second and overwrites the state with stale data.

```javascript
// Bad: can race
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`/api/search?q=${query}`)
      .then(r => r.json())
      .then(data => setResults(data)); // may be stale if query changed twice
  }, [query]);

  return <div>{results.length} results</div>;
}

// Good: uses AbortController to cancel stale requests
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/search?q=${query}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setResults(data)) // only updates if request wasn't aborted
      .catch(err => {
        if (err.name === 'AbortError') return; // ignore cancellations
        setError(err.message);
      });

    return () => controller.abort(); // cleanup: cancel if component unmounts or query changes
  }, [query]);

  return <div>{results.length} results</div>;
}
```

Why this matters in Attica: booking detail pages, availability calendars, and search results all change filters/routes frequently. Without AbortController, you get flickering state and stale data.

### Promise.allSettled for Bulk Operations
Pattern: when you need to know all results, even if some fail.

```javascript
// Approve multiple booking requests
async function approveAllRequests(requestIds) {
  const results = await Promise.allSettled(
    requestIds.map(id =>
      fetch(`/api/scheduling/requests/${id}/approve/`, { method: 'POST' })
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`Approved ${successful}, failed ${failed}`);
}
```

## Closures and Stale Closures in useEffect

### The Stale Closure Problem
```javascript
// Bad: token is captured at render time, becomes stale
function UserProfile() {
  const [user, setUser] = useState(null);
  const token = useToken(); // changes when token refreshes

  useEffect(() => {
    fetch(`/api/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setUser);
    // Missing dependency: token is used but not listed
    // If token refreshes, the effect doesn't re-run, and old token is used
  }, []); // BUG: should include [token]

  return <div>{user?.name}</div>;
}

// Good: re-run when token changes
function UserProfile() {
  const [user, setUser] = useState(null);
  const token = useToken();

  useEffect(() => {
    fetch(`/api/me/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setUser);
  }, [token]); // Now the effect re-runs when token changes
}
```

Why this matters: auth refresh is a common pattern in Attica. Missing token in dependencies means pages load with an expired token.

## Retry Logic and Exponential Backoff

### Basic Retry Pattern
```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && response.status >= 500) {
        // Server error: worth retrying
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (err) {
      if (attempt === maxRetries - 1) throw err; // last attempt, give up
      // Wait before retry: 1s, 2s, 4s, etc.
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
}
```

When to use: background syncs, [polling](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Polling.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=180 "System design interview, chapter 12, Design a chat system, Polling and Long polling, Polling and then long polling as two ways to fake a server-initiated mes..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, Short polling, where the browser keeps asking, against long polling, where the server..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=259 "System design interview, chapter 15, Design Google Drive, Notification service, Chooses long polling over WebSocket for file-change notifications because the..."), [▶1](https://www.youtube.com/watch?v=x_jjhcDrISk&t=42s "ByteByteGo, Top 3 Things You Should Know About Webhooks!, Polling vs long polling, 0:42 to 1:30, The two kinds of polling a webhook is set against. Chapter-t..."), [▶2](https://www.youtube.com/watch?v=5aRamFLgtis&t=230s "Hussein Nasser, The genius of long polling, Long Polling, 3:50 to 8:18, Long polling explained right after the chapters on plain polling and its problem, fol..."), [◆](../../../../../../goal-setting/learning/ai-engineering/product-data-validation-end-to-end/textbook/01-the-design.md#15-polling-against-being-told "Chapter 1: The design, ai-engineering/product-data-validation-end-to-end, chapter 1, section 1.5. Works polling on numbers: pulling the whole SAP table retur...")</sub> for status, booking confirmation checks. When NOT to use: user-initiated actions (let them retry manually).

## Module Imports and Circular Dependencies

### Import Patterns in Attica
```javascript
// Named imports (most common)
import { BookingSerializer, approveRequest } from './api/schedulingApi';

// Default import
import useAxios from './utils/useAxios';

// Mix
import Scheduler, { ScheduleOptions } from './Scheduler';

// Side-effect imports (rare, but used for setup)
import './styles/bootstrap.css'; // loads CSS, no export needed
```

### Avoiding Circular Dependencies
Problem: `auth.js` imports `api.js` (to refresh tokens), `api.js` imports `auth.js` (to read current token).

Solution: extract shared functions to a neutral module, or use lazy imports.

```javascript
// Bad: circular
// auth.js
import { makeRequest } from './api.js';

// api.js
import { getCurrentToken } from './auth.js';

// Good: extract shared concern
// tokens.js
export function setToken(t) { localStorage.setItem('token', t); }
export function getToken() { return localStorage.getItem('token'); }

// auth.js
import { getToken, setToken } from './tokens.js';

// api.js
import { getToken } from './tokens.js';
```

## Template Literals and String Interpolation

### API URLs and Query Strings
```javascript
// Template literals make URLs readable
const userId = 42;
const query = 'artists';
const page = 2;

// Bad: string concatenation
const url = '/api/search?q=' + query + '&type=artists&page=' + page;

// Good: template literal
const url = `/api/search?q=${query}&type=artists&page=${page}`;

// Better: URLSearchParams for complex query strings
const params = new URLSearchParams({
  q: query,
  type: 'artists',
  page: page,
  filters: ['verified', 'available'].join(',')
});
const url = `/api/search?${params.toString()}`;
```

## Object Destructuring and Spread Operator

### Common Patterns in React Components
```javascript
// Props destructuring
function BookingCard({ booking, onApprove, onReject }) {
  return <div>...</div>;
}

// State updates with spread
const [booking, setBooking] = useState({});
setBooking({ ...booking, status: 'approved' });

// Merging objects
const defaultFilters = { status: 'pending', sort: 'date' };
const userFilters = { status: 'approved' };
const combined = { ...defaultFilters, ...userFilters }; // status is 'approved'

// Extracting specific fields
const { id, status, price, ...rest } = booking;
// now rest contains everything except id, status, price
```

## Key Takeaway
Master these async, error-handling, and state patterns and you'll avoid the most common frontend bugs in Attica: stale requests, missing error messages, and data [race conditions](../../../../../../Obsidian/Information%20Technology/Concurrency/Race%20Condition.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=66 "System design interview, chapter 4, Design a rate limiter, Race condition, Works it with numbers: the counter in Redis is 3, two requests both read 3 before ..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=13 "Grokking the system design interview, section 11.3, Concurrency, Keeps two users from booking the same seat with a serializable transaction that reads the se..."), [▶1](https://www.youtube.com/watch?v=d8rmosXttTE&t=71s "Hello Interview, Concurrency in Low-level Design Interviews, Motivating Example, 1:11 to 3:23, The concrete case the rest of the video fixes, from a staff en..."), [▶2](https://www.youtube.com/watch?v=d8rmosXttTE&t=203s "Hello Interview, Concurrency in Low-level Design Interviews, Correctness: Check-Then-Act & Read-Modify-Write, 3:23 to 9:52, The two shapes most race conditio..."), [◆](../../../../../../goal-setting/learning/projects/attica/architecture-decisions/plans/08-trace-the-race.md "Trace a two-actor race by hand, projects/attica/architecture-decisions, plan 08. Two accept requests drawn on paper as interleaved steps against one free dat...")</sub>.
