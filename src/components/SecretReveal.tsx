import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Decoder from './Decoder';
import { Lock, Unlock } from 'lucide-react';
import { useEggs } from '../lib/EggContext';

/**
 * The gate on the Decoder.
 *
 * The old version demanded you land within 5px of the exact document bottom,
 * measured off `document.body.offsetHeight`, on a scroll listener that never
 * re-ran on resize. Subpixel rounding or a mobile URL bar resizing the viewport
 * was enough to lock the Decoder — and the only link to the Terms page — away
 * permanently. This widens the window, measures the right element, re-checks on
 * resize and load, and adds a second way in: nine stamps opens it outright.
 */

/** How close to the foot of the page counts as "here". */
const BOTTOM_THRESHOLD = 30;

export default function SecretReveal() {
  const { complete } = useEggs();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Nine stamps is its own key.
  useEffect(() => {
    if (complete) setIsUnlocked(true);
  }, [complete]);

  const measure = useCallback(() => {
    if (isUnlocked) return;

    const doc = document.documentElement;
    const scrollPosition = window.scrollY + window.innerHeight;
    // scrollHeight on the documentElement, not offsetHeight on the body — body
    // height is wrong the moment margins or overflow are in play.
    const totalHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const distanceToBottom = totalHeight - scrollPosition;

    if (distanceToBottom <= BOTTOM_THRESHOLD) {
      setIsNearBottom(true);
      setIsAtBottom(true);
    } else if (distanceToBottom < 320) {
      setIsNearBottom(true);
      setIsAtBottom(false);
      setHoldProgress(0);
    } else {
      setIsNearBottom(false);
      setIsAtBottom(false);
      setHoldProgress(0);
    }
  }, [isUnlocked]);

  useEffect(() => {
    // passive: the listener never calls preventDefault, and this section shares
    // the main thread with every parallax subscription on the page.
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure();

    // Images land after first paint and change the page height under us.
    const t = window.setTimeout(measure, 800);

    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('load', measure);
      window.clearTimeout(t);
    };
  }, [measure]);

  useEffect(() => {
    if (!isAtBottom || isUnlocked) {
      setHoldProgress(0);
      return;
    }
    const interval = window.setInterval(() => {
      setHoldProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 20);
    return () => window.clearInterval(interval);
  }, [isAtBottom, isUnlocked]);

  // Unlocking lives in an effect rather than inside the state updater, so it
  // stays pure and survives StrictMode's double invocation.
  useEffect(() => {
    if (holdProgress >= 100 && !isUnlocked) setIsUnlocked(true);
  }, [holdProgress, isUnlocked]);

  return (
    <>
      {!isUnlocked && (
        <div className="h-[25vh] bg-editorial-cream flex flex-col items-center justify-end pb-12 relative z-10">
          <motion.div
            animate={{ opacity: isNearBottom ? 1 : 0, y: isNearBottom ? 0 : 10 }}
            className="flex flex-col items-center transition-opacity duration-500"
          >
            {isAtBottom ? (
              <Unlock size={16} className="mb-4 text-editorial-accent transition-colors duration-300" />
            ) : (
              <Lock size={16} className="mb-4 text-editorial-black/30 transition-colors duration-300" />
            )}
            <div className="text-editorial-black/55 text-[10px] tracking-[0.3em] uppercase h-6">
              {/* It never asked you to hold anything — it fills on its own. */}
              {isAtBottom ? 'Stay here' : isNearBottom ? 'Keep going' : ''}
            </div>
            <div className="w-32 h-[1px] bg-editorial-black/10 mt-2 relative overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-editorial-accent"
                style={{ width: `${holdProgress}%` }}
                transition={{ ease: 'linear' }}
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
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="overflow-hidden origin-top"
          >
            <Decoder />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
