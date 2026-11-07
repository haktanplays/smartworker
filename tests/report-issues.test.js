// Issue Excel'i (ServiceRequests) ile: temas olmadan kapanan issue ("Kim ilgilendi?" > Misafir butlerla görüşmeden çıktı ve
// acik issue'da "Temas olmadan kapat"), Butler Did It raporu ve Excel'i (Guest Issues / Issues sayfasi), metinden otomatik takip
// (follow-up required / no need). Isimler kurgu (KVKK). (Gercek raporlu nctest, fureal ve alertfix'in issue bolumunun yerine, 2026-11-07.)
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',J=JSON.stringify;
const HDR=['Start Date & Time','Service Type','Room #','Guest Name','Concern Details','Status','Department','Category','Sub Category','Completed Date & Time','Action Plan','Assigned To','Deadline','Action Status','Request Satisfaction'];
const iRow=(t,room,g,c,st,done)=>[t,'Guest Issue / Recovery',room,g,c,st||'New','Rooms','Room','',done||t,'','',t,'',''];
const ROWS=[iRow('06.11.2026 07:00','0802','Iris Fenwick','Late check-out request was declined at the front desk','Completed','06.11.2026 07:57'),
  iRow('06.11.2026 08:00','0705','Leonie Brandt','Housekeeping missed the turndown','Completed','06.11.2026 09:00'),
  iRow('06.11.2026 08:30','1301','Hugo Pemberton','Coffee machine was not working','Completed','06.11.2026 10:00'),
  iRow('06.11.2026 09:00','2003','Iris Arden','Noise from the corridor at night. Follow-up required tomorrow morning.'),
  iRow('06.11.2026 09:10','1108','Jonah Bellamy','Kettle replaced. Will follow up with the guest this evening.'),
  iRow('06.11.2026 09:20','1712','Kestrel Corvin','Pillow menu requested; needs a follow-up after delivery.'),
  iRow('06.11.2026 09:30','','Omar Qadir','Limousine was late. Follow-up is required.'),
  iRow('06.11.2026 09:40','1405','Lucan Dalloway','TV remote missing. Follow-up required.','Completed','06.11.2026 10:30'),
  iRow('06.11.2026 09:50','0909','Iris Ellery','Room too warm. Follow-up required. Update: guest is happy, no need to follow up.'),
  iRow('06.11.2026 10:00','1302','Lucan Fenwick','Asked about spa hours. No further follow-up is required.')];
const IN=[['0802','Fenwick,Iris,Mx.'],['0705','Brandt,Leonie,Ms.'],['1301','Pemberton,Hugo,Mr.'],['2003','Arden,Iris,Mx.'],['1108','Bellamy,Jonah,Mx.'],['1712','Corvin,Kestrel,Mx.'],
  ['1405','Dalloway,Lucan,Mx.'],['0909','Ellery,Iris,Mx.'],['1302','Fenwick,Lucan,Mx.']].map(([room,name])=>({room,name,arr:'2026-11-04',dep:'2026-11-09'}));

