// Tutarlilik (bayat veri) testi: TOUCH KAYDI eklendi, silindi, duzeltildi. Kaynak degisince bu touch'i gosteren HER yer yeni durumu gostermeli.
// Kaynak degisiklikleri gercek yoldan: Kayit formu (alanlari doldur + Enter), Log sekmesindeki x dugmesi, Log'daki Tepki dugmeleri,
// Issues kartindaki "Yanlis butler" secimi. Opera raporlari sahte PDF (tests/data/opera/reports.js), Rapor Merkezi'ne birakilir.
// Isimler kurgu (KVKK). Saat sabit: 2026-11-06 18:00-19:00 (Uyarilar'da Didn't Do It / Alert satirlari 17:00 ve 18:00 sonrasi cikar).
// Otel: 14. kat (Can Demir) ve 21. kat (Nazli Erten). Misafirler:
//   Anna Meyer 1406 (dun geldi, hic dokunulmadi: Didn't Do It, Didn't Do It plani -> Takip, Plan'da "Ilk sabah")
//   Ingrid Halvorsen 1403 (bugun geldi, ARR, 5 gece -> Butler Alert; Welcome = alert gidildi + In-room Check-in Chart)
//   Kenji Sato 1408 (yarin cikiyor; Room Inspection = kat turu inspection isareti)
//   Leonie Brandt 1401 (bugun 09:00 Special Request; tepki duzeltmesi)   Claire Morel 2101 (issue + Can'in issue temasi; butler duzeltmesi)
//   Iris Fenwick 2105 (hic dokunulmadi, hep Didn't Do It: kontrol)
// Asamalar: [0 önce] baslangic, [1 Kayıt] uc touch Kayit formundan, [2 Log sil] uc touch Log'dan silindi (her yer [0]'a donmeli),
//           [3 düzelt] Log'da Brandt'in touch'ina soguk tepki + cumle, Issues'ta Morel temasinin butleri Can -> Nazli.
// Her yer icin tek ok(): ok(yeni durumu gosteriyor, '<yer>: <ne> = <deger>'). Uygulama bugun yanlissa FAIL bulgudur, duzeltmeden sonra regresyon testi olur.
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05';
let fails=0;
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const at=(p,hm)=>p.clock.setSystemTime(new Date(D+'T'+hm+':00+03:00'));
const J=JSON.stringify,sp=s=>String(s==null?'':s).replace(/\s+/g,' ').trim();
// H.ingest ile ayni yol (swRepIngest, 'elle'); dosyanin saati sayfanin sabit saati olsun diye lastModified verilir
const ingest=(p,buf,name)=>p.evaluate(async([b64,n])=>{const f=new File([Uint8Array.from(atob(b64),c=>c.charCodeAt(0))],n,{lastModified:Date.now()});const r=await __ev('swRepIngest')([f],'elle');return r.map(x=>x.msg).join(' | ')},[Buffer.from(buf).toString('base64'),name]);

// ---- uydurma misafirler ----
const G={
  brandt:{name:'Brandt,Leonie,Ms.',arr:'2026-11-04',dep:'2026-11-09'},
  meyer:{name:'Meyer,Anna,Mrs.',arr:Y,dep:'2026-11-09'},
  sato:{name:'Sato,Kenji,Mr.',arr:'2026-11-03',dep:'2026-11-07'},
  morel:{name:'Morel,Claire,Ms.',arr:'2026-11-02',dep:'2026-11-10'},
  fenwick:{name:'Fenwick,Iris,Mx.',arr:'2026-11-04',dep:'2026-11-08'},
  halv:{name:'Halvorsen,Ingrid,Mrs.',arr:D,dep:'2026-11-11'}
};
const ROOMS=['1401','1402','1403','1404','1405','1406','1407','1408','2101','2102','2103','2104','2105','2106','2107','2108'];
const OCC={'1401':'brandt','1403':'halv','1406':'meyer','1408':'sato','2101':'morel','2105':'fenwick'};
const vacRows=()=>ROOMS.map(r=>{const k=OCC[r];if(!k)return {room:r,fo:'VAC',hk:'CL',nv:'1'};const g=G[k];return {room:r,name:g.name,fo:'OCC',hk:'PU',res:'Checked In',arr:g.arr,dep:g.dep}});

async function start(){
  const S=await H.open({today:D,time:'18:00',butlers:['Can Demir','Nazlı Erten'],me:'Can Demir'});
  const {br,p}=S;
  // prompt'a (tepki cumlesi) yazi verebilmek icin dialog dinleyicisi yeniden kurulur; digerleri yine kabul edilir
  S.prompt='';p.removeAllListeners('dialog');p.on('dialog',d=>{S.dlg.push(d.message());if(d.type()==='prompt')d.accept(S.prompt);else d.accept()});
  // Dunun kayitlari (Meyer ve Fenwick'e hic dokunulmadi), bugun 09:00 Brandt'a Special Request, kat dagilimi
  await H.seed(p,{logs:{[Y]:[H.log('y1',Y,'10:00','1401','Leonie Brandt','Touch Call'),H.log('y2',Y,'11:00','1408','Kenji Sato','Touch Call'),
      H.log('y3',Y,'12:00','2101','Claire Morel','Touch Call',{butler:'Nazlı Erten'})],
    [D]:[H.log('d1',D,'09:00','1401','Leonie Brandt','Special Request',{note:'extra hangers',sentence:'Butler Can Demir fulfilled a special request for our guest Leonie Brandt staying at Room 1401 (extra hangers).'})]},
    kv:{bdi_floors_v1:{[D]:{blocks:[{from:14,to:14,butler:'Can Demir'},{from:21,to:21,butler:'Nazlı Erten'}],u:Date.now()}}}});
  // Raporlar: dun aksamin in-house'u, bugunun varisi (Halvorsen 5 gece -> Butler Alert), 17:00 VAC (Halvorsen geldi)
  let m=await ingest(p,await R.gih({day:Y,time:'22:00',rows:Object.keys(OCC).filter(r=>OCC[r]!=='halv').map(r=>{const g=G[OCC[r]];return {room:r,name:g.name,arr:g.arr,dep:g.dep}})},br),'GIH01102.pdf');console.log('  GIH 05.11: '+m);
  m=await ingest(p,await R.arr({day:D,time:'07:50',rows:[{room:'1403',name:G.halv.name,arr:D,dep:G.halv.dep,adl:2}]},br),'ARR01102.pdf');console.log('  ARR 06.11: '+m);
  await at(p,'17:00');m=await ingest(p,await R.vac({day:D,time:'17:00',rows:vacRows()},br),'HSK01124.pdf');console.log('  VAC 17:00: '+m);
  // Morel issue'su ve Can'in 17:00 temasi (issue kartindaki temas = Butler Did It'te "Issue Follow-up" kaydi)
  await p.evaluate(()=>{const now=Date.now(),is={id:'iMo',room:'2101',guest:'Claire Morel',concern:'Shower drain is slow',createdAt:now-1800e3,u:now,events:[{id:'iMoe0',ts:now-1800e3,type:'import'}]};
    const L=__ev('bdiGetIssues()').concat([is]),ev={id:'iMoe1',ts:now,type:'touch',butler:'Can Demir',text:'Called engineering, drain cleared'};is.events.push(ev);
    ev.touchId=__ev('bdiIssueTouch')(is,ev,new Date(now)).id;__ev('bdiSaveIssues')(L)});
  // 18:10 Didn't Do It: Meyer satirinda Plan = Courtesy call (sekmeden, butlerin yaptigi gibi) -> Takip'e madde
  await at(p,'18:10');await H.tab(p,'nt');
  const gk=await p.evaluate(()=>__ev('bdiGuestKey')('Anna Meyer'));
  await p.selectOption(`#bdiNtPanel tr:has(input.bd-nt-chk[data-g="${gk}"]) select[data-f="f:plan"]`,'Courtesy call');await p.waitForTimeout(300);
  // Kapsam: dolu oda sayisi (elle girilen alan)
  await H.tab(p,'coverage');await p.fill('#bdiOccupied','6');await p.waitForTimeout(300);
  await H.tab(p,'fu');await at(p,'18:20');await H.tab(p,'entry');await p.waitForTimeout(600);
  return S;
}

