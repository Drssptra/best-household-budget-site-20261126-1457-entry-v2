// NestEgg — household budget. All data lives in this file; nothing loads over the network.
// State is kept in memory (and localStorage when available) so every control stays live.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = n => '$' + Math.round(n).toLocaleString('en-US');

const BUDGETS = { Groceries: 720, Housing: 1450, Utilities: 310, Transport: 340, 'Dining Out': 220, Kids: 380, Health: 180, Fun: 200, Other: 150 };
const CAT_COLORS = { Groceries: '#1f9d63', Housing: '#2f6fed', Utilities: '#e07840', Transport: '#0e9aa7', 'Dining Out': '#d6336c', Kids: '#8b5cf6', Health: '#0d7a5f', Fun: '#d9a400', Other: '#8a94a6', Income: '#1f9d63' };
const MONTHS = [
  { key: '2026-09', label: 'September 2026', sub: '30 days · closed', income: 5420 },
  { key: '2026-10', label: 'October 2026', sub: '31 days · closed', income: 5540 },
  { key: '2026-11', label: 'November 2026', sub: '26 days in · 4 left', income: 5680 },
];
const TX = {
  '2026-09': [
    ['Maya salary — Northwind Studio', 'Income', 3850, '2026-09-01', 'income'], ['Jonas salary — City Transit', 'Income', 1570, '2026-09-01', 'income'],
    ['Rent — Maple Court Apt 4B', 'Housing', 1450, '2026-09-02', 'expense'], ['Weekly groceries — Market Square', 'Groceries', 186.40, '2026-09-03', 'expense'],
    ['Electricity — City Power', 'Utilities', 118.20, '2026-09-05', 'expense'], ['Fuel — Shell Elm St', 'Transport', 52.00, '2026-09-06', 'expense'],
    ['School lunches — Sofia & Leo', 'Kids', 96.00, '2026-09-07', 'expense'], ['Groceries — FreshMart', 'Groceries', 142.75, '2026-09-10', 'expense'],
    ['Internet — FiberLink 500', 'Utilities', 59.00, '2026-09-11', 'expense'], ['Pizza night — Tony’s', 'Dining Out', 48.50, '2026-09-12', 'expense'],
    ['Kids’ shoes — Leo', 'Kids', 64.90, '2026-09-14', 'expense'], ['Groceries — Market Square', 'Groceries', 171.30, '2026-09-17', 'expense'],
    ['Bus passes — monthly', 'Transport', 120.00, '2026-09-18', 'expense'], ['Dentist — Sofia check-up', 'Health', 85.00, '2026-09-20', 'expense'],
    ['Movie night — family', 'Fun', 46.00, '2026-09-21', 'expense'], ['Groceries — FreshMart', 'Groceries', 158.60, '2026-09-24', 'expense'],
    ['Water bill — City Water', 'Utilities', 42.30, '2026-09-25', 'expense'], ['Birthday gift — Grandma', 'Other', 38.00, '2026-09-27', 'expense'],
  ],
  '2026-10': [
    ['Maya salary — Northwind Studio', 'Income', 3920, '2026-10-01', 'income'], ['Jonas salary — City Transit', 'Income', 1620, '2026-10-01', 'income'],
    ['Rent — Maple Court Apt 4B', 'Housing', 1450, '2026-10-02', 'expense'], ['Weekly groceries — Market Square', 'Groceries', 178.90, '2026-10-03', 'expense'],
    ['Electricity — City Power', 'Utilities', 104.60, '2026-10-05', 'expense'], ['Fuel — Shell Elm St', 'Transport', 48.50, '2026-10-07', 'expense'],
    ['School lunches — Sofia & Leo', 'Kids', 102.00, '2026-10-08', 'expense'], ['Groceries — FreshMart', 'Groceries', 164.20, '2026-10-10', 'expense'],
    ['Internet — FiberLink 500', 'Utilities', 59.00, '2026-10-11', 'expense'], ['Sushi takeaway', 'Dining Out', 62.40, '2026-10-13', 'expense'],
    ['Sofia — piano lessons', 'Kids', 120.00, '2026-10-14', 'expense'], ['Groceries — Market Square', 'Groceries', 189.45, '2026-10-17', 'expense'],
    ['Pharmacy — cold medicine', 'Health', 24.80, '2026-10-19', 'expense'], ['Bus passes — monthly', 'Transport', 120.00, '2026-10-20', 'expense'],
    ['Groceries — FreshMart', 'Groceries', 149.90, '2026-10-24', 'expense'], ['Leo — football kit', 'Kids', 58.00, '2026-10-25', 'expense'],
    ['Cinema — family Saturday', 'Fun', 52.00, '2026-10-26', 'expense'], ['Water bill — City Water', 'Utilities', 44.10, '2026-10-27', 'expense'],
    ['Halloween costumes', 'Fun', 47.50, '2026-10-30', 'expense'],
  ],
  '2026-11': [
    ['Maya salary — Northwind Studio', 'Income', 3980, '2026-11-02', 'income'], ['Jonas salary — City Transit', 'Income', 1700, '2026-11-02', 'income'],
    ['Rent — Maple Court Apt 4B', 'Housing', 1450, '2026-11-02', 'expense'], ['Weekly groceries — Market Square', 'Groceries', 192.35, '2026-11-03', 'expense'],
    ['Electricity — City Power', 'Utilities', 96.40, '2026-11-05', 'expense'], ['Fuel — Shell Elm St', 'Transport', 54.00, '2026-11-06', 'expense'],
    ['School lunches — Sofia & Leo', 'Kids', 98.00, '2026-11-07', 'expense'], ['Groceries — FreshMart', 'Groceries', 176.80, '2026-11-10', 'expense'],
    ['Internet — FiberLink 500', 'Utilities', 59.00, '2026-11-11', 'expense'], ['Dentist — Leo check-up', 'Health', 92.00, '2026-11-12', 'expense'],
    ['Groceries — Market Square', 'Groceries', 184.60, '2026-11-14', 'expense'], ['Sofia — piano lessons', 'Kids', 120.00, '2026-11-15', 'expense'],
    ['Family dinner — Bistro Verde', 'Dining Out', 86.20, '2026-11-16', 'expense'], ['Bus passes — monthly', 'Transport', 120.00, '2026-11-17', 'expense'],
    ['Groceries — FreshMart', 'Groceries', 161.45, '2026-11-19', 'expense'], ['Winter coats — Sofia & Leo', 'Kids', 148.00, '2026-11-21', 'expense'],
    ['Pharmacy — vitamins', 'Health', 31.50, '2026-11-22', 'expense'], ['Board games night', 'Fun', 38.90, '2026-11-23', 'expense'],
    ['Groceries — Market Square', 'Groceries', 173.20, '2026-11-25', 'expense'], ['Streaming — Family plan', 'Fun', 15.99, '2026-11-26', 'expense'],
  ],
};
const BILLS = [
  { name: 'Rent — Maple Court Apt 4B', due: 'Dec 2', amt: 1450, status: 'soon', note: 'Auto-pay on · every month' },
  { name: 'Electricity — City Power', due: 'Dec 5', amt: 110, status: 'soon', note: 'Est. from Nov usage' },
  { name: 'Internet — FiberLink 500', due: 'Dec 11', amt: 59, status: 'ok', note: 'Auto-pay on' },
  { name: 'Water — City Water', due: 'Dec 15', amt: 45, status: 'ok', note: 'Est. from Nov usage' },
  { name: 'Home insurance — SafeHome', due: 'Dec 18', amt: 86, status: 'ok', note: 'Quarterly · next is Dec' },
  { name: 'Piano lessons — Sofia', due: 'Dec 15', amt: 120, status: 'ok', note: '4 lessons · paid monthly' },
  { name: 'Bus passes — monthly', due: 'Dec 1', amt: 120, status: 'paid', note: 'Paid Nov 17' },
  { name: 'Streaming — Family plan', due: 'Dec 26', amt: 15.99, status: 'paid', note: 'Paid Nov 26' },
];
const GOALS = [
  { name: '🏖️ Summer holiday — Seaside cottage', saved: 1840, target: 2400, note: '$560 to go · on track for July', date: 'Jul 2027' },
  { name: '🚗 New family car fund', saved: 5120, target: 9000, note: '$320 / month · 12 months left', date: 'Nov 2027' },
  { name: '🎓 Sofia’s college starter', saved: 2750, target: 5000, note: '$150 / month · auto-transfer on payday', date: 'Sep 2028' },
  { name: '🛡️ Emergency fund — 3 months', saved: 6300, target: 9000, note: '70% funded · $2,700 to go', date: 'Ongoing' },
  { name: '🏠 Kitchen refresh', saved: 940, target: 1500, note: 'New counters + paint · spring project', date: 'Apr 2027' },
];

