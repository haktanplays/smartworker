// Tutarlilik (bayat veri) testi: GUN DONUMU ve AYAR DEGISIKLIKLERI. Ayni bilgi (bugunun tarihi, bir islemin adi, bir tercih
// kategorisinin departmani, Didn't Do It sebep listesi, butler listesi) bircok yerde gosterilir; kaynagi degisince HER yer yeni
// degeri gostermeli. Kullanici bulgusu (oda icin): VAC yuklendi, misafir tasindi, Atolye eski odayi gosteriyordu.
// Kaynak degisikligi gercek yoldan:
//   - gece yarisi uygulama acikken gecer (p.clock.fastForward; sayfanin kendi 30 sn zamanlayicisi + swDayCheck())
//   - Ayarlar: islem sihirbazinda "Duzenle" -> ad -> Kaydet (bdiamSave); Guest Preference alani satirindaki departman secimi
//     (bdiCfgEdit); Didn't Do It sebepleri (yeni satir + Enter, "Sil"); Butler Isimleri (Ekle / x). Sonra ust menuden Butler Did It.
// Raporlar sahte Opera PDF'leriyle (tests/data/opera/reports.js) Rapor Merkezi'ne birakilir. Isimler kurgu (KVKK). Saat sabit.
// Otel: 7. ve 12. kat, Kat 7-11 Can Demir, Kat 12+ Nazli Erten. Gun A = 07.11.2026, gece yarisindan sonra B = 08.11.2026.
// Senaryolar (her biri ayri tarayici):
//   gece          A 23:50'de Kayit acik (oda listesi acik), saat 00:10'a ilerler; tiklamadan gorunenler + her sekmeye tiklayinca
//   gece/<sekme>  ayni gece yarisi, o sekme ekranda acik kalmis (fu, brief=Plan, issues, nt, nat): tiklamadan ne gorunuyor
//   islem adi     "Welcome / In-room Check-in" -> "Arrival Greeting"; "Amenity Delivery" (balonu gizli, tipi Special Occasion) -> "Amenity Drop"
//   tercih dep.   Pillow: HSK -> BUT;  sebepler: "Guest asleep" eklenir, kullanilan "Late arrival" silinir;  butler: Selin eklenir, Nazli silinir
// Her yer icin tek ok(): ok(yeni degeri gosteriyor, '<yer>: <ne> = <deger>'). Uygulama bugun yanlissa FAIL bulgudur,
// duzeltmeden sonra regresyon testi olur. Karsilastirilacak deger yoksa SKIP. Gelistirirken tek senaryo: ONLY='gece/fu' node consistency-day.js
const H=require('./h.js'),R=require('./opera/reports.js');
const A='2026-11-07',B='2026-11-08',Y='2026-11-06',Y2='2026-11-05';
const CAN='Can Demir',NAZ='Nazlı Erten',SEL='Selin Kaya';
const OLDA='Welcome / In-room Check-in',NEWA='Arrival Greeting',OLDB='Amenity Delivery',NEWB='Amenity Drop';
let fails=0,errsAll=[];
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const skip=m=>console.log('SKIP '+m);
const J=JSON.stringify;
const at=(p,day,hm)=>p.clock.setSystemTime(new Date(day+'T'+hm+':00+03:00'));
const fmt=d=>d.slice(8,10)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
// H.ingest ile ayni yol (swRepIngest, 'elle'); dosyanin saati sayfanin sabit saatiyle (consistency-room ile ayni gerekce)
const ingest=(p,buf,name)=>p.evaluate(async([b64,n])=>{const f=new File([Uint8Array.from(atob(b64),c=>c.charCodeAt(0))],n,{lastModified:Date.now()});const r=await __ev('swRepIngest')([f],'elle');return r.map(x=>x.msg).join(' | ')},[Buffer.from(buf).toString('base64'),name]);

// ---- uydurma misafirler ----
const G={
  fai:{room:'0702',name:'Fairbanks,Odette,Mrs.',arr:Y2,dep:'2026-11-10'},   // A 10:00 Turndown + tercih "Pillow" (varsayilan departman HSK)
  oka:{room:'0704',name:'Okafor,Chidi,Mr.',arr:Y,dep:B},                   // B'de cikiyor; acik issue; Takip "yarin 10:00"; hic dokunulmadi
  mar:{room:'0706',name:'Marchetti,Elena,Ms.',arr:A,dep:'2026-11-12'},     // A'da geliyor (ARR, 5 gece -> Butler Alert)
  tho:{room:'1203',name:'Thornbury,Felix,Mr.',arr:'2026-11-04',dep:'2026-11-09'}, // hic dokunulmadi; Didn't Do It sebebi "Late arrival"
  abe:{room:'1205',name:'Abernathy,Rosalind,Mrs.',arr:Y,dep:'2026-11-12'}, // dun Nazli dokundu
  kow:{room:'1207',name:'Kowalczyk,Piotr,Mr.',arr:B,dep:'2026-11-13'}      // B'de geliyor (ARR B, 5 gece -> alert B); Polonyali (OSR) -> 11.11 Polonya Bagimsizlik Gunu
};
const person=g=>{const s=g.name.split(',');return s[1]+' '+s[0]};
const BUF={}; // PDF'ler bir kez uretilir
let CUR=null; // acik tarayici: senaryo cokse de kapatilir
async function pdfs(br){if(BUF.gih)return;
  BUF.gih=await R.gih({day:A,time:'07:30',rows:['fai','oka','tho','abe'].map(k=>({room:G[k].room,name:G[k].name,arr:G[k].arr,dep:G[k].dep}))},br);
  BUF.arrA=await R.arr({day:A,time:'07:40',rows:[{room:G.mar.room,name:G.mar.name,arr:A,dep:G.mar.dep}]},br);
  BUF.arrB=await R.arr({day:B,time:'21:00',rows:[{room:G.kow.room,name:G.kow.name,arr:B,dep:G.kow.dep}]},br);
  const occ=k=>({room:G[k].room,name:G[k].name,fo:'OCC',hk:'PU',res:'Checked In',arr:G[k].arr,dep:G[k].dep});
  BUF.vac=await R.vac({day:A,time:'09:00',rows:[occ('fai'),occ('oka'),{room:'0706',name:G.mar.name,fo:'VAC',hk:'IP',res:'Due In',arr:A,dep:G.mar.dep},{room:'0708',fo:'VAC',hk:'CL',nv:'1'},
    occ('tho'),occ('abe'),{room:'1207',fo:'VAC',hk:'CL',nv:'1'}]},br);
}

