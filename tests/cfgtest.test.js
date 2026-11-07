const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1320,height:1000},deviceScaleFactor:2});const errs=[];
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-02T19:00:00+03:00')});
 await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-02');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak','Zafer Karagaçtı']))});
 await p.reload();await p.waitForTimeout(1200);await p.evaluate(async()=>{await __ev('BdiKV').ready()});
 // ---- 1) Ayarlar: tercih alani ----
 await p.evaluate(()=>{__ev('showPage("settings")');document.querySelectorAll('.settings-body').forEach(x=>x.style.display='block')});await p.waitForTimeout(150);
 const S0=await p.evaluate(()=>{const e=document.getElementById('bdiCfg_pref');const rows=[...e.querySelectorAll('.bdicfg-r:not(.bdicfg-new)')];const sens=rows.find(r=>/Sensitivity/.test(r.textContent));
   return {n:rows.length,sensFixed:!!sens&&!sens.querySelector('input[data-f="l"]')&&!/Sil/.test(sens.textContent)&&/WARNING \(Protel\)/.test(sens.textContent),occ:document.querySelectorAll('#bdiCfg_occ .bdicfg-r:not(.bdicfg-new)').length,tim:document.querySelectorAll('#bdiCfg_occt .bdicfg-r:not(.bdicfg-new)').length,nt:document.querySelectorAll('#bdiCfg_nt .bdicfg-r:not(.bdicfg-new)').length}});
 ok(S0.n===10&&S0.sensFixed&&S0.occ===8&&S0.tim===4&&S0.nt===6,'Ayarlar: 10 tercih kategorisi (Sensitivity sabit, WARNING), 8 kutlama, 4 zamanlama, 6 dokunulamama sebebi '+JSON.stringify(S0));
 // 2026-11-03: yeni satir alttaki "Ekle" satirindan
 await p.fill('#bdiCfg_pref .bdicfg-new input[data-new="l"]','Fragrance');await p.selectOption('#bdiCfg_pref .bdicfg-new select[data-new="d"]','HSK');
 await p.fill('#bdiCfg_pref .bdicfg-new input[data-new="ex"]','lavender pillow mist at turndown');await p.click('#bdiCfg_pref .bdicfg-new button');await p.waitForTimeout(80);
 // Other'i sil
 await p.evaluate(()=>{const r=[...document.querySelectorAll('#bdiCfg_pref .bdicfg-r')].find(x=>x.querySelector('input[data-f="l"]')&&x.querySelector('input[data-f="l"]').value==='Other');[...r.querySelectorAll('button')].find(x=>x.textContent==='Sil').click()});
 // kutlama + zamanlama
 await p.fill('#bdiCfg_occ .bdicfg-new input[data-new="l"]','Proposal');await p.fill('#bdiCfg_occ .bdicfg-new input[data-new="ex"]','rose petals and candles on the terrace');await p.click('#bdiCfg_occ .bdicfg-new button');await p.waitForTimeout(80);
 await p.fill('#bdiCfg_occt .bdicfg-new input[data-new="l"]','during turndown');await p.click('#bdiCfg_occt .bdicfg-new button');await p.waitForTimeout(80);
 // sebep ekle
 await p.fill('#bdiCfg_nt .bdicfg-new input[data-new="l"]','Sleeping');await p.fill('#bdiCfg_nt .bdicfg-new input[data-new="ex"]','Misafir uyuyordu, rahatsız edilmedi.');await p.click('#bdiCfg_nt .bdicfg-new button');await p.waitForTimeout(80);
 await (await p.$('#bdiCfg_pref')).screenshot({path:__dirname+'/did/cfg_pref.png'});
 // ---- 2) Kayit formu ayardan dolar ----
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("entry")');document.getElementById('bdiDate').value='2026-11-02';__ev('initDidIt()')});await p.waitForTimeout(150);
 const F=await p.evaluate(()=>{const o=id=>[...document.getElementById(id).options].map(x=>x.value+'='+x.textContent);
   const tt=document.getElementById('bdiTouchType');tt.value='preference';__ev('toggleBdiPattern()');document.getElementById('bdiPrefCategory').value='Fragrance';__ev('bdiPrefHint()');
   return {pref:o('bdiPrefCategory'),ph:document.getElementById('bdiPrefDetail').placeholder,occ:o('bdiOccasionType'),tim:o('bdiOccasionTiming'),tt:o('bdiTouchType'),act:o('bdiAction')}});
 ok(F.pref.includes('Fragrance=Fragrance')&&!F.pref.some(x=>/^Other=/.test(x))&&F.pref.includes('Sensitivity=Hassasiyet (kaçınılacak)')&&F.ph==='Guest prefers … (örn. lavender pillow mist at turndown)','tercih kategorisi listesi ayardan (Fragrance eklendi, Other silindi), ornek kutuda: '+F.ph);
 ok(F.occ.includes('Proposal=Proposal')&&F.tim.includes('during turndown=During turndown'),'kutlama ve zamanlama listeleri ayardan');
 ok(!F.tt.some(x=>/^issue=/.test(x))&&!F.act.some(x=>/^__issue|^__move/.test(x))&&F.act.some(x=>x==='custom=Diğer (serbest)'),'Guest Issue / Recovery / Room Move kayit ekranindan kalkti');
 // ozel gun cumlesi
 await p.selectOption('#bdiButler','Beyza Nur Çırak');await p.fill('#bdiRoom','1203');
 const sen=await p.evaluate(()=>{const tt=document.getElementById('bdiTouchType');tt.value='occasion';__ev('toggleBdiPattern()');const t=document.getElementById('bdiOccasionType');t.value='Proposal';__ev('bdiOccHint()');
   const ph=document.getElementById('bdiArrangement').placeholder;document.getElementById('bdiArrangement').value='rose petals and candles';document.getElementById('bdiOccasionTiming').value='during turndown';
   const e=__ev('buildBdiTouchEntry(false)');return {ph,s:e.sentence,m:e.meta}});
 ok(sen.ph==='rose petals and candles on the terrace'&&/prepared a proposal arrangement .* The setup included rose petals and candles, placed during turndown\./.test(sen.s)&&sen.m.occasionType==='Proposal','ozel gun: tur ornegi kutuda, cumlede yeni zamanlama: '+sen.s);
 // tercih -> departman (icgoru)
 const dep=await p.evaluate(()=>[__ev('bdiPrefDept')('Fragrance'),__ev('bdiPrefDept')('Water'),__ev('bdiPrefDept')('Sensitivity'),__ev('bdiPrefDept')('Unknown')].join(','));
 ok(dep==='HSK,F&B,SENSITIVITY,BUT','tercih departmani ayardan (Fragrance HSK), bilinmeyen Butler: '+dep);
 // ---- 3) Issues'a yonlendirme ----
 await p.evaluate(()=>{document.getElementById('bdiTouchType').value='service';__ev('toggleBdiPattern()')});
 const isl=await p.evaluate(()=>{const e=document.querySelector('.bd-isslink');return e?e.textContent:''});
 await p.fill('#bdiRoom','1506');await p.selectOption('#bdiButler','Zafer Karagaçtı');await p.click('.bd-isslink .bd-link');await p.waitForTimeout(150);
 const G=await p.evaluate(()=>({tab:document.getElementById('bdiTab_issues').style.display,form:document.getElementById('bdiIssueNew').style.display,room:document.getElementById('bdiIsNewRoom').value,by:document.getElementById('bdiIsNewBy').value,focus:document.activeElement&&document.activeElement.id}));
 ok(/Issues'a girilir/.test(isl)&&G.tab==='block'&&G.form==='block'&&G.room==='1506'&&G.by==='Zafer Karagaçtı'&&G.focus==='bdiIsNewConcern','"Bu oda için issue aç": Issues sekmesi, oda + butler dolu, imlec sorunda '+JSON.stringify(G));
 // ---- 4) islem -> touch tipi: Recovery secenegi yok, eski "issue" eslemesi Butler Did It ----
 await p.evaluate(()=>{localStorage.setItem('bdi_action_cat',JSON.stringify({'Turndown':'issue'}))});
 const C=await p.evaluate(()=>{__ev('showPage("settings")');const sel=document.querySelector('#bdiamList select.bdiam-cat');return {opts:[...sel.options].map(o=>o.textContent).join(','),t:__ev('bdiActionCatOf')('Turndown'),r:__ev('bdiActionCatOf')('Guest Recovery Amenity'),heads:[...document.querySelectorAll('#bdiamList > div')].filter(d=>/işlem$/.test(d.textContent.trim())).map(d=>d.textContent.replace(/\s*\d+ işlem$/,'')).join(',')}});
 ok(C.opts==='Butler Did It,Guest Preference,Special Occasion'&&C.t==='service'&&C.r==='service'&&C.heads==='Butler Did It,Guest Preference,Special Occasion','ayarlarda 3 touch tipi; eski Recovery eslemesi Butler Did It: '+JSON.stringify(C));
 // ---- 5) gizli hata: ayarlar yenilemede kaybolmuyor ----
 await p.evaluate(()=>{__ev('bdiActionCatSet')('Turndown','preference')});
 await p.reload();await p.waitForTimeout(1200);
 const K=await p.evaluate(async()=>{await __ev('BdiKV').ready();return {ls:localStorage.getItem('bdi_action_cat'),cat:__ev('bdiActionCatOf')('Turndown'),pref:JSON.parse(localStorage.getItem('bdi_pref_cats')||'[]').map(x=>x.l).join(','),nt:__ev('bdiCfg')('bdi_nt_reasons').map(x=>x.l).join(',')}});
 ok(K.ls&&K.cat==='preference'&&/Fragrance/.test(K.pref)&&/Sleeping/.test(K.nt),'yenilemeden sonra ayarlar yerinde (IndexedDB\'ye tasinmadi): Turndown -> '+K.cat);
 // eskiden IndexedDB'ye tasinmis ayar geri gelir
 await p.evaluate(async()=>{await new Promise((res,rej)=>{const r=indexedDB.open('SmartWorkerBDI',1);r.onsuccess=()=>{const tx=r.result.transaction('kv','readwrite');tx.objectStore('kv').put(JSON.stringify({'Welcome / In-room Check-in':'occasion'}),'bdi_action_cat');tx.oncomplete=()=>{r.result.close();res()};tx.onerror=rej};r.onerror=rej});localStorage.removeItem('bdi_action_cat')});
 await p.reload();await p.waitForTimeout(1200);
 const K2=await p.evaluate(async()=>{await __ev('BdiKV').ready();return {ls:localStorage.getItem('bdi_action_cat'),cat:__ev('bdiActionCatOf')('Welcome / In-room Check-in')}});
 ok(K2.cat==='occasion'&&/occasion/.test(K2.ls||''),'onceki surumde IndexedDB\'ye kacan ayar acilista localStorage\'a geri kondu');
 // ayar senkronunda yeni anahtarlar
 const SK=await p.evaluate(()=>['bdi_pref_cats','bdi_occ_types','bdi_occ_timing','bdi_nt_reasons','bdi_action_cat'].every(k=>__ev('SETTINGS_SYNC_KEYS').includes(k)));
 ok(SK,'yeni ayarlar ayar senkronu listesinde (butun bilgisayarlarda ayni)');
 ok(errs.length===0,'JS hatasi yok '+JSON.stringify(errs));
 await p.evaluate(()=>{__ev('showPage("settings")');document.querySelectorAll('.settings-body').forEach(x=>x.style.display='block')});await p.waitForTimeout(150);
 await (await p.$('#bdiCfg_nt')).screenshot({path:__dirname+'/did/cfg_nt.png'});
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("entry")');const tt=document.getElementById('bdiTouchType');tt.value='preference';__ev('toggleBdiPattern()')});await p.waitForTimeout(100);
 await (await p.$('#bdiTab_entry .bd-panel')).screenshot({path:__dirname+'/did/cfg_entry.png'});
 await b.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
