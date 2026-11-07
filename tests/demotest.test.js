const {chromium}=require('playwright');const fs=require('fs');const crypto=require('crypto');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const SRC=process.argv[2]||'t';
const snap=async p=>p.evaluate(async()=>{const ls={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);ls[k]=localStorage.getItem(k)}
  const dbs=(await indexedDB.databases()).map(d=>d.name).sort();const dump={};
  for(const n of dbs.filter(n=>!/^swdemo_/.test(n))){dump[n]=await new Promise(res=>{const r=indexedDB.open(n);r.onsuccess=async()=>{const db=r.result,o={};for(const s of db.objectStoreNames){o[s]=await new Promise(rr=>{const q=db.transaction(s).objectStore(s).getAll();q.onsuccess=()=>rr(JSON.stringify(q.result).length+':'+JSON.stringify(q.result).slice(0,2000));q.onerror=()=>rr('err')})}db.close();res(o)};r.onerror=()=>res('err')})}
  return {ls,dbs,dump}});
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:900}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('REAL: '+e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-04T15:30:00+03:00')});
 // 1) gercek uygulama: bir "gercek" kayit seti
 await p.goto('file://'+__dirname+'/'+SRC+'/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-04');localStorage.setItem('kw_butler',JSON.stringify(['Gerçek Butler A','Gerçek Butler B']));localStorage.setItem('bdi_me','Gerçek Butler A')});
 await p.reload();await p.waitForTimeout(1200);
 await p.evaluate(async()=>{await __ev('BdiKV').ready();__ev('saveBdiArrayForDate')('2026-11-04',[{butler:'Gerçek Butler A',room:'0701',action:'Turndown',time:'10:00',sentence:'GERCEK KAYIT',guest:'Gercek Misafir',ts:Date.now(),patternType:'service',countsAsTouch:true,id:'real1'}])});
 await p.waitForTimeout(9000);
 const before=await snap(p);
 // 2) ayni tarayicida demo
 const d=await ctx.newPage();const derr=[],dlog=[];d.on('pageerror',e=>derr.push(e.message));d.on('console',m=>{if(/Demo/.test(m.text()))dlog.push(m.text())});d.on('dialog',x=>x.accept());
 await d.goto('file://'+__dirname+'/'+SRC+'/SmartWorker3.html?demo');
 await d.waitForFunction(()=>sessionStorage.getItem('swdemo:__seeded'),null,{timeout:120000});await d.waitForLoadState('load');await d.waitForTimeout(3500);
 console.log(dlog.join('\n').slice(0,3000));
 const after=await snap(p);
 const dk=Object.keys(Object.assign({},before.ls,after.ls)).filter(k=>before.ls[k]!==after.ls[k]);console.log('  değişen gerçek anahtarlar: '+dk.map(k=>k+' ['+String(before.ls[k]).slice(0,60)+' -> '+String(after.ls[k]).slice(0,60)+']').join(' ; '));
 ok(JSON.stringify(before.ls)===JSON.stringify(after.ls),'gerçek localStorage demodan sonra birebir aynı ('+Object.keys(after.ls).length+' anahtar)');
 ok(JSON.stringify(before.dump)===JSON.stringify(after.dump),'gerçek IndexedDB veritabanları birebir aynı ('+Object.keys(after.dump).join(', ')+')');
 const demoDbs=(await d.evaluate(async()=>(await indexedDB.databases()).map(x=>x.name))).filter(n=>/^swdemo_/.test(n));
 ok(demoDbs.length>=3,'demo kendi veritabanlarında çalışıyor: '+demoDbs.length+' ayrı veritabanı');
 const real=await p.evaluate(()=>JSON.parse(__ev('BdiKV').get('bdi_2026-11-04')||'[]').map(x=>x.sentence).join('|'));ok(real==='GERCEK KAYIT','gerçek uygulamadaki kayıt yerinde: '+real);
 const ds=await d.evaluate(()=>({butlers:localStorage.getItem('kw_butler'),logs:(__ev('bdiLogs')||[]).length,issues:__ev('bdiGetIssues()').length,alerts:(__ev('alertList')||[]).length,real:JSON.stringify(__ev('bdiLogs')||[]).indexOf('GERCEK')>=0,title:document.title,pill:!!document.querySelector('.sw-demo-pill')}));
 console.log('  demo: '+JSON.stringify(ds));
 ok(!ds.real&&/Elif/.test(ds.butlers),'demo gerçek kayıtları görmüyor, kendi butlerları var');
 ok(ds.logs>10&&ds.issues>=8&&ds.alerts>=5,'demo dolu: bugün '+ds.logs+' touch, '+ds.issues+' issue, '+ds.alerts+' alert');
 ok(ds.pill&&/^DEMO/.test(ds.title),'üst bantta DEMO işareti ve sekme başlığında DEMO');
 ok(derr.length===0,'demoda JS hatası yok '+JSON.stringify(derr.slice(0,3)));ok(errs.length===0,'gerçek uygulamada JS hatası yok '+JSON.stringify(errs.slice(0,3)));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
