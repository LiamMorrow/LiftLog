# Personal records

A session sets a record for an exercise when it beats every **earlier** session. There are four kinds:

| Kind          | Exercises                 | Beats every earlier session at                                              |
| ------------- | ------------------------- | --------------------------------------------------------------------------- |
| Heaviest lift | external load, bodyweight | heaviest set                                                                |
| Best est. 1RM | external load only        | best set's Epley estimated one-rep max                                      |
| Most reps     | every exercise            | total reps, against the same number of sets at this working weight or above |
| Best set      | bodyweight, no load       | count of reps in one set, at this working weight or above                   |

- **The first session never gets a record**
- **Current body weight is not taken into account.** Comparisons use the logged weight, which for a bodyweight exercise is the
  added or assisted weight.
- **The working weight is the lightest completed set**, so "most reps at 60 kg" means every rep was at
  60 kg or heavier.

## Code

- `app/src/store/stats/personal-records.ts`: `performancesOf` reduces an exercise in a session to what
  records compare, and `personalRecordsOf` walks them oldest first.
- Your own history reads the same performances from summary columns on `recorded_exercise`
  (`readPerformances` in `app/src/db/sessions.ts`). `db/sessions.spec.ts` checks both paths agree.
- The feed only holds 90 days of a friend's sessions, so its labels say "in 90 days".
- UI: `app/src/components/smart/pr-badges.tsx`.
