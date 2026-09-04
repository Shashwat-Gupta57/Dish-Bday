import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The page falls asleep if you stop touching it.
 *
 * The joke of the whole page is that she cannot stay conscious near a book, so
 * the page holds itself to the same standard. Stop interacting and it drifts
 * off; move and it wakes up, slightly embarrassed.
 */
export function useIdleSleep(delayMs = 22000, enabled = true) {
  const [asleep, setAsleep] = useState(false);
  const [dozed, setDozed] = useState(0);
  const timer = useRef<number | null>(null);

  const reset = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    if (!enabled) return;
    timer.current = window.setTimeout(() => {
      setAsleep(true);
      setDozed((n) => n + 1);
    }, delayMs);
  }, [delayMs, enabled]);

  const wake = useCallback(() => {
    setAsleep(false);
    reset();
  }, [reset]);

  useEffect(() => {
    if (!enabled) return;

    const onActivity = () => {
      // Reading the state via the setter avoids re-binding every listener each
      // time `asleep` flips.
      setAsleep((current) => {
        if (current) return false;
        return current;
      });
      reset();
    };

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'wheel',
      'touchstart',
      'scroll',
    ];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [reset, enabled]);

  return { asleep, dozed, wake };
}
