/* =====================================================================
   finance.js — การเงิน (แยกตามโครงการ + ปฏิทินรายวันกดดูได้)
   • ยังไม่ใส่ลิงก์ชีต → ใช้ตัวอย่าง | ใส่ลิงก์แล้ว → คำนวณจากชีตจริง
   โครงคอลัมน์ชีต: วันที่ | ประเภท | หมวดหมู่ | โครงการ | รายละเอียด | ราคา
       - ประเภท: รายรับ / รายจ่าย   · ราคา: ตัวเลขบาท เช่น 15000
       - รองรับชื่อเก่า "รายการ"/"จำนวน" ด้วย (ถ้าชีตเดิมยังใช้)
   ===================================================================== */

window.Finance = (function () {
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const MONTHS_FULL = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const COLORS = ['#14532D','#2E7D32','#C0A062','#D8BF8A','#236026','#A6864A','#0d3b1d'];

  // ตัวอย่าง: โครงการละศีลอดรอมฎอน (เม.ย. มีรายวันให้ดูปฏิทิน) + โครงการอื่น
  const SAMPLE = [
    { 'วันที่':'1 เม.ย. 2569','ประเภท':'รายรับ','หมวดหมู่':'บริจาค','โครงการ':'ละศีลอดรอมฎอน','รายการ':'เงินบริจาคละศีลอด','จำนวน':'5000' },
    { 'วันที่':'1 เม.ย. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'การกุศล','โครงการ':'ละศีลอดรอมฎอน','รายการ':'ค่าอาหารละศีลอด','จำนวน':'4200' },
    { 'วันที่':'3 เม.ย. 2569','ประเภท':'รายรับ','หมวดหมู่':'บริจาค','โครงการ':'ละศีลอดรอมฎอน','รายการ':'เงินบริจาคละศีลอด','จำนวน':'8000' },
    { 'วันที่':'3 เม.ย. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'การกุศล','โครงการ':'ละศีลอดรอมฎอน','รายการ':'ค่าวัตถุดิบทำอาหาร','จำนวน':'6000' },
    { 'วันที่':'5 เม.ย. 2569','ประเภท':'รายรับ','หมวดหมู่':'บริจาค','โครงการ':'ละศีลอดรอมฎอน','รายการ':'เงินบริจาคละศีลอด','จำนวน':'12000' },
    { 'วันที่':'5 เม.ย. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'การกุศล','โครงการ':'ละศีลอดรอมฎอน','รายการ':'ค่าอาหาร + น้ำดื่ม','จำนวน':'9500' },
    { 'วันที่':'8 เม.ย. 2569','ประเภท':'รายรับ','หมวดหมู่':'บริจาค','โครงการ':'ละศีลอดรอมฎอน','รายการ':'เงินบริจาคละศีลอด','จำนวน':'6500' },
    { 'วันที่':'8 เม.ย. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'การกุศล','โครงการ':'ละศีลอดรอมฎอน','รายการ':'ค่าอาหารละศีลอด','จำนวน':'7000' },
    { 'วันที่':'12 เม.ย. 2569','ประเภท':'รายรับ','หมวดหมู่':'บริจาค','โครงการ':'ละศีลอดรอมฎอน','รายการ':'เงินบริจาคละศีลอด','จำนวน':'9000' },
    { 'วันที่':'12 เม.ย. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'การกุศล','โครงการ':'ละศีลอดรอมฎอน','รายการ':'ค่าวัตถุดิบทำอาหาร','จำนวน':'8000' },
    { 'วันที่':'15 เม.ย. 2569','ประเภท':'รายรับ','หมวดหมู่':'บริจาค','โครงการ':'ละศีลอดรอมฎอน','รายการ':'เงินบริจาคละศีลอด (คืนสำคัญ)','จำนวน':'15000' },
    { 'วันที่':'15 เม.ย. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'การกุศล','โครงการ':'ละศีลอดรอมฎอน','รายการ':'ค่าอาหารเลี้ยงใหญ่','จำนวน':'11000' },
    { 'วันที่':'20 เม.ย. 2569','ประเภท':'รายรับ','หมวดหมู่':'บริจาค','โครงการ':'ละศีลอดรอมฎอน','รายการ':'เงินบริจาคละศีลอด','จำนวน':'7000' },
    { 'วันที่':'20 เม.ย. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'การกุศล','โครงการ':'ละศีลอดรอมฎอน','รายการ':'ค่าอาหารละศีลอด','จำนวน':'6500' },
    { 'วันที่':'7 มิ.ย. 2569','ประเภท':'รายรับ','หมวดหมู่':'สนับสนุน','โครงการ':'กีฬาสีสัมพันธ์','รายการ':'เงินสนับสนุนจากมหาวิทยาลัย','จำนวน':'20000' },
    { 'วันที่':'15 มิ.ย. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'กิจกรรม','โครงการ':'กีฬาสีสัมพันธ์','รายการ':'ค่าอุปกรณ์กีฬา + รางวัล','จำนวน':'14000' },
    { 'วันที่':'5 ก.ค. 2569','ประเภท':'รายรับ','หมวดหมู่':'ลงทะเบียน','โครงการ':'รับน้องใหม่','รายการ':'ค่าลงทะเบียนกิจกรรม','จำนวน':'12000' },
    { 'วันที่':'10 ก.ค. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'กิจกรรม','โครงการ':'รับน้องใหม่','รายการ':'ค่าจัดกิจกรรมรับน้อง','จำนวน':'8000' },
    { 'วันที่':'1 มิ.ย. 2569','ประเภท':'รายจ่าย','หมวดหมู่':'สาธารณูปโภค','โครงการ':'งานประจำชมรม','รายการ':'ค่าน้ำ–ไฟ ลานชมรม','จำนวน':'3150' },
  ];

  // อ่านค่าจากคอลัมน์ชื่อตรง หรือชื่อสำรอง (รองรับทั้งชื่อใหม่/เก่า)
  const pick = (r, names) => { for(const n of names){ if(r[n]!=null && String(r[n]).trim()!=='') return String(r[n]).trim(); } return ''; };
  const isIncome = r => String(r['ประเภท']).includes('รับ');
  const amount = r => parseFloat(pick(r,['ราคา','จำนวน','amount']).replace(/[^0-9.]/g,'')) || 0;   // ราคา (ชื่อใหม่) หรือ จำนวน (เก่า)
  const desc   = r => pick(r,['รายละเอียด','รายการ','description']);                                  // รายละเอียด (ใหม่) หรือ รายการ (เก่า)
  const projOf = r => r['โครงการ'] || 'งานประจำชมรม';
  const whoOf  = r => pick(r,['ผู้รับผิดชอบ','ผู้รับ','ผู้เบิก','ผู้จ่าย','responsible']);              // ผู้รับ/ผู้เบิก
  const evidOf = r => pick(r,['หลักฐาน','ใบเสร็จ','รูปใบเสร็จ','แนบไฟล์','receipt','evidence']) || pick(r, Object.keys(r).filter(k=>/^https?:/i.test(String(r[k]||''))));
  // ลิงก์หลักฐาน: ถ้าเป็นไดรฟ์ → เปิดหน้าดูไฟล์ ไม่งั้นใช้ลิงก์ตรง
  function evidLink(u){ u=String(u||'').trim(); const m=u.match(/\/d\/([-\w]{20,})/)||u.match(/[?&]id=([-\w]{20,})/); return m?`https://drive.google.com/file/d/${m[1]}/view`:u; }
  const baht = n => '฿' + Math.round(n).toLocaleString('th-TH');
  const short = n => n>=1000 ? '฿'+Math.round(n/1000)+'K' : '฿'+Math.round(n);
  const set = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v; };

  function parseDate(s){ s=String(s||'').trim();
    if(/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);                       // 2026-06-14
    let m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);                            // 14/6/2026 (ฟอร์ม Google)
    if(m){let y=+m[3];if(y>2500)y-=543;return new Date(y,+m[2]-1,+m[1]);}
    const p=s.split(/\s+/); if(p.length>=3){const mi=MONTHS.indexOf(p[1]);let y=parseInt(p[2],10);if(y>2500)y-=543;if(mi>=0&&y)return new Date(y,mi,parseInt(p[0],10));}
    return null; }
  function txIcon(r){ if(isIncome(r)) return {icon:'fa-hand-holding-dollar',box:'bg-green-50 text-green-600'};
    const c=r['หมวดหมู่']||''; if(c.includes('กุศล'))return{icon:'fa-bowl-food',box:'bg-rose-50 text-rose-500'};
    if(c.includes('ภูปโภค')||c.includes('น้ำ')||c.includes('ไฟ'))return{icon:'fa-lightbulb',box:'bg-rose-50 text-rose-500'};
    if(c.includes('ศาสนา'))return{icon:'fa-mosque',box:'bg-rose-50 text-rose-500'};
    return {icon:'fa-receipt',box:'bg-rose-50 text-rose-500'}; }
  const uniq = a => [...new Set(a.filter(x=>x!==''))];

  // ---------- สถานะ ----------
  let ALL = SAMPLE.slice();
  let fYear='all', fCat='all', fProject='all', bMode='expense';
  let calY=2026, calM=3, calSel=null, calData={};

  function years(){ const s=new Set(); ALL.forEach(r=>{const d=parseDate(r['วันที่']);if(d)s.add(d.getFullYear());}); return [...s].sort((a,b)=>b-a); }
  function cats(){ return uniq(ALL.map(r=>r['หมวดหมู่']||'อื่น ๆ')); }
  function projects(){ return uniq(ALL.map(projOf)); }

  function filtered(){
    return ALL.filter(r=>{
      if(fYear!=='all'){const d=parseDate(r['วันที่']);if(!d||d.getFullYear()!==+fYear)return false;}
      if(fCat!=='all'&&(r['หมวดหมู่']||'อื่น ๆ')!==fCat)return false;
      if(fProject!=='all'&&projOf(r)!==fProject)return false;
      return true;
    });
  }

  function fillFilters(){
    const ys=document.getElementById('finYear'),cs=document.getElementById('finCat'),ps=document.getElementById('finProject');
    if(ys) ys.innerHTML=`<option value="all">ทุกปี</option>`+years().map(y=>`<option value="${y}" ${fYear==String(y)?'selected':''}>ปี ${y+543}</option>`).join('');
    if(cs) cs.innerHTML=`<option value="all">ทุกหมวด</option>`+cats().map(c=>`<option value="${c}" ${fCat===c?'selected':''}>${c}</option>`).join('');
    if(ps) ps.innerHTML=`<option value="all">ทุกโครงการ</option>`+projects().map(p=>`<option value="${p}" ${fProject===p?'selected':''}>${p}</option>`).join('');
  }

  // ---------- การ์ดสรุป / กราฟ / โดนัท / ตาราง ----------
  function update(){
    const rows=filtered();
    const income=rows.filter(isIncome).reduce((s,r)=>s+amount(r),0);
    const expense=rows.filter(r=>!isIncome(r)).reduce((s,r)=>s+amount(r),0);
    set('finIncome',baht(income)); set('finExpense',baht(expense)); set('finBalance',baht(income-expense));
    set('finIncomeCount',rows.filter(isIncome).length+' รายการ');
    set('finExpenseCount',rows.filter(r=>!isIncome(r)).length+' รายการ');
    const sorted=rows.slice().sort((a,b)=>(parseDate(b['วันที่'])||0)-(parseDate(a['วันที่'])||0));
    if(sorted[0]) set('finUpdated',sorted[0]['วันที่']);
    renderChart(rows); renderToggle(); renderDonut(rows); renderTable(sorted.slice(0,6));
    renderProjects(rows); renderCalendar();
  }

  function renderChart(rows){
    const chart=document.getElementById('chart'); if(!chart)return;
    const m={}; rows.forEach(r=>{const d=parseDate(r['วันที่']);const k=d?d.getMonth():99;
      m[k]=m[k]||{idx:k,label:MONTHS[k]||r['วันที่'],in:0,ex:0}; if(isIncome(r))m[k].in+=amount(r)/1000;else m[k].ex+=amount(r)/1000;});
    const data=Object.values(m).sort((a,b)=>a.idx-b.idx);
    const max=Math.max(1,...data.flatMap(d=>[d.in,d.ex]))*1.1;
    chart.innerHTML=data.map((d,i)=>`<div class="flex-1 flex items-end justify-center gap-1.5 h-full">
        <div class="bar w-1/2 max-w-[22px] rounded-t-md bg-green-600" style="height:${d.in/max*100}%;animation-delay:${i*.08}s" title="รายรับ ฿${Math.round(d.in)}K"></div>
        <div class="bar w-1/2 max-w-[22px] rounded-t-md bg-gold" style="height:${d.ex/max*100}%;animation-delay:${i*.08+.04}s" title="รายจ่าย ฿${Math.round(d.ex)}K"></div>
      </div>`).join('');
    const labels=document.getElementById('chartLabels'); if(labels) labels.innerHTML=data.map(d=>`<span class="flex-1 text-center">${d.label}</span>`).join('');
    const grid=document.getElementById('chartGrid'); if(grid){let h='';for(let i=0;i<=4;i++){const pct=i/4*100,val=Math.round(max*i/4);
      h+=`<div style="position:absolute;left:0;right:0;bottom:${pct}%;border-top:1px dashed #ececec;"><span style="position:absolute;left:-2.6rem;top:-0.62em;width:2.2rem;text-align:right;font-size:11px;color:#a8a29e;">${val}K</span></div>`;}grid.innerHTML=h;}
  }

  function renderToggle(){ const box=document.getElementById('finDonutToggle'); if(!box)return;
    box.innerHTML=[['expense','รายจ่าย'],['income','รายรับ']].map(([k,t])=>{const on=k===bMode;
      return `<button onclick="Finance.setBreakdown('${k}')" class="px-3 py-1 rounded-full transition ${on?'bg-white shadow text-green-800':'text-stone-400'}">${t}</button>`;}).join(''); }

  function renderDonut(rows){
    const donut=document.getElementById('finDonut'),legend=document.getElementById('finBreakdown'),exp=bMode==='expense';
    set('finDonutTitle',exp?'สัดส่วนรายจ่าย':'สัดส่วนรายรับ'); set('finDonutLabel',exp?'รวมรายจ่าย':'รวมรายรับ');
    const subset=rows.filter(r=>exp?!isIncome(r):isIncome(r)); const total=subset.reduce((s,r)=>s+amount(r),0);
    set('finDonutTotal',short(total));
    const cat={}; subset.forEach(r=>{const c=r['หมวดหมู่']||'อื่น ๆ';cat[c]=(cat[c]||0)+amount(r);});
    const items=Object.entries(cat).map(([name,val])=>({name,val,pct:total?val/total*100:0})).sort((a,b)=>b.val-a.val);
    if(donut){let acc=0;const stops=items.map((it,i)=>{const f=acc,t=acc+it.pct;acc=t;return `${COLORS[i%COLORS.length]} ${f.toFixed(1)}% ${t.toFixed(1)}%`;}).join(',');
      donut.style.background=items.length?`conic-gradient(${stops})`:'#e7e5e4';}
    if(legend) legend.innerHTML=items.length?items.map((it,i)=>`<li class="flex items-center justify-between"><span class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm" style="background:${COLORS[i%COLORS.length]}"></span> ${it.name}</span><span class="font-kanit font-600 text-stone-700">${Math.round(it.pct)}%</span></li>`).join(''):`<li class="text-center text-stone-400 py-2">ไม่มีข้อมูล</li>`;
  }

  function renderTable(recent){ const body=document.getElementById('finTxBody'); if(!body)return;
    body.innerHTML=recent.length?recent.map(r=>{const inc=isIncome(r),st=txIcon(r),amt=(inc?'+ ':'– ')+baht(amount(r));
      const ev=evidOf(r);
      const evCell = ev ? `<a href="${evidLink(ev)}" target="_blank" rel="noopener" title="ดูหลักฐาน" class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition"><i class="fa-solid fa-receipt text-sm"></i></a>` : '<span class="text-stone-300">—</span>';
      return `<tr class="hover:bg-green-50/40 transition"><td class="px-6 py-4 flex items-center gap-3"><span class="w-9 h-9 rounded-lg ${st.box} grid place-items-center"><i class="fa-solid ${st.icon} text-sm"></i></span> ${desc(r)}</td><td class="px-6 py-4 text-stone-500">${r['หมวดหมู่']||''}</td><td class="px-6 py-4 text-stone-500">${whoOf(r)||'<span class="text-stone-300">—</span>'}</td><td class="px-6 py-4 text-stone-500">${r['วันที่']||''}</td><td class="px-6 py-4 text-right font-kanit font-600 ${inc?'text-green-600':'text-rose-500'}">${amt}</td><td class="px-6 py-4 text-center">${evCell}</td></tr>`;
    }).join(''):`<tr><td colspan="6" class="px-6 py-10 text-center text-stone-400">ไม่มีรายการในเงื่อนไขที่เลือก</td></tr>`; }

  // ---------- สรุปแยกตามโครงการ ----------
  function renderProjects(rows){
    const box=document.getElementById('finProjects'); if(!box)return;
    const map={}; rows.forEach(r=>{const p=projOf(r); map[p]=map[p]||{in:0,ex:0}; if(isIncome(r))map[p].in+=amount(r);else map[p].ex+=amount(r);});
    const items=Object.entries(map).map(([name,v])=>({name,in:v.in,ex:v.ex,net:v.in-v.ex})).sort((a,b)=>(b.in+b.ex)-(a.in+a.ex));
    if(!items.length){ box.innerHTML=`<p class="text-stone-400 col-span-full text-center py-4">ไม่มีข้อมูลโครงการ</p>`; return; }
    box.innerHTML=items.map(p=>{const tot=p.in+p.ex||1;
      return `<div>
        <div class="flex items-center justify-between mb-1.5 gap-2">
          <span class="font-kanit font-600 text-stone-800 truncate"><i class="fa-solid fa-folder text-gold-dark mr-1.5"></i>${p.name}</span>
          <span class="font-kanit font-700 shrink-0 ${p.net>=0?'text-green-700':'text-rose-600'}">${p.net>=0?'+':'−'}${baht(Math.abs(p.net))}</span>
        </div>
        <div class="h-2.5 rounded-full bg-stone-100 overflow-hidden flex"><div style="width:${p.in/tot*100}%" class="bg-green-500"></div><div style="width:${p.ex/tot*100}%" class="bg-rose-400"></div></div>
        <div class="flex justify-between text-[12px] text-stone-400 mt-1"><span>รับ ${baht(p.in)}</span><span>จ่าย ${baht(p.ex)}</span></div>
      </div>`;}).join('');
  }

  // ---------- ปฏิทินรายวัน ----------
  // รายการของเดือนที่ดูอยู่ (กรองตามหมวด/โครงการ แต่ใช้เดือน/ปีของปฏิทินเอง)
  function calRows(){
    return ALL.filter(r=>{
      if(fCat!=='all'&&(r['หมวดหมู่']||'อื่น ๆ')!==fCat)return false;
      if(fProject!=='all'&&projOf(r)!==fProject)return false;
      const d=parseDate(r['วันที่']); return d&&d.getFullYear()===calY&&d.getMonth()===calM;
    });
  }
  function renderCalendar(){
    const grid=document.getElementById('finCalGrid'); if(!grid)return;
    set('finCalLabel',`${MONTHS_FULL[calM]} ${calY+543}`);
    const rows=calRows(); calData={}; let tin=0,tex=0;
    rows.forEach(r=>{const d=parseDate(r['วันที่']),day=d.getDate(); calData[day]=calData[day]||{in:0,ex:0,items:[]};
      if(isIncome(r)){calData[day].in+=amount(r);tin+=amount(r);}else{calData[day].ex+=amount(r);tex+=amount(r);} calData[day].items.push(r);});

    const sum=document.getElementById('finCalSummary');
    if(sum) sum.innerHTML=`<span class="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-kanit font-600">รับ ${baht(tin)}</span><span class="inline-flex items-center gap-1.5 bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-sm font-kanit font-600">จ่าย ${baht(tex)}</span><span class="inline-flex items-center gap-1.5 bg-green-900 text-gold-light px-3 py-1 rounded-full text-sm font-kanit font-600">คงเหลือ ${baht(tin-tex)}</span>`;

    const first=new Date(calY,calM,1).getDay(), days=new Date(calY,calM+1,0).getDate();
    let cells=''; for(let i=0;i<first;i++) cells+=`<div></div>`;
    for(let day=1;day<=days;day++){ const b=calData[day], has=b&&(b.in||b.ex), sel=calSel===day;
      const cls='rounded-lg p-1.5 min-h-[60px] border text-left '+(has?'cursor-pointer hover:border-green-300 bg-stone-50/60 border-stone-100':'border-transparent')+(sel?' ring-2 ring-green-500':'');
      const click=has?` onclick="Finance.calDay(${day})"`:'';
      cells+=`<div class="${cls}"${click}>
        <div class="text-[12px] font-kanit ${has?'font-600 text-stone-700':'text-stone-300'}">${day}</div>
        ${b&&b.in?`<div class="text-[10px] text-green-600 leading-tight font-kanit">+${short(b.in)}</div>`:''}
        ${b&&b.ex?`<div class="text-[10px] text-rose-500 leading-tight font-kanit">−${short(b.ex)}</div>`:''}
      </div>`; }
    grid.innerHTML=cells;
    renderCalDetail();
  }
  function renderCalDetail(){
    const box=document.getElementById('finCalDetail'); if(!box)return;
    const b=calSel&&calData[calSel];
    if(!b){ box.innerHTML=''; return; }
    box.innerHTML=`<div class="bg-stone-50 rounded-xl p-4 sm:p-5">
      <p class="font-kanit font-600 text-green-900 mb-3 flex items-center gap-2"><i class="fa-regular fa-calendar-check text-gold-dark"></i> รายการวันที่ ${calSel} ${MONTHS_FULL[calM]} ${calY+543}</p>
      <div class="divide-y divide-stone-200/70">${b.items.map(it=>{const inc=isIncome(it); const ev=evidOf(it), who=whoOf(it);
        const meta=[it['โครงการ'],it['หมวดหมู่'],who?'โดย '+who:''].filter(Boolean).join(' · ');
        const evBtn=ev?`<a href="${evidLink(ev)}" target="_blank" rel="noopener" title="ดูหลักฐาน" class="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition"><i class="fa-solid fa-receipt text-sm"></i></a>`:'';
        return `<div class="flex items-center justify-between py-2.5 gap-3">
          <div class="min-w-0"><p class="font-kanit font-500 text-stone-800 truncate">${desc(it)}</p><p class="text-[12px] text-stone-400">${meta}</p></div>
          <div class="flex items-center gap-2 shrink-0"><span class="font-kanit font-600 ${inc?'text-green-600':'text-rose-500'}">${inc?'+ ':'– '}${baht(amount(it))}</span>${evBtn}</div>
        </div>`;}).join('')}</div>
      <div class="flex justify-between mt-3 pt-3 border-t border-stone-200 text-sm font-kanit font-600">
        <span class="text-green-700">รวมรับ ${baht(b.in)}</span><span class="text-rose-600">รวมจ่าย ${baht(b.ex)}</span></div>
    </div>`;
  }

  // ---------- ฟังก์ชันที่ HTML เรียก ----------
  function setYear(v){ fYear=v; update(); }
  function setCat(v){ fCat=v; update(); }
  function setProject(v){ fProject=v; update(); }
  function setBreakdown(m){ bMode=m; renderToggle(); renderDonut(filtered()); }
  function calMove(d){ calM+=d; if(calM<0){calM=11;calY--;} if(calM>11){calM=0;calY++;} calSel=null; renderCalendar(); }
  function calDay(day){ calSel=(calSel===day?null:day); renderCalendar(); }

  function exportCSV(){
    const rows=filtered(); const cell=v=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
    const head=['วันที่','ประเภท','หมวดหมู่','โครงการ','รายละเอียด','ผู้รับผิดชอบ','ราคา','หลักฐาน'];
    const getRow=r=>[r['วันที่']||'', r['ประเภท']||'', r['หมวดหมู่']||'', r['โครงการ']||'', desc(r), whoOf(r), amount(r), (evidOf(r)?evidLink(evidOf(r)):'')];
    const csv=[head.join(',')].concat(rows.map(r=>getRow(r).map(cell).join(','))).join('\r\n');
    const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='รายงานการเงินชมรม.csv';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  }
  // สร้างรายงานการเงินแบบทางการ (เอกสารพิมพ์) แล้วสั่งพิมพ์
  function printReport(){ buildReport(); window.print(); }
  function buildReport(){
    const box=document.getElementById('finReport'); if(!box) return;
    const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const rows=filtered().slice().sort((a,b)=>(parseDate(a['วันที่'])||0)-(parseDate(b['วันที่'])||0));
    const income=rows.filter(isIncome).reduce((s,r)=>s+amount(r),0);
    const expense=rows.filter(r=>!isIncome(r)).reduce((s,r)=>s+amount(r),0);
    const now=new Date(); const today=`${now.getDate()} ${MONTHS_FULL[now.getMonth()]} ${now.getFullYear()+543}`;
    const yearLabel=(YEARS.length && YEARS[curYear]) ? YEARS[curYear].label : 'รวมทุกปี';

    // สรุปตามโครงการ
    const pm={}; rows.forEach(r=>{const p=projOf(r); pm[p]=pm[p]||{in:0,ex:0}; if(isIncome(r))pm[p].in+=amount(r);else pm[p].ex+=amount(r);});
    const projRows=Object.entries(pm).sort((a,b)=>(b[1].in+b[1].ex)-(a[1].in+a[1].ex)).map(([p,v])=>
      `<tr><td style="border:1px solid #ccc;padding:6px 8px;">${esc(p)}</td><td style="border:1px solid #ccc;padding:6px 8px;text-align:right;color:#15803d;">${baht(v.in)}</td><td style="border:1px solid #ccc;padding:6px 8px;text-align:right;color:#b91c1c;">${baht(v.ex)}</td><td style="border:1px solid #ccc;padding:6px 8px;text-align:right;font-weight:700;">${baht(v.in-v.ex)}</td></tr>`).join('');

    // รายการทั้งหมด
    const txRows=rows.map(r=>{const inc=isIncome(r);
      return `<tr><td style="border:1px solid #ddd;padding:5px 8px;white-space:nowrap;">${esc(r['วันที่']||'')}</td><td style="border:1px solid #ddd;padding:5px 8px;">${esc(desc(r))}</td><td style="border:1px solid #ddd;padding:5px 8px;">${esc(r['หมวดหมู่']||'')}</td><td style="border:1px solid #ddd;padding:5px 8px;">${esc(r['โครงการ']||'')}</td><td style="border:1px solid #ddd;padding:5px 8px;">${esc(whoOf(r))}</td><td style="border:1px solid #ddd;padding:5px 8px;text-align:center;">${evidOf(r)?'✓':''}</td><td style="border:1px solid #ddd;padding:5px 8px;text-align:right;white-space:nowrap;color:${inc?'#15803d':'#b91c1c'};">${inc?'+':'−'} ${baht(amount(r))}</td></tr>`;}).join('')
      || `<tr><td colspan="7" style="border:1px solid #ddd;padding:14px;text-align:center;color:#888;">— ไม่มีรายการ —</td></tr>`;

    const th='style="background:#14532D;color:#fff;border:1px solid #14532D;padding:7px 8px;font-size:12px;text-align:left;"';
    box.innerHTML=`<div style="max-width:780px;margin:0 auto;color:#1a1a1a;font-family:'Sarabun',sans-serif;line-height:1.5;">
      <div style="display:flex;align-items:center;gap:14px;border-bottom:3px solid #14532D;padding-bottom:12px;">
        <img src="assets/img/logo.png" style="width:60px;height:60px;object-fit:contain;">
        <div><div style="font-size:19px;font-weight:700;color:#14532D;">ชมรมมุสลิม มหาวิทยาลัยขอนแก่น</div><div style="font-size:12px;color:#666;">Muslim Community, Khon Kaen University</div></div>
        <div style="margin-left:auto;text-align:right;font-size:11px;color:#666;">พิมพ์เมื่อ<br>${today}</div>
      </div>
      <h1 style="text-align:center;font-size:21px;font-weight:700;margin:20px 0 2px;">รายงานสรุปการเงิน</h1>
      <div style="text-align:center;font-size:14px;color:#555;margin-bottom:20px;">${esc(yearLabel)}</div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
        <tr>
          <td style="border:1px solid #ccc;padding:10px;text-align:center;width:33%;"><div style="font-size:12px;color:#666;">รายรับรวม</div><div style="font-size:17px;font-weight:700;color:#15803d;">${baht(income)}</div></td>
          <td style="border:1px solid #ccc;padding:10px;text-align:center;width:33%;"><div style="font-size:12px;color:#666;">รายจ่ายรวม</div><div style="font-size:17px;font-weight:700;color:#b91c1c;">${baht(expense)}</div></td>
          <td style="border:1px solid #ccc;padding:10px;text-align:center;background:#f1f7f1;"><div style="font-size:12px;color:#666;">คงเหลือสุทธิ</div><div style="font-size:17px;font-weight:700;color:#14532D;">${baht(income-expense)}</div></td>
        </tr>
      </table>

      <h2 style="font-size:15px;font-weight:700;color:#14532D;border-left:4px solid #C0A062;padding-left:8px;margin:16px 0 8px;">สรุปแยกตามโครงการ/งบ</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px;margin-bottom:20px;">
        <thead><tr><th ${th}>โครงการ/งบ</th><th ${th} style="background:#14532D;color:#fff;border:1px solid #14532D;padding:7px 8px;font-size:12px;text-align:right;">รายรับ</th><th ${th} style="background:#14532D;color:#fff;border:1px solid #14532D;padding:7px 8px;font-size:12px;text-align:right;">รายจ่าย</th><th ${th} style="background:#14532D;color:#fff;border:1px solid #14532D;padding:7px 8px;font-size:12px;text-align:right;">คงเหลือ</th></tr></thead>
        <tbody>${projRows||'<tr><td colspan="4" style="border:1px solid #ccc;padding:10px;text-align:center;color:#888;">— ไม่มีข้อมูล —</td></tr>'}</tbody>
      </table>

      <h2 style="font-size:15px;font-weight:700;color:#14532D;border-left:4px solid #C0A062;padding-left:8px;margin:16px 0 8px;">รายการทั้งหมด (${rows.length} รายการ)</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead><tr><th ${th}>วันที่</th><th ${th}>รายละเอียด</th><th ${th}>หมวดหมู่</th><th ${th}>โครงการ</th><th ${th}>ผู้รับผิดชอบ</th><th ${th} style="background:#14532D;color:#fff;border:1px solid #14532D;padding:7px 8px;font-size:12px;text-align:center;">หลักฐาน</th><th ${th} style="background:#14532D;color:#fff;border:1px solid #14532D;padding:7px 8px;font-size:12px;text-align:right;">จำนวน</th></tr></thead>
        <tbody>${txRows}</tbody>
      </table>

      <table style="width:100%;margin-top:55px;font-size:13px;text-align:center;page-break-inside:avoid;">
        <tr>
          <td style="padding:0 10px;">.............................<br><span style="color:#555;">(เหรัญญิก)</span></td>
          <td style="padding:0 10px;">.............................<br><span style="color:#555;">(ประธานชมรม)</span></td>
          <td style="padding:0 10px;">.............................<br><span style="color:#555;">(อาจารย์ที่ปรึกษา)</span></td>
        </tr>
      </table>
    </div>`;
  }

  // ตั้งเดือนเริ่มต้นของปฏิทิน = เดือนที่มีรายการมากสุด (โชว์ช่วงรอมฎอน)
  function defaultMonth(){
    const cnt={}; ALL.forEach(r=>{const d=parseDate(r['วันที่']);if(d){const k=d.getFullYear()+'-'+d.getMonth();cnt[k]=(cnt[k]||0)+1;}});
    const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];
    if(best){const [y,m]=best[0].split('-');calY=+y;calM=+m;}
  }

  // ล้างตัวเลข/กราฟตอนกำลังโหลด (กันตัวอย่างกระพริบ)
  function finLoading(){
    ['finIncome','finExpense','finBalance'].forEach(id=>set(id,'…'));
    ['finIncomeCount','finExpenseCount','finUpdated','finDonutTotal'].forEach(id=>set(id,''));
    ['chart','chartLabels','chartGrid','finBreakdown','finProjects','finCalGrid','finCalSummary','finCalDetail'].forEach(id=>{const el=document.getElementById(id); if(el) el.innerHTML='';});
  }

  // บัญชีย้อนหลัง (ปีที่ปิดบัญชีแล้ว) — แสดงเป็นรายการกดดู ฝังเฉพาะตอนกด
  let LEDGERS = [];
  function renderLedger(){
    const wrap=document.getElementById('finLedgerWrap'), list=document.getElementById('finLedgerList');
    LEDGERS = (window.CONFIG && CONFIG.pastLedgers) || [];
    if(!wrap||!list) return;
    if(!LEDGERS.length){ wrap.classList.add('hidden'); return; }
    wrap.classList.remove('hidden');
    const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    list.innerHTML=LEDGERS.map((L,i)=>`<div class="border border-stone-100 rounded-xl overflow-hidden">
      <div class="flex items-center justify-between gap-3 p-4 bg-stone-50/60 flex-wrap">
        <span class="font-kanit font-600 text-stone-700"><i class="fa-solid fa-folder-closed text-gold-dark mr-2"></i>${esc(L.label)} <span class="text-[12px] text-stone-400 font-400">· ปิดบัญชีแล้ว</span></span>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="Finance.toggleLedger(${i})" class="inline-flex items-center gap-2 font-kanit font-500 text-sm bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-full transition"><i class="fa-solid fa-table"></i> <span id="finLedgerLabel-${i}">ดูตาราง</span></button>
          <a href="${esc(String(L.url).split('?')[0])}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 font-kanit font-500 text-sm bg-white border border-stone-200 text-stone-600 hover:border-green-300 hover:text-green-700 px-4 py-2 rounded-full transition"><i class="fa-solid fa-arrow-up-right-from-square text-xs"></i> เต็มจอ</a>
        </div>
      </div>
      <div id="finLedgerBody-${i}" class="hidden"></div>
    </div>`).join('');
  }
  // กดดู/ซ่อนตาราง (โหลด iframe ตอนกดครั้งแรกเท่านั้น)
  function toggleLedger(i){
    const body=document.getElementById('finLedgerBody-'+i), label=document.getElementById('finLedgerLabel-'+i);
    if(!body) return;
    const open=body.classList.toggle('hidden')===false;
    if(open && !body.dataset.loaded){ body.innerHTML=`<iframe src="${LEDGERS[i].url}" class="w-full" style="height:560px;border:0;" loading="lazy" title="บัญชี ${LEDGERS[i].label||''}">กำลังโหลด…</iframe>`; body.dataset.loaded='1'; }
    if(label) label.textContent = open ? 'ซ่อนตาราง' : 'ดูตาราง';
  }

  // ---------- เลือกปีการศึกษา (โหลดชีตคนละปี แสดงสวยเต็มหน้าเหมือนกัน) ----------
  let YEARS = [], curYear = 0;
  function fillYearSelector(){
    YEARS = (window.CONFIG && CONFIG.financeYears) || [];
    const sel = document.getElementById('finSchoolYear');
    if(!sel) return;
    if(!YEARS.length){ sel.classList.add('hidden'); return; }
    sel.classList.remove('hidden');
    sel.innerHTML = YEARS.map((y,i)=>`<option value="${i}" ${i===curYear?'selected':''}>${y.label}</option>`).join('');
    const fy = document.getElementById('finYear');   // ซ่อนตัวกรองปี(ปฏิทิน) เพราะแต่ละชีตคือ 1 ปีแล้ว
    if(fy) fy.classList.add('hidden');
  }

  // โหลดชีตการเงิน 1 ลิงก์ แล้ววาดผล (ว่าง=ตัวอย่าง, error=ตัวอย่าง)
  async function loadFinance(url){
    if(!url){ defaultMonth(); fillFilters(); update(); return; }
    finLoading();
    try{ const rows=await Sheets.fetchRows(url); ALL=rows; fYear='all';fCat='all';fProject='all';calSel=null; defaultMonth(); fillFilters(); update(); }
    catch(e){ defaultMonth(); fillFilters(); update(); console.warn('โหลดข้อมูลการเงินจากชีตไม่สำเร็จ ใช้ข้อมูลตัวอย่างแทน', e); }
  }
  function setSchoolYear(idx){ curYear = +idx; loadFinance(YEARS[curYear] && YEARS[curYear].url); }

  async function init(){
    renderLedger();
    fillYearSelector();
    const url = YEARS.length ? YEARS[curYear].url : (window.CONFIG && CONFIG.sheets && CONFIG.sheets.finance);
    loadFinance(url);
  }

  document.addEventListener('DOMContentLoaded', init);
  return { setYear, setCat, setProject, setBreakdown, calMove, calDay, exportCSV, printReport, toggleLedger, setSchoolYear };
})();
