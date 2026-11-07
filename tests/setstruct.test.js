const {chromium}=require('playwright');
(async()=>{const br=await chromium.launch();const p=await br.newPage({viewport:{width:1400,height:1000}});
 await p.goto('file://'+__dirname+'/t/SmartWorker3.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2099-01-01')});await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(()=>{try{__ev('closeSetupModal()')}catch(e){};showPage('settings')});await p.waitForTimeout(300);
 const R=await p.evaluate(()=>{const out=[];document.querySelectorAll('#page-settings .settings-body').forEach((b,i)=>{const prev=b.previousElementSibling;const secs=[...b.querySelectorAll('.section h3')].map(h=>h.textContent.trim().slice(0,40));
   out.push({i,disp:getComputedStyle(b).display,prev:prev?prev.outerHTML.slice(0,220):'(yok)',secs})});return out});
 console.log(JSON.stringify(R,null,1));await br.close()})();
