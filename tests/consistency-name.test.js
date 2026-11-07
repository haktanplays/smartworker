// Tutarlilik (bayat veri) testi: MISAFIRIN ADI. Kaynakta ad duzelince adi gosteren HER yer yeni (dogru) adi gostermeli.
// Kullanici bulgusu (oda icin): VAC yuklendi, misafir tasindi, Atolye eski odayi gosteriyordu. Burada ayni soru ad icin.
// Kaynak degisiklikleri gercek yoldan:
//   A) Misafirler sekmesi › "Olası eşleşmeler" › "Aynı kişi, birleştir" (bdiGMSuggestAct -> bdiGMMerge + bdiGMSetName):
//      issue, takip ve elle girilen kayitlarda "Anna Meyr" yazilmis; Opera (in-house / VAC) "Meyer, Anna". Dogru ad Opera'daki.
//   A2) Issues karti › "Otelde bu odada: … (yazım farkı) · bu isimle düzelt" (bdiIssueUseName): ayni duzeltme issue'dan.
//   B) Daha yeni Opera raporu adi farkli yaziyor (on buro profili duzeltti): 14:00 VAC (HSK01124), sonra 20:00 in-house (GIH01102).
//      Sofia Lindqvist -> Lindquist (2104), Kenji Sato -> Satoh (1408), Ingrid Halvorsen -> Halvorson (1403, bugun geldi).
// Sahte Opera raporlari tests/data/opera/reports.js ile uretilir ve Rapor Merkezi'ne birakilir (swRepIngest). Isimler kurgu (KVKK).
// Saat sabit: 2026-11-06. Her yer icin tek ok(): ok(yeni adi gosteriyor ve eski adi gostermiyor, '<yer>: <ne> = <deger>').
// Uygulama bugun yanlissa FAIL bulgudur; duzeltmeden sonra regresyon testi olarak kalir.
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05';
let fails=0;const errsAll=[];
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const at=(p,hm)=>p.clock.setSystemTime(new Date(D+'T'+hm+':00+03:00'));
const TS=(d,hm)=>Date.parse(d+'T'+hm+':00+03:00');
const J=JSON.stringify,sp=s=>String(s||'').replace(/\s+/g,' ').trim();
// H.ingest ile ayni yol (swRepIngest, 'elle'); dosyanin saati sayfanin sabit saati (File varsayilan olarak gercek saati alir)
const ingest=(p,buf,name)=>p.evaluate(async([b64,n])=>{const f=new File([Uint8Array.from(atob(b64),c=>c.charCodeAt(0))],n,{lastModified:Date.now()});const r=await __ev('swRepIngest')([f],'elle');return r.map(x=>x.msg).join(' | ')},[Buffer.from(buf).toString('base64'),name]);

// ---- uydurma otel: 14. kat Can Demir, 21. kat Nazli Erten ----
const G={
  brandt:{room:'1401',op:'Brandt,Leonie,Ms.',arr:'2026-11-04',dep:'2026-11-09'},
  halv:{room:'1403',op:'Halvorsen,Ingrid,Mrs.',op2:'Halvorson,Ingrid,Mrs.',arr:D,dep:'2026-11-11'},
  meyer:{room:'1406',op:'Meyer,Anna,Mrs.',arr:'2026-11-03',dep:'2026-11-09'},
  sato:{room:'1408',op:'Sato,Kenji,Mr.',op2:'Satoh,Kenji,Mr.',arr:Y,dep:'2026-11-08'},
  morel:{room:'2101',op:'Morel,Claire,Ms.',arr:'2026-11-02',dep:'2026-11-10'},
  lind:{room:'2104',op:'Lindqvist,Sofia,Ms.',op2:'Lindquist,Sofia,Ms.',arr:'2026-11-04',dep:'2026-11-10',notes:['Prefers still water at room temperature']}
};
const ROOMS=['1401','1402','1403','1404','1405','1406','1407','1408','2101','2102','2103','2104','2105','2106'];
const nm=(g,v2)=>v2&&g.op2?g.op2:g.op;
// VAC: v2 = duzeltilmis yazim; halvIn = Halvorsen giris yapti (Checked In), yoksa Due In
const vacRows=(v2,halvIn)=>ROOMS.map(r=>{const k=Object.keys(G).find(x=>G[x].room===r);if(!k)return {room:r,fo:'VAC',hk:'CL',nv:'1'};const g=G[k];
  const due=k==='halv'&&!halvIn;return {room:r,name:nm(g,v2),fo:due?'VAC':'OCC',hk:due?'IP':'PU',res:due?'Due In':'Checked In',arr:g.arr,dep:g.dep}});
const gihRows=(v2,withHalv)=>Object.keys(G).filter(k=>k!=='halv'||withHalv).map(k=>{const g=G[k];return {room:g.room,name:nm(g,v2),arr:g.arr,dep:g.dep,notes:g.notes||[]}});