// ---- kaynak degisiklikleri (gercek kullanici yolu) ----
async function kayit(S,act,room,note){
  const p=S.p,i=await p.evaluate(a=>String(__ev('getBdiActions()').findIndex(x=>x.label===a)),act);
  await p.selectOption('#bdiAction',i);await p.selectOption('#bdiButler','Can Demir');await p.fill('#bdiRoom',room);await p.waitForTimeout(200);
  if(note!=null)await p.fill('#bdiNote',note);
  await p.press('#bdiRoom','Enter');await p.waitForTimeout(500);await p.evaluate(()=>{try{__ev('bdiReactClose()')}catch(e){}});
}
async function logRowBtn(S,room,sel){ // Log sekmesinde o odanin satirindaki dugme
  const p=S.p,rows=p.locator('#bdi-log-wrap tbody tr').filter({has:p.locator('td:nth-child(3)',{hasText:room})});
  await rows.first().locator(sel).click();await p.waitForTimeout(400);
}

// ---- aninda gorunenler (gezinmeden: sekme sayilari, Bugun karti, Uyarilar sayisi) ----
async function instant(p){
  return p.evaluate(()=>{const t=i=>((document.getElementById(i)||{}).textContent||'').trim();
    const w=document.getElementById('swWarnBtn')||{},wn=(/(\d+)\s*$/.exec(String(w.textContent||'').trim())||[])[1]||'0';
    return {nt:t('bdiNtTabCount'),fu:t('bdiFuTabCount'),al:t('bdiAlertTabCount'),irci:t('bdiIrciTabCount'),at:t('bdiProtelCnt'),is:t('bdiIssueTabCount'),warn:+wn,warnT:w.title||''}});
}

