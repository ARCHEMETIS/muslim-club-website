/* =====================================================================
   committee.js — ทำเนียบคณะกรรมการ (หน้าติดต่อเรา)
   • ยังไม่ใส่ลิงก์ชีต (CONFIG.sheets.committee) → แสดงตัวอย่าง
   • ใส่ลิงก์แล้ว → ดึงรายชื่อกรรมการจากชีตจริง (เปลี่ยนคนได้ทุกปีโดยไม่ต้องแก้โค้ด)
   โครงคอลัมน์ชีต: ชื่อ | ตำแหน่ง | เบอร์โทร | อีเมล | ไลน์ | รูปภาพ
       - เบอร์โทร/อีเมล/ไลน์/รูปภาพ เว้นว่างได้ (ไอคอนที่ไม่มีข้อมูลจะถูกซ่อน)
       - รูปภาพ เว้นว่าง = ใช้ตัวอักษรแรกของชื่อบนวงกลมไล่สีแทน
   ===================================================================== */

window.Committee = (function () {

  const SAMPLE = [
    { 'ชื่อ':'อ.อับดุลเลาะห์ ยูซุฟ', 'ตำแหน่ง':'ประธานชมรม', 'เบอร์โทร':'', 'อีเมล':'', 'ไลน์':'', 'รูปภาพ':'' },
    { 'ชื่อ':'ฟาติมะห์ อิบรอฮีม', 'ตำแหน่ง':'รองประธาน', 'เบอร์โทร':'', 'อีเมล':'', 'ไลน์':'', 'รูปภาพ':'' },
    { 'ชื่อ':'มูฮัมหมัด สะและ', 'ตำแหน่ง':'เหรัญญิก', 'เบอร์โทร':'', 'อีเมล':'', 'ไลน์':'', 'รูปภาพ':'' },
    { 'ชื่อ':'ซากีนะห์ อาลี', 'ตำแหน่ง':'เลขานุการ', 'เบอร์โทร':'', 'อีเมล':'', 'ไลน์':'', 'รูปภาพ':'' },
  ];
  const GRAD = ['from-green-700 to-green-900', 'from-gold to-gold-dark', 'from-green-600 to-green-800', 'from-green-800 to-green-950'];

  const esc = window.esc;
  function driveId(u){ u=String(u||'').trim(); const m=u.match(/\/d\/([-\w]{20,})/)||u.match(/[?&]id=([-\w]{20,})/)||u.match(/^([-\w]{25,})$/); return m?m[1]:null; }
  function imgURL(u){ const id=driveId(u); return id?`https://lh3.googleusercontent.com/d/${id}=w400`:u; }
  // อ่านค่าจากชื่อคอลัมน์ที่ตรง หรือ "ชื่อใกล้เคียง" — ไม่สนตัวพิมพ์ใหญ่/เล็ก
  // (เผื่อหัวคอลัมน์จากฟอร์มไม่ตรงเป๊ะ เช่น "ชื่อ-นามสกุล" หรือ "Facebook")
  const get = (m, names) => {
    for(const n of names){ if(m[n]!=null && String(m[n]).trim()!=='') return String(m[n]).trim(); }
    const low = names.map(n => n.toLowerCase());
    for(const k in m){
      const lk = k.toLowerCase().trim();
      if(low.some(n => lk === n || lk.includes(n)) && String(m[k]||'').trim()!=='') return String(m[k]).trim();
    }
    return '';
  };

  let members = SAMPLE.slice();

  function avatar(m, i){
    const img = get(m, ['รูปภาพ','รูป','ภาพ']);
    if (img) {
      return `<div class="w-20 h-20 mx-auto rounded-full overflow-hidden mb-4 bg-gradient-to-br ${GRAD[i%GRAD.length]}">
        <img src="${esc(imgURL(img))}" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-cover" onerror="this.remove()"></div>`;
    }
    const name = get(m, ['ชื่อ']) || '?';
    const initial = (name.replace(/^[\s.]+/, '').charAt(0)) || '?';
    return `<div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${GRAD[i%GRAD.length]} grid place-items-center text-white text-2xl font-kanit font-600 mb-4">${esc(initial)}</div>`;
  }

  // ปุ่มเบอร์/อีเมล: กดแล้วโชว์ค่า + คัดลอกให้ (ไม่เด้งไปเปิดแอป)
  function copyBtn(icon, val){
    return `<button type="button" data-val="${esc(val)}" onclick="Committee.reveal(this)" title="กดเพื่อคัดลอก" class="w-9 h-9 rounded-full bg-stone-50 hover:bg-green-50 hover:text-green-700 grid place-items-center transition"><i class="${icon} text-sm"></i></button>`;
  }
  // ปุ่มไลน์: เป็นลิงก์เปิดแอปไลน์ (พฤติกรรมที่ต้องการ)
  function linkBtn(icon, href){
    return `<a href="${href}" target="_blank" rel="noopener" class="w-9 h-9 rounded-full bg-stone-50 hover:bg-green-50 hover:text-green-700 grid place-items-center transition"><i class="${icon} text-sm"></i></a>`;
  }

  function card(m, i){
    const phone = get(m, ['เบอร์โทร','โทร','เบอร์','phone']);
    const email = get(m, ['อีเมล','email','mail']);
    // ช่องเฟซบุ๊ก (อ่านได้ทั้งคอลัมน์ "เฟซบุ๊ก" และคอลัมน์เดิม "ไลน์" เผื่อยังไม่เปลี่ยนชื่อ)
    const facebook = get(m, ['เฟซบุ๊ก','เฟสบุ๊ก','facebook','fb','ไลน์']);
    const fbHref = /^https?:\/\//i.test(facebook) ? esc(facebook) : 'https://www.facebook.com/' + encodeURIComponent(facebook);
    const links = [
      phone ? copyBtn('fa-solid fa-phone', phone) : '',
      email ? copyBtn('fa-solid fa-envelope', email) : '',
      facebook ? linkBtn('fa-brands fa-facebook-f', fbHref) : '',   // กดแล้วเปิดเฟซบุ๊กเลย (ไม่ใช่คัดลอก)
    ].join('');
    return `<div class="lift bg-white rounded-2xl border border-stone-100 shadow-sm p-6 text-center">
      ${avatar(m, i)}
      <h3 class="font-kanit font-600 text-green-900">${esc(get(m,['ชื่อ']))}</h3>
      <p class="text-gold-dark text-sm font-kanit font-500 mt-0.5">${esc(get(m,['ตำแหน่ง','ตําแหน่ง']))}</p>
      ${links ? `<div class="flex justify-center gap-3 mt-4 text-stone-400">${links}</div><p class="copy-info text-[13px] text-green-700 font-kanit mt-2 min-h-[1.25rem] break-all"></p>` : ''}
    </div>`;
  }

  // ลำดับความอาวุโสของตำแหน่ง (เลขน้อย = อยู่ก่อน)
  function rolePriority(pos){
    pos = String(pos || '');
    const has = s => pos.includes(s), rong = has('รอง');
    if (has('ที่ปรึกษา')) return 0;
    if (has('ประธาน'))    return rong ? 20 : 10;
    if (has('เลขา'))      return rong ? 35 : 30;
    if (has('เหรัญญิก') || has('การเงิน')) return rong ? 45 : 40;
    if (has('ทะเบียน'))   return 50;
    if (has('ประชาสัมพันธ์') || has('สื่อ')) return 55;
    if (has('วิชาการ'))   return 56;
    if (has('กิจกรรม'))   return 57;
    if (has('ปฏิคม') || has('สวัสดิการ'))   return 58;
    if (has('สมาชิก'))    return 100;   // สมาชิกทั่วไปอยู่ท้ายสุด
    return 70;                          // ตำแหน่ง/ฝ่ายอื่น ๆ อยู่กลาง (ก่อนสมาชิก)
  }

  function render(){
    const box = document.getElementById('committeeList');
    if (!box) return;
    // เรียงตามตำแหน่ง (ตำแหน่งเท่ากันคงลำดับเดิมในชีต)
    const sorted = members.slice().sort((a, b) =>
      rolePriority(get(a, ['ตำแหน่ง','ตําแหน่ง'])) - rolePriority(get(b, ['ตำแหน่ง','ตําแหน่ง'])));
    box.innerHTML = sorted.length
      ? sorted.map(card).join('')
      : '<p class="col-span-full text-center text-stone-400 py-6 font-kanit">ยังไม่มีข้อมูลกรรมการ</p>';
  }

  async function init(){
    const url = window.CONFIG && CONFIG.sheets && CONFIG.sheets.committee;
    if (!url) { render(); return; }   // ยังไม่เชื่อมชีต → โชว์ตัวอย่าง
    const box = document.getElementById('committeeList');   // เชื่อมชีตแล้ว → โชว์กำลังโหลด ไม่ใช่ตัวอย่าง
    if (box) box.innerHTML = '<p class="col-span-full text-center text-stone-400 py-6 font-kanit"><i class="fa-solid fa-spinner fa-spin"></i> กำลังโหลด…</p>';
    try {
      const rows = await Sheets.fetchRows(url);
      members = rows;   // ใช้ข้อมูลจริง (ว่าง = "ยังไม่มีข้อมูล")
      render();
    } catch (e) {
      render();   // เน็ตหลุด → fallback ตัวอย่าง
      console.warn('โหลดทำเนียบกรรมการจากชีตไม่สำเร็จ ใช้ตัวอย่างแทน', e);
    }
  }

  // กดไอคอนเบอร์/อีเมล → โชว์ค่าใต้การ์ด + คัดลอกอัตโนมัติ
  function reveal(btn){
    const val = btn.dataset.val || '';
    const card = btn.closest('.lift');
    const info = card && card.querySelector('.copy-info');
    if (!info) return;
    info.textContent = val;   // โชว์ค่าให้เห็น/เลือกคัดลอกเองได้เสมอ
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).then(() => {
        info.innerHTML = esc(val) + ' <span class="text-gold-dark">✓ คัดลอกแล้ว</span>';
        clearTimeout(info._t);
        info._t = setTimeout(() => { info.textContent = val; }, 1600);
      }).catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  return { reveal };
})();
