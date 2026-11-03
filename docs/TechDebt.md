# Tech debt ledger

Workarounds we carry for bugs or gaps in other projects, and what has to happen before each one can go. Check
this list when upgrading a dependency it names, and add an entry whenever you add a workaround like these.

Each entry says where the workaround lives, why it exists, when it can be removed, and how to check that removing
it is safe.

## react-native-screens orientation-reset flag

- **Where:** `app/src/app/_layout.tsx` sets
  `featureFlags.experiment.androidResetScreenShadowStateOnOrientationChangeEnabled = false`.
- **Why:** On Android, a screen that is covered during a rotation round trip keeps a stale header correction in
  its shadow node. `measure` and `measureInWindow` then report y one header height too large, while the native
  views are in the right place. Anything positioned from a measurement lands in the wrong spot, such as the edit
  dock sitting a header height above the keyboard, or a popover pointing below its trigger.
- **Remove when:** react-native-screens is at 4.29.0 or later, which includes the upstream fix
  ([software-mansion/react-native-screens#4760](https://github.com/software-mansion/react-native-screens/pull/4760)).
  Expo SDK 57 pins `~4.26.0`.
- **Verify:** On Android, start a workout, switch to another tab, rotate to landscape and back, return to the
  workout and edit a weight. The edit dock should sit directly on the keyboard.

## Opaque headers are tinted with `headerStyle` instead of `headerBackground`

- **Where:** `app/src/components/layout/stack-with-header.tsx`.
- **Why:** A `headerBackground` makes expo-router mark the header translucent. After a covered screen is rebuilt
  during a rotation on Android, react-native-screens and expo-router disagree about the header offset and the
  content ends up a header shorter than the screen. Tinting natively loses the colour fade on scroll.
- **Remove when:** Unknown. This is likely the same covered-screen state bug that react-native-screens 4.29.0
  fixed, but that has not been confirmed.
- **Verify:** On Android, push a screen over Home, rotate to landscape and back, go back. The Home scroll view
  should reach the bottom of the screen.
