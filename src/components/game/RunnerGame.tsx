import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * AUNTY RUN — canvas side-scroller with a two-stage boss fight.
 *
 * Fifteen seconds of running, then the chemistry teacher turns up (late). Beat
 * his ego to zero and he does not leave — he comes back angrier, with a stick
 * and a laser of his own.
 *
 * All mutable game state lives in one ref so the loop never restarts and React
 * never re-renders per frame. Only what a human reads — HP, ego, scene text —
 * is lifted into state.
 */

const AVATAR = '/photo-16.jpg';
const BOSS_IMG = '/photo-pushpi.jpg';
const BG_RUN = '/bg.jpg';
const BG_BOSS = '/boss-fight-bg.png';

/** Her avatar levelling up. Index by eye stage, 0 = before the awakening. */
const EYE_IMGS = [
  '/photo-16.jpg',
  '/photo-16-one-tomoe-sharingan.jpg',
  '/photo-16-three-tomoe-sharingan.jpg',
  '/photo-16-mangekyou-sharingan.jpg',
  '/photo-16-eternal-mangekyou-sharingan.jpg',
  '/photo-16-rinnegan.jpg',
];
const EYE_NAMES = [
  '', 'SHARINGAN', 'SHARINGAN — THREE TOMOE', 'MANGEKYO',
  'ETERNAL MANGEKYO', 'RINNEGAN',
];

const W = 900;
const H = 420;
const GROUND = 336;

const GRAVITY = 0.86;
const JUMP_V = -14.5;
/** Overall pace. This is the one number to nudge if it feels wrong. */
const BASE_SPEED = 5.4;
const PLAYER_X = 110;
const PLAYER_R = 27;

const START_HP = 160;
const HP_CEILING = 300;
const IFRAMES = 72;

const BOSS_AT = 15 * 60;
const BOSS_LATE = 4 * 60;
const BOSS1_HP = 130;
const BOSS2_HP = 185;
const BOSS3_HP = 300;

/** She awakens when he has beaten her below this in his final form. */
const AWAKEN_AT = 0.55;
/** ...or eight seconds into his final form, whichever comes first. She needs
 *  the kit to survive stage 3, so it can never be missed. */
const AWAKEN_BY = 8 * 60;

/** The one burger in the run. Golden, singular, and it is your second life. */
const BURGER_AT = 9 * 60;

const LECTURE_TELEGRAPH = 84;
const LECTURE_BEAM = 78;
const BEAM_HEIGHT = 62;

const LASER_CHARGE = 72;
const LASER_FIRE = 60;
const LASER_COOLDOWN = 330;
const LASER_DMG = 15;

/* ---- her awakened arsenal ---- */
const RASEN_CHARGE = 26;   // spin-up before it leaves her hand
const RASEN_CD = 46;
const RASEN_DMG = 13;
const AMA_CD = 420;        // black flame, burns him over time
const AMA_DMG = 4;
const SUS_DUR = 380;       // the guardian stands for this long
const SUS_CD = 900;
const KAMUI_DUR = 44;      // intangible while phasing
const KAMUI_CD = 180;

/** Ability cutscenes. The world holds still while these play. */
const ACT_SUS = 170;
const ACT_RASEN = 118;
const ACT_KAMUI = 150;
const KICK_DMG = 26;
const ACT_CHIDORI = 210;
const CHIDORI_DMG = 34;
const ACT_REWIND = 430;
const SEALS = ['TIGER', 'RAM', 'SNAKE', 'BOAR', 'DOG', 'MONKEY', 'BIRD'];

/**
 * Kaguya's dimensions. Switching one changes the set and the physics — gravity
 * is a per-domain property, so the arena itself becomes one of his weapons.
 */
const DOMAINS = [
  { name: 'COACHING HALL', sky: '#140B10', hill: 'rgba(255,77,109,0.06)', line: '#FF4D6D', grav: 1 },
  { name: 'THE VOID', sky: '#05050A', hill: 'rgba(138,122,255,0.07)', line: '#8A7AFF', grav: 0.62 },
  { name: 'MOLTEN SYLLABUS', sky: '#1A0806', hill: 'rgba(255,122,61,0.09)', line: '#FF7A3D', grav: 1.4 },
  { name: 'FROZEN EXAM HALL', sky: '#061018', hill: 'rgba(122,223,255,0.08)', line: '#7ADFFF', grav: 0.86 },
  { name: 'ZERO-G LIBRARY', sky: '#0A0716', hill: 'rgba(201,169,245,0.09)', line: '#C9A9F5', grav: 0.4 },
];

/** How far back the rewind reaches, and how often the buffer samples. */
const HIST_EVERY = 20;
const HIST_LEN = Math.ceil((35 * 60) / HIST_EVERY);

/** A clean shot to the head is worth roughly three body hits. */
const BODY_DMG = 3.2;
const HEAD_DMG = 9;
const LASER_HEAD_BONUS = 8;

const BOSS_GRAV = 0.92;
const BOSS_JUMP = -14.5;

/**
 * Eye positions, measured off photo-16.jpg (462×462) as fractions of the frame.
 * She is mid head-tilt, so the pair sits left of centre and a third down.
 */
const EYES = [
  { nx: 0.353, ny: 0.364 },
  { nx: 0.535, ny: 0.379 },
];

/**
 * His head is a small part of a 4000×3000 photo, so a centre-square crop would
 * be mostly wall and polo shirt. These are his face bounds as fractions of the
 * source, measured off the image.
 */
const BOSS_FACE = { x: 0.290, y: 0.330, w: 0.210, h: 0.280 };

/** Stickman proportions. He stands on the ground now — no more floating head. */
const bodyH = (stage: number) => (stage === 2 ? 154 : 132);
const headR = (stage: number) => (stage === 2 ? 28 : 24);
const eyeOffset = (e: { nx: number; ny: number }) => ({
  x: -PLAYER_R + e.nx * 2 * PLAYER_R,
  y: -PLAYER_R + e.ny * 2 * PLAYER_R,
});

const ELEMENTS = ['H', 'He', 'Li', 'C', 'N', 'O', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'Ag', 'Ba', 'Pb'];

const DEATH_LINES = [
  'Haha, you got cracked once again 💀',
  'Fir kat gaya? LOL',
  'Butterfingers Aunty! 🧈',
  'Nineteen years old and still no reflexes.',
  'Gir gayi. Jaise har baar.',
];
const SLEEP_LINES = ['You fell asleep. Mid-fight. Iconic.', 'Neend aa gayi. Obviously.'];
const BOSS_KILL_LINES = [
  'HE GAVE YOU 400 MORE PAGES.',
  'HE HELD A 6-HOUR LECTURE ON YOUR PERFORMANCE.',
  'HE IS TELLING YOUR PARENTS.',
  'HE MARKED YOU ABSENT. FOR THIS.',
];
const LEVEL_LINES = ['DIHHITA LEVELED UP!', 'SLAYYY AUNTY! 👑', 'AUNTY IS COOKING 🔥', 'SPEED UP — KEEP UP, DIHHITA'];
const HURT_LINES = ['OW', 'ARE?', 'HAWW', 'BRO', 'RUDE', 'ABE'];

const TAUNTS_1 = [
  'SCHOOL FUNCTION THA? PADHAI KAUN KAREGA?',
  'FEVER THA TOH TEST KYUN DIYA?',
  'MERA TEST SCHOOL EXAM SE ZYADA IMPORTANT HAI.',
  '400 PAGES KE NOTES. KAL TAK.',
  'MAIN 6 GHANTE PADHA SAKTA HOON.',
  'EXTRA-CURRICULAR ACTIVITIES! WAAH!',
  'LATE? MAIN TEACHER HOON.',
];
const TAUNTS_2 = [
  'AB MAIN 8 GHANTE PADHAUNGA.',
  'EXAM KE BEECH MEIN CLASS. AAJ HI.',
  'TUMHARE PARENTS KO CALL KAR RAHA HOON.',
  'ATTENDANCE! ATTENDANCE! ATTENDANCE!',
  'MAINE TUMHE BANAYA HAI.',
  'SUNDAY BHI CLASS HOGI.',
  'MERI CLASS CHHOD KE KAHAN JAOGI?',
];
const WIN_LINES = ['PUSHPENDRA SIR HAS LEFT THE CHAT', 'DIHHITA CLEARED THE SYLLABUS 🎓', 'SLAYYY AUNTY! HE IS SPEECHLESS'];

type Kind = 'book' | 'stack' | 'zzz' | 'fulki' | 'burger';
type Phase = 'run' | 'incoming' | 'boss' | 'cutscene' | 'tutorial' | 'won';
type Melee = { t: number; stage: 'in' | 'swing' | 'out'; x: number } | null;

interface Entity { kind: Kind; x: number; y: number; w: number; h: number; dead?: boolean }
interface Bullet { x: number; y: number; sym: string }
interface Shot { x: number; y: number; vx: number; kind: 'notes' | 'test' | 'question'; t: number }
interface Pop { x: number; y: number; life: number; text: string; color: string }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; color: string }

interface Game {
  running: boolean; over: boolean; dying: boolean; phase: Phase;
  y: number; vy: number; jumps: number; hp: number; maxHp: number;
  iframes: number; hurt: number; push: number; revive: number;
  speed: number; score: number; level: number; fulkis: number; dist: number; t: number;
  hasBurger: boolean; burgerSpawned: boolean;
  spawnIn: number; entities: Entity[]; pops: Pop[]; sparks: Spark[];
  shake: number; flash: number; hitstop: number;
  bullets: Bullet[]; cool: number;
  laserT: number; laserPhase: 'idle' | 'charge' | 'fire'; laserCd: number; laserHit: boolean;
  bossStage: 1 | 2 | 3; bossHp: number; bossMax: number;
  spikes: { x: number; t: number }[]; spikeTel: number; spikeWave: number; spikeX: number;
  flames: { x: number; t: number }[]; flameTel: number; flameX: number;
  bleed: number; hover: number; stage3T: number; stationT: number; aggro: number;
  shurikens: { x: number; y: number; vy: number; t: number }[];
  tensei: number; punchT: number; punchGo: number;
  rsk: { x: number; y: number; t: number }[];
  trigT: number; trigHits: number;
  mist: number; mistsLeft: number; tpT: number; tpTo: number;
  domain: number; domainFade: number; gravMul: number;
  hist: { hp: number; bossHp: number }[]; rewinds: number; rewindFlag: boolean;
  herHeadX: number; herHeadY: number; herHeadR: number;
  awakened: boolean; awakenDone: boolean; eyeStage: number; prevEye: number;
  rasenT: number; rasenCd: number; rasengans: { x: number; y: number; t: number }[];
  amaCd: number; amaBurn: number;
  susT: number; susCd: number;
  kamuiT: number; kamuiCd: number;
  flying: boolean; flyHeld: boolean;
  act: { kind: 'sus' | 'rasen' | 'kamui' | 'chidori' | 'rewind'; t: number } | null;
  kamuiBlocked: boolean;
  actCam: number; eyeBlood: number;
  bossX: number; bossY: number; bossBob: number; bossFlash: number;
  atkT: number; beam: number; telegraph: number; beamTick: number;
  melee: Melee; meleeHit: boolean; throwT: number; step: number;
  bossVy: number; bossOff: number; bossDodgeCd: number; bossAlert: number;
  dodgeKind: 'hop' | 'flip' | 'duck' | 'slide' | null; dodgeT: number; homeX: number;
  ghosts: { x: number; y: number; life: number; pose: string; t: number }[];
  cine: number; cineKind: 'stage2' | 'stage3' | 'awaken' | 'win' | null; camZoom: number; camX: number;
  warp: number; palmX: number; palmY: number;
  bossHurt: number; bossKnock: number;
  bLaserTel: number; bLaserFire: number; bLaserY: number; bLaserHit: boolean;
  shots: Shot[]; taunt: string | null; tauntT: number;
}

function fresh(): Game {
  return {
    running: false, over: false, dying: false, phase: 'run',
    y: GROUND, vy: 0, jumps: 0, hp: START_HP, maxHp: START_HP,
    iframes: 0, hurt: 0, push: 0, revive: 0,
    speed: BASE_SPEED, score: 0, level: 1, fulkis: 0, dist: 0, t: 0,
    hasBurger: false, burgerSpawned: false,
    spawnIn: 70, entities: [], pops: [], sparks: [],
    shake: 0, flash: 0, hitstop: 0,
    bullets: [], cool: 0,
    laserT: 0, laserPhase: 'idle', laserCd: 0, laserHit: false,
    bossStage: 1, bossHp: BOSS1_HP, bossMax: BOSS1_HP,
    spikes: [], spikeTel: 0, spikeWave: 0, spikeX: 0,
    flames: [], flameTel: 0, flameX: 0,
    bleed: 0, hover: 0, stage3T: 0, stationT: 0, aggro: 0,
    shurikens: [], mist: 0, mistsLeft: 2, tpT: 0, tpTo: 0,
    tensei: 0, punchT: 0, punchGo: 0, rsk: [], trigT: 0, trigHits: 0,
    domain: 0, domainFade: 0, gravMul: 1,
    hist: [], rewinds: 2, rewindFlag: false,
    herHeadX: PLAYER_X, herHeadY: GROUND - PLAYER_R, herHeadR: PLAYER_R,
    awakened: false, awakenDone: false, eyeStage: 0, prevEye: 0,
    rasenT: 0, rasenCd: 0, rasengans: [],
    amaCd: 0, amaBurn: 0,
    susT: 0, susCd: 0,
    kamuiT: 0, kamuiCd: 0,
    flying: false, flyHeld: false,
    act: null, actCam: 1, eyeBlood: 0, kamuiBlocked: false,
    bossX: W + 160, bossY: GROUND - 96, bossBob: 0, bossFlash: 0,
    atkT: 90, beam: 0, telegraph: 0, beamTick: 0,
    melee: null, meleeHit: false, throwT: 0, step: 0,
    bossVy: 0, bossOff: 0, bossDodgeCd: 0, bossAlert: 0,
    dodgeKind: null, dodgeT: 0, homeX: W - 150,
    ghosts: [], warp: 0, palmX: 0, palmY: 0,
    cine: 0, cineKind: null, camZoom: 1, camX: W / 2,
    bossHurt: 0, bossKnock: 0,
    bLaserTel: 0, bLaserFire: 0, bLaserY: 0, bLaserHit: false,
    shots: [], taunt: null, tauntT: 0,
  };
}

/**
 * Cutscene beats. Each is a camera framing, a pose and a line, played out on
 * the canvas — the characters act it, rather than a caption describing it.
 */
interface Beat {
  end: number;            // tick this beat finishes on
  zoom: number;           // camera scale
  on: 'boss' | 'both' | 'her' | 'eye';    // what the camera frames
  pose: string;
  who?: 'him' | 'her';
  line?: string;
  shake?: number;
  flash?: boolean;
}

const CINE_STAGE2: Beat[] = [
  // Flat on the floor, dust settling. Nobody speaks for two seconds.
  { end: 80, zoom: 1.75, on: 'boss', pose: 'prone', shake: 14 },
  { end: 200, zoom: 1.9, on: 'boss', pose: 'prone', who: 'him', line: 'Tumne... mujhe... hara diya?' },
  { end: 310, zoom: 1.7, on: 'both', pose: 'prone', who: 'her', line: 'Sir, ghar jaiye. Please.' },
  { end: 400, zoom: 1.95, on: 'boss', pose: 'prone', who: 'him', line: 'Nahi.' },
  // One arm braces. He starts pushing himself up.
  { end: 490, zoom: 1.8, on: 'boss', pose: 'pushup', who: 'him', line: 'NAHI.', shake: 6 },
  { end: 590, zoom: 1.65, on: 'boss', pose: 'kneel', who: 'him', line: 'Main 28 saal se khada hoon.', shake: 8 },
  { end: 700, zoom: 1.55, on: 'boss', pose: 'rise', who: 'him', line: 'MAINE ATTENDANCE NAHI LI ABHI TAK.', shake: 14 },
  { end: 790, zoom: 1.5, on: 'boss', pose: 'rise', shake: 26, flash: true },
];

const CINE_WIN: Beat[] = [
  { end: 60, zoom: 1.65, on: 'boss', pose: 'kneel', shake: 10 },
  { end: 180, zoom: 1.75, on: 'boss', pose: 'kneel', who: 'him', line: 'Maine... tumhe... banaya tha.' },
  { end: 300, zoom: 1.6, on: 'both', pose: 'kneel', who: 'her', line: 'Aapne mujhe 400 pages diye the, sir.' },
  { end: 420, zoom: 1.6, on: 'both', pose: 'kneel', who: 'her', line: 'Main aaj bhi so jaati hoon. Aur ab jeet bhi gayi.' },
  { end: 520, zoom: 1.65, on: 'boss', pose: 'kneel', who: 'him', line: '...class kal lagegi.' },
  { end: 600, zoom: 1.4, on: 'both', pose: 'kneel' },
];

const CINE_STAGE3: Beat[] = [
  { end: 70, zoom: 1.8, on: 'boss', pose: 'prone', shake: 18 },
  { end: 190, zoom: 1.95, on: 'boss', pose: 'prone', who: 'him', line: 'Do baar. Do baar tumne mujhe giraya.' },
  { end: 300, zoom: 1.8, on: 'boss', pose: 'pushup', who: 'him', line: 'Main 28 saal se padha raha hoon.', shake: 8 },
  { end: 420, zoom: 1.65, on: 'boss', pose: 'kneel', who: 'him', line: 'AUR MUJHE EK BACHCHI HARA RAHI HAI?', shake: 14 },
  { end: 560, zoom: 1.9, on: 'boss', pose: 'rise', shake: 30, flash: true },
  { end: 700, zoom: 1.7, on: 'boss', pose: 'idle', who: 'him', line: 'Ab main padhaunga nahi. Ab main sikhaunga.' },
];

const CINE_AWAKEN: Beat[] = [
  { end: 60, zoom: 1.85, on: 'her', pose: 'kneel', shake: 16 },
  { end: 150, zoom: 1.55, on: 'her', pose: 'kneel', who: 'her', line: 'Aankhein... jal rahi hain...' },
  { end: 250, zoom: 4.2, on: 'eye', pose: 'kneel' },
  { end: 340, zoom: 4.6, on: 'eye', pose: 'kneel' },
  { end: 430, zoom: 5.0, on: 'eye', pose: 'kneel' },
  { end: 520, zoom: 5.4, on: 'eye', pose: 'kneel' },
  { end: 640, zoom: 5.8, on: 'eye', pose: 'kneel', shake: 14 },
  { end: 720, zoom: 1.75, on: 'her', pose: 'rise', shake: 22, flash: true },
  { end: 840, zoom: 1.9, on: 'her', pose: 'idle', who: 'her', line: 'Ab meri baari, sir.' },
];

const beatAt = (script: Beat[], t: number) => script.find((b) => t < b.end) ?? script[script.length - 1];

