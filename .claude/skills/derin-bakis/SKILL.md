---
name: derin-bakis
description: Depth lens for every new feature, redesign or workflow change in SmartWorker and its sibling apps (Butler Did It, issues, briefing, reports, Expense, Komunikasyon, Itinerary). Use BEFORE designing or building whenever the user asks for something new or says "derin", "deeper", "daha iyi kurgula", "nasıl olmalı". Produces a deeper version, not a bigger one - four questions (what a top professional would do that wasn't asked, the rawest source material, the specific methods/tools, what outside us proves it right) and a rewritten request to confirm before coding. Skip it for typo fixes, one-line tweaks and pure bug fixes.
---

# Derin bakış (daha derin, daha büyük değil)

Kullanıcı bir şey istediğinde ilk iş onu olduğu gibi kodlamak değil. Önce bu alanın en iyi profesyonelinin
aynı isteğe nasıl yaklaşacağını çıkar, isteği o seviyeye çek, kullanıcıya onaylat, sonra kur.

**Kural: derinleştir, büyütme.** En fazla 3 ek fikir. Her biri "hangi anda, kim, hangi kararı daha iyi veriyor"
sorusuna cevap vermeli. Cevap veremeyen fikir listeden çıkar.

## Dört soru (her biri bu isteğe özel, genel laf yok)

1. **Usta ne yapardı, benim istemediğim?**
   Bu işi yıllardır en iyi yapan kişi (Raffles/Ritz-Carlton seviyesinde bir Head Butler, Guest Experience
   Manager, iyi bir operasyon yazılımı tasarımcısı) bu isteğe neyi ekler ya da neyi farklı kurar?
   Genelde cevap: veriyi değil **kararı ve anı** tasarlar ("vardiyaya gelince ilk 60 saniyede ne bilmeliyim").

2. **En ham malzeme ne?**
   Bana verilen özet, filtrelenmiş liste ya da "durum" yerine ustanın başlayacağı ham kaynak. Bu projede tipik olarak:
   - Opera raporlarının kendisi (ARR01102, GIH01102, HSK01124 PDF'leri; mümkünse ham export)
   - ALICE Ticket List (Date Created / Date Closed / State / Closed_By alanlarıyla, olay olay)
   - Kaynak sistemin olay/denetim kaydı (ne zaman açıldı, kim değiştirdi, ne zaman kapandı); yoksa ardışık
     günlük dosyaların **hiç değiştirilmemiş** arşivi
   - Misafirin kendi cümlesi (ilk şikayet metni, tercih formu, TrustYou yorumu) - özet değil
   - Gerçek vardiya devri: WhatsApp devir mesajları, devir defteri, elle işaretlenmiş çıktı
   - Vardiya çizelgesi (kim ne zaman çalışıyor), kat dağılımı
   - Gerçek kullanımı izlemek: 2-3 vardiya başlangıcında butlerın gerçekten neye baktığı

3. **Hangi yöntem ve araçlar?**
   Somut isim ver. Bu projede işe yarayanlar:
   - Olay kaydı (event log, sadece eklenir) + kaynak ID ile idempotent içe alma
   - Ardışık anlık görüntüleri karşılaştırma (dünkü ve bugünkü dosyanın farkı: yeni / kaybolan / durumu değişen)
   - "Son gördüğümden beri" (delta) görünümü: kişinin son vardiyası ya da son açılışı referans
   - Vardiya devri standartları: I-PASS / SBAR (hastanelerde devir hatalarını azaltan yapı)
   - Service recovery: LEARN / HEART döngüsü, kapanış sonrası misafir teyidi
   - Bilgi hiyerarşisi + aşamalı açılım (önce zamanlı işler, sonra riskler, sonra fırsatlar);
     5 saniye / 60 saniye testi, A4 baskı testi
   - Isı haritalı takvim (gün başına yoğunluk), vardiya günlerini işaretleme
   - Playwright ile gerçek dosyalarla uçtan uca test; KVKK kuralları (tıbbi/inanç bilgisi yok, Res. Comment/fiyat saklanmaz)

4. **Senden ve benden başka ne doğru olduğunu gösterir?**
   Bizim "oldu" dememiz yetmez. Dış ölçüt seç ve mümkünse gerçekten çalıştır:
   - **Kaynak sistemle mutabakat:** aynı tarih için uygulamadaki sayılar = ALICE/Opera raporundaki sayılar,
     açıklanamayan fark sıfır; her kaynak ID tam bir kez
   - **Soğuk okuma testi:** önceki vardiyada olmayan bir butler, kimseye sormadan 60 saniyede doğru özeti çıkarıyor mu
   - **Misafir sonucu:** kapanış sonrası teyitte misafir tepkisi, TrustYou'da aynı konunun tekrar geçmemesi,
     tekrar gelen misafirde aynı sorunun yaşanmaması
   - **Üçüncü kişi:** Duty Manager / Front Office kayıtlarıyla çelişki olmaması, Guest Relations'ın aynı resmi görmesi
   - **Kağıt testi:** A4 çıktıda okunuyor, kesilmiyor, üst üste binmiyor

## Çıktı biçimi

Kodlamadan önce kullanıcıya Türkçe, sade dille:

```
1) Usta ne yapardı (istemediğin): ...
2) En ham malzeme: ...
3) Yöntem ve araçlar: ...
4) Doğruluğu kim/ne gösterir: ...

İsteğinin yeniden yazılmış hali:
"..."
```

Yeniden yazılmış istek: kısa, ölçülebilir, ham malzemeyi ve dış ölçütü içeren, "daha büyük" değil "daha derin" bir
istek olmalı. Kullanıcı onaylayınca (ya da düzeltince) kur. "Bitti" tanımı, 4. maddedeki dış ölçütün çalıştırılmasını
(ya da kullanıcıyla planlanmasını) içerir.

## Ne zaman kullanma

Yazım hatası, tek satırlık görünüm düzeltmesi, net bir hata düzeltmesi: doğrudan yap. Şüphede kısa tut:
dört soruyu birer cümleyle cevapla.
