# Architecture reviews

The three reviews `WHERE-WE-LANDED.md` was checked against. Save them here as:

- `01-system-architecture.md`: the target architecture. Bounded domains inside a modular monolith,
  PostgreSQL with range exclusion constraints, `BookingClaim`, availability versioning, persist
  first and push second, the event envelope, eight diagrams, and a ten-step build order.
- `02-performance-and-experience.md`: the two tracks the first one left out. Screen-shaped read
  endpoints, query budgets, journey-derived indexes, the [caching](../../../../../Obsidian/Information%20Technology/System%20Design/Caching/Cache.md#where-to-learn-this)<sub>[1](../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=15 "System design interview, chapter 1, Cache, Walks one web request through a cache tier (check the cache, on a miss query the database and store the answer), t..."), [2](../../../../../Obsidian/Mathematics/references/textbooks/system-design/grokking-the-system-design-interview.pdf#page=15 "Grokking the system design interview, section 13, Caching, The three invalidation schemes (write-through, write-around and write-back), each with what it cos..."), [3](../../../../../Obsidian/Mathematics/references/textbooks/ai-engineering/ai-engineering.pdf#page=871 "AI engineering, chapter 10, Step 4, Reduce latency with caches, Exact caching and semantic caching of model answers, how long to keep a query, and how a cach..."), [▶1](https://www.youtube.com/watch?v=dGAgxozNWFE&t=239s "ByteByteGo, Cache Systems Every Developer Should Know, Distributed and backend cache, 3:59 to 4:42, The shared cache that sits between services and the datab..."), [▶2](https://www.youtube.com/watch?v=RCdAGvtTYI0&t=97s "Hayk Simonyan, The Ultimate Guide to Caching and CDNs, Cache HIT, MISS, and Ratio, 1:37 to 2:09, Names a hit, a miss and the hit ratio that measures a cache...."), [◆](../../../../../goal-setting/learning/system-design/foundations/plans/10-the-nginx-cache.md "The nginx cache: MISS, then HIT, system-design/foundations, plan 10. An nginx cache answers the corner shop's catalogue page by itself on the second request,...")</sub> rule, and a frontend design system
  of Tailwind 4, shadcn on Base UI, TanStack Query and a motion language.
- `03-booking-journey.md`: the booking journey end to end. Hold on acceptance, a payment provider
  interface behind a mock, cancellation with policy, two-level notifications, and the two-browser
  acceptance test.

They are cited in `WHERE-WE-LANDED.md` sections 3 and 4, so the decisions there can be traced back
to which review argued what, and where two of them disagree.
