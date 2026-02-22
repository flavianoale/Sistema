const DB_NAME = 'ascensao_os_db_v1';
const DB_STORE = 'logs';
let db;

const RANKS = ['Recruta', 'Soldado', 'Veterano', 'Elite', 'Lenda'];
const TABS = ['AGORA', 'ROTINA', 'TREINO', 'DIETA', 'ESTUDOS', 'ESPIRITUALIDADE', 'SOCIAL', 'OPERACIONAL', 'FINANÇAS', 'RELATÓRIOS', 'CONFIG'];

const defaultState = {
  player: { nome: 'Flaviano', nivel: 1, xp: 0, integridade: 85, streak: 0, debitos: 0, bonus: 0, rank: 'Recruta', campaignDay: 1 },
  profile: { peso: 86, altura: 171, bf: 25, objetivo: 'cutting', treinoDias: 5, agressivo: false },
  config: {
    mode: 'iniciante', volume: 0.45, sounds: true, vibro: true, ambient: false, notifications: false,
    janelas: [
      { ini: '04:30', fim: '07:20', aba: 'ROTINA', missao: 'Água + arrumar cama + oração 3 min' },
      { ini: '07:30', fim: '12:00', aba: 'ESTUDOS', missao: 'Aula focada: registrar 3 pontos-chave' },
      { ini: '12:10', fim: '14:00', aba: 'DIETA', missao: 'Almoço aderente + hidratação' },
      { ini: '14:00', fim: '17:30', aba: 'OPERACIONAL', missao: 'Campo/casa: tarefa crítica' },
      { ini: '17:30', fim: '20:00', aba: 'TREINO', missao: 'Treino + log mínimo completo' },
      { ini: '20:00', fim: '21:30', aba: 'ESPIRITUALIDADE', missao: 'Bíblia + oração + revisão curta' },
      { ini: '21:30', fim: '23:30', aba: 'ROTINA', missao: 'DESLIGAR. DORMIR.' }
    ],
    xp: { missao: 20, skipPenalty: 5, treino: 40, dieta: 30, estudo: 35, espiritualidade: 25, social: 30 }
  },
  rotina: {
    manha: [
      { n: 'Beber 500ml de água', dur: 2, xp: 8 }, { n: 'Arrumar cama', dur: 3, xp: 7 }, { n: 'Higiene + skincare AM', dur: 8, xp: 10 },
      { n: 'Oração 3 min', dur: 3, xp: 8 }, { n: 'Planejamento do dia', dur: 3, xp: 7 }
    ],
    noite: [
      { n: 'Higiene + skincare PM', dur: 10, xp: 10 }, { n: 'Exame do dia + oração', dur: 6, xp: 9 }, { n: 'Preparar roupa/lanche', dur: 7, xp: 8 },
      { n: 'Desligar telas', dur: 1, xp: 7 }
    ]
  },
  dieta: {
    metas: { kcal: 2150, prot: 170, carb: 210, gord: 65, fibra: 30, agua: 3.5 },
    consumido: { kcal: 0, prot: 0, carb: 0, gord: 0, fibra: 0, agua: 0 },
    bibliotecaAtiva: 'casa',
    refeicoes: {
      cafe: [
        { nome: 'Ovos + banana + aveia', itens: '3 ovos (150g), banana (120g), aveia (40g)', kcal: 520, prot: 30, carb: 48, gord: 22 },
        { nome: 'Iogurte + granola + whey', itens: 'Iogurte (200g), granola (40g), whey (30g)', kcal: 470, prot: 38, carb: 46, gord: 14 },
        { nome: 'Tapioca + frango', itens: 'Tapioca (80g), frango (120g)', kcal: 430, prot: 34, carb: 52, gord: 8 }
      ],
      almoco: [
        { nome: 'Arroz + feijão + frango', itens: 'Arroz (180g), feijão (120g), frango (180g), salada', kcal: 700, prot: 56, carb: 78, gord: 17 },
        { nome: 'Macarrão + carne magra', itens: 'Macarrão (180g), patinho (170g), legumes', kcal: 680, prot: 49, carb: 74, gord: 19 },
        { nome: 'Batata + peixe', itens: 'Batata (280g), tilápia (200g), salada', kcal: 620, prot: 52, carb: 64, gord: 13 }
      ],
      janta: [
        { nome: 'Omelete + arroz', itens: 'Omelete (4 ovos), arroz (120g), legumes', kcal: 610, prot: 42, carb: 38, gord: 31 },
        { nome: 'Frango + cuscuz', itens: 'Frango (180g), cuscuz (140g), salada', kcal: 560, prot: 48, carb: 46, gord: 14 },
        { nome: 'Carne + mandioca', itens: 'Patinho (180g), mandioca (220g), salada', kcal: 630, prot: 50, carb: 58, gord: 18 }
      ],
      ceia: [
        { nome: 'Iogurte + fruta', itens: 'Iogurte (170g), maçã (130g)', kcal: 230, prot: 14, carb: 32, gord: 5 },
        { nome: 'Cottage + morango', itens: 'Cottage (160g), morango (100g)', kcal: 210, prot: 22, carb: 12, gord: 8 },
        { nome: 'Whey + pasta amendoim', itens: 'Whey (30g), pasta (15g)', kcal: 220, prot: 26, carb: 6, gord: 9 }
      ]
    }
  },
  treino: {
    biblioteca: 'casa', split: 5,
    sessoes: {
      casa: ['Push + Core', 'Pull', 'Lower', 'Upper', 'Full Body'],
      academia: ['Peito/Tríceps', 'Costas/Bíceps', 'Pernas', 'Ombros', 'Upper', 'Lower']
    },
    log: []
  },
  estudos: {
    materias: ['Bioquímica Vegetal', 'Estatística', 'Suinocultura/Ovinocultura/Caprinocultura', 'Climatologia/Agrometeorologia', 'Desenho Técnico', 'Entomologia Agrícola', 'Física do Solo', 'Química Orgânica'],
    logs: []
  },
  espiritualidade: { plano: '90 dias', progresso: 0, livro: 'Mateus 1', check: { oracao: false, biblia: false, terco: false, missa: false } },
  social: { logs: [] },
  operacional: { tasks: [{ nome: 'Tarefa crítica da fazenda', done: false }, { nome: 'Casa: 20 min organização', done: false }] },
  financas: { movimentos: [] },
  relatorios: []
};

