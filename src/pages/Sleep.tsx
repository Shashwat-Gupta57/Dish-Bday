import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion, useTransform, useMotionValue, animate } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEggs } from '../lib/EggContext';
import { useIdleSleep } from '../lib/useIdleSleep';
import BackLink from '../components/BackLink';
import Hypnogram from '../components/sleep/Hypnogram';
import SnoozeAlarm from '../components/sleep/SnoozeAlarm';
import AuntyCard from '../components/sleep/AuntyCard';

/**
 * Soft Nocturne — Case File 02.
 *
 * The inverse of the Findings in every respect: rounded where that was hard,
 * glowing where that was flat, half-speed where that was crammed. Same joke
 * ("we have documented you"), opposite bedside manner.
 *
 * Two behaviours carry the theme rather than merely describing it: alertness
 * drains as you scroll, and the page falls asleep if you stop touching it.
 */

const TIMELINE = [
  { time: '16:02', label: 'Opens the book', note: 'Genuine intent. Nobody doubts this part.' },
  { time: '16:03', label: 'Reads one line', note: 'Re-reads it. Does not absorb it.' },
  { time: '16:05', label: '"Bas paanch minute"', note: 'The five most expensive minutes in India.' },
  { time: '16:16', label: 'Gone', note: 'Deep sleep. Book still open at page one.' },
  { time: '17:44', label: 'Phone buzzes', note: 'Surfaces briefly. Replies. Returns to sleep.' },
  { time: '19:36', label: 'Wakes', note: 'Disoriented. Slightly offended that it is dark.' },
  { time: '19:38', label: '"Maine bohot padha aaj"', note: 'Said aloud, to a real person, sincerely.' },
];

const STATS = [
  { v: '8', l: 'minutes studied', s: 'five spent finding a pen' },
  { v: '3h 20m', l: 'slept', s: 'called "a short break"' },
  { v: '96%', l: 'of sessions end this way', s: 'the other 4% she skipped' },
  { v: '0', l: 'alarms survived', s: 'all-time record' },
];

