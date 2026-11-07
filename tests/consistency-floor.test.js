// Tutarlilik (bayat veri) testi: KAT SORUMLUSU (hangi butler hangi katta). Kaynak degisince (bugunun kat dagilimi ya da butler listesi)
// kat sorumlusunu gosteren HER yer yeni degeri gostermeli. Kullanici bulgusu (oda icin): VAC yuklendi, misafir tasindi, Atolye eski odayi
// gosteriyordu. Burada ayni soru kat sorumlusu icin sorulur.
// Kaynak degisikligi gercek yoldan: Kayit sekmesindeki "Kat dagilimi" paneli (butler secimi = bdiFloorAssign, "3 butler" dugmesi =
// bdiFloorSetCount, kat araligi kutusu = bdiFloorEditRange) ve Ayarlar > Butler listesi (Ekle / x). Raporlar sahte Opera PDF'leriyle
// (tests/data/opera/reports.js) Rapor Merkezi'ne birakilir. Isimler kurgu (KVKK). Saat sabit: 2026-11-06.
// Otel: 14. kat ve 21. kat. Baslangic dagilimi: Kat 7-14 Can Demir, Kat 15+ Nazli Erten.
// Senaryolar: A) iki blogun butleri yer degistirir (14 -> Nazli, 21 -> Can)
//             B) Ayarlar'a Selin Kaya eklenir, "3 butler" secilir, yeni blok Selin'e verilir (14 -> Nazli, 21 -> Selin)
//             C) ilk blogun araligi elle "7-13" yapilir (14 -> Nazli, 21 -> Nazli)
//             D) Ayarlar'da Nazli butler listesinden silinir, kat dagilimi degismez (21 hala Nazli)
// Her yer icin tek ok(): ok(yeni degeri gosteriyor, '<yer>: <ne> = <deger>'). Uygulama bugun yanlissa FAIL bulgudur, duzeltmeden sonra regresyon testi olur.
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05',TM='2026-11-07';
const CAN='Can Demir',NAZ='Nazlı Erten',SEL='Selin Kaya';
let fails=0,errsAll=[];
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const skip=m=>console.log('SKIP '+m);
const at=(p,hm)=>p.clock.setSystemTime(new Date(D+'T'+hm+':00+03:00'));
const J=JSON.stringify;
// H.ingest ile ayni yol (swRepIngest, 'elle'); dosyanin saati sayfanin sabit saatiyle (consistency-room ile ayni gerekce)
const ingest=(p,buf,name)=>p.evaluate(async([b64,n])=>{const f=new File([Uint8Array.from(atob(b64),c=>c.charCodeAt(0))],n,{lastModified:Date.now()});const r=await __ev('swRepIngest')([f],'elle');return r.map(x=>x.msg).join(' | ')},[Buffer.from(buf).toString('base64'),name]);

// ---- uydurma misafirler ----
const G={
  ach:{room:'1402',name:'Achterberg,Lotte,Ms.',arr:'2026-11-04',dep:'2026-11-09'},   // hic dokunulmadi, acik issue
  pem:{room:'1403',name:'Pemberton,Silas,Mr.',arr:'2026-11-03',dep:D},             // bugun dokunulmadan cikti (DEP CKOT)
  qui:{room:'1405',name:'Quintero,Rafael,Mr.',arr:'2026-11-03',dep:'2026-11-10'},  // dun ve bugun 13:15 Can dokundu; Takip'ten elle takip
  oko:{room:'1407',name:'Okonkwo,Adaeze,Mrs.',arr:Y,dep:'2026-11-09'},             // dun geldi (Plan: ilk sabah), dokunulmadi; Takip'ten elle takip
  bre:{room:'1408',name:'Brennan,Cormac,Mr.',arr:'2026-11-04',dep:'2026-11-09'},   // bugun 13:40 Nazli dokundu
  hal:{room:'2102',name:'Halloran,Brigid,Ms.',arr:'2026-11-02',dep:'2026-11-10'},  // dokunulmadi, acik issue ("follow-up" -> otomatik takip)
  var:{room:'2104',name:'Varga,Tamas,Mr.',arr:'2026-11-04',dep:TM},                // yarin cikiyor (Plan: son gece); Takip'ten elle takip
  lin:{room:'2106',name:'Lindqvist,Maja,Mrs.',arr:D,dep:'2026-11-11'}              // bugun geliyor (ARR, 5 gece -> Butler Alert)
};
const ROOMS=['1401','1402','1403','1404','1405','1406','1407','1408','2101','2102','2103','2104','2105','2106','2107','2108'];
const byRoom={};Object.keys(G).forEach(k=>byRoom[G[k].room]=G[k]);
const vacRows=()=>ROOMS.map(r=>{const g=byRoom[r];if(!g)return {room:r,fo:'VAC',hk:'CL',nv:'1'};const due=g.arr===D;
  return {room:r,name:g.name,fo:due?'VAC':'OCC',hk:due?'IP':'PU',res:due?'Due In':'Checked In',arr:g.arr,dep:g.dep}});
