import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useSmoothScroll } from '../lib/SmoothScroll';

/**
 * Makes the routes behave like separate pages.
 *
 * A React Router navigation swaps the component but leaves the scroll offset
 * exactly where it was — so opening the Findings from halfway down the Terms
 * dropped you into the middle of the report, and the site read as one long
 * document with sections rather than as a magazine with pages.
 *
 * Rules:
 *   forward (PUSH / REPLACE) — a new page starts at its top
 *   back    (POP)            — you land where you left, the way going back
 *                              through a real site behaves
 *
 * Everything routes through Lenis, which owns the scroll position; a bare
 * window.scrollTo is undone on the very next frame.
 */
export default function ScrollManager() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const { scrollTo, resize } = useSmoothScroll();
  const saved = useRef(new Map<string, number>());

  // The browser's own restoration fights ours on reload; take it over.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = previous;
      };
    }
  }, []);

  // Keep a running note of where we are on the current path.
  useEffect(() => {
    const onScroll = () => saved.current.set(pathname, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    const target = navigationType === 'POP' ? (saved.current.get(pathname) ?? 0) : 0;

    // The new route has to paint before Lenis can measure the new height —
    // two frames, then scroll. One frame lands short on the longer pages.
    let frame = requestAnimationFrame(() => {
      resize();
      frame = requestAnimationFrame(() => scrollTo(target));
    });

    // Images settle after first paint and change the document height again.
    const settle = window.setTimeout(() => resize(), 600);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [pathname, navigationType, scrollTo, resize]);

  return null;
}
