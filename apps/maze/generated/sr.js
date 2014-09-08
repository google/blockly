// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">визуелно окружење за програмирање</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Погледајте генерисани JavaScript кôд.</span><span id="linkTooltip">Сачувајте и повежите са блоковима.</span><span id="runTooltip">Покрените програм заснован на блоковима у радном простору.</span><span id="runProgram">Покрени програм</span><span id="resetProgram">Поново постави</span><span id="dialogOk">У реду</span><span id="dialogCancel">Откажи</span><span id="catLogic">Логика</span><span id="catLoops">Петље</span><span id="catMath">Математика</span><span id="catText">Текст</span><span id="catLists">Спискови</span><span id="catColour">Боја</span><span id="catVariables">Променљиве</span><span id="catProcedures">Процедуре</span><span id="httpRequestError">Дошло је до проблема у захтеву.</span><span id="linkAlert">Делите своје блокове овом везом:\n\n%1</span><span id="hashError">„%1“ не одговара ниједном сачуваном програму.</span><span id="xmlError">Не могу да учитам сачувану датотеку. Можда је направљена другом верзијом Blockly-ја.</span><span id="listVariable">списак</span><span id="textVariable">текст</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">У реду</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">иди напред</span><span id="Maze_turnLeft">окрени се лево</span><span id="Maze_turnRight">окрени се удесно</span><span id="Maze_doCode">изведи</span><span id="Maze_elseCode">иначе</span><span id="Maze_helpIfElse">Блокови „ако-иначе“ извршиће или једно или друго.</span><span id="Maze_pathAhead">ако постоји пут напред</span><span id="Maze_pathLeft">ако постоји пут лево</span><span id="Maze_pathRight">ако постоји пут десно</span><span id="Maze_repeatUntil">понављај до</span><span id="Maze_moveForwardTooltip">Помера играча напред за једно место.</span><span id="Maze_turnTooltip">Окреће играча улево или удесно за 90 степени.</span><span id="Maze_ifTooltip">Ако постоји пут у датом правцу, онда изврши неке радње.</span><span id="Maze_ifelseTooltip">Ако постоји пут у датом правцу, онда изврши први блок радњи. У супротном, изврши други.</span><span id="Maze_whileTooltip">Понављајте задате радње док се не дође до краја.</span><span id="Maze_capacity0">Преостало вам је %0 блокова.</span><span id="Maze_capacity1">Преостао вам је %1 блок.</span><span id="Maze_capacity2">Преостало вам је %2 блокова.</span><span id="Maze_nextLevel">Честитамо! Јесте ли спремни да пређете на ниво %1?</span><span id="Maze_finalLevel">Честитамо! Решили сте последњи ниво.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Лавиринт</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Погледајте генерисани JavaScript кôд."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Сачувајте и повежите са блоковима."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Одређује шта ће играч урадити на основу блокова."><img src="../../media/1x1.gif" class="run icon21"> Покрени програм</button><button id="resetButton" class="primary" style="display: none" title="Вратите играча на почетак лавиринта."><img src="../../media/1x1.gif" class="stop icon21"> Поново постави</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Наређајте два блока „иди напред“ да бисте ми помогли да дођем до циља.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>У овом нивоу треба да наређате све блокове у бели радни простор.<iframe id="iframeOneTopBlock" style="height: 80px; width: 100%; border: none;" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Покрените програм и видите шта се дешава.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Програм није решио лавиринт. Кликните на „Поново“ да бисте поново покушали.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Дођите до краја пута употребивши само два блока. Користите „понови“ да бисте извршили блок више пута.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>You have used up all the blocks for this level.  To create a new block, you first need to delete an existing block.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Достигни циљ употребом само пет блокова.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Choose your favourite player from this menu.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>\'ако\' блок ће урадити нешто једино ако је услов испуњен. Покушај окрет у лево ако постоји пут са леве стране.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Click on %1 in the \'if\' block to change its condition.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Блокови „ако-иначе“ извршиће или једно или друго.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Можеш ли да решиш овај сложени лавиринт? Покшај да се крећеш уз леви зид.' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
