// Sahte Opera raporlari (kurgusal misafirler): test, raporu butler gibi Rapor Merkezi'ne birakir.
//   const R=require('./opera/reports.js');
//   await H.ingest(p, await R.vac({day:'2026-11-06',rows:[{room:'0701',name:'Fairbanks,Odette,Mrs.',fo:'OCC',hk:'IP',res:'Checked In',arr:'2026-11-04',dep:'2026-11-09'}]},br),'HSK01124.pdf');
// Tarihler 'YYYY-MM-DD' verilir, raporda Opera gibi 'dd-mm-yy' yazilir. 2. arguman (istege bagli): testin acik tarayicisi
// (H.open'in br'si); verilmezse kisa sureli kendi tarayicisini acip kapatir.
// Yerlesim gercek raporlardan olculdu (2026-11-03): sayfa boyu, sutun x'leri, baslik kelimeleri, tarih bicimi. Birimler pt;
// y, pdf.js'teki gibi sayfanin altindan yazi tabanina. Gercek rapordan yalniz yerlesim alindi, icerik degil.
const {chromium}=require('playwright');
const D=s=>s?s.slice(8,10)+'-'+s.slice(5,7)+'-'+s.slice(2,4):''; // 2026-11-06 -> 06-11-26
const HOTEL='Raffles Istanbul Zorlu Center'; // GIH okuyucusu bu satiri atlar (2. sayfada not sanmasin)
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const nights=(a,d)=>a&&d?String(Math.round((Date.parse(d)-Date.parse(a))/864e5)):'';

// Satir bloklarini sayfalara dizer. blok = {h, items:[[x, asagi kayma, yazi]]}; sigmayan blok yeni sayfaya gecer.
function paginate(blocks,top,bottom){
  const pages=[[]];let y=top;
  blocks.forEach(b=>{if(y-b.h<bottom&&pages[pages.length-1].length){pages.push([]);y=top}
    b.items.forEach(([x,dy,t])=>{if(t!==''&&t!=null)pages[pages.length-1].push([x,y-dy,String(t)])});y-=b.h});
  return pages;
}
// Her sayfaya ust bilgi (head) ve alt bilgi (foot(i,n)) eklenir, HTML'den PDF basilir.
async function render(W,H,pages,head,foot,br){
  const html=pages.map((it,i)=>`<div style="position:relative;width:${W}pt;height:${H}pt;overflow:hidden${i<pages.length-1?';break-after:page':''}">`+
    head.concat(it,foot(i+1,pages.length)).map(([x,y,t,s])=>{s=s||7;return `<div style="position:absolute;left:${x}pt;top:${(H-y-0.85*s).toFixed(2)}pt;font:${s}pt Arial;line-height:1;white-space:pre">${esc(t)}</div>`}).join('')+'</div>').join('');
  const own=!br;if(own)br=await chromium.launch();
  const p=await br.newPage();
  try{await p.setContent('<html><body style="margin:0">'+html+'</body></html>');return await p.pdf({width:W/72+'in',height:H/72+'in'})}
  finally{await p.close();if(own)await br.close()}
}
// ust bilgi: otel adi (x hx) + basim gunu, altinda basim saati ve rapor adi (x tx)
const top3=(W,day,time,title,y,hx,tx)=>[[hx,y,HOTEL,9],[W-48,y,D(day)],[W-38,y-20,time||'09:00'],[tx,y-28,title,9]];
const page=(x,y)=>(i,n)=>[[x[0],y,'Filter'],[x[1],y,'Page '+i+' of '+n]];

