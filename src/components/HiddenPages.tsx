import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { useScrollLock } from '../lib/SmoothScroll';

interface HiddenPagesProps {
  activePage: 'virgo' | 'vault' | null;
  onClose: () => void;
}

export default function HiddenPages({ activePage, onClose }: HiddenPagesProps) {
  useScrollLock(activePage !== null);

  return (
    <AnimatePresence>
      {activePage === 'virgo' && (
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          data-lenis-prevent
          className="fixed inset-0 z-[100] bg-editorial-black text-editorial-cream overflow-y-auto"
        >
          <button onClick={onClose} className="fixed top-8 right-8 z-50 hover:text-editorial-accent transition-colors">
            <X size={32} strokeWidth={1} />
          </button>
          
          <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-24 relative overflow-hidden">
             {/* Subtle star map background */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
             
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ delay: 0.5, duration: 1 }}
               className="relative z-10 w-full max-w-lg mb-12"
             >
                <img src="/photo-26.jpg" alt="Virgo Muse" className="w-full aspect-[4/5] object-cover border border-editorial-cream/20 filter grayscale sepia-[0.3]" />
                <div className="absolute -bottom-6 -right-6 md:-right-12 text-[10rem] font-serif text-editorial-accent/30 leading-none pointer-events-none select-none">
                  ♍
                </div>
             </motion.div>

             <div className="max-w-2xl text-center relative z-10">
               <div className="flex items-center justify-center gap-4 mb-6 text-editorial-accent">
                 <Sparkles size={20} strokeWidth={1} />
                 <span className="tracking-[0.3em] uppercase text-sm">The Celestial Blueprint</span>
                 <Sparkles size={20} strokeWidth={1} />
               </div>
               <h2 className="font-serif text-5xl md:text-7xl mb-8">September 13th</h2>
               <p className="font-sans text-lg md:text-xl leading-relaxed text-editorial-cream/80 mb-6">
                 Ruled by Mercury. Grounded in Earth. You are meticulous, effortlessly elegant, and possess an analytical mind that sees the beauty in details everyone else misses. 
               </p>
               <p className="font-sans text-lg md:text-xl leading-relaxed text-editorial-cream/80 italic">
                 A true Virgo doesn't just exist in a space; she curates it just by walking in. That's exactly the main character energy you bring everywhere.
               </p>
             </div>
          </div>
        </motion.div>
      )}

      {activePage === 'vault' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          data-lenis-prevent
          className="fixed inset-0 z-[100] bg-editorial-cream text-editorial-black overflow-y-auto"
        >
          <button onClick={onClose} className="fixed top-8 right-8 z-50 hover:text-editorial-accent transition-colors bg-white/50 backdrop-blur-md rounded-full p-2">
            <X size={32} strokeWidth={1} />
          </button>
          
          <div className="min-h-screen p-6 md:p-24">
            <div className="max-w-7xl mx-auto">
              <header className="mb-24 text-center">
                <p className="tracking-[0.4em] uppercase text-sm text-editorial-black/50 mb-4">Classified</p>
                <h2 className="font-serif text-5xl md:text-7xl italic mb-6">The Vault</h2>
                <p className="font-sans text-lg text-editorial-black/70 max-w-2xl mx-auto italic">
                  We had to lock these ones up. The sheer amount of Aunty energy emanating from these photos was a direct threat to public safety. Proceed at your own risk.
                </p>
              </header>

              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                {['/photo-12.jpg', '/photo-13.jpg', '/photo-14.jpg', '/photo-15.jpg', '/photo-8.jpg'].map((src, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                    viewport={{ once: true }}
                    className="break-inside-avoid relative group"
                  >
                    <img src={src} className="w-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700 border border-editorial-black/10" />
                    <div className="absolute inset-0 bg-editorial-black/0 group-hover:bg-editorial-black/20 transition-colors duration-500"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
