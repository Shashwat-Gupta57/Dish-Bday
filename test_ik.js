const ax = 0, ay = 0; // pelvis
const bx = 0, by = 100; // foot directly below
const l1 = 50, l2 = 50;
const dx = bx - ax, dy = by - ay;
const d = Math.hypot(dx, dy); // 100
const base = Math.atan2(dy, dx); // PI/2
const cos = (l1*l1 + d*d - l2*l2) / (2*l1*d); // (2500 + 10000 - 2500)/10000 = 1.0 (straight)
// Let's use foot slightly forward
const bx2 = -20; 
const d2 = Math.hypot(-20, 100);
const base2 = Math.atan2(100, -20);
const cos2 = (2500 + d2*d2 - 2500) / (2*50*d2); // d2 / 100 
const a = Math.acos(cos2);
console.log({base2: base2*180/Math.PI, a: a*180/Math.PI});
// bend 1
let jx1 = ax + Math.cos(base2 + a) * l1;
let jy1 = ay + Math.sin(base2 + a) * l1;
// bend -1
let jx2 = ax + Math.cos(base2 - a) * l1;
let jy2 = ay + Math.sin(base2 - a) * l1;
console.log({jx1, jy1}, {jx2, jy2});
