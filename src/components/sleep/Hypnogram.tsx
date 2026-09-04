import { useState } from 'react';

/**
 * FIG. S1 — a hypnogram of one study session.
 *
 * A step chart is the correct form for state-over-time: sleep stage does not
 * interpolate, so a smooth line between "Light" and "Deep" would draw values
 * that never existed. One series, so no legend — the title names it. Grid stays
 * a recessive hairline even though the surface is dark.
 */

const STAGES = ['DEEP', 'LIGHT', 'DROWSY', 'AWAKE'] as const;

interface Point {
  t: number; // minutes since opening the book
  stage: number; // index into STAGES
  note?: string;
}

const SESSION: Point[] = [
  { t: 0, stage: 3, note: 'Opens book' },
  { t: 3, stage: 3, note: 'Reads one line' },
  { t: 5, stage: 2, note: '"Bas 5 minute"' },
  { t: 8, stage: 1 },
  { t: 14, stage: 0, note: 'Gone' },
  { t: 96, stage: 0 },
  { t: 102, stage: 1, note: 'Phone buzzes' },
  { t: 108, stage: 0 },
  { t: 206, stage: 2 },
  { t: 214, stage: 3, note: '"Maine bohot padha aaj"' },
  { t: 220, stage: 3 },
];

const W = 720;
const H = 300;
const PAD = { top: 24, right: 28, bottom: 44, left: 78 };
const ACCENT = '#A99BE8';
const GRID = 'rgba(237,233,245,0.10)';

export default function Hypnogram() {
  const [readout, setReadout] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const tMax = SESSION[SESSION.length - 1].t;
  const px = (t: number) => PAD.left + (t / tMax) * (W - PAD.left - PAD.right);
  const py = (stage: number) =>
    PAD.top + ((STAGES.length - 1 - stage) / (STAGES.length - 1)) * (H - PAD.top - PAD.bottom);

  // Step path: hold the value, then jump. Never diagonal.
  let d = `M${px(SESSION[0].t)},${py(SESSION[0].stage)}`;
  for (let i = 1; i < SESSION.length; i += 1) {
    d += ` L${px(SESSION[i].t)},${py(SESSION[i - 1].stage)}`;
    d += ` L${px(SESSION[i].t)},${py(SESSION[i].stage)}`;
  }

  const hhmm = (t: number) => {
    const total = 16 * 60 + 2 + t; // session starts 16:02
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  return (
    <section className="clay p-6 md:p-8">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-6">
        <div>
          <p className="font-soft text-[10px] tracking-[0.3em] uppercase text-moon/40">Fig. S1</p>
          <h3 className="font-serif text-2xl md:text-3xl italic text-moon mt-1">
            One study session, recorded
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-soft text-xs text-lavender min-h-4 tabular-nums">
            {readout ?? ''}
          </span>
          <button
            onClick={() => setShowTable((v) => !v)}
            className="font-soft text-[10px] tracking-[0.2em] uppercase text-moon/40 hover:text-lavender transition-colors rounded-full border border-moon/15 px-3 py-1"
          >
            {showTable ? 'Chart' : 'Table'}
          </button>
        </div>
      </header>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full font-soft text-sm border-collapse">
            <thead>
              <tr className="border-b border-moon/15">
                {['Clock', 'Elapsed', 'Stage', 'Note'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] uppercase tracking-[0.15em] text-moon/45 py-2 pr-6 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SESSION.map((p, i) => (
                <tr key={i} className="border-b border-moon/5">
                  <td className="py-2 pr-6 tabular-nums text-moon/70">{hhmm(p.t)}</td>
                  <td className="py-2 pr-6 tabular-nums text-moon/70">{p.t}m</td>
                  <td className="py-2 pr-6 text-moon/70">{STAGES[p.stage]}</td>
                  <td className="py-2 pr-6 text-moon/50">{p.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px] h-auto" role="img">
            {STAGES.map((s, i) => (
              <g key={s}>
                <line
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={py(i)}
                  y2={py(i)}
                  stroke={GRID}
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 14}
                  y={py(i)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="font-soft"
                  style={{ fontSize: 10, fill: 'rgba(237,233,245,0.45)', letterSpacing: '0.12em' }}
                >
                  {s}
                </text>
              </g>
            ))}

            {/* The eight-and-a-half minutes of consciousness, marked. */}
            <rect
              x={px(0)}
              y={PAD.top}
              width={px(8) - px(0)}
              height={H - PAD.top - PAD.bottom}
              fill="rgba(169,155,232,0.10)"
            />
            <text
              x={px(8) + 8}
              y={PAD.top + 12}
              className="font-soft"
              style={{ fontSize: 10, fill: 'rgba(169,155,232,0.8)', letterSpacing: '0.1em' }}
            >
              8 MIN OF ACTUAL STUDYING
            </text>

            <path
              d={d}
              fill="none"
              stroke={ACCENT}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {SESSION.filter((p) => p.note).map((p) => (
              <g key={p.t}>
                <circle
                  cx={px(p.t)}
                  cy={py(p.stage)}
                  r={4.5}
                  fill={ACCENT}
                  stroke="#1E1830"
                  strokeWidth={2}
                />
                <circle
                  cx={px(p.t)}
                  cy={py(p.stage)}
                  r={16}
                  fill="transparent"
                  tabIndex={0}
                  style={{ outline: 'none', cursor: 'help' }}
                  onMouseEnter={() => setReadout(`${hhmm(p.t)} · ${p.note}`)}
                  onMouseLeave={() => setReadout(null)}
                  onFocus={() => setReadout(`${hhmm(p.t)} · ${p.note}`)}
                  onBlur={() => setReadout(null)}
                />
              </g>
            ))}

            {[0, 60, 120, 180, 220].map((t) => (
              <text
                key={t}
                x={px(t)}
                y={H - PAD.bottom + 22}
                textAnchor="middle"
                className="font-soft"
                style={{ fontSize: 10, fill: 'rgba(237,233,245,0.4)', fontVariantNumeric: 'tabular-nums' }}
              >
                {hhmm(t)}
              </text>
            ))}
          </svg>
        </div>
      )}

      <p className="mt-6 font-soft text-sm leading-relaxed text-moon/55 max-w-2xl">
        Book opened at 16:02. Deep sleep reached by 16:16. The subject resurfaced at 19:36 and
        reported to three separate people that she had studied all afternoon. Total conscious
        contact with the syllabus: eight minutes, of which five were spent finding a pen.
      </p>
    </section>
  );
}
