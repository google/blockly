// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">Асяродзьдзе віртуальнага праграмаваньня</span><span id="blocklyMessage">Blockly (Блоклі)</span><span id="codeTooltip">Глядзі згенераваны код JavaScript.</span><span id="linkTooltip">Захаваць і зьвязаць з блёкамі. </span><span id="runTooltip">Запусьціце праграму, вызначаную блёкамі ў \\nпрацоўнай вобласьці. </span><span id="runProgram">Запусьціць праграму</span><span id="resetProgram">Скасаваць</span><span id="dialogOk">OK</span><span id="dialogCancel">Скасаваць</span><span id="catLogic">Лёгіка</span><span id="catLoops">Петлі</span><span id="catMath">Матэматычныя формулы</span><span id="catText">Тэкст</span><span id="catLists">Сьпісы</span><span id="catColour">Колер</span><span id="catVariables">Зьменныя</span><span id="catProcedures">Працэдуры</span><span id="httpRequestError">Узьнікла праблема з запытам.</span><span id="linkAlert">Падзяліцца Вашым блёкам праз гэтую спасылку:\n\n%1</span><span id="hashError">Прабачце, \'%1\' не адпавядае ніводнай захаванай праграме.</span><span id="xmlError">Не атрымалася загрузіць захаваны файл. Магчыма, ён быў створаны з іншай вэрсіяй Блёклі?</span><span id="listVariable">сьпіс</span><span id="textVariable">тэкст</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">OK</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">рухацца наперад</span><span id="Maze_turnLeft">паварот налева</span><span id="Maze_turnRight">павярнуць направа</span><span id="Maze_doCode">выканаць</span><span id="Maze_elseCode">у іншым выпадку</span><span id="Maze_helpIfElse">Блёкі „калі-інакш“ будуць выконваць адно ці іншае дзеяньне.</span><span id="Maze_pathAhead">калі шлях наперадзе</span><span id="Maze_pathLeft">калі шлях налева</span><span id="Maze_pathRight">калі шлях направа</span><span id="Maze_repeatUntil">паўтараць, пакуль</span><span id="Maze_moveForwardTooltip">Перамяшчае гульца наперад на адно поле.</span><span id="Maze_turnTooltip">Павярнуць гульца налева або направа на 90 градусаў.</span><span id="Maze_ifTooltip">Калі шлях у паказаным кірунку існуе, \\nто выканаць пэўныя дзеяньні. </span><span id="Maze_ifelseTooltip">Калі існуе шлях у паказаным кірунку, \\nто выканаць першы блёк дзеяньняў. \\nУ адваротным выпадку, выканаць другі \\nблёк дзеяньняў. </span><span id="Maze_whileTooltip">Паўтарыце закрытыя дзеяньні, пакуль не будзе \\nдасягнутая канцавая кропка. </span><span id="Maze_capacity0">У Вас засталося %0 блёкаў.</span><span id="Maze_capacity1">У Вас застаўся %1 блёк.</span><span id="Maze_capacity2">У Вас засталося %2 блёкі(аў).</span><span id="Maze_nextLevel">Віншуем! Вы гатовыя перайсьці на ўзровень %1?</span><span id="Maze_finalLevel">Віншуем! Вы прайшлі канчатковы ўзровень.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly (Блоклі)</a> : Лябірынт</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Глядзі згенераваны код JavaScript."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Захаваць і зьвязаць з блёкамі. "><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Дазваляе гульцу рабіць тое, што скажуць блёкі."><img src="../../media/1x1.gif" class="run icon21"> Запусьціць праграму</button><button id="resetButton" class="primary" style="display: none" title="Вярнуць гульца у пачатак лябірынту."><img src="../../media/1x1.gif" class="stop icon21"> Скасаваць</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Складзіце некалькі блёкаў «рухацца наперад», каб дапамагчы мне дасягнуць мэты.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>На гэтым узроўні, неабходна, скласьці разам усе блёкі белай працоўнай прасторы.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Запусьціць праграму, каб паглядзець, што адбываецца.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Ваша праграма не вырашае лябірынт. Націсьніце кнопку \'Ськінуць\', і паспрабуйце зноў.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Прайдзіце лябірынт карыстаючыся толькі двума блёкамі. Для запуску блёку больш аднаго разу, карыстайцеся камандай \'паўтарыць\'.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Вы выкарысталі ўсе блёкі для гэтага ўзроўню. Каб стварыць новы блёк, Вам спачатку неабходна выдаліць існуючы блёк.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Вы можаце разьмясьціць больш аднаго блёку ў блёку \'паўтарыць\'.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Выберыце ўлюблёнага гульца ў гэтым мэню.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Блёк \'калі\' выканае што-небудзь толькі ў выпадку слушнай умовы. Паспрабуйце павярнуць улева калі гэта магчыма.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Націсьніце блёк %1 \'калі\', каб зьмяніць яго ўмову.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Блёкі „калі-інакш“ будуць выконваць адно ці іншае дзеяньне.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Вы можаце вырашыць гэты складаны лябірынт? Паспрабуйце прытрымлівацца левай сьцяны. Толькі для прасунутых праграмістаў!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
