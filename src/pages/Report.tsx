import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEggs } from '../lib/EggContext';
import BackLink from '../components/BackLink';
import SubjectDiagram from '../components/report/SubjectDiagram';
import { Figure, LineChart, BarChart, HBarChart, Legend, ACCENT, STONE } from '../components/report/charts';

/**
 * Brutalist by deliberate contrast.
 *
 * The rest of the site is Playfair, cream and generous margins. This one page is
 * mono, hard-ruled and crammed, so it reads as a photocopied dossier that got
 * loose inside a fashion magazine. The break is the joke.
 */

const AGE = [
  { x: 2007, y: 0 }, { x: 2010, y: 3 }, { x: 2013, y: 6 }, { x: 2016, y: 9 },
  { x: 2019, y: 12 }, { x: 2022, y: 15 }, { x: 2024, y: 17 }, { x: 2026, y: 19 },
];

const FULKI = [
  { x: '2019', y: 40 }, { x: '2020', y: 65 }, { x: '2021', y: 90 },
  { x: '2022', y: 150 }, { x: '2023', y: 210 }, { x: '2024', y: 340 },
  { x: '2025', y: 480 }, { x: '2026', y: 610 },
];

// Both series indexed to 100 at 2019 so they share one axis. Two y-scales on
// one plot would invent a correlation that isn't in the data — which would
// wreck the joke, since the absence of one is the entire point.
const INTAKE = [
  { x: 2019, y: 100 }, { x: 2020, y: 163 }, { x: 2021, y: 225 }, { x: 2022, y: 375 },
  { x: 2023, y: 525 }, { x: 2024, y: 850 }, { x: 2025, y: 1200 }, { x: 2026, y: 1525 },
];
const STRESSORS = [
  { x: 2019, y: 100 }, { x: 2020, y: 104 }, { x: 2021, y: 98 }, { x: 2022, y: 107 },
  { x: 2023, y: 101 }, { x: 2024, y: 112 }, { x: 2025, y: 105 }, { x: 2026, y: 109 },
];

const COMPOSITION = [
  { label: 'Spicy Water (Fulki)', value: 34 },
  { label: 'Inhaled Burgers', value: 22 },
  { label: 'Main Character Ego', value: 19 },
  { label: 'Audacity', value: 14 },
  { label: 'Selfies (Rejected)', value: 8 },
  { label: 'Actual Human Being', value: 3 },
];

const META = [
  ['REF NO.', '09-13-2007/AUNTY'],
  ['SUBJECT', 'DISHITA (THE DRAMA QUEEN)'],
  ['AGE AT FILING', '19 YRS (ANCIENT)'],
  ['CLASSIFICATION', 'RESTRICTED (FOR HER PR)'],
  ['OBSERVATION PERIOD', 'TOO MANY YEARS'],
  ['CONSENT OBTAINED', 'LMAO NO'],
  ['PEER REVIEWED', 'BY MYSELF (I AM RIGHT)'],
  ['PUBLISHED ANYWAY', 'DUH'],
];

const TICKER = [
  'INTAKE UP 1425% SINCE 2019',
  'DELUSION UP 9000%',
  'YOUR "STRESS" EXCUSE REJECTED BY THE SUPREME COURT OF BESTIES',
  'ACTUAL HUMAN: 3%',
  'SUBJECT STILL CLAIMING SHE IS BASICALLY 17',
  'WE HAVE THE RECEIPTS, AUNTY',
];

const FOOTNOTES = [
  'All intake figures are self-reported. The panel assumes the actual number of burgers inhaled is at least 3x higher.',
  'The term "stress eating" is used by the subject as a get-out-of-jail-free card for poor self-control. Denied.',
  'Subject was offered the opportunity to respond to these findings and replied, verbatim, "shut up you minor".',
  'The lead researcher is 17 and therefore legally protected under the POCSO act. Your 19-year-old rage cannot hurt me. Cope.',
];

