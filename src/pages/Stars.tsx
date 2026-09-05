import { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEggs } from '../lib/EggContext';
import BackLink from '../components/BackLink';
import Compatibility from '../components/stars/Compatibility';
import TarotPull from '../components/stars/TarotPull';

/**
 * /stars — the sixth aesthetic. Antique almanac: ink-black, antique gold,
 * parchment, thin double rules.
 *
 * Reached from INSERT COIN on the arcade. The brief was "distract her with
 * astrology", so astrology does the work: every accusation on this page is
 * attributed to a planet, which makes it deniable, which makes it funny.
 */

const HOUSES = [
  {
    n: 'I',
    title: 'The Ascendant',
    body: 'Virgo rising. Presents as extremely put together. Is, on inspection, running on fulki and three hours of afternoon sleep. The mask holds up remarkably well and the panel respects it.',
  },
  {
    n: 'V',
    title: 'The Fifth House — Romance',
    body: 'Empty. Not badly aspected, not afflicted, not cursed. Simply empty. Nineteen years, a Virgo sun, a face that reduces group photographs to solo portraits, and the house is unoccupied. The stars find this genuinely impressive.',
  },
  {
    n: 'VII',
    title: 'The Seventh House — Partnership',
    body: 'Mercury retrograde in the house of "I will text him tomorrow." Has been retrograde since roughly 2023. Astronomers have been notified. They are also confused.',
  },
  {
    n: 'XI',
    title: 'The Eleventh House — Friendship',
    body: 'This is where the chart gets loud. See below.',
  },
];

