# المعمل 1: مقارنة HTTP/2 و HTTP/3

مقارنة أداء HTTP/2 وHTTP/3 (QUIC) عند تحميل صفحة متعددة الموارد، بقياس **TTFB** و**Load time** في ثلاثة ظروف شبكة: عادية، بطيئة (Slow 4G)، ومعرّضة لفقدان الحزم.

- **الطالب:** [احمد فوزي قديح]
- **المقرر:**[حوسبة الويب متقدم]

## محتويات المستودع

| الملف | الوظيفة |
|---|---|
| `Caddyfile` | إعداد خادم Caddy: المنفذ 8443 (HTTP/3 + h2) والمنفذ 9443 (HTTP/2 فقط) |
| `template.html` | قالب صفحة الاختبار: معرض صور + قياس تلقائي + جدول تشغيلات + تصدير CSV |
| `make.js` | يقرأ الصور من `site/img` ويولّد `site/index.html` من القالب |
| `start.bat` | يشغّل Caddy وChrome (بالإعدادات الصحيحة) بضغطة واحدة على Windows |
| `results/` | ملفات النتائج الخام (CSV) للسيناريوهات الثلاثة |
| `lab1_report.docx` | تقرير المعمل |

## المتطلبات

- Windows 10 أو أحدث
- [Caddy](https://caddyserver.com/download) (جُرّب مع الإصدار 2.11.7)، ضع `caddy.exe` بجانب الملفات
- [Node.js](https://nodejs.org) (لتشغيل `make.js`)
- Google Chrome
- [Clumsy](https://jagt.github.io/clumsy/) لمحاكاة فقدان الحزم (بديل `tc/netem` على Windows)

## التشغيل

1. ضع 60 صورة JPEG صغيرة (حوالي 10 إلى 15 كيلوبايت لكل صورة) داخل `site/img/`.
2. ولّد الصفحة:
   ```
   node make.js
   ```
3. شغّل كل شيء:
   ```
   start.bat
   ```
   أو يدويًا:
   ```
   caddy run
   ```
   ثم افتح Chrome بهذه الأعلام (ملف تعريف نظيف، تفعيل QUIC، وإجباره على المنفذ 8443):
   ```
   chrome.exe --user-data-dir=C:\temp\chrome-h3 --enable-quic --ignore-certificate-errors --origin-to-force-quic-on=localhost:8443 https://localhost:8443 https://localhost:9443
   ```
4. تأكد من الشارة أعلى الصفحة: **H3** على 8443 و**H2** على 9443.

## القياس

1. افتح DevTools (`F12`) ثم Network، وفعّل **Disable cache**.
2. اضغط **تشغيل تلقائي (6 مرات)**. يعيد التحميل ويسجّل كل تشغيل، ويحسب المتوسط.
3. اضغط **تصدير CSV** لحفظ النتائج.

يُحذف التشغيل الأول عند الحساب (تسخين)، فالمتوسط على 6 تشغيلات.

### السيناريوهات

| السيناريو | الإعداد |
|---|---|
| عادي | DevTools على No throttling |
| بطيء | DevTools على Slow 4G |
| فقدان حزم | Clumsy: Lag 50ms + Drop 2% (Outbound)، وDevTools على No throttling |

فلتر Clumsy المستخدم (يخص المنفذين فقط):

```
outbound and (tcp.DstPort == 9443 or tcp.SrcPort == 9443 or udp.DstPort == 8443 or udp.SrcPort == 8443)
```

> شغّل Clumsy كمسؤول، وأوقفه (Stop) بعد انتهاء القياس.

## كيف تُقاس القيم

يستخدم السكربت داخل الصفحة Navigation Timing API:

- `TTFB = responseStart - startTime`
- `Load = loadEventEnd - startTime`
- البروتوكول الفعلي من `nextHopProtocol` (`h2` أو `h3`)

## النتائج (متوسط 6 تشغيلات)

| السيناريو | البروتوكول | TTFB (ms) | Load (ms) |
|---|---|---|---|
| عادي | HTTP/2 | 14.1 | 163.6 |
| عادي | HTTP/3 | 15.1 | 204.7 |
| Slow 4G | HTTP/2 | 13.8 | 5,198.8 |
| Slow 4G | HTTP/3 | 16.3 | 12,551.8 |
| فقدان 2% + 50ms | HTTP/2 | 221.0 | 2,616.7 |
| فقدان 2% + 50ms | HTTP/3 | 161.2 | 8,718.0 |

في هذه التجربة كان HTTP/2 أسرع في الظروف الثلاثة. التحليل والتفسير في `lab1_report.docx`.

## ملاحظات

- الاختبار على `localhost`، فلا توجد مسافة شبكية حقيقية، ولهذا قد لا تظهر مزايا HTTP/3.
- عدد التشغيلات صغير (6) والتذبذب كبير، فالأرقام الدقيقة غير ثابتة.
- الصور المستخدمة في الاختبار غير مرفوعة في المستودع (انظر `.gitignore`)، فضع صورك الخاصة.
