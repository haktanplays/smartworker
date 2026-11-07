// Trace raporu (GIH01161 Traces by Dates and Departments) + Brifing › Plan. Sahte trace PDF'i bu testin icinde basilir
// (sutun yerleri okuyucunun basliktan aldigi gibi; uc sayfa, sayfa sonunda bolunen trace, iki satira bolunen isim, VIP kodu,
// Opera onay kutusu isareti, KVKK kelimesi, 21 gunden eski trace tarihi). Isimler kurgu (KVKK).
// (Gercek raporlu trcplan ve fx_plan-entry'nin trace bolumunun yerine, 2026-11-07.)
const H=require('./h.js');
const D='2026-11-06',Y='2026-11-05',J=JSON.stringify,dd=s=>s.slice(8,10)+'-'+s.slice(5,7)+'-'+s.slice(2,4);
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
// Sutunlar (pt): baslikta Name, Room, Room (tip), Arr., Dept., Prs., Res. Status, Dept. Name, Trace Text, Status; ikinci satir VIP / Comments
const X={name:20,room:150,type:180,arr:215,dep:255,prs:295,res:315,dept:375,text:430,st:722};
async function trcPdf(br,pages){
  const W=792,Hh=594,s=7,head=[[20,566,'Raffles Istanbul Zorlu Center'],[300,552,'GIH01161 Traces by Dates and Departments'],
    [X.name,520,'Name'],[X.room,520,'Room'],[X.type,520,'Room'],[X.arr,520,'Arr.'],[X.dep,520,'Dept.'],[X.prs,520,'Prs.'],[X.res,520,'Res. Status'],[X.dept,520,'Dept. Name'],[X.text,520,'Trace Text'],[X.st,520,'Status'],
    [X.name,510,'VIP'],[100,510,'Comments']];
  const html=pages.map((it,i)=>`<div style="position:relative;width:${W}pt;height:${Hh}pt;overflow:hidden${i<pages.length-1?';break-after:page':''}">`+
    head.concat(it,[[20,40,'Filter: BUT, PBR, REC; Unresolved'],[350,40,'Page '+(i+1)+' of '+pages.length]]).map(([x,y,t])=>`<div style="position:absolute;left:${x}pt;top:${(Hh-y-0.85*s).toFixed(2)}pt;font:${s}pt Arial;line-height:1;white-space:pre">${esc(t)}</div>`).join('')+'</div>').join('');
  const p=await br.newPage();try{await p.setContent('<html><body style="margin:0">'+html+'</body></html>');return await p.pdf({width:W/72+'in',height:Hh/72+'in'})}finally{await p.close()}
}
// Bir trace: ilk satir butun sutunlar, sonraki satirlar isim devami (n), VIP (v) ve metin devami (t)
function trace(y,o){const it=[[X.name,y,o.name],[X.room,y,o.room],[X.type,y,'KGA'],[X.arr,y,dd(o.arr)],[X.dep,y,dd(o.dep)],[X.prs,y,'2'],[X.res,y,'Checked In'],[X.dept,y,o.dept||'BUT'],[X.text,y,o.text[0]],[X.st,y,'Unresolved']];
  const more=Math.max(o.text.length-1,(o.more||[]).length);for(let i=0;i<more;i++){const yy=y-10*(i+1),m=(o.more||[])[i];if(m)it.push([X.name,yy,m]);if(o.text[i+1])it.push([X.text,yy,o.text[i+1]])}
  return {it,h:10*(more+1)+6}}
function page(blocks,top){let y=top||495;const out=[];blocks.forEach(b=>{if(b.td){out.push([20,y,'Trace Date'],[80,y,dd(b.td)]);y-=12;return}if(b.raw){b.raw.forEach(([x,t])=>out.push([x,y,t]));y-=10;return}const t=trace(y,b);out.push(...t.it);y-=t.h});return out}
const PKG=['GCC package: guest to be welcomed by butler with in-room check-in.','Traditional hamam setup gift on departure.','Two-piece laundry included per stay. Upgrade to the next room category subject to availability.'];

