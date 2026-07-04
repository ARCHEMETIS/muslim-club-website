/* =====================================================================
   documents.js — คลังเอกสาร (จัดตามปีการศึกษา / เทอม / โครงการ)
   • ยังไม่ใส่ลิงก์ชีต → แสดงตัวอย่าง | ใส่ลิงก์แล้ว → ดึงจากชีตจริง
   โครงคอลัมน์ชีต:
     ชื่อเอกสาร | ปีการศึกษา | เทอม | โครงการ | ประเภทไฟล์ | ขนาด | วันที่ | ลิงก์
   ===================================================================== */

window.Documents = (function () {

  // ---------- ตัวอย่าง (จัดเป็นปี/เทอม/โครงการ ให้เห็นภาพการใช้งานจริง) ----------
  const SAMPLE = [
    { 'ชื่อเอกสาร':'เอกสารโครงการละศีลอดสัมพันธ์ 2569','ปีการศึกษา':'2569','เทอม':'2','โครงการ':'โครงการละศีลอดสัมพันธ์','ประเภทไฟล์':'PDF','ขนาด':'2.4 MB','วันที่':'2 เม.ย. 2569','ลิงก์':'#' },
    { 'ชื่อเอกสาร':'สรุปงบประมาณโครงการละศีลอด','ปีการศึกษา':'2569','เทอม':'2','โครงการ':'โครงการละศีลอดสัมพันธ์','ประเภทไฟล์':'XLSX','ขนาด':'120 KB','วันที่':'30 เม.ย. 2569','ลิงก์':'#' },
    { 'ชื่อเอกสาร':'กำหนดการกิจกรรมละศีลอด','ปีการศึกษา':'2569','เทอม':'2','โครงการ':'โครงการละศีลอดสัมพันธ์','ประเภทไฟล์':'DOCX','ขนาด':'88 KB','วันที่':'28 มี.ค. 2569','ลิงก์':'#' },
    { 'ชื่อเอกสาร':'เอกสารโครงการกีฬาสีสัมพันธ์','ปีการศึกษา':'2569','เทอม':'2','โครงการ':'โครงการกีฬาสีสัมพันธ์','ประเภทไฟล์':'PDF','ขนาด':'1.8 MB','วันที่':'15 พ.ค. 2569','ลิงก์':'#' },
    { 'ชื่อเอกสาร':'สรุปผลโครงการกีฬาสี (นำเสนอ)','ปีการศึกษา':'2569','เทอม':'2','โครงการ':'โครงการกีฬาสีสัมพันธ์','ประเภทไฟล์':'PPTX','ขนาด':'5.2 MB','วันที่':'1 มิ.ย. 2569','ลิงก์':'#' },
    { 'ชื่อเอกสาร':'เอกสารโครงการรับน้องใหม่','ปีการศึกษา':'2569','เทอม':'1','โครงการ':'โครงการรับน้องใหม่','ประเภทไฟล์':'PDF','ขนาด':'1.1 MB','วันที่':'10 ก.ค. 2569','ลิงก์':'#' },
    { 'ชื่อเอกสาร':'ใบสมัครสมาชิกชมรม (แบบฟอร์ม)','ปีการศึกษา':'2569','เทอม':'1','โครงการ':'โครงการรับน้องใหม่','ประเภทไฟล์':'DOCX','ขนาด':'64 KB','วันที่':'5 ก.ค. 2569','ลิงก์':'#' },
    { 'ชื่อเอกสาร':'เอกสารโครงการเมาลิดสัมพันธ์','ปีการศึกษา':'2568','เทอม':'2','โครงการ':'โครงการเมาลิดสัมพันธ์','ประเภทไฟล์':'PDF','ขนาด':'2.0 MB','วันที่':'12 ม.ค. 2569','ลิงก์':'#' },
    { 'ชื่อเอกสาร':'รายงานสรุปโครงการเมาลิด','ปีการศึกษา':'2568','เทอม':'2','โครงการ':'โครงการเมาลิดสัมพันธ์','ประเภทไฟล์':'PDF','ขนาด':'1.5 MB','วันที่':'20 ม.ค. 2569','ลิงก์':'#' },
  ];

  const FILE_STYLE = {
    PDF:{icon:'fa-file-pdf',box:'bg-red-50 text-red-500'}, DOC:{icon:'fa-file-word',box:'bg-blue-50 text-blue-500'},
    DOCX:{icon:'fa-file-word',box:'bg-blue-50 text-blue-500'}, PPT:{icon:'fa-file-powerpoint',box:'bg-amber-50 text-amber-500'},
    PPTX:{icon:'fa-file-powerpoint',box:'bg-amber-50 text-amber-500'}, XLS:{icon:'fa-file-excel',box:'bg-green-50 text-green-600'},
    XLSX:{icon:'fa-file-excel',box:'bg-green-50 text-green-600'}, ZIP:{icon:'fa-file-zipper',box:'bg-stone-100 text-stone-500'},
    IMG:{icon:'fa-file-image',box:'bg-purple-50 text-purple-500'},
  };
  const DEFAULT_STYLE = { icon:'fa-file', box:'bg-stone-100 text-stone-500' };
  const MONTHS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  let docs = SAMPLE.slice();
  let fYear = 'all', fTerm = 'all', sortBy = 'new', term = '';

  const esc = window.esc;
  const styleOf = t => FILE_STYLE[String(t||'').toUpperCase().trim()] || DEFAULT_STYLE;
  const projOf = d => d['โครงการ'] || 'เอกสารทั่วไป';
  const yearOf = d => d['ปีการศึกษา'] || '';
  const termOf = d => d['เทอม'] || '';

  function parseDate(s){ s=String(s||'').trim();
    if(/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s);                       // 2026-06-11
    let m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);                            // 11/06/2026 (ประทับเวลาฟอร์ม)
    if(m){let y=+m[3];if(y>2500)y-=543;return new Date(y,+m[2]-1,+m[1]);}
    const p=s.split(/\s+/); if(p.length>=3){const mi=MONTHS.indexOf(p[1]);let y=parseInt(p[2],10);if(y>2500)y-=543;if(mi>=0&&y)return new Date(y,mi,parseInt(p[0],10));}
    return null; }

  function driveId(u){ const m=String(u).match(/\/d\/([-\w]{20,})/)||String(u).match(/[?&]id=([-\w]{20,})/); return m?m[1]:null; }
  function viewLink(u){ const id=driveId(u); return id?`https://drive.google.com/file/d/${id}/view`:u; }
  function dlLink(u){ const id=driveId(u); return id?`https://drive.google.com/uc?export=download&id=${id}`:u; }

  // เดาข้อมูลที่ "ไม่ต้องกรอก" ให้อัตโนมัติ
  const EXT_TYPE = {pdf:'PDF',doc:'DOC',docx:'DOCX',ppt:'PPT',pptx:'PPTX',xls:'XLS',xlsx:'XLSX',csv:'XLSX',zip:'ZIP',rar:'ZIP',jpg:'IMG',jpeg:'IMG',png:'IMG',gif:'IMG',webp:'IMG'};
  // ลิงก์: ใช้ช่อง "ลิงก์" ถ้าไม่มี → หาค่าแรกในแถวที่เป็น URL (รองรับช่องอัปโหลดไฟล์ของฟอร์ม)
  function linkOf(d){ if(d['ลิงก์']&&d['ลิงก์']!=='#') return d['ลิงก์']; for(const k in d){ if(/^https?:\/\//i.test(String(d[k]||''))) return d[k]; } return ''; }
  // ชนิดไฟล์: ใช้ช่อง "ประเภทไฟล์" ถ้าเว้นว่าง → เดาจากนามสกุลในลิงก์
  function typeOf(d){ const t=String(d['ประเภทไฟล์']||'').trim(); if(t) return t; const m=String(linkOf(d)).split(/[?#]/)[0].match(/\.([a-z0-9]{2,5})$/i); return m?(EXT_TYPE[m[1].toLowerCase()]||''):''; }
  // วันที่: ใช้ช่อง "วันที่" ถ้าเว้นว่าง → ใช้ "ประทับเวลา"/Timestamp ของฟอร์ม
  function dateOf(d){ return d['วันที่']||d['ประทับเวลา']||d['Timestamp']||d['timestamp']||''; }

  const uniq = (arr) => [...new Set(arr.filter(x => x !== ''))];

  // เติมตัวเลือกปีการศึกษา + เทอม
  function fillFilters() {
    const ys=document.getElementById('docYear'), ts=document.getElementById('docTerm');
    if (ys) { const years=uniq(docs.map(yearOf)).sort((a,b)=>b.localeCompare(a,'th'));
      ys.innerHTML = `<option value="all">ทุกปีการศึกษา</option>` + years.map(y=>`<option value="${esc(y)}" ${fYear===y?'selected':''}>ปีการศึกษา ${esc(y)}</option>`).join(''); }
    if (ts) { const terms=uniq(docs.map(termOf)).sort((a,b)=>a.localeCompare(b,'th'));
      ts.innerHTML = `<option value="all">ทุกเทอม</option>` + terms.map(t=>`<option value="${esc(t)}" ${fTerm===t?'selected':''}>เทอม ${esc(t)}</option>`).join(''); }
  }

  function sortDocs(list){ const a=list.slice();
    if(sortBy==='name') a.sort((x,y)=>String(x['ชื่อเอกสาร']||'').localeCompare(String(y['ชื่อเอกสาร']||''),'th'));
    else a.sort((x,y)=>{const dx=parseDate(dateOf(x))||0,dy=parseDate(dateOf(y))||0; return sortBy==='old'?dx-dy:dy-dx;});
    return a; }

  function renderAddBtn(){ const box=document.getElementById('docAddBtn'); if(!box)return;
    const form=window.CONFIG&&CONFIG.forms&&CONFIG.forms.documents;
    box.innerHTML=form?`<a href="${esc(form)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white text-sm font-kanit font-500 px-4 py-2 rounded-full transition"><i class="fa-solid fa-plus"></i> เพิ่มเอกสาร</a>`:''; }

  function row(d){
    const lk=linkOf(d), ty=typeOf(d), dt=dateOf(d);
    const st=styleOf(ty);
    const meta=[ty,d['ขนาด'],dt?'อัปเดต '+dt:''].filter(Boolean).map(esc).join(' · ');
    const has=!!(lk&&lk!=='#'&&window.safeHttp(lk));   // เฉพาะลิงก์ http(s) — กันลิงก์แฝงจากชีต
    const preview=has?`<a href="${esc(viewLink(lk))}" target="_blank" rel="noopener" title="ดูตัวอย่าง" class="shrink-0 w-10 h-10 rounded-full border border-stone-200 text-stone-500 hover:border-green-300 hover:text-green-700 grid place-items-center transition"><i class="fa-solid fa-eye text-sm"></i></a>`:'';
    const dl=has?esc(dlLink(lk)):'#', tgt=has?' target="_blank" rel="noopener"':'';
    return `<div class="group flex items-center gap-4 p-4 sm:p-5 hover:bg-green-50/50 transition">
      <span class="shrink-0 w-12 h-12 rounded-xl ${st.box} grid place-items-center text-xl"><i class="fa-solid ${st.icon}"></i></span>
      <div class="min-w-0 flex-1"><p class="font-kanit font-500 text-stone-800 truncate">${esc(d['ชื่อเอกสาร'])}</p><p class="text-[13px] text-stone-400 mt-0.5">${meta}</p></div>
      ${preview}
      <a href="${dl}"${tgt} class="shrink-0 inline-flex items-center gap-2 bg-green-800 group-hover:bg-green-900 text-white text-sm font-kanit font-500 px-4 py-2.5 rounded-full transition-all"><i class="fa-solid fa-download"></i><span class="hidden sm:inline">ดาวน์โหลด</span></a>
    </div>`;
  }

  function renderList(){
    const box=document.getElementById('docList'); if(!box) return;
    const q=term.trim().toLowerCase();
    const shown=sortDocs(docs.filter(d=>
      (fYear==='all'||yearOf(d)===fYear) && (fTerm==='all'||termOf(d)===fTerm) &&
      (!q || String(d['ชื่อเอกสาร']||'').toLowerCase().includes(q) || projOf(d).toLowerCase().includes(q))
    ));
    const count=document.getElementById('docCount');
    if(count) count.textContent = q?`พบ ${shown.length} รายการ จากคำค้น “${term.trim()}”`:`ทั้งหมด ${shown.length} รายการ`;

    if(!shown.length){ box.innerHTML=`<div class="text-center text-stone-400 py-16"><i class="fa-solid fa-folder-open text-4xl mb-3"></i><p class="font-kanit">ไม่พบเอกสารในเงื่อนไขที่เลือก</p></div>`; return; }

    // จัดกลุ่มตามโครงการ
    const groups={}; shown.forEach(d=>{const p=projOf(d); (groups[p]=groups[p]||[]).push(d);});
    box.innerHTML=Object.keys(groups).map(proj=>{
      const sample=groups[proj][0];
      const ctx=[yearOf(sample)?'ปี '+yearOf(sample):'', termOf(sample)?'เทอม '+termOf(sample):''].filter(Boolean).join(' · ');
      return `<div>
        <h3 class="font-kanit font-600 text-xl text-green-900 flex items-center gap-3 mb-1 flex-wrap">
          <span class="w-9 h-9 rounded-xl bg-green-50 text-green-700 grid place-items-center"><i class="fa-solid fa-folder"></i></span> ${esc(proj)}
          <span class="text-sm font-sarabun text-stone-400 font-400">(${groups[proj].length} ไฟล์)</span>
        </h3>
        ${ctx?`<p class="text-[13px] text-stone-400 ml-12 mb-4">${esc(ctx)}</p>`:'<div class="mb-4"></div>'}
        <div class="bg-white rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-100 overflow-hidden">${groups[proj].map(row).join('')}</div>
      </div>`;
    }).join('');
  }

  function renderAll(){ fillFilters(); renderList(); }   // ปุ่ม "เพิ่ม" ย้ายไปหน้าทีมงาน (team.html) เพื่อความปลอดภัย

  // ---------- ฟังก์ชันที่ HTML เรียก ----------
  function setYear(v){ fYear=v; renderList(); }
  function setTerm(v){ fTerm=v; renderList(); }
  function sort(v){ sortBy=v; renderList(); }
  function search(v){ term=v; renderList(); }

  async function init(){
    const url=window.CONFIG&&CONFIG.sheets&&CONFIG.sheets.documents;
    if(!url){ renderAll(); return; }   // ยังไม่เชื่อมชีต → โชว์ตัวอย่าง
    const box=document.getElementById('docList');   // เชื่อมชีตแล้ว → โชว์กำลังโหลด ไม่ใช่ตัวอย่าง
    if(box) box.innerHTML='<div class="text-center text-stone-400 py-16"><i class="fa-solid fa-spinner fa-spin text-2xl"></i><p class="font-kanit mt-2">กำลังโหลด…</p></div>';
    try{ const rows=await Sheets.fetchRows(url); docs=rows; fYear='all'; fTerm='all'; renderAll(); }   // ใช้ข้อมูลจริง (ว่าง=แสดง"ไม่พบเอกสาร")
    catch(e){ renderAll(); console.warn('โหลดคลังเอกสารจากชีตไม่สำเร็จ ใช้ข้อมูลตัวอย่างแทน', e); }   // เน็ตหลุด → ตัวอย่าง
  }

  document.addEventListener('DOMContentLoaded', init);
  return { setYear, setTerm, sort, search };
})();
