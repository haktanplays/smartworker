#!/bin/bash
# Butun testler:  bash tests/run.sh
# Bazilari:       bash tests/run.sh qol1 roommove
# Eski surumla:   REF=HEAD~1 bash tests/run.sh x   (.build/t3 = o surum; "duzeltmeden once kaliyor muydu?" icin)
# Sonuc: her test icin "ad rc=0 ALL PASS"; kayitlar tests/.build/out/<ad>.log
cd "$(dirname "$0")" || exit 1
python3 build.py ${REF:+--ref "$REF"} || exit 1
if [ $# -gt 0 ]; then names="$*"; else names=$(ls *.test.js private/*.test.js 2>/dev/null | sed 's#.*/##; s/\.test\.js$//'); fi
mkdir -p .build/out
run(){ timeout 900 node ".build/$1.js" > ".build/out/$1.log" 2>&1; echo "$1 rc=$? $(tail -1 ".build/out/$1.log")"; }
export -f run
echo "$names" | tr ' ' '\n' | grep . | xargs -P "${JOBS:-4}" -I{} bash -c 'run {}' | sort | tee .build/out/summary.txt
n=$(grep -c 'rc=' .build/out/summary.txt); bad=$(grep -vc 'rc=0' .build/out/summary.txt)
echo "toplam $n test, hatali $bad"
[ "$bad" = 0 ]
