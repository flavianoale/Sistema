const TABS = ["AGORA","ROTINA","TREINO","DIETA","ESTUDOS","ESPIRITUALIDADE","SOCIAL","OPERACIONAL","FINANÇAS","RELATÓRIOS","CONFIG"];
const SUBJECTS = ["Bioquímica Vegetal","Estatística","Suinocultura/Ovinocultura/Caprinocultura","Climatologia e Agrometeorologia","Desenho Técnico","Entomologia Agrícola","Física do Solo","Química Orgânica"];
const DB_NAME = "ascensao_logs";
let db;

const defaultState = {
  profile: { nome:"Flaviano", peso:86, altura:171, bf:25, objetivo:"cutting", agressivo:false, treinoDias:5, split:"5", nivel:1, xp:0, rank:"Recruta", integridade:80, streak:0, bonus:0, debitos:0, diaProjeto:1 },
  config: {
    brutal:false, sounds:true, ambiente:false, volume:0.3, vibrate:true, notifications:false,
    windows:[
      {start:"04:30",end:"07:20",tab:"ROTINA",mission:"Água + Cama + Oração 3min"},
      {start:"07:30",end:"12:00",tab:"ESTUDOS",mission:"Aula focada + 3 pontos"},
      {start:"12:00",end:"14:00",tab:"DIETA",mission:"Almoço alinhado com macros"},
      {start:"14:00",end:"17:30",tab:"OPERACIONAL",mission:"Campo/casa: 1 tarefa essencial"},
      {start:"17:30",end:"19:30",tab:"TREINO",mission:"Treino completo + log mínimo"},
      {start:"19:30",end:"21:30",tab:"ESTUDOS",mission:"2 matérias + revisão"},
      {start:"21:30",end:"23:00",tab:"ESPIRITUALIDADE",mission:"Bíblia + oração final"},
      {start:"23:00",end:"04:30",tab:"ROTINA",mission:"DESLIGAR. DORMIR."}
    ]
  },
  daily: { date:new Date().toISOString().slice(0,10), water:0, sleepHours:0, steps:0, macros:{kcal:0,p:0,c:0,f:0}, tasks:{}, studyLogs:[], expenses:[], social:[], workout:[], reports:[] },
  routines: {
    manha:["Acordar","Água 500ml","Arrumar cama","Higiene","Skincare AM","Alongamento 5min","Oração","Planejamento 3min"],
    noite:["Higiene","Skincare PM","Exame do dia","Oração","Preparar roupa/lanche","Desligar telas"],
    post:["Resfriamento","Alongamento pós","Log de treino"],
    pele:["Limpeza","Hidratação","Protetor solar"],
    along:["Mobilidade quadril","Peitoral/ombros","Posterior"]
  },
  dieta: { kcal:2200,p:170,c:220,f:65,fibra:30,agua:3,library:"Casa", meals:{} },
  treino: { mode:"Casa", split:"5", sessions:{} },
  estudos: { plan365:false, subjects: SUBJECTS.map(s=>({nome:s,dominio:0,tarefas:[]})) },
  espiritual: { biblePlan:"90", diaBiblia:1, terco:false, missa:false, confissao:false },
  shop: { unlocked:["theme-default"] }
};

let state = load();

