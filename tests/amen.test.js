// Atolye yapistirma + Uyruklar amenity maili / Excel (2026-11-05)
const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000},acceptDownloads:true,permissions:['clipboard-read','clipboard-write']});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-29T10:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-29');localStorage.setItem('sw_dayfix','2026-11-29');localStorage.setItem('kw_butler',JSON.stringify(['Deniz Karavus']));localStorage.setItem('bdi_me','Deniz Karavus')});
 await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const Rw=(room,name,arr,dep)=>({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]});
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-29',at:Date.now(),file:'g.pdf',rows:[Object.assign(Rw('1203','Al Mazrouei,Khalid,Mr.','2026-11-27','2026-12-04'),{acc:['Noura Al Mazrouei']}),Rw('1505','Al Hashimi,Omar,Mr.','2026-11-28','2026-12-03'),Rw('0901','Al Suwaidi,Mariam,Ms.','2026-11-25','2026-12-02'),Rw('1802','Sato,Kenji,Mr.','2026-11-26','2026-12-05')]}));
   __ev('_bdiGih=null');__ev('rebuildVacRooms()');__ev('bdiDayHistReset()');
   const r=(name,nat,arr,dep)=>({name,nat,c:'',arr,dep,k:'',s:''});
   KV.set('bdi_osr_v1',JSON.stringify({at:Date.now(),file:'osr.pdf',arrFrom:'2026-11-01',arrTo:'2026-12-03',rows:[
     r('Al Mazrouei, Khalid','United Arab Emirates','2026-11-27','2026-12-04'),r('Al Mazrouei, Noura','United Arab Emirates','2026-11-27','2026-12-04'),
     r('Al Hashimi, Omar','UAE','2026-11-28','2026-12-03'),r('Al Kaabi, Saeed','United Arab Emirates','2026-12-02','2026-12-06'),r('Al Kaabi, Fatima','United Arab Emirates','2026-12-02','2026-12-06'),
     r('Al Suwaidi, Mariam','United Arab Emirates','2026-11-25','2026-12-02'),r('Volkova, Anastasia','Russia','2026-11-28','2026-12-01')]}));
   __ev('showPage("didit")');__ev('switchBdiTab("nat")')});
 await p.waitForTimeout(400);
 // ---- 1) amenity sayisi ----
 const S=await p.evaluate(()=>{const d=[...document.querySelectorAll('#bdiNatBody details.bd-nat-ev')].find(x=>/BAE Ulusal/.test(x.textContent));return {sum:d?d.querySelector('summary').innerText.replace(/\s+/g,' '):'',act:d?d.querySelector('.bd-nat-act').innerText.replace(/\s+/g,' '):''}});
 console.log('  '+S.sum+'\n  '+S.act);
 ok(/5 kişi otelde · 3 amenity/.test(S.sum),'02.12 BAE: 5 kişi, 3 amenity (aynı odadaki çift tek amenity, odası belli olmayan aile tek amenity, o sabah çıkan sayılmadı)');
