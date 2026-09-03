import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Reminder() {
  return (
    <div className="min-h-screen bg-editorial-black text-editorial-cream py-24 px-6 md:px-24 flex items-center justify-center">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <h1 className="font-serif text-6xl md:text-8xl mb-8 italic text-editorial-accent">Wait a minute.</h1>
          
          <div className="space-y-6 font-sans text-xl md:text-2xl text-editorial-cream/80 leading-relaxed mb-16">
            <p>
              Since you're clicking around admiring yourself...
            </p>
            <p>
              Just a gentle, mandatory reminder that <strong>my birthday is on December 3rd</strong>. 
            </p>
            <p className="italic text-editorial-cream/50 text-lg">
              (If you forget, I am legally allowed to revoke this entire website under the Bestie Act of 2026).
            </p>
          </div>

          <Link to="/" className="inline-flex items-center gap-2 text-editorial-cream/50 hover:text-editorial-accent transition-colors">
            <ArrowLeft size={16} />
            <span className="font-sans uppercase tracking-widest text-sm">Back to admiring you</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
