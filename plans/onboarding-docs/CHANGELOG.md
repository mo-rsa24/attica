# CHANGELOG: onboarding-docs

History of corrections to this scope. The plan and guide files themselves read in the
present tense; anything that used to be wrong is recorded here and nowhere else.

## 2026-08-14: plan-tree sync against repo evidence

**Statuses reconciled with what is actually on disk.** Plans 01, 02, and 03 had produced
their artifacts in commit `d53df63` (2026-07-28) but only plan 02 carried ticks, and those
ticks still had `⚠️ pending` markers beside them. Plans 01 and 03 read as not-started while
all six of their output files existed and were committed.

**Stale [JWT](../../../../Obsidian/Information%20Technology/Security/JSON%20Web%20Token.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=236 "System design big archive, Tokens vs API Keys, Works the token flow in eight steps: a login, an identity service issuing the JWT, the frontend sending it in ..."), [2](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=51 "System design big archive, JWT 101: Key to Stateless Authentication, The header, payload and signature, then signing with one shared secret against signing w..."), [3](../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=26 "System design big archive, Cookies Vs Sessions Vs JWT Vs PASETO, Where the JWT sits among the ways to stay logged in: stateless and scalable, at the cost of ..."), [▶1](https://www.youtube.com/watch?v=T0k-3Ze4NLo&t=1696s "Hussein Nasser, JWT: JSON Web Token Crash Course (NodeJS & Postgres), Example coding, 28:16 to 42:00, JWT authentication coded in NodeJS against Postgres, af..."), [▶2](https://www.youtube.com/watch?v=P2CPd9ynFLg&t=68s "ByteByteGo, Why is JWT popular?, Token structure and claims, 1:08 to 2:10, The token's parts and its claims, before the chapters on signing and on JWT's vuln..."), [◆](../../../../goal-setting/learning/ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions/plans/09-a-token-decoded-by-hand.md "Read a token by hand, ai-engineering/llm-applications/retrieval-augmented-generation/document-qa-with-permissions, plan 09. A staff member's JWT decoded on p...")</sub> facts corrected in plan 04 and plan 03.** Both carried numbers copied from an
earlier unpack output that never matched `backend/main/main/settings.py`:

| Claim | Was written | Verified in code |
|---|---|---|
| Access token lifetime | 5 minutes | 30 minutes (`settings.py:215`) |
| Refresh token lifetime | 24 hours | 7 days (`settings.py:216`) |
| Refresh endpoint the frontend calls | `/api/token/refresh/` | `/api/accounts/token/refresh/` (`AuthProvider.jsx:28`, `useAxios.js:37`) |
| localStorage layout | separate `access_token` / `refresh_token` keys | one `tokens` key holding `{ access, refresh }` (`AuthProvider.jsx:61`) |
| Vite proxied paths | `/api`, `/chat` | `/api`, `/vendors`, `/cart`, `/checkout`, `/ws` (`vite.config.js`) |
| Refresh behaviour | described as "automatic token rotation" | refresh only; `ROTATE_REFRESH_TOKENS` is `False` (`settings.py:217`) |

Verified by grep after the sweep: `grep -rn "token/refresh\|5 min\|24 h" plans/onboarding-docs/`
returns only the correct endpoint and no stale lifetimes.

**Correction table removed from `onboarding-source.md`.** Section 8, "Corrections to [Prior](../../../../Obsidian/Mathematics/Statistics/Bayesian%20Inference/Prior%20Distribution.md#where-to-learn-this)<sub>[1](../../../../Obsidian/Mathematics/references/textbooks/machine-learning/probabilistic-machine-learning-an-introduction.pdf#page=150 "Probabilistic machine learning: an introduction, sections 4.6.1 and 4.6.2, Works with numbers: a conjugate prior keeps the posterior in the prior's own famil..."), [2](../../../../Obsidian/Mathematics/references/textbooks/statistics/introduction-to-probability-for-data-science.pdf#page=519 "Introduction to probability for data science, sections 8.3.1 and 8.3.2, The trio of likelihood, prior and posterior, the prior that ML lacks and MAP adds (pa..."), [3](../../../../Obsidian/Mathematics/references/textbooks/machine-learning/mathematics-for-machine-learning.pdf#page=191 "Mathematics for machine learning, section 6.3, The prior p(x) as what is known about an unobserved variable before observing y, inside Bayes' theorem."), [▶1](https://www.youtube.com/watch?v=5Vawq2b5F7c&t=560s "TileStats, Bayesian statistics, the basics, 9:20 to 12:47, The prior distribution, in the chapter of that name, between Bayes' theorem and computing the post..."), [▶2](https://www.youtube.com/watch?v=-1dYY43DRMA&t=786s "ritvikmath, What the Heck is Bayesian Stats ??, 13:06 to 16:07, Updating prior beliefs with the data. Chapter-timed."), [◆](../../../../goal-setting/learning/deep-learning/generative-models/03-sampling-from-a-graph/plans/25-map-derived.md "Derive MAP, and draw the prior as a parent of θ, deep-learning/generative-models/03-sampling-from-a-graph, plan 25. A Beta(2, 2) prior on a coin's θ, drawn a...")</sub>
Unpack Output", narrated which earlier claims had been wrong. Every fact it carried is
already stated correctly in the body of the same document (§5.3 for lifetimes and the
`tokens` key, §6 for the refresh endpoint) and in `design-decisions.md`, so the section was
removed rather than kept as a second copy. Its content is the table above.

**Plan 07's origin note absorbed.** The plan carried a paragraph explaining that
`artifacts/notes/onboarding-a-new-developer/00-machine-setup.md` had been added after the plan was first written. The guide is
now simply part of the walkthrough the plan describes.

**Plan 06's scope corrected.** It named plans 01 through 05 as its input; the scope has
seven plans, and 06 and 07 carry task lines of their own.

**Backend install trap fixed during the cold-start walk.** `backend/requirements.txt` was a
stale pip-freeze snapshot that shadowed `backend/main/requirements.txt` and pulled OS
packages (`cloud-init`, `dbus-python`) into a fresh install. Removed in `d53df63`. This is
the only part of plan 07's dry run with evidence in the repo.
