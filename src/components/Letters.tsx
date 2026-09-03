import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { X, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';

const LETTERS = [
  {
    id: 1,
    title: "To my Bestie",
    content: "Happy Birthday Dishita! You are the most incredible friend I could ever ask for. Your energy is unmatched, and having you in my life makes everything 10x better. Here is to making more iconic memories.",
    photo: "/photo-16.jpg"
  },
  {
    id: 2,
    title: "A Gentle Reminder",
    content: "Just a reminder that you outshine everyone effortlessly. Never stop being the confident, gorgeous, and amazing person that you are. Keep slaying.",
    photo: "/photo-17.jpg"
  },
  {
    id: 3,
    title: "The Future",
    content: "I can't wait to see what this next year brings for you. I'm always going to be here cheering you on, because you deserve the absolute best. Stay iconic.",
    photo: "/photo-18.jpg"
  }
];

export default function Letters() {
  const [selectedLetter, setSelectedLetter] = useState<typeof LETTERS[0] | null>(null);

  return (
    <section className="py-32 px-6 bg-editorial-black text-editorial-cream relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-sm tracking-[0.4em] uppercase text-editorial-cream/50 mb-4">The Private Collection</h2>
        <p className="font-serif text-4xl md:text-6xl text-editorial-cream italic mb-24 relative inline-block group">
          Unpublished Notes
          <span className="absolute -right-4 bottom-2 w-1.5 h-1.5 rounded-full bg-editorial-cream/0 group-hover:bg-editorial-accent transition-colors duration-500"></span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          {LETTERS.map((letter, i) => (
            <motion.div 
              key={letter.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              onClick={() => setSelectedLetter(letter)}
              className="group cursor-pointer flex flex-col items-center"
            >
              <div className="w-48 h-32 border border-editorial-cream/20 bg-editorial-cream/5 relative flex items-center justify-center transition-all duration-500 group-hover:border-editorial-accent group-hover:bg-editorial-accent/10">
                {/* Wax seal simulation */}
                <div className="absolute w-8 h-8 rounded-full bg-editorial-accent flex items-center justify-center opacity-80 shadow-lg">
                  <span className="text-[10px] font-serif">D</span>
                </div>
              </div>
              <p className="mt-6 font-serif text-xl group-hover:text-editorial-accent transition-colors duration-300">
                {letter.title}
              </p>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-editorial-black/90 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-editorial-cream text-editorial-black p-8 md:p-12 max-w-4xl w-full relative border border-editorial-black/20 shadow-2xl flex flex-col md:flex-row gap-8 md:gap-16 items-center"
            >
              <button 
                onClick={() => setSelectedLetter(null)}
                className="absolute top-6 right-6 text-editorial-black/50 hover:text-editorial-accent transition-colors z-20"
              >
                <X size={24} strokeWidth={1} />
              </button>
              
              <div className="w-full md:w-1/2">
                 <img 
                    src={selectedLetter.photo} 
                    alt="Memory" 
                    className="w-full aspect-[4/5] object-cover filter grayscale sepia-[0.2] border border-editorial-black/10" 
                 />
              </div>

              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <h3 className="font-serif text-3xl md:text-4xl mb-8 border-b border-editorial-black/10 pb-6">
                  {selectedLetter.title}
                </h3>
                
                <p className="font-sans text-lg leading-relaxed text-editorial-black/80">
                  {selectedLetter.content}
                </p>
                
                <div className="mt-12 pt-8 border-t border-editorial-black/10 flex justify-between items-end">
                  <span className="font-serif text-sm italic text-editorial-black/50">Sept 13th</span>
                  <span className="font-serif text-xl md:text-2xl italic text-editorial-accent">Your fav minor.</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => toast("A fulki a day keeps the youth away. Wait... that's not how it goes.")}
        className="absolute top-24 right-12 text-editorial-cream/10 hover:text-editorial-accent transition-colors z-50 cursor-pointer"
      >
        <UtensilsCrossed size={16} />
      </button>
    </section>
  );
}
