// QoL paketi 1 (2026-11-06): yazilan kaybolmasin, gece yarisi, alert yerine alan, Enter, ek, tepki, Uyarilar, Protel kanal, hitap, devir notu
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
 const p=await ctx.newPage();const errs=[],dlg=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dlg.push(d.message());d.accept()});
 await p.clock.install({time:new Date('2026-11-06T23:50:00+03:00')});await p.goto('file://'+__dirname+'/t2/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-06');localStorage.setItem('sw_dayfix','2026-11-06');localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus','Can Demir','Nazlı Erten','Onur Kaya']));localStorage.setItem('bdi_me','Deniz Karavus')});
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();const Rw=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-06',at:Date.now(),file:'g.pdf',rows:[Rw('1203','Morel,Claire,Ms.','2026-11-03','2026-11-09'),Rw('1406','Meyer,Anna,Mrs.','2026-11-02','2026-11-09'),Rw('2001','Mardanov,Ilyar,Mr.','2026-11-04','2026-11-09'),Rw('1802','Sato,Kenji,Mr.','2026-11-02','2026-11-09')]}));
   KV.set('bdi_floors_v1',JSON.stringify({'2026-11-06':{blocks:[{from:12,to:14,butler:'Can Demir'},{from:15,to:21,butler:'Nazlı Erten'}],u:Date.now()}}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()')});
 // 1) Turkce iyelik eki
 const PS=await p.evaluate(()=>['Can','Selin','Onur','Nazlı','Berna','Mert','Elif','Burak','Ümit','Gül'].map(n=>__ev('bdiTrPoss')(n)).join(', '));
 ok(PS==="Can'ın, Selin'in, Onur'un, Nazlı'nın, Berna'nın, Mert'in, Elif'in, Burak'ın, Ümit'in, Gül'ün",'iyelik eki doğru: '+PS);
 // 2) Kayit: alert yok, alan kirmizi; oda listesi butlerin katlariyla acilir; Enter kaydeder
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("entry")')});await p.waitForTimeout(300);
 const ti=await p.evaluate(()=>String(__ev('getBdiActions()').findIndex(a=>a.label==='Touch Call')));await p.selectOption('#bdiAction',ti);
 await p.fill('#bdiRoom','1203');await p.click('#bdiAddBtn');await p.waitForTimeout(200);
 const E1=await p.evaluate(()=>({err:document.getElementById('bdiButler').classList.contains('bd-err'),foc:document.activeElement&&document.activeElement.id}));
 ok(dlg.length===0&&E1.err&&E1.foc==='bdiButler','butler seçilmeden Kaydet: pencere yok; Butler alanı kırmızı ve imleç orada');
 await p.selectOption('#bdiButler','Can Demir');await p.waitForTimeout(200);
 const RP=await p.evaluate(()=>({open:document.getElementById('bdiBulkPanel').style.display==='block',chip:[...document.querySelectorAll('#bdiBulkPanel .bd-bulk-f .bd-chip.on')].map(b=>b.textContent).join(),rooms:[...document.querySelectorAll('#bdiBulkPanel .bd-bulk-r b')].map(b=>b.textContent).join()}));
 ok(RP.open&&RP.chip==="Can'ın katları"&&RP.rooms==='1203,1406','oda listesi Can\'ın katlarıyla açıldı ('+RP.chip+' · '+RP.rooms+')');
 await p.fill('#bdiRoom','1203');await p.press('#bdiRoom','Enter');await p.waitForTimeout(300);
 const E2=await p.evaluate(()=>{const b=document.getElementById('bdiReactBar');return {n:__ev('loadBdiArrayForDate')('2026-11-06').filter(l=>l.room==='1203'&&l.action==='Touch Call').length,bar:!!(b&&b.classList.contains('on'))}});
 ok(E2.n===1,'Oda kutusunda Enter: kaydedildi');
 ok(E2.bar,'Touch Call (misafirle yüz yüze) sonrası tepki soruluyor');
 await p.evaluate(()=>{try{__ev('bdiReactClose()')}catch(e){}});
 const tt=await p.evaluate(()=>String(__ev('getBdiActions()').findIndex(a=>a.label==='Turndown')));await p.selectOption('#bdiAction',tt);
 await p.fill('#bdiRoom','1406');await p.press('#bdiRoom','Enter');await p.waitForTimeout(300);
 const E3=await p.evaluate(()=>{const b=document.getElementById('bdiReactBar');return {n:__ev('loadBdiArrayForDate')('2026-11-06').filter(l=>l.room==='1406'&&l.action==='Turndown').length,bar:!!(b&&b.classList.contains('on'))}});
 ok(E3.n===1&&!E3.bar,'Turndown (misafir genelde odada yok) sonrası tepki sorulmuyor');
 // 3) Didn't Do It: not yazarken kaybolmuyor
 await p.evaluate(()=>{__ev('switchBdiTab("nt")')});await p.waitForTimeout(400);
 const ins=await p.$$('#bdiNtPanel table input[placeholder="kısa not"]');
 if(ins.length>=2){await ins[0].fill('Not bir');await ins[0].dispatchEvent('change');await ins[1].click();await p.keyboard.type('XYZ');await p.waitForTimeout(100);
   const NT=await p.evaluate(()=>{const L=[...document.querySelectorAll('#bdiNtPanel table input[placeholder="kısa not"]')];return {v0:L[0].value,v1:L[1].value,foc:document.activeElement===L[1]}});
   ok(NT.v0==='Not bir'&&NT.v1==='XYZ'&&NT.foc,'Didn\'t Do It: 1. satıra not yazıp 2. satıra geçince yazılan kaybolmadı, imleç yerinde')}
 else ok(false,'Didn\'t Do It not kutusu bulunamadı ('+ins.length+')');
 // 4) Uyarilar: Ozel gunler grubu
 const W=await p.evaluate(()=>__ev('swWarnHtml')([{g:'Özel günler',lvl:'mid',t:'08.11 Örnek gün: 3 misafir',go:''}],'Uyarılar','').replace(/<[^>]+>/g,' '));
 ok(/Özel günler/.test(W)&&/Örnek gün/.test(W),'Uyarılar penceresi "Özel günler" maddesini de gösteriyor');
 // 5) Protel: Turkce kanal adi Ingilizceye
 const PR=await p.evaluate(async()=>{await __ev('bdiGMIngest')();__ev('_bdiGMProf=null');const P=__ev('bdiGMProfiles')();let g=P.list[0];if(!g)return 'profil yok';await __ev('bdiDnaPut')(g.gid,d=>{d.addr={channel:'E-posta',u:Date.now()}});__ev('_bdiGMProf=null');g=__ev('bdiGMProfiles')().byGid[g.gid];return JSON.stringify(__ev('bdiProtelNotes')(g))});
 ok(/communication via e-mail/.test(PR)&&!/E-posta/.test(PR),'Protel notu: "Guest prefers communication via e-mail" (Türkçe kanal adı gitmiyor)'+(/profil yok/.test(PR)?' [profil yok]':''));
 // 6) Devir notu yazdikca kaydedilir, ekran yenilense de durur
 await p.evaluate(()=>{__ev('switchBdiTab("brief")');__ev('bdiBriefSetMode("shift")')});await p.waitForTimeout(700);
 const ta=await p.$('#bdiHandoverText');
 if(ta){await ta.fill('1609 Volkov: sabah oda sıcaklığını kontrol et');await p.waitForTimeout(900);await p.evaluate(()=>__ev('renderBdiBriefTab()'));await p.waitForTimeout(700);
   const HV=await p.evaluate(()=>({v:(document.getElementById('bdiHandoverText')||{}).value,btn:!![...document.querySelectorAll('button')].find(b=>/Notu kaydet/.test(b.textContent))}));
   ok(/Volkov/.test(HV.v||'')&&!HV.btn,'devir notu yazdıkça kaydedildi; ekran yenilenince duruyor; "Notu kaydet" düğmesi yok')}
 else ok(false,'devir notu kutusu yok');
 // 7) gece yarisi: Didn't Do It yeni gune gecer
 await p.evaluate(()=>{__ev('_bdiNtDate="2026-11-06"')});await p.clock.fastForward('00:15:00');await p.evaluate(()=>__ev('swDayCheck()'));await p.waitForTimeout(200);
 const ND=await p.evaluate(()=>__ev('_bdiNtDate'));ok(ND==='2026-11-07','gece yarısı: Didn\'t Do It tarihi 07.11\'e geçti ('+ND+')');
 ok(dlg.length===0,'hiç uyarı penceresi açılmadı '+JSON.stringify(dlg));
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