(async()=>{const {br,p,ok,done,dlg}=await H.open({today:D,time:'14:00',butlers:['Can Demir','Nazlı Erten'],me:'Can Demir'});
 await H.ingest(p,await R.gih({day:D,time:'06:00',rows:IN},br),'GIH01102.pdf');
 let m=await p.evaluate(async([H0,rows])=>{const X=__ev('XLSX'),wb=X.utils.book_new();X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([H0].concat(rows)),'ServiceRequests');
   const f=new File([X.write(wb,{type:'array',bookType:'xlsx'})],'ServiceRequests.xlsx',{lastModified:Date.now()});const r=await __ev('swRepIngest')([f],'elle');return r[0].type+' | '+r[0].msg},[HDR,ROWS]);
 ok(/^issue \| 10 yeni/.test(m),'issue Excel\'i Rapor Merkezi\'nde tanındı: '+m);
 const I=await p.evaluate(()=>{const o={};__ev('bdiGetIssues()').forEach(x=>o[x.room||x.guest]=x.id);return o});

 // ---- otomatik takip: metnin son hali ----
 const TS=await p.evaluate(()=>{const o={};__ev('bdiGetIssues()').forEach(x=>o[x.room||'odasız']=__ev('bdiFuTextState')(x.concern));return o});
 const req=Object.keys(TS).filter(k=>TS[k]==='req').sort().join(','),no=Object.keys(TS).filter(k=>TS[k]==='no').sort().join(',');
 ok(req==='1108,1405,1712,2003,odasız'&&no==='0909,1302','metin sınıflaması: follow-up gerekli = 2003, 1108, 1712, 1405, odasız Omar; gerekmiyor = 0909 (son güncelleme), 1302 '+J({req,no}));
 const FU=await p.evaluate(()=>{__ev('bdiFuSweep()');return __ev('bdiFuList()').filter(f=>f.src==='auto'&&f.st==='open').map(f=>f.room||f.guest).sort().join(',')});
 ok(FU==='1108,1712,2003,Omar Qadir','4 otomatik takip açıldı (kapanmış 1405 ve "no need" olanlara açılmadı): '+FU);

 // ---- kapanmis issue: "Kim ilgilendi?" > temas olmadan cikti ----
 await H.tab(p,'issues');await p.evaluate(()=>__ev('bdiIssueSetFilter("all")'));await p.waitForTimeout(300);
 const opt=await p.evaluate(id=>{const s=document.getElementById('bdiIsCB_'+id);if(!s)return null;const g=[...s.querySelectorAll('optgroup')].find(x=>x.label==='Temas olmadan kapandı');
   return g?[...g.querySelectorAll('option')].map(o=>o.value+'='+o.textContent):[]},I['0802']);
 ok(opt&&opt.includes('__nc:guest=Misafir butlerla görüşmeden çıktı'),'"Kim ilgilendi?" listesinde "Misafir butlerla görüşmeden çıktı" seçeneği (Temas olmadan kapandı grubunda) '+J(opt));
 // o gun hic touch yokken de rapor cikar (temassiz cikis var)
 await p.evaluate(id=>{document.getElementById('bdiIsCB_'+id).value='__nc:guest';document.getElementById('bdiIsCN_'+id).value='FO handled it at check-out';__ev('bdiIssueConfirmFrom')(id)},I['0802']);
 const cap=()=>p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("log")');return window.__t.capture(()=>__ev('downloadDidIt()'))});
 const parse=h=>p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return {sum:[...d.querySelectorAll('.summary .item')].map(i=>i.textContent.replace(/\s+/g,' ').trim()),
   isum:(d.querySelector('.isec-sum')||{}).textContent||'',iss:[...d.querySelectorAll('.iss')].map(x=>x.textContent.replace(/\s+/g,' ').trim())}},h);
 let html=await cap(),RP=await parse(html);
 ok(RP.iss.length===1&&/0802/.test(RP.iss[0]),'o gün hiç touch yokken de rapor çıktı (temassız çıkış var) '+J(RP.iss));
 const S1=await p.evaluate(id=>{const is=__ev('bdiGetIssues()').find(x=>x.id===id),e=is.events.find(e=>e.type==='nocontact'&&!e.del),s=__ev('bdiIssueState')(is);
   return {at:e&&__ev('bdiHm')(e.ts),by:e&&e.by,text:e&&e.text,h:Object.keys(s.handlers||{}).length,logs:__ev('loadBdiArrayForDate')('2026-11-06').filter(l=>l.meta&&l.meta.issueId===id).length}},I['0802']);
 ok(S1.at==='07:57'&&S1.by==='guest'&&S1.text==='FO handled it at check-out','kayıt: kapanış saatine (07:57) "temas olmadan çıktı" + not '+J(S1));
 const C1=await p.evaluate(id=>{const a=document.getElementById('bdiIs_'+id);return {txt:a.textContent.replace(/\s+/g,' '),cb:!!document.getElementById('bdiIsCB_'+id)}},I['0802']);
 ok(!C1.cb&&/Temas olmadan çıktı/.test(C1.txt)&&S1.h===0,'kartta "Kim ilgilendi?" satırı kalktı, yerine "Temas olmadan çıktı"; kimse temas eden sayılmadı');
 ok(S1.logs===0,'Butler Did It touch\'ı yazılmadı');

 // ikinci issue (0705): Can Demir kapatmis -> 1 butler action; 1301 hic isaretlenmedi
 await p.evaluate(id=>__ev('bdiIssueConfirm')(id,'Can Demir','Arranged a late turndown'),I['0705']);
 html=await cap();RP=await parse(html);
 const nc=RP.iss.find(x=>/^0802/.test(x))||'';
 ok(/No contact/.test(nc)&&/Guest left without butler contact\. FO handled it at check-out/.test(nc),'raporda 0802: "No contact" + "Guest left without butler contact. FO handled it at check-out" ('+nc.slice(0,200)+')');
 ok(/^2 issues · 1 butler action/.test(RP.isum.trim())&&RP.sum.some(x=>/^1 ?Total Touches/.test(x)),'özet: 2 issue, 1 butler action; Total Touches 1 (temassız çıkış touch sayılmaz) '+J({i:RP.isum,s:RP.sum[0]}));
 ok(!RP.iss.some(x=>/1301/.test(x)),'işaretlenmeyen kapalı issue (1301) raporda yok');
 const XL=await p.evaluate(()=>{const X=__ev('XLSX'),w=X.writeFile;let wb=null;X.writeFile=b=>{wb=b};try{__ev('downloadDidItXlsx()')}finally{X.writeFile=w}
   return wb&&wb.Sheets.Issues?X.utils.sheet_to_json(wb.Sheets.Issues).map(r=>r.Room+'|'+r.Action+'|'+r['What the butler did']):null});
 ok(XL&&XL.includes('0802|No contact|Guest left without butler contact. FO handled it at check-out'),'Excel Issues sayfasında da '+J(XL));
 await p.evaluate(()=>{const s=document.getElementById('bdiFilterButler');s.value='Can Demir'});
 html=await cap();RP=await parse(html);
 ok(!RP.iss.some(x=>/^0802/.test(x))&&RP.iss.some(x=>/^0705/.test(x)),'butler filtresi açıkken temassız çıkış eklenmez '+J(RP.iss.map(x=>x.slice(0,4))));
 await p.evaluate(()=>{document.getElementById('bdiFilterButler').value=''});

 // issue gecmisi ve geri alma
 await H.tab(p,'issues');await p.evaluate(id=>{__ev('_bdiIssueOpen')[id]=true;__ev('renderBdiIssues()')},I['0802']);await p.waitForTimeout(200);
 const TL=await p.evaluate(id=>[...document.querySelectorAll('#bdiIs_'+id+' .bd-tl li')].map(li=>li.textContent.replace(/\s+/g,' ').trim()),I['0802']);
 ok(TL.some(t=>/Temas olmadan çıktı/.test(t)&&/07:57/.test(t)),'issue geçmişinde "Temas olmadan çıktı" satırı: '+J(TL));
 await p.evaluate(id=>{const is=__ev('bdiGetIssues()').find(x=>x.id===id),e=is.events.find(e=>e.type==='nocontact'&&!e.del);__ev('bdiIssueEvDelete')(id,e.id)},I['0802']);await p.waitForTimeout(200);
 ok(await p.evaluate(id=>!!document.getElementById('bdiIsCB_'+id),I['0802']),'"sil" ile geri alınır; "Kim ilgilendi?" satırı geri gelir');

 // ---- acik issue: "Temas olmadan kapat" ----
 await p.evaluate(id=>{__ev('_bdiIssueOpen')[id]=true;__ev('renderBdiIssues()')},I['1302']);await p.waitForTimeout(200);
 const btn=await p.evaluate(id=>[...document.querySelectorAll('#bdiIs_'+id+' button')].some(b=>/Temas olmadan kapat/.test(b.textContent))&&!!document.getElementById('bdiIsNcPick_'+id),I['1302']);
 ok(btn,'açık issue kartında "Temas olmadan kapat"');
 await p.evaluate(id=>{document.getElementById('bdiIsNcPick_'+id).value='mgmt';const n=document.getElementById('bdiIsNcNote_'+id)||document.getElementById('bdiIsN_'+id);n.value='Duty manager called the guest';__ev('bdiIssueCloseNC')(id)},I['1302']);
 const S2=await p.evaluate(id=>{const is=__ev('bdiGetIssues()').find(x=>x.id===id),e=is.events.find(e=>e.type==='nocontact'&&!e.del);
   return {st:__ev('bdiIssueState')(is).status,by:e&&e.by,t:e&&e.text,logs:__ev('loadBdiArrayForDate')('2026-11-06').filter(l=>l.meta&&l.meta.issueId===id).length}},I['1302']);
 ok(S2.st==='closed'&&S2.by==='mgmt'&&S2.t==='Duty manager called the guest'&&S2.logs===0,'issue kapandı, "temas olmadan" + not, touch yazılmadı '+J(S2));
 html=await cap();RP=await parse(html);
 const n2=RP.iss.find(x=>/^1302/.test(x))||'';
 ok(/No contact/.test(n2)&&/Closed by Management, no butler contact\. Duty manager called the guest/.test(n2),'raporda Guest Issues: "No contact" + neden + not ('+n2.slice(0,200)+')');
 console.log('  pencereler: '+J(dlg));
 await done();
})();
