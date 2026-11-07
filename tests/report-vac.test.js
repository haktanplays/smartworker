// Oda durumu raporu (HSK01124 VAC) ritmi: gun icinde saat basi VAC, iki VAC arasindaki hareketler (cikti / giris / oda degisti),
// Brifing kaynak satiri, Rapor Merkezi gunluk ritim ve gun sonu raporlari. Sahte Opera raporlari, isimler kurgu (KVKK).
// Bos / bozuk PDF'te Turkce mesaj. (Gercek raporlu vacrhythm ve fx_plan-entry K7'nin yerine, 2026-11-07.)
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05',J=JSON.stringify;
const at=(p,hm)=>p.clock.setSystemTime(new Date(D+'T'+hm+':00+03:00'));
const G={fair:{name:'Fairbanks,Odette,Mrs.',arr:'2026-11-04',dep:'2026-11-09'},lind:{name:'Lindqvist,Tomas,Mr.',arr:D,dep:'2026-11-08'},
  oka:{name:'Okafor,Chidi,Mr.',arr:'2026-11-02',dep:D},ozt:{name:'Öztürk,Ilgın,Ms.',arr:'2026-11-05',dep:'2026-11-09'}};
const ROOMS=['0701','0702','0703','0705','1406','1408'];
const vacRows=occ=>ROOMS.map(r=>{const o=occ[r];if(!o)return {room:r,fo:'VAC',hk:'CL',nv:'1'};const g=G[o[0]],due=o[1]==='Due In';
  return {room:r,name:g.name,fo:due?'VAC':'OCC',hk:due?'IP':'PU',res:o[1],arr:g.arr,dep:g.dep}});

