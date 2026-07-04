/* =====================================================================
   sw.js — Service Worker (ทำให้เว็บติดตั้งเป็นแอป + เปิดได้ตอนเน็ตหลุด)
   ---------------------------------------------------------------------
   หลักการ: ใช้ "เน็ตก่อนเสมอ" (network-first) เฉพาะไฟล์ในเว็บเราเอง
   เพื่อให้ข้อมูลใหม่ขึ้นทันทีเมื่อออนไลน์ ส่วนตอนออฟไลน์ค่อยดึงจากแคช
   คำขอไปเว็บอื่น (Google ชีต/ฟอร์ม, Aladhan API, ฟอนต์) ปล่อยให้สดเสมอ
   ===================================================================== */

const CACHE = 'muslimclub-v2';

// ไฟล์โครงเว็บที่เก็บไว้ให้เปิดได้แม้ออฟไลน์
const SHELL = [
  './',
  './index.html',
  './css/tailwind.css',
  './css/style.css',
  './assets/img/logo.png',
  './assets/img/hero.png',
  './assets/img/about.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  './manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  // เก็บทีละไฟล์ ไฟล์ไหนพลาดก็ข้าม — ไม่ให้ไฟล์เดียวทำให้ติดตั้งล้มทั้งชุด
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                     // เฉพาะการ "อ่าน"
  if (new URL(req.url).origin !== self.location.origin) return;  // เว็บอื่น = ปล่อยสด

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {                                   // เก็บเฉพาะคำตอบดี — กัน 404/500 ค้างในแคช
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) =>
          // fallback เป็น index.html เฉพาะตอน "เปิดหน้า" เท่านั้น
          // (ไฟล์ js/css ที่ไม่มีในแคช ให้ error ตรง ๆ ดีกว่าได้ HTML ไปแทนสคริปต์)
          hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())
        )
      )
  );
});
