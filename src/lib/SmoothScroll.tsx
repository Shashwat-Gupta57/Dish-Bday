import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Weight.
 *
 * The page used to move exactly as far as the wheel said, the instant it said
 * it. This puts mass behind it: each notch travels a little less, and when you
 * stop, the page keeps gliding and settles rather than stopping dead.
 *
 * Lenis drives the real window scroll position rather than transforming a
 * container, so every `useScroll` parallax, `whileInView` trigger, `sticky`
 * element and the Decoder's bottom-detection keep working untouched. A
 * transform-based smooth scroller would have silently broken all of them.
 */
const FEEL = {
  /**
   * How fast the page catches up to where it should be, per frame. This is the
   * friction. Lower = heavier and longer to settle.
   *   0.1   Lenis default, gentle
   *   0.075 noticeably weighted        <- here
   *   0.05  syrup
   */
  lerp: 0.075,

  /** How far one wheel notch travels. Below 1 the whole page reads as slower. */
  wheelMultiplier: 0.85,
};

interface SmoothScrollApi {
  /** Pause scrolling — for modals and full-screen overlays. */
  stop: () => void;
  /** Resume. */
  start: () => void;
  /**
   * Jump to an offset with no animation. Must go through Lenis: it owns the
   * scroll position, so a bare window.scrollTo gets overridden on the next
   * frame as Lenis eases back to where it thinks you were.
   */
  scrollTo: (y: number) => void;
  /** Re-measure after the route swaps and the page height changes. */
  resize: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Anyone who has asked their OS for less motion gets the native scroll.
    // A heavy inertial glide is exactly what that setting is asking us not to do.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const lenis = new Lenis({
      lerp: FEEL.lerp,
      wheelMultiplier: FEEL.wheelMultiplier,
      smoothWheel: true,
      // Phones already have good momentum scrolling in the OS. Hijacking it
      // makes a site feel laggy rather than weighted, so touch stays native.
      syncTouch: false,
      // We drive the RAF loop ourselves so it tears down cleanly on unmount.
      autoRaf: false,
      // Elements marked data-lenis-prevent scroll natively — the overlays.
      anchors: true,
    });

    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const value = useMemo<SmoothScrollApi>(
    () => ({
      stop: () => lenisRef.current?.stop(),
      start: () => lenisRef.current?.start(),
      scrollTo: (y: number) => {
        const lenis = lenisRef.current;
        if (lenis) {
          // force:true so it still lands while a modal has the scroller stopped.
          lenis.scrollTo(y, { immediate: true, force: true });
        } else {
          window.scrollTo(0, y);
        }
      },
      resize: () => lenisRef.current?.resize(),
    }),
    [],
  );

  return (
    <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>
  );
}

/** Safe to call outside the provider — it just no-ops. */
export function useSmoothScroll(): SmoothScrollApi {
  return (
    useContext(SmoothScrollContext) ?? {
      stop: () => {},
      start: () => {},
      scrollTo: (y: number) => window.scrollTo(0, y),
      resize: () => {},
    }
  );
}

/**
 * Freeze the page while an overlay is open, and thaw it on the way out.
 * Handles both the smooth scroller and the native fallback.
 */
export function useScrollLock(locked: boolean) {
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    if (!locked) return;
    stop();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
      start();
    };
  }, [locked, stop, start]);
}