let monthIdx = 2;
let view = 'dashboard';
let catFilter = 'All';
let query = '';
let paidBills = new Set();
try { const s = JSON.parse(localStorage.getItem('nestegg') || '{}'); if (s.tx) Object.assign(TX, s.tx); if (s.paid) paidBills = new Set(s.paid); if (s.goals) GOALS.forEach((g, i) => { if (s.goals[i] != null) g.saved = s.goals[i]; }); } catch (e) {}
function persist() { try { localStorage.setItem('nestegg', JSON.stringify({ tx: TX, paid: [...paidBills], goals: GOALS.map(g => g.saved) })); } catch (e) {} }

const month = () => MONTHS[monthIdx];
const txs = () => TX[month().key].map((t, i) => ({ id: month().key + '-' + i, desc: t[0], cat: t[1], amt: t[2], date: t[3], kind: t[4] }));
const spent = () => txs().filter(t => t.kind === 'expense').reduce((a, t) => a + t.amt, 0);
const income = () => txs().filter(t => t.kind === 'income').reduce((a, t) => a + t.amt, 0);
const saved = () => income() - spent();
const catSpend = () => { const m = {}; txs().filter(t => t.kind === 'expense').forEach(t => m[t.cat] = (m[t.cat] || 0) + t.amt); return m; };

