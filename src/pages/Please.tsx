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
 * Every other page is an accusation. This one is a grovel, so it gets the
 * opposite treatment again: soft blush, puffy cards, stickers, springs, and
 * nothing sharper than a 32px radius. Sugar, after brutalism and nocturne.
 */

const HAVE = 26;
const WANT = 50;

const PLEASE_LINES = [
  'please',
  'pleaseee',
  'pleasepleaseplease',
  'I am on my knees',
  'I am begging on a website I built for you',
  'do you understand how long the film strip took',
  'I cropped forty people out of photos for this',
  'one (1) photo dump. that is all I ask',
  'okay I will stop. but will I though',
  'send. the. photos.',
];

const OFFERS = [
  { emoji: '🍟', title: 'Fulki. On me.', note: 'One full plate. Two if the photos are good.' },
  { emoji: '😴', title: 'No sleep jokes', note: 'For one (1) week. Renewable. Non-binding.' },
  { emoji: '🚫', title: 'Aunty ban', note: 'I will not call you Aunty. For 48 hours. Approximately.' },
  { emoji: '👑', title: 'Full editorial control', note: 'You pick which ones go on the site. Mostly.' },
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
              this is the nice page. don&rsquo;t get used to it 🥺
            </p>
          </motion.div>

          <p className="font-soft text-[11px] tracking-[0.35em] uppercase text-candy mb-6">
            Section 01 &middot; a formal grovel
          </p>

          <h1 className="font-serif text-5xl md:text-7xl italic leading-[0.95] mb-4">
            Dishu.
            <br />
            <span className="text-candy">I need photos.</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="font-soft text-sm md:text-base text-berry/45 italic mb-8 max-w-xl"
          >
            (haan &mdash; <strong className="text-candy not-italic">Dishu</strong>. Diya se
            udhaar liya hai. Kya pata yahi dekh ke photos bhej do tum 🥀🥀🥀)
          </motion.p>

          <p className="font-soft text-lg md:text-xl leading-relaxed text-berry/70 max-w-2xl mb-6">
            I have built you a magazine, a fake legal department, a statistical study, a sleep
            laboratory and a page that plays sad music. I have done all of it on{' '}
            <strong className="text-candy">twenty-six photographs</strong>, most of which I did
            not obtain honestly.
          </p>

          <p className="font-soft text-lg md:text-xl leading-relaxed text-berry/70 max-w-2xl">
            I am not asking for much. Dishu, I am asking for a photo dump. I am asking on my knees, in
            Quicksand, on a page I wrote by hand at an unreasonable hour.
          </p>
        </section>

        {/* ─────────────────── 02 · The evidence ─────────────────── */}
        <section className="mb-28 md:mb-40">
          <p className="font-soft text-[11px] tracking-[0.35em] uppercase text-candy mb-6">
            Section 02 &middot; exhibit: everything I own
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic mb-4">
            This is the entire archive.
          </h2>
          <p className="font-soft text-base md:text-lg leading-relaxed text-berry/65 max-w-2xl mb-10">
            Every photograph on this website, in one strip. Drag it. Touch any frame and it will
            confess where it actually came from. Most of them are not photos of you. They are
            photos that <em>contain</em> you, which I then cropped until they were.
          </p>
          <FilmStrip />
        </section>

        {/* ─────────────────── 03 · The maths ─────────────────── */}
        <section className="mb-28 md:mb-40">
          <p className="font-soft text-[11px] tracking-[0.35em] uppercase text-candy mb-6">
            Section 03 &middot; the arithmetic of my suffering
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
              {WANT - HAVE} more and this becomes a masterpiece instead of a very determined
              cropping exercise.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { v: '24', l: 'photos short' },
              { v: '~4 min', l: 'of your time' },
              { v: '40+', l: 'people I cropped out' },
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
            Section 04 &middot; what&rsquo;s in it for you
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic mb-10">
            I am prepared to negotiate.
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
                  I knew you&rsquo;d cave.
                </p>
                <p className="font-soft text-base text-berry/60 max-w-md mx-auto">
                  Screenshot this page and send it back to me with the photos so I know it was
                  legally binding, Dishu. The fulki offer stands. The aunty ban does not.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ─────────────────── 05 · The final beg ─────────────────── */}
        <section className="relative">
          <p className="font-soft text-[11px] tracking-[0.35em] uppercase text-candy mb-6">
            Section 05 &middot; no dignity remaining
          </p>
          <h2 className="font-serif text-3xl md:text-5xl italic mb-8">One more time, with feeling.</h2>

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
              press to beg harder
            </motion.button>

            <p className="font-soft text-[11px] tracking-[0.2em] uppercase text-berry/35 mt-7 tabular-nums">
              {pleases} {pleases === 1 ? 'plea' : 'pleas'} registered &middot; 0 photos received
            </p>
          </div>

          <p className="font-soft text-base md:text-lg leading-relaxed text-berry/65 max-w-2xl mt-14">
            Twenty to fifty photos. Any quality. Blurry ones welcome. Group photos welcome &mdash;
            I am, as established, extremely good at removing people from them. Send them and next
            year&rsquo;s issue will be so much worse for you, and I mean that with my whole chest.
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
