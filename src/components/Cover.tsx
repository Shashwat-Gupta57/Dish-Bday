import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Coffee } from 'lucide-react';
import { toast } from 'sonner';

export default function Cover() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-editorial-cream">
      {/* Background large text */}
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
        <h1 className="text-[15vw] leading-none tracking-tighter text-editorial-black/5 font-serif uppercase text-center mt-20">
          Dishita
        </h1>
      </motion.div>

      {/* Main Image */}
      <motion.div style={{ y: y2 }} className="relative z-10 w-[70vw] md:w-[35vw] h-[65vh] md:h-[75vh] mt-12 md:mt-20">
        <div className="absolute inset-0 border border-editorial-black/20 translate-x-4 translate-y-4"></div>
        <img 
          src="/photo-1.jpg" 
          alt="Dishita Cover" 
          className="w-full h-full object-cover filter grayscale-0 hover:grayscale transition-all duration-1000"
        />
        
        {/* Cover text elements */}
        <div className="absolute -left-6 md:-left-16 top-12 md:top-24">
          <p className="text-xs md:text-sm tracking-[0.2em] uppercase rotate-[-90deg] origin-bottom-left text-editorial-black">
            The September Issue
          </p>
        </div>
        
        <div className="absolute -right-12 md:-right-24 bottom-12 md:bottom-24">
           <p className="text-xs md:text-sm tracking-widest uppercase text-editorial-black text-right max-w-[150px]">
            Starring the girl who effortlessly outshines everyone else.
          </p>
        </div>
      </motion.div>

      {/* Foreground title */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute z-20 bottom-12 md:bottom-24 w-full flex flex-col items-center justify-center mix-blend-difference"
      >
        <h1 className="text-6xl md:text-8xl lg:text-9xl text-white font-serif uppercase tracking-tight text-center">
          DISHITA
        </h1>
        <p className="text-white/80 mt-2 uppercase tracking-[0.3em] text-xs md:text-sm font-sans cursor-default group">
          Vol. 1 &mdash; <span className="group-hover:hidden">09.13</span><span className="hidden group-hover:inline text-editorial-accent font-bold">FOREVER</span>
        </p>
      </motion.div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-20 mix-blend-difference">
        <span className="text-white text-xs uppercase tracking-widest mb-2">Scroll to unveil</span>
        <div className="w-[1px] h-8 bg-white"></div>
      </div>

      <button 
        onClick={() => toast("Stress eating again? Stop blaming the coaching classes, Aunty.")}
        className="absolute bottom-12 right-12 text-editorial-black/10 hover:text-editorial-black/60 transition-colors z-50 cursor-pointer"
      >
        <Coffee size={16} />
      </button>
    </section>
  );
}
