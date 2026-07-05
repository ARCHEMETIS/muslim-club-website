/* =====================================================================
   แจ้งเตือนชมรม.gs — Google Apps Script แจ้งเตือนเข้ากลุ่มอัตโนมัติ
   ---------------------------------------------------------------------
   ทำ 2 อย่าง:
   1. ประกาศใหม่ในชีต "ประกาศกิจกรรม" → แจ้งเข้ากลุ่ม
   2. งานฝ่ายใกล้เดดไลน์/เลยกำหนด ในชีต "ตารางกิจกรรม" → สรุปทุกเช้า 08:00

   ★ โหมด LINE OA (ประหยัดโควตาฟรี 300 ข้อความ/เดือน):
     - LINE นับ push เข้ากลุ่ม "ตามจำนวนคนในกลุ่ม" (กลุ่ม 15 คน = 15 เครดิต/ครั้ง)
     - แต่ "reply" ฟรีไม่จำกัด → สมาชิกพิมพ์ เดดไลน์/ประกาศ ในกลุ่ม บอทตอบฟรี
     - ประกาศธรรมดาถูก "พัก" ไว้รวมส่งเป็น digest เดียวตอนเช้า (push 1 ครั้ง/วัน)
       ยกเว้นประกาศที่มีคำว่า "ด่วน" → push ทันที
     - มี quota guard: เหลือเครดิตน้อยกว่ากันชน → งดส่งอัตโนมัติ
   Telegram/Discord ฟรีไม่จำกัด → ส่งสด ๆ ตามปกติ

   วิธีติดตั้ง: อ่าน วิธีติดตั้งแจ้งเตือน.md (โฟลเดอร์เดียวกัน)
   สั้น ๆ: กรอก CONFIG → รัน setup() หนึ่งครั้ง → (LINE: deploy เป็น Web app + ตั้ง webhook)
   ===================================================================== */

const CONFIG = {
  // ---- เลือกช่องทางแจ้งเตือน: 'telegram' | 'discord' | 'line' ----
  channel: 'line',

  telegram: {
    botToken: '',        // จาก @BotFather
    chatId: '',          // ไอดีกลุ่ม (ติดลบ เช่น -100123456789)
  },
  discord: {
    webhookUrl: '',      // จาก ตั้งค่าช่อง → Integrations → Webhooks
  },
  line: {
    channelAccessToken: '',  // long-lived token จาก LINE Developers (ออกครั้งเดียว ไม่หมดอายุ)
    to: '',                  // groupId — เว้นว่างได้! ตั้ง webhook แล้วพิมพ์อะไรก็ได้ในกลุ่ม บอทจะจำให้เอง
    quotaSafety: 30,         // เหลือเครดิตน้อยกว่านี้ = งดส่ง เก็บไว้ให้เรื่องด่วนเดือนหน้า
    // รอบส่ง digest: 0=อา 1=จ 2=อ 3=พ 4=พฤ 5=ศ 6=ส
    // [1,4] = จันทร์/พฤหัส (เหมาะกลุ่ม 16-25 คน) · [] = ทุกวันที่มีเรื่อง (เหมาะกลุ่ม ≤15 คน)
    digestDays: [1, 4],
  },

  // ---- ชีตที่ให้สคริปต์อ่าน (เอา ID จากลิงก์ชีต ส่วนที่อยู่หลัง /d/) ----
  announcements: { spreadsheetId: '', sheetName: '' },  // sheetName เว้นว่าง = แท็บแรก
  events:        { spreadsheetId: '', sheetName: '' },

  deadlineDaysAhead: 4,    // เตือนล่วงหน้ากี่วัน (ใช้รอบ จ/พฤ ควร ≥4 ให้ครอบคลุมช่องว่าง พฤ→จ)
  siteUrl: 'https://muslimclub-kku.netlify.app',

  // ลิงก์เพิ่มเติมที่บอทจะตอบเมื่อพิมพ์ "ลิงก์" ในกลุ่ม (เติม/ลบได้ตามใจ)
  // "พื้นที่ทีมงาน" ถูกใส่ให้อัตโนมัติจาก siteUrl — ไม่ต้องเพิ่มเอง
  quickLinks: {
    // 'ชีตตารางกิจกรรม (ติ๊กสถานะ)': 'https://docs.google.com/spreadsheets/d/...',
    // 'ชีตการเงิน': 'https://docs.google.com/spreadsheets/d/...',
  },
};

