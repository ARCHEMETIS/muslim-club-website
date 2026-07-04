/* =====================================================================
   แจ้งเตือนชมรม.gs — Google Apps Script แจ้งเตือนเข้ากลุ่มอัตโนมัติ
   ---------------------------------------------------------------------
   ทำ 2 อย่าง:
   1. ประกาศใหม่ในชีต "ประกาศกิจกรรม" → แจ้งเข้ากลุ่ม (เช็คทุกชั่วโมง)
   2. งานฝ่ายใกล้ถึงเดดไลน์/เลยกำหนด ในชีต "ตารางกิจกรรม" → สรุปแจ้งทุกเช้า 08:00

   วิธีติดตั้ง: อ่าน วิธีติดตั้งแจ้งเตือน.md (โฟลเดอร์เดียวกัน)
   สั้น ๆ: กรอก CONFIG ข้างล่าง → รัน setup() หนึ่งครั้ง → เสร็จ
   ===================================================================== */

const CONFIG = {
  // ---- เลือกช่องทางแจ้งเตือน: 'telegram' | 'discord' | 'line' ----
  channel: 'telegram',

  telegram: {
    botToken: '',        // จาก @BotFather
    chatId: '',          // ไอดีกลุ่ม (ติดลบ เช่น -100123456789)
  },
  discord: {
    webhookUrl: '',      // จาก ตั้งค่าช่อง → Integrations → Webhooks
  },
  line: {
    channelAccessToken: '',  // จาก LINE Developers (Messaging API)
    to: '',                  // groupId ของกลุ่มที่ดึงบอทเข้า
  },

  // ---- ชีตที่ให้สคริปต์อ่าน (เอา ID จากลิงก์ชีต ส่วนที่อยู่หลัง /d/) ----
  announcements: { spreadsheetId: '', sheetName: '' },  // sheetName เว้นว่าง = แท็บแรก
  events:        { spreadsheetId: '', sheetName: '' },

  deadlineDaysAhead: 3,    // เตือนล่วงหน้ากี่วัน
  siteUrl: 'https://muslimclub-kku.netlify.app',
};

