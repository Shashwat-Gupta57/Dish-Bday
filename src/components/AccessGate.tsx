import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  LEN_ONE, LEN_TWO, QUESTION, HINT, verifyOne, verifyTwo, remember, reveal,
} from '../lib/access';

/**
 * The threshold. Two stages.
 *
 * Deliberately says nothing about what is behind it — no name, no date, no hint
 * that this is a gift or a birthday. A cold private-archive terminal, so a
 * stray visitor or a shoulder-surfer learns nothing from the lock screen. The
 * second stage is the one that proves it is actually her.
 */

const DENIED = ['NOT RECOGNISED', 'INCORRECT', 'ACCESS DENIED', 'NO MATCH ON FILE', 'TRY AGAIN'];

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function AccessGate({ onOpen }: { onOpen: () => void }) {
  const [stage, setStage] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);

  const len = stage === 1 ? LEN_ONE : LEN_TWO;

  const fail = useCallback(() => {
    setErr(DENIED[Math.min(tries, DENIED.length - 1)]);
    setTries((t) => t + 1);
    setCode('');
    setBusy(false);
    window.setTimeout(() => setErr(null), 2200);
  }, [tries]);

  const submit = useCallback(
    (value: string) => {
      if (busy) return;
      setBusy(true);
      // A beat of "checking" — it also throttles rapid guessing a little.
      window.setTimeout(() => {
        if (stage === 1) {
          if (verifyOne(value)) {
            setStage(2);
            setCode('');
            setTries(0);
            setBusy(false);
          } else fail();
        } else if (verifyTwo(value)) {
          remember();
          reveal();
          setOpened(true);
          window.setTimeout(onOpen, 4200);
        } else fail();
      }, 420);
    },
    [busy, stage, fail, onOpen],
  );

  const push = useCallback(
    (ch: string) => {
      if (busy || opened) return;
      setErr(null);
      setCode((c) => {
        const next = (c + ch).slice(0, len);
        if (next.length === len) submit(next);
        return next;
      });
    },
    [busy, opened, len, submit],
  );

  const back = useCallback(() => {
    if (busy || opened) return;
    setCode((c) => c.slice(0, -1));
  }, [busy, opened]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (opened || busy) return;
      if (stage === 1) {
        if (/^[0-9]$/.test(e.key)) push(e.key);
      } else if (/^[a-zA-Z]$/.test(e.key)) push(e.key.toUpperCase());
      else if (e.key === ' ') { e.preventDefault(); push(' '); }
      if (e.key === 'Backspace') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const keyCls =
    'font-mono text-white/70 border border-white/10 hover:border-white/35 hover:text-white active:bg-white/10 transition-colors select-none';

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#08080B] px-4 overflow-y-auto py-8">
      {/* One soft light source, nothing else. The scanlines read as a CRT and
          this screen is meant to look like a plain locked page. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div
          className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[120vw] aspect-square rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(120,130,160,0.09), transparent 62%)' }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!opened && (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-full ${stage === 1 ? 'max-w-sm' : 'max-w-lg'}`}
          >
            <div className="border border-white/12 bg-white/[0.02] backdrop-blur-sm px-6 py-8 md:px-9 md:py-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/35">
                    Private archive
                  </p>
                </div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-white/20">
                  {stage}/2
                </p>
              </div>

              {stage === 1 ? (
                <>
                  <h1 className="font-mono text-sm tracking-[0.18em] uppercase text-white/80 mb-2.5">
                    Authorisation required
                  </h1>
                  <p className="font-mono text-[10px] leading-relaxed text-white/30 mb-8">
                    This resource is not public. Enter the {LEN_ONE}-digit key to continue.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/30 mb-3">
                    Second factor &mdash; identity
                  </p>
                  <h1 className="font-mono text-sm md:text-base tracking-[0.06em] text-white/85 mb-2.5">
                    {QUESTION}
                  </h1>
                  <p className="font-mono text-[10px] leading-relaxed text-white/30 mb-8">
                    {HINT}
                  </p>
                </>
              )}

              {/* The slots */}
              <motion.div
                animate={err ? { x: [0, -9, 8, -6, 4, 0] } : { x: 0 }}
                transition={{ duration: 0.42 }}
                className="flex justify-center gap-1.5 mb-6"
              >
                {Array.from({ length: len }).map((_, i) => {
                  const ch = code[i];
                  const filled = i < code.length;
                  const active = i === code.length && !busy;
                  const isSpace = ch === ' ';
                  return (
                    <span
                      key={i}
                      className={`flex-1 max-w-[52px] h-12 flex items-center justify-center font-mono text-base border transition-colors duration-200 ${
                        err
                          ? 'border-[#8C3B44] text-[#8C3B44]'
                          : filled
                            ? 'border-white/45 text-white/85'
                            : active
                              ? 'border-white/35'
                              : 'border-white/10'
                      }`}
                    >
                      {filled
                        ? stage === 1
                          ? '•'
                          : isSpace
                            ? <span className="text-white/25 text-xs">␣</span>
                            : ch
                        : active
                          ? <span className="animate-pulse text-white/40">|</span>
                          : ''}
                    </span>
                  );
                })}
              </motion.div>

              <div className="h-5 mb-5 text-center">
                <AnimatePresence mode="wait">
                  {err ? (
                    <motion.p
                      key={err + tries}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#A84A54]"
                    >
                      {err}
                    </motion.p>
                  ) : busy ? (
                    <motion.p
                      key="busy"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/35"
                    >
                      Verifying&hellip;
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>

              {stage === 1 ? (
                <div className="grid grid-cols-3 gap-1.5">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                    <button key={d} onClick={() => push(d)} className={`h-12 text-sm ${keyCls}`}>
                      {d}
                    </button>
                  ))}
                  <span />
                  <button onClick={() => push('0')} className={`h-12 text-sm ${keyCls}`}>0</button>
                  <button onClick={back} aria-label="Delete" className={`h-12 text-xs ${keyCls}`}>⌫</button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {ROWS.map((row, r) => (
                    <div key={r} className="flex justify-center gap-1.5">
                      {row.map((k) => (
                        <button
                          key={k}
                          onClick={() => push(k)}
                          className={`flex-1 max-w-[42px] h-11 text-xs ${keyCls}`}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  ))}
                  <div className="flex justify-center gap-1.5 pt-0.5">
                    <button
                      onClick={() => push(' ')}
                      className={`flex-[3] h-11 text-[10px] tracking-[0.3em] uppercase ${keyCls}`}
                    >
                      space
                    </button>
                    <button onClick={back} aria-label="Delete" className={`flex-1 h-11 text-xs ${keyCls}`}>
                      ⌫
                    </button>
                  </div>
                </div>
              )}

              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/15 mt-7 text-center">
                {tries > 2
                  ? 'Ask whoever sent you the link.'
                  : stage === 2
                    ? 'Only one person can answer this'
                    : 'Access is logged'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Granted */}
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center"
          >
            <div className="text-center px-6">
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.6em' }}
                animate={{ opacity: 1, letterSpacing: '0.3em' }}
                transition={{ duration: 0.9 }}
                className="font-mono text-[11px] uppercase text-white/70"
              >
                Access granted
              </motion.p>

              {/* The point of the second lock, said out loud. */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="font-mono text-[11px] leading-relaxed text-white/45 mt-8 max-w-sm mx-auto"
              >
                See? Told you.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.3, duration: 0.8 }}
                className="font-mono text-[11px] leading-relaxed text-white/45 mt-2 max-w-sm mx-auto"
              >
                I discarded your friend as my first crush ages ago.
                She ain&rsquo;t my first crush. Hehe.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
