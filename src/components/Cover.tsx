import { motion, useScroll } from 'motion/react';
import { useRef } from 'react';
import { Coffee } from 'lucide-react';
import { toast } from 'sonner';
import { usePlaneY } from '../lib/planes';
import { useTapHover } from '../lib/useTapHover';
import { useEggs } from '../lib/EggContext';
import { Annotation, useEditorsCut } from '../lib/EditorsCut';

export default function Cover() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Three planes, one set of speeds, no bespoke numbers.
  const back = usePlaneY(scrollYProgress, 'back', 420, true);
  const mid = usePlaneY(scrollYProgress, 'mid', 260);
  const front = usePlaneY(scrollYProgress, 'front', 420, true);

  const { find } = useEggs();
  const { tripleTap } = useEditorsCut();
  const date = useTapHover(() => find('forever'));

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-editorial-cream"
    >
      {/* BACK — atmosphere */}
      <motion.div
        style={{ y: back }}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0"
      >
        <h1 className="text-[15vw] leading-none tracking-tighter text-editorial-black/5 font-serif uppercase text-center mt-20">
          Dishita
        </h1>
      </motion.div>

      {/* MID — the photograph */}
      <motion.div
        style={{ y: mid }}
        className="relative z-10 w-[70vw] md:w-[35vw] h-[65vh] md:h-[75vh] mt-12 md:mt-20"
      >
        <div className="absolute inset-0 border border-editorial-black/20 translate-x-4 translate-y-4"></div>
        <img
          src="/photo-1.jpg"
          alt="Dishita, cover"
          className="w-full h-full object-cover object-top filter grayscale-0 hover:grayscale transition-all duration-1000"
        />

        <Annotation
          note="Square source in a 1:2 frame. Cropped from the top so the face survives."
          side="left"
          className="inset-0"
        />

        <div className="absolute -left-6 md:-left-16 top-12 md:top-24">
          <p className="text-xs md:text-sm tracking-[0.2em] uppercase rotate-[-90deg] origin-bottom-left text-editorial-black">
            The September Issue
          </p>
        </div>

        <div className="absolute -right-12 md:-right-24 bottom-12 md:bottom-24">
          <p className="text-xs md:text-sm tracking-widest uppercase text-editorial-black text-right max-w-[150px]">
            Nobody outshines her because nobody else is allowed in the frame.
          </p>
        </div>
      </motion.div>

      {/* FRONT — masthead */}
      <motion.div
        style={{ y: front }}
        className="absolute z-20 bottom-12 md:bottom-24 w-full flex flex-col items-center justify-center mix-blend-difference"
      >
        <h1
          {...tripleTap}
          title="Vol. 1"
          className="text-6xl md:text-8xl lg:text-9xl text-white font-serif uppercase tracking-tight text-center select-none cursor-default"
        >
          DISHITA
        </h1>
        <p
          {...date.bind}
          className="text-white/80 mt-2 uppercase tracking-[0.3em] text-xs md:text-sm font-sans cursor-pointer select-none"
        >
          Vol. 1 &mdash;{' '}
          {date.active ? (
            <span className="text-editorial-accent font-bold">FOREVER</span>
          ) : (
            <span>09.13</span>
          )}
        </p>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-20 mix-blend-difference motion-reduce:animate-none">
        <span className="text-white text-xs uppercase tracking-widest mb-2">Scroll to unveil</span>
        <div className="w-[1px] h-8 bg-white"></div>
      </div>

      <button
        onClick={() => {
          find('corner-cover');
          toast('Stress eating again? Stop blaming the coaching classes, Aunty.');
        }}
        aria-label="A hidden note"
        className="absolute bottom-12 right-12 text-editorial-black/10 hover:text-editorial-black/60 transition-colors z-50 cursor-pointer"
      >
        <Coffee size={16} />
      </button>
    </section>
  );
}
