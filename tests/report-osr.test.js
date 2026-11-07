// OSR (Guest Profile Check) uyruk raporu: yer tutucu ("Hold, Hold", "…, Guest"), sirket / PM profili ve iptal sayilmaz; raporun kendi
// varis suzgeci okunur; e-posta / telefon saklanmaz; durum (CHECKED IN / DUE IN); uyruk adlari (UN = Bilinmiyor); rapor araliginin
// otesindeki ozel gunde "en az" ve sekmede eksik varis notu. Sahte OSR PDF'i bu testin icinde basilir (tests/data/nat/mkosr.js duzeni).
// Isimler kurgu (KVKK). (Gercek raporlu realosr testinin yerine, 2026-11-07.)
const H=require('./h.js');
const D='2026-11-06',J=JSON.stringify;
const ROWS=[ // isim, varis, cikis, ulke, uyruk, e-posta, telefon, durum
 ['Ashcombe, Lionel','10-10-26','09-11-26','GB','GB','lionel@example.co.uk','+44 20 7946 0000','CHECKED IN'],
 ['Ashcombe, Wren','10-10-26','09-11-26','GB','GB','','','CHECKED IN'],
 ['Bertrand, Elise','01-11-26','08-11-26','FR','FRANCE','elise@example.fr','+33 1 23 45 67 89','CHECKED IN'],
 ['Okonkwo, Ada','04-11-26','10-11-26','NG','NG','','','CHECKED IN'],
 ['Marlow, Quentin','03-11-26','08-11-26','','UN','','','CHECKED IN'],
 ['Hold, Hold','05-11-26','06-11-26','','','','','RESERVED'],
 ['Hold, Hold','05-11-26','07-11-26','','','','','RESERVED'],
 ['Kelso, Guest','02-11-26','04-11-26','','','','','CHECKED OUT'],
 ['Contoso Holdings','01-11-26','30-11-26','','','','',''],
 ['PM Account','01-11-26','30-11-26','','','','',''],
 ['Vance, Theo','02-11-26','07-11-26','US','US','theo@example.com','+1 212 555 0100','CANCELLED'],
 ['Fitzwilliam-Delacourt, Penelope','28-10-26','08-11-26','IT','IT','','','CHECKED IN'],
 ['Ivanova, Mila','05-11-26','12-11-26','RU','RU','','','DUE IN']];
async function osrPdf(br){
  const X=[20,200,260,320,370,450,580,690],HD=['Full Name','Arrival','Departure','Country','Nationality','Email','Phone','Resv. Status'],d=(x,y,t,b)=>`<div style="position:absolute;left:${x}px;top:${y}px;font:${b?'bold ':''}10px Arial;white-space:pre">${String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</div>`;
  let y=70,body=d(20,20,'OSR - Guest Profile Check',1);HD.forEach((h,i)=>body+=d(X[i],y,h,1));
  ROWS.forEach(r=>{y+=22;let o=[r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7]];
    if(r[0].length>26){const i=r[0].indexOf(' ');body+=d(X[0],y+11,r[0].slice(i+1));o[0]=r[0].slice(0,i)} // Opera gibi satir sonunda kirilan isim
    o.forEach((c,i)=>{if(c)body+=d(X[i],y,c)});if(r[0].length>26)y+=11});
  body+=d(20,y+40,'From Arrival Date=06-10-26')+d(20,y+54,'To Arrival Date=05-11-26')+d(20,y+68,'Resv Status=CHECKED IN, DUE IN, RESERVED, CANCELLED')+d(20,y+90,'Page 1 of 1');
  const p=await br.newPage();try{await p.setContent('<html><body style="margin:0;position:relative;width:800px;height:1100px">'+body+'</body></html>');return await p.pdf({width:'800px',height:'1100px'})}finally{await p.close()}
}

(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'10:00',butlers:['Can Demir'],me:'Can Demir'});
 await p.evaluate(()=>{localStorage.setItem('bdi_natdays',JSON.stringify([{l:'Kurgu Günü',d:'07.11',c:'GB'}]));localStorage.setItem('bdi_natdays_up','2')});
 const m=await H.ingest(p,await osrPdf(br),'OSR_GuestProfileCheck.pdf');
 ok(await p.evaluate(()=>__ev('_swRepLast')[0].type)==='osr','OSR Rapor Merkezi\'nde uyruk raporu olarak tanındı');
 ok(m==='7 kişi · 6 uyruk · varışlar 05.11\'e kadar · 3 yer tutucu (Hold) sayılmadı · 2 şirket / PM profili sayılmadı · 1 iptal / no-show sayılmadı','7 kişi: 3 yer tutucu (2 "Hold, Hold" + 1 "…, Guest"), 2 şirket / PM profili ve 1 iptal sayılmadı ('+m+')');
 const ST=await p.evaluate(()=>__ev('BdiKV').get('bdi_osr_v1')),S=JSON.parse(ST),by={};S.rows.forEach(r=>by[r.name]=r);
 ok(S.arrFrom==='2026-10-06'&&S.arrTo==='2026-11-05','raporun kendi süzgeci okundu: varışlar 06.10 – 05.11 '+J({f:S.arrFrom,t:S.arrTo}));
 ok(!/@|\+44|\+33|\+1 212|example/.test(ST),'e-posta ve telefonlar saklanmadı');
 ok(by['Ashcombe, Lionel']&&by['Ashcombe, Lionel'].s==='in'&&by['Ivanova, Mila']&&by['Ivanova, Mila'].s==='due','CHECKED IN → otelde, DUE IN → gelecek '+J([by['Ashcombe, Lionel'],by['Ivanova, Mila']].map(r=>r&&r.s)));
 ok(!!by['Fitzwilliam-Delacourt, Penelope'],'iki satıra bölünen isim birleşti (Fitzwilliam-Delacourt, Penelope)');
 const NL=await p.evaluate(()=>__ev('bdiOsrStore()').rows.map(r=>__ev('bdiNatLabel')(__ev('bdiNatC')(r))).sort().join(','));
 ok(/Bilinmiyor/.test(NL)&&/Fransa/.test(NL),'uyruk dağılımında uyruk adları (UN = Bilinmiyor, FRANCE = Fransa): '+NL);
 const E=await p.evaluate(()=>__ev('bdiNatEvents')('2026-11-07','2026-11-07').map(e=>({n:e.name,partial:e.partial,N:__ev('bdiNatN')(e)})));
 ok(E.length===1&&E[0].partial&&E[0].N==='en az 2','07.11 rapor aralığının ötesinde: "en az 2" GB misafiri '+J(E));
 await H.tab(p,'nat');await p.evaluate(()=>__ev('bdiNatSetDate')('2026-11-07'));await p.waitForTimeout(300);
 const tx=await p.evaluate(()=>(document.getElementById('bdiNatBody')||{}).textContent||'');
 ok(/OSR'de 05\.11\.2026 sonrası varışlar yok/.test(tx),'sekmede "05.11 sonrası varışlar yok" notu');
 await done();
})();