export default function Sleep() {
  const { find } = useEggs();
  const ref = useRef<HTMLDivElement>(null);
  const { asleep, dozed, wake } = useIdleSleep(12000);

  useEffect(() => {
    find('sleepfile');
  }, [find]);

  // Alertness drains from 100 to 0 automatically over 7.5 seconds.
  const alertness = useMotionValue(100);
  const alertnessText = useTransform(alertness, (v) => `${Math.round(v)}%`);
  const moonFill = useTransform(alertness, [0, 100], ['100%', '0%']);
  
  const haze = useTransform(alertness, [100, 40, 0], [0, 0.15, 0.5]);
  const pageBlur = useTransform(alertness, [100, 25, 0], ['blur(0px)', 'blur(4px)', 'blur(16px)']);
  const contentOpacity = useTransform(alertness, [100, 15, 0], [1, 0.8, 0.2]);

  const controls = useRef<any>(null);

  const startDrain = useCallback(() => {
    controls.current?.stop();
    controls.current = animate(alertness, 0, { duration: 7.5, ease: 'linear' });
  }, [alertness]);

  useEffect(() => {
    startDrain();
    return () => controls.current?.stop();
  }, [startDrain]);

  const splash = () => {
    controls.current?.stop();
    const curr = alertness.get();
    // Beating effect: Blinks between blurry and sharp to simulate jerking awake
    controls.current = animate(alertness, [curr, Math.max(curr, 40), 15, 80, 40, 100], {
      duration: 1.8,
      ease: 'easeInOut',
      onComplete: startDrain,
    });
  };

  return (
    <div ref={ref} className="relative min-h-screen bg-night text-moon overflow-hidden">
      {/* Slow-drifting ambience */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute -top-40 -left-32 w-[70vw] h-[70vw] max-w-[720px] max-h-[720px] rounded-full blur-3xl animate-breathe"
          style={{ background: 'radial-gradient(circle, rgba(169,155,232,0.22), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-52 -right-24 w-[60vw] h-[60vw] max-w-[620px] max-h-[620px] rounded-full blur-3xl animate-breathe"
          style={{
            background: 'radial-gradient(circle, rgba(110,99,168,0.25), transparent 70%)',
            animationDelay: '3s',
          }}
        />
        {/* Floating Zzs in the background always */}
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute font-serif italic text-lavender/10 animate-zfloat"
            style={{
              fontSize: `${Math.random() * 3 + 2}rem`,
              left: `${15 + Math.random() * 70}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 6}s`,
            }}
          >
            Z
          </span>
        ))}
      </div>

      {/* Drowsiness wash — thickens over time */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 bg-night"
        style={{ opacity: haze }}
      />

      {/* Alertness HUD */}
      <div className="fixed top-4 right-4 md:top-6 md:right-6 z-40 flex items-center gap-3 rounded-full bg-night-deep/80 backdrop-blur-md border border-moon/10 px-4 py-2 shadow-[0_0_15px_rgba(169,155,232,0.15)]">
        <span className="relative w-4 h-4 rounded-full overflow-hidden bg-moon/20 shrink-0">
          <motion.span className="absolute inset-x-0 bottom-0 bg-lavender" style={{ height: moonFill }} />
        </span>
        <span className="font-soft text-[9px] tracking-[0.25em] uppercase text-moon/50">
          Dishita's Alertness
        </span>
        <motion.span className="font-soft text-[11px] tabular-nums text-lavender w-9 text-right">
          {alertnessText}
        </motion.span>
      </div>

      <motion.div 
        className="relative z-20 px-6 md:px-12 py-16 md:py-24 max-w-4xl mx-auto"
        style={{ filter: pageBlur, opacity: contentOpacity }}
      >
        <BackLink className="inline-flex items-center gap-2 font-soft text-[10px] tracking-[0.3em] uppercase text-moon/40 hover:text-lavender transition-colors mb-20">
          &larr; Back
        </BackLink>

        <header className="mb-24 md:mb-32 relative">
          <motion.div 
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: -15, scale: 1 }}
            transition={{ type: 'spring', delay: 0.5, bounce: 0.6 }}
            className="absolute -top-12 left-10 md:left-24 z-10 bg-lavender text-night px-4 py-2 rounded-xl shadow-lg border border-lavender-light max-w-[200px]"
          >
            <p className="font-soft text-[10px] leading-tight font-medium">
              kitna bhi baddie ban jao, rahogi to baby face+aunty vibes wali hi😝
            </p>
          </motion.div>

          <p className="font-soft text-[10px] tracking-[0.4em] uppercase text-moon/35 mb-6">
            Case File 02 &middot; Sleep Laboratory &middot; Observed, not consented
          </p>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] italic mb-8 inline-block animate-nod-off origin-bottom-left">
            The Sleep Queen
          </h1>
          <p className="font-soft text-lg md:text-xl leading-relaxed text-moon/60 max-w-xl">
            Everyone calls her a slay queen. The data disagrees. Across nineteen years and an
            unknown number of open textbooks, the subject has demonstrated one consistent,
            world-class, genuinely elite ability: going to sleep the instant she sits down to
            study.
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 md:gap-6 mb-24 md:mb-32">
          {STATS.map((s, i) => (
            <motion.div 
              key={s.l} 
              className="clay p-5 md:p-7 relative overflow-hidden"
              whileHover={{ scale: 0.96, rotate: i % 2 === 0 ? 2 : -2, transition: { type: 'spring', stiffness: 300, damping: 12 } }}
            >
              {i === 1 && (
                <div className="absolute top-4 right-4 md:top-6 md:right-6 text-moon/30 animate-brain-spin" title="Processing...">
                  ⚙️
                </div>
              )}
              <p className="font-soft text-3xl md:text-5xl font-light text-lavender leading-none tabular-nums">
                {s.v}
              </p>
              <p className="font-soft text-[11px] md:text-xs uppercase tracking-[0.2em] text-moon/60 mt-3">
                {s.l}
              </p>
              <p className="font-soft text-[10px] text-moon/30 mt-1.5 leading-snug">{s.s}</p>
            </motion.div>
          ))}
        </section>

        <div className="mb-24 md:mb-32">
          <Hypnogram />
        </div>

        {/* The session, minute by minute */}
        <section className="mb-24 md:mb-32">
          <h2 className="font-serif text-3xl md:text-4xl italic mb-3">The three-hour break</h2>
          <p className="font-soft text-sm text-moon/45 mb-12">
            One session, reconstructed from testimony and one very open book.
          </p>

          <ol className="relative border-l border-moon/15 pl-8 md:pl-12 space-y-10">
            {TIMELINE.map((t, i) => (
              <motion.li
                key={t.time}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.06 }}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[2.55rem] md:-left-[3.8rem] top-1.5 w-3 h-3 rounded-full bg-lavender shadow-[0_0_14px_rgba(169,155,232,0.7)]"
                />
                <p className="font-soft text-[11px] tracking-[0.25em] uppercase text-lavender tabular-nums">
                  {t.time}
                </p>
                <p className="font-serif text-xl md:text-2xl italic text-moon mt-1.5">{t.label}</p>
                <p className="font-soft text-sm text-moon/45 mt-1.5 leading-relaxed">{t.note}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="mb-24 md:mb-32">
          <h2 className="font-serif text-3xl md:text-4xl italic mb-3">The alarm</h2>
          <p className="font-soft text-sm text-moon/45 mb-10">
            There is no dismiss button. There has never been a dismiss button.
          </p>
          <SnoozeAlarm />
        </section>

        <section className="mb-24 md:mb-32">
          <h2 className="font-serif text-3xl md:text-4xl italic mb-3">Certification</h2>
          <p className="font-soft text-sm text-moon/45 mb-10">
            Issued at birth. Tap the card to read the privileges.
          </p>
          <AuntyCard />
        </section>

        <section className="clay p-8 md:p-12 mb-20">
          <p className="font-soft text-[10px] tracking-[0.3em] uppercase text-moon/35 mb-6">
            Finding
          </p>
          <p className="font-serif text-2xl md:text-4xl italic leading-snug mb-6">
            She is not a slay queen. She is a sleep queen, and honestly, at this level, it is
            the more impressive title.
          </p>
          <p className="font-soft text-base leading-relaxed text-moon/50">
            Anyone can slay. Very few people can fall asleep sitting upright, in the afternoon,
            with a pen still in their hand, and then argue about it. Nineteen years undefeated.
            Sleep well tonight, Aunty. You have had the practice.
          </p>
        </section>

        <footer className="flex flex-wrap gap-x-8 gap-y-3 font-soft text-[10px] uppercase tracking-[0.3em] text-moon/35 mt-10">
          <BackLink className="hover:text-lavender transition-colors">&larr; Back</BackLink>
          <Link to="/findings" className="hover:text-lavender transition-colors">
            Case file 01
          </Link>
          <Link to="/" className="hover:text-lavender transition-colors">
            The issue
          </Link>
        </footer>
      </motion.div>

      {/* Escape mechanism: Splash Water button */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50">
        <motion.button
          onClick={splash}
          whileTap={{ scale: 0.9 }}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full shadow-xl transition-all duration-300 bg-lavender text-night font-bold hover:shadow-[0_0_30px_rgba(169,155,232,0.5)]"
        >
          <span className="text-lg leading-none">☕</span>
          <span className="font-soft text-xs tracking-wider uppercase">
            Splash Water
          </span>
        </motion.button>
      </div>

      {/* The page falls asleep on you. */}
      <AnimatePresence>
        {asleep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            onClick={wake}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night/85 backdrop-blur-lg cursor-pointer px-8 text-center"
          >
            <div className="relative mb-10" aria-hidden="true">
              {['z', 'z', 'z'].map((z, i) => (
                <span
                  key={i}
                  className="absolute font-serif italic text-lavender animate-zfloat"
                  style={{
                    fontSize: `${1.4 + i * 0.6}rem`,
                    left: i * 14,
                    animationDelay: `${i * 1.1}s`,
                  }}
                >
                  {z}
                </span>
              ))}
              <span className="block w-16 h-16" />
            </div>

            <p className="font-serif text-2xl md:text-4xl italic text-moon/80 max-w-lg leading-snug">
              {dozed > 1
                ? 'Again. The page literally cannot stay awake.'
                : 'The page waited 12 seconds. Then it gave up and fell asleep.'}
            </p>
            <p className="font-soft text-sm text-moon/40 mt-6">
              {dozed > 2
                ? 'At this point it is just mocking you.'
                : 'Exactly like you do to your syllabus. Move the mouse to wake it up.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