async function initDB() {
  return new Promise((resolve,reject)=>{
    const req = indexedDB.open(DB_NAME,1);
    req.onupgradeneeded = () => req.result.createObjectStore("logs", { keyPath:"id", autoIncrement:true });
    req.onsuccess = () => { db = req.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}

function logEvent(type,payload={}){
  if(!db) return;
  db.transaction("logs","readwrite").objectStore("logs").add({ ts:Date.now(), type, payload});
}

function load(){
  try { return { ...defaultState, ...JSON.parse(localStorage.getItem("ascensao_state")||"{}") }; }
  catch { return structuredClone(defaultState); }
}
function save(){ localStorage.setItem("ascensao_state", JSON.stringify(state)); renderHUD(); }

const $ = (s)=>document.querySelector(s);
const content = $("#content");

function beep(type="ok"){
  if(!state.config.sounds) return;
  const ctx = new (window.AudioContext||window.webkitAudioContext)();
  const o=ctx.createOscillator(), g=ctx.createGain(); o.connect(g); g.connect(ctx.destination);
  const map={ok:880,fail:220,alert:140,click:520}; o.frequency.value=map[type]||440; g.gain.value=state.config.volume;
  o.start(); o.stop(ctx.currentTime+0.08);
}
function vibrate(ms=35){ if(state.config.vibrate && navigator.vibrate) navigator.vibrate(ms); }

function toast(msg, xp=0){
  const el = $("#toast"); el.textContent = xp ? `${msg} +${xp}XP` : msg; el.style.display="block";
  setTimeout(()=>el.style.display="none", 1800);
  if(xp){
    state.profile.xp += xp; while(state.profile.xp >= state.profile.nivel*120){ state.profile.xp -= state.profile.nivel*120; state.profile.nivel++; }
    state.profile.rank = state.profile.nivel<5?"Recruta":state.profile.nivel<10?"Soldado":state.profile.nivel<20?"Veterano":state.profile.nivel<35?"Elite":"Lenda";
    const f=document.createElement("div"); f.className="xp-float"; f.textContent=`+${xp}XP`; f.style.left="40%"; f.style.top="65%"; document.body.appendChild(f); setTimeout(()=>f.remove(),1000);
  }
  save();
}

function todayReset(){
  const d = new Date().toISOString().slice(0,10);
  if(state.daily.date !== d){
    state.profile.diaProjeto++;
    state.daily = structuredClone(defaultState.daily); state.daily.date=d;
    save();
  }
}

function renderHUD(){
  $("#hud").innerHTML = [
    `Nível ${state.profile.nivel}`,
    `Rank ${state.profile.rank}`,
    `Integridade ${state.profile.integridade}`,
    `Streak ${state.profile.streak}`,
    `Débitos ${state.profile.debitos}`
  ].map(x=>`<span class='badge'>${x}</span>`).join("");
}

function buildTabs(active="AGORA"){
  const nav=$("#tabs");
  nav.innerHTML=TABS.map(t=>`<button data-tab='${t}' class='${t===active?"active":""}'>${t}</button>`).join("");
  nav.querySelectorAll("button").forEach(b=>b.onclick=()=>renderTab(b.dataset.tab));
}

function getCurrentWindow(){
  const now = new Date(); const min=now.getHours()*60+now.getMinutes();
  for (const w of state.config.windows){
    const [sh,sm]=w.start.split(":").map(Number); const [eh,em]=w.end.split(":").map(Number);
    const s=sh*60+sm, e=eh*60+em;
    if((s<=e && min>=s && min<e) || (s>e && (min>=s || min<e))) return w;
  }
  return state.config.windows[0];
}

function missionDone(key,xp=12,needsLog=true){
  if(needsLog && !state.daily.tasks[key]?.note){ toast("Log mínimo obrigatório",0); beep("fail"); return; }
  state.daily.tasks[key]={...(state.daily.tasks[key]||{}),done:true};
  state.profile.integridade=Math.min(100,state.profile.integridade+1); toast("Missão concluída",xp); beep("ok"); vibrate(); logEvent("mission_done",{key}); save(); renderTab("AGORA");
}
function missionSkip(key){
  state.profile.integridade=Math.max(0,state.profile.integridade-(state.config.brutal?4:2)); state.profile.debitos++; toast("Missão pulada: Integridade -",0); beep("alert");
  state.daily.tasks[key]={...(state.daily.tasks[key]||{}),skipped:true}; logEvent("mission_skip",{key}); save(); renderTab("AGORA");
}

function macroTargets(){
  const p=state.profile;
  const lbm = p.peso*(1-p.bf/100);
  const bmr = 370 + 21.6*lbm;
  const tdee = bmr*1.55;
  const deficit = p.objetivo.includes("agressivo")||p.agressivo ? 0.28 : p.objetivo==="cutting"?0.20:p.objetivo==="recomp"?0.1:0;
  const kcal = Math.round(tdee*(1-deficit));
  const prot = Math.round(p.peso*2);
  const fat = Math.round(p.peso*0.75);
  const carb = Math.round((kcal-prot*4-fat*9)/4);
  state.dieta = {...state.dieta,kcal,p:prot,f:fat,c:Math.max(80,carb)};
}

const mealLib = {
  Casa: {
    cafe:[{n:"Ovos+aveia+banana",g:"3 ovos, 60g aveia, 100g banana",k:540,p:30,c:62,f:20},{n:"Iogurte+whey+fruta",g:"250g iogurte, 30g whey, 120g mamão",k:420,p:40,c:42,f:9},{n:"Pão+queijo+ovo",g:"2 fatias pão, 40g queijo, 2 ovos",k:470,p:28,c:38,f:20}],
    almoco:[{n:"Arroz+feijão+frango",g:"180g arroz, 100g feijão, 180g frango",k:700,p:58,c:78,f:14},{n:"Macarrão+patinho",g:"220g macarrão, 160g patinho",k:740,p:48,c:83,f:18},{n:"Batata+ovos+salada",g:"300g batata, 4 ovos, salada",k:650,p:32,c:64,f:28}],
    janta:[{n:"Repetir almoço",g:"versão reduzida",k:560,p:42,c:56,f:16},{n:"Tilápia+mandioca",g:"180g tilápia, 250g mandioca",k:530,p:40,c:58,f:10},{n:"Frango+legumes+arroz",g:"160g frango, 140g arroz",k:510,p:45,c:46,f:11}],
    ceia:[{n:"Cottage+fruta",g:"150g cottage, 120g maçã",k:230,p:20,c:24,f:6},{n:"Leite+cacau+amendoim",g:"300ml leite, 10g cacau, 15g amendoim",k:280,p:16,c:22,f:14},{n:"Iogurte+chia",g:"200g iogurte, 10g chia",k:190,p:14,c:16,f:8}]
  },
  Academia: {
    cafe:[{n:"Whey+aveia+banana",g:"40g whey, 70g aveia, banana",k:560,p:48,c:65,f:12},{n:"Claras+ovos+pão",g:"200g claras, 2 ovos, 2 pães",k:500,p:45,c:42,f:16},{n:"Iogurte grego+granola",g:"300g iogurte, 40g granola",k:480,p:35,c:52,f:12}],
    almoco:[{n:"Frango+arroz+feijão",g:"220g frango, 180g arroz, 100g feijão",k:760,p:70,c:82,f:12},{n:"Patinho+batata",g:"200g patinho, 320g batata",k:720,p:56,c:68,f:18},{n:"Peixe+arroz",g:"220g peixe, 210g arroz",k:670,p:58,c:72,f:10}],
    janta:[{n:"Carne+mandioca",g:"180g carne, 220g mandioca",k:640,p:44,c:58,f:18},{n:"Frango+macarrão",g:"200g frango, 180g macarrão",k:690,p:62,c:62,f:14},{n:"Omelete proteico",g:"4 ovos, 100g frango desfiado",k:580,p:55,c:8,f:34}],
    ceia:[{n:"Caseína+fruta",g:"35g caseína, fruta",k:220,p:28,c:18,f:3},{n:"Queijo+nozes",g:"60g queijo minas, 20g nozes",k:320,p:18,c:4,f:24},{n:"Iogurte+proteína",g:"250g iogurte, 20g whey",k:260,p:30,c:18,f:6}]
  }
};

function renderTab(tab){
  buildTabs(tab); todayReset();
  const current = getCurrentWindow();
  if(tab==="AGORA") return renderAgora(current);
  if(tab==="ROTINA") return renderRotina();
  if(tab==="TREINO") return renderTreino();
  if(tab==="DIETA") return renderDieta();
  if(tab==="ESTUDOS") return renderEstudos();
  if(tab==="ESPIRITUALIDADE") return renderEspiritual();
  if(tab==="SOCIAL") return renderSocial();
  if(tab==="OPERACIONAL") return renderOperacional();
  if(tab==="FINANÇAS") return renderFin();
  if(tab==="RELATÓRIOS") return renderRelatorios();
  if(tab==="CONFIG") return renderConfig();
}

function renderAgora(win){
  const late = win.mission.includes("DORMIR");
  content.innerHTML=`<section class='card'>
    <h3>MISSÃO ATUAL</h3>
    <p>Janela: <b>${win.start}–${win.end}</b> → <b>${win.tab}</b></p>
    <p>${win.mission}</p>
    ${late?"<p class='alert'>DESLIGAR. DORMIR. Ignorar custa Integridade.</p>":""}
    <div class='row'>
      <button class='primary' id='do-now'>Concluir</button>
      <button class='danger' id='skip-now'>Pular (penalidade)</button>
      <button id='go-tab'>Ir para ${win.tab}</button>
    </div>
  </section>
  <section class='card'>
   <h3>Status Diário</h3>
   <div class='grid two'>
    <div><small>Integridade</small><div class='progress'><i style='width:${state.profile.integridade}%'></i></div></div>
    <div><small>Projeto Dia ${state.profile.diaProjeto}/90</small><div class='progress'><i style='width:${Math.min(100,state.profile.diaProjeto/90*100)}%'></i></div></div>
   </div>
  </section>`;
  if(late) beep("alert");
  $("#do-now").onclick=()=>{ state.daily.tasks.agora={note:"ok"}; missionDone("agora",15,false); };
  $("#skip-now").onclick=()=>missionSkip("agora");
  $("#go-tab").onclick=()=>renderTab(win.tab);
}

function renderRoutineList(title,key){
  return `<div class='card'><h3>${title}</h3><div class='list'>${state.routines[key].map((r,i)=>{
    const done=state.daily.tasks[`${key}-${i}`]?.done;
    return `<div class='item ${done?"done":""}'><div class='row'><b>${r}</b><button data-k='${key}-${i}' class='done-btn'>Feito</button></div><label>Log mínimo<input data-note='${key}-${i}' placeholder='ex.: 3 min oração' value='${state.daily.tasks[`${key}-${i}`]?.note||""}'></label></div>`;
  }).join("")}</div></div>`;
}

function renderRotina(){
  content.innerHTML = renderRoutineList("Rotina Manhã","manha") + renderRoutineList("Rotina Noite","noite") + `<section class='card'><h3>Editor Rápido</h3><div class='row'><input id='new-r' placeholder='Novo item manhã'><button id='add-r'>Adicionar</button></div></section>`;
  content.querySelectorAll(".done-btn").forEach(b=>b.onclick=()=>missionDone(b.dataset.k,8,true));
  content.querySelectorAll("input[data-note]").forEach(i=>i.onchange=e=>{const k=e.target.dataset.note; state.daily.tasks[k]={...(state.daily.tasks[k]||{}),note:e.target.value}; save();});
  $("#add-r").onclick=()=>{ const v=$("#new-r").value.trim(); if(v){state.routines.manha.push(v); save(); renderRotina();} };
}

function renderTreino(){
  const ses = [
    {nome:"A - Upper", ex:["Supino barra 4x6-10 RIR2","Remada 4x8-12","Desenvolvimento 3x8-12","Barra fixa 3xAMRAP"]},
    {nome:"B - Lower", ex:["Agachamento 4x6-10","Levantamento romeno 4x8-12","Afundo 3x10","Panturrilha 4x12-15"]},
    {nome:"C - Full", ex:["Terra 3x5","Supino inclinado 3x8","Puxada 3x10","Bíceps/Tríceps 3x12"]}
  ];
  content.innerHTML=`<section class='card'><h3>Treino ${state.treino.mode}</h3><div class='row'><button id='home'>Casa</button><button id='gym'>Academia</button></div><p>Split ${state.profile.split} dias | Double progression ativa.</p>${ses.map((s,idx)=>`<div class='item'><b>${s.nome}</b><ul>${s.ex.map(e=>`<li>${e}</li>`).join("")}</ul><label>Carga/sets/reps<input id='w${idx}' placeholder='ex: Supino 60kg 4x8'></label><button data-i='${idx}' class='wlog'>Registrar sessão</button></div>`).join("")}</section><section class='card'><h3>Recovery e Segurança</h3><p>Aquecimento, mobilidade e alongamento pós obrigatórios. Dor persistente/lesão: reduzir carga e procurar fisioterapeuta.</p><div class='row'><button id='pose'>Posing semanal +5XP</button><button id='tan'>Tanning semanal +5XP</button></div></section>`;
  $("#home").onclick=()=>{state.treino.mode="Casa";save();renderTreino();};
  $("#gym").onclick=()=>{state.treino.mode="Academia";save();renderTreino();};
  content.querySelectorAll(".wlog").forEach(b=>b.onclick=()=>{const i=b.dataset.i;const note=$("#w"+i).value.trim(); if(!note) return toast("Informe sets/reps/carga"); state.daily.workout.push(note); state.daily.tasks["workout"]={done:true,note}; missionDone("workout",20,false); });
  $("#pose").onclick=()=>toast("Posing registrado",5);
  $("#tan").onclick=()=>toast("Tanning registrado",5);
}

function renderDieta(){
  macroTargets();
  const lib = mealLib[state.dieta.library];
  const sec=(name,label)=>`<div class='item'><h4>${label}</h4>${lib[name].map((o,i)=>`<label><input type='radio' name='${name}' value='${i}' ${state.dieta.meals[name]==i?"checked":""}> ${o.n} (${o.g}) - ${o.k}kcal P${o.p} C${o.c} G${o.f}</label>`).join("")}<button data-m='${name}' class='meal-log'>Registrar refeição</button></div>`;
  content.innerHTML=`<section class='card'><h3>Dieta - ${state.dieta.library}</h3><div class='row'><button id='lib-casa'>Casa</button><button id='lib-gym'>Academia/Alta proteína</button></div><p>Meta: ${state.dieta.kcal} kcal | P ${state.dieta.p} C ${state.dieta.c} G ${state.dieta.f} | Fibra ${state.dieta.fibra}g | Água ${state.dieta.agua}L</p><p class='warn'>Ajuste semanal: perda &lt;0,3% + alta aderência → -100~150 kcal; perda &gt;1% ou baixa integridade → +50~150 kcal/refeed.</p><div class='list'>${sec("cafe","Café")}${sec("almoco","Almoço")}${sec("janta","Janta")}${sec("ceia","Ceia/Lanche")}</div><p>Consumido: ${state.daily.macros.kcal} kcal (Aderência ${Math.round(state.daily.macros.kcal/state.dieta.kcal*100)||0}%)</p><button id='craving'>Craving Protocol 5 min</button></section>`;
  $("#lib-casa").onclick=()=>{state.dieta.library="Casa";save();renderDieta();};
  $("#lib-gym").onclick=()=>{state.dieta.library="Academia";save();renderDieta();};
  content.querySelectorAll("input[type=radio]").forEach(r=>r.onchange=e=>{state.dieta.meals[e.target.name]=Number(e.target.value);save();});
  content.querySelectorAll(".meal-log").forEach(b=>b.onclick=()=>{const m=b.dataset.m; const idx=state.dieta.meals[m]; if(idx===undefined)return toast("Escolha uma opção"); const o=lib[m][idx]; state.daily.macros.kcal+=o.k; state.daily.macros.p+=o.p; state.daily.macros.c+=o.c; state.daily.macros.f+=o.f; state.daily.tasks[`meal-${m}`]={done:true,note:o.n}; toast(`Refeição ${m} registrada`,10); save(); renderDieta();});
  $("#craving").onclick=()=>toast("Respire 4-4-8 + água + lanche de contenção",6);
}

function renderEstudos(){
  const rotation = SUBJECTS.slice((new Date().getDay()*2)%SUBJECTS.length).concat(SUBJECTS).slice(0,2);
  content.innerHTML=`<section class='card'><h3>Plano diário</h3><p>Aula = exposição. Estudo ativo = retenção.</p><p>Hoje: <b>${rotation.join(" + ")}</b> (25-45 min cada) + revisão curta.</p><div class='list'>${SUBJECTS.map(s=>`<div class='item'><b>${s}</b><label>Minutos<input id='m-${s}' type='number' min='0' placeholder='30'></label><label>Tipo<select id='t-${s}'><option>Aula</option><option>Estudo ativo</option><option>Revisão</option></select></label><button data-s='${s}' class='slog'>Registrar</button></div>`).join("")}</div></section>`;
  content.querySelectorAll(".slog").forEach(b=>b.onclick=()=>{const s=b.dataset.s; const min=Number($("#m-"+s).value||0); const tipo=$("#t-"+s).value; if(min<10) return toast("Mínimo 10min para contar"); state.daily.studyLogs.push({s,min,tipo}); toast("Estudo registrado",12);});
}

function renderEspiritual(){
  content.innerHTML=`<section class='card'><h3>Pilar Espiritual (Católico)</h3><p>Plano bíblico: ${state.espiritual.biblePlan} dias | Dia atual ${state.espiritual.diaBiblia}</p><div class='row'><button id='pray'>Oração diária</button><button id='bible'>Leitura bíblica</button><button id='missa'>Missa (domingo)</button></div><p>Checklist: Terço (opcional), exame de consciência semanal, confissão mensal.</p><p class='warn'>Sem substituir direção espiritual/profissionais de saúde quando necessário.</p></section>`;
  $("#pray").onclick=()=>{state.daily.tasks.pray={done:true,note:"ok"};toast("Oração concluída",10)};
  $("#bible").onclick=()=>{state.espiritual.diaBiblia++;toast("Leitura bíblica registrada",10);save();renderEspiritual();};
  $("#missa").onclick=()=>toast("Missa registrada",15);
}
function renderSocial(){
  content.innerHTML=`<section class='card'><h3>Social/Habilidades</h3><div class='list'>${["Micro interação","Networking","Exposição progressiva","Postura"].map(s=>`<div class='item'><b>${s}</b><label>Nota curta<input id='soc-${s}'></label><button data-s='${s}' class='soc'>Concluir</button></div>`).join("")}</div></section>`;
  content.querySelectorAll(".soc").forEach(b=>b.onclick=()=>{const s=b.dataset.s; const n=$("#soc-"+s).value.trim(); if(!n) return toast("Adicione nota curta"); state.daily.social.push({s,n}); toast("Missão social",18);});
}
function renderOperacional(){
  content.innerHTML=`<section class='card'><h3>Operacional</h3><label>Tarefa crítica<input id='op-task' placeholder='campo/casa/faculdade'></label><button id='op-do'>Concluir tarefa</button></section>`;
  $("#op-do").onclick=()=>{const v=$("#op-task").value.trim(); if(!v) return toast("Defina tarefa"); state.daily.tasks.operacional={done:true,note:v}; toast("Operação concluída",10);};
}
function renderFin(){
  const rows=state.daily.expenses.map(e=>`<li>${e.tipo} R$${e.valor} (${e.cat})</li>`).join("");
  content.innerHTML=`<section class='card'><h3>Finanças / Contador básico</h3><div class='grid two'><label>Tipo<select id='ft'><option>gasto</option><option>receita</option></select></label><label>Categoria<input id='fc' placeholder='comida/academia/suplementos'></label><label>Valor<input id='fv' type='number' step='0.01'></label></div><button id='fadd'>Registrar</button><ul>${rows||""}</ul><div class='row'><button id='csv'>Exportar CSV</button><button id='jsonf'>Exportar JSON</button></div></section>`;
  $("#fadd").onclick=()=>{const rec={tipo:$("#ft").value,cat:$("#fc").value,valor:Number($("#fv").value||0)}; if(!rec.valor)return toast("Valor inválido"); state.daily.expenses.push(rec); toast("Lançamento salvo",8); renderFin();};
  $("#csv").onclick=()=>download("financas.csv","tipo,categoria,valor\n"+state.daily.expenses.map(e=>`${e.tipo},${e.cat},${e.valor}`).join("\n"));
  $("#jsonf").onclick=()=>download("financas.json",JSON.stringify(state.daily.expenses,null,2));
}
function renderRelatorios(){
  const txt = `ASCENSÃO OS – Relatório ${state.daily.date}\nCampanha dia ${state.profile.diaProjeto}/90\nNível ${state.profile.nivel} | XP ${state.profile.xp} | Rank ${state.profile.rank}\nIntegridade ${state.profile.integridade} | Streak ${state.profile.streak}\nTreino: ${state.daily.workout.length} logs\nDieta: ${state.daily.macros.kcal}/${state.dieta.kcal} kcal\nEstudo: ${state.daily.studyLogs.reduce((a,b)=>a+b.min,0)} min\nBíblia dia: ${state.espiritual.diaBiblia}\nSocial: ${state.daily.social.length} ações\nSono: ${state.daily.sleepHours}h\nRecomendação: foco no menor próximo passo e fechar débitos antes de abrir novas missões.`;
  content.innerHTML=`<section class='card'><h3>Relatório diário/semanal</h3><textarea id='report' rows='14'>${txt}</textarea><div class='row'><button id='copy'>Copiar</button><button id='txt'>Baixar .txt</button><button id='json'>Baixar .json</button></div></section>`;
  $("#copy").onclick=async()=>{await navigator.clipboard.writeText($("#report").value); toast("Copiado",0);};
  $("#txt").onclick=()=>download(`relatorio-${state.daily.date}.txt`,$("#report").value);
  $("#json").onclick=()=>download(`ascensao-${state.daily.date}.json`,JSON.stringify(state,null,2));
}
function renderConfig(){
  content.innerHTML=`<section class='card'><h3>CONFIG TOTAL</h3><div class='grid two'>
  <label>Peso (kg)<input id='cfg-peso' type='number' value='${state.profile.peso}'></label>
  <label>BF %<input id='cfg-bf' type='number' value='${state.profile.bf}'></label>
  <label>Dias treino/sem<input id='cfg-dias' type='number' value='${state.profile.treinoDias}'></label>
  <label>Modo<select id='cfg-mode'><option value='iniciante'>iniciante</option><option value='brutal' ${state.config.brutal?"selected":""}>brutal</option></select></label>
  <label>Sons<select id='cfg-sound'><option value='on'>on</option><option value='off' ${!state.config.sounds?"selected":""}>off</option></select></label>
  <label>Volume<input id='cfg-vol' type='range' min='0' max='1' step='0.05' value='${state.config.volume}'></label>
  </div>
  <div class='row'><button id='savecfg'>Salvar config</button><button id='exp'>Exportar config</button><button id='imp'>Importar config</button><button class='danger' id='reset'>Reset total</button></div>
  <h4>Janelas do Dia</h4>
  <div class='list'>${state.config.windows.map((w,i)=>`<div class='item'>${w.start}-${w.end} -> ${w.tab}: ${w.mission} <button data-i='${i}' class='delw'>Excluir</button></div>`).join("")}</div>
  <div class='grid two'><label>Início<input id='ws' type='time'></label><label>Fim<input id='we' type='time'></label><label>Aba<select id='wt'>${TABS.map(t=>`<option>${t}</option>`).join("")}</select></label><label>Missão<input id='wm'></label></div><button id='addw'>Adicionar janela</button>
  </section>`;
  $("#savecfg").onclick=()=>{state.profile.peso=Number($("#cfg-peso").value);state.profile.bf=Number($("#cfg-bf").value);state.profile.treinoDias=Number($("#cfg-dias").value);state.config.brutal=$("#cfg-mode").value==="brutal";state.config.sounds=$("#cfg-sound").value==="on";state.config.volume=Number($("#cfg-vol").value);save();toast("Config salva",0);};
  $("#exp").onclick=()=>download("config-ascensao.json",JSON.stringify({profile:state.profile,config:state.config,routines:state.routines},null,2));
  $("#imp").onclick=()=>openImport();
  $("#reset").onclick=()=>{localStorage.clear(); location.reload();};
  $("#addw").onclick=()=>{const w={start:$("#ws").value,end:$("#we").value,tab:$("#wt").value,mission:$("#wm").value}; if(!w.start||!w.end||!w.mission) return toast("Preencha janela"); state.config.windows.push(w); save(); renderConfig();};
  content.querySelectorAll(".delw").forEach(b=>b.onclick=()=>{state.config.windows.splice(Number(b.dataset.i),1);save();renderConfig();});
}

function openImport(){
  const inp=document.createElement("input"); inp.type="file"; inp.accept="application/json";
  inp.onchange=()=>{const f=inp.files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{try{const data=JSON.parse(r.result); state={...state,...data}; save(); toast("Importado",0); renderTab("CONFIG");}catch{toast("JSON inválido",0);}}; r.readAsText(f);}; inp.click();
}
function download(name,text){ const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type:"text/plain"})); a.download=name; a.click(); URL.revokeObjectURL(a.href); }

async function boot(){
  const lines=["CHECKING_BIOMETRICS...","SYNCING_WITH_DATABASE...","ESTABLISHING_SECURE_CONNECTION...","LOADING_MISSIONS..."];
  const log=$("#boot-log"), bar=$("#boot-bar");
  for(let i=0;i<=100;i+=10){bar.style.width=i+"%"; if(i%25===0){log.textContent += lines[(i/25)|0]+"\n"; beep("click");} await new Promise(r=>setTimeout(r,120));}
  const adh = Math.max(20,100-state.profile.debitos*5+state.profile.streak*2);
  log.textContent += `Jogador encontrado. Nível atual: ${state.profile.nivel}. Compatibilidade: ${Math.min(100,adh)}%\n`;
  await initDB();
  $("#boot-screen").classList.remove("active"); $("#app").classList.remove("hidden"); renderHUD();
  const win=getCurrentWindow(); renderTab(win.tab||"AGORA");
}

$("#boot-btn").onclick=()=>boot();

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));