const gihRows=()=>Object.keys(G).filter(k=>G[k].arr<=Y).map(k=>({room:G[k].room,name:G[k].name,arr:G[k].arr,dep:G[k].dep}));

async function start(){
  const S=await H.open({today:D,time:'08:30',butlers:[CAN,NAZ],me:CAN});
  const {br,p}=S;
  await H.seed(S.p,{logs:{
      [Y]:[H.log('y1',Y,'10:00','1405','Rafael Quintero','Touch Call'),H.log('y2',Y,'11:00','1408','Cormac Brennan','Touch Call',{butler:NAZ})],
      [D]:[H.log('d1',D,'13:15','1405','Rafael Quintero','Touch Call'),H.log('d2',D,'13:40','1408','Cormac Brennan','Touch Call',{butler:NAZ})]},
    kv:{bdi_floors_v1:{[D]:{n:2,blocks:[{from:7,to:14,butler:CAN},{from:15,to:99,butler:NAZ}],start:'13:00',end:'23:00',u:Date.now()}}}});
  // 08:30 dun aksamin in-house raporu, bugunun varis raporu; 09:00 VAC; 12:40 cikis raporu
  let m=await ingest(p,await R.gih({day:Y,time:'22:00',rows:gihRows()},br),'GIH01102.pdf');console.log('  GIH 05.11: '+m);
  m=await ingest(p,await R.arr({day:D,time:'07:50',rows:[{room:G.lin.room,name:G.lin.name,arr:D,dep:G.lin.dep,adl:2}]},br),'ARR01102.pdf');console.log('  ARR 06.11: '+m);
  await at(p,'09:00');m=await ingest(p,await R.vac({day:D,time:'09:00',rows:vacRows()},br),'HSK01124.pdf');console.log('  VAC 09:00: '+m);
  await at(p,'12:40');m=await ingest(p,await R.dep({day:D,time:'12:40',rows:[{room:G.pem.room,name:G.pem.name,arr:G.pem.arr,dep:D,time:'10:12'}]},br),'DEP01100.pdf');console.log('  DEP 12:40: '+m);
  // 13:30 iki acik issue (biri "follow-up" istiyor: kendiliginden takip, sahibi kaydedilmez), Takip sekmesinden uc elle takip
  // (elle takipte sahip, eklenince o saatin kat sorumlusu olarak kaydedilir: bdiFuQuickAdd)
  await at(p,'13:30');
  await p.evaluate(()=>{const now=Date.now(),I=(id,room,guest,c)=>({id,room,guest,concern:c,createdAt:now,u:now,events:[{id:id+'e0',ts:now,type:'import'}]});
    __ev('bdiSaveIssues')(__ev('bdiGetIssues()').concat([I('iA','1402','Lotte Achterberg','Shower drain is slow'),I('iH','2102','Brigid Halloran','Minibar was not refilled, needs follow-up this evening')]))});
  await H.tab(p,'fu');
  for(const q of ['1405 17:30 ekstra yastığı teyit et','1407 19:00 ilk gece nasıldı diye sor','2104 18:00 havalimanı transferini teyit et']){await p.fill('#bdiFuQ',q);await p.press('#bdiFuQ','Enter');await p.waitForTimeout(300)}
  // 14:00 bugunun iPad rehberi olusturulur (ortak klasor yok: indirilir); degisiklikten sonra "Indir / Onizle" ayni gunun rehberini verir
  await at(p,'14:00');await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("brief")');__ev('bdiBriefSetMode("ipad")')});await p.waitForTimeout(800);
  await p.evaluate(async()=>{await __ev('bgdGenerate')()});await p.waitForTimeout(300);
  await at(p,'14:10');
  return S;
}

