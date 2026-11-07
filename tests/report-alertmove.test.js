// Butler Alert satirlari oda raporunu (VAC) takip eder: gun icinde oda degisen misafirin satiri yeni odaya tasinir, isareti ve
// sebebi korunur, tabloda "önce 709" yazar. Oda raporu yokken / dunku oda raporuyla / satir oda raporundan yeni bir varis
// raporundan geldiyse hicbir sey tahminle degismez. Sahte Opera raporlari, isimler kurgu (KVKK).
// (Gercek raporlu alertmove ve alertmove2 testlerinin yerine, 2026-11-07.) 4+ gece kalan her varis bir alert satiridir.
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05',J=JSON.stringify;
const at=(p,hm)=>p.clock.setSystemTime(new Date(D+'T'+hm+':00+03:00'));
const G={ab:{name:'Abernathy,Rhea,Ms.',dep:'2026-11-10'},ca:{name:'Castellan,Dorian,Mr.',dep:'2026-11-11'},qu:{name:'Quill,Mara,Ms.',dep:'2026-11-10'}};
const arrRows=o=>Object.keys(o).map(r=>({room:r,name:G[o[r]].name,arr:D,dep:G[o[r]].dep,adl:1}));
const ROOMS=['0707','0709','1109','1201','1305','1504'];
const vacRows=occ=>ROOMS.map(r=>{const k=occ[r];if(!k)return {room:r,fo:'VAC',hk:'CL',nv:'1'};return {room:r,name:G[k].name,fo:'OCC',hk:'PU',res:'Checked In',arr:D,dep:G[k].dep}});
const AL=p=>p.evaluate(()=>(__ev('alertList')||[]).map(a=>({r:a.roomNo,g:a.guest,v:a.visited,why:a.notVisitedReason||'',mf:a.movedFrom||'',man:!!a.manual,dep:a.depDate})));
const SAVED=p=>p.evaluate(d=>JSON.parse(localStorage.getItem('alert_'+d)||'[]').map(a=>a.roomNo+(a.movedFrom?'<'+a.movedFrom:'')).join(','),D);
const rooms=L=>L.map(a=>a.r+(a.mf?'<'+a.mf:'')).join(',');
const reload=async p=>{await p.reload();await p.waitForTimeout(1500);await p.evaluate(async()=>{await __ev('BdiKV').ready();try{__ev('closeSetupModal()')}catch(e){}});await p.waitForTimeout(500)};
const table=p=>p.evaluate(()=>{__ev('setAlertFilter("all")');return [...document.querySelectorAll('#bdiTab_alert table tbody tr')].map(tr=>({room:tr.children[0].textContent.replace(/\s+/g,' ').trim(),dep:(tr.children[4]||{}).textContent||''}))});

