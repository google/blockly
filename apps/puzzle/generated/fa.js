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

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">استرالیا</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">انگلیسی</span><span id="Puzzle_country1City1">ملبورن</span><span id="Puzzle_country1City2">سیدنی</span><span id="Puzzle_country1HelpUrl">https://en.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">آلمان</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">آلمانی</span><span id="Puzzle_country2City1">برلین</span><span id="Puzzle_country2City2">مونیخ</span><span id="Puzzle_country2HelpUrl">https://en.wikipedia.org/wiki/Germany</span><span id="Puzzle_country3">چین</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">چینی</span><span id="Puzzle_country3City1">پکن</span><span id="Puzzle_country3City2">شانگهای</span><span id="Puzzle_country3HelpUrl">https://en.wikipedia.org/wiki/China</span><span id="Puzzle_country4">برزیل</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">پرتغالی</span><span id="Puzzle_country4City1">ریو دو ژانیرو</span><span id="Puzzle_country4City2">سائو پائولو</span><span id="Puzzle_country4HelpUrl">https://en.wikipedia.org/wiki/Brazil</span><span id="Puzzle_flag">پرچم:</span><span id="Puzzle_language">زبان:</span><span id="Puzzle_languageChoose">انتخاب کنید...</span><span id="Puzzle_cities">شهرها:</span><span id="Puzzle_error0">عالی!\nهر %1 بلوک درست است.</span><span id="Puzzle_error1">تقریبا! یک بلوک نادرست است.</span><span id="Puzzle_error2">%1 بلوک نادرست است.</span><span id="Puzzle_tryAgain">بلوک پررنگ شده درست نیست.\nمجددا تلاش کنید.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">بلوکی</a> : پازل</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">راهنما</button>&nbsp; &nbsp;<button id="checkButton" class="primary">بررسی پاسخ</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">برای هر کشور (سبز)، در کنار پرچم\u200Cشان، زبانشان را انتخاب کنید و فهرست شهرهایش را مشخص نمائید</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
