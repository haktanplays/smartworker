// 2026-11-07: sahibin onayladigi degisiklikler D1-D6 (+ islem ADINA bagli ayarlar yeni islemde varsayilan kurali alir).
//   D1 aksam inspection'i: takip son saati ertesi sabah 10:00, etiket "inspection: ertesi sabah 10:00"
//   D2 standart kontrol listesinin hepsi silinirse Kat turu ve iPad rehberinde standart madde yok
//   D3 ayni odada ayni eksik ikinci kez bildirilirse ikinci takip acilmaz
//   D4 Protel'e girmeyenler listesi kaydedildikten sonra eklenen islem varsayilan kurali alir (Turndown Express girmez)
//   D5 Didn't Do It 60 gunden eski donem: "Didn't Do It raporu son 2 ayı kapsar"
//   D6 elle birakilan rapor ortak klasorun Raporlar/'ina kopyalanir; Radar dogrulama + uyruk duzeltmesi ortak ayar
// Isimler kurgu (KVKK). Saat sabit.
const H=require('./h.js'),R=require('./opera/reports.js');
const A='2026-11-07',B='2026-11-08';
const J=JSON.stringify;
(async()=>{
 const {br,p,ok,done,dlg}=await H.open({today:A,time:'23:30',butlers:['Can Demir','Nazlı Erten'],me:'Can Demir'});
 await H.seed(p,{gih:[H.row('1203','Quillfeather,Ansel,Mr.','2026-11-05','2026-11-12'),H.row('1406','Brightwater,Ilse,Ms.','2026-11-04','2026-11-11')],
   kv:{bdi_floors_v1:{[A]:{n:1,blocks:[{from:1,to:99,butler:'Can Demir'}],start:'13:00',end:'23:59',u:Date.now()}}}});
 const at=hm=>p.clock.setSystemTime(new Date(A+'T'+hm+':00+03:00'));
 // Kat turu > Eksik var: i maddesine 2 kez dokun (departmana bildir) > Kaydet
 const miss=async(room,idx)=>p.evaluate(([room,idx])=>{__ev('bdiKatPanel')(room,'miss');idx.forEach(i=>{__ev('bdiKatPanelTap')(i);__ev('bdiKatPanelTap')(i)});__ev('bdiKatMissSave')(room);
   return (document.getElementById('bdiToast')||{}).textContent||''},[room,idx]);
 const fus=room=>p.evaluate(room=>__ev('bdiFuList')().filter(f=>f.kind==='insp'&&f.room===room&&f.st==='open').map(f=>({t:f.t,why:f.dueWhy,due:f.due})),room);

 // ---- D1: 23:30 inspection, HSK'ye bildirilen eksik ----
 await p.evaluate(()=>{__ev('showPage("didit")')});await p.waitForTimeout(300);
 const t1=await miss('1203',[0]);const f1=await fus('1203');console.log('  '+t1+' '+J(f1));
 ok(f1.length===1&&f1[0].why==='inspection: ertesi sabah 10:00','D1: 23:30 inspection takibinin etiketi = '+J(f1.map(f=>f.why))+' (beklenen "inspection: ertesi sabah 10:00")');
 ok(f1.length===1&&f1[0].due===Date.parse(B+'T10:00:00+03:00'),'D1: son saat ertesi sabah 10:00 = '+(f1[0]?new Date(f1[0].due).toISOString():'-'));
 // gunduz inspection'i "4 saat" kalir
 await at('14:00');await miss('1406',[0]);const f1b=await fus('1406');
 ok(f1b.length===1&&f1b[0].why==='inspection: 4 saat'&&Math.abs(f1b[0].due-Date.parse(A+'T18:00:00+03:00'))<6e4,'D1: 14:00 inspection = '+J(f1b.map(f=>f.why))+' (4 saat, 18:00)');

 // ---- D3: ayni oda, ayni eksik ikinci kez + yeni bir eksik ----
 await at('23:40');const t3=await miss('1203',[0,1]);const f3=await fus('1203');console.log('  '+t3+' '+J(f3.map(f=>f.t)));
 ok(f3.filter(f=>/Düzen ve temizlik/.test(f.t)).length===1,'D3: 1203 "Düzen ve temizlik" ikinci kez bildirildi: açık takip sayısı = '+f3.filter(f=>/Düzen ve temizlik/.test(f.t)).length+' (beklenen 1)');
 ok(f3.length===2&&/1 takip açıldı/.test(t3),'D3: aynı inspection\'daki farklı eksik yine takip açar: '+J(f3.map(f=>f.t))+' · mesaj "'+t3+'"');

 // ---- D2: standart kontrol listesinin hepsi Ayarlar'da silinir ----
 const pre2=await p.evaluate(()=>({n:__ev('bdiInspStd')().length,kat:/Her odada/.test(__ev('bdiKatHtml0()'))}));
 ok(pre2.n===5&&pre2.kat,'D2 ön koşul: 5 standart madde, Kat turu "Her odada" cümlesi var '+J(pre2));
 const s2=await p.evaluate(d=>{let k=0;while(__ev('bdiCfgRaw')('bdi_insp_std').length&&k++<20)__ev('bdiCfgDel')('bdi_insp_std',0);
   const b=__ev('bgdBuild')(d);return {std:__ev('bdiInspStd')().length,raw:localStorage.getItem('bdi_insp_std'),ipad:b.insp,kat:/Her odada/.test(__ev('bdiKatHtml0()')),items:__ev('bdiKatInspItems')(__ev('bdiKatRooms')()['1406']).length,tpl:/var STD=Array\.isArray\(G\.insp\)\?G\.insp:/.test(__ev('bgdTemplate()'))}},A);
 ok(s2.std===0&&s2.raw==='[]','D2: hepsi silinince standart liste boş kalır = '+s2.std+' (kayıt '+s2.raw+'; eskiden 5 varsayılan geri geliyordu)');
 ok(Array.isArray(s2.ipad)&&s2.ipad.length===0&&s2.tpl,'D2: iPad rehberine giden liste boş = '+J(s2.ipad)+'; rehber boş listeyi olduğu gibi kullanır = '+s2.tpl);
 ok(!s2.kat&&s2.items===0,'D2: Kat turu: "Her odada" cümlesi yok, 1406 eksik listesinde standart madde yok ('+s2.items+')');

 // ---- D4: Protel listesi kaydedildikten sonra yeni islem ----
 await at('14:10');await p.evaluate(()=>{__ev('showPage("settings")')});await p.waitForTimeout(300);
 await p.evaluate(()=>__ev('bdiProtelSkipToggle')('Turndown',true));
 const saved=await p.evaluate(()=>Array.isArray(JSON.parse(localStorage.getItem('bdi_protel_skip')||'null')));
 const add=async(label,tpl)=>{await p.evaluate(([l,t])=>{__ev('bdiamNew()');document.getElementById('bdiamLabel').value=l;document.getElementById('bdiamTemplate').value=t;__ev('bdiamSave()')},[label,tpl]);await p.waitForTimeout(150)}; // sihirbaz: Yeni islem > ad + cumle > Kaydet
 await add('Turndown Express','Butler {butler} performed an express turndown for {guestPhrase} staying at Room {room}.');
 await add('Pillow Menu','Butler {butler} presented the pillow menu to {guestPhrase} staying at Room {room}.');
 const s4=await p.evaluate(()=>{const f=__ev('bdiProtelSkipFn')();return {te:f('Turndown Express'),pm:f('Pillow Menu'),acts:__ev('getBdiActions()').map(a=>a.label).filter(l=>/Express|Pillow Menu/.test(l)),
   box:[...document.querySelectorAll('label')].filter(l=>l.textContent.trim()==='Turndown Express'&&l.querySelector('input[type=checkbox]')).map(l=>l.querySelector('input').checked)}});
 ok(saved&&s4.acts.length===2,'D4 ön koşul: liste kaydedildi, iki yeni işlem eklendi '+J(s4.acts));
 ok(s4.te===true&&s4.pm===false,'D4: yeni "Turndown Express" varsayılan kurala göre Protel\'e girmez = '+s4.te+'; "Pillow Menu" girer = '+!s4.pm);
 await p.evaluate(()=>__ev('bdiProtelSkipToggle')('Turndown Express',false));
 const s4b=await p.evaluate(()=>__ev('bdiProtelSkipFn')()('Turndown Express'));
 ok(s4b===false,'D4: kullanıcı işareti kaldırınca "Turndown Express" Protel\'e girer = '+!s4b);

 // ---- D5: Didn't Do It 70 gun once ----
 await H.tab(p,'nt');
 const old=await p.evaluate(()=>__ev('bdiAddDays')(__ev('getToday()'),-70)),near=await p.evaluate(()=>__ev('bdiAddDays')(__ev('getToday()'),-10));
 await p.evaluate(d=>__ev('bdiNtDateSet')(d),old);
 const t5=await p.evaluate(()=>document.getElementById('bdiNtPanel').textContent);
 ok(/Didn't Do It raporu son 2 ayı kapsar/.test(t5)&&!/in-house \(GIH01102\)/.test(t5),'D5: '+old+' seçilince = "'+(t5.match(/Didn't Do It raporu[^.]*\./)||['(yok)'])[0]+'"');
 const nd=dlg.length;await p.evaluate(()=>{__ev('downloadDidntDoIt')(true);__ev('downloadDidntDoItXlsx')(true)});await p.waitForTimeout(150);
 const t5b=await p.evaluate(()=>(document.getElementById('bdiToast')||{}).textContent||'');
 ok(dlg.length===nd&&t5b==="Didn't Do It raporu son 2 ayı kapsar",'D5: Rapor / Excel: uyarı penceresi yok, mesaj = "'+t5b+'"');
 await p.evaluate(d=>__ev('bdiNtDateSet')(d),near);
 const t5c=await p.evaluate(()=>document.getElementById('bdiNtPanel').textContent);
 ok(/in-house \(GIH01102\)/.test(t5c)&&!/son 2 ayı/.test(t5c),'D5: 10 gün önce (rapor yok) eski mesaj kalır');

 // ---- D6: ortak ayarlar + rapor ortak klasore ----
 const s6=await p.evaluate(()=>{const K=__ev('SETTINGS_SYNC_KEYS');localStorage.setItem('radarVerification',JSON.stringify({C9001:'verified'}));localStorage.setItem('radarNatOverride',JSON.stringify({C9001:'Iceland'}));
   __ev('_settingsSyncApplied')(['radarVerification','radarNatOverride']);return {k:K.includes('radarVerification')&&K.includes('radarNatOverride'),v:__ev('getRadarVerify')('C9001'),n:__ev('getNatOverride')({confNo:'C9001'})}});
 ok(s6.k,'D6: Radar "doğrulandı" ve uyruk düzeltmeleri ortak ayar listesinde');
 ok(s6.v==='verified'&&s6.n==='Iceland','D6: başka bilgisayardan gelen Radar ayarı bellekte de güncel = '+J(s6));
 const vac=await R.vac({day:A,time:'14:15',rows:[{room:'1203',name:'Quillfeather,Ansel,Mr.',fo:'OCC',hk:'IP',res:'Checked In',arr:'2026-11-05',dep:'2026-11-12'}]},br);
 const s6b=await p.evaluate(async b64=>{
   const files=new Map();
   const mk=pre=>({kind:'directory',name:'Ortak',queryPermission:async()=>'granted',requestPermission:async()=>'granted',
     getFileHandle:async(n,o)=>{const full=pre+n;if(!files.has(full)&&!(o&&o.create))throw new DOMException('not found','NotFoundError');
       return {kind:'file',name:n,getFile:async()=>{const x=files.get(full)||{b:new Blob([]),lm:Date.now()};return new File([x.b],n,{lastModified:x.lm})},
         createWritable:async()=>{let b=new Blob([]);return {write:async t=>{b=new Blob([t])},close:async()=>{files.set(full,{b,lm:Date.now()})}}}}},
     getDirectoryHandle:async n=>mk(pre+n+'/'),removeEntry:async n=>{files.delete(pre+n)},
     values:async function*(){for(const [k,x] of files)if(k.startsWith(pre)&&!k.slice(pre.length).includes('/')){const n=k.slice(pre.length);yield {kind:'file',name:n,getFile:async()=>new File([x.b],n,{lastModified:x.lm})}}}});
   window.__dir=mk('');__ev('_pyDirHandle=window.__dir');
   const f=new File([Uint8Array.from(atob(b64),c=>c.charCodeAt(0))],'HSK01124.pdf',{lastModified:Date.now()}),junk=new File(['hello'],'notes.txt');
   const r=await __ev('swRepDropIn')([f,junk]);const w=files.get('Raporlar/HSK01124.pdf'),seen=JSON.parse(localStorage.getItem('sw_rep_seen')||'{}');
   const again=await __ev('swRepScanFolder')(true);localStorage.setItem('sw_rep_seen','{}');const other=await __ev('swRepScanFolder')(true);
   return {ok:r.map(x=>x.type+':'+x.ok),keys:[...files.keys()],size:w?w.b.size:0,orig:f.size,seen:w?!!seen['HSK01124.pdf|'+w.b.size+'|'+w.lm]:false,again:again&&again.length,other:other&&other.length}},Buffer.from(vac).toString('base64'));
 console.log('  '+J(s6b));
 ok(s6b.ok[0]==='vac:true'&&s6b.keys.includes('Raporlar/HSK01124.pdf')&&s6b.size===s6b.orig,'D6: Rapor Merkezi\'ne bırakılan VAC ortak klasörün Raporlar/ klasörüne kopyalandı '+J(s6b.keys));
 ok(!s6b.keys.includes('Raporlar/notes.txt'),'D6: tanınmayan dosya kopyalanmadı');
 ok(s6b.seen&&s6b.again===0,'D6: bu bilgisayar kendi kopyasını tekrar okumaz (taramada '+s6b.again+' dosya)');
 ok(s6b.other===1,'D6: başka bilgisayar (okundu listesi boş) klasör taramasında dosyayı bulur ('+s6b.other+')');
 await done();
})().catch(e=>{console.log('FAIL test çöktü: '+(e&&e.stack||e));console.log('1 FAIL');process.exit(1)});
