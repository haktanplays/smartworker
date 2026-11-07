const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1320,height:1000},deviceScaleFactor:2});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-02T15:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-02');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak']))});await p.reload();await p.waitForTimeout(1200);
 await p.evaluate(async()=>{await __ev('BdiKV').ready();const t=new Date('2026-11-02T10:00:00+03:00').getTime();
   __ev('bdiSaveIssues')([{id:'is1',room:'1203',guest:'Claire Morel',concern:'The guest complained about the noise from the corridor during the night.',createdAt:t,u:t,events:[{id:'e1',ts:t,type:'import',butler:'',text:''}]},
     {id:'is2',room:'0805',guest:'Kirsten Hollinsby',concern:'Late laundry delivery.',createdAt:t,u:t,events:[{id:'e2',ts:t,type:'import',butler:'',text:''}]}]);
   __ev('showPage("didit")');__ev('switchBdiTab("issues")');__ev('bdiIssueSetFilter("all")');__ev('_bdiIssueOpen.is1=true');__ev('renderBdiIssues()')});
 await p.selectOption('#bdiIsNcPick_is1','guest');await p.click('#bdiIs_is1 .bd-ncclose-r button');await p.waitForTimeout(200); // 2026-11-03: neden kapatirken secilir
 const A=await p.evaluate(()=>({row:!!document.getElementById('bdiIsNcBy_is1'),st:__ev('bdiIssueState')(__ev('bdiIssueById')(__ev('bdiGetIssues')(),'is1')).status}));
 ok(A.st==='closed'&&A.row,'temas olmadan kapatildi; kart acik kaldi, "Neden temas yok?" satiri sonradan degistirmek icin duruyor');
 await p.selectOption('#bdiIsNcBy_is1','mgmt');await p.fill('#bdiIsNcT_is1','GM called the guest and offered a late check-out');await p.click('#bdiIs_is1 .bd-ncrow button');await p.waitForTimeout(150);
 const B=await p.evaluate(()=>{const is=__ev('bdiIssueById')(__ev('bdiGetIssues')(),'is1'),e=is.events.find(x=>x.type==='nocontact');const card=document.getElementById('bdiIs_is1');
   return {by:e.by,t:e.text,u:e.u>0,meta:card.querySelector('.bd-issue-meta').textContent,tl:[...card.querySelectorAll('.bd-tl li b')].map(x=>x.textContent).join(' | ')}});
 ok(B.by==='mgmt'&&B.t==='GM called the guest and offered a late check-out'&&B.u,'kim kapattı (Yönetim) + not kaydedildi (u ile: senkron gider)');
 ok(/Yönetim kapattı \(temas yok\) · GM called the guest/.test(B.meta)&&/Yönetim kapattı \(temas yok\)/.test(B.tl),'kartta ozet ve gecmiste "Yönetim kapattı (temas yok)": '+B.meta);
 // sonradan duzelt: Resepsiyon
 await p.selectOption('#bdiIsNcBy_is1','rec');await p.click('#bdiIs_is1 .bd-ncrow button');await p.waitForTimeout(150);
 const C=await p.evaluate(()=>__ev('bdiIssueById')(__ev('bdiGetIssues')(),'is1').events.find(x=>x.type==='nocontact').by);
 ok(C==='rec','sonradan degistirilebiliyor (Resepsiyon)');
 // rapor
 await p.evaluate(()=>{document.getElementById('bdiDate').value='2026-11-02';__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()')});
 const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidIt()')}));
 const R=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return [...d.querySelectorAll('.idet')].map(x=>x.textContent).join(' || ')},html);
 ok(/Closed by Reception, no butler contact\. GM called the guest and offered a late check-out/.test(R),'raporda: "Closed by Reception, no butler contact. <not>"');
 const X=await p.evaluate(()=>{let wb=null;const o=XLSX.writeFile;XLSX.writeFile=w=>{wb=w};try{__ev('downloadDidItXlsx()')}finally{XLSX.writeFile=o}return XLSX.utils.sheet_to_json(wb.Sheets['Issues']||{}).map(r=>r['What the butler did']).join(' | ')});
 ok(/Closed by Reception, no butler contact\. GM called/.test(X),'Excel Issues sayfasinda da');
 // "Kim ilgilendi?" > "Temas olmadan çıktı" yolu: misafir cikti
 await p.evaluate(()=>{__ev('switchBdiTab("issues")');const L=__ev('bdiGetIssues')();const is=__ev('bdiIssueById')(L,'is2');is.events.push({id:'c2',ts:Date.now(),type:'close',butler:'',src:'report'});__ev('bdiSaveIssues')(L);__ev('renderBdiIssues()')});
 await p.selectOption('#bdiIsCB_is2','__nc:guest');await p.click('#bdiIs_is2 .bd-isconf-row button');await p.waitForTimeout(150);
 const D=await p.evaluate(()=>({by:__ev('bdiIssueById')(__ev('bdiGetIssues')(),'is2').events.find(x=>x.type==='nocontact').by,meta:document.querySelector('#bdiIs_is2 .bd-issue-meta').textContent}));
 ok(D.by==='guest'&&/Temas olmadan çıktı/.test(D.meta),'"Temas olmadan çıktı" secimi: misafir cikti olarak kaydedildi');
 await p.evaluate(()=>{__ev('_bdiIssueOpen.is1=true');__ev('renderBdiIssues()')});await p.waitForTimeout(100);
 await (await p.$('#bdiIs_is1')).screenshot({path:__dirname+'/did/ncnote.png'});
 ok(errs.length===0,'JS hatasi yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
