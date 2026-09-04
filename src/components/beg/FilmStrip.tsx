import { useRef, useState } from 'react';
import { motion } from 'motion/react';

/**
 * The whole archive, sideways — and the confession attached to it.
 *
 * Drag, wheel or swipe. It scrolls natively (with data-lenis-prevent so the
 * smooth scroller keeps its hands off) rather than hijacking the page scroll,
 * because a hijacked strip on a trackpad is a trap you can't get out of.
 *
 * Every frame carries its real provenance. That's the joke and the argument:
 * most of these were not given, they were extracted.
 */

interface Frame {
  src: string;
  tag: string;
  /** true = actually a decent, intentional photo of her */
  clean?: boolean;
}

const FRAMES: Frame[] = [
  { src: '/photo-1.jpg', tag: 'Mirror selfie. The one (1) good one.', clean: true },
  { src: '/photo-2.jpg', tag: 'Cropped. There were three other people here.' },
  { src: '/photo-3.jpg', tag: 'Screenshotted off your story before it expired.' },
  { src: '/photo-4.jpg', tag: 'Group photo. Everyone else has been surgically removed.' },
  { src: '/photo-5.jpg', tag: 'Sent to me by mistake in 2023. Never deleted.' },
  { src: '/photo-6.jpg', tag: 'Someone else’s birthday. You were in the background.' },
  { src: '/photo-7.jpg', tag: 'Cropped so hard the aspect ratio is a war crime.' },
  { src: '/photo-8.jpg', tag: '267 pixels wide. Two hundred and sixty-seven.' },
  { src: '/photo-9.jpg', tag: 'Actually good. Rare. Treasured.', clean: true },
  { src: '/photo-10.jpg', tag: 'Half of a group photo. Your shoulder made the cut.' },
  { src: '/photo-11.jpg', tag: 'Screenshot of a screenshot. The JPEG is crying.' },
  { src: '/photo-12.jpg', tag: '110×110. This is a thumbnail. I used it anyway.' },
  { src: '/photo-13.jpg', tag: 'Cropped from a photo where you were not the subject.' },
  { src: '/photo-14.jpg', tag: 'Fine. This one you actually sent. Thank you.', clean: true },
  { src: '/photo-15.jpg', tag: 'Extracted from a group photo. Three besties evicted.' },
  { src: '/photo-16.jpg', tag: 'From a story about food. You were incidental.' },
  { src: '/photo-17.jpg', tag: 'Someone else took this. I have no rights to it.' },
  { src: '/photo-18.jpg', tag: 'Cropped. Original had a hand on your shoulder. Whose?' },
  { src: '/photo-19.jpg', tag: 'Used twice on this site because I ran out.' },
  { src: '/photo-20.jpg', tag: 'Blurry. Used at 40% opacity so nobody notices.' },
  { src: '/photo-21.jpg', tag: 'Behind a blur filter for structural reasons.' },
  { src: '/photo-22.jpg', tag: '359 pixels. Hidden in a background collage. Sorry.' },
  { src: '/photo-23.jpg', tag: 'Good photo. Used blurred at 10% opacity. Tragic.' },
  { src: '/photo-24.jpg', tag: 'Cropped from a group shot at what looks like a wedding.' },
  { src: '/photo-25.jpg', tag: 'In the background of the finale. Barely visible.' },
  { src: '/photo-26.jpg', tag: 'The Virgo page. Carried an entire section alone.', clean: true },
];

export default function FilmStrip() {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0 });
  const [active, setActive] = useState<number | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = scroller.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = scroller.current;
    if (!el || !drag.current.active) return;
    el.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
  };

  const endDrag = (e: React.PointerEvent) => {
    const el = scroller.current;
    drag.current.active = false;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
  };

  const cleanCount = FRAMES.filter((f) => f.clean).length;

  return (
    <div className="relative">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-5 px-1">
        <p className="font-soft text-xs tracking-[0.25em] uppercase text-berry/50">
          The entire archive &middot; {FRAMES.length} frames
        </p>
        <p className="font-soft text-xs text-berry/40">drag me &rarr;</p>
      </div>

      {/* The strip */}
      <div className="bg-[#2A2027] rounded-3xl py-3 shadow-[0_20px_45px_-20px_rgba(176,48,85,0.5)]">
        {/* Sprocket holes, top */}
        <div className="flex gap-3 px-4 pb-2 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="w-4 h-2.5 rounded-[3px] bg-sugar/85 shrink-0" />
          ))}
        </div>

        <div
          ref={scroller}
          data-lenis-prevent
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="flex gap-3 overflow-x-auto px-4 py-1 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FRAMES.map((f, i) => (
            <button
              key={f.src}
              onClick={() => setActive(active === i ? null : i)}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="relative shrink-0 w-36 md:w-44 group"
              aria-label={f.tag}
            >
              <img
                src={f.src}
                alt=""
                loading="lazy"
                draggable={false}
                className={`w-full aspect-square object-cover rounded-lg transition-all duration-500 ${
                  active === i ? 'grayscale-0 brightness-100' : 'grayscale brightness-75'
                }`}
              />
              <span className="absolute top-1.5 left-2 font-mono text-[9px] text-sugar/70 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              {f.clean && (
                <span
                  className="absolute top-1.5 right-2 text-[11px]"
                  title="Actually sent to me"
                  aria-hidden="true"
                >
                  ⭐
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sprocket holes, bottom */}
        <div className="flex gap-3 px-4 pt-2 overflow-hidden" aria-hidden="true">
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="w-4 h-2.5 rounded-[3px] bg-sugar/85 shrink-0" />
          ))}
        </div>
      </div>

      {/* Provenance readout — one line, always present, so the strip never jumps. */}
      <div className="mt-5 min-h-[3.5rem] flex items-start gap-3 px-1">
        <span className="font-mono text-[10px] text-candy shrink-0 mt-1 tabular-nums">
          {active !== null ? String(active + 1).padStart(2, '0') : '--'}
        </span>
        <motion.p
          key={active ?? 'none'}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="font-soft text-sm md:text-base text-berry/70 leading-relaxed"
        >
          {active !== null
            ? FRAMES[active].tag
            : 'Touch any frame and it will tell you where it actually came from. Brace yourself.'}
        </motion.p>
      </div>

      <p className="mt-6 font-soft text-sm leading-relaxed text-berry/60 bg-petal/50 rounded-2xl px-5 py-4">
        <strong className="text-berry">Full disclosure:</strong> only{' '}
        <strong className="text-candy">{cleanCount} of {FRAMES.length}</strong> of these were
        genuinely sent to me. The rest are cropped out of group photos, lifted off expired
        stories, or rescued from a chat in 2023. Some are 110 pixels wide. I blurred four of them
        on purpose so you would not notice how bad they were. This is what I have been working
        with.
      </p>
    </div>
  );
}
