/**
 * Lift for surfaces that float above page content on iOS: soft, low, and close to the surface —
 * not a Material elevation shadow, which is darker and tighter than anything Apple casts.
 *
 * Android is absent on purpose: Compose expresses elevation tonally and its components cast their
 * own shadows, so a hand-rolled one there fights the platform rather than joining it.
 */
const radius = 15;
const offsetY = 4;
const opacity = 0.15;

/** For surfaces drawn in React Native. Must sit on a wrapper: a view that clips cannot cast a shadow. */
export const floatingShadowStyle = {
  shadowColor: '#000000',
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: offsetY },
};

/**
 * For surfaces drawn by SwiftUI, via the `shadow` modifier. Apply it to the container holding the
 * glass controls, not to the controls themselves: a view wearing `glassEffect` renders its own
 * material and swallows a shadow set on it, whichever order the modifiers are in.
 */
export const floatingShadowModifier = {
  radius,
  y: offsetY,
  color: `#000000${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')}`,
};
