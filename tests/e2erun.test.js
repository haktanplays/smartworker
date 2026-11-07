const {spawn,execFileSync}=require('child_process');
const srv=spawn(process.execPath,[__dirname+'/srv.js'],{stdio:'ignore'});
setTimeout(()=>{try{const out=execFileSync(process.execPath,[__dirname+'/p4e2e.js',__dirname],{encoding:'utf8',timeout:380000});console.log(out.split('\n').filter(l=>/JS errors|zaten|touch, /.test(l)).join('\n'))}catch(e){console.log('FAIL',String(e.stdout||'').slice(-800),String(e.message).slice(0,300))}srv.kill()},800);
