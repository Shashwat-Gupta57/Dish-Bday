import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * AUNTY RUN — canvas side-scroller with a boss fight.
 *
 * Fifteen seconds of running, then the chemistry teacher turns up (late) and it
 * becomes a shooter. She fires the periodic table at him; he fires four hundred
 * pages of notes back.
 *
 * All mutable game state lives in refs so the animation loop never restarts and
 * React never re-renders per frame. Only what a human reads — HP, score, banner
 * text — is lifted into state, and that changes a few times a second at most.
 */

const AVATAR = '/photo-16.jpg';
const BOSS_IMG = '/photo-pushpi.jpg';

const W = 900;
const H = 420;
const GROUND = 336;

const GRAVITY = 0.86;
const JUMP_V = -14.5;
const BASE_SPEED = 5.4;
const PLAYER_X = 110;
const PLAYER_R = 27;

const MAX_HP = 100;
const IFRAMES = 72;

const BOSS_AT = 15 * 60;
const BOSS_LATE = 4 * 60;
const BOSS_HP = 100;

/** The lecture: long telegraph, long beam, but the air is always safe. */
const LECTURE_TELEGRAPH = 84;
const LECTURE_BEAM = 78;
const BEAM_HEIGHT = 62;

/** Eye laser. Charge, fire, then a long cooldown so it stays a moment. */
const LASER_CHARGE = 72;
const LASER_FIRE = 60;
const LASER_COOLDOWN = 330;
const LASER_DMG = 15;

/**
 * Eye positions, measured off photo-16.jpg (462×462) as fractions of the frame.
 * She is mid head-tilt, so the pair sits left of centre and about a third of the
 * way down rather than dead centre.
 */
const EYES = [
  { nx: 0.353, ny: 0.364 },
  { nx: 0.535, ny: 0.379 },
];
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
  'Bas paanch minute aur khelti toh jeet jaati.',
  'Gir gayi. Jaise har baar.',
  'Skill issue, Aunty. Say it with me.',
];
const SLEEP_LINES = [
  'You fell asleep. Mid-fight. Iconic.',
  'Neend aa gayi. Obviously. Predictably.',
];
const BOSS_KILL_LINES = [
  'He gave you 400 more pages. You are buried.',
  'Fir kat gaya? He will mention this in class.',
  'He held a 6-hour lecture on your performance.',
];
const LEVEL_LINES = [
  'DIHHITA LEVELED UP!',
  'SLAYYY AUNTY! 👑',
  'AUNTY IS COOKING 🔥',
  'SPEED UP — KEEP UP, DIHHITA',
];
const HURT_LINES = ['OW', 'ARE?', 'HAWW', 'BRO', 'RUDE', 'ABE'];
const TAUNTS = [
  'SCHOOL FUNCTION THA? PADHAI KAUN KAREGA?',
  'FEVER THA TOH TEST KYUN DIYA? MARKS TOH DEKHO.',
  'MERA TEST SCHOOL EXAM SE ZYADA IMPORTANT HAI.',
  '400 PAGES KE NOTES. KAL TAK. YAAD.',
  'MAIN 6 GHANTE PADHA SAKTA HOON.',
  'EXTRA-CURRICULAR ACTIVITIES! WAAH!',
  'LATE? MAIN TEACHER HOON. TUM STUDENT HO.',
  'EXAM HAI TOH KYA? CLASS TOH LAGEGI.',
  'SCHOOL MEIN KYA KARTI HO? BATAO.',
];
const WIN_LINES = [
  'PUSHPENDRA SIR HAS LEFT THE CHAT',
  'DIHHITA CLEARED THE SYLLABUS 🎓',
  'SLAYYY AUNTY! HE IS SPEECHLESS',
];

type Kind = 'book' | 'stack' | 'zzz' | 'fulki';
type Phase = 'run' | 'incoming' | 'boss' | 'won';

