const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-03T19:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-03');localStorage.setItem('sw_dayfix','2026-11-03');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak']))});await p.reload();await p.waitForTimeout(1200);
 const R=await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();const at=(d,h)=>new Date(d+'T'+h+':00+03:00').getTime();
   const Rw=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-02',at:at('2026-11-02','23:00'),file:'g.pdf',rows:[Rw('1503','Van Der Hulst,Bart,Mr.','2026-10-31','2026-11-06'),Rw('1203','Morel,Claire,Ms.','2026-10-30','2026-11-06'),Rw('0901','Brodan,Kresimir,Mr.','2026-10-31','2026-11-06'),Rw('1808','De Gramont,Armand,Mr.','2026-10-31','2026-11-08')]}));__ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()');
   const txt='Butler entered the room for in-room check-in... It will be checked again tomorrow. Need to follow up.';
   __ev('bdiSaveIssues')([
     // senin ekrandaki 1503: butler ilgilendi, metin guncellendi, butler ilgilendi, butler kapatti
     {id:'b1503',room:'1503',guest:'Bart van der Hulst',concern:txt,createdAt:at('2026-11-01','16:54'),u:1,events:[{id:'a',ts:at('2026-11-01','16:54'),type:'import'},{id:'b',ts:at('2026-11-01','22:16'),type:'touch',butler:'Beyza Nur Çırak',text:'hammam ritual'},{id:'c',ts:at('2026-11-02','20:01'),type:'update'},{id:'d',ts:at('2026-11-02','20:02'),type:'touch',butler:'Beyza Nur Çırak',text:'complimentary meal'},{id:'e',ts:at('2026-11-03','18:03'),type:'close',butler:'Beyza Nur Çırak',text:'pictures'}]},
     // acik, metin "need follow-up", metinden sonra butler temasi var -> acilmaz
     {id:'i1203',room:'1203',guest:'Claire Morel',concern:'Noise. Needs follow-up.',createdAt:at('2026-11-03','09:00'),u:1,events:[{id:'f',ts:at('2026-11-03','09:00'),type:'import'},{id:'g',ts:at('2026-11-03','10:00'),type:'touch',butler:'Beyza Nur Çırak',text:'visited'}]},
     // acik, metin "need follow-up", temas yok -> acilir
     {id:'i0901',room:'0901',guest:'Kresimir Brodan',concern:'AC. Needs follow-up.',createdAt:at('2026-11-03','09:00'),u:1,events:[{id:'h',ts:at('2026-11-03','09:00'),type:'import'}]},
     // kaynak (butler temassiz) kapatti, metin "need follow-up", misafir otelde -> memnuniyet teyidi
     {id:'i1808',room:'1808',guest:'Armand De Gramont',concern:'Laundry late. Needs follow-up.',createdAt:at('2026-11-03','08:00'),u:1,events:[{id:'j',ts:at('2026-11-03','08:00'),type:'import'},{id:'k',ts:at('2026-11-03','12:00'),type:'close',butler:'',src:'report'}]}]);
   // eski surumun actigi yanlis takip (senin dosyandaki gibi)
   const o={};o['fu_is_b1503']={id:'fu_is_b1503',kind:'issue',iss:'b1503',room:'1503',guest:'Bart van der Hulst',t:'Issue takibi: ...',at:at('2026-11-03','09:30'),base:at('2026-11-01','16:54'),due:at('2026-11-02','10:00'),dueWhy:'metinde “tomorrow”',st:'open',src:'auto',u:1};KV.set('bdi_fu_v1',JSON.stringify(o));
   __ev('bdiFuSweep')();const all=__ev('bdiFuAll')();
   return {b:all['fu_is_b1503'],ids:__ev('bdiFuList')().map(f=>f.id+':'+f.kind+':'+f.st).join(',')}});
 console.log('  takipler: '+R.ids);
 ok(R.b&&R.b.del&&R.b.st==='cancel'&&R.b.doneVia==='pre','1503: Takip Defteri kurulmadan önce yapılmış temas sayıldı, yanlış açılmış "gecikti" takibi kaldırıldı');
 ok(!/i1203/.test(R.ids),'açık issue, metinden sonra butler teması var: takip açılmadı');
 ok(/fu_is_i0901:issue:open/.test(R.ids),'açık issue, "needs follow-up", temas yok: takip açıldı');
 ok(!/i1808/.test(R.ids),'kaynağın kapattığı issue (metin "needs follow-up", misafir otelde): takip açılmadı (kapanan issue takip istemez)');
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("issues")');__ev('bdiIssueSetFilter("all")');__ev('renderBdiIssues()')});
 const pill=await p.evaluate(()=>(document.querySelector('#bdiIs_b1503 .bd-issue-meta')||{}).innerText||'');
 ok(!/Takip gecikti/.test(pill),'1503 kartında artık "Takip gecikti" yok: '+pill.replace(/\s+/g,' '));
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
