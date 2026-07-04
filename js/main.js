/* =====================================================================
   main.js — ระบบหลักของเว็บ: สลับหน้า + เมนูมือถือ + เงาแถบบน
   (ปกติไม่ต้องแก้ไฟล์นี้)
   ===================================================================== */

// ---------- ตัวช่วยกลาง: กันโค้ดแฝงมากับข้อมูลชีต (ทุกไฟล์ js/ เรียกใช้) ----------
// esc: escape ข้อความก่อนใส่ HTML/attribute (รวม ' เผื่อใช้ใน onclick="fn('...')")
window.esc = s => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
// safeHttp: ยอมเฉพาะลิงก์ http(s) ก่อนเอาไปใส่ href / iframe / window.open
// (กันลิงก์อันตรายแบบ javascript: หรือ data: ที่อาจถูกกรอกมาในชีต/ฟอร์ม)
window.safeHttp = u => {
  try { const p = new URL(String(u), location.href).protocol; return p === 'http:' || p === 'https:'; }
  catch { return false; }
};

// ---------- สลับหน้า (เว็บหน้าเดียว) ----------
function showPage(name, e) {
  if (e) e.preventDefault();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active-link', l.dataset.page === name);
  });
  document.getElementById('mobileMenu').classList.add('hidden');
  document.getElementById('burger').innerHTML = '<i class="fa-solid fa-bars"></i>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- เมนูมือถือ (ปุ่มแฮมเบอร์เกอร์) ----------
function toggleMenu() {
  const m = document.getElementById('mobileMenu'), b = document.getElementById('burger');
  const open = m.classList.toggle('hidden') === false;
  b.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
}

// ---------- เพิ่มเงาให้แถบบนเมื่อเลื่อนหน้า ----------
addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('shadow-md', scrollY > 8);
});
