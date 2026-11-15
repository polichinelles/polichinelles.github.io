// ===== Les Polichinelles : player level, daily challenges and the season pass (saved on the phone) =====
const PASS_KEY = 'polichinelles_pass', PASS_MAX = 40, PASS_SEASON = 'Saison 1 · Le Grand Carnaval';
const PASS_GAMES = { course: 'La Course', envol: 'L’Envol', trampo: 'Le Trampoline', tir: 'Le Tir Forain', tape: 'Tape-Polichinelle', pyramide: 'La Pyramide', jongleur: 'Le Jongleur' };
const PASS_DE = { course: 'de La Course', envol: 'de L’Envol', trampo: 'du Trampoline', tir: 'du Tir Forain', tape: 'de Tape-Polichinelle', pyramide: 'de La Pyramide', jongleur: 'du Jongleur' };
const PASS_A = { course: 'à La Course', envol: 'à L’Envol', trampo: 'au Trampoline', tir: 'au Tir Forain', tape: 'à Tape-Polichinelle', pyramide: 'à La Pyramide', jongleur: 'au Jongleur' };
const PASS_SCORE = { course: 800, envol: 150, trampo: 200, tir: 1500, tape: 300, pyramide: 120, jongleur: 250 };
// season pass: one reward per level; levels 10/20/30/40 are the big ones
const PASS_ITEMS = { 2: 'h_carnaval', 4: 'l_carnaval', 5: 'f_carnaval', 7: 'p_serpentin', 9: 'k_cravate_or', 10: 'c_carnaval', 12: 't_glitter', 14: 'h_venise', 16: 'l_paillettes', 18: 'f_goldmask', 20: 'b_plumes', 22: 'c_paillettes', 24: 'h_plumes', 26: 'p_goldfan', 28: 'b_cape_or', 30: 'c_venise', 33: 'c_minuit', 36: 'k_jabot_or', 38: 'h_licorne_or', 40: 'c_legende' };
function passReward(lvl) { return PASS_ITEMS[lvl] ? { kind: 'item', id: PASS_ITEMS[lvl] } : { kind: 'stars', n: 20 + lvl * 3 } }
function xpNeed(n) { return 250 + 40 * (n - 1) }
function levelInfo(xp) { let n = 1, x = xp; while (x >= xpNeed(n)) { x -= xpNeed(n); n++ } return { level: n, into: x, need: xpNeed(n) } }
function loadPass() {
  const d = { xp: 0, claimed: [], day: null, daily: [], gamesDay: [] };
  try { return Object.assign(d, JSON.parse(localStorage.getItem(PASS_KEY)) || {}) } catch (e) { return d }
}
function savePass(p) { try { localStorage.setItem(PASS_KEY, JSON.stringify(p)) } catch (e) {} }
function passToday() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() }
function dailyFor(day) {
  let h = 2166136261; for (const ch of day) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000 };
  const ids = Object.keys(PASS_GAMES), g1 = ids[Math.floor(rnd() * ids.length)];
  let g2 = ids[Math.floor(rnd() * ids.length)]; if (g2 === g1) g2 = ids[(ids.indexOf(g1) + 3) % ids.length];
  const gen = [
    { kind: 'games', goal: 5, text: 'Joue 5 parties' },
    { kind: 'diff', goal: 3, text: 'Joue à 3 jeux différents' },
    { kind: 'stars', goal: 25, text: 'Gagne 25 ⭐' }
  ][Math.floor(rnd() * 3)];
  return [gen, { kind: 'game', game: g1, goal: 2, text: `Joue 2 parties ${PASS_DE[g1]}` },
    { kind: 'score', game: g2, goal: 1, score: PASS_SCORE[g2], text: `Fais ${PASS_SCORE[g2]} points ${PASS_A[g2]}` }].map(c => ({ ...c, prog: 0, done: false }));
}
function ensureDaily(p) { const d = passToday(); if (p.day !== d) { p.day = d; p.daily = dailyFor(d); p.gamesDay = [] } return p }
const DAILY_XP = 150;
// called at the end of every game
function passAward(game, earned, score) {
  const p = ensureDaily(loadPass()), before = levelInfo(p.xp).level;
  let xp = 30 + earned * 6; const done = [];
  if (!p.gamesDay.includes(game)) p.gamesDay.push(game);
  for (const c of p.daily) {
    if (c.done) continue;
    if (c.kind === 'games') c.prog++;
    else if (c.kind === 'diff') c.prog = p.gamesDay.length;
    else if (c.kind === 'stars') c.prog += earned;
    else if (c.kind === 'game' && c.game === game) c.prog++;
    else if (c.kind === 'score' && c.game === game && score >= c.score) c.prog = 1;
    if (c.prog >= c.goal) { c.prog = c.goal; c.done = true; xp += DAILY_XP; done.push(c.text) }
  }
  p.xp += xp; savePass(p);
  return { xp, before, after: levelInfo(p.xp), done };
}
function passUnclaimed(p) { const lv = Math.min(PASS_MAX, levelInfo(p.xp).level); let n = 0; for (let i = 1; i <= lv; i++) if (!p.claimed.includes(i)) n++; return n }
var passResult = null;
// line drawn in the game-over panel of every game
function drawXpLine(ox, y) {
  if (!passResult) return;
  const r = passResult, a = r.after, up = a.level > r.before;
  txt(`Niv. ${a.level}`, ox - 100, y, 13, '#ffe9a0', 'left');
  X.fillStyle = 'rgba(255,255,255,.15)'; X.beginPath(); X.roundRect(ox - 52, y - 5, 120, 10, 5); X.fill();
  X.fillStyle = '#9fe0ff'; X.beginPath(); X.roundRect(ox - 52, y - 5, M.max(10, 120 * a.into / a.need), 10, 5); X.fill();
  txt(`+${r.xp} XP`, ox + 104, y, 11, '#9fe0ff', 'right', false);
  if (r.done.length) txt(`✔ Défi du jour réussi${r.done.length > 1 ? ' ×' + r.done.length : ''} !`, ox, y + 17, 11, '#7dff8a', 'center', false);
  if (up) { X.save(); X.globalAlpha = .75 + M.sin(t * .2) * .25; txt(`⬆ NIVEAU ${a.level} !`, ox, y - 168, 22, COL.yellow); X.restore() }
}
