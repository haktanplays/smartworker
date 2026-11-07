// 2026-11-06 QA kvkk-gate (K1 K2 K3 D1 D2 B6 D4 A1 A3): her serbest metin alaninda tek KVKK kontrolu (Turkce İ dahil), Protel hassasiyet satiri, devir notu kaydi
const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const DIR=process.argv[2]||'t2';
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
 const p=await ctx.newPage();const errs=[],dlg=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dlg.push(d.message());d.accept()});
 await p.clock.install({time:new Date('2026-11-06T14:00:00+03:00')});await p.goto('file://'+__dirname+'/'+DIR+'/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-06');localStorage.setItem('sw_dayfix','2026-11-06');localStorage.setItem('kw_butler',JSON.stringify(['Can Demir','Deniz Karavus']));localStorage.setItem('bdi_me','Deniz Karavus')});
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const R=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-06',at:Date.now(),file:'g.pdf',rows:[R('1203','Meyer,Anna,Mrs.','2026-11-02','2026-11-09'),R('1406','Sato,Kenji,Mr.','2026-11-03','2026-11-09'),R('2001','Mardanov,Ilyar,Mr.','2026-11-03','2026-11-09')]}));
   const L=(id,t,s,note,meta)=>({id,ts:Date.parse('2026-11-05T'+t+':00+03:00'),time:t,butler:'Can Demir',room:'2001',guest:'Ilyar Mardanov',action:'Guest Preference',touchCategory:'Preference',patternType:'preference',sentence:s,note:note,meta:meta,countsAsTouch:true});
   KV.set('bdi_2026-11-05',JSON.stringify([
     L('p1','12:05','x','Sensitivity: peanut allergy',{preferenceCategory:'Sensitivity',preferenceDetail:'peanut allergy'}),
     L('p2','12:40','x','Sensitivity: nuts',{preferenceCategory:'Sensitivity',preferenceDetail:'nuts'}),
     L('p3','13:00','x','Dietary: fasting',{preferenceCategory:'Dietary',preferenceDetail:'fasting'})]));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');await __ev('bdiGMIngest')()});

 // (1) K3 / D2 / B6: tek kontrol (İ dahil) ve maske tum kelimeyi orter
 const R1=await p.evaluate(()=>{const ok=__ev('bdiKvkkOk'),m=__ev('bdiTrcMask');
   return {bad:['DİYABET','HAMİLE','İLAÇ','İNANÇ','DİN','ILLNESS','fasting','Medical condition','medicine'].filter(w=>ok(w)),
     good:['Mr Churchill','Aladdin','İSTANBUL'].filter(w=>!ok(w)),m1:m('Medical condition, needs medication'),m2:m('Allergies to nuts'),m3:m('Guest likes Churchill')}});
 console.log('  '+JSON.stringify(R1));
 ok(R1.bad.length===0,'bdiKvkkOk: DİYABET, HAMİLE, İLAÇ, İNANÇ, DİN, ILLNESS, fasting, Medical, medicine yakalanıyor (kaçan: '+R1.bad.join(',')+')');
 ok(R1.good.length===0,'bdiKvkkOk: Mr Churchill, Aladdin, İSTANBUL geçiyor (yanlış yakalanan: '+R1.good.join(',')+')');
 ok(R1.m1==='[hassasiyet] condition, needs [hassasiyet]'&&R1.m2==='[hassasiyet] to nuts'&&R1.m3==='Guest likes Churchill','bdiTrcMask kelimenin tamamını örter: "'+R1.m1+'" / "'+R1.m2+'" / "'+R1.m3+'"');
 dlg.length=0;

 // (2) K1: Kayit giris kapisi
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("entry")')});await p.waitForTimeout(300);
 const nLog=()=>p.evaluate(()=>__ev('loadBdiArrayForDate')('2026-11-06').length);
 const act=await p.evaluate(()=>String(__ev('getBdiActions()').findIndex(a=>a.label==='Touch Call')));
 const n0=await nLog();
 await p.selectOption('#bdiButler','Can Demir');await p.fill('#bdiRoom','1203');await p.selectOption('#bdiAction',act);await p.fill('#bdiNote','Misafir hamile, ilaç saatleri önemli');
 await p.click('#bdiAddBtn');const er1=await p.evaluate(()=>document.getElementById('bdiNote').classList.contains('bd-err'));await p.waitForTimeout(300);
 const n1=await nLog();
 ok(n1===n0&&er1&&dlg.length===0,'Kayıt: "Misafir hamile, ilaç..." notu kaydedilmedi, alan kırmızı, pencere yok (log '+n0+'->'+n1+', bd-err '+er1+', dialog '+dlg.length+')');
 await p.fill('#bdiRoom','1203');await p.fill('#bdiNote','extra towels');await p.click('#bdiAddBtn');await p.waitForTimeout(300);
 const n2=await nLog();ok(n2===n1+1,'kontrol: "extra towels" kaydedildi ('+n1+'->'+n2+')');
 await p.selectOption('#bdiTouchType','preference');await p.waitForTimeout(100);
 await p.selectOption('#bdiButler','Can Demir');await p.fill('#bdiRoom','1203');await p.selectOption('#bdiPrefCategory','Sensitivity');await p.fill('#bdiPrefDetail','peanut allergy');
 await p.click('#bdiAddBtn');const er2=await p.evaluate(()=>document.getElementById('bdiPrefDetail').classList.contains('bd-err'));await p.waitForTimeout(300);
 const n3=await nLog();ok(n3===n2&&er2&&dlg.length===0,'Kayıt: Hassasiyet "peanut allergy" kaydedilmedi, alan kırmızı ('+n2+'->'+n3+', bd-err '+er2+')');

 // (3) K2: misafir notu, Didn't Do It notu ve toplu yazma
 await p.evaluate(()=>{__ev('_bdiGMProf=null');const g=__ev('bdiGMProfiles')().list.find(x=>/Meyer/.test(x.name||''));window.__gid=g.gid;__ev('bdiGuestOpen')(g.gid)});await p.waitForTimeout(400);
 const ph=await p.getAttribute('textarea[data-gnote]','placeholder');await p.fill('textarea[data-gnote]','misafir HAMİLE');await p.dispatchEvent('textarea[data-gnote]','change');await p.waitForTimeout(300);
 const gn=await p.evaluate(()=>(__ev('_bdiGM').notes[window.__gid]||{}).t||'');
 ok(!/HAMİLE/.test(gn)&&!/alerji/i.test(ph||''),'misafir kartı notu: "misafir HAMİLE" kaydedilmedi ("'+gn+'"); placeholder: "'+ph+'"');
 await p.evaluate(()=>{try{__ev('closeGuestModal()')}catch(e){}document.querySelectorAll('.bd-modal,.modal').forEach(m=>{try{m.remove()}catch(e){}});__ev('_bdiNtDate="2026-11-06"');__ev('switchBdiTab("nt")')});await p.waitForTimeout(400);
 const nt0=await p.evaluate(()=>__ev('BdiKV').get('bdi_nt_v1')||'');
 const hasIn=await p.evaluate(()=>!!document.querySelector('#bdiNtPanel input[data-f="n"]'));
 if(hasIn){await p.evaluate(()=>{const i=document.querySelector('#bdiNtPanel input[data-f="n"]');i.value='misafir hamile';i.dispatchEvent(new Event('change',{bubbles:true}))});await p.waitForTimeout(200)}
 const nt1=await p.evaluate(()=>__ev('BdiKV').get('bdi_nt_v1')||'');
 ok(hasIn&&!/hamile/.test(nt1)&&nt1===nt0,"Didn't Do It not kutusu: \"misafir hamile\" kaydedilmedi (kutu "+hasIn+")");
 const BK=await p.evaluate(()=>{const c=document.querySelector('#bdiNtPanel input.bd-nt-chk');if(!c)return 'satır yok';c.checked=true;const fs=document.getElementById('bdiNtBulkF');const f=__ev('bdiNtFields()').find(x=>x.t==='text');if(!fs||!f)return 'alan yok';fs.value=f.id;__ev('bdiNtBulkCtl()');const v=document.getElementById('bdiNtBulkVal');v.value='hamile';__ev('bdiNtBulkApply()');return 'ok'});
 const nt2=await p.evaluate(()=>__ev('BdiKV').get('bdi_nt_v1')||'');
 ok(BK==='ok'&&!/hamile/.test(nt2),"Didn't Do It toplu yazma: \"hamile\" kaydedilmedi ("+BK+")");

 // (4) D1 / D2 / D4: Protel notu
 const P4=await p.evaluate(()=>{__ev('_bdiGMProf=null');const P=__ev('bdiGMProfiles')().list.find(x=>/Mardanov/.test(x.name));const I=__ev('bdiProfileInsights')(P);
   return {pend:I.pending.map(i=>i.note).join(' | '),t:__ev('bdiProtelNotes')(P).map(n=>n.text).join('\n\n')}});
 console.log('  bekleyen: '+P4.pend);console.log(P4.t.split('\n').map(x=>'    '+x).join('\n'));
 ok(/peanut/.test(P4.pend)&&/fasting/.test(P4.pend),'Atölye: "peanut [hassasiyet]" ve "fasting" tercihleri onay bekliyor (Protel\'e kendiliğinden gitmiyor)');
 ok(!/\[hassasiyet\]/.test(P4.t)&&!/fasting/i.test(P4.t),'Protel notunda "[hassasiyet]" ve "fasting" yok');
 ok(/1- Guest is highly sensitive towards nuts\. \*\* /.test(P4.t)&&!/confirm with guest/i.test(P4.t),'WARNING satırı "1- Guest is highly sensitive towards nuts. ** ..." ("confirm with guest" yok)');

 // (5) A1: devir notu yazilan vardiyaya kaydedilir
 await p.evaluate(()=>{const KV=__ev('BdiKV');KV.set('bdi_handover_v1',JSON.stringify({'2026-11-06|sabah':{t:'SABAH NOTU',by:'Can Demir',u:Date.now()}}));document.getElementById('bdiDate').value='2026-11-06';
   __ev('switchBdiTab("brief")');__ev('bdiBriefSetMode("shift")')});await p.waitForTimeout(600);
 await p.evaluate(()=>__ev('bdiShiftSet')('gece'));await p.waitForTimeout(600);
 await p.fill('#bdiHandoverText','GECE NOTU');await p.evaluate(()=>__ev('bdiShiftSet')('sabah'));await p.waitForTimeout(1200);
 const H5=await p.evaluate(()=>JSON.parse(__ev('BdiKV').get('bdi_handover_v1')||'{}'));
 ok((H5['2026-11-06|sabah']||{}).t==='SABAH NOTU'&&(H5['2026-11-06|gece']||{}).t==='GECE NOTU','vardiya hemen değişse de: sabah "'+(H5['2026-11-06|sabah']||{}).t+'", gece "'+(H5['2026-11-06|gece']||{}).t+'"');

 // (6) A3: butler secilmemisse yazan bdi_me
 await p.waitForTimeout(300);await p.evaluate(()=>{document.getElementById('bdiButler').value=''});
 await p.fill('#bdiHandoverText','Oda 1203 geç çıkış istedi');await p.waitForTimeout(1100);
 const H6=await p.evaluate(()=>JSON.parse(__ev('BdiKV').get('bdi_handover_v1')||'{}')['2026-11-06|sabah']||{});
 ok(H6.t==='Oda 1203 geç çıkış istedi'&&H6.by==='Deniz Karavus','devir notu yazanı: "'+H6.by+'" (butler listesi boşken bdi_me)');

 // (7) K3 devir notu: HAMİLE
 await p.fill('#bdiHandoverText','HAMİLE var');await p.waitForTimeout(1100);
 const H7=await p.evaluate(()=>({t:(JSON.parse(__ev('BdiKV').get('bdi_handover_v1')||'{}')['2026-11-06|sabah']||{}).t,st:(document.getElementById('bdiHandoverSaved')||{}).textContent}));
 ok(H7.t!=='HAMİLE var'&&/kaydedilmedi/.test(H7.st||''),'devir notu "HAMİLE var" kaydedilmedi ("'+H7.st+'")');

 // (8) iPad rehberi: KVKK kontrolu İ'yi de yakalar, sayfa hatasiz acilir
 const data=await p.evaluate(()=>__ev('bgdBuild')('2026-11-06'));
 const html=await p.evaluate(d=>__ev('bgdHtml')(d),data);const gf=__dirname+'/guide_kvkk_'+DIR+'.html';fs.writeFileSync(gf,html);
 const ip=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:820,height:1180}});
 await ip.addInitScript(()=>{localStorage.setItem('bgd_me',JSON.stringify('Deniz Karavus'))});
 const gp=await ip.newPage();const gerr=[];gp.on('pageerror',e=>gerr.push(e.message));gp.on('dialog',d=>d.accept());
 await gp.clock.install({time:new Date('2026-11-06T15:00:00+03:00')});await gp.goto('file://'+gf);await gp.waitForTimeout(500);
 await gp.click('.chip[data-floor="all"]').catch(()=>{});await gp.waitForTimeout(80);
 const gid=await gp.evaluate(()=>{const g=window.__bg.guests().list.find(x=>x.room==='1406');return g&&g.id});
 if(gid&&!(await gp.$('#c_'+gid+' .gb')))await gp.click('#c_'+gid+' .gh');await gp.waitForTimeout(100);
 let warn='';
 if(gid){await gp.click('#c_'+gid+' button[data-act="note"]');await gp.waitForTimeout(150);await gp.fill('#nTxt','HAMİLE');await gp.waitForTimeout(100);
   warn=await gp.evaluate(()=>{const w=document.querySelector('#nWarn .warn');return w?w.textContent:''})}
 ok(!!gid&&/KVKK/.test(warn),'iPad not: "HAMİLE" yazınca KVKK uyarısı ("'+warn.slice(0,60)+'")');
 ok(gerr.length===0,'iPad rehberi hatasız açılıyor '+JSON.stringify(gerr));
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
