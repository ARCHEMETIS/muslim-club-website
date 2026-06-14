/* =====================================================================
   announcements.js — ประกาศกิจกรรม (การ์ดข่าวบนหน้าแรก)
   • ยังไม่ใส่ลิงก์ชีต (CONFIG.sheets.announcements) → ใช้การ์ดตัวอย่าง
   • ใส่ลิงก์แล้ว → ดึงประกาศจากชีตจริง
   โครงคอลัมน์ชีต: หัวข้อ | วันที่ | หมวดหมู่ | รายละเอียด | รูปภาพ | ลิงก์
       - รูปภาพ ใส่ลิงก์รูป (เว้นว่างได้ จะใช้พื้นหลังไล่สี + ไอคอนแทน)
       - ลิงก์ ใส่ลิงก์ "อ่านต่อ" (เว้นว่างได้)
   ===================================================================== */

window.Announcements = (function () {

  // ข้อมูลตัวอย่าง (ใช้เมื่อยังไม่เชื่อม Google ชีต)
  const SAMPLE = [
    { 'หัวข้อ':'ละหมาดตะรอเวียะห์ร่วมกัน คืนนี้หลังอิชาอ์', 'วันที่':'8 มิ.ย. 2569', 'หมวดหมู่':'ละหมาด',
      'รายละเอียด':'ขอเชิญพี่น้องร่วมละหมาดและฟังบรรยายธรรมโดยอาจารย์รับเชิญ ณ ห้องละหมาดของชมรม', 'รูปภาพ':'', 'ลิงก์':'' },
    { 'หัวข้อ':'โครงการแบ่งปันอาหารแก่ผู้ยากไร้', 'วันที่':'5 มิ.ย. 2569', 'หมวดหมู่':'การกุศล',
      'รายละเอียด':'รวมพลังสมาชิกเตรียมข้าวกล่อง 300 ชุด มอบให้ชุมชนรอบมัสยิด เปิดรับอาสาสมัคร', 'รูปภาพ':'', 'ลิงก์':'' },
    { 'หัวข้อ':'คลาสเรียนอัลกุรอานสำหรับเยาวชน', 'วันที่':'1 มิ.ย. 2569', 'หมวดหมู่':'เรียนรู้',
      'รายละเอียด':'เปิดรับสมัครรุ่นใหม่ ทุกวันเสาร์ 09:00–11:00 น. สอนโดยทีมครูอาสาของชมรม', 'รูปภาพ':'', 'ลิงก์':'' },
  ];

  // รูปแบบหัวการ์ด (พื้นหลังไล่สี + ไอคอน + สีป้าย) ตามหมวด
  const STYLE = {
    'ละหมาด':  { grad:'from-green-700 to-green-900', icon:'fa-hands-praying', badge:'text-green-800' },
    'การกุศล': { grad:'from-gold to-gold-dark',      icon:'fa-bowl-food',     badge:'text-gold-dark' },
    'เรียนรู้': { grad:'from-green-600 to-green-800',  icon:'fa-book-quran',    badge:'text-green-800' },
    'กิจกรรม': { grad:'from-green-700 to-green-900',  icon:'fa-calendar-star', badge:'text-green-800' },
  };
  const DEFAULT_STYLE = { grad:'from-green-700 to-green-900', icon:'fa-bullhorn', badge:'text-green-800' };

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const styleOf = c => STYLE[c] || DEFAULT_STYLE;

  // แปลงลิงก์รูปจาก Google ไดรฟ์ → ลิงก์รูปที่แสดงบนเว็บได้ (ใช้ endpoint thumbnail)
  // ลิงก์รูปแบบตรง (.jpg/.png จากที่อื่น) จะใช้ได้เลยไม่ต้องแปลง
  function driveId(u){ u=String(u||'').trim();
    const m = u.match(/\/d\/([-\w]{20,})/) || u.match(/[?&]id=([-\w]{20,})/) || u.match(/^([-\w]{25,})$/);
    return m ? m[1] : null; }
  function imgURL(u){ const id=driveId(u); return id ? `https://lh3.googleusercontent.com/d/${id}=w1200` : u; }

  // ดึงค่าจากคอลัมน์ที่ชื่อตรง หรือ "ชื่อใกล้เคียง" เผื่อหัวคอลัมน์จากฟอร์มไม่ตรงเป๊ะ
  // (เช่น "รูปภาพ(ใส่ลิ้งgoogle drive)" หรือ "ลิ้ง")
  function pick(a, exacts, includes, excludes){
    for(const n of exacts){ if(a[n]!=null && String(a[n]).trim()!=='') return a[n]; }
    for(const k in a){
      if(includes.some(w=>k.includes(w)) && !excludes.some(w=>k.includes(w)) && String(a[k]||'').trim()!=='') return a[k];
    }
    return '';
  }
  const imageOf    = a => pick(a, ['รูปภาพ'], ['รูป','ภาพ','image','photo'], []);
  const moreLinkOf = a => pick(a, ['ลิงก์','ลิ้ง','ลิงค์'], ['ลิ้ง','ลิงก์','ลิงค์','link','url','อ่านต่อ'], ['รูป','ภาพ','image','photo']);

  let items = SAMPLE.slice();

  // หัวการ์ด: ใช้รูปจริงถ้ามี ไม่งั้นใช้พื้นหลังไล่สี + ไอคอน
  function head(a) {
    const cat = a['หมวดหมู่'] || 'กิจกรรม', st = styleOf(cat);
    const badge = `<span class="absolute top-3 left-3 bg-white/95 ${st.badge} text-[12px] font-kanit font-600 px-3 py-1 rounded-full">${esc(cat)}</span>`;
    const img = imageOf(a);
    if (img) {
      // ใช้ <img> + referrerpolicy="no-referrer" เพื่อให้รูป Google ไดรฟ์แสดงได้ในเบราว์เซอร์
      // (พื้นหลังไล่สีเป็นตัวสำรองถ้ารูปโหลดไม่ได้)
      return `<div class="h-44 relative overflow-hidden bg-gradient-to-br ${st.grad}">
        <img src="${esc(imgURL(img))}" alt="${esc(a['หัวข้อ']||'')}" referrerpolicy="no-referrer" loading="lazy" class="absolute inset-0 w-full h-full object-cover" onerror="this.remove()">
        ${badge}</div>`;
    }
    return `<div class="h-44 bg-gradient-to-br ${st.grad} relative grid place-items-center">
      <div class="absolute inset-0 islamic-pattern" style="opacity:.12"></div>
      <i class="fa-solid ${st.icon} text-white/90 text-5xl"></i>${badge}</div>`;
  }

  function card(a) {
    const more = moreLinkOf(a);
    const link = more && more !== '#'
      ? `<a href="${esc(more)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 text-green-700 font-kanit font-500 mt-4 hover:gap-3 transition-all">อ่านต่อ <i class="fa-solid fa-arrow-right text-xs"></i></a>`
      : '';
    return `<article class="lift bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
      ${head(a)}
      <div class="p-5">
        <p class="text-[12px] text-stone-400 flex items-center gap-2"><i class="fa-regular fa-calendar"></i> ${esc(a['วันที่'])}</p>
        <h3 class="font-kanit font-600 text-lg text-green-900 mt-2 leading-snug">${esc(a['หัวข้อ'])}</h3>
        <p class="text-stone-500 text-[15px] mt-2 leading-relaxed">${esc(a['รายละเอียด'])}</p>
        ${link}
      </div>
    </article>`;
  }

  function renderAddBtn() {
    const box = document.getElementById('annAddBtn');
    if (!box) return;
    const form = window.CONFIG && CONFIG.forms && CONFIG.forms.announcements;
    box.innerHTML = form
      ? `<a href="${esc(form)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white text-sm font-kanit font-500 px-4 py-2 rounded-full transition"><i class="fa-solid fa-plus"></i> เพิ่มประกาศ</a>`
      : '';
  }

  function render() {
    const box = document.getElementById('annList');
    if (!box) return;
    box.innerHTML = items.length
      ? items.map(card).join('')
      : `<div class="col-span-full text-center text-stone-400 py-12"><i class="fa-solid fa-bullhorn text-3xl mb-3"></i><p class="font-kanit">ยังไม่มีประกาศในขณะนี้</p></div>`;
    // ปุ่ม "เพิ่มประกาศ" ย้ายไปหน้าทีมงาน (team.html) เพื่อความปลอดภัย
  }

  // โครงโหลด (กันการ์ดตัวอย่างกระพริบก่อนข้อมูลจริงมา)
  function loading() {
    const box = document.getElementById('annList');
    if (!box) return;
    box.innerHTML = Array(3).fill(`<div class="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm animate-pulse">
      <div class="h-44 bg-stone-100"></div>
      <div class="p-5 space-y-3"><div class="h-3 w-24 bg-stone-100 rounded"></div><div class="h-5 w-3/4 bg-stone-100 rounded"></div><div class="h-3 w-full bg-stone-100 rounded"></div><div class="h-3 w-5/6 bg-stone-100 rounded"></div></div>
    </div>`).join('');
  }

  async function init() {
    const url = window.CONFIG && CONFIG.sheets && CONFIG.sheets.announcements;
    if (!url) { render(); return; }   // ยังไม่เชื่อมชีต → โชว์ตัวอย่าง
    loading();                         // เชื่อมชีตแล้ว → โชว์โครงโหลด ไม่ใช่ตัวอย่าง
    try {
      const rows = await Sheets.fetchRows(url);
      items = rows;
      render();
    } catch (e) {
      render();   // เน็ตหลุด → ค่อย fallback เป็นตัวอย่าง
      console.warn('โหลดประกาศจากชีตไม่สำเร็จ ใช้การ์ดตัวอย่างแทน', e);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  return {};
})();
