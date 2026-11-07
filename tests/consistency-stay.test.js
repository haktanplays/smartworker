// Tutarlilik (bayat veri): VARIS ve CIKIS. Kaynak degisince bilgiyi gosteren her yer yeni degeri gostermeli.
// Kaynak degisiklikleri (gercek yol: sahte Opera raporlari Rapor Merkezi'ne birakilir, H.ingest):
//   1) ARR01102: bugun gelenler eklenir (1207 Fairweather, 1405 Galloway)
//   2) DEP01100: 1201 Ashworth, 1202 Hartigan ve (erken) 1206 Kirkland cikti (CKOT), 1401 Dunmore cikacak (DUOT)
//   3) HSK01124 (VAC) 15:00: 1205 Corrigan ve 1203 Bexley'in odasi bos (DEP gelmeden erken cikis)
//   4) HSK01124 (VAC) 16:00: konaklama uzadi: 1401 Dunmore 06.11 -> 09.11, 1403 Ellwood 07.11 -> 10.11
//   B) Ayni gunun in-house raporu (07:00) + daha yeni VAC (15:00): VAC kazanmali (hemen ve sayfa yenilenince)
// Yerler: Kat turu (Gunun akisi + yazdir), Brifing Plan, Butler Didn't Do It (sekme + rapor, "Checked Out Untouched"), Takip (+ rapor),
//   Butler Alert, Atolye etiketleri, Misafirler in-house isareti, In-room Check-in, sekme rozetleri, Uyarilar, Issues karti.
// Misafirler kurgu (KVKK). Saat sabit: 06.11.2026, 08:00'dan baslar, adim adim ileri alinir.
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05',J=JSON.stringify,AT=t=>new Date(D+'T'+t+':00+03:00');
const BUTLERS=['Can Demir','Nazlı Erten'];

// ---- ekrandan okuma (DOM / rapor HTML) ----
const wait=(p,ms)=>p.waitForTimeout(ms||600);
// Gunun akisi (Kat turu): butun gruplar acik, verilen odalarin kartlari acik
async function feed(p,open){
  await H.tab(p,'brief');
  await p.evaluate(open=>{const g=__ev('_bdiFeedGrp');['aplain','alate','dleft','vacev','mo-f','mo-l','nt','inh'].forEach(k=>g[k]=1);
    const o=__ev('_bdiFeedOpen'),K=__ev('bdiGuestKey');(open||[]).forEach(([r,n])=>{o['h:'+r]=1;o['d:'+r+':'+K(n)]=1;o['a:'+r]=1});__ev('bdiBriefSetMode("feed")')},open||[]);
  await wait(p,700);
  return p.evaluate(()=>{const G={};document.querySelectorAll('#bdiBriefBody section.bd-fd-g').forEach(s=>{const t=s.querySelector('.bd-fd-gh').firstChild.textContent.trim();
      G[t]=[...s.querySelectorAll('.bd-fd-row')].map(b=>({tag:(b.querySelector('.bd-fd-tag')||{}).textContent||'',main:((b.querySelector('.bd-fd-main')||{}).textContent||'').replace(/\s+/g,' ').trim(),
        sub:((b.querySelector('.bd-fd-sub')||{}).textContent||'').replace(/\s+/g,' ').trim(),inSub:!!b.closest('.bd-fd-sub-list'),more:b.classList.contains('bd-fd-more')}))});
    const cards={};document.querySelectorAll('#bdiBriefBody .bd-kt-room').forEach(c=>{const n=c.querySelector('.bd-kt-no'),s=c.querySelector('.bd-kt-h .bd-sub');if(n)cards[n.textContent]=(s?s.textContent:'')});
    return {G,cards,strip:((document.querySelector('#bdiBriefBody .bd-bf-strip')||{}).textContent||'').replace(/\s+/g,' ')}});
}
const rm=x=>(x.main.match(/^(\d{3,4})/)||[])[1]||''; // satirin oda numarasi
const fRooms=(F,g,fn)=>(F.G[g]||[]).filter(x=>!x.more&&(!fn||fn(x))).map(rm).filter(Boolean);
const depDue=F=>fRooms(F,'Çıkışlar',x=>!x.inSub);           // cikacak
const depLeft=F=>fRooms(F,'Çıkışlar',x=>x.inSub);           // "cikti" alt listesi
const lastNight=F=>fRooms(F,'Konaklama anları',x=>x.tag==='Son gece');
const firstMorning=F=>fRooms(F,'Konaklama anları',x=>x.tag==='İlk sabah');
const inHouse=F=>fRooms(F,'Oteldekiler');
const arrivals=F=>fRooms(F,'Gelenler',x=>x.tag==='Gelen');
const ntFeed=F=>((F.G['Dikkat']||[]).find(x=>x.main==='hiç dokunulmadı')||{sub:''}).sub.split(' · ')[0];
const moves=F=>(F.G['Gün içi hareketler']||[]).filter(x=>!x.more).map(x=>x.tag+' '+rm(x));
// Brifing Plan: oda -> isler
async function plan(p){await H.tab(p,'brief');await p.evaluate(()=>__ev('bdiBriefSetMode("plan")'));await wait(p,700);
  return p.evaluate(()=>{const o={};document.querySelectorAll('#bdiBriefBody .bd-pl2-g').forEach(g=>{const r=g.querySelector('.bd-pl2-rm').textContent;o[r]=(o[r]||[]).concat([...g.querySelectorAll('.bd-pl2-it .bd-pl2-t')].map(x=>x.textContent.replace(/\s+/g,' ')))});return o})}
