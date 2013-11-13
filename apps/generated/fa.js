// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">یک محیط برنامه\u200Cنویسی بصری</span><span id="blocklyMessage">بلوکی</span><span id="codeTooltip">دیدن کد جاوااسکریپت ایجادشده.</span><span id="linkTooltip">ذخیره و پیوند به بلوک\u200Cها.</span><span id="runTooltip">اجرای برنامهٔ تعریف\u200Cشده توسط بلوک\u200Cها در فضای کار.</span><span id="runProgram">اجرای برنامه</span><span id="resetProgram">از نو</span><span id="dialogOk">تأیید</span><span id="dialogCancel">لغو</span><span id="catLogic">منطق</span><span id="catLoops">حلقه\u200Cها</span><span id="catMath">ریاضی</span><span id="catText">متن</span><span id="catLists">فهرست\u200Cها</span><span id="catColour">رنگ</span><span id="catVariables">متغییرها</span><span id="catProcedures">روندها</span><span id="httpRequestError">مشکلی با درخواست وجود داشت.</span><span id="linkAlert">اشتراک\u200Cگذاری بلاک\u200Cهایتان با این پیوند:\n\n%1</span><span id="hashError">شرمنده، «%1» با هیچ برنامهٔ ذخیره\u200Cشده\u200Cای تطبیق پیدا نکرد.</span><span id="xmlError">نتوانست پروندهٔ ذخیرهٔ شما بارگیری شود.  احتمالاً با نسخهٔ متفاوتی از بلوکی درست شده\u200Cاست؟</span><span id="listVariable">فهرست</span><span id="textVariable">متن</span></div>';
};


apps.dialog = function(opt_data, opt_ignored) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};


apps.codeDialog = function(opt_data, opt_ignored) {
  return '<div id="dialogCode" class="dialogHiddenContent"><pre id="containerCode"></pre>' + apps.ok(null) + '</div>';
};


apps.storageDialog = function(opt_data, opt_ignored) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + apps.ok(null) + '</div>';
};


apps.ok = function(opt_data, opt_ignored) {
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">تأیید</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored) {
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Blockly Apps</ span><span id="indexFooter">Blockly is free and open source.  To contribute code or translations to Blockly, or to use Blockly in your own app, visit %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<h1>Blockly Apps</h1><p>Blockly is a graphical programming environment.  Below are some sample applications that use Blockly.<table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">پازل</a></div><div>Learn to use Blockly\'s interface.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">پیچ\u200Cدرپیچ</a></div><div>Use Blockly to solve a maze.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">گرافیک لاک\u200Cپشت</a></div><div>Use Blockly to draw.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">ماشین\u200Cحساب گراف</a></div><div>Plot functions with Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">کد</a></div><div>Export a Blockly program into JavaScript, Python or XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">طرح\u200Cها</a></div><div>Solve a math problem with one or two variables.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Block Factory</a></div><div>Build custom blocks using Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
