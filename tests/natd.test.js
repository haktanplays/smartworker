// Ozel gunler v2 (2026-11-05): kural (2.Paz.05, son.Paz.11, 4.Per.11), "*" tum uyruklar, yeni ulkeler, kayitli listeye yeni gunler
const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1400,height:1000}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-05T09:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 // eski surumde kaydedilmis liste (41 gun, Thanksgiving tek seferlik 2026-11-26) + kullanicinin kendi duzenlemesi
 const OLD=await p.evaluate(()=>{const D=__ev('bdiCfgDef')('bdi_natdays').filter(x=>x.v!==2).map(x=>{const o=Object.assign({},x);return o});
   D.push({d:'2026-11-26',c:'US',l:'Şükran Günü (Thanksgiving)',g:''});D.find(x=>x.c==='QA').g='Bizim katar jestimiz';return D});
 await p.evaluate(o=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-05');localStorage.setItem('sw_dayfix','2026-11-05');localStorage.setItem('bdi_natdays',JSON.stringify(o))},OLD);
 await p.reload();await p.waitForTimeout(1200);
 // 1) kurallar
 const R=await p.evaluate(()=>{const h=__ev('bdiNatRuleHit'),f=(r,from,to)=>{const o=[];for(let d=from;d<=to;d=__ev('bdiAddDays')(d,1))if(h(r,d))o.push(d);return o.join(',')};
   return {anne26:f('2.Paz.05','2026-05-01','2026-05-31'),anne27:f('2.Paz.05','2027-05-01','2027-05-31'),tg26:f('4.Per.11','2026-11-01','2026-11-30'),tg27:f('4.Per.11','2027-11-01','2027-11-30'),
     ru26:f('son.Paz.11','2026-11-01','2026-11-30'),fr26:f('son.Paz.05','2026-05-01','2026-05-31'),baba26:f('3.Paz.06','2026-06-01','2026-06-30'),ca26:f('2.Pzt.10','2026-10-01','2026-10-31'),
     car:f('1.Çar.01','2027-01-01','2027-01-31'),bad:h('5.Xyz.05','2026-05-10'),plain:h('05.05','2026-05-05')}});
 console.log('  '+JSON.stringify(R));
 ok(R.anne26==='2026-05-10'&&R.anne27==='2027-05-09','Anneler Günü "2.Paz.05": 10.05.2026, 09.05.2027 (her yıl kendiliğinden)');
 ok(R.tg26==='2026-11-26'&&R.tg27==='2027-11-25','Thanksgiving "4.Per.11": 26.11.2026, 25.11.2027');
 ok(R.ru26==='2026-11-29'&&R.fr26==='2026-05-31'&&R.baba26==='2026-06-21'&&R.ca26==='2026-10-12'&&R.car==='2027-01-06','son pazar / 3. pazar / 2. pazartesi / Çar doğru');
 ok(R.bad===false&&R.plain===null,'tanınmayan gün adı eşleşmez; gg.aa kural sayılmaz');
 // 2) kayitli liste: yeni gunler eklendi, kullanicinin duzenlemesi korundu, Thanksgiving cift degil
 const M=await p.evaluate(()=>{const L=__ev('bdiCfg')('bdi_natdays');const ev=__ev('bdiNatDays')('2026-11-01','2026-11-30').map(e=>e.d.slice(8)+' '+e.x.l);
   return {n:L.length,qa:L.find(x=>x.c==='QA'&&/Katar Ulusal/.test(x.l)).g,tg:ev.filter(x=>/Thanksgiving/.test(x)).join(','),up:localStorage.getItem('bdi_natdays_up'),star:L.filter(x=>x.c==='*').map(x=>x.l).join(','),nov:ev}});
 console.log('  kasım: '+M.nov.join(' · '));
 ok(M.n===114&&M.up==='2','eski kayıtlı listeye 73 yeni gün eklendi (41+73=114), bir kez');
 ok(M.qa==='Bizim katar jestimiz','kullanıcının düzenlediği jest korundu');
 ok(M.tg==='26 Şükran Günü (Thanksgiving)','eski tek seferlik + yeni kural Thanksgiving: aynı gün bir kez');
 ok(/Yeni Yıl/.test(M.star)&&/Sevgililer Günü/.test(M.star)&&/Dünya Kadınlar Günü/.test(M.star),'herkes için (*): '+M.star);
 await p.reload();await p.waitForTimeout(900);
 ok(await p.evaluate(()=>(__ev('bdiNatDays')('2026-01-01','2026-01-01'),__ev('bdiCfg')('bdi_natdays').length))===114,'yeniden açınca tekrar eklenmiyor');
 // yeni kullanici (kayit yok): varsayilan 113 gun
 const FRESH=await p.evaluate(()=>{const raw=localStorage.getItem('bdi_natdays');localStorage.removeItem('bdi_natdays');const n=__ev('bdiCfg')('bdi_natdays').length;const y=__ev('bdiNatDays')('2027-01-01','2027-12-31').length;localStorage.setItem('bdi_natdays',raw);return {n,y}});
 ok(FRESH.n===113&&FRESH.y===112,'kayıt yoksa 113 varsayılan gün; 2027 yılında '+FRESH.y+' gün çıkıyor');
 // 3) "*" ve yeni ulkeler: OSR satirlari
 const E=await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   const r=(name,nat,arr,dep)=>({name,nat,c:'',arr,dep,k:'',s:''});
   KV.set('bdi_osr_v1',JSON.stringify({at:Date.now(),file:'osr.pdf',arrFrom:'2026-11-01',arrTo:'2026-11-30',rows:[r('Novak, Jan','Czech Republic','2026-10-26','2026-10-30'),r('Svoboda, Eva','CZE','2026-10-27','2026-10-29'),
     r('Ozols, Peteris','Latvia','2026-11-16','2026-11-20'),r('Ivleva, Olga','Russian Federation','2026-11-27','2026-12-01'),r('Smith, John','United States','2026-11-25','2026-11-28'),r('Al Busaidi, Salim','Oman','2026-11-19','2026-11-22'),r('Yilmaz, Ayse','Turkey','2026-12-30','2027-01-03')].map(x=>Object.assign(x,{c:x.nat==='CZE'?'CZE':''})).concat([{name:'Old, Row',nat:'Czech Republic',c:'CZE',arr:'2026-10-27',dep:'2026-10-29',k:'',s:''}])}));
   const ev=(a,b)=>__ev('bdiNatEvents')(a,b).filter(e=>e.inh.length).map(e=>e.d.slice(5)+' '+e.name+' '+e.inh.length+(e.all?' *':''));
   return {oct:ev('2026-10-28','2026-10-28'),nov:ev('2026-11-01','2026-11-30'),ny:ev('2026-12-31','2027-01-01'),norm:['Czech Republic','Latvia','Viet Nam','North Macedonia','Sri Lanka'].map(x=>__ev('bdiNatNorm')(x).c).join(',')}});
 console.log('  '+JSON.stringify(E));
 ok(E.norm==='CZ,LV,VN,MK,LK','yeni ülkeler tanınıyor: '+E.norm);
 ok(E.oct.join()==='10-28 Çekya Devlet Günü 3','28.10 Çekya: 3 kişi (eski içe almada "CZE" kodlu kayıt da sayıldı)');
 ok(E.nov.some(x=>/^11-18 Letonya Bağımsızlık Günü 1/.test(x))&&E.nov.some(x=>/^11-20 Umman Ulusal Günü 1/.test(x))&&E.nov.some(x=>/^11-26 Şükran Günü \(Thanksgiving\) 1/.test(x))&&E.nov.some(x=>/^11-29 Anneler Günü \(Rusya\) 1/.test(x)),'kasım: Letonya, Umman, Thanksgiving (kural), Rusya Anneler Günü (son pazar)');
 ok(E.ny.join()==='01-01 Yeni Yıl 1 *','Yeni Yıl (*): o gece otelde olan herkes sayıldı');
 // 4) ekran: "*" gunu "tum uyruklar" etiketi; ayarlar ipucu
 await p.clock.setFixedTime(new Date('2026-12-29T10:00:00+03:00'));
 await p.evaluate(()=>{__ev('showPage("didit")');__ev('switchBdiTab("nat")')});await p.waitForTimeout(300);
 const UI=await p.evaluate(()=>{const d=[...document.querySelectorAll('#bdiNatBody details.bd-nat-ev')].find(x=>/Yeni Yıl/.test(x.textContent));return {t:d?d.querySelector('summary').innerText.replace(/\s+/g,' '):'',open:d?d.open:null,w:__ev('swWarnCollect')().filter(x=>x.g==='Özel günler').map(x=>x.t)}});
 console.log('  '+JSON.stringify(UI));
 ok(/tüm uyruklar/.test(UI.t)&&UI.open===false&&UI.w.some(x=>/Yeni Yıl \(3 gün sonra\): (en az )?1 misafir/.test(x)),'Yeni Yıl: "tüm uyruklar", liste kapalı gelir; 3 gün kala Uyarılar\'da');
 await p.evaluate(()=>__ev('showPage("settings")'));await p.waitForTimeout(300);
 const H=await p.evaluate(()=>{const el=document.getElementById('bdiCfg_natd');return {hint:el.parentNode.querySelector('.hint').textContent,rows:el.querySelectorAll('input[data-f="d"]').length}});
 ok(/2\.Paz\.05/.test(H.hint)&&/herkes için \*/.test(H.hint)&&H.rows===114,'Ayarlar: ipucu kuralı ve * anlatıyor; 114 satır');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
