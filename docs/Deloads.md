# Deloads

A **deload** is a workout that isn't tracked in your progression. It can also lower the weights or sets for you.

In order to keep your progress intact, a deload session is left out of carry-over and the "previous" reads. It
never triggers progression, and the workout after it picks up from the numbers before it. See
[Progression](./Progression.md).

You turn a workout into a deload from its menu at any time, and the notice at the top of the workout switches it
back at any time. Sets you have already logged stay as they are in both directions. Switching back after logging
light sets makes those sets your carry-over numbers, because the workout then counts. When editing a past workout,
the menu only marks it as a deload or as normal and leaves its numbers alone.

"Normally 102.5kg" under an exercise is the number you would have lifted this week, because a deload starts from
the workout the plan produced after progression. There are three styles, and cardio is left alone in all of them:

- **Lighter weight** (the default) multiplies each weight by a percentage, 60% by default, and snaps it to the
  nearest multiple of the exercise's weight rule step, or 2.5 when it has none. Snapping happens in the
  exercise's own unit, because the step is unitless. An exercise with no weight drops a set instead.
- **Fewer sets** keeps a percentage of the sets, half by default, rounded up, and at least one.
- **Keep as is** changes nothing, for a workout you have already lightened by hand.

Finishing a deload never offers to change the plan, because the blueprint is untouched.

Code: `models/deload.ts`.
