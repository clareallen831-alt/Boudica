const STORAGE_KEY = 'boudica:v1';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const WORKOUTS = {
  A: [
    {id:'squat',name:'Dumbbell Squat',sets:3,reps:'10–15',muscles:'Quads, glutes, core',cue:'Sit between your hips, keep your chest tall and drive the floor away.',how:'Hold both dumbbells by your sides. Sit your hips down and back to a comfortable depth, then stand tall.',short:true},
    {id:'floorpress',name:'Dumbbell Floor Press',sets:3,reps:'10–15',muscles:'Chest, shoulders, triceps',cue:'Keep wrists stacked over elbows and lower with control.',how:'Lie on your back with knees bent. Press both dumbbells up until your arms are straight, then lower until your upper arms gently meet the floor.',short:true},
    {id:'onerow',name:'One-Arm Dumbbell Row',sets:3,reps:'10–15 each side',muscles:'Upper back, lats, biceps',cue:'Pull your elbow towards your back pocket instead of shrugging the shoulder.',how:'Brace one hand on a stable surface. Keep your spine long, row one dumbbell towards your hip, then lower under control.',short:true},
    {id:'rdl',name:'Dumbbell Romanian Deadlift',sets:3,reps:'10–15',muscles:'Hamstrings, glutes, back',cue:'This is a hip hinge, not a squat.',how:'Stand tall with the dumbbells in front of your thighs. Push your hips backwards, let the weights travel close to your legs, then drive your hips forward to stand.'},
    {id:'shoulderpress',name:'Standing Dumbbell Shoulder Press',sets:3,reps:'8–12',muscles:'Shoulders, triceps, core',cue:'Brace your middle and avoid leaning backwards as the weights rise.',how:'Start with the dumbbells around shoulder height. Press overhead smoothly, then return them to the starting position.'},
    {id:'suitcase',name:'Suitcase Hold / March',sets:2,reps:'30–60 sec each side',muscles:'Core, grip, shoulders',cue:'Stay tall — do not let the weight pull you sideways.',how:'Hold one dumbbell at your side. Stand or march slowly while keeping your shoulders level, then swap sides.'}
  ],
  B: [
    {id:'lunge',name:'Reverse Lunges',sets:3,reps:'8–12 each leg',muscles:'Quads, glutes, hamstrings',cue:'Step back far enough that the front foot stays planted and stable.',how:'Hold the dumbbells by your sides. Step one foot backwards, lower with control, then push through the front foot to return.',short:true},
    {id:'rdl',name:'Dumbbell Romanian Deadlift',sets:3,reps:'10–15',muscles:'Hamstrings, glutes, back',cue:'This is a hip hinge, not a squat.',how:'Stand tall with the dumbbells in front of your thighs. Push your hips backwards, let the weights travel close to your legs, then drive your hips forward to stand.'},
    {id:'floorpress',name:'Dumbbell Floor Press',sets:3,reps:'10–15',muscles:'Chest, shoulders, triceps',cue:'Keep wrists stacked over elbows and lower with control.',how:'Lie on your back with knees bent. Press both dumbbells up until your arms are straight, then lower until your upper arms gently meet the floor.',short:true},
    {id:'bentrow',name:'Bent-Over Dumbbell Row',sets:3,reps:'10–15',muscles:'Upper back, lats, biceps',cue:'Keep your neck neutral and row towards your hips.',how:'Hinge at the hips with a long spine. Row both dumbbells towards your sides, pause briefly, then lower under control.',short:true},
    {id:'curl',name:'Hammer Curls',sets:2,reps:'10–15',muscles:'Biceps, forearms',cue:'Keep your elbows close to your sides and avoid swinging.',how:'Stand tall with palms facing each other. Curl the dumbbells towards your shoulders, then lower slowly.'},
    {id:'triceps',name:'Overhead Dumbbell Triceps Extension',sets:2,reps:'10–15',muscles:'Triceps',cue:'Keep your ribs down and upper arms pointing forwards.',how:'Hold one dumbbell securely overhead with both hands. Bend at the elbows to lower it behind your head, then straighten your arms.'},
    {id:'suitcase',name:'Suitcase March',sets:2,reps:'30–60 sec each side',muscles:'Core, grip, shoulders',cue:'Move slowly and keep your torso upright.',how:'Hold one dumbbell at your side and march on the spot with control. Change hands and repeat.'}
  ]
};

const RUN_WEEKS = [
  {range:'Weeks 1–2',run:'2 min',walk:'3–4 min',detail:'Walk to warm up. Alternate 2 minutes of gentle running with 3–4 minutes of brisk walking, then walk easily to finish.'},
  {range:'Weeks 3–4',run:'3 min',walk:'3 min',detail:'Alternate 3 minutes of gentle running with 3 minutes of walking within the 60-minute session.'},
  {range:'Weeks 5–6',run:'5 min',walk:'3 min',detail:'Alternate 5 minutes of comfortable running with 3 minutes of walking.'},
  {range:'Weeks 7–8',run:'8 min',walk:'2 min',detail:'Alternate 8 minutes of comfortable running with 2 minutes of walking.'},
  {range:'Weeks 9–10',run:'10–12 min',walk:'2–3 min',detail:'Use 10–12 minute gentle running blocks with 2–3 minute walking recoveries.'},
  {range:'Weeks 11–12',run:'20–30 min',walk:'as needed',detail:'Experiment with one continuous 20–30 minute gentle run, using walking before and afterwards to bring the session towards 60 minutes.'}
];

const SCHEDULE = {
  0:{name:'Sunday',movement:'Easy walk or recovery',strength:true},
  1:{name:'Monday',movement:'60-minute brisk walk',strength:true},
  2:{name:'Tuesday',movement:'60-minute walk/run',away:true},
  3:{name:'Wednesday',movement:'60-minute easy walk',away:true},
  4:{name:'Thursday',movement:'60-minute recovery walk',away:true},
  5:{name:'Friday',movement:'60-minute brisk walk',strength:true},
  6:{name:'Saturday',movement:'60-minute walk/run',optional:true}
};

function defaultState(){
  return {
    theme:'light',
    route:'today',
    profile:{startWeight:110,targetWeight:90},
    runWeek:1,
    settings:{morningPrompt:true},
    days:{},
    logs:{weight:[],waist:[],workouts:[],proud:[],readingMinutes:0,planningCount:0,movementMinutes:0,longestRun:0,focusMinutes:0}
  };
}

function loadState(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY));
    const base=defaultState();
    if(!raw) return base;
    return {...base,...raw,profile:{...base.profile,...raw.profile},settings:{...base.settings,...raw.settings},logs:{...base.logs,...raw.logs}};
  }catch{return defaultState();}
}

let state=loadState();
let activeTimer=null;
let workoutSession=null;

