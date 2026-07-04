/* =====================================================================
   content.js — ข้อความหน้าแรก (ดึงจาก CONFIG.content ใน config.js)
   แก้คำต่าง ๆ ได้ที่ js/config.js บล็อก content (ไม่ต้องแตะ HTML)
   ===================================================================== */

(function () {
  const C = (window.CONFIG && CONFIG.content) || {};
  const esc = window.esc;
  const setText = (id, v) => { const el = document.getElementById(id); if (el && v != null && v !== '') el.textContent = v; };

  setText('c-club', C.clubName);
  setText('c-herotext', C.heroText);
  setText('c-location', C.prayerLocation);

  // สโลแกน 2 บรรทัด (บรรทัดสองเป็นสีเขียว)
  const ht = document.getElementById('c-herotitle');
  if (ht && (C.heroTitle1 || C.heroTitle2)) {
    ht.innerHTML = `${esc(C.heroTitle1 || '')}<br><span class="text-green-700">${esc(C.heroTitle2 || '')}</span>`;
  }

  // สถิติ 3 ช่อง
  const st = document.getElementById('c-stats');
  if (st && Array.isArray(C.stats) && C.stats.length) {
    st.innerHTML = C.stats.map((s, i) =>
      `<div class="${i === 1 ? 'border-x border-stone-200' : ''}"><p class="font-kanit font-700 text-3xl text-green-800">${esc(s.number)}</p><p class="text-[13px] text-stone-500 mt-0.5">${esc(s.label)}</p></div>`
    ).join('');
  }
})();
