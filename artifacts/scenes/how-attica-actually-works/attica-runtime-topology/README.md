# Attica's runtime topology

## The claim

The browser experiences "hit save" as one instant, one origin, but that instant is
actually carried by four independently-failing processes (Vite, Django/DRF,
Daphne/ASGI+Channels, Redis) glued by a dev-only proxy, and reproducing a bug across
that seam requires two separate debuggers, attached to two separate runtimes,
stepping in sync.

The alternative: classical server-rendered MVC, one process, one language, one
debugger sees the whole request. Reach for the four-process split for the
chat/notifications real-time overlay and independent frontend iteration; the
classical alternative still wins for a bug that only reproduces when a WebSocket
message races a REST call, invisible from either debugger alone.

## Run it

```bash
npm install
npm run dev
```

## Click this first

Open stage 0 and toggle **Redis: channel layer (DB 0)** off, either from the topology
diagram's Redis node or from the parts described in `SPEC.md`. Watch the `/ws` line
in the reachability readout turn red with a real `redis.exceptions.ConnectionError`,
while `/api`, `/vendors`, `/cart` and `/checkout` stay exactly as they were. That
split, checked live as a persistent invariant rather than asserted, is the whole
claim in one click.