let state = loadState();
let currentTab = 'AGORA';

function loadState() {
  const raw = localStorage.getItem('ascensao_state_v1');
  if (!raw) return structuredClone(defaultState);
  try { return { ...structuredClone(defaultState), ...JSON.parse(raw) }; }
  catch { return structuredClone(defaultState); }
}
function saveState() { localStorage.setItem('ascensao_state_v1', JSON.stringify(state)); }

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE, { keyPath: 'id', autoIncrement: true });
    req.onsuccess = () => { db = req.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}
function addLog(entry) {
  if (!db) return;
  const tx = db.transaction(DB_STORE, 'readwrite');
  tx.objectStore(DB_STORE).add({ ...entry, t: new Date().toISOString() });
}

function rankFromLevel(level) {
  if (level >= 50) return RANKS[4];
  if (level >= 30) return RANKS[3];
  if (level >= 15) return RANKS[2];
  if (level >= 5) return RANKS[1];
  return RANKS[0];
}
function gainXP(points, reason) {
  state.player.xp += points;
  while (state.player.xp >= state.player.nivel * 100) {
    state.player.xp -= state.player.nivel * 100;
    state.player.nivel += 1;
  }
  state.player.rank = rankFromLevel(state.player.nivel);
  state.player.integridade = Math.min(100, state.player.integridade + 1);
  addLog({ type: 'xp', reason, points });
  feedback(`+${points} XP // ${reason}`);
}
function penalty(points, reason) {
  state.player.integridade = Math.max(0, state.player.integridade - points);
  state.player.debitos += 1;
  addLog({ type: 'penalty', reason, points });
  feedback(`-${points} Integridade // ${reason}`, true);
}

