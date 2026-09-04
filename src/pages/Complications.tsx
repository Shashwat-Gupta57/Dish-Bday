import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Play } from 'lucide-react';
import { useEggs } from '../lib/EggContext';
import { useAmbientAudio } from '../lib/useAmbientAudio';
import BackLink from '../components/BackLink';

/** Drop the track here and it plays. Nothing else needs changing. */
const TRACK = '/audio/pal-pal.mp3';

interface Sent {
  id: number;
  text: string;
}

export default function Complications() {
  const { find } = useEggs();
  const { state, toggle } = useAmbientAudio(TRACK);

  const [draft, setDraft] = useState('');
  const [sent, setSent] = useState<Sent[]>([]);
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);
  const threadEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    find('complication');
  }, [find]);

  // Every pending timer is tracked so leaving the page kills all of them.
  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    },
    [],
  );

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setSent((s) => [...s, { id: Date.now(), text }]);
    setDraft('');

    // The cruellest part of the whole site: it starts typing back, and then
    // it doesn't.
    timers.current.push(
      window.setTimeout(() => setTyping(true), 1800),
      window.setTimeout(() => setTyping(false), 5200),
    );
  };

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [sent, typing]);

  return (
    <div className="min-h-screen bg-editorial-black text-editorial-cream px-6 md:px-16 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-20 md:mb-28">
          <BackLink
            to="/legal"
            className="inline-flex items-center gap-2 text-editorial-cream/40 hover:text-editorial-accent transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="font-sans uppercase tracking-widest text-xs">Back</span>
          </BackLink>

          {state !== 'missing' && (
            <button
              onClick={toggle}
              aria-label={state === 'playing' ? 'Pause the music' : 'Play the music'}
              className="inline-flex items-center gap-3 text-editorial-cream/40 hover:text-editorial-accent transition-colors"
            >
              <span className="font-sans uppercase tracking-widest text-[10px]">
                {state === 'playing' ? 'Pal Pal' : state === 'blocked' ? 'Press play' : 'Paused'}
              </span>
              {state === 'playing' ? (
                <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-[2px] bg-editorial-accent"
                      animate={{ height: ['20%', '100%', '35%', '80%', '20%'] }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.22, ease: 'easeInOut' }}
                    />
                  ))}
                </span>
              ) : state === 'blocked' ? (
                <Play size={14} />
              ) : (
                <VolumeX size={14} />
              )}
            </button>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="font-serif text-3xl md:text-4xl italic text-editorial-cream/50 mb-6"
        >
          Haha.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="font-serif text-3xl md:text-4xl italic text-editorial-cream/70 mb-14"
        >
          You wanna know something complicated?
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 2.4 }}
          className="font-serif text-5xl md:text-7xl italic leading-none text-editorial-accent mb-20 md:mb-28"
        >
          Hyderabadi yaad hai?
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 4 }}
        >
          <div className="w-16 h-[1px] bg-editorial-cream/20 mb-14" />

          <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-editorial-cream/35 mb-3">
            Drafts
          </p>
          <p className="font-sans text-base leading-relaxed text-editorial-cream/55 mb-10">
            Everything you never sent him is still sitting in here somewhere. Go on. Send one
            now. See what happens.
          </p>

          {/* The thread. Nothing leaves this page and nothing is stored. */}
          <div className="border border-editorial-cream/10 bg-editorial-cream/[0.03] p-5 md:p-7">
            <div className="min-h-[140px] max-h-[45vh] overflow-y-auto flex flex-col gap-4 pr-1" data-lenis-prevent>
              {sent.length === 0 && (
                <p className="font-sans text-sm text-editorial-cream/25 italic my-auto text-center py-10">
                  Nothing sent yet. Historically accurate.
                </p>
              )}

              {sent.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="self-end max-w-[85%]"
                >
                  <div className="bg-editorial-cream text-editorial-black px-4 py-2.5 font-sans text-sm leading-relaxed rounded-sm">
                    {m.text}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-1.5">
                    <span className="font-sans text-[9px] tracking-widest uppercase text-editorial-cream/25">
                      Sent
                    </span>
                    {/* One tick. It never gets a second one. */}
                    <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
                      <path
                        d="M1 4.2 L4 7 L11 1"
                        fill="none"
                        stroke="rgba(249,248,246,0.3)"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="self-start"
                  >
                    <div className="bg-editorial-cream/10 px-4 py-3 rounded-sm flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-editorial-cream/40"
                          animate={{ opacity: [0.25, 1, 0.25] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <p className="font-sans text-[9px] tracking-widest uppercase text-editorial-cream/25 mt-1.5">
                      Typing&hellip;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={threadEnd} />
            </div>

            <div className="flex gap-3 mt-6 pt-5 border-t border-editorial-cream/10">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Type something you never sent&hellip;"
                aria-label="Type something you never sent"
                className="flex-1 min-w-0 bg-transparent border-b border-editorial-cream/15 focus:border-editorial-accent outline-none font-sans text-sm py-2 placeholder:text-editorial-cream/25 transition-colors"
              />
              <button
                onClick={send}
                className="font-sans text-[10px] tracking-[0.3em] uppercase text-editorial-cream/50 hover:text-editorial-accent transition-colors shrink-0"
              >
                Send
              </button>
            </div>

            <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-editorial-cream/25 mt-5">
              {sent.length} sent &middot; 0 delivered
            </p>
          </div>

          <AnimatePresence>
            {sent.length >= 3 && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6 }}
                className="font-serif text-xl md:text-2xl italic text-editorial-cream/45 mt-12 leading-relaxed"
              >
                Three of them. Same as last time. The tick is never going to turn, Aunty.
              </motion.p>
            )}
          </AnimatePresence>

          {/* ---- The warm turn. Delete this whole block if you want it to just
                  end on the joke. ---- */}
          <div className="mt-24 pt-12 border-t border-editorial-cream/10">
            <p className="font-serif text-2xl md:text-3xl italic leading-snug text-editorial-cream/80 mb-6">
              Anyway. He had no idea what he was looking at.
            </p>
            <p className="font-sans text-base leading-relaxed text-editorial-cream/50 mb-14">
              Twenty-six photographs, a fake legal department and an entire statistical study
              on this website say otherwise. Happy birthday. Go eat something.
            </p>

            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <BackLink className="font-sans text-[10px] uppercase tracking-[0.3em] text-editorial-cream/40 hover:text-editorial-accent transition-colors">
                &larr; Back to the issue
              </BackLink>
              <Link
                to="/findings"
                className="font-sans text-[10px] uppercase tracking-[0.3em] text-editorial-cream/40 hover:text-editorial-accent transition-colors"
              >
                The findings
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {state === 'missing' && (
        <p className="fixed bottom-5 right-5 font-sans text-[9px] tracking-widest uppercase text-editorial-cream/20 flex items-center gap-2">
          <Volume2 size={11} /> no track at {TRACK}
        </p>
      )}
    </div>
  );
}
