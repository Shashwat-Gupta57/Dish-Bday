import { useId, useState, type ReactNode } from 'react';

/**
 * Chart primitives for the Clinical Findings page.
 *
 * Palette notes — the site's own two-tone is used rather than a dashboard
 * categorical set. Validated: oxblood #800020 against stone #8A7A66 gives a CVD
 * separation of ΔE 20.1 and a normal-vision separation of ΔE 24.8, both well
 * above their floors, and both clear 3:1 against the cream surface. Two checks
 * are knowingly failed: oxblood sits below the categorical lightness band (it is
 * the site's brand colour) and the stone sits below the chroma floor (it is
 * meant to read as flat and inert — that is the joke). Both series are direct-
 * labelled, so identity never rests on colour alone.
 */
export const INK = '#111111';
export const ACCENT = '#800020';
export const STONE = '#8A7A66';
const GRID = 'rgba(17,17,17,0.10)';
const SURFACE = '#F9F8F6';

const PAD = { top: 28, right: 96, bottom: 40, left: 56 };
const W = 720;
const H = 320;

// ---------------------------------------------------------------- Figure shell

/**
 * Brutalism is applied to the *chrome* — hard frames, inverted header bars,
 * mono caps. It stops at the plot edge. Inside, the grid stays a recessive
 * hairline and the marks stay thin, because a heavy grid genuinely damages
 * readability and the joke needs the numbers to be legible.
 */