const planHas=(P,room,re)=>(P[room]||[]).some(t=>re.test(t));
// Kat turu yazdir (butler basina sayfa): bolum -> odalar, oda -> alt satir
async function katPrint(p){return p.evaluate(()=>{const h=window.__t.capture(function(){return __ev('bdiKatPrint()')});const x=new DOMParser().parseFromString(h,'text/html'),o={sec:{},sub:{}};
  x.querySelectorAll('h2').forEach(e=>{const t=e.textContent.replace(/\s*\(\d+\)$/,''),tb=e.nextElementSibling;o.sec[t]=(o.sec[t]||[]).concat(tb?[...tb.querySelectorAll('td.no')].map(c=>c.textContent):[])});
  x.querySelectorAll('td.no').forEach(c=>{const s=c.parentNode.querySelector('.s');o.sub[c.textContent]=s?s.textContent:''});return o})}
// Butler Didn't Do It sekmesi (bugun)
async function ntTab(p){await H.tab(p,'nt');await p.evaluate(d=>__ev('bdiNtDateSet')(d),D);await wait(p,300);
  return p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel td.r')].map(x=>x.textContent).sort().join(','))}
// Butler Didn't Do It raporu (sekmeden, bugun)
async function ntReport(p){await H.tab(p,'nt');return p.evaluate(d=>{__ev('bdiNtDateSet')(d);const h=window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')});const x=new DOMParser().parseFromString(h,'text/html');
  const s=[...x.querySelectorAll('.isec')].find(e=>/Checked Out Without/.test(e.textContent));
  return {un:[...x.querySelectorAll('tr.gh')].map(e=>(e.textContent.match(/(\d{4})/)||[])[1]).join(','),left:s?[...s.querySelectorAll('tr')].filter(r=>r.querySelector('td')).map(r=>[...r.cells].map(c=>c.textContent.replace(/\s+/g,' ').trim()).join(' | ')):[],
    items:[...x.querySelectorAll('.summary .item')].map(e=>e.textContent).join(' | ')}},D)}
// Takip sekmesi: acik satirlar (Gecikti / Bugun / Yarin) ve "kacti" sayisi
async function fuTab(p){await H.tab(p,'fu');return p.evaluate(()=>({open:[...document.querySelectorAll('#bdiFuPanel .bd-fu-grp .bd-fu-row')].map(r=>({room:r.querySelector('.bd-fu-room').textContent,dep:(r.querySelector('.bd-fu-dep')||{}).textContent||''})),
  missed:+(((document.querySelector('#bdiFuPanel details:last-of-type summary')||{}).textContent||'').match(/(\d+)\s*kaçtı/)||[0,-1])[1]}))}
async function fuReport(p){await H.tab(p,'fu');return p.evaluate(()=>{const h=window.__t.capture(function(){return __ev('downloadFuReport()')});const x=new DOMParser().parseFromString(h,'text/html');
  const it=[...x.querySelectorAll('.summary .item')].find(e=>/Guest Left Before Follow-up/.test(e.textContent));return it?parseInt(it.textContent,10):-1})}
// Butler Alert tablosu (odalar)
async function alertTab(p){await H.tab(p,'alert');return p.evaluate(()=>{__ev('setAlertFilter("all")');return [...document.querySelectorAll('#alertTableWrap tbody tr')].map(r=>(r.cells[0]||{}).textContent.trim()).filter(t=>/^\d{3,4}$/.test(t)).sort().join(',')})}
// In-room Check-in: oda -> Protel'den gelen ETD onerisi
async function irci(p){await H.tab(p,'irci');return p.evaluate(()=>{const o={};document.querySelectorAll('#bdiIrciPanel tbody tr').forEach(r=>{const b=[...r.querySelectorAll('button.bd-link')].find(x=>/Protel/.test(x.textContent));o[r.querySelector('td.r').textContent]=b?b.textContent:''});return o})}
// Atolye > Protel'e girilecekler: misafir -> etiket ("bugun geliyor" / "otelde" / "ayrildi dd.mm")
async function atelier(p){await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("atelier")');__ev('_bdiAtMode="out"');__ev('renderBdiAtelier()')});await wait(p,900);
  return p.evaluate(()=>{const o={};document.querySelectorAll('#bdiProtelBody .bd-pl-g').forEach(g=>{const n=(g.querySelector('.bd-q-name')||{}).textContent,s=(g.querySelector('.bd-pl-gh .bd-sub')||{}).textContent||'';o[n]=s.split(' · ')[0]});return o})}
// Misafirler: misafir -> isaretler (In-house / Bugun temas yok)
async function guests(p){await H.tab(p,'guests');await wait(p,1200);
  return p.evaluate(()=>{const o={};document.querySelectorAll('.bd-grow:not(.bd-ghead)').forEach(r=>{const n=r.querySelector('.bd-g-name');if(!n)return;const nm=n.firstChild.textContent.trim();o[nm]=[...r.querySelectorAll('.bd-flag')].map(f=>f.textContent).join(',')});return o})}
const inFlag=f=>/In-house|Bugün temas yok/.test(f||'');
// Uyarilar penceresi (ust cubuktaki Uyarilar dugmesi)
async function warn(p){return p.evaluate(()=>{__ev('swWarnOpen()');const m=document.getElementById('swWarnModal');const t=[...m.querySelectorAll('span[style*="flex:1"]')].map(x=>x.textContent);m.style.display='none';return t})}
// Sekme rozetleri: sayfa degistirmeden (rapor Kayit sekmesindeyken birakildi)
const badges=p=>p.evaluate(()=>({nt:document.getElementById('bdiNtTabCount').textContent,fu:document.getElementById('bdiFuTabCount').textContent,al:document.getElementById('bdiAlertTabCount').textContent}));
// Issues karti (cikis bilgisi)
async function issueCard(p,id){await H.tab(p,'issues');await wait(p,400);return p.evaluate(id=>{const e=document.getElementById('bdiIs_'+id)||[...document.querySelectorAll('#bdiTab_issues [id^="bdiIs_"]')].find(x=>x.id.indexOf(id)>=0);return e?e.textContent.replace(/\s+/g,' '):'(kart yok)'},id)}
// rapor birak: once Kayit sekmesi (rozetler tazelenir), sonra Rapor Merkezi yolu
async function drop(p,buf,name){await H.tab(p,'entry');const m=await H.ingest(p,buf,name);await wait(p,1600);return m}

// ---- kurgu otel: 12. kat Can Demir, 14. kat Nazli Erten ----
const GIH_ROWS=[{room:'1201',name:'Ashworth,Gideon,Mr.',arr:Y,dep:D},{room:'1202',name:'Hartigan,Rosalind,Ms.',arr:'2026-11-03',dep:D},
  {room:'1203',name:'Bexley,Marisol,Ms.',arr:'2026-11-04',dep:'2026-11-09'},{room:'1205',name:'Corrigan,Tamsin,Mrs.',arr:'2026-11-02',dep:'2026-11-07'},
  {room:'1206',name:'Kirkland,Ottilie,Ms.',arr:'2026-11-04',dep:'2026-11-08'},{room:'1401',name:'Dunmore,Felix,Mr.',arr:'2026-11-04',dep:D},{room:'1403',name:'Ellwood,Priya,Dr.',arr:'2026-11-03',dep:'2026-11-07'},
  {room:'1404',name:'Garrow,Odile,Mrs.',arr:Y,dep:'2026-11-10'}];
const occ=(room,name,arr,dep)=>({room,name,fo:'OCC',hk:'IP',res:'Checked In',arr,dep});
const vac=(room,nv)=>({room,fo:'VAC',hk:nv==='0'?'DI':'CL',nv});
// VAC satirlari: early = 1203 ve 1205 bos; ext = konaklama uzadi
const VAC_ROWS=(early,ext)=>[vac('1201','0'),vac('1202','0'),early?vac('1203','0'):occ('1203','Bexley,Marisol,Ms.','2026-11-04','2026-11-09'),
  early?vac('1205','0'):occ('1205','Corrigan,Tamsin,Mrs.','2026-11-02','2026-11-07'),vac('1206','0'),occ('1207','Fairweather,Lionel,Mr.',D,'2026-11-10'),
  occ('1401','Dunmore,Felix,Mr.','2026-11-04',ext?'2026-11-09':D),vac('1402','5'),occ('1403','Ellwood,Priya,Dr.','2026-11-03',ext?'2026-11-10':'2026-11-07'),
  occ('1404','Garrow,Odile,Mrs.',Y,'2026-11-10'),{room:'1405',name:'Galloway,Ines,Ms.',fo:'VAC',hk:'CL',res:'Due In',arr:D,dep:'2026-11-08'}];

// ikinci senaryo icin ayni tarayicida yeni sayfa (H.open ile ayni kurulum)
async function openCtx(br,today,time){
  const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});const p=await ctx.newPage();p.errs=[];
  p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.accept());
  await p.clock.install({time:new Date(today+'T'+time+':00+03:00')});await p.goto('file://'+__dirname+'/'+(process.argv[2]||'t2')+'/SmartWorker3.html');
  await p.evaluate(([t,b])=>{localStorage.clear();localStorage.setItem('sw_setup_snooze',t);localStorage.setItem('sw_dayfix',t);localStorage.setItem('kw_butler',JSON.stringify(b));localStorage.setItem('bdi_me',b[0])},[today,BUTLERS]);
  await p.reload();await wait(p,1200);await p.evaluate(async()=>{await __ev('BdiKV').ready();try{__ev('closeSetupModal()')}catch(e){}});
  return {ctx,p};
}
async function reload(p){await p.reload();await wait(p,1500);await p.evaluate(async()=>{await __ev('BdiKV').ready();try{__ev('closeSetupModal()')}catch(e){}})}

