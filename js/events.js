/* =====================================================================
   events.js — ตารางกิจกรรม (Timeline + นับถอยหลัง + ติดตามงานแต่ละฝ่าย)
   • ยังไม่ใส่ลิงก์ชีต (CONFIG.sheets.events) → แสดงตัวอย่าง
   • ใส่ลิงก์แล้ว → ดึงจากชีตจริง
   โครงคอลัมน์ชีต (1 แถว = 1 งานของฝ่าย — ชื่อกิจกรรมซ้ำได้):
     ชื่อกิจกรรม | วันที่ | สถานที่ | รายละเอียด | ฝ่าย | หน้าที่ | สถานะ
       - สถานะ: เสร็จ / กำลังทำ / ยัง
       - สถานที่/รายละเอียด ใส่แถวไหนของกิจกรรมก็ได้ (เว็บดึงให้เอง)
   ===================================================================== */

window.Events = (function () {
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  const SAMPLE = [
    { 'ชื่อกิจกรรม':'ค่ายอบรมเยาวชน First Step', 'วันที่':'25/6/2026', 'สถานที่':'อาคารกิจกรรมนักศึกษา', 'รายละเอียด':'ค่ายพัฒนาผู้นำและศาสนาสำหรับน้องใหม่', 'ฝ่าย':'ฝ่ายวิชาการ', 'หน้าที่':'เตรียมเนื้อหา', 'เดดไลน์':'15/6/2026', 'สถานะ':'เสร็จ' },
    { 'ชื่อกิจกรรม':'ค่ายอบรมเยาวชน First Step', 'วันที่':'25/6/2026', 'สถานที่':'', 'รายละเอียด':'', 'ฝ่าย':'ฝ่ายวิชาการ', 'หน้าที่':'ติดต่อวิทยากร', 'เดดไลน์':'18/6/2026', 'สถานะ':'กำลังทำ' },
    { 'ชื่อกิจกรรม':'ค่ายอบรมเยาวชน First Step', 'วันที่':'25/6/2026', 'สถานที่':'', 'รายละเอียด':'', 'ฝ่าย':'ฝ่ายกิจกรรม', 'หน้าที่':'จัดสถานที่/ฐานกิจกรรม', 'เดดไลน์':'22/6/2026', 'สถานะ':'กำลังทำ' },
    { 'ชื่อกิจกรรม':'ค่ายอบรมเยาวชน First Step', 'วันที่':'25/6/2026', 'สถานที่':'', 'รายละเอียด':'', 'ฝ่าย':'ฝ่ายการเงิน', 'หน้าที่':'จัดสรรงบประมาณ', 'เดดไลน์':'12/6/2026', 'สถานะ':'ยัง' },
    { 'ชื่อกิจกรรม':'กีฬาสีสัมพันธ์', 'วันที่':'20/7/2026', 'สถานที่':'สนามกีฬากลาง มข.', 'รายละเอียด':'กีฬาเชื่อมสัมพันธ์ระหว่างสมาชิก', 'ฝ่าย':'ฝ่ายกิจกรรม', 'หน้าที่':'จัดการแข่งขัน', 'เดดไลน์':'15/7/2026', 'สถานะ':'กำลังทำ' },
    { 'ชื่อกิจกรรม':'กีฬาสีสัมพันธ์', 'วันที่':'20/7/2026', 'สถานที่':'', 'รายละเอียด':'', 'ฝ่าย':'ฝ่ายประชาสัมพันธ์', 'หน้าที่':'ออกแบบสื่อ/โปสเตอร์', 'เดดไลน์':'10/7/2026', 'สถานะ':'ยัง' },
    { 'ชื่อกิจกรรม':'โครงการละศีลอดสัมพันธ์', 'วันที่':'10/4/2026', 'สถานที่':'มัสยิด มอดินแดง', 'รายละเอียด':'ละศีลอดร่วมกันตลอดเดือนรอมฎอน', 'ฝ่าย':'ฝ่ายการกุศล', 'หน้าที่':'จัดเตรียมอาหาร', 'เดดไลน์':'', 'สถานะ':'เสร็จ' },
  ];

  const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  function parseDate(s){ s=String(s||'').trim();
    if(/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);
    let m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if(m){let y=+m[3];if(y>2500)y-=543;return new Date(y,+m[2]-1,+m[1]);}
    const p=s.split(/\s+/); if(p.length>=3){const mi=MONTHS.indexOf(p[1]);let y=parseInt(p[2],10);if(y>2500)y-=543;if(mi>=0&&y)return new Date(y,mi,parseInt(p[0],10));}
    return null; }
  function fmtDate(d){ return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()+543}` : ''; }
  function fmtShort(d){ return d ? `${d.getDate()} ${MONTHS[d.getMonth()]}` : ''; }
  function daysUntil(d){ const t0=new Date();t0.setHours(0,0,0,0); const t=new Date(d);t.setHours(0,0,0,0); return Math.round((t-t0)/86400000); }

  // "เสร็จ" = ข้อความ เสร็จ/done หรือ checkbox ติ๊ก (TRUE/✓/ใช่)
  const isDone = s => /^(เสร็จ.*|done|สมบูรณ.*|true|ใช่|✓|✅)$/i.test(String(s||'').trim());
  function statusOf(s){ s=String(s||'').trim();
    if(isDone(s)) return {label:'เสร็จ', cls:'bg-green-50 text-green-700', icon:'fa-circle-check'};
    if(/กำลัง|ทำอยู่|progress|⏳/i.test(s)) return {label:'กำลังทำ', cls:'bg-amber-50 text-amber-600', icon:'fa-spinner'};
    if(s==='' || /^(false|ไม่|ยัง.*)$/i.test(s)) return {label:'ยังไม่เริ่ม', cls:'bg-stone-100 text-stone-400', icon:'fa-circle'};
    return {label: s, cls:'bg-stone-100 text-stone-400', icon:'fa-circle'};
  }

  let events = group(SAMPLE);

  function group(rows){
    const map={};
    rows.forEach(r=>{ const name=(r['ชื่อกิจกรรม']||r['กิจกรรม']||'').trim(); if(!name) return;
      const g=map[name]||(map[name]={name, date:'', location:'', desc:'', tasks:[]});
      if(!g.date && r['วันที่']) g.date=r['วันที่'];
      if(!g.location && r['สถานที่']) g.location=r['สถานที่'];
      if(!g.desc && r['รายละเอียด']) g.desc=r['รายละเอียด'];
      if((r['ฝ่าย']||'').trim()||(r['หน้าที่']||'').trim()) g.tasks.push({dept:(r['ฝ่าย']||'').trim(), task:(r['หน้าที่']||'').trim(), status:r['สถานะ']||'', deadline:String(r['เดดไลน์']||r['เดทไลน์']||r['กำหนดส่ง']||r['กำหนดเสร็จ']||r['Deadline']||'').trim()});
    });
    return Object.values(map).map(g=>{ g._d=parseDate(g.date); return g; });
  }

  // นับถอยหลัง
  function countdown(g){
    if(!g._d) return '';
    const n=daysUntil(g._d);
    if(n>0)  return `<span class="shrink-0 inline-flex items-center gap-1.5 bg-gold/15 text-gold-dark font-kanit font-600 text-sm px-3 py-1 rounded-full"><i class="fa-regular fa-clock"></i> เหลืออีก ${n} วัน</span>`;
    if(n===0)return `<span class="shrink-0 inline-flex items-center gap-1.5 bg-rose-100 text-rose-600 font-kanit font-600 text-sm px-3 py-1 rounded-full animate-pulse"><i class="fa-solid fa-fire"></i> วันนี้!</span>`;
    return `<span class="shrink-0 inline-flex items-center gap-1.5 bg-stone-100 text-stone-400 font-kanit font-500 text-sm px-3 py-1 rounded-full">ผ่านไปแล้ว ${-n} วัน</span>`;
  }

  // ป้ายเดดไลน์ของแต่ละหน้าที่ (สีตามความเร่งด่วน · งานเสร็จแล้วเป็นสีจาง)
  function deadlineChip(t){
    const d=parseDate(t.deadline); if(!d) return '';
    if(isDone(t.status)) return `<span class="shrink-0 inline-flex items-center gap-1 bg-stone-100 text-stone-400 font-kanit text-[11px] px-2 py-0.5 rounded-full"><i class="fa-regular fa-flag"></i> ${fmtShort(d)}</span>`;
    const n=daysUntil(d);
    let cls='bg-stone-100 text-stone-500', txt=`ครบ ${fmtShort(d)}`, extra='';
    if(n<0){ cls='bg-rose-100 text-rose-700'; txt=`เลยกำหนด ${-n} วัน`; }
    else if(n===0){ cls='bg-rose-100 text-rose-700'; txt='ครบกำหนดวันนี้!'; extra=' animate-pulse'; }
    else if(n<=3){ cls='bg-orange-50 text-orange-600'; txt=`อีก ${n} วัน (${fmtShort(d)})`; }
    return `<span class="shrink-0 inline-flex items-center gap-1 ${cls}${extra} font-kanit font-500 text-[11px] px-2 py-0.5 rounded-full"><i class="fa-regular fa-flag"></i> ${txt}</span>`;
  }

  // จัดกลุ่มหน้าที่ตาม "ฝ่าย" → ฝ่ายมีหลายหน้าที่ก็โชว์ชื่อฝ่ายครั้งเดียว แล้วไล่เป็นข้อ ๆ
  function deptBlocks(g){
    const map={}, order=[];
    g.tasks.forEach(t=>{ const k=t.dept||'อื่น ๆ'; if(!map[k]){map[k]=[];order.push(k);} map[k].push(t); });
    return order.map(dept=>{ const tasks=map[dept]; const done=tasks.filter(t=>isDone(t.status)).length;
      return `<div class="py-2.5 border-b border-stone-100 last:border-0">
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="font-kanit font-600 text-stone-700 text-sm flex items-center gap-1.5"><i class="fa-solid fa-users-gear text-gold-dark text-xs"></i> ${esc(dept)}</span>
          ${tasks.length>1?`<span class="text-[11px] text-stone-400 font-kanit shrink-0">${done}/${tasks.length} เสร็จ</span>`:''}
        </div>
        <div class="pl-5 space-y-1.5">${tasks.map(t=>{ const st=statusOf(t.status);
          return `<div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="text-[13px] text-stone-500 min-w-0 flex items-center gap-1.5"><i class="fa-solid fa-angle-right text-stone-300 text-[10px]"></i> ${t.task?esc(t.task):'<span class="text-stone-300">—</span>'}</span>
            <span class="flex items-center gap-1.5 shrink-0">${deadlineChip(t)}<span class="inline-flex items-center gap-1 ${st.cls} font-kanit font-500 text-[11px] px-2 py-0.5 rounded-full"><i class="fa-solid ${st.icon} text-[10px]"></i> ${st.label}</span></span>
          </div>`;}).join('')}</div>
      </div>`;
    }).join('');
  }

  function progress(g){
    if(!g.tasks.length) return '';
    const done=g.tasks.filter(t=>isDone(t.status)).length;
    const pct=Math.round(done/g.tasks.length*100);
    return `<div class="mt-3"><div class="flex justify-between text-[12px] text-stone-400 mb-1"><span>ความคืบหน้า</span><span>${done}/${g.tasks.length} งานเสร็จ</span></div>
      <div class="h-2 rounded-full bg-stone-100 overflow-hidden"><div class="h-full bg-green-600 rounded-full" style="width:${pct}%"></div></div></div>`;
  }

  function item(g, isPast){
    const dotCls = isPast ? 'bg-stone-300 ring-stone-100' : 'bg-green-700 ring-green-50';
    return `<div class="relative pl-8 pb-7 border-l-2 ${isPast?'border-stone-100':'border-green-100'} last:border-l-transparent last:pb-0">
      <span class="absolute -left-[9px] top-1 w-4 h-4 rounded-full ${dotCls} ring-4"></span>
      <div class="bg-white rounded-2xl border border-stone-100 shadow-sm p-5 ${isPast?'opacity-80':''}">
        <div class="flex items-start justify-between gap-3 flex-wrap">
          <div class="min-w-0">
            <h3 class="font-kanit font-600 text-lg text-green-900">${esc(g.name)}</h3>
            <p class="text-[13px] text-stone-400 mt-0.5 flex items-center gap-3 flex-wrap">
              <span class="flex items-center gap-1.5"><i class="fa-regular fa-calendar"></i> ${esc(fmtDate(g._d)||g.date)}</span>
              ${g.location?`<span class="flex items-center gap-1.5"><i class="fa-solid fa-location-dot"></i> ${esc(g.location)}</span>`:''}
            </p>
          </div>
          ${countdown(g)}
        </div>
        ${g.desc?`<p class="text-stone-500 text-[14px] mt-2 leading-relaxed">${esc(g.desc)}</p>`:''}
        ${progress(g)}
        ${g.tasks.length?`<div class="mt-4 bg-stone-50/70 rounded-xl p-3"><p class="text-[12px] font-kanit font-600 text-stone-500 mb-1 flex items-center gap-1.5"><i class="fa-solid fa-list-check text-gold-dark"></i> ฝ่ายรับผิดชอบ & เดดไลน์</p>${deptBlocks(g)}</div>`:''}
      </div>
    </div>`;
  }

  function render(){
    const up=document.getElementById('evUpcoming'), past=document.getElementById('evPast');
    const upcoming = events.filter(g=>g._d && daysUntil(g._d)>=0).sort((a,b)=>a._d-b._d);
    const done = events.filter(g=>!g._d || daysUntil(g._d)<0).sort((a,b)=>(b._d||0)-(a._d||0));
    if(up) up.innerHTML = upcoming.length ? upcoming.map(g=>item(g,false)).join('')
      : '<p class="text-stone-400 py-6 font-kanit">ยังไม่มีกิจกรรมที่กำลังจะมาถึง</p>';
    if(past){
      past.innerHTML = done.length ? done.map(g=>item(g,true)).join('') : '';
      const wrap=document.getElementById('evPastWrap'); if(wrap) wrap.style.display = done.length?'':'none';
    }
    const c=document.getElementById('evUpcomingCount'); if(c) c.textContent = upcoming.length ? `${upcoming.length} กิจกรรมกำลังจะมาถึง` : '';
  }

  async function init(){
    const url=window.CONFIG&&CONFIG.sheets&&CONFIG.sheets.events;
    if(!url){ render(); return; }
    const up=document.getElementById('evUpcoming'); if(up) up.innerHTML='<div class="text-center text-stone-400 py-12"><i class="fa-solid fa-spinner fa-spin text-2xl"></i><p class="font-kanit mt-2">กำลังโหลด…</p></div>';
    try{ const rows=await Sheets.fetchRows(url); events=group(rows); render(); }
    catch(e){ render(); console.warn('โหลดตารางกิจกรรมจากชีตไม่สำเร็จ ใช้ตัวอย่างแทน', e); }
  }

  document.addEventListener('DOMContentLoaded', init);
  return {};
})();