// ---- her yerin okunmasi (DOM / rapor HTML'i) ----
// E={tag, meyer:bool (Amenity Delivery var mi), halv:bool (Welcome), sato:bool (Room Inspection), n: bugunun touch sayisi}
async function checkAll(S,E,I){
  const p=S.p,T=E.tag;
  const run=async(name,fn)=>{try{await fn()}catch(e){ok(false,T+' '+name+': test okuyamadı ('+String(e.message||e).split('\n')[0]+')')}};
  const yn=b=>b?'var':'yok';

  // 0) Aninda: sekme sayilari, Kayit > Bugun karti, Uyarilar sayisi (kaynak degisikliginden hemen sonra, baska sekmeye gecmeden)
  await run('sekme sayıları',async()=>{
    ok(I.nt===(E.meyer?'1':'2'),T+" Sekme sayısı › Didn't Do It = \""+I.nt+'" (beklenen '+(E.meyer?'1: yalnız Fenwick':'2: Fenwick + Meyer')+')');
    ok(I.fu===(E.meyer?'':'1'),T+' Sekme sayısı › Takip = "'+I.fu+'" (beklenen '+(E.meyer?'boş: Meyer\'in Didn\'t Do It takibi touch\'la kapandı':'1: Meyer\'in Didn\'t Do It takibi açık')+')');
    ok(I.al===(E.halv?'':'1'),T+' Sekme sayısı › Butler Alert = "'+I.al+'" (beklenen '+(E.halv?'boş':'1')+')');
    ok(I.irci===(E.halv?'1':''),T+' Sekme sayısı › In-room Check-in = "'+I.irci+'" (beklenen '+(E.halv?'1':'boş')+')');
    const fr=await p.evaluate(()=>{const it=__ev('swWarnCollect()');return {n:it.length,t:it.length?it.slice(0,6).map(x=>'• '+x.t).join('\n'):'Atlanan bir şey yok'}});
    ok(I.warn===fr.n&&I.warnT===fr.t,T+' Üst çubuk › Uyarılar = '+I.warn+' ['+sp(I.warnT).slice(0,140)+'] (o anki doğru: '+fr.n+' ['+sp(fr.t).slice(0,140)+'])');
  });
  await p.evaluate(()=>{__ev('showPage("didit")');try{document.getElementById('bdiDate').value=__ev('getToday()')}catch(e){}});

  // 1) Log ve rapor: sayi + satirlar, oda gorunumu
  await run('Log',async()=>{await H.tab(p,'log');await p.evaluate(()=>{__ev('setBdiView("day")')});await p.waitForTimeout(300);
    const L=await p.evaluate(()=>({n:(document.getElementById('bdiLogCount')||{}).textContent,rows:[...document.querySelectorAll('#bdi-log-wrap tbody tr')].map(tr=>({b:tr.children[1].textContent,room:tr.children[2].textContent.replace(/\D.*$/,''),act:tr.children[4].textContent}))}));
    const has=(r,a)=>L.rows.some(x=>x.room===r&&x.act.includes(a));
    ok(L.n===E.n+' kayıt'&&has('1406','Amenity')===E.meyer&&has('1403','Welcome')===E.halv&&has('1408','Inspection')===E.sato,T+' Log: '+L.n+' · 1406 Amenity '+yn(has('1406','Amenity'))+' · 1403 Welcome '+yn(has('1403','Welcome'))+' · 1408 Inspection '+yn(has('1408','Inspection'))+' (beklenen '+E.n+' kayıt, '+yn(E.meyer)+'/'+yn(E.halv)+'/'+yn(E.sato)+')');
    const t=await p.evaluate(d=>{const x=new DOMParser().parseFromString(__ev('bdiRoomGridHtml')(d,'log'),'text/html'),o={};x.querySelectorAll('.bd-rg-t').forEach(t=>{o[t.querySelector('b').textContent]=(t.querySelector('i')||{}).textContent||''});return o},D);
    ok((t['1406']==='1 touch')===E.meyer&&(t['1406']==='—')===!E.meyer,T+' Log › oda görünümü: 1406 kutusu = "'+t['1406']+'" (beklenen '+(E.meyer?'1 touch':'—')+')');
  });

  // 2) Kayit > oda listesi: islem Amenity Delivery secili iken 1406 kutusu "bugun girildi" (soluk, tik)
  await run('Kayıt oda listesi',async()=>{await H.tab(p,'entry');
    const today=await p.evaluate(()=>((document.getElementById('bdiTodayCard')||{}).textContent||'').replace(/\s+/g,' ').trim());
    ok(today.replace(/\s/g,'').includes(E.n+'touch'+E.n+'misafir'),T+' Kayıt › Bugün kartı = "'+today+'" (beklenen '+E.n+' touch, '+E.n+' misafir)');
    const i=await p.evaluate(()=>String(__ev('getBdiActions()').findIndex(x=>x.label==='Amenity Delivery')));
    await p.selectOption('#bdiAction',i);await p.selectOption('#bdiButler','Can Demir');await p.waitForTimeout(250);
    await p.evaluate(()=>{const P=document.getElementById('bdiBulkPanel');if(!P||P.style.display!=='block')__ev('bdiBulkToggle()');__ev('bdiBulkFloor("")')});await p.waitForTimeout(200);
    const tl=await p.evaluate(()=>{const b=[...document.querySelectorAll('#bdiBulkPanel .bd-bulk-r')].find(x=>x.querySelector('b').textContent==='1406');return b?{dn:b.classList.contains('dn'),t:b.textContent}:null});
    ok(tl&&tl.dn===E.meyer,T+' Kayıt › oda listesi (işlem Amenity Delivery): 1406 kutusu "bugün girildi" = '+(tl?yn(tl.dn)+' ("'+tl.t+'")':'kutu yok')+' (beklenen '+yn(E.meyer)+')');
    await p.evaluate(()=>{try{__ev('bdiBulkToggle()')}catch(e){}});
  });

  // 3) Butler Didn't Do It: sekme, oda gorunumu, rapor; Kapsam ozeti
  await run("Didn't Do It",async()=>{await p.evaluate(d=>{__ev('switchBdiTab("nt")');__ev('bdiNtDateSet')(d)},D);await p.waitForTimeout(300);
    const rows=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel table.bd-nt-tab tbody tr')].map(tr=>(tr.querySelector('td.r')||{}).textContent).filter(Boolean));
    ok(rows.includes('1406')===!E.meyer&&rows.includes('2105'),T+" Didn't Do It sekmesi: satırlar = "+(rows.join(', ')||'yok')+' (beklenen '+(E.meyer?'yalnız 2105':'2105 ve 1406')+')');
    const tiles=await p.evaluate(()=>{const o={};document.querySelectorAll('#bdiNtPanel .bd-rg-t').forEach(t=>{o[t.querySelector('b').textContent]=(t.querySelector('i')||{}).textContent||''});return o});
    ok((tiles['1406']==='dokunuldu')===E.meyer,T+" Didn't Do It › oda görünümü: 1406 kutusu = \""+tiles['1406']+'" (beklenen '+(E.meyer?'dokunuldu':'dokunulmamış')+')');
    const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')}));
    const RP=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return {sum:((d.querySelector('.summary .item')||{}).textContent||'').replace(/\s+/g,' '),bands:[...d.querySelectorAll('tr.gh')].map(x=>x.textContent.replace(/\s+/g,' '))}},html);
    const want=(E.meyer?'1':'2')+'/5'; // toplam = dunku in-house (5 misafir; Halvorsen bugun geldi)
    ok(RP.sum.startsWith(want)&&RP.bands.some(b=>/Anna Meyer/.test(b))===!E.meyer,T+" Didn't Do It raporu: özet \""+RP.sum+'", Meyer bandı '+yn(RP.bands.some(b=>/Anna Meyer/.test(b)))+' (beklenen '+want+', Meyer '+yn(!E.meyer)+')');
    await H.tab(p,'coverage');await p.waitForTimeout(200);
    const C=await p.evaluate(()=>({nt:(document.getElementById('bdiNtCov')||{}).textContent||'',cov:(document.getElementById('bdiCoverageDetail')||{}).textContent||'',
      un:(()=>{const b=[...document.querySelectorAll('#bdiAttentionBoard b')].find(x=>/Untouched rooms/.test(x.textContent));return b?b.nextElementSibling.textContent:'yok'})()}));
    ok(new RegExp("Butler Didn't Do It: "+(E.meyer?1:2)+' / 5').test(C.nt),T+' Kapsam › Didn\'t Do It özeti = "'+sp(C.nt).replace(/ aç$/,'')+'" (beklenen '+(E.meyer?1:2)+' / 5)');
    const served=2+(E.meyer?1:0)+(E.halv?1:0)+(E.sato?1:0);
    ok(C.cov===served+'/6 oda hizmet aldı',T+' Kapsam › hizmet oranı = "'+C.cov+'" (beklenen '+served+'/6)');
    ok(C.un===String(6-served),T+' Kapsam › Attention Board "Untouched rooms" = '+C.un+' (beklenen '+(6-served)+')');
  });

  // 4) Brifing > Gunun akisi: Dikkat "hic dokunulmadi", Konaklama anlari (ilk sabah), Gelenler (karsilandi), Oteldekiler (kat turu inspection)
  await run('Brifing akış',async()=>{await H.tab(p,'brief');await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(500);
    await p.evaluate(()=>{const g=__ev('_bdiFeedGrp');['inh','aplain','alate','nt','mo-f','mo-l'].forEach(k=>g[k]=1);__ev('bdiFeedRefresh()')});await p.waitForTimeout(400);
    const F=await p.evaluate(()=>{const sp=s=>String(s||'').replace(/\s+/g,' ').trim();
      const rows=[...document.querySelectorAll('#bdiBriefBody .bd-fd-row')].map(b=>({tag:sp((b.querySelector('.bd-fd-tag')||{}).textContent),main:sp((b.querySelector('.bd-fd-main')||{}).textContent),sub:sp((b.querySelector('.bd-fd-sub')||{}).textContent),r:sp((b.querySelector('.bd-fd-r')||{}).textContent)}));
      const inh=[...document.querySelectorAll('#bdiBriefBody .bd-fd-g')].find(s=>/Oteldekiler/.test((s.querySelector('h3')||{}).textContent||'')),pp=inh&&inh.querySelector('p.bd-sub');
      return rows.concat([{tag:'P',main:sp(pp?pp.textContent:''),sub:'',r:''}])});
    const nt=F.find(f=>/hiç dokunulmadı/.test(f.main));
    ok(nt&&nt.tag===(E.meyer?'1':'2')&&/1406/.test(nt.sub)===!E.meyer,T+' Brifing › Dikkat › "hiç dokunulmadı" = '+(nt?nt.tag+' ('+nt.sub.split(' · ')[0]+')':'satır yok')+' (beklenen '+(E.meyer?'1 (2105)':'2 (2105, 1406)')+')');
    const fm=F.find(f=>f.tag==='İlk sabah'&&/Meyer/.test(f.main));
    ok(fm&&/bugün temas/.test(fm.r)===E.meyer,T+' Brifing › Konaklama anları › İlk sabah Meyer: "'+(fm?fm.r||'işaret yok':'satır yok')+'" (beklenen '+(E.meyer?'✓ bugün temas':'işaret yok')+')');
    const hv=F.find(f=>/Halvorsen/.test(f.main)&&/karşıla/.test(f.r));
    ok(hv&&/✓ karşılandı/.test(hv.r)===E.halv,T+' Brifing › Gelenler › Halvorsen: "'+(hv?hv.r:'satır yok')+'" (beklenen '+(E.halv?'✓ karşılandı':'karşılanmadı')+')');
    const sa=F.find(f=>/^Kat /.test(f.tag)&&/Sato/.test(f.main)),P=F[F.length-1].main,ins=(/inspection (\d+\/\d+)/.exec(P)||[])[1];
    ok(sa&&/✓ inspection/.test(sa.r)===E.sato&&ins===(E.sato?'1':'0')+'/5',T+' Kat turu (Oteldekiler): Sato '+(sa?'"'+(sa.r||'işaret yok')+'"':'satır yok')+', inspection '+ins+' (beklenen '+(E.sato?'✓ inspection, 1/5':'işaret yok, 0/5')+')');
  });

  // 5) Brifing > Plan: kayittan kendiliginden biten isler
  await run('Plan',async()=>{await p.evaluate(()=>{__ev('bdiBriefSetMode("plan")')});await p.waitForTimeout(400);
    const P=await p.evaluate(()=>{const o=[];document.querySelectorAll('#bdiBriefBody .bd-pl2-g').forEach(g=>{const rm=(g.querySelector('.bd-pl2-rm')||{}).textContent;g.querySelectorAll('.bd-pl2-it').forEach(it=>o.push({rm,t:(it.querySelector('.bd-pl2-t')||{}).textContent||'',dn:it.classList.contains('dn'),own:(it.querySelector('.bd-pl2-own')||{}).textContent||''}))});
      const k=[...document.querySelectorAll('#bdiBriefBody .bd-pl2-kpi div')].find(d=>/zorunlu iş bitti/.test(d.textContent));return {its:o,kpi:k?k.querySelector('b').textContent:''}});
    const it=(rm,re)=>P.its.find(x=>x.rm===rm&&re.test(x.t));
    const a=it('1406',/İlk sabah/),b=it('1403',/Karşıla/),c=it('1403',/Butler Alert/);
    ok(a&&a.dn===E.meyer,T+' Brifing › Plan: 1406 Meyer "İlk sabah" bitti = '+(a?yn(a.dn)+' '+a.own:'iş yok')+' (beklenen '+yn(E.meyer)+')');
    ok(b&&b.dn===E.halv,T+' Brifing › Plan: 1403 Halvorsen "Karşıla" bitti = '+(b?yn(b.dn)+' '+b.own:'iş yok')+' (beklenen '+yn(E.halv)+')');
    ok(c&&c.dn===E.halv,T+' Brifing › Plan: 1403 Halvorsen "Butler Alert: odaya git" bitti = '+(c?yn(c.dn)+' '+c.own:'iş yok')+' (beklenen '+yn(E.halv)+')');
    const must=P.its.filter(x=>/ZORUNLU/.test(x.t)),want=must.filter(x=>x.dn).length+' / '+must.length;
    ok(P.kpi===want&&(E.halv?/^[1-9]/.test(P.kpi):true),T+' Brifing › Plan: "zorunlu iş bitti" = '+P.kpi+' (listede '+want+')');
  });

  // 6) Brifing > Vardiya devri (aksam): Can'in kartinda Meyer'in amenity'si
  await run('Vardiya devri',async()=>{await p.evaluate(()=>{__ev('_bdiShift="aksam"');__ev('bdiBriefSetMode("shift")')});await p.waitForTimeout(400);
    const V=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody .bd-bf-bcard')].map(c=>({b:c.querySelector('.bd-bf-gh b').textContent,h:c.querySelector('.bd-bf-gh .bd-sub').textContent,items:[...c.querySelectorAll('li')].map(l=>l.textContent.replace(/\s+/g,' '))})));
    const can=V.find(x=>x.b==='Can Demir'),n=1+(E.meyer?1:0)+(E.halv?1:0)+(E.sato?1:0),am=!!(can&&can.items.some(t=>/1406.*Amenity/.test(t)));
    ok(can&&can.h.startsWith(n+' touch')&&am===E.meyer,T+' Brifing › Vardiya devri (Akşam): Can Demir = "'+(can?can.h:'kart yok')+'", Meyer amenity satırı '+yn(am)+' (beklenen '+n+' touch, '+yn(E.meyer)+')');
  });

  // 7) Brifing > Guest Relations: Meyer'de "temas yok" sinyali
  await run('GR',async()=>{await p.evaluate(()=>{__ev('bdiBriefSetMode("gr")')});await p.waitForTimeout(400);
    const r=await p.evaluate(()=>{const x=[...document.querySelectorAll('#bdiBriefBody .bd-bf-rrow')].find(r=>/Meyer/.test(r.textContent));return x?(x.querySelector('.bd-bf-why')||{}).textContent:null});
    ok(r!==null&&/temas yok/.test(r)===!E.meyer,T+' Brifing › Guest Relations: Meyer sinyalleri = "'+(r===null?'satır yok':r)+'" (beklenen '+(E.meyer?'"temas yok" yok':'"temas yok" var')+')');
  });

  // 8) Butler Alert sekmesi
  await run('Butler Alert',async()=>{await H.tab(p,'alert');await p.evaluate(()=>__ev('setAlertFilter("all")'));await p.waitForTimeout(200);
    const A=await p.evaluate(()=>[...document.querySelectorAll('#bdiTab_alert tbody tr')].map(tr=>{const c=tr.children[5]||document.createElement('td');return {g:(tr.children[1]||{}).textContent||'',st:(c.textContent||'').replace(/\s+/g,' '),pend:!!c.querySelector('select')}}).filter(x=>/Halvorsen/.test(x.g)));
    const a=A[0],vis=!!(a&&!a.pend&&/✅/.test(a.st)&&/Can Demir/.test(a.st));
    ok(a&&vis===E.halv&&a.pend===!E.halv,T+' Butler Alert: Halvorsen durumu = "'+(a?a.st.slice(0,70):'satır yok')+'" (beklenen '+(E.halv?'✅ Can Demir (Welcome kaydıyla)':'bekliyor')+')');
  });

  // 9) In Room Check In Chart
  await run('In-room',async()=>{await p.evaluate(d=>{__ev('switchBdiTab("irci")');__ev('bdiIrciDateSet')(d)},D);await p.waitForTimeout(200);
    const rows=await p.evaluate(()=>[...document.querySelectorAll('#bdiIrciPanel tbody tr')].map(tr=>tr.children[0].textContent+' '+tr.children[1].textContent));
    ok(rows.some(r=>/Halvorsen 1403/.test(r))===E.halv&&rows.length===(E.halv?1:0),T+' In Room Check In Chart: satırlar = '+(rows.join(', ')||'yok')+' (beklenen '+(E.halv?'Ingrid Halvorsen 1403':'yok')+')');
  });

  // 10) Takip: Meyer'in Didn't Do It takibi
  await run('Takip',async()=>{await H.tab(p,'fu');
    const F=await p.evaluate(()=>({open:[...document.querySelectorAll('#bdiFuPanel .bd-fu-grp .bd-fu-row')].map(r=>r.textContent.replace(/\s+/g,' ')),
      done:[...document.querySelectorAll('#bdiFuPanel details.bd-fu-more')].slice(0,1).flatMap(d=>[...d.querySelectorAll('.bd-fu-row')].map(r=>r.textContent.replace(/\s+/g,' ')))}));
    const o=F.open.some(t=>/Meyer/.test(t)),d=F.done.some(t=>/Meyer/.test(t));
    ok(o===!E.meyer&&d===E.meyer,T+' Takip: Meyer "Didn\'t Do It planı" açık listede '+yn(o)+', "Bugün ilgilenilen"de '+yn(d)+' (beklenen '+(E.meyer?'ilgilenildi':'açık')+')');
  });

  // 11) Misafirler listesi ve misafir karti (+ Protel notlari)
  await run('Misafirler',async()=>{await p.evaluate(()=>{__ev('_bdiGMProf=null')});await H.tab(p,'guests');await p.waitForTimeout(1300);
    const GL=await p.evaluate(()=>{const r=[...document.querySelectorAll('.bd-grow')].find(x=>/Anna Meyer/.test((x.querySelector('.bd-g-name')||{}).textContent||''));return r?{last:r.children[3].textContent,n:(r.querySelector('.bd-num')||{}).textContent,flags:(r.querySelector('.bd-flags')||{}).textContent}:null});
    ok(GL&&GL.n===(E.meyer?'1':'0')&&/18:3\d/.test(GL.last)===E.meyer,T+' Misafirler listesi: Meyer touch = '+(GL?GL.n+', son temas "'+GL.last+'"':'satır yok')+' (beklenen '+(E.meyer?'1, bugün 18:30':'0, bugün temas yok')+')');
    const gid=await p.evaluate(()=>{const P=__ev('bdiGMProfiles')().list.find(y=>/Meyer/.test(y.name));return P&&P.gid});
    await p.evaluate(g=>__ev('bdiGuestOpen')(g),gid);await p.waitForTimeout(1500);
    const C=await p.evaluate(()=>{const d=[...document.querySelectorAll('.bd-gdetail')].find(y=>y.style.display!=='none'&&y.textContent.trim());if(!d)return null;
      return {tl:[...d.querySelectorAll('.bd-tl-guest li:not(.bd-tl-day)')].map(l=>l.textContent.replace(/\s+/g,' ')),cur:((d.querySelector('.bd-stay.cur')||{}).textContent||'').replace(/\s+/g,' ')}});
    const am=!!(C&&C.tl.some(t=>/Amenity Delivery/.test(t)));
    ok(C&&am===E.meyer,T+' Misafir kartı › Zaman çizgisi: Meyer Amenity Delivery '+(C?yn(am):'kart açılmadı')+' (beklenen '+yn(E.meyer)+')');
    ok(C&&/ (\d+)$/.test(C.cur)&&+(/ (\d+)$/.exec(C.cur)[1])===(E.meyer?1:0),T+' Misafir kartı › Konaklamalar: şimdiki konaklama "'+(C?C.cur:'')+'" (beklenen '+(E.meyer?1:0)+' kayıt)');
    // Protel notlari (kartin dugmesi): Butler Did It blogu
    await p.evaluate(()=>{const m=document.getElementById('bdiProtelModal');if(m){m.classList.remove('on');m.innerHTML=''}});
    await p.evaluate(()=>{const d=[...document.querySelectorAll('.bd-gdetail')].find(y=>y.style.display!=='none'&&y.textContent.trim());const b=d&&[...d.querySelectorAll('button')].find(x=>x.textContent==='Protel notları');if(b)b.click()});await p.waitForTimeout(300);
    const PN=await p.evaluate(()=>{const m=document.getElementById('bdiProtelModal');return m&&m.classList.contains('on')?[...m.querySelectorAll('pre')].map(x=>x.textContent).join('\n'):''});
    const did=/\*\*\*Butler Did It\*\*\*[\s\S]*fresh figs/i.test(PN);
    ok(did===E.meyer,T+' Protel notları (Meyer) › Butler Did It bloğu: "fresh figs" satırı '+yn(did)+(PN?' ["'+sp(PN).slice(0,90)+'"]':' [not yok]')+' (beklenen '+yn(E.meyer)+')');
    await p.evaluate(()=>{const m=document.getElementById('bdiProtelModal');if(m)m.classList.remove('on')});
  });

  // 12) Atolye > Protel'e girilecekler + sekme sayisi tutarliligi
  await run('Atölye',async()=>{await H.tab(p,'atelier');await p.evaluate(()=>{__ev('_bdiAtMode="out"');__ev('_bdiPlView="p"');__ev('renderBdiAtelier()')});await p.waitForTimeout(900);
    const A=await p.evaluate(()=>{const g=[...document.querySelectorAll('#bdiProtelBody .bd-pl-g')].find(x=>/Meyer/.test(x.textContent));
      const seg=[...document.querySelectorAll('#bdiProtelBody .bd-seg button')].find(b=>/Atılmadı/.test(b.textContent));
      return {rows:g?[...g.querySelectorAll('.bd-pl-row')].map(r=>r.textContent.replace(/\s+/g,' ')):[],pend:seg?seg.querySelector('b').textContent:'',badge:(document.getElementById('bdiProtelCnt')||{}).textContent}});
    const am=A.rows.some(t=>/fresh figs/i.test(t));
    ok(am===E.meyer,T+" Atölye › Protel'e girilecekler: Meyer \"fresh figs\" satırı "+yn(am)+(A.rows.length?' ['+A.rows.join(' | ').slice(0,100)+']':'')+' (beklenen '+yn(E.meyer)+')');
    ok(I.at===(A.pend==='0'?'':A.pend),T+' Sekme sayısı › Atölye = "'+I.at+'" (Atölye\'de atılmamış '+A.pend+' satır)');
  });

  // 13) Butler Did It raporu (gun)
  await run('Butler Did It raporu',async()=>{const html=await p.evaluate(d=>{document.getElementById('bdiDate').value=d;__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()');return window.__t.capture(function(){return __ev('downloadDidIt()')})},D);
    const RP=await p.evaluate(x=>{const d=new DOMParser().parseFromString(x,'text/html'),it={};[...d.querySelectorAll('.summary .item')].forEach(e=>{it[(e.querySelector('.lbl')||{}).textContent||'']=(e.querySelector('.num')||{}).textContent||''});
      const body=d.body.textContent.replace(/\s+/g,' ');return {it,meyer:/Anna Meyer/.test(body)&&/amenity/i.test(body),sato:/inspected the room/i.test(body)}},html);
    const al=Object.keys(RP.it).find(k=>/Butler Alerts Visited/.test(k));
    ok(RP.it['Total Touches']===String(E.n),T+' Butler Did It raporu › Total Touches = '+RP.it['Total Touches']+' (beklenen '+E.n+')');
    ok(RP.meyer===E.meyer&&RP.sato===E.sato,T+' Butler Did It raporu › satırlar: Meyer amenity '+yn(RP.meyer)+', Sato inspection '+yn(RP.sato)+' (beklenen '+yn(E.meyer)+'/'+yn(E.sato)+')');
    ok(al&&RP.it[al]===(E.halv?'1/1':'0/1'),T+' Butler Did It raporu › Butler Alerts Visited = '+(al?RP.it[al]:'yok')+' (beklenen '+(E.halv?'1/1':'0/1')+')');
  });

  // 14) Uyarilar penceresi (bugun)
  await run('Uyarılar',async()=>{const W=await p.evaluate(()=>{__ev('swWarnOpen()');const m=document.getElementById('swWarnModal'),t=m?m.textContent.replace(/\s+/g,' '):'';if(m)m.style.display='none';return t});
    const nt=(/(\d+) dokunulmamış misafirde sebep seçilmedi/.exec(W)||[])[1]||'0',ir=/in-room check-in'de ETD eksik/.test(W),al=/alert hâlâ işaretlenmedi/.test(W);
    ok(nt===(E.meyer?'1':'2'),T+' Uyarılar › Didn\'t Do It: "'+nt+' dokunulmamış misafirde sebep seçilmedi" (beklenen '+(E.meyer?1:2)+')');
    ok(ir===E.halv&&al===!E.halv,T+' Uyarılar › In-room "ETD eksik" '+yn(ir)+', Butler Alert "hâlâ işaretlenmedi" '+yn(al)+' (beklenen '+yn(E.halv)+'/'+yn(!E.halv)+')');
  });
}

(async()=>{
 const S=await start(),p=S.p;
 try{
  // ===== [0] once: baslangic durumu (onkosul) =====
  await at(p,'18:25');await H.tab(p,'nt');await H.tab(p,'fu');await H.tab(p,'alert');await H.tab(p,'irci');await H.tab(p,'atelier');await H.tab(p,'entry');await p.waitForTimeout(600);
  await checkAll(S,{tag:'[0 önce]',meyer:false,halv:false,sato:false,n:2},await instant(p));

  // ===== [1] Kayit formundan uc touch (Enter ile) =====
  await H.tab(p,'entry');await p.waitForTimeout(600);
  await at(p,'18:30');await kayit(S,'Amenity Delivery','1406','fresh figs and mint tea');
  await at(p,'18:31');await kayit(S,'Welcome / In-room Check-in','1403');
  await at(p,'18:32');await kayit(S,'Room Inspection','1408');
  await p.waitForTimeout(500);
  const L1=await p.evaluate(d=>JSON.parse(__ev('BdiKV').get('bdi_'+d)).map(l=>l.room+' '+l.guest+' '+l.action),D);
  ok(L1.length===5&&L1.some(x=>/^1406 Anna Meyer Amenity/.test(x))&&L1.some(x=>/^1403 Ingrid Halvorsen Welcome/.test(x))&&L1.some(x=>/^1408 Kenji Sato Room Inspection/.test(x)),'[1 Kayıt] ön koşul: Kayıt formundan 3 touch kaydedildi ('+J(L1)+')');
  await checkAll(S,{tag:'[1 Kayıt]',meyer:true,halv:true,sato:true,n:5},await instant(p));

  // ===== [2] Log sekmesinden uc touch silindi (x) =====
  await at(p,'18:40');await H.tab(p,'log');await p.evaluate(()=>__ev('setBdiView("day")'));await p.waitForTimeout(300);
  for(const r of ['1406','1403','1408'])await logRowBtn(S,r,'button.rm-btn');
  await p.waitForTimeout(500);
  const L2=await p.evaluate(d=>JSON.parse(__ev('BdiKV').get('bdi_'+d)).map(l=>l.room+' '+l.action),D);
  ok(L2.length===2,'[2 Log sil] ön koşul: Log\'dan 3 touch silindi, kalan '+J(L2));
  await checkAll(S,{tag:'[2 Log sil]',meyer:false,halv:false,sato:false,n:2},await instant(p));

  // ===== [3] Duzeltme: Log'da tepki (Brandt), Issues'ta temasin butleri (Morel) =====
  await at(p,'18:50');await H.tab(p,'log');await p.evaluate(()=>__ev('setBdiView("day")'));await p.waitForTimeout(300);
  await logRowBtn(S,'1401','button.bd-react-btn[title="Soğuk"]');
  S.prompt='prefers fewer visits';await logRowBtn(S,'1401','button[title="Tepki cümlesi"]');
  const r1=await p.evaluate(d=>JSON.parse(__ev('BdiKV').get('bdi_'+d)).find(l=>l.id==='d1').reaction,D);
  ok(r1&&r1.f==='cold'&&r1.t==='prefers fewer visits','[3 düzelt] ön koşul: Log\'dan Brandt touch\'ına soğuk tepki + cümle ('+J(r1)+')');
  await H.tab(p,'issues');try{await p.evaluate(()=>__ev('bdiIssueSetFilter("all")'))}catch(e){}await p.waitForTimeout(300);
  const card=p.locator('article.bd-issue').filter({hasText:'Claire Morel'}).first();
  if(!(await card.locator('select.bd-tl-sel').count())){await card.locator('.bd-issue-top').first().click();await p.waitForTimeout(400)} // karti ac (Gecmis)
  await card.locator('select.bd-tl-sel').first().selectOption('Nazlı Erten');await p.waitForTimeout(500);
  const l3=await p.evaluate(d=>JSON.parse(__ev('BdiKV').get('bdi_'+d)).filter(l=>l.room==='2101').map(l=>l.butler),D);
  ok(l3.join()==='Nazlı Erten','[3 düzelt] ön koşul: Issues kartından Morel temasının butleri Nazlı Erten oldu (Butler Did It kaydı: '+J(l3)+')');
  await checkEdit(S);
 }catch(e){ok(false,'senaryo çöktü: '+String(e.stack||e).split('\n').slice(0,3).join(' | '))}
 ok(S.errs.length===0,'JS hatası yok '+J(S.errs));await S.br.close();
 console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0);
})();

