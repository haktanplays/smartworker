const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1320,height:1000}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-02T15:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-02');localStorage.setItem('sw_dayfix','2026-11-02');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak','Onur Kaya']))});await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();const L=(id,d,room,guest,t)=>({id,butler:'Beyza Nur Çırak',room,guest,action:'Turndown',touchCategory:'Service',patternType:'service',note:'',time:t,sentence:'x '+room,ts:new Date(d+'T'+t+':00+03:00').getTime(),countsAsTouch:true});
   KV.set('bdi_2026-10-31',JSON.stringify([L('a1','2026-10-31','1007','Old Guest','22:11')]));KV.set('bdi_2026-11-01',JSON.stringify([L('b1','2026-11-01','1205','Kerry Dovell','10:00')]));KV.set('bdi_2026-11-02',JSON.stringify([L('c1','2026-11-02','1709','Michael Lennox','11:00')]));
   __ev('showPage("didit")');__ev('switchBdiTab("log")')});
 const snap=()=>p.evaluate(()=>{const KV=__ev('BdiKV');const o={};['2026-10-31','2026-11-01','2026-11-02'].forEach(d=>{o[d]=JSON.parse(KV.get('bdi_'+d)||'[]').map(l=>l.id).join(',')});return o});
 console.log('start',JSON.stringify(await snap()));
 await p.click('#bdiCalBtn');await p.waitForTimeout(200);
 const shown=()=>p.evaluate(()=>({head:document.getElementById('bdiLogCount').textContent,rows:[...document.querySelectorAll('#bdiTab_log table tbody tr')].map(r=>r.textContent.replace(/\s+/g,' ').trim().slice(0,80))}));
 console.log('shown start',JSON.stringify(await shown()));
 for(const d of ['2026-11-01','2026-10-31']){ if(d==='2026-10-31'){await p.evaluate(()=>__ev('bdiCalMove(-1)'));await p.waitForTimeout(150)}
   await p.click(`#bdiCal .bd-cal-d[onclick*="${d}"]`);await p.waitForTimeout(400);
   console.log('after click',d,JSON.stringify(await snap()),'bdiDate',await p.evaluate(()=>document.getElementById('bdiDate').value));console.log('  shown',JSON.stringify(await shown()));
 }
 // tarih alanindan degistir
 await p.evaluate(()=>{const e=document.getElementById('bdiDate');e.value='2026-10-31';e.dispatchEvent(new Event('change'))});await p.waitForTimeout(400);
 console.log('after date input',JSON.stringify(await snap()));
 for(const m of ['week','month','day']){await p.evaluate(m=>__ev('setBdiView("'+m+'")'),m);await p.waitForTimeout(300);console.log('view',m,JSON.stringify(await snap()))}
 console.log('errs',JSON.stringify(errs));await b.close()})();
