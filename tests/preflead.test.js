// Tercih kategorisi "cumle basi" (Used Products -> Guest uses) + toplu touch ornek cumlesi (2026-11-06)
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-06T11:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-06');localStorage.setItem('sw_dayfix','2026-11-06');localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus','Onur Kaya']));localStorage.setItem('bdi_me','Deniz Karavus')});
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const Rw=(room,name)=>({room,name,arr:'2026-11-03',dep:'2026-11-09',depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-06',at:Date.now(),file:'g.pdf',rows:[Rw('1203','Morel,Claire,Ms.'),Rw('1406','Meyer,Anna,Mrs.'),Rw('2001','Mardanov,Ilyar,Mr.')]}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()');
   const a=__ev('bdiCfgRaw')('bdi_pref_cats');a.splice(a.length-1,0,{l:'Used Products',d:'BUT',p:'Guest uses',ex:'guest uses x product'});__ev('bdiCfgSave')('bdi_pref_cats',a)});
 // 1) cumle kurali
 const S=await p.evaluate(()=>[__ev('bdiPrefSentence')('Used Products','Diptyque body lotion'),__ev('bdiPrefSentence')('Used Products','guest uses Diptyque body lotion.'),__ev('bdiPrefSentence')('Pillow','firm pillow, two extra'),__ev('bdiPrefSentence')('Bilinmeyen','x')]);
 console.log('  '+JSON.stringify(S));
 ok(S[0]==='Guest uses Diptyque body lotion'&&S[1]==='Guest uses Diptyque body lotion'&&S[2]==='Guest prefers firm pillow, two extra'&&S[3]==='Guest prefers x','cümle başı: "Guest uses …" (tekrar etmez); boş kategori ve bilinmeyen kategori "Guest prefers …"');
 // 2) Ayarlar ekrani: sutun + onizleme
 await p.evaluate(()=>{__ev('showPage("settings")')});await p.waitForTimeout(400);
 const A=await p.evaluate(()=>{const rows=[...document.querySelectorAll('#bdiCfg_pref .bdicfg-r')];const r=rows.find(x=>[...x.querySelectorAll('input')].some(i=>i.value==='Used Products'));const sens=rows.find(x=>/Sensitivity/.test(x.textContent));
   return {p:r&&[...r.querySelectorAll('input')].map(i=>i.value).join('|'),ph:r&&r.querySelectorAll('input')[1].placeholder,sens:sens&&sens.textContent.replace(/\s+/g,' ')}});
 console.log('  '+JSON.stringify(A));
 ok(A.p==='Used Products|Guest uses|guest uses x product'&&/Cümle başı/.test(A.ph),'Ayarlar: Used Products satırında "Cümle başı" kutusu (Guest uses)');
 ok(/Guest is highly sensitive towards/.test(A.sens||''),'Sensitivity satırında sabit cümle başı görünüyor');
 const PV=await p.evaluate(()=>__ev('SW_CFG_PV').bdi_pref_cats(__ev('bdiCfgRaw')('bdi_pref_cats').find(x=>x.l==='Used Products')).replace(/<[^>]+>/g,''));
 ok(/Room 1903\. Guest uses x product\./.test(PV),'Ayarlar önizlemesi: "… Guest uses x product." ('+PV.slice(0,140)+')');
 // 3) Kayit formu: tercih
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("entry")')});await p.waitForTimeout(400);
 const K=await p.evaluate(()=>{const set=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))};
   document.getElementById('bdiDate').value='2026-11-06';set('bdiButler','Deniz Karavus');document.getElementById('bdiRoom').value='1203';set('bdiTouchType','preference');try{__ev('toggleBdiPattern()')}catch(e){}
   try{__ev('bdiCfgFillForm()')}catch(e){}set('bdiPrefCategory','Used Products');__ev('bdiPrefHint()');const ph=document.getElementById('bdiPrefDetail').placeholder;
   document.getElementById('bdiPrefDetail').value='Diptyque body lotion';__ev('updateBdiPreview()');const pv=document.getElementById('bdiPreview').textContent;
   const n0=__ev('bdiLogs').length;__ev('addDidIt()');const L=__ev('bdiLogs').slice(n0);return {ph,pv,log:L.map(l=>l.room+'|'+l.note+'|'+l.sentence)}});
 console.log('  '+JSON.stringify(K,null,1));
 ok(/^Guest uses … \(örn\. guest uses x product\)$/.test(K.ph),'Kayıt: detay kutusu ipucu "Guest uses … (örn. …)"');
 ok(/Guest uses Diptyque body lotion\.$/.test(K.pv),'Kayıt önizlemesi: "… Guest uses Diptyque body lotion."');
 ok(K.log.length===1&&/^1203\|Used Products: Diptyque body lotion\|.*staying at Room 1203\. Guest uses Diptyque body lotion\.$/.test(K.log[0]),'kaydedilen cümle: "Guest uses Diptyque body lotion."');
 // 4) misafir hafizasi + Protel
 const PR=await p.evaluate(async()=>{await __ev('bdiGMIngest')();__ev('_bdiGMProf=null');const P=__ev('bdiGMProfiles')();const g=P.list.find(x=>/Morel/i.test(x.name));if(!g)return {err:'profil yok '+P.list.map(x=>x.name).join(',')};
   const ins=__ev('bdiProfileInsights')(g);const it=ins.accepted.concat(ins.pending).filter(i=>/Diptyque/.test(i.note)).map(i=>i.dept+'|'+i.note);
   for(const i of ins.pending.filter(i=>/Diptyque/.test(i.note)))await __ev('bdiInsightSet')(g.gid,i.id,'accepted',{});__ev('_bdiGMProf=null');
   const pn=__ev('bdiPlRows')().filter(r=>/Diptyque/.test(r.L.t)).map(r=>r.L.block+'|'+(r.L.sub||'')+'|'+r.L.t).join(' || ');return {it,pn}});
 console.log('  '+JSON.stringify(PR,null,1));
 ok(PR.it&&PR.it.length===1&&PR.it[0]==='BUT|Guest uses Diptyque body lotion','misafir hafızası (İçgörüler): "Guest uses Diptyque body lotion" (BUT)');
 ok(/^Guest Preferences\|BUT\|Guest uses Diptyque body lotion\./.test(PR.pn||''),'Protel çıktısı: BUT Preferences › "Guest uses Diptyque body lotion."');
 // 5) toplu ekle: yeni 4 sutun + eski 3 sutun
 const B=await p.evaluate(()=>{const r=__ev('swBulkCfg')('bdi_pref_cats',['Bath Products | HSK | Guest enjoys | aromatherapy oils','Newspaper | BUT | Financial Times daily']);const a=__ev('bdiCfgRaw')('bdi_pref_cats');const f=l=>{const x=a.find(y=>y.l===l);return x&&(x.d+'|'+(x.p||'')+'|'+x.ex)};return {add:r.add,spa:f('Bath Products'),np:f('Newspaper')}});
 ok(B.add===2&&B.spa==='HSK|Guest enjoys|aromatherapy oils'&&B.np==='BUT||Financial Times daily','Toplu ekle: 4 sütunlu satır cümle başını alır, eski 3 sütunlu satır bozulmaz ('+JSON.stringify(B)+')');
 // 6) toplu touch: ornek cumle
 const T=await p.evaluate(()=>{const set=(id,v)=>{const e=document.getElementById(id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}))};
   document.getElementById('bdiRoom').value='';set('bdiTouchType','service');try{__ev('toggleBdiPattern()')}catch(e){}
   const acts=__ev('getBdiActions')();const ti=acts.findIndex(a=>a.label==='Turndown');set('bdiAction',String(ti));
   const opened=document.getElementById('bdiBulkPanel').style.display==='block';if(!opened)__ev('bdiBulkToggle()'); // butler secili: liste kendiliginden acik
   const before=document.getElementById('bdiPreview').textContent;__ev('bdiBulkTg')('1406');__ev('bdiBulkTg')('2001');const after=document.getElementById('bdiPreview').textContent;const inp=document.getElementById('bdiRoom').value;
   __ev('bdiBulkPick')('none');__ev('bdiBulkToggle()');const closed=document.getElementById('bdiPreview').textContent;return {opened,before,after,inp,closed,room:document.getElementById('bdiRoom').value}});
 console.log('  '+JSON.stringify(T,null,1));
 ok(/^Örnek cümle \(1203; oda seçince her odaya kendi misafir adıyla\): Butler Deniz Karavus .*Room 1203/.test(T.before),'Toplu touch açılınca (oda seçmeden): altta örnek cümle (listedeki ilk oda)');
 ok(T.inp==='1406, 2001'&&/^Örnek cümle \(1406; seçili 2 odanın her birine kendi misafir adıyla\): Butler Deniz Karavus .*Anna Meyer.*Room 1406/.test(T.after),'oda seçince: Oda kutusu "1406, 2001", seçili ilk odanın misafiriyle örnek cümle');
 ok(T.opened&&T.closed===''&&T.room==='','liste butler seçilince açıktı; temizle + kapat: oda kutusu boş, örnek cümle temiz');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await p.evaluate(()=>{__ev('bdiBulkToggle()');__ev('bdiBulkTg')('1406');__ev('bdiBulkTg')('2001')});await p.waitForTimeout(200);
 const sv=await p.$('.bd-save-row');if(sv){const box=await p.$('#bdiBulkPanel');await box.screenshot({path:__dirname+'/ui/bulk_panel.png'});await sv.screenshot({path:__dirname+'/ui/bulk_preview.png'})}
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