// ---- [3] duzeltmeden sonra: tepki ve butler degisikligini gosteren yerler ----
async function checkEdit(S){
  const p=S.p,T='[3 düzelt]',yn=b=>b?'var':'yok';
  const run=async(name,fn)=>{try{await fn()}catch(e){ok(false,T+' '+name+': test okuyamadı ('+String(e.message||e).split('\n')[0]+')')}};
  await run('Log',async()=>{await H.tab(p,'log');await p.evaluate(()=>__ev('setBdiView("day")'));await p.waitForTimeout(300);
    const L=await p.evaluate(()=>[...document.querySelectorAll('#bdi-log-wrap tbody tr')].map(tr=>({b:tr.children[1].textContent,room:tr.children[2].textContent.replace(/\D.*$/,''),re:(tr.querySelector('.bd-react-btn.on')||{}).title||'',rt:(tr.querySelector('.bd-react-t')||{}).textContent||''})));
    const b=L.find(x=>x.room==='1401'),m=L.find(x=>x.room==='2101');
    ok(b&&b.re==='Soğuk'&&b.rt==='prefers fewer visits',T+' Log: 1401 tepki = '+(b?b.re+' "'+b.rt+'"':'satır yok')+' (beklenen Soğuk "prefers fewer visits")');
    ok(m&&m.b==='Nazlı Erten',T+' Log: 2101 Morel temasının butleri = '+(m?m.b:'satır yok')+' (beklenen Nazlı Erten)');
    const st=await p.evaluate(()=>(document.getElementById('bdiStats')||{}).textContent.replace(/\s+/g,' '));
    ok(/1 Can Demir/.test(st)&&/1 Nazlı Erten/.test(st),T+' Log › butler sayıları = "'+st+'" (beklenen Can Demir 1, Nazlı Erten 1)');
  });
  await run('Butler Did It raporu',async()=>{const html=await p.evaluate(d=>{document.getElementById('bdiDate').value=d;__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()');return window.__t.capture(function(){return __ev('downloadDidIt()')})},D);
    const RP=await p.evaluate(x=>{const d=new DOMParser().parseFromString(x,'text/html'),th=[...d.querySelectorAll('table.bsum thead th')].map(t=>t.textContent.trim()),o={};
      d.querySelectorAll('table.bsum tbody tr').forEach(r=>{const c=[...r.children].map(t=>t.textContent.trim());o[c[0]]={t:c[th.indexOf('Touches')],f:c[th.indexOf('Issue follow-ups')]}});
      const is=[...d.querySelectorAll('.iss')].find(s=>/Morel/.test(s.textContent));return {o,iss:is?is.textContent.replace(/\s+/g,' '):''}},html);
    const nz=RP.o['Nazlı Erten']||{},cd=RP.o['Can Demir']||{};
    ok(nz.f==='1'&&cd.f==='0'&&nz.t==='1'&&cd.t==='1',T+' Butler Did It raporu › butler tablosu: Nazlı touch '+nz.t+' / issue follow-up '+nz.f+', Can touch '+cd.t+' / issue follow-up '+cd.f+' (beklenen Nazlı 1/1, Can 1/0)');
    ok(/Nazlı Erten/.test(RP.iss)&&!/Can Demir/.test(RP.iss),T+' Butler Did It raporu › Guest Issues: Morel bölümü = "'+RP.iss.slice(0,140)+'" (Nazlı Erten olmalı, Can Demir olmamalı)');
  });
  await run('Brifing',async()=>{await H.tab(p,'brief');
    await p.evaluate(()=>{__ev('_bdiShift="sabah"');__ev('bdiBriefSetMode("shift")')});await p.waitForTimeout(400);
    const V=await p.evaluate(()=>({cards:[...document.querySelectorAll('#bdiBriefBody .bd-bf-bcard')].map(c=>c.textContent.replace(/\s+/g,' ')),open:[...document.querySelectorAll('#bdiBriefBody .bd-bf-open li')].map(l=>l.textContent)}));
    const cd=V.cards.find(c=>/Can Demir/.test(c))||'';
    ok(/🙁\s*1/.test(cd)&&V.open.some(t=>/1401.*soğuk tepki.*prefers fewer visits/.test(t)),T+' Brifing › Vardiya devri (Sabah): Can kartı "'+cd.slice(0,60)+'", açık kalanlarda soğuk tepki '+yn(V.open.some(t=>/soğuk tepki/.test(t)))+' (beklenen 🙁1 ve "1401 Leonie Brandt: soğuk tepki (prefers fewer visits)")');
    await p.evaluate(()=>{__ev('_bdiShift="aksam"');__ev('bdiBriefSetMode("shift")')});await p.waitForTimeout(400);
    const A=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody .bd-bf-bcard')].map(c=>({b:c.querySelector('.bd-bf-gh b').textContent,h:c.querySelector('.bd-bf-gh .bd-sub').textContent})));
    ok(!A.some(x=>x.b==='Can Demir')&&A.some(x=>x.b==='Nazlı Erten'&&/^1 touch/.test(x.h)),T+' Brifing › Vardiya devri (Akşam): kartlar = '+(A.map(x=>x.b+' '+x.h).join(' | ')||'yok')+' (beklenen yalnız Nazlı Erten 1 touch)');
    await p.evaluate(()=>{__ev('bdiBriefSetMode("gr")')});await p.waitForTimeout(400);
    const g=await p.evaluate(()=>{const x=[...document.querySelectorAll('#bdiBriefBody .bd-bf-rrow')].find(r=>/Brandt/.test(r.textContent));return x?{s:x.querySelector('.bd-bf-score').textContent,w:x.querySelector('.bd-bf-why').textContent}:null});
    ok(g&&/son tepki soğuk/.test(g.w),T+' Brifing › Guest Relations: Brandt = '+(g?'skor '+g.s+' "'+g.w+'"':'satır yok')+' (beklenen "son tepki soğuk")');
    await p.evaluate(()=>{__ev('bdiBriefSetMode("plan")')});await p.waitForTimeout(400);
    const pl=await p.evaluate(()=>{let o=null;document.querySelectorAll('#bdiBriefBody .bd-pl2-g').forEach(g=>{if((g.querySelector('.bd-pl2-rm')||{}).textContent!=='2101')return;g.querySelectorAll('.bd-pl2-it').forEach(it=>{if(/Issue/.test(it.textContent))o={dn:it.classList.contains('dn'),own:(it.querySelector('.bd-pl2-own')||{}).textContent}})});return o});
    ok(pl&&pl.dn&&/^NE/.test(pl.own),T+' Brifing › Plan: 2101 Morel issue işi = '+(pl?(pl.dn?'bitti ':'açık ')+'"'+pl.own+'"':'iş yok')+' (beklenen bitti, NE · 17:00)');
    await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(400);
    const fi=await p.evaluate(()=>{const r=[...document.querySelectorAll('#bdiBriefBody .bd-fd-row')].find(b=>/Issue/.test((b.querySelector('.bd-fd-tag')||{}).textContent||'')&&/Morel/.test(b.textContent));return r?(r.querySelector('.bd-fd-r')||{}).textContent:null});
    ok(fi&&/Nazlı Erten/.test(fi)&&!/Can Demir/.test(fi),T+' Brifing › Dikkat › Morel issue: ilgilenen = "'+fi+'" (beklenen Nazlı Erten)');
  });
  await run('Misafirler',async()=>{await p.evaluate(()=>{__ev('_bdiGMProf=null')});await H.tab(p,'guests');await p.fill('#guestSearchName','');await p.evaluate(()=>__ev('filterGuestLibrary()'));await p.waitForTimeout(800);
    const bonds=await p.evaluate(()=>{const r=[...document.querySelectorAll('.bd-grow')].find(x=>/Claire Morel/.test((x.querySelector('.bd-g-name')||{}).textContent||''));return r?r.children[4].textContent.replace(/\s+/g,' '):null});
    ok(bonds&&/Nazlı Erten 2/.test(bonds)&&!/Can Demir/.test(bonds),T+' Misafirler listesi: Morel butler bağları = "'+bonds+'" (beklenen Nazlı Erten 2, Can Demir yok)');
    for(const [nm,re,want] of [['Morel',/Issue Follow-up/,'Nazlı Erten'],['Brandt',/Special Request/,'🙁']]){
      const gid=await p.evaluate(n=>{const P=__ev('bdiGMProfiles')().list.find(y=>y.name.includes(n));return P&&P.gid},nm);
      await p.evaluate(g=>__ev('bdiGuestOpen')(g),gid);await p.waitForTimeout(1500);
      const li=await p.evaluate(re=>{const d=[...document.querySelectorAll('.bd-gdetail')].find(y=>y.style.display!=='none'&&y.textContent.trim());if(!d)return null;const l=[...d.querySelectorAll('.bd-tl-guest li:not(.bd-tl-day)')].find(x=>new RegExp(re).test(x.textContent));return l?{b:(l.querySelector('b')||{}).textContent,t:l.textContent.replace(/\s+/g,' ')}:''},re.source);
      if(nm==='Morel')ok(li&&li.b===want,T+' Misafir kartı › Zaman çizgisi: Morel issue teması butleri = '+(li?li.b:'satır yok')+' (beklenen Nazlı Erten)');
      else ok(li&&/🙁/.test(li.t)&&/prefers fewer visits/.test(li.t),T+' Misafir kartı › Zaman çizgisi: Brandt Special Request tepkisi = "'+(li?li.t.slice(0,80):'satır yok')+'" (beklenen 🙁 prefers fewer visits)');
    }
  });
  await run('Issues',async()=>{await H.tab(p,'issues');await p.waitForTimeout(300);
    const t=await p.evaluate(()=>{const a=[...document.querySelectorAll('article.bd-issue')].find(x=>/Claire Morel/.test(x.textContent));return a?[...a.querySelectorAll('.bd-issue-meta .bd-bond')].map(b=>b.textContent.trim()).join(', '):null});
    ok(t==='Nazlı Erten',T+' Issues: Morel kartında ilgilenen butler(lar) = "'+t+'" (beklenen Nazlı Erten)');
  });
}
