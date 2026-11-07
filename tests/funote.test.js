// Takip: "ne yapildi" notu (2026-11-05, Haktan: "takiplere ne yapildigini ekleyebildigim bir yer bulamadim")
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-05T10:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-05');localStorage.setItem('sw_dayfix','2026-11-05');localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus','Onur Kaya']));localStorage.setItem('bdi_me','Deniz Karavus')});
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const Rw=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-05',at:Date.now(),file:'g.pdf',rows:[Rw('1802','Sato,Kenji,Mr.','2026-11-02','2026-11-09'),Rw('1203','Morel,Claire,Ms.','2026-11-03','2026-11-08')]}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()');
   __ev('bdiSaveIssues')([{id:'iA',room:'1203',guest:'Claire Morel',concern:'Noise from the corridor. Needs follow-up.',createdAt:Date.now()-3*36e5,u:1,events:[{id:'e1',ts:Date.now()-3*36e5,type:'import'}]}]);
   __ev('showPage("didit")');__ev('switchBdiTab("fu")')});
 await p.waitForTimeout(300);
 await p.fill('#bdiFuQ','1802 17:00 tekne saatini teyit et');await p.press('#bdiFuQ','Enter');await p.waitForTimeout(300);
 const ids=await p.evaluate(()=>{const o=__ev('bdiFuAll')();return {m:Object.keys(o).find(k=>/^fu_m_/.test(k)),i:Object.keys(o).find(k=>/^fu_is_iA/.test(k))}});
 // 1) satira dokun -> "Ne yapildi?" + Yapildi
 await p.click('#bdiFu_'+ids.m+' .bd-fu-line');await p.waitForTimeout(200);
 const ED=await p.evaluate(id=>{const ed=document.querySelector('#bdiFuPanel .bd-fu-ed');return {ph:(document.getElementById('bdiFuDn_'+id)||{}).placeholder||'',btn:[...ed.querySelectorAll('button.bd-btn')].map(b=>b.textContent+(b.classList.contains('bd-btn-primary')?'*':'')).join('|')}},ids.m);
 ok(/^Ne yapıldı\?/.test(ED.ph)&&/^İlgilenildi\*\|İlgilenilemedi\|Değişikliği kaydet$/.test(ED.btn),'satır açılınca: "Ne yapıldı?" + ana düğme "İlgilenildi", altında "İlgilenilemedi": '+ED.btn);
 await p.fill('#bdiFuDn_'+ids.m,'Tekne 18:30 olarak teyit edildi, misafir memnun');await p.press('#bdiFuDn_'+ids.m,'Enter');await p.waitForTimeout(400);
 const D1=await p.evaluate(id=>{const f=__ev('bdiFuAll')()[id];const l=__ev('loadBdiArrayForDate')('2026-11-05').find(x=>x.id===f.doneLog);return {st:f.st,t:f.doneText,by:f.doneBy,s:l?l.sentence:'',row:(document.querySelector('#bdiFu_'+id)||{}).innerText||''}},ids.m);
 console.log('  '+JSON.stringify(D1));
 ok(D1.st==='done'&&D1.t==='Tekne 18:30 olarak teyit edildi, misafir memnun'&&/^Butler Deniz Karavus followed up with our guest Kenji Sato staying at Room 1802 on: Tekne 18:30 olarak teyit edildi, misafir memnun\.$/.test(D1.s),'Enter: yapıldı; Butler Did It cümlesine yazılan not girdi');
 // 2) sonradan duzelt
 await p.evaluate(()=>{document.querySelector('#bdiFuPanel details.bd-fu-more').open=true});
 await p.click('#bdiFu_'+ids.m+' .bd-fu-line');await p.waitForTimeout(200);
 const V=await p.evaluate(id=>(document.getElementById('bdiFuDn_'+id)||{}).value,ids.m);
 ok(V==='Tekne 18:30 olarak teyit edildi, misafir memnun','"Bugün yapılan"da satıra dokununca not düzenlenebilir halde');
 await p.fill('#bdiFuDn_'+ids.m,'Tekne 19:00 olarak teyit edildi');await p.click('#bdiFuPanel .bd-fu-ed button:has-text("Notu kaydet")');await p.waitForTimeout(400);
 const D2=await p.evaluate(id=>{const f=__ev('bdiFuAll')()[id];const l=__ev('loadBdiArrayForDate')('2026-11-05').filter(x=>x.meta&&x.meta.fuId===id);return {t:f.doneText,n:l.length,s:l[0]&&l[0].sentence,note:l[0]&&l[0].note,row:document.querySelector('#bdiFu_'+id).innerText.replace(/\s+/g,' ')}},ids.m);
 console.log('  '+JSON.stringify(D2));
 ok(D2.t==='Tekne 19:00 olarak teyit edildi'&&D2.n===1&&/on: Tekne 19:00 olarak teyit edildi\.$/.test(D2.s)&&/→ Tekne 19:00/.test(D2.row),'not düzeltildi: aynı Butler Did It kaydı güncellendi (çift kayıt yok), satırda "→ not" görünüyor');
 // 3) kutucuk (notsuz) eskisi gibi; issue'ya bagli takipte not issue gecmisine de
 await p.evaluate(()=>{__ev('_bdiFuOpenRow=""');__ev('renderBdiFu()')});
 await p.click('#bdiFu_'+ids.i+' .bd-fu-line');await p.waitForTimeout(200);
 // once ilgilenilemedi: takip ve issue acik kalir
 await p.selectOption('#bdiFuNr_'+ids.i,{label:'Misafir odada değildi'});await p.fill('#bdiFuDn_'+ids.i,'Kapı çalındı, not bırakmadık');await p.click('#bdiFuPanel .bd-fu-ed button:has-text("İlgilenilemedi")');await p.waitForTimeout(400);
 const T1=await p.evaluate(id=>{const f=__ev('bdiFuAll')()[id];const is=__ev('bdiIssueById')(__ev('bdiGetIssues')(),'iA');return {st:f.st,tries:(f.tries||[]).map(t=>t.why+'|'+t.en+'|'+t.by+'|'+t.note).join(),iss:__ev('bdiIssueState')(is).status,ev:is.events.length,row:document.querySelector('#bdiFu_'+id).innerText.replace(/\s+/g,' '),logs:__ev('loadBdiArrayForDate')('2026-11-05').filter(l=>l.meta&&l.meta.issueId==='iA').length}},ids.i);
 console.log('  '+JSON.stringify(T1));
 ok(T1.st==='open'&&T1.iss==='open'&&T1.ev===1&&T1.logs===0&&/^Misafir odada değildi\|Guest was not in the room\|Deniz Karavus\|Kapı çalındı, not bırakmadık$/.test(T1.tries),'İlgilenilemedi: takip AÇIK kaldı, issue açık ve dokunulmadı, touch yazılmadı; deneme kaydedildi (neden, kim, not)');
 ok(/✗ 10:00 Misafir odada değildi/.test(T1.row),'satırda kırmızı "✗ 10:00 Misafir odada değildi": '+T1.row);
 await p.clock.setFixedTime(new Date('2026-11-06T12:00:00+03:00'));
 const W=await p.evaluate(()=>__ev('swWarnCollect')().filter(x=>x.g==='Takip').map(x=>x.t).join(' | '));
 ok(/1203 Claire Morel: takip gecikti .*son deneme 10:00 Misafir odada değildi/.test(W),'Uyarılar: geciken takipte son deneme ve nedeni yazıyor');
 const RP=await p.evaluate(()=>window.__t.capture(function(){__ev('bdiFuSetRange')('f','2026-11-05');__ev('bdiFuSetRange')('t','2026-11-06');return __ev('downloadFuReport()')}));
 ok(/Attempts Not Possible/.test(RP)&&/Not possible 05\.11 10:00: Guest was not in the room/.test(RP),'raporda "Attempts Not Possible" ve satırda İngilizce neden');
 await p.evaluate(()=>{__ev('_bdiFuOpenRow=""');__ev('renderBdiFu()')});
 await p.click('#bdiFu_'+ids.i+' .bd-fu-line');await p.waitForTimeout(200);
 const TRL=await p.evaluate(()=>(document.querySelector('#bdiFuPanel .bd-fu-tries')||{}).innerText||'');
 ok(/✗ 05\.11 10:00 · Misafir odada değildi · Deniz Karavus · Kapı çalındı/.test(TRL),'satır açılınca deneme geçmişi görünüyor');
 // sonra ilgilenildi
 await p.fill('#bdiFuDn_'+ids.i,'Visited the guest, room moved to a quieter floor');await p.click('#bdiFuPanel .bd-fu-ed button:has-text("İlgilenildi")');await p.waitForTimeout(400);
 const D3=await p.evaluate(()=>{const f=Object.values(__ev('bdiFuAll')()).find(x=>x.iss==='iA');const is=__ev('bdiIssueById')(__ev('bdiGetIssues')(),'iA');const ev=is.events.find(e=>e.touchId===f.doneLog);const l=__ev('loadBdiArrayForDate')(__ev('bdiYmd')(new Date(f.doneAt))).find(x=>x.id===f.doneLog);return {st:f.st,ev:ev&&ev.text,s:l&&l.sentence,a:l&&l.action}});
 console.log('  '+JSON.stringify(D3));
 ok(D3.st==='done'&&D3.ev==='Visited the guest, room moved to a quieter floor'&&D3.a==='Issue Follow-up'&&/quieter floor/.test(D3.s),'sonra İlgilenildi: not issue geçmişine ve Butler Did It\'e (Issue Follow-up) yazıldı');
 const T2=await p.evaluate(()=>{const f=Object.values(__ev('bdiFuAll')()).find(x=>x.iss==='iA');return (f.tries||[]).length});ok(T2===1,'eski deneme geçmişte duruyor');
 // KVKK: tibbi kelime notta engellenir
 await p.fill('#bdiFuQ','1802 18:00 havlu getir');await p.press('#bdiFuQ','Enter');await p.waitForTimeout(300);
 const id3=await p.evaluate(()=>Object.values(__ev('bdiFuAll')()).find(x=>x.st==='open'&&/havlu/.test(x.t)).id);
 await p.click('#bdiFu_'+id3+' .bd-fu-line');await p.waitForTimeout(200);
 const dlg=[];p.removeAllListeners('dialog');p.on('dialog',d=>{dlg.push(d.message());d.dismiss()});
 await p.fill('#bdiFuDn_'+id3,'Guest has diabetes, brought sugar-free');await p.click('#bdiFuPanel .bd-fu-ed button:has-text("İlgilenildi")');await p.waitForTimeout(300);
 const st3=await p.evaluate(id=>__ev('bdiFuAll')()[id].st,id3);
 ok(st3==='open','tıbbi kelimeli not kaydedilmedi (KVKK uyarısı: '+(dlg[0]||'').slice(0,60)+')');
 const CF=await p.evaluate(()=>{const a=__ev('bdiCfg')('bdi_fu_fail');a.push({l:'Misafir spa\'daydı',en:'Guest was at the spa'});localStorage.setItem('bdi_fu_fail',JSON.stringify(a));__ev('_bdiFuOpenRow="'+Object.values(__ev('bdiFuAll')()).find(x=>x.st==='open').id+'"');__ev('renderBdiFu()');return {opts:[...document.querySelectorAll('#bdiFuPanel select[id^="bdiFuNr_"] option')].map(o=>o.textContent),sec:!!document.getElementById('bdiCfg_fuf')}});
 ok(CF.sec&&CF.opts.length===8&&CF.opts[7]==="Misafir spa'daydı",'nedenler Ayarlar\'dan: "Takip: ilgilenilemedi nedenleri" listesi, eklenen neden seçimde ('+CF.opts.length+')');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await (await p.$('#bdiTab_fu')).screenshot({path:__dirname+'/ui/fu_note.png'});
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
