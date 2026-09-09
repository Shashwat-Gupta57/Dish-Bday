/**
 * Entry gate — two stages.
 *
 * This is a static site, so this stops a curious person, not a determined one —
 * anything the browser can check, the browser can be made to skip. What it does
 * guarantee is that neither answer is present in the shipped bundle: only
 * digests are, and those are stored XOR'd against rolling keys and reassembled
 * at runtime, so searching the JS for the number, for the phrase, for the
 * digests, or for words like "code" turns up nothing useful.
 */

const SALT = 'v1:aunty-archive:';
const STORE = 'ax-9f2';

/**
 * A deliberately slow, non-reversible mixer. Not a cryptographic hash — it does
 * not need to be — but it cannot be run backwards by reading it, and 512 finish
 * rounds make a brute force over the keyspace unpleasant in a browser.
 */
function digest(input: string): string {
  let h1 = 0x9e3779b1 | 0;
  let h2 = 0x85ebca6b | 0;
  let h3 = 0xc2b2ae35 | 0;
  let h4 = 0x27d4eb2f | 0;
  const s = SALT + input;

  for (let i = 0; i < s.length; i += 1) {
    const c = s.charCodeAt(i) + i * 131;
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 + c, 1597334677);
    h3 = Math.imul(h3 ^ (c << 3), 3266489917);
    h4 = Math.imul(h4 + (c << 5), 668265263);
    h1 = (h1 << 13) | (h1 >>> 19);
    h2 = (h2 << 7) | (h2 >>> 25);
    h3 = (h3 << 17) | (h3 >>> 15);
    h4 = (h4 << 11) | (h4 >>> 21);
  }
  for (let r = 0; r < 512; r += 1) {
    h1 = Math.imul(h1 ^ h2, 2246822519);
    h2 = Math.imul(h2 ^ h3, 3266489917);
    h3 = Math.imul(h3 ^ h4, 668265263);
    h4 = Math.imul(h4 ^ h1, 374761393);
    h1 = (h1 << 5) | (h1 >>> 27);
    h3 = (h3 << 9) | (h3 >>> 23);
  }
  return [h1, h2, h3, h4]
    .map((v) => (v >>> 0).toString(36).padStart(7, '0'))
    .join('');
}

/** Expected digests, XOR'd under separate keys. Reassembled only on a check. */
const A = [
  106, 1, 94, 0, 16, 70, 176, 189, 242, 241, 144, 157, 200, 223,
  140, 243, 252, 171, 183, 137, 211, 222, 193, 55, 111, 105, 120, 121,
];
const B = [
  13, 61, 44, 34, 109, 87, 84, 94, 65, 18, 177, 255, 224, 234,
  175, 159, 218, 131, 215, 182, 190, 225, 188, 235, 145, 158, 155, 147,
];

const unwrap = (t: number[], key: number) =>
  t.map((n, i) => String.fromCharCode(n ^ (key + i * 7) % 251)).join('');

/** Stage one: digits. Stage two: the question. */
export const LEN_ONE = 7;
export const LEN_TWO = 6;

/** Shown on stage two. The answer itself is nowhere near this string. */
export const QUESTION = 'Who’s my first crush?';
export const HINT = 'Six characters. The space counts as one of them.';

export function verifyOne(input: string): boolean {
  if (input.length !== LEN_ONE) return false;
  return digest(input) === unwrap(A, 0x5b);
}

export function verifyTwo(input: string): boolean {
  if (input.length !== LEN_TWO) return false;
  // Case-insensitive, but the space is significant — it is one of the six.
  return digest(input.toLowerCase()) === unwrap(B, 0x3d);
}

/**
 * Nothing is remembered. Both stages are entered on every single open, so a
 * shared or borrowed device never walks straight in, and closing the tab always
 * puts the gate back. Clears the key an earlier build used to store.
 */
export function forget(): void {
  try {
    localStorage.removeItem(STORE);
  } catch {
    /* storage blocked — there was nothing to clear anyway */
  }
}

/**
 * The real title, only ever set after a successful check. Assembled from char
 * codes so the phrase is not sitting in the bundle as a searchable literal.
 */
const TITLE = [
  68, 105, 115, 104, 105, 116, 97, 39, 115, 32, 66, 105, 114, 116, 104,
  100, 97, 121, 32, 83, 117, 114, 112, 114, 105, 115, 101,
];

export function reveal(): void {
  document.title = String.fromCharCode(...TITLE);
}
