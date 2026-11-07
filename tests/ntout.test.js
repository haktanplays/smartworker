// 2026-11-06: Butler Didn't Do It > isaretle + "Listeden cikar" (photoshooting / valued guest odalari), konaklama boyunca, geri al
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const DIR=process.argv[2]||'t2';
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000}});
 const p=await ctx.newPage();const errs=[],dlg=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dlg.push(d.message());d.accept()});
 await p.clock.install({time:new Date('2026-11-02T19:00:00+03:00')});await p.goto('file://'+__dirname+'/'+DIR+'/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-02');localStorage.setItem('sw_dayfix','2026-11-02');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak','Zafer Karagaçtı']));localStorage.setItem('bdi_me','Beyza Nur Çırak')});await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const R=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-02',at:Date.now(),file:'gih.pdf',rows:[
     R('0805','Hollinsby,Kirsten,Mrs.','2026-10-30','2026-11-05'),R('0901','Brodan,Kresimir,Mr.','2026-10-31','2026-11-06'),
     R('1808','De Gramont,Armand Beaumont,Mr.','2026-10-25','2026-11-08'),R('1501','Shooting,Photo','2026-11-01','2026-11-05'),R('1203','Guest,Valued,Mr.','2026-10-31','2026-11-07')]}));
   __ev('_bdiGih=null');
   const L=(id,room,guest,d,t)=>({id,butler:'Beyza Nur Çırak',room,guest,action:'Turndown',touchCategory:'Service',patternType:'service',note:'',time:t,sentence:'x',ts:new Date(d+'T'+t+':00+03:00').getTime(),countsAsTouch:true});
   KV.set('bdi_2026-11-02',JSON.stringify([L('a3','0805','Kirsten Hollinsby','2026-11-02','10:00')]));
   __ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-02';__ev('bdiFloorSetCount(2)');__ev('bdiFloorAssign(0,"Beyza Nur Çırak")');__ev('bdiFloorAssign(1,"Zafer Karagaçtı")');__ev('loadBdiLogs()');__ev('switchBdiTab("nt")')});
 await p.waitForTimeout(300);
 const S=()=>p.evaluate(()=>({rooms:[...document.querySelectorAll('#bdiNtPanel td.r')].map(x=>x.textContent).join(','),sum:(document.querySelector('#bdiNtPanel .bd-nt-sum .t')||{}).textContent||'',out:(document.querySelector('#bdiNtPanel .bd-nt-out')||{}).textContent||'',badge:document.getElementById('bdiNtTabCount').textContent}));
 let A=await S();
 ok(/1501/.test(A.rooms)&&/1203/.test(A.rooms)&&/^4 \/ 5/.test(A.sum),'başta: fotoğraf çekimi ve valued guest odaları listede ('+A.rooms+' · '+A.sum+')');
 // isaretle + Listeden cikar
 const gk=await p.evaluate(()=>({ph:__ev('bdiGuestKey')('Photo Shooting'),vg:__ev('bdiGuestKey')('Valued Guest')}));
 await p.check(`#bdiNtPanel input.bd-nt-chk[data-g="${gk.ph}"]`);await p.check(`#bdiNtPanel input.bd-nt-chk[data-g="${gk.vg}"]`);
 await p.click('#bdiNtPanel button:has-text("Listeden çıkar")');await p.waitForTimeout(300);
 A=await S();
 ok(!/1501|1203/.test(A.rooms)&&A.rooms==='1808,0901','işaretli iki oda listeden çıktı ('+A.rooms+')');
 ok(/^2 \/ 3/.test(A.sum)&&A.badge==='2','toplam ve rozet de düştü: '+A.sum+' · rozet '+A.badge);
 ok(/Listeden çıkarılanlar \(2\)/.test(A.out)&&/1501 Photo Shooting/.test(A.out)&&/1203 Valued Guest/.test(A.out)&&/geri al/.test(A.out),'altta "Listeden çıkarılanlar (2)" ve geri al: '+A.out.replace(/\s+/g,' '));
 // ertesi gun de yok (konaklama boyunca), rapor ve kapsama da
 const N=await p.evaluate(()=>{const L=__ev('bdiNtList')('2026-11-03');return {r:L.rows.map(g=>g.rooms[0]).join(','),t:L.total,cv:__ev('bdiNtConverted')('2026-11-03').map(g=>g.rooms[0]).join(',')}});
 ok(!/1501|1203/.test(N.r)&&N.t===3&&!/1501|1203/.test(N.cv),'ertesi gün de listede yok, "dokunuldu" diye de sayılmıyor ('+N.r+' / toplam '+N.t+')');
 const RP=await p.evaluate(()=>{const h=window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')});const d=new DOMParser().parseFromString(h,'text/html');return {items:[...d.querySelectorAll('.summary .item')].map(x=>x.textContent).join(' | '),body:d.body.textContent}});
 ok(/^2\/3Guests Not Touched/.test(RP.items)&&!/Photo Shooting|Valued Guest/.test(RP.body),'raporda yok, sayı 2/3: '+RP.items.split(' | ')[0]);
 const ST=await p.evaluate(()=>{const o=JSON.parse(__ev('BdiKV').get('bdi_nt_v1'))._out;return Object.values(o).map(x=>x.rooms.join('/')+':'+x.from+'..'+x.to+':'+x.by).sort().join(' ; ')});
 ok(ST==='1203:2026-10-31..2026-11-07:Beyza Nur Çırak ; 1501:2026-11-01..2026-11-05:Beyza Nur Çırak','saklanan: konaklama aralığı ve kim çıkardı ('+ST+'); öteki bilgisayarlara Didn\'t Do It verisiyle gider');
 // geri al
 await p.click(`#bdiNtPanel .bd-nt-out button[data-g="${gk.vg}"]`);await p.waitForTimeout(300);
 A=await S();ok(/1203/.test(A.rooms)&&!/1501/.test(A.rooms)&&/^3 \/ 4/.test(A.sum)&&/Listeden çıkarılanlar \(1\)/.test(A.out),'geri al: valued guest listeye döndü ('+A.rooms+' · '+A.sum+')');
 // hic isaretli yokken
 await p.evaluate(()=>__ev('bdiNtSel')('none'));await p.click('#bdiNtPanel button:has-text("Listeden çıkar")');await p.waitForTimeout(200);
 A=await S();ok(/1203/.test(A.rooms)&&dlg.length===0,'hiç işaretli yokken hiçbir şey silinmiyor, pencere açılmıyor');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
