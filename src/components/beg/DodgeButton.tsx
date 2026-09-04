import { useRef, useState } from 'react';
import { motion } from 'motion/react';

/**
 * The negotiation.
 *
 * "No" runs away from the cursor and shrinks; "Yes" grows every time it dodges.
 * On touch there is no cursor to run from, so it teleports on tap instead —
 * without that fallback the whole gag is dead on a phone, which is the only
 * device she will open this on.
 */

const NO_LABELS = [
  'No',
  'No thanks',
  'Nope',
  'Still no',
  'Absolutely not',
  'Stop asking',
  'I said no',
  'Please stop',
  'ugh FINE',
];

export default function DodgeButton({ onYes }: { onYes: () => void }) {
  const [dodges, setDodges] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const box = useRef<HTMLDivElement>(null);

  const dodge = () => {
    const bounds = box.current?.getBoundingClientRect();
    const rangeX = bounds ? Math.min(bounds.width / 2.6, 130) : 100;
    setOffset({
      x: (Math.random() - 0.5) * 2 * rangeX,
      y: (Math.random() - 0.5) * 70,
    });
    setDodges((d) => Math.min(d + 1, NO_LABELS.length - 1));
  };

  // Yes grows, No shrinks. By dodge 8 the choice has been made for her.
  const yesScale = 1 + dodges * 0.09;
  const noScale = Math.max(0.45, 1 - dodges * 0.07);
  const exhausted = dodges >= NO_LABELS.length - 1;

  return (
    <div ref={box} className="relative flex flex-wrap items-center justify-center gap-6 py-10 min-h-[180px]">
      <motion.button
        onClick={onYes}
        animate={{ scale: yesScale }}
        whileTap={{ scale: yesScale * 0.94 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="bg-candy text-white font-soft font-semibold tracking-wide rounded-full px-9 py-4 text-base shadow-[0_10px_24px_-8px_rgba(242,83,125,0.7)] hover:brightness-105 origin-center"
      >
        Okay fine, I&rsquo;ll send them
      </motion.button>

      <motion.button
        onClick={exhausted ? onYes : dodge}
        onMouseEnter={dodge}
        onFocus={dodge}
        animate={{ x: offset.x, y: offset.y, scale: noScale }}
        transition={{ type: 'spring', stiffness: 300, damping: 16 }}
        className="bg-white text-berry/60 font-soft rounded-full px-7 py-3.5 text-sm border-2 border-petal shrink-0"
      >
        {NO_LABELS[dodges]}
      </motion.button>

      {dodges > 2 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full text-center font-soft text-xs text-berry/40 mt-2"
        >
          {exhausted
            ? 'The button has surrendered. Press it.'
            : `${dodges} escape ${dodges === 1 ? 'attempt' : 'attempts'}. It is getting smaller, Dishu.`}
        </motion.p>
      )}
    </div>
  );
}
