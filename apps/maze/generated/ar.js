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

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">تحرّك إلى الأمام</span><span id="Maze_turnLeft">استدر إلى اليسار</span><span id="Maze_turnRight">استدر الى اليمين</span><span id="Maze_doCode">افعل</span><span id="Maze_elseCode">غير</span><span id="Maze_helpIfElse">بلوكات If-else ستفعل شيئا محددا أو شيئا آخر.</span><span id="Maze_pathAhead">لو هناك مسار في الأمام</span><span id="Maze_pathLeft">إذا كان المسار إلى اليسار</span><span id="Maze_pathRight">إذا كان المسار إلى اليمين</span><span id="Maze_repeatUntil">كرِّر حتى</span><span id="Maze_moveForwardTooltip">يتحرك اللاعب مسافة واحدة إلى الأمام.</span><span id="Maze_turnTooltip">ينعطف اللاعب الى اليمين أو اليسار بمقدار 90 درجة.</span><span id="Maze_ifTooltip">إذا كان هناك مسار في الاتجاه المحدد، انجز بعض الإجراءات.</span><span id="Maze_ifelseTooltip">اذا كان هناك مسار في الاتجاه المٌحدد، لذا يٌمكنك تنفيذ أول كتلة من الأوامر. غير ذلك، قم بتنف</span><span id="Maze_whileTooltip">قم بتكرار العملية حتى الوصول إلى نهاية النقطة المٌحددة.</span><span id="Maze_capacity0">لديك %0 بلوكات متبقية.</span><span id="Maze_capacity1">لديك %1 بلوك متبقي.</span><span id="Maze_capacity2">لديك %2 بلوك متبقي.</span><span id="Maze_nextLevel">تهانينا! هل أنت مستعد للمضي قدما إلى مستوى %1 ؟</span><span id="Maze_finalLevel">مبروك! أنت قمت بحل المستوى النهائي.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">بلوكلي</a> : المتاهة</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="راجع إنشاء تعليمات برمجية JavaScript."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="احفظ ووصلة إلى البلوكات."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="يجعل اللاعب يقوم بما تقوله البلوكات."><img src="../../media/1x1.gif" class="run icon21"> شغِّل البرنامج</button><button id="resetButton" class="primary" style="display: none" title=" استرجاع اللاعب الى  بداية المتاهة."><img src="../../media/1x1.gif" class="stop icon21"> إعادة ضبط</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>قم بعمل حركتين في آن واحد للآمام لمٌساعدتي للوصول الى الهدف.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>في هذا المستوى, ستحتاج الى تجميع كل الكتل مع بعضها البعض في ساحة العمل البيضاء.<iframe id="iframeOneTopBlock" style="height: 80px; width: 100%; border: none;" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>قم بتشغيل البرنامج الخاص بك لرؤية ما يحدث.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>برنامجك لم يحل المتاهة.  اضغط \'إعادة\' وحاول مرة أخرى.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>الوصول إلى نهاية المسار باستخدام فقط كتلتين. استخدم \'كرر حتى\' لتشغيل الكتلة أكثر من مرة.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>لقد قمت باستخدام جميع الكتل في هذا المستوى. لعمل كتلة جديدة. عليك اولا مسح كتل موجودة.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>يٌمكنك ضبط اكثر من كتلة واحدة داخل كتلة \'كرر حتى\'.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>اختر لاعبك المفضل من هذه القائمة.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>كتلة \'إذا ستقوم بعمل شيء ما في حالة كن الشرط صحيحا. حاول الدوران إلى اليسار إذا كان هناك مسار إلى اليسار.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">انقر على %1 في كتلة "إذا" لتغيير الحالة.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>بلوكات If-else ستفعل شيئا محددا أو شيئا آخر.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>هل يمكنك حل هذه المتاهة المعقدة؟  حاول ان تلحق الجدار الأيسر.  للمبرمجين المتقدمين فقط!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
