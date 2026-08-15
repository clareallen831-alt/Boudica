// Sunday-first workout week override for Boudica.
// Strength rotation: Week A = Sunday A, Monday B, Friday A.
// The following week flips to Sunday B, Monday A, Friday B.

(function(){
  function sundayWeekIndex(d=new Date()){
    const x=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
    x.setUTCDate(x.getUTCDate()-x.getUTCDay());
    const epochSunday=Date.UTC(1970,0,4);
    return Math.floor((x.getTime()-epochSunday)/604800000);
  }

  function firstWorkoutIsA(d=new Date()){
    return sundayWeekIndex(d)%2===0;
  }

  workoutForDate=function(d=new Date()){
    const day=d.getDay();
    if(!SCHEDULE[day].strength) return null;
    const startsWithA=firstWorkoutIsA(d);
    if(day===1) return startsWithA?'B':'A';
    return startsWithA?'A':'B';
  };

  weekPlan=function(d=new Date()){
    const startsWithA=firstWorkoutIsA(d);
    return startsWithA
      ? {Sunday:'A',Monday:'B',Friday:'A'}
      : {Sunday:'B',Monday:'A',Friday:'B'};
  };

  weeklyScheduleHtml=function(){
    const plan=weekPlan();
    return `<div class="schedule">${[0,1,2,3,4,5,6].map(day=>{
      const s=SCHEDULE[day];
      const strength=s.strength?`Workout ${plan[s.name]}`:'';
      return `<div class="schedule-row"><strong>${s.name.slice(0,3)}</strong><span>${s.movement}${strength?` · ${strength}`:''}</span>${s.away?'<span class="away">AWAY</span>':'<span></span>'}</div>`;
    }).join('')}</div>`;
  };

  const originalRenderHealth=renderHealth;
  renderHealth=function(){
    originalRenderHealth();
    const strengthHeading=[...document.querySelectorAll('.section-head h2')].find(h=>h.textContent.trim()==='Strength');
    const strengthSchedule=strengthHeading?.closest('.section')?.querySelector('.schedule');
    if(strengthSchedule){
      const rows=[...strengthSchedule.querySelectorAll('.schedule-row')];
      const byDay=Object.fromEntries(rows.map(row=>[row.querySelector('strong')?.textContent.trim(),row]));
      const ordered=['Sunday','Monday','Friday'].map(day=>byDay[day]).filter(Boolean);
      if(ordered.length===3) strengthSchedule.replaceChildren(...ordered);
    }
  };

  // app.js renders once before this override loads; refresh immediately using Sunday-first logic.
  render();
})();
