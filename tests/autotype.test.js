const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1320,height:1000}});const errs=[],msgs=[];
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{msgs.push(d.message());d.accept()});
 await p.clock.install({time:new Date('2026-10-31T16:00:00+03:00')});
 await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-10-31');localStorage.setItem('kw_butler',JSON.stringify(['Mert Mumcu','Beyza Nur Çırak','Zafer Karagaçtı']))});
 await p.reload();await p.waitForTimeout(800);
 await p.evaluate(()=>{const L=__ev('getKW("bdiaction")');L.push('Preference Collection|collected preferences of','Room Decoration|decorated the room for the special occasion for','Welcome|met & greeted');__ev('setKW')('bdiaction',L)});
 await p.reload();await p.waitForTimeout(1200);await p.evaluate(async()=>{await __ev('BdiKV').ready();__ev('showPage("didit")');document.getElementById('bdiDate').value='2026-10-31';__ev('switchBdiTab("entry")');__ev('loadBdiLogs()')});
 const idx=l=>p.evaluate(l=>String(__ev('getBdiActions()').findIndex(a=>a.label===l)),l);
 const vis=id=>p.evaluate(id=>{const e=document.getElementById(id);return !!(e&&e.offsetParent)},id);
 ok(await vis('bdiTouchType'),'"Touch tipi" listesi gorunuyor (islem secilince kendiliginden ayarlanir)');
 const opts=await p.evaluate(()=>[...document.getElementById('bdiAction').options].map(o=>o.text));
 ok(!opts.includes('Guest Issue / Recovery')&&!opts.includes('Room Move')&&opts.includes('Preference Collection'),'(2026-11-02) Islem listesi: tum isler, Guest Issue / Recovery ve Room Move yok (Issues sekmesi)');
 const last=()=>p.evaluate(()=>{const a=JSON.parse(__ev('BdiKV').get('bdi_2026-10-31')||'[]');const l=a[a.length-1]||{};return {t:l.patternType,c:l.touchCategory,a:l.action,s:l.sentence,n:a.length,m:l.meta||{}}});
 const fill=async(room)=>{await p.selectOption('#bdiButler','Beyza Nur Çırak');await p.fill('#bdiRoom',room)};
 // 1) Preference Collection + detay -> tercih
 await fill('1903');await p.selectOption('#bdiAction',await idx('Preference Collection'));
 ok(await vis('bdiPreferenceFields')&&!(await vis('bdiNote'))&&await vis('bdiAction'),'Preference Collection secince tercih alanlari acildi (Detay gizli, islem listesi yerinde)');
 await p.fill('#bdiPrefDetail','extra still water daily');await p.click('#bdiAddBtn');await p.waitForTimeout(200);
 let L=await last();ok(L.t==='preference'&&L.c==='Preference'&&L.a==='Preference Collection'&&L.m.preferenceDetail==='extra still water daily','kayit: tercih (Preference) olarak, islem adi "Preference Collection" kaldi');
 // 2) Preference Collection detaysiz -> normal touch
 await fill('1905');await p.selectOption('#bdiAction',await idx('Preference Collection'));await p.click('#bdiAddBtn');await p.waitForTimeout(200);
 L=await last();ok(L.t==='service'&&L.c==='Service'&&L.a==='Preference Collection'&&!msgs.some(m=>/Preference detail/.test(m)),'detay bos: uyari yok, normal touch olarak kaydedildi');
 // 3) Room Decoration + hazirlik -> ozel gun
 await fill('1201');await p.selectOption('#bdiAction',await idx('Room Decoration'));
 ok(await vis('bdiOccasionFields'),'Room Decoration -> kutlama alanlari');
 await p.fill('#bdiArrangement','balloons and a personalized card');await p.click('#bdiAddBtn');await p.waitForTimeout(200);
 L=await last();ok(L.t==='occasion'&&L.c==='Special Occasion'&&L.a==='Room Decoration','kayit: Special Occasion kategorisi, islem "Room Decoration"');
 // 4) duz touch
 await fill('1202');await p.selectOption('#bdiAction',await idx('Turndown'));
 ok(!(await vis('bdiPreferenceFields'))&&!(await vis('bdiOccasionFields'))&&await vis('bdiNote'),'Turndown: ek alan yok, Detay acik');
 await p.click('#bdiAddBtn');await p.waitForTimeout(200);L=await last();ok(L.t==='service'&&L.a==='Turndown','kayit: touch');
 // 5-6) (2026-11-02) Guest Issue / Recovery ve Room Move BDI'dan kalkti: "Bu oda icin issue ac" Issues formuna goturur
 await fill('1203');await p.click('.bd-isslink .bd-link');await p.waitForTimeout(150);
 ok(await p.evaluate(()=>document.getElementById('bdiTab_issues').style.display==='block'&&document.getElementById('bdiIsNewRoom').value==='1203'),'Issue / recovery / oda degisikligi: Issues sekmesine oda dolu gidildi');
 await p.evaluate(()=>__ev('switchBdiTab("entry")'));
 // 7) hizli giris (power) ve hizli secim calismaya devam
 await p.fill('#bdiPowerLine','zafer 1206 turndown');await p.press('#bdiPowerLine','Enter');await p.waitForTimeout(200);
 L=await last();ok(L.t==='service'&&L.a==='Turndown'&&L.n===5,'hizli giris satiri: touch kaydedildi');
 // ===== RAPOR: misafir basligi =====
 await p.evaluate(()=>{const KV=__ev('BdiKV');const L=(id,b,r,g,a,t)=>({id,butler:b,room:r,guest:g,action:a,touchCategory:'Service',patternType:'service',note:'',time:t,sentence:'Butler '+b+' '+a+' for '+(g||'our guest')+' staying at Room '+r+'.',ts:new Date('2026-10-30T'+t+':00+03:00').getTime(),countsAsTouch:true,_date:'2026-10-30'});
   KV.set('bdi_2026-10-30',JSON.stringify([L('f1','Mert Mumcu','1912','Fuad Demirtas','Sleep Ritual','21:00'),L('x1','Beyza Nur Çırak','1205','Maria Lopez','Turndown','20:00'),L('f2','Zafer Karagaçtı','1603','Fuad Demirtas','Shoeshine','09:00'),L('y1','Mert Mumcu','0803','Serdar Calgan','Welcome','15:00'),L('n1','Mert Mumcu','0703','','Turndown','20:30')]))});
 await p.evaluate(()=>{document.getElementById('bdiDate').value='2026-10-30';__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()')});
 const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidIt()')}));
 const R=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html'),t=d.querySelector('table.gtab');return {th:[...t.querySelectorAll(':scope>thead th')].map(x=>x.textContent).join('|'),rows:[...t.querySelectorAll(':scope>tbody>tr')].map(r=>r.classList.contains('gh')?'## '+[...r.querySelectorAll('.nm,.rc i,.ct')].map(x=>x.textContent).join(' '):'  '+[...r.children].map(c=>c.textContent).slice(0,3).join(' | '))}},html);
 console.log(R.th+'\n'+R.rows.join('\n'));
 ok(R.th==='Butler|Room|Action|Details','tabloda Guest sutunu yok (isim baslikta)');
 const heads=R.rows.filter(r=>r.startsWith('## '));
 ok(heads.length===4&&/^## Guest name not recorded 0703 1 touch$/.test(heads[0])&&/^## Serdar Calgan 0803/.test(heads[1])&&/^## Maria Lopez 1205/.test(heads[2])&&/^## Fuad Demirtas 1603 1912 2 touches$/.test(heads[3]),'gruplar oda sirasiyla; Fuad tek baslik altinda "Room 1603 · 1912 · 2 touches"');
 const fi=R.rows.findIndex(r=>/Fuad/.test(r));ok(/1603/.test(R.rows[fi+1])&&/1912/.test(R.rows[fi+2]),'Fuad\'in iki odasi alt alta (1603, sonra 1912)');
 const X=await p.evaluate(()=>{let wb=null;const o=XLSX.writeFile;XLSX.writeFile=w=>{wb=w};try{__ev('downloadDidItXlsx()')}finally{XLSX.writeFile=o}return XLSX.utils.sheet_to_json(wb.Sheets['Butler Did It']).map(r=>r.Room+' '+r.Guest)});
 ok(X.join(',')==='0703 ,0803 Serdar Calgan,1205 Maria Lopez,1603 Fuad Demirtas,1912 Fuad Demirtas','Excel de ayni sira (Fuad satirlari yan yana): '+X.join(', '));
 ok(errs.length===0,'JS hatasi yok '+JSON.stringify(errs));
 fs.writeFileSync(__dirname+'/did/gtab.html',html);const v=await ctx.newPage();await v.goto('file://'+__dirname+'/did/gtab.html');await (await v.$('table.gtab')).screenshot({path:__dirname+'/did/gtab.png'});
 await p.evaluate(()=>{__ev('switchBdiTab("entry")');document.getElementById('bdiDate').value='2026-10-31'});await p.selectOption('#bdiAction',await idx('Preference Collection'));await p.evaluate(()=>window.scrollTo(0,0));
 await (await p.$('#bdiTab_entry .bd-panel')).screenshot({path:__dirname+'/did/form_pref.png'});
 await b.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