// ---- her yerin okunmasi (DOM / rapor HTML'i) ----
// E = {tag, own:{'14':butler,'21':butler}, fl:{butler:'7-14'|'15+'|...}, list:[Ayarlar'daki butlerlar]}
const srt=o=>{const r={};Object.keys(o).sort().forEach(k=>r[k]=Array.isArray(o[k])?o[k].slice().sort():o[k]);return r};
const same=(a,b)=>J(srt(a))===J(srt(b));
const FU=['1405','1407','2102','2104']; // acik takiplerin odalari
async function checkAll(S,E){
  const p=S.p,T=E.tag,own=r=>E.own[String(r).slice(0,2)]||'',butlers=Object.keys(E.fl);
  const flOf=b=>['14','21'].filter(f=>E.own[f]===b); // misafirli katlardan bu butlerin olanlari
  const run=async(name,fn)=>{try{await fn()}catch(e){ok(false,T+' '+name+': test okuyamadı ('+String(e.message||e).split('\n')[0]+')')}};
  await p.evaluate(d=>{__ev('showPage("didit")');try{document.getElementById('bdiDate').value=d}catch(e){}},D);

  // 0) Kaynak: Kat dagilimi paneli (kule)
  await run('Kat dağılımı',async()=>{await H.tab(p,'entry');
    const t=await p.evaluate(()=>{const o={};document.querySelectorAll('#bdiFloorPanel .bd-fl').forEach(e=>{const m=/^Kat (\d+)(?:: (.*))?$/.exec(e.getAttribute('title')||'');if(m)o[m[1]]=m[2]||''});
      return {t:o,sel:[...document.querySelectorAll('#bdiFloorPanel .bd-fa-row')].map(r=>(r.querySelector('.bd-fa-in')||{}).value+' '+((r.querySelector('select')||{}).value||'-'))}});
    const got={'14':t.t['14'],'21':t.t['21']};
    ok(same(got,E.own),T+' Kat dağılımı paneli (kaynak): kat 14 / 21 = '+got['14']+' / '+got['21']+' ['+t.sel.join(', ')+'] (beklenen '+E.own['14']+' / '+E.own['21']+')');
  });

  // 1) Kayit: butler secilince oda listesi "X'in katlari" suzgeci
  await run("Kayıt X'in katları",async()=>{await H.tab(p,'entry');const got={},exp={};
    for(const b of butlers.filter(b=>E.list.includes(b))){
      await p.selectOption('#bdiButler','');await p.selectOption('#bdiButler',b);await p.waitForTimeout(200);
      const r=await p.evaluate(()=>{const P=document.getElementById('bdiBulkPanel');if(!P||P.style.display!=='block')__ev('bdiBulkToggle()');
        const ch=[...P.querySelectorAll('.bd-bulk-f .bd-chip')].find(c=>/katları$/.test(c.textContent));if(!ch)return null;if(!ch.classList.contains('on'))ch.click();
        return [...new Set([...document.querySelectorAll('#bdiBulkPanel .bd-bulk-r b')].map(x=>x.textContent.slice(0,2)))]});
      got[b]=r===null?'çip yok':r;exp[b]=flOf(b);
    }
    await p.selectOption('#bdiButler','');
    ok(same(got,exp),T+' Kayıt › oda listesi "X\'in katları": görünen katlar = '+J(srt(got))+' (beklenen '+J(srt(exp))+')');
  });

  // 2) Butler Didn't Do It sekmesi: Kat sutunu ve "Who will see" bos secenegi ("— (kat: X)")
  await run("Didn't Do It",async()=>{await p.evaluate(d=>{__ev('switchBdiTab("nt")');__ev('bdiNtDateSet')(d)},D);await p.waitForTimeout(300);
    const Rw=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel table.bd-nt-tab tbody tr')].map(tr=>{const w=tr.querySelector('select[data-f="f:who"]');
      return {room:(tr.querySelector('td.r')||{}).textContent,own:(tr.querySelector('td.f')||{}).textContent,who:w&&w.options[0]?w.options[0].text:''}}));
    const got={},exp={},gw={},ew={};Rw.forEach(r=>{got[r.room]=r.own;exp[r.room]=own(r.room)||'—';gw[r.room]=r.who;ew[r.room]=own(r.room)?'— (kat: '+own(r.room)+')':'—'});
    ok(Rw.length>=4&&same(got,exp),T+" Didn't Do It: Kat sütunu = "+J(srt(got))+' (beklenen '+J(srt(exp))+')');
    ok(Rw.length>=4&&same(gw,ew),T+" Didn't Do It: \"Who will see\" boş seçeneği = "+J(srt(gw))+' (beklenen '+J(srt(ew))+')');
  });

  // 3) Butler Didn't Do It raporu: misafir satirlarinda Floor, butler tablosu (Floors), cikanlar ve alert bolumlerinde Floor
  await run("Didn't Do It raporu",async()=>{const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')}));
    const RP=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html'),t=e=>(e||{}).textContent||'',g={},b={},sec={};
      const trs=[...d.querySelectorAll('table.gtab tbody tr')];trs.forEach((tr,i)=>{if(!tr.classList.contains('gh'))return;const nx=trs[i+1];g[[...tr.querySelectorAll('.rc i')].map(t).join('/')]=nx&&!nx.classList.contains('gh')?t(nx.children[0]).trim():'satır yok'});
      d.querySelectorAll('table.bsum tbody tr').forEach(tr=>{b[t(tr.children[0]).trim()]=t(tr.children[1]).trim()});
      d.querySelectorAll('.isec').forEach(s=>{const k=t(s.querySelector('h2'));sec[k]={};s.querySelectorAll('tbody tr').forEach(tr=>{const r=t(tr.querySelector('td.ar')).trim();if(r)sec[k][r]=t(tr.querySelector('td.af')).trim()})});
      return {g,b,sec}},html);
    const eg={};Object.keys(RP.g).forEach(r=>eg[r]=own(r)||'—');
    ok(Object.keys(RP.g).length>=4&&same(RP.g,eg),T+" Didn't Do It raporu: misafir satırlarında Floor = "+J(srt(RP.g))+' (beklenen '+J(srt(eg))+')');
    const eb={};butlers.filter(b=>flOf(b).length).forEach(b=>eb[b]=E.fl[b]);delete RP.b['No floor plan'];
    ok(same(RP.b,eb),T+" Didn't Do It raporu: butler tablosu (Butler › Floors) = "+J(srt(RP.b))+' (beklenen '+J(srt(eb))+')');
    const lf=(RP.sec['Checked Out Without a Touch']||{})['1403'];
    ok(lf===own('1403'),T+" Didn't Do It raporu › Checked Out Without a Touch: 1403 Floor = "+(lf||'satır yok')+' (beklenen '+own('1403')+')');
    const af=(RP.sec['Butler Alerts Not Welcomed']||{})['2106'];
    ok(af===own('2106'),T+" Didn't Do It raporu › Butler Alerts Not Welcomed: 2106 Floor = "+(af||'satır yok')+' (beklenen '+own('2106')+')');
  });

  // 4) Takip sekmesi: "kimde" (satirdaki isim; title tam ad)
  await run('Takip',async()=>{await H.tab(p,'fu');
    const F=await p.evaluate(()=>[...document.querySelectorAll('#bdiFuPanel .bd-fu-row')].map(r=>({rm:(r.querySelector('.bd-fu-room')||{}).textContent,own:r.querySelector('.bd-fu-own')?r.querySelector('.bd-fu-own').getAttribute('title'):''})));
    const got={},exp={};F.filter(f=>FU.includes(f.rm)).forEach(f=>{got[f.rm]=f.own;exp[f.rm]=own(f.rm)});
    ok(Object.keys(got).length===FU.length&&same(got,exp),T+' Takip: takiplerin "kimde"si = '+J(srt(got))+' (beklenen '+J(srt(exp))+'; 1405, 1407, 2104 Takip\'ten elle, 2102 issue\'dan kendiliğinden)');
  });
  await run('Takip raporu',async()=>{const html=await p.evaluate(d=>__ev('bdiFuReportHtml')(d,d),D);
    const B=await p.evaluate(x=>{const d=new DOMParser().parseFromString(x,'text/html'),o={};const hd=[...d.querySelectorAll('table.bsum thead th')].map(t=>t.textContent),oi=hd.indexOf('Open');
      d.querySelectorAll('table.bsum tbody tr').forEach(r=>{const n=+(r.children[oi]||{}).textContent;if(n)o[(r.children[0]||{}).textContent]=n});return o},html);
    const exp={};FU.forEach(r=>exp[own(r)]=(exp[own(r)]||0)+1);
    ok(same(B,exp),T+' Takip raporu (Butler Follow-ups): butler başına açık takip = '+J(srt(B))+' (beklenen '+J(srt(exp))+')');
  });

  // 5) Brifing > Plan: misafir kartinin grubu (butler), grup basligindaki katlar, is satirindaki "Kime" secimi
  await run('Plan',async()=>{await H.tab(p,'brief');await p.evaluate(()=>{__ev('_bdiPlanF="all"');__ev('bdiBriefSetMode("plan")')});await p.waitForTimeout(400);
    const P=await p.evaluate(()=>{const gr={},hf={},sel={};document.querySelectorAll('#bdiBriefBody .bd-pl2-grp').forEach(g=>{const b=(g.querySelector('.bd-pl2-gh b')||{}).textContent||'';hf[b]=((g.querySelector('.bd-pl2-gh .bd-sub')||{}).textContent||'');
      g.querySelectorAll('.bd-pl2-g').forEach(c=>{const r=(c.querySelector('.bd-pl2-rm')||{}).textContent;(gr[r]=gr[r]||[]).push(b);c.querySelectorAll('select[data-id]').forEach(s=>{(sel[r]=sel[r]||[]).push(s.selectedIndex>=0?s.options[s.selectedIndex].text:'')})})});return {gr,hf,sel}});
    const eg={},es={};Object.keys(P.gr).forEach(r=>eg[r]=[own(r)]);Object.keys(P.sel).forEach(r=>es[r]=P.sel[r].map(()=>own(r)));
    ok(Object.keys(P.gr).length>=6&&same(P.gr,eg),T+' Brifing › Plan: misafir kartlarının butler grubu = '+J(srt(P.gr))+' (beklenen '+J(srt(eg))+')');
    const eh={};Object.keys(P.hf).forEach(b=>eh[b]=E.fl[b]||'');
    ok(same(P.hf,eh),T+' Brifing › Plan: grup başlığındaki katlar = '+J(srt(P.hf))+' (beklenen '+J(srt(eh))+')');
    ok(same(P.sel,es),T+' Brifing › Plan: iş satırlarında "Kime" seçimi = '+J(srt(P.sel))+' (beklenen '+J(srt(es))+')');
  });

  // 6) Brifing > Gunun akisi (kat turu): butler dugmeleri (katlariyla) ve secilen butlerin odalari
  await run('Kat turu',async()=>{await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(400);
    await p.evaluate(()=>{const g=__ev('_bdiFeedGrp');['inh','aplain','alate','dleft','vacev','nt','mo-f','mo-l'].forEach(k=>g[k]=1);__ev('bdiKatSetSel("")')});await p.waitForTimeout(200);
    const ch=await p.evaluate(()=>{const o={};document.querySelectorAll('#bdiBriefBody .bd-fd-sel button').forEach(b=>{const s=b.querySelector('.bd-sub');if(!s)return;o[b.firstChild.textContent.trim()]=s.textContent.trim()});return o});
    const ech={};Object.keys(E.fl).forEach(b=>ech[b]=E.fl[b]);
    ok(same(ch,ech),T+' Kat turu (Günün akışı) butler düğmeleri = '+J(srt(ch))+' (beklenen '+J(srt(ech))+')');
    const got={},exp={};
    for(const b of Object.keys(ch)){await p.evaluate(b=>__ev('bdiKatSetSel')(b),b);await p.waitForTimeout(150);
      got[b]=await p.evaluate(()=>[...new Set([...document.querySelectorAll('#bdiBriefBody .bd-fd-main b')].map(x=>x.textContent.trim()).filter(x=>/^\d{4}$/.test(x)).map(x=>x.slice(0,2)))]);exp[b]=flOf(b)}
    await p.evaluate(()=>__ev('bdiKatSetSel("")'));
    ok(Object.keys(got).length&&same(got,exp),T+' Kat turu (Günün akışı): butler seçilince görünen katlar = '+J(srt(got))+' (beklenen '+J(srt(exp))+')');
  });
  await run('Kat turu yazdır',async()=>{const html=await p.evaluate(()=>{__ev('_bdiKatSel=""');return window.__t.capture(function(){return __ev('bdiKatPrint()')})});
    const K=await p.evaluate(x=>{const d=new DOMParser().parseFromString(x,'text/html'),o={};d.querySelectorAll('section').forEach(s=>{const h=((s.querySelector('h1')||{}).textContent||'').split(' · ');
      o[h[1]]={fl:(h[2]||'').replace(/^Kat /,''),rooms:[...new Set([...s.querySelectorAll('td.no')].map(t=>t.textContent.slice(0,2)))]}});return o},html);
    const exp={};butlers.forEach(b=>exp[b]={fl:E.fl[b],rooms:flOf(b)});Object.keys(K).forEach(b=>K[b].rooms.sort());
    ok(same(K,exp),T+' Kat turu yazdır: sayfa başlığı ve odalar = '+J(srt(K))+' (beklenen '+J(srt(exp))+')');
  });

  // 7) iPad rehberi: olusturulan veri (kat dagilimi, takiplerin sahibi, butler listesi) ve ayni gun "Indir / Onizle"nin verdigi rehber
  await run('iPad rehberi',async()=>{const B=await p.evaluate(d=>{const b=__ev('bgdBuild')(d);return {fl:b.floors,fo:b.follows.map(f=>[f.room,f.owner]),bl:b.butlers}},D);
    const o=fl=>{const r={};['14','21'].forEach(f=>{const k=fl.find(x=>+f>=x.from&&+f<=x.to);r[f]=k?k.butler:''});return r};
    ok(same(o(B.fl),E.own),T+' iPad rehberi (oluşturulan): kat 14 / 21 sahibi = '+J(o(B.fl))+' (beklenen '+J(E.own)+')');
    const fo={},efo={};B.fo.forEach(x=>{fo[x[0]]=x[1];efo[x[0]]=own(x[0])});
    ok(B.fo.length===FU.length&&same(fo,efo),T+' iPad rehberi: takiplerin sahibi = '+J(srt(fo))+' (beklenen '+J(srt(efo))+')');
    const miss=butlers.filter(b=>!B.bl.includes(b));
    ok(!miss.length,T+' iPad rehberi: butler seçim listesi kat sahiplerini içeriyor = '+J(B.bl)+(miss.length?' (eksik: '+miss.join(', ')+')':''));
    const html=await p.evaluate(async()=>(await __ev('bgdLastHtml')()).html);
    const i=html.indexOf('<script id="guideData" type="application/json">'),j=html.indexOf('</script>',i),G2=JSON.parse(html.slice(i+47,j));
    ok(same(o(G2.floors||[]),E.own),T+' iPad rehberi › İndir / Önizle (bugünün rehberi 14:00\'te oluşturulmuştu): kat 14 / 21 sahibi = '+J(o(G2.floors||[]))+' (beklenen '+J(E.own)+')');
  });

  // 8) Issues: kartta "Kat sorumlusu"
  await run('Issues',async()=>{await H.tab(p,'issues');try{await p.evaluate(()=>__ev('bdiIssueSetFilter("all")'))}catch(e){}await p.waitForTimeout(300);
    const I=await p.evaluate(()=>[...document.querySelectorAll('article.bd-issue')].map(a=>({rm:((a.querySelector('.bd-issue-room')||{}).firstChild||{}).textContent,o:(/Kat sorumlusu: (\S+ \S+)/.exec(a.textContent)||[])[1]||'yok'})));
    const got={},exp={};I.forEach(x=>{got[x.rm]=x.o;exp[x.rm]=own(x.rm)});
    ok(I.length===2&&same(got,exp),T+' Issues: kartta "Kat sorumlusu" = '+J(srt(got))+' (beklenen '+J(srt(exp))+')');
  });

  // 9) Log > Butler ozeti (gun): kartta katlar ve "Kendi katinda (13-23)"
  await run('Log butler özeti',async()=>{await p.evaluate(d=>{document.getElementById('bdiDate').value=d;__ev('switchBdiTab("log")');__ev('setBdiView("day")');__ev('loadBdiLogs()');__ev('renderBdiLog()')},D);await p.waitForTimeout(400);
    const C=await p.evaluate(()=>{const o={};document.querySelectorAll('#bdiButlerSummary .bd-bcard').forEach(c=>{const n=(c.querySelector('.bd-bcard-name')||{}).textContent,dl=[...c.querySelectorAll('dt')],i=dl.findIndex(x=>/Kendi kat/.test(x.textContent));
      o[n]={fl:((c.querySelector('.bd-bcard-floor')||{}).textContent||'').trim(),own:i>=0?c.querySelectorAll('dd')[i].textContent:''}});return o});
    const ef={},eo={},gf={},go={};Object.keys(C).forEach(b=>{gf[b]=C[b].fl;ef[b]=E.fl[b]?'Kat '+E.fl[b]+' (13-23)':'Kat görevi yok';if(C[b].own){go[b]=C[b].own}});
    eo[CAN]=own('1405')===CAN?'100%':'0%';eo[NAZ]=own('1408')===NAZ?'100%':'0%';
    ok(Object.keys(C).length>=2&&same(gf,ef),T+' Log › Butler özeti: kartlardaki katlar = '+J(srt(gf))+' (beklenen '+J(srt(ef))+')');
    ok(same(go,eo),T+' Log › Butler özeti: "Kendi katında (13-23)" = '+J(srt(go))+' (beklenen '+J(srt(eo))+'; Can 1405\'e, Nazlı 1408\'e dokundu)');
  });

  // 10) Butler Did It raporu (gun): butler tablosu (Floors) ve Butler Alerts bolumunde Floor
  await run('Butler Did It raporu',async()=>{const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidIt()')}));
    const RP=await p.evaluate(x=>{const d=new DOMParser().parseFromString(x,'text/html'),b={},a={};d.querySelectorAll('table.bsum tbody tr').forEach(tr=>{b[tr.children[0].textContent.trim()]=tr.children[1].textContent.trim()});
      d.querySelectorAll('.asec tbody tr').forEach(tr=>{const r=(tr.querySelector('td.ar')||{}).textContent;if(r){const f=tr.querySelector('td.af');a[r]=f?(f.firstChild||{}).textContent||'':''}});return {b,a}},html);
    const eb={};Object.keys(RP.b).forEach(b=>eb[b]=E.fl[b]||'-');
    ok(Object.keys(RP.b).length>=2&&same(RP.b,eb),T+' Butler Did It raporu: butler tablosu (Butler › Floors) = '+J(srt(RP.b))+' (beklenen '+J(srt(eb))+')');
    ok(RP.a['2106']===own('2106'),T+' Butler Did It raporu › Butler Alerts: 2106 Floor = '+(RP.a['2106']||'satır yok')+' (beklenen '+own('2106')+')');
  });

  // 11) Uyarilar: hicbir maddesi kat sorumlusunu gostermiyor (swWarnCollect: issue, takip, alert, Didn't Do It, in-room, ozel gun)
  await run('Uyarılar',async()=>{const W=await p.evaluate(()=>{__ev('swWarnOpen()');const m=document.getElementById('swWarnModal'),t=m?m.textContent:'';if(m)m.style.display='none';return t});
    skip(T+' Uyarılar: kat sorumlusu hiçbir maddede yazmıyor (karşılaştırılacak değer yok) · '+butlers.filter(b=>W.includes(b)).length+' butler adı geçiyor');
  });
}

