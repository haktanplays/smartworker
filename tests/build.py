#!/usr/bin/env python3
"""Testlerin calisma klasorunu (tests/.build/) kurar. Git'e girmez.

  python3 tests/build.py              -> uygulamanin test kopyasi (.build/t ve .build/t2) + testler
  python3 tests/build.py --ref HEAD~1 -> ayrica o surumun kopyasi (.build/t3): "duzeltmeden once kaliyor muydu?"

Test kopyasi = SmartWorker3.html + window.__ev(ifade) (uygulamanin icinde calisir) ve window.__t yardimcilari.
Testler .build/ icine kopyalanip oradan calisir: tests/x.test.js -> .build/x.js. tests/data/ ve
tests/private/data/ (gercek raporlar, git'e girmez) icerigi .build/ kokune ayni klasor duzeniyle kopyalanir.
"""
import os, shutil, subprocess, sys

T = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(T)
B = os.path.join(T, '.build')
END = '})(); // end IIFE'
HOOK = r'''window.__ev=function(s){return eval(s)};
window.__t=new Proxy({},{get:function(o,k){
  if(k==="profiles")return function(){_bdiGMProf=null;return bdiGMProfiles()};
  if(k==="ruleStats")return function(){_bdiRuleCache=null;return bdiRuleStats()};
  if(k==="getBdis")return function(){return bdiLogs};
  if(k==="getDir")return function(){return _pyDirHandle};
  if(k==="getSyncFile")return function(){return _syncHandle};
  if(k==="capture")return function(fn){var h="",od=dl,ow=window.open;dl=function(x){h+=x};window.open=function(){return {document:{open:function(){},write:function(x){h+=x},close:function(){}},focus:function(){},print:function(){},close:function(){}}};var done=function(){dl=od;window.open=ow;return h};var r;try{r=fn()}catch(e){done();throw e}if(r&&typeof r.then==="function")return r.then(done,function(e){done();throw e});return done()};
  if(k==="captureBrief")return function(g){return window.__t.capture(function(){return bdiBriefFor(g)})};
  if(typeof k!=="string"||k==="then")return undefined;
  return eval(k)}});
'''


def instrument(src, dirs):
    if src.count(END) != 1:
        sys.exit('SmartWorker3.html icinde "%s" tam bir kez olmali' % END)
    out = src.replace(END, HOOK + END)
    for d in dirs:
        os.makedirs(os.path.join(B, d), exist_ok=True)
        open(os.path.join(B, d, 'SmartWorker3.html'), 'w', encoding='utf-8').write(out)


def copytree(src, dst):
    if os.path.isdir(src):
        shutil.copytree(src, dst, dirs_exist_ok=True)


def main():
    for d in ('did', 'ui', 'out'):  # testlerin rapor / ekran goruntusu yazdigi klasorler
        os.makedirs(os.path.join(B, d), exist_ok=True)
    instrument(open(os.path.join(ROOT, 'SmartWorker3.html'), encoding='utf-8').read(), ['t', 't2'])
    if '--ref' in sys.argv:
        ref = sys.argv[sys.argv.index('--ref') + 1]
        old = subprocess.run(['git', '-C', ROOT, 'show', ref + ':SmartWorker3.html'], capture_output=True, check=True).stdout.decode('utf-8')
        instrument(old, ['t3'])
    for base in (T, os.path.join(T, 'private')):
        if not os.path.isdir(base):
            continue
        for f in os.listdir(base):
            p = os.path.join(base, f)
            if os.path.isfile(p) and f.endswith('.js'):
                shutil.copy(p, os.path.join(B, f[:-len('.test.js')] + '.js' if f.endswith('.test.js') else f))
        copytree(os.path.join(base, 'data'), B)
    print('hazir: ' + B)


main()
