// Tutarlilik (bayat veri) testi: MISAFIRIN ODASI. Kaynak degisince (oda degisikligi) misafirin odasini gosteren HER yer yeni odayi gostermeli.
// Kullanici bulgusu: VAC yuklendi, misafir tasindi, Atolye eski odayi gosteriyordu. Kaynak degisikligi gercek yoldan: sahte Opera
// raporlari Rapor Merkezi'ne birakilir (H.ingest). Isimler kurgu (KVKK). Saat sabit: 2026-11-06.
// Otel: 14. kat (Can Demir) ve 21. kat (Nazli Erten). Tasinanlar:
//   Anna Meyer   1406 -> 2104 (in-house, hic dokunulmadi: Didn't Do It; takip, issue, Protel notu, in-house notu var)
//   Ingrid Halvorsen 1403 -> 2106 (bugun geldi, ARR'de 1403, Butler Alert, in-room check-in, issue + issue touch'i)
// Senaryolar: A) yeni VAC (HSK01124) 14:00, ayrica sayfa yenilenince  B) aksam yeni in-house (GIH01102), yeni VAC yok
//             C) bir gunde iki oda degisikligi (VAC 12:00 1406 -> 1402, VAC 16:00 1402 -> 2104)
// Her yer icin tek ok(): ok(yeni degeri gosteriyor, '<yer>: <ne> = <deger>'). Uygulama bugun yanlissa FAIL bulgudur, duzeltmeden sonra regresyon testi olur.
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05';
let fails=0,errsAll=[];
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const at=(p,hm)=>p.clock.setSystemTime(new Date(D+'T'+hm+':00+03:00'));
const J=JSON.stringify,sp=s=>String(s||'').replace(/\s+/g,' ').trim();

// ---- uydurma misafirler ----
const G={
  brandt:{name:'Brandt,Leonie,Ms.',arr:'2026-11-04',dep:'2026-11-09'},
  meyer:{name:'Meyer,Anna,Mrs.',arr:'2026-11-03',dep:'2026-11-09'},
  sato:{name:'Sato,Kenji,Mr.',arr:'2026-11-05',dep:'2026-11-08'},
  morel:{name:'Morel,Claire,Ms.',arr:'2026-11-02',dep:'2026-11-10'},
  fenwick:{name:'Fenwick,Iris,Mx.',arr:'2026-11-04',dep:'2026-11-07'},
  halv:{name:'Halvorsen,Ingrid,Mrs.',arr:D,dep:'2026-11-11'}
};
const ROOMS=['1401','1402','1403','1404','1405','1406','1407','1408','2101','2102','2103','2104','2105','2106','2107','2108'];
// VAC satirlari: occ = {oda:[misafir, 'Checked In'|'Due In']}, diger odalar bos
const vacRows=occ=>ROOMS.map(r=>{const o=occ[r];if(!o)return {room:r,fo:'VAC',hk:'CL',nv:'1'};const g=G[o[0]],due=/due/i.test(o[1]);
  return {room:r,name:g.name,fo:due?'VAC':'OCC',hk:due?'IP':'PU',res:o[1],arr:g.arr,dep:g.dep}});
const gihRows=occ=>Object.keys(occ).filter(r=>occ[r]&&!/due/i.test(occ[r][1]||'')).map(r=>{const k=occ[r][0],g=G[k];
  return {room:r,name:g.name,arr:g.arr,dep:g.dep,notes:k==='meyer'?['Prefers still water at room temperature']:[]}});
const BASE={'1401':['brandt','Checked In'],'1403':['halv','Due In'],'1406':['meyer','Checked In'],'1408':['sato','Checked In'],'2101':['morel','Checked In'],'2105':['fenwick','Checked In']};
const occ=(o)=>Object.assign({},BASE,o);