// Kat turundan "Inspection ✓": touch kimin adina yazilir (o odanin kat sorumlusu). Veri degistirir: senaryonun sonunda.
async function inspectAs(S,E){const p=S.p,T=E.tag;
  try{await H.tab(p,'brief');await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(400);
    await p.evaluate(()=>{const g=__ev('_bdiFeedGrp');['inh','aplain','alate','dleft','vacev','nt','mo-f','mo-l'].forEach(k=>g[k]=1);__ev('bdiKatSetSel("")')});await p.waitForTimeout(200);
    await p.evaluate(()=>{const r=[...document.querySelectorAll('#bdiBriefBody .bd-fd-row')].find(b=>(b.getAttribute('onclick')||'').includes("'h:1402'")); /* Oteldekiler > Kat 14 > 1402 */if(r)r.click()});await p.waitForTimeout(250);
    const clicked=await p.evaluate(()=>{const b=[...document.querySelectorAll('#bdiBriefBody .bd-fd-det button')].find(x=>/Inspection/.test(x.textContent)&&/bdiKatInspect\('1402'\)/.test(x.getAttribute('onclick')||''));if(b){b.click();return true}return false});await p.waitForTimeout(300);
    const L=await p.evaluate(d=>__ev('loadBdiArrayForDate')(d).filter(l=>l.room==='1402'&&/Inspection/.test(l.action)).map(l=>l.butler),D);
    ok(clicked&&L.length===1&&L[0]===E.own['14'],T+' Kat turu › Inspection ✓ (1402): touch\'ın butleri = '+(L.join(', ')||(clicked?'kayıt yok':'düğme yok'))+' (beklenen '+E.own['14']+')');
  }catch(e){ok(false,T+' Kat turu › Inspection ✓: test okuyamadı ('+String(e.message||e).split('\n')[0]+')')}
}

