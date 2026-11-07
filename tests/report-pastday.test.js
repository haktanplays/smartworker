// Gecmis gun raporlari: eski tarihli in-house (GIH), cikis (DEP), varis (ARR) ve oda durumu (VAC) bugunun listelerini degistirmez;
// yalniz o gunun listesine yazilir, o gunun kayitlarinda misafir adi kesin durumlarda duzeltilir, profil notlari Atolye'ye gelir
// (etiketiyle), onaylanan not misafir hafizasina girer. Rapor Merkezi'nde "Geçmiş gün raporları" ayri listelenir. Sabah yuklenen
// dunku in-house ise bugunun listesidir. Sahte Opera raporlari, isimler kurgu (KVKK).
// (Gercek raporlu pasttest ve atpast testlerinin yerine, 2026-11-07.)
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05',P='2026-11-03',P2='2026-11-04',J=JSON.stringify;
const TODAY=[{room:'1401',name:'Lowell,Petra,Ms.',arr:'2026-11-04',dep:'2026-11-09'},{room:'1402',name:'Marsh,Tobin,Mr.',arr:'2026-11-05',dep:'2026-11-08'}];
const PAST=[{room:'0701',name:'Ashby,Clara,Ms.',arr:'2026-11-01',dep:'2026-11-05',notes:['Prefers sparkling water at turndown']},{room:'0702',name:'Bright,Owen,Mr.',arr:'2026-11-02',dep:'2026-11-04'},
  {room:'0703',name:'Crane,Della,Ms.',arr:'2026-11-02',dep:'2026-11-05'},{room:'0704',name:'Drury,Max,Mr.',arr:'2026-11-01',dep:'2026-11-04'},
  {room:'0705',name:'Ember,Quinn,Mx.',arr:'2026-11-02',dep:'2026-11-05'},{room:'0710',name:'Frost,Nell,Ms.',arr:'2026-11-02',dep:'2026-11-05'}];