export default function Report() {
  const { find } = useEggs();
  const [readout, setReadout] = useState<Record<string, string | null>>({});

  useEffect(() => {
    find('findings');
  }, [find]);

  const set = (k: string) => (v: string | null) => setReadout((r) => ({ ...r, [k]: v }));

  return (
    <div className="min-h-screen bg-editorial-cream text-editorial-black font-mono">
      {/* Masthead */}
      <header className="border-b-4 border-editorial-black">
        <div className="flex items-stretch justify-between border-b-2 border-editorial-black">
          <BackLink className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] border-r-2 border-editorial-black hover:bg-editorial-black hover:text-editorial-cream transition-colors">
            &larr; BACK
          </BackLink>
          <span className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] opacity-60 self-center">
            DOC 04 OF 04
          </span>
        </div>

        <div className="bg-editorial-black text-editorial-cream px-4 py-8 md:py-12 relative overflow-hidden">
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-4">
            SPECIAL REPORT / RESTRICTED CIRCULATION / DO NOT FORWARD
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold uppercase leading-[0.85] tracking-tighter">
            CLINICAL
            <br />
            FINDINGS
          </h1>
          <span className="absolute top-6 right-4 md:right-10 border-4 border-editorial-accent text-editorial-accent px-3 py-1 text-xs md:text-base font-bold uppercase tracking-widest rotate-12 select-none">
            EXHIBIT A
          </span>
        </div>

        {/* Ticker — duplicated once so the loop is seamless. */}
        <div className="bg-editorial-accent text-editorial-cream border-t-2 border-editorial-black overflow-hidden py-1.5">
          <div className="ticker-track">
            {[0, 1].map((dup) => (
              <span key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
                {TICKER.map((t) => (
                  <span key={t} className="text-[10px] uppercase tracking-[0.2em] px-6">
                    {t} &nbsp;///
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main className="px-3 md:px-6 py-6 md:py-8 max-w-6xl mx-auto">
        {/* Crammed metadata grid */}
        <section className="border-2 border-editorial-black mb-8 grid grid-cols-2 md:grid-cols-4">
          {META.map(([k, v], i) => (
            <div
              key={k}
              className={`px-3 py-2.5 border-editorial-black ${
                (i + 1) % 2 === 0 ? '' : 'border-r-2'
              } ${i < META.length - 2 ? 'border-b-2' : ''} md:border-r-2 md:[&:nth-child(4n)]:border-r-0 md:[&:nth-child(-n+4)]:border-b-2`}
            >
              <p className="text-[9px] uppercase tracking-[0.2em] opacity-50">{k}</p>
              <p className="text-[11px] md:text-xs font-bold uppercase mt-1 break-words">{v}</p>
            </div>
          ))}
        </section>

        <section className="border-2 border-editorial-black mb-8 p-4 md:p-6">
          <p className="text-xs md:text-sm leading-relaxed max-w-3xl">
            <span className="font-bold uppercase">ABSTRACT &mdash; </span>
            Nineteen years of surviving this specimen. The panel set out to
            test one major claim: that the subject stress-eats because of her "hectic coaching schedule". The
            data laughed. The subject is dramatically louder, heavily fueled by spicy water, and
            insists none of this is her fault. Typical 19-year-old Aunty behavior.
          </p>
        </section>

        {/* Stat wall */}
        <section className="border-2 border-editorial-black mb-8 grid grid-cols-2 lg:grid-cols-4">
          {[
            { v: '19', l: 'YEARS OLD', s: 'BASICALLY A SENIOR CITIZEN' },
            { v: '840+', l: 'FULKIS / YEAR', s: 'WE STOPPED COUNTING' },
            { v: '99%', l: 'EGO DENSITY', s: 'UNPRECEDENTED LEVELS' },
            { v: 'ZERO', l: 'STRESS CORRELATION', s: 'SHE JUST LIKES TO EAT' },
          ].map((s, i) => (
            <div
              key={s.l}
              className={`p-4 md:p-5 border-editorial-black ${i % 2 === 0 ? 'border-r-2' : ''} ${
                i < 2 ? 'border-b-2' : ''
              } lg:border-r-2 lg:border-b-0 lg:last:border-r-0`}
            >
              <p className="text-4xl md:text-5xl font-bold leading-none text-editorial-accent">
                {s.v}
              </p>
              <p className="text-[9px] uppercase tracking-[0.2em] mt-3 font-bold">{s.l}</p>
              <p className="text-[9px] uppercase tracking-[0.15em] opacity-45 mt-0.5">{s.s}</p>
            </div>
          ))}
        </section>

        <Figure
          n="01"
          title="THE AGE CURVE"
          readout={readout.age}
          caption="OBSERVATION — Look at it go up. You are aging. Accept it. Claiming you are 'basically 17' is a biological lie. The math is mathing, and it says you are old."
          table={{ head: ['YEAR', 'AGE'], rows: AGE.map((d) => [d.x, d.y]) }}
        >
          <LineChart
            series={[{ label: 'AGE', color: ACCENT, points: AGE }]}
            yMax={20}
            yLabel="YEARS"
            xTicks={[2007, 2013, 2019, 2026]}
            onHover={set('age')}
          />
        </Figure>

        <Figure
          n="02"
          title="ANNUAL FULKI INTAKE"
          readout={readout.fulki}
          caption="OBSERVATION — The graph literally spikes into the stratosphere. The excuse is 'syllabus', but the reality is just an uncontrollable addiction to spicy water."
          table={{ head: ['YEAR', 'PLATES'], rows: FULKI.map((d) => [d.x, d.y]) }}
        >
          <BarChart data={FULKI} yMax={650} yLabel="PLATES" onHover={set('fulki')} highlightFrom="2024" />
        </Figure>

        <div className="mb-8">
          <Legend
            items={[
              { label: 'Junk consumed (indexed)', color: ACCENT },
              { label: 'Documented stressors (indexed)', color: STONE },
            ]}
          />
          <Figure
            n="03"
            title="THE EXCUSE, TESTED"
            readout={readout.corr}
            caption="FINDING — Stress levels flatlined while junk intake went to the moon. The 'coaching class stress' defense is officially dead. You weren't stressed, you were just bored and hungry for nineteen years straight."
            table={{
              head: ['YEAR', 'JUNK (IDX)', 'STRESSORS (IDX)'],
              rows: INTAKE.map((d, i) => [d.x, d.y, STRESSORS[i].y]),
            }}
          >
            <LineChart
              series={[
                { label: 'JUNK', color: ACCENT, points: INTAKE },
                { label: 'STRESS', color: STONE, points: STRESSORS },
              ]}
              yMax={1600}
              yLabel="INDEX, 2019 = 100"
              xTicks={[2019, 2022, 2026]}
              onHover={set('corr')}
            />
          </Figure>
        </div>

        <SubjectDiagram />

        {/* Fig 05 — horizontal bars, same brutalist frame */}
        <section className="border-2 border-editorial-black mb-8">
          <header className="bg-editorial-black text-editorial-cream px-4 py-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
              FIG.05 // COMPOSITION BY VOLUME
            </h3>
            <span className="text-[10px] tabular-nums opacity-70 min-h-4">{readout.comp ?? ''}</span>
          </header>
          <div className="p-4 md:p-6 overflow-x-auto">
            <HBarChart data={COMPOSITION} onHover={set('comp')} />
          </div>
          <p className="text-[10px] md:text-[11px] leading-relaxed text-editorial-black/70 border-t-2 border-editorial-black px-4 py-3">
            FINDING — Full breakdown of present composition. The panel wishes to stress that
            three percent actual human being is concerningly low, but expected for someone with this level of audacity.
          </p>
        </section>

        {/* Verdict */}
        <section className="border-2 border-editorial-black mb-8">
          <header className="bg-editorial-accent text-editorial-cream px-4 py-2">
            <h3 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
              CONCLUSION // FINAL
            </h3>
          </header>
          <div className="p-4 md:p-8">
            <p className="text-xl md:text-3xl font-bold uppercase leading-tight mb-6 max-w-3xl">
              THE SUBJECT IS OFFICIALLY 19, MADE ENTIRELY OF STREET FOOD AND AUDACITY, AND HAS NEVER ONCE BEEN TRULY STRESSED &mdash; JUST PERPETUALLY HUNGRY AND DRAMATIC.
            </p>
            <p className="text-xs md:text-sm leading-relaxed max-w-2xl opacity-75">
              The panel recommends a reality check. The panel also acknowledges it is 17 and therefore technically a minor bullying an elder. We do not care.
            </p>
          </div>
        </section>

        {/* Footnotes, crammed */}
        <section className="border-2 border-editorial-black mb-8">
          <header className="border-b-2 border-editorial-black px-4 py-2">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.25em]">NOTES &amp; CAVEATS</h3>
          </header>
          <ol className="divide-y divide-editorial-black/20">
            {FOOTNOTES.map((f, i) => (
              <li key={i} className="flex gap-3 px-4 py-2.5">
                <span className="text-[10px] font-bold text-editorial-accent shrink-0">
                  [{String(i + 1).padStart(2, '0')}]
                </span>
                <span className="text-[10px] md:text-[11px] leading-relaxed opacity-75">{f}</span>
              </li>
            ))}
          </ol>
        </section>

        <footer className="flex flex-wrap gap-x-6 gap-y-2 border-2 border-editorial-black">
          <BackLink className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-editorial-black hover:text-editorial-cream transition-colors">
            &larr; BACK TO THE ISSUE
          </BackLink>
          <Link
            to="/legal"
            className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] hover:bg-editorial-black hover:text-editorial-cream transition-colors"
          >
            TERMS &amp; CONDITIONS
          </Link>
          <span className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] opacity-40 ml-auto">
            END OF FILE
          </span>
        </footer>
      </main>
    </div>
  );
}
