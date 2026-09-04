import { motion, useScroll } from 'motion/react';
import { useRef, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hourglass } from 'lucide-react';
import { toast } from 'sonner';
import { usePlaneY } from '../lib/planes';
import { useEggs } from '../lib/EggContext';
import { Annotation } from '../lib/EditorsCut';

interface TimelineProps {
  openPage: (page: 'virgo' | 'vault' | 'dive') => void;
}

const ARCHIVE_ITEMS = [
  { id: '01', type: 'single', photo: '/photo-2.jpg', text: 'Effortlessly iconic.', align: 'left' },
  {
    id: '02',
    type: 'diptych',
    photo1: '/photo-3.jpg',
    photo2: '/photo-4.jpg',
    text: 'Main character energy, day in and day out.',
    align: 'right',
  },
  { id: '03', type: 'single', photo: '/photo-5.jpg', text: 'Ethereal.', align: 'center' },
  {
    id: '04',
    type: 'triptych',
    photo1: '/photo-6.jpg',
    photo2: '/photo-7.jpg',
    photo3: '/photo-8.jpg',
    text: 'The Muse. Always the muse.',
    align: 'left',
  },
  { id: '05', type: 'single', photo: '/photo-9.jpg', text: 'Unmatched.', align: 'right' },
  {
    id: '06',
    type: 'diptych',
    photo1: '/photo-10.jpg',
    photo2: '/photo-11.jpg',
    text: 'Setting the standard.',
    align: 'left',
  },
];