interface Entity { kind: Kind; x: number; y: number; w: number; h: number; dead?: boolean }
interface Bullet { x: number; y: number; sym: string }
interface Shot { x: number; y: number; vx: number; kind: 'notes' | 'test' | 'question'; t: number }
interface Pop { x: number; y: number; life: number; text: string; color: string }
interface Spark { x: number; y: number; vx: number; vy: number; life: number }

interface Game {
  running: boolean; over: boolean; phase: Phase;
  y: number; vy: number; jumps: number; hp: number;
  iframes: number; hurt: number; push: number;
  speed: number; score: number; level: number; fulkis: number; dist: number; t: number;
  spawnIn: number; entities: Entity[]; pops: Pop[]; sparks: Spark[];
  shake: number; flash: number; hitstop: number;
  bullets: Bullet[]; cool: number;
  laserT: number; laserPhase: 'idle' | 'charge' | 'fire'; laserCd: number; laserHit: boolean;
  bossHp: number; bossX: number; bossY: number; bossBob: number; bossFlash: number;
  atkT: number; beam: number; telegraph: number; beamTick: number;
  shots: Shot[]; taunt: string | null; tauntT: number;
}

function fresh(): Game {
  return {
    running: false, over: false, phase: 'run',
    y: GROUND, vy: 0, jumps: 0, hp: MAX_HP,
    iframes: 0, hurt: 0, push: 0,
    speed: BASE_SPEED, score: 0, level: 1, fulkis: 0, dist: 0, t: 0,
    spawnIn: 70, entities: [], pops: [], sparks: [],
    shake: 0, flash: 0, hitstop: 0,
    bullets: [], cool: 0,
    laserT: 0, laserPhase: 'idle', laserCd: 0, laserHit: false,
    bossHp: BOSS_HP, bossX: W + 160, bossY: GROUND - 96, bossBob: 0, bossFlash: 0,
    atkT: 90, beam: 0, telegraph: 0, beamTick: 0,
    shots: [], taunt: null, tauntT: 0,
  };
}

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export default function RunnerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const g = useRef<Game>(fresh());
  const avatar = useRef<HTMLImageElement | null>(null);
  const bossImg = useRef<HTMLImageElement | null>(null);

  const [hud, setHud] = useState({ score: 0, level: 1, fulkis: 0, hp: MAX_HP, bossHp: -1, laser: 0 });
  const [over, setOver] = useState<string | null>(null);
  const [won, setWon] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => {
    try { setBest(Number(localStorage.getItem('aunty-run-best') ?? 0)); } catch { /* blocked */ }
    const a = new Image(); a.src = AVATAR; a.onload = () => (avatar.current = a);
    const b = new Image(); b.src = BOSS_IMG; b.onload = () => (bossImg.current = b);
  }, []);

  const jump = useCallback(() => {
    const s = g.current;
    if (s.over || s.phase === 'won') return;
    if (!s.running) { s.running = true; setStarted(true); }
    if (s.jumps < 2) { s.vy = JUMP_V; s.jumps += 1; }
  }, []);

  const shoot = useCallback(() => {
    const s = g.current;
    if (s.over || !s.running || s.phase === 'won' || s.cool > 0) return;
    s.cool = 11;
    s.bullets.push({ x: PLAYER_X + PLAYER_R, y: s.y - PLAYER_R, sym: pick(ELEMENTS) });
  }, []);

  const laser = useCallback(() => {
    const s = g.current;
    if (s.over || !s.running || s.phase === 'won') return;
    if (s.laserPhase !== 'idle' || s.laserCd > 0) return;
    s.laserPhase = 'charge';
    s.laserT = LASER_CHARGE;
    s.laserHit = false;
  }, []);

  const restart = useCallback(() => {
    g.current = fresh();
    setOver(null); setWon(null); setBanner(null); setStarted(false);
    setHud({ score: 0, level: 1, fulkis: 0, hp: MAX_HP, bossHp: -1, laser: 0 });
  }, []);

  const saveBest = (score: number) => {
    setBest((b) => {
      const next = Math.max(b, Math.floor(score));
      try { localStorage.setItem('aunty-run-best', String(next)); } catch { /* ignore */ }
      return next;
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (g.current.over || g.current.phase === 'won') restart(); else jump();
      }
      if (e.code === 'KeyX' || e.code === 'ArrowRight') { e.preventDefault(); shoot(); }
      if (e.code === 'KeyZ' || e.code === 'KeyC' || e.code === 'ShiftLeft') { e.preventDefault(); laser(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump, shoot, laser, restart]);

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

    const drawCircle = (img: HTMLImageElement, cx: number, cy: number, r: number, ring: string) => {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.closePath();
      ctx.save(); ctx.clip();
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      ctx.lineWidth = 3; ctx.strokeStyle = ring; ctx.stroke();
      ctx.restore();
    };

    const die = (line: string) => {
      const s = g.current;
      s.over = true; s.running = false; s.shake = 18; s.flash = 10;
      setOver(line); saveBest(s.score);
    };

    /** One place for every source of damage, so i-frames can never be skipped. */
    const damage = (amount: number, sleepy = false) => {
      const s = g.current;
      if (s.iframes > 0 || s.over) return;
      s.hp -= amount;
      s.iframes = IFRAMES;
      s.hurt = 30;
      s.push = -32;
      s.shake = 13;
      s.flash = 7;
      s.pops.push({ x: PLAYER_X, y: s.y - PLAYER_R - 34, life: 40, text: `-${amount}`, color: '#FF4D6D' });
      s.pops.push({ x: PLAYER_X + 44, y: s.y - PLAYER_R - 10, life: 34, text: pick(HURT_LINES), color: '#FFD166' });
      for (let i = 0; i < 10; i += 1) {
        s.sparks.push({
          x: PLAYER_X, y: s.y - PLAYER_R,
          vx: -Math.random() * 5 - 1, vy: (Math.random() - 0.5) * 7, life: 22,
        });
      }
      if (s.hp <= 0) { s.hp = 0; die(sleepy ? pick(SLEEP_LINES) : pick(s.phase === 'boss' ? BOSS_KILL_LINES : DEATH_LINES)); }
    };

    const spawn = () => {
      const s = g.current;
      const r = Math.random();
      if (r < 0.18) s.entities.push({ kind: 'fulki', x: W + 40, y: GROUND - 70 - Math.random() * 60, w: 26, h: 26 });
      else if (r < 0.33 && s.level >= 2) s.entities.push({ kind: 'zzz', x: W + 40, y: GROUND - 96, w: 40, h: 34 });
      else if (r < 0.66) s.entities.push({ kind: 'book', x: W + 40, y: GROUND - 34, w: 32, h: 34 });
      else s.entities.push({ kind: 'stack', x: W + 40, y: GROUND - 62, w: 36, h: 62 });
    };

    const step = () => {
      const s = g.current;

      // Impact frames: the whole world stops for a few ticks on a big hit.
      if (s.hitstop > 0) { s.hitstop -= 1; raf = requestAnimationFrame(step); return; }

      if (s.running && !s.over && s.phase !== 'won') {
        s.t += 1;
        const slow = s.hurt > 0 ? 0.45 : 1; // knocked about, briefly sluggish
        s.dist += s.speed * slow;
        s.score = s.dist / 12 + s.fulkis * 5;

        if (s.cool > 0) s.cool -= 1;
        if (s.iframes > 0) s.iframes -= 1;
        if (s.hurt > 0) s.hurt -= 1;
        if (s.flash > 0) s.flash -= 1;
        if (s.laserCd > 0) s.laserCd -= 1;
        s.push += (0 - s.push) * 0.12;

        for (const b of s.bullets) b.x += 16;

        // ---- laser -------------------------------------------------------
        if (s.laserPhase === 'charge') {
          s.laserT -= 1;
          if (s.laserT <= 0) { s.laserPhase = 'fire'; s.laserT = LASER_FIRE; }
        } else if (s.laserPhase === 'fire') {
          s.laserT -= 1;
          if (s.phase === 'boss' && !s.laserHit && Math.abs(s.y - PLAYER_R - s.bossY) < 74) {
            s.laserHit = true;
            s.bossHp -= LASER_DMG;
            s.bossFlash = 14;
            s.hitstop = 7;
            s.shake = 26;
            s.flash = 12;
            s.pops.push({ x: s.bossX - 20, y: s.bossY - 52, life: 50, text: `-${LASER_DMG}`, color: '#FF4D6D' });
            for (let i = 0; i < 26; i += 1) {
              s.sparks.push({
                x: s.bossX - 40, y: s.bossY,
                vx: (Math.random() - 0.2) * 9, vy: (Math.random() - 0.5) * 11, life: 30,
              });
            }
            if (s.bossHp <= 0) {
              s.phase = 'won'; s.running = false; s.shots = []; s.beam = 0;
              setWon(pick(WIN_LINES)); saveBest(s.score + 500);
            }
          }
          if (s.laserT <= 0) { s.laserPhase = 'idle'; s.laserCd = LASER_COOLDOWN; }
        }

        // ---- phases ------------------------------------------------------
        if (s.phase === 'run' && s.t > BOSS_AT) {
          s.phase = 'incoming'; say('⚠  PUSHPENDRA SIR IS COMING  ⚠', 2200);
        }
        if (s.phase === 'incoming' && s.t > BOSS_AT + BOSS_LATE) {
          s.phase = 'boss'; s.entities = [];
          say('“SORRY, TRAFFIC THA.”  (he is always late)', 2400);
          s.taunt = 'MAIN BEST CHEMISTRY TEACHER HOON.'; s.tauntT = 150;
        }

        s.vy += GRAVITY; s.y += s.vy;
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
          if (s.spawnIn <= 0 && s.phase === 'run') {
            spawn(); s.spawnIn = 56 + Math.random() * 46 - Math.min(s.level * 3, 22);
          }
          for (const e of s.entities) e.x -= s.speed * slow;
          s.entities = s.entities.filter((e) => e.x > -80 && !e.dead);

          const pad = 7;
          for (const e of s.entities) {
            const cx = Math.max(e.x + pad, Math.min(PLAYER_X, e.x + e.w - pad));
            const cy = Math.max(e.y + pad, Math.min(s.y - PLAYER_R, e.y + e.h - pad));
            const dx = PLAYER_X - cx, dy = s.y - PLAYER_R - cy;
            if (dx * dx + dy * dy < (PLAYER_R - 5) ** 2) {
              if (e.kind === 'fulki') {
                e.dead = true; s.fulkis += 1;
                // Fulki heals. Obviously fulki heals.
                s.hp = Math.min(MAX_HP, s.hp + 6);
                s.pops.push({ x: e.x, y: e.y, life: 46, text: '+5  +6HP', color: '#4DE1C1' });
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
          const targetX = W - 150;
          if (s.bossX > targetX) s.bossX -= 5;
          s.bossBob += 0.05;
          s.bossY = GROUND - 96 + Math.sin(s.bossBob) * 12;
          if (s.bossFlash > 0) s.bossFlash -= 1;
          if (s.tauntT > 0) s.tauntT -= 1; else s.taunt = null;

          s.atkT -= 1;
          if (s.atkT <= 0 && s.bossX <= targetX + 4 && s.beam === 0 && s.telegraph === 0) {
            const roll = Math.random();
            if (roll < 0.32) {
              for (let i = 0; i < 3; i += 1) {
                s.shots.push({ x: s.bossX - 40, y: s.bossY + i * 26 - 20, vx: -6.2, kind: 'notes', t: 0 });
              }
            } else if (roll < 0.56) {
              s.shots.push({ x: s.bossX - 40, y: GROUND - 24, vx: -9.5, kind: 'test', t: 0 });
            } else if (roll < 0.8) {
              s.shots.push({ x: s.bossX - 40, y: s.bossY, vx: -4.2, kind: 'question', t: 0 });
            } else {
              s.telegraph = LECTURE_TELEGRAPH;
            }
            s.taunt = pick(TAUNTS); s.tauntT = 150;
            s.atkT = 84 + Math.random() * 50;
          }

          if (s.telegraph > 0) {
            s.telegraph -= 1;
            if (s.telegraph === 0) { s.beam = LECTURE_BEAM; s.beamTick = 0; }
          }
          if (s.beam > 0) {
            s.beam -= 1;
            s.beamTick += 1;
            // Survivable. Standing in it chips you; the air is always safe, and a
            // well-timed double jump clears the whole beam.
            if (!airborne && s.beamTick % 13 === 0) damage(7);
          }

          for (const sh of s.shots) {
            sh.t += 1; sh.x += sh.vx;
            if (sh.kind === 'question') sh.y += Math.sin(sh.t * 0.09) * 2.6;
          }
          s.shots = s.shots.filter((sh) => sh.x > -60);

          for (const sh of s.shots) {
            const dx = PLAYER_X - sh.x, dy = s.y - PLAYER_R - sh.y;
            if (dx * dx + dy * dy < (PLAYER_R + 9) ** 2 && s.iframes === 0) {
              sh.x = -999;
              damage(sh.kind === 'test' ? 18 : sh.kind === 'notes' ? 12 : 14);
            }
          }
          s.shots = s.shots.filter((sh) => sh.x > -60);

          for (const b of s.bullets) {
            const dx = b.x - s.bossX, dy = b.y - s.bossY;
            if (dx * dx + dy * dy < 52 * 52) {
              b.x = W + 999;
              s.bossHp -= 3.2; s.bossFlash = 6;
              s.pops.push({ x: s.bossX - 30, y: s.bossY - 40, life: 34, text: '-3', color: '#FF4D6D' });
              if (s.bossHp <= 0) {
                s.phase = 'won'; s.running = false; s.shots = []; s.beam = 0;
                setWon(pick(WIN_LINES)); saveBest(s.score + 500);
              }
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
            hp: Math.max(0, Math.round(s.hp)),
            bossHp: s.phase === 'boss' ? Math.max(0, Math.round((s.bossHp / BOSS_HP) * 100)) : -1,
            laser: s.laserCd > 0 ? Math.round(100 - (s.laserCd / LASER_COOLDOWN) * 100) : 100,
          });
        }
      }

      if (s.shake > 0) s.shake -= 1;

      // ================= draw =================
      ctx.save();
      if (s.shake > 0) ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);

      ctx.fillStyle = s.phase === 'boss' ? '#140B10' : '#0B0E14';
      ctx.fillRect(-30, -30, W + 60, H + 60);

      ctx.fillStyle = s.phase === 'boss' ? 'rgba(255,77,109,0.06)' : 'rgba(77,225,193,0.07)';
      for (let i = 0; i < 5; i += 1) {
        const x = ((i * 260 - s.dist * 0.18) % (W + 320)) - 160;
        ctx.beginPath(); ctx.arc(x, GROUND + 40, 120, Math.PI, 0); ctx.fill();
      }

      const lineC = s.phase === 'boss' ? '#FF4D6D' : '#4DE1C1';
      ctx.strokeStyle = lineC; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
      ctx.fillStyle = s.phase === 'boss' ? 'rgba(255,77,109,0.3)' : 'rgba(77,225,193,0.35)';
      for (let i = 0; i < 30; i += 1) {
        const x = ((i * 44 - s.dist * 0.9) % (W + 80)) - 40;
        ctx.fillRect(x, GROUND + 10, 18, 2);
      }

      ctx.textAlign = 'center';
      for (const e of s.entities) {
        if (e.kind === 'fulki') { ctx.font = '24px serif'; ctx.fillText('🍛', e.x + e.w / 2, e.y + e.h); }
        else if (e.kind === 'zzz') {
          ctx.fillStyle = 'rgba(169,155,232,0.9)';
          ctx.font = 'bold 26px "Press Start 2P", monospace';
          ctx.fillText('z', e.x + e.w / 2, e.y + e.h);
        } else { ctx.font = e.kind === 'stack' ? '46px serif' : '30px serif'; ctx.fillText('📚', e.x + e.w / 2, e.y + e.h); }
      }

      // Lecture telegraph — flashes, counts down, and tells you what to do.
      if (s.telegraph > 0) {
        const on = Math.floor(s.telegraph / 6) % 2 === 0;
        ctx.fillStyle = on ? 'rgba(255,77,109,0.22)' : 'rgba(255,77,109,0.08)';
        ctx.fillRect(0, GROUND - BEAM_HEIGHT, W, BEAM_HEIGHT);
        ctx.fillStyle = '#FF4D6D';
        ctx.font = '13px "Press Start 2P", monospace';
        ctx.fillText(`6-HOUR LECTURE IN ${Math.ceil(s.telegraph / 28)}`, W / 2, GROUND - 84);
        ctx.fillStyle = '#4DE1C1';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText('JUMP — THE AIR IS SAFE', W / 2, GROUND - 62);
      }
      if (s.beam > 0) {
        const grd = ctx.createLinearGradient(0, GROUND - BEAM_HEIGHT, 0, GROUND);
        grd.addColorStop(0, 'rgba(255,77,109,0.25)');
        grd.addColorStop(1, 'rgba(255,77,109,0.7)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, GROUND - BEAM_HEIGHT, W, BEAM_HEIGHT);
        ctx.fillStyle = '#fff';
        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillText('6-HOUR LECTURE', W / 2, GROUND - 26);
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

      if (s.phase === 'boss' || s.phase === 'won') {
        if (bossImg.current) {
          if (s.bossFlash > 0) ctx.globalAlpha = 0.5;
          drawCircle(bossImg.current, s.bossX, s.bossY, 46, s.bossFlash > 0 ? '#fff' : '#FF4D6D');
          ctx.globalAlpha = 1;
        }
        if (s.taunt) {
          const tw = Math.min(360, s.taunt.length * 6.4 + 20);
          ctx.fillStyle = 'rgba(11,14,20,0.9)';
          ctx.strokeStyle = '#FF4D6D'; ctx.lineWidth = 2;
          ctx.fillRect(s.bossX - tw - 60, s.bossY - 92, tw, 34);
          ctx.strokeRect(s.bossX - tw - 60, s.bossY - 92, tw, 34);
          ctx.fillStyle = '#FF4D6D';
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText(s.taunt, s.bossX - tw / 2 - 60, s.bossY - 71);
        }
      }

      // ---- player, with hurt state ----
      const px = PLAYER_X + s.push;
      const py = s.y - PLAYER_R;
      const squash = Math.max(0.82, Math.min(1.18, 1 - s.vy * 0.012));
      // Blink while invulnerable so being hit is unmistakable.
      const blink = s.iframes > 0 && Math.floor(s.iframes / 4) % 2 === 0;

      ctx.save();
      ctx.translate(px, py);
      if (s.hurt > 0) ctx.rotate((s.hurt / 30) * 0.28 * Math.sin(s.hurt));
      ctx.scale(1 / squash, squash);
      ctx.globalAlpha = blink ? 0.35 : 1;
      if (avatar.current) {
        drawCircle(avatar.current, 0, 0, PLAYER_R, s.over ? '#FF4D6D' : s.hurt > 0 ? '#FF4D6D' : '#4DE1C1');
        if (s.hurt > 0) {
          ctx.fillStyle = `rgba(255,77,109,${(s.hurt / 30) * 0.5})`;
          ctx.beginPath(); ctx.arc(0, 0, PLAYER_R, 0, Math.PI * 2); ctx.fill();
        }
      } else { ctx.fillStyle = '#FF4D6D'; ctx.fillRect(-PLAYER_R, -PLAYER_R, PLAYER_R * 2, PLAYER_R * 2); }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ---- eye laser ----
      if (s.laserPhase !== 'idle') {
        for (const e of EYES) {
          const o = eyeOffset(e);
          const ex = px + o.x, ey = py + o.y;

          if (s.laserPhase === 'charge') {
            // Fades in from fully transparent to fully opaque over the charge.
            const p = 1 - s.laserT / LASER_CHARGE;
            const r = 3 + p * 5;
            const glow = ctx.createRadialGradient(ex, ey, 0, ex, ey, r * 3.4);
            glow.addColorStop(0, `rgba(255,60,90,${p})`);
            glow.addColorStop(0.45, `rgba(255,60,90,${p * 0.45})`);
            glow.addColorStop(1, 'rgba(255,60,90,0)');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.arc(ex, ey, r * 3.4, 0, Math.PI * 2); ctx.fill();

            ctx.strokeStyle = `rgba(255,90,110,${p})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(ex, ey, r, 0, Math.PI * 2); ctx.stroke();
            // A reticle ring that closes in as she charges.
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

      for (const p of s.sparks) {
        ctx.globalAlpha = Math.min(1, p.life / 20);
        ctx.fillStyle = '#FF4D6D';
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1;
      }

      for (const p of s.pops) {
        ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.fillStyle = p.color;
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillText(p.text, p.x, p.y);
        ctx.globalAlpha = 1;
      }

      ctx.restore();

      // Impact / damage flash sits above the shake so it never jitters.
      if (s.flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${(s.flash / 12) * 0.55})`;
        ctx.fillRect(0, 0, W, H);
      }
      // Low-HP vignette.
      if (s.hp <= 30 && !s.over) {
        const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H);
        v.addColorStop(0, 'rgba(255,77,109,0)');
        v.addColorStop(1, `rgba(255,77,109,${0.25 + Math.sin(s.t * 0.09) * 0.1})`);
        ctx.fillStyle = v;
        ctx.fillRect(0, 0, W, H);
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const hpPct = (hud.hp / MAX_HP) * 100;

  return (
    <div className="relative select-none">
      <div className="relative scanlines rounded-xl overflow-hidden border-4 border-neon/40 shadow-[0_0_40px_-8px_rgba(77,225,193,0.5)]">
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            e.preventDefault();
            if (g.current.over || g.current.phase === 'won') restart();
            else {
              const r = (e.target as HTMLCanvasElement).getBoundingClientRect();
              if (e.clientX - r.left < r.width * 0.55) jump(); else shoot();
            }
          }}
          style={{ aspectRatio: `${W} / ${H}`, touchAction: 'manipulation' }}
          className="block w-full h-auto bg-crt cursor-pointer"
          aria-label="Aunty Run — space to jump, X to fire, Z for the laser"
        />

        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-4 pointer-events-none font-pixel text-[9px] md:text-[10px]">
          <div className="space-y-2 w-40">
            {/* Player HP */}
            <div className="flex items-center gap-2">
              <span className="text-neon/60 shrink-0">HP</span>
              <span className="flex-1 h-2 bg-crt border border-neon/40 overflow-hidden">
                <span
                  className="block h-full transition-all duration-150"
                  style={{ width: `${hpPct}%`, background: hpPct <= 30 ? '#FF4D6D' : '#4DE1C1' }}
                />
              </span>
            </div>
            <p className="text-neon">SCORE {String(hud.score).padStart(5, '0')}</p>
            <p className="text-neon/50">BEST {String(best).padStart(5, '0')}</p>
          </div>
          <div className="space-y-2 text-right w-40">
            <p className="text-hot">LVL {hud.level}</p>
            <p className="text-neon/50">🍛 {hud.fulkis}</p>
            {/* Laser charge */}
            <div className="flex items-center gap-2 justify-end">
              <span className={hud.laser >= 100 ? 'text-hot' : 'text-neon/40'}>LASER</span>
              <span className="w-16 h-2 bg-crt border border-hot/40 overflow-hidden">
                <span className="block h-full bg-hot transition-all duration-150" style={{ width: `${hud.laser}%` }} />
              </span>
            </div>
          </div>
        </div>

        {hud.bossHp >= 0 && (
          <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
            <div className="flex items-center justify-between font-pixel text-[8px] text-hot mb-1.5">
              <span>PUSHPENDRA SIR</span>
              <span>EGO {hud.bossHp}%</span>
            </div>
            <div className="h-2.5 bg-crt border-2 border-hot/60 overflow-hidden">
              <div className="h-full bg-hot transition-all duration-200" style={{ width: `${hud.bossHp}%` }} />
            </div>
          </div>
        )}

        {banner && (
          <div className="absolute inset-x-0 top-1/4 flex justify-center pointer-events-none px-4">
            <p className="font-pixel text-[9px] md:text-xs text-center text-hot bg-crt/90 border-2 border-hot px-4 py-3 leading-relaxed animate-flicker">
              {banner}
            </p>
          </div>
        )}

        {(!started || over || won) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-crt/88 backdrop-blur-[2px] px-6 text-center">
            {won ? (
              <>
                <p className="font-pixel text-xs md:text-base text-neon mb-4 leading-relaxed">{won}</p>
                <p className="font-pixel text-[8px] text-neon/60 mb-6 leading-relaxed max-w-md">
                  400 PAGES: NEUTRALISED<br />6-HOUR LECTURE: SURVIVED<br />HIS EGO: 0%
                </p>
                <button onClick={restart} className="font-pixel text-[9px] md:text-[10px] text-crt bg-neon px-5 py-3 hover:brightness-110 active:translate-y-[1px]">
                  RUN IT BACK
                </button>
              </>
            ) : over ? (
              <>
                <p className="font-pixel text-[10px] md:text-xs text-hot mb-5 leading-relaxed max-w-md">{over}</p>
                <p className="font-pixel text-[9px] text-neon/60 mb-6">SCORE {hud.score} &nbsp;·&nbsp; 🍛 {hud.fulkis}</p>
                <button onClick={restart} className="font-pixel text-[9px] md:text-[10px] text-crt bg-neon px-5 py-3 hover:brightness-110 active:translate-y-[1px]">
                  TRY AGAIN
                </button>
              </>
            ) : (
              <>
                <p className="font-pixel text-xs md:text-base text-neon mb-5">AUNTY RUN</p>
                <p className="font-pixel text-[8px] md:text-[9px] text-neon/55 leading-relaxed max-w-sm mb-6">
                  JUMP 📚 &nbsp; EAT 🍛 (HEALS) &nbsp; FIRE ⚗
                  <br /><br />
                  Z = EYE LASER
                  <br /><br />
                  SURVIVE 15s. THEN HE ARRIVES.
                </p>
                <button onClick={jump} className="font-pixel text-[9px] md:text-[10px] text-crt bg-neon px-5 py-3 hover:brightness-110 active:translate-y-[1px]">
                  PRESS SPACE / TAP
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-2 md:gap-3 mt-4">
        <button
          onPointerDown={(e) => { e.preventDefault(); if (g.current.over || g.current.phase === 'won') restart(); else jump(); }}
          className="flex-1 font-pixel text-[9px] text-neon border-2 border-neon/40 py-4 active:bg-neon active:text-crt transition-colors"
        >
          JUMP
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); shoot(); }}
          className="flex-1 font-pixel text-[9px] text-neon border-2 border-neon/40 py-4 active:bg-neon active:text-crt transition-colors"
        >
          FIRE ⚗
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); laser(); }}
          disabled={hud.laser < 100}
          className="flex-1 font-pixel text-[9px] text-hot border-2 border-hot/50 py-4 active:bg-hot active:text-crt transition-colors disabled:opacity-30 disabled:border-hot/20"
        >
          LASER 👁
        </button>
      </div>

      <p className="font-pixel text-[8px] text-neon/35 mt-4 text-center leading-relaxed">
        SPACE = JUMP (TWICE = DOUBLE) &nbsp;·&nbsp; X = FIRE &nbsp;·&nbsp; Z = LASER
        <br />
        THE 6-HOUR LECTURE ONLY HURTS ON THE GROUND. JUMP IT.
      </p>
    </div>
  );
}