(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'11:00',butlers:['Can Demir','Nazlı Erten'],me:'Can Demir'});
 await H.seed(p,{gih:[H.row('0903','Ashgrove,Mira,Ms.',D,'2026-11-08'),H.row('1113','Birchall,Owen,Mr.',Y,'2026-11-09'),H.row('1601','Calloway,Iris,Ms.','2026-11-04','2026-11-09'),
   H.row('1612','Delacroix-Montague,Henri Philippe,Mr.','2026-11-03','2026-11-10'),H.row('1710','Ember,Rafe,Mr.','2026-11-05','2026-11-08'),H.row('1101','Fairley,Gwen,Ms.','2026-11-04','2026-11-07'),H.row('0705','Grant,Hollis,Mr.','2026-11-02','2026-11-07')],
   kv:{bdi_floors_v1:{[D]:{blocks:[{from:7,to:12,butler:'Can Demir'},{from:13,to:21,butler:'Nazlı Erten'}],u:Date.now()}}}});
 const P1=page([{td:'2026-10-10'},{name:'Holloway,Ines,Ms.',room:'0801',arr:'2026-10-08',dep:'2026-10-12',text:['Flowers on arrival please']},
   {td:D},{name:'Ashgrove,Mira,Ms.',room:'0903',arr:D,dep:'2026-11-08',text:PKG},
   {name:'Birchall,Owen,Mr.',room:'1113',arr:Y,dep:'2026-11-09',text:PKG},
   {name:'Calloway,Iris,Ms.',room:'1601',arr:'2026-11-04',dep:'2026-11-09',text:['Please place snacks at 10:30 in the room']},
   {name:'Delacroix-Montague,Henri',room:'1612',arr:'2026-11-03',dep:'2026-11-10',text:['Guest is pregnant, extra pillows on the bed'],more:['Philippe,Mr.','3']},
   {name:'Ember,Rafe,Mr.',room:'1710',arr:'2026-11-05',dep:'2026-11-08',text:['☐ Kindly arrange PlayStation in room'],more:['1']},
   {name:'Grant,Hollis,Mr.',room:'0705',arr:'2026-11-02',dep:'2026-11-07',dept:'REC',text:['Late check-out approved until 14:00']},
   {name:'Fairley,Gwen,Ms.',room:'1101',arr:'2026-11-04',dep:'2026-11-07',text:['Satılabilir ürünler listesi hazırlansın, please place in room','Welcome amenity voucher attached']}]);
 // sayfa 2: ust satir bir onceki sayfadaki trace'in (1101) metin devami; sayfa 3: bir trace daha
 const P2=page([{raw:[[X.text,'*Not applicable for group bookings.']]},{name:'Ivers,Cole,Mr.',room:'1205',arr:'2026-11-05',dep:'2026-11-09',text:['Turndown with lavender ritual, every evening']},
   {name:'Juniper,Ada,Ms.',room:'0901',arr:'2026-11-04',dep:'2026-11-09',text:['Place flowers at 20:00 **GC']},{name:'Kerr,Bram,Mr.',room:'0902',arr:'2026-11-04',dep:'2026-11-09',text:['Place flowers at 20:00 **MU']},
   {name:'Lorne,Cara,Ms.',room:'0904',arr:'2026-11-04',dep:'2026-11-09',text:['** change: 20:00 flowers']},{name:'Moss,Dell,Mr.',room:'0905',arr:'2026-11-04',dep:'2026-11-09',text:['**** KK']}]);
 const buf=await trcPdf(br,[P1,P2]);
 const msg=await H.ingest(p,buf,'GIH01161.pdf');
 const ty=await p.evaluate(()=>__ev('_swRepLast')[0].type);
 ok(ty==='trc'&&/^13 trace \(BUT 12, REC 1\) · 2 gün/.test(msg),'Rapor Merkezi trace raporunu tanıdı: '+msg);
 const ST=await p.evaluate(()=>JSON.parse(__ev('BdiKV').get('bdi_trc_v1')));
 const T=(ST.days[D]||{rows:[]}).rows,by={};T.forEach(r=>by[r.room]=r);
 ok(T.length===12&&J(Object.keys(ST.days))===J([D]),'bugünün 12 trace satırı okundu; 21 günden eski trace günü (10.10) saklanmadı '+J({n:T.length,days:Object.keys(ST.days)}));
 ok(by['0903']&&by['0903'].text.split('\n').length===3&&by['1101']&&/\*Not applicable for group bookings\.$/.test(by['1101'].text)&&by['1205'],'çok satırlı paket metni tek trace oldu; sayfa sonunda bölünen satır ("*Not applicable…") doğru trace\'e (1101) '+J(by['1101']&&by['1101'].text));
 ok(by['1612']&&by['1612'].name==='Delacroix-Montague,Henri Philippe,Mr.'&&by['1612'].vip==='3'&&by['1710'].vip==='1','iki satıra bölünen isim birleşti; VIP kodu okundu (1612 → 3, 1710 → 1) '+J({n:by['1612']&&by['1612'].name,v:[by['1612']&&by['1612'].vip,by['1710']&&by['1710'].vip]}));
 ok(by['1612']&&!/pregnan/i.test(J(ST))&&by['1612'].sens===1&&/\[hassasiyet\]/.test(by['1612'].text),'KVKK: hamilelik bilgisi maskelendi ('+(by['1612']&&by['1612'].text)+')');
 ok(by['1710']&&by['1710'].text==='Kindly arrange PlayStation in room','Opera onay kutusu işareti temizlendi ('+J(by['1710']&&by['1710'].text)+')');
 const K=await p.evaluate(()=>{const k=__ev('bdiTrcKind');return ['Flowers placed in the room','Daily fruit refresh','Do not charge the minibar','Guest prefers feather pillows','Please place a birthday cake at 19:00',
   'We will reach out to the guest','Guest checks out at noon','guest out at 10','setup out','bb out','balonları bıraktık'].map(t=>k(t)).join(',')});
 ok(K==='done,daily,bill,info,task,info,info,info,done,done,done','tür tahmini doğru; "reach out" / "check out" / "guest out" yapılmış sayılmıyor, "setup out", "bb out", "bıraktık" yapılmış ('+K+')');
 const KY=await p.evaluate(()=>{const k=__ev('bdiTrcKey');return {a:k('Place flowers at 20:00 **GC'),b:k('Place flowers at 20:00 **MU'),c:k('** change: 20:00 flowers')}});
 ok(KY.a===KY.b&&KY.c!==KY.a&&/change/.test(KY.c),'imza (**GC, **MU) anahtardan çıkıyor; "** change: 20:00 flowers" ayrı anahtar '+J(KY));

 // Brifing > Plan
 await H.tab(p,'brief');await p.waitForTimeout(500);
 const mode=await p.evaluate(()=>__ev('_bdiBriefMode'));
 ok(mode==='plan'&&await p.evaluate(()=>!!document.querySelector('#bdiBriefBody .bd-pl2-kpi')),'Brifing varsayılan olarak Plan açılıyor');
 const PL=()=>p.evaluate(d=>__ev('bdiPlanBuild')(d).map(g=>({room:g.room,name:g.name,items:g.items.map(i=>({k:i.k,t:i.t,src:i.src,when:i.when||'',late:!!i.late,owner:i.owner,done:i.done&&i.done.by,id:i.id})),info:g.info.map(i=>i.t)})),D);
 let G=await PL(),g=r=>G.find(x=>x.room===r)||{items:[],info:[]};
 ok(g('0903').items.some(i=>i.k==='must'&&i.t==='Welcome + in-room check-in (paket)')&&g('0903').info.some(t=>t==='Paket: çıkışta hamam seti hediye (08.11)'),'0903 (bugün geldi, paket): zorunlu "Welcome + in-room check-in"; hamam seti çıkış günü için bilgi (08.11) '+J(g('0903')));
 ok(!g('1113').items.some(i=>/Welcome/.test(i.t))&&g('1113').info.some(t=>/^Paket: varışta welcome \+ in-room check-in \(05\.11\)/.test(t)),'1113 (dün geldi): paketteki welcome iş değil, bilgi '+J(g('1113').info));
 const sn=g('1601').items.find(i=>/snacks/.test(i.t))||{};
 ok(sn.k==='must'&&sn.when==='10:30'&&sn.owner==='Nazlı Erten'&&sn.late,'1601: "10:30 snacks" zorunlu iş, saat 10:30, kat butlerı Nazlı Erten, saati geçtiği için gecikti '+J(sn));
 ok(!J(g('0705')).includes('Late check-out'),'REC trace\'i (0705 "Late check-out approved") Plan\'a girmedi (butler işi değil) '+J(g('0705')));
 const GR=await p.evaluate(()=>{const el=document.getElementById('bdiBriefBody');el.innerHTML=__ev('bdiPlanHtml()');return [...el.querySelectorAll('.bd-pl2-grp')].map(x=>x.querySelector('.bd-pl2-gh b').textContent+': '+[...x.querySelectorAll('.bd-pl2-rm')].map(r=>r.textContent).join(','))});
 ok(GR.some(x=>/^Can Demir: .*0903.*1101.*1113/.test(x)||/^Can Demir: /.test(x)&&['0903','1101','1113'].every(r=>x.includes(r)))&&GR.some(x=>/^Nazlı Erten: /.test(x)&&['1601','1612','1710'].every(r=>x.includes(r))),'gruplar kat dağılımına göre '+J(GR));
 // 1710 PlayStation: tik (kim: Can Demir)
 const ps=g('1710').items.find(i=>/PlayStation/.test(i.t))||{};
 await p.evaluate(id=>{const b=document.createElement('button');b.setAttribute('data-id',id);__ev('bdiPlanTick')(b)},ps.id);
 G=await PL();const ps2=g('1710').items.find(i=>/PlayStation/.test(i.t))||{};
 ok(ps2.done==='Can Demir','1710 "PlayStation" tiklendi (kim: Can Demir) '+J(ps2));
 // 1601 isi baska butlera (Can Demir)
 await p.evaluate(id=>{const s=document.createElement('select');s.setAttribute('data-id',id);s.innerHTML='<option>Can Demir</option>';s.value='Can Demir';__ev('bdiPlanOwner')(s)},sn.id);
 G=await PL();ok((g('1601').items.find(i=>/snacks/.test(i.t))||{}).owner==='Can Demir','1601 snacks işi Can Demir\'e verildi');
 // "bilgi say": 1101 is listesinden bilgiye (kural)
 const fl=g('1101').items.find(i=>/Satılabilir/.test(i.t));
 const key=await p.evaluate(t=>__ev('bdiTrcKey')(t),by['1101'].text);
 await p.evaluate(k=>{const b=document.createElement('button');b.setAttribute('data-k',k);b.setAttribute('data-v','info');__ev('bdiPlanKind')(b)},key);
 G=await PL();
 ok(fl&&!g('1101').items.some(i=>/Satılabilir/.test(i.t))&&g('1101').info.some(t=>/Satılabilir/.test(t)),'"bilgi say": 1101 "Satılabilir ürünler…" iş listesinden bilgiye geçti (kural)');
 // imzali ayni istek (GC / MU) tek kural; "** change" ayri ve zorunlu kalir; "**** KK" satirinda tur dugmesi yok
 const im=x=>(g(x).items.find(i=>/flowers/.test(i.t))||{}).k||(g(x).info.some(t=>/flowers/.test(t))?'info':'');
 ok(im('0901')==='must'&&im('0902')==='must'&&im('0904')==='must','imzalı istekler (0901 **GC, 0902 **MU) ve "** change: 20:00 flowers" (0904) zorunlu iş '+J([im('0901'),im('0902'),im('0904')]));
 const k2=await p.evaluate(t=>__ev('bdiTrcKey')(t),'Place flowers at 20:00 **GC');
 await p.evaluate(k=>{const b=document.createElement('button');b.setAttribute('data-k',k);b.setAttribute('data-v','info');__ev('bdiPlanKind')(b)},k2);
 G=await PL();
 ok(im('0901')==='info'&&im('0902')==='info'&&im('0904')==='must','"bilgi say" GC satırını ve aynı isteğin MU imzalı satırını bilgiye çevirdi; "** change: 20:00 flowers" ZORUNLU kaldı '+J([im('0901'),im('0902'),im('0904')]));
 const kk=await p.evaluate(()=>{const el=document.getElementById('bdiBriefBody');el.innerHTML=__ev('bdiPlanHtml()');const g=[...el.querySelectorAll('.bd-pl2-g')].find(x=>x.querySelector('.bd-pl2-rm').textContent==='0905');
   return g?{t:g.textContent.replace(/\s+/g,' '),btn:!!g.querySelector('button[data-k]')}:null});
 ok(kk&&/\*\*\*\* KK/.test(kk.t)&&!kk.btn,'"**** KK" satırında "iş say" / "bilgi say" düğmesi yok '+J(kk));
 // ayni rapor ikinci kez
 await H.ingest(p,buf,'GIH01161.pdf');
 const n2=await p.evaluate(d=>JSON.parse(__ev('BdiKV').get('bdi_trc_v1')).days[d].rows.length,D);
 ok(n2===12,'aynı rapor ikinci kez: satırlar çift olmadı ('+n2+')');
 await done();
})();
