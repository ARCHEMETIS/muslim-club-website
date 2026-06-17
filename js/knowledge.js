/* =====================================================================
   knowledge.js — คลังความรู้ (สื่อการเรียนรู้ศาสนา)
   • ยังไม่ใส่ลิงก์ชีต (CONFIG.sheets.knowledge) → แสดงตัวอย่าง
   • ใส่ลิงก์แล้ว → ดึงจากชีตจริง
   โครงคอลัมน์ชีต: ชื่อเรื่อง | หมวด | ผู้บรรยาย | รายละเอียด | ลิงก์ | รูปปก | วันที่
       - หมวด: สรุปฮาลาเกาะห์ / หนังสือ / บทความ / วิดีโอ / เสียงบรรยาย / อื่น ๆ
       - ผู้บรรยาย/รายละเอียด/รูปปก/วันที่ เว้นว่างได้
   ===================================================================== */

window.Knowledge = (function () {

  const SAMPLE = [
    { 'ชื่อเรื่อง':'สรุปฮาลาเกาะห์: หลักศรัทธา 6 ประการ', 'หมวด':'สรุปฮาลาเกาะห์', 'ผู้บรรยาย':'อ.อับดุลเลาะห์', 'รายละเอียด':'สรุปสาระสำคัญเรื่องอีหม่านและหลักศรัทธาทั้ง 6 จากวงฮาลาเกาะห์ประจำสัปดาห์', 'ลิงก์':'#', 'รูปปก':'', 'วันที่':'10 มิ.ย. 2569' },
    { 'ชื่อเรื่อง':'คู่มือละหมาดที่ถูกต้อง (ไทย–อาหรับ)', 'หมวด':'หนังสือ', 'ผู้บรรยาย':'', 'รายละเอียด':'หนังสือคู่มือการละหมาดพร้อมคำอ่านและคำแปล เหมาะสำหรับผู้เริ่มต้น', 'ลิงก์':'#', 'รูปปก':'', 'วันที่':'2 พ.ค. 2569' },
    { 'ชื่อเรื่อง':'มารยาทการเป็นนักศึกษามุสลิม', 'หมวด':'บทความ', 'ผู้บรรยาย':'ทีมวิชาการ', 'รายละเอียด':'บทความสั้นว่าด้วยการวางตัวและจริยธรรมในรั้วมหาวิทยาลัย', 'ลิงก์':'#', 'รูปปก':'', 'วันที่':'20 พ.ค. 2569' },
    { 'ชื่อเรื่อง':'บรรยายธรรม: ความสำคัญของญามาอะห์', 'หมวด':'วิดีโอ', 'ผู้บรรยาย':'อ.รับเชิญ', 'รายละเอียด':'คลิปบรรยายธรรมในกิจกรรมประจำเดือนของชมรม', 'ลิงก์':'#', 'รูปปก':'', 'วันที่':'15 พ.ค. 2569' },
    { 'ชื่อเรื่อง':'เสียงอ่านอัลกุรอาน ซูเราะฮ์อัลฟาติฮะฮ์', 'หมวด':'เสียงบรรยาย', 'ผู้บรรยาย':'', 'รายละเอียด':'ไฟล์เสียงสำหรับฝึกอ่านตามทีละอายะฮ์', 'ลิงก์':'#', 'รูปปก':'', 'วันที่':'1 พ.ค. 2569' },
  ];

  // หมวด → ไอคอน, สีไล่พื้นหลัง, คำบนปุ่ม
  const TYPE = {
    'สรุปฮาลาเกาะห์': { icon:'fa-book-open',  grad:'from-green-700 to-green-900', cta:'อ่านสรุป' },
    'หนังสือ':        { icon:'fa-book',       grad:'from-green-800 to-green-950', cta:'อ่านหนังสือ' },
    'บทความ':         { icon:'fa-file-lines', grad:'from-green-600 to-green-800', cta:'อ่านบทความ' },
    'วิดีโอ':         { icon:'fa-play',       grad:'from-gold to-gold-dark',      cta:'ดูวิดีโอ' },
    'เสียงบรรยาย':    { icon:'fa-headphones', grad:'from-green-700 to-green-900', cta:'ฟังเสียง' },
  };
  const DEFAULT_TYPE = { icon:'fa-graduation-cap', grad:'from-green-700 to-green-900', cta:'เปิด' };

  const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const typeOf = c => TYPE[c] || DEFAULT_TYPE;
  function driveId(u){ const m=String(u).match(/\/d\/([-\w]{20,})/)||String(u).match(/[?&]id=([-\w]{20,})/)||String(u).match(/^([-\w]{25,})$/); return m?m[1]:null; }
  function imgURL(u){ const id=driveId(u); return id?`https://lh3.googleusercontent.com/d/${id}=w800`:u; }
  function openLink(u){ const id=driveId(u); return id?`https://drive.google.com/file/d/${id}/view`:u; }

  let items = SAMPLE.slice();
  let activeCat = 'ทั้งหมด';
  let term = '';

  function categories(){ const s=[]; items.forEach(k=>{const c=k['หมวด']||'อื่น ๆ'; if(!s.includes(c)) s.push(c);}); return s; }
  function countIn(cat){ return cat==='ทั้งหมด'?items.length:items.filter(k=>(k['หมวด']||'อื่น ๆ')===cat).length; }

  function renderChips(){
    const box=document.getElementById('kbChips'); if(!box)return;
    box.innerHTML=['ทั้งหมด',...categories()].map(c=>{
      const on=c===activeCat, cls=on?'bg-green-800 text-white':'bg-white border border-stone-200 text-stone-600 hover:border-green-300 hover:text-green-700';
      return `<button onclick="Knowledge.filter('${esc(c)}')" class="font-kanit font-500 text-sm px-4 py-2 rounded-full transition ${cls}">${esc(c)} <span class="${on?'text-white/70':'text-stone-400'}">${countIn(c)}</span></button>`;
    }).join('');
  }

  function cover(k){
    const t=typeOf(k['หมวด']), img=k['รูปปก'];
    const badge=`<span class="absolute top-3 left-3 bg-white/95 text-green-800 text-[12px] font-kanit font-600 px-3 py-1 rounded-full">${esc(k['หมวด']||'อื่น ๆ')}</span>`;
    if(img){ return `<div class="h-40 relative overflow-hidden bg-gradient-to-br ${t.grad}"><img src="${esc(imgURL(img))}" alt="${esc(k['ชื่อเรื่อง']||'')}" referrerpolicy="no-referrer" loading="lazy" class="absolute inset-0 w-full h-full object-cover" onerror="this.remove()">${badge}</div>`; }
    return `<div class="h-40 bg-gradient-to-br ${t.grad} relative grid place-items-center"><div class="absolute inset-0 islamic-pattern" style="opacity:.12"></div><i class="fa-solid ${t.icon} text-white/90 text-4xl"></i>${badge}</div>`;
  }

  // หาตัวสื่อ: ไฟล์อัป (คอลัมน์ที่ชื่อมี ไฟล์/pdf/เอกสาร/แนบ/file) มาก่อน แล้วค่อย "ลิงก์"
  function resourceOf(k){
    for(const key in k){ if(/ไฟล์|pdf|เอกสาร|แนบ|อัปโหลด|file/i.test(key) && /^https?:/i.test(String(k[key]||''))) return String(k[key]).trim(); }
    if(k['ลิงก์'] && k['ลิงก์']!=='#') return String(k['ลิงก์']).trim();
    for(const key in k){ if(/^https?:/i.test(String(k[key]||''))) return String(k[key]).trim(); }
    return '';
  }

  function card(k){
    const t=typeOf(k['หมวด']);
    const res=resourceOf(k);
    const author=k['ผู้บรรยาย']?`<p class="text-[12px] text-stone-400 flex items-center gap-1.5 mt-1"><i class="fa-solid fa-user-pen"></i> ${esc(k['ผู้บรรยาย'])}</p>`:'';
    const ctaCls='mt-auto inline-flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 text-white font-kanit font-500 text-sm px-4 py-2.5 rounded-full transition cursor-pointer';
    const btn = !res
      ? `<span class="mt-auto inline-flex items-center justify-center gap-2 bg-stone-100 text-stone-400 font-kanit font-500 text-sm px-4 py-2.5 rounded-full">ยังไม่มีสื่อ</span>`
      : (window.Viewer && Viewer.previewable(res)
        ? `<button type="button" data-url="${esc(res)}" data-title="${esc(k['ชื่อเรื่อง']||'')}" onclick="Viewer.fromBtn(this)" class="${ctaCls}"><i class="fa-solid ${t.icon}"></i> ${t.cta}</button>`
        : `<a href="${esc(openLink(res))}" target="_blank" rel="noopener" class="${ctaCls}"><i class="fa-solid ${t.icon}"></i> ${t.cta}</a>`);
    return `<article class="lift bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm flex flex-col">
      ${cover(k)}
      <div class="p-5 flex flex-col flex-1">
        <h3 class="font-kanit font-600 text-green-900 leading-snug">${esc(k['ชื่อเรื่อง'])}</h3>
        ${author}
        ${k['รายละเอียด']?`<p class="text-stone-500 text-[14px] mt-2 leading-relaxed">${esc(k['รายละเอียด'])}</p>`:''}
        <div class="mt-4 flex flex-col">${btn}</div>
      </div>
    </article>`;
  }

  function render(){
    const box=document.getElementById('kbList'); if(!box)return;
    const q=term.trim().toLowerCase();
    const shown=items.filter(k=>
      (activeCat==='ทั้งหมด'||(k['หมวด']||'อื่น ๆ')===activeCat) &&
      (!q || String(k['ชื่อเรื่อง']||'').toLowerCase().includes(q) || String(k['ผู้บรรยาย']||'').toLowerCase().includes(q) || String(k['รายละเอียด']||'').toLowerCase().includes(q))
    );
    const count=document.getElementById('kbCount');
    if(count) count.textContent = q?`พบ ${shown.length} รายการ จากคำค้น “${term.trim()}”`:`ทั้งหมด ${shown.length} รายการ`;
    const emptyMsg = items.length===0 ? 'ยังไม่มีสื่อในคลังความรู้' : 'ไม่พบสื่อที่ตรงกับการค้นหา';
    box.innerHTML = shown.length
      ? shown.map(card).join('')
      : `<div class="col-span-full text-center text-stone-400 py-16"><i class="fa-solid fa-book-open text-4xl mb-3"></i><p class="font-kanit">${emptyMsg}</p></div>`;
  }

  function renderAll(){ renderChips(); render(); }

  // ฟังก์ชันที่ HTML เรียก
  function filter(cat){ activeCat=cat; renderChips(); render(); }
  function search(v){ term=v; render(); }

  async function init(){
    const url=window.CONFIG&&CONFIG.sheets&&CONFIG.sheets.knowledge;
    if(!url){ renderAll(); return; }   // ยังไม่เชื่อมชีต → ตัวอย่าง
    const box=document.getElementById('kbList');   // เชื่อมแล้ว → กำลังโหลด ไม่ใช่ตัวอย่าง
    if(box) box.innerHTML='<div class="col-span-full text-center text-stone-400 py-16"><i class="fa-solid fa-spinner fa-spin text-2xl"></i><p class="font-kanit mt-2">กำลังโหลด…</p></div>';
    try{ const rows=await Sheets.fetchRows(url); items=rows; activeCat='ทั้งหมด'; renderAll(); }
    catch(e){ renderAll(); console.warn('โหลดคลังความรู้จากชีตไม่สำเร็จ ใช้ตัวอย่างแทน', e); }
  }

  document.addEventListener('DOMContentLoaded', init);
  return { filter, search };
})();