let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{
 // ---- 1) tek satirlar (alertmove2) ----
 let S=await H.open({today:D,time:'07:00',butlers:['Can Demir'],me:'Can Demir'});let {br,p,dlg}=S;
 let m=await H.ingest(p,await R.arr({day:D,time:'06:30',rows:arrRows({'0709':'ab','1109':'ca','1201':'qu'})},br),'ARR01102.pdf');console.log('  ARR 07:00: '+m);
 await H.tab(p,'alert');
 const R0=await p.evaluate(()=>__ev('getAlertReasons()')[1]);
 await p.evaluate(r=>{const L=__ev('alertList'),i=L.findIndex(a=>a.roomNo===709);__ev('alertNvPick')(i,r)},R0);
 await p.evaluate(()=>{const v=(i,x)=>document.getElementById(i).value=x;v('alertManualRoom','1305');v('alertManualGuest','Marlowe, Ines');v('alertManualReason','VIP');__ev('addManualAlert()')}); // elle ekleme kutusu (katlanmis bolum)
 let L0=await AL(p);console.log('  alert: '+J(L0));
 await p.evaluate(()=>{__ev('bdiAlertSyncRooms()');__ev('loadAlertSnapshot()')});
 let L=await AL(p);
 ok(rooms(L)==='709,1109,1201,1305'&&rooms(L)===rooms(L0),'oda raporu yokken hiçbir oda değişmedi: '+rooms(L));

 // 08:00 oda raporu: Abernathy 0707'de, Castellan 1504'te, Quill hic yok (henuz gelmedi), 1305 bos
 await at(p,'08:00');m=await H.ingest(p,await R.vac({day:D,time:'08:00',rows:vacRows({'0707':'ab','1504':'ca'})},br),'HSK01124.pdf');console.log('  VAC 08:00: '+m);
 L=await AL(p);const A=r=>L.find(a=>a.r===r)||{};
 ok(A(707).g&&/Abernathy/.test(A(707).g)&&A(707).mf===709&&A(1504).mf===1109&&!A(709).r&&!A(1109).r,'tek satırlar da oda raporuna göre taşındı: 709→707, 1109→1504 ('+rooms(L)+')');
 ok(A(707).v===false&&A(707).why===R0,'taşınan satırın işareti ve sebebi korundu '+J(A(707)));
 ok(A(1201).g&&/Quill/.test(A(1201).g)&&!A(1201).mf,'oda raporunda adı hiç geçmeyen misafirin satırı yerinde kaldı (tahmin yok)');
 ok(A(1305).man&&A(1305).g==='Marlowe, Ines'&&!A(1305).mf,'elle eklenen satıra dokunulmadı');
 ok(await SAVED(p)==='707<709,1201,1305,1504<1109','taşınmış liste kaydedildi: '+await SAVED(p));
 let T=await table(p);
 ok(T.some(x=>/^707.*önce 709/.test(x.room))&&T.some(x=>/^1504.*önce 1109/.test(x.room)),'açık tablo kendiliğinden yenilendi; "önce 709" / "önce 1109" görünüyor '+J(T.map(x=>x.room)));
 await p.evaluate(()=>{__ev('bdiAlertSyncRooms()');__ev('loadAlertSnapshot()')});
 ok(rooms(await AL(p))===rooms(L),'tekrar çalışınca değişmedi: '+rooms(await AL(p)));
 await reload(p);await H.tab(p,'alert');
 ok(S.errs.length===0,'açılışta JS hatası yok (oda raporu yeniden kurulurken alert listesi henüz hazır değil) '+J(S.errs));
 ok(rooms(await AL(p))===rooms(L),'sayfa yenilenince aynı (oda ve "önce" notu): '+rooms(await AL(p))+' (beklenen '+rooms(L)+')');

 // 09:00 yeni varis raporu (oda raporundan YENI) Abernathy'yi yine 0709'da gosteriyor: eski oda raporu onu geri tasimaz
 await at(p,'09:00');m=await H.ingest(p,await R.arr({day:D,time:'08:50',rows:arrRows({'0709':'ab','1109':'ca','1201':'qu'})},br),'ARR01102.pdf');console.log('  ARR 09:00: '+m);
 await p.evaluate(()=>{__ev('bdiAlertSyncRooms()')});
 L=await AL(p);
 ok(A(709).g&&/Abernathy/.test(A(709).g)&&!A(707).r,'varış raporu oda raporundan YENİ: 709 yerinde kaldı (eski oda raporu geri taşımadı) ('+rooms(L)+')');
 // 10:00 yeni oda raporu: varis raporu artik ondan ESKI
 await at(p,'10:00');m=await H.ingest(p,await R.vac({day:D,time:'10:00',rows:vacRows({'0707':'ab','1504':'ca'})},br),'HSK01124.pdf');
 L=await AL(p);
 ok(A(707).g&&/Abernathy/.test(A(707).g)&&!A(709).r,'varış raporu oda raporundan ESKİ: oda raporuna göre 707\'ye taşındı ('+rooms(L)+')');
 ok(L.every(a=>!a.mf||a.mf!==a.r),'hiçbir satırda "önce" notu kendi odasını göstermiyor ('+rooms(L)+')');
 ok(dlg.length===0,'uyarı penceresi yok '+J(dlg));
 ok(S.errs.length===0,'JS hatası yok (1. bölüm) '+J(S.errs));await S.br.close();

 // ---- 2) dunku oda raporu ve iki satirli misafir (alertmove): varis raporu Abernathy'yi iki odada gosteriyor (0707 + 0709) ----
 S=await H.open({today:D,time:'07:00',butlers:['Can Demir'],me:'Can Demir'});({br,p,dlg}=S);
 await H.ingest(p,await R.arr({day:D,time:'06:30',rows:arrRows({'0707':'ab','0709':'ab','1109':'ca'})},br),'ARR01102.pdf');
 await H.tab(p,'alert');
 await p.evaluate(r=>{const L=__ev('alertList'),i=L.findIndex(a=>a.roomNo===709);__ev('alertNvPick')(i,r)},R0);
 // Opera Alerts'ten kalan satir: cikis tarihi ISO bicimiyle (2026-11-04)
 await p.evaluate(d=>{const L=JSON.parse(localStorage.getItem('alert_'+d));L.push({roomNo:1013,guest:'Pemberton, Hugo',title:'Mr.',reasons:[{label:'VIP',detail:''}],visited:null,notVisitedReason:'',manual:false,depDate:'2026-11-04',nights:0,resStatus:'',srcAt:Date.now()});
   L.sort((a,b)=>a.roomNo-b.roomNo);localStorage.setItem('alert_'+d,JSON.stringify(L))},D);
 // dunun (05.11 22:00) oda raporu: Abernathy yalniz 0707'de
 m=await H.ingest(p,await R.vac({day:Y,time:'22:00',rows:vacRows({'0707':'ab','1504':'ca'})},br),'HSK01124.pdf');console.log('  VAC 05.11: '+m);
 await reload(p);await H.tab(p,'alert');
 L=await AL(p);
 ok(rooms(L)==='707,709,1013,1109','dünkü oda raporuyla bugünün alert odaları değişmez; oda raporu yokken hiçbir satır silinmedi (tahmin yok): '+rooms(L));
 T=await table(p);
 ok(T.length===4&&T.every(x=>/^\d{2}-\d{2}-\d{2}$/.test(x.dep.trim()))&&T.some(x=>/^1013/.test(x.room)&&x.dep==='04-11-26'),'1013 çıkış tarihi diğerleriyle aynı biçimde: 04-11-26 '+J(T.map(x=>x.dep)));
 await at(p,'08:00');await H.ingest(p,await R.vac({day:D,time:'08:00',rows:vacRows({'0707':'ab','1504':'ca'})},br),'HSK01124.pdf');
 L=await AL(p);
 ok(!A(709).r&&A(707).mf===709&&A(707).v===false&&A(707).why===R0&&A(1504).mf===1109,'iki satır birleşti: 0709 satırı kalktı, işareti ve sebebi 0707\'ye taşındı; 1109 → 1504 ('+rooms(L)+')');
 await reload(p);await H.tab(p,'alert');
 ok(!(await AL(p)).some(a=>a.r===709),'temizlenen liste kaydedildi (yenilemede geri gelmez): '+rooms(await AL(p)));
 T=await table(p);
 ok(T.some(x=>/^707.*önce 709/.test(x.room))&&T.some(x=>/^1504.*önce 1109/.test(x.room)),'tabloda oda numarasının altında "önce 709" / "önce 1109" notu '+J(T.map(x=>x.room)));
 ok(dlg.length===0,'uyarı penceresi yok '+J(dlg));
 ok(S.errs.length===0,'JS hatası yok '+J(S.errs));await S.br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0);
})();
