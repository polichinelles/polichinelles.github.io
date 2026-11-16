// ===== Les Polichinelles : player level, daily challenges and the season pass (saved on the phone) =====
const PASS_KEY = 'polichinelles_pass', PASS_MAX = 40, TIER_XP = 300;
const PASS_GAMES = { course: 'La Course', envol: 'L’Envol', trampo: 'Le Trampoline', tir: 'Le Tir Forain', tape: 'Tape-Polichinelle', pyramide: 'La Pyramide', jongleur: 'Le Jongleur', briques: 'Le Casse-Décor', farandole: 'La Farandole', traversee: 'La Traversée' };
const PASS_DE = { course: 'de La Course', envol: 'de L’Envol', trampo: 'du Trampoline', tir: 'du Tir Forain', tape: 'de Tape-Polichinelle', pyramide: 'de La Pyramide', jongleur: 'du Jongleur', briques: 'du Casse-Décor', farandole: 'de La Farandole', traversee: 'de La Traversée' };
const PASS_A = { course: 'à La Course', envol: 'à L’Envol', trampo: 'au Trampoline', tir: 'au Tir Forain', tape: 'à Tape-Polichinelle', pyramide: 'à La Pyramide', jongleur: 'au Jongleur', briques: 'au Casse-Décor', farandole: 'à La Farandole', traversee: 'à La Traversée' };
const PASS_SCORE = { course: 800, envol: 150, trampo: 200, tir: 1500, tape: 300, pyramide: 120, jongleur: 250, briques: 500, farandole: 250, traversee: 300 };
// ---- seasons: each one has its own 40 tiers; the player level never resets ----
const SEASONS = [
  { id: 1, name: 'Le Grand Carnaval', icon: '🎭', start: [2026, 11, 16], days: 10,
    items: { 2: 'h_carnaval', 3: 'p_baguette_pain', 4: 'l_carnaval', 5: 'f_carnaval', 7: 'p_serpentin', 8: 'h_helice', 9: 'k_cravate_or', 10: 'c_carnaval', 11: 'p_poisson', 12: 't_glitter', 13: 'f_3d', 14: 'h_venise', 16: 'l_paillettes', 17: 'h_gateau', 18: 'f_goldmask', 19: 'c_tigre', 20: 'b_plumes', 21: 'p_canard', 22: 'c_paillettes', 23: 'h_theiere', 24: 'h_plumes', 26: 'p_goldfan', 27: 'c_pasteque', 28: 'b_cape_or', 29: 'h_nuage', 30: 'c_venise', 31: 't_bananes', 32: 'b_escargot', 33: 'c_minuit', 34: 'h_poulet', 35: 'h_bocal', 36: 'k_jabot_or', 37: 'p_poele', 38: 'h_licorne_or', 39: 'h_minime', 40: 'c_legende' },
    stars: { 1: 50, 6: 80, 15: 120, 25: 200 } },
  { id: 2, name: 'La Ferme', icon: '🐮', start: [2026, 11, 26], days: 10,
    items: { 2: 'h_paille', 3: 'p_carotte', 4: 'l_bottes_vertes', 5: 'f_paille', 7: 't_plumes', 8: 'h_casquette', 9: 'k_cloche', 10: 'c_salopette', 11: 'p_mais', 12: 'f_groin', 13: 'h_tournesol', 14: 'c_carreaux', 16: 'p_fourche', 17: 'h_foin', 18: 'l_bottes_jaunes', 19: 'c_coccinelle', 20: 'b_moulin', 21: 'p_seau', 22: 'k_marguerites', 23: 'h_cochon', 24: 't_abeilles', 26: 'b_sac', 27: 'c_abeille', 28: 'h_nid', 29: 'f_boue', 30: 'c_epouvantail', 31: 'p_poussin', 32: 'l_salopette', 33: 'h_ruche', 34: 'b_poule', 35: 't_fleurs', 36: 'h_vache', 37: 'c_mouton', 38: 'h_citrouille', 39: 'p_arrosoir', 40: 'c_vache_leg' },
    stars: { 1: 50, 6: 80, 15: 120, 25: 200 } }
];
function seasonStart(se) { return new Date(se.start[0], se.start[1] - 1, se.start[2]) }
function seasonEnd(se) { const d = seasonStart(se); d.setDate(d.getDate() + se.days); return d }
function currentSeason() { const now = new Date(); let cur = SEASONS[0]; for (const se of SEASONS) if (seasonStart(se) <= now) cur = se; return cur }
function nextSeason() { const c = currentSeason(); return SEASONS.find(se => se.id === c.id + 1) || null }
const PASS_SEASON_OBJ = currentSeason();
const PASS_SEASON = `Saison ${PASS_SEASON_OBJ.id} · ${PASS_SEASON_OBJ.name}`;
function seasonLeft(se) {
  const ms = seasonEnd(se) - new Date(); if (ms <= 0) return 'terminée';
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24;
  return d >= 1 ? `encore ${d} jour${d > 1 ? 's' : ''}${d < 3 ? ' et ' + h + ' h' : ''}` : `encore ${h} h ${Math.floor(ms / 6e4) % 60} min`;
}
function frDate(se) { return seasonStart(se).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) }
function passReward(lvl, se = PASS_SEASON_OBJ) { return se.items && se.items[lvl] ? { kind: 'item', id: se.items[lvl] } : { kind: 'stars', n: se.stars[lvl] || 50 } }
function xpNeed(n) { return 250 + 40 * (n - 1) }
function levelInfo(xp) { let n = 1, x = xp; while (x >= xpNeed(n)) { x -= xpNeed(n); n++ } return { level: n, into: x, need: xpNeed(n) } }
function tierInfo(sxp) { const tier = Math.min(PASS_MAX, 1 + Math.floor(sxp / TIER_XP)); return { tier, into: tier >= PASS_MAX ? TIER_XP : sxp % TIER_XP, need: TIER_XP } }
function loadPass() {
  const d = { xp: 0, seasons: {}, day: null, daily: [], gamesDay: [] };
  let p; try { p = Object.assign(d, JSON.parse(localStorage.getItem(PASS_KEY)) || {}) } catch (e) { p = d }
  if (p.claimed) { p.seasons[1] = { xp: p.xp, claimed: p.claimed }; delete p.claimed }   // first version of the pass
  return p;
}
function seasonOf(p, se = PASS_SEASON_OBJ) { return p.seasons[se.id] || (p.seasons[se.id] = { xp: 0, claimed: [] }) }
function passUnclaimed(p) { if (!PASS_SEASON_OBJ.items) return 0; const s = seasonOf(p), tr = tierInfo(s.xp).tier; let n = 0; for (let i = 1; i <= tr; i++) if (!s.claimed.includes(i)) n++; return n }
function savePass(p) { try { localStorage.setItem(PASS_KEY, JSON.stringify(p)) } catch (e) {} }
// rewards reached but not claimed in a finished season are sent to the Loge automatically
(function settleSeasons() {
  try {
    const p = loadPass(); let loge = null, gave = 0;
    for (const se of SEASONS) {
      if (se.id === PASS_SEASON_OBJ.id || !se.items || seasonEnd(se) > new Date()) continue;
      const s = p.seasons[se.id]; if (!s || s.settled) continue;
      loge = loge || JSON.parse(localStorage.getItem('polichinelles_loge') || 'null');
      if (!loge) break;
      for (let i = 1; i <= tierInfo(s.xp).tier; i++) if (!s.claimed.includes(i)) { const r = passReward(i, se); if (r.kind === 'stars') loge.wallet = (loge.wallet || 0) + r.n; else if (!loge.owned.includes(r.id)) loge.owned.push(r.id); s.claimed.push(i); gave++ }
      s.settled = true;
    }
    if (loge) localStorage.setItem('polichinelles_loge', JSON.stringify(loge));
    if (gave) p.settledMsg = gave;
    savePass(p);
  } catch (e) {}
})();
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
// ---- daily streak: play on consecutive days for bonus XP and stars ----
function streakBonus(n) { const m = ((n - 1) % 7) + 1; return [null, { xp: 50, stars: 0 }, { xp: 75, stars: 0 }, { xp: 100, stars: 10 }, { xp: 125, stars: 0 }, { xp: 150, stars: 20 }, { xp: 175, stars: 0 }, { xp: 250, stars: 40 }][m] }
function dayStr(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() }
function streakState(p) {
  const st = p.streak || { last: null, n: 0 }, today = passToday(), y = new Date(); y.setDate(y.getDate() - 1);
  const alive = st.last === today || st.last === dayStr(y);
  return { n: alive ? st.n : 0, doneToday: st.last === today, next: alive ? (st.last === today ? st.n + 1 : st.n + 1) : 1 };
}
// called at the end of every game
function passAward(game, earned, score) {
  const p = ensureDaily(loadPass()), before = levelInfo(p.xp).level;
  let xp = 30 + earned * 6; const done = [];
  let streak = null;
  { const today = passToday(), y = new Date(); y.setDate(y.getDate() - 1); const st = p.streak || { last: null, n: 0 };
    if (st.last !== today) { st.n = st.last === dayStr(y) ? st.n + 1 : 1; st.last = today; const b = streakBonus(st.n); xp += b.xp; streak = { n: st.n, xp: b.xp, stars: b.stars } }
    p.streak = st }
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
  // quests of the week
  const wk = weekQuests(p), weekDone = []; let weekStars = 0, weekItem = null;
  if (!wk.games.includes(game)) wk.games.push(game); if (!wk.days.includes(passToday())) wk.days.push(passToday());
  for (const c of wk.list) {
    if (c.done) continue;
    if (c.kind === 'games') c.prog++; else if (c.kind === 'stars') c.prog += earned; else if (c.kind === 'days') c.prog = wk.days.length;
    else if (c.kind === 'diff') c.prog = wk.games.filter(g => g in PASS_GAMES).length; else if (c.kind === 'game' && c.game === game) c.prog++;
    else if (c.kind === 'score' && c.game === game && score >= c.score) c.prog = 1;
    if (c.prog >= c.goal) { c.prog = c.goal; c.done = true; xp += WEEK_XP; weekStars += WEEK_STARS; weekDone.push(c.text) }
  }
  if (!wk.bonus && wk.list.every(c => c.done)) { wk.bonus = true; weekItem = questDance(p) }
  p.xp += xp; const se = seasonOf(p), tb = tierInfo(se.xp).tier; se.xp += xp; savePass(p);
  return { xp, before, after: levelInfo(p.xp), done, tier: tierInfo(se.xp), tierUp: tierInfo(se.xp).tier > tb, streak, streakStars: streak ? streak.stars : 0, weekDone, weekStars, weekItem };
}
// ---- quests of the week (Monday to Sunday) ----
const WEEK_XP = 500, WEEK_STARS = 30, QUEST_DANCES = ['d_twist', 'd_triomphe'];
function weekStart(d = new Date()) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x }
function weekKey() { return dayStr(weekStart()) }
function weekLeft() { const e = weekStart(); e.setDate(e.getDate() + 7); const ms = e - new Date(), d = Math.floor(ms / 864e5); return d >= 1 ? `encore ${d} jour${d > 1 ? 's' : ''}` : `encore ${Math.floor(ms / 36e5)} h` }
function weekFor(key) {
  let h = 5381; for (const ch of key + 'w') { h = Math.imul(h ^ ch.charCodeAt(0), 2654435761) }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000 };
  const ids = Object.keys(PASS_GAMES), g1 = ids[Math.floor(rnd() * ids.length)]; let g2 = ids[Math.floor(rnd() * ids.length)]; if (g2 === g1) g2 = ids[(ids.indexOf(g1) + 2) % ids.length];
  const a = [{ kind: 'games', goal: 30, text: 'Joue 30 parties' }, { kind: 'stars', goal: 200, text: 'Gagne 200 ⭐' }, { kind: 'days', goal: 4, text: 'Joue 4 jours différents' }][Math.floor(rnd() * 3)];
  const b = rnd() < .5 ? { kind: 'diff', goal: Object.keys(PASS_GAMES).length, text: `Joue aux ${Object.keys(PASS_GAMES).length} jeux du Théâtre` } : { kind: 'game', game: g1, goal: 12, text: `Joue 12 parties ${PASS_DE[g1]}` };
  const sc = Math.round(PASS_SCORE[g2] * 2.5 / 10) * 10;
  return [a, b, { kind: 'score', game: g2, goal: 1, score: sc, text: `Fais ${sc} points ${PASS_A[g2]}` }].map(c => ({ ...c, prog: 0, done: false }));
}
function weekQuests(p) { const k = weekKey(); if (!p.week || p.week.key !== k) p.week = { key: k, list: weekFor(k), games: [], days: [], bonus: false }; return p.week }
function questDance(p) { const k = weekKey(); let n = 0; for (const ch of k) n += ch.charCodeAt(0); return QUEST_DANCES[n % QUEST_DANCES.length] }
// ---- wheel of fortune, one free spin a day ----
const WHEEL = [
  { label: '10 ⭐', stars: 10, w: 22, col: '#d8402c' }, { label: '+100 XP', xp: 100, w: 18, col: '#3070d0' },
  { label: '25 ⭐', stars: 25, w: 16, col: '#2e9a4c' }, { label: '+250 XP', xp: 250, w: 12, col: '#8a4a9a' },
  { label: '50 ⭐', stars: 50, w: 10, col: '#f08a1c' }, { label: 'Danse !', item: 'd_salto', w: 3, col: '#c99a2e' },
  { label: '100 ⭐', stars: 100, w: 5, col: '#2bb3c0' }, { label: 'JACKPOT', xp: 500, stars: 50, w: 4, col: '#f27ab0' }
];
function wheelReady(p = loadPass()) { return p.wheelDay !== passToday() }
function spinWheel() {
  const p = loadPass(); if (!wheelReady(p)) return null;
  let r = Math.random() * WHEEL.reduce((a, s) => a + s.w, 0), i = 0; while (r >= WHEEL[i].w) { r -= WHEEL[i].w; i++ }
  const seg = WHEEL[i], got = { i, xp: seg.xp || 0, stars: seg.stars || 0, item: null };
  let loge; try { loge = JSON.parse(localStorage.getItem('polichinelles_loge')) } catch (e) {}
  loge = Object.assign({ wallet: 0, owned: [], eq: {}, stats: { games: 0, totalStars: 0, maxAct: 1, maxCombo: 0, masks: 0, traps: 0 }, seen: [] }, loge || {});
  if (seg.item) { if (loge.owned.includes(seg.item)) got.stars += 100; else { loge.owned.push(seg.item); got.item = seg.item } }
  loge.wallet = (loge.wallet || 0) + got.stars;
  try { localStorage.setItem('polichinelles_loge', JSON.stringify(loge)) } catch (e) {}
  if (got.xp) { p.xp += got.xp; seasonOf(p).xp += got.xp }
  p.wheelDay = passToday(); savePass(p);
  return got;
}
var passResult = null;
// line drawn in the game-over panel of every game
function drawXpLine(ox, y) {
  if (!passResult) return;
  const r = passResult, a = r.after, up = a.level > r.before;
  txt(`Niv. ${a.level}`, ox - 100, y, 13, '#ffe9a0', 'left');
  X.fillStyle = 'rgba(255,255,255,.15)'; X.beginPath(); X.roundRect(ox - 52, y - 5, 120, 10, 5); X.fill();
  X.fillStyle = '#9fe0ff'; X.beginPath(); X.roundRect(ox - 52, y - 5, M.max(10, 120 * a.into / a.need), 10, 5); X.fill();
  txt(`+${r.xp} XP`, ox + 104, y, 11, '#9fe0ff', 'right', false);
  if (PASS_SEASON_OBJ.items) txt(`Palier ${r.tier.tier} / ${PASS_MAX}` + (r.tierUp ? ' · nouvelle récompense !' : ''), ox, y + 17 + (r.done.length || (r.weekDone && r.weekDone.length) || r.weekItem ? 15 : 0), 11, r.tierUp ? '#ffe066' : '#c9c2d8', 'center', false);
  const msg = []; if (r.done.length) msg.push(`✔ Défi du jour${r.done.length > 1 ? ' ×' + r.done.length : ''}`); if (r.weekDone && r.weekDone.length) msg.push(`✔ Quête de la semaine${r.weekDone.length > 1 ? ' ×' + r.weekDone.length : ''}`); if (r.weekItem) msg.push('🕺 Nouvelle danse !');
  if (msg.length) txt(msg.join(' · '), ox, y + 17, 11, '#7dff8a', 'center', false);
  if (r.streak) txt(`🔥 ${r.streak.n} jour${r.streak.n > 1 ? 's' : ''} d’affilée : +${r.streak.xp} XP` + (r.streak.stars ? ` +${r.streak.stars} ⭐` : ''), ox, y - 16, 11, '#ffb060', 'center', false);
  if (up) { X.save(); X.globalAlpha = .75 + M.sin(t * .2) * .25; txt(`⬆ NIVEAU ${a.level} !`, ox, y - 184, 22, COL.yellow); X.restore() }
}
