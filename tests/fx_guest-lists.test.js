// 2026-11-06 QA guest-lists (C1 C2 E1 E2 E3 E4 G6): takip/issue misafiri kimlikle izler (benzer ada ziplamaz, Atolye birlestirmesiyle izler);
// "Listeden cikar" ile cikarilan misafir o konaklama boyunca her gorunumden duser (rapor, Excel, oda gorunumu, uzayan konaklama); kat turunda girilemedi geri al
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const DIR=process.argv[2]||'t2';
const FILE='file://'+__dirname+'/'+DIR+'/SmartWorker3.html';
const Rw=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
async function open(br,at,today,butlers){
  const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000}});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.accept());
  await p.clock.install({time:new Date(at)});await p.goto(FILE);
  await p.evaluate(([t,b])=>{localStorage.clear();localStorage.setItem('sw_setup_snooze',t);localStorage.setItem('sw_dayfix',t);localStorage.setItem('kw_butler',JSON.stringify(b));localStorage.setItem('bdi_me',b[0])},[today,butlers]);
  await p.reload();await p.waitForTimeout(1300);return {ctx,p};
}
const kvSet=(p,o)=>p.evaluate(async o=>{const KV=__ev('BdiKV');await KV.ready();for(const k in o)await KV.set(k,JSON.stringify(o[k]))},o);
const refresh=p=>p.evaluate(async()=>{__ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('_bdiGMProf=null');await __ev('bdiGMIngest')()});
const gih=async(p,rows)=>{await kvSet(p,{bdi_gih_v1:{day:'2026-11-06',at:Date.now(),file:'g.pdf',rows}});await refresh(p)};
const LG=(id,time,room,guest,s)=>({id,ts:Date.parse('2026-11-05T'+time+':00+03:00'),time,butler:'Can Demir',room,guest,action:'Touch Call',touchCategory:'Service',sentence:s,note:''});
const where=p=>p.evaluate(()=>{const f={},i={};__ev('bdiFuList')().forEach(x=>f[x.guest]=x.room);__ev('bdiGetIssues')().forEach(x=>i[x.guest]=x.room);return {f,i}});

// Didn't Do It tabani (z2_ntout ile ayni): 0805 dokunuldu; 0901, 1808, 1501 (fotograf cekimi), 1203 (valued guest) dokunulmadi
const BASE=()=>[Rw('0805','Hollinsby,Kirsten,Mrs.','2026-10-30','2026-11-05'),Rw('0901','Brodan,Kresimir,Mr.','2026-10-31','2026-11-06'),
  Rw('1808','De Gramont,Armand Daniel,Mr.','2026-10-25','2026-11-08'),Rw('1501','Shooting,Photo','2026-11-01','2026-11-05'),Rw('1203','Guest,Valued,Mr.','2026-10-31','2026-11-07')];
