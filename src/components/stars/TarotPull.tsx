import { useState } from 'react';
import { motion } from 'motion/react';

/**
 * A three-card spread. Past, present, guidance.
 *
 * Each slot draws from its own deck so the reading always makes narrative sense,
 * and each card flips independently — a real rotateY on preserve-3d, not a
 * crossfade between two elements.
 */

interface Card {
  glyph: string;
  name: string;
  reading: string;
}

const PAST: Card[] = [
  { glyph: '✉', name: 'The Unsent Message', reading: 'Forty-seven drafts. Zero sends. The card is upright, which somehow makes it worse.' },
  { glyph: '☾', name: 'The Boy Who Did Not Look Up', reading: 'A minor arcana at best. The chart barely registers him. Neither, in fairness, did he register you.' },
  { glyph: '⚱', name: 'Six of Fulki, Reversed', reading: 'Comfort sought in spicy water. The stars do not judge this. The stars have also seen the receipts.' },
];

const PRESENT: Card[] = [
  { glyph: '☉', name: 'The Sleeper', reading: 'Face down on an open textbook at 4pm. The card depicts you exactly. The artist did not have to guess.' },
  { glyph: '♍', name: 'The Virgo, Overthinking', reading: 'Eleven days of analysis followed by no action whatsoever. Classic placement. Textbook, even.' },
  { glyph: '⚖', name: 'The False Friend, Reversed', reading: 'Reversed means the truth is finally the right way up. You already know. You have known a while.' },
];

const GUIDANCE: Card[] = [
  { glyph: '★', name: 'The Star', reading: 'Genuinely a good card. Rare in this deck. Things get better and you did not have to beg for it.' },
  { glyph: '🜂', name: 'Ace of Boundaries', reading: 'The stars prescribe: less loyalty to people who have not earned it. Redirect it to the fulki stall.' },
  { glyph: '👑', name: 'The Sleep Queen', reading: 'You already hold the highest card in the deck. Nobody in your chart outranks you. Behave accordingly.' },
];

const DECKS = [
  { label: 'Past', deck: PAST },
  { label: 'Present', deck: PRESENT },
  { label: 'Guidance', deck: GUIDANCE },
];

const pick = (a: Card[]) => a[Math.floor(Math.random() * a.length)];

export default function TarotPull() {
  const [drawn, setDrawn] = useState<(Card | null)[]>([null, null, null]);

  const flip = (i: number) => {
    setDrawn((d) => {
      if (d[i]) return d;
      const next = [...d];
      next[i] = pick(DECKS[i].deck);
      return next;
    });
  };

  const all = drawn.every(Boolean);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6">
        {DECKS.map((slot, i) => {
          const card = drawn[i];
          return (
            <div key={slot.label}>
              <p className="font-soft text-[10px] tracking-[0.3em] uppercase text-gold/45 mb-3 text-center">
                {slot.label}
              </p>
              <button
                onClick={() => flip(i)}
                aria-label={card ? `${slot.label}: ${card.name}` : `Draw the ${slot.label} card`}
                className="w-full block"
                style={{ perspective: '1200px' }}
              >
                <motion.div
                  animate={{ rotateY: card ? 180 : 0 }}
                  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full aspect-[2/3.2]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* BACK — face down */}
                  <div
                    className="gilt absolute inset-0 flex flex-col items-center justify-center gap-4"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-3xl text-gold/60 animate-twinkle" aria-hidden="true">✦</span>
                    <span className="font-soft text-[9px] tracking-[0.3em] uppercase text-gold/35">
                      Tap to draw
                    </span>
                  </div>

                  {/* FACE */}
                  <div
                    className="gilt absolute inset-0 p-5 flex flex-col items-center text-center justify-between"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className="text-4xl text-gold mt-2" aria-hidden="true">
                      {card?.glyph}
                    </span>
                    <p className="font-serif text-base md:text-lg italic text-gold-light leading-tight px-1">
                      {card?.name}
                    </p>
                    <p className="font-soft text-[10px] leading-relaxed text-parchment/55 pb-1">
                      {card?.reading}
                    </p>
                  </div>
                </motion.div>
              </button>
            </div>
          );
        })}
      </div>

      {all && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="font-serif text-lg md:text-xl italic text-parchment/60 text-center mt-9 leading-relaxed max-w-xl mx-auto"
        >
          The spread is complete. The reading is consistent across all three cards, which almost
          never happens and is generally considered a bad sign for the person being read.
        </motion.p>
      )}
    </div>
  );
}