// Ayni ekran: Kayit'ta butler secili ve oda listesi "X'in katlari"nda; kat dagilimi yandaki panelde degisir. Liste kendiliginden yenilenmeli.
async function sameScreenPrep(p,b){await H.tab(p,'entry');await p.selectOption('#bdiButler','');await p.selectOption('#bdiButler',b);await p.waitForTimeout(200);
  return p.evaluate(()=>{const P=document.getElementById('bdiBulkPanel');if(!P||P.style.display!=='block')__ev('bdiBulkToggle()');const ch=[...P.querySelectorAll('.bd-bulk-f .bd-chip')].find(c=>/katları$/.test(c.textContent));if(ch&&!ch.classList.contains('on'))ch.click();
    return [...new Set([...document.querySelectorAll('#bdiBulkPanel .bd-bulk-r b')].map(x=>x.textContent.slice(0,2)))]})}
const sameScreenRead=p=>p.evaluate(()=>[...new Set([...document.querySelectorAll('#bdiBulkPanel .bd-bulk-r b')].map(x=>x.textContent.slice(0,2)))]);
// Kat dagilimi panelindeki bir blogun butleri (gercek <select>, onchange = bdiFloorAssign)
const assign=async(p,i,b)=>{await p.selectOption('#bdiFloorPanel .bd-fa-row >> nth='+i+' >> select',b);await p.waitForTimeout(250)};

