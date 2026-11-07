// Takip ilgili yerleri tetikliyor mu (2026-11-05): her kaynak icin Ilgilenildi / Ilgilenilemedi sonucu
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-05T11:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-05');localStorage.setItem('sw_dayfix','2026-11-05');localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus','Onur Kaya']));localStorage.setItem('bdi_me','Deniz Karavus')});
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const Rw=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-05',at:Date.now(),file:'g.pdf',rows:[Rw('1203','Morel,Claire,Ms.','2026-11-03','2026-11-08'),Rw('1406','Meyer,Anna,Mrs.','2026-11-02','2026-11-07'),Rw('2001','Mardanov,Ilyar,Mr.','2026-11-04','2026-11-09'),Rw('1802','Sato,Kenji,Mr.','2026-11-02','2026-11-09')]}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()');
   __ev('bdiSaveIssues')([{id:'iA',room:'1203',guest:'Claire Morel',concern:'Noise from the corridor. Needs follow-up.',createdAt:Date.now()-2*36e5,u:1,events:[{id:'e1',ts:Date.now()-2*36e5,type:'import'}]}]);
   const L=__ev('bdiNtList')('2026-11-05');const r=L.rows.find(x=>x.rooms.indexOf('2001')>=0);__ev('bdiNtSet')('2026-11-05',r.gk,'r','Guest not in room');__ev('bdiNtSet')('2026-11-05',r.gk,'f:plan','Courtesy call');__ev('bdiNtSet')('2026-11-05',r.gk,'f:who','Onur Kaya');
   const A=__ev('alertList');A.length=0;A.push({roomNo:1406,guest:'Meyer, Anna',reasons:[{label:'VIP',detail:''}],visited:false,notVisitedReason:'Misafir odada değildi'});__ev('saveAlertSnapshot()');
   __ev('bdiFuSweep')();__ev('showPage("didit")');__ev('switchBdiTab("fu")')});
 await p.waitForTimeout(300);
 await p.fill('#bdiFuQ','1802 17:00 tekne saatini teyit et');await p.press('#bdiFuQ','Enter');await p.waitForTimeout(300);
 const F=await p.evaluate(()=>{const o=__ev('bdiFuAll')();const by=k=>Object.values(o).find(f=>f.kind===k&&f.st==='open');return {iss:by('issue').id,nt:by('nt').id,al:by('alert').id,man:by('manual').id}});
 console.log('  takipler: '+JSON.stringify(F));
 ok(F.iss&&F.nt&&F.al&&F.man,'dört kaynaktan takip var: issue, Didn\'t Do It planı, Butler Alert, elle');
 const fail=async(id,why)=>{await p.evaluate(()=>{__ev('_bdiFuOpenRow=""');__ev('renderBdiFu()')});await p.click('[id="bdiFu_'+id+'"] .bd-fu-line');await p.waitForTimeout(150);await p.selectOption('[id="bdiFuNr_'+id+'"]',{label:why});await p.click('#bdiFuPanel .bd-fu-ed button:has-text("İlgilenilemedi")');await p.waitForTimeout(300)};
 const done=async(id,note)=>{await p.evaluate(()=>{__ev('_bdiFuOpenRow=""');__ev('renderBdiFu()')});await p.click('[id="bdiFu_'+id+'"] .bd-fu-line');await p.waitForTimeout(150);if(note)await p.fill('[id="bdiFuDn_'+id+'"]',note);await p.click('#bdiFuPanel .bd-fu-ed button:has-text("İlgilenildi")');await p.waitForTimeout(400)};
 const S=()=>p.evaluate(F=>{const o=__ev('bdiFuAll')(),is=__ev('bdiIssueById')(__ev('bdiGetIssues')(),'iA'),T='2026-11-05',logs=__ev('loadBdiArrayForDate')(T);const al=__ev('alertList').find(a=>a.roomNo===1406);
   const nt=__ev('bdiNtList')(T).rows.some(r=>r.rooms.indexOf('2001')>=0);
   return {st:Object.fromEntries(Object.entries(F).map(([k,id])=>[k,o[id].st+':'+(o[id].tries||[]).length])),issue:__ev('bdiIssueState')(is).status+':'+is.events.length,issueTouch:(is.events.find(e=>e.type==='touch')||{}).text||'',
     alert:al.visited+':'+(al.visitedBy||'')+':'+(al.notVisitedReason||''),ntIn:nt,logs:logs.map(l=>l.room+'|'+l.action+'|'+l.butler+'|'+(l.note||'')),warn:__ev('swWarnCollect')().filter(x=>x.g==='Takip').length}},F);
 // --- 1) ilgilenilemedi: hicbir yer degismez ---
 await fail(F.iss,'Misafir odada değildi');await fail(F.nt,'Misafir uyuyordu');await fail(F.al,'Rahatsız etmeyin (DND)');await fail(F.man,'Misafire ulaşılamadı');
 let X=await S();console.log('  ilgilenilemedi sonrası: '+JSON.stringify(X));
 ok(Object.values(X.st).every(v=>v==='open:1'),'İlgilenilemedi: dört takip de açık, birer deneme kaydı');
 ok(X.issue==='open:1'&&!X.issueTouch,'issue açık ve dokunulmadı (yeni olay yok)');
 ok(/^false::Misafir odada değildi$/.test(X.alert),'Butler Alert hâlâ "gidilmedi", nedeni değişmedi');
 ok(X.ntIn,'Didn\'t Do It listesinde 2001 hâlâ duruyor');
 ok(X.logs.length===0,'Butler Did It\'e hiçbir şey yazılmadı');
 // --- 2) ilgilenildi: ilgili yerler tetiklenir ---
 await done(F.iss,'Visited the guest, room moved to a quieter floor');
 await done(F.nt,'Courtesy call done, guest happy with the room');
 await done(F.al,'');
 await done(F.man,'Tekne 18:30 teyit edildi');
 X=await S();console.log('  ilgilenildi sonrası: '+JSON.stringify(X,null,1));
 ok(Object.values(X.st).every(v=>v==='done:1'),'İlgilenildi: dört takip kapandı, eski deneme geçmişte');
 ok(X.issue==='open:2'&&X.issueTouch==='Visited the guest, room moved to a quieter floor','issue: geçmişine butler teması (notla) yazıldı, issue AÇIK kaldı (kapatmak butlerın kararı)');
 ok(X.logs.some(l=>/^1203\|Issue Follow-up\|Deniz Karavus\|Visited the guest/.test(l)),'Butler Did It: 1203 "Issue Follow-up"');
 ok(!X.ntIn&&X.logs.some(l=>/^2001\|Follow-up\|Onur Kaya\|Courtesy call done/.test(l)),'Didn\'t Do It: 2001 touch aldı, listeden çıktı (Onur adına "Follow-up")');
 ok(/^true:/.test(X.alert)&&X.logs.some(l=>/^1406\|Follow-up\|/.test(l)),'Butler Alert: 1406 "gidildi" oldu + Butler Did It\'e touch');
 ok(X.logs.some(l=>/^1802\|Follow-up\|.*\|Tekne 18:30/.test(l)),'elle takip: 1802 Butler Did It\'e notuyla');
 ok(X.warn===0,'Uyarılar > Takip boşaldı');
 // Atolye: issue satiri yeni haliyle girilecekler listesinde
 const AT=await p.evaluate(()=>{__ev('_bdiGMProf=null');return __ev('bdiPlRows')().filter(r=>r.st.s==='p'&&r.L.block==='Issues'&&/quieter floor/.test(r.L.t)).length});
 ok(AT===1,'Atölye > Protel\'e girilecekler: issue satırı butlerın notuyla geldi');
 // --- 3) geri al: alert yine gidilmedi ---
 await p.evaluate(()=>{document.querySelector('#bdiFuPanel details.bd-fu-more').open=true});
 await p.click('[id="bdiFu_'+F.al+'"] .bd-fu-line');await p.waitForTimeout(150);await p.click('#bdiFuPanel .bd-fu-ed button:has-text("geri al")');await p.waitForTimeout(400);
 X=await S();ok(X.st.al==='open:1'&&/^false::Misafir odada değildi$/.test(X.alert)&&!X.logs.some(l=>/^1406\|/.test(l)),'Alert takibini geri al: takip açık, alert yine "gidilmedi" (eski neden), touch silindi');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
