// 2026-11-07: Butler Didn't Do It > butler filtresi (o gunun kat planina gore) ve siralama (gece sayisi / oda).
// Ekran, ozet, oda gorunumu, toplu secim ve sekmedeki Rapor ayni suzulmus listeyi kullanir; siralama hatirlanir.
const H=require('./h.js');
(async()=>{
 const {p,ok,done}=await H.open({today:'2026-11-02',time:'19:00',butlers:['Defne Aksoy','Kerem Tunalı'],me:'Defne Aksoy'});
 const R=(room,name,arr,dep)=>H.row(room,name,arr,dep);
 await H.seed(p,{gih:[R('0805','Lindqvist,Mira,Mrs.','2026-10-30','2026-11-05'),R('0901','Okonkwo,Tade,Mr.','2026-10-31','2026-11-06'),
   R('1808','Varga,Bence,Mr.','2026-10-25','2026-11-08'),R('1203','Sorensen,Ida,Ms.','2026-11-01','2026-11-07'),R('1501','Haddad,Rami,Mr.','2026-10-29','2026-11-09'),
   R('0702','Moreau,Lise,Mrs.','2026-11-02','2026-11-04')],
   logs:{'2026-11-02':[H.log('a1','2026-11-02','10:00','0805','Mira Lindqvist','Turndown',{butler:'Defne Aksoy'})]}});
 await p.evaluate(()=>{__ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-02';__ev('bdiFloorSetCount(2)');__ev('bdiFloorAssign(0,"Defne Aksoy")');__ev('bdiFloorAssign(1,"Kerem Tunalı")');__ev('switchBdiTab("nt")')});
 await p.waitForTimeout(300);
 const S=()=>p.evaluate(()=>({rooms:[...document.querySelectorAll('#bdiNtPanel td.r')].map(x=>x.textContent),sum:(document.querySelector('#bdiNtPanel .bd-nt-sum .t')||{}).textContent||'',
   grid:[...document.querySelectorAll('#bdiNtPanel .bd-rg-g [data-room], #bdiNtPanel .bd-rg-g .bd-rg-t')].map(x=>x.getAttribute('data-room')||x.textContent.slice(0,4)).join(','),empty:(document.querySelector('#bdiNtPanel .bd-empty')||{}).textContent||''}));
 const own=await p.evaluate(()=>{const o={};['0805','0901','1808','1203','1501','0702'].forEach(r=>o[r]=__ev('bdiFloorOwner')('2026-11-02',r)||'');return o});
 const K=Object.keys(own).filter(r=>own[r]==='Kerem Tunalı'&&r!=='0805'),D0=Object.keys(own).filter(r=>own[r]==='Defne Aksoy'&&r!=='0805');
 ok(K.length>0&&D0.length>0,'iki butlerın da katında dokunulmamış misafir var (Kerem: '+K.join(',')+' · Defne: '+D0.join(',')+')');
 let A=await S();
 ok(A.rooms.length===5&&/^5 \/ 6/.test(A.sum),'başta hepsi: '+A.rooms.join(',')+' · '+A.sum);
 const nightsOrder=await p.evaluate(()=>__ev('bdiNtList')('2026-11-02').rows.map(g=>g.rooms[0]).join(','));
 ok(A.rooms.join(',')===nightsOrder,'varsayılan sıra eskisi gibi: en uzun kalan önce ('+nightsOrder+')');
 // butler filtresi
 const opts=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel select[onchange^="bdiNtButlerSet"] option')].map(o=>o.textContent).join(','));
 ok(/^Hepsi,/.test(opts)&&/Defne Aksoy/.test(opts)&&/Kerem Tunalı/.test(opts),'Butler seçicisi: '+opts);
 await p.selectOption('#bdiNtPanel select[onchange^="bdiNtButlerSet"]','Kerem Tunalı');await p.waitForTimeout(250);
 A=await S();
 const kIn=Object.keys(own).filter(r=>own[r]==='Kerem Tunalı').length;
 ok(A.rooms.slice().sort().join(',')===K.slice().sort().join(','),'Kerem seçilince yalnız onun katları: '+A.rooms.join(','));
 ok(new RegExp('^'+K.length+' / '+kIn).test(A.sum),'özet de Kerem\'in katları: '+A.sum);
 const grid=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel .bd-rg-g > *')].map(x=>x.textContent.trim().slice(0,4)));
 ok(grid.length>0&&grid.every(r=>own[r]==='Kerem Tunalı'),'oda görünümü de yalnız Kerem\'in odaları: '+grid.join(','));
 // siralama: oda
 await p.click('#bdiNtPanel button[onclick*="bdiNtSortSet(\'room\')"]');await p.waitForTimeout(250);
 A=await S();const sorted=A.rooms.slice().sort((a,b)=>+a-+b);
 ok(A.rooms.join(',')===sorted.join(','),'Oda sırası: '+A.rooms.join(','));
 // toplu secim yalniz gorunenler
 if(process.env.SHOT){await p.evaluate(()=>{const g=document.querySelector('#bdiNtPanel details');if(g)g.open=true});await p.setViewportSize({width:1300,height:900});await (await p.$('#bdiNtPanel')).screenshot({path:process.env.SHOT})}
 await p.click('#bdiNtPanel button[onclick="bdiNtSel(\'all\')"]');await p.waitForTimeout(100);
 const sel=await p.evaluate(()=>document.querySelectorAll('#bdiNtPanel .bd-nt-chk:checked').length);
 ok(sel===K.length,'Tümünü seç yalnız görünen satırları seçiyor ('+sel+')');
 // rapor: sekmedeki Rapor ayni filtreyle
 const rep=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')}));
 const inRep=r=>rep.indexOf(r)>=0;
 ok(K.every(inRep)&&!D0.some(inRep)&&/Kerem Tunalı/.test(rep),'Rapor yalnız Kerem\'in misafirleri, başlıkta adı');
 // Hepsi'ne donus + siralama hatirlaniyor
 await p.selectOption('#bdiNtPanel select[onchange^="bdiNtButlerSet"]','');await p.waitForTimeout(200);
 A=await S();ok(A.rooms.length===5,'Hepsi\'ne dönünce 5 satır');
 const ls=await p.evaluate(()=>localStorage.getItem('bdi_nt_sort'));
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(()=>{try{__ev('closeSetupModal()')}catch(e){}__ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-02';__ev('switchBdiTab("nt")')});await p.waitForTimeout(300);
 A=await S();
 ok(ls==='room'&&A.rooms.join(',')===A.rooms.slice().sort((a,b)=>+a-+b).join(','),'oda sırası yenilemeden sonra da hatırlanıyor ('+ls+')');
 await done()})();
