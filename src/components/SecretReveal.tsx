import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Decoder from './Decoder';
import { Lock } from 'lucide-react';

export default function SecretReveal() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isUnlocked) return;
      
      const scrollPosition = window.scrollY + window.innerHeight;
      const totalHeight = document.body.offsetHeight;
      const distanceToBottom = totalHeight - scrollPosition;
      
      // If we are within 300px of the bottom, show the indicator
      if (distanceToBottom < 300 && distanceToBottom > 5) {
        setIsNearBottom(true);
        setIsAtBottom(false);
        setHoldProgress(0);
      } else if (distanceToBottom <= 5) {
        setIsNearBottom(true);
        if (!isAtBottom) setIsAtBottom(true);
      } else {
        setIsNearBottom(false);
        setIsAtBottom(false);
        setHoldProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call once to initialize
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAtBottom, isUnlocked]);

  useEffect(() => {
    let interval: any;
    if (isAtBottom && !isUnlocked) {
      interval = setInterval(() => {
        setHoldProgress(prev => {
          if (prev >= 100) {
            setIsUnlocked(true);
            return 100;
          }
          return prev + 2; // 1 second total hold time (50 ticks of 20ms)
        });
      }, 20);
    } else {
      setHoldProgress(0);
    }
    
    return () => clearInterval(interval);
  }, [isAtBottom, isUnlocked]);

  return (
    <>
      {!isUnlocked && (
        <div className="h-[25vh] bg-editorial-cream flex flex-col items-center justify-end pb-12 relative z-10">
          <motion.div 
            animate={{ opacity: isNearBottom ? 1 : 0, y: isNearBottom ? 0 : 10 }}
            className="flex flex-col items-center transition-opacity duration-500"
          >
            <Lock size={16} className={`mb-4 transition-colors duration-300 ${isAtBottom ? 'text-editorial-accent' : 'text-editorial-black/30'}`} />
            <div className="text-editorial-black/40 text-[10px] tracking-[0.3em] uppercase h-6">
              {isAtBottom ? 'Holding...' : isNearBottom ? 'Keep scrolling & hold' : ''}
            </div>
            <div className="w-32 h-[1px] bg-editorial-black/10 mt-2 relative overflow-hidden">
               <motion.div 
                 className="absolute top-0 left-0 h-full bg-editorial-accent"
                 style={{ width: `${holdProgress}%` }}
                 transition={{ ease: "linear" }}
               />
            </div>
          </motion.div>
        </div>
      )}
      
      <AnimatePresence>
        {isUnlocked && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="overflow-hidden origin-top"
          >
            <Decoder />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
