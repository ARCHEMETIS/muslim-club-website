/* =====================================================================
   sheets.js — ตัวช่วยดึงข้อมูลจาก Google ชีต (ไม่ต้องแก้ไฟล์นี้)
   ---------------------------------------------------------------------
   ใช้กับชีตที่ "เผยแพร่เป็น CSV" แล้ว แปลงเป็น array ของ object
   ให้ไฟล์ documents.js / finance.js / announcements.js เรียกใช้
   ===================================================================== */

window.Sheets = {

  // ดึง CSV จากลิงก์ แล้วแปลงเป็น array ของ object (คีย์ = หัวคอลัมน์)
  async fetchRows(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('โหลดชีตไม่สำเร็จ: ' + res.status);
    return this.parse(await res.text());
  },

  // แปลงข้อความ CSV → array ของ object
  parse(text) {
    const rows = this._rows(text);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.trim());
    return rows.slice(1)
      .filter(r => r.some(c => c.trim() !== ''))   // ข้ามแถวว่าง
      .map(r => {
        const obj = {};
        headers.forEach((h, i) => (obj[h] = (r[i] || '').trim()));
        return obj;
      });
  },

  // ตัว parser CSV รองรับจุลภาคในเครื่องหมายคำพูด และขึ้นบรรทัดในเซลล์
  _rows(text) {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (c !== '\r') cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  },

};
