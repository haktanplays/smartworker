// Cikis raporu (DEP01100) + issue Excel'i: okuma mutabakati (Opera toplami), satir sonunda kirilan isim, KVKK (sirket / fiyat
// kodu / odeme saklanmaz), oda listesi (cikan duser, cikacak ve raporda olmayan kalir), oda cakismasi (ayni gun cikan + gelen),
// issue kartinda "Çıktı" / "Bugün çıkıyor", odasiz issue'nun odasi, Sen yokken cikanlar + GR metni, BDI raporu istatistikleri,
// Brifing cikislar. Sahte Opera raporlari, isimler kurgu (KVKK). (Gercek raporlu deptest ve issreal testlerinin yerine, 2026-11-07.)
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05',J=JSON.stringify;
const IN=[{room:'0701',name:'Okafor,Chidi,Mr.',arr:'2026-11-02',dep:D},{room:'0705',name:'Brandt,Leonie,Ms.',arr:'2026-11-03',dep:D},
  {room:'0806',name:'Vasquez,Mateo Luis,Mr.',arr:'2026-11-01',dep:D},{room:'0912',name:'Haddad,Horatio,Mr.',arr:'2026-11-03',dep:D},
  {room:'0802',name:'Fenwick,Iris,Mx.',arr:'2026-11-04',dep:'2026-11-09'},{room:'1209',name:'Sato,Kenji,Mr.',arr:'2026-11-03',dep:D}];
const DEP=[{room:'0701',name:'Okafor,Chidi,Mr.',arr:'2026-11-02',dep:D,time:'10:02',comp:'Northwind Travel',rate:'BAR1',pay:'CA'},
  {room:'0705',name:'Brandt,Leonie,Ms.',arr:'2026-11-03',dep:D,time:'13:43',rate:'WHDY25',pay:'VA'},
  {room:'0806',name:'Vasquez,Mateo',name2:'Luis,Mr.',arr:'2026-11-01',dep:D,time:'09:05',adl:2,comp:'Contoso Holdings'},
  {room:'0912',name:'Haddad,Horatio,Mr.',arr:'2026-11-03',dep:D,st:'DUOT',time:'16:30'},
  {room:'1209',name:'Sato,Kenji,Mr.',arr:'2026-11-03',dep:D,time:'11:00'}];
const HDR=['Start Date & Time','Service Type','Room #','Guest Name','Concern Details','Status','Department','Category','Sub Category','Completed Date & Time','Action Plan','Assigned To','Deadline','Action Status','Request Satisfaction'];
const iRow=(t,room,g,c,st,done)=>[t,'Guest Issue / Recovery',room,g,c,st||'New','Rooms','Room','',done||t,'','',t,'',''];

