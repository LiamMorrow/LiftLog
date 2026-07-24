---
name: expo-ui-migration
description: >-
  Use when moving a react-native-paper component to native expo-ui (SwiftUI on iOS / Jetpack Compose on
  Android), or authoring any new platform-split native control — i.e. creating a `foo.tsx` +
  `foo.android.tsx` + `foo-props.ts` triple that renders `@expo/ui` `Host`s. Covers the seedColor rule,
  the icon-interop trap, and the Compose/SwiftUI gotchas that are easy to get wrong.
---

# Migrating a component to expo-ui (native)

LiftLog is incrementally moving off `react-native-paper` onto native controls via `@expo/ui` — SwiftUI
on iOS, Jetpack Compose (M3 expressive) on Android. Each migrated control is a **platform-split triple**.

## The triple

For a control `foo`, in its own folder under the relevant `components/presentation/.../foo/`:

- `foo-props.ts` — the shared props interface + any shared enums. Both platform files import from here.
  Mark platform-only props (`icon` is Android XML drawable; `systemImage` is an iOS SF Symbol).
- `foo.tsx` — the **iOS** implementation, using `@expo/ui/swift-ui` (`Host`, `Button`, …) and
  `@expo/ui/swift-ui/modifiers`.
- `foo.android.tsx` — the **Android** implementation, using `@expo/ui/jetpack-compose`.

Metro picks `.android.tsx` on Android and `.tsx` elsewhere. **Reference exemplar:**
`components/presentation/foundation/native-button/` (props + both platforms, clean and current).

## Theming: seedColor is (almost) the only input

- On every `Host`, pass **`seedColor={colors.seedColor}`** from `useAppTheme()` — **never**
  `colors.primary`. `seedColor` is the real source colour that seeds the whole M3/SwiftUI palette;
  `colors.primary` is already _derived_ from it, so re-seeding from it produces the wrong ramp.
  `seedColor` is `undefined` for the default scheme, which correctly lets Compose fall back to Material
  You / the wallpaper palette.
- **Let native components own their slot colours.** Don't pass a `colors={{ containerColor, contentColor,
checked… }}` object to a native control, and don't `tint`/`foregroundStyle` an `Icon` that sits _inside_
  a native button/toggle — the component already colours its container/content/checked slots from the
  seeded palette, and an `Icon` child inherits the content colour. Hand-colouring only fights the palette.
- Do pick the right **variant** (e.g. `HorizontalFloatingToolbar variant="standard"` vs `"vibrant"`),
  since that changes which ramp a slot sources from.
- `tint` / `foregroundStyle` is warranted only for a **bare** `Icon`/label not inside a colour-providing
  native control (e.g. an `Icon` in a `Row`), or on iOS where a `borderless`/`plain` button drops its
  label tint — reach for it last.

## Icons inside Compose must be native

Import an XML vector drawable per icon from `@expo/material-symbols` and render it with expo-ui's own
`Icon` — **not** the RN Paper / `@material-symbols-react-native` wrapper:

```tsx
import { Icon } from "@expo/ui/jetpack-compose";
import AddIcon from "@expo/material-symbols/add.xml";
<Icon source={AddIcon} size={24} />;
```

An RN `Icon` hosted inside a **Compose button** does not survive interop and fails _differently per
component_ (mangled FAB with the icon stranded; or the icon silently renders to nothing while the label
shows) — it looks like a styling bug but it's interop; manual sizing won't fix it. No Metro config
needed: `xml` is in Expo's default `assetExts` and `@expo/ui/jetpack-compose` registers its own asset
transformer (don't import that subpath yourself — it isn't in the package `exports`).

## Compose gotchas

- A `Host` needs a **definite size** if any child uses the `weight` modifier — `matchContents` measures
  against content, so `weight(1)` has no bounded width to divide and silently collapses to zero.
- `Shape.Pill({})` must be **called**, not used as JSX (`<Shape.Pill />` loses the brand and fails
  typecheck). `Row`'s `horizontalArrangement` takes `{ spacedBy: n }`, not a string.
- Compose `Text` is invisible to Maestro's view hierarchy — a Compose button can't be tapped by label;
  tap by `point`. Expo-ui switches on Android carry no `testID`.

## iOS (SwiftUI) notes

- `buttonStyle('borderedProminent' | 'bordered' | 'borderless')` maps to filled/tonal/text; `'plain'`
  drops the tint along with the chrome, leaving a label that doesn't read as a button.
- `buttonStyle('glass' | 'glassProminent')` and `glassEffect(...)` are iOS 26+.

## Native rebuild caveat

New native deps / config-plugin changes need a native rebuild — **don't run `expo run:*` yourself**;
describe the change and ask Liam to rebuild, then verify. JS-only edits to these files hot-reload.

## Verify

From `app/`: `npm run typecheck` and `npm run lint` (the react-compiler rule runs via eslint). Then look
at both platforms on device.
