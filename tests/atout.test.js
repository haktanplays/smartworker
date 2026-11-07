// Atolye > Protel'e girilecekler SATIR bazinda (2026-11-05): tarih araligi, atildi kutusu, toplu, evrensel, atilmayan kalir
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1366,height:1000}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-09T11:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-09');localStorage.setItem('sw_dayfix','2026-11-09');localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus','Onur Kaya']));localStorage.setItem('bdi_me','Deniz Karavus')});
 await p.reload();await p.waitForTimeout(1300);
 const LG=(id,b,room,g,act,note,d,t)=>({id,butler:b,room,guest:g,action:act,touchCategory:'Service',patternType:'service',note:note||'',time:t,sentence:'Butler '+b+' '+act.toLowerCase()+(note?' with '+note:'')+' for our guest '+g+' staying at Room '+room+'.',ts:new Date(d+'T'+t+':00+03:00').getTime(),countsAsTouch:true});
 const put=(day,arr)=>p.evaluate(async([day,arr])=>{const KV=__ev('BdiKV');const old=JSON.parse(KV.get('bdi_'+day)||'[]');KV.set('bdi_'+day,JSON.stringify(old.concat(arr)));await __ev('bdiGMIngest')();__ev('_bdiGMProf=null')},[day,arr]);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const Rw=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-09',at:Date.now(),file:'g.pdf',rows:[Rw('1802','Sato,Kenji,Mr.','2026-11-02','2026-11-12'),Rw('1203','Morel,Claire,Ms.','2026-11-03','2026-11-12')]}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()')});
 await put('2026-10-01',[LG('o1','Deniz Karavus','1802','Kenji Sato','Shoeshine','','2026-10-01','10:00')]); // 14 gunden eski: atilmis sayilir
 await put('2026-11-05',[LG('a1','Deniz Karavus','1802','Kenji Sato','Pack / Unpack','','2026-11-05','10:00')]);
 await put('2026-11-06',[LG('a2','Onur Kaya','1802','Kenji Sato','Amenity Delivery','a bonsai tree','2026-11-06','15:00'),LG('a3','Onur Kaya','1203','Claire Morel','Turndown','','2026-11-06','20:00')]);
 await put('2026-11-08',[LG('a4','Onur Kaya','1203','Claire Morel','Welcome / In-room Check-in','','2026-11-08','16:00')]);
 await p.evaluate(async()=>{const g=__ev('bdiGMGid')(__ev('bdiGuestKey')('Kenji Sato'));await __ev('bdiInsightSet')(g,'man:pref1','accepted',{t:'Prefers firm pillow',dept:'HSK',title:'Tercih',conf:3,by:'Deniz Karavus'});__ev('_bdiGMProf=null');__ev('showPage("didit")');__ev('switchBdiTab("atelier")')});
 await p.waitForTimeout(800);
 const U=()=>p.evaluate(()=>({badge:document.getElementById('bdiProtelCnt').textContent,mode:[...document.querySelectorAll('#bdiAtBody .bd-at-mode button')].map(b=>(b.classList.contains('active')?'*':'')+b.textContent.trim()).join(' | '),
   view:[...document.querySelectorAll('#bdiProtelBody .bd-pl-bar .bd-seg button')].map(b=>(b.classList.contains('active')?'*':'')+b.textContent.trim()).join(' | '),
   chips:[...document.querySelectorAll('#bdiProtelBody .bd-at-chips .bd-chip')].map(c=>(c.classList.contains('on')?'*':'')+c.textContent.trim()).join(' | '),
   groups:[...document.querySelectorAll('#bdiProtelBody .bd-pl-g')].map(g=>g.querySelector('.bd-pl-gh').innerText.replace(/\s+/g,' ').trim()+' :: '+[...g.querySelectorAll('.bd-pl-row')].map(r=>(r.querySelector('input').checked?'[x] ':'[ ] ')+r.innerText.replace(/\s+/g,' ').trim()).join(' / ')),
   foot:(document.querySelector('#bdiProtelBody .bd-pl-foot')||{}).innerText||''}));
 let S=await U();console.log('  '+JSON.stringify(S,null,1));
 ok(/^\*Protel'e girilecekler/.test(S.mode)&&/^\*Atılmadı 4/.test(S.view)&&S.badge==='4','Atölye açılınca girilecekler: 4 atılmamış satır, sekmede sayaç 4');
 ok(S.groups.length===2&&/^1203 Claire Morel otelde · 1 satır/.test(S.groups[0])&&/^1802 Kenji Sato otelde · 3 satır/.test(S.groups[1]),'misafir başlığı: oda · ad · otelde · satır sayısı (oda sırasıyla)');
 ok(/\[ \] 05\.11 Butler Did It .*pack/i.test(S.groups[1])&&/\[ \] 06\.11 Butler Did It .*bonsai/i.test(S.groups[1])&&/\[ \] 09\.11 HSK .*firm pillow/i.test(S.groups[1])&&!/01\.10/.test(S.groups[1]),'her satır: kutu · tarih · tür · metin; 14 günden eski (01.10) atılmış sayıldı');
 ok(/Hepsi 4/.test(S.chips)&&/Butler Did It 3/.test(S.chips)&&/Guest Preferences 1/.test(S.chips),'tür süzgeci: Hepsi 4 · Butler Did It 3 · Guest Preferences 1');
 // tarih araligi 5-6 kasim
 await p.fill('#bdiProtelBody .bd-pl-bar input[aria-label="Başlangıç"]','2026-11-05');await p.dispatchEvent('#bdiProtelBody .bd-pl-bar input[aria-label="Başlangıç"]','change');await p.waitForTimeout(500);
 await p.fill('#bdiProtelBody .bd-pl-bar input[aria-label="Bitiş"]','2026-11-06');await p.dispatchEvent('#bdiProtelBody .bd-pl-bar input[aria-label="Bitiş"]','change');await p.waitForTimeout(500);
 S=await U();console.log('  5-6 kasım: '+S.groups.join(' || ')+' | '+S.foot);
 ok(S.groups.length===1&&(S.groups[0].match(/\[ \]/g)||[]).length===2&&/Görünenlerin hepsi atıldı \(2\)/.test(S.foot)&&/05\.11 – 06\.11 arası/.test(S.foot),'05.11–06.11: yalnız o tarihlerin 2 satırı; en altta "Görünenlerin hepsi atıldı (2)"');
 // tek satir isaretle
 await p.click('#bdiProtelBody .bd-pl-row:has-text("bonsai") input');await p.waitForTimeout(700);
 S=await U();ok(S.badge==='3'&&!/bonsai/i.test(S.groups.join(' ')),'kutu işaretlenince satır "Atılmadı"dan çıktı, sayaç 3');
 await p.click('#bdiProtelBody .bd-pl-bar .bd-seg button:has-text("Atıldı")');await p.waitForTimeout(500);
 S=await U();console.log('  atıldı: '+S.groups.join(' || '));ok(/\[x\] 06\.11 Butler Did It .*bonsai.*atıldı 09\.11\.2026 · DK/i.test(S.groups.join(' ')),'"Atıldı" görünümünde: işaretli, kim ve ne zaman');
 await p.click('#bdiProtelBody .bd-pl-row:has-text("bonsai") input');await p.waitForTimeout(700);
 await p.click('#bdiProtelBody .bd-pl-bar .bd-seg button:has-text("Atılmadı")');await p.waitForTimeout(500);
 S=await U();ok(S.badge==='4'&&/bonsai/i.test(S.groups.join(' ')),'"Atıldı"da kutu kaldırılınca geri geldi (sayaç 4)');
 // toplu: 5-6 kasim arasi hepsi
 await p.click('#bdiProtelBody .bd-pl-foot button');await p.waitForTimeout(800);
 S=await U();ok(S.badge==='2'&&S.groups.length===0,'toplu: 05.11–06.11 arası 2 satır atıldı, aralık dışındakiler duruyor (sayaç 2)');
 await p.click('#bdiProtelBody .bd-pl-bar button:has-text("tüm tarihler")');await p.waitForTimeout(500);
 S=await U();ok(S.groups.length===2&&/Claire Morel.*08\.11/.test(S.groups.join(' '))&&/firm pillow/.test(S.groups.join(' '))&&!/unpack|bonsai/i.test(S.groups.join(' ')),'tüm tarihler: kalan 2 satır (08.11 Claire, 09.11 tercih)');
 // tur suzgeci + yeni touch + yeniden acma
 await p.click('#bdiProtelBody .bd-at-chips .bd-chip:has-text("Guest Preferences")');await p.waitForTimeout(400);
 S=await U();ok(S.groups.length===1&&/firm pillow/.test(S.groups[0]),'"Guest Preferences" süzgeci: yalnız tercih satırı');
 await p.click('#bdiProtelBody .bd-at-chips .bd-chip:has-text("Hepsi")');await p.waitForTimeout(300);
 await put('2026-11-09',[LG('a5','Deniz Karavus','1802','Kenji Sato','Amenity Delivery','orchids','2026-11-09','10:30')]);
 await p.reload();await p.waitForTimeout(1300);await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("atelier")')});await p.waitForTimeout(800);
 S=await U();ok(S.badge==='3'&&/09\.11 Butler Did It .*orchids/i.test(S.groups.join(' '))&&!/bonsai|unpack/i.test(S.groups.join(' ')),'yeni touch yeni satır olarak geldi; atılmış satırlar sayfa yenilense de atılmış (sayaç 3)');
 // blok bazinda "Girildi" (notlari ac penceresi) o blogun satirlarini da isaretler
 await p.evaluate(()=>{const g=__ev('bdiGMGid')(__ev('bdiGuestKey')('Claire Morel'));return __ev('bdiProtelMark')(g,['Butler Did It'],true)});await p.waitForTimeout(800);
 S=await U();ok(S.badge==='2'&&!/Claire/.test(S.groups.join(' ')),'"Notları aç"ta blok Girildi -> o bloğun satırları da atıldı');
 // Gelen notlar: ayni tarih araligi
 await p.click('#bdiAtBody .bd-at-mode button:has-text("Gelen notlar")');await p.waitForTimeout(600);
 await p.fill('#bdiAtPWho','1802');await p.fill('#bdiAtPTxt',['***BUTLER DID IT***','1- Butler arranged a cake for the anniversary ** 12.10.2026 DK','2- Butler prepared a bubble bath ** 06.11.2026 OK'].join('\n'));await p.click('#bdiAtBody .bd-at-paste button');await p.waitForTimeout(700);
 const rowsIn=()=>p.evaluate(()=>[...document.querySelectorAll('#bdiAtBody .bd-at-row .bd-at-raw')].map(x=>x.textContent));
 let IN=await rowsIn();
 await p.fill('#bdiAtBody .bd-toolbar input[aria-label="Başlangıç"]','2026-11-01');await p.dispatchEvent('#bdiAtBody .bd-toolbar input[aria-label="Başlangıç"]','change');await p.waitForTimeout(600);
 const IN2=await rowsIn();console.log('  gelen: '+IN.length+' -> '+IN2.join(' | '));
 ok(IN.length===2&&IN2.length===1&&/bubble bath/.test(IN2[0]),'"Gelen notlar"da da aynı tarih süzgeci: 01.11 sonrası yalnız 06.11 satırı');
 await p.evaluate(()=>{__ev('bdiPlSet')('clr');__ev('bdiAtSetMode')('out')});await p.waitForTimeout(600);
 await (await p.$('#bdiTab_atelier')).screenshot({path:__dirname+'/ui/at_out.png'});
 // performans: demo boyutunda degil ama tek cizim suresi
 const ms=await p.evaluate(async()=>{const t=performance.now();await __ev('renderBdiAtelier')();return Math.round(performance.now()-t)});console.log('  çizim '+ms+' ms');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
