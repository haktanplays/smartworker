const {chromium}=require('playwright');const fs=require('fs');
const SRC=process.argv[2]||'t',OUT=process.argv[3]||'ui/demo',W=+(process.argv[4]||1366),DPR=+(process.argv[5]||1);fs.mkdirSync(__dirname+'/'+OUT,{recursive:true});
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:W,height:900},deviceScaleFactor:DPR});
 const d=await ctx.newPage();const errs=[];d.on('pageerror',e=>errs.push(e.message));d.on('dialog',x=>x.accept());
 await d.clock.install({time:new Date('2026-11-04T15:30:00+03:00')});
 await d.goto('file://'+__dirname+'/'+SRC+'/SmartWorker3.html?demo');
 await d.waitForFunction(()=>sessionStorage.getItem('swdemo:__seeded'),null,{timeout:120000});await d.waitForLoadState('load');await d.waitForTimeout(4000);
 const hide=()=>d.evaluate(()=>{['setupModal','swRepModal','swWarnModal'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});document.querySelectorAll('.bd-react,.bd-toast').forEach(e=>e.remove())});
 const shot=async(name)=>{await d.waitForTimeout(450);await hide();const h=Math.min(1800,await d.evaluate(()=>document.documentElement.scrollHeight));await d.setViewportSize({width:W,height:h});await d.screenshot({path:__dirname+'/'+OUT+'/'+name+'.png'});await d.setViewportSize({width:W,height:900})};
 const tabs=['entry','brief','log','issues','fu','alert','irci','nt','guests','nat','atelier','alice','dept','coverage'];
 const empt={};
 for(const t of tabs){await d.evaluate(t=>{__ev('showPage("didit")');__ev('switchBdiTab("'+t+'")');if(t==='alert')try{__ev('setAlertFilter("all")')}catch(e){}},t);await shot('didit_'+t);
   empt[t]=await d.evaluate(t=>{const el=document.getElementById('bdiTab_'+t);return [...el.querySelectorAll('.bd-empty,.hint')].filter(x=>x.offsetParent&&/yok|Henüz|bulunamadı|yükle/i.test(x.textContent)).map(x=>x.textContent.trim().slice(0,70)).slice(0,4)},t)}
 for(const pg of ['py','radar','settings']){await d.evaluate(pg=>__ev('showPage("'+pg+'")'),pg);await shot('page_'+pg)}
 // brifing alt gorunumleri
 for(const m of ['shift','gr','protel','ipad']){const ok=await d.evaluate(m=>{__ev('showPage("didit")');__ev('switchBdiTab("brief")');const b=[...document.querySelectorAll('#bdiTab_brief .bd-seg button')].find(x=>({shift:/Vardiya/,gr:/Guest Relations/,protel:/Protel/,ipad:/iPad/})[m].test(x.textContent));if(b){b.click();return true}return false},m);if(ok)await shot('brief_'+m)}
 await d.evaluate(()=>__ev('showPage("didit")'));await d.evaluate(()=>__ev('swRepOpen()'));await d.waitForTimeout(500);await d.screenshot({path:__dirname+'/'+OUT+'/modal_rep.png'});
 await d.evaluate(()=>{const e=document.getElementById('swRepModal');if(e)e.style.display='none';__ev('swWarnOpen()')});await d.waitForTimeout(500);await d.screenshot({path:__dirname+'/'+OUT+'/modal_warn.png'});
 console.log('boş görünen metinler: '+JSON.stringify(empt));console.log('JS errors: '+(errs.length?JSON.stringify(errs.slice(0,5)):'none'));await br.close()})();
