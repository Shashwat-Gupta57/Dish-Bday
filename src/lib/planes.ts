/**
 * The three-plane depth system.
 *
 * Every parallax movement on this site belongs to exactly one plane and moves at
 * that plane's speed. No exceptions, no bespoke numbers. That consistency is the
 * whole reason it reads as depth instead of as noise.
 *
 *   back  — blurred washes, ghost type, anything that is atmosphere
 *   mid   — the photographs themselves, frames, rules
 *   front — headlines, captions, torn edges, accent marks
 */

import { useTransform, type MotionValue } from 'motion/react';

export const PLANE = {
  back: 0.2,
  mid: 0.6,
  front: 1.1,
} as const;

export type PlaneName = keyof typeof PLANE;

/** Base travel in px for a plane at 1.0 speed. Tune the feel here, once. */
export const BASE_TRAVEL = 180;

/**
 * Where an element sits when its section's scroll progress is 0.
 *
 *   center — the section scrolls in from below, so progress 0 means "not here
 *            yet". The element starts offset and passes through its resting
 *            position mid-section. Right for everything below the fold.
 *   start  — the section is already fully on screen at progress 0 (the hero).
 *            The element must start exactly where it was laid out, or it renders
 *            hundreds of pixels away from where you designed it.
 */
export type Anchor = 'center' | 'start';

/**
 * Parallax a value across a section's scroll progress on a given plane.
 * `travel` scales the movement without breaking the ratio between planes.
 * `invert` flips direction for elements that should counter-move.
 */
export function usePlaneY(
  progress: MotionValue<number>,
  plane: PlaneName,
  travel: number = BASE_TRAVEL,
  invert = false,
  anchor: Anchor = 'center',
) {
  const d = travel * PLANE[plane] * (invert ? -1 : 1);
  return useTransform(progress, [0, 1], anchor === 'start' ? [0, -d * 2] : [d, -d]);
}

/** Same, for the rare element that should scale rather than translate. */
export function usePlaneScale(
  progress: MotionValue<number>,
  plane: PlaneName,
  amount = 0.15,
) {
  const d = amount * PLANE[plane];
  return useTransform(progress, [0, 1], [1 - d, 1 + d]);
}