const BASE={tag:'',own:{'14':CAN,'21':NAZ},fl:{[CAN]:'7-14',[NAZ]:'15+'},list:[CAN,NAZ]};
async function scenario(name,fn){
  const S=await start();
  try{await fn(S)}catch(e){ok(false,name+' senaryosu çöktü: '+String(e.message||e).split('\n')[0])}
  errsAll.push(...S.errs);await S.br.close();
}

(async()=>{
 // ===== A) Iki blogun butleri yer degistirir: 14 -> Nazli, 21 -> Can =====
 await scenario('A',async S=>{const p=S.p;
  await checkAll(S,Object.assign({},BASE,{tag:'[önce]'})); // okuyucular dogru mu: degisiklikten once herkes eski degeri gostermeli
  const s0=await sameScreenPrep(p,CAN);ok(J(s0)===J(['14']),'[A] ön koşul: Kayıt\'ta Can seçili, "Can\'ın katları" = '+J(s0));
  await at(p,'14:15');await assign(p,0,NAZ);await assign(p,1,CAN);
  const s1=await sameScreenRead(p);ok(J(s1)===J(['21']),'[A takas] Kayıt › oda listesi "Can\'ın katları" (aynı ekranda, kat dağılımı yan panelde değişti) = '+J(s1)+' (beklenen ["21"])');
  const E={tag:'[A takas]',own:{'14':NAZ,'21':CAN},fl:{[NAZ]:'7-14',[CAN]:'15+'},list:[CAN,NAZ]};
  await checkAll(S,E);
  await S.p.reload();await S.p.waitForTimeout(1500);await S.p.evaluate(async()=>{await __ev('BdiKV').ready();try{__ev('closeSetupModal()')}catch(e){}});await S.p.waitForTimeout(800);
  await checkAll(S,Object.assign({},E,{tag:'[A takas, sayfa yenilendi]'}));
  await inspectAs(S,E);
 });

 // ===== B) Ayarlar'a Selin Kaya eklenir, "3 butler", yeni blok Selin'e: 14 -> Nazli (12-16), 21 -> Selin (17+), Can 7-11 =====
 await scenario('B',async S=>{const p=S.p;
  await at(p,'14:12');await p.evaluate(()=>{__ev('showPage("settings")');__ev('swSetOpen')(document.getElementById('kwButlerNew'))});await p.waitForTimeout(300);
  await p.fill('#kwButlerNew',SEL);await p.press('#kwButlerNew','Enter');await p.waitForTimeout(200);
  const kl=await p.evaluate(()=>__ev('getKW("butler")'));ok(kl.includes(SEL),'[B] Ayarlar: butler listesi = '+J(kl));
  const s0=await sameScreenPrep(p,CAN);ok(J(s0)===J(['14']),'[B] ön koşul: Kayıt\'ta Can seçili, "Can\'ın katları" = '+J(s0));
  await at(p,'14:15');await p.click('#bdiFloorPanel .bd-seg button:has-text("3 butler")');await p.waitForTimeout(300);
  const opts=await p.evaluate(()=>[...document.querySelectorAll('#bdiFloorPanel .bd-fa-row')].map(r=>[(r.querySelector('.bd-fa-in')||{}).value,[...r.querySelectorAll('select option')].map(o=>o.value).filter(Boolean)]));
  ok(opts.length===3&&opts[2][1].includes(SEL),'[B] Kat dağılımı: 3 blok '+J(opts.map(o=>o[0]))+', yeni butler seçilebiliyor ('+J(opts[2]?opts[2][1]:[])+')');
  await assign(p,2,SEL);
  const s1=await sameScreenRead(p);ok(J(s1)===J([]),'[B 3 butler] Kayıt › oda listesi "Can\'ın katları" (aynı ekranda; Can artık 7-11, misafirli katı yok) = '+J(s1)+' (beklenen [])');
  const E={tag:'[B 3 butler]',own:{'14':NAZ,'21':SEL},fl:{[CAN]:'7-11',[NAZ]:'12-16',[SEL]:'17+'},list:[CAN,NAZ,SEL]};
  await checkAll(S,E);await inspectAs(S,E);
 });

 // ===== C) Ilk blogun araligi elle "7-13": 14 -> Nazli (14+), 21 -> Nazli =====
 await scenario('C',async S=>{const p=S.p;
  const s0=await sameScreenPrep(p,CAN);ok(J(s0)===J(['14']),'[C] ön koşul: Kayıt\'ta Can seçili, "Can\'ın katları" = '+J(s0));
  await at(p,'14:15');await p.fill('#bdiFloorPanel .bd-fa-in >> nth=0','7-13');await p.press('#bdiFloorPanel .bd-fa-in >> nth=0','Enter');await p.waitForTimeout(300);
  const s1=await sameScreenRead(p);ok(J(s1)===J([]),'[C aralık] Kayıt › oda listesi "Can\'ın katları" (aynı ekranda; Can artık 7-13) = '+J(s1)+' (beklenen [])');
  const E={tag:'[C aralık]',own:{'14':NAZ,'21':NAZ},fl:{[CAN]:'7-13',[NAZ]:'14+'},list:[CAN,NAZ]};
  await checkAll(S,E);await inspectAs(S,E);
 });

 // ===== D) Ayarlar'da Nazli butler listesinden silinir; bugunun kat dagilimi degismez (15+ hala Nazli) =====
 await scenario('D',async S=>{const p=S.p;
  await at(p,'14:15');await p.evaluate(()=>{__ev('showPage("settings")');__ev('swSetOpen')(document.getElementById('kwButlerNew'))});await p.waitForTimeout(300);
  await p.evaluate(n=>{const t=[...document.querySelectorAll('#kwButlerTags .kw-tag')].find(x=>x.textContent.includes(n));t.querySelector('button').click()},NAZ);await p.waitForTimeout(200);
  const kl=await p.evaluate(()=>__ev('getKW("butler")'));ok(J(kl)===J([CAN]),'[D] Ayarlar: butler listesi = '+J(kl));
  const E={tag:'[D liste]',own:{'14':CAN,'21':NAZ},fl:{[CAN]:'7-14',[NAZ]:'15+'},list:[CAN]};
  await checkAll(S,E);
 });

 ok(errsAll.length===0,'JS hatası yok '+J(errsAll));
 console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0);
})();
