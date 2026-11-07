const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000},deviceScaleFactor:1.5});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));let promptVal='Misafir uyuyordu';p.on('dialog',d=>d.type()==='prompt'?d.accept(promptVal):d.accept());
 await p.clock.install({time:new Date('2026-11-03T19:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-03');localStorage.setItem('sw_dayfix','2026-11-03');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak','Onur Kaya']));
   localStorage.setItem('alert_link_acts',JSON.stringify(['Welcome / In-room Check-in']));
   const A=(room,guest)=>({roomNo:room,guest,reasons:[{label:'4+ Gece',detail:''}],visited:null,notVisitedReason:'',visitedBy:'',manual:false,depDate:'2026-11-08',nights:5,resStatus:''});
   localStorage.setItem('alert_2026-11-03',JSON.stringify([A(805,'Hollinsby, Kirsten'),A(1205,'Dovell, Kerry'),A(1610,'Mellander, Melissa'),A(1705,"Hanlan O'Brennan, Rose"),A(1709,'Lennox, Michael'),A(2001,'Mardanov, Ilyar')]));
   localStorage.setItem('alert_selected_date','2026-11-03');localStorage.setItem('alert_selected_on','2026-11-03')});
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const R=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-03',at:Date.now(),file:'g.pdf',rows:[R('0901','Brodan,Kresimir,Mr.','2026-10-31','2026-11-06'),R('1808','De Gramont,Armand,Mr.','2026-10-25','2026-11-08')]}));__ev('_bdiGih=null');
   const L=(id,b,room,guest,act,t)=>({id,butler:b,room,guest,action:act,touchCategory:'Service',patternType:'service',note:'',time:t,sentence:'Butler '+b+' welcomed our guest'+(guest?' '+guest:'')+' with in-room check-in at Room '+room+'.',ts:new Date('2026-11-03T'+t+':00+03:00').getTime(),countsAsTouch:true});
   const W='Welcome / In-room Check-in';
   KV.set('bdi_2026-11-03',JSON.stringify([L('w1','Beyza Nur Çırak','0805','Stale Previous',W,'15:00'),L('w2','Onur Kaya','1206','Kerry Dovell',W,'15:30'),L('w3','Onur Kaya','1610','Melissa Mellander','Welcome Drink','16:00'),L('w4','Butler team','1705',"Rose Hanlan O'Brennan",W,'16:30')]));
   const t=h=>new Date('2026-11-03T'+h+':00+03:00').getTime();
   __ev('bdiSaveIssues')([
     {id:'i1',room:'1203',guest:'Claire Morel',concern:'Noise',createdAt:t('09:00'),u:1,events:[{id:'e1',ts:t('09:00'),type:'import'},{id:'e2',ts:t('12:00'),type:'close',butler:'',src:'report'}]},
     {id:'i2',room:'1505',guest:'Maria Lopez',concern:'Late laundry',createdAt:t('09:00'),u:1,events:[{id:'e3',ts:t('09:00'),type:'import'},{id:'e4',ts:t('13:00'),type:'close',butler:'',src:'manual'},{id:'e5',ts:t('13:00'),type:'nocontact',butler:'',by:'',text:'',src:'manual'}]},
     {id:'i3',room:'0901',guest:'Kresimir Brodan',concern:'AC not working',createdAt:t('13:00'),u:1,events:[{id:'e6',ts:t('13:00'),type:'import'}]},
     {id:'i4',room:'1007',guest:'Cihan Gokalp',concern:'Breakfast cold',createdAt:t('08:00'),u:1,events:[{id:'e7',ts:t('08:00'),type:'import'},{id:'e8',ts:t('09:00'),type:'touch',butler:'Beyza Nur Çırak',text:''}]}]);
   KV.set('bdi_dep_v1',JSON.stringify({days:{'2026-11-03':{at:Date.now(),file:'d.pdf',rows:[{room:'1007',name:'Gokalp,Cihan,Sn',arr:'2026-10-31',dep:'2026-11-03',st:'CKOT',time:'10:00'},{room:'0805',name:'Previous,Stale,Mr.',arr:'2026-10-30',dep:'2026-11-03',st:'CKOT',time:'11:00'}]}}}));__ev('_bdiDepAll=null');__ev('bdiDayHistReset()');
   __ev('loadAlertSnapshot()');__ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-03';__ev('loadBdiLogs()')});
 // Butler Alert sekmesi: gec / farkli girilen welcome'lar baglanir
 await p.evaluate(()=>__ev('switchBdiTab("alert")'));await p.waitForTimeout(300);
 let A=await p.evaluate(()=>{const L=__ev('alertList');const g=r=>L.find(a=>a.roomNo===r);const logs=JSON.parse(__ev('BdiKV').get('bdi_2026-11-03'));return {a805:g(805).visited,by805:g(805).visitedBy,a1205:g(1205).visited,a1610:g(1610).visited,a1705:g(1705).visited,w1:logs.find(l=>l.id==='w1').guest,w1s:logs.find(l=>l.id==='w1').sentence}});
 ok(A.a805===true&&A.by805==='Beyza Nur Çırak'&&A.w1==='Kirsten Hollinsby'&&/Kirsten Hollinsby/.test(A.w1s),'eski oda listesinden yanlis adla girilen Welcome (0805) alert\'i tikledi, kaydin adi duzeldi');
 ok(A.a1205===true,'giriste oda degisen misafir (alert 1205, Welcome 1206) isimle baglandi');
 ok(A.a1610!==true&&A.a1705!==true,'listede olmayan "Welcome Drink" (1610) ve butlersiz Welcome (1705) kendiliginden baglanmadi');
 // teshis + tek tik duzeltme
 await p.click('#alertF_all').catch(()=>{});await p.evaluate(()=>{__ev('setAlertFilter("pending")')});await p.waitForTimeout(150);
 const W=await p.evaluate(()=>[...document.querySelectorAll('#bdiTab_alert table tbody tr')].map(r=>r.textContent.replace(/\s+/g,' ').trim()).filter(t=>/⚠/.test(t)));
 console.log('  '+W.join('\n  '));
 ok(W.some(t=>/^1610.*“Welcome Drink” girilmiş; bu işlem otomatik tik listesinde değil.*listeye ekle.*bu kayda bağla/.test(t))&&W.some(t=>/^1705.*Welcome \/ In-room Check-in girilmiş ama butler seçilmemiş/.test(t)),'alert satirinda "neden tiklenmedi": 1610 islem listede degil, 1705 butler secilmemis');
 await p.click('#bdiTab_alert tr:has-text("1610") button:has-text("listeye ekle")');await p.waitForTimeout(200);
 await p.click('#bdiTab_alert tr:has-text("1705") button:has-text("bu kayda bağla")');await p.waitForTimeout(200);
 A=await p.evaluate(()=>{const L=__ev('alertList');return {a1610:L.find(a=>a.roomNo===1610).visited,via:L.find(a=>a.roomNo===1610).visitedVia,a1705:L.find(a=>a.roomNo===1705).visited,acts:__ev('bdiAlertLinkActs')()}});
 ok(A.a1610===true&&A.via==='Welcome Drink'&&A.acts.includes('Welcome Drink')&&A.a1705===true,'"listeye ekle": Welcome Drink artik tikliyor ve 1610 baglandi; "bu kayda bağla": 1705 baglandi');
 // ❌ + sebep: satir kaybolmaz, yeni sebep eklenir
 await p.selectOption('#bdiTab_alert tr:has-text("1709") select[title^="Gidilmedi"]','__nr');await p.waitForTimeout(150); // 2026-11-03: ❌ artik sebep listesi; "❌ sebep sonra" eski davranis
 const X1=await p.evaluate(()=>{const r=[...document.querySelectorAll('#bdiTab_alert table tbody tr')].find(x=>/1709/.test(x.textContent));return r?{sel:!!r.querySelector('select[id^="alertNvr_"]'),txt:r.querySelector('select[id^="alertNvr_"]').options[0].textContent}:null});
 ok(X1&&X1.sel&&/Neden gidilmedi/.test(X1.txt),'❌ basinca satir Bekleyenler\'de kaldi, "⚠ Neden gidilmedi? Seçin" kutusu gorunur');
 await p.selectOption('#bdiTab_alert tr:has-text("1709") select[id^="alertNvr_"]','__new');await p.waitForTimeout(200);
 const X2=await p.evaluate(()=>({r:__ev('alertList').find(a=>a.roomNo===1709).notVisitedReason,list:__ev('getAlertReasons')(),still:[...document.querySelectorAll('#bdiTab_alert table tbody tr')].some(x=>/1709/.test(x.textContent))}));
 ok(X2.r==='Misafir uyuyordu'&&X2.list.includes('Misafir uyuyordu')&&!X2.still,'"+ Yeni sebep…": sebep listeye eklendi ve secildi; sebep girilince satir bekleyenlerden cikti');
 // Uyarilar
 const U=await p.evaluate(()=>{const it=__ev('swWarnRefresh')();return {it:it.map(x=>x.sev+'|'+x.g+'|'+x.t),btn:document.getElementById('swWarnBtn').textContent,bn:document.getElementById('swWarnBanner').style.display}});
 console.log('  '+U.it.join('\n  '));
 const has=re=>U.it.some(x=>re.test(x));
 ok(has(/^high\|Issues\|Oda 1203 Claire Morel: kapandı ama kimin ilgilendiği girilmedi/)&&has(/^high\|Issues\|Oda 1505 Maria Lopez: temas olmadan kapandı, kimin kapattığı \/ nedeni seçilmedi/)&&has(/^high\|Issues\|Oda 0901 Kresimir Brodan: 6 saattir açık, kimse ilgilenmedi/)&&has(/^high\|Issues\|Oda 1007 Cihan Gokalp: misafir çıktı ama issue hâlâ açık/)&&has(/^mid\|Issues\|Oda 1007 Cihan Gokalp: 1 butler aksiyonunda “ne yapıldı” boş/),'issue uyarilari: temas eden yok, kim kapatti yok, 6 saattir kimse yok, misafir cikti ama acik, "ne yapıldı" bos');
 ok(has(/^mid\|Butler Alert\|03\.11: 1 alert hâlâ işaretlenmedi/)&&has(/^mid\|Didn't Do It\|03\.11: \d+ dokunulmamış misafirde sebep seçilmedi/)&&has(/^mid\|In-room\|03\.11: \d+ in-room check-in'de ETD eksik/),'alert / Didn\'t Do It / In-room uyarilari');
 ok(/^Uyarılar \d+$/.test(U.btn.trim())&&U.bn==='flex','ust barda "Uyarılar N" ve 17:00 sonrasi gun sonu seridi');
 // Uyarilar penceresi > Git
 await p.click('#swWarnBtn');await p.waitForTimeout(150);
 await p.click('#swWarnModal div:has-text("1203 Claire Morel") >> button:has-text("Git")');await p.waitForTimeout(250);
 const G=await p.evaluate(()=>({tab:document.getElementById('bdiTab_issues').style.display,open:!!document.querySelector('#bdiIs_i1 .bd-issue-body'),modal:document.getElementById('swWarnModal').style.display}));
 ok(G.tab==='block'&&G.open&&G.modal==='none','Uyarılar > "Git": issue karti acildi');
 // rapor oncesi kontrol
 await p.evaluate(()=>{window.__dl=[];__ev('dl=function(h,n){window.__dl.push(n)}');__ev('switchBdiTab("log")');__ev('setBdiView("day")')});
 // 2026-11-07: raporlar "Rapor al" sekmesinde; Log'daki "Rapor al" ayni gunu getirir
 await p.click('#bdiTab_log button:has-text("Rapor al")');await p.waitForTimeout(200);
 await p.click('#bdiRpt_did button:has-text("PDF")');await p.waitForTimeout(200);
 const Gt=await p.evaluate(()=>({modal:document.getElementById('swWarnModal').style.display,title:(document.querySelector('#swWarnModal h3')||{}).textContent,dl:window.__dl.length}));
 ok(Gt.modal==='flex'&&/^Rapordan önce: \d+ eksik \(03\.11\)/.test(Gt.title)&&Gt.dl===0,'PDF\'e basinca once kontrol: "'+Gt.title+'" (rapor henuz inmedi)');
 await p.click('#swWarnModal button:has-text("Yine de indir")');await p.waitForTimeout(250);
 const Gt2=await p.evaluate(()=>window.__dl.slice());
 ok(Gt2.length===1&&/^ButlerDidIt_/.test(Gt2[0]),'"Yine de indir": rapor indi');
 await p.evaluate(()=>{try{localStorage.setItem('sw_warn_dismiss','2026-11-03:'+__ev('swWarnCollect')().filter(x=>x.sev==='high').length)}catch(e){};__ev('swWarnRefresh()')});
 ok(await p.evaluate(()=>document.getElementById('swWarnBanner').style.display)==='none','"Bugün gizle": serit gizlendi');
 ok(errs.length===0,'JS hatasi yok '+JSON.stringify(errs));
 await p.evaluate(()=>__ev('swWarnOpen()'));await p.waitForTimeout(150);await (await p.$('#swWarnModal > div')).screenshot({path:__dirname+'/did/warn_modal.png'});
 await p.evaluate(()=>{document.getElementById('swWarnModal').style.display='none';__ev('showPage("didit")');__ev('switchBdiTab("alert")');__ev('setAlertFilter("all")')});await p.waitForTimeout(200);
 await (await p.$('#bdiTab_alert')).screenshot({path:__dirname+'/did/alert_reasons.png'});
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
