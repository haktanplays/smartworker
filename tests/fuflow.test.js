const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000},deviceScaleFactor:1.5,acceptDownloads:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('SW: '+e.message));let prm=[];p.on('dialog',d=>d.type()==='prompt'?d.accept(prm.shift()||''):d.accept());
 await p.clock.install({time:new Date('2026-11-03T09:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-03');localStorage.setItem('sw_dayfix','2026-11-03');localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus','Onur Kaya']))});
 await p.reload();await p.waitForTimeout(1300);
 const T=h=>new Date('2026-11-03T'+h+':00+03:00').getTime();
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();const at=(d,h)=>new Date(d+'T'+h+':00+03:00').getTime();
   const Rw=(room,name,arr,dep,dt)=>({room,name,arr,dep,depTime:dt||'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-02',at:at('2026-11-02','23:00'),file:'g.pdf',rows:[Rw('1203','Morel,Claire,Ms.','2026-10-30','2026-11-03','11:00'),Rw('0901','Brodan,Kresimir,Mr.','2026-10-31','2026-11-05'),Rw('1808','De Gramont,Armand,Mr.','2026-10-25','2026-11-08'),Rw('1505','Lopez,Maria,Mrs.','2026-10-29','2026-11-06'),Rw('1601','Old,Guest,Mr.','2026-10-28','2026-11-03'),Rw('0707','Vale,Nina,Ms.','2026-10-30','2026-11-07')]}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');
   KV.set('bdi_dep_v1',JSON.stringify({days:{'2026-11-03':{at:at('2026-11-03','08:45'),file:'d.pdf',rows:[{room:'1601',name:'Old,Guest,Mr.',arr:'2026-10-28',dep:'2026-11-03',st:'CKOT',time:'08:30'}]}}}));__ev('_bdiDepAll=null');__ev('bdiDayHistReset()');
   const I=(id,room,g,c,cr,ev,x)=>Object.assign({id,room,guest:g,concern:c,createdAt:cr,u:1,events:[{id:id+'e',ts:cr,type:'import'}].concat(ev||[])},x||{});
   __ev('bdiSaveIssues')([
     I('iA','1203','Claire Morel','Noise from the corridor at night. Needs follow-up to ensure guest satisfaction.',at('2026-11-03','07:00')),
     I('iB','0901','Kresimir Brodan','AC was not cooling; Engineering fixed it. Follow-up is required tomorrow to ensure guest satisfaction.',at('2026-11-02','18:00')),
     I('iC','1808','Armand De Gramont','Late laundry. Follow up is required. Issue updated by Butler Service**Butler delivered the laundry and apologised. No need to follow up.',at('2026-11-02','12:00')),
     I('iD','1505','Maria Lopez','Minibar was not refilled; Housekeeping refilled it.',at('2026-11-03','06:30'),[{id:'iDc',ts:at('2026-11-03','08:00'),type:'close',butler:'',src:'report'}]),
     I('iE','1601','Old Guest','Shower drain slow. Needs follow-up.',at('2026-11-02','20:00')),
     I('iF','0707','Nina Vale','Pillow request. Needs follow-up.',at('2026-11-03','07:30'),[{id:'iFc',ts:at('2026-11-03','08:10'),type:'close',butler:'',src:'manual'},{id:'iFn',ts:at('2026-11-03','08:10'),type:'nocontact',butler:'',by:'mgmt',text:'',src:'manual'}])]);
   __ev('showPage("didit")');__ev('switchBdiTab("fu")')});
 await p.waitForTimeout(300);
 const items=()=>p.evaluate(()=>{__ev('bdiFuSweep')();const o=__ev('bdiFuAll')();return Object.keys(o).map(k=>({id:k,kind:o[k].kind,st:o[k].st,due:__ev('bdiFmtTs')(o[k].due),why:o[k].dueWhy,via:o[k].doneVia||'',by:o[k].doneBy||'',s:__ev('bdiFuState')(o[k]).s,late:__ev('bdiFuState')(o[k]).late}))});
 let A=await items();console.log('  '+A.map(x=>x.id+' '+x.kind+' '+x.due+' ('+x.why+') '+x.s).join('\n  '));
 const g=id=>A.find(x=>x.id===id)||{};
 ok(g('fu_is_iA').due==='03.11.2026 10:00'&&/çıkışından 1 saat önce/.test(g('fu_is_iA').why),'1203 (bugün 11:00 çıkıyor): son saat 10:00, "misafirin çıkışından 1 saat önce"');
 ok(g('fu_is_iB').due==='03.11.2026 10:00'&&/tomorrow/.test(g('fu_is_iB').why),'0901: metindeki "tomorrow" -> 03.11 10:00');
 ok(!g('fu_cf_iD').id&&!g('fu_is_iD').id,'1505: kaynak kapattı -> takip açılmadı (eskiden memnuniyet teyidi açılıyordu)');
 ok(!g('fu_is_iC').id&&!g('fu_is_iE').id&&!g('fu_is_iF').id&&!g('fu_cf_iC').id,'açılmayanlar: son metin "no need" (1808), misafir çıkmış (1601), yönetim temassız kapatmış (0707)');
 // tab
 const tab1=await p.evaluate(()=>({badge:document.getElementById('bdiFuTabCount').textContent,grp:[...document.querySelectorAll('#bdiFuPanel .bd-fu-grp h4')].map(h=>h.textContent.replace(/\s+/g,' ').trim()),rows:[...document.querySelectorAll('#bdiFuPanel .bd-fu-grp .bd-fu-line')].map(r=>r.textContent.replace(/\s+/g,' ').trim())}));
 console.log('  satırlar: '+tab1.rows.join(' || '));
 ok(tab1.badge==='2'&&tab1.grp.join('|')==='Bugün 2'&&/^10:00 ?1203 ?Claire Morel/.test(tab1.rows[0])&&/bugün çıkıyor 11:00/.test(tab1.rows[0]),'Takip sekmesi: rozet 2, "Bugün 2", tek satır: saat · oda · misafir · iş · "bugün çıkıyor 11:00" ('+tab1.grp.join('|')+')');
 // gecikme
 await p.clock.setFixedTime(new Date('2026-11-03T10:30:00+03:00'));
 const W=await p.evaluate(()=>__ev('swWarnCollect')().filter(x=>x.g==='Takip').map(x=>x.sev+'|'+x.t));console.log('  '+W.join('\n  '));
 ok(W.some(x=>/^high\|Oda 1203 Claire Morel: takip gecikti \(son saat bugün 10:00\)/.test(x))&&W.some(x=>/^high\|Oda 0901 Kresimir Brodan: takip gecikti/.test(x))&&W.some(x=>/^mid\|Oda 1505 Maria Lopez: takibin son saati yaklaşıyor/.test(x)===false),'Uyarılar > Takip: 1203 ve 0901 gecikti (kırmızı)');
 await p.evaluate(()=>{__ev('switchBdiTab("issues")');__ev('bdiIssueSetFilter("all")');__ev('_bdiIssueOpen.iA=true');__ev('renderBdiIssues()')});
 const IC=await p.evaluate(()=>({pill:[...document.querySelectorAll('#bdiIs_iA .bd-issue-meta .bd-pill')].map(x=>x.textContent).join('|'),sec:(document.querySelector('#bdiIs_iA .bd-isfu')||{}).textContent||''}));
 ok(/Takip gecikti · bugün 10:00/.test(IC.pill)&&/gecikti Issue takibi: Noise/.test(IC.sec.replace(/\s+/g,' '))&&/\+ takip ekle/.test(IC.sec),'issue kartında "Takip gecikti · bugün 10:00" etiketi ve Takip bölümü');
 // butler issue'ya dokundu -> takip kendiliginden kapanir (gec)
 await p.evaluate(()=>{const L=__ev('bdiGetIssues')(),is=__ev('bdiIssueById')(L,'iB');is.events.push({id:'iBt',ts:Date.now(),type:'touch',butler:'Onur Kaya',text:'Called the guest, all fine now'});__ev('bdiSaveIssues')(L)});
 // kaynakta memnun -> teyit kapanir
 await p.evaluate(()=>{const L=__ev('bdiGetIssues')(),is=__ev('bdiIssueById')(L,'iD');is.sat='Satisfied';__ev('bdiSaveIssues')(L)});
 A=await items();
 ok(g('fu_is_iB').id&&A.find(x=>x.id==='fu_is_iB').st==='done'&&A.find(x=>x.id==='fu_is_iB').via==='issue'&&A.find(x=>x.id==='fu_is_iB').by==='Onur Kaya'&&A.find(x=>x.id==='fu_is_iB').late===true,'0901: Onur Kaya issue\'ya dokununca takip kendiliğinden "yapıldı" (geç: 10:30 > 10:00)');
 
 // elle takip ekle
 await p.evaluate(()=>{__ev('switchBdiTab("fu")')});
 await p.fill('#bdiFuQ','1808 yarın 10:00 Confirm the airport transfer for tomorrow morning');await p.press('#bdiFuQ','Enter');await p.waitForTimeout(200);
 A=await items();const man=A.find(x=>x.kind==='manual');
 ok(man&&man.due==='04.11.2026 10:00'&&await p.evaluate(id=>__ev('bdiFuAll')()[id].guest+'|'+__ev('bdiFuAll')()[id].t,man.id)==='Armand De Gramont|Confirm the airport transfer for tomorrow morning','tek kutudan takip: "1808 yarın 10:00 ..." -> misafir adı odadan geldi, son saat yarın 10:00');
 // rehber (mobil)
 const data=await p.evaluate(()=>__ev('bgdBuild')('2026-11-03'));
 console.log('  rehber takipleri: '+data.follows.map(f=>f.room+' '+f.t.slice(0,30)+' gid='+f.gid).join(' | '));
 const fA=data.follows.find(f=>f.id==='fu_is_iA');
 ok(data.follows.length===2&&fA&&fA.gid&&data.guests.some(x=>x.id===fA.gid&&x.room==='1203')&&data.follows.some(f=>f.room==='1808'),'rehbere 2 açık takip girdi (1203 issue takibi + 1808 transfer), misafir kartına bağlı');
 const html=await p.evaluate(d=>__ev('bgdHtml')(d),data);fs.writeFileSync(__dirname+'/guide_fu.html',html);
 const ip=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:820,height:1180},deviceScaleFactor:2,acceptDownloads:true});
 await ip.addInitScript(()=>{localStorage.setItem('bgd_me',JSON.stringify('Deniz Karavus'))});
 const gp=await ip.newPage();gp.on('pageerror',e=>errs.push('IPAD: '+e.message));
 await gp.clock.install({time:new Date('2026-11-03T10:40:00+03:00')});await gp.goto('file://'+__dirname+'/guide_fu.html');await gp.waitForTimeout(400);
 const G1=await gp.evaluate(()=>({tab:document.querySelector('.tab[data-tab="firsat"]').textContent,badge:[...document.querySelectorAll('.gc')].filter(c=>/1203/.test(c.textContent)).map(c=>[...c.querySelectorAll('.bd.fu')].map(b=>b.textContent+'|'+b.className).join())[0]}));
 ok(/^Takip · Fırsat2/.test(G1.tab)&&/Takip: 1\|bd fu late/.test(G1.badge),'iPad: sekme "Takip · Fırsat 2", 1203 kartında kırmızı "Takip: 1" ('+G1.badge+')');
 await gp.click('.tab[data-tab="firsat"]');await gp.waitForTimeout(150);
 const G2=await gp.evaluate(()=>[...document.querySelectorAll('.opp.fu')].map(o=>o.textContent.replace(/\s+/g,' ')));console.log('  iPad: '+G2.join(' || '));
 ok(G2.length===2&&/gecikti · bugün 10:00 · 1203 · Claire Morel/.test(G2[0]),'iPad "Takipler": geciken üstte, son saat + oda + misafir');
 await gp.screenshot({path:__dirname+'/did/ipad_fu.png'});
 await gp.click('.opp.fu >> nth=0 >> button:has-text("Yaptım")');await gp.waitForTimeout(200);
 await gp.click('.tab[data-tab="kayit"]');await gp.waitForTimeout(100);await gp.click('.lrow >> nth=0 >> button:has-text("Not")');await gp.fill('#tTxt','Visited the guest, apologised for the noise');await gp.click('button[data-x="saveTnote"]');await gp.waitForTimeout(100);
 const dl1=gp.waitForEvent('download');await gp.click('#sendBtn');const d1=await dl1;const j1=__dirname+'/fu_ret1.json';await d1.saveAs(j1);const txt1=fs.readFileSync(j1,'utf8');
 const IM=await p.evaluate(async t=>{const r=await __ev('bgdImportObj')(JSON.parse(t),'r1.json');const f=__ev('bdiFuAll')()['fu_is_iA'];const is=__ev('bdiIssueById')(__ev('bdiGetIssues')(),'iA');const logs=__ev('loadBdiArrayForDate')('2026-11-03').filter(l=>l.meta&&l.meta.issueId==='iA');
   const r2=await __ev('bgdImportObj')(JSON.parse(t),'r1-again.json');return {sum:__ev('bgdSummary')(r),st:f.st,via:f.doneVia,by:f.doneBy,txt:f.doneText,iev:is.events.filter(e=>/^bgd_/.test(e.id)).length,logs:logs.map(l=>l.butler+'|'+l.action+'|'+l.note),sum2:__ev('bgdSummary')(r2),logs2:__ev('loadBdiArrayForDate')('2026-11-03').filter(l=>l.meta&&l.meta.issueId==='iA').length}},txt1);
 console.log('  içe alma: '+IM.sum+' / ikinci kez: '+IM.sum2);
 ok(IM.st==='done'&&IM.via==='ipad'&&IM.by==='Deniz Karavus'&&IM.txt==='Visited the guest, apologised for the noise'&&IM.iev===1&&IM.logs.length===1&&/Deniz Karavus\|Issue Follow-up\|Visited the guest/.test(IM.logs[0]),'iPad dönüşü: takip "yapıldı" (Deniz, iPad, not), issue geçmişine ve Butler Did It\'e touch');
 ok(/1 takip/.test(IM.sum)&&IM.logs2===1,'aynı dosya ikinci kez: çift kayıt yok');
 // iPad'den geri alma
 const UNDO=await p.evaluate(async t=>{const o=JSON.parse(t);const fe=o.events.find(e=>e.type==='fu');o.events=[{id:'u1',type:'undo',ref:fe.id,t:new Date().toISOString(),by:'Deniz Karavus'}];await __ev('bgdImportObj')(o,'undo.json');const f=__ev('bdiFuAll')()['fu_is_iA'];return {st:f.st,logs:__ev('loadBdiArrayForDate')('2026-11-03').filter(l=>l.meta&&l.meta.issueId==='iA').length,iev:__ev('bdiIssueById')(__ev('bdiGetIssues')(),'iA').events.filter(e=>/^bgd_/.test(e.id)).length}},txt1);
 ok(UNDO.st==='open'&&UNDO.logs===0&&UNDO.iev===0,'iPad\'den geri alınınca takip yeniden açık, touch ve issue kaydı silindi');
 // masaustu: Yapildi (elle takip)
 await p.evaluate(()=>{__ev('switchBdiTab("fu")');__ev('renderBdiFu()')});
 await p.evaluate(id=>__ev('bdiFuRowToggle')(id),man.id);await p.selectOption('#bdiFuEo_'+man.id,'Onur Kaya');await p.click('#bdiFuPanel .bd-fu-ed button:has-text("Kaydet")');await p.waitForTimeout(100);
 await p.click('#bdiFuPanel .bd-fu-row:has(.bd-fu-room:text-is("1808")) .bd-fu-chk');await p.waitForTimeout(200);
 const MD=await p.evaluate(id=>{const f=__ev('bdiFuAll')()[id];const l=__ev('loadBdiArrayForDate')('2026-11-03').find(x=>x.id===f.doneLog);return {st:f.st,late:__ev('bdiFuState')(f).late,log:l?l.action+'|'+l.sentence:''}},man.id);
 ok(MD.st==='done'&&!MD.late&&/^Follow-up\|Butler Onur Kaya followed up with our guest Armand De Gramont staying at Room 1808 on: Confirm the airport transfer for tomorrow morning\.$/.test(MD.log),'kutucuk = yapıldı: zamanında, kimdeyse (Onur) onun adına Butler Did It cümlesi: '+MD.log.split('|')[1]);
 // misafir cikti -> kacti
 await p.clock.setFixedTime(new Date('2026-11-03T11:30:00+03:00'));
 await p.evaluate(()=>{const KV=__ev('BdiKV'),st=JSON.parse(KV.get('bdi_dep_v1'));st.days['2026-11-03'].rows.push({room:'1203',name:'Morel,Claire,Ms.',arr:'2026-10-30',dep:'2026-11-03',st:'CKOT',time:'11:05'});st.days['2026-11-03'].at=Date.now();KV.set('bdi_dep_v1',JSON.stringify(st));__ev('_bdiDepAll=null');__ev('bdiDayHistReset()');__ev('renderBdiFu()')});
 A=await items();ok(A.find(x=>x.id==='fu_is_iA').s==='missed','1203 takip yapılmadan çıktı -> "Kaçtı"');
 // rapor
 const H=await p.evaluate(()=>window.__t.capture(function(){__ev('bdiFuSetRange')('f','2026-11-03');__ev('bdiFuSetRange')('t','2026-11-04');return __ev('downloadFuReport()')}));
 const RP=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return {sum:[...d.querySelectorAll('.summary .item')].map(i=>i.querySelector('.lbl').textContent+'='+i.querySelector('.num').textContent).join(', '),secs:[...d.querySelectorAll('.isec h2')].map(x=>x.textContent).join(' | '),bsum:[...d.querySelectorAll('.bsum tbody tr')].map(r=>r.textContent.replace(/\s+/g,' ')).join(' | ')}},H);
 console.log('  rapor: '+RP.sum+'\n  bölümler: '+RP.secs+'\n  butler: '+RP.bsum);
 ok(/Follow-ups=3/.test(RP.sum)&&/Done on Time=1/.test(RP.sum)&&/Done Late=1/.test(RP.sum)&&/Guest Left Before Follow-up=1/.test(RP.sum)&&RP.secs==='Guest Left Before Follow-up | Done Late | Done on Time','rapor: 3 takip · 1 zamanında · 1 geç · 1 misafir çıktı; bölümler doğru');
 // senkron (ortak klasor)
 const SY=await p.evaluate(async()=>{let content='';const fh={getFile:async()=>({text:async()=>content}),createWritable:async()=>({write:async t=>{content=t},close:async()=>{}})};await __ev('_bdiExtSyncFile')({getFileHandle:async()=>fh});const o=JSON.parse(content);
   const remote=JSON.parse(JSON.stringify(o));const mid=Object.keys(remote.fu).find(k=>/^fu_m_/.test(k));remote.fu[mid].doneText='changed elsewhere';remote.fu[mid].u=Date.now()+5000;content=JSON.stringify(remote);await __ev('_bdiExtSyncFile')({getFileHandle:async()=>fh});
   return {n:Object.keys(o.fu||{}).length,merged:__ev('bdiFuAll')()[mid].doneText}});
 ok(SY.n===3&&SY.merged==='changed elsewhere','ortak klasör senkronu: takipler dosyaya yazıldı, diğer bilgisayardaki yeni değişiklik alındı');
 await p.evaluate(()=>{__ev('renderBdiFu()')});await p.waitForTimeout(100);
 await (await p.$('#bdiTab_fu')).screenshot({path:__dirname+'/did/fu_tab.png'});
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
