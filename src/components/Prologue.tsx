import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface PrologueProps {
  openPage: (page: 'virgo' | 'vault') => void;
}

export default function Prologue({ openPage }: PrologueProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-100, 200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [50, -250]);

  return (
    <section ref={ref} className="min-h-screen w-full bg-editorial-black text-editorial-cream py-32 px-6 md:px-24 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-editorial-cream/20 z-0"></div>
      
      {/* Floating Editorial Assets */}
      <motion.div style={{ y: y1 }} className="absolute top-32 left-8 md:left-24 w-32 md:w-48 opacity-40 hover:opacity-100 transition-opacity duration-700 hidden md:block">
         <img src="/photo-19.jpg" className="w-full aspect-square object-cover filter grayscale" />
      </motion.div>

      <motion.div style={{ y: y2 }} className="absolute bottom-48 right-12 md:right-32 w-24 md:w-40 opacity-40 hover:opacity-100 transition-opacity duration-700 hidden md:block">
         <img src="/photo-20.jpg" className="w-full aspect-[3/4] object-cover filter grayscale" />
      </motion.div>

      <motion.div style={{ y: y3 }} className="absolute top-1/2 right-4 md:right-16 w-32 opacity-20 hover:opacity-100 transition-opacity duration-700 hidden lg:block">
         <img src="/photo-21.jpg" className="w-full aspect-[4/5] object-cover filter grayscale" />
      </motion.div>
      
      <div className="max-w-4xl mx-auto z-10 text-center relative">
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-sm md:text-base tracking-[0.3em] uppercase mb-12 text-editorial-cream/50"
        >
          Editor's Note
        </motion.p>
        
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-serif text-3xl md:text-5xl lg:text-7xl leading-tight md:leading-tight mb-16 relative z-10"
        >
          We could talk about how you look today... but it's getting repetitive stating you're the most gorgeous person in the room.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="w-16 h-[1px] bg-editorial-accent mx-auto"
        ></motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 text-lg md:text-xl text-editorial-cream/80 max-w-2xl mx-auto italic font-serif relative z-10"
        >
          You are the main character, the{' '}
          <span 
            onClick={() => openPage('virgo')} 
            className="cursor-pointer text-editorial-cream hover:text-editorial-accent transition-colors duration-500 relative group inline-block underline decoration-editorial-accent/50 decoration-1 underline-offset-4"
          >
            muse
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-sans tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity text-editorial-accent whitespace-nowrap">
              Click to reveal
            </span>
          </span>
          , the{' '}
          <span className="relative group inline-block cursor-default">
            bestie
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-editorial-accent opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-300 pointer-events-none">
              💅
            </span>
          </span>
          , and the entire vibe. Here's to you, Dishita.
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-editorial-cream/20 z-0"></div>
      
      <button 
        onClick={() => toast("Shouldn't you be at a coaching class right now? A minor is asking.")}
        className="absolute top-12 left-12 text-editorial-cream/10 hover:text-editorial-accent transition-colors z-50 cursor-pointer"
      >
        <BookOpen size={16} />
      </button>
    </section>
  );
}
