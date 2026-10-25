# Diagram prompts: running the workers

## Art direction

Inherited from [the parent map](../../diagram-prompts.md), which is the vocabulary authority. Same
style, same meaning palette, same glyph vocabulary and tiers, same reading axes. This scope declares
no new glyph, no new colour meaning and no new tier.

This map is the zoom-in on the workers glyph in [the parent's subject capstone](../../diagram-prompts.md),
one of the five component glyphs in the domain panel. The parent capstone keeps it as a single
glyph.

**Everything this scope draws is already in the parent's vocabulary**, which is why there is nothing
to add. The worker gear, the queue tray, the cylinder and the browser card are the four glyphs it
needs, orange dashed already means a queued or [outbox](../../../../../../Obsidian/Information%20Technology/System%20Design/Messaging/Outbox%20Pattern.md#where-to-learn-this)<sub>[▶1](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=23s "Confluent, What is the Transactional Outbox Pattern? ∣ Designing Event-Driven Microservices, What is the dual-write problem?, 0:23 to 0:51, The problem the p..."), [▶2](https://www.youtube.com/watch?v=5YLpjPmsPCA&t=51s "Confluent, What is the Transactional Outbox Pattern?, What is the transactional outbox pattern?, 0:51 to 1:33, The pattern itself, before how its events reac..."), [◆](../../../../../../goal-setting/learning/system-design/foundations/plans/19-outbox-queue-and-worker.md "The outbox, the queue and the worker, system-design/foundations, plan 19. The corner shop's order and an 'order placed' event written in one transaction, a r...")</sub> event and purple dashed already means a
[WebSocket](../../../../../../Obsidian/Information%20Technology/Networking/WebSocket.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=182 "System design interview, chapter 12, Design a chat system, WebSocket, The connection the client opens as HTTP and upgrades through a handshake, bi-directiona..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-interview.pdf#page=190 "System design interview, chapter 12, Design a chat system, Service discovery and 1 on 1 chat flow, Works one message end to end: user A connects to chat serv..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/system-design/system-design-big-archive.pdf#page=425 "System design big archive, Can a web server provide real-time updates?, WebSocket against server-sent events: both let the server send the latest data once c..."), [▶1](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=870s "Hussein Nasser, WebSockets Crash Course, WebSockets Example Code, 14:30 to 36:40, A WebSocket server and client written on screen. Chapter-timed."), [▶2](https://www.youtube.com/watch?v=2Nt-ZrNP22A&t=480s "Hussein Nasser, WebSockets Crash Course, WebSockets Handshake, 8:00 to 11:20, The upgrade handshake that turns an HTTP request into a WebSocket. Chapter-timed."), [◆](../../../../../../goal-setting/learning/projects/attica/event-creation/plans/02-rebuild-from-scratch/plans/23-channels-websocket-push.md "Channels websocket push, projects/attica/event-creation/plans/02-rebuild-from-scratch, plan 23. A Channels consumer over the Redis channel layer, the '/ws' p...")</sub> push, and the one thing this scope is about is where an orange dashed arrow fails to
become a purple dashed one.

**Two things not to confuse.** This file is the picture of the scope's own shape. The delivery-path
and contention diagrams that describe the same machinery for a reader of the system are deliverables
of `the-system-in-layers`, drawn in the same direction and not from this file.

---

## Subject lane

### Piece 1: ten commands and nothing that starts them `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-01-nothing-starts-them.png`

**Visual thesis.** Every piece of recurring work exists as a command somebody has to remember, and
the thing that would remember is not in the picture because it is not in the repository.

An application-tier panel holding ten command glyphs in two rows: seven drawn in muted grey with no
inbound arrow at all, and three drawn the same way but grouped inside a small sub-panel titled with
what they are for, so they read as deliberately outside the group rather than forgotten with it.
Above the panel, centred, one worker gear drawn as an empty outline with a question-mark glyph on
it in the decide colour, and no arrow leaving it. To the left, outside everything, a small person
figure at a terminal card with ten short blue dashed arrows leaving it, one to each command, because
today the person is the scheduler.

**Faithfulness note.** Ten command glyphs, seven loose and three inside their own sub-panel. The gear
above them is an outline with no arrow leaving it. Every arrow in the image starts at the person
figure. Nothing is coloured as running.

### Piece 2: the command named for a job it does not do `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-02-named-for-a-job-it-does-not-do.png`

**Visual thesis.** Two commands with different names run the same code, so the job one of them is
named after is done by nothing, and the field it would have swept is swept only by whoever happens
to read it.

Two command glyphs side by side, each labelled with its own name, each with an arrow into the *same*
service glyph below them, and a red chip on the pair reading that they are identical. To the right,
separated by a gap, a cylinder with one field row highlighted and no arrow arriving at it from
either command. Below that cylinder, a browser card with a blue dashed arrow leaving it into the
field row, labelled to show that a read is what notices, and a purple dashed arrow drawn as a stub
that stops at a gap before reaching the browser card, marked with the red defect colour, because
nobody is told.

**Faithfulness note.** Both command glyphs point at one service glyph. The cylinder's highlighted
field has exactly one arrow arriving and it comes from the browser card, not from a command. The
purple dashed stub stops short of the browser card and is drawn in the defect colour.

### Piece 3: two writers, one socket `[planned]` ⏳ not rendered

**Visual thesis.** Two pieces of code write the same notification row and only one of them tells
anybody, and the one that stays silent is the one on the path the whole booking journey uses.

**Save as:** `diagrams/subject-03-two-writers-one-socket.png`

Two horizontal tracks, one above the other, sharing an end and not a start. The upper track begins at
a handler glyph, runs a green solid write into a cylinder, and continues as a purple dashed arrow
into a browser card. The lower track begins at a queue tray, runs an orange dashed arrow into a
worker gear, a green solid write into the *same* cylinder, and then nothing: the browser card at its
end is repeated as an empty outline with no arrow arriving. Between the two tracks, one shared
group glyph both purple dashed arrows would use, connected to the upper track only. A chip on each
track names the function that writes the row.

**Faithfulness note.** Both tracks write into one cylinder, drawn once. Exactly one purple dashed
arrow in the image, on the upper track. The lower track's browser card is an outline with no arrow
arriving. The shared group glyph has one connection, not two.

### Piece 4: the state you cannot leave `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-04-the-state-you-cannot-leave.png`

**Visual thesis.** The worker claims an event before doing the work, and the claim is what survives
if the worker does not.

A queue tray on the left holding five event rows. A worker gear beside it with a circular arrow
showing a claim, and one event row lifted out of the tray into a small holding pen labelled with the
claimed state. The gear is drawn cracked and greyed, with a red chip reading that the process died.
Below, the selection the next cycle makes: a bracket around the tray covering four of the five rows
and visibly excluding the one in the holding pen, with the two states it does cover named on the
bracket. No arrow leaves the holding pen in any direction. To the right, an empty framed slot in the
decide colour, sized like a gear, labelled with what does not exist yet.

**Faithfulness note.** Five event rows. Exactly one sits in the holding pen and has no arrow leaving
it. The bracket visibly covers four rows and excludes the fifth. The frame to the right is empty.

### Piece 5: one clock, three cadences, and the one still open `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-05-one-clock-three-cadences.png`

**Visual thesis.** Three jobs that look like three problems are one problem with three intervals, and
a fourth interval is waiting on a decision this scope does not take.

One large gear glyph in the centre in the decide colour, drawn as an outline with a question mark,
labelled with the decision it stands for. Three orange dashed arrows leave it to the right, each
ending at a job glyph with an interval chip on it. A fourth arrow leaves the same gear, drawn with
the grey dashed hedge outline and an "unconfirmed live" tag, ending at an empty job frame with an
empty interval chip and a label naming the sibling scope that owes it. Below the gear, a row of
candidate glyphs in muted grey with no arrow chosen between any of them and the gear, so the
drawing visibly declines to answer.

**Faithfulness note.** Four arrows leave the gear: three solid-ended at filled jobs, one hedged at an
empty frame. The candidate row below has no arrow connecting it to the gear. Every interval chip on
the three filled jobs carries a number; the fourth is empty.

---

## Subject capstone

### The workers glyph, opened up `[planned]` ⏳ not rendered

**Save as:** `diagrams/subject-capstone-the-workers-glyph-opened-up.png`

**Visual thesis.** One thing that runs at the bottom, the jobs it runs above it side by side because
they do not wait on each other, and the delivery at the top that is the only place a person finds
out any of it happened.

Three levels on the dominant vertical axis, which encodes dependency upward.

**Bottom.** One wide panel holding the runner: a single gear glyph, currently drawn in the decide
colour as an outline with a question mark on it, sitting on a platform labelled with what it must do
(start it, restart it when it dies, run it on a clock). Beside the gear inside the same panel, a
small candidate row in muted grey with nothing chosen. Nothing sits below this panel, because
nothing this scope builds depends on less than it.

**Middle.** Three lanes side by side at the same height, because the three jobs do not wait on each
other. Left lane: a queue tray with an orange dashed arrow into a worker gear, and a reaper glyph
drawn as a second small gear returning one row from a holding pen back into the tray. Middle lane:
two expiry job glyphs, one carrying a green tick and one carrying a red defect chip, with the second
paired to a cylinder field that has no arrow arriving. Right lane: a materialisation job glyph
feeding a cylinder of slot rows, drawn with the grey dashed hedge outline because the scope that owns
what a slot means is a different one. An upward arrow runs from the runner panel into all three
lanes.

**Top.** One panel holding two browser cards facing each other with a single purple dashed arrow
between them, and a small group glyph in the middle that both connect to. One green solid arrow
arrives at this panel from the left lane below. A short red chip sits on the panel edge naming the
one place today's code stops, drawn crossed through, because closing it is what this scope is for.

**Faithfulness note.** Three levels, bottom to top. The bottom gear is an outline in the decide
colour with nothing chosen beside it. The middle is three lanes at the same height, and the hedged
lane is the rightmost. The top panel has exactly one purple dashed arrow and its red chip is crossed
through. Nothing leaves the top edge.

Every piece in this map is hedged. Nothing in this scope is built.

---

## Process lane

The same cast as the subject lane with the five plan files drawn over it: what runs when, and what
each gate actually checks. Sequence is carried by the numbered step badges, which are the parent's
running-order numbers 11 to 15, so the pinned reading axes hold unchanged. Upward is still
dependency, and two things side by side still means they can run at the same time.

History: `diagrams/process-versions/`. This lane is regenerated whole, never patched.

### Prompt 1 (Process): nothing goes on a clock while it is still wrong `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-01-nothing-goes-on-a-clock-yet.png`

**Visual thesis.** Two things have to be true before a single job is scheduled: somebody has chosen
what runs it, and no command is still named for a job it does not do. Putting a lie on a clock runs
the lie every minute instead of when somebody remembers.

Two panels side by side at the same height at the bottom, because both wait on the same earlier
scope and on nothing else.

The left panel carries step badge 11. Inside it, a worker gear drawn as an empty outline with a
question-mark glyph on it, a candidate row beneath it in muted grey with nothing chosen, and a
person figure at a terminal card to one side with blue dashed arrows running into the candidate row,
because every exists-here answer in that row comes from a command run on this machine rather than
from memory.

The right panel carries step badge 12. Inside it, two command glyphs with different labels both
arrowed into one service glyph with a red chip across the pair, and, to the side, a cylinder with one
highlighted field row. One orange dashed arrow now leaves that cylinder into a queue tray, where the
subject lane's drawing of the same pair had only a stub that stopped short.

Above both panels, spanning their full width, one horizontal gate bar carrying step 13's platform
above it. The bar holds two small icons, a signed sheet and a counter, and is captioned with what
must be true to cross it. The only two arrows entering the bar come upward, one from each panel, and
nothing crosses it from the sides.

**Faithfulness note.** The two panels are the same height and neither feeds the other. The gear in
the left panel is still an outline with nothing chosen beside it; step 11 produces a signature, not a
running process. The right panel's change is exactly one orange dashed arrow reaching the queue tray,
and no purple dashed arrow appears anywhere in this image, because delivery is step 14 and drawing it
here claims the scope is finished two steps early. The gate spans both panels rather than sitting
over one.

### Prompt 2 (Process): five steps, five gates `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-02-five-steps-five-gates.png`

**Visual thesis.** Every step here is closed by somebody checking something a test cannot, and four
of the five gates are a person at a screen rather than a suite going green.

Five stages on the dominant vertical axis, read bottom to top, each carrying its running-order step
badge and each closed on its upper edge by a gate bar holding one icon that names what it checks.
Steps 11 and 12 are the two lowest and sit side by side at the same height; 13, 14 and 15 stack
singly above them.

Step 11, the decision: the outlined gear and the candidate row, gate holding a signed sheet,
captioned that somebody else can build from it without asking.

Step 12, the honest commands: two command glyphs into one service glyph with a red chip, gate
holding a counter, captioned as a count taken before and a count taken after.

Step 13, the runner: the same gear now filled and turning on a platform with a clock on it, a short
stack of log lines beside it with one line per job, and three seed command glyphs held outside the
platform behind a small barrier. Gate holds a cartoon figure at a cold terminal, captioned that a
stranger started it from the recipe.

Step 14, the two silent [losses](../../../../../../Obsidian/Artificial%20Intelligence/Machine%20Learning/Loss%20Function.md#where-to-learn-this)<sub>[1](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/understanding-deep-learning.pdf#page=33 "Understanding deep learning, section 2.2.2, Works the idea with numbers: each choice of intercept and slope for a line through twelve points gets one loss (7..."), [2](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/pattern-recognition-and-machine-learning.pdf#page=60 "Pattern recognition and machine learning, section 1.5.2, A loss matrix for cancer diagnosis that charges 1000 for missing a cancer and 1 for a false alarm, a..."), [3](../../../../../../Obsidian/Mathematics/references/textbooks/machine-learning/understanding-deep-learning.pdf#page=70 "Understanding deep learning, sections 5.1 to 5.2, A recipe that builds a loss for any kind of output from maximum likelihood: choose a distribution over the ..."), [▶1](https://www.youtube.com/watch?v=pdqofxJeBN8&t=3230s "CS231n lecture 2, 53:50 to 57:30, Defines the loss as the average of per-example losses that optimisation will minimise, after showing data a line cannot sep..."), [▶2](https://www.youtube.com/watch?v=cmNIMjPYdgM&t=879s "CS229 lecture 2, 14:39 to 17:41, Chooses the line that minimises prediction errors on the training data, empirical risk minimisation, and contrasts it with a..."), [◆](../../../../../../goal-setting/learning/machine-learning/classical-ml-from-scratch/MASTER_PLAN.md "Classical ML from Scratch, machine-learning/classical-ml-from-scratch. Goal 1 derives linear and logistic regression from a loss function and gradient descen...")</sub>: a queue tray with a reaper gear returning one row from a holding pen
back into the tray, and two browser cards with a single purple dashed arrow between them passing
through one group glyph. Gate holds a browser card with its socket-frame panel open, captioned that
the frame was read rather than the bell watched.

Step 15, the writing down: an open book with green solid arrows entering it, and beside it a document
card for the environment fact this scope rewrites. Gate holds the same open book with two answered
question marks on its facing page, captioned that both questions were answered from the recipe alone.

One thick route line runs upward through all five gates. Two thin arrows leave step 13 sideways into
step 15's book and two more leave step 14, because the recipe is written from what those two steps
produced rather than from the plan.

**Faithfulness note.** All five gates are drawn at equal weight. Four of them carry a person or a
person's screen and only step 12's is a number, which is the actual balance of this scope and the
thing a smaller final gate would misrepresent. The three seed glyphs at step 13 sit outside the
runner's platform behind a barrier rather than merely unconnected, because excluding them is a
deliverable. Step 14 has exactly one purple dashed arrow. Nothing leaves the top edge.

### Process capstone: ten commands nobody runs, to a screen that changes by itself `[planned]` ⏳ not rendered

**Save as:** `diagrams/process-capstone-nobody-runs-them-to-a-screen.png`

**Visual thesis.** The machinery was all there and none of it moved. What changes here is not new
code on a screen: it is that nobody has to remember anything, and nothing that was safely persisted
is lost on the way to a person.

One journey read bottom to top.

At the bottom, outside any panel, ten command glyphs sit loose with a person figure at a terminal
card beneath them and ten short blue dashed arrows leaving that figure, one to each command,
captioned that today the person is the scheduler.

Above them, the five step stages drawn small and compressed, 11 and 12 side by side and 13, 14 and 15
stacked, because they are the middle of the journey rather than its point.

At the top, one wide panel holding three things left to right. The worker gear, filled and turning on
a clock platform, with the three seed glyphs held outside that platform behind a barrier. A queue
tray with an orange dashed arrow into the gear and a reaper gear returning one row from a holding pen
back into the tray. Two browser cards facing each other with a single purple dashed arrow between
them through one group glyph, and no person figure touching either card.

Beside the top panel, outside it, an open book receiving two green solid arrows, with two answered
question marks on its facing page, and a document card labelled for the environment fact this scope
rewrites.

**Faithfulness note.** The ten command glyphs start loose with every arrow originating at the person
figure, and end with every arrow originating at the gear; the person figure must not appear again
anywhere above the bottom, because its disappearance is the whole argument. The three seeds stay
outside the platform at the top, since excluding them is a deliverable and not an omission. Exactly
one purple dashed arrow at the top, and nothing touching the browser cards, because the claim is that
nobody pressed anything. The book sits outside the panel and only receives arrows.

---

## What is outstanding

Nine prompts, none rendered: five subject pieces, the subject capstone, two process prompts and the
process capstone. Nothing in `diagrams/` yet. The process lane's version 01 is stamped at
[the first process snapshot](diagrams/process-versions/01-2026-08-23.md), and the live lane above
always equals the newest snapshot there.
