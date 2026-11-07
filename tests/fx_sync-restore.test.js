// 2026-11-06: yedekten geri yukleme ve senkron veri kaybetmesin / kirpmasin / silineni geri getirmesin (I1, I6, I2, I3, F1, J11)
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const DIR=process.argv[2]||'t2';
const FILE='file://'+__dirname+'/'+DIR+'/SmartWorker3.html';
const D='2026-11-06';
const T=hm=>new Date(D+'T'+hm+':00+03:00');
const newFolder=()=>({files:new Map()});
// bir bilgisayar: ayri tarayici baglami; folder verilirse ortak klasor taklidi (common.js ile ayni)
async function openPC(br,folder,hm,label){
  const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
  await ctx.addInitScript(()=>{try{if(!localStorage.getItem('sw_setup_snooze'))localStorage.setItem('sw_setup_snooze','2026-11-06');localStorage.setItem('sw_dayfix','2026-11-06')}catch(e){}});
  const p=await ctx.newPage();p.__label=label;p.__errs=[];p.__ans=[];
  p.on('pageerror',e=>p.__errs.push(label+': '+String(e.message||e)));
  p.on('dialog',d=>{const a=p.__ans.length?p.__ans.shift():undefined;if(a===false)d.dismiss();else if(d.type()==='prompt')d.accept(a===undefined?'':String(a));else d.accept()});
  if(folder){
    await p.exposeFunction('__fsRead',async n=>(folder.files.has(n)?folder.files.get(n):null));
    await p.exposeFunction('__fsWrite',async(n,t)=>{folder.files.set(n,t);return true});
    await p.exposeFunction('__fsList',async pre=>[...folder.files.keys()].filter(k=>k.startsWith(pre)&&!k.slice(pre.length).includes('/')).map(k=>k.slice(pre.length)));
    await p.exposeFunction('__fsDel',async n=>{folder.files.delete(n);return true});
  }
  await p.clock.setFixedTime(T(hm));
  await p.goto(FILE,{waitUntil:'load'});await p.waitForTimeout(900);
  await p.evaluate(async hasF=>{await __ev('BdiKV').ready();
    try{__ev('schedulePyAutoSync=function(){}')}catch(e){}
    if(hasF){
      window.__mkDir=function(pre){pre=pre||'';return {kind:'directory',name:'FakeFolder',queryPermission:async()=>'granted',requestPermission:async()=>'granted',
        getFileHandle:async(n,o)=>{const full=pre+n;const has=await window.__fsRead(full);if(has===null&&!(o&&o.create))throw new DOMException('not found','NotFoundError');
          return {kind:'file',name:n,getFile:async()=>({text:async()=>(await window.__fsRead(full))||'',lastModified:Date.now()}),
            createWritable:async()=>{let b='';return {write:async t=>{b=typeof t==='string'?t:await new Blob([t]).text()},close:async()=>{await window.__fsWrite(full,b)}}}}},
        getDirectoryHandle:async n=>window.__mkDir(pre+n+'/'),removeEntry:async n=>{await window.__fsDel(pre+n)},
        values:async function*(){const names=await window.__fsList(pre);for(const n of names)yield {kind:'file',name:n}}}};
      window.__dir=window.__mkDir('');__ev('_pyDirHandle=window.__dir');
    }
    try{__ev('closeSetupModal()')}catch(e){}
  },!!folder);
  return p;
}
const clock=(p,hm)=>p.clock.setFixedTime(T(hm));
const sync=p=>p.evaluate(async()=>{const r={};await __ev('BdiKV').ready();
  for(const f of ['_bdiSyncFile','_bdiExtSyncFile','_settingsSyncFile','_bdiGuestMemSyncFile']){try{await __ev(f)(window.__dir);r[f]='ok'}catch(e){r[f]='THREW '+e.message}}
  await new Promise(res=>setTimeout(res,250));return r});