async function start(){
  const S=await H.open({today:D,time:'08:30',butlers:['Can Demir','Nazlı Erten'],me:'Can Demir'});
  S.p.on('pageerror',()=>{}); // H.open zaten topluyor
  // Dunun kayitlari (Meyer ve Fenwick'e hic dokunulmadi), kat dagilimi
  await H.seed(S.p,{logs:{[Y]:[H.log('y1',Y,'10:00','1401','Leonie Brandt','Touch Call'),H.log('y2',Y,'11:00','1408','Kenji Sato','Touch Call'),
      H.log('y3',Y,'12:00','2101','Claire Morel','Touch Call',{butler:'Nazlı Erten'})]},
    kv:{bdi_floors_v1:{[D]:{blocks:[{from:14,to:14,butler:'Can Demir'},{from:21,to:21,butler:'Nazlı Erten'}],u:Date.now()}}}});
  const {br,p}=S;
  // 08:30 dun aksamin in-house raporu (GIH 05.11) ve bugunun varis raporu (ARR 06.11)
  let m=await H.ingest(p,await R.gih({day:Y,time:'22:00',rows:gihRows(BASE)},br),'GIH01102.pdf');console.log('  GIH 05.11: '+m);
  m=await H.ingest(p,await R.arr({day:D,time:'07:50',rows:[{room:'1403',name:G.halv.name,arr:D,dep:G.halv.dep,adl:2}]},br),'ARR01102.pdf');console.log('  ARR 06.11: '+m);
  // 09:00 VAC 1
  await at(p,'09:00');m=await H.ingest(p,await R.vac({day:D,time:'09:00',rows:vacRows(BASE)},br),'HSK01124.pdf');console.log('  VAC 09:00: '+m);
  // 09:05 Meyer icin takip (Takip sekmesinden, butlerin yazdigi gibi), issue, Protel'e girilecek tercih
  await at(p,'09:05');await H.tab(p,'fu');await p.fill('#bdiFuQ','1406 13:30 su tercihini teyit et');await p.press('#bdiFuQ','Enter');await p.waitForTimeout(300);
  await p.evaluate(async()=>{const now=Date.now(),I=(id,room,guest,c)=>({id,room,guest,concern:c,createdAt:now,u:now,events:[{id:id+'e0',ts:now,type:'import'}]});
    __ev('bdiSaveIssues')(__ev('bdiGetIssues()').concat([I('iM','1406','Anna Meyer','Room too noisy at night')]));
    await __ev('bdiGMIngest')();__ev('_bdiGMProf=null');const g=__ev('bdiGMProfiles')().list.find(x=>/Meyer/.test(x.name)).gid;
    await __ev('bdiDnaPut')(g,d=>{d.items=d.items||{};d.items.x1={sec:'delight',t:'Prefers feather pillows',dept:'HSK',by:'CD',at:now,u:now}})});
  // 10:00 Halvorsen icin in-room check-in (Kayit ekranindan), 10:30 issue, 10:45 issue'ya Can'in temasi
  await at(p,'10:00');await H.tab(p,'entry');
  const wi=await p.evaluate(()=>String(__ev('getBdiActions()').findIndex(a=>a.label==='Welcome / In-room Check-in')));
  await p.selectOption('#bdiAction',wi);await p.selectOption('#bdiButler','Can Demir');await p.fill('#bdiRoom','1403');await p.waitForTimeout(150);await p.press('#bdiRoom','Enter');await p.waitForTimeout(400);
  await p.evaluate(()=>{try{__ev('bdiReactClose()')}catch(e){}});await p.fill('#bdiRoom','');
  await at(p,'10:30');
  await p.evaluate(()=>{const now=Date.now();__ev('bdiSaveIssues')(__ev('bdiGetIssues()').concat([{id:'iH',room:'1403',guest:'Ingrid Halvorsen',concern:'Air conditioning too cold',createdAt:now,u:now,events:[{id:'iHe0',ts:now,type:'import'}]}]))});
  await at(p,'10:45');
  await p.evaluate(()=>{const L=__ev('bdiGetIssues()'),is=L.find(x=>x.id==='iH'),ev={id:'iHe1',ts:Date.now(),type:'touch',butler:'Can Demir',text:'Adjusted the thermostat'};is.events.push(ev);__ev('bdiSaveIssues')(L);__ev('bdiIssueTouch')(is,ev,new Date())});
  return S;
}