(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'14:00',butlers:['Can Demir','Nazlı Erten'],me:'Can Demir'});
 // dunun ve bugunun kayitlari: Can'in son vardiyasi dun 12:00'de bitti (Sen yokken o andan beri)
 await H.seed(p,{logs:{[Y]:[H.log('y1',Y,'10:00','1209','Kenji Sato','Touch Call'),H.log('y2',Y,'12:00','0802','Iris Fenwick','Touch Call')],
   [D]:[H.log('d1',D,'11:00','0802','Iris Fenwick','Touch Call',{butler:'Nazlı Erten'})]}});
 // issue Excel'i (Rapor Merkezi yolu): Okafor'un issue'su bugun 09:30 kapandi; Haddad'in issue'sunda oda yok
 let m=await p.evaluate(async([H0,rows])=>{const X=__ev('XLSX'),wb=X.utils.book_new();X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([H0].concat(rows)),'ServiceRequests');
   const f=new File([X.write(wb,{type:'array',bookType:'xlsx'})],'ServiceRequests.xlsx',{lastModified:Date.now()});const r=await __ev('swRepIngest')([f],'elle');return r[0].type+' | '+r[0].msg},
   [HDR,[iRow('05.11.2026 15:00','0701','Chidi Okafor','Room service tray left outside for hours','Completed','06.11.2026 09:30'),iRow('06.11.2026 08:30','0705','Leonie Brandt','Shower drain is slow'),
     iRow('05.11.2026 20:00','','Horatio Haddad','Asked for a late check-out, not confirmed'),iRow('06.11.2026 13:00','1209','Sani Rahimi','Minibar was not stocked on arrival')]]);
 ok(/^issue \| 4 yeni/.test(m),'issue Excel\'i Rapor Merkezi\'nde tanındı: '+m);
 m=await H.ingest(p,await R.gih({day:D,time:'06:00',rows:IN},br),'GIH01102.pdf');console.log('  GIH 06.11: '+m);
 m=await H.ingest(p,await R.arr({day:D,time:'07:00',rows:[{room:'1209',name:'Rahimi,Sani,Ms.',arr:D,dep:'2026-11-10'}]},br),'ARR01102.pdf');console.log('  ARR 06.11: '+m);
 const k1209a=await p.evaluate(()=>{const v=__ev('vacRooms');return v['1209']||''});
 // 13:30 Nazli yeni misafirin (Sani) issue'suna dokundu
 await p.evaluate(()=>{const L=__ev('bdiGetIssues()'),is=L.find(x=>/Rahimi/.test(x.guest)),ev={id:'evS1',ts:Date.now()-30*6e4,type:'touch',butler:'Nazlı Erten',text:'Restocked the minibar'};
   is.events.push(ev);__ev('bdiSaveIssues')(L);__ev('bdiIssueTouch')(is,ev,new Date(Date.now()-30*6e4))});

 // ---- cikis raporu ----
 m=await H.ingest(p,await R.dep({day:D,time:'13:50',rows:DEP},br),'DEP01100.pdf');
 const ty=await p.evaluate(()=>__ev('_swRepLast')[0].type);
 ok(ty==='dep','Rapor Merkezi DEP01100\'ü çıkış raporu olarak tanıdı');
 ok(m==='5 oda · 4 çıktı · 1 çıkacak · Opera toplamıyla aynı','MUTABAKAT: 5 oda = Opera toplamı 5; 4 CKOT, 1 DUOT ('+m+')');
 const slot=await p.evaluate(()=>{const d=document.createElement('div');d.innerHTML=__ev('bdiDepStatusHtml()');return d.textContent});
 ok(/5 oda · 4 çıktı · 1 çıkacak \(13:50 itibarıyla\)/.test(slot)&&/Opera toplamı 5 oda, okunanla aynı/.test(slot),'yuvada Opera toplamıyla karşılaştırma görünüyor: '+slot);
 const ST=await p.evaluate(d=>({raw:__ev('BdiKV').get('bdi_dep_v1'),rows:JSON.parse(__ev('BdiKV').get('bdi_dep_v1')).days[d].rows}),D);
 const V=ST.rows.find(r=>r.room==='0806')||{};
 ok(V.name==='Vasquez,Mateo Luis,Mr.','satır sonunda kırılan isim birleşti: '+V.name);
 ok(!/Northwind|Contoso|BAR1|WHDY25|"CA"|"VA"/.test(ST.raw)&&ST.rows.every(r=>J(Object.keys(r))===J(['room','name','arr','dep','st','time'])),'KVKK: şirket, acente, fiyat kodu ve ödeme saklanmadı');
 const VR=await p.evaluate(()=>{const v=__ev('vacRooms'),k=r=>v[r]!=null?v[r]:v[String(+r)];return {r0701:k('0701'),r0705:k('0705'),r0806:k('0806'),r0912:k('0912'),r0802:k('0802'),r1209:k('1209')}});
 ok(!VR.r0701&&!VR.r0705&&!VR.r0806,'çıkan odalar (CKOT) oda listesinden düştü '+J(VR));
 ok(/Haddad/.test(VR.r0912||'')&&/Fenwick/.test(VR.r0802||''),'DUOT (0912 Haddad) ve raporda olmayan oda (0802) yerinde '+J(VR));
 const I=await p.evaluate(()=>{const o={};__ev('bdiGetIssues()').forEach(x=>o[x.guest.split(' ').pop()]={id:x.id,room:x.room});return o});
 ok(I.Haddad&&I.Haddad.room==='0912','odasız Haddad issue\'su odasını çıkış raporundan buldu ('+(I.Haddad&&I.Haddad.room)+')');

 // issue kartlari
 await H.tab(p,'issues');await p.evaluate(()=>__ev('bdiIssueSetFilter("all")'));await p.waitForTimeout(300);
 const C=await p.evaluate(ids=>{const t=id=>((document.getElementById('bdiIs_'+id)||{}).textContent||'').replace(/\s+/g,' ');return {h:t(ids[0]),b:t(ids[1]),o:t(ids[2])}},[I.Haddad.id,I.Brandt.id,I.Okafor.id]);
 ok(/Bugün çıkıyor 16:30/.test(C.h),'Haddad kartında "Bugün çıkıyor 16:30"');
 ok(/Çıktı 06\.11 13:43/.test(C.b)&&/Çıktı 06\.11 10:02/.test(C.o),'Brandt "Çıktı 06.11 13:43", Okafor (kapalı issue) "Çıktı 06.11 10:02"');

 // oda cakismasi: 1209'dan Sato 11:00'de cikti, ayni gun Sani geldi
 const K=await p.evaluate(d=>({k:(__ev('bdiKatRooms()')['1209']||{}).name||'',at10:__ev('bdiGuestAt')('1209',d,Date.parse(d+'T10:00:00+03:00')),at1330:__ev('bdiGuestAt')('1209',d,Date.parse(d+'T13:30:00+03:00')),
   lg:__ev('loadBdiArrayForDate')(d).filter(l=>l.meta&&l.meta.issueEventId==='evS1').map(l=>l.room+' '+l.guest),
   our:(__ev('bdiLogIdent')({room:'1209',guest:'our guest',time:'13:30',ts:Date.parse(d+'T13:30:00+03:00')},d)||{}).n}),D);
 ok(/Sato/.test(k1209a)&&/Rahimi/.test(VR.r1209||''),'ODA ÇAKIŞMASI: oda listesinde 1209 çıkış raporundan önce Sato (in-house), sonra Sani Rahimi ('+k1209a+' → '+VR.r1209+')');
 ok(/Rahimi/.test(K.k),'kat turu 1209 kartında Sani Rahimi ('+K.k+')');
 ok(/Sato/.test(K.at10)&&/Rahimi/.test(K.at1330)&&/Rahimi/.test(K.our||''),'1209\'da 10:00\'da Sato, 13:30\'da Sani; isimsiz 13:30 kaydı Sani\'ye yazılıyor '+J(K));
 ok(K.lg.length===1&&/^1209 Sani Rahimi$/.test(K.lg[0]),'yeni misafirin issue touch\'u Sani\'ye yazıldı, eski misafire değil '+J(K.lg));

 // Sen yokken cikanlar + GR
 const AW=await p.evaluate(()=>{const d=document.createElement('div');d.innerHTML=__ev('bdiAwayHtml')(true);return {t:d.textContent.replace(/\s+/g,' '),gr:!!d.querySelector('button[onclick="bdiAwayCopyGR()"]'),gtxt:__ev('bdiAwayGRText()')}});
 ok(/Çıkanlar: 4 misafir/.test(AW.t),'Sen yokken çıkanlar: 4 misafir (0701, 0705, 0806, 1209; 0912 henüz çıkmadı) — '+(AW.t.match(/Çıkanlar:[^·]*·[^·]*·[^·]*/)||[''])[0]);
 ok(/Açık issue ile çıktı ?0705/.test(AW.t)&&/Issue ile çıktı ?0701/.test(AW.t)&&/Dokunulmadan çıktı · 1 ?0806/.test(AW.t)&&AW.gr,'kartta "Açık issue ile çıktı", "Issue ile çıktı", "Dokunulmadan çıktı" ve GR kopyalama');
 ok(/0705 Leonie Brandt · çıktı 06\.11 13:43 · issue \(AÇIK\): Shower drain is slow/.test(AW.gtxt)&&/0806 Mateo Luis Vasquez · çıktı 06\.11 09:05 · konaklama boyunca butler teması yok/.test(AW.gtxt)&&!/Sato/.test(AW.gtxt),'GR metni: issue\'lu ve dokunulmadan çıkanlar, dokunularak çıkan (Sato) yok:\n'+AW.gtxt);

 // teyitli kapanis: Okafor'un issue'sunu Nazli kapatti -> BDI kaydina kapanis saatiyle bir kez
 await p.evaluate(id=>{__ev('bdiIssueConfirm')(id,'Nazlı Erten','Apologised, sent a dessert');__ev('bdiIssueConfirm')(id,'Nazlı Erten','again')},I.Okafor.id);
 const CL=await p.evaluate(d=>__ev('loadBdiArrayForDate')(d).filter(l=>l.action==='Issue Closed').map(l=>l.time+' '+l.butler+' '+l.room),D);
 ok(CL.length===1&&CL[0]==='09:30 Nazlı Erten 0701','teyitli kapanış BDI kaydına kapanış saatiyle bir kez yazıldı: '+J(CL));

 // BDI raporu istatistikleri
 const RS=await p.evaluate(d=>{const L=__ev('loadBdiArrayForDate')(d).map(l=>Object.assign({_date:d},l));return {s:__ev('bdiReportStats')(L,d,d),b:__ev('bdiButlerSummary')(L)}},D);
 ok(RS.s.depN===4&&RS.s.depPre===1,'Touched Before Departure 1/4 (yalnız Sato dün temas aldı) '+J({n:RS.s.depN,pre:RS.s.depPre}));
 ok(RS.s.rooms===3&&RS.s.occ===6,'Rooms Served 3/6 (0802, 1209, 0701 / in-house 6 oda) '+J({r:RS.s.rooms,occ:RS.s.occ}));
 const NZ=(Array.isArray(RS.b)?RS.b:(RS.b.list||RS.b.rows||Object.values(RS.b))).find(x=>x&&x.name==='Nazlı Erten')||{};
 ok(NZ.issueClose===1,'Nazlı özet satırında "Issues closed" 1 ('+NZ.issueClose+')');
 const html=await p.evaluate(()=>window.__t.capture(()=>__ev('downloadDidIt()')));
 const sum=await p.evaluate(h=>[...new DOMParser().parseFromString(h,'text/html').querySelectorAll('.summary .item')].map(i=>i.textContent.replace(/\s+/g,' ').trim()),html);
 ok(sum.some(x=>/^3\/6 ?Rooms Served/.test(x))&&sum.some(x=>/^1\/4 ?Touched Before Departure/.test(x)),'Butler Did It raporunun özetinde Rooms Served 3/6 ve Touched Before Departure 1/4: '+J(sum));

 // Brifing: kaynak satiri ve cikislar
 await H.tab(p,'brief');await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(400);
 const F=await p.evaluate(()=>{const s=[...document.querySelectorAll('#bdiBriefBody section.bd-fd-g')].find(x=>/^Çıkışlar/.test(x.querySelector('h3').textContent.trim()));
   return {src:(document.querySelector('#bdiBriefBody .bd-fd-src')||{}).textContent||'',h:s?s.querySelector('h3').textContent.replace(/\s+/g,' ').trim():'',due:s?[...s.querySelectorAll(':scope > .bd-fd-it > .bd-fd-row')].map(b=>b.textContent.replace(/\s+/g,' ').trim()):[]}});
 ok(/Çıkış 13:50/.test(F.src),'brifing kaynak satırı: "Çıkış 13:50" ('+F.src+')');
 ok(/^Çıkışlar 1 çıkacak/.test(F.h)&&F.due.some(t=>/0912/.test(t)&&/açık issue/.test(t)&&/16:30/.test(t))&&F.due.some(t=>/^4 ?çıktı/.test(t)),'brifing "Çıkışlar": 1 çıkacak (0912 16:30, açık issue işaretli) + 4 çıktı '+J(F));
 await done();
})();