function toast(msg) { const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; document.body.appendChild(el); setTimeout(() => el.remove(), 2600); }

function donutSVG() {
  const cs = catSpend(); const total = Object.values(cs).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(cs).sort((a, b) => b[1] - a[1]);
  const R = 62, C = 2 * Math.PI * R; let off = 0;
  const arcs = entries.map(([c, v]) => { const len = v / total * C; const s = `<circle r="${R}" cx="80" cy="80" fill="none" stroke="${CAT_COLORS[c] || '#888'}" stroke-width="26" stroke-dasharray="${len.toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}"/>`; off += len; return s; }).join('');
  return `<svg width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="Spending by category chart">${arcs}<text x="80" y="76" text-anchor="middle" font-size="19" font-weight="800" fill="#1d2733">${money0(total)}</text><text x="80" y="93" text-anchor="middle" font-size="11" fill="#67748a">spent</text></svg>`;
}
function legendHTML() {
  const cs = catSpend(); const total = Object.values(cs).reduce((a, b) => a + b, 0) || 1;
  return '<div class="legend">' + Object.entries(cs).sort((a, b) => b[1] - a[1]).map(([c, v]) =>
    `<span><i style="background:${CAT_COLORS[c]}"></i>${c} · ${Math.round(v / total * 100)}%</span>`).join('') + '</div>';
}
function catBarsHTML() {
  const cs = catSpend();
  return Object.keys(BUDGETS).map(c => {
    const v = cs[c] || 0, b = BUDGETS[c], pct = Math.min(100, Math.round(v / b * 100));
    const over = v > b;
    return `<div class="cat-row" data-cat="${c}" title="Show ${c} transactions" style="cursor:pointer"><span><b>${c}</b><span class="pct">${over ? '⚠ over budget' : pct + '% of budget'}</span></span>
      <div class="cat-track"><span style="width:${pct}%;background:${over ? '#d64545' : CAT_COLORS[c]}"></span></div>
      <span class="amt ${over ? 'over' : ''}">${money0(v)} / ${money0(b)}</span></div>`;
  }).join('');
}
function txTable(list, limit) {
  const rows = (limit ? list.slice(0, limit) : list);
  if (!rows.length) return '<p class="empty">No transactions match. Try clearing the search or filter.</p>';
  return `<table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody>` +
    rows.map(t => `<tr><td>${t.date.slice(5)}</td><td>${t.desc}</td><td><span class="tag ${t.cat.toLowerCase().replace(/[^a-z]/g, '')}">${t.cat}</span></td><td class="num ${t.kind === 'income' ? 'inc' : 'exp'}">${t.kind === 'income' ? '+' : '−'}${money(t.amt)}</td><td><button class="btn small danger" data-del="${t.id}" title="Delete">✕</button></td></tr>`).join('') + '</tbody></table>';
}
function goalsHTML(withButtons, limit) {
  return GOALS.slice(0, limit || GOALS.length).map((g, i) => { const pct = Math.min(100, Math.round(g.saved / g.target * 100));
    return `<div class="goal"><div class="goal-top"><span>${g.name}</span><span>${money0(g.saved)} / ${money0(g.target)}</span></div>
    <div class="bar"><span class="${pct >= 100 ? 'done' : ''}" style="width:${pct}%"></span></div>
    <div class="goal-meta"><span>${g.note}</span><span>${pct}% · due ${g.date}</span></div>
    ${withButtons ? `<div style="margin-top:8px"><button class="btn small" data-add-goal="${i}">+ Add $50</button> <button class="btn small" data-add-goal100="${i}">+ Add $100</button></div>` : ''}</div>`;
  }).join('');
}
function billsHTML() {
  const total = BILLS.filter(b => b.status !== 'paid' && !paidBills.has(b.name)).reduce((a, b) => a + b.amt, 0);
  return `<p class="hint">${money0(total)} still due in December · ${BILLS.filter(b => b.status === 'paid' || paidBills.has(b.name)).length} of ${BILLS.length} already paid</p>` +
    BILLS.map(b => { const paid = b.status === 'paid' || paidBills.has(b.name);
      return `<div class="bill"><div><b>${b.name}</b><small>${b.note}</small></div>
      <div style="display:flex;align-items:center;gap:10px"><span class="due ${paid ? 'paid' : b.status === 'soon' ? 'soon' : 'ok'}">${paid ? '✓ Paid' : 'Due ' + b.due}</span><span class="amt">${money(b.amt)}</span>${paid ? '' : `<button class="btn small" data-pay="${b.name}">Mark paid</button>`}</div></div>`; }).join('');
}
function weeklyHTML() {
  const weeks = [0, 0, 0, 0];
  txs().filter(t => t.kind === 'expense').forEach(t => { const d = +t.date.slice(8, 10); weeks[Math.min(3, Math.floor((d - 1) / 7))] += t.amt; });
  const max = Math.max(...weeks, 1);
  return `<div class="bars">` + weeks.map((v, i) => `<div class="bar-col"><span class="v">${money0(v)}</span><div class="b" style="height:${Math.max(6, v / max * 100)}%;background:${['#2f6fed', '#1f9d63', '#e07840', '#8b5cf6'][i]}"></div><span class="lbl"><b>Week ${i + 1}</b>${['Nov 1–7', 'Nov 8–14', 'Nov 15–21', 'Nov 22–28'][i]}</span></div>`).join('') + `</div>`;
}