// o: {time, welcome:true -> 0706'ya A 16:00 Welcome girilmis olur}
async function start(o){
  const S=await H.open({today:A,time:o.time,butlers:[CAN,NAZ],me:CAN});CUR=S;const {br,p}=S;await pdfs(br);
  const L=(id,day,tm,k,act,x)=>H.log(id,day,tm,G[k].room,person(G[k]),act,x);
  const r=(name,nat,arr,dep)=>({name,nat,c:'',arr,dep,k:'',s:''});
  await H.seed(p,{logs:{[Y]:[L('y1',Y,'18:00','abe','Turndown',{butler:NAZ})],
      [A]:[L('a1',A,'10:00','fai','Turndown'),L('a2',A,'10:05','fai','Guest Preference',{touchCategory:'Preference',note:'Pillow: firm pillow, two extra'})].concat(o.welcome?[L('a3',A,'16:00','mar',OLDA)]:[])},
    kv:{bdi_floors_v1:{[A]:{n:2,blocks:[{from:7,to:11,butler:CAN},{from:12,to:99,butler:NAZ}],start:'13:00',end:'23:00',u:Date.now()}},
      bdi_osr_v1:{at:Date.now(),file:'osr.pdf',arrFrom:'2026-11-01',arrTo:'2026-11-30',rows:[r('Kowalczyk, Piotr','Poland',B,G.kow.dep),r('Fairbanks, Odette','United Kingdom',Y2,G.fai.dep)]}}});
  const m=[];
  m.push(await ingest(p,BUF.gih,'GIH01102.pdf'));m.push(await ingest(p,BUF.arrA,'ARR01102.pdf'));m.push(await ingest(p,BUF.arrB,'ARR01102_B.pdf'));m.push(await ingest(p,BUF.vac,'HSK01124.pdf'));
  console.log('  raporlar: '+m.join(' || '));
  // acik issue (0704, misafir B'de cikiyor) - Issues ice alma ile ayni depo
  await p.evaluate(g=>{const now=Date.now(),I=(id,room,guest,c)=>({id,room,guest,concern:c,createdAt:now,u:now,events:[{id:id+'e0',ts:now,type:'import'}]});
    __ev('bdiSaveIssues')(__ev('bdiGetIssues()').concat([I('iO',g.room,'Chidi Okafor','Shower drain is slow')]))},G.oka);
  // Takip sekmesinden elle takip: "yarin 10:00" (B)
  await H.tab(p,'fu');await p.fill('#bdiFuQ','0704 yarın 10:00 transfer saatini teyit et');await p.press('#bdiFuQ','Enter');await p.waitForTimeout(300);
  // Didn't Do It: 1203'e sebep "Late arrival" (sekmedeki satir secimi)
  await H.tab(p,'nt');await p.evaluate(d=>__ev('bdiNtDateSet')(d),A);await p.waitForTimeout(300);
  await p.selectOption('#bdiNtPanel tr:has(td.r:text-is("1203")) select[data-f="r"]','Late arrival');await p.waitForTimeout(200);
  return S;
}
const run=async(T,name,fn)=>{try{await fn()}catch(e){ok(false,T+' '+name+': test okuyamadı ('+String(e.message||e).split('\n')[0]+')')}};
const goDidit=async p=>{await p.evaluate(()=>{const b=[...document.querySelectorAll('.nav-btn')].find(x=>/Butler Did/.test(x.textContent));if(b)b.click();else __ev('showPage("didit")')});await p.waitForTimeout(500)};
const goSettings=async p=>{await p.evaluate(()=>__ev('showPage("settings")'));await p.waitForTimeout(400)};
const opts=(p,sel)=>p.evaluate(s=>[...document.querySelectorAll(s)].map(o=>o.textContent.trim()),sel);

// ---- gece yarisinda gorunur olan yerler (tiklamadan) ----
// fresh: uygulamanin kendi saf fonksiyonlariyla yeni gunun degeri (gosterilen bununla ayni olmali)
const fresh=p=>p.evaluate(()=>{const t=__ev('getToday()'),o={};
  try{const L=__ev('bdiNtList')(t);o.nt=L?L.rows.length:0;o.ntRooms=L?L.rows.map(g=>g.rooms.join('/')):[]}catch(e){o.nt='hata'}
  try{o.irci=__ev('bdiIrciRows')(t).length}catch(e){o.irci='hata'}
  try{o.alert=(__ev('bdiAlertListOn')(t).list||[]).filter(a=>a&&a.visited!==true&&!(a.visited===false&&a.notVisitedReason)).length}catch(e){o.alert='hata'}
  try{o.fu=__ev('bdiFuOpenRows()').filter(r=>r.x.s!=='later').length}catch(e){o.fu='hata'}
  try{o.nat=__ev('bdiNatEvents')(t,__ev('bdiAddDays')(t,3)).filter(e=>e.inh.length).length}catch(e){o.nat='hata'}
  try{const it=__ev('swWarnCollect()');o.warn=it.length;o.warnHi=it.filter(x=>x.sev==='high').length;o.warnT=it.map(x=>x.t)}catch(e){o.warn='hata'}
  return o});
const badges=p=>p.evaluate(()=>{const t=id=>((document.getElementById(id)||{}).textContent||'').trim(),b=document.getElementById('swWarnBtn');
  return {nt:t('bdiNtTabCount'),irci:t('bdiIrciTabCount'),alert:t('bdiAlertTabCount'),fu:t('bdiFuTabCount'),nat:t('bdiNatTabCount'),warn:b?(b.querySelector('.sw-tb-n')||{}).textContent||(b.querySelector('.sw-tb-ok')?'✓':''):'',warnHi:!!(b&&b.querySelector('.sw-tb-n.hi'))}});
const nb=n=>n?String(n):'';

async function midnight(p){await at(p,A,'23:50');await p.clock.fastForward('00:20:00');const r=await p.evaluate(()=>__ev('swDayCheck()'));await p.waitForTimeout(800);
  const t=await p.evaluate(()=>__ev('getToday()'));ok(t===B,'[gece] saat 00:10, uygulamanın bugünü = '+t+' (swDayCheck ikinci çağrı: '+r+')');}

