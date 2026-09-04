import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EGGS, NOTES } from '../lib/eggs';
import { Annotation } from '../lib/EditorsCut';
import { useEggs } from '../lib/EggContext';

/**
 * The reward, not the spoiler.
 *
 * The Stamp Card gives riddles while things are unfound; this gives the answers
 * and the reasons. Nothing here hard-codes a position any more — it reads the
 * same egg list the card does, so the copy can't drift out of sync with the site
 * again the way the old "next to the fine vertical line" line did.
 */
export default function Decoder() {
  const { isFound, foundCount, total } = useEggs();

  return (
    <section className="relative w-full bg-editorial-black text-editorial-cream overflow-hidden">
      <div className="w-full border-t border-editorial-accent/30 py-8 flex flex-col items-center justify-center bg-editorial-black/95 backdrop-blur-md z-20 relative shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="text-editorial-accent mb-4 motion-reduce:hidden"
        >
          <ChevronDown size={32} strokeWidth={1} />
        </motion.div>
        <p className="font-serif italic text-xl md:text-2xl text-center px-6">
          &ldquo;I know you ain&rsquo;t as smart as me &#129370; so...&rdquo;
        </p>
      </div>

      <div className="max-w-4xl mx-auto py-24 px-6 md:px-12 relative z-10">
        <header className="text-center mb-20">
          <h2 className="text-sm tracking-[0.4em] uppercase text-editorial-cream/50 mb-4">
            The Decoder
          </h2>
          <p className="font-serif text-3xl md:text-5xl italic">
            Everything you were supposed to find.
          </p>
          <p className="font-sans text-sm text-editorial-cream/50 mt-6 tracking-[0.2em] uppercase">
            {String(foundCount).padStart(2, '0')} of {String(total).padStart(2, '0')} stamped
          </p>
        </header>

        <div className="space-y-14">
          {EGGS.map((egg) => {
            const found = isFound(egg.id);
            return (
              <div
                key={egg.id}
                className={`group border-l pl-8 transition-colors duration-500 ${
                  found
                    ? 'border-editorial-accent/60'
                    : 'border-editorial-cream/15 hover:border-editorial-accent'
                }`}
              >
                <div className="flex items-baseline gap-4 mb-4 flex-wrap">
                  <h3 className="font-serif text-2xl md:text-3xl text-editorial-accent">
                    {egg.n}. {egg.title}
                  </h3>
                  <span
                    className={`font-sans text-[10px] tracking-[0.3em] uppercase ${
                      found ? 'text-editorial-accent' : 'text-editorial-cream/30'
                    }`}
                  >
                    {found ? '⬤ Stamped' : 'Still out there'}
                  </span>
                </div>
                <p className="font-sans text-lg text-editorial-cream/80 leading-relaxed">
                  {egg.answer}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-24 pt-16 border-t border-editorial-cream/10">
          <h3 className="text-sm tracking-[0.4em] uppercase text-editorial-cream/40 mb-12 text-center">
            And the reasons
          </h3>
          <div className="space-y-12">
            {NOTES.map((note) => (
              <div key={note.n} className="border-l border-editorial-cream/20 pl-8">
                <h4 className="font-serif text-xl md:text-2xl text-editorial-cream mb-3">
                  {note.title}
                </h4>
                <p className="font-sans text-lg text-editorial-cream/70 leading-relaxed">
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-28 text-center pb-16">
          <p className="font-serif text-2xl md:text-3xl italic text-editorial-cream/50 mb-4">
            {foundCount === total
              ? 'Every last one. Insufferable, as expected.'
              : 'Now scroll back up and find the rest.'}
          </p>
          <p className="font-sans text-xs text-editorial-cream/30 tracking-[0.2em] uppercase mb-16">
            Triple-tap the cover title for the Editor&rsquo;s Cut
          </p>

          <div className="relative border-t border-editorial-cream/10 pt-8 flex justify-center">
            <Link
              to="/legal"
              className="text-xs uppercase tracking-[0.3em] text-editorial-cream/50 hover:text-editorial-accent transition-colors"
            >
              Privacy Policy &amp; Terms
            </Link>
            <Annotation
              note="Egg 09. Also linked from the foot of the Stamp Card, so the Terms page isn't only reachable from behind this gate."
              side="top"
              className="bottom-0 left-1/2 -translate-x-1/2 w-56 h-6"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
