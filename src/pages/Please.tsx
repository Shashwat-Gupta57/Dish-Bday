import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEggs } from '../lib/EggContext';
import BackLink from '../components/BackLink';
import FilmStrip from '../components/beg/FilmStrip';
import DodgeButton from '../components/beg/DodgeButton';

/**
 * /please — the only page on this site that wants something.
 *
 * Still the softest surface on the site, but the writing is a request, not a
 * love letter: plain, slightly official, and specific about what is missing.
 */

const HAVE = 26;
const WANT = 50;

const PLEASE_LINES = [
  'Request submitted.',
  'Request submitted again.',
  'Still no photos.',
  'This is the third time of asking.',
  'The archive has not changed since you last checked.',
  'Twenty-two of twenty-six were taken, not given.',
  'A single photo dump would close this entirely.',
  'This is now the longest-running item on the list.',
  'Escalating.',
  'Send the photos, Dishu Aunty.',
];

const OFFERS = [
  { emoji: '🍟', title: 'Fulki, paid for', note: 'One full plate. Two if the resolution is decent.' },
  { emoji: '😴', title: 'Sleep jokes suspended', note: 'Seven days. Renewable. Not legally binding.' },
  { emoji: '🚫', title: '"Aunty" suspended', note: 'Forty-eight hours. Approximately. No guarantees.' },
  { emoji: '👑', title: 'Editorial approval', note: 'You choose which frames are used. Within reason.' },
];

