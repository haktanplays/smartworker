const {chromium}=require('playwright');const fs=require('fs');let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const B64=fs.readFileSync(__dirname+'/nat/pdf/OSR_GuestProfileCheck.pdf').toString('base64');
const ing=(p,how)=>p.evaluate(async([b64,how])=>{const f=new File([Uint8Array.from(atob(b64),c=>c.charCodeAt(0))],'OSR_GuestProfileCheck.pdf');if(how==='rep')return (await __ev('swRepIngest')([f],'elle'))[0];await __ev('bdiNatImportFile')(f);return document.getElementById('bdiNatStatus').textContent},[B64,how]);
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000},deviceScaleFactor:2});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-29T10:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-29');localStorage.setItem('sw_dayfix','2026-11-29')});await p.reload();await p.waitForTimeout(1200);await p.evaluate(async()=>{await __ev('BdiKV').ready()});
 // 1) Rapor Merkezi kendi satirinda taniyor
 const r=await ing(p,'rep');console.log('  Rapor Merkezi: '+JSON.stringify(r));
 ok(r.type==='osr'&&r.ok,'Rapor Merkezi OSR\'yi ayrı rapor olarak tanıdı: '+r.msg);
 const st=await p.evaluate(()=>JSON.parse(__ev('BdiKV').get('bdi_osr_v1')));
 const names=st.rows.map(x=>x.name+'|'+x.c+'|'+x.arr+'|'+x.dep);console.log('  okunan: '+names.join(' ; '));
 ok(st.rows.length===9&&!names.some(n=>/^9001/.test(n)),'9 kişi okundu, 9001 (house use) atlandı');
 ok(names.some(n=>/^Whitcombe-Harrington, Alexander\|GB/.test(n)),'iki satıra bölünen isim birleşti (Whitcombe-Harrington, Alexander)');
 ok(st.rows.filter(x=>x.c==='AE').length===5,'"AE", "ARE" ve "UNITED ARAB EMIRATES" aynı uyruk (BAE) sayıldı');
 const raw=JSON.stringify(st);ok(!/@|\+971|\+44|\+90|532/.test(raw),'e-posta ve telefon saklanmadı (yalnız isim, uyruk, tarih)');
 const rep=await p.evaluate(()=>{__ev('swRepOpen()');return document.getElementById('swRepModal').innerText});await p.evaluate(()=>{document.getElementById('swRepModal').style.display='none'});
 ok(/Uyruk raporu \(OSR/.test(rep),'Rapor Merkezi tablosunda kendi satırı var: "Uyruk raporu (OSR · Guest Profile Check)"');
 // 2) 02.12 BAE Ulusal Gunu: bugun 29.11 -> 3 gun kala
 const ev=await p.evaluate(()=>__ev('bdiNatEvents')('2026-11-29','2026-12-05').map(e=>({d:e.d,n:e.name,inh:e.inh.map(r=>r.name),out:e.out.map(r=>r.name),days:e.days})));
 const uae=ev.find(e=>e.n==='BAE Ulusal Günü');console.log('  02.12: otelde '+JSON.stringify(uae.inh)+' · o sabah çıkan '+JSON.stringify(uae.out));
 ok(uae&&uae.inh.length===3&&uae.out.length===1&&uae.days===3,'02.12 BAE Ulusal Günü: 3 BAE misafiri o gece otelde, 1 kişi o sabah çıkıyor (03.12 gelen ve Katarlı sayılmadı)');
 const qa=ev.find(e=>e.n==='Katar Ulusal Günü');ok(!qa,'Katar Ulusal Günü (18.12) bu aralıkta değil');
 // 3) uyarilar: Brifing, Uyarilar, sekme sayaci
 await p.evaluate(()=>{__ev('showPage("didit")');(__ev('_bdiBriefMode="feed"'),__ev('switchBdiTab("brief")'))});await p.waitForTimeout(500);
 const bf=await p.evaluate(()=>document.getElementById('bdiBriefBody').innerText);ok(/Ulusal ve özel günler/.test(bf)&&/BAE Ulusal Günü/.test(bf)&&/3 gün sonra · 3 misafir otelde/.test(bf),'Brifing\'de 3 gün kala çıkıyor: "02.12 BAE Ulusal Günü · 3 gün sonra · 3 misafir otelde"');
 const w=await p.evaluate(()=>__ev('swWarnCollect')().filter(x=>x.g==='Özel günler').map(x=>x.t));console.log('  Uyarılar: '+JSON.stringify(w));
 ok(w.length===2&&w.some(x=>/^02\.12 BAE Ulusal Günü \(3 gün sonra\): 3 misafir/.test(x))&&w.some(x=>/^29\.11 Anneler Günü \(Rusya\) \(bugün\): 1 misafir/.test(x)),'Uyarılar: BAE Ulusal Günü + kasımın son pazarı Rusya Anneler Günü (kural "son.Paz.11")');
 ok(await p.evaluate(()=>document.getElementById('bdiNatTabCount').textContent)==='2','Uyruklar sekmesinde sayaç: 2');
 // 4) Uyruklar sekmesi
 await p.evaluate(()=>__ev('switchBdiTab("nat")'));await p.waitForTimeout(400);
 const nt=await p.evaluate(()=>document.getElementById('bdiTab_nat').innerText);
 ok(/Yaklaşan özel günler/.test(nt)&&/BAE Ulusal Günü/.test(nt)&&/3 kişi/.test(nt)&&/Uyruk dağılımı/.test(nt),'Uyruklar sekmesi: yaklaşan gün + uyruk dağılımı');
 await (await p.$('#bdiTab_nat')).screenshot({path:__dirname+'/ui/nat_tab.png'});
 // 5) 4 gun kala: listede var ama uyari yok
 await p.clock.setFixedTime(new Date('2026-11-28T10:00:00+03:00'));
 const w2=await p.evaluate(()=>{return {w:__ev('swWarnCollect')('2026-11-28','2026-11-28').filter(x=>x.g==='Özel günler'&&/BAE/.test(x.t)).length,ev:__ev('bdiNatEvents')('2026-11-28','2026-12-28').filter(e=>e.inh.length).map(e=>e.name+':'+e.days)}});
 console.log('  28.11: '+JSON.stringify(w2));ok(w2.w===0&&w2.ev.some(x=>/BAE Ulusal Günü:4/.test(x)),'4 gün kala uyarı yok, ama Uyruklar listesinde görünüyor');
 // 6) kendi yukleme alani (ayni dosya ikinci kez: cift sayim yok)
 await p.clock.setFixedTime(new Date('2026-11-29T10:00:00+03:00'));
 const s2=await ing(p,'own');const n2=await p.evaluate(()=>JSON.parse(__ev('BdiKV').get('bdi_osr_v1')).rows.length);
 ok(/9 kişi/.test(s2)&&n2===9,'Uyruklar sekmesindeki kendi alanından yükleme çalışıyor; aynı rapor ikinci kez gelince çift sayım yok ('+n2+')');
 // 7) Ayarlar: varsayilan liste + yeni gun
 const cfg=await p.evaluate(()=>{const L=__ev('bdiCfg')('bdi_natdays');return {n:L.length,uae:L.some(x=>x.d==='02.12'&&x.c==='AE'),rel:L.some(x=>/ramadan|ramazan|kurban|christmas|noel|easter|paskalya|diwali|hanukkah|eid/i.test(x.l))}});
 ok(cfg.n>=35&&cfg.uae&&!cfg.rel,'Ayarlar\'da '+cfg.n+' ulusal gün hazır; dini bayram yok (KVKK)');
 const cu=await p.evaluate(()=>{const L=__ev('bdiCfg')('bdi_natdays').slice();L.push({d:'2026-11-30',c:'RU',l:'Rus misafir günü (deneme)',g:''});__ev('bdiCfgSave')('bdi_natdays',L);return __ev('bdiNatEvents')('2026-11-29','2026-11-30').filter(e=>/deneme/.test(e.name)).map(e=>e.inh.length)[0]});
 ok(cu===1,'Ayarlar\'dan eklenen tek seferlik gün (yyyy-aa-gg) çalışıyor: 30.11 Rus misafir 1 kişi');
 await p.evaluate(()=>__ev('showPage("settings")'));await p.waitForTimeout(400);
 ok(await p.evaluate(()=>!!document.querySelector('#bdiCfg_natd .bdicfg-new, #bdiCfg_natd input')),'Ayarlar\'da düzenlenebilir liste var (Uyruklar: ulusal ve özel günler)');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs.slice(0,3)));await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
