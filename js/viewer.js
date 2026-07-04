/* =====================================================================
   viewer.js — ป็อปอัปเปิดดูไฟล์ในเว็บ (Lightbox) ใช้ซ้ำได้ทุกหน้า
   • PDF / เอกสาร / รูป / เสียง จาก Google ไดรฟ์ → อ่านในเว็บเลย + ปุ่มดาวน์โหลด
   • วิดีโอ YouTube → เล่นในเว็บ
   • ลิงก์เว็บทั่วไป → เปิดแท็บใหม่ (ฝังไม่ได้)
   เรียกใช้: Viewer.open(url, title)  หรือปุ่ม onclick="Viewer.fromBtn(this)"
   ===================================================================== */

window.Viewer = (function () {
  const esc = window.esc;
  function driveId(u){ const m=String(u).match(/\/d\/([-\w]{20,})/)||String(u).match(/[?&]id=([-\w]{20,})/); return m?m[1]:null; }
  function ytId(u){ const m=String(u).match(/(?:youtu\.be\/|v=|\/embed\/)([-\w]{11})/); return m?m[1]:null; }
  const isImg = u => /\.(jpe?g|png|gif|webp|bmp)(\?|#|$)/i.test(String(u));
  const isPdf = u => /\.pdf(\?|#|$)/i.test(String(u));
  function previewable(u){ return !!(driveId(u) || ytId(u) || isImg(u) || isPdf(u)); }

  let root;
  function ensure(){
    if(root) return root;
    root=document.createElement('div');
    root.id='vwOverlay';
    root.className='fixed inset-0 z-[100] hidden bg-black/70 backdrop-blur-sm p-3 sm:p-8';
    root.addEventListener('click', e=>{ if(e.target===root) close(); });
    root.innerHTML=`<div class="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col" style="height:90vh">
      <div class="flex items-center justify-between gap-3 px-5 py-3 border-b border-stone-100 shrink-0">
        <h3 id="vwTitle" class="font-kanit font-600 text-green-900 truncate"></h3>
        <button type="button" onclick="Viewer.close()" aria-label="ปิด" class="shrink-0 w-9 h-9 rounded-full hover:bg-stone-100 grid place-items-center text-stone-500 transition"><i class="fa-solid fa-xmark text-lg"></i></button>
      </div>
      <div id="vwBody" class="flex-1 bg-stone-50 overflow-auto grid place-items-center"></div>
      <div id="vwFoot" class="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-100 shrink-0"></div>
    </div>`;
    document.body.appendChild(root);
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });
    return root;
  }

  function open(url, title){
    url=String(url||'').trim(); if(!url) return;
    if(!window.safeHttp(url)) return;                 // ยอมเฉพาะ http(s) — กัน javascript:/data:
    if(!previewable(url)){ window.open(url,'_blank','noopener'); return; }   // ลิงก์ทั่วไป → แท็บใหม่
    ensure();
    document.getElementById('vwTitle').textContent = title || 'เอกสาร';
    const body=document.getElementById('vwBody'), foot=document.getElementById('vwFoot');
    const id=driveId(url), yt=ytId(url);
    let openUrl=url, dl='';

    if(id){
      body.innerHTML=`<iframe src="https://drive.google.com/file/d/${id}/preview" class="w-full h-full" style="border:0" allow="autoplay"></iframe>`;
      openUrl=`https://drive.google.com/file/d/${id}/view`;
      dl=`https://drive.google.com/uc?export=download&id=${id}`;
    } else if(yt){
      body.innerHTML=`<iframe src="https://www.youtube.com/embed/${yt}" class="w-full h-full" style="border:0" allowfullscreen></iframe>`;
      openUrl=`https://youtu.be/${yt}`;
    } else if(isImg(url)){
      body.innerHTML=`<img src="${esc(url)}" referrerpolicy="no-referrer" class="max-w-full max-h-full object-contain">`;
      dl=url;
    } else { // .pdf ตรง
      body.innerHTML=`<iframe src="${esc(url)}" class="w-full h-full" style="border:0"></iframe>`;
      dl=url;
    }

    foot.innerHTML=
      (dl?`<a href="${esc(dl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white font-kanit font-500 text-sm px-4 py-2 rounded-full transition"><i class="fa-solid fa-download"></i> ดาวน์โหลด</a>`:'')
      +`<a href="${esc(openUrl)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 font-kanit font-500 text-sm bg-white border border-stone-200 text-stone-600 hover:border-green-300 hover:text-green-700 px-4 py-2 rounded-full transition"><i class="fa-solid fa-arrow-up-right-from-square text-xs"></i> เปิดในแท็บใหม่</a>`;

    root.classList.remove('hidden');
    document.body.style.overflow='hidden';
  }

  function close(){ if(root){ root.classList.add('hidden'); document.getElementById('vwBody').innerHTML=''; document.body.style.overflow=''; } }
  function fromBtn(btn){ open(btn.dataset.url, btn.dataset.title); }

  return { open, close, fromBtn, previewable };
})();
