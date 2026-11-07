# SmartWorker testleri

Uygulamayı gerçek bir tarayıcıda (Playwright + Chromium) açıp butlerın yaptığı işleri yapar ve sonucu kontrol eder.

## Çalıştırma

```bash
bash tests/run.sh
```

- Tek ya da birkaç test: `bash tests/run.sh qol1 roommove`
- Sonuç her test için bir satırdır: `qol1 rc=0 ALL PASS`. Hata varsa ayrıntısı `tests/.build/out/<ad>.log` dosyasında.
- "Düzeltmeden önce de bozuk muydu?" sorusu için: `REF=HEAD~1 bash tests/run.sh <ad>` komutu o sürümü `.build/t3` olarak da kurar. Test `t3` ile çalıştırılır: `node tests/.build/<ad>.js t3`.

Gerekenler: Node.js, Python 3 ve Playwright'ın Chromium'u (`npm i playwright` + `npx playwright install chromium`).

## Klasörler

| Yer | Ne | Git'e girer mi |
|---|---|---|
| `tests/*.test.js` | Uydurma verili testler (misafir isimleri kurgu) | Evet |
| `tests/data/` | Testlerin kullandığı uydurma dosyalar (sahte Opera raporları vb.) | Evet |
| `tests/private/` | Gerçek Opera raporlarıyla çalışan testler ve o raporlar | **Hayır** (KVKK) |
| `tests/.build/` | Çalışma klasörü: uygulamanın test kopyası, çıktılar | Hayır |

## Yeni test yazarken

- Gerçek misafir adı, oda-misafir eşleşmesi ya da rapor içeriği repoya girmez. Gerçek raporla deneme gerekiyorsa test `tests/private/` altına konur.
- Uygulamanın içine `__ev('fonksiyonAdı')(...)` ile ulaşılır. Veri `const KV=__ev('BdiKV');await KV.ready();KV.set(anahtar,JSON)` ile hazırlanır.
- Saat sabitlenir (`p.clock.install`). `localStorage` içinde `sw_setup_snooze` testin "bugün"üyle aynı olmalı, yoksa kurulum penceresi tıklamaları engeller.
- Her kontrol bir satır yazar (`PASS ...` / `FAIL ...`). Son satır `ALL PASS` ya da `N FAIL` olur; hata varsa çıkış kodu 1'dir.
- Tutarlılık testleri (`consistency-*.test.js`): bir bilgi (örneğin misafirin odası) kaynağında değişince, o bilginin gösterildiği bütün ekranların yeni değeri gösterdiğini kontrol eder.
