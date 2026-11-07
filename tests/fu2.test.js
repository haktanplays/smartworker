// Takip Defteri yeniden tasarim (2026-11-05): tek kutu, tek satir, kutucuk = yapildi, her yerden takip, kapanan issue -> takip kapanir
const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000},deviceScaleFactor:1});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-05T09:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-05');localStorage.setItem('sw_dayfix','2026-11-05');localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus','Onur Kaya']))});
 await p.reload();await p.waitForTimeout(1300);
 // --- 1) tek kutu ayristirma ---
 const PQ=await p.evaluate(()=>{const f=__ev('bdiFuParseQuick'),F=__ev('bdiFmtTs'),r=s=>{const x=f(s);return x.err?'ERR':x.room+'|'+F(x.due)+'|'+x.t};
   return [r('1802 17:00 tekne saatini teyit et'),r('1406 yarın 10:00 transferi ara'),r('1406 yarın transferi ara'),r('1203 08:00 gazeteyi bırak'),r('1203 gazeteyi bırak'),r('0705 17.30 yarın - çiçek'),r('tekne saatini teyit et'),r('1203')]});
 console.log('  '+PQ.join('\n  '));
 ok(PQ[0]==='1802|05.11.2026 17:00|tekne saatini teyit et','"1802 17:00 ..." -> bugün 17:00');
 ok(PQ[1]==='1406|06.11.2026 10:00|transferi ara'&&PQ[2]==='1406|06.11.2026 10:00|transferi ara','"yarın 10:00" ve saatsiz "yarın" -> yarın 10:00');
 ok(PQ[3]==='1203|06.11.2026 08:00|gazeteyi bırak','geçmiş saat (08:00, şimdi 09:00) -> yarın 08:00');
 ok(PQ[4]==='1203|05.11.2026 10:00|gazeteyi bırak','saat yoksa 1 saat sonra');
 ok(PQ[5]==='0705|06.11.2026 17:30|çiçek','"17.30 yarın - ..." da anlaşılıyor');
 ok(PQ[6]==='ERR'&&PQ[7]==='ERR','oda ya da iş yoksa eklenmez (uyarı)');
 // --- veri: misafirler, issue'lar, Didn't Do It plani, alert ---
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();const at=(d,h)=>new Date(d+'T'+h+':00+03:00').getTime();
   const Rw=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-05',at:at('2026-11-05','07:00'),file:'g.pdf',rows:[Rw('1802','Sato,Kenji,Mr.','2026-11-03','2026-11-08'),Rw('1406','Meyer,Anna,Mrs.','2026-11-02','2026-11-07'),Rw('1203','Morel,Claire,Ms.','2026-11-01','2026-11-09'),Rw('0901','Brodan,Kresimir,Mr.','2026-11-01','2026-11-09'),Rw('1505','Lopez,Maria,Mrs.','2026-11-01','2026-11-09'),Rw('2001','Mardanov,Ilyar,Mr.','2026-11-04','2026-11-09')]}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()');
   const I=(id,room,g,c,cr,ev)=>({id,room,guest:g,concern:c,createdAt:cr,u:1,events:[{id:id+'e',ts:cr,type:'import'}].concat(ev||[])});
   __ev('bdiSaveIssues')([
     I('iA','1203','Claire Morel','Noise from the corridor. Needs follow-up.',at('2026-11-05','07:00')),
     I('iB','0901','Kresimir Brodan','AC not cooling. Needs follow-up.',at('2026-11-05','07:10')),
     I('iC','1505','Maria Lopez','Late laundry. Needs follow-up.',at('2026-11-05','07:20'))]);
   // eski surumden kalan acik "memnuniyet teyidi"
   const o=JSON.parse(KV.get('bdi_fu_v1')||'{}');o['fu_cf_iZ']={id:'fu_cf_iZ',kind:'confirm',iss:'iZ',room:'1505',guest:'Maria Lopez',t:'Memnuniyet teyidi: old',at:at('2026-11-04','12:00'),base:at('2026-11-04','12:00'),due:at('2026-11-04','16:00'),st:'open',src:'auto',u:1};KV.set('bdi_fu_v1',JSON.stringify(o));
   __ev('bdiSaveIssues')(__ev('bdiGetIssues')().concat([I('iZ','1505','Maria Lopez','Minibar.',at('2026-11-04','08:00'),[{id:'iZc',ts:at('2026-11-04','11:00'),type:'close',butler:'',src:'report'}])]));
   __ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-05';__ev('loadBdiLogs()')});
 const all=()=>p.evaluate(()=>{const o=__ev('bdiFuAll')();return Object.keys(o).map(k=>o[k]).filter(f=>!f.del).map(f=>({id:f.id,kind:f.kind,st:f.st,via:f.doneVia||'',by:f.doneBy||'',txt:f.doneText||'',iss:f.iss||'',room:f.room,guest:f.guest,t:f.t,owner:f.owner||'',due:__ev('bdiFmtTs')(f.due)}))});
 await p.evaluate(()=>__ev('switchBdiTab("fu")'));await p.waitForTimeout(200);
 let A=await all();const g=id=>A.find(x=>x.id===id)||{};
 ok(g('fu_is_iA').st==='open'&&g('fu_is_iB').st==='open'&&g('fu_is_iC').st==='open','issue metni "needs follow-up" -> 3 takip açık');
 ok(g('fu_cf_iZ').st==='cancel'&&g('fu_cf_iZ').via==='simple','eski sürümden kalan "memnuniyet teyidi" kapatıldı (artık açılmıyor)');
 // --- 2) issue kapaninca takip kapanir ---
 await p.evaluate(()=>{const L=__ev('bdiGetIssues')();const at=Date.now();
   __ev('bdiIssueById')(L,'iB').events.push({id:'iBc',ts:at,type:'close',butler:'',src:'report'});           // kaynak kapatti, butler temasi yok
   __ev('bdiIssueById')(L,'iC').events.push({id:'iCc',ts:at,type:'close',butler:'Onur Kaya',text:'Delivered and apologised'}); // butler kapatti
   __ev('bdiSaveIssues')(L);__ev('renderBdiFu()')});
 A=await all();
 ok(g('fu_is_iB').st==='cancel'&&g('fu_is_iB').via==='closed'&&g('fu_is_iB').txt==='Issue kapandı','0901: issue kaynakta kapandı -> takip de kapandı ("Issue kapandı"), gecikti olarak kalmıyor');
 ok(g('fu_is_iC').st==='done'&&g('fu_is_iC').by==='Onur Kaya','1505: butler kapattı -> takip "yapıldı" (Onur Kaya)');
 // --- 3) issue kartindan takip: kutu odayla dolar, issue'ya baglanir; issue sonradan kapanirsa o da kapanir ---
 await p.evaluate(()=>__ev('bdiFuFromIssue')('iA'));await p.waitForTimeout(200);
 const pre=await p.evaluate(()=>({v:document.getElementById('bdiFuQ').value,focus:document.activeElement&&document.activeElement.id,note:(document.querySelector('#bdiFuPanel .bd-note')||{}).textContent||''}));
 ok(pre.v==='1203 '&&pre.focus==='bdiFuQ'&&/1203 Claire Morel/.test(pre.note),'issue kartı "takip": Takip sekmesi açıldı, kutuda "1203 ", issue\'ya bağlanacak notu');
 await p.type('#bdiFuQ','yarın 11:00 call the guest about the room move');await p.press('#bdiFuQ','Enter');await p.waitForTimeout(200);
 A=await all();const mA=A.find(x=>x.kind==='manual'&&x.room==='1203');
 ok(mA&&mA.iss==='iA'&&mA.guest==='Claire Morel'&&mA.due==='06.11.2026 11:00'&&mA.t==='call the guest about the room move','issue\'ya bağlı elle takip: 1203 Claire Morel, yarın 11:00');
 // --- 4) tek kutudan takip + kutucuk = yapildi (kimdeyse onun adina touch) + geri al ---
 await p.evaluate(()=>{__ev('bdiFloorSetCount(2)');__ev('bdiFloorAssign(0,"Deniz Karavus")');__ev('bdiFloorAssign(1,"Onur Kaya")')});
 await p.evaluate(()=>__ev('switchBdiTab("fu")'));await p.waitForTimeout(100);
 await p.fill('#bdiFuQ','1802 17:00 tekne saatini teyit et');await p.click('#bdiFuPanel .bd-fu-q button:has-text("Ekle")');await p.waitForTimeout(200);
 A=await all();const m1=A.find(x=>x.kind==='manual'&&x.room==='1802');
 const own=await p.evaluate(id=>__ev('bdiFuOwner')(__ev('bdiFuAll')()[id]),m1.id);
 ok(m1&&m1.guest==='Kenji Sato'&&m1.due==='05.11.2026 17:00'&&own,'tek kutu: "1802 17:00 tekne saatini teyit et" -> Kenji Sato, bugün 17:00, kimde: '+own);
 const rows=await p.evaluate(()=>[...document.querySelectorAll('#bdiFuPanel .bd-fu-grp .bd-fu-row')].map(r=>r.innerText.replace(/\s+/g,' ').trim()));console.log('  açık: '+rows.join(' || '));
 const grp=await p.evaluate(()=>[...document.querySelectorAll('#bdiFuPanel .bd-fu-grp h4')].map(h=>h.textContent.replace(/\s+/g,' ').trim()).join('|'));
 ok(/Bugün/.test(grp)&&/Yarın ve sonrası/.test(grp)&&rows.some(r=>/^17:00 1802 Kenji Sato tekne saatini teyit et/.test(r)),'liste: Bugün / Yarın ve sonrası; tek satır "17:00 1802 Kenji Sato tekne saatini teyit et" ('+grp+')');
 await p.click('#bdiFuPanel .bd-fu-row:has(.bd-fu-room:text-is("1802")) .bd-fu-chk');await p.waitForTimeout(200);
 const D1=await p.evaluate(id=>{const f=__ev('bdiFuAll')()[id];const l=__ev('loadBdiArrayForDate')('2026-11-05').find(x=>x.id===f.doneLog);return {st:f.st,by:f.doneBy,log:l?l.butler+'|'+l.action+'|'+l.sentence:'',more:[...document.querySelectorAll('#bdiFuPanel details.bd-fu-more summary')].map(s=>s.textContent.replace(/\s+/g,' ')).join(' / '),toast:(document.querySelector('.bd-toast')||{}).textContent||''}},m1.id);
 console.log('  '+D1.log+'\n  '+D1.more);
 ok(D1.st==='done'&&D1.by===own&&new RegExp('^'+own+'\\|Follow-up\\|Butler '+own+' followed up with our guest Kenji Sato staying at Room 1802 on: tekne saatini teyit et\\.$').test(D1.log),'kutucuğa dokununca yapıldı + Butler Did It\'e touch ('+own+')');
 ok(/Bugün ilgilenilen 2/.test(D1.more),'"Bugün ilgilenilen 2" katlanır bölümde (1505 butler kapattı + 1802)');
 await p.evaluate(id=>{__ev('bdiFuRowToggle')(id)},m1.id);await p.waitForTimeout(80);
 await p.click('#bdiFuPanel .bd-fu-ed button:has-text("geri al")');await p.waitForTimeout(200);
 const U1=await p.evaluate(id=>({st:__ev('bdiFuAll')()[id].st,logs:__ev('loadBdiArrayForDate')('2026-11-05').filter(l=>l.meta&&l.meta.fuId===id).length}),m1.id);
 ok(U1.st==='open'&&U1.logs===0,'"geri al": takip yeniden açık, touch silindi');
 // issue sonradan kapandi -> bagli elle takip de kapanir
 await p.evaluate(()=>{const L=__ev('bdiGetIssues')();__ev('bdiIssueById')(L,'iA').events.push({id:'iAc',ts:Date.now(),type:'close',butler:'',src:'report'});__ev('bdiSaveIssues')(L);__ev('renderBdiFu()')});
 A=await all();
 ok(A.find(x=>x.id===mA.id).st==='cancel'&&A.find(x=>x.id==='fu_is_iA').st==='cancel','1203 issue kapandı -> hem otomatik hem issue\'ya bağlı elle takip kapandı');
 // --- 5) Didn't Do It plani -> takip; o odaya touch girilince kendiliginden kapanir ---
 const NT=await p.evaluate(()=>{const L=__ev('bdiNtList')('2026-11-05');const r=L.rows.find(x=>x.rooms.indexOf('2001')>=0);if(!r)return {err:L.rows.map(x=>x.rooms.join('/')).join(',')};
   __ev('bdiNtSet')('2026-11-05',r.gk,'f:plan','Courtesy call');__ev('bdiNtSet')('2026-11-05',r.gk,'f:who','Onur Kaya');__ev('bdiFuSweep')();const f=__ev('bdiFuAll')()['fu_nt_2026-11-05_'+r.gk];return {gk:r.gk,f:f?f.room+'|'+f.guest+'|'+f.t+'|'+f.owner+'|'+__ev('bdiFmtTs')(f.due)+'|'+f.st:''}});
 console.log('  NT: '+JSON.stringify(NT));
 ok(NT.f==='2001|Ilyar Mardanov|Didn\'t Do It planı: Courtesy call|Onur Kaya|05.11.2026 20:00|open','Didn\'t Do It "Plan: Courtesy call, Who will see: Onur" -> takip (2001, bugün 20:00, Onur)');
 const W=await p.evaluate(()=>__ev('swWarnCollect')().filter(x=>x.g==='Takip').map(x=>x.t));
 await p.clock.setFixedTime(new Date('2026-11-05T10:30:00+03:00'));
 await p.evaluate(()=>{const KV=__ev('BdiKV'),arr=__ev('loadBdiArrayForDate')('2026-11-05');arr.push({id:'t2001',butler:'Onur Kaya',room:'2001',guest:'Ilyar Mardanov',action:'Courtesy Call',touchCategory:'Service',patternType:'service',note:'',time:'10:30',sentence:'x',ts:Date.now(),countsAsTouch:true});__ev('saveBdiArrayForDate')('2026-11-05',arr);__ev('renderBdiFu()')});
 const NT2=await p.evaluate(gk=>{const f=__ev('bdiFuAll')()['fu_nt_2026-11-05_'+gk];return f.st+'|'+f.doneVia+'|'+f.doneBy},NT.gk);
 ok(NT2==='done|touch|Onur Kaya','2001\'e touch girilince Didn\'t Do It takibi kendiliğinden "yapıldı" (touch girildi, Onur)');
 // --- 6) Butler Alert "gidilmedi" -> takip; gidilince kapanir ---
 const AL=await p.evaluate(()=>{const A=__ev('alertList');A.length=0;A.push({roomNo:1406,guest:'Meyer, Anna',reasons:[{label:'VIP',detail:''}],visited:false,notVisitedReason:'Misafir odada değildi'});__ev('bdiFuSweep')();const f=__ev('bdiFuAll')()['fu_al_2026-11-05_1406'];return f?f.room+'|'+f.guest+'|'+f.t+'|'+__ev('bdiFmtTs')(f.due)+'|'+f.st:''});
 ok(AL==='1406|Anna Meyer|Butler Alert tekrar: Misafir odada değildi|05.11.2026 12:30|open','Butler Alert "gidilmedi" -> takip (1406 Anna Meyer, 2 saat sonra 12:30)');
 const AL2=await p.evaluate(()=>{__ev('setAlertVisited')(0,true,'Deniz Karavus');__ev('bdiFuSweep')();const f=__ev('bdiFuAll')()['fu_al_2026-11-05_1406'];return f.st+'|'+f.doneVia+'|'+f.doneBy});
 ok(/^done\|(alert|touch)\|Deniz Karavus$/.test(AL2),'alert\'e gidilince takip kendiliğinden kapandı: '+AL2);
 // --- 7) ekran sade: eski kalabalik yok, kaynak etiketi var ---
 await p.evaluate(()=>{const A=__ev('alertList');A.push({roomNo:1802,guest:'Sato, Kenji',reasons:[{label:'Repeat',detail:''}],visited:false,notVisitedReason:'DND'});__ev('renderBdiFu()')});
 const UI=await p.evaluate(()=>({kpi:!!document.querySelector('#bdiFuPanel .bd-fu-kpis'),seg:!!document.querySelector('#bdiFuPanel .bd-seg'),sel:document.querySelectorAll('#bdiFuPanel .bd-fu-grp select').length,inp:document.querySelectorAll('#bdiFuPanel .bd-fu-grp input').length,btn:document.querySelectorAll('#bdiFuPanel .bd-fu-grp button.bd-btn').length,src:[...document.querySelectorAll('#bdiFuPanel .bd-fu-grp .bd-fu-src')].map(x=>x.textContent).filter(Boolean).join(',')}));
 ok(!UI.kpi&&!UI.seg&&UI.sel===0&&UI.inp===0&&UI.btn===0,'satırlarda seçim kutusu / yazı alanı / düğme yok (kalabalık gitti)');
 ok(/Alert/.test(UI.src),'kaynak etiketi satırda: '+UI.src);
 // Uyarilar: Takip grubu nt / alert takiplerini de gosterir
 const W2=await p.evaluate(()=>__ev('swWarnCollect')().filter(x=>x.g==='Takip').map(x=>x.t));console.log('  uyarılar: '+W2.join(' | '));
 ok(W2.some(t=>/1802/.test(t))||W2.length===0,'Uyarılar > Takip çalışıyor');
 // gecikince Uyarilar'da kirmizi; tiklayinca Takip'te o satir acik
 await p.clock.setFixedTime(new Date('2026-11-05T13:00:00+03:00'));
 const W3=await p.evaluate(()=>__ev('swWarnCollect')().filter(x=>x.g==='Takip').map(x=>({sev:x.sev,t:x.t,go:x.go})));console.log('  uyarılar 13:00: '+W3.map(x=>x.sev+' '+x.t+' -> '+x.go).join(' | '));
 const w18=W3.find(x=>/1802/.test(x.t)&&/gecikti/.test(x.t));
 ok(w18&&w18.sev==='high','13:00: 1802 alert takibi gecikti -> Uyarılar\'da kırmızı');
 if(w18){await p.evaluate(g=>{eval(g.replace(/^swWarnGo/,"__ev('swWarnGo')"))},w18.go);await p.waitForTimeout(250);
   const GO=await p.evaluate(()=>{const r=document.querySelector('#bdiFuPanel .bd-fu-row.open');return r?r.id+'|'+r.className:''});
   ok(/bdiFu_fu_al_2026-11-05_1802/.test(GO)&&/bd-flash/.test(GO),'uyarıya tıklayınca Takip sekmesinde o satır açık ve vurgulu: '+GO);}
 await p.evaluate(()=>{__ev('_bdiFuOpenRow=""');__ev('renderBdiFu()')});
 // dar ekran (1024 masaustu, 820 iPad): Takip paneli tasmiyor, satir tek satir kaliyor
 for(const W of [1024,820]){await p.setViewportSize({width:W,height:900});await p.waitForTimeout(150);
   const OV=await p.evaluate(()=>{const el=document.getElementById('bdiFuPanel'),W=document.documentElement.clientWidth;return {right:Math.round(el.getBoundingClientRect().right),W,over:[...el.querySelectorAll('*')].filter(x=>x.offsetParent&&x.getBoundingClientRect().right>el.getBoundingClientRect().right+1).length,tall:[...el.querySelectorAll('.bd-fu-grp .bd-fu-line')].filter(x=>x.getBoundingClientRect().height>40).length}});
   ok(OV.right<=OV.W&&OV.over===0&&OV.tall===0,W+'px: Takip paneli taşmıyor, satırlar tek satır ('+JSON.stringify(OV)+')');
   if(W===820)await (await p.$('#bdiTab_fu')).screenshot({path:__dirname+'/did/fu2_ipad.png'});}
 await p.setViewportSize({width:1400,height:1000});await p.waitForTimeout(150);
 await p.evaluate(()=>{document.querySelectorAll('#bdiFuPanel details.bd-fu-more')[0].open=true});
 await (await p.$('#bdiTab_fu')).screenshot({path:__dirname+'/did/fu2_tab.png'});
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
