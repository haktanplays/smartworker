// Journal by Article (FIN01102): minibar / spa / pressing onerileri Atolye'ye (+ BUT), fiyat / para birimi / kasiyer ve oda transferi
// saklanmaz, house hesabi ve %10 / %20 ekleri alinmaz, tek seferlik minibar ve laundry ayrintisi oneri olmaz. Sahte journal PDF'i bu
// testin icinde basilir. Isimler kurgu (KVKK). (Gercek raporlu realjrn testinin yerine, 2026-11-07.)
const H=require('./h.js');
const D='2026-11-06',Y='2026-11-05',J=JSON.stringify;
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const X={date:20,room:70,name:110,art:250,desc:300,chk:450,qty:500,amt:540,cur:600,csh:650};
async function jrnPdf(br,codes){
  const W=792,Hh=594,s=7,it=[[20,566,'Raffles Istanbul Zorlu Center'],[300,552,'FIN01102 Journal by Article'],[20,538,'From Date'],[60,538,'05-11-26'],[100,538,'To Date'],[135,538,'05-11-26'],
    [X.date,520,'Date'],[X.room,520,'Room No.'],[X.name,520,'Name'],[X.art,520,'Article'],[X.desc,520,'Description'],[X.chk,520,'Check No.'],[X.qty,520,'Qty.'],[X.amt,520,'Amount'],[X.cur,520,'Currency'],[X.csh,520,'Cashier']];
  let y=500;
  codes.forEach(c=>{it.push([20,y,'Transaction Code'],[100,y,c.code],[140,y,c.label]);y-=12;
    c.rows.forEach(r=>{it.push([X.date,y,'05-11-26'],[X.room,y,r[0]],[X.name,y,r[1]],[X.art,y,'1'],[X.desc,y,r[2]],[X.chk,y,'48213'],[X.qty,y,String(r[3])],[X.amt,y,(r[4]||'180.00')],[X.cur,y,'TRY'],[X.csh,y,'Cashier Zeta']);y-=11});y-=6});
  it.push([20,40,'Filter'],[350,40,'Page 1 of 1']);
  const html=`<div style="position:relative;width:${W}pt;height:${Hh}pt;overflow:hidden">`+it.map(([x,y,t])=>`<div style="position:absolute;left:${x}pt;top:${(Hh-y-0.85*s).toFixed(2)}pt;font:${s}pt Arial;line-height:1;white-space:pre">${esc(t)}</div>`).join('')+'</div>';
  const p=await br.newPage();try{await p.setContent('<html><body style="margin:0">'+html+'</body></html>');return await p.pdf({width:W/72+'in',height:Hh/72+'in'})}finally{await p.close()}
}
const Q='Quillfeather,Ansel,Mr.',RW='Rowntree,Elsie,Ms.';
const CODES=[{code:'3000',label:'Minibar Beverage',rows:[['1204',Q,'Still Water',2],['1307',RW,'Cola Zero',1],['9002','House Account,Butler','Still Water',2]]},
  {code:'3611',label:'Spa Retail',rows:[['1307',RW,'Face Serum',1]]},
  {code:'5001',label:'Laundry',rows:[['1204',Q,'Suit Pressing',1],['1307',RW,'Underwear',3]]},
  {code:'7510',label:'Service Charge 10%',rows:[['1204',Q,'Service Charge',1]]},
  {code:'9004',label:'Room Transfer',rows:[['1204',Q,'Transfer to 1307',1]]}];

