// Oda degisikligi (2026-11-06): misafir 1406 -> 2104; Atolye, Misafirler, takip, issue odasi guncel odayi gosterir
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const DIR=process.argv[2]||'t2';
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-06T14:00:00+03:00')});await p.goto('file://'+__dirname+'/'+DIR+'/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-12-31');localStorage.setItem('sw_dayfix','2026-11-06');localStorage.setItem('kw_butler',JSON.stringify(['Can Demir']));localStorage.setItem('bdi_me','Can Demir')});
 await p.reload();await p.waitForTimeout(1300);
 const Rw=(room,name,arr,dep,notes)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:notes||[]});
 // 1) sabah: Meyer 1406'da, Sato 1802'de (dun cikti: yalniz dunku kayit)
 await p.evaluate(async(rows)=>{const KV=__ev('BdiKV');await KV.ready();
   const L=(id,room,guest,act,s)=>({id,ts:Date.parse('2026-11-05T10:00:00+03:00'),time:'10:00',butler:'Can Demir',room,guest,action:act,touchCategory:'Service',sentence:s,note:''});
   KV.set('bdi_2026-11-05',JSON.stringify([L('a1','1406','Anna Meyer','Touch Call','Guest enjoyed the welcome amenity'),L('a2','1802','Kenji Sato','Touch Call','Guest asked for a late check-out')]));
   KV.set('bdi_atsrc_gih_2026-11-05',JSON.stringify({day:'2026-11-05',at:1,rows:[{room:'1406',name:'Meyer,Anna,Mrs.',notes:[['Prefers still water at room temperature']]}]}));
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-06',at:Date.now(),file:'g1.pdf',rows:rows}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');await __ev('bdiGMIngest')();
   __ev('bdiFuAdd')({room:'1406',guest:'Anna Meyer',t:'Su tercihini teyit et',due:Date.now()+3*3600e3});
   __ev('_bdiGMProf=null');const g=__ev('bdiGMProfiles')().list.find(x=>/Meyer/.test(x.name)).gid; // Protel'e girilecek bir tercih (DNA)
   await __ev('bdiDnaPut')(g,d=>{d.items=d.items||{};d.items.x1={sec:'delight',t:'Prefers still water at room temperature',dept:'BUT',by:'CD',at:Date.now(),u:Date.now()}});
 },[Rw('1406','Meyer,Anna,Mrs.','2026-11-03','2026-11-09'),Rw('1203','Morel,Claire,Ms.','2026-11-03','2026-11-09')]);
 const B=await p.evaluate(()=>{__ev('_bdiGMProf=null');const P=__ev('bdiGMProfiles')().list.find(x=>/Meyer/.test(x.name));return P?P.room:'yok'});
 ok(B==='1406','oda değişmeden önce: Meyer 1406 ('+B+')');
 // 2) ogleden sonra yeni in-house: Meyer 2104'e tasindi
 await p.evaluate(async(rows)=>{const KV=__ev('BdiKV');KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-06',at:Date.now(),file:'g2.pdf',rows:rows}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');await __ev('bdiGMIngest')()},[Rw('2104','Meyer,Anna,Mrs.','2026-11-03','2026-11-09'),Rw('1203','Morel,Claire,Ms.','2026-11-03','2026-11-09')]);
 const S=await p.evaluate(()=>{const P=__ev('bdiGMProfiles')(),m=P.list.find(x=>/Meyer/.test(x.name)),s=P.list.find(x=>/Sato/.test(x.name));
   const fu=__ev('bdiFuList')().find(f=>/Meyer/.test(f.guest));
   return {room:m&&m.room,now:m&&m.roomNow,hist:m&&Object.keys(m.rooms).sort().join(','),sato:s&&s.room,satoNow:s&&s.roomNow,fu:fu&&fu.room,iss:__ev('bdiIssueRoomFor')('Anna Meyer')}});
 ok(S.room==='2104'&&S.now==='2104','profil: Meyer şimdi 2104 ('+S.room+')');
 ok(S.hist==='1406,2104','geçmiş korunuyor: konaklamadaki odalar 1406 ve 2104 ('+S.hist+')');
 ok(S.sato==='1802'&&!S.satoNow,'otelde olmayan misafir: son görüldüğü oda 1802 ('+S.sato+')');
 ok(S.fu==='2104','Takip: açık takip yeni odaya geçti ('+S.fu+')');
 ok(S.iss==='2104','issue için oda bulma: 2104 ('+S.iss+')');
 // 3) Atolye > Protel'e girilecekler
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("atelier")');__ev('_bdiAtMode="out"');__ev('renderBdiAtelier()')});await p.waitForTimeout(900);
 const AO=await p.evaluate(()=>{const g=[...document.querySelectorAll('#bdiProtelBody .bd-pl-g')].find(x=>/Meyer/.test(x.textContent));return g?(g.querySelector('.bd-pl-rm')||{}).textContent:'grup yok'});
 ok(AO==='2104','Atölye › Protel\'e girilecekler: Meyer satırında oda 2104 ('+AO+')');
 // 4) Atolye > Gelen notlar (dunku rapordan gelen not, odasi 1406 yazili)
 await p.evaluate(()=>{__ev('_bdiAtMode="in"');__ev('renderBdiAtelier()')});await p.waitForTimeout(900);
 const AI=await p.evaluate(()=>{const g=[...document.querySelectorAll('#bdiAtBody .bd-at-g')].find(x=>/Meyer/.test(x.textContent)&&x.querySelector('.bd-at-gh b'));return g?g.querySelector('.bd-at-gh b').textContent:'grup yok'});
 ok(AI==='2104','Atölye › Gelen notlar: dünkü rapordan gelen notta oda 2104 ('+AI+')');
 // 5) Misafirler listesi
 await p.evaluate(()=>{__ev('switchBdiTab("guests")')});await p.waitForTimeout(1500);
 const GL=await p.evaluate(()=>{const r=[...document.querySelectorAll('.bd-grow')].find(x=>/Meyer/.test(x.textContent));return r?(r.querySelector('.bd-g-rooms')||{}).textContent:'satır yok'});
 ok(GL==='2104','Misafirler listesi: Meyer 2104 ('+GL+')');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
