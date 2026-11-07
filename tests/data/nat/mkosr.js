// Opera OSR (Guest Profile Check) duzeninde ornek PDF (kurgusal kisiler)
const {chromium}=require('playwright');
const rows=[ // isim, e-posta, telefon, ulke, uyruk, varis, cikis
 ["Al Mazrouei, Khalid","k.mazrouei@example.ae","+971 50 111 2233","AE","AE","30-11-26","04-12-26"],
 ["Al Mazrouei, Noura","","","AE","AE","30-11-26","04-12-26"],
 ["Al Hashimi, Omar","omar@example.ae","+971 55 000 1111","AE","UNITED ARAB EMIRATES","01-12-26","03-12-26"],
 ["Al Suwaidi, Mariam","","","AE","ARE","28-11-26","02-12-26"],           // 02.12 sabahi cikiyor -> otelde sayilmaz
 ["Al Kaabi, Saeed","","","AE","AE","03-12-26","06-12-26"],               // 03.12 geliyor -> sayilmaz
 ["Al Fardan, Hamad","h@example.qa","+974 33 22 11","QA","QA","29-11-26","05-12-26"], // Katar: BAE gunu sayilmaz
 ["Whitcombe-Harrington, Alexander","alex@example.co.uk","+44 20 1234","GB","GB","27-11-26","03-12-26"],
 ["Volkova, Anastasia","","","RU","RUSSIA","29-11-26","01-12-26"],
 ["Yılmaz, Selin","selin@example.com.tr","+90 532 000 00 00","TR","TR","29-11-26","30-11-26"],
 ["9001, House Use","","","","","29-11-26","30-12-26"]];
(async()=>{const b=await chromium.launch();const p=await b.newPage();
 const X=[20,190,330,440,500,600,680];const H=["Full Name","Email","Phone","Country","Nationality","Arrival","Departure"];
 let y=70,body='<div style="position:absolute;left:20px;top:20px;font:bold 14px Arial">OSR - Guest Profile Check</div><div style="position:absolute;left:20px;top:42px;font:10px Arial">Filter: Arrival 27-11-26 - 03-12-26</div>';
 H.forEach((h,i)=>body+=`<div style="position:absolute;left:${X[i]}px;top:${y}px;font:bold 10px Arial">${h}</div>`);
 rows.forEach(r=>{y+=22;r.forEach((c,i)=>{let t=c;if(i===0&&c.length>26){body+=`<div style="position:absolute;left:${X[0]}px;top:${y+11}px;font:10px Arial">${c.slice(c.indexOf(' ')+1)}</div>`;t=c.slice(0,c.indexOf(' '))}body+=`<div style="position:absolute;left:${X[i]}px;top:${y}px;font:10px Arial">${t}</div>`});if(r[0].length>26)y+=11});
 body+=`<div style="position:absolute;left:20px;top:${y+40}px;font:10px Arial">Page 1 of 1</div>`;
 await p.setContent('<html><body style="margin:0;position:relative;width:800px;height:1100px">'+body+'</body></html>');
 await p.pdf({path:__dirname+'/pdf/OSR_GuestProfileCheck.pdf',width:'800px',height:'1100px',printBackground:false});await b.close();console.log('pdf ok')})();
