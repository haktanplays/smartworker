// Testler icin ortak yardimci (tests/README.md). Kullanim:
//   const H=require('./h.js');
//   const {p,ok,done}=await H.open({today:'2026-11-06',time:'14:00',butlers:['Can Demir'],me:'Can Demir'});
//   await H.seed(p,{gih:[H.row('1406','Meyer,Anna,Mrs.','2026-11-03','2026-11-09')],logs:{'2026-11-05':[...]}});
//   await H.ingest(p,buffer,'HSK01124.pdf');  // Rapor Merkezi'ne surukle-birak ile ayni yol
//   ok(kosul,'aciklama'); ... await done();
const {chromium}=require('playwright');

function row(room,name,arr,dep,extra){return Object.assign({room,name,arr,dep,depTime:'',type:'KGA',adl:2,chl:0,acc:[],spec:[],notes:[]},extra||{})}

async function open(o){
  o=Object.assign({today:'2026-11-06',time:'14:00',butlers:['Can Demir','Nazlı Erten'],me:'',dir:process.argv[2]||'t2',width:1366},o||{});
  const br=await chromium.launch(),ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:o.width,height:1000}});
  const p=await ctx.newPage(),errs=[],dlg=[];let fails=0;
  p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dlg.push(d.message());d.accept()});
  await p.clock.install({time:new Date(o.today+'T'+o.time+':00+03:00')});
  await p.goto('file://'+__dirname+'/'+o.dir+'/SmartWorker3.html');
  await p.evaluate(o=>{localStorage.clear();localStorage.setItem('sw_setup_snooze',o.today);localStorage.setItem('sw_dayfix',o.today);
    localStorage.setItem('kw_butler',JSON.stringify(o.butlers));if(o.me)localStorage.setItem('bdi_me',o.me)},o);
  await p.reload();await p.waitForTimeout(1200);
  await p.evaluate(async()=>{await __ev('BdiKV').ready();try{__ev('closeSetupModal()')}catch(e){}});
  const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
  const done=async()=>{ok(errs.length===0,'JS hatası yok '+JSON.stringify(errs));await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)};
  return {br,ctx,p,errs,dlg,ok,done};
}

// Veri koy: gih = in-house satirlari (row()), gihDay, logs = {'YYYY-MM-DD':[kayit,...]}, kv = {anahtar:deger}; sonra oda listesi ve misafir hafizasi yenilenir
async function seed(p,o){
  await p.evaluate(async o=>{const KV=__ev('BdiKV');await KV.ready();
    if(o.gih)KV.set('bdi_gih_v1',JSON.stringify({day:o.gihDay||__ev('getToday()'),at:Date.now(),file:'gih.pdf',rows:o.gih}));
    Object.keys(o.logs||{}).forEach(d=>KV.set('bdi_'+d,JSON.stringify(o.logs[d])));
    Object.keys(o.kv||{}).forEach(k=>KV.set(k,typeof o.kv[k]==='string'?o.kv[k]:JSON.stringify(o.kv[k])));
    __ev('_bdiGih=null');__ev('rebuildVacRooms()');await __ev('bdiGMIngest')();__ev('_bdiGMProf=null')},o);
}

// Bir log kaydi (Kayit ekraninin yazdigi bicim)
function log(id,day,time,room,guest,action,o){return Object.assign({id,ts:Date.parse(day+'T'+time+':00+03:00'),time,butler:'Can Demir',room,guest,action,touchCategory:'Service',sentence:'Butler performed '+action+'.',note:'',meta:{}},o||{})}

// Rapor Merkezi yolu: dosyayi uygulamaya birakir, uygulamanin mesajini dondurur
async function ingest(p,buf,name){
  return p.evaluate(async([b64,n])=>{const f=new File([Uint8Array.from(atob(b64),c=>c.charCodeAt(0))],n);const r=await __ev('swRepIngest')([f],'elle');return r.map(x=>x.msg).join(' | ')},[Buffer.from(buf).toString('base64'),name]);
}

// Butler Did It sekmesini acar (entry, log, nt, irci, guests, brief, atelier, fu, issues ...)
async function tab(p,name){await p.evaluate(n=>{__ev('showPage("didit")');__ev('switchBdiTab("'+n+'")')},name);await p.waitForTimeout(500)}

module.exports={open,seed,row,log,ingest,tab};
