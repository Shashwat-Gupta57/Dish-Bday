import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEggs } from '../lib/EggContext';

export default function Legal() {
  const { find } = useEggs();

  useEffect(() => {
    find('fineprint');
  }, [find]);

  return (
    <div className="min-h-screen bg-editorial-cream text-editorial-black py-24 px-6 md:px-24">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-editorial-black/50 hover:text-editorial-accent transition-colors mb-16">
          <ArrowLeft size={16} />
          <span className="font-sans uppercase tracking-widest text-xs">Return</span>
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs tracking-[0.4em] uppercase text-editorial-black/50 mb-4">Official Documentation</p>
          <h1 className="font-serif text-4xl md:text-6xl mb-16 italic">Privacy Policy & Terms</h1>
          
          <div className="space-y-12 font-sans text-lg text-editorial-black/80 leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-editorial-accent mb-4">1. Data Collection & Usage</h2>
              <p>
                By interacting with this site, you acknowledge that we are collecting infinite amounts of chaotic, unfiltered bestie energy. We reserve the right to constantly remind you of how absolutely gorgeous you are, and to store these reminders securely in our permanent records. 
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-editorial-accent mb-4">2. Liability of High Egos</h2>
              <p>
                We accept zero responsibility for any sudden ego boosts, extreme eye-rolling, or uncontrollable smiles caused by the contents of this editorial. By proceeding, you accept that you are dangerously stunning and it's simply a hazard we all have to live with.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-editorial-accent mb-4">3. Intellectual Property</h2>
              <p>
                All rights to being the main character are exclusively reserved for <strong>Dishita</strong>. Any attempt by others to outshine or steal the spotlight on September 13th will be met with immediate legal action (and by legal action, we mean being ignored because no one else matters today).
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-editorial-accent mb-4">4. Terms of Service</h2>
              <p>
                By reading this far, you are legally bound to have the most incredible birthday ever. You must eat cake, look flawless, and know that you are deeply appreciated and tolerated. 
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-editorial-accent mb-4">5. The "Aunty" Clause & Minor Interactions</h2>
              <p>
                Please be advised that as you are now 19, you are officially a legal adult (a major). Meanwhile, we are just innocent 17-year-olds. According to our strictly enforced legal handbook, you talking to us is practically a legal offense. You have no grounds to argue back, so just accept defeat. Respect your juniors, Aunty.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-editorial-accent mb-4">6. Dietary Disclosures & Excuses</h2>
              <p>
                We formally recognize your unending craving for fulkis and your habit of inhaling burgers under "stress". However, this document legally classifies your "stress eating" as exactly what it is: a blatant, convenient excuse to eat more junk food. Nice try, Aunty.
              </p>
              <p className="mt-12 italic font-serif text-2xl text-editorial-black text-center border-t border-editorial-black/10 pt-8">
                Happy Birthday, Bestie. 🥂
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