function renderDashboard() {
  const s = spent(), inc = income(), sv = saved();
  const prev = MONTHS[monthIdx - 1];
  const prevSpent = prev ? TX[prev.key].filter(t => t[4] === 'expense').reduce((a, t) => a + t[2], 0) : s;
  const diff = Math.round((s - prevSpent) / prevSpent * 100);
  const budgetTotal = Object.values(BUDGETS).reduce((a, b) => a + b, 0);
  const overCats = Object.keys(BUDGETS).filter(c => (catSpend()[c] || 0) > BUDGETS[c]);
  const topCat = Object.entries(catSpend()).sort((a, b) => b[1] - a[1])[0];
  return `
  <div class="page-head"><div><h1>Good evening, Alvarez family 👋</h1><p class="lede">Here's where ${month().label} stands — ${money0(sv)} saved so far, and ${overCats.length ? overCats.join(' & ') + ' over budget' : 'every category inside its budget'}.</p></div><span class="pill ${sv >= 1000 ? '' : 'warn'}">${sv >= 1000 ? '✓ On track to save $1,500' : '⚠ Savings pace is tight'}</span></div>
  <div class="cards">
    <div class="card"><h3>💰 Income</h3><div class="big">${money(inc)}</div><div class="sub">2 paydays · Maya + Jonas <span class="delta up">▲ 2.5% vs Oct</span></div></div>
    <div class="card"><h3>🛒 Spent</h3><div class="big">${money(s)}</div><div class="sub">of ${money0(budgetTotal)} planned <span class="delta ${diff <= 0 ? 'up' : 'down'}">${diff <= 0 ? '▼' : '▲'} ${Math.abs(diff)}% vs ${prev ? prev.label.split(' ')[0] : ''}</span></div></div>
    <div class="card accent"><h3>🐷 Saved this month</h3><div class="big">${money(sv)}</div><div class="sub">${sv >= 1500 ? `✓ Target beaten by ${money0(sv - 1500)}!` : `Target $1,500 · ${Math.round(sv / 1500 * 100)}% reached · ${money0(1500 - sv)} to go`}</div></div>
    <div class="card"><h3>🏦 Total savings</h3><div class="big">$16,950</div><div class="sub">Across 5 goals · <span class="delta up">▲ ${money0(sv)} this month</span></div></div>
  </div>
  <div class="grid2">
    <div class="panel"><div class="panel-head"><h2>Where the money went</h2><a href="#/reports">Full report →</a></div><p class="hint">Spending by category, ${month().label} · biggest: ${topCat[0]} at ${money0(topCat[1])}</p><div class="donut-wrap">${donutSVG()}<div style="flex:1">${legendHTML()}</div></div></div>
    <div class="panel"><div class="panel-head"><h2>Budget vs actual</h2><a href="#/transactions">All transactions →</a></div><p class="hint">${overCats.length ? '⚠ ' + overCats.join(', ') + ' over budget — pull back on ' + overCats[0] + ' this week.' : 'Every category is inside its budget. Nice work.'}</p>${catBarsHTML()}</div>
  </div>
  <div class="grid2">
    <div class="panel"><div class="panel-head"><h2>Recent transactions</h2><a href="#/transactions">See all ${txs().length} →</a></div>${txTable([...txs()].sort((a, b) => b.date.localeCompare(a.date)), 7)}</div>
    <div>
      <div class="panel" style="margin-bottom:12px"><div class="panel-head"><h2>Upcoming bills</h2><a href="#/bills">All bills →</a></div>${billsHTML().split('</p>')[0] + '</p>' + BILLS.slice(0, 4).map(b => { const paid = b.status === 'paid' || paidBills.has(b.name); return `<div class="bill"><div><b>${b.name}</b><small>${b.note}</small></div><div style="display:flex;gap:10px;align-items:center"><span class="due ${paid ? 'paid' : b.status === 'soon' ? 'soon' : 'ok'}">${paid ? '✓ Paid' : 'Due ' + b.due}</span><span class="amt">${money(b.amt)}</span></div></div>`; }).join('')}</div>
      <div class="panel"><div class="panel-head"><h2>Savings goals</h2><a href="#/goals">All goals →</a></div>${goalsHTML(false, 2)}</div>
    </div>
  </div>
  <div class="insights">
    <div class="insight green"><b>💡 Groceries are $46 under pace</b>Four Market Square trips averaged $180 — shopping the Tuesday deals saved about $46 vs October.</div>
    <div class="insight"><b>⚠️ Dining out is creeping up</b>$86 at Bistro Verde was the month's biggest meal out. One more dinner out puts Dining $14 over its $220 budget.</div>
    <div class="insight blue"><b>🎯 Holiday fund hits 77%</b>$1,840 of $2,400 saved. Keep the $320 monthly transfer and the cottage is booked by July.</div>
  </div>`;
}