function playTone(freq=440, dur=0.08, type='square') {
  if (!state.config.sounds) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator(); const gain = ctx.createGain();
  osc.type = type; osc.frequency.value = freq; gain.gain.value = state.config.volume;
  osc.connect(gain); gain.connect(ctx.destination); osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.stop(ctx.currentTime + dur);
}
function vibrate(ms=80){ if (state.config.vibro && navigator.vibrate) navigator.vibrate(ms); }
function feedback(msg, bad=false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = bad ? 'var(--danger)' : 'var(--line)';
  t.classList.add('show');
  if (bad) playTone(160, .12, 'sawtooth'); else playTone(640, .08, 'square');
  vibrate(bad ? 180 : 60);
  setTimeout(() => t.classList.remove('show'), 1400);
}

function nowWindow() {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  const found = state.config.janelas.find(j => {
    const [hi, mi] = j.ini.split(':').map(Number);
    const [hf, mf] = j.fim.split(':').map(Number);
    const a = hi * 60 + mi, b = hf * 60 + mf;
    return m >= a && m <= b;
  });
  return found || { aba: 'AGORA', missao: 'Execução mínima: água + foco 5 min', ini: '--', fim: '--' };
}

function renderHUD() {
  const p = state.player;
  document.getElementById('playerHud').innerHTML = `
    <div class="row">
      <span class="kpi">Nível ${p.nivel}</span><span class="kpi">XP ${p.xp}/${p.nivel*100}</span>
      <span class="kpi">Rank ${p.rank}</span><span class="kpi">Integridade ${p.integridade}</span>
      <span class="kpi">Streak ${p.streak}</span><span class="kpi">Dia ${p.campaignDay}/90</span>
    </div>`;
}

function renderTabs() {
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = TABS.map(t => `<button class="tab-btn ${currentTab===t?'active':''}" data-tab="${t}">${t}</button>`).join('');
  tabs.querySelectorAll('button').forEach(b => b.onclick = () => { currentTab = b.dataset.tab; render(); });
}

function autoSelectTab() {
  const w = nowWindow();
  document.getElementById('currentWindow').textContent = `Janela ${w.ini}–${w.fim} → ${w.aba}`;
  if (w.missao.includes('DORMIR')) document.getElementById('missionCard').innerHTML = `<p class="alert">${w.missao} Ignorar custa Integridade.</p>`;
  else document.getElementById('missionCard').innerHTML = `<p>${w.missao}</p>`;
  if (currentTab === 'AGORA') currentTab = w.aba;
}

function rotinaSection() {
  const renderItems = (arr, chave) => arr.map((i, idx) => `<div class="card"><b>${i.n}</b><br/><small>${i.dur} min • XP ${i.xp}</small><div><button class="btn" onclick="window.doneRoutine('${chave}',${idx})">Feito</button></div></div>`).join('');
  return `<h3>ROTINA</h3><div class="card"><b>Manhã</b>${renderItems(state.rotina.manha,'manha')}</div><div class="card"><b>Noite</b>${renderItems(state.rotina.noite,'noite')}</div>`;
}
window.doneRoutine = (k, i) => { gainXP(state.rotina[k][i].xp, `Rotina: ${state.rotina[k][i].n}`); saveState(); renderHUD(); };