const importObj=async(p,obj)=>{await p.evaluate(t=>{document.getElementById('bdiImportStatus').textContent='';__ev('importBdiBackup')([new File([t],'b.json')])},JSON.stringify(obj));
  await p.waitForFunction(()=>/dosya islendi|okunamadi/.test(document.getElementById('bdiImportStatus').textContent),null,{timeout:5000}).catch(()=>{});await p.waitForTimeout(150)};
const kv=(p,k)=>p.evaluate(k=>__ev('BdiKV').get(k),k);
const dayLog=(p,d)=>p.evaluate(d=>JSON.parse(__ev('BdiKV').get('bdi_'+d)||'[]'),d);
const E=(id,ex)=>Object.assign({id,butler:'Tuna',room:'1201',action:'Turndown',time:'20:00',sentence:'entry '+id,ts:1000+Number(id.replace(/\D/g,'')),patternType:'service',countsAsTouch:true},ex||{});

(async()=>{const br=await chromium.launch();const allErrs=[];
 try{
 // ================= (1) I1: tam yedek yeni bilgisayara (senkrondan once) =================
 {
  const R4=[{l:'DND',ex:'x'},{l:'Guest not in room',ex:'y'},{l:'Privacy request',ex:'z'},{l:'Custom reason',ex:'w'}];
  const BK={version:'BDI_BACKUP_v1',data:{
    bdi_nt_reasons:R4,                                                     // Yedekle (JSON) bicimi: nesne
    bdi_protel_skip:JSON.stringify(['Turndown','Welcome','Water']),        // tam yedek bicimi: metin
    bdi_prefforms_v1:[{id:'pf1',file:'a.pdf',items:[1]},{id:'pf2',file:'b.pdf',items:[2]}],
    bdi_issue_untombs:['i1','i2','i3'],
    bdi_handover_v1:{'2026-11-06|BUT':{t:'devir notu',u:1}},
    bdi_prep_v1:JSON.stringify({'2026-11-06':{g1:{on:1,by:'A',u:1}}}),
    bdi_dep_v1:{days:{'2026-11-06':{at:1,rows:[{room:'1201',dep:'2026-11-06'}]}}},
    bdi_me:'Other',
    'bdi_2026-11-05':[E('d1',{_date:'2026-11-05'}),E('d2',{_date:'2026-11-05',room:'1202'})]}};
  const want=k=>{const v=BK.data[k];return typeof v==='string'?v:JSON.stringify(v)};
  const NON=['bdi_nt_reasons','bdi_protel_skip','bdi_prefforms_v1','bdi_issue_untombs','bdi_handover_v1','bdi_prep_v1','bdi_dep_v1'];
  const Cn=await openPC(br,null,'10:00','C1');
  await importObj(Cn,BK);
  const got={};for(const k of NON)got[k]=await kv(Cn,k);
  const bad=NON.filter(k=>got[k]!==want(k));
  ok(bad.length===0,'I1 yeni bilgisayar: ayar ve kayit anahtarlari yedektekiyle ayni'+(bad.length?' (farkli: '+bad.map(k=>k+'='+String(got[k]).slice(0,80)).join(' | ')+')':''));
  const rs=JSON.parse(got.bdi_nt_reasons||'[]');
  ok(rs.length===4&&rs.every(x=>!x.id&&!x._date),'I1 dört sebep, id/_date eklenmemiş ('+rs.length+')');
  ok(await kv(Cn,'bdi_me')===null,'I1 bdi_me bu bilgisayarda kalır, yedekten yazılmaz');
  let dl=await dayLog(Cn,'2026-11-05');
  ok(dl.map(x=>x.id).sort().join()==='d1,d2','I1 gün kaydının iki girişi eklendi ('+dl.map(x=>x.id).join()+')');
  // ikinci yukleme: bu bilgisayarda 2 sebep zaten var -> dokunulmaz
  const R2=JSON.stringify([{l:'DND',ex:'x'},{l:'Yerel sebep',ex:'q'}]);
  await Cn.evaluate(r=>localStorage.setItem('bdi_nt_reasons',r),R2);
  await importObj(Cn,BK);
  ok(await kv(Cn,'bdi_nt_reasons')===R2,'I1 ikinci yükleme: yerelde olan 2 sebep aynen kaldı');
  dl=await dayLog(Cn,'2026-11-05');
  ok(dl.length===2,'I1 ikinci yükleme: gün kaydı çoğalmadı ('+dl.length+')');
  allErrs.push(...Cn.__errs);await Cn.context().close();
  // iki bilgisayar: A senkronlu; C yedegi ilk senkrondan once yukler; C sonra A senkron -> A'da 4 sebep
  const f=newFolder();
  const A=await openPC(br,f,'10:00','A');
  await A.evaluate(r=>localStorage.setItem('bdi_nt_reasons',r),JSON.stringify(R4));
  await sync(A);
  const C=await openPC(br,f,'10:20','C');
  await importObj(C,BK);
  await sync(C);await clock(A,'10:25');await sync(A);
  const aR=JSON.parse(await A.evaluate(()=>localStorage.getItem('bdi_nt_reasons'))||'[]'),cR=JSON.parse(await C.evaluate(()=>localStorage.getItem('bdi_nt_reasons'))||'[]');
  ok(aR.length===4&&cR.length===4&&aR.every(x=>!x.id),'I1 iki bilgisayar: C yükleyip senkronlayınca A\'da hâlâ 4 sebep (A '+aR.map(x=>x.l).join('/')+' · C '+cR.length+')');
  allErrs.push(...A.__errs,...C.__errs);await A.context().close();await C.context().close();
 }
 // ================= (2) I6: klasorsuz bilgisayar, silinen geri gelmesin, duzeltilen cift olmasin =================
 {
  const P=await openPC(br,null,'10:00','P6');
  await P.evaluate(async d=>{const KV=__ev('BdiKV');KV.set('bdi_'+d,JSON.stringify([1,2,3].map(n=>({id:'e'+n,butler:'Tuna',room:'120'+n,action:'Turndown',time:'20:0'+n,sentence:'entry e'+n,note:'',ts:1000+n,patternType:'service',countsAsTouch:true,_date:d}))));
    __ev('showPage("didit")');document.getElementById('bdiDate').value=d;__ev('loadBdiLogs')()},D);
  const snap=await P.evaluate(()=>{const KV=__ev('BdiKV'),o={version:'BDI_BACKUP_v1',data:{}};KV.keys().forEach(k=>{if(k.indexOf('bdi_')===0){try{o.data[k]=JSON.parse(KV.get(k))}catch(e){o.data[k]=KV.get(k)}}});return o});
  await clock(P,'11:00');
  await P.evaluate(d=>{__ev('removeBdiLogById')('e1',d);const L=__ev('bdiLogs');const x=L.find(x=>x.id==='e2');x.note='EDITED after backup';x.u=Date.now();__ev('saveBdiLogs')()},D);
  ok(await P.evaluate(()=>__ev('bdiGetTombs')().indexOf('e1')>=0),'I6 e1 silindi, mezar taşı yazıldı');
  await importObj(P,snap);
  const ids=(await dayLog(P,D)).map(x=>x.id),e2=(await dayLog(P,D)).filter(x=>x.id==='e2');
  ok(ids.indexOf('e1')<0,'I6 silinen e1 eski yedekten geri gelmedi ('+ids.join()+')');
  ok(new Set(ids).size===ids.length&&e2.length===1,'I6 id tekrarı yok, e2 tek ('+ids.join()+')');
  ok(e2.length&&e2[0].note==='EDITED after backup','I6 e2 düzeltmesi korundu ('+(e2[0]||{}).note+')');
  allErrs.push(...P.__errs);await P.context().close();
 }
 // ================= (3) I2: Didn't Do It ayni misafir, iki bilgisayar, farkli alanlar =================
 {
  const f=newFolder();
  const A=await openPC(br,f,'10:00','A'),B=await openPC(br,f,'10:00','B');
  await sync(A);await sync(B);
  const ntSet=(p,gk,fl,v)=>p.evaluate(([D,gk,fl,v])=>__ev('bdiNtSet')(D,gk,fl,v),[D,gk,fl,v]);
  const cell=(p,gk)=>p.evaluate(([D,gk])=>{const x=(__ev('bdiNtGet')()[D]||{})[gk]||{};return {r:x.r||null,plan:(x.f||{}).plan||null}},[D,gk]);
  await clock(A,'11:00');await ntSet(A,'g2','r','DND');                       // A senkronsuz (klasor izni bekliyor)
  await clock(B,'11:10');await ntSet(B,'g2','f:plan','Turndown');await sync(B);
  await clock(A,'11:12');await sync(A);await clock(B,'11:14');await sync(B);
  const a=await cell(A,'g2'),b=await cell(B,'g2');
  ok(a.r==='DND'&&a.plan==='Turndown','I2 A: sebep DND ve plan Turndown ikisi de duruyor ('+JSON.stringify(a)+')');
  ok(b.r==='DND'&&b.plan==='Turndown','I2 B: sebep DND ve plan Turndown ikisi de duruyor ('+JSON.stringify(b)+')');
  // ayni durum yedek ice aktarmada: B'nin bdi_nt_v1'i A'ya
  await clock(A,'11:20');await ntSet(A,'g3','r','Guest not in room');
  await clock(B,'11:30');await ntSet(B,'g3','f:plan','Turndown');
  const bnt=JSON.parse(await kv(B,'bdi_nt_v1'));
  await importObj(A,{version:'BDI_BACKUP_v1',data:{bdi_nt_v1:bnt}});
  const a3=await cell(A,'g3'),a2=await cell(A,'g2');
  ok(a3.r==='Guest not in room'&&a3.plan==='Turndown'&&a2.r==='DND'&&a2.plan==='Turndown','I2 yedekten içe aktarma da iki alanı korudu ('+JSON.stringify(a3)+')');
  allErrs.push(...A.__errs,...B.__errs);await A.context().close();await B.context().close();
 }
 // ================= (4) I3: senkronlanmis kayitlarin yerinde duzeltilmesi obur bilgisayara gitsin =================
 {
  const f=newFolder();
  const A=await openPC(br,f,'10:00','A'),B=await openPC(br,f,'10:01','B');
  const prep=await A.evaluate(async d=>{__ev('showPage("didit")');document.getElementById('bdiDate').value=d;__ev('loadBdiLogs')();
    const fu=__ev('bdiFuAdd')({room:'1201',guest:'John Smith',t:'tekne saatini teyit et',due:Date.now()+36e5});
    const done=__ev('bdiFuDone')(fu.id,{butler:'Tuna',text:'',via:'manual'});
    const KV=__ev('BdiKV');
    KV.set('bdi_issues_v1',JSON.stringify([{id:'is1',room:'1202',guest:'Jane Doe',concern:'Klima sesli',createdAt:Date.now(),events:[],u:Date.now()}]));
    const list=__ev('bdiGetIssues')(),is=list.find(x=>x.id==='is1'),now=new Date(),ev={id:'ev1',ts:now.getTime(),type:'touch',butler:'Tuna',text:'ilk not'};
    ev.touchId=__ev('bdiIssueTouch')(is,ev,now).id;is.events.push(ev);is.u=now.getTime();__ev('bdiSaveIssues')(list);
    const arr=JSON.parse(KV.get('bdi_'+d)||'[]');arr.push({id:'gm1',butler:'Tuna',room:'1203',guest:'Mary Major',action:'Turndown',time:'09:00',ts:Date.now()-36e5,countsAsTouch:true,patternType:'service',sentence:'Butler Tuna completed turndown for our guest Mary Major staying at Room 1203.'});
    KV.set('bdi_'+d,JSON.stringify(arr));__ev('loadBdiLogs')();
    return {fu:fu.id,log:done&&done.doneLog,touch:ev.touchId}},D);
  await sync(A);await sync(B);
  const ent=(p,id)=>p.evaluate(([d,id])=>JSON.parse(__ev('BdiKV').get('bdi_'+d)||'[]').find(x=>x.id===id)||null,[D,id]);
  ok(!!(await ent(B,prep.log))&&!!(await ent(B,prep.touch))&&!!(await ent(B,'gm1')),'I3 başta üç kayıt B\'ye geçti');
  // (a) takip notu
  await clock(A,'10:05');
  await A.evaluate(id=>{const el=document.createElement('input');el.id='bdiFuDn_'+id;el.value='Tekne 17:00 teyit edildi';document.body.appendChild(el);__ev('bdiFuNoteSave')(id);el.remove()},prep.fu);
  const aF=await ent(A,prep.log);
  await sync(A);await clock(B,'10:06');await sync(B);
  const bF=await ent(B,prep.log);
  ok(aF&&bF&&/Tekne 17:00/.test(aF.sentence)&&bF.sentence===aF.sentence&&bF.note===aF.note,'I3 takip notu düzeltmesi B\'ye gitti (B: '+(bF&&bF.sentence)+')');
  // (b) issue olayinda butler degisti
  await clock(A,'10:10');await A.evaluate(()=>__ev('bdiIssueEvEdit')('is1','ev1','Zafer Karagaçtı'));
  await sync(A);await clock(B,'10:11');await sync(B);
  const bE=await ent(B,prep.touch);
  ok(bE&&bE.butler==='Zafer Karagaçtı','I3 issue butler düzeltmesi B\'deki kayda gitti ('+(bE&&bE.butler)+')');
  // (c) issue olayinin metni (prompt)
  await clock(A,'10:15');A.__ans.push('Teknik ekip geldi');await A.evaluate(()=>__ev('bdiIssueEvText')('is1','ev1'));
  await sync(A);await clock(B,'10:16');await sync(B);
  const bT=await ent(B,prep.touch);
  ok(bT&&bT.note==='Teknik ekip geldi'&&/Teknik ekip geldi/.test(bT.sentence||''),'I3 issue metni düzeltmesi B\'ye gitti ('+(bT&&bT.note)+')');
  // (d) misafiri tamamen sil (yonetici)
  await A.evaluate(async()=>{await __ev('bdiGMIngest()');__ev('_bdiGMProf=null')});
  const gid=await A.evaluate(()=>{const p=__ev('bdiGMProfiles()').list.find(x=>x.name==='Mary Major');return p&&p.gid});
  await clock(A,'10:20');
  await A.evaluate(async g=>{__ev('swAdminCheck=function(){return true}');await __ev('bdiGMForget')(g)},gid);
  const aG=await ent(A,'gm1');
  await sync(A);await clock(B,'10:21');await sync(B);
  const bG=await ent(B,'gm1');
  ok(!!gid&&aG&&aG.guest===''&&bG&&bG.guest===''&&!/Mary Major/.test(bG.sentence||''),'I3 misafir silme B\'deki gün kaydından da adı kaldırdı (B guest="'+(bG&&bG.guest)+'")');
  allErrs.push(...A.__errs,...B.__errs);await A.context().close();await B.context().close();
 }
 // ================= (5) F1/J11: oda secici "kapat" ve silinen ozel gun yenilemede kalsin =================
 {
  const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('F1: '+e.message));p.on('dialog',d=>d.accept());
  await p.clock.setFixedTime(T('11:00'));await p.goto(FILE);
  await p.evaluate(d=>{localStorage.clear();localStorage.setItem('sw_setup_snooze',d);localStorage.setItem('sw_dayfix',d);localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus','Onur Kaya']))},D);
  await p.reload();await p.waitForTimeout(1300);
  const Rw=(room,name)=>({room,name,arr:'2026-11-03',dep:'2026-11-09',depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
  await p.evaluate(async([D,rows])=>{const KV=__ev('BdiKV');await KV.ready();KV.set('bdi_gih_v1',JSON.stringify({day:D,at:Date.now(),file:'g.pdf',rows}));
    KV.set('bdi_floors_v1',JSON.stringify({[D]:{blocks:[{butler:'Deniz Karavus',from:12,to:14},{butler:'Onur Kaya',from:20,to:20}]}}))},[D,[Rw('1203','Morel,Claire,Ms.'),Rw('1406','Meyer,Anna,Mrs.'),Rw('2001','Mardanov,Ilyar,Mr.')]]);
  await p.clock.setFixedTime(T('11:01'));await p.reload();await p.waitForTimeout(1200);
  const pick=async()=>{await p.evaluate(()=>{try{__ev('closeSetupModal()')}catch(e){}__ev('showPage("didit")');__ev('switchBdiTab("entry")')});await p.waitForTimeout(200);
    await p.selectOption('#bdiButler','Deniz Karavus');await p.waitForTimeout(250);return p.evaluate(()=>document.getElementById('bdiBulkPanel').style.display)};
  const open0=await pick();
  await p.click('#bdiBulkPanel button:has-text("kapat")');await p.waitForTimeout(200);
  const del=await p.evaluate(()=>{__ev('bdiCfgRaw')('bdi_natdays');const a=JSON.parse(localStorage.getItem('bdi_natdays')||'null')||__ev('bdiCfgDef')('bdi_natdays');
    __ev('bdiCfgSave')('bdi_natdays',a.filter(x=>x.l!=='Hindistan Cumhuriyet Günü'));return {rp:localStorage.getItem('bdi_roompick_off'),india:__ev('bdiCfg')('bdi_natdays').some(x=>x.l==='Hindistan Cumhuriyet Günü')}});
  ok(open0==='block'&&del.rp==='1'&&!del.india,'F1/J11 başta: panel açıldı, "kapat" ile kapandı, Hindistan günü silindi');
  const bk=()=>p.evaluate(()=>new Promise(r=>{const q=indexedDB.open('SmartWorkerBDI');q.onsuccess=()=>{const t=q.result.transaction('backups').objectStore('backups').getAllKeys();t.onsuccess=()=>{q.result.close();r(t.result.length)}}}));
  const b0=await bk();
  for(const [i,hm] of [[1,'11:10'],[2,'11:20']]){
    await p.clock.setFixedTime(T(hm));await p.reload();await p.waitForTimeout(1500);
    const s=await p.evaluate(()=>({ls:localStorage.getItem('bdi_roompick_off'),off:__ev('bdiRpOff()'),india:__ev('bdiCfg')('bdi_natdays').some(x=>x.l==='Hindistan Cumhuriyet Günü')}));
    const disp=await pick();
    const n=await bk();
    ok(s.ls==='1'&&s.off===true,'F1 yenileme '+i+': oda seçici kapalı kaldı (localStorage '+s.ls+', bdiRpOff '+s.off+')');
    ok(disp==='none','F1 yenileme '+i+': butler seçilince #bdiBulkPanel gizli kaldı ('+disp+')');
    ok(!s.india,'J11 yenileme '+i+': silinen özel gün geri gelmedi');
    ok(n===b0,'J11 yenileme '+i+': her açılışta yeni "backups" kaydı yazılmadı ('+b0+' -> '+n+')');
  }
  allErrs.push(...errs);await ctx.close();
 }
 }catch(e){ok(false,'test çöktü: '+(e&&e.stack||e))}
 ok(allErrs.length===0,'JS hatası yok '+JSON.stringify(allErrs.slice(0,5)));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
