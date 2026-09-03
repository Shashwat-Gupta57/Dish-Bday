import { useEffect, useState } from 'react';

/** True on devices with a real pointer. False on phones and tablets. */
export function useCanHover(): boolean {
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return canHover;
}

/**
 * A reveal that works on both a mouse and a thumb.
 *
 * Every secret on this site used to be `hover:` only, which meant none of them
 * existed on the phone it will actually be opened on. This gives hover on desktop
 * and tap-to-toggle on touch, and reports the first reveal via `onReveal` so it
 * can be recorded as a find.
 */
export function useTapHover(onReveal?: () => void) {
  const canHover = useCanHover();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) onReveal?.();
    // onReveal is guarded against repeats by the egg store itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const bind = canHover
    ? {
        onMouseEnter: () => setActive(true),
        onMouseLeave: () => setActive(false),
      }
    : {
        onClick: () => setActive((v) => !v),
      };

  return { active, bind, canHover };
}