function dietaCalc() {
  const p = state.profile;
  const lbm = p.peso * (1 - p.bf / 100);
  const tdee = (370 + 21.6 * lbm) * 1.5;
  const target = p.objetivo.includes('cutting') ? tdee - (p.agressivo ? 700 : 450) : tdee;
  state.dieta.metas.kcal = Math.round(Math.max(1400, target));
  state.dieta.metas.prot = Math.round(p.peso * 2);
  state.dieta.metas.gord = Math.round(p.peso * 0.75);
  state.dieta.metas.carb = Math.round((state.dieta.metas.kcal - state.dieta.metas.prot*4 - state.dieta.metas.gord*9)/4);
}
function dietaSection() {
  dietaCalc();
  const metas = state.dieta.metas, c = state.dieta.consumido;
  const refeicaoUI = Object.entries(state.dieta.refeicoes).map(([k, ops]) => `<div class="card"><b>${k.toUpperCase()}</b>${ops.map((o,ix)=>`<div class="card"><b>${o.nome}</b><small>${o.itens}</small><div><small>${o.kcal}kcal P${o.prot} C${o.carb} G${o.gord}</small></div><button class="btn" onclick="window.logMeal('${k}',${ix})">Registrar refeição</button></div>`).join('')}</div>`).join('');
  return `<h3>DIETA</h3><div class="card">Meta: ${metas.kcal} kcal • P ${metas.prot} • C ${metas.carb} • G ${metas.gord}<br/>Consumido: ${c.kcal} kcal • Aderência ${Math.min(100, Math.round((c.kcal/metas.kcal)*100))}%<div class="progress-wrap"><div class="progress-bar" style="width:${Math.min(100, (c.kcal/metas.kcal)*100)}%"></div></div><small>Protocolo craving 5 min: 500ml água, 30 respirações, lanche de contenção (iogurte + fruta).</small></div>${refeicaoUI}`;
}
window.logMeal = (meal, idx) => {
  const m = state.dieta.refeicoes[meal][idx], c = state.dieta.consumido;
  ['kcal','prot','carb','gord'].forEach(k => c[k] += m[k]);
  gainXP(12, `Dieta: ${meal} ${m.nome}`); addLog({ type:'meal', meal, m }); saveState(); render();
};

function treinoSection() {
  const base = state.treino.sessoes[state.treino.biblioteca].slice(0, state.treino.split);
  return `<h3>TREINO</h3><div class="card">Biblioteca: ${state.treino.biblioteca} | Split ${state.treino.split} dias.<div class="row"><button class="btn" onclick="window.toggleGym()">Trocar Casa/Academia</button></div></div>${base.map((s,i)=>`<div class="card"><b>Dia ${i+1}: ${s}</b><br/><small>Template: 4 exercícios, 3-4 sets, 6-12 reps, RIR 1-3</small><div class="row"><input id="load${i}" type="number" min="0" max="500" placeholder="Carga kg"/><input id="reps${i}" type="number" min="1" max="60" placeholder="Reps"/><button class="btn" onclick="window.logTrain('${s}',${i})">Registrar</button></div></div>`).join('')}<div class="card"><b>Posing/Tanning semanal</b><button class="btn" onclick="window.weekTask('posing')">Posing feito</button> <button class="btn" onclick="window.weekTask('tanning')">Tanning feito</button></div><div class="card"><small>Dor/lesão: reduza carga, foque técnica, mobilidade e procure fisioterapeuta se dor persistente.</small></div>`;
}
window.toggleGym = () => { state.treino.biblioteca = state.treino.biblioteca === 'casa' ? 'academia' : 'casa'; saveState(); render(); };
window.logTrain = (name, i) => {
  const load = Number(document.getElementById(`load${i}`).value || 0);
  const reps = Number(document.getElementById(`reps${i}`).value || 0);
  if (reps < 1) return feedback('Log mínimo obrigatório: reps', true);
  state.treino.log.push({ name, load, reps, d: new Date().toISOString().slice(0,10) });
  gainXP(state.config.xp.treino, `Treino ${name}`); saveState(); renderHUD();
};
window.weekTask = (kind) => { gainXP(20, `Weekly ${kind}`); saveState(); };

function estudosSection() {
  const mOpts = state.estudos.materias.map(m => `<option>${m}</option>`).join('');
  return `<h3>ESTUDOS</h3><div class="card"><b>Rotação:</b> 2 matérias/dia pós-aula + revisão do dia anterior.</div><div class="card"><div class="row"><select id="materia">${mOpts}</select><select id="tipo"><option>Aula</option><option>Estudo ativo</option><option>Revisão</option></select><input id="mins" type="number" min="5" max="240" placeholder="min"/><button class="btn" onclick="window.logStudy()">Registrar estudo</button></div><div class="row"><input id="p1" placeholder="Ponto 1"/><input id="p2" placeholder="Ponto 2"/><input id="p3" placeholder="Ponto 3"/></div></div>${state.estudos.logs.slice(-6).map(l=>`<div class="card"><small>${l.d}</small><br/>${l.materia} • ${l.tipo} • ${l.mins} min</div>`).join('')}`;
}
window.logStudy = () => {
  const materia = document.getElementById('materia').value;
  const tipo = document.getElementById('tipo').value;
  const mins = Number(document.getElementById('mins').value || 0);
  if (mins < 10) return feedback('Log mínimo obrigatório: >=10 min', true);
  state.estudos.logs.push({ materia, tipo, mins, pontos: [p1.value,p2.value,p3.value], d: new Date().toISOString().slice(0,10) });
  gainXP(state.config.xp.estudo, `${tipo}: ${materia}`); saveState(); render();
};

