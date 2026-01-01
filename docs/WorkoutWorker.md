## WorkoutWorker

When a workout is in progress, there are certain responsibilities that sit outside the app’s normal UI-driven flow. These include things like:

- Persistent notifications
- Timers that must continue while the app is backgrounded
- Integration with platform-specific system UI (e.g. Dynamic Island–style affordances on iOS, foreground notifications on Android)

These responsibilities are **inherently platform-dependent**, both in _how_ they are executed and _what_ they integrate with.

The purpose of the `WorkoutWorker` is to provide a **platform-specific execution environment** that reacts to a standardised stream of workout-related events emitted by the main application.

The `WorkoutWorker` is **not the authority** for workout state:

- The source of truth lives in the main app (Redux / JS)
- If the app process crashes or is killed, the workout worker is not rehydrated automatically.
- The worker exists only while a workout is active and is fully disposable

---

## Responsibilities and constraints

The `WorkoutWorker`:

- Is started explicitly when a workout begins and stopped explicitly when it ends
- May run in the background using platform-appropriate mechanisms (e.g. Android Foreground Service)
- Does **not** access Redux state, application services, or business logic
- Does **not** decide what should happen next in a workout
- Reacts only to a stream of descriptive events
- May emit observational events back to the main app (e.g. notification tapped)

---

## Android implementation note

On Android, the `WorkoutWorker` is implemented as a **ForegroundService**.
The service owns an **explicit, in-process event channel** used to distribute workout events to platform-specific handlers.

This event channel:

- Exists entirely within the app process
- Provides ordered delivery
- Does not rely on OS-level routing (e.g. broadcasts or Intents)
- Is owned by the service itself

The service is responsible only for execution concerns (notifications, timers, system UI), not workout progression.

---

## WorkoutEvents

### Conceptual model

`WorkoutEvents` represent **facts about what has occurred**, not instructions for what should happen.

Examples:

- `WorkoutStarted`
- `ExerciseSetCompleted`
- `WorkoutEnded`

Events are:

- Emitted by the UI / main app
- Consumed by the `WorkoutWorker`
- Optionally emitted back to the app as observations

---

### External representation (cross-platform)

For cross-platform communication (JS ↔ native, and parity with iOS), workout events are serialized using **protobuf**.

Protobuf is used strictly as a **wire format**:

- Defines the cross-language contract
- Enables versioning and forwards compatibility
- Allows binary transport where appropriate

---

### Translation boundary

A dedicated translation layer is responsible for converting between:

- Protobuf `WorkoutEvent` messages
- Internal domain `WorkoutEvent` objects

This translation layer:

- Lives alongside the `WorkoutWorker`
- Encapsulates versioning, defaults, and backward compatibility
- Is the only place where protobuf schema knowledge exists in native code

The React Native bridge is responsible only for transport and does not contain domain logic.

---

## Event flow summary

1. The main app emits a `WorkoutEvent`
2. The event is serialized using protobuf
3. The native bridge forwards the event to the platform worker
4. The worker translates it into a domain event
5. The event is dispatched through the worker’s in-process event channel
6. Platform-specific handlers react accordingly

Reverse flow (worker → app) follows the same pattern in the opposite direction.

---

## Lifecycle guarantees

- `WorkoutStarted` explicitly starts the worker
- `WorkoutEnded` explicitly stops the worker
- Events outside an active workout lifecycle are ignored

---

## Non-goals

The `WorkoutWorker` explicitly does **not**:

- Persist workout state
- Attempt crash recovery
- Resume workouts after process death
- Act as a domain state machine

These concerns remain the responsibility of the main application.
