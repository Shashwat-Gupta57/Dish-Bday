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
import { toast } from 'sonner';
import { CORNER_IDS, EGGS, TOTAL_EGGS } from './eggs';

const STORAGE_KEY = 'dishita-vol1-stamps';

interface EggApi {
  /** Raw ids collected, including the four corner sub-ids. */
  raw: Set<string>;
  /** Has this *stamp* been earned (corners requires all four). */
  isFound: (stampId: string) => boolean;
  /** Record a find. Safe to call repeatedly; only the first call counts. */
  find: (id: string) => void;
  foundCount: number;
  total: number;
  complete: boolean;
  reset: () => void;
}

const EggContext = createContext<EggApi | null>(null);

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* private window, blocked storage — the hunt just won't persist */
  }
}

export function EggProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<Set<string>>(() => new Set<string>(load()));
  // Stamps already announced, so a toast fires once per find and never on
  // rehydration from a previous visit.
  const announced = useRef(new Set<string>());
  const cornerCount = useRef(0);
  const hydrated = useRef(false);
  // Guards the completion toast so it fires once, not on every re-render.
  const celebrated = useRef(false);

  const isFound = useCallback(
    (stampId: string) => {
      if (stampId === 'corners') return CORNER_IDS.every((c) => raw.has(c));
      return raw.has(stampId);
    },
    [raw],
  );

  // The updater stays pure — no toasts, no localStorage. StrictMode invokes it
  // twice in development, so anything with a side effect in here fires twice.
  const find = useCallback((id: string) => {
    setRaw((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set<string>(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Persistence and announcements both react to the committed state instead.
  useEffect(() => {
    save([...raw]);
  }, [raw]);

  useEffect(() => {
    const cornersDone = CORNER_IDS.every((c) => raw.has(c));
    const earned = EGGS.filter((e) => (e.id === 'corners' ? cornersDone : raw.has(e.id)));

    for (const egg of earned) {
      if (announced.current.has(egg.id)) continue;
      announced.current.add(egg.id);
      // Don't replay every stamp on a return visit — only announce what's new
      // to this session.
      if (!hydrated.current) continue;
      toast(`Stamped — ${egg.title}`, {
        description: `${String(earned.length).padStart(2, '0')} of ${String(TOTAL_EGGS).padStart(2, '0')} found`,
      });
    }

    const gotCorners = CORNER_IDS.filter((c) => raw.has(c)).length;
    if (hydrated.current && gotCorners > 0 && gotCorners < CORNER_IDS.length) {
      if (cornerCount.current !== gotCorners) {
        cornerCount.current = gotCorners;
        toast(`Corner ${gotCorners} of 4`, {
          description: `${CORNER_IDS.length - gotCorners} more hiding in the margins.`,
        });
      }
    }

    hydrated.current = true;
  }, [raw]);

  const foundCount = useMemo(
    () => EGGS.filter((e) => isFound(e.id)).length,
    [isFound],
  );

  const complete = foundCount === TOTAL_EGGS;

  useEffect(() => {
    if (complete && !celebrated.current) {
      celebrated.current = true;
      toast('All nine found.', { description: 'The Decoder is open at the foot of the page.' });
    }
  }, [complete]);

  const reset = useCallback(() => {
    setRaw(new Set<string>());
    announced.current = new Set<string>();
    cornerCount.current = 0;
    celebrated.current = false;
  }, []);

  const value = useMemo<EggApi>(
    () => ({ raw, isFound, find, foundCount, total: TOTAL_EGGS, complete, reset }),
    [raw, isFound, find, foundCount, complete, reset],
  );

  return <EggContext.Provider value={value}>{children}</EggContext.Provider>;
}

export function useEggs(): EggApi {
  const ctx = useContext(EggContext);
  if (!ctx) throw new Error('useEggs must be used inside <EggProvider>');
  return ctx;
}
