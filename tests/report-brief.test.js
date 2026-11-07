// Brifing ustundeki "Sözlü bildirim" satiri ve Kayit hizli girisi (oda listesi sahte in-house raporundan): butler adi satirin basinda
// ("beyza", "beyza nur"), sonunda @ad ya da bas harfle; kayit bugune yazilir, brifing (cikislar) aninda guncellenir, Kayit'taki secili
// butler degismez. Isimler kurgu (KVKK). (Gercek raporlu briefpow testinin yerine, 2026-11-07.)
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',Y='2026-11-05',J=JSON.stringify;
const B=['Beyza Nur Çırak','Lale Aydın','Mert Kaya'];

(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'15:00',butlers:B,me:'Mert Kaya'});
 await H.ingest(p,await R.gih({day:D,time:'06:00',rows:[{room:'1108',name:'Arden,Iris,Mx.',arr:'2026-11-03',dep:'2026-11-09'},{room:'1109',name:'Bellamy,Jonah,Mr.',arr:Y,dep:'2026-11-09'},
   {room:'1705',name:'Corvin,Kestrel,Mx.',arr:'2026-11-02',dep:D,depTime:'18:00'}]},br),'GIH01102.pdf');
 const P=s=>p.evaluate(s=>{const r=__ev('bdiParsePowerLine')(s);return r?[r.butler||'-',(r.rooms||[]).join(','),r.actionLabel||r.error,r.note||''].join(' · '):null},s);
 ok(await P('beyza 1108 sleep ritual lavanta')==='Beyza Nur Çırak · 1108 · Sleep Ritual · lavanta','"beyza 1108 sleep ritual lavanta" -> Beyza · 1108 · Sleep Ritual · lavanta');
 ok(await P('beyza nur 1108 turndown')==='Beyza Nur Çırak · 1108 · Turndown · ','"beyza nur 1108 turndown" (iki kelimelik ad)');
 ok(await P('1108 turndown @lale')==='Lale Aydın · 1108 · Turndown · ','"... @lale" -> Lale');
 ok(await P('1108 turndown LA')==='Lale Aydın · 1108 · Turndown · ','"... LA" baş harf -> Lale');
 ok(await P('1108 turndown BN')==='Beyza Nur Çırak · 1108 · Turndown · ','"... BN" -> Beyza Nur Çırak');
 ok(await P('mert 1108,1109 turndown')==='Mert Kaya · 1108,1109 · Turndown · ','çoklu oda + butler');
 ok(await P('1108 turndown lale')==='- · 1108 · Turndown · lale','butlersiz satır eskisi gibi çalışır (sondaki düz "lale" not sayılır)');

 // Brifing
 await H.tab(p,'entry');await p.selectOption('#bdiButler','Mert Kaya');
 await p.evaluate(()=>{__ev('switchBdiTab("brief")');__ev('bdiBriefSetMode("feed")')});await p.waitForTimeout(500); // sekme degisimi (showPage sayfayi yeniden kurar)
 ok(await p.evaluate(()=>!!document.getElementById('bdiBriefPower')),'Brifing üstünde "Sözlü bildirim" satırı');
 const dep=()=>p.evaluate(()=>{const r=[...document.querySelectorAll('#bdiBriefBody .bd-fd-row')].find(b=>/1705/.test((b.querySelector('.bd-fd-main')||{}).textContent||''));return r?r.textContent.replace(/\s+/g,' '):''});
 const d0=await dep();
 ok(/konaklamada hiç temas yok/.test(d0),'önce: 1705 çıkış "konaklamada hiç temas yok" ('+d0+')');
 await p.fill('#bdiBriefPower','1705 touch call @lale');await p.waitForTimeout(150);
 const hint=await p.evaluate(()=>document.getElementById('bdiBriefPowerHint').textContent);
 await p.press('#bdiBriefPower','Enter');await p.waitForTimeout(800);
 const d1=await dep(),L1=await p.evaluate(d=>__ev('loadBdiArrayForDate')(d).filter(l=>l.room==='1705'||l.room==='705').map(l=>l.butler+'|'+l.action),D);
 ok(/Lale Aydın/.test(hint)&&L1.join()==='Lale Aydın|Touch Call'&&/yalnız bugün temas/.test(d1),'brifing anında güncellendi: 1705 artık dokunulmamış değil ('+d1+')');
 const sb=await p.evaluate(()=>document.getElementById('bdiButler').value);
 ok(sb==='Mert Kaya','Kayıt sekmesindeki seçili butler değişmedi (Mert Kaya; şimdi: '+sb+')');
 ok(await p.evaluate(()=>document.activeElement&&document.activeElement.id==='bdiBriefPower'),'imleç tekrar satırda (peş peşe giriş)');
 await p.fill('#bdiBriefPower','1108 turndown');await p.waitForTimeout(150);
 ok(/Butler adını yaz/.test(await p.evaluate(()=>document.getElementById('bdiBriefPowerHint').textContent)),'butlersiz satırda uyarı');
 await p.fill('#bdiBriefPower','');
 // Kayit hizli girisi
 await p.evaluate(()=>__ev('switchBdiTab("entry")'));await p.waitForTimeout(300);
 await p.evaluate(()=>{document.getElementById('bdiPowerLine').value='beyza 1108 turndown';__ev('bdiPowerSubmit()')});await p.waitForTimeout(500);
 const L2=await p.evaluate(d=>__ev('loadBdiArrayForDate')(d).filter(l=>/1108/.test(l.room)).map(l=>l.butler+'|'+l.action),D);
 const sb2=await p.evaluate(()=>document.getElementById('bdiButler').value);
 ok(L2.join()==='Beyza Nur Çırak|Turndown'&&sb2==='Mert Kaya','Kayıt hızlı girişi: Beyza adına kaydetti, seçili butler Mert kaldı '+J({L2,sb2}));
 await done();
})();