const cineScript = (k: 'stage2' | 'stage3' | 'awaken' | 'win' | null) =>
  k === 'win' ? CINE_WIN : k === 'stage3' ? CINE_STAGE3 : k === 'awaken' ? CINE_AWAKEN : CINE_STAGE2;

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export default function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const g = useRef<Game>(fresh());
  const avatar = useRef<HTMLImageElement | null>(null);
  const bossImg = useRef<HTMLImageElement | null>(null);
  const eyeImgs = useRef<(HTMLImageElement | null)[]>([]);
  const bgRun = useRef<HTMLImageElement | null>(null);
  const bgBoss = useRef<HTMLImageElement | null>(null);

  const [hud, setHud] = useState({ score: 0, level: 1, fulkis: 0, hp: START_HP, maxHp: START_HP, bossHp: -1, stage: 1, laser: 0, burger: false, awake: false, rasen: 100, ama: 100, sus: 100, kamui: 100, susOn: false, domain: 0, rewinds: 2 });
  const [death, setDeath] = useState<{ line: string; burger: boolean } | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [won, setWon] = useState<string | null>(null);
  const [cutscene, setCutscene] = useState<'stage2' | 'stage3' | 'awaken' | 'win' | null>(null);
  const [tutorial, setTutorial] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => {
    try { setBest(Number(localStorage.getItem('aunty-run-best') ?? 0)); } catch { /* blocked */ }
    const a = new Image(); a.src = AVATAR; a.onload = () => (avatar.current = a);
    const b = new Image(); b.src = BOSS_IMG; b.onload = () => (bossImg.current = b);
    const r1 = new Image(); r1.src = BG_RUN; r1.onload = () => (bgRun.current = r1);
    const r2 = new Image(); r2.src = BG_BOSS; r2.onload = () => (bgBoss.current = r2);
    eyeImgs.current = EYE_IMGS.map((src, i) => {
      const im = new Image();
      im.src = src;
      im.onload = () => { eyeImgs.current[i] = im; };
      return null;
    });
  }, []);

  const busy = () => death !== null || cutscene !== null || tutorial;

  const jump = useCallback(() => {
    const s = g.current;
    if (s.over || s.dying || s.phase === 'won' || s.phase === 'cutscene') return;
    if (!s.running) { s.running = true; setStarted(true); }
    if (s.jumps < 2) { s.vy = JUMP_V; s.jumps += 1; }
  }, []);

  const shoot = useCallback(() => {
    const s = g.current;
    if (s.over || s.dying || !s.running || s.cool > 0) return;
    s.cool = 11;
    s.bullets.push({ x: PLAYER_X + PLAYER_R, y: s.y - PLAYER_R, sym: pick(ELEMENTS) });
  }, []);

  const laser = useCallback(() => {
    const s = g.current;
    if (s.over || s.dying || !s.running) return;
    // Once she awakens, Z stops being an eye beam and becomes the black flame.
    if (s.awakened) {
      if (s.amaCd > 0 || s.act) return;
      s.amaCd = AMA_CD; s.amaBurn = 260; s.flash = 10; s.shake = 16;
      return;
    }
    if (s.laserPhase !== 'idle' || s.laserCd > 0) return;
    s.laserPhase = 'charge'; s.laserT = LASER_CHARGE; s.laserHit = false;
  }, []);

  /** X after the awakening: a spiralling sphere, heavier and slower. */
  const rasengan = useCallback(() => {
    const s = g.current;
    if (s.over || s.dying || !s.running || !s.awakened) return;
    if (s.rasenCd > 0 || s.rasenT > 0 || s.act) return;
    // She builds it by hand first.
    s.act = { kind: 'rasen', t: 0 };
  }, []);

  /** C: a giant of chakra stands over her and eats everything for a while. */
  const susanoo = useCallback(() => {
    const s = g.current;
    if (s.over || s.dying || !s.running || !s.awakened) return;
    if (s.susCd > 0 || s.susT > 0 || s.act) return;
    s.act = { kind: 'sus', t: 0 };
  }, []);

  /** V: phase out. Untouchable, and she reappears somewhere else. */
  const kamui = useCallback(() => {
    const s = g.current;
    if (s.over || s.dying || !s.running || !s.awakened) return;
    if (s.kamuiCd > 0 || s.kamuiT > 0 || s.act) return;
    // Not just a dodge any more — she comes out of it behind him.
    s.act = { kind: 'kamui', t: 0 };
    s.iframes = Math.max(s.iframes, ACT_KAMUI + 30);
  }, []);

  const restart = useCallback(() => {
    g.current = fresh();
    setDeath(null); setOver(null); setWon(null); setCutscene(null); setTutorial(false); setBanner(null); setStarted(false);
    setHud({ score: 0, level: 1, fulkis: 0, hp: START_HP, maxHp: START_HP, bossHp: -1, stage: 1, laser: 0, burger: false, awake: false, rasen: 100, ama: 100, sus: 100, kamui: 100, susOn: false, domain: 0, rewinds: 2 });
  }, []);

  /** Inhale the burger. Full heal, long invulnerability, one time only. */
  const revive = useCallback(() => {
    const s = g.current;
    s.hasBurger = false;
    s.hp = s.maxHp;
    s.dying = false;
    s.running = true;
    s.iframes = 150;
    s.revive = 60;
    s.flash = 14;
    s.shake = 22;
    s.shots = []; s.beam = 0; s.telegraph = 0; s.melee = null;
    s.bLaserTel = 0; s.bLaserFire = 0;
    for (let i = 0; i < 40; i += 1) {
      s.sparks.push({
        x: PLAYER_X, y: s.y - PLAYER_R,
        vx: (Math.random() - 0.5) * 11, vy: (Math.random() - 0.5) * 11,
        life: 40, color: '#FFC94D',
      });
    }
    setDeath(null);
  }, []);

  const giveUp = useCallback(() => {
    const s = g.current;
    s.over = true; s.dying = false;
    setOver(death?.line ?? 'Gir gayi.');
    setDeath(null);
  }, [death]);

  /** Close the victory cutscene and show the results panel. */
  const finishWin = useCallback(() => {
    const s = g.current;
    s.phase = 'won'; s.running = false;
    s.cineKind = null; s.camZoom = 1; s.camX = W / 2;
    setCutscene(null);
    setWon(pick(WIN_LINES));
    setBest((b) => {
      const n = Math.max(b, Math.floor(s.score) + 1000);
      try { localStorage.setItem('aunty-run-best', String(n)); } catch { /* ignore */ }
      return n;
    });
  }, []);

  /** He ascends. Final form, full heal, everything unlocked. */
  const toStage3 = useCallback(() => {
    const s = g.current;
    s.bossStage = 3;
    s.bossMax = BOSS3_HP;
    s.bossHp = BOSS3_HP;
    s.phase = 'boss';
    s.running = true;
    s.atkT = 70;
    s.bleed = 0.2;
    s.taunt = 'AB TUM MERI ASLI CLASS DEKHOGI.'; s.tauntT = 200;
    s.cine = 0; s.cineKind = null; s.camZoom = 1; s.camX = W / 2;
    setCutscene(null);
  }, []);

  /** She wakes up. Show her what she can do, then resume. */
  const toAwakened = useCallback(() => {
    setCutscene(null);
    g.current.phase = 'tutorial';
    setTutorial(true);
  }, []);

  const resumeFromTutorial = useCallback(() => {
    const s = g.current;
    s.phase = 'boss';
    s.running = true;
    s.hp = s.maxHp;
    s.iframes = 120;
    s.revive = 50;
    s.cine = 0; s.cineKind = null; s.camZoom = 1; s.camX = W / 2;
    s.atkT = 90;
    setTutorial(false);
  }, []);

  /** Leave the cutscene and start stage two. */
  const toStage2 = useCallback(() => {
    const s = g.current;
    s.bossStage = 2;
    s.bossMax = BOSS2_HP;
    s.bossHp = BOSS2_HP;
    s.phase = 'boss';
    s.running = true;
    s.atkT = 60;
    s.taunt = 'MAIN ABHI GAYA NAHI HOON.'; s.tauntT = 180;
    s.cine = 0; s.cineKind = null; s.camZoom = 1; s.camX = W / 2;
    setCutscene(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (busy()) return;
        if (g.current.over || g.current.phase === 'won') restart(); else jump();
      }
      if (e.code === 'KeyX' || e.code === 'ArrowRight') {
        e.preventDefault();
        if (!busy()) { if (g.current.awakened) rasengan(); else shoot(); }
      }
      if (e.code === 'KeyZ') { e.preventDefault(); if (!busy()) laser(); }
      if (e.code === 'KeyC') { e.preventDefault(); if (!busy()) susanoo(); }
      if (e.code === 'KeyV') { e.preventDefault(); if (!busy()) kamui(); }
      if (e.code === 'ArrowUp' || e.code === 'KeyW') { g.current.flyHeld = true; }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') g.current.flyHeld = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);

    let raf = 0;
    let lastLevel = 1;
    const say = (t: string, ms = 1700) => { setBanner(t); window.setTimeout(() => setBanner(null), ms); };

    /** `crop` is a normalised rect of the source; omit it for a centre square. */
    const drawCircle = (
      img: HTMLImageElement, cx: number, cy: number, r: number, ring: string,
      crop?: { x: number; y: number; w: number; h: number }, ringW = 3,
    ) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath();
      ctx.save(); ctx.clip();
      if (crop) {
        ctx.drawImage(
          img, crop.x * img.width, crop.y * img.height, crop.w * img.width, crop.h * img.height,
          cx - r, cy - r, r * 2, r * 2,
        );
      } else {
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, cx - r, cy - r, r * 2, r * 2);
      }
      ctx.restore();
      ctx.lineWidth = ringW; ctx.strokeStyle = ring; ctx.stroke();
      ctx.restore();
    };

    /**
     * Two-bone IK. Given a root and a target, find the joint between them.
     * `bend` picks which way the elbow or knee folds.
     */
    const ik = (
      ax: number, ay: number, bx: number, by: number,
      l1: number, l2: number, bend: number,
    ) => {
      const dx = bx - ax, dy = by - ay;
      const d = Math.max(0.01, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01));
      const base = Math.atan2(dy, dx);
      const cos = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
      const a = Math.acos(Math.max(-1, Math.min(1, cos)));
      return { jx: ax + Math.cos(base + a * bend) * l1, jy: ay + Math.sin(base + a * bend) * l1 };
    };

    /**
     * The stickman.
     *
     * Limbs are jointed rather than straight — poses set hand and foot targets
     * and IK fills in the elbows and knees, which is the whole reason he reads
     * as a fighter instead of a diagram. He faces left, toward her.
     */
    const drawStickman = (
      x: number, feetY: number, stage: number, pose: string, t: number,
      flash: boolean, hurt: number,
      skin?: { img: HTMLImageElement | null; crop?: typeof BOSS_FACE; col: string; ascended?: boolean; bleed?: number; eye?: number; dir?: number },
    ) => {
      // +1 faces left (him, toward her). -1 faces right (her, toward him).
      const dir = skin?.dir ?? 1;
      const bh = bodyH(stage);
      const hr = headR(stage);
      const thigh = bh * 0.215, shin = bh * 0.215;
      const upper = bh * 0.155, fore = bh * 0.15;
      const base = skin?.col ?? '#FF4D6D';
      const col = flash ? '#ffffff' : hurt > 0 ? '#FFD166' : base;

      const h = hurt / 18;
      const recoil = hurt > 0 ? h * 11 : 0;
      const jitter = hurt > 0 ? Math.sin(hurt * 2.1) * h * 5 : 0;
      const breathe = Math.sin(t * 0.07) * 1.6;

      // ---- skeleton defaults ----
      let pelvisX = x, pelvisY = feetY - bh * 0.42 + breathe * 0.4;
      let lean = 0;                     // chest offset, +x = leaning back (away from her)
      let footL = { x: x - 15, y: feetY };   // her side
      let footR = { x: x + 15, y: feetY };
      let handL = { x: x - bh * 0.18, y: feetY - bh * 0.62 };
      let handR = { x: x + bh * 0.16, y: feetY - bh * 0.58 };
      let stick: { a: number } | null = null;
      let headTilt = 0;

      const cyc = t * 0.36;

      if (hurt > 0) {
        lean = 16 * h;
        headTilt = 0.4 * h;
        pelvisY += 7 * h;
        footL = { x: x - 20 - h * 12, y: feetY };
        footR = { x: x + 22 + h * 10, y: feetY };
        handL = { x: x - bh * 0.10, y: feetY - bh * 0.92 - h * 10 };
        handR = { x: x + bh * 0.24, y: feetY - bh * 0.86 };
      } else if (pose === 'run') {
        // Full sprint: forward lean, deep knee drive, arms pumping counter-phase.
        lean = -14;
        pelvisY = feetY - bh * 0.44 + Math.abs(Math.sin(cyc)) * 5;
        footL = { x: x - 12 + Math.cos(cyc) * 30, y: feetY - Math.max(0, Math.sin(cyc)) * 34 };
        footR = { x: x - 12 + Math.cos(cyc + Math.PI) * 30, y: feetY - Math.max(0, Math.sin(cyc + Math.PI)) * 34 };
        handL = { x: x - 14 + Math.cos(cyc + Math.PI) * 26, y: feetY - bh * 0.62 + Math.sin(cyc + Math.PI) * 10 };
        handR = { x: x - 14 + Math.cos(cyc) * 26, y: feetY - bh * 0.62 + Math.sin(cyc) * 10 };
      } else if (pose === 'walk') {
        lean = -6;
        footL = { x: x - 14 + Math.cos(cyc * 0.7) * 20, y: feetY - Math.max(0, Math.sin(cyc * 0.7)) * 16 };
        footR = { x: x - 14 + Math.cos(cyc * 0.7 + Math.PI) * 20, y: feetY - Math.max(0, Math.sin(cyc * 0.7 + Math.PI)) * 16 };
        handL = { x: x - bh * 0.22, y: feetY - bh * 0.60 };
        handR = { x: x + bh * 0.10, y: feetY - bh * 0.66 };
        stick = { a: -2.4 };
      } else if (pose === 'swing') {
        // Wind up behind the head, then whip through in front. Weight transfers
        // onto the front foot as it lands.
        const k = Math.min(1, t / 11);
        const a = -2.4 + k * 2.9;
        lean = 10 - k * 22;
        pelvisY = feetY - bh * 0.40;
        footL = { x: x - 30 - k * 14, y: feetY };
        footR = { x: x + 20, y: feetY };
        handL = { x: x + Math.cos(a) * bh * 0.30, y: feetY - bh * 0.66 + Math.sin(a) * bh * 0.30 };
        handR = { x: x + 14, y: feetY - bh * 0.50 };
        stick = { a };
      } else if (pose === 'throw') {
        const k = Math.min(1, t / 14);
        lean = 12 - k * 22;
        footL = { x: x - 26 - k * 10, y: feetY };
        footR = { x: x + 18, y: feetY };
        const a = -0.5 - (1 - k) * 2.0;
        handL = { x: x + Math.cos(a) * bh * 0.30, y: feetY - bh * 0.66 + Math.sin(a) * bh * 0.30 };
        handR = { x: x + bh * 0.14, y: feetY - bh * 0.52 };
      } else if (pose === 'lecture') {
        lean = 12;
        headTilt = -0.18;
        pelvisY = feetY - bh * 0.44;
        footL = { x: x - 20, y: feetY };
        footR = { x: x + 20, y: feetY };
        handL = { x: x - bh * 0.18, y: feetY - bh * 1.12 };
        handR = { x: x + bh * 0.18, y: feetY - bh * 1.12 };
      } else if (pose === 'charge') {
        // Deep kamehameha stance: wide, knees bent, hands cupped at the back hip.
        pelvisY = feetY - bh * 0.34;
        lean = 8;
        footL = { x: x - 34, y: feetY };
        footR = { x: x + 34, y: feetY };
        handL = { x: x + bh * 0.24, y: feetY - bh * 0.50 };
        handR = { x: x + bh * 0.29, y: feetY - bh * 0.44 };
      } else if (pose === 'blast') {
        // Braced: front foot planted forward, both palms thrust at her.
        pelvisY = feetY - bh * 0.38;
        lean = 10;
        footL = { x: x - 38, y: feetY };
        footR = { x: x + 26, y: feetY };
        handL = { x: x - bh * 0.30, y: feetY - bh * 0.66 };
        handR = { x: x - bh * 0.27, y: feetY - bh * 0.60 };
      } else if (pose === 'jump') {
        pelvisY = feetY - bh * 0.44;
        footL = { x: x - 16, y: feetY - 22 };
        footR = { x: x + 14, y: feetY - 28 };
        handL = { x: x - bh * 0.14, y: feetY - bh * 0.92 };
        handR = { x: x + bh * 0.18, y: feetY - bh * 0.86 };
      } else if (pose === 'kneel') {
        // Defeated. One knee down, head hanging, hand braced on the ground.
        pelvisY = feetY - bh * 0.22;
        lean = -10;
        headTilt = 0.5;
        footL = { x: x - 26, y: feetY };
        footR = { x: x + 16, y: feetY };
        handL = { x: x - 34, y: feetY - 2 };
        handR = { x: x + 20, y: feetY - bh * 0.20 };
      } else if (pose === 'rise') {
        // Getting back up, furious. t drives the climb.
        const k = Math.min(1, t / 90);
        pelvisY = feetY - bh * (0.22 + 0.20 * k);
        lean = -10 + k * 18;
        headTilt = 0.5 - k * 0.68;
        footL = { x: x - 26, y: feetY };
        footR = { x: x + 18, y: feetY };
        handL = { x: x - 34 + k * 20, y: feetY - 2 - k * bh * 0.5 };
        handR = { x: x + 20, y: feetY - bh * (0.20 + 0.42 * k) };
      } else if (pose === 'prone') {
        // Face down on the floor. Genos, season one.
        pelvisY = feetY - 8;
        lean = -34;
        headTilt = 1.3;
        footL = { x: x + 30, y: feetY - 2 };
        footR = { x: x + 40, y: feetY - 4 };
        handL = { x: x - 44, y: feetY - 4 };
        handR = { x: x - 30, y: feetY - 2 };
      } else if (pose === 'pushup') {
        // One arm braced, hauling himself off the ground.
        const k = Math.min(1, t / 60);
        pelvisY = feetY - 10 - k * bh * 0.14;
        lean = -34 + k * 20;
        headTilt = 1.3 - k * 0.9;
        footL = { x: x + 26 - k * 40, y: feetY };
        footR = { x: x + 36, y: feetY };
        handL = { x: x - 44 + k * 14, y: feetY - 2 };
        handR = { x: x - 22, y: feetY - 6 - k * bh * 0.2 };
      } else if (pose === 'backflip') {
        // Airborne, tucked, spinning away from her.
        pelvisY = feetY - bh * 0.46;
        footL = { x: x + 26, y: feetY - 34 };
        footR = { x: x + 32, y: feetY - 14 };
        handL = { x: x - 20, y: feetY - bh * 0.86 };
        handR = { x: x - 8, y: feetY - bh * 0.92 };
      } else if (pose === 'duck') {
        // Under the shot: knees folded, head low, hands out for balance.
        pelvisY = feetY - bh * 0.20;
        lean = -18;
        headTilt = 0.25;
        footL = { x: x - 26, y: feetY };
        footR = { x: x + 24, y: feetY };
        handL = { x: x - bh * 0.26, y: feetY - bh * 0.24 };
        handR = { x: x + bh * 0.22, y: feetY - bh * 0.20 };
      } else if (pose === 'seals') {
        // Both hands together in front of the chest, snapping between signs.
        const step = Math.floor(t / 9);
        const w = (step % 3) - 1;
        pelvisY = feetY - bh * 0.41;
        lean = 4;
        footL = { x: x - 22, y: feetY };
        footR = { x: x + 20, y: feetY };
        handL = { x: x - bh * 0.10 + w * 5, y: feetY - bh * 0.70 - Math.abs(w) * 6 };
        handR = { x: x - bh * 0.05 + w * 5, y: feetY - bh * 0.66 - Math.abs(w) * 6 };
      } else if (pose === 'eyegrip') {
        // One hand clamped over the eye that is bleeding.
        pelvisY = feetY - bh * 0.38;
        lean = -8;
        headTilt = 0.22;
        footL = { x: x - 26, y: feetY };
        footR = { x: x + 22, y: feetY };
        handL = { x: x - bh * 0.07, y: feetY - bh * 0.94 };
        handR = { x: x + bh * 0.18, y: feetY - bh * 0.44 };
      } else if (pose === 'rasenform') {
        // Both hands at the sphere, the upper one whipping around the lower.
        const spin = t * 0.42;
        const cxh = x - bh * 0.24, cyh = feetY - bh * 0.60;
        pelvisY = feetY - bh * 0.40;
        lean = 3;
        footL = { x: x - 30, y: feetY };
        footR = { x: x + 22, y: feetY };
        handL = { x: cxh + Math.cos(spin) * 15, y: cyh + Math.sin(spin) * 11 };
        handR = { x: cxh + Math.cos(spin + Math.PI) * 15, y: cyh + Math.sin(spin + Math.PI) * 11 };
      } else if (pose === 'cup') {
        // Palm up and out; the sphere builds above her hand.
        pelvisY = feetY - bh * 0.41;
        lean = 3;
        footL = { x: x - 28, y: feetY };
        footR = { x: x + 22, y: feetY };
        handL = { x: x - bh * 0.30, y: feetY - bh * 0.56 };
        handR = { x: x - bh * 0.14, y: feetY - bh * 0.62 };
      } else if (pose === 'thrust') {
        // Driving it forward.
        pelvisY = feetY - bh * 0.40;
        lean = -14;
        footL = { x: x - 40, y: feetY };
        footR = { x: x + 26, y: feetY };
        handL = { x: x - bh * 0.36, y: feetY - bh * 0.60 };
        handR = { x: x - bh * 0.12, y: feetY - bh * 0.52 };
      } else if (pose === 'spinkick') {
        // Inverted, one leg whipped straight out. Konoha Senpuu.
        pelvisY = feetY - bh * 0.50;
        footL = { x: x - bh * 0.52, y: feetY - bh * 0.52 };
        footR = { x: x + bh * 0.16, y: feetY - bh * 0.20 };
        handL = { x: x + bh * 0.22, y: feetY - bh * 0.30 };
        handR = { x: x + bh * 0.10, y: feetY - bh * 0.62 };
      } else if (pose === 'chidori') {
        // Arm cocked back low, hand crackling.
        pelvisY = feetY - bh * 0.38;
        lean = 14;
        footL = { x: x - 26, y: feetY };
        footR = { x: x + 34, y: feetY };
        handL = { x: x + bh * 0.30, y: feetY - bh * 0.30 };
        handR = { x: x + bh * 0.10, y: feetY - bh * 0.58 };
      } else if (pose === 'chidash') {
        // Committed lunge, arm leading.
        pelvisY = feetY - bh * 0.42;
        lean = -22;
        footL = { x: x - 46, y: feetY - 18 };
        footR = { x: x + 34, y: feetY };
        handL = { x: x - bh * 0.38, y: feetY - bh * 0.56 };
        handR = { x: x + bh * 0.22, y: feetY - bh * 0.40 };
      } else if (pose === 'stance') {
        // Guard up, knees soft, weight bouncing. Ready, not running.
        const bob = Math.sin(t * 0.13) * 3;
        pelvisY = feetY - bh * 0.40 + bob;
        lean = 5;
        footL = { x: x - 26, y: feetY };
        footR = { x: x + 22, y: feetY };
        handL = { x: x - bh * 0.20, y: feetY - bh * 0.74 + bob };
        handR = { x: x - bh * 0.06, y: feetY - bh * 0.64 + bob };
      } else if (pose === 'slide') {
        // Skidding backwards on one leg.
        pelvisY = feetY - bh * 0.26;
        lean = 20;
        footL = { x: x - 40, y: feetY };
        footR = { x: x + 30, y: feetY - 10 };
        handL = { x: x - bh * 0.18, y: feetY - bh * 0.44 };
        handR = { x: x + bh * 0.28, y: feetY - bh * 0.52 };
      } else {
        // Idle: weight on the back leg, one hand on the hip, the other gesturing.
        pelvisY = feetY - bh * 0.42 + breathe;
        footL = { x: x - 17, y: feetY };
        footR = { x: x + 16, y: feetY };
        handL = { x: x - bh * 0.20 + Math.sin(t * 0.05) * 7, y: feetY - bh * 0.70 + Math.cos(t * 0.06) * 5 };
        handR = { x: x + bh * 0.15, y: feetY - bh * 0.46 };
      }

      const headY = feetY - bh;
      const neckX = x + lean * 0.55, neckY = headY + hr;
      const chestX = x + lean * 0.4, chestY = feetY - bh * 0.72;
      const shoulderY = chestY + bh * 0.02;

      ctx.save();
      ctx.translate(recoil * dir + jitter, 0);
      if (dir < 0) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
      if (pose === 'backflip') {
        // Spin the whole body around the hips.
        ctx.translate(x, pelvisY); ctx.rotate(-t * 0.22); ctx.translate(-x, -pelvisY);
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = col;
      const lw = stage === 2 ? 5 : 4;

      const bone = (ax: number, ay: number, bx: number, by: number, w = lw) => {
        ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      };

      // Spine — two segments so it can actually curve.
      bone(neckX, neckY, chestX, chestY);
      bone(chestX, chestY, pelvisX, pelvisY);

      // Legs, knees bending forward
      for (const [foot, bend] of [[footL, 1], [footR, -1]] as const) {
        const k = ik(pelvisX, pelvisY, foot.x, foot.y, thigh, shin, bend * 0.9);
        bone(pelvisX, pelvisY, k.jx, k.jy);
        bone(k.jx, k.jy, foot.x, foot.y);
        // foot
        bone(foot.x, foot.y, foot.x - 8, foot.y, lw - 1);
      }

      // Arms, elbows bending down
      const palms: { x: number; y: number }[] = [];
      for (const [hand, bend] of [[handR, -1], [handL, 1]] as const) {
        const e = ik(chestX, shoulderY, hand.x, hand.y, upper, fore, bend * 0.85);
        bone(chestX, shoulderY, e.jx, e.jy);
        bone(e.jx, e.jy, hand.x, hand.y);
        palms.push({ x: hand.x, y: hand.y });
      }

      if (stick) {
        ctx.strokeStyle = '#FFC94D';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(handL.x, handL.y);
        ctx.lineTo(handL.x + Math.cos(stick.a) * 52, handL.y + Math.sin(stick.a) * 52);
        ctx.stroke();
        ctx.strokeStyle = col;
      }

      ctx.restore();

      // Head in world space — mirroring the body must not mirror her face.
      const headWX = x + (neckX - x) * dir + recoil * dir + jitter;
      const face = skin?.img ?? bossImg.current;
      const crop = skin ? skin.crop : BOSS_FACE;
      ctx.save();
      ctx.translate(headWX, headY);
      ctx.rotate(headTilt * dir);

      // Ascended: gold spiked hair and a rising aura.
      if (skin?.ascended) {
        ctx.save();
        const flick = Math.sin(t * 0.5) * 0.12;
        ctx.strokeStyle = '#FFD34D';
        ctx.lineWidth = 4;
        for (let i = 0; i < 9; i += 1) {
          const a = -Math.PI + (i / 8) * Math.PI + flick * (i % 2 ? 1 : -1);
          const len = hr * (1.25 + (i % 3) * 0.3);
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * hr * 0.86, Math.sin(a) * hr * 0.86);
          ctx.lineTo(Math.cos(a - 0.16) * len, Math.sin(a - 0.16) * len - hr * 0.28);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (face) drawCircle(face, 0, 0, hr, col, crop, stage >= 2 ? 4 : 3);
      else {
        ctx.lineWidth = lw; ctx.strokeStyle = col;
        ctx.beginPath(); ctx.arc(0, 0, hr, 0, Math.PI * 2); ctx.stroke();
      }

      // Blood from the eyes — the price of the technique.
      if (skin?.bleed) {
        ctx.fillStyle = 'rgba(190,20,40,' + Math.min(1, skin.bleed) + ')';
        for (const ex of [-hr * 0.32, hr * 0.18]) {
          ctx.fillRect(ex, -hr * 0.05, 2.5, hr * (0.5 + skin.bleed * 0.7));
        }
      }
      ctx.restore();

      // The palm the beam leaves from — the average of both hands, un-mirrored.
      const pmx = (palms[0].x + palms[1].x) / 2;
      const palm = {
        x: x + (pmx - x) * dir + recoil * dir + jitter,
        y: (palms[0].y + palms[1].y) / 2,
      };
      return { headY, headX: headWX, neck: neckY, hip: pelvisY, shoulder: shoulderY, hr, palm };
    };

    const kill = (line: string) => {
      const s = g.current;
      s.dying = true; s.running = false; s.shake = 22; s.flash = 12;
      setBest((b) => {
        const n = Math.max(b, Math.floor(s.score));
        try { localStorage.setItem('aunty-run-best', String(n)); } catch { /* ignore */ }
        return n;
      });
      setDeath({ line, burger: s.hasBurger });
    };

    const damage = (amount: number, sleepy = false) => {
      const s = g.current;
      if (s.iframes > 0 || s.over || s.dying) return;
      // Susanoo eats it. Kamui means it passes straight through her.
      if (s.susT > 0) {
        s.pops.push({ x: PLAYER_X, y: s.y - 90, life: 30, text: 'BLOCKED', color: '#9AE6FF' });
        s.shake = 10;
        return;
      }
      if (s.kamuiT > 0) {
        s.pops.push({ x: PLAYER_X, y: s.y - 70, life: 30, text: 'PHASED', color: '#BA8CFF' });
        return;
      }
      s.hp -= amount;
      s.iframes = IFRAMES; s.hurt = 30; s.push = -32; s.shake = 13; s.flash = 7;
      s.pops.push({ x: PLAYER_X, y: s.y - PLAYER_R - 34, life: 40, text: `-${amount}`, color: '#FF4D6D' });
      s.pops.push({ x: PLAYER_X + 44, y: s.y - PLAYER_R - 10, life: 34, text: pick(HURT_LINES), color: '#FFD166' });
      for (let i = 0; i < 10; i += 1) {
        s.sparks.push({ x: PLAYER_X, y: s.y - PLAYER_R, vx: -Math.random() * 5 - 1, vy: (Math.random() - 0.5) * 7, life: 22, color: '#FF4D6D' });
      }
      // Beaten low by his final form, she wakes something up.
      if (s.bossStage === 3 && !s.awakened && !s.awakenDone && s.hp > 0
          && s.hp <= s.maxHp * AWAKEN_AT) {
        s.awakenDone = true;
        s.phase = 'cutscene'; s.running = false;
        s.cine = 0; s.cineKind = 'awaken'; s.eyeStage = 0; s.prevEye = 0;
        s.shots = []; s.spikes = []; s.flames = []; s.melee = null;
        s.beam = 0; s.telegraph = 0; s.bLaserTel = 0; s.bLaserFire = 0;
        s.hitstop = 24; s.shake = 30; s.flash = 18;
        return;
      }
      if (s.hp <= 0) {
        s.hp = 0;
        kill(sleepy ? pick(SLEEP_LINES) : pick(s.phase === 'boss' ? BOSS_KILL_LINES : DEATH_LINES));
      }
    };

    const spawn = () => {
      const s = g.current;
      // The burger appears exactly once, at a fixed point in the run.
      if (!s.burgerSpawned && s.t > BURGER_AT) {
        s.burgerSpawned = true;
        s.entities.push({ kind: 'burger', x: W + 40, y: GROUND - 104, w: 40, h: 40 });
        say('★  A BURGER  ★   GRAB IT. TRUST ME.', 2200);
        return;
      }
      const r = Math.random();
      if (r < 0.2) s.entities.push({ kind: 'fulki', x: W + 40, y: GROUND - 70 - Math.random() * 60, w: 26, h: 26 });
      else if (r < 0.34 && s.level >= 2) s.entities.push({ kind: 'zzz', x: W + 40, y: GROUND - 96, w: 40, h: 34 });
      else if (r < 0.67) s.entities.push({ kind: 'book', x: W + 40, y: GROUND - 34, w: 32, h: 34 });
      else s.entities.push({ kind: 'stack', x: W + 40, y: GROUND - 62, w: 36, h: 62 });
    };

    const hurtBoss = (amount: number, big = false, label?: string) => {
      const s = g.current;
      s.bossHp -= amount;
      s.bossFlash = big ? 14 : 6;
      // He staggers. Recoil, jitter, arms up — see drawStickman.
      s.bossHurt = big ? 22 : 14;
      s.bossKnock = big ? 16 : 9;
      if (big) { s.hitstop = 7; s.shake = 26; s.flash = 12; }
      if (label) {
        s.pops.push({ x: s.bossX - 24, y: s.bossY - 66, life: 46, text: label, color: '#FFD166' });
      }
      s.pops.push({ x: s.bossX - 24, y: s.bossY - 46, life: big ? 50 : 34, text: `-${Math.round(amount)}`, color: '#FF4D6D' });
      for (let i = 0; i < (big ? 26 : 6); i += 1) {
        s.sparks.push({ x: s.bossX - 34, y: s.bossY, vx: (Math.random() - 0.2) * 9, vy: (Math.random() - 0.5) * 11, life: 30, color: '#FF4D6D' });
      }
      if (s.bossHp <= 0) {
        s.bossHp = 0;
        if (s.bossStage === 1) {
          s.phase = 'cutscene';
          s.shots = []; s.beam = 0; s.telegraph = 0; s.melee = null;
          s.bLaserTel = 0; s.bLaserFire = 0; s.bossHurt = 0; s.bossKnock = 0;
          s.bossX = W - 260; s.bossOff = 0; s.bossVy = 0;
          s.cine = 0; s.cineKind = 'stage2';
          s.hitstop = 24; s.shake = 30; s.flash = 16;
        } else if (s.bossStage === 2) {
          // He does not die twice. He ascends.
          s.phase = 'cutscene';
          s.shots = []; s.beam = 0; s.melee = null;
          s.bLaserTel = 0; s.bLaserFire = 0; s.bossHurt = 0; s.bossKnock = 0;
          s.bossX = W - 250; s.bossOff = 0; s.bossVy = 0;
          s.cine = 0; s.cineKind = 'stage3';
          s.hitstop = 30; s.shake = 40; s.flash = 22;
        } else {
          s.phase = 'cutscene';
          s.shots = []; s.beam = 0; s.melee = null; s.spikes = []; s.flames = [];
          s.bLaserTel = 0; s.bLaserFire = 0;
          s.bossX = W - 260; s.bossOff = 0; s.bossVy = 0;
          s.cine = 0; s.cineKind = 'win';
          s.hitstop = 26; s.shake = 34; s.flash = 20;
          setBest((b) => {
            const n = Math.max(b, Math.floor(s.score) + 1000);
            try { localStorage.setItem('aunty-run-best', String(n)); } catch { /* ignore */ }
            return n;
          });
        }
      }
    };

    /**
     * Fixed-timestep loop.
     *
     * The simulation used to advance one tick per animation frame, which meant
     * it ran at the monitor's refresh rate: correct on a 60Hz laptop, and two
     * to four times too fast on a 120/144/240Hz gaming display. Everything —
     * gravity, spawn timers, the boss's cooldowns — is tuned in ticks, so the
     * whole game got faster the better your hardware was.
     *
     * Now time is accumulated in real milliseconds and the simulation is
     * stepped a whole number of times at exactly 60Hz, with rendering left free
     * to run as fast as the display likes. Same speed on every machine.
     */
    const TICK_MS = 1000 / 60;
    /** Stop a backgrounded tab from fast-forwarding on return. */
    const MAX_FRAME_MS = 250;
    /** On a machine too slow for 60Hz, drop the backlog instead of spiralling. */
    const MAX_CATCHUP = 5;

    let acc = 0;
    let last = 0;

    const update = () => {
      const s = g.current;
      // Impact frames freeze the simulation but not the rendering.
      if (s.hitstop > 0) { s.hitstop -= 1; return; }

      // Ability sequences hold the world and play out on their own clock.
      if (s.act) {
        const a = s.act;
        a.t += 1;
        if (s.shake > 0) s.shake -= 1;
        if (s.flash > 0) s.flash -= 1;
        s.pops = s.pops.map((q) => ({ ...q, y: q.y - 1, life: q.life - 1 })).filter((q) => q.life > 0);
        s.sparks = s.sparks
          .map((q) => ({ ...q, x: q.x + q.vx * 0.3, y: q.y + q.vy * 0.3, life: q.life - 1 }))
          .filter((q) => q.life > 0);

        if (a.kind === 'sus') {
          s.actCam += (1.22 - s.actCam) * 0.05;
          if (a.t === 96) { s.eyeBlood = 1; s.shake = 12; }
          if (a.t === 126) { s.flash = 20; s.shake = 34; }
          if (a.t >= ACT_SUS) {
            s.susT = SUS_DUR; s.susCd = SUS_CD;
            s.act = null; s.actCam = 1;
          }
        } else if (a.kind === 'rasen') {
          s.actCam += (1.28 - s.actCam) * 0.06;
          if (a.t === 92) { s.shake = 10; s.flash = 8; }
          if (a.t >= ACT_RASEN) {
            // Same anchor the sequence draws it at, so it leaves her hand
            // from exactly where you watched her build it.
            s.rasengans.push({ x: s.herHeadX + 46, y: s.herHeadY + 34, t: 0 });
            s.rasenCd = RASEN_CD; s.shake = 12;
            s.act = null; s.actCam = 1;
          }
        } else if (a.kind === 'rewind') {
          // No push-in at all — the whole set piece has to be visible.
          s.actCam = 1;
          if (a.t === 90) { s.shake = 20; }
          if (a.t === 190) { s.shake = 30; s.flash = 12; }
          if (a.t === 300) { s.shake = 40; s.flash = 26; }
          if (a.t === 330) {
            // Thirty-five seconds ago. Both bars, not just his.
            const back = s.hist[0];
            s.bossHp = Math.min(s.bossMax, back.bossHp);
            s.hp = Math.min(s.maxHp, back.hp);
            s.hist = [];
            s.pops.push({ x: W / 2, y: H / 2 - 40, life: 90, text: 'TIME REVERSED', color: '#7CFFB2' });
          }
          if (a.t >= ACT_REWIND) {
            s.act = null; s.actCam = 1;
            s.taunt = 'AB DOBARA SE. SHURU SE.'; s.tauntT = 200;
          }
        } else if (a.kind === 'kamui') {
          s.actCam += (1.1 - s.actCam) * 0.05;
          // The kick lands on the way out of the portal.
          if (a.t === 40 && s.bossStage === 3 && Math.random() < 0.45) {
            // In his final form the aura is a guard, not just decoration.
            s.kamuiBlocked = true;
          }
          if (a.t === 96) {
            s.hitstop = 9; s.shake = 34; s.flash = 16;
            if (s.phase === 'boss' && !s.kamuiBlocked) {
              hurtBoss(KICK_DMG, true, 'KONOHA SENPUU');
              s.bossKnock = -46; s.bossHurt = 26;
            } else if (s.kamuiBlocked) {
              s.pops.push({ x: s.bossX - 30, y: GROUND + s.bossOff - 190, life: 60, text: 'BLOCKED', color: '#FFD34D' });
            }
            for (let i = 0; i < 30; i += 1) {
              s.sparks.push({
                x: s.bossX, y: GROUND + s.bossOff - bodyH(s.bossStage),
                vx: -(Math.random() * 8 + 2), vy: (Math.random() - 0.5) * 10,
                life: 30, color: '#BA8CFF',
              });
            }
          }
          if (a.t >= ACT_KAMUI) {
            s.kamuiT = KAMUI_DUR; s.kamuiCd = KAMUI_CD;
            if (s.kamuiBlocked) {
              // He caught it. Now he answers.
              s.kamuiBlocked = false;
              s.act = { kind: 'chidori', t: 0 };
              s.iframes = 0;
              s.shake = 26; s.flash = 14;
            } else {
              s.act = null; s.actCam = 1;
            }
          }
        } else {
          // ---- his counter: time stops, then chidori ----
          s.actCam += (1.3 - s.actCam) * 0.05;
          if (a.t === 40) { s.shake = 14; }
          if (a.t === 150) {
            s.hitstop = 12; s.shake = 40; s.flash = 24;
            s.iframes = 0;
            damage(CHIDORI_DMG);
            s.push = -70;
            for (let i = 0; i < 34; i += 1) {
              s.sparks.push({
                x: PLAYER_X, y: s.y - 90,
                vx: -(Math.random() * 9 + 2), vy: (Math.random() - 0.5) * 12,
                life: 34, color: '#9AE6FF',
              });
            }
          }
          if (a.t >= ACT_CHIDORI) { s.act = null; s.actCam = 1; }
        }
        return;
      }

      // Cutscenes run on their own clock while everything else is held.
      if (s.phase === 'cutscene') {
        s.cine += 1;
        if (s.shake > 0) s.shake -= 1;
        if (s.flash > 0) s.flash -= 1;
        const script = cineScript(s.cineKind);
        // Her eyes turn over during the close-up beats.
        if (s.cineKind === 'awaken') {
          const was = s.eyeStage;
          s.eyeStage = s.cine < 160 ? 0
            : s.cine < 250 ? 1
            : s.cine < 340 ? 2
            : s.cine < 430 ? 3
            : s.cine < 520 ? 4 : 5;
          if (s.eyeStage !== was) s.prevEye = was;
          if (s.cine === 250 || s.cine === 340 || s.cine === 430 || s.cine === 520 || s.cine === 640) {
            s.flash = 12; s.shake = 16;
          }
          if (s.cine === 640) s.awakened = true;
        }
        const done = script[script.length - 1].end;
        if (s.cine === done) setCutscene(s.cineKind);
        return;
      }


      if (s.running && !s.over && !s.dying && s.phase !== 'won' && s.phase !== 'tutorial') {
        s.t += 1;
        const slow = s.hurt > 0 ? 0.45 : 1;
        // The fight is a standoff, not a chase. Nothing scrolls once he lands.
        if (s.phase !== 'boss') s.dist += s.speed * slow;
        s.score = s.dist / 12 + s.fulkis * 5;

        if (s.cool > 0) s.cool -= 1;
        if (s.iframes > 0) s.iframes -= 1;
        if (s.hurt > 0) s.hurt -= 1;
        if (s.flash > 0) s.flash -= 1;
        if (s.revive > 0) s.revive -= 1;
        if (s.laserCd > 0) s.laserCd -= 1;
        s.push += (0 - s.push) * 0.12;

        for (const b of s.bullets) b.x += 16;

        // ---- her laser ---------------------------------------------------
        if (s.laserPhase === 'charge') {
          s.laserT -= 1;
          if (s.laserT <= 0) { s.laserPhase = 'fire'; s.laserT = LASER_FIRE; }
        } else if (s.laserPhase === 'fire') {
          s.laserT -= 1;
          const beamY = s.y - PLAYER_R;
          const feet2 = GROUND + s.bossOff;
          const hy2 = feet2 - bodyH(s.bossStage);
          const bTop = hy2 - headR(s.bossStage);
          if (s.phase === 'boss' && !s.laserHit && beamY > bTop && beamY < feet2) {
            s.laserHit = true;
            const head = Math.abs(beamY - hy2) < headR(s.bossStage) + 6;
            hurtBoss(LASER_DMG + (head ? LASER_HEAD_BONUS : 0), true, head ? 'HEADSHOT' : undefined);
          }
          if (s.laserT <= 0) { s.laserPhase = 'idle'; s.laserCd = LASER_COOLDOWN; }
        }

        if (s.phase === 'run' && s.t > BOSS_AT) { s.phase = 'incoming'; say('⚠  PUSHPENDRA SIR IS COMING  ⚠', 2200); }
        if (s.phase === 'incoming' && s.t > BOSS_AT + BOSS_LATE) {
          s.phase = 'boss'; s.entities = [];
          say('“SORRY, TRAFFIC THA.”  (he is always late)', 2400);
          s.taunt = 'MAIN BEST CHEMISTRY TEACHER HOON.'; s.tauntT = 150;
        }

        // ---- her arsenal ----
        if (s.rasenCd > 0) s.rasenCd -= 1;
        if (s.amaCd > 0) s.amaCd -= 1;
        if (s.susCd > 0) s.susCd -= 1;
        if (s.susT > 0) s.susT -= 1;
        if (s.kamuiCd > 0) s.kamuiCd -= 1;
        if (s.kamuiT > 0) s.kamuiT -= 1;

        if (s.rasenT > 0) {
          s.rasenT -= 1;
          if (s.rasenT === 0) {
            s.rasengans.push({ x: PLAYER_X + 34, y: s.herHeadY + 26, t: 0 });
            s.rasenCd = RASEN_CD; s.shake = 8;
          }
        }
        for (const r of s.rasengans) { r.x += 9.5; r.t += 1; }
        s.rasengans = s.rasengans.filter((r) => r.x < W + 60);

        if (s.amaBurn > 0) {
          s.amaBurn -= 1;
          // Burns him where he stands, and it does not go out.
          if (s.phase === 'boss' && s.amaBurn % 26 === 0) hurtBoss(AMA_DMG);
        }

        // Flight: hold up and gravity lets go.
        s.flying = s.awakened && s.flyHeld && s.y < GROUND;
        if (s.flying) {
          s.vy += (-2.6 - s.vy) * 0.18;
          s.y = Math.max(90, s.y + s.vy);
          s.jumps = 0;
        } else {
          // Whichever dimension he has dragged the fight into sets the pull.
          s.vy += GRAVITY * s.gravMul; s.y += s.vy;
        }
        if (s.y >= GROUND) { s.y = GROUND; s.vy = 0; s.jumps = 0; }
        const airborne = s.y < GROUND - 12;

        if (s.phase !== 'boss') {
          const lvl = Math.floor(s.score / 260) + 1;
          if (lvl !== lastLevel) {
            lastLevel = lvl; s.level = lvl;
            s.speed = BASE_SPEED + (lvl - 1) * 0.7;
            say(`${pick(LEVEL_LINES)}  ·  LVL ${lvl}`);
          }
          s.spawnIn -= 1;
          if (s.spawnIn <= 0 && s.phase === 'run') { spawn(); s.spawnIn = 56 + Math.random() * 46 - Math.min(s.level * 3, 22); }
          for (const e of s.entities) e.x -= s.speed * slow;
          s.entities = s.entities.filter((e) => e.x > -80 && !e.dead);

          const pad = 7;
          for (const e of s.entities) {
            const cx = Math.max(e.x + pad, Math.min(PLAYER_X, e.x + e.w - pad));
            const cy = Math.max(e.y + pad, Math.min(s.y - PLAYER_R, e.y + e.h - pad));
            const dx = PLAYER_X - cx, dy = s.y - PLAYER_R - cy;
            if (dx * dx + dy * dy < (PLAYER_R - 4) ** 2) {
              if (e.kind === 'fulki') {
                e.dead = true; s.fulkis += 1;
                // Fulki raises the ceiling as well as healing. Food is progression.
                // Minecraft absorption: overheal past 100 shows as gold.
                s.maxHp = Math.min(HP_CEILING, s.maxHp + 15);
                s.hp = Math.min(s.maxHp, s.hp + 15);
                s.pops.push({ x: e.x, y: e.y, life: 46, text: '+15 HP', color: '#FFC94D' });
              } else if (e.kind === 'burger') {
                e.dead = true; s.hasBurger = true;
                s.flash = 10; s.shake = 10;
                s.pops.push({ x: e.x, y: e.y, life: 70, text: 'EXTRA LIFE', color: '#FFC94D' });
                for (let i = 0; i < 24; i += 1) {
                  s.sparks.push({ x: e.x + 20, y: e.y + 20, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life: 34, color: '#FFC94D' });
                }
                say('★  BURGER SECURED  ★  ONE SECOND CHANCE', 2400);
              } else if (s.iframes === 0) {
                e.dead = true;
                if (e.kind === 'zzz') damage(22, true);
                else damage(e.kind === 'stack' ? 20 : 15);
              }
            }
          }
          s.entities = s.entities.filter((e) => !e.dead);
        }

        // ---- boss --------------------------------------------------------
        if (s.phase === 'boss') {
          const s2 = s.bossStage >= 2;
          const s3 = s.bossStage === 3;
          const targetX = W - 150;
          if (s.bossX > targetX && !s.melee) s.bossX -= 5;
          s.bossBob += s2 ? 0.09 : 0.05;
          s.step += 1;
          if (s.throwT > 0) s.throwT -= 1;
          if (s.bossDodgeCd > 0) s.bossDodgeCd -= 1;
          if (s3) s.stage3T += 1;

          // Kirigakure exactly twice per fight: once at the midpoint, once when
          // he is nearly finished. Rolling for it made it constant.
          if (s3 && s.mist === 0 && s.mistsLeft > 0) {
            const frac = s.bossHp / s.bossMax;
            const gate = s.mistsLeft === 2 ? 0.62 : 0.3;
            if (frac <= gate) { s.mist = 340; s.mistsLeft -= 1; }
          }

          // Rolling record of both health bars, so time can be put back.
          if (s.t % HIST_EVERY === 0) {
            s.hist.push({ hp: s.hp, bossHp: s.bossHp });
            if (s.hist.length > HIST_LEN) s.hist.shift();
          }

          // Cornered in his final form, he refuses to accept the result. Twice.
          if (s3 && s.rewinds > 0 && s.bossHp < s.bossMax * 0.22 && !s.act && s.hist.length > 20) {
            s.rewinds -= 1;
            s.act = { kind: 'rewind', t: 0 };
            s.shots = []; s.spikes = []; s.flames = []; s.shurikens = [];
            s.melee = null; s.beam = 0; s.telegraph = 0;
            s.bLaserTel = 0; s.bLaserFire = 0; s.mist = 0;
            s.hitstop = 20; s.shake = 34; s.flash = 20;
            return;
          }
          // She awakens on damage taken, or on the clock. Never neither.
          if (s3 && !s.awakened && !s.awakenDone && s.stage3T > AWAKEN_BY) {
            s.awakenDone = true;
            s.phase = 'cutscene'; s.running = false;
            s.cine = 0; s.cineKind = 'awaken'; s.eyeStage = 0; s.prevEye = 0;
            s.shots = []; s.spikes = []; s.flames = []; s.melee = null;
            s.beam = 0; s.telegraph = 0; s.bLaserTel = 0; s.bLaserFire = 0;
            s.hitstop = 24; s.shake = 30; s.flash = 18;
            return;
          }
          if (s.dodgeT > 0) {
            s.dodgeT -= 1;
            // Flips and slides carry him backwards; he walks it back after.
            if (s.dodgeKind === 'flip') s.bossX += 5.2;
            if (s.dodgeKind === 'slide') s.bossX += 3.4;
            if (s.dodgeT === 0) s.dodgeKind = null;
          } else if (!s.melee) {
            // He picks a new station regularly and presses forward when he is
            // winning the exchange, instead of anchoring to one spot.
            s.stationT -= 1;
            if (s.stationT <= 0) {
              s.stationT = (s3 ? 70 : 110) + Math.random() * (s3 ? 60 : 110);
              const near = PLAYER_X + (s3 ? 150 : 210);
              const far = W - 110;
              s.aggro = Math.random();
              s.homeX = near + s.aggro * (far - near);
            }
            const closeSpeed = s3 ? 0.085 : s2 ? 0.065 : 0.05;
            if (Math.abs(s.bossX - s.homeX) > 3) s.bossX += (s.homeX - s.bossX) * closeSpeed;

            // If she is holding fire, he stops trading and repositions early.
            if (s.bullets.length >= 3 && s.stationT > 26) s.stationT = 8;

            // In his final form he does not walk anywhere. He blinks.
            if (s3 && s.tpT === 0 && Math.random() < 0.012) {
              s.tpT = 22;
              s.tpTo = PLAYER_X + 130 + Math.random() * (W - PLAYER_X - 260);
            }
          }
          if (s.bossHurt > 0) s.bossHurt -= 1;
          if (s.bossAlert > 0) s.bossAlert -= 1;
          if (s.warp > 0) s.warp -= 1;
          s.ghosts = s.ghosts.map((gh) => ({ ...gh, life: gh.life - 1 })).filter((gh) => gh.life > 0);
          s.bossKnock += (0 - s.bossKnock) * 0.14;

          // He leaves the ground now, so everything about him is measured from
          // his feet rather than from GROUND.
          if (s3) {
            // He does not stand any more. He hovers, and he is bleeding.
            s.hover += 0.045;
            s.bossOff += ((-74 + Math.sin(s.hover) * 16) - s.bossOff) * 0.06;
            s.bossVy = 0;
            s.bleed = Math.min(1, s.bleed + 0.01);
          } else {
            s.bossVy += BOSS_GRAV;
            s.bossOff += s.bossVy;
            if (s.bossOff >= 0) { s.bossOff = 0; s.bossVy = 0; }
          }
          const feetY = GROUND + s.bossOff;
          s.bossY = feetY - bodyH(s.bossStage);

          /**
           * Not an AI, just reflexes: he looks ahead for anything about to hit
           * him and hops it. Stage 2 reacts sooner and more often — he has been
           * doing this a while.
           */
          const busyAttacking = s.melee || s.beam > 0 || s.telegraph > 0
            || s.bLaserTel > 0 || s.bLaserFire > 0 || s.bossHurt > 0;
          if (!busyAttacking && s.bossDodgeCd <= 0) {
            const reach = s3 ? 400 : s2 ? 340 : 270;
            const bodyTop = feetY - bodyH(s.bossStage) - headR(s.bossStage);
            // Count the burst, not just the nearest shot — holding fire sends a
            // stream, and reacting to one bullet at a time gets him clipped.
            const threats = s.bullets.filter((b) => {
              const gap = s.bossX - b.x;
              return gap > -20 && gap < reach && b.y > bodyTop - 14 && b.y < feetY;
            }).length;
            // Her beam is a horizontal line at her eye height; he reads it and
            // decides whether to go under it or over it.
            const herBeamY = s.awakened ? s.herHeadY : s.y - PLAYER_R;
            const laserComing = (s.laserPhase === 'charge' && s.laserT < 40
              && herBeamY > bodyTop - 10 && herBeamY < feetY)
              || s.rasengans.some((r) => s.bossX - r.x > 0 && s.bossX - r.x < reach
                && r.y > bodyTop && r.y < feetY);
            // High beam: duck under it. Low beam: jump over it.
            const beamIsHigh = herBeamY < feetY - bodyH(s.bossStage) * 0.5;

            // A held burst is a stream, not one shot. He re-evaluates the
            // moment he can move again, including mid-air.
            if (threats > 0 || laserComing) {
              // More incoming shots means a more certain read.
              const smarts = Math.min(0.98, (s3 ? 0.9 : s2 ? 0.82 : 0.66) + threats * 0.1);
              const grounded = s.bossOff === 0 || s3;
              const canAir = !grounded && s.bossVy > -3 && s.bossOff > -110;
              if ((grounded || canAir) && Math.random() < smarts) {
                // Pick a move rather than always hopping. Low shots get ducked,
                // clustered ones get flipped away from, the rest get a hop.
                const lowest = Math.min(...s.bullets
                  .filter((b) => s.bossX - b.x > -20 && s.bossX - b.x < reach)
                  .map((b) => b.y), 9999);
                const high = lowest < feetY - bodyH(s.bossStage) * 0.55;
                // The move has to actually clear the shot. Ducking under a
                // burst aimed at his shins was getting him shredded — low shots
                // must leave the ground, high shots must go under.
                const hipY = feetY - bodyH(s.bossStage) * 0.45;
                const threatY = laserComing ? herBeamY : lowest;
                const lowShot = threatY > hipY;
                const roll2 = Math.random();

                if (lowShot) {
                  // Jump it. A flip clears more and carries him out of the lane.
                  if (grounded && roll2 < 0.45) {
                    s.dodgeKind = 'flip'; s.dodgeT = 34; s.bossVy = BOSS_JUMP * 1.15;
                  } else {
                    s.dodgeKind = 'hop'; s.dodgeT = 20;
                    s.bossVy = BOSS_JUMP * (grounded ? 1.05 : 0.85);
                  }
                } else if (grounded) {
                  // High shot: get under it.
                  s.dodgeKind = 'duck'; s.dodgeT = 28;
                } else {
                  s.dodgeKind = 'hop'; s.dodgeT = 20;
                  s.bossVy = BOSS_JUMP * 0.85;
                }
                s.bossAlert = 20;
                // Against a sustained burst he barely rests between dodges.
                const chained = threats >= 2 ? 0.5 : 1;
                s.bossDodgeCd = Math.round((s3 ? 6 : s2 ? 9 : 14) * chained);
              } else {
                s.bossDodgeCd = 10;
              }
            }
          }
          if (s.bossFlash > 0) s.bossFlash -= 1;
          if (s.tauntT > 0) s.tauntT -= 1; else s.taunt = null;

          // --- stickman melee: he actually comes over here ---
          if (s.melee) {
            s.melee.t += 1;
            if (s.melee.stage === 'in') {
              // He does not walk over. He closes the gap faster than you can see,
              // and leaves a trail of himself behind.
              s.melee.x += (PLAYER_X + 96 - s.melee.x) * 0.42;
              s.warp = 10;
              if (s.melee.t % 2 === 0) {
                s.ghosts.push({ x: s.melee.x, y: s.bossOff, life: 16, pose: 'run', t: s.melee.t });
              }
              if (s.melee.t > 13) {
                s.melee.stage = 'swing'; s.melee.t = 0; s.meleeHit = false;
                s.shake = 14; s.hitstop = 3;
              }
            } else if (s.melee.stage === 'swing') {
              if (s.melee.t > 5 && s.melee.t < 15 && !s.meleeHit) {
                if (Math.abs(s.melee.x - PLAYER_X) < 104 && s.y > GROUND - 78) {
                  s.meleeHit = true; s.hitstop = 8; s.shake = 30; damage(s2 ? 24 : 18);
                }
              }
              if (s.melee.t > 22) { s.melee.stage = 'out'; s.melee.t = 0; }
            } else {
              s.melee.x += (W + 120 - s.melee.x) * 0.3;
              if (s.melee.t % 2 === 0 && s.melee.t < 14) {
                s.ghosts.push({ x: s.melee.x, y: s.bossOff, life: 14, pose: 'run', t: s.melee.t });
              }
              if (s.melee.t > 18) { s.melee = null; s.bossX = W + 120; }
            }
          }

          // --- his laser (stage 2 only) ---
          if (s.bLaserTel > 0) {
            s.bLaserTel -= 1;
            // He aims at HER, not at his own palm height. Clamped low enough
            // that staying grounded is no longer a free dodge.
            const want = s.awakened ? s.herHeadY + 14 : s.y - PLAYER_R;
            s.bLaserY = Math.max(GROUND - 168, Math.min(GROUND - 16, want));
            if (s.bLaserTel === 0) { s.bLaserFire = 46; s.bLaserHit = false; s.shake = 18; }
          }
          if (s.bLaserFire > 0) {
            s.bLaserFire -= 1;
            if (!s.bLaserHit && Math.abs(s.y - PLAYER_R - s.bLaserY) < 32) { s.bLaserHit = true; damage(26); }
          }

          s.atkT -= 1;
          // A wind-up must be allowed to resolve, or the next pick stomps it
          // and you never see the move that was building.
          const idle = !s.melee && s.beam === 0 && s.telegraph === 0
            && s.bLaserFire === 0 && s.bLaserTel === 0
            && s.punchT === 0 && s.punchGo === 0 && s.trigT === 0 && s.tensei === 0;
          if (s.atkT <= 0 && s.bossX <= targetX + 4 && idle) {
            /**
             * Weighted pick, not a threshold cascade.
             *
             * The cascade had unreachable branches — after the stage-3 moves ran
             * the thresholds up past 0.41, the tests for mist (<0.27) and the
             * domain switch (<0.34) could never be true, so two of his attacks
             * simply never existed. A weight table cannot go stale like that,
             * and the numbers below are the actual frequencies.
             */
            const moves: [string, number][] = s3
              ? [
                  ['teleport', 8], ['tensei', 8], ['punch', 13], ['rasenshuriken', 13],
                  ['trigrams', 12], ['shuriken', 10], ['domain', 8],
                  ['spikes', 9], ['flames', 8], ['blaser', 7], ['melee', 8],
                  ['notes', 8], ['test', 7], ['question', 6], ['lecture', 6],
                ]
              : s2
                ? [
                    ['blaser', 10], ['melee', 16], ['notes', 22], ['test', 16],
                    ['question', 12], ['lecture', 14],
                  ]
                : [
                    ['melee', 18], ['notes', 26], ['test', 18], ['question', 14],
                    ['lecture', 16],
                  ];

            let total = 0;
            for (const [, w] of moves) total += w;
            let roll = Math.random() * total;
            let chosen = moves[moves.length - 1][0];
            for (const [name, w] of moves) {
              roll -= w;
              if (roll <= 0) { chosen = name; break; }
            }

            const hand = GROUND + s.bossOff - bodyH(s.bossStage) * 0.72;
            switch (chosen) {
              case 'teleport':
                s.tpT = 22;
                s.tpTo = PLAYER_X + 130 + Math.random() * (W - PLAYER_X - 260);
                break;
              case 'tensei':
                s.tensei = 52;
                break;
              case 'punch':
                s.punchT = 130;
                break;
              case 'rasenshuriken':
                s.rsk.push({ x: s.bossX - 40, y: GROUND + s.bossOff - bodyH(3) * 0.6, t: 0 });
                s.throwT = 24;
                break;
              case 'trigrams':
                s.trigT = 96; s.trigHits = 0;
                s.tpT = 16; s.tpTo = PLAYER_X + 120;
                break;
              case 'shuriken': {
                s.throwT = 20;
                const sh = GROUND + s.bossOff - bodyH(3) * 0.7;
                for (let i = 0; i < 5; i += 1) {
                  s.shurikens.push({ x: s.bossX - 30, y: sh, vy: (i - 2) * 1.5, t: 0 });
                }
                break;
              }

              case 'domain':
                s.domain = 1 + Math.floor(Math.random() * (DOMAINS.length - 1));
                s.domainFade = 60;
                s.gravMul = DOMAINS[s.domain].grav;
                s.shake = 26; s.flash = 14;
                break;
              case 'spikes':
                s.spikeTel = 46; s.spikeX = W - 190;
                break;
              case 'flames':
                s.flameTel = 54; s.flameX = PLAYER_X;
                break;
              case 'blaser':
                s.bLaserTel = 76;
                break;
              case 'melee':
                s.melee = { t: 0, stage: 'in', x: s.bossX };
                break;
              case 'notes': {
                const n = s2 ? 4 : 3;
                s.throwT = 20;
                for (let i = 0; i < n; i += 1) {
                  s.shots.push({ x: s.bossX - 40, y: hand + i * 24 - 24, vx: s2 ? -5.2 : -4.3, kind: 'notes', t: 0 });
                }
                break;
              }
              case 'test':
                s.throwT = 20;
                s.shots.push({ x: s.bossX - 40, y: GROUND - 24, vx: s2 ? -7.6 : -6.6, kind: 'test', t: 0 });
                break;
              case 'question':
                s.throwT = 20;
                s.shots.push({ x: s.bossX - 40, y: hand, vx: -3.1, kind: 'question', t: 0 });
                break;
              default:
                s.telegraph = s2 ? 66 : LECTURE_TELEGRAPH;
            }
            // Camping on the floor spamming shots invites the ground attack.
            if (s3 && s.y >= GROUND - 8 && s.spikeTel === 0 && s.spikeWave === 0
                && Math.random() < 0.4) {
              s.spikeTel = 40; s.spikeX = W - 190;
            }
            s.taunt = pick(s2 ? TAUNTS_2 : TAUNTS_1); s.tauntT = 150;
            s.atkT = (s3 ? 40 : s2 ? 68 : 90) + Math.random() * (s3 ? 22 : s2 ? 36 : 50);
          }

          if (s.telegraph > 0) {
            s.telegraph -= 1;
            if (s.telegraph === 0) { s.beam = s2 ? 100 : LECTURE_BEAM; s.beamTick = 0; }
          }

          // ---- earth spikes: a wave that marches from his side to hers ----
          if (s.spikeTel > 0) {
            s.spikeTel -= 1;
            if (s.spikeTel === 0) { s.spikeWave = 13; s.shake = 24; s.hitstop = 4; }
          }
          if (s.spikeWave > 0) {
            if (s.t % 4 === 0) {
              s.spikeWave -= 1;
              s.spikeX -= 62;
              s.spikes.push({ x: s.spikeX, t: 0 });
              s.shake = Math.max(s.shake, 6);
            }
          }
          for (const sp of s.spikes) sp.t += 1;
          s.spikes = s.spikes.filter((sp) => sp.t < 46);
          for (const sp of s.spikes) {
            // Dangerous only while it is out of the ground.
            if (sp.t > 3 && sp.t < 30 && Math.abs(PLAYER_X - sp.x) < 26
                && s.y > GROUND - 62 && s.iframes === 0) {
              damage(16);
            }
          }

          // ---- shinra tensei ----
          if (s.tensei > 0) {
            s.tensei -= 1;
            if (s.tensei === 22) {
              s.shake = 34; s.flash = 16;
              // Everything of hers is swept away, and so is she.
              s.bullets = []; s.rasengans = [];
              if (s.iframes === 0) damage(15);
              s.push = -120;
              s.vy = -9;
            }
          }

          // ---- serious punch ----
          if (s.punchT > 0) {
            s.punchT -= 1;
            if (s.punchT === 0) { s.punchGo = 34; s.shake = 46; s.flash = 26; s.hitstop = 8; }
          }
          if (s.punchGo > 0) {
            s.punchGo -= 1;
            // A wall of force crossing the arena. Only the air is safe.
            const wall = s.bossX - (34 - s.punchGo) * 34;
            if (Math.abs(wall - PLAYER_X) < 56 && s.y > GROUND - 120 && s.iframes === 0) {
              damage(38);
            }
          }

          // ---- rasenshuriken ----
          for (const r of s.rsk) { r.x -= 5.4; r.t += 1; }
          s.rsk = s.rsk.filter((r) => r.x > -90);
          for (const r of s.rsk) {
            const dy = (s.awakened ? s.herHeadY + 50 : s.y - PLAYER_R) - r.y;
            if (Math.abs(PLAYER_X - r.x) < 54 && Math.abs(dy) < 60 && s.iframes === 0) {
              r.x = -999; damage(24); s.shake = 26;
            }
          }
          s.rsk = s.rsk.filter((r) => r.x > -90);

          // ---- eight trigrams ----
          if (s.trigT > 0) {
            s.trigT -= 1;
            if (s.trigT % 11 === 0 && s.trigHits < 8) {
              s.trigHits += 1;
              if (Math.abs(s.bossX - PLAYER_X) < 190 && s.iframes === 0) {
                s.hp -= 6;
                s.hurt = 12; s.shake = 14;
                s.pops.push({ x: PLAYER_X, y: s.y - 110, life: 26, text: '-6', color: '#FF4D6D' });
                if (s.hp <= 0) { s.hp = 0; kill('EIGHT TRIGRAMS. SIXTY-FOUR PALMS.'); }
              }
            }
            if (s.trigT === 0) { s.homeX = W - 150; }
          }

          // ---- teleport: three blinks around the arena ----
          if (s.tpT > 0) {
            s.tpT -= 1;
            if (s.tpT === 13) {
              // The blink itself. He is simply somewhere else now.
              for (let i = 0; i < 18; i += 1) {
                s.sparks.push({
                  x: s.bossX, y: GROUND + s.bossOff - bodyH(3) * 0.5,
                  vx: (Math.random() - 0.5) * 9, vy: (Math.random() - 0.5) * 9,
                  life: 22, color: '#C9A9F5',
                });
              }
              s.bossX = s.tpTo;
              s.homeX = s.tpTo;
              s.stationT = 90;
            }
          }

          // ---- shinra tensei: a repulsion front off his palm ----
      if (s.tensei > 0) {
        const bxx = s.bossX, byy = GROUND + s.bossOff - bodyH(3) * 0.55;
        if (s.tensei > 22) {
          const k = 1 - (s.tensei - 22) / 30;
          ctx.strokeStyle = 'rgba(186,140,255,' + (0.3 + k * 0.6) + ')';
          ctx.lineWidth = 3;
          for (let i = 0; i < 8; i += 1) {
            const a2 = (i / 8) * Math.PI * 2 + s.t * 0.06;
            const d = 120 * (1 - k) + 24;
            ctx.beginPath();
            ctx.moveTo(bxx + Math.cos(a2) * d, byy + Math.sin(a2) * d);
            ctx.lineTo(bxx + Math.cos(a2) * (d * 0.6), byy + Math.sin(a2) * (d * 0.6));
            ctx.stroke();
          }
        } else {
          const k = 1 - s.tensei / 22;
          ctx.strokeStyle = 'rgba(210,190,255,' + (1 - k) + ')';
          ctx.lineWidth = 9;
          for (let i = 0; i < 3; i += 1) {
            ctx.beginPath();
            ctx.arc(bxx, byy, k * 620 + i * 60, Math.PI * 0.55, Math.PI * 1.45);
            ctx.stroke();
          }
          ctx.fillStyle = '#BA8CFF';
          ctx.font = '15px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SHINRA TENSEI', W / 2, 96);
        }
      }

      // ---- serious punch ----
      if (s.punchT > 0) {
        const k = 1 - s.punchT / 130;
        const bxx = s.bossX, byy = GROUND + s.bossOff - bodyH(3) * 0.6;
        // Air being dragged in behind the fist.
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.15 + k * 0.55) + ')';
        ctx.lineWidth = 2;
        for (let i = 0; i < 22; i += 1) {
          const yy = (i / 22) * H;
          const len = 40 + k * 220;
          ctx.beginPath(); ctx.moveTo(bxx + 60, yy); ctx.lineTo(bxx + 60 + len, yy); ctx.stroke();
        }
        const fg = ctx.createRadialGradient(bxx + 30, byy, 0, bxx + 30, byy, 40 + k * 70);
        fg.addColorStop(0, 'rgba(255,255,255,' + (0.5 + k * 0.5) + ')');
        fg.addColorStop(1, 'rgba(255,211,77,0)');
        ctx.fillStyle = fg;
        ctx.beginPath(); ctx.arc(bxx + 30, byy, 40 + k * 70, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFD34D';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        if (k > 0.3) ctx.fillText('SERIOUS PUNCH', W / 2, 96);
        ctx.font = '9px "Press Start 2P", monospace';
        if (k > 0.5) ctx.fillText('GET IN THE AIR', W / 2, 122);
      }
      if (s.punchGo > 0) {
        const wall = s.bossX - (34 - s.punchGo) * 34;
        const wg = ctx.createLinearGradient(wall - 70, 0, wall + 70, 0);
        wg.addColorStop(0, 'rgba(255,211,77,0)');
        wg.addColorStop(0.5, 'rgba(255,255,255,' + (s.punchGo / 34) + ')');
        wg.addColorStop(1, 'rgba(255,211,77,0)');
        ctx.fillStyle = wg;
        ctx.fillRect(wall - 70, GROUND - 120, 140, 120);
      }

      // ---- rasenshuriken ----
      for (const r of s.rsk) {
        ctx.save();
        ctx.translate(r.x, r.y);
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 84);
        glow.addColorStop(0, 'rgba(255,255,255,0.95)');
        glow.addColorStop(0.35, 'rgba(150,205,255,0.75)');
        glow.addColorStop(1, 'rgba(110,160,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(0, 0, 84, 0, Math.PI * 2); ctx.fill();
        ctx.rotate(r.t * 0.42);
        ctx.fillStyle = 'rgba(220,240,255,0.85)';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i += 1) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(64, -16);
          ctx.lineTo(74, 0);
          ctx.lineTo(64, 16);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF'; ctx.fill();
        ctx.restore();
      }

      // ---- eight trigrams ----
      if (s.trigT > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(200,230,255,0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(PLAYER_X, s.y - 90, 130, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(PLAYER_X, s.y - 90, 88, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 8; i += 1) {
          const a2 = (i / 8) * Math.PI * 2 + s.trigT * 0.02;
          ctx.beginPath();
          ctx.moveTo(PLAYER_X + Math.cos(a2) * 88, s.y - 90 + Math.sin(a2) * 88);
          ctx.lineTo(PLAYER_X + Math.cos(a2) * 130, s.y - 90 + Math.sin(a2) * 130);
          ctx.stroke();
        }
        // A strike flash on each palm.
        if (s.trigT % 11 > 7) {
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.beginPath();
          ctx.arc(PLAYER_X + 30 - Math.random() * 60, s.y - 60 - Math.random() * 90, 15, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#C8E6FF';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EIGHT TRIGRAMS  ' + s.trigHits + ' PALMS', W / 2, 96);
        ctx.restore();
      }

      // ---- shuriken ----
          for (const sh of s.shurikens) { sh.x -= 8.2; sh.y += sh.vy; sh.t += 1; }
          s.shurikens = s.shurikens.filter((sh) => sh.x > -40);
          for (const sh of s.shurikens) {
            const dx = PLAYER_X - sh.x, dy = (s.awakened ? s.herHeadY + 40 : s.y - PLAYER_R) - sh.y;
            if (dx * dx + dy * dy < 30 * 30 && s.iframes === 0) {
              sh.x = -999; damage(11);
            }
          }
          s.shurikens = s.shurikens.filter((sh) => sh.x > -40);

          if (s.mist > 0) s.mist -= 1;
          if (s.domainFade > 0) s.domainFade -= 1;

          // ---- amaterasu: black flame that lands where she was standing ----
          if (s.flameTel > 0) {
            s.flameTel -= 1;
            if (s.flameTel === 0) {
              s.flames.push({ x: s.flameX, t: 0 });
              s.shake = 18; s.flash = 8;
            }
          }
          for (const fl of s.flames) fl.t += 1;
          s.flames = s.flames.filter((fl) => fl.t < 200);
          for (const fl of s.flames) {
            if (fl.t > 6 && Math.abs(PLAYER_X - fl.x) < 44 && s.y > GROUND - 54
                && s.t % 14 === 0 && s.iframes === 0) {
              damage(9);
            }
          }
          if (s.beam > 0) {
            s.beam -= 1; s.beamTick += 1;
            if (!airborne && s.beamTick % 13 === 0) damage(s2 ? 9 : 7);
          }

          for (const sh of s.shots) {
            sh.t += 1; sh.x += sh.vx;
            if (sh.kind === 'question') sh.y += Math.sin(sh.t * 0.09) * 2.6;
          }
          for (const sh of s.shots) {
            const dx = PLAYER_X - sh.x, dy = s.y - PLAYER_R - sh.y;
            if (dx * dx + dy * dy < (PLAYER_R + 9) ** 2 && s.iframes === 0) {
              sh.x = -999;
              damage(sh.kind === 'test' ? 18 : sh.kind === 'notes' ? 12 : 14);
            }
          }
          s.shots = s.shots.filter((sh) => sh.x > -60);

          // Two hitboxes: a small head worth triple, and the body.
          const bx = s.melee ? s.melee.x : s.bossX;
          // Ducking drops his head to hip height, so high shots sail over.
          // He only ever ducks high shots now, so this cannot backfire.
          const ducking = s.dodgeKind === 'duck';
          const hy = feetY - bodyH(s.bossStage) * (ducking ? 0.34 : 1);
          const hr2 = headR(s.bossStage);
          for (const r of s.rasengans) {
            if (Math.abs(r.x - bx) < 52 && r.y > hy - hr2 - 20 && r.y < feetY) {
              r.x = W + 999;
              hurtBoss(RASEN_DMG, true, 'RASENGAN');
            }
          }
          for (const b of s.bullets) {
            const dx = b.x - bx, dy = b.y - hy;
            if (dx * dx + dy * dy < (hr2 + 6) ** 2) {
              b.x = W + 999;
              hurtBoss(HEAD_DMG, true, 'HEADSHOT');
            } else if (Math.abs(b.x - bx) < 34 && b.y > hy + hr2 && b.y < feetY) {
              b.x = W + 999;
              hurtBoss(BODY_DMG);
            }
          }
        }

        s.bullets = s.bullets.filter((b) => b.x < W + 40);
        s.pops = s.pops.map((p) => ({ ...p, y: p.y - 1, life: p.life - 1 })).filter((p) => p.life > 0);
        s.sparks = s.sparks
          .map((p) => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.3, life: p.life - 1 }))
          .filter((p) => p.life > 0);

        if (s.t % 5 === 0) {
          setHud({
            score: Math.floor(s.score), level: s.level, fulkis: s.fulkis,
            hp: Math.max(0, Math.round(s.hp)), maxHp: s.maxHp,
            bossHp: s.phase === 'boss' ? Math.max(0, Math.round((s.bossHp / s.bossMax) * 100)) : -1,
            stage: s.bossStage, burger: s.hasBurger,
            laser: s.laserCd > 0 ? Math.round(100 - (s.laserCd / LASER_COOLDOWN) * 100) : 100,
            awake: s.awakened,
            rasen: s.rasenCd > 0 ? Math.round(100 - (s.rasenCd / RASEN_CD) * 100) : 100,
            ama: s.amaCd > 0 ? Math.round(100 - (s.amaCd / AMA_CD) * 100) : 100,
            sus: s.susCd > 0 ? Math.round(100 - (s.susCd / SUS_CD) * 100) : 100,
            kamui: s.kamuiCd > 0 ? Math.round(100 - (s.kamuiCd / KAMUI_CD) * 100) : 100,
            susOn: s.susT > 0, domain: s.domain, rewinds: s.rewinds,
          });
        }
      }

      if (s.shake > 0) s.shake -= 1;
    };

    const draw = () => {
      const s = g.current;
      // ================= draw =================
      const s2 = s.bossStage === 2 && s.phase !== 'run' && s.phase !== 'incoming';
      // Cutscene camera: push in on whoever the beat is framing.
      const cineBeat = s.phase === 'cutscene'
        ? beatAt(cineScript(s.cineKind), s.cine)
        : null;

      ctx.save();
      if (s.shake > 0) ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
      if (s.act && s.actCam > 1.02) {
        const fx = s.act.kind === 'kamui' || s.act.kind === 'chidori'
          ? s.bossX - 60
          : PLAYER_X + 60;
        ctx.translate(W / 2, H / 2);
        ctx.scale(s.actCam, s.actCam);
        ctx.translate(-fx, -(GROUND - 90));
      }
      if (cineBeat) {
        const focusX = cineBeat.on === 'boss' ? s.bossX
          : cineBeat.on === 'her' || cineBeat.on === 'eye' ? PLAYER_X + 40
          : (s.bossX + PLAYER_X) / 2;
        const focusY = cineBeat.on === 'eye' ? GROUND - 118
          : cineBeat.on === 'her' ? GROUND - 70 : GROUND - 60;
        // Ease toward the framing rather than snapping between beats.
        s.camZoom += (cineBeat.zoom - s.camZoom) * 0.06;
        s.camX += (focusX - s.camX) * 0.06;
        ctx.translate(W / 2, H / 2);
        ctx.scale(s.camZoom, s.camZoom);
        ctx.translate(-s.camX, -focusY);
      }

      const dom = DOMAINS[s.domain];
      const inFight = s.phase === 'boss' || s.phase === 'cutscene';
      ctx.fillStyle = s.domain > 0 ? dom.sky
        : inFight ? (s2 ? '#1B0509' : '#140B10')
        : '#0B0E14';
      ctx.fillRect(-30, -30, W + 60, H + 60);

      // Photographic backdrop, cover-fit and knocked back so the fight reads
      // over it. A domain switch tints straight over the top of it.
      const bg = inFight ? bgBoss.current : bgRun.current;
      if (bg) {
        // Cover-fit and centred, held still. Scaled up until it fills the frame
        // on both axes, so there is never a gap at an edge.
        const scale = Math.max(W / bg.width, H / bg.height);
        const bw = bg.width * scale, bh2 = bg.height * scale;
        ctx.save();
        ctx.globalAlpha = inFight ? 0.92 : 0.95;
        ctx.drawImage(bg, (W - bw) / 2, (H - bh2) / 2, bw, bh2);
        ctx.restore();
        // Knock it back so the stickmen and projectiles stay legible, then let
        // the active domain wash its own colour over the top.
        ctx.fillStyle = inFight ? 'rgba(18,6,10,0.14)' : 'rgba(11,14,20,0.12)';
        ctx.fillRect(0, 0, W, H);
        if (s.domain > 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.16)';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = dom.hill;
          ctx.fillRect(0, 0, W, H);
        }
        // A soft floor gradient keeps the ground line and HP bars readable
        // without dimming the whole picture.
        const legibility = ctx.createLinearGradient(0, GROUND - 130, 0, H);
        legibility.addColorStop(0, 'rgba(6,4,10,0)');
        legibility.addColorStop(1, 'rgba(6,4,10,0.55)');
        ctx.fillStyle = legibility;
        ctx.fillRect(0, GROUND - 130, W, H - GROUND + 130);
      }

      ctx.fillStyle = s.domain > 0 ? dom.hill
        : s.phase === 'boss' ? 'rgba(255,77,109,0.06)' : 'rgba(77,225,193,0.07)';
      for (let i = 0; i < 5; i += 1) {
        const x = ((i * 260 - s.dist * 0.18) % (W + 320)) - 160;
        ctx.beginPath(); ctx.arc(x, GROUND + 40, 120, Math.PI, 0); ctx.fill();
      }

      const lineC = s.domain > 0 ? dom.line
        : s.phase === 'boss' || s.phase === 'cutscene' ? '#FF4D6D' : '#4DE1C1';
      ctx.strokeStyle = lineC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
      ctx.fillStyle = s.phase === 'boss' ? 'rgba(255,77,109,0.3)' : 'rgba(77,225,193,0.35)';
      for (let i = 0; i < 30; i += 1) {
        const x = ((i * 44 - s.dist * 0.9) % (W + 80)) - 40;
        ctx.fillRect(x, GROUND + 10, 18, 2);
      }

      // ---- earth spikes ----
      if (s.spikeTel > 0) {
        ctx.strokeStyle = 'rgba(255,77,109,' + (Math.floor(s.spikeTel / 5) % 2 ? 0.8 : 0.3) + ')';
        ctx.lineWidth = 3;
        for (let i = 0; i < 14; i += 1) {
          const cx2 = W - 190 - i * 62;
          ctx.beginPath();
          ctx.moveTo(cx2 - 10, GROUND); ctx.lineTo(cx2, GROUND - 9); ctx.lineTo(cx2 + 10, GROUND);
          ctx.stroke();
        }
      }
      for (const sp of s.spikes) {
        const grow = sp.t < 8 ? sp.t / 8 : sp.t > 30 ? Math.max(0, 1 - (sp.t - 30) / 16) : 1;
        const hgt = 64 * grow;
        if (hgt < 1) continue;
        ctx.fillStyle = '#8B1E3F';
        ctx.strokeStyle = '#FF4D6D';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sp.x - 17, GROUND + 2);
        ctx.lineTo(sp.x, GROUND - hgt);
        ctx.lineTo(sp.x + 17, GROUND + 2);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      }

      // ---- amaterasu ----
      if (s.flameTel > 0) {
        const k = 1 - s.flameTel / 54;
        ctx.strokeStyle = 'rgba(150,60,255,' + (0.35 + k * 0.6) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s.flameX, GROUND - 6, 46 - k * 14, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(s.flameX, GROUND - 6, (46 - k * 14) * 0.55, 0, Math.PI * 2); ctx.stroke();
      }
      for (const fl of s.flames) {
        const life = Math.min(1, fl.t / 10) * Math.min(1, (200 - fl.t) / 40);
        for (let i = 0; i < 9; i += 1) {
          const a = s.t * 0.09 + i;
          const hgt = (34 + Math.sin(a * 1.7) * 20) * life;
          const fx = fl.x - 34 + i * 8.5;
          const gg = ctx.createLinearGradient(fx, GROUND, fx, GROUND - hgt);
          gg.addColorStop(0, 'rgba(20,0,30,' + life + ')');
          gg.addColorStop(0.6, 'rgba(70,10,110,' + life * 0.85 + ')');
          gg.addColorStop(1, 'rgba(150,60,255,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(fx - 4, GROUND - hgt, 8, hgt);
        }
      }

      ctx.textAlign = 'center';
      for (const e of s.entities) {
        if (e.kind === 'burger') {
          // The one epic item: a pulsing golden aura and rotating shine rays.
          const pulse = 0.7 + Math.sin(s.t * 0.11) * 0.3;
          const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
          const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 62 * pulse);
          glow.addColorStop(0, 'rgba(255,201,77,0.85)');
          glow.addColorStop(0.4, 'rgba(255,201,77,0.32)');
          glow.addColorStop(1, 'rgba(255,201,77,0)');
          ctx.fillStyle = glow;
          ctx.beginPath(); ctx.arc(cx, cy, 62 * pulse, 0, Math.PI * 2); ctx.fill();
          ctx.save();
          ctx.translate(cx, cy); ctx.rotate(s.t * 0.024);
          ctx.strokeStyle = `rgba(255,231,150,${0.55 * pulse})`; ctx.lineWidth = 2;
          for (let i = 0; i < 8; i += 1) {
            const a = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 26, Math.sin(a) * 26);
            ctx.lineTo(Math.cos(a) * (40 + pulse * 10), Math.sin(a) * (40 + pulse * 10));
            ctx.stroke();
          }
          ctx.restore();
          ctx.font = '36px serif';
          ctx.fillText('🍔', cx, cy + 13);
          ctx.fillStyle = '#FFC94D';
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText('EXTRA LIFE', cx, cy - 40);
        } else if (e.kind === 'fulki') { ctx.font = '24px serif'; ctx.fillText('🍛', e.x + e.w / 2, e.y + e.h); }
        else if (e.kind === 'zzz') {
          ctx.fillStyle = 'rgba(169,155,232,0.9)';
          ctx.font = 'bold 26px "Press Start 2P", monospace';
          ctx.fillText('z', e.x + e.w / 2, e.y + e.h);
        } else { ctx.font = e.kind === 'stack' ? '46px serif' : '30px serif'; ctx.fillText('📚', e.x + e.w / 2, e.y + e.h); }
      }

      if (s.telegraph > 0) {
        const on = Math.floor(s.telegraph / 6) % 2 === 0;
        ctx.fillStyle = on ? 'rgba(255,77,109,0.22)' : 'rgba(255,77,109,0.08)';
        ctx.fillRect(0, GROUND - BEAM_HEIGHT, W, BEAM_HEIGHT);
        ctx.fillStyle = '#FF4D6D';
        ctx.font = '13px "Press Start 2P", monospace';
        ctx.fillText(`${s2 ? '8' : '6'}-HOUR LECTURE IN ${Math.ceil(s.telegraph / 28)}`, W / 2, GROUND - 84);
        ctx.fillStyle = '#4DE1C1';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('JUMP — THE AIR IS SAFE', W / 2, GROUND - 62);
      }
      if (s.beam > 0) {
        const grd = ctx.createLinearGradient(0, GROUND - BEAM_HEIGHT, 0, GROUND);
        grd.addColorStop(0, 'rgba(255,77,109,0.25)');
        grd.addColorStop(1, 'rgba(255,77,109,0.7)');
        ctx.fillStyle = grd; ctx.fillRect(0, GROUND - BEAM_HEIGHT, W, BEAM_HEIGHT);
        ctx.fillStyle = '#fff'; ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillText(`${s2 ? '8' : '6'}-HOUR LECTURE`, W / 2, GROUND - 26);
      }

      // Aim line for the incoming kamehameha. The beam itself is drawn with him,
      // because it has to start at his palms rather than at the screen edge.
      if (s.bLaserTel > 0) {
        ctx.strokeStyle = 'rgba(255,77,109,' + (Math.floor(s.bLaserTel / 5) % 2 ? 0.9 : 0.3) + ')';
        ctx.lineWidth = 2; ctx.setLineDash([12, 8]);
        ctx.beginPath(); ctx.moveTo(0, s.bLaserY); ctx.lineTo(W, s.bLaserY); ctx.stroke();
        ctx.setLineDash([]);
      }

      // ---- shuriken ----
      for (const sh of s.shurikens) {
        ctx.save();
        ctx.translate(sh.x, sh.y);
        ctx.rotate(sh.t * 0.55);
        ctx.strokeStyle = '#D9E6F2';
        ctx.fillStyle = 'rgba(160,180,200,0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 4; i += 1) {
          const a2 = (i / 4) * Math.PI * 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a2) * 15, Math.sin(a2) * 15);
          ctx.lineTo(Math.cos(a2 + 0.5) * 6, Math.sin(a2 + 0.5) * 6);
        }
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();
      }

      for (const sh of s.shots) {
        ctx.font = '26px serif';
        ctx.fillText(sh.kind === 'notes' ? '📄' : sh.kind === 'test' ? '📝' : '❓', sh.x, sh.y + 9);
      }

      for (const b of s.bullets) {
        ctx.fillStyle = '#4DE1C1';
        ctx.fillRect(b.x - 13, b.y - 10, 26, 20);
        ctx.fillStyle = '#0B0E14';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText(b.sym, b.x, b.y + 3);
      }

      // ---- boss: a stickman, full time ----
      if (s.phase === 'boss' || s.phase === 'won' || s.phase === 'cutscene') {
        const chi = s.act?.kind === 'chidori' ? s.act.t : -1;
        const lunge = chi >= 110 && chi < 170 ? (chi - 110) / 60 : chi >= 170 ? 1 : 0;
        const bx = (s.melee ? s.melee.x : s.bossX) + s.bossKnock
          - lunge * (s.bossX - PLAYER_X - 90);
        const s3d = s.bossStage === 3;
        const feetY = GROUND + s.bossOff;
        const flash = s.bossFlash > 0;

        let pose = 'idle';
        let poseT = s.step;
        if (s.act?.kind === 'chidori') {
          const at = s.act.t;
          pose = at < 110 ? 'chidori' : at < 170 ? 'chidash' : 'stance';
          poseT = at;
        } else if (s.act?.kind === 'kamui' && s.kamuiBlocked && s.act.t > 40) {
          pose = 'lecture'; poseT = s.act.t;
        } else if (s.phase === 'cutscene') {
          const script = cineScript(s.cineKind);
          const beat = beatAt(script, s.cine);
          pose = beat.pose;
          poseT = beat.pose === 'rise'
            ? s.cine - (script[script.indexOf(beat) - 1]?.end ?? 0)
            : s.cine;
        } else if (s.melee) {
          pose = s.melee.stage === 'swing' ? 'swing' : 'run';
          poseT = s.melee.t;
        } else if (s.bLaserTel > 0) pose = 'charge';
        else if (s.bLaserFire > 0) pose = 'blast';
        else if (s.telegraph > 0 || s.beam > 0) pose = 'lecture';
        else if (s.tensei > 0) pose = 'lecture';
        else if (s.punchT > 0 || s.punchGo > 0) pose = s.punchGo > 0 ? 'thrust' : 'chidori';
        else if (s.trigT > 0) pose = 'swing';
        else if (s.dodgeKind === 'flip') { pose = 'backflip'; poseT = 34 - s.dodgeT; }
        else if (s.dodgeKind === 'duck') pose = 'duck';
        else if (s.dodgeKind === 'slide') pose = 'slide';
        else if (s.bossOff < -6) pose = 'jump';
        else if (s.throwT > 0) { pose = 'throw'; poseT = 20 - s.throwT; }

        if (s3d) {
          // Flame aura licking upward around him.
          const cy = feetY - bodyH(3) * 0.55;
          for (let i = 0; i < 16; i += 1) {
            const a = (i / 16) * Math.PI * 2 + s.t * 0.03;
            const rr = 62 + Math.sin(s.t * 0.14 + i) * 16;
            ctx.fillStyle = 'rgba(255,211,77,' + (0.14 + Math.sin(s.t * 0.2 + i) * 0.1) + ')';
            ctx.fillRect(bx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.85, 4, 14);
          }
          const au = ctx.createRadialGradient(bx, cy, 12, bx, cy, 130);
          au.addColorStop(0, 'rgba(255,211,77,' + (0.3 + Math.sin(s.t * 0.16) * 0.12) + ')');
          au.addColorStop(1, 'rgba(255,140,0,0)');
          ctx.fillStyle = au;
          ctx.beginPath(); ctx.arc(bx, cy, 130, 0, Math.PI * 2); ctx.fill();
        } else if (s2) {
          const cy = feetY - bodyH(2) * 0.6;
          const aura = ctx.createRadialGradient(bx, cy, 10, bx, cy, 110);
          aura.addColorStop(0, 'rgba(255,77,109,' + (0.26 + Math.sin(s.t * 0.15) * 0.14) + ')');
          aura.addColorStop(1, 'rgba(255,77,109,0)');
          ctx.fillStyle = aura;
          ctx.beginPath(); ctx.arc(bx, cy, 110, 0, Math.PI * 2); ctx.fill();
        }

        // Shadow shrinks as he leaves the ground.
        const lift = Math.min(1, -s.bossOff / 90);
        ctx.fillStyle = 'rgba(0,0,0,' + (0.35 * (1 - lift * 0.7)) + ')';
        ctx.beginPath();
        ctx.ellipse(bx, GROUND + 4, 30 * (1 - lift * 0.4), 6 * (1 - lift * 0.4), 0, 0, Math.PI * 2);
        ctx.fill();

        // Warp trail: the versions of him you didn't see move.
        for (const gh of s.ghosts) {
          ctx.globalAlpha = (gh.life / 16) * 0.4;
          drawStickman(gh.x, GROUND + gh.y, s.bossStage, gh.pose, gh.t, false, 0);
          ctx.globalAlpha = 1;
        }
        // Horizontal speed lines while he is closing.
        if (s.warp > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,' + (s.warp / 10) * 0.5 + ')';
          ctx.lineWidth = 2;
          for (let i = 0; i < 9; i += 1) {
            const ly = GROUND - 20 - i * 16 - (i % 3) * 5;
            const lx = bx + 40 + (i % 4) * 60;
            ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 90 + (i % 3) * 40, ly); ctx.stroke();
          }
        }

        const rig = drawStickman(bx, feetY, s.bossStage, pose, poseT, flash, s.bossHurt, {
          img: bossImg.current, crop: BOSS_FACE, col: s3d ? '#FFD34D' : '#FF4D6D',
          ascended: s3d, bleed: s3d ? s.bleed : 0,
        });
        s.palmX = rig.palm.x; s.palmY = rig.palm.y;

        // ---- KAMEHAMEHA ----
        if (s.bLaserTel > 0) {
          const p2 = 1 - s.bLaserTel / 76;
          const ox = rig.palm.x, oy = rig.palm.y;

          // Energy spiralling inward from all around him.
          for (let i = 0; i < 14; i += 1) {
            const a = (i / 14) * Math.PI * 2 + s.t * 0.07;
            const d = 120 * (1 - p2) + 26 + Math.sin(s.t * 0.2 + i) * 8;
            ctx.fillStyle = 'rgba(255,120,150,' + (0.25 + p2 * 0.6) + ')';
            ctx.fillRect(ox + Math.cos(a) * d, oy + Math.sin(a) * d, 3, 3);
          }
          // Ground crackle under him while he winds up.
          ctx.strokeStyle = 'rgba(255,77,109,' + (p2 * 0.7) + ')';
          ctx.lineWidth = 2;
          for (let i = 0; i < 5; i += 1) {
            const gx = bx - 50 + i * 25 + Math.sin(s.t * 0.4 + i) * 6;
            ctx.beginPath();
            ctx.moveTo(gx, GROUND);
            ctx.lineTo(gx + 5, GROUND - 12 - Math.random() * 12 * p2);
            ctx.stroke();
          }
          // The orb between his palms.
          const orbR = 5 + p2 * 20;
          const orb = ctx.createRadialGradient(ox, oy, 0, ox, oy, orbR * 2.2);
          orb.addColorStop(0, 'rgba(255,255,255,' + (0.6 + p2 * 0.4) + ')');
          orb.addColorStop(0.35, 'rgba(255,90,120,' + (0.55 + p2 * 0.45) + ')');
          orb.addColorStop(1, 'rgba(255,60,90,0)');
          ctx.fillStyle = orb;
          ctx.beginPath(); ctx.arc(ox, oy, orbR * 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(ox, oy, orbR * 0.5, 0, Math.PI * 2); ctx.fill();

          if (p2 > 0.5) {
            ctx.fillStyle = '#FF4D6D';
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            const syl = ['KA', 'KA ME', 'KA ME HA', 'KA ME HA ME'];
            ctx.fillText(syl[Math.min(3, Math.floor((p2 - 0.5) * 9))], bx, rig.headY - rig.hr - 16);
          }
        }

        if (s.bLaserFire > 0) {
          const f = Math.min(1, s.bLaserFire / 10);
          const ox = rig.palm.x, oy = s.bLaserY;
          const thick = 30 * f;
          const bg = ctx.createLinearGradient(0, oy - thick, 0, oy + thick);
          bg.addColorStop(0, 'rgba(255,77,109,0)');
          bg.addColorStop(0.32, 'rgba(255,90,120,' + (f * 0.85) + ')');
          bg.addColorStop(0.5, 'rgba(255,255,255,' + f + ')');
          bg.addColorStop(0.68, 'rgba(255,90,120,' + (f * 0.85) + ')');
          bg.addColorStop(1, 'rgba(255,77,109,0)');
          ctx.fillStyle = bg;
          ctx.fillRect(0, oy - thick, ox, thick * 2);
          // Muzzle bloom at the palms.
          const m = ctx.createRadialGradient(ox, oy, 0, ox, oy, 46 * f);
          m.addColorStop(0, 'rgba(255,255,255,' + f + ')');
          m.addColorStop(1, 'rgba(255,77,109,0)');
          ctx.fillStyle = m;
          ctx.beginPath(); ctx.arc(ox, oy, 46 * f, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#FF4D6D';
          ctx.font = '11px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('HAAAA!', bx, rig.headY - rig.hr - 18);
        }

        if (pose === 'swing' && s.melee && s.melee.t > 5 && s.melee.t < 15) {
          ctx.fillStyle = '#FFC94D';
          ctx.font = '11px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('THWACK', bx - 70, rig.headY - 26);
        }
        if (pose === 'lecture') {
          ctx.fillStyle = '#FF4D6D';
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('*deep breath*', bx, rig.headY - rig.hr - 12);
        }
        // The dodge tell — he sees it coming.
        if (s.bossAlert > 0) {
          ctx.fillStyle = '#FFD166';
          ctx.font = '16px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('!', bx + 30, rig.headY - rig.hr - 6);
        }

        if (s.taunt && !s.bLaserTel && !s.bLaserFire) {
          const tw = Math.min(370, s.taunt.length * 6.4 + 22);
          const ty = rig.headY - rig.hr - 46;
          ctx.fillStyle = 'rgba(11,14,20,0.92)';
          ctx.strokeStyle = '#FF4D6D'; ctx.lineWidth = 2;
          ctx.fillRect(bx - tw - 28, ty, tw, 34);
          ctx.strokeRect(bx - tw - 28, ty, tw, 34);
          ctx.beginPath();
          ctx.moveTo(bx - 28, ty + 22); ctx.lineTo(bx - 12, ty + 40); ctx.lineTo(bx - 40, ty + 34);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#FF4D6D';
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(s.taunt, bx - tw / 2 - 28, ty + 21);
        }
      }

      // ---- player ----
      // In a cutscene she steps into the shot instead of running on the spot.
      const cinePx = cineBeat
        ? PLAYER_X + 120 + Math.max(0, 1 - s.cine / 90) * -60
        : PLAYER_X + s.push;
      // Kamui puts her behind him, above his head, for the kick.
      const kamuiActive = s.act?.kind === 'kamui' && s.act.t >= 40 && s.act.t < 130;
      const px = kamuiActive ? s.bossX + 54 : cineBeat ? cinePx : PLAYER_X + s.push;
      const py = kamuiActive ? GROUND + s.bossOff - bodyH(s.bossStage) - 26
        : cineBeat ? GROUND - PLAYER_R : s.y - PLAYER_R;
      const squash = Math.max(0.82, Math.min(1.18, 1 - s.vy * 0.012));
      const blink = s.iframes > 0 && Math.floor(s.iframes / 4) % 2 === 0;

      if (s.revive > 0) {
        const r = 40 + (60 - s.revive) * 2.4;
        const gg = ctx.createRadialGradient(px, py, 0, px, py, r);
        gg.addColorStop(0, `rgba(255,201,77,${s.revive / 60})`);
        gg.addColorStop(1, 'rgba(255,201,77,0)');
        ctx.fillStyle = gg;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      }

      const herCol = s.dying || s.hurt > 0 ? '#FF4D6D' : s.revive > 0 ? '#FFC94D' : s.awakened ? '#BA8CFF' : '#4DE1C1';

      if (s.awakened || (cineBeat && s.cineKind === 'awaken')) {
        // Awakened, she stands in the fight properly.
        const act = s.act;
        const herPose = act
          ? (act.kind === 'sus'
              ? (act.t < 90 ? 'seals' : act.t < 130 ? 'eyegrip' : 'stance')
              : act.kind === 'rasen'
                ? (act.t < 26 ? 'cup' : act.t < 92 ? 'rasenform' : 'thrust')
                : (act.t < 40 ? 'stance' : act.t < 120 ? 'spinkick' : 'stance'))
          : cineBeat ? (beatAt(cineScript(s.cineKind), s.cine).pose)
          : s.rasenT > 0 ? 'throw'
          : s.hurt > 0 ? 'idle'
          : s.y < GROUND - 12 || s.flying ? 'jump'
          // Standing her ground in the fight; only running before he arrives.
          : s.phase === 'boss' ? 'stance'
          : 'run';
        const herT = act ? act.t : cineBeat ? s.cine - 640 : s.t;
        ctx.globalAlpha = blink ? 0.4 : 1;
        if (s.awakened) {
          const gl = ctx.createRadialGradient(px, py - 30, 6, px, py - 30, 78);
          gl.addColorStop(0, 'rgba(186,140,255,0.28)');
          gl.addColorStop(1, 'rgba(186,140,255,0)');
          ctx.fillStyle = gl;
          ctx.beginPath(); ctx.arc(px, py - 30, 78, 0, Math.PI * 2); ctx.fill();
        }
        const herRig = drawStickman(px, kamuiActive ? py + 118 : cineBeat ? GROUND : s.y, 1, herPose, herT, false,
          s.hurt > 0 ? s.hurt * 0.6 : 0, {
            // She faces him. The rig is authored facing left, so she mirrors.
            img: eyeImgs.current[s.eyeStage] ?? avatar.current,
            crop: undefined, col: herCol,
            // Behind him she is looking the other way.
            dir: kamuiActive ? 1 : -1,
            bleed: s.eyeBlood,
          });
        s.herHeadX = herRig.headX; s.herHeadY = herRig.headY; s.herHeadR = herRig.hr;
        ctx.globalAlpha = 1;
      } else {
        ctx.save();
        ctx.translate(px, py);
        if (s.hurt > 0) ctx.rotate((s.hurt / 30) * 0.28 * Math.sin(s.hurt));
        ctx.scale(1 / squash, squash);
        ctx.globalAlpha = blink ? 0.35 : 1;
        if (avatar.current) {
          drawCircle(eyeImgs.current[s.eyeStage] ?? avatar.current, 0, 0, PLAYER_R, herCol);
          if (s.hurt > 0) {
            ctx.fillStyle = 'rgba(255,77,109,' + (s.hurt / 30) * 0.5 + ')';
            ctx.beginPath(); ctx.arc(0, 0, PLAYER_R, 0, Math.PI * 2); ctx.fill();
          }
        } else { ctx.fillStyle = '#FF4D6D'; ctx.fillRect(-PLAYER_R, -PLAYER_R, PLAYER_R * 2, PLAYER_R * 2); }
        ctx.globalAlpha = 1;
        ctx.restore();
        s.herHeadX = px; s.herHeadY = py; s.herHeadR = PLAYER_R;
      }

      // ---- her eye laser ----
      if (s.laserPhase !== 'idle') {
        // Anchored to her tracked head, so it still comes from her eyes once
        // she is a stickman and half her height taller.
        const hx = s.herHeadX, hy2 = s.herHeadY, hrr = s.herHeadR;
        for (const e of EYES) {
          const ex = hx + (-1 + e.nx * 2) * hrr * (s.awakened ? -1 : 1);
          const ey = hy2 + (-1 + e.ny * 2) * hrr;
          if (s.laserPhase === 'charge') {
            const p = 1 - s.laserT / LASER_CHARGE;
            const r = 3 + p * 5;
            const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, r * 3.4);
            glow.addColorStop(0, `rgba(255,60,90,${p})`);
            glow.addColorStop(0.45, `rgba(255,60,90,${p * 0.45})`);
            glow.addColorStop(1, 'rgba(255,60,90,0)');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(ex, ey, r * 3.4, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = `rgba(255,90,110,${p})`; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.stroke();
            ctx.strokeStyle = `rgba(255,60,90,${p * 0.8})`;
            ctx.beginPath(); ctx.arc(ex, ey, r + 12 * (1 - p) + 3, 0, Math.PI * 2); ctx.stroke();
          } else {
            const fade = Math.min(1, s.laserT / 12);
            const thick = (5 + Math.sin(s.t * 0.9) * 1.6) * fade;
            const beamGrd = ctx.createLinearGradient(ex, 0, W, 0);
            beamGrd.addColorStop(0, `rgba(255,255,255,${fade})`);
            beamGrd.addColorStop(0.12, `rgba(255,80,110,${fade})`);
            beamGrd.addColorStop(1, `rgba(255,60,90,${fade * 0.5})`);
            ctx.fillStyle = beamGrd;
            ctx.fillRect(ex, ey - thick / 2, W - ex, thick);
            ctx.fillStyle = `rgba(255,255,255,${fade * 0.9})`;
            ctx.fillRect(ex, ey - thick / 5, W - ex, thick / 2.5);
            ctx.beginPath(); ctx.arc(ex, ey, thick * 1.5, 0, Math.PI * 2); ctx.fill();
          }
        }
      }

      // ---- rasengan built by hand ----
      if (s.act?.kind === 'rasen') {
        const a = s.act;
        const k = Math.min(1, a.t / 92);

        // Kage bunshin: a clone fades in beside her and shapes it with her.
        if (a.t > 14 && a.t < 104) {
          const cf = Math.min(1, (a.t - 14) / 16) * Math.min(1, (104 - a.t) / 14);
          ctx.save();
          ctx.globalAlpha = 0.5 * cf;
          drawStickman(px - 54, s.y, 1, a.t < 26 ? 'cup' : 'rasenform', a.t, false, 0, {
            img: eyeImgs.current[s.eyeStage] ?? avatar.current,
            crop: undefined, col: '#9AC8FF', dir: -1,
          });
          ctx.restore();
          if (a.t < 40) {
            ctx.fillStyle = 'rgba(154,200,255,' + cf + ')';
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('KAGE BUNSHIN', px - 54, s.y - 200);
          }
        }
        const rx = s.herHeadX + 46, ry = s.herHeadY + 34;
        // Chakra dragged in from all around and wound into the shell.
        if (a.t < 92) {
          for (let i = 0; i < 20; i += 1) {
            const ang = (i / 20) * Math.PI * 2 + a.t * 0.09;
            const d = 118 * (1 - k) + 22;
            ctx.fillStyle = 'rgba(150,205,255,' + (0.25 + k * 0.6) + ')';
            ctx.fillRect(rx + Math.cos(ang) * d, ry + Math.sin(ang) * d, 3, 3);
          }
        }
        const rad = 6 + k * 18;
        const gr3 = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad * 2.3);
        gr3.addColorStop(0, 'rgba(255,255,255,1)');
        gr3.addColorStop(0.35, 'rgba(120,190,255,0.92)');
        gr3.addColorStop(1, 'rgba(90,140,255,0)');
        ctx.fillStyle = gr3;
        ctx.beginPath(); ctx.arc(rx, ry, rad * 2.3, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(210,240,255,' + (0.4 + k * 0.55) + ')';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.ellipse(rx, ry, rad, rad * 0.36, a.t * 0.4 + (i * Math.PI) / 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#9AC8FF';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        if (a.t > 92) ctx.fillText('RASENGAN', px + 20, py - 90);
      }

      // ---- rasengan in hand and in flight ----
      if (s.rasenT > 0) {
        const k = 1 - s.rasenT / RASEN_CHARGE;
        const rx = s.herHeadX + 30, ry = s.herHeadY + 26;
        const gr2 = ctx.createRadialGradient(rx, ry, 0, rx, ry, 8 + k * 22);
        gr2.addColorStop(0, 'rgba(255,255,255,0.95)');
        gr2.addColorStop(0.4, 'rgba(120,190,255,0.8)');
        gr2.addColorStop(1, 'rgba(90,140,255,0)');
        ctx.fillStyle = gr2;
        ctx.beginPath(); ctx.arc(rx, ry, 8 + k * 22, 0, Math.PI * 2); ctx.fill();
      }
      for (const r of s.rasengans) {
        const rad = 21;
        const gr2 = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, rad * 1.9);
        gr2.addColorStop(0, 'rgba(255,255,255,1)');
        gr2.addColorStop(0.35, 'rgba(120,190,255,0.9)');
        gr2.addColorStop(1, 'rgba(90,140,255,0)');
        ctx.fillStyle = gr2;
        ctx.beginPath(); ctx.arc(r.x, r.y, rad * 1.9, 0, Math.PI * 2); ctx.fill();
        // Spiral shell
        ctx.strokeStyle = 'rgba(200,235,255,0.9)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, rad, rad * 0.38, r.t * 0.35 + (i * Math.PI) / 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // ---- amaterasu burning on him ----
      if (s.amaBurn > 0 && (s.phase === 'boss' || s.phase === 'cutscene')) {
        const bxx = s.bossX, byy = GROUND + s.bossOff;
        const life = Math.min(1, s.amaBurn / 40);
        for (let i = 0; i < 12; i += 1) {
          const a = s.t * 0.11 + i;
          const hgt = (46 + Math.sin(a * 1.6) * 26) * life;
          const fx = bxx - 40 + i * 7;
          const gg = ctx.createLinearGradient(fx, byy, fx, byy - hgt);
          gg.addColorStop(0, 'rgba(16,0,24,' + life + ')');
          gg.addColorStop(0.55, 'rgba(80,10,120,' + life * 0.9 + ')');
          gg.addColorStop(1, 'rgba(170,70,255,0)');
          ctx.fillStyle = gg;
          ctx.fillRect(fx - 4, byy - hgt, 8, hgt);
        }
      }

      // ---- susanoo sequence ----
      if (s.act?.kind === 'sus') {
        const a = s.act;
        // Everything else drains of colour while she works.
        ctx.fillStyle = 'rgba(4,6,10,' + Math.min(0.55, a.t / 60) + ')';
        ctx.fillRect(-W, -H, W * 3, H * 3);

        if (a.t < 92) {
          // Hand signs, one every nine ticks, with a chakra flare on each.
          const step = Math.min(SEALS.length - 1, Math.floor(a.t / 13));
          const into = a.t % 13;
          ctx.fillStyle = 'rgba(154,230,255,' + (into < 6 ? 0.9 : 0.4) + ')';
          ctx.font = '13px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(SEALS[step], px + 10, py - 96);
          const hx = px + 20, hy = py + 40;
          const fl = Math.max(0, 1 - into / 7);
          const gs = ctx.createRadialGradient(hx, hy, 0, hx, hy, 44 * fl + 8);
          gs.addColorStop(0, 'rgba(154,230,255,' + (0.7 * fl) + ')');
          gs.addColorStop(1, 'rgba(154,230,255,0)');
          ctx.fillStyle = gs;
          ctx.beginPath(); ctx.arc(hx, hy, 44 * fl + 8, 0, Math.PI * 2); ctx.fill();
        } else if (a.t < 130) {
          ctx.fillStyle = '#C21127';
          ctx.font = '11px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('...ek aankh ki keemat.', px + 10, py - 96);
        } else {
          // Eruption: expanding rings.
          const k = (a.t - 130) / (ACT_SUS - 130);
          ctx.strokeStyle = 'rgba(154,230,255,' + (1 - k) + ')';
          ctx.lineWidth = 6;
          for (let i = 0; i < 3; i += 1) {
            ctx.beginPath();
            ctx.arc(px, py - 20, k * 260 + i * 48, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // ---- susanoo: assembles rib by rib, then armours ----
      if (s.susT > 0) {
        const age = SUS_DUR - s.susT;
        const fade = Math.min(1, age / 16) * Math.min(1, s.susT / 24);
        const cx3 = px, base = GROUND, hgt = 262;
        // Each stage of the body arrives in sequence rather than all at once.
        const step = (at: number, over = 26) => Math.max(0, Math.min(1, (age - at) / over));
        const ribs = step(0), spine = step(26), arms = step(58), skull = step(90), armour = step(122, 40);

        ctx.save();
        ctx.globalAlpha = 0.62 * fade;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Ribs, curling outward one pair at a time.
        ctx.strokeStyle = '#9AE6FF';
        ctx.lineWidth = 5;
        for (let i = 1; i <= 5; i += 1) {
          const k = Math.max(0, Math.min(1, (ribs * 5) - (i - 1)));
          if (k <= 0) continue;
          const ry2 = base - hgt * 0.15 * i;
          const spread = (54 - i * 3) * k;
          ctx.beginPath();
          ctx.moveTo(cx3 - spread, ry2);
          ctx.quadraticCurveTo(cx3, ry2 - 20 * k, cx3 + spread, ry2);
          ctx.stroke();
        }

        // Spine and flanks.
        if (spine > 0) {
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(cx3 - 62 * spine, base);
          ctx.lineTo(cx3 - 50 * spine, base - hgt * 0.62 * spine);
          ctx.lineTo(cx3, base - hgt * 0.78 * spine);
          ctx.lineTo(cx3 + 50 * spine, base - hgt * 0.62 * spine);
          ctx.lineTo(cx3 + 62 * spine, base);
          ctx.stroke();
        }

        // Arms reaching out.
        if (arms > 0) {
          ctx.lineWidth = 6;
          const ax2 = 100 * arms;
          ctx.beginPath();
          ctx.moveTo(cx3 - 50, base - hgt * 0.6); ctx.lineTo(cx3 - 50 - ax2, base - hgt * (0.6 - 0.3 * arms));
          ctx.moveTo(cx3 + 50, base - hgt * 0.6); ctx.lineTo(cx3 + 50 + ax2, base - hgt * (0.6 - 0.3 * arms));
          ctx.stroke();
        }

        // Skull.
        if (skull > 0) {
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.arc(cx3, base - hgt * 0.9, 28 * skull, 0, Math.PI * 2); ctx.stroke();
          // Eye slits
          ctx.fillStyle = 'rgba(255,255,255,' + skull + ')';
          ctx.fillRect(cx3 - 15, base - hgt * 0.91, 10, 4);
          ctx.fillRect(cx3 + 5, base - hgt * 0.91, 10, 4);
        }

        // Armour: solid plates over the skeleton.
        if (armour > 0) {
          ctx.globalAlpha = 0.42 * fade * armour;
          ctx.fillStyle = '#5FD0F5';
          ctx.strokeStyle = '#D8F6FF';
          ctx.lineWidth = 3;
          // Chest plate
          ctx.beginPath();
          ctx.moveTo(cx3 - 46, base - hgt * 0.42);
          ctx.lineTo(cx3 - 34, base - hgt * 0.70);
          ctx.lineTo(cx3 + 34, base - hgt * 0.70);
          ctx.lineTo(cx3 + 46, base - hgt * 0.42);
          ctx.lineTo(cx3, base - hgt * 0.30);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          // Pauldrons
          for (const sdir of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(cx3 + sdir * 40, base - hgt * 0.70);
            ctx.lineTo(cx3 + sdir * 92, base - hgt * 0.66);
            ctx.lineTo(cx3 + sdir * 80, base - hgt * 0.50);
            ctx.lineTo(cx3 + sdir * 44, base - hgt * 0.54);
            ctx.closePath();
            ctx.fill(); ctx.stroke();
          }
          // Helmet with horns
          ctx.beginPath();
          ctx.moveTo(cx3 - 30, base - hgt * 0.90);
          ctx.lineTo(cx3 - 20, base - hgt * 0.99);
          ctx.lineTo(cx3 + 20, base - hgt * 0.99);
          ctx.lineTo(cx3 + 30, base - hgt * 0.90);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(cx3 - 22, base - hgt * 0.98); ctx.lineTo(cx3 - 44, base - hgt * 1.14);
          ctx.moveTo(cx3 + 22, base - hgt * 0.98); ctx.lineTo(cx3 + 44, base - hgt * 1.14);
          ctx.stroke();
          // Blade in the right hand
          ctx.beginPath();
          ctx.moveTo(cx3 + 150, base - hgt * 0.30);
          ctx.lineTo(cx3 + 168, base - hgt * 0.86);
          ctx.lineTo(cx3 + 182, base - hgt * 0.28);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        }

        ctx.globalAlpha = 1;
        const au2 = ctx.createRadialGradient(cx3, base - hgt * 0.5, 30, cx3, base - hgt * 0.5, 190);
        au2.addColorStop(0, 'rgba(154,230,255,' + 0.17 * fade + ')');
        au2.addColorStop(1, 'rgba(154,230,255,0)');
        ctx.fillStyle = au2;
        ctx.beginPath(); ctx.arc(cx3, base - hgt * 0.5, 190, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // ---- time reversal: he refuses the result ----
      if (s.act?.kind === 'rewind') {
        const a = s.act;
        const bxx = s.bossX, byy = GROUND + s.bossOff;
        ctx.fillStyle = 'rgba(4,4,10,' + Math.min(0.72, a.t / 60) + ')';
        ctx.fillRect(-W, -H, W * 3, H * 3);

        // 1. Charging up. Energy pulled off the floor, debris rising.
        if (a.t < 100) {
          const k = a.t / 100;
          for (let i = 0; i < 30; i += 1) {
            const ax2 = bxx - 150 + ((i * 37 + s.t * 3) % 300);
            const ay2 = GROUND - ((s.t * 4 + i * 41) % 260) * k;
            ctx.fillStyle = 'rgba(255,211,77,' + (0.2 + k * 0.6) + ')';
            ctx.fillRect(ax2, ay2, 3, 11);
          }
          const pil = ctx.createLinearGradient(bxx, GROUND, bxx, GROUND - 340 * k);
          pil.addColorStop(0, 'rgba(255,211,77,' + 0.5 * k + ')');
          pil.addColorStop(1, 'rgba(255,211,77,0)');
          ctx.fillStyle = pil;
          ctx.fillRect(bxx - 60, GROUND - 340 * k, 120, 340 * k);
          ctx.fillStyle = '#FFD34D';
          ctx.font = '13px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          if (a.t > 30) ctx.fillText('YEH NATIJA MANZOOR NAHI.', W / 2, 96);
        }

        // 2. Domain expansion: a sphere swallows the arena.
        if (a.t >= 100 && a.t < 200) {
          const k = (a.t - 100) / 100;
          const r2 = k * 620;
          const dg = ctx.createRadialGradient(bxx, byy - 120, r2 * 0.55, bxx, byy - 120, r2);
          dg.addColorStop(0, 'rgba(20,6,34,0.9)');
          dg.addColorStop(1, 'rgba(90,30,140,0)');
          ctx.fillStyle = dg;
          ctx.beginPath(); ctx.arc(bxx, byy - 120, r2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(186,140,255,' + (1 - k) + ')';
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.arc(bxx, byy - 120, r2, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = '#BA8CFF';
          ctx.font = '15px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('DOMAIN EXPANSION', W / 2, 96);
        }

        // 3. The stone.
        if (a.t >= 190 && a.t < 300) {
          const k = Math.min(1, (a.t - 190) / 30);
          const sx = bxx - 90, sy = byy - 190;
          const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 70 * k);
          sg.addColorStop(0, 'rgba(190,255,210,0.95)');
          sg.addColorStop(0.4, 'rgba(60,220,130,0.7)');
          sg.addColorStop(1, 'rgba(40,200,110,0)');
          ctx.fillStyle = sg;
          ctx.beginPath(); ctx.arc(sx, sy, 70 * k, 0, Math.PI * 2); ctx.fill();
          ctx.save();
          ctx.translate(sx, sy); ctx.rotate(s.t * 0.05);
          ctx.fillStyle = '#7CFFB2';
          ctx.beginPath();
          for (let i = 0; i < 6; i += 1) {
            const a2 = (i / 6) * Math.PI * 2;
            const pt = 20 * k;
            if (i === 0) ctx.moveTo(Math.cos(a2) * pt, Math.sin(a2) * pt);
            else ctx.lineTo(Math.cos(a2) * pt, Math.sin(a2) * pt);
          }
          ctx.closePath(); ctx.fill();
          ctx.restore();
          ctx.fillStyle = '#7CFFB2';
          ctx.font = '12px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('TIME STONE', W / 2, 96);
        }

        // 4. He turns the clock back by hand.
        if (a.t >= 250 && a.t < 340) {
          const k = (a.t - 250) / 90;
          const cx5 = W / 2, cy5 = H / 2 - 20, r3 = 96;
          ctx.strokeStyle = 'rgba(124,255,178,0.9)';
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(cx5, cy5, r3, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 12; i += 1) {
            const a2 = (i / 12) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx5 + Math.cos(a2) * (r3 - 12), cy5 + Math.sin(a2) * (r3 - 12));
            ctx.lineTo(cx5 + Math.cos(a2) * r3, cy5 + Math.sin(a2) * r3);
            ctx.stroke();
          }
          // Hands sweeping anticlockwise.
          const ang = -k * Math.PI * 8;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(cx5, cy5);
          ctx.lineTo(cx5 + Math.cos(ang - Math.PI / 2) * r3 * 0.72, cy5 + Math.sin(ang - Math.PI / 2) * r3 * 0.72);
          ctx.stroke();
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cx5, cy5);
          ctx.lineTo(cx5 + Math.cos(ang * 2.4 - Math.PI / 2) * r3 * 0.9, cy5 + Math.sin(ang * 2.4 - Math.PI / 2) * r3 * 0.9);
          ctx.stroke();
          ctx.fillStyle = '#7CFFB2';
          ctx.font = '13px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('35 SECONDS BACK', W / 2, H - 96);
        }

        if (a.t >= 340) {
          ctx.fillStyle = '#7CFFB2';
          ctx.font = '16px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('AB DOBARA SE.', W / 2, H / 2);
          ctx.font = '9px "Press Start 2P", monospace';
          ctx.fillText('REWINDS LEFT: ' + s.rewinds, W / 2, H / 2 + 30);
        }
      }

      // ---- his counter: the world stops, then chidori ----
      if (s.act?.kind === 'chidori') {
        const a = s.act;
        // Time-stop wash and radial speed lines.
        if (a.t < 150) {
          ctx.fillStyle = 'rgba(6,8,14,' + Math.min(0.6, a.t / 40) + ')';
          ctx.fillRect(-W, -H, W * 3, H * 3);
          ctx.strokeStyle = 'rgba(255,255,255,0.10)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 26; i += 1) {
            const ang = (i / 26) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(W / 2 + Math.cos(ang) * 200, H / 2 + Math.sin(ang) * 200);
            ctx.lineTo(W / 2 + Math.cos(ang) * 700, H / 2 + Math.sin(ang) * 700);
            ctx.stroke();
          }
        }
        if (a.t > 20 && a.t < 60) {
          ctx.fillStyle = '#FFD34D';
          ctx.font = '15px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('SAMAY RUK GAYA.', W / 2, 96);
        }
        // Lightning gathering in his hand.
        if (a.t > 40 && a.t < 170) {
          const hx2 = s.bossX + 46 - (a.t >= 110 ? (a.t - 110) / 60 * (s.bossX - PLAYER_X - 90) : 0);
          const hy3 = GROUND + s.bossOff - bodyH(s.bossStage) * 0.34;
          const pw = Math.min(1, (a.t - 40) / 60);
          const gl2 = ctx.createRadialGradient(hx2, hy3, 0, hx2, hy3, 46 * pw);
          gl2.addColorStop(0, 'rgba(255,255,255,0.95)');
          gl2.addColorStop(0.4, 'rgba(154,230,255,0.8)');
          gl2.addColorStop(1, 'rgba(90,180,255,0)');
          ctx.fillStyle = gl2;
          ctx.beginPath(); ctx.arc(hx2, hy3, 46 * pw, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#DFF6FF';
          ctx.lineWidth = 2;
          for (let i = 0; i < 9; i += 1) {
            const ang = Math.random() * Math.PI * 2;
            const r0 = 10 * pw, r1 = (26 + Math.random() * 22) * pw;
            ctx.beginPath();
            ctx.moveTo(hx2 + Math.cos(ang) * r0, hy3 + Math.sin(ang) * r0);
            ctx.lineTo(hx2 + Math.cos(ang + 0.4) * r1, hy3 + Math.sin(ang + 0.4) * r1);
            ctx.stroke();
          }
          if (a.t > 60 && a.t < 118) {
            ctx.fillStyle = '#9AE6FF';
            ctx.font = '13px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('CHIDORI', s.bossX - 20, hy3 - 90);
          }
        }
      }

      // ---- kamui sequence: out of one spiral, in behind him ----
      if (s.act?.kind === 'kamui') {
        const a = s.act;
        const spiral = (cx4: number, cy4: number, k: number) => {
          ctx.save();
          ctx.strokeStyle = 'rgba(186,140,255,' + k + ')';
          ctx.lineWidth = 4;
          for (let i = 0; i < 9; i += 1) {
            const ang = a.t * 0.34 + (i / 9) * Math.PI * 2;
            ctx.beginPath();
            ctx.arc(cx4, cy4, 16 + i * 9 * k, ang, ang + 1.2);
            ctx.stroke();
          }
          ctx.restore();
        };
        if (a.t < 40) spiral(PLAYER_X, GROUND - 60, 1 - a.t / 40);
        if (a.t > 26 && a.t < 96) spiral(s.bossX + 54, GROUND + s.bossOff - bodyH(s.bossStage) - 20, Math.min(1, (a.t - 26) / 20));
        if (a.t >= 60 && a.t < 100) {
          // Kick arc trailing her leg.
          ctx.strokeStyle = 'rgba(255,255,255,' + (1 - (a.t - 60) / 40) + ')';
          ctx.lineWidth = 7;
          ctx.beginPath();
          ctx.arc(px - 20, py + 40, 74, -1.9, 0.6);
          ctx.stroke();
        }
        if (a.t >= 96 && a.t < 132) {
          ctx.fillStyle = '#BA8CFF';
          ctx.font = '14px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('KONOHA SENPUU!', (px + s.bossX) / 2 - 40, py - 70);
        }
      }

      // ---- kamui: she tears out of the frame ----
      if (s.kamuiT > 0) {
        const k = s.kamuiT / KAMUI_DUR;
        ctx.save();
        ctx.globalAlpha = k;
        ctx.strokeStyle = '#BA8CFF';
        ctx.lineWidth = 3;
        for (let i = 0; i < 7; i += 1) {
          const a = s.t * 0.3 + (i / 7) * Math.PI * 2;
          const r0 = 20 + (1 - k) * 90;
          ctx.beginPath();
          ctx.arc(px, py - 20, r0 + i * 6, a, a + 1.1);
          ctx.stroke();
        }
        ctx.restore();
      }

      for (const p of s.sparks) {
        ctx.globalAlpha = Math.min(1, p.life / 20);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = 'center';
      for (const p of s.pops) {
        ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.fillStyle = p.color;
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(p.text, p.x, p.y);
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      // ---- hidden mist ----
      // A tint was not a jutsu. This is near-total whiteout: layered turbulent
      // banks over a heavy wash, with one small window of clarity around her so
      // it stays playable rather than merely unfair.
      if (s.mist > 0) {
        const m = Math.min(1, (340 - s.mist) / 26) * Math.min(1, s.mist / 34);

        // Base fog.
        ctx.fillStyle = 'rgba(214,224,232,' + 0.8 * m + ')';
        ctx.fillRect(0, 0, W, H);

        // Rolling banks at several depths and speeds.
        for (let i = 0; i < 11; i += 1) {
          const speed = 0.35 + i * 0.28;
          const off = ((s.t * speed + i * 260) % (W + 700)) - 350;
          const yy = ((i * 137) % H) - 40;
          const hgt = 130 + (i % 4) * 70;
          const gm = ctx.createRadialGradient(off + 200, yy + hgt / 2, 20, off + 200, yy + hgt / 2, 300);
          gm.addColorStop(0, 'rgba(244,248,252,' + 0.6 * m + ')');
          gm.addColorStop(1, 'rgba(244,248,252,0)');
          ctx.fillStyle = gm;
          ctx.fillRect(off, yy, 400, hgt);
        }

        // Curling wisps so it moves rather than just sitting there.
        ctx.strokeStyle = 'rgba(255,255,255,' + 0.5 * m + ')';
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        for (let i = 0; i < 7; i += 1) {
          const px2 = ((s.t * (0.9 + i * 0.4) + i * 190) % (W + 460)) - 230;
          const py2 = 40 + ((i * 97) % (H - 90));
          ctx.beginPath();
          ctx.moveTo(px2, py2);
          ctx.quadraticCurveTo(px2 + 110, py2 + Math.sin(s.t * 0.03 + i) * 46, px2 + 230, py2);
          ctx.stroke();
        }

        // The one place she can still see: a small hole around herself.
        const hole = ctx.createRadialGradient(px, py - 30, 26, px, py - 30, 165);
        hole.addColorStop(0, 'rgba(214,224,232,0)');
        hole.addColorStop(1, 'rgba(214,224,232,' + 0.72 * m + ')');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.beginPath(); ctx.arc(px, py - 30, 165, 0, Math.PI * 2);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = hole;
        ctx.beginPath(); ctx.arc(px, py - 30, 165, 0, Math.PI * 2); ctx.fill();

        if (s.mist > 286) {
          ctx.fillStyle = '#20303C';
          ctx.font = '14px "Press Start 2P", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('KIRIGAKURE NO JUTSU', W / 2, 92);
          ctx.font = '9px "Press Start 2P", monospace';
          ctx.fillText('HE CAN STILL SEE YOU.', W / 2, 118);
        }
      }

      // ---- domain switch banner ----
      if (s.domainFade > 0 && s.domain > 0) {
        const k = s.domainFade / 60;
        ctx.fillStyle = 'rgba(255,255,255,' + k * 0.3 + ')';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = DOMAINS[s.domain].line;
        ctx.font = '15px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(DOMAINS[s.domain].name, W / 2, H / 2 - 40);
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText('GRAVITY ' + DOMAINS[s.domain].grav.toFixed(2) + 'x', W / 2, H / 2 - 12);
      }

      if (s.flash > 0) {
        ctx.fillStyle = 'rgba(255,255,255,' + (s.flash / 20) * 0.65 + ')';
        ctx.fillRect(0, 0, W, H);
      }
      // ---- the awakening close-up: her portrait, levelling up ----
      if (cineBeat && cineBeat.on === 'eye') {
        const ecx = W / 2, ecy = H / 2 - 10, er = 138;
        ctx.fillStyle = 'rgba(4,2,8,0.9)';
        ctx.fillRect(0, 0, W, H);

        // A blink carries the change: lids sweep shut over the old eye and
        // open on the new one, so the level-up reads as her actually blinking.
        const since = s.cine - [0, 160, 250, 340, 430, 520][s.eyeStage];
        const BLINK = 22;
        const lid = since < BLINK / 2 ? since / (BLINK / 2)
          : since < BLINK ? 1 - (since - BLINK / 2) / (BLINK / 2)
          : 0;
        const showing = since < BLINK / 2 ? s.prevEye : s.eyeStage;
        const img = eyeImgs.current[showing] ?? avatar.current;
        const pop = Math.max(0, 1 - since / 22);
        const rr = er * (1 + pop * 0.13);

        const halo = ctx.createRadialGradient(ecx, ecy, rr * 0.6, ecx, ecy, rr * 1.9);
        const hue = s.eyeStage >= 5 ? '186,140,255' : '194,17,39';
        halo.addColorStop(0, 'rgba(' + hue + ',' + (0.45 + pop * 0.5) + ')');
        halo.addColorStop(1, 'rgba(' + hue + ',0)');
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(ecx, ecy, rr * 1.9, 0, Math.PI * 2); ctx.fill();

        if (img) drawCircle(img, ecx, ecy, rr, s.eyeStage >= 5 ? '#BA8CFF' : '#C21127', undefined, 6);

        // Eyelids, clipped to the portrait.
        if (lid > 0) {
          ctx.save();
          ctx.beginPath(); ctx.arc(ecx, ecy, rr, 0, Math.PI * 2); ctx.clip();
          ctx.fillStyle = '#080308';
          ctx.fillRect(ecx - rr, ecy - rr, rr * 2, rr * lid);
          ctx.fillRect(ecx - rr, ecy + rr - rr * lid, rr * 2, rr * lid);
          ctx.strokeStyle = 'rgba(186,140,255,0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ecx - rr, ecy - rr + rr * lid); ctx.lineTo(ecx + rr, ecy - rr + rr * lid);
          ctx.moveTo(ecx - rr, ecy + rr - rr * lid); ctx.lineTo(ecx + rr, ecy + rr - rr * lid);
          ctx.stroke();
          ctx.restore();
        }

        // Chakra ring spinning up around the portrait.
        ctx.strokeStyle = 'rgba(' + hue + ',0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 12; i += 1) {
          const a = (i / 12) * Math.PI * 2 + s.cine * 0.04;
          const r0 = rr * 1.18, r1 = rr * (1.3 + (i % 3) * 0.08);
          ctx.beginPath();
          ctx.moveTo(ecx + Math.cos(a) * r0, ecy + Math.sin(a) * r0);
          ctx.lineTo(ecx + Math.cos(a) * r1, ecy + Math.sin(a) * r1);
          ctx.stroke();
        }

        ctx.fillStyle = s.eyeStage >= 5 ? '#BA8CFF' : '#C21127';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(EYE_NAMES[s.eyeStage] ?? '', W / 2, H - 92);
        // Progression pips.
        for (let i = 1; i <= 5; i += 1) {
          ctx.fillStyle = i <= s.eyeStage
            ? (s.eyeStage >= 5 ? '#BA8CFF' : '#C21127')
            : 'rgba(237,233,245,0.18)';
          ctx.fillRect(W / 2 - 46 + (i - 1) * 22, H - 74, 14, 5);
        }
      }

      // ---- cutscene furniture: bars, name plate, typewriter dialogue ----
      if (cineBeat) {
        const barH = 52;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, barH);
        ctx.fillRect(0, H - barH, W, barH);

        if (cineBeat.line) {
          const script = cineScript(s.cineKind);
          const i = script.indexOf(cineBeat);
          const from = i > 0 ? script[i - 1].end : 0;
          const chars = Math.floor((s.cine - from) * 0.55);
          const shown = cineBeat.line.slice(0, chars);
          const him = cineBeat.who === 'him';

          const bx0 = 70, by0 = H - barH - 92, bw = W - 140, bhh = 78;
          ctx.fillStyle = 'rgba(8,8,12,0.92)';
          ctx.fillRect(bx0, by0, bw, bhh);
          ctx.strokeStyle = him ? '#FF4D6D' : '#4DE1C1';
          ctx.lineWidth = 3;
          ctx.strokeRect(bx0, by0, bw, bhh);

          // Name plate
          const name = him ? 'PUSHPENDRA SIR' : 'DIHHITA';
          ctx.fillStyle = him ? '#FF4D6D' : '#4DE1C1';
          ctx.fillRect(bx0 - 3, by0 - 26, name.length * 9 + 24, 26);
          ctx.fillStyle = '#08080C';
          ctx.font = '9px "Press Start 2P", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(name, bx0 + 9, by0 - 8);

          ctx.fillStyle = '#EDE9F5';
          ctx.font = '13px "Press Start 2P", monospace';
          ctx.fillText(shown, bx0 + 22, by0 + 46);
          if (chars >= cineBeat.line.length && Math.floor(s.cine / 18) % 2 === 0) {
            ctx.fillStyle = him ? '#FF4D6D' : '#4DE1C1';
            ctx.fillText('\u25BC', bx0 + bw - 40, by0 + 62);
          }
        }
        ctx.textAlign = 'center';
      }

      if (s.hp <= s.maxHp * 0.3 && !s.over && !s.dying) {
        const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H);
        v.addColorStop(0, 'rgba(255,77,109,0)');
        v.addColorStop(1, `rgba(255,77,109,${0.25 + Math.sin(s.t * 0.09) * 0.1})`);
        ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      }

    };

    const frame = (now: number) => {
      if (!last) last = now;
      acc += Math.min(now - last, MAX_FRAME_MS);
      last = now;

      let steps = 0;
      while (acc >= TICK_MS && steps < MAX_CATCHUP) {
        update();
        acc -= TICK_MS;
        steps += 1;
      }
      if (steps >= MAX_CATCHUP) acc = 0;

      draw();
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);


  return (
    <div className="relative select-none">
      <div className="relative scanlines rounded-xl overflow-hidden border-4 border-neon/40 shadow-[0_0_40px_-8px_rgba(77,225,193,0.5)]">
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            e.preventDefault();
            if (death || cutscene) return;
            if (g.current.over || g.current.phase === 'won') restart();
            else {
              const r = (e.target as HTMLCanvasElement).getBoundingClientRect();
              if (e.clientX - r.left < r.width * 0.55) jump(); else shoot();
            }
          }}
          style={{ aspectRatio: `${W} / ${H}`, touchAction: 'manipulation' }}
          className="block w-full h-auto bg-crt cursor-pointer"
          aria-label="Aunty Run"
        />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-4 pointer-events-none font-pixel text-[9px] md:text-[10px]">
          <div className="space-y-2 w-44">
            {/* Base health, then absorption on top in gold. No numbers —
                the gold segment is the readout. */}
            <div className="flex items-center gap-2">
              <span className="text-neon/60 shrink-0">HP</span>
              <span className="flex items-center gap-[2px] flex-1">
                <span className="h-2.5 bg-crt border border-neon/40 overflow-hidden" style={{ width: '68%' }}>
                  <span
                    className="block h-full transition-all duration-150"
                    style={{
                      width: `${Math.min(100, (hud.hp / START_HP) * 100)}%`,
                      background: hud.hp <= 30 ? '#FF4D6D' : '#4DE1C1',
                    }}
                  />
                </span>
                {hud.maxHp > START_HP && (
                  <span
                    className="h-2.5 bg-crt border border-[#FFC94D]/50 overflow-hidden"
                    style={{ width: `${((hud.maxHp - START_HP) / START_HP) * 68}%` }}
                  >
                    <span
                      className="block h-full bg-[#FFC94D] transition-all duration-150"
                      style={{
                        width: `${Math.max(0, Math.min(1, (hud.hp - START_HP) / (hud.maxHp - START_HP))) * 100}%`,
                      }}
                    />
                  </span>
                )}
              </span>
            </div>
            <p className="text-neon">SCORE {String(hud.score).padStart(5, '0')}</p>
            <p className="text-neon/50">BEST {String(best).padStart(5, '0')}</p>
          </div>
          <div className="space-y-2 text-right w-44">
            <p className="text-hot">{hud.bossHp >= 0 ? `STAGE ${hud.stage}` : `LVL ${hud.level}`}</p>
            <p className="text-neon/50">🍛 {hud.fulkis} {hud.burger && <span className="text-[#FFC94D]">· 🍔</span>}</p>
            {!hud.awake ? (
              <div className="flex items-center gap-2 justify-end">
                <span className={hud.laser >= 100 ? 'text-hot' : 'text-neon/40'}>LASER</span>
                <span className="w-16 h-2 bg-crt border border-hot/40 overflow-hidden">
                  <span className="block h-full bg-hot transition-all duration-150" style={{ width: `${hud.laser}%` }} />
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                {([
                  ['RASEN', hud.rasen, '#9AC8FF'],
                  ['AMA', hud.ama, '#B060FF'],
                  ['SUSA', hud.sus, '#9AE6FF'],
                  ['KAMUI', hud.kamui, '#BA8CFF'],
                ] as const).map(([n, v, c]) => (
                  <div key={n} className="flex items-center gap-2 justify-end">
                    <span style={{ color: v >= 100 ? c : 'rgba(237,233,245,0.3)' }}>{n}</span>
                    <span className="w-14 h-[5px] bg-crt border border-[#BA8CFF]/30 overflow-hidden">
                      <span className="block h-full transition-all duration-150" style={{ width: `${v}%`, background: c }} />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {hud.bossHp >= 0 && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <div className="flex items-center justify-between font-pixel text-[8px] text-hot mb-1.5">
              <span>
                PUSHPENDRA SIR {hud.stage === 2 ? '— CRITICAL' : hud.stage === 3 ? '— ASCENDED' : ''}
                {hud.stage === 3 && hud.rewinds > 0 && (
                  <span className="text-[#7CFFB2]"> · ⟲{hud.rewinds}</span>
                )}
                {hud.domain > 0 && <span className="opacity-60"> · {DOMAINS[hud.domain].name}</span>}
              </span>
              <span>EGO {hud.bossHp}%</span>
            </div>
            <div className={`h-2.5 bg-crt border-2 overflow-hidden ${hud.stage === 2 ? 'border-hot animate-flicker' : 'border-hot/60'}`}>
              <div className="h-full bg-hot transition-all duration-200" style={{ width: `${hud.bossHp}%` }} />
            </div>
          </div>
        )}

        {banner && !death && !cutscene && (
          <div className="absolute inset-x-0 top-1/4 flex justify-center pointer-events-none px-4">
            <p className="font-pixel text-[9px] md:text-xs text-center text-hot bg-crt/90 border-2 border-hot px-4 py-3 leading-relaxed animate-flicker">
              {banner}
            </p>
          </div>
        )}

        {/* ── DEATH SCENE ── */}
        <AnimatePresence>
          {death && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-crt/95 px-6 text-center"
            >
              <motion.p
                initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="font-pixel text-lg md:text-3xl text-hot mb-6"
              >
                DOWN.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="font-pixel text-[9px] md:text-[11px] text-neon/70 leading-relaxed max-w-lg mb-9"
              >
                {death.line}
              </motion.p>

              {death.burger ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1, type: 'spring', bounce: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <motion.span
                    animate={{ scale: [1, 1.14, 1], filter: ['drop-shadow(0 0 12px #FFC94D)', 'drop-shadow(0 0 30px #FFC94D)', 'drop-shadow(0 0 12px #FFC94D)'] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="text-5xl md:text-6xl mb-5"
                    aria-hidden="true"
                  >
                    🍔
                  </motion.span>
                  <p className="font-pixel text-[8px] text-[#FFC94D] mb-6 leading-relaxed max-w-sm">
                    YOU STILL HAVE THE BURGER.
                    <br />
                    STRESS EATING IS FINALLY USEFUL.
                  </p>
                  <button
                    onClick={revive}
                    className="font-pixel text-[10px] md:text-xs text-crt bg-[#FFC94D] px-7 py-4 hover:brightness-110 active:translate-y-[1px] mb-4"
                  >
                    INHALE THE BURGER
                  </button>
                  <button onClick={giveUp} className="font-pixel text-[8px] text-neon/30 hover:text-neon/60 transition-colors">
                    no, let him win
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex flex-col items-center">
                  <p className="font-pixel text-[8px] text-neon/35 mb-6 leading-relaxed max-w-sm">
                    NO BURGER. YOU LEFT IT ON THE GROUND.
                    <br />
                    THERE WAS ONLY ONE.
                  </p>
                  <button onClick={giveUp} className="font-pixel text-[10px] text-crt bg-neon px-6 py-3.5 hover:brightness-110">
                    ACCEPT DEFEAT
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* The scene itself plays on the canvas. This is only the card that
            follows it, so it never covers the acting. */}
        <AnimatePresence>
          {cutscene && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-crt/80 backdrop-blur-[2px] px-6 text-center"
            >
              <motion.p
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.6 }}
                className={`font-pixel text-base md:text-2xl my-6 animate-flicker ${
                  cutscene === 'win' ? 'text-neon'
                    : cutscene === 'awaken' ? 'text-[#BA8CFF]'
                    : 'text-hot'
                }`}
              >
                {cutscene === 'win' ? 'HE IS DONE.'
                  : cutscene === 'stage3' ? 'STAGE 3 — ASCENDED'
                  : cutscene === 'awaken' ? 'RINNEGAN AWAKENED'
                  : 'STAGE 2 — CRITICAL'}
              </motion.p>
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                onClick={
                  cutscene === 'win' ? finishWin
                    : cutscene === 'stage3' ? toStage3
                    : cutscene === 'awaken' ? toAwakened
                    : toStage2
                }
                className={`font-pixel text-[10px] md:text-xs text-crt px-7 py-4 hover:brightness-110 active:translate-y-[1px] ${
                  cutscene === 'win' ? 'bg-neon'
                    : cutscene === 'awaken' ? 'bg-[#BA8CFF]'
                    : 'bg-hot'
                }`}
              >
                {cutscene === 'win' ? 'COLLECT YOUR WIN'
                  : cutscene === 'awaken' ? 'SEE WHAT YOU CAN DO'
                  : 'FACE HIM'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ABILITY TUTORIAL ── */}
        <AnimatePresence>
          {tutorial && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-crt/95 px-5 py-6 text-center overflow-y-auto"
              data-lenis-prevent
            >
              <p className="font-pixel text-[11px] md:text-base text-[#BA8CFF] mb-2 animate-flicker">
                RINNEGAN AWAKENED
              </p>
              <p className="font-pixel text-[8px] text-neon/45 mb-6 leading-relaxed max-w-md">
                THE EYES ARE OPEN. YOU ARE NOT RUNNING FROM HIM ANY MORE.
              </p>

              <div className="grid sm:grid-cols-2 gap-2.5 max-w-2xl w-full mb-7">
                {[
                  { k: 'X', n: 'RASENGAN', d: 'A SPIRALLING SPHERE. HEAVY. SLOW TO FORM.' },
                  { k: 'Z', n: 'AMATERASU', d: 'HIS OWN BLACK FLAME, RETURNED TO HIM.' },
                  { k: 'C', n: 'SUSANOO', d: 'A GIANT OF CHAKRA. IT GUARDS YOU.' },
                  { k: 'V', n: 'KAMUI', d: 'TELEPORT. PHASE OUT OF ANYTHING INCOMING.' },
                  { k: 'HOLD ↑', n: 'FLIGHT', d: 'YOU DO NOT NEED THE GROUND NOW.' },
                  { k: '—', n: 'STICKMAN FORM', d: 'YOU FIGHT STANDING UP FROM HERE.' },
                ].map((a) => (
                  <div key={a.n} className="border-2 border-[#BA8CFF]/40 p-3 text-left">
                    <div className="flex items-baseline gap-3 mb-1.5">
                      <span className="font-pixel text-[9px] text-[#BA8CFF] shrink-0">{a.k}</span>
                      <span className="font-pixel text-[9px] text-neon">{a.n}</span>
                    </div>
                    <p className="font-pixel text-[7px] text-neon/45 leading-relaxed">{a.d}</p>
                  </div>
                ))}
              </div>

              <p className="font-pixel text-[7px] text-neon/30 mb-5 leading-relaxed max-w-md">
                HEALED TO FULL. HE IS STILL ASCENDED. GO.
              </p>
              <button
                onClick={resumeFromTutorial}
                className="font-pixel text-[10px] md:text-xs text-crt bg-[#BA8CFF] px-7 py-4 hover:brightness-110 active:translate-y-[1px]"
              >
                ABHI MERI BAARI
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {(!started || over || won) && !death && !cutscene && !tutorial && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-crt/88 backdrop-blur-[2px] px-6 text-center">
            {won ? (
              <>
                <p className="font-pixel text-xs md:text-base text-neon mb-4 leading-relaxed">{won}</p>
                <p className="font-pixel text-[8px] text-neon/60 mb-6 leading-relaxed max-w-md">
                  BOTH STAGES CLEARED<br />400 PAGES: NEUTRALISED<br />HIS EGO: 0%
                </p>
                <button onClick={restart} className="font-pixel text-[9px] md:text-[10px] text-crt bg-neon px-5 py-3 hover:brightness-110">RUN IT BACK</button>
              </>
            ) : over ? (
              <>
                <p className="font-pixel text-[10px] md:text-xs text-hot mb-5 leading-relaxed max-w-md">{over}</p>
                <p className="font-pixel text-[9px] text-neon/60 mb-6">SCORE {hud.score} &nbsp;·&nbsp; 🍛 {hud.fulkis}</p>
                <button onClick={restart} className="font-pixel text-[9px] md:text-[10px] text-crt bg-neon px-5 py-3 hover:brightness-110">TRY AGAIN</button>
              </>
            ) : (
              <>
                <p className="font-pixel text-xs md:text-base text-neon mb-5">AUNTY RUN</p>
                <p className="font-pixel text-[8px] md:text-[9px] text-neon/55 leading-relaxed max-w-sm mb-6">
                  🍛 HEALS + RAISES MAX HP
                  <br />
                  🍔 ONE ONLY. IT IS AN EXTRA LIFE.
                  <br /><br />
                  Z = EYE LASER &nbsp; X = FIRE
                  <br /><br />
                  HE HAS TWO STAGES.
                </p>
                <button onClick={jump} className="font-pixel text-[9px] md:text-[10px] text-crt bg-neon px-5 py-3 hover:brightness-110">PRESS SPACE / TAP</button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 md:gap-3 mt-4">
        <button onPointerDown={(e) => { e.preventDefault(); if (death || cutscene) return; if (g.current.over || g.current.phase === 'won') restart(); else jump(); }}
          className="flex-1 font-pixel text-[9px] text-neon border-2 border-neon/40 py-4 active:bg-neon active:text-crt transition-colors">JUMP</button>
        <button onPointerDown={(e) => { e.preventDefault(); if (busy()) return; hud.awake ? rasengan() : shoot(); }}
          disabled={hud.awake && hud.rasen < 100}
          className="flex-1 font-pixel text-[9px] text-neon border-2 border-neon/40 py-4 active:bg-neon active:text-crt transition-colors disabled:opacity-30">
          {hud.awake ? 'RASENGAN' : 'FIRE ⚗'}
        </button>
        <button onPointerDown={(e) => { e.preventDefault(); if (!busy()) laser(); }}
          disabled={hud.awake ? hud.ama < 100 : hud.laser < 100}
          className="flex-1 font-pixel text-[9px] text-hot border-2 border-hot/50 py-4 active:bg-hot active:text-crt transition-colors disabled:opacity-30 disabled:border-hot/20">
          {hud.awake ? 'AMATERASU' : 'LASER 👁'}
        </button>
      </div>

      {/* Her awakened kit only appears once she has it. */}
      {hud.awake && (
        <div className="flex gap-2 md:gap-3 mt-2">
          <button onPointerDown={(e) => { e.preventDefault(); if (!busy()) susanoo(); }}
            disabled={hud.sus < 100}
            className="flex-1 font-pixel text-[9px] text-[#9AE6FF] border-2 border-[#9AE6FF]/40 py-4 active:bg-[#9AE6FF] active:text-crt transition-colors disabled:opacity-30">
            {hud.susOn ? 'SUSANOO ON' : 'SUSANOO'}
          </button>
          <button onPointerDown={(e) => { e.preventDefault(); if (!busy()) kamui(); }}
            disabled={hud.kamui < 100}
            className="flex-1 font-pixel text-[9px] text-[#BA8CFF] border-2 border-[#BA8CFF]/40 py-4 active:bg-[#BA8CFF] active:text-crt transition-colors disabled:opacity-30">
            KAMUI
          </button>
          <button
            onPointerDown={(e) => { e.preventDefault(); g.current.flyHeld = true; }}
            onPointerUp={() => { g.current.flyHeld = false; }}
            onPointerLeave={() => { g.current.flyHeld = false; }}
            className="flex-1 font-pixel text-[9px] text-neon border-2 border-neon/40 py-4 active:bg-neon active:text-crt transition-colors">
            FLY ↑
          </button>
        </div>
      )}

      <p className="font-pixel text-[8px] text-neon/35 mt-4 text-center leading-relaxed">
        {hud.awake
          ? 'X = RASENGAN · Z = AMATERASU · C = SUSANOO · V = KAMUI · HOLD W = FLY'
          : 'SPACE = JUMP (TWICE = DOUBLE) · X = FIRE · Z = LASER'}
        <br />
        THE LECTURE ONLY HURTS ON THE GROUND. THE STICK ONLY HURTS ON THE GROUND.
      </p>
    </div>
  );
}