function espiritualidadeSection() {
  const e = state.espiritualidade;
  return `<h3>ESPIRITUALIDADE</h3><div class="card">Plano bíblico: ${e.plano} | Atual: ${e.livro} | Progresso ${e.progresso}%
  <div class="progress-wrap"><div class="progress-bar" style="width:${e.progresso}%"></div></div>
  <div class="row"><button class="btn" onclick="window.spCheck('oracao')">Oração diária</button><button class="btn" onclick="window.spCheck('biblia')">Leitura bíblica</button><button class="btn" onclick="window.spCheck('terco')">Terço</button><button class="btn" onclick="window.spCheck('missa')">Missa</button></div>
  <small>Sem promessas clínicas. Se sofrimento mental persistente, procure psicólogo/médico.</small></div>`;
}
window.spCheck = (k) => { state.espiritualidade.check[k] = true; state.espiritualidade.progresso = Math.min(100, state.espiritualidade.progresso + 1); gainXP(state.config.xp.espiritualidade, `Espiritualidade: ${k}`); saveState(); render(); };

function socialSection() {
  return `<h3>SOCIAL</h3><div class="card"><div class="row"><input id="socialNote" placeholder="Micro interação"/><button class="btn" onclick="window.logSocial()">Registrar +XP alto</button></div></div>${state.social.logs.slice(-8).map(s=>`<div class="card">${s.note}<br/><small>${s.d}</small></div>`).join('')}`;
}
window.logSocial = () => { const note = document.getElementById('socialNote').value.trim(); if (!note) return feedback('Nota curta obrigatória', true); state.social.logs.push({ note, d: new Date().toISOString() }); gainXP(state.config.xp.social, 'Missão social'); saveState(); render(); };

function operacionalSection() {
  return `<h3>OPERACIONAL</h3>${state.operacional.tasks.map((t,i)=>`<div class="card"><input type="checkbox" ${t.done?'checked':''} onchange="window.toggleTask(${i})"/> ${t.nome}</div>`).join('')}<div class="card"><input id="newTask" placeholder="Nova tarefa"/><button class="btn" onclick="window.addTask()">Adicionar</button></div>`;
}
window.toggleTask = (i) => { state.operacional.tasks[i].done = !state.operacional.tasks[i].done; if (state.operacional.tasks[i].done) gainXP(15, 'Operacional'); saveState(); render(); };
window.addTask = () => { const n = newTask.value.trim(); if (!n) return; state.operacional.tasks.push({ nome:n, done:false }); saveState(); render(); };

function financasSection() {
  const total = state.financas.movimentos.reduce((a,m)=>a + (m.tipo==='receita'?m.valor:-m.valor),0);
  return `<h3>FINANÇAS</h3><div class="card">Saldo projeto: R$ ${total.toFixed(2)}</div><div class="card"><div class="row"><select id="ftipo"><option value="gasto">Gasto</option><option value="receita">Receita</option></select><input id="fcat" placeholder="Categoria"/><input id="fvalor" type="number" step="0.01" placeholder="Valor"/><button class="btn" onclick="window.addMov()">Registrar</button></div><button class="btn" onclick="window.exportFin()">Exportar CSV</button></div>${state.financas.movimentos.slice(-10).map(m=>`<div class="card">${m.tipo} ${m.categoria} R$ ${m.valor.toFixed(2)}</div>`).join('')}`;
}
window.addMov = () => { const tipo = ftipo.value, categoria = fcat.value.trim(), valor = Number(fvalor.value||0); if (!categoria||valor<=0) return feedback('Categoria e valor obrigatórios', true); state.financas.movimentos.push({tipo,categoria,valor,d:new Date().toISOString().slice(0,10)}); saveState(); render(); };
window.exportFin = () => {
  const lines = ['tipo,categoria,valor,data', ...state.financas.movimentos.map(m=>`${m.tipo},${m.categoria},${m.valor},${m.d}`)];
  downloadFile('financas.csv', lines.join('\n'), 'text/csv');
};

