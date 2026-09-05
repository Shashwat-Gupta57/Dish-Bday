import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useEggs } from '../lib/EggContext';
import BackLink from '../components/BackLink';
import { useNavigate } from 'react-router-dom';
import RunnerGame from '../components/game/RunnerGame';

/**
 * /arcade — the distraction.
 *
 * Reached from the softest page on the site, so it deliberately breaks the mood:
 * CRT green on near-black, pixel type, scanlines. Nothing here is about anyone
 * but her, and nothing here is sad.
 */

const HOW = [
  { k: 'SPACE', v: 'JUMP. TWICE FOR DOUBLE.' },
  { k: 'X', v: 'FIRE THE PERIODIC TABLE. -3 EGO.' },
  { k: 'Z', v: 'EYE LASER. -15 EGO. LONG COOLDOWN.' },
  { k: 'ON PHONE', v: 'LEFT HALF JUMPS, RIGHT HALF FIRES. LASER HAS ITS OWN BUTTON.' },
  { k: '📚', v: 'THE SYLLABUS. -15 HP. -20 IF STACKED.' },
  { k: '🍛', v: 'FULKI. +5 SCORE AND +6 HP. FOOD HEALS.' },
  { k: 'z', v: 'SLEEP. -22 HP. THE WORST ONE.' },
];

const BOSS = [
  { k: '📄 NOTES', v: '400+ PAGES, FIRED IN A VOLLEY. JUMP OR BE BURIED.' },
  { k: '📝 TEST', v: 'A SURPRISE TEST, MID-EXAM-SEASON. FAST. LOW. RUTHLESS.' },
  { k: '❓ QUESTIONS', v: '"SCHOOL MEIN KYA KARTI HO?" IT WEAVES. IT WILL NOT STOP.' },
  { k: '☠ LECTURE', v: 'THE 6-HOUR LECTURE. FLOODS THE FLOOR FOR 1.3s. IT ONLY HURTS ON THE GROUND — JUMP, AND DOUBLE JUMP IF YOU HAVE TO. YOU GET A FULL 1.4s WARNING WITH A COUNTDOWN. -7 HP PER TICK IF YOU STAND IN IT, WHICH IS SURVIVABLE, BUT DO NOT.' },
];

export default function Arcade() {
  const { find } = useEggs();
  const navigate = useNavigate();

  useEffect(() => {
    find('arcade');
  }, [find]);

  return (
    <div className="min-h-screen bg-crt text-neon px-5 md:px-10 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-14">
          <BackLink className="font-pixel text-[9px] text-neon/50 hover:text-neon transition-colors">
            &larr; BACK
          </BackLink>
          {/* Egg 16 — the coin slot goes somewhere. */}
          <button
            onClick={() => {
              find('stars');
              navigate('/stars');
            }}
            className="group relative font-pixel text-[9px] text-neon/25 hover:text-hot focus-visible:text-hot transition-colors"
          >
            INSERT COIN
            <span className="absolute -bottom-5 right-0 text-[7px] tracking-widest text-hot opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              ✦ IT TAKES SOMETHING ELSE
            </span>
          </button>
        </div>

        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="font-pixel text-xl sm:text-3xl md:text-5xl leading-[1.4] mb-6 animate-flicker">
            AUNTY
            <br />
            <span className="text-hot">RUN</span>
          </h1>
          <p className="font-pixel text-[8px] md:text-[9px] text-neon/45 leading-relaxed max-w-md mx-auto">
            DIHHITA CANNOT OUTRUN THE SYLLABUS FOREVER.
            <br />
            BUT SHE CAN SHOOT AT IT.
            <br />
            <br />
            <span className="text-hot">SURVIVE 15 SECONDS. THEN HE ARRIVES.</span>
          </p>
        </motion.header>

        <RunnerGame />

        <section className="mt-16 border-2 border-neon/25 p-5 md:p-7">
          <h2 className="font-pixel text-[10px] text-hot mb-6">// HOW TO PLAY</h2>
          <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-4">
            {HOW.map((h) => (
              <div key={h.k} className="flex items-baseline gap-4 border-b border-neon/10 pb-3">
                <dt className="font-pixel text-[9px] text-neon shrink-0 w-24">{h.k}</dt>
                <dd className="font-pixel text-[8px] text-neon/50 leading-relaxed">{h.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 border-2 border-hot/50 p-5 md:p-7">
          <h2 className="font-pixel text-[10px] text-hot mb-3">// FINAL BOSS: PUSHPENDRA SIR</h2>
          <p className="font-pixel text-[8px] text-neon/45 leading-[2] mb-6">
            SELF-DECLARED BEST CHEMISTRY TEACHER IN THE COUNTRY.
            <br />
            EVIDENCE FOR THIS CLAIM: NONE ON FILE.
            <br />
            <br />
            HE ARRIVES FOUR SECONDS AFTER HE IS ANNOUNCED, BECAUSE OF COURSE HE DOES.
            <br />
            HIS HEALTH BAR IS LABELLED EGO. THAT IS NOT A JOKE, THAT IS JUST WHAT IT IS.
            <br />
            <br />
            <span className="text-hot">NOTHING KILLS IN ONE HIT ANY MORE.</span> YOU HAVE 100 HP.
            EVERYTHING CHIPS. FULKI HEALS. THE EYE LASER TAKES A SIXTH OF HIM PER SHOT.
          </p>
          <dl className="space-y-4">
            {BOSS.map((b) => (
              <div key={b.k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-hot/15 pb-3">
                <dt className="font-pixel text-[9px] text-hot shrink-0 w-32">{b.k}</dt>
                <dd className="font-pixel text-[8px] text-neon/50 leading-relaxed">{b.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 border-2 border-neon/25 p-5 md:p-7">
          <h2 className="font-pixel text-[10px] text-hot mb-5">// A NOTE FROM THE DEVELOPER</h2>
          <p className="font-pixel text-[8px] md:text-[9px] text-neon/50 leading-[2]">
            THE SPRITE IS DIHHITA. THE OBSTACLES ARE BOOKS. THE POWER-UP IS FULKI. THE AMMUNITION
            IS THE PERIODIC TABLE, WHICH HE MADE US MEMORISE ANYWAY, SO IT MAY AS WELL BE USEFUL.
            THE INSTANT-LOSS CONDITION IS FALLING ASLEEP.
            <br />
            <br />
            I DID NOT HAVE TO THINK VERY HARD ABOUT ANY OF THIS.
          </p>
        </section>

        <footer className="mt-14 flex flex-wrap gap-x-8 gap-y-3 font-pixel text-[8px] text-neon/30">
          <BackLink className="hover:text-neon transition-colors">&larr; BACK</BackLink>
          <Link to="/findings" className="hover:text-neon transition-colors">CASE FILE 01</Link>
          <Link to="/sleep" className="hover:text-neon transition-colors">CASE FILE 02</Link>
          <Link to="/please" className="hover:text-neon transition-colors">THE ASK</Link>
          <Link to="/" className="hover:text-neon transition-colors">THE ISSUE</Link>
        </footer>
      </div>
    </div>
  );
}
