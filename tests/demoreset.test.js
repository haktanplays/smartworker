const {chromium}=require('playwright');let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul'});const d=await ctx.newPage();const errs=[];d.on('pageerror',e=>errs.push(e.message));d.on('dialog',x=>x.accept());
 // baslatici dosya demoya yonlendiriyor mu (gercek dosyayla)
 await d.goto('file://'+require('path').resolve(__dirname,'../..')+'/SmartWorker_Demo.html');await d.waitForURL(/SmartWorker3\.html\?demo/,{timeout:15000});ok(/SmartWorker3\.html\?demo$/.test(d.url()),'SmartWorker_Demo.html demoyu açıyor');
 await d.waitForFunction(()=>sessionStorage.getItem('swdemo:__seeded'),null,{timeout:120000});await d.waitForLoadState('load');await d.waitForTimeout(3000);
 const a=await d.evaluate(()=>({sid:sessionStorage.getItem('swdemo:__sid'),n:(window.bdiLogs||[]).length,pill:!!document.querySelector('.sw-demo-pill'),occ:document.body.innerText.indexOf('Honeymoon (bugün)')}));
 // kullanici bir kayit ekler, sonra sifirlar
 await d.evaluate(()=>{localStorage.setItem('demo_user_touch','1')});
 await d.click('text=Demoyu sıfırla');await d.waitForTimeout(800);await d.waitForFunction(()=>sessionStorage.getItem('swdemo:__seeded'),null,{timeout:120000});await d.waitForLoadState('load');await d.waitForTimeout(3000);
 const b=await d.evaluate(()=>({sid:sessionStorage.getItem('swdemo:__sid'),user:localStorage.getItem('demo_user_touch'),pill:!!document.querySelector('.sw-demo-pill')}));
 ok(a.sid&&b.sid&&a.sid!==b.sid&&b.user===null&&b.pill,'"Demoyu sıfırla" örnek oteli baştan kuruyor, sunum sırasında eklenenler gidiyor');
 // demodan cikinca gercek uygulama temiz
 await d.goto('file://'+require('path').resolve(__dirname,'../..')+'/SmartWorker3.html');await d.waitForTimeout(1500);
 const c=await d.evaluate(()=>({demo:!!document.querySelector('.sw-demo-pill'),title:document.title,butlers:localStorage.getItem('kw_butler')}));
 ok(!c.demo&&!/^DEMO/.test(c.title)&&!/Elif Aydın/.test(c.butlers||''),'aynı sekmede gerçek uygulamaya dönünce demo izi yok');
 ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs.slice(0,3)));await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