function renderTransactions() {
  let list = [...txs()].sort((a, b) => b.date.localeCompare(a.date));
  if (catFilter !== 'All') list = list.filter(t => t.cat === catFilter || (catFilter === 'Income' && t.kind === 'income'));
  if (query) { const q = query.toLowerCase(); list = list.filter(t => (t.desc + ' ' + t.cat).toLowerCase().includes(q)); }
  const cats = ['All', 'Income', ...Object.keys(BUDGETS)];
  return `<div class="page-head"><div><h1>Transactions</h1><p class="lede">${list.length} of ${txs().length} shown · ${month().label} · click ✕ to delete, or add a new one above.</p></div><span class="pill">Spent ${money(spent())} · Income ${money(income())}</span></div>
  <div class="panel"><div class="chips">${cats.map(c => `<button class="chip ${catFilter === c ? 'active' : ''}" data-cat="${c}">${c}</button>`).join('')}</div>${txTable(list)}</div>
  <div class="panel"><h2>Spending by week</h2><p class="hint">Weekly totals for ${month().label.split(' ')[0]} — spending is heaviest in week 1, when rent lands.</p>${weeklyHTML()}</div>`;
}

function renderBills() {
  return `<div class="page-head"><div><h1>Bills &amp; due dates</h1><p class="lede">Everything the household owes in December, in one place. Mark a bill paid and the totals update.</p></div><span class="pill warn">Next due: Rent, Dec 2 · $1,450</span></div>
  <div class="grid2"><div class="panel"><h2>December bills</h2>${billsHTML()}</div>
  <div><div class="panel" style="margin-bottom:12px"><h2>Auto-pay</h2><p class="hint">4 bills pay themselves on their due date. Rent, internet, bus passes and streaming are covered.</p>
  <div class="weekly"><div><b>4</b><span>auto-pay on</span></div><div><b>$1,645</b><span>auto-pay total</span></div><div><b>Dec 2</b><span>next auto-pay</span></div><div><b>$0</b><span>late fees in 2026</span></div></div></div>
  <div class="panel"><h2>Paid in ${month().label.split(' ')[0]}</h2><p class="hint">Already settled this month — $1,450 rent, $96.40 electricity, $59 internet, $120 bus passes, $15.99 streaming.</p><div class="cat-row"><span>On time</span><div class="cat-track"><span style="width:100%;background:#1f9d63"></span></div><span class="amt">5 / 5</span></div><div class="cat-row"><span>Auto-pay</span><div class="cat-track"><span style="width:80%;background:#2f6fed"></span></div><span class="amt">4 / 5</span></div></div></div></div>`;
}

