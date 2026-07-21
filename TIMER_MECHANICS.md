# Timer Mechanics in Streak Calendar

This document explains how habit timers work end-to-end in the Streak Calendar codebase.

## Overview
Timed habits let a user start a countdown. When the timer finishes, the habit is automatically incremented (a completion record is written) without further user interaction. Timers are coordinated between the client and the Convex backend using scheduled functions, with drift compensation and cancellation support.

Main pieces:
- UI components: `CompleteControls` and `CompleteTimer` (client-side React)
- Backend mutations: `scheduleHabitIncrement`, `cancelScheduledIncrement`, and internal `incrementHabitCount` in `convex/habits.ts`
- Data fields on a habit document: `timerDuration` (seconds, optional), `scheduledTimer` (id of scheduled job), `timerEnd` (epoch ms when countdown ends)
- Convex scheduler: schedules the auto-increment job.

## Data Model
Defined in `convex/schema.ts`:
- `habits.timerDuration`: optional number (seconds) for default timer length.
- `habits.scheduledTimer`: optional Id of a `_scheduled_functions` document created by Convex when a future job is scheduled.
- `habits.timerEnd`: optional number (epoch milliseconds) representing the expected completion timestamp used by the UI for live countdown.

## Scheduling Flow
1. User presses the timer button in `CompleteTimer` to start (duration passed in minutes from props, converted to ms client-side).
2. `CompleteTimer.handleStartTimer` calls `scheduleHabitIncrement` mutation with:
   - `habitId`
   - `durationMs`
   - `clientNow` = `Date.now()` (client timestamp used to compensate drift)
3. Backend `scheduleHabitIncrement`:
   - Authenticates user and validates habit ownership.
   - Computes `serverNow = Date.now()` and `timeDrift = serverNow - clientNow`.
   - Calculates `completionTime = serverNow + durationMs - timeDrift` (attempt to align server completion to the user's perceived start time, adjusting for drift).
   - Cancels any existing scheduled timer (`ctx.scheduler.cancel`) if `scheduledTimer` exists.
   - Schedules a new job via `ctx.scheduler.runAfter(durationMs - timeDrift, internal.habits.incrementHabitCount, { habitId, completionTime })`.
   - Stores the returned scheduled job id in `scheduledTimer` and the `completionTime` in `timerEnd` on the habit document.

## Countdown Display
`CompleteTimer` uses `useQuery(api.habits.get, { id })` to retrieve habit state including `timerEnd`.
- An effect sets a `setInterval` (1s) to compute `remaining = timerEnd - Date.now()`.
- When `remaining <= 0` the timer is considered finished; it clears local state and fires a confetti animation. (NOTE: The UI currently does NOT invoke the provided `onComplete` callback at this point—only visual feedback is shown. Actual completion is handled by the scheduled backend job.)

## Automatic Completion
The scheduled internal mutation `incrementHabitCount` runs after the delay:
- Fetches the habit.
- Inserts a record into `completions` with `completedAt = completionTime` (the pre-computed timestamp, not the server "now" at execution time).
- Clears `scheduledTimer` and `timerEnd` from the habit so future queries show no active countdown.

## Cancellation Flow
User can click the active countdown button to cancel:
- `CompleteTimer.handleStopTimer` calls `cancelScheduledIncrement` mutation.
- Backend checks if a `scheduledTimer` exists; if so:
  - Cancels it with `ctx.scheduler.cancel`.
  - Patches habit: sets `scheduledTimer` and `timerEnd` to `undefined`.
- UI clears local `timeLeft` state.

## Integration with CompleteControls
`CompleteControls` decides whether to render a timer or immediate completion buttons:
- If a habit has a `timerDuration` and count is 0: shows only the `CompleteTimer` (start button or seconds remaining).
- If count > 0 and timer mode: shows a decrement button, count display, and another `CompleteTimer` instance (allowing repeated timed increments).
- For non-timer habits it uses `ConfettiButton` and +/- buttons.

## Drift Compensation Rationale
Passing `clientNow` lets the server estimate clock drift. If the client's clock is ahead of the server, `timeDrift` is positive so the scheduled delay (`durationMs - timeDrift`) is shorter, aligning perceived end time. If the client is behind, the delay becomes longer. Edge case: significant drift larger than `durationMs` could produce a negative or very small delay; current code doesn’t clamp this.

## Edge Cases & Notes
- If `durationMs - timeDrift` is negative (extreme clock skew), `ctx.scheduler.runAfter` may schedule immediate execution; the UI may still show a countdown briefly until the habit refetch clears `timerEnd`.
- Multiple rapid starts: component first cancels existing timer before re-scheduling to avoid overlapping jobs.
- The UI confetti on finish is independent of the backend job success; if the scheduled job fails, user might see visual completion without a recorded increment until retry.
- No explicit retry logic for failed scheduling beyond throwing an error.
- Accessibility: `disableForReducedMotion: false` means confetti still plays even if user prefers reduced motion.
- `onComplete` prop of `CompleteTimer` isn’t used on timer finish (only when starting? actually never invoked inside `CompleteTimer`; could be a future enhancement).

## Possible Improvements
- Clamp negative or very small adjusted delays to 0 and maybe warn.
- Invoke `onComplete` callback when countdown reaches zero (after verifying backend success or optimistic update).
- Listen to habit changes to confirm completion instead of only local timer zero (ensures confetti only after successful increment).
- Persist partial remaining time in local state on page reload? (Currently relies solely on server `timerEnd`).
- Consider server authoritative countdown push (subscriptions) to reduce client polling at 1s.
- Respect reduced motion preferences for confetti.

## Sequence Summary
1. User clicks Start -> `scheduleHabitIncrement` -> schedule job -> store `timerEnd` & job id.
2. UI polls/interval counts down to zero, shows remaining seconds.
3. Scheduler fires `incrementHabitCount` -> inserts completion -> clears timer fields.
4. UI query sees cleared fields; timer button reverts (count updated via separate completion query logic elsewhere), allowing new start.
5. User can cancel mid-way -> cancel mutation -> clears timer fields -> UI resets.

---
Generated on: 2025-08-12