function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
function dateKey(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
function prettyDate(d=new Date()){return d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});}
function today(){const key=dateKey(); if(!state.days[key]) state.days[key]={social:false,reading:false,readingMinutes:0,planning:false,goals:['','',''],mainGoal:'',brainDump:'',movement:false,movementMinutes:0,workout:false,evening:false,energy:null,moveLevel:'',wentWell:'',tomorrowEasier:'',morningPromptSeen:false}; return state.days[key];}
function isoWeek(d=new Date()){
  const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
  const day=x.getUTCDay()||7;x.setUTCDate(x.getUTCDate()+4-day);
  const y=new Date(Date.UTC(x.getUTCFullYear(),0,1));return Math.ceil((((x-y)/86400000)+1)/7);
}
function workoutForDate(d=new Date()){
  const day=d.getDay(); if(!SCHEDULE[day].strength) return null;
  const firstA=isoWeek(d)%2===1;
  if(day===5) return firstA?'B':'A';
  return firstA?'A':'B';
}
function weekPlan(){
  const firstA=isoWeek()%2===1;
  return firstA?{Monday:'A',Friday:'B',Sunday:'A'}:{Monday:'B',Friday:'A',Sunday:'B'};
}
function latest(log){return log.length?log[log.length-1]:null;}
function esc(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800);}
function closeModal(){const d=$('#modal');if(d.open)d.close(); if(activeTimer){clearInterval(activeTimer.id);activeTimer=null;}}
function modal(html){const d=$('#modal');$('#modalContent').innerHTML=`<button class="modal-close" data-close aria-label="Close">×</button>${html}`;d.showModal();$('[data-close]',d)?.addEventListener('click',closeModal);}
function setRoute(route){state.route=route;save();render();window.scrollTo({top:0,behavior:'smooth'});}

function applyTheme(){document.documentElement.dataset.theme=state.theme;document.querySelector('meta[name="theme-color"]').content=state.theme==='dark'?'#111714':'#18251f';}

function completeDaily(key,value=true){today()[key]=value;save();render();}
function taskCount(){
  const d=today(); const sched=SCHEDULE[new Date().getDay()];
  const items=[d.social,d.reading,d.planning,d.movement];
  if(d.mainGoal) items.push(!!d.mainGoalDone);
  if(sched.strength) items.push(d.workout);
  items.push(d.evening);
  return {done:items.filter(Boolean).length,total:items.length};
}

function nextAction(){
  const d=today(), sched=SCHEDULE[new Date().getDay()], w=workoutForDate();
  if(!d.social) return {kind:'social',eyebrow:'Morning · first',title:'Keep the first part of the day yours.',text:'Stay off social media until the morning routine is complete.',button:'Mark this done'};
  if(!d.reading) return {kind:'read',eyebrow:'Morning · next',title:'Read for 30 minutes',text:'No feeds, no decisions. Just the book. A 10-minute minimum version still counts.',button:'Start reading'};
  if(!d.planning) return {kind:'plan',eyebrow:'Morning · next',title:'Plan the day',text:'Choose three worthwhile things, then identify the one that matters most.',button:'Plan today'};
  if(!d.movement) return {kind:'move',eyebrow:'Movement',title:sched.movement,text:sched.away?'This is an intentionally lighter work-away day. The morning movement is enough.':'Start with the planned movement. Ten minutes is enough to count on a difficult day.',button:'Start movement'};
  if(d.mainGoal && !d.mainGoalDone) return {kind:'focus',eyebrow:'Main goal',title:d.mainGoal,text:'Ignore the rest of the list for now. Give this one thing a defined block of attention.',button:'Start focus mode'};
  if(sched.strength && !d.workout) return {kind:'workout',eyebrow:'Strength',title:`Workout ${w}`,text:'The session is ready. You only need to start the first exercise.',button:`Start Workout ${w}`};
  if(!d.evening) return {kind:'evening',eyebrow:'Evening',title:'Close the day properly.',text:'A short reset: energy, movement, what went well and what would make tomorrow easier.',button:'Evening reset'};
  return {kind:'done',eyebrow:'Today',title:'Today is done.',text:'Nothing else is required from Boudica tonight.',button:''};
}

function nextActionButton(kind){
  return {
    social:`<div class="button-row"><button class="primary" data-action="social-done">Done</button><button class="ghost" data-action="social-return">I got distracted — continue</button></div>`,
    read:`<div class="button-row"><button class="primary" data-action="read">Start 30 minutes</button><button class="ghost" data-action="read-min">10-minute version</button></div>`,
    plan:`<button class="primary" data-action="plan">Plan today</button>`,
    move:`<div class="button-row"><button class="primary" data-action="move">Start movement</button><button class="ghost" data-action="log-move">Log it instead</button></div>`,
    focus:`<button class="primary" data-action="focus">Start focus mode</button>`,
    workout:`<button class="primary" data-action="workout">Start workout</button>`,
    evening:`<button class="primary" data-action="evening">Evening reset</button>`,
    done:''
  }[kind];
}

function renderToday(){
  const d=today(), sched=SCHEDULE[new Date().getDay()], action=nextAction(), tc=taskCount(), w=workoutForDate();
  const tasks=[
    taskRow('social','Stay off social media','Keep the first part of the day yours.',d.social,'social-done'),
    taskRow('reading','Read for 30 minutes',d.reading?`${d.readingMinutes||30} minutes logged`:'Minimum version: 10 minutes',d.reading,'read'),
    taskRow('planning','Plan today',d.mainGoal?`Main goal: ${esc(d.mainGoal)}`:'Three priorities. One main goal.',d.planning,'plan'),
    taskRow('movement',sched.movement,sched.away?'Work-away day · intentionally lighter':d.movement?`${d.movementMinutes||60} minutes logged`:'Minimum version: 10 minutes',d.movement,'move')
  ];
  if(d.mainGoal) tasks.push(taskRow('goal',esc(d.mainGoal),'Today’s main goal',!!d.mainGoalDone,'focus'));
  if(sched.strength) tasks.push(taskRow('workout',`Workout ${w}`,'Two 13 kg dumbbells · full body',d.workout,'workout'));
  tasks.push(taskRow('evening','Evening reset','Close the day properly.',d.evening,'evening'));

  $('#main').innerHTML=`
    <section class="hero">
      <p class="eyebrow">${esc(prettyDate())}${sched.away?' · work away':''}</p>
      <h1>What do I do next?</h1>
      <p class="lede">One useful action. Then the next one.</p>
    </section>

    <section class="section">
      <div class="card next-card">
        <p class="eyebrow">${esc(action.eyebrow)}</p>
        <h2>${esc(action.title)}</h2>
        <p>${esc(action.text)}</p>
        <div class="next-meta"><span class="pill copper">${tc.done} of ${tc.total} done</span>${sched.away?'<span class="pill">Away evening</span>':''}</div>
        ${nextActionButton(action.kind)}
        <div class="day-path">${Array.from({length:tc.total},(_,i)=>`<span class="${i<tc.done?'on':''}"></span>`).join('')}</div>
      </div>
    </section>

    ${sched.away?`<section class="section"><div class="card quote-card"><p class="eyebrow">Away day</p><strong>Lighter is deliberate.</strong><p class="subtle">No dumbbell workout is scheduled tonight. Reading, a short walk or a quick reset are optional — not unfinished work.</p></div></section>`:''}

    <section class="section">
      <div class="section-head"><h2>Today</h2><p>${tc.done} of ${tc.total}</p></div>
      <div class="task-list">${tasks.join('')}</div>
    </section>

    <section class="section">
      <div class="card">
        <p class="eyebrow">End point</p>
        <h2 style="font-family:Georgia,serif;margin:0 0 8px">How do you want to feel when you go to bed tonight?</h2>
        <div class="field"><textarea id="feelTonight" placeholder="A few words is enough.">${esc(d.feelTonight||'')}</textarea></div>
        <div class="button-row"><button class="ghost" data-action="save-feel">Save</button></div>
      </div>
    </section>`;
  bindCommonActions();
}