function renderGoals() {
  const totalSaved = GOALS.reduce((a, g) => a + g.saved, 0), totalTarget = GOALS.reduce((a, g) => a + g.target, 0);
  return `<div class="page-head"><div><h1>Savings goals</h1><p class="lede">${money0(totalSaved)} saved toward ${money0(totalTarget)} across ${GOALS.length} goals — ${Math.round(totalSaved / totalTarget * 100)}% of the way there.</p></div><span class="pill">Next milestone: Holiday fund, $560 to go</span></div>
  <div class="cards"><div class="card"><h3>🎯 Total saved</h3><div class="big">${money0(totalSaved)}</div><div class="sub">Across all goals</div></div>
  <div class="card"><h3>📈 This year</h3><div class="big">+$6,420</div><div class="sub">Saved in 2026 so far</div></div>
  <div class="card"><h3>⏱️ Monthly transfers</h3><div class="big">$790</div><div class="sub">Auto-transfers on payday</div></div>
  <div class="card accent"><h3>🏆 Closest goal</h3><div class="big">77%</div><div class="sub">Summer holiday fund</div></div></div>
  <div class="panel"><h2>All goals</h2><p class="hint">Tap “+ Add $50” to move money into a goal — the totals and progress bars update right away.</p>${goalsHTML(true)}</div>`;
}