function ArchiveBlock({ item }: { item: (typeof ARCHIVE_ITEMS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Frames sit on MID. Their inner images counter-move on BACK so the crop
  // breathes. Everything obeys the plane speeds; only travel differs.
  const mid = usePlaneY(scrollYProgress, 'mid', 220);
  const midFar = usePlaneY(scrollYProgress, 'mid', 380);
  const back = usePlaneY(scrollYProgress, 'back', 220, true);

  const navigate = useNavigate();
  const { find } = useEggs();

  // Egg 05 lives on the first frame of diptych 02.
  const isReminderFrame = item.id === '02';
  const openReminder = () => {
    find('wrongphoto');
    navigate('/reminder');
  };

  return (
    <div
      ref={ref}
      className={`relative w-full flex mb-48 md:mb-64 ${
        item.align === 'left'
          ? 'justify-start'
          : item.align === 'right'
            ? 'justify-end'
            : 'justify-center'
      }`}
    >
      <div className={`relative z-10 flex ${item.type === 'diptych' ? 'gap-4 md:gap-12' : 'gap-4'}`}>
        {item.type === 'single' && (
          <motion.div style={{ y: mid }} className="relative w-[80vw] md:w-[40vw]">
            <div className="overflow-hidden">
              <motion.img
                style={{ y: back, scale: 1.1 }}
                src={item.photo}
                alt={`Archive ${item.id}`}
                loading="lazy"
                className="w-full aspect-[3/4] object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div
              className={`absolute -bottom-8 md:-bottom-12 ${
                item.align === 'left' ? 'right-0' : 'left-0'
              } bg-editorial-cream px-6 py-4 border border-editorial-black/10 shadow-xl z-20 max-w-[75vw] md:max-w-none`}
            >
              <p className="font-serif text-lg md:text-2xl text-editorial-black italic">
                {item.text}
              </p>
            </div>
          </motion.div>
        )}

        {item.type === 'diptych' && (
          <>
            <motion.div style={{ y: mid }} className="relative w-[45vw] md:w-[30vw] mt-24">
              <div
                className={`overflow-hidden relative ${isReminderFrame ? 'cursor-pointer' : ''}`}
                {...(isReminderFrame
                  ? {
                      role: 'button',
                      tabIndex: 0,
                      onClick: openReminder,
                      onKeyDown: (e: KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openReminder();
                        }
                      },
                    }
                  : {})}
              >
                <motion.img
                  style={{ y: back, scale: 1.1 }}
                  src={item.photo1}
                  alt={`Archive ${item.id} a`}
                  loading="lazy"
                  className="w-full aspect-square object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                />
                {/* Egg 05's only tell: a date where no other frame has one. */}
                {isReminderFrame && (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute top-0 right-0 w-0 h-0 border-t-[14px] border-l-[14px] border-t-editorial-accent border-l-transparent"
                    />
                    <span className="absolute bottom-2 right-2 font-sans text-[9px] tracking-[0.3em] text-white mix-blend-difference">
                      12.03
                    </span>
                  </>
                )}
              </div>
              {isReminderFrame && (
                <Annotation
                  note="Egg 05. The only dated frame in the Archives. That date is not hers."
                  side="left"
                  className="inset-0"
                />
              )}
            </motion.div>

            <motion.div style={{ y: midFar }} className="w-[35vw] md:w-[25vw] relative">
              <div className="overflow-hidden border border-editorial-black/20 p-2 md:p-4 bg-white">
                <motion.img
                  style={{ y: back, scale: 1.15 }}
                  src={item.photo2}
                  alt={`Archive ${item.id} b`}
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              {/* No whitespace-nowrap here — it used to run straight off a phone screen. */}
              <div className="absolute -bottom-12 left-0 bg-editorial-cream px-6 py-4 border border-editorial-black/10 shadow-xl z-20 w-max max-w-[60vw] md:max-w-sm">
                <p className="font-serif text-lg md:text-2xl text-editorial-black italic">
                  {item.text}
                </p>
              </div>
            </motion.div>
          </>
        )}

        {item.type === 'triptych' && (
          <div className="flex gap-4 md:gap-8 items-center w-[90vw] md:w-[70vw]">
            <motion.div style={{ y: midFar }} className="w-1/3">
              <img
                src={item.photo1}
                alt={`Archive ${item.id} a`}
                loading="lazy"
                className="w-full aspect-[4/5] object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
            {/* `relative` added — the caption used to anchor to whichever ancestor
                happened to own a transform on that frame. */}
            <motion.div style={{ y: mid }} className="relative w-1/3 z-20">
              <img
                src={item.photo2}
                alt={`Archive ${item.id} b`}
                loading="lazy"
                className="w-full aspect-[3/4] object-cover border-4 border-editorial-cream shadow-2xl filter grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-editorial-black/80 px-4 py-2 pointer-events-none">
                <p className="font-serif text-editorial-cream italic text-sm md:text-lg">
                  {item.text}
                </p>
              </div>
            </motion.div>
            <motion.div style={{ y: midFar }} className="w-1/3">
              <img
                src={item.photo3}
                alt={`Archive ${item.id} c`}
                loading="lazy"
                className="w-full aspect-square object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
          </div>
        )}

        <div
          className={`absolute top-4 md:top-8 ${
            item.align === 'right' ? '-left-8 md:-left-16' : '-right-8 md:-right-16'
          }`}
        >
          <span className="font-serif text-4xl md:text-7xl text-editorial-black/10 italic">
            {item.id}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Timeline({ openPage }: TimelineProps) {
  const { find } = useEggs();

  const openVault = () => {
    find('thirteen');
    openPage('vault');
  };
  const openDive = () => {
    find('dive');
    openPage('dive');
  };
  const activate = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  return (
    <section className="py-32 px-6 md:px-12 lg:px-24 bg-editorial-cream relative overflow-hidden">
      {/* Egg 02 — The Phantom Thirteen */}
      <div
        role="button"
        tabIndex={0}
        onClick={openVault}
        onKeyDown={activate(openVault)}
        className="absolute top-[8%] md:top-[12%] right-[10%] md:right-[20%] text-2xl md:text-4xl font-serif italic text-editorial-black/10 hover:text-editorial-accent focus-visible:text-editorial-accent cursor-pointer transition-colors duration-500 z-50 select-none"
        title="Unlock The Vault"
      >
        xiii.
        <Annotation note="Egg 02. Opens The Vault." side="left" className="inset-0" circle />
      </div>

      {/* Egg 03 — The Long Way Down */}
      <div
        role="button"
        tabIndex={0}
        onClick={openDive}
        onKeyDown={activate(openDive)}
        className="absolute top-[30%] md:top-[40%] right-[5%] md:right-[12%] text-sm md:text-lg tracking-[0.8em] uppercase text-editorial-black/20 hover:text-editorial-accent focus-visible:text-editorial-accent cursor-pointer transition-all duration-700 z-50 select-none animate-pulse motion-reduce:animate-none"
        style={{ writingMode: 'vertical-rl' }}
      >
        Surprise
        <Annotation
          note="Egg 03. Drops you into the Archive Dive."
          side="left"
          className="inset-0"
          circle
        />
      </div>

      <div className="absolute top-0 bottom-0 left-6 md:left-12 lg:left-24 w-[1px] bg-editorial-black/10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-48 pl-12 md:pl-24 relative">
          {/* Egg 04 — The Marginalia. Reachable by tap now, not just hover. */}
          <span
            role="button"
            tabIndex={0}
            onClick={() => find('marginalia')}
            onMouseEnter={() => find('marginalia')}
            onFocus={() => find('marginalia')}
            className="absolute top-0 right-0 md:right-10 max-w-[45%] text-right text-[9px] tracking-widest text-editorial-black/0 hover:text-editorial-black/40 focus-visible:text-editorial-black/40 active:text-editorial-black/40 transition-colors duration-500 cursor-default uppercase"
          >
            Go eat a burger, Aunty.
          </span>
          <Annotation
            note="Egg 04. A full sentence set in transparent text. Hover, tap or tab to it."
            side="bottom"
            className="top-0 right-0 md:right-10 w-40 h-4"
          />

          <h2 className="text-sm tracking-[0.4em] uppercase text-editorial-black/50 mb-4">
            The Archives
          </h2>
          <p className="font-serif text-4xl md:text-6xl text-editorial-black italic max-w-2xl">
            A visual documentation of perfection.
          </p>
        </div>

        <div className="relative pt-12">
          {ARCHIVE_ITEMS.map((item) => (
            <ArchiveBlock key={item.id} item={item} />
          ))}
        </div>
      </div>

      <Annotation
        note="Egg 06c. Hourglass. Third of the four corner icons."
        side="right"
        className="bottom-23 left-11 w-6 h-6 z-[340]"
        circle
      />

      <button
        onClick={() => {
          find('corner-archives');
          toast('19... practically retirement age. Have you drafted your will yet?');
        }}
        aria-label="A hidden note"
        className="absolute bottom-24 left-12 text-editorial-black/10 hover:text-editorial-accent transition-colors z-50 cursor-pointer"
      >
        <Hourglass size={16} />
      </button>
    </section>
  );
}
