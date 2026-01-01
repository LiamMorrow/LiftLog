## WorkoutWorker

When a workout is in progress, there are certain responsibilities that sit outside the app’s normal UI-driven flow. These include things like:

- Persistent notifications
- Timers that must continue while the app is backgrounded
- Integration with platform-specific system UI (e.g. Dynamic Island–style affordances on iOS, foreground notifications on Android)

These responsibilities are **inherently platform-dependent**, both in _how_ they are executed and _what_ they integrate with.

The purpose of the `WorkoutWorker` is to provide a **platform-specific execution environment** that reacts to a standardised stream of workout-related messages (events and commands) emitted by the main application.

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
- Reacts to a stream of messages:
  - **Events**: Descriptive facts about what has occurred
  - **Commands**: Instructions to perform an action (e.g. finish workout)
- May emit observational events back to the main app (e.g. notification tapped)

---

## Android implementation note

On Android, the `WorkoutWorker` is implemented as a **ForegroundService**.
The service owns an **explicit, in-process message channel** used to distribute workout messages to platform-specific handlers.

This event channel:

- Exists entirely within the app process
- Provides ordered delivery
- Does not rely on OS-level routing (e.g. broadcasts or Intents)
- Is owned by the service itself

The service is responsible only for execution concerns (notifications, timers, system UI), not workout progression.

---

## WorkoutMessages

### Conceptual model

`WorkoutMessages` can be either **events** or **commands**:

**Events** represent facts about what has occurred:

- `WorkoutStartedEvent`
- `WorkoutUpdatedEvent`
- `WorkoutEndedEvent`

**Commands** represent instructions for actions to perform:

- `FinishWorkoutCommand`

Messages are **bidirectional**:

- **App → Worker**: Events describing workout state changes (start, update, end)
- **Worker → App**: Commands requesting actions (e.g. finish workout from notification)

When the app broadcasts an event:

1. The event is immediately echoed back to all JS listeners (enabling local observation)
2. The event is forwarded to the native worker for platform-specific handling

---

### External representation (cross-platform)

For cross-platform communication (JS ↔ native, and parity with iOS), workout messages are serialized using **protobuf**.

Protobuf is used strictly as a **wire format**:

- Defines the cross-language contract
- Enables versioning and forwards compatibility
- Allows binary transport where appropriate

---

### Translation boundary

A dedicated translation layer is responsible for converting between:

- Protobuf `WorkoutMessage` messages
- Internal domain `WorkoutMessage` objects (events and commands)

This translation layer:

- Lives on the JS side of the bridge
- Encapsulates versioning, defaults, and backward compatibility
- Is the only place where protobuf schema knowledge exists in application code

The native bridge receives protobuf bytes directly and uses generated protobuf classes for parsing. The React Native module is responsible only for transport and service lifecycle.

---

## Message flow summary

### App → Worker (Events)

1. The main app broadcasts a `WorkoutMessage` (event)
2. The message is serialized using protobuf
3. The broadcast immediately echoes the event back to all JS listeners
4. The native bridge forwards the message to the platform worker
5. The message is dispatched through the worker's in-process message channel
6. Platform-specific handlers react (update notifications, timers, etc.)

### Worker → App (Commands)

1. A platform-specific trigger occurs (e.g. notification action tapped)
2. The worker creates a command message (e.g. `FinishWorkoutCommand`)
3. The command is dispatched back to the app via the event bridge
4. The app handles the command (e.g. dispatches Redux action to finish workout)

---

## Lifecycle guarantees

- `WorkoutStartedEvent` explicitly starts the worker
- `WorkoutEndedEvent` explicitly stops the worker
- Messages outside an active workout lifecycle are ignored

---

## Non-goals

The `WorkoutWorker` explicitly does **not**:

- Persist workout state
- Attempt crash recovery
- Resume workouts after process death
- Act as a domain state machine

These concerns remain the responsibility of the main application.