// ===== SENARYO 1: gece yarisi, Kayit acik (en sik durum: aksam vardiyasi Kayit ekraninda birakir) =====
async function scenarioMidnight(){
  const S=await start({time:'21:50',welcome:true});const p=S.p,T='[gece]';
  await at(p,A,'22:00');await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("brief")');__ev('bdiBriefSetMode("ipad")')});await p.waitForTimeout(600);
  await p.evaluate(async()=>{await __ev('bgdGenerate')()});await p.waitForTimeout(300); // A'nin iPad rehberi olusturuldu
  // Kayit: butler Can, islem Turndown, oda listesi acik (0702'ye bugun Turndown girildi -> soluk / ✓)
  await at(p,A,'23:40');for(const t of ['nt','irci','alert','fu','issues','nat','log','entry'])await H.tab(p,t);
  await p.selectOption('#bdiButler',CAN);await p.waitForTimeout(200);
  const ti=await p.evaluate(()=>String(__ev('getBdiActions()').findIndex(a=>a.label==='Turndown')));await p.selectOption('#bdiAction',ti);await p.waitForTimeout(200);
  await p.evaluate(()=>{const P=document.getElementById('bdiBulkPanel');if(!P||P.style.display!=='block')__ev('bdiBulkToggle()');const c=[...P.querySelectorAll('.bd-bulk-f .bd-chip')].find(x=>/Tüm katlar/.test(x.textContent));if(c)c.click()});await p.waitForTimeout(200);
  const picker=()=>p.evaluate(()=>{const o={};document.querySelectorAll('#bdiBulkPanel .bd-bulk-r').forEach(b=>{o[(b.querySelector('b')||{}).textContent]=b.classList.contains('dn')});return o});
  const pk0=await picker();ok(pk0['0702']===true,T+' ön koşul: Kayıt › oda listesi 23:40\'ta 0702 "bugün Turndown girildi" (soluk ✓) = '+pk0['0702']);
  const b0=await badges(p),f0=await fresh(p);console.log('  önce (23:40) rozetler '+J(b0)+' · taze '+J({nt:f0.nt,irci:f0.irci,alert:f0.alert,fu:f0.fu,nat:f0.nat,warn:f0.warn}));
  ok(b0.irci==='1'&&b0.nat==='',T+' ön koşul: A günü rozetleri In-room Check-in = '+J(b0.irci)+' (0706 Welcome), Uyruklar = '+J(b0.nat)+' (11.11 henüz 3 günden uzak)');

  await midnight(p);
  const F=await fresh(p),Bd=await badges(p);console.log('  sonra (00:10) rozetler '+J(Bd)+' · taze '+J(F));
  // --- tiklamadan gorunenler ---
  await run(T,'Kayıt tarihi',async()=>{const v=await p.evaluate(()=>document.getElementById('bdiDate').value);ok(v===B,T+' Kayıt › Tarih kutusu = '+v+' (beklenen '+B+')')});
  await run(T,'Bugün kartı',async()=>{const c=await p.evaluate(()=>({h:(document.querySelector('#bdiTodayCard h3')||{}).textContent,n:(document.querySelector('#bdiTodayCard .bd-kpi b')||{}).textContent}));
    ok(c.h==='Bugün'&&c.n==='0',T+' Kayıt › "Bugün" kartı: başlık / touch = '+c.h+' / '+c.n+' (beklenen Bugün / 0)')});
  await run(T,'Kat dağılımı tarihi',async()=>{const s=await p.evaluate(()=>(document.querySelector('#bdiFloorPanel .bd-sub')||{}).textContent||'');ok(s.includes(fmt(B)),T+' Kayıt › Kat dağılımı başlığındaki gün = "'+s.trim()+'" (beklenen '+fmt(B)+')')});
  await run(T,'Oda listesi',async()=>{const pk=await picker();ok(pk['0702']===false,T+' Kayıt › oda listesi (açık kaldı): 0702 "bugün Turndown girildi" işareti = '+pk['0702']+' (beklenen false: '+fmt(B)+'\'de henüz Turndown yok)')});
  await run(T,'Varış günü',async()=>{const v=await p.evaluate(()=>document.getElementById('dateInput').value);ok(v==='2026-11-09',T+' Üst bant › Varış günü = '+v+' (beklenen 2026-11-09)')});
  ok(Bd.nt===nb(F.nt),T+' Sekme rozeti (tıklamadan) Didn\'t Do It = '+J(Bd.nt)+' (beklenen '+J(nb(F.nt))+', '+fmt(B)+' listesi '+J(F.ntRooms)+')');
  ok(Bd.irci===nb(F.irci),T+' Sekme rozeti (tıklamadan) In-room Check-in = '+J(Bd.irci)+' (beklenen '+J(nb(F.irci))+')');
  ok(Bd.alert===nb(F.alert),T+' Sekme rozeti (tıklamadan) Butler Alert = '+J(Bd.alert)+' (beklenen '+J(nb(F.alert))+': 1207 '+fmt(B)+' alert\'i)');
  ok(Bd.fu===nb(F.fu),T+' Sekme rozeti (tıklamadan) Takip = '+J(Bd.fu)+' (beklenen '+J(nb(F.fu))+': 0704 takibi artık "bugün")');
  ok(Bd.nat===nb(F.nat),T+' Sekme rozeti (tıklamadan) Uyruklar = '+J(Bd.nat)+' (beklenen '+J(nb(F.nat))+': 11.11 Polonya günü 3 gün içine girdi, 1207 Polonyalı)');
  ok(Bd.warn===(F.warn?String(F.warn):'✓')&&Bd.warnHi===(F.warnHi>0),T+' Üst bant › Uyarılar düğmesi (tıklamadan) = '+J(Bd.warn)+(Bd.warnHi?' kırmızı':'')+' (beklenen '+J(F.warn?String(F.warn):'✓')+(F.warnHi?' kırmızı':'')+': '+J(F.warnT)+')');

  // --- sekmeye tiklayinca ---
  await run(T,'Log',async()=>{await H.tab(p,'log');const h=await p.evaluate(()=>({h:document.getElementById('bdiLogCount').textContent,rows:document.querySelectorAll('#bdi-log-wrap tbody tr').length}));
    ok(h.rows===0&&!/07\.11/.test(h.h),T+' Log ve rapor › gün görünümü: başlık "'+h.h+'", satır '+h.rows+' (beklenen '+fmt(B)+': 0 kayıt)')});
  await run(T,'Butler Did It raporu',async()=>{const n0=S.dlg.length,html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidIt()')}));const d=(/class="date">([^<]*)/.exec(html)||[])[1]||'',msg=S.dlg.slice(n0).join(' ');
    ok(html?d.includes(fmt(B)):/Kayit yok/.test(msg),T+' Butler Did It raporu (Log › PDF): '+(html?'tarih = "'+d+'"':'rapor yerine uyarı "'+msg+'"')+' (beklenen '+fmt(B)+' günü: o gün kayıt yok, A\'nın 3 kaydı rapora girmemeli)')});
  await run(T,"Didn't Do It",async()=>{await H.tab(p,'nt');const n=await p.evaluate(()=>({d:(document.querySelector('#bdiNtPanel input[type=date]')||{}).value,rooms:[...document.querySelectorAll('#bdiNtPanel table.bd-nt-tab tbody td.r')].map(x=>x.textContent)}));
    ok(n.d===B&&J(n.rooms.slice().sort())===J(F.ntRooms.slice().sort()),T+" Didn't Do It › Tarih / satırlar = "+n.d+' '+J(n.rooms)+' (beklenen '+B+' '+J(F.ntRooms)+')')});
  await run(T,"Didn't Do It raporu",async()=>{const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')}));const d=(/class="date">([^<]*)/.exec(html)||[])[1]||'';
    ok(d.includes(fmt(B)),T+" Didn't Do It raporu (sekmeden): tarih = \""+d+'" (beklenen '+fmt(B)+')')});
  await run(T,'Kapsam',async()=>{await H.tab(p,'coverage');const c=await p.evaluate(()=>(document.getElementById('bdiNtCov')||{}).textContent||'');const m=/(\d+) \/ (\d+)/.exec(c);
    ok(m&&+m[1]===F.nt,T+" Kapsam › Butler Didn't Do It özeti = \""+c.replace(/\s+aç$/,'')+'" (beklenen '+F.nt+' / …)')});
  await run(T,'In-room Check-in',async()=>{await H.tab(p,'irci');const c=await p.evaluate(()=>({d:(document.querySelector('#bdiIrciPanel input[type=date]')||{}).value,t:(document.querySelector('#bdiIrciPanel .bd-empty')||{}).textContent||'',rows:document.querySelectorAll('#bdiIrciPanel tbody tr').length}));
    ok(c.d===B&&c.rows===0,T+' In-room Check-in › Tarih / satır = '+c.d+' / '+c.rows+' (beklenen '+B+' / 0; 0706 A günündeydi)')});
  await run(T,'Butler Alert',async()=>{await H.tab(p,'alert');const c=await p.evaluate(()=>({d:(document.getElementById('alertDateInput')||{}).value,rooms:[...document.querySelectorAll('#bdiTab_alert table tbody tr')].map(tr=>(tr.children[0]||{}).textContent.trim()).filter(x=>/^\d+$/.test(x))}));
    ok(c.d===B&&J(c.rooms)===J(['1207']),T+' Butler Alert › Alert Date / odalar = '+c.d+' '+J(c.rooms)+' (beklenen '+B+' ["1207"])')});
  await run(T,'Takip',async()=>{await H.tab(p,'fu');const c=await p.evaluate(()=>{const g=k=>[...document.querySelectorAll('#bdiFuPanel .bd-fu-grp.k-'+k+' .bd-fu-room')].map(x=>x.textContent);return {today:g('today'),later:g('later'),from:(document.getElementById('bdiFuFrom')||{}).value,to:(document.getElementById('bdiFuTo')||{}).value}});
    ok(c.today.includes('0704')&&!c.later.includes('0704'),T+' Takip › 0704 takibi "Bugün" grubunda = Bugün '+J(c.today)+' · Yarın ve sonrası '+J(c.later));
    ok(c.to===B&&c.from==='2026-11-02',T+' Takip › Rapor tarih aralığı (varsayılan: son 7 gün) = '+c.from+' – '+c.to+' (beklenen 2026-11-02 – '+B+')')});
  await run(T,'Uyruklar',async()=>{await H.tab(p,'nat');const v=await p.evaluate(()=>(document.getElementById('bdiNatDate')||{}).value);ok(v===B,T+' Uyruklar › Gün = '+v+' (beklenen '+B+')')});
  await run(T,'Plan',async()=>{await H.tab(p,'brief');await p.evaluate(()=>{__ev('_bdiPlanF="all"');__ev('bdiBriefSetMode("plan")')});await p.waitForTimeout(500);
    const c=await p.evaluate(()=>{const o={};document.querySelectorAll('#bdiBriefBody .bd-pl2-g').forEach(g=>{const r=(g.querySelector('.bd-pl2-rm')||{}).textContent;o[r]=[...g.querySelectorAll('.bd-pl2-it,.bd-pl2-inf')].map(x=>x.textContent.replace(/(Can Demir|Nazlı Erten|— butler)/g,'').trim())});return o});
    const kar=Object.keys(c).filter(r=>c[r].some(x=>/Karşıla/.test(x)));
    ok(J(kar)===J(['1207']),T+' Brifing › Plan: "Karşıla" işi olan odalar = '+J(kar)+' (beklenen ["1207"]: '+fmt(B)+' varışı) · plan '+J(c))});
  await run(T,'iPad rehberi paneli',async()=>{await p.evaluate(()=>__ev('bdiBriefSetMode("ipad")'));await p.waitForTimeout(500);const t=await p.evaluate(()=>document.getElementById('bdiBriefBody').textContent);
    ok(/bugünün VAC'ı yüklenmedi/.test(t)&&/bugünün rehberi oluşturulmadı/.test(t),T+' Brifing › iPad rehberi: "bugünün VAC\'ı yüklenmedi" '+/bugünün VAC'ı yüklenmedi/.test(t)+', "bugünün rehberi oluşturulmadı" '+/bugünün rehberi oluşturulmadı/.test(t)+' (ikisi de beklenir: A\'nın VAC\'ı ve rehberi)')});
  await run(T,'Uyarılar penceresi',async()=>{const t=await p.evaluate(()=>{document.getElementById('swWarnBtn').click();const m=document.getElementById('swWarnModal'),x=m?m.textContent:'';if(m)m.style.display='none';return x});
    ok(/0704[^·]*bugün çıkıyor/.test(t)&&!/yarın çıkıyor/.test(t),T+' Uyarılar penceresi: 0704 issue\'su "misafir bugün çıkıyor" = '+/0704[^·]*bugün çıkıyor/.test(t)+', "yarın çıkıyor" yok = '+!/yarın çıkıyor/.test(t))});
  }

