/**
 * A fixed film-grain wash over the whole site.
 *
 * The cheapest possible upgrade in perceived quality: it is the difference
 * between "rendered in a browser" and "printed on paper". Inert, non-scrolling,
 * and disabled for anyone who has asked for reduced motion is unnecessary —
 * it doesn't move — but it does respect a coarse opacity budget so it never
 * muddies the photographs.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[500] opacity-[0.035] mix-blend-multiply"
      style={{ backgroundImage: NOISE, backgroundSize: '160px 160px' }}
    />
  );
}