/* ---------- รันครั้งเดียวตอนติดตั้ง: ตั้งเวลาอัตโนมัติ ---------- */
function setup() {
  // ลบตัวตั้งเวลาเก่าของสคริปต์นี้ก่อน (กันซ้ำ)
  ScriptApp.getProjectTriggers().forEach(t => {
    if (['checkAnnouncements', 'morningDigest'].includes(t.getHandlerFunction())) ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('checkAnnouncements').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('morningDigest').timeBased().atHour(8).everyDays(1).create();
  // จดจำนวนแถวปัจจุบันไว้เป็นจุดตั้งต้น — ประกาศเก่าจะไม่ถูกแจ้งซ้ำ
  const rows = readRows_(CONFIG.announcements);
  PropertiesService.getScriptProperties().setProperty('annLastRow', String(rows.length));
  Logger.log('ติดตั้งเสร็จ ✓ จุดตั้งต้นประกาศ = ' + rows.length + ' แถว');
}

/* ---------- ทดสอบส่งข้อความ (รันเองเพื่อเช็คว่าเชื่อมกลุ่มติด) ---------- */
function testSend() {
  sendMessage_('🔔 ทดสอบระบบแจ้งเตือนชมรมมุสลิม มข. — ถ้าเห็นข้อความนี้แปลว่าเชื่อมสำเร็จ ✓');
}

/* =====================================================================
   งานที่ 1: ประกาศใหม่ (รันทุกชั่วโมง)
   - Telegram/Discord: รวมประกาศใหม่ทั้งหมดเป็น 1 ข้อความ ส่งเลย (ฟรี)
   - LINE: พักเข้าคิวรอ digest ตอนเช้า (ประหยัดเครดิต)
           ยกเว้นหัวข้อ/หมวดมีคำว่า "ด่วน" → push ทันที
   ===================================================================== */
function checkAnnouncements() {
  const rows = readRows_(CONFIG.announcements);
  const props = PropertiesService.getScriptProperties();
  const last = parseInt(props.getProperty('annLastRow') || '0', 10);
  if (rows.length <= last) { props.setProperty('annLastRow', String(rows.length)); return; }

  const fresh = rows.slice(last, last + 10);   // เพดาน 10 แถว/รอบ กันสแปม
  props.setProperty('annLastRow', String(rows.length));

  if (CONFIG.channel !== 'line') {
    sendMessage_('📢 ประกาศใหม่\n\n' + fresh.map(annLine_).join('\n\n') + '\n\n' + CONFIG.siteUrl);
    return;
  }

  // ---- โหมด LINE: ด่วนส่งเลย ที่เหลือเข้าคิว ----
  const urgent = fresh.filter(r => /ด่วน/.test(String(r['หัวข้อ'] || '') + String(r['หมวดหมู่'] || '')));
  const normal = fresh.filter(r => !urgent.includes(r));
  if (urgent.length) sendMessage_('🚨 ประกาศด่วน\n\n' + urgent.map(annLine_).join('\n\n') + '\n\n' + CONFIG.siteUrl);
  if (normal.length) {
    const queue = JSON.parse(props.getProperty('annQueue') || '[]');
    normal.forEach(r => queue.push(annLine_(r)));
    props.setProperty('annQueue', JSON.stringify(queue.slice(-15)));   // เก็บอย่างมาก 15 เรื่อง
  }
}

function annLine_(r) {
  const cat = r['หมวดหมู่'] ? '[' + r['หมวดหมู่'] + '] ' : '';
  const detail = r['รายละเอียด'] ? '\n' + String(r['รายละเอียด']).slice(0, 150) : '';
  return '• ' + cat + (r['หัวข้อ'] || '(ไม่มีหัวข้อ)') + detail;
}

/* =====================================================================
   งานที่ 2: สรุปตอนเช้า 08:00 — push เดียวรวมทุกเรื่อง
   (ประกาศที่ค้างคิว + เดดไลน์งานฝ่าย) · ไม่มีเรื่อง = เงียบ ไม่เปลืองเครดิต
   ===================================================================== */
function morningDigest() {
  // โหมด LINE + ตั้งรอบส่งไว้: วันนี้ไม่ใช่รอบ = ข้าม (คิวประกาศเก็บไว้รอรอบหน้า)
  if (CONFIG.channel === 'line' && (CONFIG.line.digestDays || []).length) {
    if (CONFIG.line.digestDays.indexOf(new Date().getDay()) === -1) return;
  }
  const props = PropertiesService.getScriptProperties();
  const parts = [];

  const queue = JSON.parse(props.getProperty('annQueue') || '[]');
  if (queue.length) parts.push('📢 ประกาศใหม่:\n' + queue.join('\n\n'));

  const dl = deadlineSummary_();
  if (dl) parts.push(dl);

  if (!parts.length) return;                       // ไม่มีอะไร = ไม่ส่ง
  const sent = sendMessage_('🌅 สรุปเช้านี้\n\n' + parts.join('\n\n') + '\n\nดูทั้งหมด: ' + CONFIG.siteUrl);
  if (sent) props.deleteProperty('annQueue');      // ส่งไม่สำเร็จ (โควตาหมด) → เก็บคิวไว้ก่อน
}

/* ---------- สรุปเดดไลน์ (ใช้ทั้ง digest และตอบ reply) ---------- */
function deadlineSummary_() {
  const rows = readRows_(CONFIG.events);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const soon = [], overdue = [];

  rows.forEach(r => {
    if (String(r['สถานะ'] || '').includes('เสร็จ')) return;
    const d = parseDate_(r['เดดไลน์']); if (!d) return;
    const days = Math.round((d - today) / 86400000);
    const line = '• ' + (r['ฝ่าย'] || '?') + ' — ' + (r['หน้าที่'] || '?') + ' (' + (r['ชื่อกิจกรรม'] || '') + ')';
    if (days < 0) overdue.push(line + ' เลยมา ' + (-days) + ' วัน');
    else if (days <= CONFIG.deadlineDaysAhead) soon.push(line + (days === 0 ? ' ⏰ วันนี้!' : ' อีก ' + days + ' วัน'));
  });

  if (!soon.length && !overdue.length) return '';
  let msg = '📋 เดดไลน์งานฝ่าย';
  if (overdue.length) msg += '\n🔴 เลยกำหนด:\n' + overdue.join('\n');
  if (soon.length) msg += '\n🟡 ใกล้ถึงกำหนด:\n' + soon.join('\n');
  return msg;
}

/* =====================================================================
   Webhook สำหรับ LINE (deploy สคริปต์นี้เป็น Web app แล้วเอา URL ไปวาง)
   ★ reply ฟรีไม่จำกัด — สมาชิกพิมพ์คำสั่งในกลุ่ม บอทตอบโดยไม่กินโควตาเลย
     คำสั่ง:  เดดไลน์ · ประกาศ · โควตา · id
   ★ บอทจำ groupId ของกลุ่มที่คุยด้วยล่าสุดให้อัตโนมัติ (ไม่ต้องหาเอง)
   ===================================================================== */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    (data.events || []).forEach(ev => {
      const src = ev.source || {};
      const id = src.groupId || src.roomId || src.userId || '';
      if (src.groupId) PropertiesService.getScriptProperties().setProperty('lineGroupId', src.groupId);

      if (ev.type === 'message' && ev.message && ev.message.type === 'text' && ev.replyToken) {
        const t = String(ev.message.text).trim().toLowerCase();
        if (t === 'เดดไลน์' || t === 'deadline')
          replyLine_(ev.replyToken, deadlineSummary_() || '✅ ไม่มีงานใกล้เดดไลน์ตอนนี้');
        else if (t === 'ประกาศ' || t === 'news')
          replyLine_(ev.replyToken, latestAnnouncements_());
        else if (t === 'โควตา' || t === 'quota')
          replyLine_(ev.replyToken, quotaReport_());
        else if (t === 'ลิงก์' || t === 'ลิ้ง' || t === 'ฟอร์ม' || t === 'link' || t === 'form')
          replyLine_(ev.replyToken, quickLinksReport_());
        else if (t === 'id')
          replyLine_(ev.replyToken, 'ID ห้องนี้: ' + id + '\n(บอทจำให้แล้ว ใช้แจ้งเตือนอัตโนมัติได้เลย)');
      }
    });
  } catch (err) { /* กัน webhook ล้ม */ }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

// รวมลิงก์งานทีม — พิมพ์ "ลิงก์" ในกลุ่มแล้วบอทตอบ (ไม่ต้องงมหาลิงก์กันอีก)
function quickLinksReport_() {
  let msg = '🔗 ลิงก์งานทีม\n\n• พื้นที่ทีมงาน (รวมฟอร์มทุกใบ):\n' + CONFIG.siteUrl.replace(/\/+$/, '') + '/team.html';
  const q = CONFIG.quickLinks || {};
  for (const name in q) { if (q[name]) msg += '\n\n• ' + name + ':\n' + q[name]; }
  return msg;
}

function latestAnnouncements_() {
  const rows = readRows_(CONFIG.announcements);
  if (!rows.length) return 'ยังไม่มีประกาศ';
  return '📢 ประกาศล่าสุด\n\n' + rows.slice(-3).reverse().map(annLine_).join('\n\n') + '\n\n' + CONFIG.siteUrl;
}

/* ---------- โควตา LINE: เช็คของจริงจาก API (การเช็คไม่กินโควตา) ---------- */
function lineQuotaLeft_() {
  const h = { Authorization: 'Bearer ' + CONFIG.line.channelAccessToken };
  const q = JSON.parse(UrlFetchApp.fetch('https://api.line.me/v2/bot/message/quota', { headers: h }).getContentText());
  if (q.type !== 'limited') return 999999;   // แพ็กไม่จำกัด
  const c = JSON.parse(UrlFetchApp.fetch('https://api.line.me/v2/bot/message/quota/consumption', { headers: h }).getContentText());
  return q.value - c.totalUsage;
}
function quotaReport_() {
  const left = lineQuotaLeft_();
  return '📊 โควตาข้อความ LINE เดือนนี้\nเหลือ ' + left + ' เครดิต' +
    '\n(push เข้ากลุ่มกิน 1 เครดิต × จำนวนคนในกลุ่ม · การพิมพ์ถามแบบนี้ฟรีไม่จำกัด)';
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

/* ---------- ตัวช่วย: ส่งข้อความตามช่องทางที่เลือก (คืน true = ส่งแล้ว) ---------- */
function sendMessage_(text) {
  const ch = CONFIG.channel;
  if (ch === 'telegram') {
    const c = CONFIG.telegram;
    UrlFetchApp.fetch('https://api.telegram.org/bot' + c.botToken + '/sendMessage', {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ chat_id: c.chatId, text: text }),
    });
    return true;
  }
  if (ch === 'discord') {
    UrlFetchApp.fetch(CONFIG.discord.webhookUrl, {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ content: text }),
    });
    return true;
  }
  if (ch === 'line') return pushLine_(text);
  throw new Error('CONFIG.channel ต้องเป็น telegram / discord / line');
}

function pushLine_(text) {
  const c = CONFIG.line;
  const to = c.to || PropertiesService.getScriptProperties().getProperty('lineGroupId');
  if (!to) { Logger.log('LINE: ยังไม่รู้ groupId — พิมพ์อะไรก็ได้ในกลุ่ม 1 ครั้งให้บอทจำ'); return false; }

  // ★ quota guard: เหลือน้อยกว่ากันชน → งดส่ง เก็บเครดิตไว้
  const left = lineQuotaLeft_();
  if (left <= c.quotaSafety) {
    Logger.log('LINE: งดส่ง — เครดิตเหลือ ' + left + ' (กันชน ' + c.quotaSafety + ') ข้อความ: ' + text.slice(0, 80));
    return false;
  }
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/push', {
    method: 'post', contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + c.channelAccessToken },
    payload: JSON.stringify({ to: to, messages: [{ type: 'text', text: text.slice(0, 4900) }] }),
  });
  return true;
}

function replyLine_(replyToken, text) {   // reply = ฟรี ไม่นับโควตา
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post', contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + CONFIG.line.channelAccessToken },
    payload: JSON.stringify({ replyToken: replyToken, messages: [{ type: 'text', text: text.slice(0, 4900) }] }),
  });
}