function reportText() {
  const d = new Date().toISOString().slice(0,10);
  const p = state.player;
  return `ASCENSÃO OS – Relatório ${d}\nCampanha dia ${p.campaignDay}/90\nNível ${p.nivel} | XP ${p.xp} | Rank ${p.rank}\nIntegridade ${p.integridade} | Streak ${p.streak}\nTreinos: ${state.treino.log.length} logs\nDieta: ${state.dieta.consumido.kcal}/${state.dieta.metas.kcal} kcal\nEstudos: ${state.estudos.logs.reduce((a,l)=>a+l.mins,0)} min\nEspiritualidade: oração ${state.espiritualidade.check.oracao?'OK':'PEND'} / bíblia ${state.espiritualidade.check.biblia?'OK':'PEND'}\nRecomendação: manter execução mínima com logs reais.`;
}
function relatoriosSection() {
  return `<h3>RELATÓRIOS</h3><div class="card"><pre>${reportText()}</pre><div class="row"><button class="btn" onclick="window.copyReport()">Copiar</button><button class="btn" onclick="window.downReportTxt()">Baixar .txt</button><button class="btn" onclick="window.downState()">Baixar .json</button></div></div>`;
}
window.copyReport = async () => { await navigator.clipboard.writeText(reportText()); feedback('Relatório copiado'); };
window.downReportTxt = () => downloadFile(`relatorio-${new Date().toISOString().slice(0,10)}.txt`, reportText(), 'text/plain');
window.downState = () => downloadFile('ascensao-backup.json', JSON.stringify(state,null,2), 'application/json');

function configSection() {
  const jrows = state.config.janelas.map((j,i)=>`<div class="row"><input id="ji${i}" value="${j.ini}"/><input id="jf${i}" value="${j.fim}"/><select id="ja${i}">${TABS.map(t=>`<option ${t===j.aba?'selected':''}>${t}</option>`)}</select><input id="jm${i}" value="${j.missao}"/></div>`).join('');
  return `<h3>CONFIG</h3>
  <div class="card"><b>Perfil</b><div class="row"><input id="cpeso" type="number" value="${state.profile.peso}"/><input id="calt" type="number" value="${state.profile.altura}"/><input id="cbf" type="number" value="${state.profile.bf}"/><select id="cobj"><option value="cutting" ${state.profile.objetivo==='cutting'?'selected':''}>cutting</option><option value="recomp">recomp</option></select><label><input id="cagr" type="checkbox" ${state.profile.agressivo?'checked':''}/> cutting agressivo</label></div></div>
  <div class="card"><b>Janelas do dia</b>${jrows}<button class="btn" onclick="window.saveConfig()">Salvar config</button> <button class="btn" onclick="window.exportConfig()">Exportar config</button> <input id="importConfig" type="file" accept="application/json"/></div>
  <div class="card"><b>Sons/vibração</b><label><input id="csound" type="checkbox" ${state.config.sounds?'checked':''}/> Som</label><label><input id="cvib" type="checkbox" ${state.config.vibro?'checked':''}/> Vibração</label><input id="cvol" type="range" min="0" max="1" step="0.05" value="${state.config.volume}"/></div>
  <div class="card"><button class="btn btn-danger" onclick="window.resetAll()">Reset total</button></div>
  <div class="card"><small>Aviso: este app não substitui médico, nutricionista, psicólogo, fisioterapeuta ou dermatologista. Procure profissional em dor persistente, sintomas importantes, sofrimento mental, distúrbio alimentar ou alterações hormonais.</small></div>`;
}
window.saveConfig = () => {
  state.profile.peso = Number(cpeso.value); state.profile.altura = Number(calt.value); state.profile.bf = Number(cbf.value); state.profile.objetivo = cobj.value; state.profile.agressivo = cagr.checked;
  state.config.sounds = csound.checked; state.config.vibro = cvib.checked; state.config.volume = Number(cvol.value);
  state.config.janelas = state.config.janelas.map((_,i)=>({ ini: document.getElementById(`ji${i}`).value, fim: document.getElementById(`jf${i}`).value, aba: document.getElementById(`ja${i}`).value, missao: document.getElementById(`jm${i}`).value }));
  saveState(); feedback('Config salva'); render();
};
window.exportConfig = () => downloadFile('ascensao-config.json', JSON.stringify({profile:state.profile, config:state.config, rotina:state.rotina},null,2), 'application/json');
window.resetAll = () => { state = structuredClone(defaultState); saveState(); render(); feedback('Reset total executado', true); };

