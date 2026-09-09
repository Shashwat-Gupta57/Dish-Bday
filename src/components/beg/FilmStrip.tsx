import { useRef, useState } from 'react';
import { motion } from 'motion/react';

/**
 * The archive, sideways — with the provenance of every frame attached.
 *
 * Drag, wheel or swipe. It scrolls natively (with data-lenis-prevent so the
 * smooth scroller keeps its hands off) rather than hijacking the page scroll,
 * because a hijacked strip on a trackpad is a trap you can't get out of.
 *
 * Every frame is labelled with where it actually came from. Almost none of it
 * was supplied; the rest was taken out of a chat thread or a story archive.
 */

interface Frame {
  src: string;
  tag: string;
  /** true = supplied directly, rather than recovered from a thread */
  clean?: boolean;
}

const FRAMES: Frame[] = [
  { src: '/photo-1.jpg', tag: 'Source: direct message. Sent by you. Retained.', clean: true },
  { src: '/photo-2.jpg', tag: 'Source: chat. Cropped from a group image, three subjects removed.' },
  { src: '/photo-3.jpg', tag: 'Source: story archive. Captured before expiry.' },
  { src: '/photo-4.jpg', tag: 'Source: chat. Group image. All other subjects cropped out.' },
  { src: '/photo-5.jpg', tag: 'Source: chat, 2023. Sent in error. Not deleted.' },
  { src: '/photo-6.jpg', tag: 'Source: chat. Third-party event. Subject incidental to frame.' },
  { src: '/photo-7.jpg', tag: 'Source: chat. Heavily cropped. Aspect ratio non-standard.' },
  { src: '/photo-8.jpg', tag: 'Source: chat. Resolution 267px. Compression artefacts present.' },
  { src: '/photo-9.jpg', tag: 'Source: direct message. Sent by you. Full resolution.', clean: true },
  { src: '/photo-10.jpg', tag: 'Source: chat. Partial subject recovered from group image.' },
  { src: '/photo-11.jpg', tag: 'Source: forwarded screenshot. Re-encoded twice.' },
  { src: '/photo-12.jpg', tag: 'Source: chat thumbnail. Resolution 110px. Used regardless.' },
  { src: '/photo-13.jpg', tag: 'Source: chat. Cropped from an image with a different subject.' },
  { src: '/photo-14.jpg', tag: 'Source: direct message. Sent by you. Unmodified.', clean: true },
  { src: '/photo-15.jpg', tag: 'Source: chat. Extracted from group image, three subjects removed.' },
  { src: '/photo-16.jpg', tag: 'Source: story archive. Subject of post was a meal.' },
  { src: '/photo-17.jpg', tag: 'Source: chat. Photographer unknown. Forwarded to me.' },
  { src: '/photo-18.jpg', tag: 'Source: chat. Cropped. Adjacent subject removed at shoulder.' },
  { src: '/photo-19.jpg', tag: 'Source: chat archive. Used in two sections of this site.' },
  { src: '/photo-20.jpg', tag: 'Source: chat. Motion blur. Applied at reduced opacity.' },
  { src: '/photo-21.jpg', tag: 'Source: chat. Blur filter applied to mask source quality.' },
  { src: '/photo-22.jpg', tag: 'Source: chat. Resolution 359px. Placed in background layer.' },
  { src: '/photo-23.jpg', tag: 'Source: chat archive. Usable quality. Used at 10% opacity.' },
  { src: '/photo-24.jpg', tag: 'Source: chat. Group image, formal event. Subject isolated.' },
  { src: '/photo-25.jpg', tag: 'Source: chat archive. Background layer only.' },
  { src: '/photo-26.jpg', tag: 'Source: direct message. Sent by you. Carried one section alone.', clean: true },
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
          Asset register &middot; {FRAMES.length} frames
        </p>
        <p className="font-soft text-xs text-berry/40">drag to scroll &rarr;</p>
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
            : 'Select a frame to view its source record.'}
        </motion.p>
      </div>

      <p className="mt-6 font-soft text-sm leading-relaxed text-berry/60 bg-petal/50 rounded-2xl px-5 py-4">
        <strong className="text-berry">Summary:</strong>{' '}
        <strong className="text-candy">{cleanCount} of {FRAMES.length}</strong> frames were
        supplied directly. The remaining {FRAMES.length - cleanCount} were recovered from chat
        threads, group images and story archives. Four are below usable resolution and were
        placed behind blur or opacity to hide it. This is the working set.
      </p>
    </div>
  );
}
