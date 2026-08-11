# Progression - how your numbers move week to week

When an exercise is completed, the next time it is loaded into a workout, two things happen:

- **Carry over** always happens. Starting a workout opens each exercise on the numbers you did last
  time, not the numbers written in your plan.
- **Progressive overload** is a list of rules on the exercise that pushes those numbers up when you hit
  all your targets.

## Carry over

When you start a workout, LiftLog looks for the last time you did the same exercise and loads those
numbers in.

- It matches on the exercise's **name**, its **number of sets**, and usually its **rep scheme**.
  Renaming an exercise or changing how many sets it has therefore starts over from the plan.
- **Weight always carries over.**
- **Reps you completed last time normally do not.** The target comes back from the plan each session.
- A workout you opened but never logged a set in is ignored, so an abandoned session cannot become the
  number you are stuck chasing.

**Reps carry over too when reps are what you are progressing on** - either the exercise's Resistance is
set to None (there is nothing else to advance on), or you have given it a rule that increases reps. In
that case the plan's reps are just the first rung of a ladder, so LiftLog keeps whatever the rule has
won for you and stops re-reading the plan. Changing the plan's starting reps then will not throw away
progress you have already made.

Why reps behave differently by default: the only way to change a rep target is to edit the plan, and
when you finish a workout LiftLog already asks whether that edit should stick. Carrying the reps as well
would quietly apply an edit you had just declined.

## Progressive overload

Found under **Progressive Overload** in the exercise editor. A new exercise has no rules, so it stays
where you leave it until you add one.

**Rules only fire after a successful session** - every set logged, each at or above its target. Miss one
and nothing moves; you repeat the same numbers next time.

**Rules run in order, and only one runs per session.** LiftLog takes the first rule that still has room
to move and stops there. This is what lets you chain them.

Each rule has:

- **Increase** - Reps or Weight.
- **Reps to add** / **Amount to increase** - how much. For weight this is in whatever unit you lift in,
  so 2.5 is a pair of small plates in a kilo gym and in a pound gym alike.
- **Apply to** - every set, or just the lowest ones (all of them, or only the first, middle or last).
  "Lowest" means lowest on whatever that rule increases: a reps rule picks your smallest target, not
  your lightest set.
- **Stop at a limit** (reps only) - the rule stops once reps reach the limit, and the next rule takes
  over.
- **Start over after** (reps only) - when the next rule takes over, drop reps back to what the plan
  asks for.

**Rep ranges move as a block.** A target of 8-12 with "add 1 rep" becomes 9-13. If a limit is in the
way, both ends still move by the same amount, so the range keeps its width instead of squashing shut.

**A rule with no limit never stops**, so nothing after it can ever run. Weight rules have no limit at
all, so a weight rule always has to be last. The editor dims any rule that can never run and tells you
how to fix it, and **Add rule** arranges new rules so this does not happen - adding a rule to a
weight-only exercise puts the new reps rung _in front_ of the weight rule, not behind it.

Tap **Example** to see four sessions of your actual exercise played out under the rules you have set.

## Double progression

Climbing reps to a limit, then adding weight and starting the reps again. There are two ways to set it
up, and you want one or the other, not both.

- **A rep range** like 8-12 with a weight rule. A set only counts as successful at the top of the range,
  so the weight only goes up once you hit 12 on everything. The counter shows "8-12" every week.
- **A fixed rep target** like 8, with two rules: `Reps +1, stop at a limit of 12, start over after`, then
  `Weight +2.5`. The counter shows the rung you are actually on - 8, 9, 10, 11, 12 - then the weight goes
  up and the reps drop back to 8.

If you set a rep range _and_ a reps rule whose limit is the top of that range, the reps rule can never
move and does nothing at all.

---

For the code behind this: `progressionKey()` and `applyProgression` in
`app/src/models/blueprint-models/index.ts`, session start in `app/src/services/session-service.ts`, the
editor in `app/src/components/presentation/workout-editor/progressive-overload.tsx`.