/* ---------- รันครั้งเดียวตอนติดตั้ง: ตั้งเวลาอัตโนมัติ ---------- */
function setup() {
  // ลบตัวตั้งเวลาเก่าของสคริปต์นี้ก่อน (กันซ้ำ)
  ScriptApp.getProjectTriggers().forEach(t => {
    if (['checkAnnouncements', 'checkDeadlines'].includes(t.getHandlerFunction())) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('checkAnnouncements').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('checkDeadlines').timeBased().atHour(8).everyDays(1).create();
  // จดจำนวนแถวปัจจุบันไว้เป็นจุดตั้งต้น — ประกาศเก่าจะไม่ถูกแจ้งซ้ำ
  const rows = readRows_(CONFIG.announcements);
  PropertiesService.getScriptProperties().setProperty('annLastRow', String(rows.length));
  Logger.log('ติดตั้งเสร็จ ✓ จุดตั้งต้นประกาศ = ' + rows.length + ' แถว');
}

/* ---------- ทดสอบส่งข้อความ (รันเองเพื่อเช็คว่าเชื่อมกลุ่มติด) ---------- */
function testSend() {
  sendMessage_('🔔 ทดสอบระบบแจ้งเตือนชมรมมุสลิม มข. — ถ้าเห็นข้อความนี้แปลว่าเชื่อมสำเร็จ ✓');
}

/* ---------- งานที่ 1: ประกาศใหม่ ---------- */
function checkAnnouncements() {
  const rows = readRows_(CONFIG.announcements);
  const props = PropertiesService.getScriptProperties();
  const last = parseInt(props.getProperty('annLastRow') || '0', 10);
  if (rows.length <= last) { props.setProperty('annLastRow', String(rows.length)); return; }

  // แจ้งเฉพาะแถวใหม่ (เพดาน 5 แถวต่อรอบ กันสแปมกลุ่มตอนวางข้อมูลทีละมาก ๆ)
  rows.slice(last, last + 5).forEach(r => {
    const title = r['หัวข้อ'] || '(ไม่มีหัวข้อ)';
    const detail = r['รายละเอียด'] ? '\n' + String(r['รายละเอียด']).slice(0, 200) : '';
    const cat = r['หมวดหมู่'] ? ' [' + r['หมวดหมู่'] + ']' : '';
    sendMessage_('📢 ประกาศใหม่' + cat + '\n' + title + detail + '\n\n' + CONFIG.siteUrl);
  });
  props.setProperty('annLastRow', String(rows.length));
}

/* ---------- งานที่ 2: เดดไลน์งานฝ่าย ---------- */
function checkDeadlines() {
  const rows = readRows_(CONFIG.events);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const soon = [], overdue = [];

  rows.forEach(r => {
    if (String(r['สถานะ'] || '').includes('เสร็จ')) return;
    const d = parseDate_(r['เดดไลน์']); if (!d) return;
    const days = Math.round((d - today) / 86400000);
    const line = '• ' + (r['ฝ่าย'] || '?') + ' — ' + (r['หน้าที่'] || '?') +
      ' (' + (r['ชื่อกิจกรรม'] || '') + ')';
    if (days < 0) overdue.push(line + ' เลยมา ' + (-days) + ' วัน');
    else if (days <= CONFIG.deadlineDaysAhead) soon.push(line + (days === 0 ? ' ⏰ วันนี้!' : ' อีก ' + days + ' วัน'));
  });

  if (!soon.length && !overdue.length) return;   // ไม่มีอะไรใกล้กำหนด = ไม่ต้องส่ง
  let msg = '📋 สรุปเดดไลน์งานฝ่าย\n';
  if (overdue.length) msg += '\n🔴 เลยกำหนด:\n' + overdue.join('\n') + '\n';
  if (soon.length) msg += '\n🟡 ใกล้ถึงกำหนด:\n' + soon.join('\n') + '\n';
  msg += '\nดูตารางเต็ม: ' + CONFIG.siteUrl;
  sendMessage_(msg);
}

/* ---------- ตัวช่วย: อ่านชีตเป็น array ของ object (คีย์ = หัวคอลัมน์) ---------- */
function readRows_(cfg) {
  if (!cfg.spreadsheetId) throw new Error('ยังไม่ได้ใส่ spreadsheetId ใน CONFIG');
  const ss = SpreadsheetApp.openById(cfg.spreadsheetId);
  const sh = cfg.sheetName ? ss.getSheetByName(cfg.sheetName) : ss.getSheets()[0];
  if (!sh) throw new Error('ไม่พบแท็บชีต: ' + cfg.sheetName);
  const data = sh.getDataRange().getValues();
  if (data.length < 2) return [];
  const head = data[0].map(h => String(h).trim());
  return data.slice(1)
    .filter(r => r.some(c => String(c).trim() !== ''))
    .map(r => { const o = {}; head.forEach((h, i) => o[h] = r[i]); return o; });
}

/* ---------- ตัวช่วย: อ่านวันที่ (รองรับ Date จริง / 15/6/2026 / 8 มิ.ย. 2569) ---------- */
function parseDate_(v) {
  if (v instanceof Date && !isNaN(v)) { const d = new Date(v); d.setHours(0, 0, 0, 0); return d; }
  const s = String(v || '').trim(); if (!s) return null;
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) { let y = +m[3]; if (y > 2500) y -= 543; return new Date(y, +m[2] - 1, +m[1]); }
  const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const p = s.split(/\s+/);
  if (p.length >= 3) {
    const mi = MONTHS.indexOf(p[1]); let y = parseInt(p[2], 10); if (y > 2500) y -= 543;
    if (mi >= 0 && y) return new Date(y, mi, parseInt(p[0], 10));
  }
  return null;
}

/* ---------- ตัวช่วย: ส่งข้อความตามช่องทางที่เลือก ---------- */
function sendMessage_(text) {
  const ch = CONFIG.channel;
  if (ch === 'telegram') {
    const c = CONFIG.telegram;
    UrlFetchApp.fetch('https://api.telegram.org/bot' + c.botToken + '/sendMessage', {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ chat_id: c.chatId, text: text }),
    });
  } else if (ch === 'discord') {
    UrlFetchApp.fetch(CONFIG.discord.webhookUrl, {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ content: text }),
    });
  } else if (ch === 'line') {
    const c = CONFIG.line;
    UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
      method: 'post', contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + c.channelAccessToken },
      payload: JSON.stringify({ to: c.to, messages: [{ type: 'text', text: text }] }),
    });
  } else {
    throw new Error('CONFIG.channel ต้องเป็น telegram / discord / line');
  }
}