document.addEventListener('change', e => {
  if (e.target.id === 'importConfig') {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { const j = JSON.parse(r.result); state.profile = j.profile||state.profile; state.config = j.config||state.config; state.rotina = j.rotina||state.rotina; saveState(); render(); feedback('Config importada'); } catch { feedback('JSON inválido', true);} };
    r.readAsText(f);
  }
});

function downloadFile(name, data, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type }));
  a.download = name; a.click();
}

function renderContent() {
  const map = {
    'AGORA': '<div class="card">Use os botões da missão atual no topo para execução rápida.</div>',
    'ROTINA': rotinaSection(),
    'TREINO': treinoSection(),
    'DIETA': dietaSection(),
    'ESTUDOS': estudosSection(),
    'ESPIRITUALIDADE': espiritualidadeSection(),
    'SOCIAL': socialSection(),
    'OPERACIONAL': operacionalSection(),
    'FINANÇAS': financasSection(),
    'RELATÓRIOS': relatoriosSection(),
    'CONFIG': configSection()
  };
  document.getElementById('tabContent').innerHTML = map[currentTab] || map.AGORA;
}

function render() {
  autoSelectTab();
  renderHUD();
  renderTabs();
  renderContent();
  saveState();
}

async function boot() {
  await openDb().catch(() => null);
  const log = document.getElementById('bootLog');
  const progress = document.getElementById('bootProgress');
  const lines = ['CHECKING_BIOMETRICS...', 'SYNCING_WITH_DATABASE...', 'ESTABLISHING_SECURE_CONNECTION...', 'VERIFYING_HABIT_ENGINE...', 'MISSION_MATRIX_ONLINE...'];
  let i = 0;
  const timer = setInterval(() => {
    if (i >= lines.length) {
      clearInterval(timer);
      const compat = Math.max(30, Math.min(100, state.player.integridade + state.player.streak));
      log.innerHTML += `\nJogador encontrado: ${state.player.nome}. Nível atual: ${state.player.nivel}. Compatibilidade: ${compat}%`;
      setTimeout(() => {
        document.getElementById('bootScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        playTone(800,.16,'triangle');
        render();
      }, 700);
      return;
    }
    log.innerHTML += `\n${lines[i++]}`;
    progress.style.width = `${(i/lines.length)*100}%`;
    playTone(300 + i*80, .06);
  }, 320);
}

document.getElementById('bootStart').onclick = () => boot();
document.getElementById('btnCompleteMission').onclick = () => { gainXP(state.config.xp.missao, 'Missão atual'); state.player.bonus += 1; saveState(); renderHUD(); };
document.getElementById('btnSkipMission').onclick = () => {
  const modal = document.getElementById('modal');
  document.getElementById('modalBody').innerHTML = '<p>Confirmar pulo? Toque novamente para validar penalidade anti-autoengano.</p><button id="confirmSkip" class="btn btn-danger">Confirmar pular</button>';
  modal.showModal();
  document.getElementById('confirmSkip').onclick = () => { penalty(state.config.xp.skipPenalty, 'Missão pulada'); modal.close(); renderHUD(); saveState(); };
};

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
