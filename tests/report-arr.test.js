// Varis raporu (ARR01102): sabah bugunun raporu, aksam yarinin raporu. PY / Radar / Alert en yeni yuklenen gunu (yarin) kullanir;
// Butler Did It (bugun gelenler, kat turu, brifing) her zaman bugunun raporunu. Yarin olunca Butler Did It kendiliginden o gunun
// listesine gecer. Ayrica: fiyat (1,000 ve ustu) ve HPG, Radar'dan varis PDF'i, Opera misafir Excel'i. Isimler kurgu (KVKK).
// (Gercek raporlu arrdaytest, navmove ve fx_plan-entry'nin ARR bolumunun yerine, 2026-11-07.)
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',T='2026-11-07',J=JSON.stringify;
const at=(p,day,hm)=>p.clock.setSystemTime(new Date(day+'T'+hm+':00+03:00'));
const reload=async p=>{await p.reload();await p.waitForTimeout(1500);await p.evaluate(async()=>{await __ev('BdiKV').ready();try{__ev('closeSetupModal()')}catch(e){}});await p.waitForTimeout(500)};
const TODAY=[{room:'0702',name:'Lindqvist,Tomas,Mr.',arr:D,dep:'2026-11-08',amount:'720.00',rate:'RA1'},
  {room:'1203',name:'Moreau,Camille,Ms.',arr:D,dep:'2026-11-10',amount:'1,250.00',rate:'WHDY25'},
  {room:'1510',name:'Haddad,Rami,Dr.',arr:D,dep:'2026-11-11',amount:'1,000.00',rate:'RA1',adl:2}];
const TOMORROW=[{room:'0801',name:'Ashdown,Perrin,Mr.',arr:T,dep:'2026-11-09'},{room:'0803',name:'Belcourt,Yara,Ms.',arr:T,dep:'2026-11-12'},
  {room:'1102',name:'Corrigan,Elodie,Mrs.',arr:T,dep:'2026-11-10'},{room:'1404',name:'Dunmore,Silas,Mr.',arr:T,dep:'2026-11-08'},{room:'1607',name:'Esterhazy,Noor,Ms.',arr:T,dep:'2026-11-11'}];
const S=p=>p.evaluate(()=>{const ag=__ev('allGuests')||[];return {mod:{day:__ev('swArrDay')(ag),n:ag.length},
  bdi:__ev('bdiTodayArrivals()').map(g=>String(g.roomNo)).sort().join(','),
  kat:Object.values(__ev('bdiKatRooms()')).filter(x=>x.arriving).map(x=>x.room).sort().join(',')}});

