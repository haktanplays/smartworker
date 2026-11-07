const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000},deviceScaleFactor:1.5});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-02T19:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-02');localStorage.setItem('sw_dayfix','2026-11-02');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak','Zafer Karagaçtı']))});await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const R=(room,name,arr,dep,acc)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:acc||[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-02',at:Date.now(),file:'gih.pdf',rows:[
     R('0805','Hollinsby,Kirsten,Mrs.','2026-10-30','2026-11-05'),R('0901','Brodan,Kresimir,Mr.','2026-10-31','2026-11-06'),
     R('1004','Uslubas,Baturalp,Mr.','2026-11-01','2026-11-04'),R('1808','De Gramont,Armand Daniel,Mr.','2026-10-25','2026-11-08'),R('2001','Mardanov,Ilyar,Mr.','2026-11-02','2026-11-05')]}));
   __ev('_bdiGih=null');
   const L=(id,room,guest,d,t)=>({id,butler:'Beyza Nur Çırak',room,guest,action:'Turndown',touchCategory:'Service',patternType:'service',note:'',time:t,sentence:'x',ts:new Date(d+'T'+t+':00+03:00').getTime(),countsAsTouch:true});
   KV.set('bdi_2026-10-31',JSON.stringify([L('a1','0805','Kirsten Hollinsby','2026-10-31','20:00')]));
   KV.set('bdi_2026-11-01',JSON.stringify([L('a2','1004','Baturalp Uslubas','2026-11-01','16:00')]));
   KV.set('bdi_2026-11-02',JSON.stringify([L('a3','0805','Kirsten Hollinsby','2026-11-02','10:00')]));
   __ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-02';__ev('bdiFloorSetCount(2)');__ev('bdiFloorAssign(0,"Beyza Nur Çırak")');__ev('bdiFloorAssign(1,"Zafer Karagaçtı")');__ev('loadBdiLogs()');__ev('bdiNtTabBadge()')});
 const badge=await p.evaluate(()=>document.getElementById('bdiNtTabCount').textContent);
 await p.evaluate(()=>__ev('switchBdiTab("nt")'));await p.waitForTimeout(200);
 const H=await p.evaluate(()=>({th:[...document.querySelectorAll('#bdiNtPanel thead th')].map(x=>x.textContent).join('|'),rooms:[...document.querySelectorAll('#bdiNtPanel td.r')].map(x=>x.textContent).join(','),cov:document.getElementById('bdiNtCov').textContent}));
 ok(badge==='3'&&H.rooms==='1808,0901,2001'&&H.th==='|Oda|Misafir|Otelde|Kat|Why not touched|Plan|Who will see|Note','"Didn\'t Do It" sekmesi (3): alanlar Why not touched · Plan · Who will see · Note: '+H.th);
 ok(/Butler Didn't Do It: 3 \/ 5 misafir/.test(H.cov)&&/kapsama %40/.test(H.cov),'Kapsam\'ta yalniz ozet satiri + "aç": '+H.cov);
 const gk=await p.evaluate(()=>({d:__ev('bdiGuestKey')('Armand Daniel De Gramont'),b:__ev('bdiGuestKey')('Kresimir Brodan'),m:__ev('bdiGuestKey')('Ilyar Mardanov')}));
 const row=k=>`#bdiNtPanel tr:has(input.bd-nt-chk[data-g="${k}"])`;
 await p.selectOption(row(gk.d)+' select[data-f="r"]','DND');await p.waitForTimeout(80);
 await p.selectOption(row(gk.d)+' select[data-f="f:plan"]','Turndown note');await p.waitForTimeout(80);
 await p.selectOption(row(gk.d)+' select[data-f="f:who"]','Zafer Karagaçtı');await p.waitForTimeout(80);
 await p.fill(row(gk.d)+' input[data-f="n"]','DND all day, card under door');await p.press(row(gk.d)+' input[data-f="n"]','Tab');await p.waitForTimeout(80);
 let st=await p.evaluate(k=>JSON.parse(__ev('BdiKV').get('bdi_nt_v1'))['2026-11-02'][k],gk.d);
 ok(st.r==='DND'&&st.f.plan==='Turndown note'&&st.f.who==='Zafer Karagaçtı'&&st.n==='DND all day, card under door','satir alanlari tek tek dolduruldu (sebep, plan, kim gorecek, not)');
 // toplu: 0901 ve 2001'e Plan = Courtesy call, sebep = Guest not in room
 await p.check(row(gk.b)+' .bd-nt-chk');await p.check(row(gk.m)+' .bd-nt-chk');
 await p.selectOption('#bdiNtBulkF','plan');await p.selectOption('#bdiNtBulkVal','Courtesy call');await p.click('#bdiNtPanel .bd-nt-bulk button.bd-btn');await p.waitForTimeout(120);
 await p.check(row(gk.b)+' .bd-nt-chk');await p.check(row(gk.m)+' .bd-nt-chk');
 await p.selectOption('#bdiNtBulkF','reason');await p.selectOption('#bdiNtBulkVal','Guest not in room');await p.click('#bdiNtPanel .bd-nt-bulk button.bd-btn');await p.waitForTimeout(120);
 st=await p.evaluate(g=>{const d=JSON.parse(__ev('BdiKV').get('bdi_nt_v1'))['2026-11-02'];return [d[g.b],d[g.m]]},gk);
 ok(st.every(x=>x.f.plan==='Courtesy call'&&x.r==='Guest not in room'),'toplu doldurma: isaretli 2 satira Plan ve sebep tek seferde');
 // Ayarlar: alan ekle / cikar
 await p.evaluate(()=>{__ev('showPage("settings")');document.querySelectorAll('.settings-body').forEach(x=>x.style.display='block')});await p.waitForTimeout(150);
 const S0=await p.evaluate(()=>[...document.querySelectorAll('#bdiCfg_ntf .bdicfg-r:not(.bdicfg-new)')].map(r=>r.textContent.includes('Why not touched')?'FIX':(r.querySelector('input[data-f="l"]')||{}).value).join(','));
 ok(S0==='FIX,Plan,Who will see,Note','Ayarlar > "Butler Didn\'t Do It: alanlar": sebep sabit + Plan, Who will see, Note');
 await p.fill('#bdiCfg_ntf .bdicfg-new input[data-new="l"]','Follow-up time');await p.selectOption('#bdiCfg_ntf .bdicfg-new select[data-new="t"]','text');await p.click('#bdiCfg_ntf .bdicfg-new button');await p.waitForTimeout(80);
 await p.evaluate(()=>{const r=[...document.querySelectorAll('#bdiCfg_ntf .bdicfg-r:not(.bdicfg-new)')].find(x=>(x.querySelector('input[data-f="l"]')||{}).value==='Plan');[...r.querySelectorAll('button')].find(b=>b.textContent==='Sil').click()});
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("nt")')});await p.waitForTimeout(150);
 const H2=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel thead th')].map(x=>x.textContent).join('|'));
 ok(H2==='|Oda|Misafir|Otelde|Kat|Why not touched|Who will see|Note|Follow-up time','alan eklendi (Follow-up time) ve cikarildi (Plan): '+H2);
 const kept=await p.evaluate(k=>JSON.parse(__ev('BdiKV').get('bdi_nt_v1'))['2026-11-02'][k].f.plan,gk.d);
 ok(kept==='Turndown note','cikarilan alanin eski degeri saklandi (geri eklenirse doner)');
 await p.evaluate(()=>{localStorage.removeItem('bdi_nt_fields');__ev('renderBdiNt()')}); // varsayilana don
 // 03.11: 0901'e touch -> donusum; 1808 erken cikti
 await p.evaluate(()=>{const KV=__ev('BdiKV');KV.set('bdi_2026-11-03',JSON.stringify([{id:'c1',butler:'Beyza Nur Çırak',room:'0901',guest:'Kresimir Brodan',action:'Turndown',touchCategory:'Service',patternType:'service',note:'',time:'10:00',sentence:'x',ts:new Date('2026-11-03T10:00:00+03:00').getTime(),countsAsTouch:true}]));
   KV.set('bdi_dep_v1',JSON.stringify({days:{'2026-11-03':{at:Date.now(),file:'dep.pdf',rows:[{room:'1808',name:'De Gramont,Armand Daniel,Mr.',arr:'2026-10-25',dep:'2026-11-03',st:'CKOT',time:'11:30'}]}}}));__ev('_bdiDepAll=null');__ev('bdiDayHistReset()')});
 await p.evaluate(()=>__ev('bdiNtDateSet')('2026-11-03'));await p.waitForTimeout(150);
 const C=await p.evaluate(()=>(document.querySelector('#bdiNtPanel .bd-nt-conv')||{}).textContent||'');
 ok(/1 misafir dünkü listeden bugün dokunuldu: 0901 Kresimir Brodan/.test(C),'donusum: dunun listesinden bugun dokunulan gorunur: '+C);
 // rapor (sekmeden, 02.11)
 await p.evaluate(()=>__ev('bdiNtDateSet')('2026-11-02'));
 const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')}));
 fs.writeFileSync(__dirname+'/did/didnt.html',html);
 const R=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return {h1:d.querySelector('.header h1').textContent,date:d.querySelector('.header .date').textContent,items:[...d.querySelectorAll('.summary .item')].map(x=>x.textContent).join(' | '),cats:(d.querySelector('.cats')||{}).textContent,
   bsum:[...d.querySelectorAll('table.bsum tbody tr')].map(r=>r.textContent).join(' | '),th:[...d.querySelectorAll('table.gtab thead th')].map(x=>x.textContent).join('|'),gh:[...d.querySelectorAll('tr.gh')].map(x=>x.textContent).join(' || '),rows:[...d.querySelectorAll('table.gtab tbody tr:not(.gh)')].map(r=>[...r.children].map(c=>c.textContent).join(' | ')),css:d.querySelector('style').textContent.length}},html);
 console.log('  '+R.items+'\n  '+R.cats+'\n  '+R.bsum+'\n  '+R.gh+'\n  '+R.rows.join('\n  '));
 ok(R.h1==="The Butler Didn't Do It."&&/Raffles Istanbul — 02\.11\.2026/.test(R.date),'ayri rapor: "The Butler Didn\'t Do It." basligi');
 ok(/^3\/5Guests Not Touched \| 40%Touch Coverage \| 0Converted \| 0Checked Out Untouched \| 0Alerts Not Welcomed$/.test(R.items)&&/Guest not in room 2\s*·\s*DND 1/.test(R.cats),'ozet seridi (negatif): 3/5 dokunulmadi, %40 kapsama, donusen, cikan, alert + sebep satiri');
 ok(/Zafer Karagaçtı15\+220%/.test(R.bsum)&&/Beyza Nur Çırak7-143167%/.test(R.bsum)&&R.th==='Floor|Why not touched|Plan|Who will see|Note','butler-kat tablosu ve alan sutunlari: '+R.th);
 ok(/Armand Daniel De Gramont18080?since 25\.10 · 8 nights · not touched/.test(R.gh.replace(/\s/g,' '))&&R.rows.some(r=>/^Zafer Karagaçtı \| DND \| Turndown note \| Zafer Karagaçtı \| DND all day, card under door$/.test(r)),'misafir bantlari (koyu serit) ve satirda alanlar');
 const B=await p.evaluate(()=>{document.getElementById('bdiDate').value='2026-11-02';__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()');return window.__t.capture(function(){return __ev('downloadDidIt()')})});
 const same=await p.evaluate(([a,b])=>{const s=h=>new DOMParser().parseFromString(h,'text/html').querySelector('style').textContent;return s(a)===s(b)},[html,B]);
 ok(same&&!/ntsec|In-house Not Touched/.test(B),'Butler Did It raporuyla birebir ayni stil; Butler Did It raporunda artik bu bolum yok');
 // donem (Log: hafta 02-03.11 icinde ozel aralik)
 const RG=await p.evaluate(()=>{document.getElementById('bdiRangeStart').value='2026-11-02';document.getElementById('bdiRangeEnd').value='2026-11-03';__ev('setBdiView("custom")');return window.__t.capture(function(){return __ev('downloadDidntDoIt()')})});
 const RR=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return {items:[...d.querySelectorAll('.summary .item')].map(x=>x.textContent).join(' | '),secs:[...d.querySelectorAll('.isec-h h2')].map(x=>x.textContent).join(','),th:[...d.querySelectorAll('table.gtab thead th')].map(x=>x.textContent).join('|'),left:[...d.querySelectorAll('.isec')].map(x=>x.textContent).join(' || ')}},RG);
 console.log('  '+RR.items+'\n  '+RR.secs);
 ok(/1Converted/.test(RR.items)&&/Checked Out Without a Touch/.test(RR.secs)&&/Converted/.test(RR.secs)&&/1808/.test(RR.left)&&RR.th.startsWith('Date|'),'donem raporu: Date sutunu, donusen (0901), dokunulmadan cikan (1808) bolumleri');
 const X=await p.evaluate(()=>{let wb=null;const o=XLSX.writeFile;XLSX.writeFile=w=>{wb=w};try{__ev('downloadDidntDoItXlsx()')}finally{XLSX.writeFile=o}return {n:wb.SheetNames,a:XLSX.utils.sheet_to_json(wb.Sheets["Butler Didn't Do It"])}});
 ok(X.n.join()==="Butler Didn't Do It,Checked out untouched,Converted"&&X.a.some(r=>r.Plan==='Turndown note'&&r['Why not touched']==='DND'),'Excel: sayfalar '+X.n.join(', '));
 const lb=await p.evaluate(()=>[...document.querySelectorAll('#bdiTab_log button')].map(b=>b.textContent).filter(t=>/Didn't/.test(t)).length);
 ok(lb===1,'Log sekmesinde "Didn\'t Do It" rapor dugmesi (ayni donem)');
 ok(errs.length===0,'JS hatasi yok '+JSON.stringify(errs));
 await p.evaluate(()=>{__ev('switchBdiTab("nt")');__ev('bdiNtDateSet')('2026-11-02')});await p.waitForTimeout(150);
 await (await p.$('#bdiNtPanel')).screenshot({path:__dirname+'/did/didnt_tab.png'});
 const v=await ctx.newPage();await v.goto('file://'+__dirname+'/did/didnt.html');await v.waitForTimeout(300);await v.screenshot({path:__dirname+'/did/didnt_rep.png',fullPage:false});
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