// ===== SENARYO 2: gece yarisi, baska bir sekme acik kalmis (tiklamadan ne gorunuyor) =====
async function scenarioMidnightOn(tab){
  const S=await start({time:'21:50',welcome:true});const p=S.p,T='[gece, '+tab+' açık]';
  await at(p,A,'23:40');await H.tab(p,tab);
  if(tab==='brief'){await p.evaluate(()=>{__ev('_bdiPlanF="all"');__ev('bdiBriefSetMode("plan")')});await p.waitForTimeout(500)}
  await midnight(p);
  if(tab==='fu')await run(T,'Takip',async()=>{const c=await p.evaluate(()=>{const g=k=>[...document.querySelectorAll('#bdiFuPanel .bd-fu-grp.k-'+k+' .bd-fu-room')].map(x=>x.textContent);return {today:g('today'),later:g('later')}});
    ok(c.today.includes('0704')&&!c.later.includes('0704'),T+' Takip (açık ekran, tıklamadan): 0704 takibi "Bugün" grubunda = Bugün '+J(c.today)+' · Yarın ve sonrası '+J(c.later))});
  if(tab==='brief')await run(T,'Plan',async()=>{const c=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody .bd-pl2-g')].filter(g=>/Karşıla/.test(g.textContent)).map(g=>(g.querySelector('.bd-pl2-rm')||{}).textContent));
    ok(J(c)===J(['1207']),T+' Brifing › Plan (açık ekran, tıklamadan): "Karşıla" işi olan odalar = '+J(c)+' (beklenen ["1207"])')});
  if(tab==='issues')await run(T,'Issues',async()=>{const c=await p.evaluate(()=>{const a=[...document.querySelectorAll('article.bd-issue')].find(x=>/0704/.test(x.textContent));return a?a.textContent.replace(/\s+/g,' '):''});
    const m=(/(bugün|yarın)[^.·]{0,12}çık/i.exec(c)||[])[0]||'';
    if(!m)skip(T+' Issues kartı: çıkış günü etiketi bulunamadı ('+c.slice(0,160)+')');
    else ok(/bugün/i.test(m),T+' Issues (açık ekran, tıklamadan): 0704 kartında çıkış = "'+m+'" (beklenen "bugün çık…")');
    await H.tab(p,'issues');const c2=await p.evaluate(()=>{const a=[...document.querySelectorAll('article.bd-issue')].find(x=>/0704/.test(x.textContent));return a?a.textContent.replace(/\s+/g,' '):''});const m2=(/(bugün|yarın)[^.·]{0,12}çık/i.exec(c2)||[])[0]||'';
    ok(/bugün/i.test(m2),T+' Issues (sekmeye tıklayınca): 0704 kartında çıkış = "'+m2+'" (beklenen "bugün çık…")')});
  if(tab==='nat')await run(T,'Uyruklar',async()=>{const c=await p.evaluate(()=>{const e=[...document.querySelectorAll('#bdiTab_nat .bd-nat-ev')].find(x=>/Polonya/.test(x.textContent));
      return {d:(document.getElementById('bdiNatDate')||{}).value,soon:e?e.classList.contains('soon'):null,when:e?((e.querySelector('.bd-fd-sub')||{}).textContent||'').split(' · ')[0]:''}});
    ok(c.d===B,T+' Uyruklar (açık ekran, tıklamadan): Gün = '+c.d+' (beklenen '+B+')');
    ok(c.soon===true,T+' Uyruklar (açık ekran, tıklamadan): 11.11 Polonya günü = "'+c.when+'", 3 gün kala işareti '+c.soon+' (beklenen 3 gün sonra, işaretli)')});
  if(tab==='nt')await run(T,"Didn't Do It",async()=>{const d=await p.evaluate(()=>(document.querySelector('#bdiNtPanel input[type=date]')||{}).value);ok(d===B,T+" Didn't Do It (açık ekran, tıklamadan): Tarih = "+d+' (beklenen '+B+')')});
  }