async function nt(br,o){o=o||{};const {ctx,p}=await open(br,'2026-11-02T19:00:00+03:00','2026-11-02',['Beyza Nur Çırak','Zafer Karagaçtı']);
  await p.evaluate(async({rows,dep})=>{const KV=__ev('BdiKV');await KV.ready();
    KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-02',at:Date.now(),file:'gih.pdf',rows}));
    KV.set('bdi_dep_v1',JSON.stringify({days:dep?{'2026-11-05':{at:Date.now(),file:'dep.pdf',rows:dep}}:{}}));
    KV.set('bdi_2026-11-02',JSON.stringify([{id:'a3',butler:'Beyza Nur Çırak',room:'0805',guest:'Kirsten Hollinsby',action:'Turndown',touchCategory:'Service',patternType:'service',note:'',time:'10:00',sentence:'x',ts:new Date('2026-11-02T10:00:00+03:00').getTime(),countsAsTouch:true}]));
    __ev('_bdiGih=null');__ev('_bdiDepAll=null');
    __ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-02';__ev('bdiFloorSetCount(2)');__ev('bdiFloorAssign(0,"Beyza Nur Çırak")');__ev('bdiFloorAssign(1,"Zafer Karagaçtı")');__ev('loadBdiLogs()');__ev('switchBdiTab("nt")')},{rows:o.rows||BASE(),dep:o.dep||null});
  await p.waitForTimeout(300);return {ctx,p};
}
const removeBy=async(p,names)=>{const gks=await p.evaluate(n=>n.map(x=>__ev('bdiGuestKey')(x)),names);for(const g of gks)await p.check(`#bdiNtPanel input.bd-nt-chk[data-g="${g}"]`);await p.click('#bdiNtPanel button:has-text("Listeden çıkar")');await p.waitForTimeout(250)};
const setGih=(p,day,rows)=>p.evaluate(([day,rows])=>{__ev('BdiKV').set('bdi_gih_v1',JSON.stringify({day,at:Date.now(),file:'g_'+day+'.pdf',rows}));__ev('_bdiGih=null');__ev('bdiDayHistReset()')},[day,rows]);

(async()=>{const br=await chromium.launch();const errs=[];
 const run=async(name,fn)=>{try{await fn()}catch(e){ok(false,name+' senaryo çöktü: '+e.message.split('\n')[0])}};

 // (1) C1: benzer ad (Sami/Samir, Ali/Alp) baska odada: takip ve issue ziplamaz; ayni kisi tasininca izler
 await run('C1',async()=>{const {ctx,p}=await open(br,'2026-11-06T14:00:00+03:00','2026-11-06',['Can Demir']);
   await kvSet(p,{'bdi_2026-11-05':[LG('a1','10:00','1406','Sami Ahmed','Guest asked for extra towels'),LG('a2','11:00','1410','Ali Yilmaz','Guest asked for late checkout')]});
   await gih(p,[Rw('1406','Ahmed,Sami,Mr.','2026-11-04','2026-11-09'),Rw('1410','Yilmaz,Ali,Mr.','2026-11-04','2026-11-09')]);
   await p.evaluate(()=>{const now=Date.now();
     __ev('bdiFuAdd')({room:'1406',guest:'Sami Ahmed',t:'Havlu teyit et',due:now+3*3600e3});
     __ev('bdiFuAdd')({room:'1410',guest:'Ali Yilmaz',t:'Geç çıkış teyit',due:now+3*3600e3});
     const I=(id,room,guest,c)=>({id,room,guest,concern:c,createdAt:now-3600e3,u:1,events:[{id:id+'e',ts:now-3600e3,type:'import'}]});
     __ev('bdiSaveIssues')([I('iS','1406','Sami Ahmed','Towels missing'),I('iA','1410','Ali Yilmaz','Late checkout not confirmed')])});
   // Sami ve Ali cikti; yeni raporda yalniz Samir 1500 ve Alp 1600
   await gih(p,[Rw('1500','Ahmed,Samir,Mr.','2026-11-06','2026-11-09'),Rw('1600','Yilmaz,Alp,Mr.','2026-11-06','2026-11-09')]);
   let W=await where(p);
   ok(W.f['Sami Ahmed']==='1406'&&W.f['Ali Yilmaz']==='1410','C1 takipler eski odada kalır, benzer adlı başka misafire (Samir 1500, Alp 1600) geçmez: '+JSON.stringify(W.f));
   ok(W.i['Sami Ahmed']==='1406'&&W.i['Ali Yilmaz']==='1410','C1 issue\'lar eski odada kalır: '+JSON.stringify(W.i));
   // kontrol: ayni kisi (Ahmed,Sami) 1500'e tasindi
   await gih(p,[Rw('1500','Ahmed,Sami,Mr.','2026-11-04','2026-11-09'),Rw('1600','Yilmaz,Alp,Mr.','2026-11-06','2026-11-09')]);
   W=await where(p);
   ok(W.f['Sami Ahmed']==='1500'&&W.i['Sami Ahmed']==='1500'&&W.f['Ali Yilmaz']==='1410'&&W.i['Ali Yilmaz']==='1410','C1 kontrol: aynı misafir 1500\'e taşınınca takip ve issue izler, Ali yerinde kalır: fu '+JSON.stringify(W.f)+' iss '+JSON.stringify(W.i));
   errs.push(...p.errs);await ctx.close()});

 // (2) C2: yazim farki (Anna Meier / Meyer,Anna): Atolye'de birlestirilene kadar takip ve profil ayni oda (1406), birlestirince ikisi de 2104
 await run('C2',async()=>{const {ctx,p}=await open(br,'2026-11-06T14:00:00+03:00','2026-11-06',['Can Demir']);
   await kvSet(p,{'bdi_2026-11-05':[LG('b1','10:00','1406','Anna Meier','Guest enjoyed the amenity')]});
   await gih(p,[Rw('1406','Meyer,Anna,Mrs.','2026-11-03','2026-11-09')]);
   await p.evaluate(()=>__ev('bdiFuAdd')({room:'1406',guest:'Anna Meier',t:'Su teyit',due:Date.now()+3*3600e3}));
   await gih(p,[Rw('2104','Meyer,Anna,Mrs.','2026-11-03','2026-11-09')]);
   const S=()=>p.evaluate(()=>{__ev('_bdiGMProf=null');const P=__ev('bdiGMProfileByName')('Anna Meier');const f=__ev('bdiFuList')().find(x=>x.guest==='Anna Meier');return {fu:f&&f.room,pr:P&&P.room}});
   let A=await S();
   ok(A.fu==='1406'&&A.pr==='1406','C2 birleştirmeden önce takip ve profil aynı oda (1406): '+JSON.stringify(A));
   const al=await p.evaluate(async()=>{const G=__ev('bdiGMGid'),K=__ev('bdiGuestKey');await __ev('bdiGMMerge')([G(K('Anna Meier'))],G(K('Anna Meyer')));return G(K('Anna Meier'))});
   await refresh(p);A=await S();
   ok(al==='g_anna meyer'&&A.fu==='2104'&&A.pr==='2104','C2 Atölye birleştirmesinden sonra ikisi de 2104: '+al+' '+JSON.stringify(A));
   errs.push(...p.errs);await ctx.close()});

 // (3) E1: cikarilan 1501 donem raporunda "Checked Out Without a Touch" ve Excel'de yok; cikarilmayan 1702 kalir
 await run('E1',async()=>{const dep=[{room:'1501',name:'Shooting,Photo',arr:'2026-11-01',dep:'2026-11-05',st:'CKOT',time:'11:00'},{room:'1702',name:'Other,Guest,Mr.',arr:'2026-11-01',dep:'2026-11-05',st:'CKOT',time:'10:00'}];
   const {ctx,p}=await nt(br,{dep});
   const E=()=>p.evaluate(()=>{__ev('bdiNtDateSet')('2026-11-05');let h='',wb=null;const o=XLSX.writeFile;XLSX.writeFile=w=>{wb=w};
     try{h=window.__t.capture(function(){return __ev('downloadDidntDoIt(true)')});__ev('downloadDidntDoItXlsx(true)')}finally{XLSX.writeFile=o;__ev('bdiNtDateSet')('2026-11-02')}
     const d=new DOMParser().parseFromString(h,'text/html');const s=[...d.querySelectorAll('.isec')].find(x=>/Checked Out Without/.test(x.textContent));
     const it=[...d.querySelectorAll('.summary .item')].find(x=>/Checked Out Untouched/.test(x.textContent));
     const sh=wb&&wb.Sheets['Checked out untouched'];
     return {sec:s?s.textContent.replace(/\s+/g,' '):'',n:it?parseInt(it.querySelector('.num').textContent,10):-1,xl:sh?XLSX.utils.sheet_to_json(sh).map(r=>r.Guest).join(';'):'',
       left:__ev('bdiDidntData')('2026-11-02','2026-11-05').left.map(r=>r.room).sort().join(',')}});
   const B=await E();
   ok(/1501/.test(B.sec)&&/1702/.test(B.sec)&&B.left==='1501,1702'&&B.n===2&&/Photo Shooting/.test(B.xl),'E1 kontrol (çıkarılmadan): 1501 ve 1702 "Checked Out Without a Touch"ta, sayı 2: '+B.left+' n='+B.n+' xl='+B.xl);
   await removeBy(p,['Photo Shooting']);
   const A=await E();
   ok(!/1501|Photo Shooting/.test(A.sec)&&/1702/.test(A.sec),'E1 çıkarılan 1501 raporun "Checked Out Without a Touch" bölümünde yok, 1702 var: "'+A.sec.slice(0,160)+'"');
   ok(A.left==='1702'&&A.n===B.n-1,'E1 bdiDidntData.left yalnız 1702, özet sayısı 1 düştü: '+A.left+' n='+A.n);
   ok(!/Photo Shooting/.test(A.xl)&&/Other|Guest/.test(A.xl),'E1 Excel "Checked out untouched" sayfasında Photo Shooting yok: '+A.xl);
   errs.push(...p.errs);await ctx.close()});

 // (4) E2: oda gorunumunde cikarilan odalar "listeden çıkarıldı", tiklanmaz, "dokunuldu" sayilmaz
 await run('E2',async()=>{const {ctx,p}=await nt(br);await removeBy(p,['Photo Shooting','Valued Guest']);
   const G=await p.evaluate(()=>{const h=__ev('bdiRoomGridHtml')('2026-11-02','nt');const d=new DOMParser().parseFromString(h,'text/html');
     const t=r=>{const e=[...d.querySelectorAll('.bd-rg-t')].find(x=>x.querySelector('b')&&x.querySelector('b').textContent===r);return e?{tag:e.tagName,cls:e.className,sub:(e.querySelector('i')||{}).textContent}:null};
     return {s:((d.querySelector('summary')||{}).textContent||'').replace(/\s+/g,' '),a:t('1501'),b:t('1203'),c:t('0805'),x:t('0901')}});
   const gone=t=>t&&t.sub==='listeden çıkarıldı'&&t.tag==='SPAN'&&!/\b(ok|bad|wn|pt)\b/.test(t.cls);
   ok(gone(G.a)&&gone(G.b),'E2 çıkarılan 1501 ve 1203: "listeden çıkarıldı", düğme değil, renksiz: '+JSON.stringify([G.a,G.b]));
   ok(G.c&&G.c.sub==='dokunuldu'&&G.x&&G.x.tag==='BUTTON'&&/\bbad\b/.test(G.x.cls),'E2 0805 dokunuldu, 0901 kırmızı düğme: '+JSON.stringify([G.c,G.x]));
   ok(/2 odada konaklamasında hiç dokunulmamış misafir · 1 oda dokunuldu/.test(G.s),'E2 özet yalnız 0805\'i dokunuldu sayar: "'+G.s+'"');
   errs.push(...p.errs);await ctx.close()});

 // (5) E4: konaklama uzadi (ayni varis, cikis 11-05 -> 11-08): 11-06'da gizli ve "Listeden çıkarılanlar"da; yeni varis 11-07 gorunur
 await run('E4',async()=>{const {ctx,p}=await nt(br);await removeBy(p,['Photo Shooting']);
   await setGih(p,'2026-11-06',[Rw('1501','Shooting,Photo','2026-11-01','2026-11-08'),Rw('1808','De Gramont,Armand Daniel,Mr.','2026-10-25','2026-11-08')]);
   const N=await p.evaluate(()=>{const L=__ev('bdiNtList')('2026-11-06');__ev('bdiNtDateSet')('2026-11-06');const o=document.querySelector('#bdiNtPanel .bd-nt-out');
     return {rows:L.rows.map(g=>g.rooms[0]).join(','),out:o?o.textContent.replace(/\s+/g,' '):''}});
   ok(N.rows==='1808','E4 11-06 (çıkış 11-08\'e uzadı): 1501 listede yok: '+N.rows);
   ok(/Listeden çıkarılanlar \(1\)/.test(N.out)&&/1501 Photo Shooting/.test(N.out)&&/geri al/.test(N.out),'E4 panelde "Listeden çıkarılanlar" 1501\'i geri al ile gösterir: "'+N.out+'"');
   await setGih(p,'2026-11-07',[Rw('1501','Shooting,Photo','2026-11-07','2026-11-09')]);
   const M=await p.evaluate(()=>{const L=__ev('bdiNtList')('2026-11-07');__ev('bdiNtDateSet')('2026-11-07');const o=document.querySelector('#bdiNtPanel .bd-nt-out');return {rows:L.rows.map(g=>g.rooms[0]).join(','),out:o?o.textContent:''}});
   ok(M.rows==='1501'&&!M.out,'E4 aynı ad, yeni varış 11-07: listede görünür, çıkarılanlarda yok: '+JSON.stringify(M));
   errs.push(...p.errs);await ctx.close()});

 // (6) E3: cikis tarihi bos satir: 11-02'de cikarilan misafir 12-04'te (ayni varis, hala otelde) gizli
 await run('E3',async()=>{const rows=BASE().map(r=>r.room==='1203'?Rw('1203','Guest,Valued,Mr.','2026-10-31',''):r);
   const {ctx,p}=await nt(br,{rows});await removeBy(p,['Valued Guest']);
   await setGih(p,'2026-12-04',[Rw('1203','Guest,Valued,Mr.','2026-10-31',''),Rw('1808','De Gramont,Armand Daniel,Mr.','2026-12-01','2026-12-08')]);
   const N=await p.evaluate(()=>{const L=__ev('bdiNtList')('2026-12-04');return L?L.rows.map(g=>g.rooms[0]).join(','):'(liste yok)'});
   ok(N==='1808','E3 çıkış tarihi boş, 12-04\'te hâlâ otelde: çıkarılan 1203 gizli, 1808 görünür: '+N);
   errs.push(...p.errs);await ctx.close()});

 // (7) G6: Kat turu kartinda "girilemedi" yanlislikla isaretlendiyse geri al
 await run('G6',async()=>{const {ctx,p}=await open(br,'2026-11-06T11:00:00+03:00','2026-11-06',['Deniz Karavus']);
   await p.evaluate(async rows=>{const KV=__ev('BdiKV');await KV.ready();KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-06',at:Date.now(),file:'g.pdf',rows}));
     __ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()');KV.set('bdi_floors_v1',JSON.stringify({'2026-11-06':{blocks:[{from:12,to:20,butler:'Deniz Karavus'}],u:Date.now()}}));
     __ev('bdiInspNaSet')('2026-11-06','1203',{why:'DND',by:'X'})},[Rw('1203','Morel,Claire,Ms.','2026-11-03','2026-11-09'),Rw('1406','Meyer,Anna,Mrs.','2026-11-02','2026-11-09')]);
   await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("brief")');try{__ev('bdiBriefSetMode("feed")')}catch(e){}});await p.waitForTimeout(500);
   await p.evaluate(()=>{__ev('_bdiFeedGrp').inh=1;__ev('bdiFeedToggle')('h:1203')});await p.waitForTimeout(300);
   const card=()=>p.evaluate(()=>{const c=[...document.querySelectorAll('#bdiBriefBody .bd-kt-room')].find(x=>(x.querySelector('.bd-kt-no')||{}).textContent==='1203');return c?c.textContent.replace(/\s+/g,' '):'(kart yok)'});
   const c0=await card();ok(/girilemedi: DND/.test(c0),'G6 kart girilemedi gösteriyor: "'+c0.slice(0,120)+'"');
   const btn=p.locator('#bdiBriefBody .bd-kt-room',{hasText:'girilemedi:'}).locator('button.bd-link',{hasText:'geri al'});
   const n=await btn.count();ok(n===1,'G6 girilemedi yanında "geri al" var ('+n+')');
   if(n)await btn.first().click();await p.waitForTimeout(300);
   const R=await p.evaluate(()=>({na:__ev('bdiInspNaGet')('2026-11-06','1203'),h:__ev('bdiKatRoomHtml')(__ev('bdiKatRooms')()['1203'],'insp')}));
   const c1=await card();
   ok(R.na===null&&!/girilemedi:/.test(R.h)&&!/girilemedi:/.test(c1),'G6 geri al: kayıt kalktı, kart artık girilemedi göstermiyor: na='+JSON.stringify(R.na)+' kart "'+c1.slice(0,120)+'"');
   errs.push(...p.errs);await ctx.close()});

 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
