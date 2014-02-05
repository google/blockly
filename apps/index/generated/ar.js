// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">بيئة برمجة مرئية</span><span id="blocklyMessage">بلوكلي</span><span id="codeTooltip">راجع إنشاء تعليمات برمجية JavaScript.</span><span id="linkTooltip">احفظ ووصلة إلى البلوكات.</span><span id="runTooltip">شغل البرنامج المعرف بواسطة البلوكات في مساحة العمل.</span><span id="runProgram">شغِّل البرنامج</span><span id="resetProgram">إعادة ضبط</span><span id="dialogOk">حسن</span><span id="dialogCancel">إلغاء الأمر</span><span id="catLogic">منطق</span><span id="catLoops">الحلقات</span><span id="catMath">رياضيات</span><span id="catText">نص</span><span id="catLists">قوائم</span><span id="catColour">لون</span><span id="catVariables">متغيرات</span><span id="catProcedures">إجراءات</span><span id="httpRequestError">كانت هناك مشكلة مع هذا الطلب.</span><span id="linkAlert">مشاركة كود بلوكلي الخاص بك مع هذا الرابط:\n 1%</span><span id="hashError">عذراً،ال \'1%\' لا تتوافق مع أي برنامج تم حفظه.</span><span id="xmlError">تعذر تحميل الملف المحفوظة الخاصة بك.  ربما تم إنشاؤه باستخدام إصدار مختلف من بلوكلي؟</span><span id="listVariable">قائمة</span><span id="textVariable">نص</span></div>';
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

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">تطبيقات بلوكلي</ span><span id="indexFooter">يعتبر "بلوكلي" مصدر مجاني ومفتوح. للمٌساهمة في الكود أو الترجمات الخاصة بـ بلوكلي, او لاستخدام بلوكلي في التطبيق الخاص بك, يرجى زيارة 1%<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">تطبيقات بلوكلي</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>يعتبر "بلوكي" بيئة برمجية ورسومية في آن واحد. ستجد أدناه بعض النماذج لتطبيقات تستعمل بلوكلي.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">أحجية</a></div><div>تعلم استخدام واجهة بلوكلي.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">المتاهة</a></div><div>استخدم بلوكلي لحل متاهة.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">رسومات السلحفاة</a></div><div>استخدم بلوكلي للرسم.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">آلة حساب الرسوميات</a></div><div>ارسم الدوال مع بلوكلي.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">كود</a></div><div>صدر برنامج بلوكلي إلى جافاسكريبت، بايثون أو XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">آلة حاسبة لمقعد الطائرة</a></div><div>حل مشكلة رياضيات في متغير واحد أو متغيرين.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">مصنع البلوكات</a></div><div>ابن بلوكات مخصصة باستخدام بلوكلي.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