// ===== SENARYO 3: Ayarlar'da islem adi degisir =====
// "Welcome / In-room Check-in" -> "Arrival Greeting" (ayni is, ekip adini degistirdi). Ayrica "Amenity Delivery" once Ayarlar'da
// balonu gizlenmis ve touch tipi "Special Occasion"a baglanmis; adi "Amenity Drop" olur. Ad degisince bu isleme bagli her secim yeni adla surmeli.
async function scenarioAction(){
  const S=await start({time:'14:30'});const p=S.p,T='[işlem adı]';
  await at(p,A,'14:40');await goSettings(p);
  // once: "Amenity Delivery" balonu gizle, touch tipini Special Occasion yap (Ayarlar'daki dugme / secim)
  await p.evaluate(l=>{const b=[...document.querySelectorAll('#bdiChipToggleWrap button')].find(x=>x.textContent.replace('✓','').trim()===l);b.click()},OLDB);
  await p.evaluate(l=>{const s=document.querySelector('#bdiamList select.bdiam-cat[data-l="'+l+'"]');s.value='occasion';s.dispatchEvent(new Event('change',{bubbles:true}))},OLDB);await p.waitForTimeout(200);
  const pre=await p.evaluate(([l,a])=>{const o=id=>{const r={};document.querySelectorAll('#'+id+' label').forEach(x=>{r[x.textContent.trim()]=!!(x.querySelector('input')||{}).checked});return r};
    return {hid:JSON.parse(localStorage.getItem('bdi_chip_hidden')||'[]'),cat:__ev('bdiActionCatOf')(l),irci:o('irciActs')[a],link:o('alertLinkActs')[a]}},[OLDB,OLDA]);
  ok(pre.hid.includes(OLDB)&&pre.cat==='occasion'&&pre.irci===true&&pre.link===true,'[işlem adı] ön koşul: "'+OLDB+'" balonu gizli, touch tipi = '+pre.cat+'; "'+OLDA+'" In-room listesinde '+pre.irci+', alert otomatik tikte '+pre.link);
  // ad degisikligi: sihirbazda "Duzenle" -> ad -> Kaydet
  const rename=async(o,n)=>{await p.evaluate(o=>{const lab=[...document.querySelectorAll('#bdiamList div')].find(d=>d.children.length===0&&d.textContent.trim()===o),row=lab.parentElement.parentElement;[...row.querySelectorAll('button')].find(b=>/Duzenle/.test(b.textContent)).click()},o);
    await p.waitForTimeout(150);await p.fill('#bdiamLabel',n);await p.click('#bdiamForm button.btn-primary');await p.waitForTimeout(250)};
  await p.evaluate(()=>__ev('swSetOpen')(document.getElementById('bdiamList')));await p.waitForTimeout(200);
  await rename(OLDA,NEWA);await rename(OLDB,NEWB);
  const kw=await p.evaluate(()=>__ev('getKW("bdiaction")').map(x=>x.split('|')[0]));ok(kw.includes(NEWA)&&kw.includes(NEWB)&&!kw.includes(OLDA),'[işlem adı] Ayarlar: işlem listesi = '+J(kw));
  // Ayarlar ekranindaki listeler (ayni sayfa)
  await run(T,'Ayarlar listeleri',async()=>{await goSettings(p);const s=await p.evaluate(()=>{const o=id=>{const r={};document.querySelectorAll('#'+id+' label').forEach(l=>{r[l.textContent.trim()]=!!(l.querySelector('input')||{}).checked});return r};
      return {irci:o('irciActs'),link:o('alertLinkActs'),chips:[...document.querySelectorAll('#bdiChipToggleWrap button')].map(b=>b.textContent.trim())}});
    ok(s.irci[NEWA]===true,T+' Ayarlar › In-room check-in listesine düşen işlemler: "'+NEWA+'" işaretli = '+s.irci[NEWA]+' (eski adı işaretliydi)');
    ok(s.link[NEWA]===true,T+' Ayarlar › Butler Alert otomatik tik işlemleri: "'+NEWA+'" işaretli = '+s.link[NEWA]+' (eski adı işaretliydi)');
    ok(s.chips.includes(NEWB)&&!s.chips.includes('✓ '+NEWB),T+' Ayarlar › Hızlı balonlar: "'+NEWB+'" gizli kaldı = '+J(s.chips.filter(c=>/Amenity/.test(c))))});
  await goDidit(p);await H.tab(p,'entry');
  await run(T,'Kayıt işlem listesi',async()=>{const o=await opts(p,'#bdiAction option');ok(o.includes(NEWA)&&o.includes(NEWB)&&!o.includes(OLDA)&&!o.includes(OLDB),T+' Kayıt › İşlem listesi = '+J(o.filter(x=>/Welcome|Arrival|Amenity/.test(x))))});
  await run(T,'Kayıt balonlar',async()=>{const c=await opts(p,'#bdiQuickChips button');ok(c.includes(NEWA)&&!c.includes(OLDA)&&!c.some(x=>/Amenity/.test(x)),T+' Kayıt › hızlı balonlar = '+J(c.filter(x=>/Welcome|Arrival|Amenity/.test(x)))+' (beklenen "'+NEWA+'" var, Amenity gizli)')});
  await run(T,'Kayıt touch tipi',async()=>{const i=await p.evaluate(l=>String(__ev('getBdiActions()').findIndex(a=>a.label===l)),NEWB);await p.selectOption('#bdiAction',i);await p.waitForTimeout(200);
    const tt=await p.evaluate(()=>document.getElementById('bdiTouchType').value);ok(tt==='occasion',T+' Kayıt › "'+NEWB+'" seçilince touch tipi = '+tt+' (beklenen occasion: Ayarlar\'da öyle bağlanmıştı)');await p.selectOption('#bdiAction','')});
  await run(T,'iPad rehberi işlemleri',async()=>{const a=await p.evaluate(d=>__ev('bgdBuild')(d).actions,A);ok(a.includes(NEWA)&&!a.includes(OLDA)&&!a.includes(NEWB),T+' iPad rehberi (oluşturulan): işlem düğmeleri = '+J(a.filter(x=>/Welcome|Arrival|Amenity/.test(x)))+' (beklenen "'+NEWA+'", Amenity gizli)')});
  // 15:10 Kayit'tan yeni adla gercek kayit: 0706 Marchetti (bugun geldi, alert'li)
  await at(p,A,'15:10');await p.selectOption('#bdiButler',CAN);await p.waitForTimeout(150);
  const ai=await p.evaluate(l=>String(__ev('getBdiActions()').findIndex(a=>a.label===l)),NEWA);await p.selectOption('#bdiAction',ai);
  await p.fill('#bdiRoom','0706');await p.click('#bdiAddBtn');await p.waitForTimeout(400);try{await p.evaluate(()=>__ev('bdiReactClose()'))}catch(e){}
  const lg=await p.evaluate(d=>__ev('loadBdiArrayForDate')(d).filter(l=>l.room==='0706').map(l=>l.action+' / '+l.guest),A);ok(lg.length===1&&lg[0].startsWith(NEWA),'[işlem adı] Kayıt: 0706 kaydı = '+J(lg));
  await run(T,'In-room Check-in',async()=>{await H.tab(p,'irci');const r=await p.evaluate(()=>[...document.querySelectorAll('#bdiIrciPanel tbody tr')].map(tr=>tr.textContent.replace(/\s+/g,' ').trim()));
    ok(r.some(x=>/0706/.test(x)),T+' In-room Check-in: 0706 "'+NEWA+'" satırı = '+J(r)+' (beklenen 0706 Marchetti)')});
  await run(T,'In-room rozet',async()=>{const b=await p.evaluate(()=>document.getElementById('bdiIrciTabCount').textContent);ok(b==='1',T+' Sekme rozeti In-room Check-in = '+J(b)+' (beklenen "1")')});
  await run(T,'Butler Alert',async()=>{await H.tab(p,'alert');await p.evaluate(()=>__ev('setAlertFilter("all")'));await p.waitForTimeout(200);
    const a=await p.evaluate(()=>{const tr=[...document.querySelectorAll('#bdiTab_alert table tbody tr')].find(t=>(t.children[0]||{}).textContent.trim()==='706');return tr?{done:!!tr.querySelector('button[title="Sıfırla"]'),t:tr.textContent.replace(/\s+/g,' ').trim().slice(0,60)}:null});
    ok(a&&a.done,T+' Butler Alert: 0706 satırı "'+NEWA+'" girilince ✅ = '+J(a)+' (eski adla girilince kendiliğinden ✅ oluyordu)')});
  await run(T,'Plan',async()=>{await H.tab(p,'brief');await p.evaluate(()=>{__ev('_bdiPlanF="all"');__ev('bdiBriefSetMode("plan")')});await p.waitForTimeout(500);
    const c=await p.evaluate(()=>{const g=[...document.querySelectorAll('#bdiBriefBody .bd-pl2-g')].find(g=>(g.querySelector('.bd-pl2-rm')||{}).textContent==='0706');if(!g)return null;const it=[...g.querySelectorAll('.bd-pl2-it')].find(x=>/Karşıla/.test(x.textContent));return it?{dn:it.classList.contains('dn'),t:it.textContent.replace(/\s+/g,' ').slice(0,80)}:null});
    ok(c&&c.dn,T+' Brifing › Plan: 0706 "Karşıla" işi '+NEWA+' girilince bitti = '+J(c))});
  }

