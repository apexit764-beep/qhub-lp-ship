/*
 * يُحيي لقطة الوارد في هيرو الصفحة الرئيسية.
 *
 * اللقطة هنا ليست صورة بل صفحة اللوحة نفسها داخل إطار — فبدل ما نرسم موكاً
 * متحرّكاً يشبهها، نحرّكها هي: العميل يكتب، فيردّ المساعد، فتُحوَّل الحالة
 * الصعبة لموظف، وفي أثناء ذلك تدخل محادثات جديدة إلى القائمة. هذا ما يحصل
 * فعلاً داخل الحساب، فالهيرو يعرض المنتج شغّالاً لا صورةً له.
 *
 * لا يعمل إلا مع ‎?live=1‎: الصفحة نفسها تُستعمل في سكاشن أخرى بقصّات ثابتة
 * على مناطق منها، وحركةٌ تحتها تشوّش ما تحاول تلك السكاشن إبرازه.
 *
 * كل العقد المضافة مستنسخة من عقد موجودة في الصفحة، فتلبس أنماطها نفسها بلا
 * صفٍّ واحد من CSS جديد — والفروق الصغيرة (نقاط الكتابة، شارة التحويل)
 * بأنماط سطرية، لأن ملف الأنماط مبنيّ مسبقاً ولا يحمل أصنافاً لم تُستعمل.
 */