async function start(){
  const S=await H.open({today:D,time:'08:30',butlers:['Can Demir','Nazlı Erten'],me:'Can Demir'});
  const {br,p}=S;
  // dunun kayitlari: Meyer'e elle (yanlis yazimla) girilmis is, Lindqvist'e Nazli'nin isi; kat dagilimi
  await H.seed(p,{logs:{[Y]:[H.log('y1',Y,'10:00','1401','Leonie Brandt','Touch Call'),H.log('y2',Y,'12:00','2101','Claire Morel','Touch Call',{butler:'Nazlı Erten'}),
      H.log('y3',Y,'17:00','1406','Anna Meyr','Special Request',{manual:true,sentence:'Butler arranged a museum visit for the guest.'}),
      H.log('y4',Y,'18:00','2104','Sofia Lindqvist','Special Request',{butler:'Nazlı Erten',sentence:'Butler booked a dinner table for the guest.'})]},
    kv:{bdi_floors_v1:{[D]:{blocks:[{from:14,to:14,butler:'Can Demir'},{from:21,to:21,butler:'Nazlı Erten'}],u:TS(D,'08:00')}}}});
  // 08:30 dun aksamin in-house raporu (GIH 05.11) ve bugunun varis raporu (ARR 06.11)
  let m=await ingest(p,await R.gih({day:Y,time:'22:00',rows:gihRows(false,false)},br),'GIH01102.pdf');console.log('  GIH 05.11: '+m);
  m=await ingest(p,await R.arr({day:D,time:'07:50',rows:[{room:'1403',name:G.halv.op,arr:D,dep:G.halv.dep,adl:2}]},br),'ARR01102.pdf');console.log('  ARR 06.11: '+m);
  await at(p,'09:00');m=await ingest(p,await R.vac({day:D,time:'09:00',rows:vacRows(false,false)},br),'HSK01124.pdf');console.log('  VAC 09:00: '+m);
  // 09:05 issue'lar (ServiceRequests'ten gelmis gibi: Meyer'in adi "Anna Meyr" yazilmis), 09:10 takipler, Atolye'ye girecek tercihler (DNA)
  await at(p,'09:05');
  await p.evaluate(()=>{const now=Date.now(),I=(id,room,guest,c)=>({id,room,guest,concern:c,createdAt:now,u:now,events:[{id:id+'e0',ts:now,type:'import'}]});
    __ev('bdiSaveIssues')(__ev('bdiGetIssues()').concat([I('iM','1406','Anna Meyr','Room too noisy at night'),I('iL','2104','Sofia Lindqvist','Air conditioning too cold')]))});
  await at(p,'09:10');
  await p.evaluate(()=>{const T=s=>Date.parse('2026-11-06T'+s+':00+03:00');
    __ev('bdiFuAdd')({room:'1406',guest:'Anna Meyr',t:'Confirm the quiet room request',due:T('12:00')});
    __ev('bdiFuAdd')({room:'2104',guest:'Sofia Lindqvist',t:'Check the thermostat again',due:T('13:00')})});
  await p.evaluate(async()=>{await __ev('bdiGMIngest')();__ev('_bdiGMProf=null');const now=Date.now(),L=__ev('bdiGMProfiles')().list;
    const gm=(L.find(x=>x.name==='Anna Meyr')||{}).gid,gl=(L.find(x=>x.name==='Sofia Lindqvist')||{}).gid;
    if(gm)await __ev('bdiDnaPut')(gm,d=>{d.items=d.items||{};d.items.x1={sec:'delight',t:'Prefers feather pillows',dept:'HSK',by:'CD',at:now,u:now}});
    if(gl)await __ev('bdiDnaPut')(gl,d=>{d.items=d.items||{};d.items.x2={sec:'delight',t:'Prefers a firm pillow',dept:'HSK',by:'NE',at:now,u:now}})});
  // 10:00 Halvorsen icin in-room check-in (Kayit ekranindan, misafir adi odadan gelir)
  await at(p,'10:00');await H.tab(p,'entry');
  const wi=await p.evaluate(()=>String(__ev('getBdiActions()').findIndex(a=>a.label==='Welcome / In-room Check-in')));
  await p.selectOption('#bdiAction',wi);await p.selectOption('#bdiButler','Can Demir');await p.fill('#bdiRoom','1403');await p.waitForTimeout(150);await p.press('#bdiRoom','Enter');await p.waitForTimeout(400);
  await p.evaluate(()=>{try{__ev('bdiReactClose()')}catch(e){}});await p.fill('#bdiRoom','');
  // 10:15 / 10:20 bugunun isleri: Lindqvist (Nazli), Meyer'e elle "Anna Meyr" adiyla
  await at(p,'10:20');
  await p.evaluate(([d,L])=>{const KV=__ev('BdiKV'),a=JSON.parse(KV.get('bdi_'+d)||'[]');a.push(...L);KV.set('bdi_'+d,JSON.stringify(a))},[D,[
    H.log('t1',D,'10:15','2104','Sofia Lindqvist','Special Request',{butler:'Nazlı Erten',sentence:'Butler arranged a city tour for the guest.'}),
    H.log('t2',D,'10:20','1406','Anna Meyr','Special Request',{manual:true,sentence:'Butler arranged theatre tickets for the guest.'})]]);
  await p.evaluate(async()=>{await __ev('bdiGMIngest')();__ev('_bdiGMProf=null');try{__ev('loadBdiLogs()')}catch(e){}});
  // 11:00 Didn't Do It: 1408 Sato'ya hic dokunulmadi, sebep "DND" secildi (sekmeden)
  await at(p,'11:00');await H.tab(p,'nt');await p.evaluate(d=>__ev('bdiNtDateSet')(d),D);await p.waitForTimeout(200);
  const gk=await p.evaluate(()=>__ev('bdiGuestKey')('Kenji Sato'));
  await p.selectOption('#bdiNtPanel tr:has(input.bd-nt-chk[data-g="'+gk+'"]) select[data-f="r"]','DND');await p.waitForTimeout(150);
  return S;
}