// ===== SENARYO 4: tercih kategorisi baska departmana tasinir (Pillow: HSK -> BUT) =====
async function scenarioPrefDept(){
  const S=await start({time:'14:30'});const p=S.p,T='[tercih departmanı]';
  const readAll=async tag=>{const o={};
    await run(tag,'Atölye',async()=>{await H.tab(p,'atelier');await p.evaluate(()=>{__ev('_bdiAtMode="out"');__ev('renderBdiAtelier()')});await p.waitForTimeout(700);
      o.at=await p.evaluate(()=>{const g=[...document.querySelectorAll('#bdiAtBody .bd-pl-g')].find(x=>/0702/.test(x.textContent));return g?[...g.querySelectorAll('.bd-pl-row')].filter(r=>/pillow/i.test(r.textContent)).map(r=>(r.querySelector('.bd-pl-b')||{}).textContent):null})});
    await run(tag,'Departman',async()=>{await H.tab(p,'dept');await p.evaluate(()=>__ev('bdiDeptSetMode("prefs")'));await p.waitForTimeout(500);
      o.dept=await p.evaluate(()=>{const r=[];let h='';[...document.querySelectorAll('#bdiDeptBody h3, #bdiDeptBody li')].forEach(e=>{if(e.tagName==='H3')h=e.textContent.trim();else if(/firm pillow/i.test(e.textContent))r.push(h)});return r})});
    await run(tag,'Protel notları penceresi',async()=>{await H.tab(p,'atelier');await p.evaluate(()=>{__ev('_bdiAtMode="out"');__ev('renderBdiAtelier()')});await p.waitForTimeout(600);
      o.card=await p.evaluate(async()=>{const g=[...document.querySelectorAll('#bdiAtBody .bd-pl-g')].find(x=>/0702/.test(x.textContent)),b=g&&[...g.querySelectorAll('button')].find(x=>/notları aç/.test(x.textContent));if(!b)return 'bulunamadı: düğme yok';b.click();await new Promise(r=>setTimeout(r,300));
      const m=document.getElementById('bdiProtelModal'),t=m?[...m.querySelectorAll('textarea,pre')].map(x=>x.value||x.textContent).join('\n')+'\n'+m.textContent:'';if(m)m.classList.remove('on');
      const k=(/\*\*\*([A-Z&]+) Preferences\*\*\*\s*1- [^\n]*pillow/i.exec(t)||[])[1]||'';return k||('bulunamadı: '+t.slice(0,160))})});
    await run(tag,'iPad rehberi',async()=>{o.ipad=await p.evaluate(d=>{const b=__ev('bgdBuild')(d),g=(b.guests||[]).find(x=>/Fairbanks/i.test(x.name||''));if(!g)return null;const s=JSON.stringify(g),m=/"t":"[^"]*pillow[^"]*","d":"([^"]+)"/i.exec(s)||/"d":"([^"]+)","t":"[^"]*pillow/i.exec(s);return m?m[1]:'(departmansız: '+(s.match(/[^{}]*pillow[^{}]*/i)||[''])[0].slice(0,100)+')'},A)});
    return o};
  const o0=await readAll('[tercih önce]');console.log('  önce: '+J(o0));
  ok(J(o0.at)===J(['HSK']),'[tercih departmanı] ön koşul: Atölye › Protel notları 0702 pillow satırı = '+J(o0.at));
  // Ayarlar > Guest Preference alani: Pillow satirinin departmani BUT
  await at(p,A,'14:45');await goSettings(p);await p.evaluate(()=>__ev('swSetOpen')(document.getElementById('bdiCfg_pref')));await p.waitForTimeout(200);
  const sel=await p.evaluate(()=>{const r=[...document.querySelectorAll('#bdiCfg_pref .bdicfg-r')].find(x=>(x.querySelector('input[data-f="l"]')||{}).value==='Pillow');const s=r&&r.querySelector('select[data-f="d"]');if(!s)return null;s.setAttribute('data-test-pillow','1');return [...s.options].map(o=>o.value)});
  await p.selectOption('#bdiCfg_pref select[data-test-pillow]','BUT');await p.waitForTimeout(300);
  const cfg=await p.evaluate(()=>__ev('bdiPrefDept')('Pillow'));ok(cfg==='BUT','[tercih departmanı] Ayarlar: Pillow departmanı = '+cfg+' (seçenekler '+J(sel)+')');
  await goDidit(p);
  const o1=await readAll(T);console.log('  sonra: '+J(o1));
  ok(J(o1.at)===J(['BUT']),T+' Atölye › Protel notları: 0702 pillow satırının departmanı = '+J(o1.at)+' (beklenen ["BUT"])');
  ok(o1.dept&&o1.dept.length&&o1.dept.every(x=>x==='BUT'),T+' Departman › Tercihler: pillow hangi departman başlığında = '+J(o1.dept)+' (beklenen BUT)');
  if(o1.card&&!/^bulunamadı/.test(o1.card))ok(o1.card==='BUT',T+' Atölye › "notları aç / kopyala" penceresi: pillow satırının bloğu = ***'+o1.card+' Preferences*** (beklenen BUT)');else skip(T+' Protel notları penceresi okunamadı: '+o1.card);
  if(o1.ipad&&!/departmansız/.test(o1.ipad))ok(o1.ipad==='BUT',T+' iPad rehberi (oluşturulan): 0702 pillow maddesinin departmanı = '+o1.ipad+' (beklenen BUT)');else skip(T+' iPad rehberi: pillow maddesinde departman yok '+J(o1.ipad));
  }