export default function Stars() {
  const { find } = useEggs();

  useEffect(() => {
    find('stars');
  }, [find]);

  // Generated once so the sky doesn't reshuffle on every re-render.
  const stars = useMemo(
    () =>
      Array.from({ length: 90 }).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 1.8 + 0.6,
        d: Math.random() * 4,
      })),
    [],
  );

  return (
    <div className="relative min-h-screen bg-cosmos text-parchment overflow-hidden">
      {/* Star field */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        {stars.map((st, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold-light animate-twinkle"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: st.s,
              height: st.s,
              animationDelay: `${st.d}s`,
            }}
          />
        ))}
        {/* A slowly turning zodiac wheel, mostly out of frame */}
        <div className="absolute -right-40 top-1/4 w-[560px] h-[560px] rounded-full border border-gold/10 animate-spin-slow">
          <div className="absolute inset-12 rounded-full border border-gold/10" />
          <div className="absolute inset-24 rounded-full border border-gold/[0.07]" />
        </div>
      </div>

      <div className="relative z-10 px-6 md:px-12 py-14 md:py-20 max-w-3xl mx-auto">
        <BackLink className="inline-flex items-center gap-2 font-soft text-[10px] tracking-[0.3em] uppercase text-parchment/35 hover:text-gold transition-colors mb-16">
          &larr; Back to the arcade
        </BackLink>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <header className="text-center mb-24 md:mb-32">
          <p className="font-soft text-[10px] tracking-[0.45em] uppercase text-gold/50 mb-8">
            ✦ &nbsp; The Natal Chart of Dihhita &nbsp; ✦
          </p>
          <h1 className="font-serif text-5xl md:text-7xl italic leading-[0.95] text-parchment mb-8">
            The stars have
            <br />
            <span className="text-gold">something to say.</span>
          </h1>
          <p className="font-soft text-base md:text-lg leading-relaxed text-parchment/55 max-w-lg mx-auto">
            Sun in Virgo. Born the thirteenth of September. Ruled by Mercury, which is the planet
            of communication, which is the single funniest fact in this entire chart.
          </p>
        </header>

        {/* ── The houses ────────────────────────────────────────── */}
        <section className="mb-24 md:mb-32">
          <p className="font-soft text-[10px] tracking-[0.35em] uppercase text-gold/45 mb-10">
            The reading
          </p>
          <div className="space-y-10">
            {HOUSES.map((h, i) => (
              <motion.div
                key={h.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.06 }}
                className="flex gap-5 md:gap-8"
              >
                <span className="font-serif text-2xl md:text-3xl text-gold/40 shrink-0 w-8 text-right italic">
                  {h.n}
                </span>
                <div>
                  <h2 className="font-serif text-xl md:text-2xl italic text-gold-light mb-2.5">
                    {h.title}
                  </h2>
                  <p className="font-soft text-sm md:text-base leading-relaxed text-parchment/60">
                    {h.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── The Prime Minister clause ─────────────────────────── */}
        <section className="gilt p-7 md:p-10 mb-24 md:mb-32">
          <p className="font-soft text-[10px] tracking-[0.35em] uppercase text-gold/45 mb-5">
            An observation on shared placements
          </p>
          <p className="font-serif text-xl md:text-3xl italic leading-snug text-parchment/85 mb-6">
            You share a sun sign with the Prime Minister of India. Born four days apart, same
            Virgo, same Mercury rulership, same alleged eye for detail.
          </p>
          <p className="font-soft text-sm md:text-base leading-relaxed text-parchment/55">
            He runs a country of one and a half billion people. You cannot secure the attention of
            one (1) quiet boy who was, by all accounts, standing right there. The stars offer no
            explanation for this divergence. The stars are, frankly, as puzzled as the rest of us.
          </p>
          <p className="font-soft text-sm md:text-base leading-relaxed text-parchment/55 mt-5">
            Your chart does show one clear achievement in the fifth house, though: you built an
            image. A whole persona. Immaculate, curated, twenty-six photographs deep. Venus notes
            that you constructed all of it entirely for yourself, and Venus thinks that is
            actually the more impressive outcome.
          </p>
        </section>

        {/* ── Synastry ──────────────────────────────────────────── */}
        <section className="mb-24 md:mb-32">
          <Compatibility />
        </section>

        {/* ── The eleventh house ────────────────────────────────── */}
        <section className="mb-24 md:mb-32">
          <p className="font-soft text-[10px] tracking-[0.35em] uppercase text-gold/45 mb-4">
            The eleventh house, in full
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic text-gold mb-8 leading-tight">
            Saturn has notes on Aditri.
          </h2>

          <div className="space-y-6 font-soft text-sm md:text-base leading-relaxed text-parchment/60">
            <p>
              The eleventh house governs friendship, and yours has one long-standing affliction.
              The stars have reviewed it and the stars are not going to be diplomatic about this,
              because the stars have watched the whole thing happen.
            </p>
            <p>
              She wanted one boy to notice her. That was the entire objective. And to get there
              she spent your name &mdash; in front of your bestie, in front of your family, in
              front of anyone who would listen &mdash; and when it had done its job she put you
              down and walked off. You were not a friend in that transaction. You were a resource.
            </p>
            <p>
              <span className="text-gold-light">And you are still calling her a friend.</span> The
              chart flags this as the single most baffling placement in the entire reading. You
              have created distance, and the stars have logged that and consider it the correct
              call. But Saturn, who does not do gentle, would like it noted that distance is not
              the same as a boundary, and that you have historically been far more generous with
              her than she has ever once been with you.
            </p>
            <p>
              The reading is not that you were foolish. Virgo in the eleventh house means loyalty
              runs deeper than sense &mdash; you keep showing up for people long after they have
              stopped earning it, and that is a real virtue that has been used against you by
              somebody who recognised it and priced it at zero. That is a failure of her chart,
              not yours.
            </p>
            <p className="text-gold-light">
              Jupiter&rsquo;s guidance for the year ahead is short: be exactly this loyal, to
              roughly four fewer people.
            </p>
          </div>
        </section>

        {/* ── Tarot ─────────────────────────────────────────────── */}
        <section className="mb-24 md:mb-32">
          <p className="font-soft text-[10px] tracking-[0.35em] uppercase text-gold/45 mb-4">
            A three-card spread
          </p>
          <h2 className="font-serif text-3xl md:text-4xl italic text-parchment mb-3">
            Draw them yourself.
          </h2>
          <p className="font-soft text-sm text-parchment/45 mb-10 max-w-lg">
            The deck is small and the deck is rigged, which is true of every deck anyone has ever
            read for you.
          </p>
          <TarotPull />
        </section>

        {/* ── The remedy ────────────────────────────────────────── */}
        <section className="gilt p-7 md:p-10 mb-16">
          <p className="font-soft text-[10px] tracking-[0.35em] uppercase text-gold/45 mb-6">
            Prescribed remedies
          </p>
          <ul className="space-y-4 mb-8">
            {[
              'Wear red on Tuesdays. Not for the planets — it simply suits you and the planets agree.',
              'Do not text him. This is not astrological guidance. This is just correct.',
              'One plate of fulki, weekly, paid for by your bestie. Venus is very firm on this clause.',
              'Sleep in the afternoon. The stars have stopped fighting you on this one.',
              'Be slightly less available to people who have already shown you the receipts.',
            ].map((r, i) => (
              <li key={i} className="flex gap-4 font-soft text-sm md:text-base text-parchment/60 leading-relaxed">
                <span className="text-gold shrink-0">✦</span>
                {r}
              </li>
            ))}
          </ul>
          <p className="font-serif text-xl md:text-2xl italic text-gold-light leading-snug">
            The chart closes on a good aspect. Nineteen is a strong year for you. The boy was
            never in it, and the friend was never in it either &mdash; which leaves considerably
            more room than it sounds like.
          </p>
        </section>

        <footer className="flex flex-wrap gap-x-8 gap-y-3 pt-8 border-t border-gold/15 font-soft text-[10px] uppercase tracking-[0.3em] text-parchment/30">
          <BackLink className="hover:text-gold transition-colors">&larr; Back</BackLink>
          <Link to="/arcade" className="hover:text-gold transition-colors">The arcade</Link>
          <Link to="/sleep" className="hover:text-gold transition-colors">Case file 02</Link>
          <Link to="/" className="hover:text-gold transition-colors">The issue</Link>
        </footer>
      </div>
    </div>
  );
}
