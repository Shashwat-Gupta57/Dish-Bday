import { motion, useScroll } from 'motion/react';
import { useState, useRef } from 'react';
import { usePlaneY, usePlaneScale } from '../lib/planes';
import { useTapHover } from '../lib/useTapHover';
import { useEggs } from '../lib/EggContext';
import { Annotation } from '../lib/EditorsCut';

interface FlakeSpec {
  startX: number;
  driftX: number;
  size: number;
  duration: number;
  delay: number;
}

/** Thirteen of them. One for the thirteenth. */
function makeFlakes(): FlakeSpec[] {
  return Array.from({ length: 13 }).map(() => ({
    startX: Math.random() * 100,
    driftX: Math.random() * 20 - 10,
    size: Math.random() * 15 + 10,
    duration: Math.random() * 4 + 4,
    delay: Math.random() * 5,
  }));
}

function Flake({ spec }: { spec: FlakeSpec }) {
  return (
    <motion.div
      initial={{ y: -50, x: `${spec.startX}vw`, rotate: 0, opacity: 0 }}
      animate={{
        y: ['0vh', '100vh'],
        x: [`${spec.startX}vw`, `${spec.startX + spec.driftX}vw`],
        rotate: [0, 360],
        opacity: [0, 1, 1, 0],
      }}
      transition={{ duration: spec.duration, repeat: Infinity, delay: spec.delay, ease: 'linear' }}
      className="absolute top-0 z-0 bg-editorial-accent/60"
      style={{
        width: spec.size,
        height: spec.size * 1.5,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        filter: 'blur(1px)',
      }}
    />
  );
}

export default function Finale() {
  // Generated once. It used to run Math.random() during render, so every flake
  // teleported on each re-render and again on StrictMode's second pass.
  const [flakes] = useState<FlakeSpec[]>(makeFlakes);
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const back = usePlaneY(scrollYProgress, 'back', 500);
  const backFar = usePlaneY(scrollYProgress, 'back', 800, true);
  const scale = usePlaneScale(scrollYProgress, 'back', 0.6);

  const { find } = useEggs();
  const headline = useTapHover(() => find('ending'));
  const signoff = useTapHover(() => find('ending'));

  return (
    <section
      ref={ref}
      className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-editorial-cream"
    >
      {/* BACK — the collage wash */}
      <div className="absolute inset-0 z-0 opacity-10 md:opacity-20 pointer-events-none">
        <motion.div style={{ y: back, scale }} className="absolute top-[-10%] left-[-5%] w-[40vw] max-w-[400px]">
          <img src="/photo-22.jpg" alt="" loading="lazy" className="w-full h-full object-cover grayscale blur-[2px]" />
        </motion.div>
        <motion.div style={{ y: backFar, scale }} className="absolute bottom-[-10%] right-[-5%] w-[50vw] max-w-[500px]">
          <img src="/photo-23.jpg" alt="" loading="lazy" className="w-full h-full object-cover grayscale blur-[2px]" />
        </motion.div>
        <motion.div style={{ y: back, scale }} className="absolute top-[20%] right-[10%] w-[25vw] max-w-[300px]">
          <img src="/photo-24.jpg" alt="" loading="lazy" className="w-full h-full object-cover grayscale blur-[2px]" />
        </motion.div>
        <motion.div style={{ y: backFar, scale }} className="absolute bottom-[20%] left-[10%] w-[30vw] max-w-[350px]">
          <img src="/photo-25.jpg" alt="" loading="lazy" className="w-full h-full object-cover grayscale blur-[2px]" />
        </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 motion-reduce:hidden">
        {flakes.map((spec, i) => (
          <Flake key={i} spec={spec} />
        ))}
      </div>

      <div className="relative z-20 text-center max-w-3xl px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-xs md:text-sm tracking-[0.4em] uppercase text-editorial-black/70 mb-8 font-semibold bg-editorial-cream/50 inline-block px-4 py-1 backdrop-blur-sm rounded-full"
        >
          The Epilogue
        </motion.p>

        <motion.h2
          {...headline.bind}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative font-serif text-6xl md:text-8xl lg:text-[10rem] leading-none text-editorial-black mb-12 drop-shadow-2xl cursor-pointer select-none"
        >
          {headline.active ? (
            <span className="text-editorial-accent">
              Slay. <br /> Aunty.
            </span>
          ) : (
            <span>
              Happy <br /> Birthday.
            </span>
          )}
          <Annotation
            note="Egg 08. Hover on desktop, tap on a phone. It used to be hover-only, which meant it did not exist on her phone."
            side="left"
            className="inset-0"
          />
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          viewport={{ once: true }}
          className="w-24 h-[1px] bg-editorial-black/40 mx-auto mb-12"
        ></motion.div>

        <motion.p
          {...signoff.bind}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          viewport={{ once: true }}
          className="font-sans text-xl md:text-2xl text-editorial-black max-w-xl mx-auto bg-editorial-cream/30 backdrop-blur-md p-4 rounded-lg cursor-pointer select-none"
        >
          To the girl who deserves nothing but the best. <br /> Keep shining,{' '}
          {signoff.active ? (
            <span className="font-serif italic text-editorial-accent font-bold">Aunty.</span>
          ) : (
            <span>Dishita.</span>
          )}
        </motion.p>
      </div>
    </section>
  );
}