// ---- ad kontrolu: yeni yazim gorunur, eski yazim gorunmez ----
const has=(t,w)=>new RegExp('\\b'+w+'\\b','i').test(String(t||''));
const ctx=(t,g)=>{const o=[],re=new RegExp('[^|]{0,22}\\b(?:'+g.nl+'|'+g.ol+')\\b','gi');let m;t=sp(t);while((m=re.exec(t))&&o.length<4)o.push(sp(m[0]));return o.join(' | ')};
const nameOk=(t,g)=>has(t,g.nl)&&!has(t,g.ol);
const NM=(T,place,t,g)=>ok(nameOk(t,g),T+' '+place+': '+g.room+' '+g.nl+' görünen = "'+(ctx(t,g)||'görünmüyor')+'" (beklenen '+g.nw+'; eski '+g.old+' olmamalı)');
const mentions=(t,g)=>has(t,g.nl)||has(t,g.ol);

// ---- her yerin okunmasi (DOM / rapor HTML'i) ----
// L = [{room,nw,old,nl,ol,at:[yerler],reason?,card?:[metin],touches?}]
async function checkAll(S,T,L){
  const p=S.p,on=k=>L.filter(g=>g.at.indexOf(k)>=0);
  const run=async(name,fn)=>{try{await fn()}catch(e){ok(false,T+' '+name+': test okuyamadı ('+String(e.message||e).split('\n')[0]+')')}};
  // metin: hucreler arasina bosluk (textContent "Sofia Lindqvist2104" gibi bitistirir)
  await p.evaluate(d=>{window.__tx=function T(e){return !e?'':e.nodeType===3?e.textContent:[...e.childNodes].map(T).join(' ')};__ev('showPage("didit")');try{document.getElementById('bdiDate').value=d}catch(e){}},D);

  // 1) Kayit: oda yazinca gorunen misafir + "bu misafir daha once" kutusu; oda listesi kutulari
  await run('Kayıt',async()=>{await H.tab(p,'entry');
    for(const g of on('kayit')){await p.fill('#bdiRoom',g.room);await p.waitForTimeout(300);
      const K=await p.evaluate(()=>{const v=id=>{const e=document.getElementById(id);return e&&e.style.display!=='none'?e.textContent:''};return {hint:v('bdiGuestHint')+' '+v('bdiGuestPick'),mem:v('bdiGuestMemory')}});
      NM(T,'Kayıt › oda yazınca misafir',K.hint,g);
      if(g.at.indexOf('mem')>=0)NM(T,'Kayıt › "misafir hafızası" kutusu',K.mem,g)}
    await p.fill('#bdiRoom','');await p.selectOption('#bdiButler','Nazlı Erten');await p.waitForTimeout(250);
    await p.evaluate(()=>{const P=document.getElementById('bdiBulkPanel');if(!P||P.style.display!=='block')__ev('bdiBulkToggle()');__ev('bdiBulkFloor("")')});await p.waitForTimeout(200);
    const tiles=await p.evaluate(()=>{const o={};document.querySelectorAll('#bdiBulkPanel .bd-bulk-r').forEach(b=>{o[b.querySelector('b').textContent]=(b.querySelector('small')||{}).textContent||''});return o});
    for(const g of on('tiles'))NM(T,'Kayıt › oda listesi kutusu',tiles[g.room],g);
    await p.evaluate(()=>{try{__ev('bdiBulkToggle()')}catch(e){}});
  });

  // 2) Log (gun): Misafir sutunu; Log › oda gorunumu
  await run('Log',async()=>{const rows=await p.evaluate(d=>{document.getElementById('bdiDate').value=d;__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()');try{__ev('renderBdiFiltered()')}catch(e){}
      return [...document.querySelectorAll('#bdi-log-wrap tbody tr')].map(tr=>({room:(tr.children[2]||{}).textContent||'',g:(tr.children[3]||{}).textContent||''}))},D);
    for(const g of on('log'))NM(T,'Log (bugün) › Misafir sütunu',rows.filter(r=>r.room.indexOf(g.room)===0).map(r=>r.g).join(' / '),g);
    const t=await p.evaluate(d=>{const x=new DOMParser().parseFromString(__ev('bdiRoomGridHtml')(d,'log'),'text/html'),o={};x.querySelectorAll('.bd-rg-t').forEach(t=>{o[t.querySelector('b').textContent]=(t.querySelector('small')||{}).textContent||''});return o},D);
    for(const g of on('logrv'))NM(T,'Log › oda görünümü kutusu',t[g.room],g);
  });

  // 3) Butler Didn't Do It: satir (ad + secilen sebep), oda gorunumu, rapor
  await run("Didn't Do It",async()=>{await H.tab(p,'nt');await p.evaluate(d=>__ev('bdiNtDateSet')(d),D);await p.waitForTimeout(300);
    const rows=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel table.bd-nt-tab tbody tr')].map(tr=>({room:(tr.querySelector('td.r')||{}).textContent||'',name:(tr.children[2]||{}).textContent||'',r:(tr.querySelector('select[data-f="r"]')||{}).value||''})));
    for(const g of on('nt')){const r=rows.filter(x=>x.room.indexOf(g.room)>=0);
      NM(T,"Didn't Do It › Misafir sütunu",r.map(x=>x.name).join(' / '),g);
      if(g.reason)ok(r.length===1&&r[0].r===g.reason,T+" Didn't Do It › "+g.room+' satırında daha önce seçilen sebep = '+(r.length?'"'+r.map(x=>x.r).join('/')+'"':'satır yok')+' (beklenen "'+g.reason+'")');}
    for(const g of on('ntabsent')){const r=rows.filter(x=>x.room.indexOf(g.room)>=0||mentions(x.name,g));
      ok(!r.length,T+" Didn't Do It › bugün dokunulan "+g.nw+' listede yok ('+(r.length?r.map(x=>x.room+' '+x.name).join(', '):'yok')+')')}
    const tiles=await p.evaluate(()=>{const o={};document.querySelectorAll('#bdiNtPanel .bd-rg-t').forEach(t=>{o[t.querySelector('b').textContent]=(t.querySelector('small')||{}).textContent||''});return o});
    for(const g of on('ntrv'))NM(T,"Didn't Do It › oda görünümü kutusu",tiles[g.room],g);
    const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')}));
    const RP=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html'),trs=[...d.querySelectorAll('tr')],o=[];
      trs.forEach((tr,i)=>{if(tr.classList.contains('gh')){const nx=trs[i+1];o.push({band:__tx(tr),next:nx&&!nx.classList.contains('gh')?__tx(nx):''})}});return {o,txt:__tx(d.body)}},html);
    for(const g of on('ntr')){const b=RP.o.filter(x=>x.band.indexOf(g.room)>=0);
      NM(T,"Didn't Do It raporu › misafir bandı",b.map(x=>x.band).join(' / '),g);
      if(g.reason)ok(b.length===1&&b[0].next.indexOf(g.reason)>=0,T+" Didn't Do It raporu › "+g.room+' sebep = "'+(b.length?sp(b[0].next):'bant yok')+'" ("'+g.reason+'" içermeli)')}
    for(const g of on('ntabsent'))ok(!mentions(RP.txt,g),T+" Didn't Do It raporu › bugün dokunulan "+g.nw+' raporda yok ("'+(ctx(RP.txt,g)||'yok')+'")');
  });

  // 4) In Room Check In Chart
  if(on('irci').length)await run('In-room',async()=>{await p.evaluate(d=>{__ev('switchBdiTab("irci")');__ev('bdiIrciDateSet')(d)},D);await p.waitForTimeout(200);
    const rows=await p.evaluate(()=>[...document.querySelectorAll('#bdiIrciPanel tbody tr')].map(tr=>({name:(tr.children[0]||{}).textContent||'',room:(tr.children[1]||{}).textContent||''})));
    for(const g of on('irci'))NM(T,'In Room Check In Chart › Guest Name',rows.filter(r=>r.room.indexOf(g.room)>=0).map(r=>r.name).join(' / '),g);
  });

  // 5) Brifing: gunun akisi (+ gun ici hareketler), Plan, vardiya devri, Guest Relations; iPad rehberi; kat turu yazdir
  await run('Brifing akış',async()=>{await H.tab(p,'brief');await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(400);
    await p.evaluate(()=>{const g=__ev('_bdiFeedGrp');['inh','aplain','alate','dleft','vacev','nt','mo-f','mo-l'].forEach(k=>g[k]=1);__ev('bdiFeedRefresh()')});await p.waitForTimeout(300);
    const F=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody .bd-fd-row')].map(b=>({tag:(b.querySelector('.bd-fd-tag')||{}).textContent||'',main:(b.querySelector('.bd-fd-main')||{}).textContent||'',sub:(b.querySelector('.bd-fd-sub')||{}).textContent||''})));
    const MOV=/^(Giriş|Çıktı|Oda)$/;
    for(const g of on('feed')){const its=F.filter(f=>!MOV.test(f.tag)&&(mentions(f.main+' '+f.sub,g)));
      NM(T,'Brifing › Günün akışı satırları',its.map(f=>f.tag+': '+sp(f.main)).join(' / '),g)}
    for(const g of on('nomove')){const mv=F.filter(f=>MOV.test(f.tag)&&(f.main.indexOf(g.room)>=0||mentions(f.main,g)));
      ok(!mv.length,T+' Brifing › Gün içi hareketler: yalnız adı düzelen '+g.room+' için çıkış / giriş yok ('+(mv.map(f=>f.tag+' '+sp(f.main)).join(' / ')||'yok')+')')}
    for(const g of on('movein')){const mv=F.filter(f=>MOV.test(f.tag)&&(f.main.indexOf(g.room)>=0||mentions(f.main,g)));
      NM(T,'Brifing › Gün içi hareketler › Giriş satırı',mv.map(f=>f.tag+' '+sp(f.main)).join(' / '),g)}
  });
  await run('Plan',async()=>{await p.evaluate(()=>{__ev('bdiBriefSetMode("plan")')});await p.waitForTimeout(300);
    const P=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody .bd-pl2-g')].map(g=>({rm:(g.querySelector('.bd-pl2-rm')||{}).textContent,nm:(g.querySelector('.bd-pl2-nm b')||{}).textContent||''})));
    for(const g of on('plan'))NM(T,'Brifing › Plan › misafir adı',P.filter(x=>x.rm===g.room).map(x=>x.nm).join(' / '),g);
  });
  if(on('shift').length)await run('Vardiya devri',async()=>{await p.evaluate(()=>{__ev('bdiBriefSetMode("shift")')});await p.waitForTimeout(300);
    const Lx=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody li')].map(li=>li.textContent));
    for(const g of on('shift'))NM(T,'Brifing › Vardiya devri satırları',Lx.filter(t=>mentions(t,g)).join(' / '),g);
  });
  await run('iPad rehberi',async()=>{const B=await p.evaluate(d=>{const b=__ev('bgdBuild')(d);return {g:b.guests.map(g=>({n:g.name,r:String(g.room)})),f:(b.follows||[]).map(f=>({n:f.name,r:String(f.room)}))}},D);
    for(const g of on('ipad'))NM(T,'iPad rehberi › misafir kartı',B.g.filter(x=>x.r===g.room||mentions(x.n,g)).map(x=>x.r+' '+x.n).join(' / '),g);
    for(const g of on('ipadfu'))NM(T,'iPad rehberi › takip',B.f.filter(x=>x.r===g.room||mentions(x.n,g)).map(x=>x.r+' '+x.n).join(' / '),g);
  });
  await run('Kat turu yazdır',async()=>{const K=await p.evaluate(()=>{const h=window.__t.capture(function(){return __ev('bdiKatPrint()')});const x=new DOMParser().parseFromString(h,'text/html'),o={};
      x.querySelectorAll('td.no').forEach(c=>{o[c.textContent]=(o[c.textContent]||'')+' '+__tx(c.parentNode)});return o});
    for(const g of on('kat'))NM(T,'Kat turu yazdır › oda satırı',K[g.room],g);
  });

  // 6) Atolye: Protel'e girilecekler (grup adi) ve Gelen notlar (in-house raporunun profil notu)
  await run('Atölye',async()=>{await H.tab(p,'atelier');await p.evaluate(()=>{__ev('_bdiAtMode="out"');__ev('renderBdiAtelier()')});await p.waitForTimeout(900);
    const AO=await p.evaluate(()=>[...document.querySelectorAll('#bdiProtelBody .bd-pl-g')].map(g=>({rm:(g.querySelector('.bd-pl-rm')||{}).textContent||'',n:(g.querySelector('.bd-q-name')||{}).textContent||''})));
    for(const g of on('atout')){const gs=AO.filter(x=>mentions(x.n,g));
      ok(gs.length===1&&nameOk(gs[0].n,g),T+" Atölye › Protel'e girilecekler: "+g.room+' grupları = '+(gs.map(x=>x.rm+' '+x.n).join(' / ')||'grup yok')+' (beklenen tek grup: '+g.nw+')');
      // Protel notu (notları aç / kopyala ile Protel'e giden metin): yeni adin profilinde eski yazimla girilen isler ve tercih de olmali
      const PN=await p.evaluate(n=>{__ev('_bdiGMProf=null');const P=__ev('bdiGMProfileByName')(n);return P?__ev('bdiProtelNotes')(P).map(x=>x.text).join('\n'):null},g.nw);
      const miss=(g.protel||[]).filter(x=>!PN||PN.indexOf(x)<0);
      ok(PN!==null&&!miss.length&&!has(PN,g.ol),T+' Protel notu ('+g.nw+' profili, bdiProtelNotes): eski yazımla girilen işler ve tercih notta'+(miss.length?' — eksik: '+miss.join(', '):'')+(PN&&has(PN,g.ol)?' — eski ad notta':'')+(PN===null?' — profil yok':''))}
    if(on('atin').length){await p.evaluate(()=>{__ev('_bdiAtMode="in"');__ev('renderBdiAtelier()')});await p.waitForTimeout(900);
      const AI=await p.evaluate(()=>[...document.querySelectorAll('#bdiAtBody .bd-at-g .bd-at-gh')].map(h=>h.textContent));
      for(const g of on('atin'))NM(T,'Atölye › Gelen notlar › grup başlığı',AI.filter(t=>mentions(t,g)).join(' / '),g)}
  });

  // 7) Misafirler: liste (tek satir, yeni ad, butun temaslar), olasi eslesme kalmadi, misafir karti
  await run('Misafirler',async()=>{await p.evaluate(()=>{__ev('_bdiGMProf=null');['guestSearchName','guestSearchRoom','guestSearchDateFrom','guestSearchDateTo'].forEach(x=>{const e=document.getElementById(x);if(e)e.value=''})});await H.tab(p,'guests');await p.waitForTimeout(1300);
    const GL=await p.evaluate(()=>[...document.querySelectorAll('#bdiGuestProfiles .bd-grow:not(.bd-ghead)')].map(r=>{const n=r.querySelector('.bd-g-name');return {n:n&&n.firstChild?n.firstChild.textContent.trim():'',rm:(r.querySelector('.bd-g-rooms')||{}).textContent||'',t:+((r.querySelector('.bd-num')||{}).textContent||0)}}));
    for(const g of on('glist')){const rs=GL.filter(x=>mentions(x.n,g));
      ok(rs.length===1&&nameOk(rs[0].n,g),T+' Misafirler listesi: '+g.room+' satırları = '+(rs.map(x=>x.n+' ('+x.rm+', '+x.t+' touch)').join(' / ')||'satır yok')+' (beklenen tek satır: '+g.nw+')');
      if(g.touches)ok(rs.some(x=>nameOk(x.n,g)&&x.t>=g.touches),T+' Misafirler listesi: '+g.nw+' satırında touch sayısı = '+(rs.filter(x=>nameOk(x.n,g)).map(x=>x.t).join(', ')||'satır yok')+' (beklenen '+g.touches+', eski yazımla girilenler dahil)')}
    const SG2=await p.evaluate(()=>[...document.querySelectorAll('#bdiGuestProfiles .bd-sug-row')].map(r=>r.textContent.replace(/\s+/g,' ').trim()));
    for(const g of on('sug'))ok(!SG2.some(t=>has(t,g.ol)),T+' Misafirler › Olası eşleşmeler: birleşen '+g.old+' / '+g.nw+' önerisi kalmadı ('+(SG2.filter(t=>has(t,g.ol)).join(' / ')||'yok')+')');
    for(const g of on('card')){
      const gid=await p.evaluate(n=>{__ev('_bdiGMProf=null');const P=__ev('bdiGMProfileByName')(n);return P&&P.gid},g.nw);
      if(!gid){ok(false,T+' Misafir kartı: '+g.nw+' adıyla profil bulunamadı');continue}
      await p.evaluate(x=>__ev('bdiGuestOpen')(x),gid);await p.waitForTimeout(1500);
      const C=await p.evaluate(()=>{const d=[...document.querySelectorAll('.bd-gdetail')].find(y=>y.style.display!=='none'&&y.textContent.trim());if(!d)return null;const r=d.previousElementSibling,n=r&&r.querySelector('.bd-g-name');
        return {n:n&&n.firstChild?n.firstChild.textContent.trim():'',tl:[...d.querySelectorAll('.bd-tl li')].map(li=>li.textContent).join(' | '),iss:[...d.querySelectorAll('.bd-gissue')].map(x=>x.textContent).join(' | ')}});
      NM(T,'Misafir kartı › başlık adı',C?C.n:'',g);
      const miss=(g.card||[]).filter(s=>!C||(C.tl+' '+C.iss).indexOf(s)<0);
      ok(C&&!miss.length,T+' Misafir kartı ('+g.nw+') › geçmiş: eski yazımla girilen iş ve issue kartta'+(miss.length?' — eksik: '+miss.join(', '):'')+(C?'':' (kart açılmadı)'));
    }
  });

  // 8) Takip sekmesi ve Takip raporu
  if(on('fu').length)await run('Takip',async()=>{await H.tab(p,'fu');
    const F=await p.evaluate(()=>[...document.querySelectorAll('#bdiFuPanel .bd-fu-row')].map(r=>({rm:(r.querySelector('.bd-fu-room')||{}).textContent||'',g:(r.querySelector('.bd-fu-g')||{}).textContent||''})));
    for(const g of on('fu'))NM(T,'Takip › satırdaki misafir',F.filter(x=>x.rm===g.room).map(x=>x.g).join(' / '),g);
    const RP=await p.evaluate(d=>{const x=new DOMParser().parseFromString(__ev('bdiFuReportHtml')(d,d),'text/html');return [...x.querySelectorAll('tbody tr')].map(r=>({rm:((r.cells[0]||{}).textContent||'').trim(),t:__tx(r)}))},D);
    for(const g of on('fu'))NM(T,'Takip raporu (Butler Follow-ups) › satır',RP.filter(x=>x.rm===g.room).map(x=>sp(x.t)).join(' / '),g);
  });

  // 9) Issues karti
  if(on('iss').length)await run('Issues',async()=>{await H.tab(p,'issues');try{await p.evaluate(()=>__ev('bdiIssueSetFilter("all")'))}catch(e){}await p.waitForTimeout(300);
    const I=await p.evaluate(()=>[...document.querySelectorAll('article.bd-issue')].map(a=>({rm:((a.querySelector('.bd-issue-room')||{}).textContent||'').trim(),g:(a.querySelector('.bd-issue-guest')||{}).textContent||''})));
    for(const g of on('iss'))NM(T,'Issues › kartın misafir adı',I.filter(x=>x.rm.indexOf(g.room)===0).map(x=>sp(x.g)).join(' / '),g);
  });

  // 10) Butler Alert tablosu
  if(on('alert').length)await run('Butler Alert',async()=>{await H.tab(p,'alert');await p.evaluate(()=>__ev('setAlertFilter("all")'));await p.waitForTimeout(200);
    const A=await p.evaluate(()=>[...document.querySelectorAll('#bdiTab_alert tbody tr')].map(tr=>({rm:(tr.children[0]||{}).textContent||'',g:(tr.children[1]||{}).textContent||''})).filter(x=>x.g));
    for(const g of on('alert'))NM(T,'Butler Alert › Misafir sütunu',A.filter(x=>x.rm.trim().indexOf(String(+g.room))===0||x.rm.indexOf(g.room)>=0).map(x=>sp(x.g)).join(' / '),g);
  });

  // 11) Uyarilar penceresi
  if(on('warn').length)await run('Uyarılar',async()=>{const W=await p.evaluate(()=>{__ev('swWarnOpen()');const m=document.getElementById('swWarnModal'),t=m?[...m.querySelectorAll('span[style*="flex:1"]')].map(x=>x.textContent):[];if(m)m.style.display='none';return t});
    for(const g of on('warn'))NM(T,'Uyarılar › "Oda '+g.room+' …" maddeleri',W.filter(t=>t.indexOf('Oda '+g.room)>=0).join(' / '),g);
  });

  // 12) Butler Did It raporu (gun)
  if(on('bdi').length)await run('Butler Did It raporu',async()=>{const txt=await p.evaluate(d=>{document.getElementById('bdiDate').value=d;__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()');
      const h=window.__t.capture(function(){return __ev('downloadDidIt()')});return __tx(new DOMParser().parseFromString(h,'text/html').body)},D);
    for(const g of on('bdi'))NM(T,'Butler Did It raporu (06.11)',txt,g);
  });
}

