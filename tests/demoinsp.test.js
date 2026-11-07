// Demo: inspection ornekleri (eksik + ENG takibi + girilemedi) gercek veriye dokunmadan gorunur
const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const d=await (await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:900}})).newPage();d.on('dialog',x=>x.accept());const errs=[];d.on('pageerror',e=>errs.push(e.message));
 await d.clock.install({time:new Date('2026-11-06T15:30:00+03:00')});await d.goto('file://'+__dirname+'/t/SmartWorker3.html?demo');
 await d.waitForFunction(()=>sessionStorage.getItem('swdemo:__seeded'),null,{timeout:120000});await d.waitForLoadState('load');await d.waitForTimeout(4000);
 const R=await d.evaluate(()=>{const T=__ev('getToday()'),L=__ev('loadBdiArrayForDate')(T),pr=__ev('bdiGetPrep')()[T]||{};
   return {ins:L.filter(l=>l.insp&&l.insp.length).map(l=>l.room+'|'+l.butler+'|'+l.insp.map(i=>i.t+':'+i.b).join(',')),fu:__ev('bdiFuList')().filter(f=>f.kind==='insp').map(f=>f.room+'|'+f.t+'|'+f.owner+'|'+f.st),na:Object.keys(pr).filter(k=>/^na:/.test(k)).map(k=>k+'|'+pr[k].why+'|'+pr[k].by)}});
 console.log('  '+JSON.stringify(R));
 ok(R.ins.length===1&&/Su ve minibar:0,Arıza: ışık, klima, TV:1$/.test(R.ins[0]),'demo: bir odada inspection eksiği (biri düzeltildi, biri ENG)');
 ok(R.fu.length===1&&/ENG: Arıza: ışık, klima, TV \(inspection\)\|Selin Kaya\|open$/.test(R.fu[0]),'demo: Takip Defteri\'nde ENG bildirimi (Selin Kaya)');
 ok(R.na.length===1&&/Rahatsız etmeyin \(DND\)\|Selin Kaya$/.test(R.na[0]),'demo: bir oda girilemedi (DND)');
 await d.evaluate(()=>{__ev('showPage("didit")');(__ev('_bdiBriefMode="feed"'),__ev('switchBdiTab("brief")'));__ev('_bdiFeedGrp').inh=1;__ev('bdiFeedRefresh()')});await d.waitForTimeout(600);
 const F=await d.evaluate(()=>{const t=(document.getElementById('bdiBriefBody')||{}).textContent||'';return (/inspection \d+\/\d+( · \d+ odada eksik)?( · \d+ girilemedi)?/.exec(t.replace(/\s+/g,' '))||[''])[0]});
 ok(/· 1 odada eksik · 1 girilemedi$/.test(F),'demo Günün akışı › Oteldekiler: "'+F+'"');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs.slice(0,3)));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
