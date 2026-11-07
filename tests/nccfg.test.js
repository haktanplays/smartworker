const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1320,height:1000},deviceScaleFactor:1.5});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 const dlg=[];let prompts=[];p.on('dialog',d=>{dlg.push(d.type()+':'+d.message().slice(0,300));if(d.type()==='prompt')d.accept(prompts.shift()||'');else d.accept()});
 await p.clock.install({time:new Date('2026-11-03T15:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-03');localStorage.setItem('sw_dayfix','2026-11-03');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak']))});await p.reload();await p.waitForTimeout(1200);
 await p.evaluate(async()=>{await __ev('BdiKV').ready();const t=new Date('2026-11-03T10:00:00+03:00').getTime();const I=(id,room,g,c,ev)=>({id,room,guest:g,concern:c,createdAt:t,u:t,events:[{id:id+'e',ts:t,type:'import'}].concat(ev||[])});
   __ev('bdiSaveIssues')([I('is1','1203','Claire Morel','Noise from the corridor.'),I('is2','0805','Kirsten Hollinsby','Late laundry.',[{id:'c2',ts:t+36e5,type:'close',butler:'',src:'report'}]),I('is3','1505','Maria Lopez','Minibar not refilled.'),
     I('is4','1601','Erdinc Binzet','TV not working.',[{id:'c4',ts:t+36e5,type:'close',butler:'',src:'manual'},{id:'n4',ts:t+36e5,type:'nocontact',butler:'',by:'',text:'',src:'manual'}]),
     I('is5','1702','Old Dept','Old record.',[{id:'c5',ts:t+36e5,type:'close',butler:'',src:'manual'},{id:'n5',ts:t+36e5,type:'nocontact',butler:'',by:'dept',text:'Engineering closed it',src:'manual'}])]);
   __ev('showPage("didit")');__ev('switchBdiTab("issues")');__ev('bdiIssueSetFilter("all")');__ev('_bdiIssueOpen.is1=true');__ev('_bdiIssueOpen.is3=true');__ev('renderBdiIssues()')});
 const st=id=>p.evaluate(id=>{const is=__ev('bdiIssueById')(__ev('bdiGetIssues')(),id),e=(is.events||[]).find(x=>x.type==='nocontact');return {st:__ev('bdiIssueState')(is).status,by:e?e.by:null,t:e?e.text:null}},id);
 // secenekler
 const O=await p.evaluate(()=>[...document.querySelectorAll('#bdiIsNcPick_is1 option')].map(o=>o.textContent));
 ok(O.join('|')==='Neden? Seç|Başka departman kapattı|Guest Relations kapattı|Misafir butlerla görüşmeden çıktı|Misafir görüşmek istemedi|Misafire ulaşılamadı|Resepsiyon kapattı|Takip gerekmiyordu|Yönetim kapattı|+ Yeni seçenek…','açık kartta "Temas olmadan kapat" açılır listesi: '+O.slice(1,-1).join(', '));
 // neden secmeden kapatilamaz
 await p.click('#bdiIs_is1 .bd-ncclose-r button');await p.waitForTimeout(150);
 let S=await st('is1');const need=await p.evaluate(()=>document.getElementById('bdiIsNcPick_is1').classList.contains('bd-nc-need'));
 ok(S.st==='open'&&dlg.some(x=>/^alert:Önce neden temas olmadan kapandığını seç/.test(x))&&need,'neden seçmeden basınca kapanmadı, uyarı verdi, kutu kırmızı');
 // yonetim + not
 await p.selectOption('#bdiIsNcPick_is1','mgmt');await p.fill('#bdiIsNcNote_is1','GM called the guest');await p.click('#bdiIs_is1 .bd-ncclose-r button');await p.waitForTimeout(200);
 S=await st('is1');const M=await p.evaluate(()=>({meta:document.querySelector('#bdiIs_is1 .bd-issue-meta').textContent,row:document.getElementById('bdiIsNcBy_is1').value}));
 ok(S.st==='closed'&&S.by==='mgmt'&&S.t==='GM called the guest'&&/Neden: Yönetim kapattı/.test(dlg.filter(x=>/^confirm/.test(x)).pop()),'Yönetim kapattı + not ile kapandı (onay penceresinde neden yazıyor)');
 ok(/Yönetim kapattı \(temas yok\) · GM called the guest/.test(M.meta)&&M.row==='mgmt','kartta "Yönetim kapattı (temas yok) · GM called the guest"; "Neden temas yok?" satırında seçili');
 // + Yeni secenek
 prompts=['Duty Manager kapattı','Closed by Duty Manager'];
 await p.selectOption('#bdiIsNcPick_is3','__new');await p.waitForTimeout(250);
 const N=await p.evaluate(()=>({v:document.getElementById('bdiIsNcPick_is3').value,cfg:JSON.parse(localStorage.getItem('bdi_nc_by')||'[]').map(x=>x.l+'='+x.en)}));
 ok(/^nc/.test(N.v)&&N.cfg.includes('Duty Manager kapattı=Closed by Duty Manager'),'"+ Yeni seçenek…": "Duty Manager kapattı / Closed by Duty Manager" listeye eklendi ve seçildi');
 await p.click('#bdiIs_is3 .bd-ncclose-r button');await p.waitForTimeout(200);S=await st('is3');
 ok(S.st==='closed'&&S.by===N.v,'yeni seçenekle kapandı');
 // kapanmis issue: Kim ilgilendi? icinde nedenler
 const G=await p.evaluate(()=>[...document.querySelectorAll('#bdiIsCB_is2 optgroup option')].map(o=>o.textContent));
 ok(G.includes('Resepsiyon kapattı')&&G.includes('Duty Manager kapattı')&&G.includes('Misafir butlerla görüşmeden çıktı')&&G[0]==='Başka departman kapattı','raporun kapattığı issue: "Kim ilgilendi?" listesinde "Temas olmadan kapandı" grubu ('+G.length+' neden)');
 await p.selectOption('#bdiIsCB_is2','__nc:rec');await p.click('#bdiIs_is2 .bd-isconf-row button');await p.waitForTimeout(200);S=await st('is2');
 ok(S.by==='rec','"Kim ilgilendi?" > "Resepsiyon kapattı" kaydedildi');
 // eski kayitlar: nedensiz -> Uyari; listeden silinen secenek etiketi korunur
 await p.evaluate(()=>{const a=JSON.parse(localStorage.getItem('bdi_nc_by'));localStorage.setItem('bdi_nc_by',JSON.stringify(a.filter(x=>x.id!=='dept')));__ev('renderBdiIssues()')});
 const W=await p.evaluate(()=>({w:__ev('swWarnCollect')().map(x=>x.t).filter(t=>/1601/.test(t)),lbl:__ev('bdiNcByLbl')('dept'),en:__ev('bdiNcByLbl')('dept',true),sel:(()=>{__ev('_bdiIssueOpen.is5=true');__ev('renderBdiIssues()');const s=document.getElementById('bdiIsNcBy_is5');return s?s.options[s.selectedIndex].textContent:''})()}));
 ok(W.w.some(t=>/temas olmadan kapandı, kimin kapattığı \/ nedeni seçilmedi/.test(t)),'nedeni boş eski kayıt (1601) Uyarılar\'da');
 ok(W.lbl==='Başka departman kapattı'&&W.en==='Closed by another department'&&W.sel==='Başka departman kapattı','listeden silinen seçenekle kapanmış eski kayıt adını korudu');
 // rapor
 await p.evaluate(()=>{document.getElementById('bdiDate').value='2026-11-03';__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()')});
 const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidIt()')}));
 const R=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return [...d.querySelectorAll('.idet')].map(x=>x.textContent)},html);
 console.log('  '+R.join('\n  '));
 ok(R.some(t=>/^Closed by Management, no butler contact\. GM called the guest/.test(t))&&R.some(t=>/^Closed by Duty Manager, no butler contact\./.test(t))&&R.some(t=>/^Closed by Reception, no butler contact\./.test(t))&&R.some(t=>/^Closed by another department, no butler contact\. Engineering closed it/.test(t)),'raporda İngilizce: Management / Duty Manager / Reception / another department');
 // ayarlar
 await p.evaluate(()=>__ev('bdiNcSettings()'));await p.waitForTimeout(300);
 const C=await p.evaluate(()=>{const el=document.getElementById('bdiCfg_nc');return {rows:el.querySelectorAll('.bdicfg-r:not(.bdicfg-new)').length,fixed:el.querySelector('.bdicfg-r .bdicfg-lock')?el.querySelector('.bdicfg-r').textContent:'',sync:__ev('SETTINGS_SYNC_KEYS').includes('bdi_nc_by'),ls:!!localStorage.getItem('bdi_nc_by')}});
 ok(C.rows===8&&/Misafir butlerla görüşmeden çıktı/.test(C.fixed)&&C.sync&&C.ls,'Ayarlar > "Issues: temas olmadan kapatma nedenleri": 8 satır (biri silindi, biri eklendi), ilki sabit; ayar senkronunda');
 await (await p.$('#bdiCfg_nc')).evaluate(e=>e.closest('.section').scrollIntoView());await (await p.$('#bdiCfg_nc')).evaluate(e=>e.closest('.section')).then(()=>{});
 const sec=await p.$('xpath=//div[@id="bdiCfg_nc"]/ancestor::div[contains(@class,"section")][1]');if(sec)await sec.screenshot({path:__dirname+'/did/nc_settings.png'});
 // ekran goruntusu: acik kart
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("issues")');const L=__ev('bdiGetIssues')();L.push({id:'is6',room:'1808',guest:'Armand De Gramont',concern:'Guest asked for a quieter room.',createdAt:Date.now()-36e5,u:1,events:[{id:'i6',ts:Date.now()-36e5,type:'import'}]});__ev('bdiSaveIssues')(L);__ev('bdiIssueSetFilter("open")');__ev('_bdiIssueOpen.is6=true');__ev('renderBdiIssues()')});await p.waitForTimeout(150);
 await (await p.$('#bdiIs_is6')).screenshot({path:__dirname+'/did/nc_close_card.png'});
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