function taskRow(id,title,sub,done,action){return `<div class="task ${done?'done':''}" data-task="${id}"><button class="check" data-action="${action}" aria-label="${done?'Completed':'Open'} ${title}">${done?'✓':''}</button><div class="task-copy"><div class="task-title">${title}</div><div class="task-sub">${sub}</div></div><button class="task-action" data-action="${action}">${done?'View':'Open'}</button></div>`;}

function renderHealth(){
  const sched=SCHEDULE[new Date().getDay()], w=workoutForDate(), rw=RUN_WEEKS[Math.ceil(state.runWeek/2)-1]||RUN_WEEKS[0];
  const lastWeight=latest(state.logs.weight),lastWaist=latest(state.logs.waist),plan=weekPlan();
  const loss=lastWeight?Math.max(0,state.profile.startWeight-lastWeight.value):0;
  $('#main').innerHTML=`
    <section class="hero"><p class="eyebrow">Health</p><h1>Move. Get stronger.</h1><p class="lede">The plan is already decided. Adjust only when real life needs you to.</p></section>

    <section class="section"><div class="card next-card"><p class="eyebrow">Today’s movement</p><h2>${esc(sched.movement)}</h2><p>${sched.away?'This is a work-away day. No strength session is required this evening.':'Ten minutes is the minimum version. Sixty minutes is the full version.'}</p><div class="button-row"><button class="primary" data-action="move">Start movement</button><button class="ghost" data-action="log-move">Log session</button></div></div></section>

    <section class="section"><div class="section-head"><h2>Walking & running</h2><p>Week ${state.runWeek} of 12</p></div><div class="card"><div class="next-meta"><span class="pill copper">${rw.range}</span><span class="pill">Run ${rw.run}</span><span class="pill">Walk ${rw.walk}</span></div><p>${rw.detail}</p><div class="button-row"><button class="ghost" data-action="repeat-run-week">Repeat this week</button><button class="primary" data-action="next-run-week" ${state.runWeek>=12?'disabled':''}>Move to next week</button></div><div class="divider"></div><div class="field"><label>Longest comfortable continuous run (minutes)</label><div style="display:flex;gap:8px"><input id="longestRun" type="number" min="0" value="${state.logs.longestRun||''}" placeholder="e.g. 8"><button class="ghost" data-action="save-longest-run">Save</button></div></div></div></section>

    <section class="section"><div class="section-head"><h2>Strength</h2><p>2 × 13 kg dumbbells</p></div><div class="card"><p class="eyebrow">This week</p><div class="schedule"><div class="schedule-row"><strong>Monday</strong><span>Workout ${plan.Monday}</span><span></span></div><div class="schedule-row"><strong>Friday</strong><span>Workout ${plan.Friday}</span><span></span></div><div class="schedule-row"><strong>Sunday</strong><span>Workout ${plan.Sunday}</span><span></span></div></div><div class="button-row">${w?`<button class="primary" data-action="workout">Start today’s Workout ${w}</button>`:'<button class="ghost" data-workout-manual="A">View Workout A</button><button class="ghost" data-workout-manual="B">View Workout B</button>'}</div></div></section>

    <section class="section"><div class="section-head"><h2>Progress</h2><p>Trend, not perfection</p></div><div class="metric-grid"><div class="metric"><b>${lastWeight?`${lastWeight.value} kg`:'—'}</b><small>Current weight</small></div><div class="metric"><b>${loss?`${loss.toFixed(1)} kg`:'—'}</b><small>Change from start</small></div><div class="metric"><b>${lastWaist?`${lastWaist.value} cm`:'—'}</b><small>Waist</small></div><div class="metric"><b>${state.logs.workouts.length}</b><small>Strength sessions</small></div></div><div class="card" style="margin-top:12px"><div class="form-grid"><div class="field"><label>Weight (kg)</label><input id="weightInput" type="number" step="0.1" min="40" max="250" placeholder="e.g. 109.4"></div><div class="field"><label>Waist (cm)</label><input id="waistInput" type="number" step="0.1" min="40" max="250" placeholder="Optional"></div></div><div class="button-row"><button class="primary" data-action="log-body">Log today</button></div>${progressLogs()}</div></section>

    <section class="section"><div class="section-head"><h2>Weekly rhythm</h2><p>Home and away</p></div><div class="card">${weeklyScheduleHtml()}</div></section>`;
  bindCommonActions();
  $$('[data-workout-manual]').forEach(b=>b.addEventListener('click',()=>openWorkoutPreview(b.dataset.workoutManual)));
}

function weeklyScheduleHtml(){
  const plan=weekPlan();
  return `<div class="schedule">${[1,2,3,4,5,6,0].map(day=>{const s=SCHEDULE[day],strength=s.strength?`Workout ${plan[s.name]}`:'';return `<div class="schedule-row"><strong>${s.name.slice(0,3)}</strong><span>${s.movement}${strength?` · ${strength}`:''}</span>${s.away?'<span class="away">AWAY</span>':'<span></span>'}</div>`}).join('')}</div>`;
}

