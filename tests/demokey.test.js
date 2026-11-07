const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const APP='file://'+require('path').resolve(__dirname,'../..')+'/SmartWorker3.html';
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul'});const p=await ctx.newPage();const errs=[],dlg=[];p.on('pageerror',e=>errs.push(e.message));
 p.on('dialog',d=>{dlg.push(d.message());d.dismiss()});
 await p.goto(APP);await p.evaluate(()=>localStorage.setItem('sw_setup_snooze','2099-01-01'));await p.reload();await p.waitForTimeout(1500);
 // yarim yazilmis not varken: sorar, Vazgec'te yerinde kalir
 await p.fill('#bdiNote',"yarım not").catch(async()=>{await p.evaluate(()=>{const t=document.querySelector('.page.active input[type=text]');t.value='yarım not'})});
 await p.keyboard.press('Control+k');await p.waitForTimeout(800);
 ok(dlg.length===1&&/kaybolur/.test(dlg[0])&&!/demo/.test(p.url()),'yarım yazılmış metin varken önce soruyor; vazgeçince gerçek uygulamada kalıyor');
 await p.evaluate(()=>document.querySelectorAll('.page.active input[type=text],.page.active textarea').forEach(x=>x.value=''));
 await p.keyboard.press('Control+k');await p.waitForURL(/\?demo$/,{timeout:10000});
 await p.waitForFunction(()=>sessionStorage.getItem('swdemo:__seeded'),null,{timeout:120000});await p.waitForLoadState('load');await p.waitForTimeout(2500);
 ok(await p.evaluate(()=>/DEMO/.test(document.querySelector('.sw-demo-pill').textContent)),'Ctrl+K gerçek uygulamadan demoyu açtı (DEMO · Ctrl+K işareti görünüyor)');
 await p.keyboard.press('Control+k');await p.waitForURL(u=>!/\?demo/.test(String(u)),{timeout:10000});await p.waitForTimeout(1200);
 ok(!/demo/.test(p.url())&&!(await p.$('.sw-demo-pill')),'demodayken Ctrl+K gerçek uygulamaya döndürdü');
 const t0=Date.now();await p.keyboard.press('Meta+k');await p.waitForURL(/\?demo$/,{timeout:10000});await p.waitForSelector('.sw-demo-pill',{timeout:20000});
 const cover=await p.$('.sw-demo-cover');ok(!cover,'aynı sekmede tekrar açınca demo yeniden kurulmadan anında geldi ('+(Date.now()-t0)+' ms); Mac Cmd+K de çalışıyor');
 // Hub'dan Ctrl+K
 const h=await ctx.newPage();await h.goto('file://'+require('path').resolve(__dirname,'../..')+'/SmartWorkerHub.html');await h.keyboard.press('Control+k');await h.waitForURL(/SmartWorker3\.html\?demo$/,{timeout:10000});ok(true,'Hub sayfasında da Ctrl+K demoyu açıyor');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs.slice(0,3)));await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
