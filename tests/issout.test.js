const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000},deviceScaleFactor:1.5});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-03T14:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-03');localStorage.setItem('sw_dayfix','2026-11-03');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak','Onur Kaya']))});
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const at=(d,h)=>new Date(d+'T'+h+':00+03:00').getTime();
   const R=(room,name,arr,dep,dt)=>({room,name,arr,dep,depTime:dt||'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   const gih=[R('1203','Morel,Claire,Ms.','2026-10-30','2026-11-03','11:00'),R('0901','Brodan,Kresimir,Mr.','2026-10-31','2026-11-04'),R('1808','De Gramont,Armand,Mr.','2026-10-25','2026-11-08'),R('1505','Lopez,Maria,Mrs.','2026-10-29','2026-11-06'),R('2004','Alhnaya,Abdulkreem,Mr.','2026-10-28','2026-11-05')];
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-02',at:at('2026-11-02','23:00'),file:'g.pdf',rows:gih}));__ev('_bdiGih=null');
   const inh={days:{'2026-11-01':{at:at('2026-11-01','23:00'),rows:[{room:'0707',name:'Vale,Old,Mr.',arr:'2026-10-20',dep:'2026-11-01',acc:[]},{room:'1203',name:'Morel,Claire,Ms.',arr:'2026-10-30',dep:'2026-11-03',acc:[]}]},
     '2026-11-02':{at:at('2026-11-02','23:00'),rows:gih.map(r=>({room:r.room,name:r.name,arr:r.arr,dep:r.dep,acc:[]}))}}};
   KV.set('bdi_inh_v1',JSON.stringify(inh));
   KV.set('bdi_dep_v1',JSON.stringify({days:{'2026-11-03':{at:at('2026-11-03','12:00'),file:'d.pdf',rows:[{room:'1007',name:'Gokalp,Cihan,Sn',arr:'2026-10-31',dep:'2026-11-03',st:'CKOT',time:'10:00'}]}}}));
   __ev('_bdiDepAll=null');__ev('bdiDayHistReset()');
   // VAC 10:00: Maria Lopez uzatmis (09.11)
   __ev('bdiVacSt={"1505":{name:"Lopez, Maria",arr:"2026-10-29",dep:"2026-11-09",res:"Checked In"},"1808":{name:"De Gramont, Armand",arr:"2026-10-25",dep:"2026-11-08",res:"Checked In"}}');
   __ev('bdiVacDay="2026-11-03"');__ev('bdiVacPrintedAt='+at('2026-11-03','10:00'));
   const I=(id,room,guest,c,cr,ev)=>({id,room,guest,concern:c,createdAt:cr,u:1,events:[{id:id+'e',ts:cr,type:'import'}].concat(ev||[])});
   __ev('bdiSaveIssues')([
     I('iA','1203','Claire Morel','Noise from corridor',at('2026-11-03','09:00')),
     I('iB','0901','Kresimir Brodan','AC not working',at('2026-11-03','09:00')),
     I('iC','1808','Armand De Gramont','Late laundry',at('2026-11-02','18:00'),[{id:'iCt',ts:at('2026-11-02','19:00'),type:'touch',butler:'Onur Kaya',text:'apologised'}]),
     I('iD','1505','Maria Lopez','Minibar not refilled',at('2026-11-02','10:00')),
     I('iE','','Abdulkreem Alhnaya','Shawls missing',at('2026-11-03','08:00')),
     I('iF','1007','Cihan Gokalp','Breakfast cold',at('2026-11-03','07:00')),
     I('iG','0707','Old Vale','Pillow',at('2026-10-31','12:00')),
     I('iH','','Hodaya Alfarsin','An outside guest dining at the restaurant was charged for parking while waiting at the entrance.',at('2026-11-03','08:30'))]);
   __ev('showPage("didit")');__ev('switchBdiTab("issues")');__ev('bdiIssueSetFilter("open")')});
 await p.waitForTimeout(300);
 const card=()=>p.evaluate(()=>[...document.querySelectorAll('#bdiIssueList article.bd-issue')].map(a=>({id:a.id.replace('bdiIs_',''),pill:[...a.querySelectorAll('.bd-issue-meta .bd-pill')].map(x=>x.textContent).join('|'),cls:[...a.querySelectorAll('.bd-issue-meta .bd-pill')].map(x=>x.className).join('|'),hint:(a.querySelector('.bd-isout')||{}).textContent||''})));
 let C=await card();console.log('  '+C.map(c=>c.id+': '+c.pill+(c.hint?' ['+c.hint.slice(0,60)+']':'')).join('\n  '));
 const P=id=>(C.find(c=>c.id===id)||{}).pill||'';
 ok(P('iA')==='Bugün çıkıyor 11:00'&&/due0/.test(C.find(c=>c.id==='iA').cls),'1203: "Bugün çıkıyor 11:00" (in-house raporundaki EDT), kırmızı');
 ok(P('iB')==='Yarın çıkıyor (04.11)','0901: "Yarın çıkıyor (04.11)"');
 ok(P('iC')==='Çıkış 08.11 · 5 gün','1808: "Çıkış 08.11 · 5 gün"');
 ok(P('iD')==='Çıkış 09.11 · 6 gün','1505: uzatma, daha yeni VAC (09.11) in-house (06.11)\'u geçti');
 ok(P('iE')==='Çıkış 05.11 · 2 gün','odasız issue (Alhnaya): isimden bulundu, 05.11');
 ok(P('iF')==='Çıktı 03.11 10:00'||/^Çıktı/.test(P('iF')),'1007: çıkış raporu "Çıktı" ('+P('iF')+')');
 ok(P('iG')==='Çıkış günü geçti (01.11)','0707: çıkış günü geçmiş, DEP yok: "Çıkış günü geçti (01.11)"');
 ok(P('iH')===''&&/Outside guest olabilir: o günün in-house \/ varış \/ çıkış raporlarında bu isim yok; metinde “outside guest” geçiyor/.test(C.find(c=>c.id==='iH').hint),'odasız + raporlarda yok + metinde "outside guest": kartta öneri satırı');
 ok(C.map(c=>c.id).join(',')==='iA,iB,iE,iC,iD,iH,iF,iG','sıra: bugün > yarın > 2 gün > 5 > 6 > bilinmiyor > çıkmış/geçmiş ('+C.map(c=>c.id).join(',')+')');
 const K=await p.evaluate(()=>document.getElementById('bdiIssueStats').textContent.replace(/\s+/g,' '));
 ok(/^8açık1bugün çıkıyor/.test(K.trim()),'KPI: "8 açık · 1 bugün çıkıyor" ('+K+')');
 // kart icinde cikis satiri
 await p.click('#bdiIs_iD .bd-issue-top');await p.waitForTimeout(150);
 const SL=await p.evaluate(()=>document.querySelector('#bdiIs_iD .bd-isstay').textContent.replace(/\s+/g,' '));
 ok(/Çıkış: 09\.11\.2026 Pazartesi · Çıkış 09\.11 · 6 gün · kaynak: VAC raporu 03\.11/.test(SL),'kart içinde: "'+SL+'"');
 await (await p.$('#bdiIs_iD')).screenshot({path:__dirname+'/did/issue_card_dep.png'});await (await p.$('#bdiIs_iH')).screenshot({path:__dirname+'/did/issue_outside_hint.png'});
 // siralama: son hareket
 await p.selectOption('#bdiIssueSort','recent');await p.waitForTimeout(150);
 C=await card();ok(C.map(c=>c.id).join(',')==='iA,iB,iH,iE,iF,iC,iD,iG','"Sıra: son hareket" seçilince son harekete göre ('+C.map(c=>c.id).join(',')+')');
 await p.selectOption('#bdiIssueSort','dep');await p.waitForTimeout(100);
 // Uyarilar
 let U=await p.evaluate(()=>__ev('swWarnCollect')().map(x=>x.sev+'|'+x.t));console.log('  '+U.join('\n  '));
 const has=re=>U.some(x=>re.test(x));
 ok(has(/^high\|Oda 1203 Claire Morel: misafir bugün çıkıyor \(11:00\), issue hâlâ açık ve kimse ilgilenmedi — son fırsat/),'Uyarı: bugün çıkıyor + son fırsat');
 ok(has(/^high\|Oda 0901 Kresimir Brodan: misafir yarın çıkıyor, issue açık, 5 saattir kimse ilgilenmedi/),'Uyarı: yarın çıkıyor');
 ok(has(/^high\|Oda 1007 Cihan Gokalp: misafir çıktı ama issue hâlâ açık/),'Uyarı: misafir çıktı');
 ok(has(/^mid\|Oda yok · Hodaya Alfarsin: otel misafiri olmayabilir \(o günün in-house/),'Uyarı: odasız issue için "otel misafiri olmayabilir"');
 // outside isaretle (karttaki oneri)
 await p.click('#bdiIs_iH .bd-isout button:has-text("outside olarak işaretle")');await p.waitForTimeout(200);
 const O1=await p.evaluate(()=>({ids:[...document.querySelectorAll('#bdiIssueList article.bd-issue')].map(a=>a.id),btn:document.getElementById('bdiIssueOutBtn').textContent,vis:document.getElementById('bdiIssueOutBtn').style.display,cnt:__ev('bdiOpenIssueCount')(),badge:document.getElementById('bdiIssueTabCount').textContent,warn:__ev('swWarnCollect')().some(x=>/Hodaya/.test(x.t)),brief:/Hodaya/.test(__ev('bdiBriefDayHtml')()),out:JSON.parse(__ev('BdiKV').get('bdi_issues_v1')||__ev('BdiKV').get(__ev('BDI_ISSUES_KEY'))).find(x=>x.id==='iH').out}));
 ok(!O1.ids.includes('bdiIs_iH')&&O1.btn==='Outside (1)'&&O1.vis===''&&O1.cnt===7&&O1.badge==='7'&&!O1.warn&&!O1.brief&&O1.out&&O1.out.auto===false,'outside: listeden, sayaçtan (7), rozetten, Uyarılar\'dan, brifingden düştü; "Outside (1)" düğmesi çıktı');
 await p.click('#bdiIssueOutBtn');await p.waitForTimeout(150);
 const O2=await p.evaluate(()=>({ids:[...document.querySelectorAll('#bdiIssueList article.bd-issue')].map(a=>a.id),txt:document.getElementById('bdiIssueList').textContent.replace(/\s+/g,' ').slice(0,400)}));
 ok(O2.ids.join()==='bdiIs_iH'&&/Otel misafiri olmayanlar/.test(O2.txt)&&/Outside/.test(O2.txt),'Outside filtresinde yalnız o issue ve açıklama');
 // BDI raporu: outside issue'ya bagli touch raporun issue bolumunde yok
 const RG=await p.evaluate(()=>{const l={id:'x1',room:'',guest:'Hodaya Alfarsin',action:'Guest Issue / Recovery / Room Move',patternType:'issue',meta:{issueId:'iH'},_date:'2026-11-03',time:'10:00',ts:Date.now()};const l2={id:'x2',room:'1203',guest:'Claire Morel',action:'Guest Issue / Recovery / Room Move',patternType:'issue',meta:{issueId:'iA'},_date:'2026-11-03',time:'10:00',ts:Date.now()};return __ev('bdiReportIssueGroups')([l,l2],Date.now()).map(g=>g.guest)});
 ok(RG.join()==='Claire Morel','Butler Did It raporunun issue bölümünde outside yok ('+RG.join()+')');
 // geri al
 await p.click('#bdiIs_iH .bd-issue-top');await p.waitForTimeout(100);
 await p.click('#bdiIs_iH button:has-text("Outside değil, listeye geri al")');await p.waitForTimeout(200);
 const O3=await p.evaluate(()=>({f:__ev('_bdiIssueFilter'),ids:[...document.querySelectorAll('#bdiIssueList article.bd-issue')].map(a=>a.id),hint:!!document.querySelector('#bdiIs_iH .bd-isout'),cnt:__ev('bdiOpenIssueCount')()}));
 ok(O3.f==='open'&&O3.ids.includes('bdiIs_iH')&&!O3.hint&&O3.cnt===8,'"Outside değil": listeye döndü, öneri bir daha çıkmıyor, sayaç 8');
 // tekrar isaretle (ogrenme icin) + ice alma
 await p.evaluate(()=>__ev('bdiIssueSetOut')('iH',1));
 const IMP=await p.evaluate(async()=>{const H=['Start Date & Time','Service Type','Room #','Guest Name','Concern Details','Status','Department','Category','Sub Category','Completed Date & Time','Action Plan','Assigned To','Deadline','Action Status','Request Satisfaction'];
   const r=(t,room,g,c)=>[t,'Guest Issue / Recovery',room,g,c,'New','Rooms','Noise','',t,'','',t,'',''];
   const rows=[H,r('03.11.2026 12:30','','Hodaya Alfarsin','Driver waited again at entrance, charge questioned.'),r('03.11.2026 12:40','','Jane Wexford','A non-resident guest dining at Arola complained about the wait time.'),r('03.11.2026 12:50','','John Unknown','Complained about the lobby music volume.'),r('03.11.2026 13:00','','Abdulkreem Alhnaya','Asked again about pre-authorisation.')];
   const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'ServiceRequests');const buf=XLSX.write(wb,{type:'array',bookType:'xlsx'});
   await __ev('bdiIssueImportFile')(new File([buf],'ServiceRequests.xlsx'));
   const L=__ev('bdiGetIssues')();const f=n=>L.filter(x=>x.guest===n).sort((a,b)=>b.createdAt-a.createdAt)[0];
   return {msg:document.getElementById('bdiIssueImportStatus').textContent,h:f('Hodaya Alfarsin').out,j:f('Jane Wexford').out,u:f('John Unknown').out||null,a:f('Abdulkreem Alhnaya'),cnt:__ev('bdiOpenIssueCount')()}});
 console.log('  '+IMP.msg);
 ok(IMP.h&&IMP.h.auto&&/daha önce outside/.test(IMP.h.why),'içe alma: aynı isim (Hodaya) daha önce outside işaretli + raporlarda yok -> otomatik outside');
 ok(IMP.j&&IMP.j.auto&&/non-resident guest/.test(IMP.j.why),'içe alma: "non-resident guest" + raporlarda yok -> otomatik outside');
 ok(!IMP.u,'içe alma: tek işaret (yalnız raporlarda yok) -> otomatik değil, yalnız öneri');
 ok(!IMP.a.out&&IMP.a.room==='2004','içe alma: oteldeki misafir (Alhnaya) outside olmadı, odası bulundu (2004)');
 ok(/2 outside guest olarak ayrıldı \(Issues > Outside\)/.test(IMP.msg),'yükleme mesajında "2 outside guest olarak ayrıldı"');
 const hint=await p.evaluate(()=>__ev('bdiIssueOutHint')({id:'z',guest:'Claire Morel',room:'',concern:'outside guests at the pool were noisy',createdAt:Date.now()}));
 ok(hint===null,'oteldeki misafirin odasız issue\'sunda "outside guests" geçse de öneri yok');
 // Sen yokken: katlanir
 await p.evaluate(()=>{__ev('bdiIssueSetFilter("open")');__ev('renderBdiIssues()')});await p.waitForTimeout(150);
 const W1=await p.evaluate(()=>{const a=document.querySelector('#bdiIssueAway .bd-away');return {h:Math.round(a.getBoundingClientRect().height),chips:a.querySelector('.bd-away-chips-in').textContent.replace(/\s+/g,' ').trim(),list:!!a.querySelector('.bd-away-list'),tg:a.querySelector('.bd-away-tg').textContent}});
 ok(W1.h<70&&!W1.list&&/yeni, açık/.test(W1.chips)&&/Listeyi göster/.test(W1.tg),'Sen yokken (Issues): kapalı, tek satır ('+W1.h+'px): "'+W1.chips+'"');
 await p.click('#bdiIssueAway .bd-away-tg');await p.waitForTimeout(150);
 const W2=await p.evaluate(()=>{const a=document.querySelector('#bdiIssueAway .bd-away');const b=a.querySelector('.bd-away-body');return {li:a.querySelectorAll('.bd-away-list li').length,mh:getComputedStyle(b).maxHeight,tg:a.querySelector('.bd-away-tg').textContent,ls:localStorage.getItem('sw_away_open')}});
 ok(W2.li>0&&W2.mh==='340px'&&/Gizle/.test(W2.tg)&&W2.ls==='1','"Listeyi göster": liste açıldı (en fazla 340px, kendi içinde kayar), tercih hatırlandı');
 await p.evaluate(()=>__ev('renderBdiIssues()'));
 ok(await p.evaluate(()=>!!document.querySelector('#bdiIssueAway .bd-away-list')),'yeniden çizimde açık kaldı');
 await p.click('#bdiIssueAway .bd-away-chips-in');await p.waitForTimeout(100);
 ok(await p.evaluate(()=>!document.querySelector('#bdiIssueAway .bd-away-list')&&localStorage.getItem('sw_away_open')==='0'),'sayılara tıklayınca da kapanıyor');
 ok(await p.evaluate(()=>{const h=__ev('bdiBriefDayHtml')();return /bd-away-list/.test(h)&&!/bd-away-tg/.test(h)}),'brifingdeki "Sen yokken" eskisi gibi hep açık');
 await p.evaluate(()=>{__ev('switchBdiTab("issues")');__ev('bdiIssueSetFilter("open")');window.scrollTo(0,0)});await p.waitForTimeout(200);
 await p.evaluate(()=>document.querySelectorAll('.bd-toast,#bdiToast,.sw-toast').forEach(e=>e.remove()));await p.waitForTimeout(100);const box=await (await p.$('#bdiTab_issues')).boundingBox();await p.screenshot({path:__dirname+'/did/issues_dep.png',clip:{x:box.x,y:box.y,width:box.width,height:Math.min(box.height,1150)}});
 // hiz: 60 gun in-house gecmisi x 150 oda, 40 acik issue
 const T=await p.evaluate(()=>{const KV=__ev('BdiKV');const inh=JSON.parse(KV.get('bdi_inh_v1'));for(let i=3;i<63;i++){const d=new Date(Date.UTC(2026,10,3-i)).toISOString().slice(0,10);inh.days[d]={at:Date.parse(d+'T23:00:00'),rows:Array.from({length:150},(_,k)=>({room:String(200+k).padStart(4,'0'),name:'Guest'+k+',Person'+i+',Mr.',arr:d,dep:d,acc:[]}))}}
   KV.set('bdi_inh_v1',JSON.stringify(inh));__ev('bdiDayHistReset()');const L=__ev('bdiGetIssuesAll')();for(let k=0;k<40;k++)L.push({id:'perf'+k,room:k%3?String(300+k):'',guest:'Perf Guest'+k+' Tester',concern:'x',createdAt:Date.now()-k*36e5,u:1,events:[]});__ev('BdiKV').set(__ev('BDI_ISSUES_KEY'),JSON.stringify(L));
   const t0=performance.now();__ev('renderBdiIssues()');const t1=performance.now();__ev('swWarnCollect')();const t2=performance.now();return [Math.round(t1-t0),Math.round(t2-t1)]});
 ok(T[0]<1500&&T[1]<1500,'hız: 48 açık issue, 60 günlük geçmiş: liste '+T[0]+' ms, uyarılar '+T[1]+' ms');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
