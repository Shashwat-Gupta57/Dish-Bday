import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { EGGS } from '../lib/eggs';
import { useEggs } from '../lib/EggContext';

/**
 * The hunt, made legible.
 *
 * Nine gags scattered across a page are nine gags. The same nine with a counter
 * and an empty slot for each one is a game — she can see there is more, and see
 * how much more.
 */
export default function StampCard() {
  const { isFound, foundCount, total, complete } = useEggs();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Stamp card: ${foundCount} of ${total} found`}
        className="fixed bottom-5 left-5 z-[300] flex items-center gap-3 bg-editorial-cream/85 backdrop-blur-md border border-editorial-black/15 px-4 py-2.5 shadow-lg hover:border-editorial-accent transition-colors group"
      >
        <span className="flex gap-1" aria-hidden="true">
          {EGGS.map((e) => (
            <span
              key={e.id}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                isFound(e.id) ? 'bg-editorial-accent' : 'bg-editorial-black/15'
              }`}
            />
          ))}
        </span>
        <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-editorial-black/60 group-hover:text-editorial-black transition-colors">
          {String(foundCount).padStart(2, '0')} / {String(total).padStart(2, '0')} Found
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[310] bg-editorial-black/85 backdrop-blur-sm flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Stamp card"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-editorial-cream w-full max-w-3xl my-auto p-6 md:p-12 border border-editorial-black/20 shadow-2xl"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close stamp card"
                className="absolute top-5 right-5 text-editorial-black/40 hover:text-editorial-accent transition-colors"
              >
                <X size={22} strokeWidth={1} />
              </button>

              <header className="mb-10 md:mb-14">
                <p className="text-[10px] tracking-[0.4em] uppercase text-editorial-black/40 mb-3">
                  Vol. 1 &mdash; Field Record
                </p>
                <h2 className="font-serif text-4xl md:text-5xl italic">The Stamp Card</h2>
                <p className="font-sans text-sm text-editorial-black/60 mt-4 max-w-lg leading-relaxed">
                  {complete
                    ? 'Every one of them. The Decoder is unlocked at the foot of the page \u2014 it will tell you what each one meant.'
                    : `${total} things are hidden in this issue. The empty ones come with a clue and nothing more.`}
                </p>
              </header>

              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                {EGGS.map((egg) => {
                  const found = isFound(egg.id);
                  return (
                    <li key={egg.id} className="flex gap-4 items-start">
                      <span
                        aria-hidden="true"
                        className={`shrink-0 mt-0.5 w-11 h-11 rounded-full flex items-center justify-center font-serif text-xs transition-all duration-500 ${
                          found
                            ? 'bg-editorial-accent text-editorial-cream shadow-md'
                            : 'border border-dashed border-editorial-black/25 text-editorial-black/25'
                        }`}
                        style={found ? { transform: 'rotate(-7deg)' } : undefined}
                      >
                        {egg.n}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`font-serif text-lg leading-tight ${
                            found ? 'text-editorial-black' : 'text-editorial-black/35'
                          }`}
                        >
                          {found ? egg.title : 'Not yet found'}
                        </p>
                        <p className="font-sans text-xs leading-relaxed text-editorial-black/55 mt-1.5 italic">
                          {found ? 'Stamped.' : egg.riddle}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <footer className="mt-12 pt-6 border-t border-editorial-black/10 flex flex-wrap gap-x-8 gap-y-2 justify-between items-center">
                <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-editorial-black/35">
                  Progress saves itself
                </p>
                <Link
                  to="/legal"
                  className="font-sans text-[10px] tracking-[0.25em] uppercase text-editorial-black/35 hover:text-editorial-accent transition-colors"
                >
                  &deg; Terms &amp; conditions apply
                </Link>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
