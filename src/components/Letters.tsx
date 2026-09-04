import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { X, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { useEggs } from '../lib/EggContext';
import { useScrollLock } from '../lib/SmoothScroll';
import { Annotation } from '../lib/EditorsCut';

const LETTERS = [
  {
    id: 1,
    title: "The Camera Roll Audit",
    subtitle: "FILE 001 // VANITY",
    content: "I scrolled through your gallery. 4,200 photos from last month. 4,198 of them are the exact same 'candid' angle where you pretend you didn't know the camera was there. We both know you spent 15 minutes setting up that lighting, Dishita. Who are you lying to?",
    photo: "/photo-16.jpg"
  },
  {
    id: 2,
    title: "Financial Ruin",
    subtitle: "FILE 002 // ECONOMICS",
    content: "If you took all the money you spent on spicy water (fulki) this year and put it in a mutual fund, you could probably buy a house. Instead, you have 34% increased midsection volume and zero savings. A true economic mastermind.",
    photo: "/photo-17.jpg"
  },
  {
    id: 3,
    title: "The 'Study' Routine",
    subtitle: "FILE 003 // ACADEMICS",
    content: "You sit down. You open the book. You sigh loudly so everyone knows you are 'stressed'. You take a photo of the book for your story. You fall asleep for three hours. You wake up exhausted from 'studying so hard'. It is a performance art masterpiece.",
    photo: "/photo-18.jpg"
  },
  {
    id: 4,
    title: "The Auntification",
    subtitle: "FILE 004 // BIOLOGY",
    content: "You keep calling yourself a baddie. But a baddie does not complain about back pain at 19, cancel plans to take a 4-hour nap, and carry a purse full of random medicines. Accept your fate. The transition to full Aunty is complete.",
    photo: "/photo-4.jpg"
  },
  {
    id: 5,
    title: "The Dietary Lies",
    subtitle: "FILE 005 // NUTRITION",
    content: "'I am going on a diet tomorrow.' — A direct quote from you, spoken while simultaneously inhaling your third burger of the week. At this point, the syllabus isn't the only thing you're ignoring.",
    photo: "/photo-15.jpg"
  },
  {
    id: 6,
    title: "The Actual Truth",
    subtitle: "FILE 006 // CLASSIFIED",
    content: "Okay, fine. Despite the delusion, the sleeping, and the horrifying amount of street food... you are genuinely the most incredible bestie on earth. I wouldn't trade your dramatic, aunty-vibes energy for anything. Happy birthday. Now go sleep.",
    photo: "/photo-1.jpg"
  }
];

export default function Letters() {
  const [selectedLetter, setSelectedLetter] = useState<typeof LETTERS[0] | null>(null);
  const { find } = useEggs();
  useScrollLock(selectedLetter !== null);

  useEffect(() => {
    if (!selectedLetter) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedLetter(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedLetter]);

  return (
    <section className="py-32 md:py-48 px-6 bg-editorial-black text-editorial-cream relative overflow-hidden">
      {/* Ambient background grain/gradients */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-editorial-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-editorial-cream/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <p className="text-[10px] tracking-[0.5em] uppercase text-editorial-cream/40 mb-6">
          Intercepted Transmissions
        </p>
        <h2 className="font-serif text-5xl md:text-7xl text-editorial-cream italic mb-24 md:mb-32 relative inline-block group">
          Unpublished Notes
          <span className="absolute -right-6 bottom-4 w-2 h-2 rounded-full bg-editorial-accent animate-pulse shadow-[0_0_10px_rgba(128,0,32,0.8)]"></span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {LETTERS.map((letter, i) => (
            <motion.div 
              key={letter.id}
              initial={{ opacity: 0, y: 40, rotate: (i % 2 === 0 ? -3 : 3) }}
              whileInView={{ opacity: 1, y: 0, rotate: (i % 2 === 0 ? -2 : 2) }}
              transition={{ delay: i * 0.15, duration: 0.8, type: "spring", stiffness: 40 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              onClick={() => setSelectedLetter(letter)}
              className="group cursor-pointer flex flex-col items-center"
            >
              {/* Dossier Envelope Design */}
              <div className="w-full aspect-[4/3] border border-editorial-cream/20 bg-editorial-black relative flex items-center justify-center transition-all duration-500 group-hover:border-editorial-accent group-hover:bg-editorial-accent/5 shadow-2xl overflow-hidden">
                
                {/* Diagonal lines to look like an envelope back */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="50" y2="50" stroke="currentColor" strokeWidth="1" />
                    <line x1="100" y1="0" x2="50" y2="50" stroke="currentColor" strokeWidth="1" />
                    <line x1="0" y1="100" x2="50" y2="50" stroke="currentColor" strokeWidth="1" />
                    <line x1="100" y1="100" x2="50" y2="50" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>

                {/* Wax seal simulation */}
                <div className="absolute w-12 h-12 rounded-full bg-editorial-accent flex items-center justify-center opacity-90 shadow-xl z-20 group-hover:scale-0 transition-transform duration-500">
                  <span className="text-xs font-serif italic text-editorial-cream">0{letter.id}</span>
                </div>
                
                {/* Revealed text on hover */}
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 z-10 bg-editorial-black/80 backdrop-blur-sm">
                  <span className="font-serif text-xl italic text-editorial-cream">Read file</span>
                </div>

                <div className="absolute top-4 left-4">
                   <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-editorial-cream/30 group-hover:text-editorial-accent transition-colors">
                     CONFIDENTIAL
                   </p>
                </div>
              </div>
              
              <div className="mt-6 w-full text-left">
                <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-editorial-accent mb-2">
                  {letter.subtitle}
                </p>
                <p className="font-serif text-2xl text-editorial-cream/80 group-hover:text-editorial-cream transition-colors duration-300">
                  {letter.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal for Letter */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedLetter(null)}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-editorial-black/95 backdrop-blur-md overflow-y-auto"
          >
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.98, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-editorial-cream text-editorial-black p-6 md:p-14 max-w-5xl w-full relative shadow-[0_30px_60px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-8 md:gap-16 items-center my-auto mx-auto"
            >
              {/* Corner accents for the physical paper look */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-editorial-black/20 m-4" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-editorial-black/20 m-4" />

              <button 
                onClick={() => setSelectedLetter(null)}
                className="absolute top-4 right-4 md:top-8 md:right-8 text-editorial-black/40 hover:text-editorial-accent transition-colors z-20 bg-editorial-cream/50 rounded-full p-2"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
              
              <div className="w-full md:w-5/12 shrink-0">
                 <div className="relative">
                   <div className="absolute inset-0 bg-editorial-accent/20 mix-blend-multiply pointer-events-none" />
                   <img 
                      loading="lazy"
                      src={selectedLetter.photo} 
                      alt="Classified Subject" 
                      className="w-full aspect-[4/5] object-cover filter grayscale contrast-125 sepia-[0.3] border-4 border-white shadow-lg" 
                   />
                   <div className="absolute bottom-4 right-4 bg-editorial-black text-editorial-cream px-3 py-1">
                     <p className="font-sans text-[8px] tracking-[0.4em] uppercase">EXHIBIT {selectedLetter.id}</p>
                   </div>
                 </div>
              </div>

              <div className="w-full md:w-7/12 flex flex-col justify-center">
                <p className="font-sans text-[10px] tracking-[0.4em] uppercase text-editorial-accent mb-4 font-bold">
                  {selectedLetter.subtitle}
                </p>
                <h3 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-8 border-b-2 border-editorial-black/10 pb-6 italic leading-none">
                  {selectedLetter.title}
                </h3>
                
                <p className="font-mono text-sm md:text-base leading-relaxed text-editorial-black/80 whitespace-pre-wrap">
                  {selectedLetter.content}
                </p>
                
                <div className="mt-12 pt-8 border-t-2 border-editorial-black/10 flex justify-between items-end">
                  <div>
                    <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-editorial-black/40 mb-1">Date</p>
                    <p className="font-serif text-sm italic text-editorial-black/70">Sept 13th, Classified</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-editorial-black/40 mb-1">Author</p>
                    <span className="font-serif text-xl md:text-2xl italic text-editorial-accent">Your fav minor.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Annotation
        note="Egg 06d. Cutlery. Last of the four corner icons — all four together make one stamp."
        side="left"
        className="top-23 right-11 w-6 h-6 z-[340]"
        circle
      />

      <button
        onClick={() => {
          find('corner-letters');
          toast("A fulki a day keeps the youth away. Wait... that's not how it goes.");
        }}
        aria-label="A hidden note"
        className="absolute top-24 right-12 text-editorial-cream/10 hover:text-editorial-accent transition-colors z-50 cursor-pointer"
      >
        <UtensilsCrossed size={16} />
      </button>
    </section>
  );
}
