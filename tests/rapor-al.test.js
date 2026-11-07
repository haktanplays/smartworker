// 2026-11-07: "Rapor al" sekmesi (butun raporlar tek yerde, donem + butler bir kez) ve "The Butler, Room by Room." raporu.
// Dis olcut: Room by Room'un Didn't Do It / Converted sayilari ayni gunun Didn't Do It raporuyla ayni; Did It raporu
// Log sekmesinin degil Rapor al'in gununu kullanir ve Log'un durumu bozulmaz.
const H=require('./h.js');
(async()=>{
 const {p,ok,done,dlg}=await H.open({today:'2026-11-07',time:'19:00',butlers:['Defne Aksoy','Kerem Tunalı'],me:'Defne Aksoy'});
 const R=H.row,G=[R('0501','Lindqvist,Mira,Mrs.','2026-11-04','2026-11-09'),R('0502','Okonkwo,Tade,Mr.','2026-11-05','2026-11-08'),R('0503','Sorensen,Ida,Ms.','2026-11-06','2026-11-10'),
   R('0505','Haddad,Rami,Mr.','2026-11-03','2026-11-09'),R('1201','Varga,Bence,Mr.','2026-11-05','2026-11-09'),R('1202','Moreau,Lise,Mrs.','2026-11-07','2026-11-10')];
 const inh={days:{'2026-11-06':{at:Date.parse('2026-11-06T23:00:00+03:00'),rows:G.filter(r=>r.arr<='2026-11-06')},'2026-11-07':{at:Date.parse('2026-11-07T07:00:00+03:00'),rows:G}}};
 const L=H.log;
 await H.seed(p,{gih:G,kv:{bdi_inh_v1:inh,bdi_nt_v1:{'2026-11-07':{'lise moreau':{r:'DND',n:'',u:1}}}},logs:{
   '2026-11-05':[L('a1','2026-11-05','20:00','0505','Rami Haddad','Turndown',{butler:'Defne Aksoy'}),L('a2','2026-11-05','20:10','0501','Mira Lindqvist','Turndown',{butler:'Defne Aksoy'}),L('a3','2026-11-05','20:20','1201','Bence Varga','Turndown',{butler:'Kerem Tunalı'})],
   '2026-11-07':[L('b1','2026-11-07','19:40','0501','Mira Lindqvist','Turndown',{butler:'Defne Aksoy'}),L('b2','2026-11-07','11:15','0503','Ida Sorensen','Touch Call',{butler:'Defne Aksoy'}),L('b3','2026-11-07','16:00','1201','Bence Varga','Amenity Delivery',{butler:'Defne Aksoy'})]}});
 await p.evaluate(()=>{__ev('_bdiInhC=null');__ev('showPage("didit")');document.getElementById('bdiDate').value='2026-11-07';__ev('loadBdiLogs()');__ev('bdiFloorSetCount(2)');__ev('bdiFloorEditRange(0,"2-9")');__ev('bdiFloorEditRange(1,"10+")');__ev('bdiFloorAssign(0,"Defne Aksoy")');__ev('bdiFloorAssign(1,"Kerem Tunalı")')});
 const own=await p.evaluate(()=>{const o={};['0501','0502','0503','0505','1201','1202'].forEach(r=>o[r]=__ev('bdiFloorOwner')('2026-11-07',r)||'');return o});
 ok(own['0501']==='Defne Aksoy'&&own['1201']==='Kerem Tunalı','kat plani: 5. kat Defne, 12. kat Kerem '+JSON.stringify(own));
 // sekmeler
 const tabs=await p.evaluate(()=>[...document.querySelectorAll('#page-didit .bd-tab')].map(b=>b.textContent.trim()));
 ok(tabs.includes('Log')&&!tabs.some(t=>/Log ve rapor/.test(t))&&tabs.includes('Rapor al'),'sekmeler: "Log" ve yeni "Rapor al" ('+tabs.join(' | ')+')');
 await H.tab(p,'rpt');
 let V=await p.evaluate(()=>[...document.querySelectorAll('#bdiRptPanel .bd-rpt-row')].map(r=>({id:r.id,off:r.classList.contains('off'),b:[...r.querySelectorAll('button')].map(b=>b.textContent+(b.disabled?'-':'')).join('/')})));
 ok(V.length===9&&V.map(x=>x.id.replace('bdiRpt_','')).join()==='did,nt,rbr,perf,fu,al,ic,iss,imp','Rapor al: 9 rapor tek listede');
 ok(V.find(x=>x.id==='bdiRpt_rbr').b==='PDF/Excel'&&!V.find(x=>x.id==='bdiRpt_rbr').off&&V.find(x=>x.id==='bdiRpt_imp').off,'Gun: Room by Room acik, aylik Etki raporu kapali');
 await p.click('#bdiRptPanel button:has-text("Hafta")');await p.waitForTimeout(100);
 V=await p.evaluate(()=>({off:[...document.querySelectorAll('#bdiRptPanel .bd-rpt-row.off')].map(r=>r.id.replace('bdiRpt_','')).join(),why:(document.querySelector('#bdiRpt_rbr i')||{}).textContent,lbl:document.querySelector('.bd-rpt-lbl').textContent}));
 ok(V.off==='rbr,al,ic,imp'&&/Tek günlük/.test(V.why)&&/^02\.11 — 08\.11\.2026$/.test(V.lbl),'Hafta: tek gunluk raporlar kapali, donem '+V.lbl);
 await p.click('#bdiRptPanel button:has-text("Gün")');await p.waitForTimeout(100);
 // Room by Room verisi
 const D=await p.evaluate(()=>{const R=__ev('bdiRbrData')('2026-11-07','');return {C:R.C,N:R.N,s:R.rows.map(r=>r.room+':'+r.s).join(','),last:(R.rows.find(r=>r.room==='0505').last||{})}});
 ok(D.s==='0501:did,0502:nt,0503:conv,0505:q,1201:did,1202:nt','oda oda durum: '+D.s);
 ok(D.last.d==='2026-11-05'&&D.last.a==='Turndown','0505 bugun yok, son touch 05.11 Turndown');
 const cap=k=>p.evaluate(k=>window.__t.capture(function(){__ev('bdiRptGo')(k,'p');const m=document.getElementById('swWarnModal');if(m&&m.style.display!=='none')__ev('swGateRun')()}),k);
 const rb=await cap('rbr'),nt=await cap('nt');
 const P=await p.evaluate(([a,b])=>{const pa=new DOMParser(),A=pa.parseFromString(a,'text/html'),B=pa.parseFromString(b,'text/html'),it=d=>[...d.querySelectorAll('.summary .item')].map(x=>x.textContent);
   return {a:it(A),b:it(B),fh:[...A.querySelectorAll('tr.fh .fn')].map(x=>x.textContent).join(','),rows:[...A.querySelectorAll('table.rvt tbody tr:not(.fh)')].map(r=>r.textContent)}},[rb,nt]);
 console.log('  RbR: '+P.a.join(' | ')+'\n  NT : '+P.b.join(' | '));
 ok(/^3\/6Touched Today/.test(P.a[0])&&/^1Converted/.test(P.a[1])&&/^2Didn't Do It/.test(P.a[2])&&/^1Not Today/.test(P.a[3])&&/^67%/.test(P.a[4]),'Room by Room ozet: 3/6 dokunuldu, 1 converted, 2 didn\'t, 1 not today, %67');
 ok(/^2\/6Guests Not Touched/.test(P.b[0])&&/^67%/.test(P.b[1])&&/^1Converted/.test(P.b[2]),'ayni gunun Didn\'t Do It raporuyla ayni sayilar (2/6, %67, 1 converted)');
 ok(P.fh==='Floor 5,Floor 12','kat basliklari oda sirasiyla: '+P.fh);
 const row=r=>P.rows.find(x=>x.startsWith(r))||'';
 ok(/Converted/.test(row('0503'))&&/11:15 Touch Call/.test(row('0503'))&&/on yesterday's Didn't Do It list/.test(row('0503')),'0503: converted, bugunku touch + dunku listede');
 ok(/Departs tomorrow · last chance/.test(row('0502'))&&/reason not given/.test(row('0502')),'0502: sebep yok + yarin cikiyor, son sans');
 ok(/DND/.test(row('1202'))&&/arrived today/.test(row('1202')),'1202: bugun geldi, DND');
 ok(/16:00 Amenity Delivery/.test(row('1201'))&&/by Defne Aksoy/.test(row('1201')),'1201: Kerem\'in katinda Defne yapti, adi yaziyor');
 ok(/Last touch 05\.11 \(2 days ago\) · Turndown/.test(row('0505')),'0505: son touch 05.11 (2 gun once)');
 // butler secimi
 await p.selectOption('#bdiRptPanel select[aria-label="Butler"]','Kerem Tunalı');await p.waitForTimeout(100);
 const rk=await cap('rbr');
 const K=await p.evaluate(h=>{const d=new DOMParser().parseFromString(h,'text/html');return {rooms:[...d.querySelectorAll('table.rvt td.rm')].map(x=>x.textContent).join(','),h:d.querySelector('.header .date').textContent}},rk);
 ok(K.rooms==='1201,1202'&&/07\.11\.2026 · Kerem Tunalı/.test(K.h),'butler secimi: yalniz Kerem\'in katlari, basliktaki ad ('+K.rooms+')');
 await p.selectOption('#bdiRptPanel select[aria-label="Butler"]','');
 // Did It: Rapor al'in gunu (05.11), Log 07.11'de kalir
 await p.fill('#bdiRptPanel input[aria-label="Tarih"]','2026-11-05');await p.dispatchEvent('#bdiRptPanel input[aria-label="Tarih"]','change');await p.waitForTimeout(100);
 const di=await cap('did');
 const st=await p.evaluate(()=>({mode:__ev('bdiViewMode'),date:document.getElementById('bdiDate').value,ov:__ev('_bdiRptOv')}));
 ok(/Raffles Istanbul &mdash; 05\.11\.2026|Raffles Istanbul — 05\.11\.2026/.test(di)&&/Haddad|Rami/.test(di)&&!/Touch Call/.test(di),'Did It raporu Rapor al\'in gunuyle (05.11)');
 ok(st.mode==='day'&&st.date==='2026-11-07'&&st.ov===null,'Log sekmesinin donemi ve tarihi degismedi');
 // Excel
 await p.fill('#bdiRptPanel input[aria-label="Tarih"]','2026-11-07');await p.dispatchEvent('#bdiRptPanel input[aria-label="Tarih"]','change');await p.waitForTimeout(100);
 const X=await p.evaluate(()=>{let wb=null;const o=XLSX.writeFile;XLSX.writeFile=w=>{wb=w};try{__ev('bdiRptGo')('rbr','x');const m=document.getElementById('swWarnModal');if(m&&m.style.display!=='none')__ev('swGateRun')()}finally{XLSX.writeFile=o}return wb?{n:wb.SheetNames,a:XLSX.utils.sheet_to_json(wb.Sheets['Room by Room'])}:null});
 ok(X&&X.n[0]==='Room by Room'&&X.a.length===6&&X.a.find(r=>r.Room==='0503').Status==='Converted'&&X.a.find(r=>r.Room==='1202').Reason==='DND','Excel: "Room by Room" sayfasi, 6 oda');
 // tek gunluk Alert: o gun liste yoksa soyler
 await p.evaluate(()=>{__ev('bdiRptGo')('al','x');const m=document.getElementById('swWarnModal');if(m&&m.style.display!=='none')__ev('swGateRun')()});await p.waitForTimeout(100);
 ok(dlg.some(m=>/Butler Alert listesi yok/.test(m)),'Butler Alert Excel: o gun liste yoksa haber veriyor');
 // baglam: Didn't Do It sekmesindeki "Rapor al" gunu ve butler'i getirir
 await H.tab(p,'nt');
 await p.evaluate(()=>{__ev('bdiNtDateSet')('2026-11-06');__ev('bdiNtButlerSet')('Defne Aksoy')});
 const ntB=await p.evaluate(()=>[...document.querySelectorAll('#bdiNtPanel .bd-panel-head button')].map(b=>b.textContent).join('|'));
 ok(ntB==='Gece sayısı|Oda|Rapor al','Didn\'t Do It sekmesinde Rapor/Excel yerine tek "Rapor al": '+ntB);
 await p.click('#bdiNtPanel button:has-text("Rapor al")');await p.waitForTimeout(200);
 const ctx=await p.evaluate(()=>({tab:document.querySelector('#page-didit .bd-tab.active').textContent.trim(),lbl:document.querySelector('.bd-rpt-lbl').textContent,fl:!!document.querySelector('#bdiRpt_nt.bd-flash')}));
 ok(ctx.tab==='Rapor al'&&ctx.lbl==='06.11.2026 · Defne Aksoy'&&ctx.fl,'Rapor al o sekmenin gunu ve butler\'iyla acildi, Didn\'t Do It isaretli ('+ctx.lbl+')');
 await done();
})();
