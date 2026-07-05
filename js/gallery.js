/* =====================================================================
   gallery.js — แกลเลอรีภาพกิจกรรม (อัลบั้มรูปจาก Google ไดรฟ์)
   • ยังไม่ใส่ลิงก์ชีต (CONFIG.sheets.gallery) → แสดงตัวอย่าง
   • ใส่ลิงก์แล้ว → ดึงอัลบั้มจากชีตจริง
   โครงคอลัมน์ชีต: ชื่ออัลบั้ม | วันที่ | ลิงก์อัลบั้ม | รูปปก | รายละเอียด
       - ลิงก์อัลบั้ม = ลิงก์ "โฟลเดอร์" Google ไดรฟ์ (ตั้งแชร์ "ทุกคนที่มีลิงก์")
       - รูปปก ใส่ลิงก์รูป 1 รูป (เว้นว่างได้ จะใช้พื้นหลังไล่สีแทน)
       - รายละเอียด เว้นว่างได้
   กดอัลบั้ม → เปิดดูรูปทั้งโฟลเดอร์ในเว็บเลย (ผ่าน viewer.js)
   ===================================================================== */

window.Gallery = (function () {

  const SAMPLE = [
    { 'ชื่ออัลบั้ม':'ค่ายอบรมเยาวชน First Step', 'วันที่':'25 มิ.ย. 2569', 'ลิงก์อัลบั้ม':'#', 'รูปปก':'', 'รายละเอียด':'ภาพบรรยากาศค่ายพัฒนาผู้นำและศาสนาสำหรับน้องใหม่' },
    { 'ชื่ออัลบั้ม':'ละศีลอดสัมพันธ์ รอมฎอน', 'วันที่':'10 เม.ย. 2569', 'ลิงก์อัลบั้ม':'#', 'รูปปก':'', 'รายละเอียด':'ละศีลอดร่วมกันตลอดเดือนรอมฎอน ณ มัสยิดมอ⁠ดินแดง' },
    { 'ชื่ออัลบั้ม':'กีฬาสีสัมพันธ์', 'วันที่':'20 ก.ค. 2569', 'ลิงก์อัลบั้ม':'#', 'รูปปก':'', 'รายละเอียด':'เชื่อมความสัมพันธ์พี่น้องผ่านสนามกีฬา' },
  ];
  const GRAD = ['from-green-700 to-green-900','from-gold to-gold-dark','from-green-600 to-green-800','from-green-800 to-green-950'];
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  const esc = window.esc;
  function driveId(u){ u=String(u||'').trim(); const m=u.match(/\/d\/([-\w]{20,})/)||u.match(/[?&]id=([-\w]{20,})/)||u.match(/^([-\w]{25,})$/); return m?m[1]:null; }
  function imgURL(u){ const id=driveId(u); return id?`https://lh3.googleusercontent.com/d/${id}=w800`:u; }

  function parseDate(s){ s=String(s||'').trim();
    if(/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);
    let m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if(m){let y=+m[3];if(y>2500)y-=543;return new Date(y,+m[2]-1,+m[1]);}
    const p=s.split(/\s+/); if(p.length>=3){const mi=MONTHS.indexOf(p[1]);let y=parseInt(p[2],10);if(y>2500)y-=543;if(mi>=0&&y)return new Date(y,mi,parseInt(p[0],10));}
    return null; }

  // ลิงก์อัลบั้ม: ช่องชื่อตรง หรือช่องแรกในแถวที่เป็นลิงก์โฟลเดอร์/ลิงก์ http(s)
  function albumLink(a){
    const v=a['ลิงก์อัลบั้ม']||a['ลิงก์']||'';
    if(v && v!=='#') return String(v).trim();
    for(const k in a){ if(/\/folders\//.test(String(a[k]||''))) return String(a[k]).trim(); }
    return '';
  }

  let items = SAMPLE.slice();

  function cover(a, i){
    const img=a['รูปปก'];
    // ป้ายวันที่ (ใช้คลาสชุดเดียวกับป้ายหมวดของการ์ดประกาศ — มีใน tailwind ที่คอมไพล์แล้วแน่นอน)
    const date=a['วันที่']?`<span class="absolute top-3 left-3 bg-white/95 text-green-800 text-[12px] font-kanit font-600 px-3 py-1 rounded-full"><i class="fa-regular fa-calendar mr-1"></i>${esc(a['วันที่'])}</span>`:'';
    if(img && window.safeHttp(imgURL(img))){
      return `<div class="h-44 relative overflow-hidden bg-gradient-to-br ${GRAD[i%GRAD.length]}">
        <img src="${esc(imgURL(img))}" alt="${esc(a['ชื่ออัลบั้ม']||'')}" referrerpolicy="no-referrer" loading="lazy" class="absolute inset-0 w-full h-full object-cover" onerror="this.remove()">${date}</div>`;
    }
    return `<div class="h-44 relative bg-gradient-to-br ${GRAD[i%GRAD.length]} grid place-items-center">
      <div class="absolute inset-0 islamic-pattern" style="opacity:.12"></div>
      <i class="fa-solid fa-images text-white/90 text-5xl"></i>${date}</div>`;
  }

  function card(a, i){
    const link=albumLink(a);
    const ok=link && window.safeHttp(link);
    const btn=!ok
      ? `<span class="mt-auto inline-flex items-center justify-center gap-2 bg-stone-100 text-stone-400 font-kanit font-500 text-sm px-4 py-2.5 rounded-full">ยังไม่มีลิงก์อัลบั้ม</span>`
      : (window.Viewer && Viewer.previewable(link)
        ? `<button type="button" data-url="${esc(link)}" data-title="${esc(a['ชื่ออัลบั้ม']||'อัลบั้มรูป')}" onclick="Viewer.fromBtn(this)" class="mt-auto inline-flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 text-white font-kanit font-500 text-sm px-4 py-2.5 rounded-full transition cursor-pointer"><i class="fa-solid fa-images"></i> ดูรูปทั้งอัลบั้ม</button>`
        : `<a href="${esc(link)}" target="_blank" rel="noopener" class="mt-auto inline-flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 text-white font-kanit font-500 text-sm px-4 py-2.5 rounded-full transition"><i class="fa-solid fa-images"></i> ดูรูปทั้งอัลบั้ม</a>`);
    return `<article class="lift group bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm flex flex-col">
      ${cover(a, i)}
      <div class="p-5 flex flex-col flex-1">
        <h3 class="font-kanit font-600 text-green-900 leading-snug">${esc(a['ชื่ออัลบั้ม'])}</h3>
        ${a['รายละเอียด']?`<p class="text-stone-500 text-[14px] mt-2 leading-relaxed">${esc(a['รายละเอียด'])}</p>`:''}
        <div class="mt-4 flex flex-col">${btn}</div>
      </div>
    </article>`;
  }

  function render(){
    const box=document.getElementById('galList'); if(!box) return;
    const sorted=items.slice().sort((a,b)=>(parseDate(b['วันที่'])||0)-(parseDate(a['วันที่'])||0));   // ใหม่ → เก่า
    const count=document.getElementById('galCount');
    if(count) count.textContent=sorted.length?`ทั้งหมด ${sorted.length} อัลบั้ม`:'';
    box.innerHTML=sorted.length
      ? sorted.map(card).join('')
      : `<div class="col-span-full text-center text-stone-400 py-16"><i class="fa-solid fa-images text-4xl mb-3"></i><p class="font-kanit">ยังไม่มีอัลบั้มรูปกิจกรรม</p></div>`;
  }

  async function init(){
    const url=window.CONFIG&&CONFIG.sheets&&CONFIG.sheets.gallery;
    if(!url){ render(); return; }   // ยังไม่เชื่อมชีต → ตัวอย่าง
    const box=document.getElementById('galList');
    if(box) box.innerHTML='<div class="col-span-full text-center text-stone-400 py-16"><i class="fa-solid fa-spinner fa-spin text-2xl"></i><p class="font-kanit mt-2">กำลังโหลด…</p></div>';
    try{ const rows=await Sheets.fetchRows(url); items=rows; render(); }
    catch(e){ render(); console.warn('โหลดแกลเลอรีจากชีตไม่สำเร็จ ใช้ตัวอย่างแทน', e); }
  }

  document.addEventListener('DOMContentLoaded', init);
  return {};
})();
