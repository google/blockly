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

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">حرکت رو به جلو</span><span id="Maze_turnLeft">بپیچ به چپ</span><span id="Maze_turnRight">بپیچ به راست</span><span id="Maze_doCode">انجام</span><span id="Maze_elseCode">آنگاه</span><span id="Maze_helpIfElse">بلوک\u200Cها اگر-آنگاه یک کار را انجام می\u200Cدهند یا یک کار دیگر.</span><span id="Maze_pathAhead">اگر مسیر پیش رو</span><span id="Maze_pathLeft">اگر مسیر به سمت چپ</span><span id="Maze_pathRight">اگر مسیر به سمت راست</span><span id="Maze_repeatUntil">تکرار تا</span><span id="Maze_moveForwardTooltip">بازیکن را یک خانه جلو می\u200Cبرد.</span><span id="Maze_turnTooltip">بازیکن ۹۰ درجه چپ یا راست می\u200Cچرخاند.</span><span id="Maze_ifTooltip">اگر مسیری در یک جهت وجود دارد، پس کارهایی انجام بده.</span><span id="Maze_ifelseTooltip">اگر مسیری در جهت مشخص\u200Cشده وجود دارد، اول اولین بلوک کارها را انجام بده. در غیر اینصورت بلوک دوم کارها را انجام بده.</span><span id="Maze_whileTooltip">کارهای محصور را تا رسیدن به نقطهٔ پایان تکرار کن.</span><span id="Maze_capacity0">شما %0 بلوک باقی\u200Cمانده دارید.</span><span id="Maze_capacity1">شما %1 بلوک مانده دارید.</span><span id="Maze_capacity2">شما %2 بلوک باقی\u200Cمانده دارید.</span><span id="Maze_nextLevel">تشویق! شما برای ادامه به مرحله %1 آماده هستید؟</span><span id="Maze_finalLevel">تشویق! شما آخرین مرحله را حل کرده\u200Cاید.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">بلوکی</a> : پیچ\u200Cدرپیچ</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="دیدن کد جاوااسکریپت ایجادشده."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="ذخیره و پیوند به بلوک\u200Cها."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="می\u200Cگذارد کاربر آنچه که بلوک\u200Cها می\u200Cگوید را انجام دهد."><img src="../../media/1x1.gif" class="run icon21"> اجرای برنامه</button><button id="resetButton" class="primary" style="display: none" title="بازیکن را در اول شروع پیچ\u200Cدرپیچ قرار بده."><img src="../../media/1x1.gif" class="stop icon21"> از نو</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>تعدادی از بلوک\u200Cهای «حرکت به جلو» را با هم در پشته قرار بده که به رسیدن من به هدف کمک کند.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>در این مرجله، شما نیازمند قرار دادن همهٔ بلوک\u200Cها در فضای کار سفید هستید.<iframe id="iframeOneTopBlock" style="height: 80px; width: 100%; border: none;" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>اجرای برنامهٔ شما برای دیدن اینکه چه رخ می\u200Cدهد.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>برنامهٔ شما پیچ\u200Cدرپیچ را حل نکرد.  «از نو» را فشار دهید و دوباره تلاش کنید.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>رسیدن به انتهای مسیر با فقط دو بلوک. استفاده از «دوباره» برای اجرای یک بلوک بیشتر از یکی.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>شما همهٔ بلوک\u200Cهای این مرحله را استفاده کرده\u200Cاید. برای ایجاد یک بلوک جدید، شما ابتدا نیازمند حذف یک بلوک موجود هستید.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>شما می\u200Cتوانید بیشتر از بلوک را در بلوک «تکرار» جای دهید.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>انتخاب بازیکن مجبوب شما از این منو.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>یک بلوک «اگر» کاری انجام می\u200Cدهد اگر شرایط صادق بود.  چرخش به چپ را آزمایش کنید اگر یک مسیر به چپ است.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">بر %1 در بلوک «اگر» کلیک کنید که شرایط را تغییر دهید.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>بلوک\u200Cها اگر-آنگاه یک کار را انجام می\u200Cدهند یا یک کار دیگر.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>می\u200Cتوانید یک پیچ\u200Cدرپیچ پیچیده را جل کنید؟  از دیوار دست چپ استفاده کنید. برنامه\u200Cنویسان حرفه\u200Cای فقط!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
