// 2026-11-07: ayni isimle birden cok oda.
// (1) Didn't Do It oda oda: her oda kendi touch'iyla, kendi sebebiyle; eski (misafir bazli) kayit odalara devredilir.
// (2) Uyari: ayni isim birden cok odada (birlikte gelen: turuncu; misafir iceriyken acilan: kirmizi), "Tamam" susturur.
// (3) Kayit: odayi yazinca "ayni isim: <diger oda>" ipucu. (4) Rapor odalari ayri satir yazar.
const H=require('./h.js');
(async()=>{
 const {p,ok,done}=await H.open({today:'2026-11-07',time:'19:00',butlers:['Defne Aksoy','Kerem Tunalı'],me:'Defne Aksoy'});
 const R=H.row;
 await H.seed(p,{gih:[R('1302','Lindqvist,Mira,Mrs.','2026-11-04','2026-11-10'),R('1306','Lindqvist,Mira,Mrs.','2026-11-04','2026-11-10'),R('1307','Lindqvist,Mira,Mrs.','2026-11-04','2026-11-10'),
   R('0805','Okonkwo,Tade,Mr.','2026-11-02','2026-11-09'),R('1203','Okonkwo,Tade,Mr.','2026-11-07','2026-11-09'),R('0901','Varga,Bence,Mr.','2026-11-05','2026-11-08')],
   logs:{'2026-11-05':[H.log('a1','2026-11-05','20:00','1302','Mira Lindqvist','Turndown',{butler:'Defne Aksoy'}),H.log('a2','2026-11-05','20:10','0805','Tade Okonkwo','Turndown',{butler:'Defne Aksoy'}),
     H.log('a3','2026-11-05','20:20','0901','Bence Varga','Turndown',{butler:'Defne Aksoy'})]},
   kv:{bdi_nt_v1:{'2026-11-06':{'lindqvist mira':{r:'DND',n:'',u:1}}}}});
 await p.evaluate(()=>{__ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-07';__ev('bdiFloorSetCount(2)');__ev('bdiFloorAssign(0,"Defne Aksoy")');__ev('bdiFloorAssign(1,"Kerem Tunalı")')});
 // (1) liste
 const L=await p.evaluate(()=>{const L=__ev('bdiNtList')('2026-11-07');return {total:L.total,rows:L.rows.map(g=>g.rooms.join('/')).sort().join(','),keys:L.rows.map(g=>g.gk)}});
 ok(L.rows==='1203,1306,1307'&&L.total===6,'oda oda: 1302 kendi touch\'iyla dustu, 1306 ve 1307 ayri; 0805 dokunuldu, ayni isimle yeni acilan 1203 ayri (6 oda) — '+L.rows+' / '+L.total);
 await H.tab(p,'nt');
 const T=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel table.bd-nt-tab tbody tr')].map(tr=>({r:tr.querySelector('td.r').textContent,dup:!!tr.querySelector('.bd-dup'),pv:(tr.querySelector('.bd-nt-prev')||{}).textContent||'',g:tr.querySelector('select[data-f="r"]').getAttribute('data-g')})));
 const t6=T.find(x=>x.r==='1306'),t7=T.find(x=>x.r==='1307');
 ok(t6&&t7&&t6.dup&&t7.dup&&t6.g!==t7.g,'1306 ve 1307 ayri satir, "ayni isim" etiketi, ayri anahtar ('+(t6&&t6.g)+' / '+(t7&&t7.g)+')');
 ok(/06\.11: DND/.test(t6.pv)&&/06\.11: DND/.test(t7.pv),'dunku (misafir bazli) sebep iki odaya da "aynisi" onerisi olarak geldi');
 await p.selectOption(`#bdiNtPanel select[data-f="r"][data-g="${t6.g}"]`,'DND');await p.waitForTimeout(150);
 await p.selectOption(`#bdiNtPanel select[data-f="r"][data-g="${t7.g}"]`,'Guest not in room');await p.waitForTimeout(150);
 const st=await p.evaluate(([a,b])=>{const o=JSON.parse(__ev('BdiKV').get('bdi_nt_v1'))['2026-11-07']||{};return [(o[a]||{}).r,(o[b]||{}).r]},[t6.g,t7.g]);
 ok(st[0]==='DND'&&st[1]==='Guest not in room','her odaya ayri sebep saklandi: '+st.join(' / '));
 // (2) uyari
 let W=await p.evaluate(()=>__ev('swWarnCollect')().filter(x=>x.g==='Aynı isim').map(x=>({s:x.sev,t:x.t,ok:x.ok})));
 const wf=W.find(x=>/Lindqvist/.test(x.t)),wl=W.find(x=>/Okonkwo/.test(x.t));
 ok(W.length===2&&wf&&wf.s==='mid'&&/3 odada \(1302 \+ 1306 \+ 1307\)/.test(wf.t),'uyari: birlikte gelen 3 oda (turuncu) — '+(wf&&wf.t));
 ok(wl&&wl.s==='high'&&/0805 \+ 1203/.test(wl.t)&&/1203 07\.11 misafir içerideyken açıldı/.test(wl.t),'uyari: misafir iceriyken acilan oda (kirmizi) — '+(wl&&wl.t));
 await p.evaluate(()=>__ev('swWarnOpen()'));
 const btn=await p.evaluate(()=>[...document.querySelectorAll('#swWarnModal button')].filter(b=>b.textContent==='Tamam').length);
 ok(btn===2,'Uyarılar penceresinde iki "Tamam" dugmesi');
 await p.evaluate(()=>{const b=[...document.querySelectorAll('#swWarnModal button')].find(b=>b.textContent==='Tamam'&&/Lindqvist/.test(b.parentNode.textContent));b.click()});await p.waitForTimeout(150);
 W=await p.evaluate(()=>__ev('swWarnCollect')().filter(x=>x.g==='Aynı isim').map(x=>x.t));
 ok(W.length===1&&/Okonkwo/.test(W[0]),'"Tamam" sonrasi aile uyarisi sustu, digeri duruyor');
 await p.evaluate(()=>{document.getElementById('swWarnModal').style.display='none'});
 // rapor oncesi kontrolde de gorunur
 const gate=await p.evaluate(()=>{__ev('bdiReportGate')('ntT');const m=document.getElementById('swWarnModal');const t=m&&m.style.display!=='none'?m.textContent:'';if(m)m.style.display='none';return t});
 ok(/Aynı isim/.test(gate)&&/Okonkwo/.test(gate),'Didn\'t Do It raporundan once de uyariyor');
 // (3) Kayit ipucu
 await H.tab(p,'entry');
 await p.fill('#bdiRoom','1203');await p.waitForTimeout(150);
 const hint=await p.evaluate(()=>document.getElementById('bdiGuestHint').textContent);
 ok(/aynı isim: 0805/.test(hint),'Kayit: 1203 yazinca "ayni isim: 0805" — '+hint);
 await p.fill('#bdiRoom','0901');await p.waitForTimeout(150);
 const hint2=await p.evaluate(()=>document.getElementById('bdiGuestHint').textContent);
 ok(!/aynı isim/.test(hint2),'tek odali misafirde ipucu yok');
 // (4) rapor
 const rep=await p.evaluate(()=>{__ev('bdiNtDateSet')('2026-11-07');return window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')})});
 const RR=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return [...d.querySelectorAll('tr.gh .rc')].map(x=>x.textContent).sort().join(',')},rep);
 ok(RR==='1203,1306,1307'&&/DND/.test(rep)&&/Guest not in room/.test(rep),'rapor: odalar ayri satir, kendi sebepleriyle ('+RR+')');
 await done();
})();
