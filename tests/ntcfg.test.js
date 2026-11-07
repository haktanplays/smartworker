const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1320,height:1000},deviceScaleFactor:2});const errs=[];
 const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-02T19:00:00+03:00')});
 await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-02');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak','Zafer Karagaçtı']))});
 await p.reload();await p.waitForTimeout(1200);
 // ---- veri: in-house 02.11 + touch'lar ----
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const R=(room,name,arr,dep,acc)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:acc||[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-02',at:Date.now(),file:'gih.pdf',rows:[
     R('0805','Hollinsby,Kirsten,Mrs.','2026-10-30','2026-11-05'),R('0901','Brodan,Kresimir,Mr.','2026-10-31','2026-11-06'),
     R('1004','Uslubas,Baturalp,Mr.','2026-11-01','2026-11-04'),R('1102','Al Daroum,Fatima,Ms','2026-10-29','2026-11-02'),
     R('1412','Oztoprak,Mustafa Mellah,Mr.','2026-11-01','2026-11-05'),R('1413','Oztoprak,Mustafa Mellah,Mr.','2026-11-01','2026-11-05'),
     R('1203','Farzanpour,Shahin,Mr.','2026-10-31','2026-11-07',['Leila Farzanpour']),R('1506','Smith,John,Mr.','2026-11-01','2026-11-04'),
     R('1808','De Gramont,Armand Beaumont,Mr.','2026-10-25','2026-11-08'),R('2001','Mardanov,Ilyar,Mr.','2026-11-02','2026-11-05')]}));
   __ev('_bdiGih=null');
   const L=(id,room,guest,d,t,act)=>({id,butler:'Beyza Nur Çırak',room,guest,action:act||'Turndown',touchCategory:'Service',patternType:'service',note:'',time:t,sentence:'x',ts:new Date(d+'T'+t+':00+03:00').getTime(),countsAsTouch:true});
   KV.set('bdi_2026-10-31',JSON.stringify([L('a1','0805','Kirsten Hollinsby','2026-10-31','20:00'),L('a3','1203','Leila Farzanpour','2026-10-31','21:00')]));
   KV.set('bdi_2026-11-01',JSON.stringify([L('a2','1004','','2026-11-01','16:00'),L('a4','1413','Mustafa Mellah Oztoprak','2026-11-01','18:00'),L('a5','1506','Jonh Smith','2026-11-01','19:00')]));
   __ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-02';__ev('bdiFloorSetCount(2)');__ev('bdiFloorAssign(0,"Beyza Nur Çırak")');__ev('bdiFloorAssign(1,"Zafer Karagaçtı")');__ev('loadBdiLogs()')});
 const NL=await p.evaluate(()=>{const L=__ev('bdiNtList')('2026-11-02');return {total:L.total,est:L.est,rows:L.rows.map(g=>g.rooms.join('/')+':'+g.nights)}});
 console.log('  ',JSON.stringify(NL));
 ok(NL.total===9&&!NL.est&&NL.rows.join()==='1808:8,0901:2,1412:1,2001:0','hic dokunulmayan: 1808 (8 gece), 0901 (2), 1412 (1), 2001 (bugun geldi); bugun cikan 1102 sayilmadi; iki odali Oztoprak oda oda (2026-11-07): 1413 touch\'i 1412\'yi kapatmadi (9 birim)');
 ok(!NL.rows.some(r=>/1004|1203|1413|1506|0805/.test(r)),'dokunulmus sayildi: isimsiz oda kaydi (1004), refakatci adiyla (1203 Leila), Oztoprak 1413 kendi kaydiyla, yazim farki (Jonh Smith), isimli (0805)');
 // 1412'ye de touch girilince o oda da duser (her oda kendi touch'iyla)
 await p.evaluate(()=>{const KV=__ev('BdiKV');const a=JSON.parse(KV.get('bdi_2026-11-01'));a.push({id:'a6',butler:'Beyza Nur Çırak',room:'1412',guest:'Mustafa Mellah Oztoprak',action:'Turndown',touchCategory:'Service',patternType:'service',note:'',time:'19:30',sentence:'x',ts:new Date('2026-11-01T19:30:00+03:00').getTime(),countsAsTouch:true});KV.set('bdi_2026-11-01',JSON.stringify(a))});
 const NL2=await p.evaluate(()=>__ev('bdiNtList')('2026-11-02').rows.map(g=>g.rooms.join('/')).join());
 ok(NL2==='1808,0901,2001','1412 de dokunulunca listeden dustu: '+NL2);
 // ---- Kapsam paneli: sebep sec ----
 await p.evaluate(()=>__ev('switchBdiTab("nt")'));await p.waitForTimeout(150);
 const gk=await p.evaluate(()=>({b:__ev('bdiGuestKey')('Kresimir Brodan'),d:__ev('bdiGuestKey')('Armand Beaumont De Gramont')}));
 let P0=await p.evaluate(()=>{const e=document.getElementById('bdiNtPanel');return {sum:e.querySelector('.bd-nt-sum').textContent,rooms:[...e.querySelectorAll('td.r')].map(x=>x.textContent).join(','),floor:[...e.querySelectorAll('td.f')].map(x=>x.textContent).join(','),leg:e.querySelector('.bd-nt-leg').textContent}});
 ok(/3 \/ 9 misafir hiç dokunulmadı/.test(P0.sum)&&/3 sebep bekliyor/.test(P0.sum)&&P0.rooms==='1808,0901,2001','Kapsam > Butler Didn\'t Do It: '+P0.sum+' | '+P0.rooms);
 ok(P0.floor==='Zafer Karagaçtı,Beyza Nur Çırak,Zafer Karagaçtı'&&/DND: Kapıda Rahatsız Etmeyin/.test(P0.leg),'kat butleri ve sebep aciklamalari gorunur: '+P0.floor);
 await p.selectOption(`#bdiNtPanel select[data-g="${gk.b}"]`,'DND');await p.waitForTimeout(100);
 await p.selectOption(`#bdiNtPanel select[data-g="${gk.d}"]`,'Other');await p.fill(`#bdiNtPanel input[data-f="n"][data-g="${gk.d}"]`,'Guest resting, two knocks');await p.press(`#bdiNtPanel input[data-f="n"][data-g="${gk.d}"]`,'Tab');await p.waitForTimeout(100);
 const P1=await p.evaluate(k=>{const e=document.getElementById('bdiNtPanel');const tr=e.querySelector(`select[data-g="${k}"]`).closest('tr');return {sum:e.querySelector('.bd-nt-sum').textContent,done:tr.className,desc:tr.querySelector('.bd-nt-desc')?tr.querySelector('.bd-nt-desc').textContent:'',st:JSON.parse(__ev('BdiKV').get('bdi_nt_v1'))}},gk.b);
 ok(P1.done==='done'&&/Kapıda Rahatsız Etmeyin/.test(P1.desc)&&/1 DND/.test(P1.sum)&&/1 Other/.test(P1.sum)&&/1 sebep bekliyor/.test(P1.sum),'sebep secildi: satir isaretli, aciklama altinda, ozet: '+P1.sum);
 ok(P1.st['2026-11-02'][gk.d].n==='Guest resting, two knocks'&&P1.st['2026-11-02'][gk.b].r==='DND'&&P1.st['2026-11-02'][gk.b].u>0,'sebep + not gun ve misafir bazinda saklandi (bdi_nt_v1)');
 // ---- 2001'e bugun touch girilir -> listeden duser ----
 await p.evaluate(()=>__ev('switchBdiTab("entry")'));
 const wi=await p.evaluate(()=>String(__ev('getBdiActions()').findIndex(a=>/welcome/i.test(a.label))));
 await p.selectOption('#bdiButler','Zafer Karagaçtı');await p.fill('#bdiRoom','2001');await p.selectOption('#bdiAction',wi);await p.click('#bdiAddBtn');await p.waitForTimeout(200);
 await p.evaluate(()=>{const KV=__ev('BdiKV');const a=JSON.parse(KV.get('bdi_2026-11-02'));a.forEach(l=>{if(l.room==='2001')l.guest='Ilyar Mardanov'});KV.set('bdi_2026-11-02',JSON.stringify(a));__ev('loadBdiLogs()');__ev('switchBdiTab("nt")')});
 const P2=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel td.r')].map(x=>x.textContent).join(','));
 ok(P2==='1808,0901','touch girilen 2001 listeden dustu: '+P2);
 // ---- Gunun akisi ----
 await p.evaluate(()=>{(__ev('_bdiBriefMode="feed"'),__ev('switchBdiTab("brief")'))});await p.waitForTimeout(200);
 const F=await p.evaluate(()=>{const row=[...document.querySelectorAll('#bdiBriefBody .bd-fd-row')].find(r=>/hiç dokunulmadı/.test(r.textContent));if(!row)return null;const t=row.textContent;row.click();return t});
 await p.waitForTimeout(150);
 const F2=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody .bd-nt-tab td.r')].map(x=>x.textContent).join(','));
 ok(F&&/^2hiç dokunulmadı1808, 0901/.test(F)&&/sebepler girildi/.test(F)&&F2==='1808,0901','Gunun akisi > Dikkat: "hiç dokunulmadı" satiri, acinca sebep tablosu: '+F);
 // ---- rapor ----
 await p.evaluate(()=>{__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()')});
  const html=await p.evaluate(()=>{__ev('bdiNtDateSet')('2026-11-02');return window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')})});
 const RR=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return {cats:(d.querySelector('.cats')||{}).textContent||'',items:[...d.querySelectorAll('.summary .item')].map(x=>x.textContent).join(' | '),gh:[...d.querySelectorAll('tr.gh')].map(x=>x.textContent),rows:[...d.querySelectorAll('table.gtab tbody tr:not(.gh)')].map(r=>[...r.children].map(c=>c.textContent).join(' | '))}},html);
 console.log('  '+RR.items+'\n  '+RR.cats+'\n  '+RR.gh.join(' || ')+'\n  '+RR.rows.join('\n  '));
 ok(/^2\/9Guests Not Touched/.test(RR.items)&&/DND 1\s*·\s*Other 1/.test(RR.cats),'ayri Butler Didn\'t Do It raporu: 2/8 dokunulmadi, DND 1 · Other 1');
 ok(/^Kresimir Brodan0901since 31\.10 · 2 nights · not touched$/.test(RR.gh[0])&&/^Armand Beaumont De Gramont1808since 25\.10 · 8 nights · not touched$/.test(RR.gh[1])&&RR.rows.some(r=>/^Zafer Karagaçtı \| Other \| — \| — \| Guest resting, two knocks$/.test(r))&&RR.rows.some(r=>/^Beyza Nur Çırak \| DND/.test(r)),'misafir bantlari: oda, ne zamandir otelde, kat butleri, sebep + not');
 const X=await p.evaluate(()=>{let wb=null;const o=XLSX.writeFile;XLSX.writeFile=w=>{wb=w};try{__ev('downloadDidntDoItXlsx(true)')}finally{XLSX.writeFile=o}return {n:wb.SheetNames,a:XLSX.utils.sheet_to_json(wb.Sheets["Butler Didn't Do It"]||{})}});
 ok(X.n.includes("Butler Didn't Do It")&&X.a.length===2&&X.a.some(r=>r['Why not touched']==='Other'&&r.Note==='Guest resting, two knocks'&&r['Floor butler']==='Zafer Karagaçtı'),'Excel: "Butler Didn\'t Do It" sayfasi');
 fs.writeFileSync(__dirname+'/did/ntrep.html',html);
 // ---- ertesi gun (03.11): in-house raporu yok -> 02.11'den tahmin; 1808 cikis raporunda (erken cikti) ----
 await p.evaluate(()=>{const KV=__ev('BdiKV');KV.set('bdi_dep_v1',JSON.stringify({days:{'2026-11-03':{at:Date.now(),file:'dep.pdf',rows:[{room:'1808',name:'De Gramont,Armand Beaumont,Mr.',arr:'2026-10-25',dep:'2026-11-03',st:'CKOT',time:'10:30'}]}}}));__ev('_bdiDepAll=null');
   document.getElementById('bdiDate').value='2026-11-03';__ev('loadBdiLogs()');__ev('switchBdiTab("nt")');__ev('bdiNtDateSet')('2026-11-03')});
 const P3=await p.evaluate(()=>{const e=document.getElementById('bdiNtPanel');return {note:(e.querySelector('.bd-note')||{}).textContent||'',rooms:[...e.querySelectorAll('td.r')].map(x=>x.textContent).join(','),n:[...e.querySelectorAll('td.n')].map(x=>x.textContent).join(','),prev:(e.querySelector('.bd-nt-prev')||{}).textContent||''}});
 ok(/02\.11 raporundan tahmin/.test(P3.note)&&P3.rooms==='0901'&&P3.n==='3 gecedir'&&/^02\.11: DND aynısı$/.test(P3.prev),'03.11: tahmini liste (1808 erken cikti, dustu), 0901 3 gecedir, dunun sebebi onerildi: '+P3.prev);
 await p.click('#bdiNtPanel .bd-nt-prev .bd-link');await p.waitForTimeout(100);
 const P4=await p.evaluate(k=>JSON.parse(__ev('BdiKV').get('bdi_nt_v1'))['2026-11-03'][k].r,gk.b);
 ok(P4==='DND','"aynısı" dunun sebebini bugune kopyaladi');
 const sa=await p.evaluate(()=>window.__t.capture(function(){return __ev('bdiNtDownload()')}));
 ok(/The <b>Butler<\/b> Didn't Do It\./.test(sa)&&/03\.11\.2026/.test(sa)&&/<i>0901<\/i>/.test(sa)&&/estimated from the latest in-house report/.test(sa),'Kapsam > "Raporu indir": tek basina Butler Didn\'t Do It raporu (tahmin notuyla)');
 fs.writeFileSync(__dirname+'/did/ntalone.html',sa);
 // ---- senkron (ortak klasor dosyasi): uzaktaki daha yeni sebep kazanir, dosyaya nt + inh yazilir ----
 const SY=await p.evaluate(async k=>{let content=JSON.stringify({version:1,issues:[],nt:{'2026-11-02':{[k]:{r:'Privacy request',n:'',u:Date.now()+5000}}},inh:{'2026-10-20':{at:1,rows:[{room:'0505',name:'Old,Guest',arr:'2026-10-18',dep:'2026-10-22'}]}}});
   const fh={getFile:async()=>({text:async()=>content}),createWritable:async()=>({write:async t=>{content=t},close:async()=>{}})};const dir={getFileHandle:async()=>fh};
   await __ev('_bdiExtSyncFile')(dir);const o=JSON.parse(content);
   return {loc:JSON.parse(__ev('BdiKV').get('bdi_nt_v1'))['2026-11-02'][k].r,fileNt:!!(o.nt&&o.nt['2026-11-03']),fileInh:Object.keys(o.inh||{}).sort().join(','),locInh:Object.keys(__ev('bdiInhStore')().days).sort().join(',')}},gk.b);
 ok(SY.loc==='Privacy request'&&SY.fileNt&&SY.fileInh==='2026-10-20,2026-11-02'&&SY.locInh==='2026-10-20,2026-11-02','senkron: sebepler ve gunluk oteldekiler esitlendi '+JSON.stringify(SY));
 ok(errs.length===0,'JS hatasi yok '+JSON.stringify(errs));
 await p.evaluate(()=>{document.getElementById('bdiDate').value='2026-11-02';__ev('loadBdiLogs()');__ev('switchBdiTab("nt")');__ev('bdiNtDateSet')('2026-11-02')});await p.waitForTimeout(150);
 await (await p.$('#bdiNtPanel')).screenshot({path:__dirname+'/did/nt_panel.png'});
 const v=await ctx.newPage();await v.goto('file://'+__dirname+'/did/ntrep.html');await v.waitForTimeout(300);
 await b.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
