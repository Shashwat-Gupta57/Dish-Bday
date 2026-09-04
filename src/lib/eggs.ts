/**
 * The nine stamps.
 *
 * `riddle` is what the Stamp Card shows while an egg is still unfound — a clue,
 * never a coordinate, so the copy can't go stale if an element moves.
 * `answer` is what the Decoder reveals once it's unlocked.
 */

export interface Egg {
  id: string;
  n: string;
  title: string;
  riddle: string;
  answer: string;
}

/** The four corner icons all roll up into a single stamp. */
export const CORNER_IDS = [
  'corner-cover',
  'corner-prologue',
  'corner-archives',
  'corner-letters',
] as const;

export const EGGS: Egg[] = [
  {
    id: 'muse',
    n: '01',
    title: 'The Muse',
    riddle: 'One word in the Editor\u2019s Note is wearing a line under it. It has somewhere to be.',
    answer:
      'In the Editor\u2019s Note, the word \u201Cmuse\u201D is underlined in oxblood. Clicking it opens The Celestial Blueprint \u2014 a page about your Virgo problem.',
  },
  {
    id: 'thirteen',
    n: '02',
    title: 'The Phantom Thirteen',
    riddle: 'A number appears in the Archives that isn\u2019t a caption. It knows what day it is.',
    answer:
      'A small roman numeral \u2014 xiii. \u2014 floats near the top right of The Archives. It opens The Vault.',
  },
  {
    id: 'dive',
    n: '03',
    title: 'The Long Way Down',
    riddle: 'Something in the Archives is written sideways. It is not a label. It is an instruction.',
    answer:
      'The word \u201CSurprise\u201D runs vertically down the right edge of The Archives. It drops you into the Archive Dive.',
  },
  {
    id: 'marginalia',
    n: '04',
    title: 'The Marginalia',
    riddle: 'There is a sentence in the Archives written in invisible ink. It is about your diet.',
    answer:
      'Above the Archives headline, in the right margin, sits a line of transparent text: \u201CGo eat a burger, Aunty.\u201D',
  },
  {
    id: 'wrongphoto',
    n: '05',
    title: 'The Wrong Photograph',
    riddle: 'One picture in the Archives is not about you. Check the date on it.',
    answer:
      'The photograph marked 12.03 is the only one with a date. It opens a reminder about whose birthday comes next.',
  },
  {
    id: 'corners',
    n: '06',
    title: 'The Four Corners',
    riddle: 'Four small icons are hiding in four corners of this magazine. Each one has an opinion about you.',
    answer:
      'A coffee cup on the Cover, a book in the Editor\u2019s Note, an hourglass in the Archives, and cutlery in the Private Collection. All four have something to say.',
  },
  {
    id: 'forever',
    n: '07',
    title: 'Forever',
    riddle: 'The date on the cover is negotiable. Insist on it.',
    answer: 'Hovering \u2014 or tapping \u2014 the date under the cover title changes 09.13 to FOREVER.',
  },
  {
    id: 'ending',
    n: '08',
    title: 'The Alternate Ending',
    riddle: 'The last two lines of this magazine have a second draft. Linger on them.',
    answer:
      'Both the closing headline and the line beneath it swap to their real versions when you hover or tap them.',
  },
  {
    id: 'fineprint',
    n: '09',
    title: 'The Fine Print',
    riddle: 'This publication has lawyers. They have written you a letter.',
    answer:
      'The Privacy Policy & Terms page. Legally binding, obviously. Reachable from the foot of the Stamp Card and the foot of the Decoder.',
  },
  {
    id: 'typo',
    n: '10',
    title: 'The Typo',
    riddle: 'The magazine cannot spell its own cover star’s name. Lean on it.',
    answer:
      'Hover — or tap — the masthead and DISHITA becomes DIHHITA. Nineteen years and we still cannot get it right. Triple-tapping the same word opens the Editor’s Cut.',
  },
  {
    id: 'findings',
    n: '11',
    title: 'The Findings',
    riddle: 'Somebody ran the numbers on you. The phrase she uses as an excuse is the way in.',
    answer:
      'In the Coaching Survival Simulator, the words “stress diet” open the Clinical Findings — nineteen years of you, plotted, charted and labelled.',
  },
  {
    id: 'complication',
    n: '12',
    title: 'The Complication',
    riddle: 'The Terms have one clause the lawyers did not write. It is at the very bottom, where nobody reads.',
    answer:
      'At the foot of the Privacy Policy there is a line about unresolved complications. It opens the only page on this site that isn’t joking. Mostly.',
  },
  {
    id: 'sleepfile',
    n: '13',
    title: 'The Sleep File',
    riddle: 'The Findings are only case file one. There is a second one, and it is worse.',
    answer:
      'At the foot of the Clinical Findings there is a cross-reference to Case File 02 — the sleep laboratory. It is the softest page on this site and the most damning.',
  },
];

export const TOTAL_EGGS = EGGS.length;

/** Design notes that aren't eggs \u2014 shown in the Decoder as the "why". */
export const NOTES = [
  {
    n: 'i',
    title: 'The Thirteen Flakes',
    body: 'The gold foil falling through the Epilogue is not a random amount. There are exactly thirteen flakes. One for the thirteenth.',
  },
  {
    n: 'ii',
    title: 'The Oxblood Palette',
    body: 'No bright colour appears anywhere on this site. Only cream and oxblood \u2014 earth-sign groundedness and a colour that looks expensive and slightly unhinged. Very you.',
  },
  {
    n: 'iii',
    title: 'The Three Planes',
    body: 'Everything that moves belongs to one of three depth planes and moves at that plane\u2019s exact speed. That is why it feels like a room rather than a page.',
  },
];
