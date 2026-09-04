import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * An alarm clock with no OFF.
 *
 * Snooze is the only control. The excuse escalates each time, the "dismiss"
 * button keeps not being there, and the clock keeps advancing nine minutes.
 * There is no win state, which is the entire point.
 */

const EXCUSES = [
  'Bas paanch minute.',
  'Okay but this one is genuinely just five.',
  'The alarm is wrong. It is definitely earlier than that.',
  'I was up late studying. (She was not up late studying.)',
  'Sunday hai. It is Tuesday.',
  'One more and then I am getting up, I promise, seriously.',
  'The bed is warm and the syllabus is not going anywhere.',
  'At this point the alarm is basically background music.',
  'Nine snoozes. That is eighty-one minutes. That is a film.',
  'The alarm has given up. It respects you now.',
];

export default function SnoozeAlarm() {
  const [count, setCount] = useState(0);
  const [ringing, setRinging] = useState(true);
  const [minutes, setMinutes] = useState(6 * 60 + 30); // 06:30
  const [dismissAt, setDismissAt] = useState({ x: 0, y: 0 });

  const dodgeDismiss = () =>
    setDismissAt({ x: (Math.random() - 0.5) * 130, y: (Math.random() - 0.5) * 40 + 18 });

  // Comes back on its own. Obviously.
  useEffect(() => {
    if (ringing) return;
    const t = window.setTimeout(() => setRinging(true), 1600);
    return () => window.clearTimeout(t);
  }, [ringing]);

  const snooze = () => {
    setRinging(false);
    setCount((c) => c + 1);
    setMinutes((m) => m + 9);
  };

  const clock = `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  const excuse = EXCUSES[Math.min(count, EXCUSES.length - 1)];

  return (
    <section className="clay p-6 md:p-10 text-center relative overflow-hidden">
      {/* A soft glow that pulses when it's ringing. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: ringing ? [0.15, 0.4, 0.15] : 0.05 }}
        transition={{ duration: 1.4, repeat: ringing ? Infinity : 0, ease: 'easeInOut' }}
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(169,155,232,0.5), transparent 65%)',
        }}
      />

      <div className="relative">
        <p className="font-soft text-[10px] tracking-[0.3em] uppercase text-moon/40 mb-6">
          Alarm &mdash; every single morning
        </p>

        <motion.p
          key={clock}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-soft text-6xl md:text-8xl font-light text-moon tabular-nums leading-none"
        >
          {clock}
        </motion.p>

        <AnimatePresence mode="wait">
          <motion.p
            key={count}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="font-serif italic text-lg md:text-xl text-lavender mt-6 min-h-[3.5rem] flex items-center justify-center px-4"
          >
            {excuse}
          </motion.p>
        </AnimatePresence>

        <div className="flex flex-col items-center gap-4 mt-6">
          <motion.button
            onClick={snooze}
            whileTap={{ 
              scale: 0.9, 
              x: [-10, 10, -10, 10, 0], 
              transition: { duration: 0.4 } 
            }}
            className="font-soft text-sm tracking-[0.25em] uppercase text-night bg-lavender rounded-full px-10 py-4 shadow-[0_0_20px_rgba(169,155,232,0.3)] hover:shadow-[0_0_35px_rgba(169,155,232,0.6)] transition-all"
          >
            Snooze
          </motion.button>

          {/* Always present, always just out of reach.

              A `disabled` button fires no pointer events in most browsers, so
              the dodge is driven from a wrapper. Position is state rather than a
              direct style write — that way Motion springs it instead of
              snapping, and there's no untyped reach into e.target. */}
          <span
            onMouseEnter={dodgeDismiss}
            onTouchStart={dodgeDismiss}
            className="inline-block"
          >
            <motion.button
              disabled
              aria-disabled="true"
              title="Not for you"
              animate={{ x: dismissAt.x, y: dismissAt.y }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className="font-soft text-[10px] tracking-[0.3em] uppercase text-moon/15 cursor-not-allowed px-6 py-2"
            >
              Dismiss
            </motion.button>
          </span>
        </div>

        <p className="font-soft text-[10px] tracking-[0.25em] uppercase text-moon/35 mt-8 tabular-nums">
          {count} {count === 1 ? 'snooze' : 'snoozes'} &middot; {count * 9} minutes lost &middot; 0
          dismissed
        </p>
      </div>
    </section>
  );
}
