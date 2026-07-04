/* =====================================================================
   contact.js — หน้าติดต่อเรา
   • เติมข้อมูลติดต่อ/โซเชียลจาก CONFIG.contact (แก้ได้ที่ js/config.js)
   • ฝังฟอร์มสมัครสมาชิกจริงจาก CONFIG.forms.membership (ถ้าตั้งไว้)
   ===================================================================== */

(function () {
  const C = (window.CONFIG && CONFIG.contact) || {};
  const F = (window.CONFIG && CONFIG.forms) || {};

  const esc = window.esc;
  const txt = (id, v) => { const el = document.getElementById(id); if (el && v) el.textContent = v; };

  // ---------- ข้อมูลติดต่อ ----------
  txt('ct-address', C.address);

  const ph = document.getElementById('ct-phone');
  if (ph && C.phone) { ph.textContent = C.phone; ph.href = 'tel:' + String(C.phone).replace(/[^0-9+]/g, ''); }

  const em = document.getElementById('ct-email');
  if (em && C.email) { em.textContent = C.email; em.href = 'mailto:' + C.email; }

  // โซเชียล: ตั้งลิงก์ถ้ามี ไม่มีก็ซ่อนไอคอน (ทั้งหน้าติดต่อ #ct-* และท้ายเว็บ #ft-*)
  const socials = { fb: C.facebook, line: C.line, ig: C.instagram, yt: C.youtube };
  ['ct', 'ft'].forEach(prefix => {
    Object.entries(socials).forEach(([k, url]) => {
      const a = document.getElementById(prefix + '-' + k);
      if (!a) return;
      if (url) a.href = url; else a.style.display = 'none';
    });
  });

  // ---------- ฟอร์มสมัครสมาชิก ----------
  const box = document.getElementById('membershipForm');
  if (box) {
    const url = F.membership;
    if (url) {
      // แปลงลิงก์ฟอร์มให้ฝังได้ (เติม embedded=true)
      const src = /embedded=true/.test(url) ? url : url + (url.includes('?') ? '&' : '?') + 'embedded=true';
      box.className = 'rounded-xl overflow-hidden border border-stone-100';
      box.innerHTML = `<iframe src="${esc(src)}" class="w-full" style="height:640px;border:0;" loading="lazy" title="แบบฟอร์มสมัครสมาชิก">กำลังโหลดแบบฟอร์ม…</iframe>
        <div class="text-center py-3 bg-stone-50 text-sm"><a href="${esc(url)}" target="_blank" rel="noopener" class="text-green-700 font-kanit font-500 hover:underline">เปิดฟอร์มในแท็บใหม่ <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i></a></div>`;
    } else {
      // ยังไม่ได้ตั้งลิงก์ฟอร์ม → แสดงสถานะรอเชื่อม
      box.innerHTML = `<div class="max-w-sm">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm grid place-items-center text-green-600 text-2xl mb-4"><i class="fa-brands fa-wpforms"></i></div>
        <p class="font-kanit font-600 text-green-900 text-lg">แบบฟอร์มสมัครสมาชิก</p>
        <p class="text-stone-500 text-sm mt-2 leading-relaxed">เมื่อผู้ดูแลใส่ลิงก์ฟอร์มในไฟล์ <code class="bg-white px-1.5 py-0.5 rounded text-green-700 text-[13px]">config.js</code> (ช่อง <b>forms.membership</b>) แบบฟอร์มจริงจะแสดงตรงนี้ พร้อมกรอกบนมือถือได้ทันที</p>
        <div class="mt-6 space-y-3 text-left">
          <div class="h-10 rounded-lg bg-white border border-stone-200"></div>
          <div class="h-10 rounded-lg bg-white border border-stone-200"></div>
          <div class="h-20 rounded-lg bg-white border border-stone-200"></div>
          <div class="w-full bg-green-800/40 text-white font-kanit font-500 py-3 rounded-full mt-1 text-center">ส่งแบบฟอร์ม</div>
        </div>
      </div>`;
    }
  }
})();
