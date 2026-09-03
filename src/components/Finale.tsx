import { motion, useScroll, useTransform } from 'motion/react';
import { useEffect, useState, useRef } from 'react';

function Flake({ delay }: { delay: number }) {
  const startX = Math.random() * 100;
  const size = Math.random() * 15 + 10;
  const duration = Math.random() * 4 + 4;
  
  return (
    <motion.div
      initial={{ 
        y: -50, 
        x: `${startX}vw`, 
        rotate: 0, 
        opacity: 0 
      }}
      animate={{ 
        y: ['0vh', '100vh'], 
        x: [`${startX}vw`, `${startX + (Math.random() * 20 - 10)}vw`],
        rotate: [0, 360],
        opacity: [0, 1, 1, 0]
      }}
      transition={{ 
        duration: duration, 
        repeat: Infinity, 
        delay: delay,
        ease: "linear"
      }}
      className="absolute top-0 z-0 bg-editorial-accent/60"
      style={{
        width: size,
        height: size * 1.5,
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        filter: 'blur(1px)'
      }}
    />
  );
}

export default function Finale() {
  const [flakes, setFlakes] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [100, -200]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1.1]);
  
  useEffect(() => {
    const newFlakes = Array.from({ length: 13 }).map(() => Math.random() * 5);
    setFlakes(newFlakes);
  }, []);

  return (
    <section ref={ref} className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-editorial-cream">
      
      {/* Background Collage */}
      <div className="absolute inset-0 z-0 opacity-10 md:opacity-20 pointer-events-none">
        <motion.div style={{ y: y1, scale }} className="absolute top-[-10%] left-[-5%] w-[40vw] max-w-[400px]">
          <img src="/photo-22.jpg" className="w-full h-full object-cover grayscale blur-[2px]" />
        </motion.div>
        <motion.div style={{ y: y2, scale }} className="absolute bottom-[-10%] right-[-5%] w-[50vw] max-w-[500px]">
          <img src="/photo-23.jpg" className="w-full h-full object-cover grayscale blur-[2px]" />
        </motion.div>
        <motion.div style={{ y: y1, scale }} className="absolute top-[20%] right-[10%] w-[25vw] max-w-[300px]">
          <img src="/photo-24.jpg" className="w-full h-full object-cover grayscale blur-[2px]" />
        </motion.div>
        <motion.div style={{ y: y2, scale }} className="absolute bottom-[20%] left-[10%] w-[30vw] max-w-[350px]">
          <img src="/photo-25.jpg" className="w-full h-full object-cover grayscale blur-[2px]" />
        </motion.div>
      </div>

      {/* Background Foil Flakes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {flakes.map((delay, i) => (
          <Flake key={i} delay={delay} />
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className="font-serif text-6xl md:text-8xl lg:text-[10rem] leading-none text-editorial-black mb-12 drop-shadow-2xl group cursor-pointer"
        >
          <span className="group-hover:hidden">Happy <br/> Birthday.</span>
          <span className="hidden group-hover:block text-editorial-accent animate-pulse">Slay. <br/> Aunty.</span>
        </motion.h2>
        
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           transition={{ duration: 1, delay: 0.8 }}
           viewport={{ once: true }}
           className="w-24 h-[1px] bg-editorial-black/40 mx-auto mb-12"
        ></motion.div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          viewport={{ once: true }}
          className="font-sans text-xl md:text-2xl text-editorial-black max-w-xl mx-auto bg-editorial-cream/30 backdrop-blur-md p-4 rounded-lg group cursor-default"
        >
          To the girl who deserves nothing but the best. <br/> Keep shining, <span className="group-hover:hidden">Dishita.</span><span className="hidden group-hover:inline font-serif italic text-editorial-accent font-bold">Aunty.</span>
        </motion.p>
      </div>
    </section>
  );
}