// ===== SENARYO 5: Didn't Do It sebebi eklenir ("Guest asleep") ve kullanilan bir sebep silinir ("Late arrival", 1203'te secili) =====
async function scenarioReasons(){
  const S=await start({time:'14:30'});const p=S.p,T="[Didn't Do It sebepleri]";
  await at(p,A,'14:45');await goSettings(p);await p.evaluate(()=>__ev('swSetOpen')(document.getElementById('bdiCfg_nt')));await p.waitForTimeout(200);
  await p.fill('#bdiCfg_nt .bdicfg-new input[data-new="l"]','Guest asleep');await p.press('#bdiCfg_nt .bdicfg-new input[data-new="l"]','Enter');await p.waitForTimeout(200);
  await p.evaluate(()=>{const r=[...document.querySelectorAll('#bdiCfg_nt .bdicfg-r:not(.bdicfg-new)')].find(x=>(x.querySelector('input[data-f="l"]')||{}).value==='Late arrival');[...r.querySelectorAll('button')].find(b=>b.textContent==='Sil').click()});await p.waitForTimeout(200);
  const L=await p.evaluate(()=>__ev('bdiCfg')('bdi_nt_reasons').map(r=>r.l));ok(L.includes('Guest asleep')&&!L.includes('Late arrival'),T+' Ayarlar: sebep listesi = '+J(L));
  await goDidit(p);await H.tab(p,'nt');await p.evaluate(d=>__ev('bdiNtDateSet')(d),A);await p.waitForTimeout(300);
  await run(T,'satır seçimi',async()=>{const c=await p.evaluate(()=>{const row=r=>document.querySelector('#bdiNtPanel tr:has(td.r)')&&[...document.querySelectorAll('#bdiNtPanel table.bd-nt-tab tbody tr')].find(t=>(t.querySelector('td.r')||{}).textContent===r);
      const s=r=>{const x=row(r)&&row(r).querySelector('select[data-f="r"]');return x?{v:x.value,txt:x.selectedIndex>=0?x.options[x.selectedIndex].text:'',o:[...x.options].map(o=>o.text)}:null};return {a:s('0704'),b:s('1203')}});
    ok(c.a&&c.a.o.includes('Guest asleep')&&!c.a.o.includes('Late arrival'),T+" Didn't Do It › 0704 sebep seçimi = "+J(c.a&&c.a.o)+' (beklenen "Guest asleep" var, "Late arrival" yok)');
    ok(c.b&&c.b.txt==='Late arrival',T+" Didn't Do It › 1203'ün kayıtlı sebebi (silinen) hâlâ görünüyor = "+J(c.b&&c.b.txt)+' (beklenen "Late arrival"; kayıt silinmedi)')});
  await run(T,'toplu sebep',async()=>{const q=await opts(p,'#bdiNtPanel .bd-nt-quick .bd-chip');ok(q.includes('Guest asleep')&&!q.includes('Late arrival'),T+" Didn't Do It › Toplu sebep düğmeleri = "+J(q))});
  await run(T,'İşaretlilere',async()=>{await p.selectOption('#bdiNtBulkF','reason');await p.waitForTimeout(150);const q=await opts(p,'#bdiNtBulkV option');ok(q.includes('Guest asleep')&&!q.includes('Late arrival'),T+" Didn't Do It › İşaretlilere: sebep listesi = "+J(q))});
  await run(T,'açıklama',async()=>{const t=await p.evaluate(()=>(document.querySelector('#bdiNtPanel .bd-nt-leg')||{}).textContent||'');ok(/Guest asleep/.test(t)&&!/Late arrival:/.test(t),T+" Didn't Do It › alttaki sebep açıklamaları: \"Guest asleep\" "+/Guest asleep/.test(t)+', "Late arrival:" yok '+!/Late arrival:/.test(t))});
  await run(T,'rapor',async()=>{const html=await p.evaluate(()=>window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')}));const R2=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return {cats:(d.querySelector('.cats')||{}).textContent||'',rows:[...d.querySelectorAll('table.gtab tbody tr:not(.gh)')].map(r=>r.textContent)}},html);
    ok(/Late arrival/.test(R2.rows.join('|')),T+" Didn't Do It raporu: 1203'ün sebebi \"Late arrival\" raporda = "+/Late arrival/.test(R2.rows.join('|'))+' · '+R2.cats.replace(/\s+/g,' ').trim())});
  await run(T,'Günün akışı',async()=>{await H.tab(p,'brief');await p.evaluate(()=>{__ev('_bdiFeedGrp').nt=1;__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(500);
    const o=await p.evaluate(()=>{const tr=[...document.querySelectorAll('#bdiBriefBody tr')].find(t=>(t.querySelector('td.r')||{}).textContent==='0704'),s=tr&&tr.querySelector('select[data-f="r"]');return s?[...s.options].map(o=>o.text):null});
    if(!o)skip(T+' Brifing › Günün akışı: sebep seçimi bulunamadı');else ok(o.includes('Guest asleep')&&!o.includes('Late arrival'),T+' Brifing › Günün akışı: sebep seçimi = '+J(o))});
  }

// ===== SENARYO 6: Ayarlar'a butler eklenir (Selin Kaya), biri silinir (Nazli Erten; bugun Kat 12+ onda) =====
async function scenarioButlers(){
  const S=await start({time:'14:30'});const p=S.p,T='[butler listesi]';
  await at(p,A,'14:45');await goSettings(p);await p.evaluate(()=>__ev('swSetOpen')(document.getElementById('kwButlerNew')));await p.waitForTimeout(200);
  await p.fill('#kwButlerNew',SEL);await p.press('#kwButlerNew','Enter');await p.waitForTimeout(200);
  await p.evaluate(n=>{const t=[...document.querySelectorAll('#kwButlerTags .kw-tag')].find(x=>x.textContent.includes(n));t.querySelector('button').click()},NAZ);await p.waitForTimeout(200);
  const kl=await p.evaluate(()=>__ev('getKW("butler")'));ok(J(kl)===J([CAN,SEL]),T+' Ayarlar: butler listesi = '+J(kl));
  await goDidit(p);await H.tab(p,'entry');
  const has=(o,b)=>o.includes(b);
  await run(T,'Kayıt butler',async()=>{const o=await opts(p,'#bdiButler option');ok(has(o,SEL)&&!has(o,NAZ),T+' Kayıt › Butler seçimi = '+J(o))});
  await run(T,'Manuel butler',async()=>{const o=await opts(p,'#bdiManButler option');ok(has(o,SEL)&&!has(o,NAZ),T+' Kayıt › Manuel giriş butler seçimi = '+J(o))});
  await run(T,'Kat dağılımı',async()=>{const r=await p.evaluate(()=>[...document.querySelectorAll('#bdiFloorPanel .bd-fa-row select')].map(s=>({v:s.value,o:[...s.options].map(o=>o.text)})));
    ok(r.length===2&&r.every(x=>x.o.includes('Selin Kaya')),T+' Kayıt › Kat dağılımı: blok seçimlerinde Selin Kaya = '+J(r.map(x=>x.o)));
    ok(r[1]&&r[1].v===NAZ,T+' Kayıt › Kat dağılımı: Kat 12+ kayıtlı sahibi hâlâ görünüyor = '+J(r[1]&&r[1].v)+' (beklenen Nazlı Erten; bugünün dağılımı değişmedi)')});
  await run(T,'Didn\'t Do It who',async()=>{await H.tab(p,'nt');await p.evaluate(d=>__ev('bdiNtDateSet')(d),A);await p.waitForTimeout(300);
    const o=await p.evaluate(()=>{const s=document.querySelector('#bdiNtPanel select[data-f="f:who"]');return s?[...s.options].map(o=>o.text):null});
    ok(o&&has(o,SEL)&&!has(o,NAZ),T+" Didn't Do It › Who will see = "+J(o)+' (beklenen Selin var, Nazlı yok; "— (kat: …)" kat sahibi)')});
  await run(T,'Plan',async()=>{await H.tab(p,'brief');await p.evaluate(()=>{__ev('_bdiPlanF="all"');__ev('bdiBriefSetMode("plan")')});await p.waitForTimeout(500);
    const o=await p.evaluate(()=>{const s=document.querySelector('#bdiBriefBody .bd-pl2-own select');return s?[...s.options].map(o=>o.text):null});
    ok(o&&has(o,SEL)&&!has(o,NAZ),T+' Brifing › Plan: "Kime" seçimi = '+J(o))});
  await run(T,'Butler Alert',async()=>{await H.tab(p,'alert');const o=await p.evaluate(()=>{const s=[...document.querySelectorAll('#bdiTab_alert table tbody tr select')].find(x=>x.options[0]&&x.options[0].text==='Butler');return s?[...s.options].map(o=>o.text):null});
    ok(o&&has(o,SEL)&&!has(o,NAZ),T+' Butler Alert › gidildi butler seçimi = '+J(o))});
  await run(T,'Issues',async()=>{await H.tab(p,'issues');await p.evaluate(()=>{const a=[...document.querySelectorAll('article.bd-issue')].find(x=>/0704/.test(x.textContent));if(a&&!a.querySelector('select[id^="bdiIsB_"]'))a.querySelector('.bd-issue-top').click()});await p.waitForTimeout(300);
    const o=await p.evaluate(()=>{const s=document.querySelector('#bdiIssuePanel select[id^="bdiIsB_"], select[id^="bdiIsB_"]');return s?[...s.options].map(o=>o.text):null});
    ok(o&&has(o,SEL)&&!has(o,NAZ),T+' Issues › 0704 kartı butler seçimi = '+J(o))});
  await run(T,'iPad rehberi',async()=>{const b=await p.evaluate(d=>__ev('bgdBuild')(d).butlers,A);ok(has(b,SEL)&&!has(b,NAZ),T+' iPad rehberi (oluşturulan): butler seçim listesi = '+J(b))});
  await run(T,'Kat turu',async()=>{await H.tab(p,'brief');await p.evaluate(()=>{__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(400);
    const o=await p.evaluate(()=>[...document.querySelectorAll('#bdiBriefBody .bd-fd-sel button')].map(b=>(b.firstChild||{}).textContent.trim()));
    ok(has(o,NAZ),T+' Brifing › Günün akışı (kat turu): butler düğmeleri = '+J(o)+' (beklenen Nazlı Erten kalır: bugünün Kat 12+ sahibi)')});
  }

(async()=>{
  const steps=[['gece',scenarioMidnight],['gece/fu',()=>scenarioMidnightOn('fu')],['gece/brief',()=>scenarioMidnightOn('brief')],['gece/issues',()=>scenarioMidnightOn('issues')],['gece/nt',()=>scenarioMidnightOn('nt')],['gece/nat',()=>scenarioMidnightOn('nat')],
    ['işlem adı',scenarioAction],['tercih departmanı',scenarioPrefDept],["Didn't Do It sebepleri",scenarioReasons],['butler listesi',scenarioButlers]];
  const only=(process.env.ONLY||'').split(',').filter(Boolean); // gelistirirken: ONLY='işlem adı' node consistency-day.js
  for(const [n,f] of steps){if(only.length&&!only.includes(n))continue;console.log('== '+n);try{await f()}catch(e){ok(false,n+' senaryosu çöktü: '+String(e.message||e).split('\n')[0])}
    if(CUR){errsAll.push(...CUR.errs.map(x=>n+': '+x));try{await CUR.br.close()}catch(e){}CUR=null}}
  ok(errsAll.length===0,'JS hatası yok '+J(errsAll));
  console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0);
})();