(async()=>{const {br,p,ok,done,dlg}=await H.open({today:D,time:'08:00',butlers:['Can Demir'],me:'Can Demir'});
 // gecmis gunun (03.11) kayitlari: L1 isimsiz, L2 yanlis ad, L3 dogru ad, L4 elle girilmis isimsiz, L5 o gun otelde olan baska odadaki misafir
 const L=(id,room,guest,o)=>H.log(id,P,'10:00',room,guest,'Touch Call',o);
 await H.seed(p,{logs:{[P]:[L('L1','0701','our guest'),L('L2','0702','Rupert Vane'),L('L3','0703','Della Crane'),L('L4','0704','our guest',{manual:true}),L('L5','0705','Nell Frost')]}});

 // sabah: dunku (05.11 22:00) in-house ve VAC; bugunku yokken bugunun listesi olur
 let m=await H.ingest(p,await R.gih({day:Y,time:'22:00',rows:TODAY},br),'GIH01102.pdf');
 let S=await p.evaluate(()=>({g:JSON.parse(__ev('BdiKV').get('bdi_gih_v1')||'{}').day,v:Object.keys(__ev('vacRooms')).sort().join(',')}));
 ok(!/Geçmiş gün/.test(m)&&S.g===Y&&S.v==='1401,1402','kontrol: sabah dünkü in-house (bugünkü yokken) yine bugünün listesi olur: '+m+' '+J(S));
 m=await H.ingest(p,await R.vac({day:Y,time:'22:30',rows:TODAY.map(r=>({room:r.room,name:r.name,fo:'OCC',hk:'PU',res:'Checked In',arr:r.arr,dep:r.dep}))},br),'HSK01124.pdf');
 S=await p.evaluate(()=>Object.keys(__ev('vacRooms')).sort().join(','));
 ok(/2 dolu/.test(m)&&S==='1401,1402','dünkü VAC da bugünün oda listesi oldu ('+m+')');

 // 03.11 in-house (gecmis gun)
 m=await H.ingest(p,await R.gih({day:P,time:'23:00',rows:PAST},br),'GIH01102.pdf');
 ok(/^Geçmiş gün in-house \(03\.11\.2026\): 6 oda o günün listesine yazıldı · 1 misafirin profil notu Atölye'ye geldi · 2 eski kayıtta misafir adı düzeltildi \(1 isimsiz, 1 yanlış ad\) · bugünün oda listesine dokunulmadı/.test(m),'03.11 in-house: geçmiş gün olarak tanındı: '+m);
 S=await p.evaluate(()=>({g:JSON.parse(__ev('BdiKV').get('bdi_gih_v1')).day,v:Object.keys(__ev('vacRooms')).sort().join(',')}));
 ok(S.g===Y&&S.v==='1401,1402','bugünün in-house\'u ve oda listesi değişmedi '+J(S));
 const LG=await p.evaluate(d=>{const o={};__ev('loadBdiArrayForDate')(d).forEach(l=>o[l.id]=l.guest);return o},P);
 ok(LG.L1==='Clara Ashby'&&LG.L2==='Owen Bright','düzeltildi: isimsiz kayıt (L1 → Clara Ashby), yanlış ad (L2 → Owen Bright) '+J(LG));
 ok(LG.L3==='Della Crane'&&LG.L4==='our guest'&&LG.L5==='Nell Frost','dokunulmadı: doğru ad (L3), elle girilen (L4), o gün otelde olan başka odadaki misafir (L5: oda değişikliği olabilir) '+J(LG));

 // 04.11 cikis (gecmis gun)
 m=await H.ingest(p,await R.dep({day:P2,time:'23:10',rows:[{room:'0702',name:'Bright,Owen,Mr.',arr:'2026-11-02',dep:P2,time:'11:20'},{room:'0704',name:'Drury,Max,Mr.',arr:'2026-11-01',dep:P2,time:'09:40'}]},br),'DEP01100.pdf');
 S=await p.evaluate(()=>{const d=JSON.parse(__ev('BdiKV').get('bdi_dep_v1')).days;return {k:Object.keys(d),reg:(__ev('swRepAll()').dep||null)}});
 ok(/^geçmiş gün \(04\.11\)/.test(m)&&S.k.includes(P2)&&!S.reg,'04.11 çıkış: geçmiş gün, o güne saklandı, günün raporu sayılmadı ('+m+')');

 // 04.11 varis (gecmis gun): web notu
 m=await H.ingest(p,await R.arr({day:P2,time:'06:00',rows:[{room:'0711',name:'Gale,Iver,Mr.',arr:P2,dep:'2026-11-08',notes:['Likes a firm mattress topper']},{room:'0712',name:'Hale,Juno,Ms.',arr:P2,dep:'2026-11-07'}]},br),'ARR01102.pdf');
 S=await p.evaluate(d=>({ag:(__ev('allGuests')||[]).length,al:Object.keys(localStorage).filter(k=>/^alert_2026-11-0[34]$/.test(k)),reg:__ev('swRepAll()').arr||null,arrh:((JSON.parse(__ev('BdiKV').get('bdi_arrh_v1')||'{}').days||{})[d]||{rows:[]}).rows.length}),P2);
 ok(/^geçmiş gün varış raporu \(04\.11\.2026\): 2 misafir o güne yazıldı · 1 misafirin profil notu Atölye'ye geldi · .* · PY \/ Radar \/ Alert'e girmedi/.test(m),'04.11 varış: geçmiş gün: '+m);
 ok(S.ag===0&&!S.al.length&&!S.reg&&S.arrh===2,'eski ARR PY / Radar listesini doldurmadı (boş olsa bile), 03-04.11 Alert listesi açılmadı, günün raporları değişmedi; o günün varış özeti saklandı '+J(S));

 // 03.11 oda durumu (eski VAC)
 m=await H.ingest(p,await R.vac({day:P,time:'15:00',rows:PAST.map(r=>({room:r.room,name:r.name,fo:'OCC',hk:'PU',res:'Checked In',arr:r.arr,dep:r.dep}))},br),'HSK01124.pdf');
 S=await p.evaluate(()=>Object.keys(__ev('vacRooms')).sort().join(','));
 ok(/^Eski oda durumu raporu \(03\.11\.2026\)/.test(m)&&S==='1401,1402','03.11 oda durumu bugünün oda listesini ezmedi ('+m+')');

 // Radar kutusuna eski ARR: soruldu, "Tamam" (yalniz duzeltme) -> modul listesi bos kaldi
 const n0=dlg.length;await p.evaluate(()=>__ev('showPage("radar")'));
 await p.setInputFiles('#radarArrPdfInput',{name:'ARR01102.pdf',mimeType:'application/pdf',buffer:await R.arr({day:P2,time:'06:00',rows:[{room:'0711',name:'Gale,Iver,Mr.',arr:P2,dep:'2026-11-08'}]},br)});
 await p.waitForTimeout(2500);
 S=await p.evaluate(()=>(__ev('allGuests')||[]).length);
 ok(dlg.length===n0+1&&/geçmiş güne ait \(04\.11\.2026\)/.test(dlg[n0]||'')&&S===0,'Radar kutusuna eski ARR: soruldu, "yalnız düzeltme" seçilince modül listesi boş kaldı ('+(dlg[n0]||'').split('\n')[0]+')');

 // 03.11 Butler Didn't Do It: o gunun in-house listesinden
 await H.tab(p,'nt');await p.evaluate(d=>__ev('bdiNtDateSet')(d),P);await p.waitForTimeout(300);
 const NT=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel table.bd-nt-tab tbody tr')].map(tr=>(tr.querySelector('td.r')||{}).textContent).sort().join(','));
 ok(NT==='0705','03.11 Butler Didn\'t Do It: o günün in-house listesinden; dokunulmayan tek misafir 0705 (L5 kaydı 0705\'te ama Nell Frost adına) ('+NT+')');

 // Rapor Merkezi: gecmis gun raporlari ayri liste
 await p.evaluate(()=>__ev('swRepOpen()'));await p.waitForTimeout(300);
 const HS=await p.evaluate(()=>{const b=[...document.querySelectorAll('#swRepModal div')].find(d=>/^Geçmiş gün raporları/.test(d.textContent.trim()));document.getElementById('swRepModal').style.display='none';
   return b&&b.lastElementChild?[...b.lastElementChild.children].map(x=>x.textContent.replace(/\s+/g,' ').trim().slice(0,40)):null});
 ok(HS&&HS.length===5&&HS.some(x=>/^03\.11 · In-house/.test(x))&&HS.some(x=>/^04\.11 · Çıkış/.test(x))&&HS.some(x=>/^04\.11 · Varış/.test(x))&&HS.some(x=>/^03\.11 · Oda durumu|^03\.11 · VAC/.test(x)),'Rapor Merkezi: "Geçmiş gün raporları" listesi ayrı: '+J(HS));

 // ---- Geriye donuk touch (misafir profili): gecmis gunun odasi o gunun raporundan ----
 const gid=await p.evaluate(()=>{__ev('_bdiGMProf=null');return (__ev('bdiGMProfiles()').list.find(x=>/Clara Ashby/.test(x.name))||{}).gid});
 await p.evaluate(g=>{__ev('showPage("didit")');__ev('bdiGuestOpen')(g)},gid);await p.waitForTimeout(1500);
 await p.evaluate(([g,d])=>__ev('bdiRetroDay')(g,d),[gid,P]);await p.waitForTimeout(200);
 const rid=await p.evaluate(g=>__ev('bdiRetroId')(g),gid);
 const rr=await p.evaluate(r=>{const s=document.getElementById('bdiRtR_'+r);return s?[...s.options].map(o=>o.value).join(','):null},rid);
 ok(rr==='0701','03.11 seçilince oda o günün raporundan: 0701 ('+rr+')');
 await p.evaluate(r=>{const s=id=>document.getElementById(id+r);s('bdiRtB_').value='Can Demir';const A=s('bdiRtA_');A.value=[...A.options].find(o=>o.textContent==='Turndown').value;s('bdiRtT_').value='19:30'},rid);
 await p.evaluate(g=>__ev('bdiRetroAdd')(g),gid);await p.waitForTimeout(800);
 const RT=await p.evaluate(([d,r])=>{const l=__ev('loadBdiArrayForDate')(d).find(x=>x.action==='Turndown');const s=id=>(document.getElementById(id+r)||{});
   return {l:l&&[l.time,l.room,l.guest,!!(l.meta&&l.meta.retro)].join('|'),b:s('bdiRtB_').value,a:s('bdiRtA_').options&&s('bdiRtA_').options[s('bdiRtA_').selectedIndex].textContent,
     tl:/03\.11/.test((document.getElementById('bdiTab_guests')||{}).textContent)&&/Turndown/.test((document.getElementById('bdiTab_guests')||{}).textContent)}},[P,rid]);
 ok(RT.l==='19:30|0701|Clara Ashby|true','geriye dönük touch 03.11 kaydına o günün odasıyla yazıldı '+J(RT.l));
 ok(RT.tl,'profil yeniden açıldı, zaman çizelgesinde 03.11 Turndown görünüyor');
 ok(RT.b==='Can Demir'&&RT.a==='Turndown','arka arkaya giriş için butler ve işlem seçili kaldı '+J({b:RT.b,a:RT.a}));

 // ---- Atolye: gecmis gun notlari ----
 await H.tab(p,'atelier');await p.evaluate(()=>__ev('bdiAtSetMode')('in'));await p.waitForTimeout(800);
 const AT=await p.evaluate(()=>{const b=document.getElementById('bdiAtBody');return {src:[...b.querySelectorAll('p.bd-sub')].map(x=>x.textContent).find(t=>/^Kaynak:/.test(t))||'',
   g:[...b.querySelectorAll('.bd-at-g .bd-at-gh')].map(x=>x.textContent.replace(/\s+/g,' ').trim())}});
 ok(/geçmiş gün raporları \(04\.11 varış, 03\.11 in-house\)/.test(AT.src),'Atölye: kaynak satırında geçmiş günler ('+AT.src+')');
 ok(AT.g.some(x=>/0701 Clara Ashby/.test(x)&&/03\.11 in-house/.test(x))&&AT.g.some(x=>/0711 Iver Gale/.test(x)&&/04\.11 varış/.test(x)),'03.11 in-house ve 04.11 varış notları Atölye\'de, misafir başlığında "03.11 in-house" / "04.11 varış" etiketi '+J(AT.g));
 const C=await p.evaluate(()=>__ev('bdiAtCandidates()').filter(c=>/Ashby|Gale/.test(c.name)).map(c=>({id:c.id,gid:c.gid,n:c.name,st:c.st,day:c.day,src:c.src})));
 ok(C.length===2&&C.every(c=>c.st==='p'),'iki geçmiş gün notu bekliyor '+J(C));
 const ash=C.find(c=>/Ashby/.test(c.n))||{};
 await p.evaluate(id=>__ev('bdiAtDecide')([id],'a'),ash.id);await p.waitForTimeout(400);
 const DNA=await p.evaluate(async g=>{await __ev('bdiGMLoad')();const d=(__ev('_bdiGM').dna||{})[g]||{};return Object.values(d.items||{}).filter(x=>!x.del).map(x=>x.t)},ash.gid);
 ok(DNA.some(t=>/sparkling water/i.test(t)),'geçmiş gün notu onaylandı: misafirin hafızasına (DNA) girdi '+J(DNA));
 // bugunun in-house raporu degisse de gecmis gunun bekleyen notu Atolye'de
 m=await H.ingest(p,await R.gih({day:D,time:'07:30',rows:TODAY.concat([{room:'1403',name:'Nash,Ada,Ms.',arr:D,dep:'2026-11-09'}])},br),'GIH01102.pdf');
 const C2=await p.evaluate(()=>__ev('bdiAtCandidates()').filter(c=>/Gale/.test(c.name)&&c.st==='p').length);
 ok(C2===1,'bugünün in-house raporu değişse de geçmiş günün bekleyen notu Atölye\'de ('+m+')');
 // 30 gunden eski kaynak: karari verilmemis notu varsa silinmez
 await p.clock.setSystemTime(new Date('2026-12-10T09:00:00+03:00'));
 const PR=await p.evaluate(()=>{__ev('bdiAtSrcPrune')(__ev('bdiAtCandidates()'));return __ev('BdiKV').keys().filter(k=>/^bdi_atsrc_/.test(k)).sort()});
 ok(PR.includes('bdi_atsrc_arr_'+P2)&&!PR.includes('bdi_atsrc_gih_'+P),'not kaynakları güne göre saklandı; 30 günden eski ama kararı verilmemiş notu olan kaynak (04.11 varış) silinmedi, kararı verilen (03.11 in-house) silindi '+J(PR));
 await done();
})();