(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'10:00',butlers:['Can Demir'],me:'Can Demir'});
 await H.seed(p,{gih:[H.row('1204',Q,'2026-11-03','2026-11-09'),H.row('1307',RW,'2026-11-04','2026-11-08')]});
 const buf=await jrnPdf(br,CODES);
 const msg=await H.ingest(p,buf,'FIN01102.pdf');
 ok(await p.evaluate(()=>__ev('_swRepLast')[0].type)==='jrn','Rapor Merkezi "Journal by Article (FIN01102)" olarak tanıdı');
 ok(msg==='5 kalem (05.11) · minibar 2 oda · spa 1 oda · laundry 2 oda · Atölye\'ye 2 misafirin önerisi · fiyat ve kasiyer alınmadı','05.11: minibar (3000), spa (3611), laundry (5001) okundu; %10 eki (7510), oda transferi (9004) ve house hesabı (9002) alınmadı: '+msg);
 const ST=await p.evaluate(()=>__ev('BdiKV').get('bdi_jrn_v1'));const S=JSON.parse(ST),rows=(S.days[Y]||{rows:[]}).rows;
 ok(rows.length===5&&rows.reduce((a,r)=>a+r.qty,0)===8,'adet: 2 + 1 + 1 + 1 + 3 = 8 (house hesabının 2 kalemi sayılmadı) '+J(rows.map(r=>r.room+':'+r.code+':'+r.qty)));
 ok(!/Transfer|Service Charge|9002|9004|7510/.test(ST)&&!S.days[Y].routes,'ödeme aktarma (oda transferi) ve servis eki okunmadı, saklanmadı');
 ok(!/180\.00|TRY|Cashier|48213/.test(ST)&&rows.every(r=>J(Object.keys(r))===J(['room','name','code','desc','qty'])),'KVKK / gereksiz veri yok: fiyat, para birimi, kasiyer, çek no saklanmadı (yalnız oda, isim, kod, ürün, adet)');
 const SRC=await p.evaluate(()=>__ev('bdiJrnAtSources()').map(s=>({n:s.name,also:s.also,notes:s.notes})));
 const q=SRC.find(s=>/Quillfeather/.test(s.n))||{notes:[]},r=SRC.find(s=>/Rowntree/.test(s.n))||{notes:[]},qt=J(q.notes),rt=J(r.notes);
 ok(/\*\*\*HSK\*\*\*","Guest prefers suits and blazers pressed/.test(qt)&&/Guest prefers Still Water in the minibar/.test(qt),'öneri: Quillfeather minibar (2 adet su) ve takım / ceket pressing (HSK) '+qt);
 ok(!/Cola Zero/.test(rt)&&/Spa skincare products: Face Serum/.test(rt),'tek seferlik minibar (1 adet, 1 gün) öneri olmadı; spa ürünü öneri oldu '+rt);
 ok(!/Underwear/i.test(qt+rt)&&q.also==='BUT','laundry ayrıntısı (iç çamaşırı) öneriye girmedi; kullanım tercihi BUT\'a da düşer');

 // Atolye
 await H.tab(p,'atelier');await p.evaluate(()=>__ev('bdiAtSetMode')('in'));await p.waitForTimeout(800);
 const AT=await p.evaluate(()=>{const b=document.getElementById('bdiAtBody');return {src:[...b.querySelectorAll('p.bd-sub')].map(x=>x.textContent).find(t=>/^Kaynak:/.test(t))||'',
   g:[...b.querySelectorAll('.bd-at-g')].map(x=>({h:x.querySelector('.bd-at-gh').textContent.replace(/\s+/g,' ').trim(),rows:[...x.querySelectorAll('.bd-at-row')].map(r=>r.textContent.replace(/\s+/g,' ').trim())}))}});
 const gq=AT.g.find(x=>/Quillfeather/.test(x.h))||{rows:[]};
 ok(/journal \(2 misafir\)/.test(AT.src)&&/05\.11 journal/.test(gq.h||''),'Atölye kaynak satırında "journal", misafir başlığında "05.11 journal" etiketi ('+(gq.h||'')+')');
 ok(gq.rows.some(t=>/minibar/.test(t)&&/\+ BUT/.test(t)),'Atölye satırında departmanın yanında "+ BUT" görünüyor');
 const C=await p.evaluate(()=>__ev('bdiAtCandidates()').filter(c=>c.src==='jrn'&&/Quillfeather/.test(c.name)&&/minibar/.test(c.t)).map(c=>({id:c.id,gid:c.gid})));
 await p.evaluate(id=>__ev('bdiAtDecide')([id],'a'),C[0].id);await p.waitForTimeout(400);
 const pl=await p.evaluate(g=>{__ev('_bdiGMProf=null');return __ev('bdiPlRows()').filter(r=>r.p.gid===g&&/Still Water/.test(JSON.stringify(r.L))).map(r=>r.L.block+'|'+(r.L.sub||''))},C[0].gid);
 ok(pl.length===2&&pl.some(x=>/\|PBR$/.test(x))&&pl.some(x=>/\|BUT$/.test(x)),'tek ✓ -> Protel\'de iki satır (PBR + BUT) '+J(pl));
 const dna=await p.evaluate(async g=>{await __ev('bdiGMLoad')();return Object.values((__ev('_bdiGM').dna[g]||{}).items||{}).filter(x=>!x.del).map(x=>x.t+'|'+x.dept+'|'+(x.also||''))},C[0].gid);
 ok(dna.length===1&&/Still Water/.test(dna[0])&&/\|PBR\|BUT$/.test(dna[0]),'misafir hafızasında tek madde (kartta çift görünmez) '+J(dna));
 await p.evaluate(id=>__ev('bdiAtDecide')([id],'u'),C[0].id);await p.waitForTimeout(300);
 const pl2=await p.evaluate(g=>{__ev('_bdiGMProf=null');return __ev('bdiPlRows()').filter(r=>r.p.gid===g&&/Still Water/.test(JSON.stringify(r.L))).length},C[0].gid);
 ok(pl2===0,'geri al: PBR ve BUT satırı ikisi birden kalkıyor ('+pl2+')');
 // ayni rapor ikinci kez
 await H.ingest(p,buf,'FIN01102.pdf');
 const n2=await p.evaluate(d=>JSON.parse(__ev('BdiKV').get('bdi_jrn_v1')).days[d].rows.length,Y);
 const C2=await p.evaluate(()=>__ev('bdiAtCandidates()').filter(c=>c.src==='jrn').length);
 ok(n2===5&&C2===3,'aynı rapor ikinci kez: satırlar ve öneriler çift sayılmadı ('+n2+' satır, '+C2+' öneri)');
 // misafir karti
 await p.evaluate(id=>__ev('bdiAtDecide')([id],'a'),C[0].id);await p.waitForTimeout(300);
 const card=await p.evaluate(async g=>{__ev('showPage("didit")');__ev('bdiGuestOpen')(g);await new Promise(r=>setTimeout(r,1500));return (document.getElementById('bdiTab_guests')||{}).textContent.replace(/\s+/g,' ')},C[0].gid);
 ok(/Quillfeather/.test(card)&&/Still Water/.test(card)&&!/Aynı grup/.test(card),'1204 misafir kartı açılıyor, tercih orada, "Aynı grup" yok ('+((card.match(/.{60}Still Water.{40}/)||[''])[0])+')');
 await done();
})();