(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'08:00',butlers:BUTLERS,me:'Can Demir'});
 const step=async(name,fn)=>{try{await fn()}catch(e){ok(false,name+': test adımı çöktü: '+String(e.message||e).split('\n')[0])}};
 const L=(id,day,time,room,guest,s)=>H.log(id,day,time,room,guest,'Special Request',{sentence:s}); // Touch Call Protel'e girmez (rutin)

 // ===== 0) sabah: dun aksamin in-house raporu (GIH 05.11 23:10), touch'lar, takipler, issue, kat dagilimi =====
 await step('kurulum',async()=>{
  await H.seed(p,{logs:{'2026-10-25':[L('o1','2026-10-25','11:00','1210','Lionel Fairweather','Butler arranged a city tour for the guest.')],
     [Y]:[L('a1',Y,'17:00','1201','Gideon Ashworth','Butler arranged dinner at the rooftop.'),L('a2',Y,'17:30','1203','Marisol Bexley','Butler arranged a museum visit for the guest.')]},
    kv:{bdi_floors_v1:{[D]:{n:2,blocks:[{from:1,to:13,butler:'Can Demir'},{from:14,to:99,butler:'Nazlı Erten'}],u:Date.now()}}}});
  const m=await H.ingest(p,await R.gih({day:Y,time:'23:10',rows:GIH_ROWS},br),'GIH01102.pdf');
  ok(/^8 oda/.test(m),'kurulum: dünün in-house raporu okundu ('+m+')');
  await p.evaluate(()=>{const T=s=>Date.parse('2026-11-06T'+s+':00+03:00'),c=Date.parse('2026-11-05T18:00:00+03:00');
    __ev('bdiFuAdd')({room:'1201',guest:'Gideon Ashworth',t:'Confirm the airport transfer time',due:T('11:30')});
    __ev('bdiFuAdd')({room:'1205',guest:'Tamsin Corrigan',t:'Ask about the spa booking',due:T('15:45')});
    __ev('bdiFuAdd')({room:'1401',guest:'Felix Dunmore',t:'Check the late checkout request',due:T('18:00')});
    __ev('bdiSaveIssues')([{id:'isAsh',room:'1201',guest:'Gideon Ashworth',concern:'Room too warm at night',createdAt:c,u:1,events:[{id:'isAshE',ts:c,type:'import'}]}])});
 });
 // sabahki durum (eski degerler gercekten gorunuyor mu)
 await step('önce',async()=>{
  const F=await feed(p),P=await plan(p),N=await ntTab(p),U=await fuTab(p);
  ok(J(depDue(F))===J(['1201','1202','1401'])&&J(lastNight(F))===J(['1205','1403']),'önce: Kat turu çıkacaklar 1201,1202,1401 · son gece 1205,1403 ('+depDue(F)+' · '+lastNight(F)+')');
  ok(planHas(P,'1201',/İlk sabah/)&&planHas(P,'1205',/Son gece/)&&planHas(P,'1403',/Son gece/)&&!P['1207'],'önce: Brifing Plan 1201 ilk sabah, 1205/1403 son gece, varış yok ('+Object.keys(P).join(',')+')');
  ok(N==='1205,1206,1403,1404','önce: Didn\'t Do It listesi 1205,1206,1403,1404 ('+N+')');
  ok(U.open.length===3&&U.open.some(r=>r.room==='1401'&&/bugün çıkıyor/.test(r.dep)),'önce: Takip 3 açık, 1401 "bugün çıkıyor" ('+J(U.open)+')');
 });

 // ===== 1) VARIS RAPORU (ARR01102) 09:30: 1207 Fairweather (2. konaklama, 09:15'te in-room check-in yapildi), 1405 Galloway (cocuklu) =====
 await p.clock.setSystemTime(AT('09:20'));
 await step('ARR hazırlık',async()=>{
  await H.seed(p,{logs:{[D]:[H.log('i1',D,'09:15','1207','Lionel Fairweather','Welcome / In-room Check-in',{sentence:'Butler performed an in-room check-in for the guest.'})]}});
  const I=await irci(p);ok(I['1207']==='','önce: In-room Check-in 1207 satırı var, Protel ETD önerisi yok ('+J(I)+')');
  const A=await atelier(p);ok(A['Lionel Fairweather']&&!/bugün geliyor/.test(A['Lionel Fairweather']),'önce: Atölye Fairweather "'+A['Lionel Fairweather']+'"');
 });
 await p.clock.setSystemTime(AT('09:30'));
 await step('ARR',async()=>{
  const m=await drop(p,await R.arr({day:D,time:'09:25',rows:[{room:'1207',name:'Fairweather,Lionel,Mr.',arr:D,dep:'2026-11-10',etd:'12:00',notes:['Prefers a firm pillow']},
    {room:'1405',name:'Galloway,Ines,Ms.',arr:D,dep:'2026-11-08',adl:2,chl:1}]},br),'ARR01102.pdf');
  ok(/^2 misafir/.test(m),'ARR okundu ('+m+')');
  const B=await badges(p);
  ok(B.al==='1','Sekme rozeti › Butler Alert: varış raporundan sonra bekleyen = 1 (1405; 1207\'ye 09:15\'te in-room check-in yapıldı) ('+J(B)+')');
  const F=await feed(p);ok(J(arrivals(F))===J(['1207','1405']),'Kat turu › Gelenler: varışlar = 1207,1405 ('+arrivals(F)+')');
  const P=await plan(p);ok(planHas(P,'1207',/Karşıla/)&&planHas(P,'1405',/Karşıla/),'Brifing Plan › varış işi "Karşıla": 1207 ve 1405 ('+J({1207:P['1207'],1405:P['1405']})+')');
  const AL=await alertTab(p);ok(AL==='1207,1405','Butler Alert › tablo (Tümü): varış odaları = 1207,1405 ('+AL+')');
  const A=await atelier(p);ok(A['Lionel Fairweather']==='bugün geliyor','Atölye › Fairweather etiketi = "bugün geliyor" ('+A['Lionel Fairweather']+')');
  const I=await irci(p);ok(I['1207']==='Protel 12:00','In-room Check-in › 1207 Departure Time önerisi = varış raporunun ETD\'si 12:00 ("'+I['1207']+'")');
  const G=await guests(p);ok(/In-house/.test(G['Lionel Fairweather']||''),'Misafirler › Fairweather (bugün geldi, in-room check-in) = In-house ("'+G['Lionel Fairweather']+'")');
 });

 // ===== 2) CIKIS RAPORU (DEP01100) 12:45: 1201 Ashworth 10:12 ve 1202 Hartigan 09:40 cikti; 1401 Dunmore 13:00 cikacak =====
 await p.clock.setSystemTime(AT('12:45'));
 await step('DEP',async()=>{
  const W0=await warn(p);ok(W0.some(t=>/1201 Gideon Ashworth: misafir bugün çıkıyor, issue/.test(t)),'önce: Uyarılar 1201 "misafir bugün çıkıyor, issue hâlâ açık"');
  const m=await drop(p,await R.dep({day:D,time:'12:40',rows:[{room:'1201',name:'Ashworth,Gideon,Mr.',arr:Y,dep:D,time:'10:12'},{room:'1202',name:'Hartigan,Rosalind,Ms.',arr:'2026-11-03',dep:D,time:'09:40'},
    {room:'1206',name:'Kirkland,Ottilie,Ms.',arr:'2026-11-04',dep:D,time:'11:05'},{room:'1401',name:'Dunmore,Felix,Mr.',arr:'2026-11-04',dep:D,st:'DUOT',time:'13:00'}]},br),'DEP01100.pdf');
  ok(/^4 oda · 3 çıktı · 1 çıkacak/.test(m),'DEP okundu ('+m+')');
  const B=await badges(p);
  ok(B.nt==='3','Sekme rozeti › Didn\'t Do It: erken çıkan 1206 Kirkland düştü, dokunulmamış = 3 ('+J(B)+')');
  ok(B.fu==='2','Sekme rozeti › Takip: Ashworth çıktı, açık takip = 2 ('+J(B)+')');
  const F=await feed(p);
  ok(J(depLeft(F).sort())===J(['1201','1202','1206'])&&J(depDue(F))===J(['1401'])&&inHouse(F).indexOf('1206')<0,'Kat turu › Çıkışlar: çıktı = 1201,1202,1206 · çıkacak = 1401; 1206 oteldekilerde yok ('+depLeft(F)+' · '+depDue(F)+' · otelde '+inHouse(F)+')');
  const N=await ntTab(p);ok(N==='1205,1403,1404','Didn\'t Do It sekmesi › erken çıkan 1206 Kirkland listede yok ('+N+')');
  const P=await plan(p);ok(!P['1201'],'Brifing Plan › 10:12\'de çıkan 1201 Ashworth için iş yok (İlk sabah / Takip) ('+J(P['1201']||[])+')');
  const NR=await ntReport(p);ok(NR.left.some(r=>/^1202 \| Rosalind Hartigan .*checked out 09:40/.test(r))&&NR.left.some(r=>/^1206 \| Ottilie Kirkland .*checked out 11:05/.test(r))&&!NR.left.some(r=>/^1201/.test(r)),'Didn\'t Do It raporu › Checked Out Untouched: 1202 Hartigan (09:40), 1206 Kirkland (11:05); dokunulan 1201 yok ('+J(NR.left)+')');
  const U=await fuTab(p);ok(!U.open.some(r=>r.room==='1201')&&U.missed===1,'Takip › Ashworth takibi açıklarda değil, "kaçtı" = 1 ('+J(U)+')');
  const W=await warn(p);ok(W.some(t=>/1201 Gideon Ashworth: misafir çıktı ama issue hâlâ açık/.test(t))&&!W.some(t=>/1201 Gideon Ashworth: misafir bugün çıkıyor/.test(t)),'Uyarılar › 1201: "misafir çıktı ama issue hâlâ açık" ('+J(W.filter(t=>/1201/.test(t)))+')');
  const A=await atelier(p);ok(A['Gideon Ashworth']==='ayrıldı 06.11','Atölye › Ashworth etiketi = "ayrıldı 06.11" (çıkış raporu: 06.11 10:12) ("'+A['Gideon Ashworth']+'")');
  const G=await guests(p);ok(!inFlag(G['Gideon Ashworth'])&&!inFlag(G['Rosalind Hartigan'])&&!inFlag(G['Ottilie Kirkland']),'Misafirler › çıkan Ashworth, Hartigan, Kirkland In-house / Bugün temas yok değil ('+J({a:G['Gideon Ashworth'],h:G['Rosalind Hartigan'],k:G['Ottilie Kirkland']})+')');
  const C=await issueCard(p,'isAsh');ok(/Çıktı/.test(C),'Issues › 1201 kartında çıkış = "Çıktı" ("'+C.slice(0,160)+'")');
 });

 // ===== 3) VAC 14:00 (durum ayni) ve 15:00: 1203 Bexley ile 1205 Corrigan'in odasi bos (erken cikis, DEP yok) =====
 await p.clock.setSystemTime(AT('14:05'));
 await step('VAC 14:00',async()=>{const m=await drop(p,await R.vac({day:D,time:'14:00',rows:VAC_ROWS(false,false)},br),'HSK01124.pdf');ok(/^6 dolu · 1 gelecek · 4 boş/.test(m),'VAC 14:00 okundu ('+m+')')});
 await p.clock.setSystemTime(AT('15:05'));
 await step('VAC boş',async()=>{
  await H.tab(p,'entry');const W0=await warn(p);ok(W0.some(t=>/1205 Tamsin Corrigan: takibin son saati yaklaşıyor/.test(t)),'önce: Uyarılar 1205 "takibin son saati yaklaşıyor (15:45)"');
  const m=await drop(p,await R.vac({day:D,time:'15:00',rows:VAC_ROWS(true,false)},br),'HSK01124.pdf');
  ok(/^4 dolu · 1 gelecek · 6 boş/.test(m),'VAC 15:00 okundu ('+m+')');
  const B=await badges(p);
  ok(B.nt==='2','Sekme rozeti › Didn\'t Do It: 1205 Corrigan çıktı, dokunulmamış = 2 ('+J(B)+')');
  ok(B.fu==='1','Sekme rozeti › Takip: Corrigan çıktı, açık takip = 1 ('+J(B)+')');
  const F=await feed(p);
  const ih=inHouse(F);ok(ih.indexOf('1205')<0&&ih.indexOf('1203')<0&&lastNight(F).indexOf('1205')<0,'Kat turu › Oteldekiler ve Son gece: boşalan 1203 / 1205 yok ('+ih+' · son gece '+lastNight(F)+')');
  ok(!/1205/.test(ntFeed(F)),'Kat turu › Dikkat "hiç dokunulmadı": 1205 yok ("'+ntFeed(F)+'")');
  const MV=moves(F);ok(MV.indexOf('Çıktı 1205')>=0&&MV.indexOf('Çıktı 1203')>=0,'Kat turu › Gün içi hareketler: Çıktı 1203 ve 1205 ('+MV.join(', ')+')');
  const P=await plan(p);ok(!P['1205']&&!P['1203'],'Brifing Plan › boşalan 1205 (Son gece, Takip) ve 1203 için iş yok ('+J({1205:P['1205']||[],1203:P['1203']||[]})+')');
  const N=await ntTab(p);ok(N.split(',').indexOf('1205')<0,'Didn\'t Do It sekmesi › 1205 Corrigan listede yok ('+N+')');
  const NR=await ntReport(p);ok(NR.un.split(',').indexOf('1205')<0,'Didn\'t Do It raporu › dokunulmamış oteldekiler: 1205 yok ('+NR.un+')');
  const U=await fuTab(p);ok(!U.open.some(r=>r.room==='1205')&&U.missed===2,'Takip › Corrigan takibi açıklarda değil, "kaçtı" = 2 ('+J(U)+')');
  const FR=await fuReport(p);ok(FR===2,'Takip raporu › "Guest Left Before Follow-up" = 2 (Ashworth, Corrigan) ('+FR+')');
  const W=await warn(p);ok(!W.some(t=>/1205 Tamsin Corrigan/.test(t)),'Uyarılar › çıkan 1205 Corrigan için takip uyarısı yok ('+J(W.filter(t=>/1205/.test(t)))+')');
  const A=await atelier(p);ok(A['Marisol Bexley']==='ayrıldı 06.11','Atölye › Bexley etiketi = "ayrıldı 06.11" (15:00 VAC\'ta oda boş) ("'+A['Marisol Bexley']+'")');
  const G=await guests(p);ok(!inFlag(G['Marisol Bexley'])&&!inFlag(G['Tamsin Corrigan']),'Misafirler › çıkan Bexley ve Corrigan In-house / Bugün temas yok değil ('+J({b:G['Marisol Bexley'],c:G['Tamsin Corrigan']})+')');
 });

 // ===== 4) VAC 16:00: konaklama uzadi (1401 Dunmore 06.11 -> 09.11, 1403 Ellwood 07.11 -> 10.11) =====
 await p.clock.setSystemTime(AT('16:05'));
 await step('VAC uzatma',async()=>{
  const m=await drop(p,await R.vac({day:D,time:'16:00',rows:VAC_ROWS(true,true)},br),'HSK01124.pdf');
  ok(/^4 dolu · 1 gelecek/.test(m),'VAC 16:00 okundu ('+m+')');
  const B=await badges(p);
  const F=await feed(p,[['1401','Felix Dunmore'],['1403','Priya Ellwood']]);
  ok(depDue(F).indexOf('1401')<0&&inHouse(F).indexOf('1401')>=0,'Kat turu › 1401 Dunmore çıkacaklarda değil, oteldekilerde (çıkacak '+depDue(F)+' · otelde '+inHouse(F)+')');
  ok(/çıkış 09\.11/.test(F.cards['1401']||''),'Kat turu › 1401 kartı "çıkış 09.11" ("'+F.cards['1401']+'")');
  ok(/çıkış 10\.11/.test(F.cards['1403']||'')&&lastNight(F).indexOf('1403')<0,'Kat turu › 1403 kartı "çıkış 10.11", Son gece\'de değil ("'+F.cards['1403']+'" · son gece '+lastNight(F)+')');
  const KP=await katPrint(p);ok((KP.sec['Bugün çıkanlar']||[]).indexOf('1401')<0&&/çıkış 09\.11/.test(KP.sub['1401']||''),'Kat turu yazdır › 1401 "Bugün çıkanlar"da değil, satırı "çıkış 09.11" ('+J(KP.sec['Bugün çıkanlar']||[])+' · "'+KP.sub['1401']+'")');
  const P=await plan(p);ok(!planHas(P,'1403',/Son gece/),'Brifing Plan › 1403 Ellwood (çıkış 10.11) için "Son gece" yok ('+J(P['1403']||[])+')');
  const N=await ntTab(p);ok(N.split(',').indexOf('1401')>=0,'Didn\'t Do It sekmesi › kalan ve hiç dokunulmamış 1401 Dunmore listede ('+N+')');
  ok(B.nt===String(N.split(',').filter(Boolean).length),'Sekme rozeti › Didn\'t Do It = sekmedeki satır sayısı (rozet '+B.nt+', sekme '+N+')');
  const NR=await ntReport(p);ok(!NR.left.some(r=>/^1401/.test(r)),'Didn\'t Do It raporu › Checked Out Untouched: konaklaması uzayan 1401 yok ('+J(NR.left)+')');
  const U=await fuTab(p),d=U.open.find(r=>r.room==='1401');ok(d&&!d.dep,'Takip › 1401 satırında "bugün çıkıyor" yok ('+J(d)+')');
  const W=await warn(p);ok(!W.some(t=>/1401 Felix Dunmore: misafir bugün çıkıyor/.test(t)),'Uyarılar › 1401 için "misafir bugün çıkıyor" yok ('+J(W.filter(t=>/1401/.test(t)))+')');
  const G=await guests(p);ok(inFlag(G['Felix Dunmore']),'Misafirler › konaklaması uzayan Dunmore hâlâ otelde ("'+G['Felix Dunmore']+'")');
 });

 // ===== 5) sayfa yenilenince (saklanan raporlardan) =====
 await step('yenile',async()=>{
  await reload(p);
  const F=await feed(p,[['1401','Felix Dunmore']]);
  ok(J(inHouse(F).concat(depDue(F)).sort())===J(['1401','1403','1404']),'Sayfa yenilenince › Kat turu: oteldekiler + çıkacaklar = 1401,1403,1404 ('+inHouse(F)+' · çıkacak '+depDue(F)+')');
 });

 // ===== B) ayni gunun in-house raporu (07:00) + daha yeni VAC (15:00) =====
 await step('B',async()=>{const {ctx,p:q}=await openCtx(br,D,'07:30');
  try{
   const m=await H.ingest(q,await R.gih({day:D,time:'07:00',rows:[{room:'1203',name:'Bexley,Marisol,Ms.',arr:'2026-11-04',dep:'2026-11-09'},
     {room:'1205',name:'Corrigan,Tamsin,Mrs.',arr:'2026-11-02',dep:'2026-11-07'},{room:'1401',name:'Dunmore,Felix,Mr.',arr:'2026-11-04',dep:D}]},br),'GIH01102.pdf');
   ok(/^3 oda/.test(m),'B: bugünün 07:00 in-house raporu okundu ('+m+')');
   await q.clock.setSystemTime(AT('15:05'));
   const v=await H.ingest(q,await R.vac({day:D,time:'15:00',rows:[occ('1203','Bexley,Marisol,Ms.','2026-11-04','2026-11-09'),vac('1205','0'),occ('1401','Dunmore,Felix,Mr.','2026-11-04','2026-11-09')]},br),'HSK01124.pdf');
   ok(/^2 dolu/.test(v),'B: 15:00 VAC okundu ('+v+')');await wait(q,1500);
   let F=await feed(q,[['1401','Felix Dunmore']]);
   ok(depDue(F).indexOf('1401')<0&&/çıkış 09\.11/.test(F.cards['1401']||''),'B › Kat turu (VAC\'tan hemen sonra): 1401 çıkacaklarda değil, kartı "çıkış 09.11" (çıkacak '+depDue(F)+' · "'+F.cards['1401']+'")');
   const P=await plan(q);ok(!P['1205'],'B › Brifing Plan: 15:00 VAC\'ta boş 1205 için "Son gece" yok ('+J(P['1205']||[])+')');
   const N=await ntTab(q);ok(N.split(',').indexOf('1205')<0,'B › Didn\'t Do It: 15:00 VAC\'ta boş 1205 yok ('+N+')');
   await reload(q);
   F=await feed(q);ok(inHouse(F).concat(depDue(F)).indexOf('1205')<0,'B › sayfa yenilenince Kat turu: boş 1205 geri gelmez ('+inHouse(F)+' · çıkacak '+depDue(F)+')');
   const G=await guests(q);ok(!inFlag(G['Tamsin Corrigan']),'B › sayfa yenilenince Misafirler: Corrigan In-house değil ("'+G['Tamsin Corrigan']+'")');
   ok(q.errs.length===0,'B: JS hatası yok '+J(q.errs));
  }finally{await ctx.close()}
 });

 await done();
})().catch(e=>{console.log('FAIL test çöktü: '+(e&&e.stack||e));process.exit(2)});
