// 2026-11-06: Ayarlar › Protel notuna girmeyen islemler + Kayit tercihleri departmaninin tercihi olarak (onay beklemeden)
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const DIR=process.argv[2]||'t2';
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-06T14:00:00+03:00')});await p.goto('file://'+__dirname+'/'+DIR+'/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-12-31');localStorage.setItem('sw_dayfix','2026-11-06');localStorage.setItem('kw_butler',JSON.stringify(['Can Demir']));localStorage.setItem('bdi_me','Can Demir')});
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const L=(id,t,act,cat,s,note,meta)=>({id,ts:Date.parse('2026-11-05T'+t+':00+03:00'),time:t,butler:'Can Demir',room:'1406',guest:'Anna Meyer',action:act,touchCategory:cat,sentence:s,note:note||'',meta:meta||{}});
   KV.set('bdi_2026-11-05',JSON.stringify([
     L('a1','09:10','Unpack','Service','Butler Can Demir unpacked the luggage for Anna Meyer.'),
     L('a2','10:20','Turndown','Service','Butler Can Demir provided turndown service for Anna Meyer.'),
     L('a3','11:30','Touch Call','Service','Butler Can Demir checked in with Anna Meyer by phone.'),
     L('a4','21:00','Sleep Ritual','Service','Butler Can Demir prepared a sleep ritual for Anna Meyer.'),
     L('p1','12:05','Guest Preference','Preference','Butler Can Demir collected guest preference. Guest prefers firm pillow.','Pillow: firm pillow',{preferenceCategory:'Pillow',preferenceDetail:'firm pillow'}),
     L('p2','12:40','Guest Preference','Preference','x','Dietary: vegetarian options at breakfast',{preferenceCategory:'Dietary',preferenceDetail:'vegetarian options at breakfast'}),
     L('p3','13:00','Guest Preference','Preference','x','Dietary: gluten free because of celiac disease',{preferenceCategory:'Dietary',preferenceDetail:'gluten free because of celiac disease'})]));
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-06',at:Date.now(),file:'g.pdf',rows:[{room:'1406',name:'Meyer,Anna,Mrs.',arr:'2026-11-03',dep:'2026-11-09',depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]}]}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');await __ev('bdiGMIngest')()});
 const N=()=>p.evaluate(()=>{__ev('_bdiGMProf=null');const P=__ev('bdiGMProfiles')().list.find(x=>/Meyer/.test(x.name));const I=__ev('bdiProfileInsights')(P);
   return {t:__ev('bdiProtelNotes')(P).map(n=>n.text).join('\n\n'),pend:I.pending.filter(i=>i.type==='pref').map(i=>i.note).join(' | '),gid:P.gid,acc:I.accepted.filter(i=>i.auto).map(i=>i.id)}});
 let A=await N();console.log(A.t.split('\n').map(x=>'    '+x).join('\n'));
 // varsayilan: eski kural
 ok(/unpacked the luggage/.test(A.t)&&/sleep ritual/.test(A.t)&&!/turndown/i.test(A.t.replace(/no turndown/i,''))&&!/by phone/.test(A.t),'varsayılan: Unpack ve Sleep Ritual not olur; Turndown ve Touch Call olmaz');
 // tercihler departmaninda
 ok(/\*\*\*HSK Preferences\*\*\*\n1- Guest prefers firm pillow\. \*\* 05\.11\.2026 CD/.test(A.t),'Pillow tercihi HSK Preferences altında, ilk kaydın tarihi ve butlerin baş harfleriyle');
 ok(/\*\*\*F&B Preferences\*\*\*\n1- Guest prefers vegetarian options at breakfast\. \*\* 05\.11\.2026 CD/.test(A.t),'Dietary tercihi F&B Preferences altında');
 ok(!/Butler Did It[\s\S]*firm pillow/.test(A.t.split('***Butler Did It***')[1]||''),'tercih Butler Did It\'e ayrıca yazılmıyor');
 ok(!/celiac|gluten/i.test(A.t)&&/celiac/.test(A.pend),'KVKK kelimesi olan tercih nota gitmiyor, onay bekliyor (düzeltilsin diye)');
 ok(!/firm pillow|vegetarian/.test(A.pend),'normal tercihler onay sırasında beklemiyor');
 // imza ertesi gun de ayni (Atolye'de "atildi" isareti kaybolmasin)
 await p.clock.fastForward('24:00:00');const A2=await N();
 ok(A2.t===A.t,'ertesi gün aynı not metni (imza tarihi sabit, Atölye işaretleri kaybolmaz)');
 // Ayarlar bolumu
 await p.evaluate(()=>{__ev('showPage("settings")')});await p.waitForTimeout(600);
 const S0=await p.evaluate(()=>{const L=[...document.querySelectorAll('#protelSkipActs input')];return {n:L.length,on:L.filter(x=>x.checked).map(x=>x.value).sort().join(','),idx:[...document.querySelectorAll('#swSetList .sw-set-chip')].some(b=>/Protel notuna girmeyen/.test(b.textContent))}});
 ok(S0.n>=10&&S0.on==='Laundry Delivery,Laundry Pickup,Touch Call,Turndown','Ayarlar: bütün işlemler kutu olarak; varsayılan işaretliler '+S0.on);
 ok(S0.idx,'Ayarlar dizininde "Protel notuna girmeyen işlemler" bölümü var');
 await p.evaluate(()=>{try{__ev('closeSetupModal()')}catch(e){}});await p.waitForTimeout(200);
 await p.click('#swSetList .sw-set-chip:has-text("Protel notuna girmeyen")');await p.waitForTimeout(700);
 await p.check('#protelSkipActs input[value="Unpack"]');await p.uncheck('#protelSkipActs input[value="Touch Call"]');await p.waitForTimeout(200);
 const B=await N();
 ok(!/unpacked the luggage/.test(B.t)&&/by phone/.test(B.t)&&/sleep ritual/.test(B.t),'Unpack işaretlenince nota girmiyor; Touch Call işareti kalkınca giriyor');
 const LS=await p.evaluate(()=>JSON.parse(localStorage.getItem('bdi_protel_skip')).sort().join(',')+' | sync:'+__ev('SETTINGS_SYNC_KEYS').includes('bdi_protel_skip'));
 ok(/Unpack/.test(LS)&&!/Touch Call/.test(LS)&&/sync:true/.test(LS),'seçim saklandı ve öteki bilgisayarlara gider ('+LS+')');
 // reddedilen tercih yazilmaz
 await p.evaluate(async([gid,iid])=>{await __ev('bdiInsightSet')(gid,iid,'rejected',{t:'x',dept:'HSK'})},[A.gid,A.acc.find(x=>/pillow/.test(x))]);
 const C=await N();ok(!/firm pillow/.test(C.t)&&/vegetarian/.test(C.t),'misafir kartında reddedilen tercih nottan çıkar');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