function renderReports() {
  const rows = MONTHS.map(m => { const ex = TX[m.key].filter(t => t[4] === 'expense').reduce((a, t) => a + t[2], 0); const inc = TX[m.key].filter(t => t[4] === 'income').reduce((a, t) => a + t[2], 0); return { m, ex, inc, sv: inc - ex }; });
  const max = Math.max(...rows.map(r => r.ex));
  return `<div class="page-head"><div><h1>Reports</h1><p class="lede">Three months at a glance — spending is falling while income edges up. November is the best saving month yet.</p></div><span class="pill">Best month: November · ${money(rows[2].sv)} saved</span></div>
  <div class="panel"><h2>Income vs spending</h2><p class="hint">Green = income, blue = spending, per month.</p>
  ${rows.map(r => `<div class="cat-row"><span>${r.m.label.split(' ')[0]} 2026</span><div style="display:flex;gap:6px;height:18px"><div style="width:${Math.round(r.inc / 6000 * 100)}%;background:#1f9d63;border-radius:5px"></div><div style="width:${Math.round(r.ex / 6000 * 100)}%;background:#2f6fed;border-radius:5px;opacity:.85"></div></div><span class="amt">in ${money0(r.inc)} · out ${money0(r.ex)}</span></div>`).join('')}
  <div class="legend"><span><i style="background:#1f9d63"></i>Income</span><span><i style="background:#2f6fed"></i>Spending</span></div></div>
  <div class="grid3">
    <div class="panel"><h2>Top categories — 3 months</h2><p class="hint">Housing dominates, as it should. Groceries are #2.</p>${['Housing', 'Groceries', 'Utilities', 'Kids', 'Transport'].map(c => { const v = MONTHS.reduce((a, m) => a + (TX[m.key].filter(t => t[1] === c).reduce((x, t) => x + t[2], 0)), 0); return `<div class="cat-row"><span>${c}</span><div class="cat-track"><span style="width:${Math.min(100, v / 4500 * 100)}%;background:${CAT_COLORS[c]}"></span></div><span class="amt">${money0(v)}</span></div>`; }).join('')}</div>
    <div class="panel"><h2>Monthly savings</h2><p class="hint">Saved each month, after all spending.</p>${rows.map(r => `<div class="cat-row"><span>${r.m.label.split(' ')[0]}</span><div class="cat-track"><span style="width:${Math.round(r.sv / 1500 * 100)}%;background:#1f9d63"></span></div><span class="amt">${money0(r.sv)}</span></div>`).join('')}<p class="hint" style="margin-top:10px">Average saved: <b>${money0(rows.reduce((a, r) => a + r.sv, 0) / 3)} / month</b> · 6-month streak and counting.</p></div>
    <div class="panel"><h2>Household snapshot</h2><p class="hint">The Alvarez family, November 2026.</p>
    <div class="weekly" style="grid-template-columns:repeat(2,1fr)"><div><b>4</b><span>family members</span></div><div><b>18</b><span>transactions</span></div><div><b>$3,950</b><span>planned budget</span></div><div><b>79%</b><span>of savings target</span></div></div>
    <p class="hint" style="margin-top:12px">Biggest single expense: rent, $1,450. Smallest: streaming, $15.99. Most frequent: groceries, 5 trips.</p></div>
  </div>`;
}