export default function Please() {
  const { find } = useEggs();
  const [pleases, setPleases] = useState(0);
  const [hearts, setHearts] = useState<number[]>([]);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    find('theask');
  }, [find]);

  const beg = () => {
    setPleases((p) => Math.min(p + 1, PLEASE_LINES.length - 1));
    const id = Date.now() + Math.random();
    setHearts((h) => [...h, id]);
    window.setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 3400);
  };

  const pct = Math.round((HAVE / WANT) * 100);

  return (
    <div className="min-h-screen bg-sugar text-berry overflow-hidden">
      {/* Soft blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 -right-24 w-[60vw] max-w-[540px] aspect-square rounded-full bg-petal/70 blur-3xl animate-floaty" />
        <div
          className="absolute bottom-0 -left-28 w-[55vw] max-w-[480px] aspect-square rounded-full blur-3xl animate-floaty"
          style={{ background: 'rgba(242,83,125,0.16)', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 px-5 md:px-10 py-14 md:py-20 max-w-4xl mx-auto">
        <BackLink className="inline-flex items-center gap-2 font-soft text-xs tracking-[0.2em] uppercase text-berry/40 hover:text-candy transition-colors mb-14">
          &larr; back to roasting you
        </BackLink>

        {/* ─────────────────── 01 · The opening plea ─────────────────── */}
        <section className="mb-28 md:mb-40 relative">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -9 }}
            transition={{ type: 'spring', bounce: 0.55, delay: 0.3 }}
            className="absolute -top-6 right-0 md:right-6 bg-candy text-white rounded-2xl px-4 py-2.5 max-w-[210px] shadow-lg z-20"
          >
            <p className="font-soft text-[11px] leading-snug font-medium">
              this is the polite page. it does not last.
            </p>
          </motion.div>

          <p className="font-soft text-[11px] tracking-[0.35em] uppercase text-candy mb-6">
            Section 01 &middot; the request
          </p>

          <h1 className="font-serif text-5xl md:text-7xl italic leading-[0.95] mb-4">
            Dishu Aunty.
            <br />
            <span className="text-candy">I need photos.</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="font-soft text-sm md:text-base text-berry/45 italic mb-8 max-w-xl"
          >
            (haan &mdash; <strong className="text-candy not-italic">Dishu Aunty</strong>. Diya se
            udhaar liya hai. Kya pata yahi dekh ke photos bhej do tum 🥀🥀🥀)
          </motion.p>

          <p className="font-soft text-lg md:text-xl leading-relaxed text-berry/70 max-w-2xl mb-6">
            This site runs to nine pages &mdash; a magazine, a legal department, a statistical
            study, a sleep laboratory and an arcade. All of it is built on{' '}
            <strong className="text-candy">twenty-six photographs</strong>, and only four of
            those were actually supplied by you.
          </p>

          <p className="font-soft text-lg md:text-xl leading-relaxed text-berry/70 max-w-2xl">
            The request is simple, Dishu Aunty: one photo dump. Twenty to fifty frames, any
            quality. That is the entire ask, and it is the only thing this site needs that it
            cannot get for itself.
          </p>
        </section>

        {/* ─────────────────── 02 · The evidence ─────────────────── */}
        <section className="mb-28 md:mb-40">
          <p className="font-soft text-[11px] tracking-[0.35em] uppercase text-candy mb-6">
            Section 02 &middot; asset register
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic mb-4">
            Every frame on file.
          </h2>
          <p className="font-soft text-base md:text-lg leading-relaxed text-berry/65 max-w-2xl mb-10">
            Every photograph used on this site, with its source recorded. Drag the strip and
            select any frame to see where it came from. Most are not photographs of you &mdash;
            they are photographs that <em>contained</em> you, cropped until they were.
          </p>
          <FilmStrip />
        </section>

        {/* ─────────────────── 03 · The maths ─────────────────── */}
        <section className="mb-28 md:mb-40">
          <p className="font-soft text-[11px] tracking-[0.35em] uppercase text-candy mb-6">
            Section 03 &middot; the shortfall
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic mb-10">
            I need {WANT}. I have {HAVE}.
          </h2>

          <div className="puff p-6 md:p-9 mb-8">
            <div className="flex items-end justify-between mb-4">
              <span className="font-soft text-sm text-berry/60">Archive completeness</span>
              <span className="font-soft text-3xl md:text-4xl text-candy tabular-nums leading-none">
                {pct}%
              </span>
            </div>
            <div className="h-5 rounded-full bg-petal/70 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-candy"
              />
            </div>
            <p className="font-soft text-sm text-berry/50 mt-4">
              {WANT - HAVE} more frames and this stops being a cropping exercise.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { v: '24', l: 'photos short' },
              { v: '~4 min', l: 'of your time' },
              { v: '40+', l: 'people removed from frames' },
              { v: '1', l: 'bestie, begging' },
            ].map((s) => (
              <div key={s.l} className="puff p-5 text-center">
                <p className="font-serif text-3xl md:text-4xl text-candy leading-none">{s.v}</p>
                <p className="font-soft text-[11px] text-berry/50 mt-2.5 leading-snug">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────────────── 04 · The bribe ─────────────────── */}
        <section className="mb-28 md:mb-40">
          <p className="font-soft text-[11px] tracking-[0.35em] uppercase text-candy mb-6">
            Section 04 &middot; terms offered
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic mb-10">
            What is on the table.
          </h2>

          <div className="grid sm:grid-cols-2 gap-5 mb-4">
            {OFFERS.map((o, i) => (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                whileHover={{ y: -5 }}
                className="puff p-6 flex gap-4 items-start"
              >
                <span className="text-3xl shrink-0 animate-floaty" style={{ animationDelay: `${i * 0.6}s` }}>
                  {o.emoji}
                </span>
                <div>
                  <p className="font-soft font-semibold text-berry">{o.title}</p>
                  <p className="font-soft text-sm text-berry/55 mt-1 leading-snug">{o.note}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <DodgeButton onYes={() => setAgreed(true)} />

          <AnimatePresence>
            {agreed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', bounce: 0.45 }}
                className="puff p-7 md:p-9 text-center mt-2"
              >
                <p className="text-4xl mb-4" aria-hidden="true">🥹</p>
                <p className="font-serif text-2xl md:text-3xl italic text-candy mb-3">
                  Noted. Thank you.
                </p>
                <p className="font-soft text-base text-berry/60 max-w-md mx-auto">
                  Screenshot this page and send it back with the photos so there is a record.
                  The fulki offer stands. The &ldquo;Aunty&rdquo; suspension does not.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ─────────────────── 05 · The final beg ─────────────────── */}
        <section className="relative">
          <p className="font-soft text-[11px] tracking-[0.35em] uppercase text-candy mb-6">
            Section 05 &middot; follow-up
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic mb-8">Asking once more.</h2>

          <div className="puff p-8 md:p-12 text-center relative overflow-hidden">
            {/* Hearts rise out of the button. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center" aria-hidden="true">
              {hearts.map((id) => (
                <span
                  key={id}
                  className="absolute text-2xl animate-rise"
                  style={{ left: `${(id % 7) * 12 - 34}%` }}
                >
                  {['💗', '🥺', '🙏', '✨'][Math.floor(id) % 4]}
                </span>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={pleases}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="font-serif text-2xl md:text-4xl italic text-berry min-h-[4.5rem] flex items-center justify-center px-2"
              >
                {PLEASE_LINES[pleases]}
              </motion.p>
            </AnimatePresence>

            <motion.button
              onClick={beg}
              whileTap={{ scale: 0.93 }}
              className="relative z-10 bg-candy text-white font-soft font-semibold rounded-full px-10 py-4 text-base shadow-[0_10px_24px_-8px_rgba(242,83,125,0.7)] hover:brightness-105 animate-wobble"
            >
              submit again
            </motion.button>

            <p className="font-soft text-[11px] tracking-[0.2em] uppercase text-berry/35 mt-7 tabular-nums">
              {pleases} {pleases === 1 ? 'request' : 'requests'} logged &middot; 0 photos received
            </p>
          </div>

          <p className="font-soft text-base md:text-lg leading-relaxed text-berry/65 max-w-2xl mt-14">
            Twenty to fifty photographs. Any quality &mdash; blurry is fine, group shots are fine.
            As established, removing other people from a frame is not a problem. Send them and
            next year&rsquo;s issue will be considerably worse for you.
          </p>

          <footer className="flex flex-wrap gap-x-8 gap-y-3 mt-16 pt-8 border-t border-petal font-soft text-[11px] uppercase tracking-[0.25em] text-berry/35">
            <BackLink className="hover:text-candy transition-colors">&larr; back</BackLink>
            <Link to="/findings" className="hover:text-candy transition-colors">case file 01</Link>
            <Link to="/sleep" className="hover:text-candy transition-colors">case file 02</Link>
            <Link to="/" className="hover:text-candy transition-colors">the issue</Link>
          </footer>
        </section>
      </div>
    </div>
  );
}