// HSK01124 Vacant Rooms (dikey). Isim VAC'ta Opera gibi 'Soyad, Ad' yazilir (unvan yok); bos odada isim ''.
// rows: [{room, name, fo:'OCC'|'VAC', hk:'CL'|'DI'|'IP'|'PU'|'OO', res:'Checked In'|'Due In'|..., arr, dep, type?, nv?(bos gece), adl?, chl?}]
async function vac(o,br){
  const rows=o.rows.map(r=>{const nm=r.name?r.name.split(',').slice(0,2).map(s=>s.trim()).join(', '):'';
    return {h:19.4,items:[[6,0,r.room],[35,0,r.type||'KGA'],[66,0,r.fo||'VAC'],[93,0,r.hk||'CL'],[119,0,r.nv],
      [152,0,nm],[282,0,nm&&D(r.arr)],[322,0,nm&&D(r.dep)],[363,0,nm&&r.res],[439,0,nm&&String(r.adl||1)],[466,0,nm&&String(r.chl||0)]]}});
  const head=top3(594,o.day,o.time,'HSK01124 Vacant Rooms',777,223,227).concat([
    [6,722,'Room'],[35,722,'Room'],[66,722,'FO'],[93,722,'Status'],[120,722,'Nights'],[150,722,'Name'],[281,722,'Arr. Date'],[321,722,'Dep.Date'],[362,722,'Res. Status'],[422,722,'Adlts.'],[450,722,'Chld.'],[473,722,'Discrepant'],[518,722,'Next'],
    [35,711,'Type'],[66,711,'Status'],[120,711,'Vacant'],[473,711,'Status'],[518,711,'Blocked']]);
  return render(594,792,paginate(rows,692,62),head,page([1,276],47),br);
}

// Profil notlari (GIH ve ARR ayni duzen, farkli x): her not 'Web Notes' ile acilir; not dizi verilirse devam satirlari.
function notes(it,dy,ns,xl,xw,xt){(ns||[]).forEach((n,i)=>[].concat(n).forEach((l,j)=>{dy+=j?11:i?11:14;
  if(!i&&!j)it.push([xl,dy,'Profile Notes:']);if(!j)it.push([xw,dy,'Web Notes']);it.push([xt,dy,l])}));return dy}
const accTxt=a=>a.map(s=>s.split(',').map(x=>x.trim()).join(', ')).join(' / ');

// GIH01102 Guests in House by Name (yatay). rows: [{room, name:'Soyad,Ad,Unvan', arr, dep, depTime?:'11:00', adl?, chl?, type?,
//   acc?:['Soyad,Ad'], spec?:['Flowers'], notes?:['not', ['uzun not', 'devam satiri']]}]
async function gih(o,br){
  const rows=o.rows.map(r=>{const it=[[14,0,r.room],[47,0,r.name],[321,0,D(r.arr)],[354,0,D(r.dep)],[388,0,r.type||'KGA'],[428,0,String(r.adl==null?2:r.adl)],[447,0,String(r.chl||0)]];let dy=0;
    if(r.depTime)it.push([354,dy+=12,r.depTime]); // EDT: tek basina, Dep. sutununda
    if(r.acc&&r.acc.length)it.push([62,dy+=14,'Accompanying Names:'],[148,dy,accTxt(r.acc)]);
    if(r.spec&&r.spec.length)it.push([112,dy+=14,'Specials:'],[148,dy,r.spec.join(', ')]);
    dy=notes(it,dy,r.notes,96,148,216);return {h:dy+16,items:it}});
  const head=top3(792,o.day,o.time,'GIH01102 Guests in House by Name',578,315,294).concat([
    [14,524,'Room'],[47,524,'Name'],[163,524,'Company'],[321,524,'Arr.'],[354,524,'Dep.'],[388,524,'Room'],[418,524,'Adl.'],[437,524,'Chl.'],[454,524,'Pay'],[488,524,'Rate'],[548,524,'Currency'],[618,524,'Rate'],[678,524,'Balance'],[730,524,'Authorization'],
    [13,511,'No.'],[163,511,'Travel Agent'],[321,511,'Date'],[354,511,'Date'],[388,511,'Type'],[454,511,'Mth.'],[488,511,'Code'],[607,511,'Amount'],[749,511,'Amount'],
    [56,498,'VIP'],[118,498,'Block Code'],[163,498,'DIS'],[354,498,'EDT']]);
  return render(792,594,paginate(rows,477,62),head,page([12,350],53),br);
}

