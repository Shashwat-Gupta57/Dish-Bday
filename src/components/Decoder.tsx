import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Decoder() {
  return (
    <section className="relative w-full bg-editorial-black text-editorial-cream overflow-hidden">
      {/* Peeping Header - designed to look like it's hiding just below the page fold */}
      <div className="w-full border-t border-editorial-accent/30 py-8 flex flex-col items-center justify-center bg-editorial-black/95 backdrop-blur-md z-20 relative shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-editorial-accent mb-4"
        >
          <ChevronDown size={32} strokeWidth={1} />
        </motion.div>
        <p className="font-serif italic text-xl md:text-2xl text-center px-6">
          "I know you ain't as smart as me 🥀 so..."
        </p>
      </div>

      <div className="max-w-4xl mx-auto py-24 px-6 md:px-12 relative z-10">
        <h2 className="text-sm tracking-[0.4em] uppercase text-editorial-cream/50 mb-16 text-center">
          Easter Eggs & Meanings
        </h2>

        <div className="space-y-16">
          <div className="group border-l border-editorial-cream/20 pl-8 hover:border-editorial-accent transition-colors duration-500">
            <h3 className="font-serif text-2xl md:text-3xl text-editorial-accent mb-4">01. The 13 Flakes</h3>
            <p className="font-sans text-lg text-editorial-cream/80 leading-relaxed">
              Did you notice the falling gold foil at the very end of the site? There are exactly 13 flakes generated. Not a random number—one for September 13th.
            </p>
          </div>

          <div className="group border-l border-editorial-cream/20 pl-8 hover:border-editorial-accent transition-colors duration-500">
            <h3 className="font-serif text-2xl md:text-3xl text-editorial-accent mb-4">02. The Glowing Muse</h3>
            <p className="font-sans text-lg text-editorial-cream/80 leading-relaxed">
              In the Editor's Note prologue, the word <em>"muse"</em> holds a secret. If you hover and click it, it unlocks <strong>The Celestial Blueprint</strong>—a hidden page dedicated entirely to your Virgo energy.
            </p>
          </div>

          <div className="group border-l border-editorial-cream/20 pl-8 hover:border-editorial-accent transition-colors duration-500">
            <h3 className="font-serif text-2xl md:text-3xl text-editorial-accent mb-4">03. The Phantom Thirteen</h3>
            <p className="font-sans text-lg text-editorial-cream/80 leading-relaxed">
              Somewhere buried in the background of <em>The Archives</em> timeline, sitting right next to the fine vertical line, there is a tiny, hidden Roman numeral "xiii.". Finding and clicking it grants you access to <strong>The Vault</strong>.
            </p>
          </div>

          <div className="group border-l border-editorial-cream/20 pl-8 hover:border-editorial-accent transition-colors duration-500">
            <h3 className="font-serif text-2xl md:text-3xl text-editorial-accent mb-4">04. The Oxblood Palette</h3>
            <p className="font-sans text-lg text-editorial-cream/80 leading-relaxed">
              The entire site avoids standard bright colors. Instead, it uses Cream and Oxblood Red (that deep, wine-like accent). It represents the Earth sign groundedness mixed with intense passion and perfectionism. Very you.
            </p>
          </div>
          
          <div className="group border-l border-editorial-cream/20 pl-8 hover:border-editorial-accent transition-colors duration-500">
            <h3 className="font-serif text-2xl md:text-3xl text-editorial-accent mb-4">05. The Micro-Secrets</h3>
            <p className="font-sans text-lg text-editorial-cream/80 leading-relaxed">
              The site is littered with tiny micro-interactions. Hover over the date on the cover. Hover over the word "bestie" in the prologue. Hover over the title in the Notes section. Hover over the final "Happy Birthday". Every corner has a secret just for you.
            </p>
          </div>

          <div className="group border-l border-editorial-cream/20 pl-8 hover:border-editorial-accent transition-colors duration-500">
            <h3 className="font-serif text-2xl md:text-3xl text-editorial-accent mb-4">06. The Privacy Policy</h3>
            <p className="font-sans text-lg text-editorial-cream/80 leading-relaxed">
              If you check the absolute bottom of the Decoder (right here), there is a sneaky link to a Privacy Policy & Terms page. It's totally real and legally binding, obviously. 
            </p>
          </div>
        </div>
        
        <div className="mt-32 text-center pb-24">
           <p className="font-serif text-3xl italic text-editorial-cream/30 mb-16">Now scroll back up and find them all.</p>
           
           <div className="border-t border-editorial-cream/10 pt-8 flex justify-center">
             <Link to="/legal" className="text-xs uppercase tracking-[0.3em] text-editorial-cream/30 hover:text-editorial-accent transition-colors">
               Privacy Policy & Terms
             </Link>
           </div>
        </div>
      </div>
    </section>
  );
}
