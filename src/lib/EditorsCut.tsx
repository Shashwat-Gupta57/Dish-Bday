import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface CutApi {
  active: boolean;
  toggle: () => void;
  close: () => void;
  /** Attach to the masthead. Three taps inside a second flips the mode. */
  tripleTap: { onClick: () => void };
}

const CutContext = createContext<CutApi | null>(null);

export function EditorsCutProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const taps = useRef<number[]>([]);

  const toggle = useCallback(() => setActive((v) => !v), []);
  const close = useCallback(() => setActive(false), []);

  const onClick = useCallback(() => {
    const now = Date.now();
    taps.current = [...taps.current, now].filter((t) => now - t < 900);
    if (taps.current.length >= 3) {
      taps.current = [];
      setActive((v) => !v);
    }
  }, []);

  // Desktop shortcut, because triple-clicking a headline also selects text.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.tagName === 'INPUT';
      if (typing) return;
      if (e.key === 'e' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setActive((v) => !v);
      }
      if (e.key === 'Escape') setActive(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo<CutApi>(
    () => ({ active, toggle, close, tripleTap: { onClick } }),
    [active, toggle, close, onClick],
  );

  return (
    <CutContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-[400] bg-editorial-mark text-white px-6 py-2 flex items-center justify-between font-sans"
          >
            <span className="text-[10px] tracking-[0.35em] uppercase">
              Editor&rsquo;s Cut &mdash; annotations visible
            </span>
            <button
              onClick={close}
              aria-label="Exit editor's cut"
              className="text-[10px] tracking-[0.25em] uppercase underline underline-offset-4 hover:opacity-70 transition-opacity"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </CutContext.Provider>
  );
}

export function useEditorsCut(): CutApi {
  const ctx = useContext(CutContext);
  if (!ctx) throw new Error('useEditorsCut must be used inside <EditorsCutProvider>');
  return ctx;
}

type Side = 'left' | 'right' | 'top' | 'bottom';

/**
 * A red editorial mark with a margin note. Absolutely positioned inside whatever
 * `relative` parent it sits in; entirely inert when the cut is off.
 */
export function Annotation({
  note,
  className = '',
  side = 'right',
  circle = false,
}: {
  note: string;
  className?: string;
  side?: Side;
  circle?: boolean;
}) {
  const { active } = useEditorsCut();
  if (!active) return null;

  const leader: Record<Side, string> = {
    right: 'left-full top-1/2 w-10 h-[1px] -translate-y-1/2',
    left: 'right-full top-1/2 w-10 h-[1px] -translate-y-1/2',
    top: 'bottom-full left-1/2 h-8 w-[1px] -translate-x-1/2',
    bottom: 'top-full left-1/2 h-8 w-[1px] -translate-x-1/2',
  };

  const notePos: Record<Side, string> = {
    right: 'left-[calc(100%+2.75rem)] top-1/2 -translate-y-1/2',
    left: 'right-[calc(100%+2.75rem)] top-1/2 -translate-y-1/2 text-right',
    top: 'bottom-[calc(100%+2.25rem)] left-1/2 -translate-x-1/2 text-center',
    bottom: 'top-[calc(100%+2.25rem)] left-1/2 -translate-x-1/2 text-center',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`absolute z-[350] pointer-events-none ${className}`}
    >
      <div
        className={`absolute inset-0 border-2 border-editorial-mark ${
          circle ? 'rounded-full' : ''
        }`}
        style={{ transform: 'rotate(-0.8deg)' }}
      />
      <div className={`absolute bg-editorial-mark ${leader[side]}`} />
      <p
        className={`absolute ${notePos[side]} w-44 font-sans text-[10px] leading-snug tracking-wide text-editorial-mark`}
        style={{ transform: 'rotate(-1.2deg)' }}
      >
        {note}
      </p>
    </motion.div>
  );
}
