const {chromium}=require('playwright');const fs=require('fs');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const br=await chromium.launch();const ctx=await br.newContext({timezoneId:'Europe/Istanbul',viewport:{width:1320,height:1000},deviceScaleFactor:1.5,acceptDownloads:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.clock.install({time:new Date('2026-11-01T15:00:00+03:00')});await p.goto('file://'+__dirname+'/t/SmartWorker3.html');
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('sw_setup_snooze','2026-11-01');localStorage.setItem('sw_dayfix','2026-11-01');localStorage.setItem('kw_butler',JSON.stringify(['Beyza Nur Çırak','Onur Kaya','Yağmur Demir']))});await p.reload();await p.waitForTimeout(1300);
 await p.evaluate(async()=>{const KV=__ev('BdiKV');await KV.ready();
   KV.set('bdi_gih_v1',JSON.stringify({day:'2026-11-01',at:Date.now(),file:'g.pdf',rows:[{room:'1610',name:'Mellander,Melissa,Mrs.',arr:'2026-11-01',dep:'2026-11-07',depTime:'14:00',acc:[],spec:[],notes:[]},{room:'0805',name:'Hollinsby,Kirsten,Mrs.',arr:'2026-10-30',dep:'2026-11-05',depTime:'',acc:[],spec:[],notes:[]}]}));__ev('_bdiGih=null');
   const L=(id,b,room,guest,act,t)=>({id,butler:b,room,guest,action:act,touchCategory:'Service',patternType:'service',note:'',time:t,sentence:'x',ts:new Date('2026-11-01T'+t+':00+03:00').getTime(),countsAsTouch:true});
   const W='Welcome / In-room Check-in';
   KV.set('bdi_2026-11-01',JSON.stringify([L('a','Beyza Nur Çırak','1205','Kerry Dovell',W,'10:00'),L('b','Onur Kaya','1610','Melissa Mellander',W,'11:00'),L('c','Onur Kaya','1705',"Rose Hanlan O'Brennan",W,'12:00'),
     L('d','Yağmur Demir','1709','Michael Lennox',W,'13:00'),L('e','Zafer','1205','Kerry Dovell',W,'14:00'),L('f','Beyza Nur Çırak','1205','Kerry Dovell','Turndown','20:00'),L('g','Beyza Nur Çırak','0805','',W,'09:30')]));
   __ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-01';__ev('loadBdiLogs()');__ev('bdiIrciTabBadge()')});
 const badge=await p.evaluate(()=>document.getElementById('bdiIrciTabCount').textContent);
 await p.evaluate(()=>__ev('switchBdiTab("irci")'));await p.waitForTimeout(200);
 const T=()=>p.evaluate(()=>({rows:[...document.querySelectorAll('#bdiIrciPanel tbody tr')].map(r=>[...r.children].slice(0,4).map((c,i)=>i===2?(c.querySelector('input').value+'/'+[...c.querySelectorAll('button')].map(b=>b.textContent).join(',')):c.textContent.trim()).join(' | ')),sum:(document.querySelector('#bdiIrciPanel .bd-nt-sum')||{}).textContent||''}));
 let S=await T();console.log('  '+S.rows.join('\n  ')+'\n  '+S.sum);
 ok(badge==='5'&&S.rows.length===5,'sekme "In-room Check-in" (5): yalniz in-room check-in kayitlari, 1205 iki kez girilse de tek satir, Turndown yok');
 ok(/^Kirsten Hollinsby \| 0805/.test(S.rows[0])&&/^Kerry Dovell \| 1205 \| \/N\/A \| Beyza$/.test(S.rows[1])&&/^Melissa Mellander \| 1610 \| \/N\/A,Protel 14:00 \| Onur$/.test(S.rows[2])&&/^Michael Lennox \| 1709 \| \/N\/A \| Yağmur$/.test(S.rows[4]),'oda sirasi, isim (isimsiz kayit odadaki misafirden), By = butlerin ilk adi, ETD bos; 1610 icin Protel ETD onerisi (14:00)');
 ok(/5 in-room check-in/.test(S.sum)&&/5 ETD eksik/.test(S.sum)&&/Protel'deki ETD'yi 1 satıra uygula/.test(S.sum),'ozet: 5 ETD eksik + "Protel\'deki ETD\'yi uygula"');
 // ETD gir: 1709 03:00, 1205 N/A, 1610 Protel'den
 const sel=r=>`#bdiIrciPanel tbody tr:nth-child(${r})`;
 await p.fill(sel(5)+' input[type=time]','03:00');await p.dispatchEvent(sel(5)+' input[type=time]','change');await p.waitForTimeout(100);
 await p.click(sel(2)+' button.bd-btn');await p.waitForTimeout(100);
 await p.click('#bdiIrciPanel .bd-nt-sum .bd-link');await p.waitForTimeout(100);
 S=await T();
 ok(/1709 \| 03:00\//.test(S.rows[4])&&/1205 \| \/N\/A/.test(S.rows[1])&&/1610 \| 14:00\//.test(S.rows[2])&&/2 ETD eksik/.test(S.sum),'ETD: 1709 03:00 (elle), 1205 N/A, 1610 14:00 (Protel); 2 eksik kaldi');
 const st=await p.evaluate(()=>JSON.parse(__ev('BdiKV').get('bdi_irci_v1'))['2026-11-01']);
 ok(st['1709|lennox michael'].etd==='03:00'&&st['1205|dovell kerry'].etd==='N/A'&&st['1709|lennox michael'].u>0,'ETD gun + oda|misafir bazinda saklandi (u ile, senkron gider)');
 // Excel
 const b64=await p.evaluate(()=>{let wb=null;const o=XLSX.writeFile;XLSX.writeFile=w=>{wb=w};try{__ev('bdiIrciXlsx()')}finally{XLSX.writeFile=o}const a=XLSX.write(wb,{type:'base64',bookType:'xlsx'});return a});
 fs.writeFileSync(__dirname+'/did/irci_out.xlsx',Buffer.from(b64,'base64'));
 const {execSync}=require('child_process');
 const py=execSync(`python3 -I -c "
import openpyxl
ws=openpyxl.load_workbook('${__dirname}/did/irci_out.xlsx').active
print(ws['A1'].value,'|',ws['A1'].font.name,ws['A1'].font.sz,ws['A1'].font.b,'|',sorted(str(r) for r in ws.merged_cells.ranges))
print(ws['A2'].value,'|',[ws.cell(3,c).value for c in range(1,5)],'|',ws['A3'].font.name,ws['A3'].border.left.style)
for r in range(4,9): print([ws.cell(r,c).value for c in range(1,5)],ws.cell(r,3).number_format)
print('maxrow',ws.max_row,'border20',ws['D20'].border.bottom.style,ws['A4'].font.name,ws['A4'].font.b,ws['A4'].border.left.style)
"`).toString();console.log(py);
 ok(/^In Room Check In Chart \| Candara 18.0 True \| \['A1:D1', 'A2:D2'\]/.test(py)&&/Date: 01\.11\.2026 \| \['Guest Name', 'Room Number', 'Departure Time', 'By'\] \| Candara medium/.test(py),'Excel: baslik, tarih, sutunlar ve bicim ekibin dosyasiyla ayni (Candara, birlesik hucreler, kalin cerceve)');
 ok(/\['Kerry Dovell', 1205, 'N\/A', 'Beyza'\]/.test(py)&&/\['Michael Lennox', 1709, datetime\.time\(3, 0\), 'Yağmur'\] h:mm/.test(py)&&/\['Melissa Mellander', 1610, datetime\.time\(14, 0\), 'Onur'\]/.test(py)&&/maxrow 20 border20 thin Calibri True thin/.test(py),'Excel satirlari: oda sayi, ETD saat (h:mm) ya da N/A, By ilk ad; 20. satira kadar cerceveli bos satir');
 // yazdir
 const ph=await p.evaluate(()=>window.__t.capture(function(){return __ev('bdiIrciPrint()')}));
 ok(/In Room Check In Chart/.test(ph)&&/<td>Michael Lennox<\/td><td>1709<\/td><td>03:00<\/td><td>Yağmur<\/td>/.test(ph),'Yazdir: A4 HTML ayni tablo');
 // ayarlar: listeye dusen islemler
 await p.evaluate(()=>{__ev('showPage("settings")')});await p.waitForTimeout(150);
 const SE=await p.evaluate(()=>({on:[...document.querySelectorAll('#irciActs input:checked')].map(x=>x.value)}));
 ok(SE.on.join()==='Welcome / In-room Check-in','Ayarlar > "In Room Check In listesine düşen işlemler": varsayilan Welcome / In-room Check-in');
 await p.evaluate(()=>{__ev('bdiIrciToggle')('Welcome / In-room Check-in',false);__ev('bdiIrciToggle')('Turndown',true);__ev('showPage("didit")');__ev('switchBdiTab("irci")')});
 S=await T();ok(S.rows.length===1&&/^Kerry Dovell \| 1205/.test(S.rows[0]),'ayardan degisince liste degisti (yalniz Turndown: 1205)');
 await p.evaluate(()=>{__ev('bdiIrciToggle')('Turndown',false);__ev('bdiIrciToggle')('Welcome / In-room Check-in',true)});
 // senkron
 const SY=await p.evaluate(async()=>{let content=JSON.stringify({version:1,issues:[],irci:{'2026-11-01':{'1705|hanlan o rose brennan':{etd:'11:30',u:Date.now()+5000}}}});
   const fh={getFile:async()=>({text:async()=>content}),createWritable:async()=>({write:async t=>{content=t},close:async()=>{}})};await __ev('_bdiExtSyncFile')({getFileHandle:async()=>fh});
   const k=Object.keys(JSON.parse(__ev('BdiKV').get('bdi_irci_v1'))['2026-11-01']);return {k,file:!!JSON.parse(content).irci['2026-11-01']['1709|lennox michael']}});
 ok(SY.file,'senkron dosyasina ETD\'ler yazildi');
 ok(errs.length===0,'JS hatasi yok '+JSON.stringify(errs));
 await p.evaluate(()=>__ev('renderBdiIrci()'));await p.waitForTimeout(100);
 await (await p.$('#bdiIrciPanel')).screenshot({path:__dirname+'/did/irci.png'});
 await br.close();console.log(fails?fails+' FAIL':'ALL PASS');process.exit(fails?1:0)})();
