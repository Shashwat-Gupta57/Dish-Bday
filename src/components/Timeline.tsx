import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hourglass } from 'lucide-react';
import { toast } from 'sonner';

interface TimelineProps {
  openPage: (page: 'virgo' | 'vault' | 'dive') => void;
}

const ARCHIVE_ITEMS = [
  { 
    id: '01', 
    type: 'single', 
    photo: '/photo-2.jpg', 
    text: 'Effortlessly iconic.', 
    align: 'left' 
  },
  { 
    id: '02', 
    type: 'diptych', 
    photo1: '/photo-3.jpg', 
    photo2: '/photo-4.jpg', 
    text: 'Main character energy, day in and day out.',
    align: 'right'
  },
  { 
    id: '03', 
    type: 'single', 
    photo: '/photo-5.jpg', 
    text: 'Ethereal.', 
    align: 'center' 
  },
  { 
    id: '04', 
    type: 'triptych', 
    photo1: '/photo-6.jpg', 
    photo2: '/photo-7.jpg',
    photo3: '/photo-8.jpg',
    text: 'The Muse. Always the muse.', 
    align: 'left' 
  },
  { 
    id: '05', 
    type: 'single', 
    photo: '/photo-9.jpg', 
    text: 'Unmatched.', 
    align: 'right' 
  },
  { 
    id: '06', 
    type: 'diptych', 
    photo1: '/photo-10.jpg', 
    photo2: '/photo-11.jpg',
    text: 'Setting the standard.', 
    align: 'left' 
  }
];

function ArchiveBlock({ item, index }: { item: typeof ARCHIVE_ITEMS[0], index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const yFast = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const imageY = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const navigate = useNavigate();

  return (
    <div 
      ref={ref} 
      className={`relative w-full flex mb-48 md:mb-64 ${
        item.align === 'left' ? 'justify-start' : 
        item.align === 'right' ? 'justify-end' : 'justify-center'
      }`}
    >
      <div className={`relative z-10 flex ${item.type === 'diptych' ? 'gap-4 md:gap-12' : 'gap-4'}`}>
        
        {item.type === 'single' && (
          <motion.div style={{ y }} className="relative w-[80vw] md:w-[40vw]">
            <div className="overflow-hidden">
              <motion.img 
                style={{ y: imageY, scale: 1.1 }}
                src={item.photo} 
                alt={`Archive ${item.id}`} 
                className="w-full aspect-[3/4] object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            {/* Label */}
            <div className={`absolute -bottom-8 md:-bottom-12 ${item.align === 'left' ? 'right-0' : 'left-0'} bg-editorial-cream px-6 py-4 border border-editorial-black/10 shadow-xl z-20`}>
              <p className="font-serif text-lg md:text-2xl text-editorial-black italic">{item.text}</p>
            </div>
          </motion.div>
        )}

        {item.type === 'diptych' && (
          <>
            <motion.div style={{ y }} className="w-[45vw] md:w-[30vw] mt-24">
               <div className="overflow-hidden cursor-pointer" onClick={() => item.id === '02' ? navigate('/reminder') : null}>
                <motion.img 
                  style={{ y: imageY, scale: 1.1 }}
                  src={item.photo1} 
                  alt={`Archive ${item.id} a`} 
                  className="w-full aspect-square object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </motion.div>
            <motion.div style={{ y: yFast }} className="w-[35vw] md:w-[25vw] relative">
               <div className="overflow-hidden border border-editorial-black/20 p-2 md:p-4 bg-white">
                <motion.img 
                  style={{ y: imageY, scale: 1.15 }}
                  src={item.photo2} 
                  alt={`Archive ${item.id} b`} 
                  className="w-full aspect-[3/4] object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="absolute -bottom-12 left-0 bg-editorial-cream px-6 py-4 border border-editorial-black/10 shadow-xl z-20 whitespace-nowrap">
                <p className="font-serif text-lg md:text-2xl text-editorial-black italic">{item.text}</p>
              </div>
            </motion.div>
          </>
        )}

        {item.type === 'triptych' && (
          <div className="flex gap-4 md:gap-8 items-center w-[90vw] md:w-[70vw]">
             <motion.div style={{ y: yFast }} className="w-1/3">
                <img src={item.photo1} className="w-full aspect-[4/5] object-cover filter grayscale hover:grayscale-0 transition-all duration-700" />
             </motion.div>
             <motion.div style={{ y }} className="w-1/3 z-20">
                <img src={item.photo2} className="w-full aspect-[3/4] object-cover border-4 border-editorial-cream shadow-2xl filter grayscale hover:grayscale-0 transition-all duration-700" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-editorial-black/80 px-4 py-2 pointer-events-none">
                   <p className="font-serif text-editorial-cream italic text-sm md:text-lg">{item.text}</p>
                 </div>
             </motion.div>
             <motion.div style={{ y: yFast }} className="w-1/3">
                <img src={item.photo3} className="w-full aspect-square object-cover filter grayscale hover:grayscale-0 transition-all duration-700" />
             </motion.div>
          </div>
        )}
        
        {/* Editorial Number */}
        <div className={`absolute top-4 md:top-8 ${item.align === 'right' ? '-left-8 md:-left-16' : '-right-8 md:-right-16'}`}>
          <span className="font-serif text-4xl md:text-7xl text-editorial-black/10 italic">{item.id}</span>
        </div>
      </div>
    </div>
  );
}

export default function Timeline({ openPage }: TimelineProps) {
  return (
    <section className="py-32 px-6 md:px-12 lg:px-24 bg-editorial-cream relative overflow-hidden">
      {/* Phantom 13 Easter Egg - Moved to an open spot */}
      <div 
        onClick={() => openPage('vault')}
        className="absolute top-[8%] md:top-[12%] right-[10%] md:right-[20%] text-2xl md:text-4xl font-serif italic text-editorial-black/10 hover:text-editorial-accent cursor-pointer transition-colors duration-500 z-50 select-none"
        title="Unlock The Vault"
      >
        xiii.
      </div>

      {/* Phantom Surprise Easter Egg - Made more visible */}
      <div 
        onClick={() => openPage('dive')}
        className="absolute top-[30%] md:top-[40%] right-[5%] md:right-[12%] text-sm md:text-lg tracking-[0.8em] uppercase text-editorial-black/20 hover:text-editorial-accent cursor-pointer transition-all duration-700 z-50 select-none animate-pulse"
        style={{ writingMode: 'vertical-rl' }}
      >
        Surprise
      </div>

      <div className="absolute top-0 bottom-0 left-6 md:left-12 lg:left-24 w-[1px] bg-editorial-black/10"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-48 pl-12 md:pl-24 relative">
          {/* Micro Easter Egg */}
          <span className="absolute top-0 right-10 md:right-24 text-[9px] tracking-widest text-editorial-black/0 hover:text-editorial-black/40 transition-colors duration-500 cursor-default uppercase">
            Go eat a burger, Aunty.
          </span>
          
          <h2 className="text-sm tracking-[0.4em] uppercase text-editorial-black/50 mb-4">The Archives</h2>
          <p className="font-serif text-4xl md:text-6xl text-editorial-black italic max-w-2xl">
            A visual documentation of perfection.
          </p>
        </div>

        <div className="relative pt-12">
          {ARCHIVE_ITEMS.map((item, index) => (
            <ArchiveBlock key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>

      <button 
        onClick={() => toast("19... practically retirement age. Have you drafted your will yet?")}
        className="absolute bottom-24 left-12 text-editorial-black/10 hover:text-editorial-accent transition-colors z-50 cursor-pointer"
      >
        <Hourglass size={16} />
      </button>
    </section>
  );
}