ok(/3 amenity \(oda başına bir\) · 0 atıldı · 3 bekliyor/.test(S.act),'kartta sayaç: 3 amenity · 0 atıldı · 3 bekliyor');
 const ROWS=()=>p.evaluate(()=>{const d=[...document.querySelectorAll('#bdiNatBody details.bd-nat-ev')].find(x=>/BAE Ulusal/.test(x.textContent));return {open:d.open,rows:[...d.querySelectorAll('.bd-nat-am')].map(r=>r.querySelector('.bd-nat-am-r').textContent+' | '+r.querySelector('.bd-nat-am-n').textContent+' | '+(r.querySelector('button.y.on')?'✓':r.querySelector('button.n.on')?'✗':'-')),act:d.querySelector('.bd-nat-act').innerText.replace(/\s+/g,' ')}});
 let RW=await ROWS();console.log('  '+RW.rows.join('\n  '));
 ok(RW.rows.join('|')==='1203 | Al Mazrouei Khalid, Noura | -|1505 | Al Hashimi Omar | -|atanmadı | Al Kaabi Saeed, Fatima | -','kartta oda listesi: oda · soyisim · isim (çift tek satır, odası atanmamış aile sonda)');
 // 1505'e ✗, 1203'e ✓ (bir kez yanlis basip geri alma dahil)
 const bae=await p.evaluate(()=>__ev('_bdiNatEvC').findIndex(e=>/BAE/.test(e.name)));
 await p.click('#bdiNatBody details[data-ix="'+bae+'"] .bd-nat-am >> nth=1 >> button.n');await p.waitForTimeout(150);
 await p.click('#bdiNatBody details[data-ix="'+bae+'"] .bd-nat-am >> nth=0 >> button.n');await p.waitForTimeout(150);
 await p.click('#bdiNatBody details[data-ix="'+bae+'"] .bd-nat-am >> nth=0 >> button.n');await p.waitForTimeout(150);
 await p.click('#bdiNatBody details[data-ix="'+bae+'"] .bd-nat-am >> nth=0 >> button.y');await p.waitForTimeout(150);
 RW=await ROWS();console.log('  '+RW.rows.join('\n  ')+'\n  '+RW.act);
 ok(RW.rows[0].endsWith('✓')&&RW.rows[1].endsWith('✗')&&RW.rows[2].endsWith('-')&&RW.open&&/1 atıldı · 1 atılmadı · 1 bekliyor/.test(RW.act),'✓ / ✗ işaretlendi (aynı düğmeye tekrar basınca kalkar), kart açık kaldı, sayaç 1 atıldı · 1 atılmadı · 1 bekliyor');
 await p.reload();await p.waitForTimeout(1300);await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("nat")')});await p.waitForTimeout(400);
 RW=await ROWS();ok(RW.rows[0].endsWith('✓')&&RW.rows[1].endsWith('✗'),'işaretler sayfa yenilenince duruyor');
 // ---- 2) mail taslagi ----
 const ix=await p.evaluate(()=>__ev('_bdiNatEvC').findIndex(e=>/BAE/.test(e.name)));
 await p.evaluate(i=>__ev('bdiNatMailOpen')(i),ix);await p.waitForTimeout(200);
 const M=await p.evaluate(()=>({s:document.getElementById('bdiNatMailS').value,b:document.getElementById('bdiNatMailB').value,on:document.getElementById('bdiNatMailModal').classList.contains('on')}));
 console.log('  Konu: '+M.s+'\n'+M.b.split('\n').map(x=>'  | '+x).join('\n'));
 ok(M.on&&M.s==='BAE Ulusal Günü · 3 adet amenity','konu: "BAE Ulusal Günü · 3 adet amenity"');
 ok(M.b==='Merhaba,\n\n2 Aralık tarihinde kutlanacak olan BAE Ulusal Günü için özel olarak 3 adet amenity yapılmasını rica ederiz.\n\nSaygılarımızla,','metin örnekteki gibi tek cümle: tarih, vesile, adet');
 await p.fill('#bdiNatMailB',M.b.replace('adet amenity','adet pasta'));await p.click('#bdiNatMailModal button:has-text("Kopyala")');await p.waitForTimeout(200);
 const clip=await p.evaluate(()=>navigator.clipboard.readText());
 ok(/3 adet pasta yapılmasını/.test(clip),'düzeltilen metin ("pasta") kopyalandı');
 await p.screenshot({path:__dirname+'/ui/nat_mail.png'});
 // ---- 3) Excel (tek gun ve tumu) ----
 const rd=async(click)=>{const dl=p.waitForEvent('download');await click();const d=await dl;const f=__dirname+'/out/'+d.suggestedFilename();await d.saveAs(f);
   const b64=fs.readFileSync(f).toString('base64');return {name:d.suggestedFilename(),x:await p.evaluate(b=>{const wb=XLSX.read(b,{type:'base64'});const o={};wb.SheetNames.forEach(n=>o[n]=XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,defval:''}));return o},b64)}};
 const X1=await rd(()=>p.click('#bdiNatMailModal button:has-text("Excel")'));
 console.log('  '+X1.name+' '+JSON.stringify(X1.x).slice(0,600));
 const trim=r=>{r=r.slice();while(r.length&&r[r.length-1]==='')r.pop();return r};const sh1=Object.keys(X1.x),R1=(X1.x[sh1[0]]||[]).map(trim);
 ok(X1.name==='Amenity_2026-12-02_BAE_Ulusal_Gunu.xlsx'&&sh1.length===1&&sh1[0]==='02.12 BAE Ulusal Günü','tek gün Excel: tek sayfa "02.12 BAE Ulusal Günü"');
 ok(JSON.stringify(R1)===JSON.stringify([['02.12.2026 Çarşamba · BAE Ulusal Günü · 3 amenity'],[],['Oda','Soyisim','İsim','Atıldı (✓ / ✗)'],['1203','Al Mazrouei','Khalid, Noura','✓'],['1505','Al Hashimi','Omar','✗'],['atanmadı','Al Kaabi','Saeed, Fatima']]),'Excel: Oda | Soyisim | İsim | Atıldı (✓ / ✗); işaretlenenler dolu, bekleyen boş');
 await p.evaluate(()=>__ev('bdiNatMailClose')());
 const X2=await rd(()=>p.click('#bdiNatBody button:has-text("Tüm amenity listesi (Excel)")'));
 const sh2=Object.keys(X2.x);console.log('  '+X2.name+' sayfalar: '+sh2.join(' | '));
 ok(/^Amenity_2026-11-29_2026-12-0\d\.xlsx$/.test(X2.name)&&sh2[0]==='29.11 Anneler Günü (Rusya)'&&sh2.indexOf('02.12 BAE Ulusal Günü')>0&&X2.x[sh2[0]][3].join('|')==='atanmadı|Volkova|Anastasia|','tümü Excel: her özel gün ayrı sayfa (29.11 Rusya Anneler Günü: Volkova Anastasia, oda atanmadı)');
 await (await p.$('#bdiTab_nat')).screenshot({path:__dirname+'/ui/nat_amen.png'});
 // ---- 4) Atolye: profil notu yapistir ----
 await p.evaluate(()=>{__ev('_bdiAtMode="in"');__ev('switchBdiTab("atelier")')});await p.waitForTimeout(600);
 const vis=await p.evaluate(()=>{const b=document.querySelector('#bdiAtBody .bd-at-paste');return b?b.innerText.replace(/\s+/g,' '):''});
 ok(/Profil notunu yapıştır/.test(vis),'Atölye en üstte "Profil notunu yapıştır" kutusu: '+vis.slice(0,80));
 const NOTE=['***BUTLER DID IT***','1- Butler welcomed the guest with in-room check-in. ** 12.10.2026 DK','2- Butler placed a birthday cake for daughter Ayla','in the room before dinner. ** 13.10.2026 DK','***PREFERENCES***','* Guest prefers still water at room temperature ** 12.10.2026 DK','Guest Issues Recorded:','1- Noise from the corridor at night. ** 14.10.2026 BK'].join('\n');
 await p.fill('#bdiAtPWho','1802');await p.fill('#bdiAtPTxt',NOTE);await p.click('#bdiAtBody .bd-at-paste button:has-text("Atölye\'ye al")');await p.waitForTimeout(700);
 const A1=await p.evaluate(()=>({q:document.querySelector('#bdiAtBody input[type=search]').value,rows:[...document.querySelectorAll('#bdiAtBody .bd-at-g')].filter(g=>/Kenji Sato/.test(g.textContent)).map(g=>[...g.querySelectorAll('.bd-at-row')].map(r=>(r.querySelector('select')||{}).value+' | '+(r.querySelector('.bd-at-raw')||{}).textContent))[0]||[],head:([...document.querySelectorAll('#bdiAtBody .bd-at-gh')].find(g=>/Kenji Sato/.test(g.textContent))||{}).textContent||'',toast:(document.querySelector('.bd-toast')||{}).textContent||''}));
 console.log('  '+A1.head.replace(/\s+/g,' ')+'\n  '+A1.rows.join('\n  ')+'\n  toast: '+A1.toast);
 ok(A1.q==='Kenji Sato'&&A1.rows.length===4,'oda 1802 ile yapıştırıldı: misafir Kenji Sato, 4 satır, arama ona ayarlı');
 ok(A1.rows[0].startsWith('did |')&&A1.rows[1].startsWith('did |')&&/before dinner/.test(A1.rows[1])&&A1.rows[2].startsWith('pref |')&&A1.rows[3].startsWith('iss |'),'satırlar blok başlığına göre doğru alanda: ***BUTLER DID IT*** altındakiler Butler Did It (iki satırlık not birleşti) · Tercih · Issue');
 ok(/1802/.test(A1.head)&&/yapıştırılan/.test(A1.head),'grup başlığında oda ve "yapıştırılan"');
 // hafizaya al
 await p.click('#bdiAtBody .bd-at-g:has-text("Kenji Sato") .bd-at-row >> nth=2 >> button.bd-btn-primary');await p.waitForTimeout(600);
 const DNA=await p.evaluate(()=>{const gid=__ev('bdiGMGid')(__ev('bdiGuestKey')('Kenji Sato'));const it=(__ev('bdiDnaOf')(gid).items)||{};return Object.keys(it).map(k=>it[k]).filter(x=>!x.del).map(x=>x.sec+'|'+x.dept+'|'+x.t)});
 console.log('  hafıza: '+DNA.join(' ; '));
 ok(DNA.length===1&&/still water at room temperature/.test(DNA[0]),'✓ ile tercih misafir hafızasına girdi');
 console.log('  IDBdbg: '+JSON.stringify(await p.evaluate(async()=>{const d=await __ev('_gmGetMeta')('dna');const g='g_kenji sato';return {has:!!(d&&d[g]),n:d&&d[g]?Object.keys(d[g].items||{}).length:-1,keys:d?Object.keys(d).length:-1}})));
 // isimle (otelde olmayan eski misafir) + hatali oda
 await p.fill('#bdiAtPWho','0707');await p.fill('#bdiAtPTxt','* Guest prefers feather pillows');await p.click('#bdiAtBody .bd-at-paste button:has-text("Atölye\'ye al")');await p.waitForTimeout(300);
 const T2=await p.evaluate(()=>(document.querySelector('.bd-toast')||{}).textContent||'');
 ok(/Odada misafir bulunamadı: 0707/.test(T2),'boş oda: "misafirin adını yaz" uyarısı');
 await p.fill('#bdiAtPWho','Al Fardan, Hamad');await p.click('#bdiAtBody .bd-at-paste button:has-text("Atölye\'ye al")');await p.waitForTimeout(600);
 const A2=await p.evaluate(()=>({q:document.querySelector('#bdiAtBody input[type=search]').value,n:[...document.querySelectorAll('#bdiAtBody .bd-at-g')].filter(g=>/Hamad Al Fardan/.test(g.textContent)).map(g=>g.querySelectorAll('.bd-at-row').length)[0]||0}));
 ok(A2.q==='Hamad Al Fardan'&&A2.n===1,'isimle yapıştırma (otelde olmayan eski misafir): "Al Fardan, Hamad" -> Hamad Al Fardan, 1 satır');
 // tekrar yapistirinca cift yok, yeniden acinca kalir
 await p.fill('#bdiAtPWho','1802');await p.fill('#bdiAtPTxt',NOTE);await p.click('#bdiAtBody .bd-at-paste button:has-text("Atölye\'ye al")');await p.waitForTimeout(600);
 await p.reload();await p.waitForTimeout(1300);await p.evaluate(()=>{__ev('showPage("didit")');__ev('_bdiAtQ="Kenji"');__ev('_bdiAtMode="in"');__ev('switchBdiTab("atelier")')});await p.waitForTimeout(700);
 const A3=await p.evaluate(()=>[...document.querySelectorAll('#bdiAtBody .bd-at-g')].filter(g=>/Kenji Sato/.test(g.textContent)).map(g=>g.querySelectorAll('.bd-at-row').length)[0]||0);console.log('  DNAdbg: '+JSON.stringify(await p.evaluate(()=>{const g=__ev('bdiGMGid')(__ev('bdiGuestKey')('Kenji Sato'));const it=__ev('bdiDnaOf')(g).items||{};const c=__ev('bdiAtCandidates')().filter(c=>/still water/.test(c.raw));return {g,items:Object.keys(it).map(k=>k+':'+(it[k].del?'del':'ok')+':'+it[k].u),cand:c.map(x=>x.id+'|'+x.gid),imp:JSON.stringify(((__ev('_bdiGM').imp||{})[g])||{})}})));console.log('  A3c: '+JSON.stringify(await p.evaluate(()=>__ev('bdiAtCandidates')().filter(c=>/Kenji/.test(c.name)).map(c=>c.st+'|'+c.src+'|'+c.f+'|'+c.raw.slice(0,50)))));console.log('  A3dbg: '+await p.evaluate(()=>[...document.querySelectorAll('#bdiAtBody .bd-at-g .bd-at-gh')].map(x=>x.textContent.replace(/\s+/g,' ')).join(' || ')+' :: view='+__ev('_bdiAtView')+' q='+__ev('_bdiAtQ')+' mode='+__ev('_bdiAtMode')));
 ok(A3===3,'aynı not ikinci kez yapıştırılınca çift satır yok; sayfa yenilenince bekleyen 3 satır duruyor (1 tanesi hafızada)');
 await p.evaluate(()=>{__ev('_bdiAtQ=""');__ev('renderBdiAtelier()')});await p.waitForTimeout(500);
 await (await p.$('#bdiTab_atelier')).screenshot({path:__dirname+'/ui/at_paste.png'});
 // kaydi olmayan eski misafir: onaylanan not Protel'e girilecekler'e duser (profil yalniz hafizadan)
 const MO=await p.evaluate(async()=>{const c=__ev('bdiAtCandidates')().find(c=>/feather pillows/.test(c.raw));await __ev('bdiAtDecide')([c.id],'a');__ev('_bdiGMProf=null');const g=__ev('bdiGMGid')(__ev('bdiGuestKey')('Hamad Al Fardan'));const P=__ev('bdiGMProfiles')().byGid[g];
   return {prof:!!P&&P.memOnly===true&&P.name,pl:__ev('bdiPlRows')().filter(r=>r.p.gid===g&&r.st.s==='p').map(r=>r.L.block+'|'+r.L.t)}});
 console.log('  '+JSON.stringify(MO));
 ok(MO.prof&&MO.pl.length===1&&/^Guest Preferences\|Guest prefers feather pillows/.test(MO.pl[0]),'kaydı olmayan eski misafir (Hamad Al Fardan): onaylanan not misafir hafızasında ve Protel\'e girilecekler\'de');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
