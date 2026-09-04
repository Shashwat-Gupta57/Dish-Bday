import { motion } from 'motion/react';

/**
 * Plate I — the labelled specimen.
 *
 * Anchors are percentages of a square frame, matched to photo-1: head at top
 * centre, phone raised over the face, one hand at the waist, saree to the floor.
 * Because the source is 1080×1080 the plate is square too — an aspect-[4/5]
 * frame would crop the legs off a full-body shot and strand the lower callouts.
 */

interface Callout {
  n: string;
  x: number;
  y: number;
  side: 'left' | 'right';
  label: string;
  note: string;
}

const CALLOUTS: Callout[] = [
  {
    n: '01',
    x: 46,
    y: 9,
    side: 'left',
    label: 'CRANIAL REGION',
    note: '90% "I have so much to study", 10% deciding what to eat next. Zero percent actual studying.',
  },
  {
    n: '02',
    x: 59,
    y: 15,
    side: 'right',
    label: 'PRIMARY FACIAL FEATURE',
    note: 'The "Candid" face. Automatically deployed within 0.4s of a camera lens. We know it\'s fake, Dishita. Kitna bhi baddie ban jao, rahogi to baby face + aunty vibes wali hi 😝',
  },
  {
    n: '03',
    x: 62,
    y: 27,
    side: 'right',
    label: 'GRIP, UPPER',
    note: 'Phone-holding claw. Superhuman strength when clicking 400 identical selfies. Completely useless for holding a pen.',
  },
  {
    n: '04',
    x: 45,
    y: 52,
    side: 'left',
    label: 'LOAD-BEARING MIDSECTION',
    note: 'The Fulki Storage Unit. Currently holding yesterday\'s "stress diet". Do not blame the syllabus for this.',
  },
  {
    n: '05',
    x: 55,
    y: 68,
    side: 'right',
    label: 'FIST, CLENCHED',
    note: 'Contains either fake anger at her bestie or a half-eaten burger. Studies confirm it is always the burger.',
  },
  {
    n: '06',
    x: 57,
    y: 88,
    side: 'left',
    label: 'CENTRE OF MASS',
    note: 'The Center of Audacity. Where all that main character energy and unmatched ego is securely stored.',
  },
];

export default function SubjectDiagram() {
  return (
    <section className="border-2 border-editorial-black mb-8">
      <header className="bg-editorial-black text-editorial-cream px-4 py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <h3 className="font-mono text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
          FIG.04 // SPECIMEN, LABELLED
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
          PLATE I &mdash; 06 ANNOTATIONS
        </span>
      </header>

      <div className="p-4 md:p-8">
        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <img
            src="/photo-1.jpg"
            alt="The subject, annotated"
            loading="lazy"
            className="w-full aspect-square object-cover grayscale contrast-[1.15] border-2 border-editorial-black"
          />

          {/* Crosshair anchors sit on the plate at every breakpoint. */}
          {CALLOUTS.map((c, i) => (
            <motion.span
              key={c.n}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
              className="absolute z-20 flex items-center justify-center w-6 h-6 bg-editorial-accent text-editorial-cream font-mono text-[10px] font-bold border-2 border-editorial-cream"
              style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              {c.n}
            </motion.span>
          ))}

          {/* Leaders anchor to the plate edge, not to each callout's own x% —
              a leader starting mid-plate has nowhere to go on a 448px frame,
              so the labels would land on top of the subject. */}
          <div className="hidden lg:block">
            {CALLOUTS.map((c, i) => (
              <motion.div
                key={c.n}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className={`absolute z-10 ${c.side === 'right' ? 'left-full' : 'right-full'}`}
                style={{ top: `${c.y}%` }}
              >
                <div
                  className={`flex items-start ${c.side === 'left' ? 'flex-row-reverse' : ''}`}
                  style={{ transform: 'translateY(-50%)' }}
                >
                  <span className="block w-8 h-[2px] mt-2 shrink-0 bg-editorial-black" />
                  <span
                    className={`block w-[195px] shrink-0 ${
                      c.side === 'left' ? 'text-right pr-2' : 'pl-2'
                    }`}
                  >
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-editorial-black leading-tight">
                      {c.n} {c.label}
                    </span>
                    <span className="block font-mono text-[9px] leading-snug text-editorial-black/65 mt-1">
                      {c.note}
                    </span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* The only version below lg, where leaders would run off the screen. */}
        <ol className="lg:hidden mt-8 border-t-2 border-editorial-black">
          {CALLOUTS.map((c) => (
            <li key={c.n} className="flex gap-3 border-b border-editorial-black/25 py-3">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 bg-editorial-accent text-editorial-cream font-mono text-[10px] font-bold">
                {c.n}
              </span>
              <span>
                <span className="block font-mono text-[11px] font-bold uppercase tracking-[0.1em]">
                  {c.label}
                </span>
                <span className="block font-mono text-[10px] leading-relaxed text-editorial-black/65 mt-1">
                  {c.note}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-6 font-mono text-[10px] md:text-[11px] leading-relaxed text-editorial-black/60 border-l-4 border-editorial-accent pl-3">
          NOTE — Specimen photographed by the specimen, in a mirror, unprompted. Subject was told
          this was for a birthday website and asked zero follow-up questions. The narcissism is truly off the charts.
        </p>
      </div>
    </section>
  );
}