export function Figure({
  n,
  title,
  caption,
  readout,
  table,
  children,
}: {
  n: string;
  title: string;
  caption: string;
  readout?: string | null;
  table: { head: string[]; rows: (string | number)[][] };
  children: ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <figure className="border-2 border-editorial-black mb-8">
      <figcaption className="bg-editorial-black text-editorial-cream px-4 py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <h3 className="font-mono text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
          FIG.{n} // {title}
        </h3>
        <div className="flex items-center gap-5">
          {/* Hover/focus readout. Every value is also direct-labelled and in
              the table, so nothing is gated behind a pointer. */}
          <span className="font-mono text-[10px] tabular-nums opacity-70 min-h-4">
            {readout ?? ''}
          </span>
          <button
            onClick={() => setShowTable((v) => !v)}
            className="font-mono text-[10px] uppercase tracking-[0.2em] border border-editorial-cream/50 px-2 py-0.5 hover:bg-editorial-cream hover:text-editorial-black transition-colors shrink-0"
          >
            {showTable ? 'CHART' : 'TABLE'}
          </button>
        </div>
      </figcaption>

      <div className="p-4 md:p-6">
        {showTable ? (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-editorial-black">
                  {table.head.map((h) => (
                    <th
                      key={h}
                      className="text-left font-bold uppercase tracking-[0.15em] text-[10px] py-2 pr-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-b border-editorial-black/20">
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 pr-6 tabular-nums text-editorial-black/80">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px] h-auto" role="img">
              {children}
            </svg>
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] md:text-[11px] leading-relaxed text-editorial-black/70 border-t-2 border-editorial-black px-4 py-3">
        {caption}
      </p>
    </figure>
  );
}

// ------------------------------------------------------------------ Line chart

interface Series {
  label: string;
  color: string;
  points: { x: number; y: number }[];
}

export function LineChart({
  series,
  yMax,
  yLabel,
  xTicks,
  onHover,
  annotation,
}: {
  series: Series[];
  yMax: number;
  yLabel: string;
  xTicks: number[];
  onHover?: (text: string | null) => void;
  annotation?: { x: number; text: string };
}) {
  const uid = useId();
  const xs = series[0].points.map((p) => p.x);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);

  const px = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * (W - PAD.left - PAD.right);
  const py = (y: number) => H - PAD.bottom - (y / yMax) * (H - PAD.top - PAD.bottom);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yMax * f));

  return (
    <>
      {/* Solid hairline grid, one shade off the surface. Never dashed. */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={py(t)} y2={py(t)} stroke={GRID} strokeWidth={1} />
          <text
            x={PAD.left - 12}
            y={py(t)}
            textAnchor="end"
            dominantBaseline="middle"
            className="font-mono"
            style={{ fontSize: 11, fill: 'rgba(17,17,17,0.45)', fontVariantNumeric: 'tabular-nums' }}
          >
            {t}
          </text>
        </g>
      ))}

      <text
        x={PAD.left - 12}
        y={PAD.top - 12}
        textAnchor="end"
        className="font-mono"
        style={{ fontSize: 9, fill: 'rgba(17,17,17,0.40)', letterSpacing: '0.12em' }}
      >
        {yLabel}
      </text>

      {xTicks.map((t) => (
        <text
          key={t}
          x={px(t)}
          y={H - PAD.bottom + 20}
          textAnchor="middle"
          className="font-mono"
          style={{ fontSize: 11, fill: 'rgba(17,17,17,0.45)', fontVariantNumeric: 'tabular-nums' }}
        >
          {t}
        </text>
      ))}

      {annotation && (
        <g>
          <line
            x1={px(annotation.x)}
            x2={px(annotation.x)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="rgba(17,17,17,0.22)"
            strokeWidth={1}
          />
          <text
            x={px(annotation.x) + 8}
            y={PAD.top + 12}
            className="font-mono"
            style={{ fontSize: 10, fill: 'rgba(17,17,17,0.50)', letterSpacing: '0.1em' }}
          >
            {annotation.text}
          </text>
        </g>
      )}

      {series.map((s) => {
        const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.x)},${py(p.y)}`).join(' ');
        const last = s.points[s.points.length - 1];
        return (
          <g key={s.label}>
            <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {/* Endpoint marker with a 2px surface ring, and a direct label —
                so the series is identified without relying on its colour. */}
            <circle cx={px(last.x)} cy={py(last.y)} r={5} fill={s.color} stroke={SURFACE} strokeWidth={2} />
            <text
              x={px(last.x) + 12}
              y={py(last.y)}
              dominantBaseline="middle"
              className="font-mono"
              style={{ fontSize: 11, fill: 'rgba(17,17,17,0.75)' }}
            >
              {s.label}
            </text>
            {/* Generous hit targets for hover and keyboard focus. */}
            {s.points.map((p) => (
              <circle
                key={`${uid}-${s.label}-${p.x}`}
                cx={px(p.x)}
                cy={py(p.y)}
                r={14}
                fill="transparent"
                tabIndex={0}
                style={{ outline: 'none', cursor: 'crosshair' }}
                onMouseEnter={() => onHover?.(`${p.x} · ${s.label} · ${p.y}`)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(`${p.x} · ${s.label} · ${p.y}`)}
                onBlur={() => onHover?.(null)}
              />
            ))}
          </g>
        );
      })}

      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={H - PAD.bottom}
        y2={H - PAD.bottom}
        stroke="rgba(17,17,17,0.25)"
        strokeWidth={1}
      />
    </>
  );
}

// ------------------------------------------------------------- Vertical bars

export function BarChart({
  data,
  yMax,
  yLabel,
  onHover,
  highlightFrom,
}: {
  data: { x: string; y: number }[];
  yMax: number;
  yLabel: string;
  onHover?: (text: string | null) => void;
  highlightFrom?: string;
}) {
  const inner = W - PAD.left - PAD.right;
  const slot = inner / data.length;
  // A 2px surface gap between adjacent bars — never a border around them.
  const barW = slot - 2;
  const py = (y: number) => H - PAD.bottom - (y / yMax) * (H - PAD.top - PAD.bottom);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(yMax * f));

  const hiIndex = highlightFrom ? data.findIndex((d) => d.x === highlightFrom) : -1;

  return (
    <>
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={W - PAD.right} y1={py(t)} y2={py(t)} stroke={GRID} strokeWidth={1} />
          <text
            x={PAD.left - 12}
            y={py(t)}
            textAnchor="end"
            dominantBaseline="middle"
            className="font-mono"
            style={{ fontSize: 11, fill: 'rgba(17,17,17,0.45)', fontVariantNumeric: 'tabular-nums' }}
          >
            {t}
          </text>
        </g>
      ))}

      <text
        x={PAD.left - 12}
        y={PAD.top - 12}
        textAnchor="end"
        className="font-mono"
        style={{ fontSize: 9, fill: 'rgba(17,17,17,0.40)', letterSpacing: '0.12em' }}
      >
        {yLabel}
      </text>

      {hiIndex >= 0 && (
        <g>
          <line
            x1={PAD.left + hiIndex * slot}
            x2={PAD.left + hiIndex * slot}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="rgba(17,17,17,0.22)"
            strokeWidth={1}
          />
          <text
            x={PAD.left + hiIndex * slot + 8}
            y={PAD.top + 12}
            className="font-mono"
            style={{ fontSize: 10, fill: 'rgba(17,17,17,0.50)', letterSpacing: '0.1em' }}
          >
            coaching begins
          </text>
        </g>
      )}

      {data.map((d, i) => {
        const x = PAD.left + i * slot + 1;
        const y = py(d.y);
        const h = H - PAD.bottom - y;
        const isLast = i === data.length - 1;
        return (
          <g key={d.x}>
            {/* 4px rounded data-end, anchored square to the baseline. */}
            <path
              d={`M${x},${H - PAD.bottom} L${x},${y + 4} Q${x},${y} ${x + 4},${y} L${x + barW - 4},${y} Q${x + barW},${y} ${x + barW},${y + 4} L${x + barW},${H - PAD.bottom} Z`}
              fill={ACCENT}
              opacity={isLast ? 1 : 0.82}
            />
            <rect
              x={x}
              y={PAD.top}
              width={barW}
              height={H - PAD.bottom - PAD.top}
              fill="transparent"
              tabIndex={0}
              style={{ outline: 'none', cursor: 'crosshair' }}
              onMouseEnter={() => onHover?.(`${d.x} · ${d.y}`)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(`${d.x} · ${d.y}`)}
              onBlur={() => onHover?.(null)}
            />
            {/* Only the final bar is direct-labelled — a number on every bar is noise. */}
            {isLast && (
              <text
                x={x + barW / 2}
                y={y - 10}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 12, fill: ACCENT, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
              >
                {d.y}
              </text>
            )}
            <text
              x={x + barW / 2}
              y={H - PAD.bottom + 20}
              textAnchor="middle"
              className="font-mono"
              style={{ fontSize: 11, fill: 'rgba(17,17,17,0.45)', fontVariantNumeric: 'tabular-nums' }}
            >
              {d.x}
            </text>
          </g>
        );
      })}

      <line
        x1={PAD.left}
        x2={W - PAD.right}
        y1={H - PAD.bottom}
        y2={H - PAD.bottom}
        stroke="rgba(17,17,17,0.25)"
        strokeWidth={1}
      />
    </>
  );
}

// ----------------------------------------------------------- Horizontal bars

export function HBarChart({
  data,
  onHover,
}: {
  data: { label: string; value: number }[];
  onHover?: (text: string | null) => void;
}) {
  const rowH = 40;
  const height = data.length * rowH + 24;
  const labelW = 250;
  const trackW = W - labelW - 90;
  const max = Math.max(...data.map((d) => d.value));

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full min-w-[520px] h-auto" role="img">
      {data.map((d, i) => {
        const y = i * rowH + 12;
        // 2px surface gap between adjacent bars, not a border.
        const barH = rowH - 16;
        const w = Math.max((d.value / max) * trackW, 3);
        return (
          <g key={d.label}>
            <text
              x={labelW - 16}
              y={y + barH / 2}
              textAnchor="end"
              dominantBaseline="middle"
              className="font-mono"
              style={{ fontSize: 12, fill: 'rgba(17,17,17,0.80)', textTransform: 'uppercase' }}
            >
              {d.label}
            </text>
            <path
              d={`M${labelW},${y} L${labelW + w - 4},${y} Q${labelW + w},${y} ${labelW + w},${y + 4} L${labelW + w},${y + barH - 4} Q${labelW + w},${y + barH} ${labelW + w - 4},${y + barH} L${labelW},${y + barH} Z`}
              fill={ACCENT}
            />
            {/* Value sits outside the bar end, so it can never be clipped by a
                short segment. */}
            <text
              x={labelW + w + 12}
              y={y + barH / 2}
              dominantBaseline="middle"
              className="font-mono"
              style={{ fontSize: 12, fill: 'rgba(17,17,17,0.60)', fontVariantNumeric: 'tabular-nums' }}
            >
              {d.value}%
            </text>
            <rect
              x={labelW}
              y={y - 4}
              width={trackW}
              height={barH + 8}
              fill="transparent"
              tabIndex={0}
              style={{ outline: 'none', cursor: 'crosshair' }}
              onMouseEnter={() => onHover?.(`${d.label} · ${d.value}%`)}
              onMouseLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(`${d.label} · ${d.value}%`)}
              onBlur={() => onHover?.(null)}
            />
          </g>
        );
      })}
      <line x1={labelW} x2={labelW} y1={4} y2={height - 16} stroke="rgba(17,17,17,0.25)" strokeWidth={1} />
    </svg>
  );
}

// --------------------------------------------------------------------- Legend

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-2 border-2 border-b-0 border-editorial-black px-4 py-3">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-2.5">
          <span aria-hidden="true" className="w-4 h-[3px] shrink-0" style={{ background: it.color }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-editorial-black/70">
            {it.label}
          </span>
        </span>
      ))}
    </div>
  );
}
