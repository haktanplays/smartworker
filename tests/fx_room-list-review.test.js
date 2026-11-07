// Tutarlilik duzeltmelerinin gozden gecirmesi (2026-11-07): iki geri adimin testi. Isimler kurgu (KVKK).
// 1) Varis raporunda ayni ad iki bos odada (bir kisi iki oda ayirtmis): iki oda da oda listesinde ve Kat turu'nda.
// 2) Misafirler listesi acikken bir touch kaydedilince liste kendiliginden yenilenir (misafir hafizasi tek yoldan).
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06';
(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'09:00',butlers:['Can Demir'],me:'Can Demir'});
 await H.seed(p,{gih:[H.row('1406','Quarrel,Edna,Mrs.','2026-11-03','2026-11-09')],logs:{'2026-11-05':[H.log('l1','2026-11-05','10:00','1406','Edna Quarrel','Turndown')]}});
 const m=await H.ingest(p,await R.arr({day:D,time:'07:45',rows:[{room:'1501',name:'Vantorre,Silas,Mr.',arr:D,dep:'2026-11-09'},
   {room:'1502',name:'Vantorre,Silas,Mr.',arr:D,dep:'2026-11-09'},{room:'1406',name:'Quarrel,Edna,Mrs.',arr:'2026-11-03',dep:'2026-11-09'}]},br),'ARR01102.pdf');
 console.log('  ARR: '+m);
 const s=await p.evaluate(()=>({vac:Object.keys(__ev('vacRooms')).map(r=>('000'+r).slice(-4)).sort().join(','),
   kat:Object.values(__ev('bdiKatRooms()')).filter(x=>x.arriving).map(x=>x.room).sort().join(',')}));
 ok(s.vac==='1406,1501,1502','ayni adla iki oda: ikisi de oda listesinde '+JSON.stringify(s));
 ok(s.kat==='1501,1502','ayni adla iki oda: Kat turu iki varisi da gosterir '+JSON.stringify(s));

 await H.tab(p,'guests');await p.waitForTimeout(1500);
 const lib=()=>p.evaluate(()=>{const r=[...document.querySelectorAll('#bdiGuestProfiles .bd-grow')].find(x=>/Edna Quarrel/.test(x.innerText));return r?r.innerText.replace(/\s+/g,' '):''});
 const before=await lib();
 await p.evaluate(()=>{const a=__ev('loadBdiArrayForDate')('2026-11-06');a.push({id:'l2',ts:Date.now(),time:'09:00',butler:'Can Demir',room:'1406',guest:'Edna Quarrel',action:'Welcome',touchCategory:'Service',sentence:'Butler performed Welcome.',note:'',meta:{}});__ev('saveBdiArrayForDate')('2026-11-06',a)});
 await p.waitForTimeout(2500);
 const after=await lib();
 ok(/06\.11\.2026/.test(after)&&!/06\.11\.2026/.test(before),'Misafirler açıkken kaydedilen touch listeye geldi (son temas 06.11) | önce: '+before+' | sonra: '+after);
 await done();
})();
