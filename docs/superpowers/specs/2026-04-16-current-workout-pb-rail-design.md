# Current Workout PB Rail Design

**Goal:** Show compact personal-best pills on the right side of the current workout card when a weighted exercise sets a new record.

## User Experience

The weighted exercise card keeps its current left-side set grid and interactive controls. A new right-side rail appears beside the main card content and can hold up to two wrapped rows of tiny pills. Each pill summarizes one PB achievement for that exercise, using a short category abbreviation plus a compact improvement marker when there is a previous best to compare against.

Examples of the visible text are:

- `eRM+5%`
- `TW+1%`

If there are more PBs than fit in two rows, the rail clips the overflow instead of growing taller. The card should still feel like one object, not like two separate panels.

## Architecture

This feature stays in the presentation layer and reuses the existing personal-best calculation logic. `ExerciseSection` becomes the layout host for an optional right-side aside column, so the structure is reusable beyond PBs later if needed. `WeightedExercise` will provide the PB rail content, while the personal-best utilities remain responsible for deciding which records count as PBs and how they are summarized.

The data flow is:

1. The current workout session is compared against stored sessions using the existing personal-best helpers.
2. The weighted exercise card filters those results down to the current exercise.
3. The result is transformed into compact pill data for the right-side rail.
4. The rail renders the pills in a two-line wrapped container with small spacing and truncation-safe labels.

## Component Boundaries

Planned file responsibilities:

- `app/components/presentation/workout/exercise-section.tsx`
  - Add an optional `aside` slot that renders to the right of the main workout content.
  - Keep the existing title, notes, menu, and previous-workout affordances unchanged.
- `app/components/presentation/workout/weighted/weighted-exercise.tsx`
  - Build and pass the PB rail content for weighted exercises only.
  - Keep the set grid unchanged on the left.
- `app/components/presentation/workout/weighted/personal-best-rail.tsx`
  - Render the pill list in a compact two-row wrap layout.
  - Keep styling local so the rail can evolve independently.
- `app/utils/personal-bests.ts`
  - Add a small helper for deriving the current workout’s PB pill data from a session and a weighted exercise.

## PB Label Rules

The rail should use short, stable abbreviations for the common weighted-exercise categories:

- `eRM` for estimated 1RM
- `TW` for total weight lifted / session volume
- `MW` for max weight
- `R@W` for reps at weight

The visible pill text should stay compact:

- Weight-like records show `ABBR+N%` when there is a previous best to compare against.
- Rep-based records can show a compact numeric improvement if that is shorter than a percentage.
- First-ever PBs can show the abbreviation alone, without a delta, so the rail never shows misleading math.

The full, readable description for assistive tech should still be available through an accessibility label or equivalent metadata.

## Layout Rules

The right rail is intentionally narrow and aligned to the top of the exercise card. It should:

- Wrap pills horizontally
- Cap the visible content at two rows
- Hide overflow instead of expanding the card vertically
- Preserve the existing card spacing and touch targets on the left

If there are no PBs for the current exercise, the aside collapses away and the weighted exercise card behaves exactly as it does today.

## Error Handling

The feature should fail closed:

- If PB data cannot be derived, the rail does not render.
- If a weighted exercise has no completed sets, it does not show pills.
- If the session is still being edited and the current workout is not yet persisted, the helper should still work by comparing the in-memory current session against stored sessions.

## Testing

Add coverage for both the data helper and the presentation boundary:

- A test for deriving PB pill data from a current workout session with at least one improved weighted exercise.
- A test for the abbreviations and compact delta formatting.
- A rendering test for the weighted exercise layout that confirms the aside appears on the right and the pill container stays capped at two wrapped rows.

## Non-Goals

This change does not:

- Add PB pills to cardio exercises
- Change the post-workout summary screen
- Introduce new PB categories
- Change the stored session model or persistence format