(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'08:00',butlers:['Can Demir'],me:'Can Demir'});
 // 08:00 bugunun raporu
 let m=await H.ingest(p,await R.arr({day:D,time:'07:45',rows:TODAY},br),'ARR01102.pdf');console.log('  ARR 06.11: '+m);
 let s=await S(p);
 ok(s.bdi==='1203,1510,702'&&s.mod.day===D&&s.mod.n===3,'sabah bugünün raporu: Butler Did It ve PY / Radar 06.11 listesi (3 misafir) '+J(s));
 const al=await p.evaluate(d=>JSON.parse(localStorage.getItem('alert_'+d)||'[]').map(a=>a.roomNo).join(','),D);
 ok(al==='1203,1510','varış raporu Butler Alert\'e de gitti (4+ gece: 1203, 1510): '+al);
 const A=await p.evaluate(()=>{const o={};__ev('bdiTodayArrivals()').forEach(g=>o[g.roomNo]=g.rateAmount);return o});
 ok(A[1203]===1250&&A[1510]===1000&&A[702]===720,'1,000 ve üstü fiyat rateAmount\'a sayı olarak geldi (1,250.00 → 1250) '+J(A));
 await p.evaluate(()=>__ev('bdiHpgSet')('1.500'));
 ok(await p.evaluate(()=>localStorage.getItem('bdi_hpg_min'))==='1500','HPG kutusuna "1.500" yazınca 1500 saklanıyor');
 await p.evaluate(()=>__ev('bdiHpgSet')('1000'));
 const hp=await p.evaluate(d=>__ev('bdiPlanBuild')(d).filter(g=>g.badges.hpg).map(g=>g.room).join(','),D);
 ok(hp==='1203,1510','HPG 1000: 1203 (1250) ve 1510 (1000) HPG, 0702 (720) değil ('+hp+')');

 // 19:00 yarinin raporu
 await at(p,D,'19:00');m=await H.ingest(p,await R.arr({day:T,time:'18:55',rows:TOMORROW},br),'ARR01102.pdf');console.log('  ARR 07.11: '+m);
 s=await S(p);
 ok(s.mod.day===T&&s.mod.n===5,'akşam yarının raporu: PY / Radar artık 07.11 listesinde (5 misafir) '+J(s.mod));
 ok(s.bdi==='1203,1510,702','Butler Did It bugün gelenler SİLİNMEDİ: hâlâ '+s.bdi);
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('bdiRepSlotStatus()')});
 const box=await p.evaluate(()=>(document.getElementById('bdiArrStatus')||{}).textContent||'');
 ok(/Bugün \(06\.11\): 3 varış/.test(box)&&/PY \/ Radar: 07\.11 listesi \(5 misafir\)/.test(box),'BDI varış kutusu ikisini de söylüyor: '+box);
 ok(s.kat==='0702,1203,1510','kat turu bugün gelenleri görüyor ('+s.kat+')');
 await H.tab(p,'brief');await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(400);
 await p.evaluate(()=>{const g=__ev('_bdiFeedGrp');['aplain','alate'].forEach(k=>g[k]=1);__ev('bdiFeedRefresh()')});await p.waitForTimeout(300);
 const fg=await p.evaluate(()=>{const s=[...document.querySelectorAll('#bdiBriefBody section.bd-fd-g')].find(x=>/^Gelenler/.test(x.querySelector('h3').textContent.trim()));
   return s?{h:s.querySelector('h3').textContent.replace(/\s+/g,' ').trim(),rooms:[...s.querySelectorAll('.bd-fd-main b')].map(b=>b.textContent).join(',')}:null});
 ok(fg&&/^Gelenler 3/.test(fg.h)&&/0702/.test(fg.rooms)&&/1203/.test(fg.rooms)&&/1510/.test(fg.rooms)&&!/0801|0803|1102|1404|1607/.test(fg.rooms),'brifing "Gelenler" bugünün listesinden ('+J(fg)+')');
 await reload(p);s=await S(p);
 ok(s.mod.day===T&&s.mod.n===5&&s.bdi==='1203,1510,702','yenilemeden sonra: PY / Radar 07.11, Butler Did It bugün '+J(s));

 // 20:00 bugunun raporu tekrar (guncellenmis, 4 misafir): yarinin listesi yukluyken PY'yi ezmez
 await at(p,D,'20:00');
 m=await H.ingest(p,await R.arr({day:D,time:'19:58',rows:TODAY.concat([{room:'1701',name:'Fairweather,Lena,Ms.',arr:D,dep:'2026-11-09'}])},br),'ARR01102.pdf');
 s=await S(p);
 ok(s.mod.day===T&&s.mod.n===5&&s.bdi==='1203,1510,1701,702','yarının listesi yüklüyken bugünün raporu PY / Radar\'ı ezmedi, Butler Did It\'e girdi '+J(s));
 ok(/Butler Did It için saklandı; PY \/ Radar 07\.11\.2026 listesinde kaldı/.test(m),'kullanıcıya söyleniyor: '+m);

 // ertesi gun (sayfa acik): Butler Did It kendiliginden 07.11 listesine gecer
 await at(p,T,'07:30');await p.evaluate(()=>__ev('swDayCheck()'));
 s=await S(p);
 ok(s.bdi==='1102,1404,1607,801,803','ertesi gün Butler Did It otomatik o günün (07.11) listesine geçti: '+s.bdi);

 // Radar sayfasindan varis PDF'i (Mektuplar sayfasi olmadan)
 await p.evaluate(()=>__ev('showPage("radar")'));
 await p.setInputFiles('#radarArrPdfInput',{name:'ARR01102.pdf',mimeType:'application/pdf',buffer:await R.arr({day:T,time:'07:20',rows:TOMORROW.slice(0,4)},br)});
 await p.waitForTimeout(2500);
 s=await S(p);
 ok(s.mod.day===T&&s.mod.n===4,'Radar sayfasından varış PDF yükleme çalışıyor (Mektuplar sayfası olmadan): '+J(s.mod));

 // Opera misafir Excel'i (FULL_NAME / ROOM_NO): Mektuplar kalkti, dosya kullanilmaz ve soylenir
 m=await p.evaluate(async()=>{const X=__ev('XLSX'),wb=X.utils.book_new();X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([['ROOM_NO','FULL_NAME','ARRIVAL'],['0801','Ashdown, Perrin','07-11-26']]),'S');
   const f=new File([X.write(wb,{type:'array',bookType:'xlsx'})],'guests.xlsx',{lastModified:Date.now()});const r=await __ev('swRepIngest')([f],'elle');return r[0].type+' | '+r[0].msg});
 ok(/^xls \| Opera misafir Excel'i yalnız Mektuplar içindi; Mektuplar kaldırıldı, dosya kullanılmadı/.test(m),'Opera misafir Excel\'i: tanındı, kullanılmadığı söylendi ('+m+')');
 await done();
})();
