// Inhouse inspection (2026-11-06): Kat turu + iPad rehberi -> eksik (duzelttim / departmana bildir), girilemedi, donus, geri al
const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-06T11:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-06');localStorage.setItem('sw_dayfix','2026-11-06');localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus','Onur Kaya']));localStorage.setItem('bdi_me','Deniz Karavus')});
 await p.reload();await p.waitForTimeout(1300);
 const T='2026-11-06';
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const Rw=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-06',at:Date.now(),file:'g.pdf',rows:[Rw('1203','Morel,Claire,Ms.','2026-11-03','2026-11-09'),Rw('1406','Meyer,Anna,Mrs.','2026-11-02','2026-11-09'),Rw('2001','Mardanov,Ilyar,Mr.','2026-11-04','2026-11-09'),Rw('1802','Sato,Kenji,Mr.','2026-11-02','2026-11-09')]}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()');
   await __ev('bdiGMLoad')();const GM=__ev('_bdiGM'),gid=__ev('bdiGMGid')(__ev('bdiGuestKey')('Ilyar Mardanov'));
   GM.dna=GM.dna||{};GM.dna[gid]={addr:null,items:{t1:{sec:'delight',t:'Guest prefers Coca Cola Zero in the minibar',dept:'PBR',by:'',at:0,u:Date.now(),src:'protel',imp:'2026-11-05',nm:'Ilyar Mardanov',rm:'2001'}}};
   await __ev('_gmPutMeta')('dna',GM.dna);__ev('_bdiGMProf=null');KV.set('bdi_floors_v1',JSON.stringify({'2026-11-06':{blocks:[{from:12,to:20,butler:'Deniz Karavus'}],u:Date.now()}}))}); // kat dagilimi: 12-20 Deniz
 // ---- Ayarlar: varsayilan listeler ----
 const C=await p.evaluate(()=>({std:__ev('bdiInspStd')().map(i=>i.t+'|'+i.en+'|'+i.d).join(' ; '),na:__ev('bdiInspNaOpts')().map(o=>o.l).join(' ; ')}));
 console.log('  '+JSON.stringify(C));
 ok(/Arıza: ışık, klima, TV\|lights, air conditioning, TV\|ENG/.test(C.std)&&/Su ve minibar\|water and minibar\|PBR/.test(C.std),'Ayarlar: standart liste (TR madde, İngilizce rapor karşılığı, departman: ENG / PBR / HSK)');
 ok(C.na==='Rahatsız etmeyin (DND) ; Misafir odada ; HSK servisi bekleniyor','Ayarlar: girilemedi nedenleri');
 await p.evaluate(()=>{__ev('showPage("settings")')});await p.waitForTimeout(400);
 const SET=await p.evaluate(()=>{const R=k=>[...document.querySelectorAll('#'+k+' .bdicfg-r')].filter(r=>{const i=r.querySelector('input');return i&&i.value.trim()});return {n:R('bdiCfg_insp').length,sel:R('bdiCfg_insp').map(r=>r.querySelector('select').value).join(','),na:R('bdiCfg_inspna').length}});
 ok(SET.n===5&&SET.sel==='HSK,PBR,HSK,HSK,ENG'&&SET.na===3,'Ayarlar ekranında "Inhouse inspection" bölümü: 5 madde (departman seçili), 3 neden '+JSON.stringify(SET));
 // ---- SmartWorker Kat turu ----
 const K1=await p.evaluate(()=>{const x=__ev('bdiKatRooms')()['2001'];return __ev('bdiKatInspItems')(x).map(i=>i.t+'|'+i.d+'|'+(i.g?'g':'s'))});
 console.log('  2001 maddeleri: '+K1.join(' ; '));
 ok(/^Coca Cola Zero in the minibar\|PBR\|g$/.test(K1[0])&&K1.length===6,'2001: önce misafire özel madde (journal tercihi, PBR), sonra 5 standart madde');
 await p.evaluate(()=>{__ev('bdiKatInspect')('1203')});
 await p.evaluate(()=>{__ev('bdiKatPanel')('2001','miss');__ev('bdiKatPanelTap')(0);__ev('bdiKatPanelTap')(5);__ev('bdiKatPanelTap')(5);__ev('bdiKatPanelNote')('Guest asked for two more bottles');__ev('bdiKatMissSave')('2001')});
 await p.evaluate(()=>{__ev('bdiKatPanel')('1802','na');__ev('bdiKatNa')('1802',0)});
 const S1=await p.evaluate(T=>{const L=__ev('loadBdiArrayForDate')(T);const fu=__ev('bdiFuList')().filter(f=>f.kind==='insp');const na=__ev('bdiInspNaGet')(T,'1802');
   return {logs:L.map(l=>l.room+'|'+l.action+'|'+l.butler+'|'+(l.note||'')+'|'+(l.insp?l.insp.length:0)),fu:fu.map(f=>f.room+'|'+f.t+'|'+f.owner+'|'+f.st+'|'+f.dueWhy),na:na&&(na.why+'|'+na.by+'|'+na.en)}},T);
 console.log('  '+JSON.stringify(S1,null,1));
 ok(S1.logs.some(l=>/^1203\|Room Inspection\|Deniz Karavus\|\|0$/.test(l)),'Inspection ✓ (1203): Butler Did It\'e "Room Inspection" touch\'ı');
 ok(S1.logs.some(l=>l==='2001|Room Inspection|Deniz Karavus|Missing: Coca Cola Zero in the minibar (fixed); lights, air conditioning, TV (reported to ENG). Guest asked for two more bottles|2'),'Eksik var (2001): 1 dokunuş düzelttim + 2 dokunuş ENG\'e bildir; İngilizce "Missing: …" notu');
 ok(S1.fu.length===1&&/^2001\|ENG: Arıza: ışık, klima, TV \(inspection\)\|Deniz Karavus\|open\|inspection: 4 saat$/.test(S1.fu[0]),'bildirilen madde Takip Defteri\'ne düştü: "ENG: Arıza … (inspection)", sahibi Deniz, 4 saat');
 ok(S1.na==='Rahatsız etmeyin (DND)|Deniz Karavus|Do Not Disturb was on','Girilemedi (1802): DND kaydı (kim, neden, İngilizce karşılığı)');
 ok(!S1.logs.some(l=>/^1802\|/.test(l)),'girilemedi inspection SAYILMADI (1802 için touch yok)');
 // feed (Gunun akisi > Oteldekiler)
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("brief")');try{__ev('bdiBriefSetMode("feed")')}catch(e){}});await p.waitForTimeout(500);
 await p.evaluate(()=>{__ev('_bdiFeedGrp').inh=1;__ev('bdiFeedRefresh()')});await p.waitForTimeout(300);
 const F=await p.evaluate(()=>{const b=document.getElementById('bdiBriefBody');const t=b?b.textContent.replace(/\s+/g,' '):'';const m=/inspection \d+\/\d+[^.]*?(girilemedi)?(?= Kat|$)/.exec(t);return {line:(/inspection \d+\/\d+( · \d+ odada eksik)?( · \d+ girilemedi)?/.exec(t)||[''])[0],r2001:/2001 Mr. Ilyar Mardanov.*?✓ inspection · 2 eksik/.test(t),r1802:/1802 Mr. Kenji Sato.*?girilemedi/.test(t)}});
 console.log('  feed: '+JSON.stringify(F));
 ok(F.line==='inspection 2/4 · 1 odada eksik · 1 girilemedi'&&F.r2001&&F.r1802,'Günün akışı › Oteldekiler: "inspection 2/4 · 1 odada eksik · 1 girilemedi", satırlarda "2 eksik" / "girilemedi"');
 // oda karti: panel acik ekran goruntusu (1406)
 await p.evaluate(()=>{__ev('bdiKatPanel')('1406','miss');__ev('bdiKatPanelTap')(1);__ev('bdiKatPanelTap')(4);__ev('bdiKatPanelTap')(4)});
 await p.evaluate(()=>{__ev('bdiFeedToggle')('h:1406')});
 await p.waitForTimeout(300);
 const pn=await p.$('#bdiBriefBody .bd-kt-pn');ok(!!pn,'Eksik var paneli oda kartının içinde açılıyor');
 if(pn){const room=await pn.evaluateHandle(e=>e.closest('.bd-kt-room'));await room.asElement().screenshot({path:__dirname+'/ui/insp_kat.png'})}
 await p.evaluate(()=>__ev('bdiKatPanelClose')());
 // Didn't Do It ipucu
 const NT=await p.evaluate(T=>{const L=__ev('bdiNtList')(T);const r=L&&L.rows.filter(g=>g.rooms.indexOf('1802')>=0);return r&&r.length?__ev('bdiNtRowsHtml')(T,r,true).replace(/<[^>]+>/g,' ').replace(/\s+/g,' '):'(1802 listede yok)'},T);
 ok(/Kat turu: girilemedi · Rahatsız etmeyin \(DND\) · 11:00 · Deniz Karavus/.test(NT),'Butler Didn\'t Do It: 1802 satırında "Kat turu: girilemedi · DND" ipucu');
 // geri al: bildirim de kalkar
 const U=await p.evaluate(T=>{const L=__ev('loadBdiArrayForDate')(T);const l=L.find(x=>x.room==='2001');__ev('bdiKatUndo')(l.id);return __ev('bdiFuList')().filter(f=>f.kind==='insp').length+'|'+__ev('loadBdiArrayForDate')(T).filter(x=>x.room==='2001').length},T);
 ok(U==='0|0','Kat turu geri al: touch ve açık ENG takibi birlikte kalktı');
 // ---- iPad rehberi ----
 const data=await p.evaluate(T=>__ev('bgdBuild')(T),T);
 const g2001=data.guests.find(g=>g.room==='2001');
 ok(data.insp.length===5&&data.inspNa.length===3&&g2001&&g2001.ins&&g2001.ins[0].t==='Coca Cola Zero in the minibar'&&g2001.ins[0].d==='PBR','rehber verisi: standart liste + nedenler + 2001\'in misafire özel maddesi (PBR)');
 const html=await p.evaluate(d=>__ev('bgdHtml')(d),data);fs.writeFileSync(__dirname+'/guide_insp.html',html);
 const ip=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:820,height:1180},deviceScaleFactor:2,acceptDownloads:true});
 await ip.addInitScript(()=>{localStorage.setItem('bgd_me',JSON.stringify('Deniz Karavus'))});
 const gp=await ip.newPage();gp.on('pageerror',e=>errs.push('IPAD: '+e.message));
 await gp.clock.install({time:new Date('2026-11-06T13:20:00+03:00')});await gp.goto('file://'+__dirname+'/guide_insp.html');await gp.waitForTimeout(400);
 const open=async room=>{await gp.click('.chip[data-floor="all"]').catch(()=>{});await gp.waitForTimeout(80);const id=await gp.evaluate(r=>{const g=window.__bg.guests().list.find(x=>x.room===r);return g&&g.id},room);const c=await gp.$('#c_'+id+' .gb');if(!c)await gp.click('#c_'+id+' .gh');await gp.waitForTimeout(100);return id};
 const id2001=await open('2001');
 const sec=await gp.evaluate(id=>document.querySelector('#c_'+id+' .gb').textContent.replace(/\s+/g,' '),id2001);
 ok(/Her odada: Düzen ve temizlik · Su ve minibar/.test(sec)&&/Girilemedi/.test(sec)&&/Eksik var/.test(sec)&&/Inspection ✓/.test(sec),'iPad kartı: "Her odada: …" + Girilemedi · Eksik var · Inspection ✓');
 await gp.click('#c_'+id2001+' button[data-act="miss"]');await gp.waitForTimeout(150);
 const chips=await gp.$$eval('#sc [data-mi]',b=>b.map(x=>x.textContent));
 ok(chips[0]==='Coca Cola Zero in the minibar'&&chips.length===6,'iPad "Eksik var": misafire özel madde en üstte + 5 standart');
 await gp.click('#sc [data-mi="0"]');await gp.click('#sc [data-mi="5"]');await gp.click('#sc [data-mi="5"]');await gp.waitForTimeout(80);
 const chips2=await gp.$$eval('#sc [data-mi]',b=>b.map(x=>x.textContent+'|'+x.className));
 ok(/düzelttim ✓\|opt on$/.test(chips2[0])&&/→ ENG\|opt rep$/.test(chips2[5]),'1 dokunuş "düzelttim ✓" (yeşil), 2 dokunuş "→ ENG" (kırmızı)');
 await gp.screenshot({path:__dirname+'/ui/insp_ipad.png'});
 await gp.click('#sc button[data-x="saveMiss"]');await gp.waitForTimeout(150);
 const id1802=await open('1802');
 await gp.click('#c_'+id1802+' button[data-act="na"]');await gp.waitForTimeout(100);await gp.click('#sc button[data-x="saveNa"][data-na="0"]');await gp.waitForTimeout(150);
 const id1406=await open('1406');await gp.click('#c_'+id1406+' button[data-a="Room Inspection"]');await gp.waitForTimeout(150);
 const B=await gp.evaluate(ids=>ids.map(id=>[...document.querySelectorAll('#c_'+id+' .gh .bd')].map(b=>b.textContent).join(',')),[id2001,id1802,id1406]);
 console.log('  iPad rozetleri: '+JSON.stringify(B));
 ok(/Inspection ✓/.test(B[0])&&/Girilemedi/.test(B[1])&&/Inspection ✓/.test(B[2]),'iPad rozetleri: 2001 Inspection ✓, 1802 Girilemedi, 1406 Inspection ✓');
 await gp.click('.tab[data-tab="kayit"]');await gp.waitForTimeout(100);
 const LG=await gp.$$eval('.lrow .w',r=>r.map(x=>x.textContent));console.log('  Kayıtlarım: '+LG.join(' || '));
 ok(LG.some(t=>/^Girilemedi: Rahatsız etmeyin \(DND\)/.test(t))&&LG.some(t=>/Room Inspection \(Missing: Coca Cola Zero in the minibar \(fixed\); lights, air conditioning, TV \(reported to ENG\)\)/.test(t)),'Kayıtlarım: "Girilemedi: DND" ve "Room Inspection (Missing: …)"');
 const dl=gp.waitForEvent('download');await gp.click('#sendBtn');const d1=await dl;const jf=__dirname+'/insp_ret.json';await d1.saveAs(jf);const ret=fs.readFileSync(jf,'utf8');
 const IM=await p.evaluate(async t=>{const r=await __ev('bgdImportObj')(JSON.parse(t),'insp_ret.json');const r2=await __ev('bgdImportObj')(JSON.parse(t),'insp_ret (1).json');
   const T='2026-11-06',L=__ev('loadBdiArrayForDate')(T);return {sum:__ev('bgdSummary')(r),sum2:__ev('bgdSummary')(r2),log:L.filter(l=>l.room==='2001'&&l.source==='iPad').map(l=>l.note+'|'+(l.insp||[]).map(i=>i.t+':'+i.b).join(',')),fu:__ev('bdiFuList')().filter(f=>f.kind==='insp'&&f.st==='open').map(f=>f.room+'|'+f.t+'|'+f.owner),na:(__ev('bdiInspNaGet')(T,'1802')||{}).why,n1406:L.filter(l=>l.room==='1406'&&/Inspection/.test(l.action)).length}},ret);
 console.log('  dönüş: '+JSON.stringify(IM,null,1));
 ok(/^2 touch/.test(IM.sum)&&/1 inspection bildirimi \(takip\)/.test(IM.sum)&&/1 girilemedi/.test(IM.sum),'SmartWorker dönüşü aldı: "'+IM.sum+'"');
 ok(IM.log.length===1&&/^Missing: .*\(reported to ENG\)\|Coca Cola Zero in the minibar:0,Arıza: ışık, klima, TV:1$/.test(IM.log[0]),'2001 inspection: not + yapılandırılmış eksikler (düzelttim / bildir) SmartWorker\'da');
 ok(IM.fu.length===1&&IM.fu[0]==='2001|ENG: Arıza: ışık, klima, TV (inspection)|Deniz Karavus','iPad\'den bildirilen ENG eksiği Takip Defteri\'nde, sahibi Deniz');
 ok(IM.na==='Rahatsız etmeyin (DND)'&&IM.n1406===1,'1802 girilemedi (DND) ve 1406 Inspection ✓ geldi');
 ok(/yeni kayıt yok · \d+ kayıt zaten alınmıştı/.test(IM.sum2),'aynı dosya ikinci kez: hiçbir şey çift olmadı ("'+IM.sum2+'")');
 // iPad'den geri al (gonderilmeden once yapilan geri alma gibi): inspection + girilemedi geri alinir
 const UN=await p.evaluate(async t=>{const o=JSON.parse(t);const ins=o.events.find(e=>e.type==='touch'&&e.insp),na=o.events.find(e=>e.type==='insp');
   o.events=[{id:'u1',type:'undo',ref:ins.id,t:new Date().toISOString(),by:'Deniz Karavus'},{id:'u2',type:'undo',ref:na.id,t:new Date().toISOString(),by:'Deniz Karavus'}];await __ev('bgdImportObj')(o,'undo.json');
   const T='2026-11-06';return __ev('bdiFuList')().filter(f=>f.kind==='insp').length+'|'+__ev('loadBdiArrayForDate')(T).filter(l=>l.room==='2001'&&l.source==='iPad').length+'|'+!!__ev('bdiInspNaGet')(T,'1802')},ret);
 ok(UN==='0|0|false','iPad geri alma: inspection touch\'ı, ENG takibi ve girilemedi kaydı kalktı ('+UN+')');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