// ---- her yerin okunmasi (DOM / rapor HTML'i) ----
// E = {tag, m:{name,last,room,old:[...],owner}, h:{...} | null}
async function checkAll(S,E){
  const p=S.p,T=E.tag,m=E.m,h=E.h;
  const run=async(name,fn)=>{try{await fn()}catch(e){ok(false,T+' '+name+': test okuyamadı ('+String(e.message||e).split('\n')[0]+')')}};
  const noOld=(s,x)=>!x.old.some(o=>new RegExp('\\b'+o+'\\b').test(s));
  await p.evaluate(()=>{__ev('showPage("didit")');try{document.getElementById('bdiDate').value=__ev('getToday()')}catch(e){}});

  // 1) Kayit: oda yazinca gorunen misafir; oda listesi kutulari
  await run('Kayıt',async()=>{await H.tab(p,'entry');
    const hint=async r=>{await p.fill('#bdiRoom',r);await p.waitForTimeout(250);return p.evaluate(()=>{const a=document.getElementById('bdiGuestHint'),b=document.getElementById('bdiGuestPick');return ((a?a.textContent:'')+' '+(b&&b.style.display!=='none'?b.textContent:'')).replace(/\s+/g,' ').trim()})};
    for(const x of [m,h].filter(Boolean)){
      const n=await hint(x.room);ok(n.includes(x.name),T+' Kayıt: '+x.room+' yazınca görünen misafir = "'+n+'" (beklenen '+x.name+')');
      for(const o of x.old){const s=await hint(o);ok(!s.includes(x.last),T+' Kayıt: eski oda '+o+' yazınca görünen = "'+s+'" ('+x.name+' görünmemeli)')}
    }
    await p.fill('#bdiRoom','');await p.selectOption('#bdiButler','Nazlı Erten');await p.waitForTimeout(250);
    await p.evaluate(()=>{const P=document.getElementById('bdiBulkPanel');if(!P||P.style.display!=='block')__ev('bdiBulkToggle()');__ev('bdiBulkFloor("")')});await p.waitForTimeout(200);
    const tiles=await p.evaluate(()=>{const o={};document.querySelectorAll('#bdiBulkPanel .bd-bulk-r').forEach(b=>{o[b.querySelector('b').textContent]=b.querySelector('small').textContent});return o});
    for(const x of [m,h].filter(Boolean)){const where=Object.keys(tiles).filter(r=>tiles[r].includes(x.last));
      ok(where.join()===x.room,T+' Kayıt › oda listesi kutuları: '+x.last+' görünen kutu(lar) = '+(where.join(', ')||'yok')+' (beklenen yalnız '+x.room+')')}
    await p.evaluate(()=>{try{__ev('bdiBulkToggle()')}catch(e){}});
  });

  // 2) Butler Didn't Do It: satir (oda + kat sorumlusu), oda gorunumu
  await run("Didn't Do It",async()=>{await p.evaluate(d=>{__ev('switchBdiTab("nt")');__ev('bdiNtDateSet')(d)},D);await p.waitForTimeout(300);
    const R=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel table.bd-nt-tab tbody tr')].map(tr=>{const td=[...tr.children].map(c=>c.textContent.trim());return {room:(tr.querySelector('td.r')||{}).textContent,name:td[2],own:(tr.querySelector('td.f')||{}).textContent}}));
    const r=R.find(x=>/Meyer/.test(x.name));
    ok(r&&r.room===m.room,T+" Didn't Do It: "+m.name+' satırında oda = '+(r?r.room:'satır yok')+' (beklenen '+m.room+')');
    ok(r&&r.own===m.owner,T+" Didn't Do It: "+m.name+' satırında kat sorumlusu = '+(r?r.own:'satır yok')+' (beklenen '+m.owner+')');
    const tiles=await p.evaluate(()=>{const o={};document.querySelectorAll('#bdiNtPanel .bd-rg-t').forEach(t=>{o[t.querySelector('b').textContent]=(t.querySelector('small')||{}).textContent||''});return o});
    const where=Object.keys(tiles).filter(k=>tiles[k]==='Meyer');
    ok(where.join()===m.room,T+" Didn't Do It › oda görünümü: Meyer kutusu = "+(where.join(', ')||'yok')+' (beklenen yalnız '+m.room+')');
    const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')}));
    const RP=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html'),trs=[...d.querySelectorAll('table.gtab tbody tr')];let band='',own='';
      trs.forEach((tr,i)=>{if(tr.classList.contains('gh')&&/Anna Meyer/.test(tr.textContent)){band=tr.textContent.replace(/\s+/g,' ').trim();const nx=trs[i+1];if(nx&&!nx.classList.contains('gh'))own=(nx.children[0]||{}).textContent||''}});return {band,own}},html);
    ok(RP.band.includes(m.room)&&noOld(RP.band,m),T+" Didn't Do It raporu: misafir bandı = \""+RP.band+'" (beklenen oda '+m.room+')');
    ok(RP.own.trim()===m.owner,T+" Didn't Do It raporu: Floor sütunu = "+(RP.own||'yok')+' (beklenen '+m.owner+')');
  });

  // 3) Log › oda gorunumu
  await run('Log oda görünümü',async()=>{const t=await p.evaluate(d=>{const x=new DOMParser().parseFromString(__ev('bdiRoomGridHtml')(d,'log'),'text/html'),o={};x.querySelectorAll('.bd-rg-t').forEach(t=>{o[t.querySelector('b').textContent]=(t.querySelector('small')||{}).textContent||''});return o},D);
    for(const x of [m,h].filter(Boolean)){const where=Object.keys(t).filter(k=>t[k]===x.last);ok(where.join()===x.room,T+' Log › oda görünümü: '+x.last+' kutusu = '+(where.join(', ')||'yok')+' (beklenen yalnız '+x.room+')')}
  });

  // 4) In Room Check In Chart
  if(h)await run('In-room',async()=>{await p.evaluate(d=>{__ev('switchBdiTab("irci")');__ev('bdiIrciDateSet')(d)},D);await p.waitForTimeout(200);
    const R=await p.evaluate(()=>[...document.querySelectorAll('#bdiIrciPanel tbody tr')].map(tr=>({name:tr.children[0].textContent,room:tr.children[1].textContent})));
    const r=R.find(x=>/Halvorsen/.test(x.name));ok(r&&r.room===h.room,T+' In Room Check In Chart: '+h.name+' Room Number = '+(r?r.room:'satır yok')+' (beklenen '+h.room+')');
  });

  // 5) Brifing: gunun akisi (kat turu dahil), Plan, vardiya devri, GR, iPad rehberi
  await run('Brifing akış',async()=>{await H.tab(p,'brief');await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(400);
    await p.evaluate(()=>{const g=__ev('_bdiFeedGrp');['inh','aplain','alate','dleft','vacev','nt','mo-f','mo-l'].forEach(k=>g[k]=1);__ev('bdiFeedRefresh()')});await p.waitForTimeout(300);
    const F=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody .bd-fd-row')].map(b=>({tag:(b.querySelector('.bd-fd-tag')||{}).textContent||'',rm:((b.querySelector('.bd-fd-main b')||{}).textContent||''),main:(b.querySelector('.bd-fd-main')||{}).textContent||''})));
    for(const x of [m,h].filter(Boolean)){
      const its=F.filter(f=>f.main.includes(x.last)&&!/→/.test(f.rm)),rooms=[...new Set(its.map(f=>f.rm))];
      ok(its.length&&rooms.join()===x.room,T+' Brifing › Günün akışı: '+x.last+' satırlarında oda = '+(rooms.join(', ')||'satır yok')+' ['+its.map(f=>f.tag+':'+f.rm).join(' ')+'] (beklenen yalnız '+x.room+')');
      const kt=its.filter(f=>/^Kat /.test(f.tag)||/^Gelen|^Bekleniyor/.test(f.tag));
      ok(kt.length&&kt.every(f=>f.rm===x.room)&&kt.every(f=>!/^Kat /.test(f.tag)||f.tag==='Kat '+x.room.slice(0,2)),T+' Kat turu (Oteldekiler / Gelenler): '+x.last+' = '+(kt.map(f=>f.tag+':'+f.rm).join(' ')||'yok')+' (beklenen '+x.room+')');
    }
    if(E.moves){const mv=F.filter(f=>/→/.test(f.rm)&&f.main.includes(m.last)).map(f=>f.rm.replace(/\s/g,''));
      ok(E.moves.every(x=>mv.includes(x)),T+' Brifing › Gün içi hareketler: '+m.last+' = '+(mv.join(', ')||'yok')+' (beklenen '+E.moves.join(', ')+')')}
  });
  await run('Plan',async()=>{await p.evaluate(()=>{__ev('bdiBriefSetMode("plan")')});await p.waitForTimeout(300);
    const P=await p.evaluate(()=>{const o=[];document.querySelectorAll('#bdiBriefBody .bd-pl2-grp').forEach(gr=>{const b=(gr.querySelector('.bd-pl2-gh b')||{}).textContent||'';gr.querySelectorAll('.bd-pl2-g').forEach(g=>o.push({b,rm:(g.querySelector('.bd-pl2-rm')||{}).textContent,nm:(g.querySelector('.bd-pl2-nm')||{}).textContent||''}))});return o});
    for(const x of [m,h].filter(Boolean)){const its=P.filter(g=>g.nm.includes(x.last));
      ok(its.length&&its.every(g=>g.rm===x.room),T+' Brifing › Plan: '+x.last+' kartlarında oda = '+(its.map(g=>g.rm).join(', ')||'kart yok')+' (beklenen '+x.room+')');
      ok(its.length&&its.every(g=>g.b===x.owner),T+' Brifing › Plan: '+x.last+' işleri kimde = '+(its.map(g=>g.b).join(', ')||'kart yok')+' (beklenen '+x.owner+')');}
  });
  await run('Vardiya devri',async()=>{await p.evaluate(()=>{__ev('bdiBriefSetMode("shift")')});await p.waitForTimeout(300);
    const L=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody .bd-bf-open li')].map(li=>li.textContent));
    const mm=L.filter(t=>t.includes('Anna Meyer')),rooms=[...new Set(mm.map(t=>(/oda (\S+)/i.exec(t)||[])[1]))];
    ok(mm.length&&rooms.join()===m.room,T+' Brifing › Vardiya devri (Açık kalanlar): Meyer satırlarında oda = '+(rooms.join(', ')||'satır yok')+' (beklenen '+m.room+')');
  });
  await run('GR',async()=>{await p.evaluate(()=>{__ev('bdiBriefSetMode("gr")')});await p.waitForTimeout(300);
    const r=await p.evaluate(()=>{const x=[...document.querySelectorAll('#bdiBriefBody .bd-bf-rrow')].find(r=>/Meyer/.test(r.textContent));return x?(x.querySelector('.bd-sub')||{}).textContent:null});
    ok(r===m.room,T+' Brifing › Guest Relations: Meyer odası = '+r+' (beklenen '+m.room+')');
  });
  await run('iPad rehberi',async()=>{const B=await p.evaluate(d=>{const b=__ev('bgdBuild')(d);return {g:b.guests.map(g=>({n:g.name,r:g.room,s:g.status})),f:b.follows.map(f=>({n:f.name,r:f.room}))}},D);
    for(const x of [m,h].filter(Boolean)){const g=B.g.filter(y=>y.n.includes(x.last));ok(g.length===1&&g[0].r===x.room,T+' iPad rehberi (oluşturulan): '+x.last+' misafir kartı oda = '+(g.map(y=>y.r).join(', ')||'kart yok')+' (beklenen '+x.room+')')}
    const f=B.f.filter(y=>y.n.includes(m.last));ok(f.length&&f.every(y=>y.r===m.room),T+' iPad rehberi: Meyer takibi oda = '+(f.map(y=>y.r).join(', ')||'yok')+' (beklenen '+m.room+')');
  });

  // 6) Atolye
  await run('Atölye',async()=>{await H.tab(p,'atelier');await p.evaluate(()=>{__ev('_bdiAtMode="out"');__ev('renderBdiAtelier()')});await p.waitForTimeout(900);
    const AO=await p.evaluate(()=>{const g=[...document.querySelectorAll('#bdiProtelBody .bd-pl-g')].find(x=>/Meyer/.test(x.textContent));return g?(g.querySelector('.bd-pl-rm')||{}).textContent:'grup yok'});
    ok(AO===m.room,T+" Atölye › Protel'e girilecekler: Meyer odası = "+AO+' (beklenen '+m.room+')');
    await p.evaluate(()=>{__ev('_bdiAtMode="in"');__ev('renderBdiAtelier()')});await p.waitForTimeout(900);
    const AI=await p.evaluate(()=>{const g=[...document.querySelectorAll('#bdiAtBody .bd-at-g')].find(x=>/Meyer/.test(x.textContent)&&x.querySelector('.bd-at-gh b'));return g?g.querySelector('.bd-at-gh b').textContent:'grup yok'});
    ok(AI===m.room,T+' Atölye › Gelen notlar: Meyer odası = '+AI+' (beklenen '+m.room+')');
  });

  // 7) Misafirler listesi ve misafir karti
  await run('Misafirler',async()=>{await p.evaluate(()=>{__ev('_bdiGMProf=null')});await H.tab(p,'guests');await p.waitForTimeout(1300);
    const GL=await p.evaluate(()=>{const o={};document.querySelectorAll('.bd-grow').forEach(r=>{const n=(r.querySelector('.bd-g-name')||{}).textContent||'';o[n]=(r.querySelector('.bd-g-rooms')||{}).textContent});return o});
    for(const x of [m,h].filter(Boolean)){const k=Object.keys(GL).find(n=>n.includes(x.last));ok(k&&GL[k]===x.room,T+' Misafirler listesi: '+x.last+' oda = '+(k?GL[k]:'satır yok')+' (beklenen '+x.room+')')}
    const gid=await p.evaluate(()=>{const P=__ev('bdiGMProfiles')().list.find(x=>/Meyer/.test(x.name));return P&&P.gid});
    await p.evaluate(g=>__ev('bdiGuestOpen')(g),gid);await p.waitForTimeout(1500);
    const C=await p.evaluate(()=>{const d=[...document.querySelectorAll('.bd-gdetail')].find(x=>x.style.display!=='none'&&x.textContent.trim());if(!d)return null;const c=d.querySelector('.bd-stay.cur');return {cur:c?c.textContent:'',txt:d.textContent.slice(0,200)}});
    ok(C&&/\(Oda [^)]*\)/.test(C.cur)&&C.cur.includes(m.room),T+' Misafir kartı: şimdiki konaklama = "'+(C?sp(C.cur):'kart açılmadı')+'" ('+m.room+' içermeli)');
  });

  // 8) Takip
  await run('Takip',async()=>{await H.tab(p,'fu');
    const F=await p.evaluate(()=>[...document.querySelectorAll('#bdiFuPanel .bd-fu-row')].map(r=>({g:(r.querySelector('.bd-fu-g')||{}).textContent||'',rm:(r.querySelector('.bd-fu-room')||{}).textContent,own:(r.querySelector('.bd-fu-own')||{}).getAttribute?r.querySelector('.bd-fu-own').getAttribute('title'):''})));
    const f=F.find(x=>/Meyer/.test(x.g));
    ok(f&&f.rm===m.room,T+' Takip: Meyer takibinin odası = '+(f?f.rm:'satır yok')+' (beklenen '+m.room+')');
    ok(f&&f.own===m.owner,T+' Takip: Meyer takibi kimde = '+(f?f.own:'satır yok')+' (beklenen yeni katın sorumlusu '+m.owner+')');
  });

  // 9) Issues
  await run('Issues',async()=>{await H.tab(p,'issues');try{await p.evaluate(()=>__ev('bdiIssueSetFilter("all")'))}catch(e){}await p.waitForTimeout(300);
    const I=await p.evaluate(()=>{const sp=s=>String(s||'').replace(/\s+/g,' ').trim();return [...document.querySelectorAll('article.bd-issue')].map(a=>({g:(a.querySelector('.bd-issue-guest')||{}).textContent||'',rm:sp((a.querySelector('.bd-issue-room')||{}).textContent),txt:sp(a.textContent)}))});
    for(const x of [m,h].filter(Boolean)){const i=I.find(y=>y.g.includes(x.last));
      ok(i&&i.rm.startsWith(x.room)&&i.rm.includes('Kat '+x.room.slice(0,2)),T+' Issues: '+x.last+' kartında oda = "'+(i?i.rm:'kart yok')+'" (beklenen '+x.room+' · Kat '+x.room.slice(0,2)+')');
      if(x===m)ok(i&&i.txt.includes('Kat sorumlusu: '+x.owner),T+' Issues: Meyer kartında kat sorumlusu = '+(i?((/Kat sorumlusu: (\S+ \S+)/.exec(i.txt)||[])[1]||'yok'):'kart yok')+' (beklenen '+x.owner+')');
    }
    const rf=await p.evaluate(()=>__ev('bdiIssueRoomFor')('Anna Meyer'));
    ok(rf===m.room,T+' Issues › yeni issue için oda önerisi (bdiIssueRoomFor): Meyer = '+rf+' (beklenen '+m.room+')');
  });

  // 10) Butler Alert
  if(h)await run('Butler Alert',async()=>{await H.tab(p,'alert');await p.waitForTimeout(200);
    const A=await p.evaluate(()=>[...document.querySelectorAll('#bdiTab_alert tbody tr')].map(tr=>({rm:(tr.children[0]||{}).textContent||'',g:(tr.children[1]||{}).textContent||''})).filter(x=>x.g));
    const a=A.filter(x=>/Halvorsen/.test(x.g)),rooms=a.map(x=>(/^\s*(\d+)/.exec(x.rm)||[])[1]);
    const dbg=a.length?'':' '+JSON.stringify(await p.evaluate(()=>({n:(__ev('alertList')||[]).length,d:__ev('getAlertDate()'),w:((document.getElementById('alertTableWrap')||{}).textContent||'').slice(0,160)})));
    ok(a.length===1&&+rooms[0]===+h.room,T+' Butler Alert: Halvorsen satırı oda = '+(rooms.join(', ')||'satır yok')+' (beklenen '+h.room+')'+dbg);
  });

  // 11) Uyarilar (penceresi)
  await run('Uyarılar',async()=>{const W=await p.evaluate(()=>{__ev('swWarnOpen()');const m=document.getElementById('swWarnModal'),t=m?m.textContent:'';if(m)m.style.display='none';return t});
    const rooms=[...new Set([...W.matchAll(/Oda (\S+) Anna Meyer/g)].map(x=>x[1]))];
    ok(rooms.length&&rooms.join()===m.room,T+' Uyarılar: "Oda … Anna Meyer" maddelerinde oda = '+(rooms.join(', ')||'madde yok')+' (beklenen '+m.room+')');
  });

  // 12) Butler Did It raporu (gun): Guest Issues bolumu, alert ozeti
  if(h)await run('Butler Did It raporu',async()=>{const html=await p.evaluate(d=>{document.getElementById('bdiDate').value=d;__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()');return window.__t.capture(function(){return __ev('downloadDidIt()')})},D);
    const RP=await p.evaluate(x=>{const d=new DOMParser().parseFromString(x,'text/html');const i=[...d.querySelectorAll('.iss')].map(s=>({rm:(s.querySelector('.iss-room')||{}).textContent,who:(s.querySelector('.iss-who b')||{}).textContent||''}));
      const al=[...d.querySelectorAll('.summary .item')].find(e=>/Butler Alerts/.test(e.textContent));return {i,al:al?al.textContent:''}},html);
    const i=RP.i.find(x=>/Halvorsen/.test(x.who));
    ok(i&&i.rm===h.room,T+' Butler Did It raporu › Guest Issues: Halvorsen oda = '+(i?i.rm:'bölüm yok')+' (beklenen '+h.room+')');
    ok(!h.old.some(o=>RP.al.includes(o)),T+' Butler Did It raporu › Butler Alerts özeti eski oda içermiyor: "'+sp(RP.al)+'"');
  });
}

(async()=>{
 // ===== A) Yeni VAC: 14:00 Meyer 2104'te, Halvorsen 2106'da =====
 let S=await start();
 try{
  await at(S.p,'11:00');console.log('  VAC 11:00: '+await H.ingest(S.p,await R.vac({day:D,time:'11:00',rows:vacRows(occ({'1403':['halv','Checked In']}))},S.br),'HSK01124.pdf'));
  const B=await S.p.evaluate(()=>({vr:__ev('vacRooms'),fu:__ev('bdiFuList')().map(f=>f.room+' '+f.guest+' '+f.owner),al:(__ev('alertList')||[]).map(a=>a.roomNo+' '+a.guest)}));
  ok(B.vr['1406']&&/Meyer/.test(B.vr['1406'])&&/Halvorsen/.test(B.vr['1403']||''),'A ön koşul: 11:00 Meyer 1406, Halvorsen 1403 ('+J(B.vr)+')');
  ok(B.fu.some(x=>/^1406 Anna Meyer Can Demir/.test(x))&&B.al.some(x=>/^1403 Halvorsen/.test(x)),'A ön koşul: takip 1406 (Can), alert 1403 ('+J(B)+')');
  await at(S.p,'14:00');
  const msg=await H.ingest(S.p,await R.vac({day:D,time:'14:00',rows:vacRows(occ({'1403':null,'1406':null,'2104':['meyer','Checked In'],'2106':['halv','Checked In']}))},S.br),'HSK01124.pdf');
  ok(/^6 dolu/.test(msg),'A: 14:00 VAC yüklendi ('+msg+')');await S.p.waitForTimeout(1500);
  const E={m:{name:'Anna Meyer',last:'Meyer',room:'2104',old:['1406'],owner:'Nazlı Erten'},h:{name:'Ingrid Halvorsen',last:'Halvorsen',room:'2106',old:['1403'],owner:'Nazlı Erten'},moves:['1406→2104']};
  await checkAll(S,Object.assign({tag:'[A VAC]'},E));
  // ayni veri, sayfa yenilenince (ertesi acilis / ikinci bilgisayar gibi): oda listesi kayitli VAC'tan yeniden kurulur
  await S.p.reload();await S.p.waitForTimeout(1500);await S.p.evaluate(async()=>{await __ev('BdiKV').ready();try{__ev('closeSetupModal()')}catch(e){}});await S.p.waitForTimeout(1500);
  await checkAll(S,Object.assign({tag:'[A VAC, sayfa yenilendi]'},E));
 }catch(e){ok(false,'A senaryosu çöktü: '+String(e.message||e).split('\n')[0])}
 errsAll.push(...S.errs);await S.br.close();

 // ===== B) Aksam yeni in-house (GIH 06.11, 20:00): Meyer 2104'te, Halvorsen 2106'da; yeni VAC yok =====
 S=await start();
 try{
  await at(S.p,'11:00');await H.ingest(S.p,await R.vac({day:D,time:'11:00',rows:vacRows(occ({'1403':['halv','Checked In']}))},S.br),'HSK01124.pdf');
  await at(S.p,'20:00');
  const msg=await H.ingest(S.p,await R.gih({day:D,time:'20:00',rows:gihRows(occ({'1403':null,'1406':null,'2104':['meyer','Checked In'],'2106':['halv','Checked In']}))},S.br),'GIH01102.pdf');
  ok(/^6 oda/.test(msg),'B: 20:00 in-house yüklendi ('+msg+')');await S.p.waitForTimeout(1500);
  await checkAll(S,{tag:'[B GIH]',m:{name:'Anna Meyer',last:'Meyer',room:'2104',old:['1406'],owner:'Nazlı Erten'},h:{name:'Ingrid Halvorsen',last:'Halvorsen',room:'2106',old:['1403'],owner:'Nazlı Erten'}});
 }catch(e){ok(false,'B senaryosu çöktü: '+String(e.message||e).split('\n')[0])}
 errsAll.push(...S.errs);await S.br.close();

 // ===== C) Bir gunde iki oda degisikligi: 12:00 1406 -> 1402 (ayni kat), 16:00 1402 -> 2104 =====
 S=await start();
 try{
  await at(S.p,'12:00');console.log('  VAC 12:00: '+await H.ingest(S.p,await R.vac({day:D,time:'12:00',rows:vacRows(occ({'1403':['halv','Checked In'],'1406':null,'1402':['meyer','Checked In']}))},S.br),'HSK01124.pdf'));
  const M1=await S.p.evaluate(()=>({fu:__ev('bdiFuList')().filter(f=>/Meyer/.test(f.guest)).map(f=>f.room).join(),is:(__ev('bdiGetIssues()').find(x=>x.id==='iM')||{}).room}));
  ok(M1.fu==='1402'&&M1.is==='1402','C ara durum: 12:00 sonrası takip ve issue 1402 ('+J(M1)+')');
  await at(S.p,'16:00');console.log('  VAC 16:00: '+await H.ingest(S.p,await R.vac({day:D,time:'16:00',rows:vacRows(occ({'1403':['halv','Checked In'],'1406':null,'2104':['meyer','Checked In']}))},S.br),'HSK01124.pdf'));
  await S.p.waitForTimeout(1500);
  const ev=await S.p.evaluate(()=>((__ev('bdiGetIssues()').find(x=>x.id==='iM')||{}).events||[]).filter(e=>e.type==='move').map(e=>e.text));
  ok(ev.join(' | ')==='Oda 1406 → 1402 | Oda 1402 → 2104','C Issues: Meyer issue geçmişinde iki oda değişikliği = '+(ev.join(' | ')||'yok'));
  await checkAll(S,{tag:'[C iki taşınma]',m:{name:'Anna Meyer',last:'Meyer',room:'2104',old:['1406','1402'],owner:'Nazlı Erten'},h:{name:'Ingrid Halvorsen',last:'Halvorsen',room:'1403',old:[],owner:'Can Demir'},moves:['1406→1402','1402→2104']});
 }catch(e){ok(false,'C senaryosu çöktü: '+String(e.message||e).split('\n')[0])}
 errsAll.push(...S.errs);await S.br.close();

 ok(errsAll.length===0,'JS hatası yok '+J(errsAll));
 console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0);
})();
