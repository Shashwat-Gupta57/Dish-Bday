import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useEggs } from '../lib/EggContext';
import { Annotation } from '../lib/EditorsCut';

export default function FoodieGame() {
  const navigate = useNavigate();
  const { find } = useEggs();

  // Egg 11. The excuse she uses is the way in.
  const openFindings = () => {
    find('findings');
    navigate('/findings');
  };

  const [stress, setStress] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    let stressInterval: any;
    let timerInterval: any;

    if (isPlaying && !gameOver && !win) {
      stressInterval = setInterval(() => {
        setStress((prev) => {
          if (prev >= 100) {
            setGameOver(true);
            return 100;
          }
          return prev + 8; // Stress goes up
        });
      }, 500);

      timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setWin(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(stressInterval);
      clearInterval(timerInterval);
    };
  }, [isPlaying, gameOver, win]);

  const eat = (amount: number) => {
    if (!isPlaying) setIsPlaying(true);
    setStress((prev) => Math.max(0, prev - amount));
  };

  const reset = () => {
    setStress(50);
    setIsPlaying(false);
    setGameOver(false);
    setWin(false);
    setTimeLeft(15);
  };

  return (
    <section className="py-24 px-6 md:px-12 bg-editorial-cream relative border-t border-editorial-black/10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-sm tracking-[0.4em] uppercase text-editorial-accent mb-4 font-bold">Aunty's Routine</h2>
        <p className="font-serif text-4xl md:text-5xl text-editorial-black italic mb-8">
          The Coaching Survival Simulator
        </p>
        
        <p className="font-sans text-lg text-editorial-black/70 max-w-2xl mx-auto mb-12">
          Your entire day is consumed by schools and coaching classes. Your stress levels are rising. You
          must consume copious amounts of junk food (your{' '}
          <span
            role="button"
            tabIndex={0}
            onClick={openFindings}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFindings();
              }
            }}
            className="relative group cursor-pointer text-editorial-black hover:text-editorial-accent focus-visible:text-editorial-accent transition-colors duration-500 underline decoration-editorial-accent/40 decoration-1 underline-offset-4"
          >
            &ldquo;stress diet&rdquo;
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-sans tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity text-editorial-accent whitespace-nowrap pointer-events-none">
              We ran the numbers
            </span>
            <Annotation
              note="Egg 11. Opens the Clinical Findings — the full statistical case against her."
              side="bottom"
              className="inset-0"
            />
          </span>
          ) to survive the next 15 seconds!
        </p>

        <div className="bg-white p-8 md:p-12 border border-editorial-black/20 shadow-xl max-w-2xl mx-auto relative overflow-hidden">
          {/* Game Over / Win Screens */}
          {gameOver && (
             <div className="absolute inset-0 bg-editorial-black/90 flex flex-col items-center justify-center text-editorial-cream z-20">
               <p className="font-serif text-3xl mb-4 italic">You got buried in syllabus.</p>
               <p className="text-sm uppercase tracking-widest text-editorial-accent mb-8">Should've eaten more fulkis.</p>
               <button onClick={reset} className="px-6 py-2 border border-editorial-cream/50 hover:bg-editorial-cream hover:text-editorial-black transition-colors uppercase tracking-widest text-xs">Try Again</button>
               <button
                 onClick={openFindings}
                 className="mt-6 font-sans text-[10px] uppercase tracking-[0.3em] text-editorial-cream/40 hover:text-editorial-accent transition-colors"
               >
                 Or read why this keeps happening &rarr;
               </button>
             </div>
          )}
          
          {win && (
             <div className="absolute inset-0 bg-editorial-cream flex flex-col items-center justify-center text-editorial-black z-20 border-[8px] border-editorial-accent/20">
               <p className="font-serif text-3xl mb-4 italic text-editorial-accent">You survived!</p>
               <p className="text-sm uppercase tracking-widest mb-8">Another day conquered, Aunty.</p>
               <button onClick={reset} className="px-6 py-2 border border-editorial-black/50 hover:bg-editorial-black hover:text-editorial-cream transition-colors uppercase tracking-widest text-xs">Replay</button>
               <button
                 onClick={openFindings}
                 className="mt-6 font-sans text-[10px] uppercase tracking-[0.3em] text-editorial-black/40 hover:text-editorial-accent transition-colors"
               >
                 Now see the full findings &rarr;
               </button>
             </div>
          )}

          <div className="mb-8 flex justify-between items-end">
            <span className="text-xs uppercase tracking-widest text-editorial-black/50">Time Left: {timeLeft}s</span>
            <span className="text-xs uppercase tracking-widest text-editorial-black/50">Stress Level: {stress}%</span>
          </div>

          {/* Stress Bar */}
          <div className="w-full h-4 bg-editorial-black/10 mb-12 relative overflow-hidden">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-editorial-accent"
              animate={{ width: `${stress}%` }}
              transition={{ type: 'tween', ease: 'linear', duration: 0.2 }}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <button 
              onClick={() => eat(15)}
              className="flex-1 bg-editorial-cream border border-editorial-black/20 py-4 px-6 hover:bg-editorial-black hover:text-editorial-cream transition-colors text-lg font-serif italic"
            >
              Eat 1 Fulki (-15%)
            </button>
            <button 
              onClick={() => eat(25)}
              className="flex-1 bg-editorial-cream border border-editorial-black/20 py-4 px-6 hover:bg-editorial-black hover:text-editorial-cream transition-colors text-lg font-serif italic"
            >
              Inhale Burger (-25%)
            </button>
          </div>
          
          {!isPlaying && !gameOver && !win && (
            <div className="mt-8 text-xs uppercase tracking-widest text-editorial-accent animate-pulse">
              Click a food to start eating...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
