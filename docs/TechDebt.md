# Tech debt ledger

Workarounds we carry for bugs or gaps in other projects, and what has to happen before each workaround can go. Check
this list when upgrading a dependency the list names, and add an entry whenever you add a workaround like these.

Each entry says where the workaround lives, why it exists, when it can be removed, and how to check that removing
the workaround is safe.

## react-native-screens orientation-reset flag

- **Where:** `app/src/app/_layout.tsx` sets
  `featureFlags.experiment.androidResetScreenShadowStateOnOrientationChangeEnabled = false`.
- **Why:** On Android, a screen that is covered during a rotation round trip keeps a stale header correction in
  its shadow node. `measure` and `measureInWindow` then report y one header height too large, while the native
  views are in the right place. Anything positioned from a measurement lands in the wrong spot, such as the edit
  dock sitting a header height above the keyboard, or a popover pointing below its trigger.
- **Remove when:** Unknown. The upstream fix in react-native-screens 4.29.0
  ([software-mansion/react-native-screens#4760](https://github.com/software-mansion/react-native-screens/pull/4760))
  does not cover this case: the bug still reproduces on 4.30.1 with the flag removed.
- **Verify:** On Android, start a workout, switch to another tab, rotate to landscape and back, return to the
  workout and edit a weight. The edit dock should sit directly on the keyboard.

## Opaque headers are tinted with `headerStyle` instead of `headerBackground`

- **Where:** `app/src/components/layout/stack-with-header.tsx`.
- **Why:** A `headerBackground` makes expo-router mark the header translucent. After a covered screen is rebuilt
  during a rotation on Android, react-native-screens and expo-router disagree about the header offset and the
  content ends up a header shorter than the screen. Tinting natively loses the colour fade on scroll.
- **Remove when:** Unknown. The cause is likely the same covered-screen state bug fixed in react-native-screens 4.29.0
  ([software-mansion/react-native-screens#4760](https://github.com/software-mansion/react-native-screens/pull/4760)),
  but the link has not been confirmed.
- **Verify:** On Android, push a screen over Home, rotate to landscape and back, go back. The Home scroll view
  should reach the bottom of the screen.

## expo-splash-screen keeps the Android splash up on every launch

- **Where:** `app/patches/expo-splash-screen+58.0.12.patch` resets `keepSplashScreenOnScreen` in
  `SplashScreenManager.registerOnActivity`.
- **Why:** `SplashScreenManager` is a process-wide singleton, and the flag is never reset after the first `hide()`.
  On a warm start, where the app was swiped away but the process is still alive, the activity is recreated and
  the splash drops on the first frame. A blank window shows until the animated splash overlay draws.
- **Remove when:** expo-splash-screen resets the flag itself when it registers on an activity.
- **Verify:** On a release build on Android, open the app, swipe it away from recents without force stopping it, and
  open it again. The logo should be on screen from the first frame, with no blank window before it.

## Compose icons in native buttons and page actions sit in a fixed-size box

- **Where:** `app/src/components/presentation/foundation/native-button/native-button.android.tsx` and
  `app/src/components/presentation/foundation/page-actions/page-actions.android.tsx` wrap each `Icon` in a `Box`
  sized to the icon.
- **Why:** The expo-ui Android `Icon` loads its source asynchronously and draws nothing until the load finishes.
  A `matchContents` host measures the button without the icon on its first frame, then grows once the icon
  arrives. Because the host is laid out narrower than the button for that frame, the button overflows to the
  right and pushes its neighbours with it, such as the card actions on Home.
- **Remove when:** expo-ui's `Icon` reserves its `size` while the source loads.
- **Verify:** On Android, start a workout from Home. The card actions should not shift right for a frame when
  the current workout card appears.
