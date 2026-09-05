import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * The synastry engine.
 *
 * Deterministic, not random: the same name always returns the same reading, so
 * she can't reroll her way to a better answer and so showing a friend produces
 * the same result. A few names are hard-coded, because those are the jokes.
 */

interface Reading {
  pct: number;
  verdict: string;
  note: string;
}

const RIGGED: Record<string, Reading> = {
  hyderabadi: {
    pct: 0,
    verdict: 'Zero. Not low. Zero.',
    note: 'The chart could not find him. We checked twice. Mercury has filed him under "did not look up".',
  },
  aditri: {
    pct: 4,
    verdict: 'Do not run this one.',
    note: 'Eleventh house is on fire. See the friendship reading below. The stars have already said their piece.',
  },
  dishita: {
    pct: 100,
    verdict: 'Perfect match, obviously.',
    note: 'You and yourself. Twenty-six photographs of evidence. This was never in doubt.',
  },
  dihhita: {
    pct: 100,
    verdict: 'Spelled correctly for once.',
    note: 'Still a perfect match. The universe is consistent about this if nothing else.',
  },
  fulki: {
    pct: 97,
    verdict: 'Soulmate. Genuinely.',
    note: 'The only relationship in your chart with no afflictions whatsoever. Venus is delighted.',
  },
  neend: {
    pct: 99,
    verdict: 'Written in the stars.',
    note: 'Committed. Reliable. Shows up every single afternoon without being asked. Learn from it.',
  },
  modi: {
    pct: 61,
    verdict: 'Same sign. Different outcomes.',
    note: 'Both Virgo, born four days apart. One of you runs a country. The other cannot get a text back.',
  },
  pushpendra: {
    pct: 2,
    verdict: 'Absolutely not.',
    note: 'Saturn says no. Jupiter says no. The 400 pages of notes say no. Everyone is aligned on this.',
  },
};

const VERDICTS = [
  'Venus is not involved.',
  'Promising. On paper. Only on paper.',
  'Mercury advises you say nothing.',
  'The stars are being polite about this.',
  'Statistically survivable.',
  'A strong maybe from Jupiter.',
  'Saturn has concerns and Saturn is usually right.',
  'This would be a lot of work.',
];

const NOTES = [
  'Your chart shows loyalty where it should show self-preservation. Again.',
  'Compatible in theory. In practice you would fall asleep by 4pm and it would end there.',
  'A promising conjunction, undone entirely by your refusal to text first.',
  'The stars advise fulki instead. The stars usually advise fulki.',
  'Good aspect. Terrible timing. Which is the story of the entire chart.',
  'Virgo sun means you will overthink this for eleven days and then do nothing.',
];

/** Small deterministic string hash, so a name always returns the same reading. */
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function read(nameRaw: string): Reading {
  const name = nameRaw.trim().toLowerCase();
  for (const key of Object.keys(RIGGED)) {
    if (name.includes(key)) return RIGGED[key];
  }
  const h = hash(name);
  return {
    pct: 11 + (h % 78),
    verdict: VERDICTS[h % VERDICTS.length],
    note: NOTES[(h >> 5) % NOTES.length],
  };
}

export default function Compatibility() {
  const [name, setName] = useState('');
  const [result, setResult] = useState<Reading | null>(null);
  const [shown, setShown] = useState('');

  const run = () => {
    if (!name.trim()) return;
    setShown(name.trim());
    setResult(read(name));
  };

  return (
    <div className="gilt p-6 md:p-9">
      <p className="font-soft text-[10px] tracking-[0.35em] uppercase text-gold/50 mb-3">
        Synastry engine
      </p>
      <h3 className="font-serif text-2xl md:text-3xl italic text-parchment mb-3">
        Run anyone against her chart.
      </h3>
      <p className="font-soft text-sm text-parchment/45 mb-7 leading-relaxed">
        Enter a name. The reading is fixed to that name &mdash; you cannot try again until you
        like the answer. That is not how astrology works and it is certainly not how this works.
      </p>

      <div className="flex flex-wrap gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
          placeholder="a name, any name&hellip;"
          aria-label="Name to check compatibility against"
          className="flex-1 min-w-[180px] bg-transparent border-b border-gold/30 focus:border-gold outline-none font-soft text-parchment text-base py-2.5 placeholder:text-parchment/25 transition-colors"
        />
        <button
          onClick={run}
          className="font-soft text-[11px] tracking-[0.25em] uppercase text-cosmos bg-gold px-6 py-2.5 rounded-full hover:brightness-110 transition-all shrink-0"
        >
          Consult
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={shown}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="mt-9 pt-8 border-t border-gold/20"
          >
            <div className="flex items-end justify-between gap-6 mb-5 flex-wrap">
              <div>
                <p className="font-soft text-[10px] tracking-[0.3em] uppercase text-gold/45 mb-2">
                  Dihhita &times; {shown}
                </p>
                <p className="font-serif text-2xl md:text-3xl italic text-gold-light">
                  {result.verdict}
                </p>
              </div>
              <p className="font-serif text-5xl md:text-6xl text-gold leading-none tabular-nums">
                {result.pct}%
              </p>
            </div>

            <div className="h-1.5 bg-gold/15 rounded-full overflow-hidden mb-5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.pct}%` }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-gold rounded-full"
              />
            </div>

            <p className="font-soft text-sm md:text-base text-parchment/60 leading-relaxed">
              {result.note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