(function () {
  "use strict";

  if (!new URLSearchParams(location.search).has("live")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var GROUP = ".group.flex.gap-3.mb-5";

  function boot() {
    var groups = Array.prototype.slice.call(document.querySelectorAll(GROUP));
    if (groups.length < 2) return;

    var thread = groups[0].parentElement.parentElement;
    if (!thread) return;

    /* قالبان: رسالة واردة (رمادية) ورسالة مساعد (بنفسجية) */
    var inTpl = null;
    var aiTpl = null;
    groups.forEach(function (g) {
      var bubble = g.querySelector("div[class*='max-w-']");
      if (!bubble) return;
      if (bubble.className.indexOf("violet") > -1) aiTpl = aiTpl || g;
      else inTpl = inTpl || g;
    });
    if (!inTpl || !aiTpl) return;

    var list = document.querySelector(".flex-1.overflow-y-auto.divide-y");
    var rowTpl = list && list.querySelector("button");

    var added = [];

    function push(node) {
      var wrap = document.createElement("div");
      wrap.appendChild(node);
      wrap.style.animation = "qhLiveIn 420ms cubic-bezier(.16,1,.3,1) both";
      thread.appendChild(wrap);
      added.push(wrap);
      thread.scrollTop = thread.scrollHeight;
      return wrap;
    }

    /** ينسخ مجموعة رسائل ويستبدل نصّها وسطر توقيعها. */
    function message(tpl, text, who, when) {
      var g = tpl.cloneNode(true);
      var p = g.querySelector("p");
      if (p) p.textContent = text;
      var meta = g.querySelectorAll("div[class*='text-[10px]'] span");
      if (meta[0]) meta[0].textContent = who;
      if (meta[1]) meta[1].textContent = "· " + when;
      return push(g);
    }

    /** فقاعة نقاط: نفس قالب الرسالة، ومحتواها ثلاث نقاط تتنفّس. */
    function typing(tpl) {
      var g = tpl.cloneNode(true);
      var p = g.querySelector("p");
      var meta = g.querySelector("div[class*='text-[10px]']");
      if (meta) meta.style.display = "none";
      if (p) {
        p.textContent = "";
        p.style.display = "flex";
        p.style.gap = "4px";
        p.style.alignItems = "center";
        p.style.padding = "3px 0";
        for (var i = 0; i < 3; i++) {
          var dot = document.createElement("span");
          dot.style.cssText =
            "width:6px;height:6px;border-radius:999px;background:currentColor;opacity:.45;" +
            "animation:qhLiveDot 1s " + i * 0.15 + "s infinite";
          p.appendChild(dot);
        }
      }
      return push(g);
    }

    /** شارة التحويل — صفّ مستقلّ بلون تحذيري، بأنماط سطرية لا أصناف. */
    function handoff(text) {
      var el = document.createElement("div");
      el.textContent = text;
      el.style.cssText =
        "margin:0 0 20px;padding:8px 12px;border-radius:12px;font-size:12px;line-height:1.7;" +
        "background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.30);color:#B45309;" +
        "animation:qhLiveIn 420ms cubic-bezier(.16,1,.3,1) both";
      thread.appendChild(el);
      added.push(el);
      thread.scrollTop = thread.scrollHeight;
      return el;
    }

    /** محادثة جديدة تدخل رأس القائمة ومعها عدّاد غير مقروء. */
    function arrival(name, preview, initials) {
      if (!rowTpl || !list) return;
      var row = rowTpl.cloneNode(true);
      row.classList.remove("bg-primary/5");
      var av = row.querySelector("div[class*='rounded-full'][class*='font-bold']");
      if (av) av.textContent = initials;
      var texts = row.querySelectorAll("p");
      if (texts[0]) texts[0].textContent = name;
      if (texts[1]) texts[1].textContent = preview;

      var badge = document.createElement("span");
      badge.textContent = "1";
      badge.style.cssText =
        "position:absolute;inset-inline-end:12px;bottom:12px;min-width:18px;height:18px;padding:0 5px;" +
        "display:inline-flex;align-items:center;justify-content:center;border-radius:999px;" +
        "background:#2563EB;color:#fff;font-size:10px;font-weight:700;";
      row.style.position = "relative";
      row.appendChild(badge);

      row.style.animation = "qhLiveIn 420ms cubic-bezier(.16,1,.3,1) both";
      list.insertBefore(row, list.firstChild);
      added.push(row);
    }

    function clear() {
      added.forEach(function (n) {
        if (n.parentElement) n.parentElement.removeChild(n);
      });
      added = [];
    }

    /*
      المشهد: سؤال ← ردّ المساعد ← سؤال خارج المعرفة ← تحويل لموظف، وفي
      أثنائه محادثتان جديدتان — فيُقرأ الصندوق مشغولاً لا ساكناً.
    */
    var scene = [
      [1200, function () { var t = typing(inTpl); setTimeout(function () { if (t.parentElement) t.parentElement.removeChild(t); }, 1600); }],
      [1800, function () { message(inTpl, "مساء الخير، هل الشحن متاح لصلالة؟", "منى الحارثية", "الآن"); }],
      [900, function () { var t = typing(aiTpl); setTimeout(function () { if (t.parentElement) t.parentElement.removeChild(t); }, 1500); }],
      [1700, function () { message(aiTpl, "نعم، الشحن متاح لصلالة ويصل خلال يومين عمل 🚚", "المساعد الذكي", "ردّ خلال 1.8 ث"); }],
      [1400, function () { arrival("خالد الحارثي", "متى يفتح المحل اليوم؟", "خا"); }],
      [1500, function () { message(inTpl, "وهل أقدر أقسّم الفاتورة على فرعين؟", "منى الحارثية", "الآن"); }],
      [1200, function () { handoff("تحويل تلقائي — سؤال خارج قاعدة المعرفة. حُوّلت المحادثة إلى ريم · المبيعات مع ملخّص."); }],
      [1300, function () { arrival("متجر لمسة", "كم سعر الباقة الجديدة؟", "مت"); }],
      [3400, clear],
    ];

    var step = 0;
    (function tick() {
      var s = scene[step % scene.length];
      step++;
      setTimeout(function () {
        s[1]();
        tick();
      }, s[0]);
    })();
  }

  var style = document.createElement("style");
  style.textContent =
    "@keyframes qhLiveIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}" +
    "@keyframes qhLiveDot{0%,100%{opacity:.35;transform:translateY(0)}50%{opacity:1;transform:translateY(-2px)}}";
  document.head.appendChild(style);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
