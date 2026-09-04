import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A background track that fades in rather than slamming on.
 *
 * Browsers block autoplay with sound unless the session has a user gesture
 * behind it. Arriving here via a click counts, so playback usually starts on
 * its own — but "usually" is not "always", so the caller always renders a
 * visible control, and a blocked start is reported rather than swallowed.
 */
export type AudioState = 'idle' | 'playing' | 'paused' | 'blocked' | 'missing';

export function useAmbientAudio(src: string, targetVolume = 0.45, fadeMs = 4000) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [state, setState] = useState<AudioState>('idle');

  const clearFade = () => {
    if (fadeRef.current !== null) {
      window.clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
  };

  const fadeTo = useCallback(
    (to: number, done?: () => void) => {
      const el = ref.current;
      if (!el) return;
      clearFade();
      const from = el.volume;
      const steps = Math.max(1, Math.round(fadeMs / 50));
      let i = 0;
      fadeRef.current = window.setInterval(() => {
        i += 1;
        const t = Math.min(1, i / steps);
        el.volume = Math.max(0, Math.min(1, from + (to - from) * t));
        if (t >= 1) {
          clearFade();
          done?.();
        }
      }, 50);
    },
    [fadeMs],
  );

  const play = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = 0;
    el.play()
      .then(() => {
        setState('playing');
        fadeTo(targetVolume);
      })
      .catch(() => setState('blocked'));
  }, [fadeTo, targetVolume]);

  const pause = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    fadeTo(0, () => {
      el.pause();
      setState('paused');
    });
  }, [fadeTo]);

  const toggle = useCallback(() => {
    if (state === 'playing') pause();
    else play();
  }, [state, play, pause]);

  useEffect(() => {
    const el = new Audio(src);
    el.loop = true;
    el.preload = 'auto';
    el.volume = 0;
    // If the track hasn't been added yet, say so instead of rendering a
    // control that does nothing.
    el.addEventListener('error', () => setState('missing'));
    ref.current = el;

    el.play()
      .then(() => {
        setState('playing');
        fadeTo(targetVolume);
      })
      .catch(() => setState('blocked'));

    return () => {
      clearFade();
      el.pause();
      el.src = '';
      ref.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return { state, toggle, play, pause };
}
