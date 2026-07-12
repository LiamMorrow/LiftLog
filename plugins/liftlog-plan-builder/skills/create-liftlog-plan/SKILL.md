---
name: create-liftlog-plan
description: Create a LiftLog workout plan (.liftlogplan file) that can be imported into the LiftLog app. Use when the user asks for a workout program, training split, lifting routine, or running plan, or asks to build/edit/convert a plan for LiftLog.
---

# Create a LiftLog plan

Turn a training goal into a `.liftlogplan` file the user can import into LiftLog.

## Workflow

### 1. Understand what they want

Ask only for what you actually need, and only if they haven't said it:

- **Days per week**, and which split (push/pull/legs, upper/lower, full body, custom).
- **Experience level** — this drives set/rep ranges and how fast weight goes up.
- **Equipment** — full gym, home barbell, dumbbells only, bodyweight.
- **Units** — kilograms or pounds. This changes the progressive overload increments (2.5 kg vs 5 lb).
- Anything to work around: injuries, exercises they hate, time limits.

If the user has given you enough to work with, skip the interview and build the plan. Don't interrogate someone who said "give me a 3-day full body routine for a beginner".

### 2. Read the format reference

Read `reference/format.md` before writing any JSON. It is the field-by-field guide, and it lists the mistakes that make a file fail to import. `reference/ProgramBlueprint.json` is the authoritative JSON Schema if you need to check something exactly.

`examples/push-pull-legs.liftlogplan` is a complete weighted-training plan; `examples/couch-to-5k.liftlogplan` covers cardio. Read whichever is closer to what you're building.

### 3. Write the plan

One session per training day. Order exercises the way they'd actually be performed — compounds first, isolations after.

Set rests from the effort of the lift, not a default: heavy compounds get 3–5 minutes, accessories 60–90 seconds.

### 4. Validate — always

```bash
node scripts/validate-plan.mjs <file>
```

It needs nothing installed and no network. It prints every problem with the path to the offending field, and exits non-zero. **Fix and re-run until it passes.** Never hand the user a file you haven't validated — the app reports a failed import as nothing more than "That file isn't a valid workout plan", so an invalid file gives them nothing to act on.

### 5. Deliver it

Name the file after the plan: `Push Pull Legs.liftlogplan`.

- **In Claude Code**, save it in the working directory and tell them where it is.
- **In Claude chat**, write the file and give them the download link.

Then tell them how to import it, since it isn't obvious:

> Get the file onto your phone (AirDrop, email, or save it to Files/Drive), then tap it — LiftLog will open it. Or open LiftLog and go to Plans → Import.

## Editing an existing plan

If the user gives you a `.liftlogplan` file to change, read it, modify it, validate it, and hand it back. Keep the fields you weren't asked to touch exactly as they were.

If they want to change a plan they're already running but haven't given you the file, ask them to export it out of the app:

> In LiftLog, open **Plans**, tap the `⋮` next to the plan and choose **Export to file**. That opens the share sheet — save it to Files/Drive, or mail it to yourself — then send me the `.liftlogplan`.

Don't rebuild their plan from a verbal description when they could just export it — the file has their real exercise names, rest times, and progressive overload settings, and anything you reconstruct will quietly differ.

When you hand the edited file back, mention that importing it creates a *new* plan rather than overwriting the old one, so they'll want to delete the original from `Plans` once they've imported the replacement. Their logged workout history isn't affected either way.
