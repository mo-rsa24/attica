# 📚 Where these recipes came from

The documents this folder was assembled from. None of them is a recipe: nobody performs a source
document, and none of them is kept current. They are here so a recipe that looks wrong can be
checked against what it was written from.

The originals live in [sources/](sources/).

## The documents

**[The booking QA guide](sources/booking-test-guide-original.md)**

The hand-written walkthrough of the seven booking scenarios, from before this folder existed. It is
where [Seeding](preparing-the-data/seeding-and-resetting-data.md) and
[Driving the booking flow](driving-the-app/driving-the-booking-flow.md) came from. One known defect:
its "materialize availability slots" step showed the output of a different command. That block was
removed rather than corrected, because nobody has run the command and seen the real one.

**[The create-event data preparation guide](sources/create-event-data-preparation-guide-original.md)**

The hand-written explanation of how to make artists bookable before walking the wizard. Its facts
became [environment/django-admin/](../environment/django-admin/) and its click paths became
[Preparing artist availability](preparing-the-data/preparing-artist-availability.md) and
[Walking the event wizard](driving-the-app/walking-the-event-wizard.md). Two defects in the
original, corrected on the way across: every command block used a `/mnt/c/users/molef/playground/`
path that does not exist on this machine, and the availability chain was described without saying
that a missing link returns an empty search rather than an error.

## The repository itself

Everything not attributable to the two documents above was read out of the repository: the
management commands under `backend/main/*/management/commands/`, `scheduling/models.py`,
`scheduling/admin.py`, and `frontend/vite.config.js`. Those recipes carry `unverified` until someone
runs them.