function render() {
  const app = $('#app');
  app.innerHTML = { dashboard: renderDashboard, transactions: renderTransactions, bills: renderBills, goals: renderGoals, reports: renderReports }[view]();
  $$('#nav a').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  $('#month-label').textContent = month().label;
  $('#month-sub').textContent = month().sub;
  $('#prev-month').disabled = monthIdx === 0;
  $('#next-month').disabled = monthIdx === MONTHS.length - 1;
  $('#side-saved').textContent = money0(Math.max(0, saved()));
  $('#side-saved-bar').style.width = Math.min(100, Math.max(0, saved() / 1500 * 100)) + '%';
  document.title = 'NestEgg — ' + view[0].toUpperCase() + view.slice(1) + ' · ' + month().label;
}

function route() {
  const h = location.hash.replace('#/', '') || 'dashboard';
  view = ['dashboard', 'transactions', 'bills', 'goals', 'reports'].includes(h) ? h : 'dashboard';
  render();
}

document.addEventListener('click', e => {
  const cat = e.target.closest('[data-cat]'); if (cat) { catFilter = cat.dataset.cat; if (view !== 'transactions') { location.hash = '#/transactions'; } render(); return; }
  const del = e.target.closest('[data-del]'); if (del) { const [k, i] = del.dataset.del.split('-').length ? [del.dataset.del.slice(0, 7), +del.dataset.del.slice(8)] : []; TX[k].splice(i, 1); persist(); toast('Transaction deleted'); render(); return; }
  const pay = e.target.closest('[data-pay]'); if (pay) { paidBills.add(pay.dataset.pay); persist(); toast(pay.dataset.pay + ' marked paid ✓'); render(); return; }
  const g50 = e.target.closest('[data-add-goal]'); if (g50) { GOALS[+g50.dataset.addGoal].saved += 50; persist(); toast('+$50 added to ' + GOALS[+g50.dataset.addGoal].name.slice(2)); render(); return; }
  const g100 = e.target.closest('[data-add-goal100]'); if (g100) { GOALS[+g100.dataset.addGoal100].saved += 100; persist(); toast('+$100 added to ' + GOALS[+g100.dataset.addGoal100].name.slice(2)); render(); return; }
});
$('#prev-month').addEventListener('click', () => { if (monthIdx > 0) { monthIdx--; render(); } });
$('#next-month').addEventListener('click', () => { if (monthIdx < MONTHS.length - 1) { monthIdx++; render(); } });
$('#search').addEventListener('input', e => { query = e.target.value.trim(); if (view !== 'transactions') { location.hash = '#/transactions'; } else render(); });
$('#add-btn').addEventListener('click', () => { $('#modal').hidden = false; });
$('#cancel-add').addEventListener('click', () => { $('#modal').hidden = true; });
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') $('#modal').hidden = true; });
$('#add-form').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const desc = String(f.get('desc')).trim(), amt = parseFloat(f.get('amount')), kind = f.get('kind'), cat = kind === 'income' ? 'Income' : f.get('cat'), date = f.get('date') || month().key + '-27';
  if (!desc || !amt || amt <= 0) return;
  TX[month().key].push([desc, cat, amt, date, kind]);
  persist();
  $('#modal').hidden = true; e.target.reset();
  $('#add-note').textContent = '';
  toast((kind === 'income' ? 'Income' : 'Expense') + ' of ' + money(amt) + ' added ✓');
  if (view !== 'transactions') location.hash = '#/transactions'; else render();
});
$('#export-btn').addEventListener('click', () => {
  const rows = [['date', 'description', 'category', 'kind', 'amount'], ...txs().map(t => [t.date, '"' + t.desc.replace(/"/g, '""') + '"', t.cat, t.kind, t.amt.toFixed(2)])];
  const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nestegg-' + month().key + '.csv'; a.click();
  toast('Exported ' + txs().length + ' transactions as CSV ✓');
});
window.addEventListener('hashchange', route);
route();
