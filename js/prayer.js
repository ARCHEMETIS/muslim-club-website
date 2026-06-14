/* =====================================================================
   prayer.js — เวลาละหมาด (หน้าแรก)
   ดึงเวลาจริงของขอนแก่นจาก Aladhan API + แคชรายวัน + มีเวลาสำรองออฟไลน์
   ตั้งค่าพิกัด/วิธีคำนวณ/เวลาญุมอะฮ์ ได้ที่ js/config.js
   ===================================================================== */

(function () {
  const P = (window.CONFIG && CONFIG.prayer) || { lat: 16.4756, lng: 102.8230, method: 3, school: 0, jumuah: '12:30' };

  // ชื่อไทย + ไอคอน ของแต่ละเวลาละหมาด
  const PMETA = {
    Fajr:    { name: 'ซุบฮิ',  icon: 'fa-cloud-moon' },
    Dhuhr:   { name: 'ซุฮรี',  icon: 'fa-sun' },
    Asr:     { name: 'อัศรี',  icon: 'fa-cloud-sun' },
    Maghrib: { name: 'มัฆริบ', icon: 'fa-mountain-sun' },
    Isha:    { name: 'อิชาอ์', icon: 'fa-moon' },
  };
  const JUMUAH = { name: 'ญุมอะฮ์', en: 'Jumuah', time: P.jumuah, icon: 'fa-mosque' };

  // เวลาสำรองกรณีโหลด API ไม่ได้ — เว็บจะไม่พัง
  const FALLBACK = { Fajr: '04:48', Dhuhr: '12:15', Asr: '15:32', Maghrib: '18:24', Isha: '19:38' };

  const TH_DIGITS  = s => String(s).replace(/[0-9]/g, d => '๐๑๒๓๔๕๖๗๘๙'[d]);
  const TH_WEEKDAY = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const HIJRI_MONTHS_TH = ['','มุฮัรรอม','เศาะฟัร','ร่อบีอุลเอาวัล','ร่อบีอุษษานี','ญุมาดัลอูลา',
    'ญุมาดัษษานียะฮ์','ร่อญับ','ชะอ์บาน','ร่อมะฎอน','เชาวาล','ซุลก็อยดะฮ์','ซุลฮิจญะฮ์'];

  const toMin = t => { const [a, b] = t.split(':').map(Number); return a * 60 + b; };

  let prayers = buildPrayers(FALLBACK);

  // สร้างรายการละหมาดจากชุดเวลา {Fajr, Dhuhr, ...}
  function buildPrayers(timings) {
    const arr = ['Fajr','Dhuhr','Asr','Maghrib','Isha'].map(k => ({
      name: PMETA[k].name, en: k, icon: PMETA[k].icon, time: (timings[k] || '').slice(0, 5)
    }));
    if (new Date().getDay() === 5) arr.push(JUMUAH);  // วันศุกร์เท่านั้น
    return arr;
  }

  // นับถอยหลังถึงละหมาดถัดไป
  function updateCountdown() {
    const el = document.getElementById('hero-countdown');
    if (!el) return;
    const cur = new Date().getHours() * 60 + new Date().getMinutes();
    const daily = prayers.filter(p => p.en !== 'Jumuah');
    const next = daily.find(p => toMin(p.time) > cur);
    const mins = next ? toMin(next.time) - cur : (24 * 60 - cur) + toMin(daily[0].time);
    const h = Math.floor(mins / 60), m = mins % 60;
    el.textContent = 'อีก ' + (h > 0 ? h + ' ชม. ' : '') + m + ' นาที';
  }

  // แสดงวันที่ฮิจเราะห์ (ภาษาไทย)
  function setDate(hijri) {
    const el = document.getElementById('prayer-date');
    if (!el || !hijri) return;
    const wd  = TH_WEEKDAY[new Date().getDay()];
    const mth = HIJRI_MONTHS_TH[+hijri.month.number] || hijri.month.en;
    el.textContent = `${wd} · ${TH_DIGITS(hijri.day)} ${mth} ${TH_DIGITS(hijri.year)} ฮ.ศ.`;
  }

  // วาดตารางเวลาละหมาด + ไฮไลต์ละหมาดถัดไป
  function render() {
    const grid = document.getElementById('prayerGrid');
    if (!grid) return;
    const cur = new Date().getHours() * 60 + new Date().getMinutes();
    let nextIdx = prayers.findIndex(p => p.en !== 'Jumuah' && toMin(p.time) > cur);
    if (nextIdx === -1) nextIdx = 0;  // เลยอิชาอ์แล้ว → ซุบฮิวันพรุ่งนี้

    grid.innerHTML = prayers.map((p, i) => {
      const active = i === nextIdx;
      return `<div class="relative rounded-2xl p-4 text-center transition ${active ? 'bg-gold text-green-950 shadow-lg scale-[1.03]' : 'bg-white/5 text-white border border-white/10'}">
        ${active ? '<span class="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-950 text-gold-light text-[10px] font-kanit font-600 px-2.5 py-0.5 rounded-full">ถัดไป</span>' : ''}
        <i class="fa-solid ${p.icon} text-lg ${active ? 'text-green-900' : 'text-gold'}"></i>
        <p class="font-kanit font-600 mt-2 ${active ? 'text-green-950' : 'text-white'}">${p.name}</p>
        <p class="text-[11px] ${active ? 'text-green-800' : 'text-white/50'}">${p.en}</p>
        <p class="font-kanit font-700 text-xl mt-1 ${active ? 'text-green-950' : 'text-white'}">${p.time}</p>
      </div>`;
    }).join('');

    const hn = document.getElementById('hero-next');
    if (hn) hn.textContent = `${prayers[nextIdx].name} · ${prayers[nextIdx].time}`;
    updateCountdown();
  }

  // โหลดเวลาจริง: ใช้แคชวันนี้ก่อน แล้วค่อยอัปเดตจาก API
  async function load() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const key = `prayer-${dd}-${mm}-${now.getFullYear()}`;

    const cached = localStorage.getItem(key);
    if (cached) {
      try { const d = JSON.parse(cached); prayers = buildPrayers(d.timings); setDate(d.date.hijri); } catch (e) {}
    }
    render();

    try {
      const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${now.getFullYear()}`
        + `?latitude=${P.lat}&longitude=${P.lng}&method=${P.method}&school=${P.school}`;
      const json = await (await fetch(url)).json();
      if (json.code === 200 && json.data) {
        localStorage.setItem(key, JSON.stringify(json.data));
        prayers = buildPrayers(json.data.timings);
        setDate(json.data.date.hijri);
        render();
      }
    } catch (e) {
      console.warn('โหลดเวลาละหมาดจาก API ไม่สำเร็จ ใช้เวลาสำรองแทน', e);
    }
  }

  render();                      // แสดงทันทีด้วยเวลาสำรอง
  load();                        // แล้วอัปเดตด้วยเวลาจริง
  setInterval(render, 60000);    // รีเฟรช "ถัดไป" + นับถอยหลังทุกนาที
})();