(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'08:00',butlers:['Can Demir'],me:'Can Demir'});
 // 08:00 dun aksamin in-house raporu (05.11 22:00)
 let m=await H.ingest(p,await R.gih({day:Y,time:'22:00',rows:[{room:'0701',name:G.fair.name,arr:G.fair.arr,dep:G.fair.dep},{room:'0705',name:G.oka.name,arr:G.oka.arr,dep:G.oka.dep},
   {room:'1406',name:G.ozt.name,arr:G.ozt.arr,dep:G.ozt.dep}]},br),'GIH01102.pdf');console.log('  GIH 05.11: '+m);
 // 09:00 VAC 1: Lindqvist bekleniyor (Due In), Okafor ve Ozturk odada
 await at(p,'09:00');m=await H.ingest(p,await R.vac({day:D,time:'09:00',rows:vacRows({'0701':['fair','Checked In'],'0702':['lind','Due In'],'0705':['oka','Checked In'],'1406':['ozt','Checked In']})},br),'HSK01124.pdf');console.log('  VAC 09:00: '+m);
 // 10:00 VAC 2: Okafor cikti, Lindqvist giris yapti, Ozturk 1406 -> 1408
 await at(p,'10:00');m=await H.ingest(p,await R.vac({day:D,time:'10:00',rows:vacRows({'0701':['fair','Checked In'],'0702':['lind','Checked In'],'1408':['ozt','Checked In']})},br),'HSK01124.pdf');console.log('  VAC 10:00: '+m);
 const E=await p.evaluate(d=>__ev('bdiVacEvents')(d).map(e=>({type:e.type,room:e.room,from:e.from||'',name:e.name})),D);
 ok(E.length===3&&E.some(e=>e.type==='out'&&e.room==='0705')&&E.some(e=>e.type==='in'&&e.room==='0702')&&E.some(e=>e.type==='move'&&e.from==='1406'&&e.room==='1408'),'VAC farkı: 0705 çıktı, 0702 giriş, 1406 → 1408 oda değişti '+J(E));

 // Brifing > Gunun akisi
 await H.tab(p,'brief');await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(400);
 const F=await p.evaluate(()=>{const s=[...document.querySelectorAll('#bdiBriefBody section.bd-fd-g')].find(x=>/Gün içi hareketler/.test(x.querySelector('h3').textContent));
   return {head:s?s.querySelector('h3').textContent.replace(/\s+/g,' ').trim():'',rows:s?[...s.querySelectorAll('.bd-fd-row')].map(b=>({tag:b.querySelector('.bd-fd-tag').textContent,main:b.querySelector('.bd-fd-main').textContent.replace(/\s+/g,' ').trim(),sub:b.querySelector('.bd-fd-sub').textContent,r:b.querySelector('.bd-fd-r').textContent})):[],
     src:(document.querySelector('#bdiBriefBody .bd-fd-src')||{}).textContent||''}});
 const row=t=>F.rows.find(x=>x.tag===t)||{};
 ok(/Gün içi hareketler 3/.test(F.head)&&/1 giriş · 1 çıkış/.test(F.head),'Günün akışı > "Gün içi hareketler": 3 hareket, "1 giriş · 1 çıkış" ('+F.head+')');
 ok(/0705/.test(row('Çıktı').main)&&/Chidi Okafor/.test(row('Çıktı').main)&&/09:00–10:00 arası/.test(row('Çıktı').sub),'çıktı: 0705 Chidi Okafor, "09:00–10:00 arası" '+J(row('Çıktı')));
 ok(/0702/.test(row('Giriş').main)&&/karşılanmadı/.test(row('Giriş').r)&&/09:00–10:00 arası/.test(row('Giriş').sub),'giriş: 0702, karşılanmadı, saat aralığıyla '+J(row('Giriş')));
 ok(/1406 → 1408/.test(row('Oda').main)&&/Ilgın Öztürk/.test(row('Oda').main)&&/09:00–10:00 arası/.test(row('Oda').sub),'oda değişti: 1406 → 1408 Ilgın Öztürk, saat aralığıyla '+J(row('Oda')));
 ok(F.src.includes('In-house 05.11 (dün akşam) · VAC son 10:00 (2 kez)'),'kaynak satırı: "In-house 05.11 (dün akşam) · VAC son 10:00 (2 kez)": '+F.src);

 // Rapor Merkezi 10:00: gun sonu raporlari (in-house, cikis) "gün sonunda"; ustte gunluk ritim
 const rep=async()=>{await p.evaluate(()=>__ev('swRepOpen()'));await p.waitForTimeout(300);
   return p.evaluate(()=>{const m=document.getElementById('swRepModal'),o={};[...m.querySelectorAll('tr')].forEach(tr=>{const td=tr.querySelectorAll('td');if(td.length)o[td[0].textContent.trim()]=td[1].textContent.replace(/\s+/g,' ').trim()});
     const t=m.textContent;document.getElementById('swRepModal').style.display='none';return {rows:o,ritim:/Günlük ritim:.*gün içinde yalnız oda durumu \(VAC\), saat başı.*gün sonunda in-house, varış ve çıkış/.test(t)}})};
 let RM=await rep();const k=(o,re)=>Object.keys(o).find(x=>re.test(x));
 const kIn=k(RM.rows,/In-house|GIH/i),kDep=k(RM.rows,/Çıkış|DEP/i),kVac=k(RM.rows,/VAC|Oda durumu/i);
 ok(RM.ritim&&/^gün sonunda/.test(RM.rows[kIn]||'')&&/^gün sonunda/.test(RM.rows[kDep]||''),'Rapor Merkezi 10:00: in-house ve çıkış "gün sonunda", üst satırda günlük ritim '+J({[kIn]:RM.rows[kIn],[kDep]:RM.rows[kDep]}));
 ok(/05\.11 raporu/.test(RM.rows[kIn]||'')&&/bugün 2 kez/.test(RM.rows[kVac]||''),'Rapor Merkezi: dünkü in-house "son: 05.11 raporu", VAC "bugün 2 kez" '+J({in:RM.rows[kIn],vac:RM.rows[kVac]}));
 // 22:00: cikis raporu hala yok
 await at(p,'22:00');RM=await rep();
 ok(/^gün sonu bekleniyor/.test(RM.rows[kDep]||''),'Rapor Merkezi 22:00: çıkış raporu "gün sonu bekleniyor" ('+RM.rows[kDep]+')');
 // bos ve bozuk PDF: Turkce mesaj
 const e1=await H.ingest(p,Buffer.alloc(0),'HSK01124.pdf'),e2=await H.ingest(p,Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog >> bozuk'),'HSK01124.pdf');
 ok(e1==='Okunamadı: dosya boş ya da bozuk PDF','boş PDF: Türkçe mesaj ("'+e1+'")');
 ok(e2==='Okunamadı: dosya boş ya da bozuk PDF','bozuk PDF: aynı Türkçe mesaj ("'+e2+'")');
 await done();
})();
