import { useState } from 'react';
import { motion } from 'motion/react';

/**
 * Membership card. Flips on click or Enter.
 *
 * Rotation lives on an inner wrapper with preserve-3d; both faces are absolutely
 * stacked with backface-visibility hidden, so the back is a real reverse rather
 * than a second element that fades in.
 */
export default function AuntyCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.button
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'Show the front of the card' : 'Show the back of the card'}
        className="w-full block text-left outline-none"
        style={{ perspective: '1400px' }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95, rotate: [-2, 2, -2, 2, 0], transition: { duration: 0.4 } }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full aspect-[1.6/1]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRONT */}
          <div
            className="clay absolute inset-0 p-6 md:p-7 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-soft text-[9px] tracking-[0.3em] uppercase text-moon/40">
                  All India Association of
                </p>
                <p className="font-serif text-xl md:text-2xl italic text-moon leading-tight mt-1">
                  Dopahar Ki Neend
                </p>
              </div>
              <span className="text-2xl animate-breathe" aria-hidden="true">
                🌙
              </span>
            </div>

            <div>
              <p className="font-soft text-[9px] tracking-[0.3em] uppercase text-moon/40 mb-1">
                Lifetime member
              </p>
              <p className="font-serif text-2xl md:text-3xl text-lavender">Dishita</p>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-soft text-[8px] tracking-[0.25em] uppercase text-moon/30">
                  Member since
                </p>
                <p className="font-soft text-xs text-moon/70 tabular-nums">Birth</p>
              </div>
              <div className="text-right">
                <p className="font-soft text-[8px] tracking-[0.25em] uppercase text-moon/30">
                  Grade
                </p>
                <p className="font-soft text-xs text-moon/70">PLATINUM &mdash; UNBEATEN</p>
              </div>
            </div>

            <p className="font-soft text-[8px] tracking-[0.25em] uppercase text-moon/25 text-center">
              Tap to turn over
            </p>
          </div>

          {/* BACK */}
          <div
            className="clay absolute inset-0 p-6 md:p-7 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="font-soft text-[9px] tracking-[0.3em] uppercase text-moon/40">
              Member privileges
            </p>

            <ul className="space-y-2">
              {[
                'May sleep at any hour, in any chair, mid-sentence.',
                'May describe a three-hour nap as "resting my eyes".',
                'May claim to have studied. No evidence required.',
                'Immune to all alarms, including the ones she set.',
              ].map((p) => (
                <li key={p} className="flex gap-2.5 font-soft text-[11px] leading-snug text-moon/70">
                  <span className="text-lavender shrink-0">&bull;</span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="border-t border-moon/10 pt-3 flex items-end justify-between gap-4">
              <p className="font-soft text-[8px] tracking-[0.2em] uppercase text-moon/30 leading-relaxed">
                Non-transferable.
                <br />
                Cannot be revoked, only envied.
              </p>
              <p className="font-serif italic text-sm text-lavender shrink-0">Sleep Queen</p>
            </div>
          </div>
        </motion.div>
      </motion.button>
    </div>
  );
}
