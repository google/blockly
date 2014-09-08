// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">یک محیط برنامه\u200Cنویسی بصری</span><span id="blocklyMessage">بلوکی</span><span id="codeTooltip">دیدن کد جاوااسکریپت ایجادشده.</span><span id="linkTooltip">ذخیره و پیوند به بلوک\u200Cها.</span><span id="runTooltip">اجرای برنامهٔ تعریف\u200Cشده توسط بلوک\u200Cها در فضای کار.</span><span id="runProgram">اجرای برنامه</span><span id="resetProgram">از نو</span><span id="dialogOk">تأیید</span><span id="dialogCancel">لغو</span><span id="catLogic">منطق</span><span id="catLoops">حلقه\u200Cها</span><span id="catMath">ریاضی</span><span id="catText">متن</span><span id="catLists">فهرست\u200Cها</span><span id="catColour">رنگ</span><span id="catVariables">متغییرها</span><span id="catProcedures">توابع</span><span id="httpRequestError">مشکلی با درخواست وجود داشت.</span><span id="linkAlert">اشتراک\u200Cگذاری بلاک\u200Cهایتان با این پیوند:\n\n%1</span><span id="hashError">شرمنده، «%1» با هیچ برنامهٔ ذخیره\u200Cشده\u200Cای تطبیق پیدا نکرد.</span><span id="xmlError">نتوانست پروندهٔ ذخیرهٔ شما بارگیری شود.  احتمالاً با نسخهٔ متفاوتی از بلوکی درست شده\u200Cاست؟</span><span id="listVariable">فهرست</span><span id="textVariable">متن</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">تأیید</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">برنامه\u200Cهای بلوکلی</ span><span id="indexFooter">بلوکلی رایگان و متن\u200Cباز است.  برای مشارکت کد یا ترجمهٔ بلوکلی یا استفاده از بلوکلی در برنامهٔ خودتان، %1 را ببینید.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">برنامه\u200Cهای بلوکلی</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>بلوکلی یک محیط برنامه\u200Cنویسی گرافیک است.  در زیر نمونه برنامه\u200Cهایی وجود دارد که از بلوکلی استفاده می\u200Cکند.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">پازل</a></div><div>استفاده از ظاهر بلوکلی را یاد بگیرید.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">پیچ\u200Cدرپیچ</a></div><div>استفاده از بلوکلی برای حل یک معما.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">گرافیک لاک\u200Cپشت</a></div><div>استفاده از بلوکلی برای کشیدن.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">ماشین\u200Cحساب گراف</a></div><div>توابع کشیدن با بلوکلی.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">کد</a></div><div>خارج\u200Cسازی یک برنامه بلوکلی به جاوااسکریپت، پایتون، دارت و اکس\u200Cام\u200Cال.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">محاسبه\u200Cگر صندلی\u200Cهای هواپیما</a></div><div>حل یک مسألهٔ ریاضی با یک یا دو متغییر.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">کارخانهٔ بلوکلی</a></div><div>ساخت بلوک\u200Cهای سفارشی با استفاده از بلوکلی.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