function progressLogs(){
  const combined=[...state.logs.weight.map(x=>({...x,type:'Weight',unit:'kg'})),...state.logs.waist.map(x=>({...x,type:'Waist',unit:'cm'}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6);
  if(!combined.length)return '<p class="empty">No measurements logged yet.</p>';
  return `<div class="divider"></div>${combined.map(x=>`<div class="log-row"><span><strong>${x.type}</strong><br><small>${new Date(x.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</small></span><b>${x.value} ${x.unit}</b></div>`).join('')}`;
}

function renderProof(){
  const ms=milestones();
  const unlocked=ms.filter(x=>x.done).length;
  $('#main').innerHTML=`
    <section class="hero"><p class="eyebrow">Proof</p><h1>Evidence, not hype.</h1><p class="lede">Small things count because they are evidence that life is moving.</p></section>
    <section class="section"><div class="metric-grid"><div class="metric"><b>${unlocked}</b><small>Milestones unlocked</small></div><div class="metric"><b>${state.logs.workouts.length}</b><small>Strength sessions</small></div><div class="metric"><b>${Math.round(state.logs.readingMinutes/60*10)/10}h</b><small>Reading</small></div><div class="metric"><b>${state.logs.planningCount}</b><small>Planned mornings</small></div></div></section>
    <section class="section"><div class="section-head"><h2>Milestones</h2><p>${unlocked} of ${ms.length}</p></div><div class="card">${ms.map(x=>`<div class="milestone ${x.done?'':'locked'}"><div class="milestone-icon">${x.done?'✓':'◇'}</div><div><strong>${x.title}</strong><div class="subtle">${x.sub}</div></div></div>`).join('')}</div></section>
    <section class="section"><div class="card"><p class="eyebrow">Add your own</p><h2 style="font-family:Georgia,serif;margin-top:0">What are you proud of today?</h2><div class="field"><textarea id="proudInput" placeholder="Anything counts."></textarea></div><div class="button-row"><button class="primary" data-action="add-proud">Add to Proof</button></div></div></section>
    <section class="section"><div class="section-head"><h2>Your proof</h2></div><div class="card">${state.logs.proud.length?state.logs.proud.slice().reverse().map(x=>`<div class="log-row"><span>${esc(x.text)}<br><small>${new Date(x.date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</small></span></div>`).join(''):'<p class="empty">Your own wins will collect here.</p>'}</div></section>`;
  bindCommonActions();
}

function milestones(){
  const days=Object.values(state.days);
  const fullMorning=days.some(d=>d.social&&d.reading&&d.planning);
  const firstW=state.logs.workouts.length>=1, tenW=state.logs.workouts.length>=10;
  const lw=latest(state.logs.weight), loss=lw?state.profile.startWeight-lw.value:0;
  const waistReduced=state.logs.waist.length>1 && state.logs.waist.at(-1).value<state.logs.waist[0].value;
  return [
    {title:'First full morning routine',sub:'Offline start, reading and planning.',done:fullMorning},
    {title:'Five hours of reading',sub:'Time deliberately invested in a book.',done:state.logs.readingMinutes>=300},
    {title:'Ten planned mornings',sub:'Ten days started with intention.',done:state.logs.planningCount>=10},
    {title:'First strength workout',sub:'Started the strength programme.',done:firstW},
    {title:'Ten strength workouts',sub:'Consistency becoming a pattern.',done:tenW},
    {title:'First 5-minute continuous run',sub:'Five comfortable minutes without a walking break.',done:state.logs.longestRun>=5},
    {title:'First 20-minute continuous run',sub:'A substantial cardio milestone.',done:state.logs.longestRun>=20},
    {title:'First 5 kg lost',sub:'Progress from the starting point.',done:loss>=5},
    {title:'First 10 kg lost',sub:'Halfway from 110 kg to 90 kg.',done:loss>=10},
    {title:'Waist measurement reduced',sub:'Another measure beyond the scales.',done:waistReduced}
  ];
}

function renderMe(){
  $('#main').innerHTML=`
    <section class="hero"><p class="eyebrow">Me</p><h1>Make it work for real life.</h1><p class="lede">The defaults reduce decisions. Change them only when they stop being useful.</p></section>
    <section class="section"><div class="section-head"><h2>Profile</h2></div><div class="card"><div class="form-grid"><div class="field"><label>Starting weight (kg)</label><input id="startWeight" type="number" step="0.1" value="${state.profile.startWeight}"></div><div class="field"><label>Long-term target (kg)</label><input id="targetWeight" type="number" step="0.1" value="${state.profile.targetWeight}"></div></div><div class="button-row"><button class="primary" data-action="save-profile">Save</button></div></div></section>
    <section class="section"><div class="section-head"><h2>Morning</h2></div><div class="card"><div class="task"><div class="task-copy"><div class="task-title">Morning opening prompt</div><div class="task-sub">Show “Don’t give your morning away” the first time Boudica opens each day.</div></div><button class="${state.settings.morningPrompt?'secondary':'ghost'}" data-action="toggle-morning">${state.settings.morningPrompt?'On':'Off'}</button></div><p class="subtle">A browser app cannot reliably schedule a lock-screen alert while completely closed without push-notification infrastructure. This prompt runs locally when Boudica opens.</p></div></section>
    <section class="section"><div class="section-head"><h2>Appearance</h2></div><div class="card"><div class="segmented"><button data-theme-choice="light" class="${state.theme==='light'?'active':''}">Light</button><button data-theme-choice="dark" class="${state.theme==='dark'?'active':''}">Dark</button></div></div></section>
    <section class="section"><div class="section-head"><h2>Data</h2></div><div class="card"><p class="subtle">This version stores data only in this browser on this device.</p><div class="button-row"><button class="ghost" data-action="export">Export data</button><button class="danger" data-action="reset">Reset Boudica</button></div></div></section>
    <section class="section"><div class="card quote-card"><p class="eyebrow">Boudica</p><strong>Continue from here.</strong><p class="subtle">Busy days, disrupted routines and minimum versions are part of the programme — not evidence that it has failed.</p></div></section>`;
  bindCommonActions();
  $$('[data-theme-choice]').forEach(b=>b.addEventListener('click',()=>{state.theme=b.dataset.themeChoice;save();applyTheme();renderMe();}));
}

function render(){
  applyTheme();
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.nav===state.route));
  if(state.route==='health')renderHealth(); else if(state.route==='proof')renderProof(); else if(state.route==='me')renderMe(); else renderToday();
}

function bindCommonActions(){
  $$('[data-action]').forEach(el=>el.addEventListener('click',()=>handleAction(el.dataset.action)));
}

function handleAction(action){
  const d=today();
  if(action==='social-done'){d.social=true;save();toast('Morning kept yours.');render();}
  if(action==='social-return'){d.social=true;save();toast('Continue from here.');render();}
  if(action==='read') openTimer({label:'Read',minutes:30,minMinutes:10,onFinish:m=>finishReading(m)});
  if(action==='read-min') openTimer({label:'Read · minimum version',minutes:10,minMinutes:10,onFinish:m=>finishReading(m)});
  if(action==='plan') openPlanner();
  if(action==='move') openMovement();
  if(action==='log-move') openLogMovement();
  if(action==='focus') openFocusPicker();
  if(action==='workout') startWorkout(workoutForDate()||'A');
  if(action==='evening') openEvening();
  if(action==='save-feel'){d.feelTonight=$('#feelTonight')?.value.trim()||'';save();toast('Saved.');}
  if(action==='repeat-run-week'){toast(`Week ${state.runWeek} stays in place.`);}
  if(action==='next-run-week'){state.runWeek=Math.min(12,state.runWeek+1);save();render();toast(`Moved to week ${state.runWeek}.`);}
  if(action==='save-longest-run'){const v=Number($('#longestRun')?.value);if(v>=0){state.logs.longestRun=v;save();render();toast('Run progress saved.');}}
  if(action==='log-body') logBody();
  if(action==='add-proud'){const text=$('#proudInput')?.value.trim();if(text){state.logs.proud.push({date:dateKey(),text});save();render();toast('Added to Proof.');}}
  if(action==='save-profile'){const s=Number($('#startWeight')?.value),t=Number($('#targetWeight')?.value);if(s>0&&t>0){state.profile.startWeight=s;state.profile.targetWeight=t;save();render();toast('Profile saved.');}}
  if(action==='toggle-morning'){state.settings.morningPrompt=!state.settings.morningPrompt;save();render();}
  if(action==='export') exportData();
  if(action==='reset') confirmReset();
}

function finishReading(minutes){
  const d=today(),m=Math.max(10,Math.round(minutes));
  if(!d.reading){state.logs.readingMinutes+=m;}
  d.reading=true;d.readingMinutes=m;save();closeModal();render();toast('Time spent on something you chose.');
}

function openPlanner(){
  const d=today();
  modal(`<p class="eyebrow">Morning · plan</p><h2 class="exercise-title">What would make today feel worthwhile?</h2><p class="subtle">Three things. Then choose the one that matters most.</p><div class="form-grid">${[0,1,2].map(i=>`<div class="field"><label>${i+1}</label><input data-goal="${i}" value="${esc(d.goals?.[i]||'')}" placeholder="One worthwhile thing"></div>`).join('')}<div class="field"><label>If you only complete ONE, which matters most?</label><select id="mainGoalSelect"><option value="">Choose after adding the three above</option></select></div><div class="field"><label>Get everything else out of your head</label><textarea id="brainDump" placeholder="This is a brain dump, not another task list.">${esc(d.brainDump||'')}</textarea></div></div><div class="button-row"><button class="primary" id="savePlan">Save today’s plan</button></div>`);
  const inputs=$$('[data-goal]',$('#modal'));
  const select=$('#mainGoalSelect');
  function sync(){const old=d.mainGoal;select.innerHTML='<option value="">Choose one</option>'+inputs.map((i,n)=>i.value.trim()?`<option value="${n}">${esc(i.value.trim())}</option>`:'').join('');const idx=inputs.findIndex(i=>i.value.trim()===old);if(idx>=0)select.value=String(idx);}
  inputs.forEach(i=>i.addEventListener('input',sync));sync();
  $('#savePlan').addEventListener('click',()=>{const goals=inputs.map(i=>i.value.trim());const idx=Number(select.value);const main=Number.isInteger(idx)&&select.value!==''?goals[idx]:goals.find(Boolean)||'';if(!goals.some(Boolean)){toast('Add at least one worthwhile thing.');return;}if(!d.planning)state.logs.planningCount++;d.goals=goals;d.mainGoal=main;d.mainGoalDone=false;d.brainDump=$('#brainDump').value.trim();d.planning=true;save();closeModal();render();toast('Day planned.');});
}

function openFocusPicker(){
  const goal=today().mainGoal||'Your main goal';
  modal(`<p class="eyebrow">Focus mode</p><h2 class="exercise-title">${esc(goal)}</h2><p class="subtle">How long do you want to start for?</p><div class="choice-grid">${[10,25,45,60].map(m=>`<button class="choice" data-focus-min="${m}">${m} minutes</button>`).join('')}</div>`);
  $$('[data-focus-min]',$('#modal')).forEach(b=>b.addEventListener('click',()=>openTimer({label:'Focus',minutes:Number(b.dataset.focusMin),minMinutes:5,focusText:goal,onFinish:m=>{state.logs.focusMinutes+=Math.round(m);today().mainGoalDone=true;save();closeModal();render();toast('Main goal moved forward.');}})));
}

function openMovement(){
  const sched=SCHEDULE[new Date().getDay()];
  openTimer({label:sched.movement,minutes:60,minMinutes:10,onFinish:m=>finishMovement(m)});
}
function finishMovement(minutes){const d=today(),m=Math.max(10,Math.round(minutes));if(!d.movement)state.logs.movementMinutes+=m;d.movement=true;d.movementMinutes=m;save();closeModal();render();toast('Movement logged.');}
function openLogMovement(){
  modal(`<p class="eyebrow">Movement</p><h2 class="exercise-title">Log today’s session</h2><div class="field"><label>Minutes</label><input id="moveMinutes" type="number" min="1" max="300" value="60"></div><div class="button-row"><button class="primary" id="saveMove">Log movement</button><button class="ghost" id="minimumMove">Count 10-minute minimum</button></div>`);
  $('#saveMove').addEventListener('click',()=>{const m=Number($('#moveMinutes').value);if(m>0)finishMovement(m);});
  $('#minimumMove').addEventListener('click',()=>finishMovement(10));
}

function openTimer({label,minutes,minMinutes=0,focusText='',onFinish}){
  if(activeTimer)clearInterval(activeTimer.id);
  const total=minutes*60;let remaining=total,running=false;
  modal(`<p class="eyebrow">${esc(label)}</p>${focusText?`<div class="focus-task">${esc(focusText)}</div>`:''}<div class="timer-wrap"><div id="timerDisplay" class="timer">${formatTime(remaining)}</div><div class="timer-label">${minutes} minute session</div></div><div class="button-row"><button class="primary" id="timerStart">Start</button><button class="ghost" id="timerFinish">Finish early</button></div>${minMinutes?`<div class="button-row"><button class="ghost" id="timerMinimum">Count ${minMinutes}-minute minimum</button></div>`:''}`);
  const display=$('#timerDisplay'),start=$('#timerStart');
  function paint(){display.textContent=formatTime(remaining);start.textContent=running?'Pause':'Resume';}
  function tick(){if(!running)return;remaining--;paint();if(remaining<=0){clearInterval(activeTimer.id);activeTimer=null;onFinish(minutes);}}
  activeTimer={id:setInterval(tick,1000)};
  start.textContent='Start';
  start.addEventListener('click',()=>{running=!running;paint();});
  $('#timerFinish').addEventListener('click',()=>{const elapsed=(total-remaining)/60;onFinish(Math.max(1,elapsed));});
  $('#timerMinimum')?.addEventListener('click',()=>onFinish(minMinutes));
}
function formatTime(s){const m=Math.floor(Math.max(0,s)/60),sec=Math.max(0,s)%60;return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;}

function openEvening(){
  const d=today();
  modal(`<p class="eyebrow">Evening reset</p><h2 class="exercise-title">Close the day properly.</h2><div class="form-grid"><div class="field"><label>How was your energy today? (1–10)</label><input id="energy" type="range" min="1" max="10" value="${d.energy||5}"><div id="energyValue" style="font-size:28px;font-family:Georgia,serif;text-align:center">${d.energy||5}</div></div><div class="field"><label>Did you move today?</label><select id="moveLevel"><option ${d.moveLevel==='Yes'?'selected':''}>Yes</option><option ${d.moveLevel==='A little'?'selected':''}>A little</option><option ${d.moveLevel==='No'?'selected':''}>No</option></select></div><div class="field"><label>What went well?</label><textarea id="wentWell">${esc(d.wentWell||'')}</textarea></div><div class="field"><label>What would make tomorrow easier?</label><textarea id="tomorrowEasier">${esc(d.tomorrowEasier||'')}</textarea></div></div><div class="button-row"><button class="primary" id="finishDay">Today is done</button></div>`);
  $('#energy').addEventListener('input',e=>$('#energyValue').textContent=e.target.value);
  $('#finishDay').addEventListener('click',()=>{d.energy=Number($('#energy').value);d.moveLevel=$('#moveLevel').value;d.wentWell=$('#wentWell').value.trim();d.tomorrowEasier=$('#tomorrowEasier').value.trim();d.evening=true;save();closeModal();render();toast('Today is done.');});
}

function logBody(){
  const w=Number($('#weightInput')?.value),wa=Number($('#waistInput')?.value),date=dateKey();
  if(!w&&!wa){toast('Add a weight or waist measurement.');return;}
  if(w){state.logs.weight=state.logs.weight.filter(x=>x.date!==date);state.logs.weight.push({date,value:w});state.logs.weight.sort((a,b)=>a.date.localeCompare(b.date));}
  if(wa){state.logs.waist=state.logs.waist.filter(x=>x.date!==date);state.logs.waist.push({date,value:wa});state.logs.waist.sort((a,b)=>a.date.localeCompare(b.date));}
  save();render();toast('Progress logged.');
}

function openWorkoutPreview(type){
  const list=WORKOUTS[type];
  modal(`<p class="eyebrow">Workout ${type}</p><h2 class="exercise-title">Full body · two 13 kg dumbbells</h2><div class="task-list">${list.map((x,i)=>`<div class="task"><div class="task-copy"><div class="task-title">${i+1}. ${x.name}</div><div class="task-sub">${x.sets} sets × ${x.reps}</div></div></div>`).join('')}</div><div class="button-row"><button class="primary" id="previewStart">Start Workout ${type}</button></div>`);
  $('#previewStart').addEventListener('click',()=>startWorkout(type));
}

function startWorkout(type){
  const list=WORKOUTS[type];
  modal(`<p class="eyebrow">Workout ${type}</p><h2 class="exercise-title">How much have you got today?</h2><p class="subtle">The short version still counts as showing up.</p><div class="choice-grid"><button class="choice" data-workout-mode="full"><strong>Full version</strong><br><span class="subtle">${list.length} exercises</span></button><button class="choice" data-workout-mode="short"><strong>Short version</strong><br><span class="subtle">Three key exercises</span></button></div>`);
  $$('[data-workout-mode]',$('#modal')).forEach(b=>b.addEventListener('click',()=>beginWorkout(type,b.dataset.workoutMode==='short')));
}
function beginWorkout(type,short){
  const exercises=short?WORKOUTS[type].filter(x=>x.short):WORKOUTS[type];
  workoutSession={type,short,exercises,index:0,results:{},started:new Date().toISOString()};
  renderWorkoutExercise();
}
function renderWorkoutExercise(){
  const s=workoutSession,x=s.exercises[s.index],prev=previousExerciseResult(x.id);
  const visual=exerciseVisual(x.id);
  $('#modalContent').innerHTML=`<button class="modal-close" data-close aria-label="Close">×</button><p class="eyebrow">Workout ${s.type} · exercise ${s.index+1} of ${s.exercises.length}</p><h2 class="exercise-title">${x.name}</h2><div class="next-meta"><span class="pill copper">${x.sets} sets × ${x.reps}</span><span class="pill">${x.muscles}</span></div>${visual}<p>${x.how}</p><p class="cue"><strong>Remember:</strong> ${x.cue}</p>${prev?`<p class="subtle"><strong>Previous:</strong> ${esc(prev)}</p>`:''}<div class="set-grid">${Array.from({length:x.sets},(_,i)=>`<div class="set-row"><strong>Set ${i+1}</strong><input data-set="${i}" inputmode="numeric" type="number" min="0" placeholder="reps"><span class="rest">60s rest</span></div>`).join('')}</div><div class="button-row"><button class="primary" id="nextExercise">${s.index===s.exercises.length-1?'Finish workout':'Next exercise'}</button><button class="ghost" id="skipExercise">Skip</button></div>`;
  $('[data-close]',$('#modal')).addEventListener('click',()=>{workoutSession=null;closeModal();});
  $('#nextExercise').addEventListener('click',()=>saveExerciseAndAdvance(false));
  $('#skipExercise').addEventListener('click',()=>saveExerciseAndAdvance(true));
}
function previousExerciseResult(id){
  for(let i=state.logs.workouts.length-1;i>=0;i--){const r=state.logs.workouts[i].results?.[id];if(r?.length)return r.join(' / ');}return '';
}
function saveExerciseAndAdvance(skip){
  const s=workoutSession,x=s.exercises[s.index];
  if(!skip){const vals=$$('[data-set]',$('#modal')).map(i=>Number(i.value)||0);s.results[x.id]=vals;}
  if(s.index<s.exercises.length-1){s.index++;renderWorkoutExercise();return;}
  const log={date:dateKey(),type:s.type,short:s.short,results:s.results,started:s.started};
  state.logs.workouts.push(log);today().workout=true;save();workoutSession=null;
  $('#modalContent').innerHTML=`<button class="modal-close" data-close>×</button><p class="eyebrow">Workout complete</p><h2 class="exercise-title">${s.short?'That’s enough to count.':'Session done.'}</h2><p class="subtle">${s.short?'You showed up. Continuing was optional, not required.':'Your reps are saved for the next session.'}</p><div class="button-row"><button class="primary" id="workoutDone">Done</button></div>`;
  $('[data-close]',$('#modal')).addEventListener('click',()=>{closeModal();render();});$('#workoutDone').addEventListener('click',()=>{closeModal();render();toast('Workout saved.');});
}

function exerciseVisual(id){return `<div class="exercise-visual"><div class="pose">${exerciseSvg(id,false)}<small>START</small></div><div class="arrow">→</div><div class="pose">${exerciseSvg(id,true)}<small>FINISH</small></div></div>`;}
function exerciseSvg(id,end){
  const S='stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  const C='stroke="#a46d43" stroke-width="7" stroke-linecap="round" fill="none"';
  const db=(x,y)=>`<g ${C}><line x1="${x-10}" y1="${y}" x2="${x+10}" y2="${y}"/><line x1="${x-13}" y1="${y-8}" x2="${x-13}" y2="${y+8}"/><line x1="${x+13}" y1="${y-8}" x2="${x+13}" y2="${y+8}"/></g>`;
  let body='';
  if(id==='floorpress') body=end?`<circle cx="78" cy="112" r="14" ${S}/><line x1="92" y1="120" x2="145" y2="120" ${S}/><line x1="142" y1="120" x2="165" y2="92" ${S}/><line x1="145" y1="120" x2="170" y2="142" ${S}/><line x1="118" y1="118" x2="118" y2="55" ${S}/><line x1="153" y1="118" x2="153" y2="55" ${S}/>${db(118,45)}${db(153,45)}`:`<circle cx="65" cy="128" r="14" ${S}/><line x1="79" y1="134" x2="145" y2="134" ${S}/><line x1="143" y1="134" x2="168" y2="108" ${S}/><line x1="145" y1="134" x2="170" y2="153" ${S}/><line x1="105" y1="132" x2="88" y2="91" ${S}/><line x1="88" y1="91" x2="112" y2="74" ${S}/><line x1="138" y1="132" x2="151" y2="91" ${S}/><line x1="151" y1="91" x2="130" y2="74" ${S}/>${db(112,67)}${db(130,67)}`;
  else if(id==='squat') body=end?`<circle cx="105" cy="42" r="15" ${S}/><line x1="105" y1="58" x2="105" y2="112" ${S}/><line x1="105" y1="80" x2="78" y2="105" ${S}/><line x1="105" y1="80" x2="132" y2="105" ${S}/><line x1="105" y1="112" x2="72" y2="125" ${S}/><line x1="72" y1="125" x2="55" y2="165" ${S}/><line x1="105" y1="112" x2="138" y2="125" ${S}/><line x1="138" y1="125" x2="156" y2="165" ${S}/>${db(72,111)}${db(138,111)}`:`<circle cx="105" cy="35" r="15" ${S}/><line x1="105" y1="51" x2="105" y2="108" ${S}/><line x1="105" y1="75" x2="78" y2="104" ${S}/><line x1="105" y1="75" x2="132" y2="104" ${S}/><line x1="105" y1="108" x2="86" y2="170" ${S}/><line x1="105" y1="108" x2="124" y2="170" ${S}/>${db(76,113)}${db(134,113)}`;
  else if(id==='rdl'||id==='bentrow'||id==='onerow') body=end?`<circle cx="85" cy="55" r="14" ${S}/><line x1="92" y1="68" x2="137" y2="99" ${S}/><line x1="137" y1="99" x2="119" y2="158" ${S}/><line x1="137" y1="99" x2="162" y2="157" ${S}/><line x1="111" y1="84" x2="105" y2="132" ${S}/><line x1="128" y1="95" x2="139" y2="132" ${S}/>${db(103,140)}${db(141,140)}`:`<circle cx="105" cy="34" r="14" ${S}/><line x1="105" y1="49" x2="105" y2="108" ${S}/><line x1="105" y1="76" x2="82" y2="112" ${S}/><line x1="105" y1="76" x2="128" y2="112" ${S}/><line x1="105" y1="108" x2="86" y2="170" ${S}/><line x1="105" y1="108" x2="124" y2="170" ${S}/>${db(78,120)}${db(132,120)}`;
  else if(id==='shoulderpress') body=end?`<circle cx="105" cy="57" r="14" ${S}/><line x1="105" y1="72" x2="105" y2="128" ${S}/><line x1="105" y1="88" x2="80" y2="53" ${S}/><line x1="80" y1="53" x2="80" y2="22" ${S}/><line x1="105" y1="88" x2="130" y2="53" ${S}/><line x1="130" y1="53" x2="130" y2="22" ${S}/><line x1="105" y1="128" x2="88" y2="173" ${S}/><line x1="105" y1="128" x2="122" y2="173" ${S}/>${db(80,16)}${db(130,16)}`:`<circle cx="105" cy="45" r="14" ${S}/><line x1="105" y1="60" x2="105" y2="125" ${S}/><line x1="105" y1="80" x2="77" y2="73" ${S}/><line x1="77" y1="73" x2="75" y2="49" ${S}/><line x1="105" y1="80" x2="133" y2="73" ${S}/><line x1="133" y1="73" x2="135" y2="49" ${S}/><line x1="105" y1="125" x2="88" y2="173" ${S}/><line x1="105" y1="125" x2="122" y2="173" ${S}/>${db(75,42)}${db(135,42)}`;
  else if(id==='lunge') body=end?`<circle cx="105" cy="34" r="14" ${S}/><line x1="105" y1="49" x2="105" y2="109" ${S}/><line x1="105" y1="72" x2="78" y2="106" ${S}/><line x1="105" y1="72" x2="132" y2="106" ${S}/><line x1="105" y1="109" x2="76" y2="127" ${S}/><line x1="76" y1="127" x2="62" y2="168" ${S}/><line x1="105" y1="109" x2="143" y2="137" ${S}/><line x1="143" y1="137" x2="169" y2="164" ${S}/>${db(76,115)}${db(134,115)}`:`<circle cx="105" cy="34" r="14" ${S}/><line x1="105" y1="49" x2="105" y2="108" ${S}/><line x1="105" y1="72" x2="79" y2="108" ${S}/><line x1="105" y1="72" x2="131" y2="108" ${S}/><line x1="105" y1="108" x2="88" y2="171" ${S}/><line x1="105" y1="108" x2="122" y2="171" ${S}/>${db(76,116)}${db(134,116)}`;
  else if(id==='curl') body=end?`<circle cx="105" cy="35" r="14" ${S}/><line x1="105" y1="50" x2="105" y2="112" ${S}/><line x1="105" y1="72" x2="80" y2="104" ${S}/><line x1="80" y1="104" x2="83" y2="72" ${S}/><line x1="105" y1="72" x2="130" y2="104" ${S}/><line x1="130" y1="104" x2="127" y2="72" ${S}/><line x1="105" y1="112" x2="88" y2="172" ${S}/><line x1="105" y1="112" x2="122" y2="172" ${S}/>${db(83,65)}${db(127,65)}`:`<circle cx="105" cy="35" r="14" ${S}/><line x1="105" y1="50" x2="105" y2="112" ${S}/><line x1="105" y1="72" x2="80" y2="118" ${S}/><line x1="105" y1="72" x2="130" y2="118" ${S}/><line x1="105" y1="112" x2="88" y2="172" ${S}/><line x1="105" y1="112" x2="122" y2="172" ${S}/>${db(77,126)}${db(133,126)}`;
  else if(id==='triceps') body=end?`<circle cx="105" cy="52" r="14" ${S}/><line x1="105" y1="67" x2="105" y2="130" ${S}/><line x1="105" y1="86" x2="86" y2="50" ${S}/><line x1="86" y1="50" x2="104" y2="21" ${S}/><line x1="105" y1="86" x2="124" y2="50" ${S}/><line x1="124" y1="50" x2="106" y2="21" ${S}/><line x1="105" y1="130" x2="88" y2="174" ${S}/><line x1="105" y1="130" x2="122" y2="174" ${S}/>${db(105,15)}`:`<circle cx="105" cy="50" r="14" ${S}/><line x1="105" y1="65" x2="105" y2="130" ${S}/><line x1="105" y1="84" x2="83" y2="54" ${S}/><line x1="83" y1="54" x2="104" y2="78" ${S}/><line x1="105" y1="84" x2="127" y2="54" ${S}/><line x1="127" y1="54" x2="106" y2="78" ${S}/><line x1="105" y1="130" x2="88" y2="174" ${S}/><line x1="105" y1="130" x2="122" y2="174" ${S}/>${db(105,84)}`;
  else body=end?`<circle cx="105" cy="35" r="14" ${S}/><line x1="105" y1="50" x2="105" y2="112" ${S}/><line x1="105" y1="72" x2="75" y2="111" ${S}/><line x1="105" y1="112" x2="81" y2="144" ${S}/><line x1="81" y1="144" x2="88" y2="174" ${S}/><line x1="105" y1="112" x2="129" y2="140" ${S}/><line x1="129" y1="140" x2="123" y2="174" ${S}/>${db(72,120)}`:`<circle cx="105" cy="35" r="14" ${S}/><line x1="105" y1="50" x2="105" y2="112" ${S}/><line x1="105" y1="72" x2="76" y2="112" ${S}/><line x1="105" y1="112" x2="88" y2="174" ${S}/><line x1="105" y1="112" x2="122" y2="174" ${S}/>${db(72,120)}`;
  return `<svg viewBox="0 0 210 190" role="img" aria-label="${end?'Finish':'Start'} position">${body}</svg>`;
}

function openStuck(){
  modal(`<p class="eyebrow">I’m stuck</p><h2 class="exercise-title">What feels hardest right now?</h2><div class="choice-grid">${['Starting','Focusing','Too much to do','I’m exhausted','I’m restless','My head feels noisy','I don’t know'].map(x=>`<button class="choice" data-stuck="${esc(x)}">${esc(x)}</button>`).join('')}</div>`);
  $$('[data-stuck]',$('#modal')).forEach(b=>b.addEventListener('click',()=>stuckResponse(b.dataset.stuck)));
}
function stuckResponse(kind){
  let title='Make it smaller.',text='Do one small thing, then decide again.',button='',act='';
  if(kind==='Starting'){title='We’re making this smaller.';text='Do it for five minutes. Nothing beyond that is required.';button='Start 5 minutes';act='five';}
  if(kind==='Focusing'){title='One thing only.';text=today().mainGoal?`Your main goal is: ${today().mainGoal}`:'Choose one small thing that matters, and ignore the rest for ten minutes.';button='Start 10 minutes';act='focus10';}
  if(kind==='Too much to do'){title='Ignore the whole list.';text=today().mainGoal?`The one thing that matters most today is: ${today().mainGoal}`:'Choose one thing. The rest can wait.';button=today().mainGoal?'Start main goal':'Open Today';act=today().mainGoal?'focus10':'today';}
  if(kind==='I’m exhausted'){title='Today might need a smaller version.';text='Ten minutes of walking, ten minutes of reading, or simply an early reset can be enough.';button='Start a 10-minute walk';act='walk10';}
  if(kind==='I’m restless'){title='Change the state of your body.';text='Put your shoes on and go outside for ten minutes.';button='Start 10 minutes';act='walk10';}
  if(kind==='My head feels noisy'){title='Get it out of your head.';text='This is not a task list. Just unload the noise.';button='Open brain dump';act='brain';}
  if(kind==='I don’t know'){title='No diagnosis required.';text='Put your shoes on and step outside for ten minutes. Decide what comes next afterwards.';button='Start 10 minutes';act='walk10';}
  $('#modalContent').innerHTML=`<button class="modal-close" data-close>×</button><p class="eyebrow">${esc(kind)}</p><h2 class="exercise-title">${esc(title)}</h2><p>${esc(text)}</p><div class="button-row"><button class="primary" id="stuckAct">${esc(button)}</button><button class="ghost" id="stuckAnother">Give me another</button></div>`;
  $('[data-close]',$('#modal')).addEventListener('click',closeModal);$('#stuckAnother').addEventListener('click',openStuck);$('#stuckAct').addEventListener('click',()=>{
    if(act==='five')openTimer({label:'Just start',minutes:5,onFinish:m=>{state.logs.focusMinutes+=Math.round(m);save();closeModal();toast('Five minutes counts.');}});
    if(act==='focus10')openTimer({label:'Focus',minutes:10,focusText:today().mainGoal||'One thing',onFinish:m=>{state.logs.focusMinutes+=Math.round(m);save();closeModal();toast('You moved it forward.');}});
    if(act==='walk10')openTimer({label:'Go outside',minutes:10,onFinish:m=>finishMovement(Math.max(10,m))});
    if(act==='brain')openBrainDump();
    if(act==='today'){closeModal();setRoute('today');}
  });
}
function openBrainDump(){
  const d=today();modal(`<p class="eyebrow">Clear my head</p><h2 class="exercise-title">Get it out of your head.</h2><p class="subtle">Nothing here automatically becomes a task.</p><div class="field"><textarea id="quickDump" style="min-height:220px" placeholder="Write anything...">${esc(d.brainDump||'')}</textarea></div><div class="button-row"><button class="primary" id="saveDump">Save and close</button></div>`);$('#saveDump').addEventListener('click',()=>{d.brainDump=$('#quickDump').value;save();closeModal();toast('Head cleared a little.');});
}

function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`boudica-backup-${dateKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
}
function confirmReset(){
  modal(`<p class="eyebrow">Reset Boudica</p><h2 class="exercise-title">Clear all local data?</h2><p>This removes routines, measurements, workout history and Proof entries from this browser. It cannot be undone unless you exported a backup.</p><div class="button-row"><button class="danger" id="doReset">Clear everything</button><button class="ghost" data-close>Cancel</button></div>`);$$('[data-close]',$('#modal')).forEach(b=>b.addEventListener('click',closeModal));$('#doReset').addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);state=defaultState();closeModal();render();toast('Boudica reset.');});
}

function maybeMorningPrompt(){
  const d=today();
  if(!state.settings.morningPrompt||d.morningPromptSeen||d.social)return;
  d.morningPromptSeen=true;save();
  setTimeout(()=>{modal(`<p class="eyebrow">Morning</p><h2 class="exercise-title">Don’t give your morning away.</h2><p style="font-size:20px"><strong>No social media yet.</strong></p><p class="subtle">Keep the first part of the day yours. Then read and plan before the day gets noisy.</p><div class="button-row"><button class="primary" id="morningStart">Start morning</button><button class="ghost" id="morningReturn">I got distracted — continue</button></div>`);$('#morningStart').addEventListener('click',closeModal);$('#morningReturn').addEventListener('click',()=>{d.social=true;save();closeModal();render();toast('Continue from here.');});},250);
}

$$('[data-nav]').forEach(b=>b.addEventListener('click',()=>setRoute(b.dataset.nav)));
$('#themeToggle').addEventListener('click',()=>{state.theme=state.theme==='dark'?'light':'dark';save();applyTheme();render();});
$('#stuckButton').addEventListener('click',openStuck);
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal();});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#modal').open)closeModal();});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
applyTheme();render();maybeMorningPrompt();
