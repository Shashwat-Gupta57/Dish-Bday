import { motion } from 'motion/react';

export default function Roast() {
  return (
    <section className="py-32 px-6 md:px-12 lg:px-24 bg-editorial-cream relative border-t border-editorial-black/10 overflow-hidden">
      <div className="absolute top-0 bottom-0 left-6 md:left-12 lg:left-24 w-[1px] bg-editorial-black/10"></div>
      
      <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row gap-16 md:gap-24">
        
        <div className="w-full md:w-1/3">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="sticky top-32"
          >
            <h2 className="text-sm tracking-[0.4em] uppercase text-editorial-accent mb-4 font-bold">The Reality Check</h2>
            <p className="font-serif text-5xl md:text-6xl text-editorial-black italic leading-tight">
              Let's talk <br/> about the <br/> facts.
            </p>
          </motion.div>
        </div>

        <div className="w-full md:w-2/3 space-y-24 pt-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <span className="absolute -left-12 md:-left-16 top-0 font-serif text-4xl md:text-5xl text-editorial-black/10 italic">01</span>
            <h3 className="font-serif text-3xl md:text-4xl text-editorial-black mb-6">The POCSO & "Aunty" Clause</h3>
            <p className="font-sans text-lg md:text-xl text-editorial-black/80 leading-relaxed">
              We need to address the elephant in the room. You are officially 19. A whole legal adult. A <em>major</em>. Meanwhile, I am just an innocent 17-year-old minor. Technically speaking, under the POCSO Act, I am fully protected and you are the offender here. You have zero grounds to argue back when I roast you, so just accept your senior citizen status. Respect your juniors, <strong>Aunty</strong>.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            viewport={{ once: true }}
            className="relative"
          >
            <span className="absolute -left-12 md:-left-16 top-0 font-serif text-4xl md:text-5xl text-editorial-black/10 italic">02</span>
            <h3 className="font-serif text-3xl md:text-4xl text-editorial-black mb-6">The "Stress" Diet</h3>
            <p className="font-sans text-lg md:text-xl text-editorial-black/80 leading-relaxed">
              Let's formally expose your so-called "stress eating". We all know the unending cravings for fulkis and inhaling burgers the moment minor inconveniences happen. This section legally classifies your "stress" as exactly what it is: a blatant, highly convenient excuse to eat more junk food. Nice try.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