// ---- misafirler ve kontrol edilecek yerleri ----
const PL=['kayit','tiles','log','logrv','feed','plan','ipad','kat','glist','bdi'];
const MEYER={room:'1406',nw:'Anna Meyer',old:'Anna Meyr',nl:'Meyer',ol:'Meyr',touches:2,card:['theatre tickets','museum visit','Room too noisy at night'],protel:['theatre tickets','museum visit','feather pillows'],
  at:PL.concat(['mem','ntabsent','shift','ipadfu','atout','sug','card','fu','iss','warn'])};
const LIND={room:'2104',nw:'Sofia Lindquist',old:'Sofia Lindqvist',nl:'Lindquist',ol:'Lindqvist',touches:2,card:['city tour','dinner table','Air conditioning too cold'],protel:['city tour','dinner table','firm pillow'],
  at:PL.concat(['mem','ntabsent','nomove','shift','ipadfu','atout','atin','card','fu','iss','warn'])};
const SATO={room:'1408',nw:'Kenji Satoh',old:'Kenji Sato',nl:'Satoh',ol:'Sato',reason:'DND',at:['kayit','tiles','logrv','nt','ntrv','ntr','feed','nomove','plan','ipad','kat','glist']};
const HALV={room:'1403',nw:'Ingrid Halvorson',old:'Ingrid Halvorsen',nl:'Halvorson',ol:'Halvorsen',touches:1,at:['kayit','mem','tiles','log','irci','feed','movein','plan','ipad','kat','glist','alert','bdi']};

