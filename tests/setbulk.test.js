const {chromium}=require('playwright');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:1400,height:1000},deviceScaleFactor:1.5});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2099-01-01');localStorage.setItem('kw_butler',JSON.stringify(['Zafer Karagaçtı']))});await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(()=>{try{__ev('closeSetupModal()')}catch(e){};showPage('settings');document.querySelectorAll('#page-settings .settings-body').forEach(b=>b.style.display='block')});await p.waitForTimeout(200);
 const bulk=async(sel,txt)=>{await p.click(sel);await p.waitForTimeout(80);const box=await p.$('.sw-bulk:last-of-type');const ta=await p.$('.sw-bulk textarea');await ta.fill(txt);await p.click('.sw-bulk button:has-text("Ekle")');await p.waitForTimeout(200);const r=await p.evaluate(()=>document.querySelector('.sw-bulk .sw-bulk-r').innerText);await p.click('.sw-bulk button:has-text("Kapat")');return r};
 // butler isimleri
 let r=await bulk('button.sw-bulk-btn[onclick*="\'butler\'"]','Ayşe Demir\nMehmet Kaya, Can Öz\nZafer Karagaçtı');
 let B=await p.evaluate(()=>JSON.parse(localStorage.getItem('kw_butler')));
 ok(B.join('|')==='Zafer Karagaçtı|Ayşe Demir|Mehmet Kaya|Can Öz'&&/3 eklendi · 1 zaten vardı/.test(r),'butler isimleri: satır ve virgülle 3 isim eklendi, var olan atlandı ('+r+')');
 ok(await p.evaluate(()=>[...document.querySelectorAll('#bdiButler option')].map(o=>o.textContent).includes('Can Öz')),'yeni butlerlar Kayıt\'taki butler listesine geldi');
 // tercih kategorileri (cok sutunlu)
 r=await bulk('#bdiCfg_pref .sw-bulk-btn','Private Bar | PBR | still water and cola zero only\nNewspaper | Butler | Financial Times daily\nPillow | HSK | x\nSpa Ritual | XYZ | lavender oil');
 let P=await p.evaluate(()=>JSON.parse(localStorage.getItem('bdi_pref_cats')).map(x=>x.l+'/'+x.d+'/'+x.ex));
 ok(P.includes('Private Bar/PBR/still water and cola zero only')&&P.includes('Newspaper/BUT/Financial Times daily')&&P.includes('Spa Ritual/BUT/lavender oil')&&/3 eklendi · 1 zaten vardı/.test(r)&&/Spa Ritual: “XYZ” bulunamadı/.test(r)&&!/Newspaper: /.test(r),'tercih kategorileri: kod (PBR) ya da ad (Butler) ile departman eşlendi; bilinmeyen kod uyarıldı ('+r.replace(/\n/g,' / ')+')');
 // Excel'den sekmeli yapistirma: departmanlar
 r=await bulk('#bdiCfg_dept .sw-bulk-btn','ENG\tEngineering\nSPA\tSpa');
 ok(await p.evaluate(()=>JSON.parse(localStorage.getItem('bdi_depts')).map(x=>x.l).join(','))==='BUT,HSK,F&B,PBR,CON,REC,ENG,SPA','departmanlar: Excel\'den sekmeli yapıştırma (ENG, SPA)');
 // didn't do it sebepleri
 r=await bulk('#bdiCfg_nt .sw-bulk-btn','Sleeping | Misafir uyuyordu\nLate checkout | Geç çıkış');
 ok(/2 eklendi/.test(r)&&/Sleeping/.test(await p.evaluate(()=>document.getElementById('bdiNtPreview').textContent))===false||/2 eklendi/.test(r),'Didn\'t Do It sebepleri toplu eklendi');
 // temassiz kapatma: id uretilir
 r=await bulk('#bdiCfg_nc .sw-bulk-btn','Duty Manager kapattı | Closed by Duty Manager');
 const NC=await p.evaluate(()=>JSON.parse(localStorage.getItem('bdi_nc_by')).filter(x=>/Duty/.test(x.l)).map(x=>x.id+'|'+x.en));
 ok(NC.length===1&&/^nc/.test(NC[0])&&/Closed by Duty Manager$/.test(NC[0]),'temassız kapatma nedenleri: kimlikle eklendi, İngilizce karşılık yerinde');
 // gitmedi sebepleri + anahtar kelimeler
 r=await bulk('button.sw-bulk-btn[onclick*="alertReason"]','Misafir uyuyordu\nMisafir dışarıdaydı');
 ok(/2 eklendi/.test(r)&&await p.evaluate(()=>__ev('getAlertReasons')().includes('Misafir dışarıdaydı')),'gitmedi sebepleri toplu eklendi');
 r=await bulk('button.sw-bulk-btn[onclick*="kw_ota"]','tripadvisor, makemytrip\nexpedia');
 ok(/2 eklendi · 1 zaten vardı/.test(r),'OTA kelimeleri: virgül ve satırla 2 yeni, expedia zaten vardı');
 // Butler Did It islemleri
 r=await bulk('button.sw-bulk-btn[onclick*="bdiaction"]','Shoe Polish | polished the shoes\nNewspaper Delivery');
 const A=await p.evaluate(()=>{const a=__ev('getBdiActions')();const x=a.find(y=>y.label==='Shoe Polish');return {n:!!a.find(y=>y.label==='Newspaper Delivery'),verb:x&&x.verb,inDd:[...document.querySelectorAll('#bdiAction option')].some(o=>o.textContent==='Shoe Polish')}});
 ok(A.n&&A.verb==='polished the shoes'&&A.inDd,'Butler Did It işlemleri: "Shoe Polish | polished the shoes" fiiliyle, Kayıt\'taki işlem listesine geldi');
 // ornekler
 await p.selectOption('#bdiCfg_pref .sw-cfgpv select','Private Bar');await p.waitForTimeout(80);
 const PV=await p.evaluate(()=>document.querySelector('#bdiCfg_pref .sw-cfgpv-b').innerText);
 ok(/Guest prefers still water and cola zero only\./.test(PV)&&/Private Bar \(PBR\) ekibine gider/.test(PV),'tercih örneği: kayıt cümlesi + "Private Bar (PBR) ekibine gider"');
 const PV2=await p.evaluate(()=>document.querySelector('#bdiCfg_nc .sw-cfgpv-b').innerText);
 ok(/no butler contact\./.test(PV2),'temassız kapatma örneği: rapor cümlesi ('+PV2.replace(/\n/g,' / ')+')');
 const PV3=await p.evaluate(()=>document.querySelector('#alertReasonPv .sw-cfgpv-b').innerText);
 ok(/❌/.test(PV3)&&/Not welcomed/.test(PV3),'gitmedi sebebi örneği: alert tablosu + Didn\'t Do It raporu');
 const occ=await p.evaluate(()=>document.querySelector('#bdiCfg_occ .sw-cfgpv-b').innerText);
 ok(/arrangement for our guest Mr\. Smith/.test(occ)&&/placed prior to arrival\./.test(occ),'kutlama örneği: cümle zamanlamayla');
 const sec=await p.$('xpath=//div[@id="bdiCfg_pref"]/ancestor::div[contains(@class,"section")][1]');
 await p.click('#bdiCfg_pref .sw-bulk-btn');await p.waitForTimeout(100);if(sec)await sec.screenshot({path:__dirname+'/did/set_bulk.png'});
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
