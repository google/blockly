// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">بيئة برمجة مرئية</span><span id="blocklyMessage">بلوكلي</span><span id="codeTooltip">راجع إنشاء تعليمات برمجية JavaScript.</span><span id="linkTooltip">احفظ ووصلة إلى البلوكات.</span><span id="runTooltip">شغل البرنامج المعرف بواسطة البلوكات في مساحة العمل.</span><span id="runProgram">شغِّل البرنامج</span><span id="resetProgram">إعادة ضبط</span><span id="dialogOk">حسن</span><span id="dialogCancel">إلغاء الأمر</span><span id="catLogic">منطق</span><span id="catLoops">الحلقات</span><span id="catMath">رياضيات</span><span id="catText">نص</span><span id="catLists">قوائم</span><span id="catColour">لون</span><span id="catVariables">متغيرات</span><span id="catProcedures">إجراءات</span><span id="httpRequestError">كانت هناك مشكلة مع هذا الطلب.</span><span id="linkAlert">مشاركة كود بلوكلي الخاص بك مع هذا الرابط:\n %1</span><span id="hashError">عذراً،ال \'%1\' لا تتوافق مع أي برنامج تم حفظه.</span><span id="xmlError">تعذر تحميل الملف المحفوظة الخاصة بك.  ربما تم إنشاؤه باستخدام إصدار مختلف من بلوكلي؟</span><span id="listVariable">قائمة</span><span id="textVariable">نص</span></div>';
};


apps.dialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};


apps.codeDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogCode" class="dialogHiddenContent"><pre id="containerCode"></pre>' + apps.ok(null, null, opt_ijData) + '</div>';
};


apps.storageDialog = function(opt_data, opt_ignored, opt_ijData) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


apps.ok = function(opt_data, opt_ignored, opt_ijData) {
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">حسن</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">أستراليا</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">الإنكليزية</span><span id="Puzzle_country1City1">ملبورن</span><span id="Puzzle_country1City2">سدني</span><span id="Puzzle_country1HelpUrl">https://ar.wikipedia.org/أستراليا</span><span id="Puzzle_country2">ألمانيا</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">ألماني</span><span id="Puzzle_country2City1">برلين</span><span id="Puzzle_country2City2">ميونيخ</span><span id="Puzzle_country2HelpUrl">https://ar.wikipedia.org/wiki/ألمانيا</span><span id="Puzzle_country3">الصين</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">الصينية</span><span id="Puzzle_country3City1">بكين</span><span id="Puzzle_country3City2">شنغهاي</span><span id="Puzzle_country3HelpUrl">https://ar.wikipedia.org/wiki/الصين</span><span id="Puzzle_country4">البرازيل</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">البرتغالية</span><span id="Puzzle_country4City1">ريوديجانيرو</span><span id="Puzzle_country4City2">ساوباولو</span><span id="Puzzle_country4HelpUrl">https://ar.wikipedia.org/البرازيل</span><span id="Puzzle_flag">راية:</span><span id="Puzzle_language">اللغة:</span><span id="Puzzle_languageChoose">اختر...</span><span id="Puzzle_cities">المُدُن:</span><span id="Puzzle_error0">ممتاز!\nكل المكعبات %1 صحيحة.</span><span id="Puzzle_error1">اقتربت! مكعّب واحد غير صحيح.</span><span id="Puzzle_error2">%1 مكعبات غير صحيحة.</span><span id="Puzzle_tryAgain">الكتلّة المُبرَزَة غير صحيحة.\nواصل المحاولة.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">بلوكلي</a> : أحجية</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">مساعدة</button>&nbsp; &nbsp;<button id="checkButton" class="primary">تحقّق من الإجابات</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">لكل بلد (بالأخضر) صِل العلم و اختر لغتها و جمّع مدنها.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
