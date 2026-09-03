import { motion, useTransform, MotionValue, AnimatePresence, useMotionValue, animate } from 'motion/react';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ArchiveDiveProps {
  onClose: () => void;
}

function ArchivePhoto({ src, x, y, index, progress }: { src: string, x: string, y: string, index: number, progress: MotionValue<number> }) {
  const startZ = -1000 - (index * 1500);
  const z = useTransform(progress, [0, 1], [startZ, startZ + 12000]);
  const opacity = useTransform(z, [-5000, -1000, 500, 1000], [0, 1, 1, 0]);
  const blur = useTransform(z, [-3000, -500, 300, 1000], ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(20px)']);

  return (
    <motion.div
      style={{
        z,
        opacity,
        filter: blur,
        x,
        y
      }}
      className="absolute w-[30vw] md:w-[20vw] aspect-[3/4] group"
    >
      <img 
        src={src} 
        className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl pointer-events-auto" 
      />
    </motion.div>
  );
}

export default function ArchiveDive({ onClose }: ArchiveDiveProps) {
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [finalArrived, setFinalArrived] = useState(false);
  const progress = useMotionValue(0);

  useEffect(() => {
    // Automatically animate progress from 0 to 1 rapidly
    const controls = animate(progress, 1, {
      duration: 4.5, // Warp speed dive
      ease: [0.22, 1, 0.36, 1], // Fast start, smooth deceleration
      onComplete: () => {
        setFinalArrived(true);
        setTimeout(() => {
          setShowFinalMessage(true);
        }, 2500); // Punchy timing for the final joke
      }
    });

    return () => controls.stop();
  }, [progress]);

  const photos = [
    { src: '/photo-10.jpg', x: '-25vw', y: '-15vh' },
    { src: '/photo-11.jpg', x: '20vw', y: '10vh' },
    { src: '/photo-12.jpg', x: '-15vw', y: '25vh' },
    { src: '/photo-13.jpg', x: '30vw', y: '-20vh' },
    { src: '/photo-14.jpg', x: '5vw', y: '-30vh' },
    { src: '/photo-15.jpg', x: '-30vw', y: '5vh' },
    { src: '/photo-16.jpg', x: '15vw', y: '30vh' },
    { src: '/photo-17.jpg', x: '-10vw', y: '-25vh' },
    { src: '/photo-18.jpg', x: '25vw', y: '-5vh' },
  ];

  // The Grand Finale stops at Z=0
  const finalZStart = -15000;
  const finalZRaw = useTransform(progress, [0, 1], [finalZStart, 0]);
  const finalZ = useTransform(finalZRaw, (val) => Math.min(val, 0)); 
  const finalOpacity = useTransform(finalZ, [-3000, -500, 0], [0, 1, 1]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] overflow-hidden">
      <button onClick={onClose} className="fixed top-8 right-8 z-[210] text-white/50 hover:text-white transition-colors">
        <X size={32} strokeWidth={1} />
      </button>

      <div className="w-full h-screen overflow-hidden flex items-center justify-center" style={{ perspective: '1000px' }}>
        
        <div className="absolute top-10 text-white/20 text-xs tracking-[0.5em] uppercase pointer-events-none z-50 animate-pulse">
          Diving into the Archives...
        </div>

        {/* Render the 9 floating memories */}
        {photos.map((p, i) => (
          <ArchivePhoto key={i} src={p.src} x={p.x} y={p.y} index={i} progress={progress} />
        ))}

        {/* The Grand Finale Memory (photo-19) */}
        <motion.div
          style={{ z: finalZ, opacity: finalOpacity }}
          className={`absolute w-[60vw] md:w-[35vw] aspect-[4/5] transition-all duration-[3000ms] ease-out pointer-events-auto ${finalArrived ? 'scale-110' : 'scale-100'}`}
        >
          <div className="relative w-full h-full group">
            <img 
              src="/photo-19.jpg" 
              className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" 
            />
            
            {/* Automated dimming overlay */}
            <div className={`absolute inset-0 transition-colors duration-[1500ms] ${finalArrived ? 'bg-black/60' : 'bg-black/0'} pointer-events-none`}></div>
            
            {/* Automated first message */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-[1500ms] delay-500 pointer-events-none ${finalArrived ? 'opacity-100' : 'opacity-0'}`}>
              <p className="font-serif italic text-3xl md:text-5xl text-white drop-shadow-lg text-center px-4">
                ready for the dark room?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Final Joke Message */}
        <AnimatePresence>
          {showFinalMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
            >
              <p className="font-serif italic text-4xl md:text-6xl text-editorial-accent drop-shadow-2xl text-center px-6">
                Hehe, dekhi meri mehnat!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