(async()=>{
 // ===== A) Misafirler › "Aynı kişi, birleştir": Anna Meyr + Anna Meyer -> Anna Meyer (Opera'daki yazim) =====
 let S=await start();
 try{
  const p=S.p;await at(p,'14:00');
  const B=await p.evaluate(()=>({fu:__ev('bdiFuList')().map(f=>f.room+' '+f.guest),is:__ev('bdiGetIssues()').map(i=>i.room+' '+i.guest),vr:__ev('vacRooms')['1406']}));
  ok(B.fu.indexOf('1406 Anna Meyr')>=0&&B.is.indexOf('1406 Anna Meyr')>=0&&/Meyer/.test(B.vr||''),'A ön koşul: takip ve issue "Anna Meyr", VAC "Meyer, Anna" ('+J(B)+')');
  await H.tab(p,'guests');await p.waitForTimeout(1300);
  await p.evaluate(()=>{const d=document.querySelector('#bdiGuestProfiles details.bd-sug');if(d)d.open=true});
  const row=p.locator('#bdiGuestProfiles .bd-sug-row',{hasText:'Anna Meyr'});
  const n=await row.count();ok(n===1,'A ön koşul: Misafirler › Olası eşleşmeler: "Anna Meyer ve Anna Meyr" önerisi var ('+n+')');
  if(n){await row.first().locator('button',{hasText:'Aynı kişi, birleştir'}).click();await p.waitForTimeout(1500)}
  const M=await p.evaluate(()=>{__ev('_bdiGMProf=null');const L=__ev('bdiGMProfiles')().list.filter(x=>/Mey/.test(Object.keys(x.rawNames||{}).join(' ')));return L.map(x=>x.name+' ['+Object.keys(x.rawNames).join(', ')+'] '+x.touches+' touch')});
  ok(M.length===1&&/^Anna Meyer \[/.test(M[0]),'A: birleştirme yapıldı, tek profil "Anna Meyer" ('+J(M)+')');
  await checkAll(S,'[A birleştir]',[MEYER]);
  // ayni veri, sayfa yenilenince (ertesi acilis / ikinci bilgisayar gibi): birlestirme misafir hafizasinda kalici
  await p.reload();await p.waitForTimeout(1500);await p.evaluate(async()=>{await __ev('BdiKV').ready();try{__ev('closeSetupModal()')}catch(e){}});await p.waitForTimeout(1500);
  await checkAll(S,'[A birleştir, sayfa yenilendi]',[MEYER]);
 }catch(e){ok(false,'A senaryosu çöktü: '+String(e.message||e).split('\n')[0])}
 errsAll.push(...S.errs);await S.br.close();

 // ===== A2) Issues karti › "Otelde bu odada: Anna Meyer (yazım farkı) — bu isimle düzelt" (bdiIssueUseName) =====
 S=await start();
 try{
  const p=S.p;await at(p,'14:00');await H.tab(p,'issues');try{await p.evaluate(()=>__ev('bdiIssueSetFilter("all")'))}catch(e){}await p.waitForTimeout(300);
  const btn=p.locator('article.bd-issue',{hasText:'Anna Meyr'}).locator('button',{hasText:'bu isimle düzelt'});
  const n=await btn.count();ok(n===1,'A2 ön koşul: Issues › Meyr kartında "Otelde bu odada: Anna Meyer (yazım farkı) · bu isimle düzelt" var ('+n+')');
  if(n){await btn.first().click();await p.waitForTimeout(1500)}
  const is=await p.evaluate(()=>(__ev('bdiGetIssues()').find(x=>x.id==='iM')||{}).guest);
  ok(is==='Anna Meyer','A2: issue düzeltildi ('+is+')');
  await checkAll(S,'[A2 issue: bu isimle düzelt]',[MEYER]);
 }catch(e){ok(false,'A2 senaryosu çöktü: '+String(e.message||e).split('\n')[0])}
 errsAll.push(...S.errs);await S.br.close();

 // ===== B) Daha yeni Opera raporu adi duzeltilmis yaziyor: 14:00 VAC, sonra 20:00 in-house =====
 S=await start();
 try{
  const p=S.p;await at(p,'14:00');
  const msg=await ingest(p,await R.vac({day:D,time:'14:00',rows:vacRows(true,true)},S.br),'HSK01124.pdf');
  ok(/^6 dolu/.test(msg),'B: 14:00 VAC yüklendi ('+msg+')');await p.waitForTimeout(1500);
  const V=await p.evaluate(()=>{const v=__ev('vacRooms');return [v['2104'],v['1408'],v['1403']]});
  ok(J(V)===J(['Lindquist, Sofia','Satoh, Kenji','Halvorson, Ingrid']),'B ön koşul: oda listesi yeni yazımda ('+J(V)+')');
  await checkAll(S,'[B VAC]',[LIND,SATO,HALV]);
  await at(p,'20:00');
  const m2=await ingest(p,await R.gih({day:D,time:'20:00',rows:gihRows(true,true)},S.br),'GIH01102.pdf');
  ok(/^6 oda/.test(m2),'B: 20:00 in-house yüklendi ('+m2+')');await p.waitForTimeout(1500);
  await checkAll(S,'[B VAC+GIH]',[LIND,SATO,HALV]);
 }catch(e){ok(false,'B senaryosu çöktü: '+String(e.message||e).split('\n')[0])}
 errsAll.push(...S.errs);await S.br.close();

 ok(errsAll.length===0,'JS hatası yok '+J(errsAll));
 console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0);
})().catch(e=>{console.log('FAIL test çöktü: '+(e&&e.stack||e));process.exit(2)});
