// Sahte Opera raporlari (tests/data/opera/reports.js): her rapor Rapor Merkezi'ne butler gibi birakilir (H.ingest),
// uygulama turu tanir ve satirlari dogru okur. Isimler kurgu. Sira gun icindeki gibi: VAC, in-house (GIH), varis (ARR), cikis (DEP).
const H=require('./h.js'),R=require('./opera/reports.js');
const D='2026-11-06',J=JSON.stringify;
const pages=b=>(b.toString('latin1').match(/\/Type\s*\/Page\b(?!s)/g)||[]).length;
const last=p=>p.evaluate(()=>__ev('_swRepLast')[0].type);

(async()=>{const {br,p,ok,done}=await H.open({today:D,time:'14:00',butlers:['Can Demir'],me:'Can Demir'});

 // 1) VAC (HSK01124): 3 dolu, 1 bugun gelecek, 2 + 36 bos oda (iki sayfa)
 const vacRows=[{room:'0701',name:'Fairbanks,Odette,Mrs.',fo:'OCC',hk:'IP',res:'Checked In',arr:'2026-11-04',dep:'2026-11-09',adl:2},
   {room:'0702',name:'Lindqvist,Tomas,Mr.',fo:'VAC',hk:'CL',res:'Due In',arr:D,dep:'2026-11-08'},
   {room:'0703',fo:'VAC',hk:'DI',nv:'2'},{room:'0704',fo:'VAC',hk:'OO',nv:'15'},
   {room:'0705',name:'Okafor,Chidi,Mr.',fo:'OCC',hk:'DI',res:'Checked In',arr:'2026-11-02',dep:D},
   {room:'1406',name:'Öztürk,Ilgın,Ms.',fo:'OCC',hk:'PU',res:'Checked In',arr:'2026-11-05',dep:'2026-11-07'}]
   .concat(Array.from({length:36},(_,i)=>({room:String(1001+i),fo:'VAC',hk:'CL'})));
 const vb=await R.vac({day:D,time:'08:15',rows:vacRows},br);
 ok(pages(vb)===2,'VAC: 42 oda iki sayfaya basıldı ('+pages(vb)+')');
 let m=await H.ingest(p,vb,'HSK01124.pdf');
 ok(await last(p)==='vac','VAC: oda durumu raporu olarak tanındı');
 ok(m==='3 dolu · 1 gelecek · 38 boş','VAC: mesaj "3 dolu · 1 gelecek · 38 boş" ('+m+')');
 let S=await p.evaluate(()=>({vr:__ev('vacRooms'),st:__ev('bdiVacSt'),dep:__ev('bdiPdfDep'),kv:JSON.parse(__ev('BdiKV').get('bdi_vac_v1'))}));
 ok(J(S.vr)===J({'0701':'Fairbanks, Odette','0702':'Lindqvist, Tomas','0705':'Okafor, Chidi','1406':'Öztürk, Ilgın'}),'VAC: oda listesi (vacRooms) 4 misafir, Opera gibi "Soyad, Ad" '+J(S.vr));
 const v1=S.st['0701'],v2=S.st['0702'];
 ok(v1&&v1.fo==='OCC'&&v1.hk==='IP'&&v1.res==='Checked In'&&v1.arr==='2026-11-04'&&v1.dep==='2026-11-09'&&v1.adl===2&&v1.type==='KGA','VAC: 0701 dolu, IP, Checked In, 04.11-09.11, 2 yetişkin '+J(v1));
 ok(v2&&v2.fo==='VAC'&&v2.hk==='CL'&&v2.res==='Due In'&&v2.arr===D,'VAC: 0702 bugün gelecek (Due In) '+J(v2));
 ok(S.st['0703'].hk==='DI'&&S.st['0703'].nv==='2'&&!S.st['0703'].name&&S.st['0704'].hk==='OO'&&S.st['1036']&&S.st['1036'].hk==='CL','VAC: boş odalar (0703 DI 2 gece, 0704 OO, 2. sayfadaki 1036 CL)');
 ok(S.st['1406'].hk==='PU'&&S.dep['0701']==='2026-11-09'&&S.dep['0705']===D,'VAC: 1406 PU, çıkış tarihleri (bdiPdfDep) '+J(S.dep));
 ok(S.kv.day===D&&S.kv.printed===D&&Object.keys(S.kv.st).length===42&&J(S.kv.rooms)===J(S.vr),'VAC: bdi_vac_v1 saklandı (gün, basım günü, 42 oda durumu)');

 // 2) In-house (GIH01102): 4 ayrıntılı satır + 28 dolgu satırı (iki sayfa); refakatçi, Specials, Web Notes, EDT
 const fill=[];['Arden','Bellamy','Corvin','Dalloway','Ellery','Fenwick','Garrow'].forEach((l,i)=>['Iris','Jonah','Kestrel','Lucan'].forEach((f,j)=>fill.push({room:String(2001+i*4+j),name:l+','+f+',Mx.',arr:'2026-11-03',dep:'2026-11-10'})));
 const gihRows=fill.concat([{room:'0701',name:'Fairbanks,Odette,Mrs.',arr:'2026-11-04',dep:'2026-11-09',adl:2,chl:1,acc:['Fairbanks,Jules'],spec:['Flowers','Champagne'],
     notes:['Prefers still water at room temperature',['Allergic to nuts','and shellfish']]},
   {room:'0702',name:'Lindqvist,Tomas,Mr.',arr:D,dep:'2026-11-08',adl:1},
   {room:'0705',name:'Okafor,Chidi,Mr.',arr:'2026-11-02',dep:D,depTime:'10:30',adl:1},
   {room:'1406',name:'Öztürk,Ilgın,Ms.',arr:'2026-11-05',dep:'2026-11-07'}]);
 const gb=await R.gih({day:D,rows:gihRows},br);
 ok(pages(gb)===2,'GIH: 32 satır iki sayfaya basıldı ('+pages(gb)+')');
 m=await H.ingest(p,gb,'GIH01102.pdf');
 ok(await last(p)==='gih','GIH: in-house raporu olarak tanındı');
 ok(/^32 oda · 1 gelen · 1 notlu/.test(m),'GIH: mesaj "32 oda · 1 gelen · 1 notlu" ('+m+')');
 S=await p.evaluate(()=>({g:JSON.parse(__ev('BdiKV').get('bdi_gih_v1')),vr:__ev('vacRooms')}));
 const G={};S.g.rows.forEach(r=>G[r.room]=r);
 ok(S.g.day===D&&S.g.rows.length===32&&G['2028']&&G['2028'].name==='Garrow,Lucan,Mx.','GIH: bdi_gih_v1 gün '+S.g.day+', '+S.g.rows.length+' oda, 2. sayfadaki son dolgu satırı okundu');
 ok(J(G['0701'])===J({room:'0701',name:'Fairbanks,Odette,Mrs.',arr:'2026-11-04',dep:'2026-11-09',depTime:'',type:'KGA',adl:2,chl:1,acc:['Jules Fairbanks'],spec:['Flowers','Champagne'],
   notes:[['Prefers still water at room temperature'],['Allergic to nuts and shellfish']]}),'GIH: 0701 tam satır (refakatçi, Specials, iki not, küçük harfli devam satırı birleşti) '+J(G['0701']));
 ok(G['0705'].depTime==='10:30'&&G['0705'].dep===D&&G['0702'].arr===D&&G['1406'].name==='Öztürk,Ilgın,Ms.'&&G['1406'].adl===2,'GIH: 0705 EDT 10:30, 0702 bugün geldi, 1406 Türkçe harfli isim');
 ok(S.vr['0701']==='Fairbanks,Odette,Mrs.'&&S.vr['2001']==='Arden,Iris,Mx.','GIH: oda listesi in-house adlarıyla yenilendi');

 // 3) Varış (ARR01102): bugün gelen 3 misafir; ETD, rate, profil notu
 const ab=await R.arr({day:D,time:'19:45',rows:[{room:'0702',name:'Lindqvist,Tomas,Mr.',arr:D,dep:'2026-11-08',etd:'12:30',rate:'RA1',amount:'720.00',notes:['Likes a jazz playlist']},
   {room:'1203',name:'Moreau,Camille,Ms.',arr:D,dep:'2026-11-10',rate:'WHDY25'},
   {room:'1510',name:'Haddad,Rami,Dr.',arr:D,dep:'2026-11-07',etd:'09:00',adl:2,chl:1}]},br);
 m=await H.ingest(p,ab,'ARR01102.pdf');
 ok(await last(p)==='arr','ARR: varış raporu olarak tanındı');
 ok(/^3 misafir · varış 06\.11/.test(m),'ARR: mesaj "3 misafir · varış 06.11..." ('+m+')');
 S=await p.evaluate(()=>({t:__ev('bdiTodayArrivals()').map(g=>({r:g.roomNo,l:g.lastName,f:g.firstName,ti:g.title,a:g.arrDate,d:g.depDate,n:g.nights,etd:g.etd,rc:g.rateCode,ra:g.rateAmount,cu:g.currency,adl:g.adl,chl:g.chl,wn:g.wnGroups||[]})),
   all:__ev('allGuests').length,day:__ev('swArrFor')('2026-11-06').length,reg:__ev('swRepAll()').arr,vr:__ev('vacRooms')}));
 const A={};S.t.forEach(g=>A[g.r]=g);
 ok(S.t.length===3&&S.all===3&&S.day===3&&S.reg&&S.reg.arrDay===D,'ARR: bugünün varış listesi 3 misafir (allGuests, swArrFor, Rapor Merkezi kaydı)');
 ok(J(A[702])===J({r:702,l:'Lindqvist',f:'Tomas',ti:'Mr.',a:'06-11-26',d:'08-11-26',n:2,etd:'12:30',rc:'RA1',ra:720,cu:'EUR',adl:1,chl:0,wn:[['Likes a jazz playlist']]}),'ARR: 0702 isim, tarihler, ETD, rate, not '+J(A[702]));
 ok(A[1203]&&A[1203].l==='Moreau'&&A[1203].etd===''&&A[1203].rc==='WHDY25'&&A[1510]&&A[1510].ti==='Dr.'&&A[1510].etd==='09:00'&&A[1510].adl===2&&A[1510].chl===1,'ARR: 1203 ETD yok, 1510 Dr., ETD 09:00, 2+1 kişi');
 ok(S.vr['1203']==='Moreau, Camille'&&S.vr['1510']==='Haddad, Rami'&&S.vr['0702']==='Lindqvist,Tomas,Mr.','ARR: bugün gelenler oda listesine eklendi, in-house adı korundu');

 // 4) Çıkış (DEP01100): 2 çıktı (CKOT), 1 çıkacak (DUOT); Opera toplam satırı
 const db=await R.dep({day:D,time:'12:40',rows:[{room:'0705',name:'Okafor,Chidi,Mr.',arr:'2026-11-02',dep:D,time:'10:12'},
   {room:'0806',name:'Brandt,Leonie,Ms.',arr:'2026-11-03',dep:D,st:'DUOT',time:'12:00'},
   {room:'0901',name:'Vasquez,Mateo Luis,Mr.',arr:'2026-11-01',dep:D,time:'09:05',adl:2}]},br);
 m=await H.ingest(p,db,'DEP01100.pdf');
 ok(await last(p)==='dep','DEP: çıkış raporu olarak tanındı');
 ok(/^3 oda · 2 çıktı · 1 çıkacak/.test(m)&&/Opera toplamıyla aynı/.test(m),'DEP: mesaj "3 oda · 2 çıktı · 1 çıkacak ... Opera toplamıyla aynı" ('+m+')');
 S=await p.evaluate(()=>({d:JSON.parse(__ev('BdiKV').get('bdi_dep_v1')).days['2026-11-06'],vr:__ev('vacRooms')}));
 ok(S.d&&J(S.d.rows)===J([{room:'0705',name:'Okafor,Chidi,Mr.',arr:'2026-11-02',dep:D,st:'CKOT',time:'10:12'},{room:'0806',name:'Brandt,Leonie,Ms.',arr:'2026-11-03',dep:D,st:'DUOT',time:'12:00'},
   {room:'0901',name:'Vasquez,Mateo Luis,Mr.',arr:'2026-11-01',dep:D,st:'CKOT',time:'09:05'}]),'DEP: bdi_dep_v1 satırları (oda, isim, tarihler, durum, saat) '+J(S.d&&S.d.rows));
 ok(S.d.printed==='12:40'&&J(S.d.total)===J({adl:4,chl:0,rooms:3}),'DEP: basım saati 12:40, Opera toplamı 4 yetişkin 3 oda '+J({p:S.d.printed,t:S.d.total}));
 ok(S.vr['0705']===undefined&&S.vr['0701']==='Fairbanks,Odette,Mrs.','DEP: 10:12\'de çıkan 0705 oda listesinden düştü, 0701 duruyor');
 await done();
})();