// ARR01102 Arrivals by Name (yatay). day = varis gunu. rows: [{room, name:'Soyad,Ad,Unvan', arr, dep, etd?:'12:00',
//   rate?:'RA1' (rate code), amount?:'720.00', adl?, chl?, type?, notes?}]. Okuyucu yalniz 50 <= y <= 460 arasini okur.
async function arr(o,br){
  const rows=o.rows.map((r,i)=>{const it=[[7,0,r.room],[42,0,r.name],[290,0,D(r.arr)],[329,0,D(r.dep)],[366,0,r.type||'KGA'],[423,0,String(r.adl||1)],[449,0,String(r.chl||0)],[471,0,'1'],[565,0,r.rate],
      [611,0,r.amount&&'EUR'],[663,0,r.amount],[38,14,String(150001+i)],[422,14,r.etd]]; // 2. satir: Conf No. ve ETD
    return {h:notes(it,14,r.notes,85,139,231)+16,items:it}});
  const head=top3(792,o.day,o.time,'ARR01102 Arrivals by Name',576,310,309).concat([
    [6,515,'Room'],[42,515,'Name'],[182,515,'Company'],[290,515,'Arr. Date'],[328,515,'Dep.Date'],[366,515,'Room'],[413,515,'Adl.'],[438,515,'Chl.'],[456,515,'Rms.'],[480,515,'Mkt.'],[509,515,'Src.'],[536,515,'Res.'],[564,515,'Rate Code'],[610,515,'Currency'],[674,515,'Rate'],[695,515,'Pay'],[741,515,'Deposit'],
    [6,504,'No.'],[182,504,'Travel Agent'],[366,504,'Type'],[480,504,'Code'],[509,504,'Code'],[536,504,'Status'],[666,504,'Amount'],[695,504,'Mth.'],[737,504,'Received'],
    [37,480,'Conf No.'],[153,480,'VIP'],[291,480,'Arr. Time'],[385,480,'Method'],[422,480,'ETD'],[650,480,'Credit Card'],
    [10,448,'Arrival Date'],[71,448,D(o.day)]]);
  return render(792,594,paginate(rows,428,60),head,page([6,375],46),br);
}

// DEP01100 Departures all by Room (yatay). rows: [{room, name:'Soyad,Ad,Unvan', arr, dep, st?:'CKOT'(cikti)|'DUOT'(cikacak), time:'10:30', adl?, chl?, type?,
//   name2?:'Unvan,Mr.' (Opera gibi satir sonunda kirilan ismin devami, alt satirda), comp?:'sirket / acente', rate?:'rate code', pay?:'CA'}]
// Sonda Opera'nin "Total" satiri (yetiskin, cocuk, oda, gece) da basilir.
async function dep(o,br){
  const R=o.rows.map(r=>Object.assign({adl:1,chl:0,st:'CKOT'},r));
  const rows=R.map(r=>({h:r.name2?21:13,items:[[8,0,r.room],[37,0,r.name],[124,0,r.comp],[310,0,D(r.arr)],[349,0,D(r.dep)],[401,0,String(r.adl)],[420,0,String(r.chl)],[442,0,'1'],[466,0,nights(r.arr,r.dep)],[476,0,r.type||'KGA'],[539,0,r.rate],[578,0,r.st],[612,0,r.time],[644,0,r.pay],[37,8,r.name2]]}));
  const sum=k=>String(R.reduce((a,r)=>a+(+r[k]||0),0));
  rows.push({h:13,items:[[283,4,'Total'],[396,4,sum('adl')],[419,4,sum('chl')],[438,4,String(R.length)],[462,4,String(R.reduce((a,r)=>a+(+nights(r.arr,r.dep)||0),0))]]});
  const head=top3(792,o.day,o.time,'DEP01100 Departures all by Room',569,325,309).concat([
    [8,505,'Room'],[37,505,'Name'],[124,505,'Company'],[283,505,'VIP'],[310,505,'Arr.'],[349,505,'Dep.'],[391,505,'Adl.'],[410,505,'Chl.'],[430,505,'Rms'],[458,505,'Nts',6],[472,505,'Room'],[500,505,'Block'],[539,505,'Rate'],[578,505,'Res.'],[611,505,'Dep.'],[644,505,'Pay'],
    [8,495,'No.'],[124,495,'Travel Agent'],[283,495,'Code'],[310,495,'Date'],[349,495,'Date'],[472,495,'Type'],[500,495,'Code'],[539,495,'Code'],[578,495,'Status'],[612,495,'Time'],[644,495,'Mth'],
    [124,486,'DIS'],[8,460,'Departure'],[61,460,D(o.day)]]);
  return render(792,594,paginate(rows,446,60),head,page([5,386],43),br);
}

module.exports={vac,gih,arr,dep};
