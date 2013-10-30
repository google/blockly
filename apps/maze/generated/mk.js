// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">визуелна околина за програмирање</span><span id="blocklyMessage">Блокли</span><span id="codeTooltip">Погл. создадениот JavaScript-код. </span><span id="linkTooltip">Зачувај и стави врска до блокчињата.</span><span id="runTooltip">Пушти го програмот определен од блокчињата во \\nработниот простор. </span><span id="runProgram">Пушти го програмот</span><span id="resetProgram">Одново</span><span id="dialogOk">ОК</span><span id="dialogCancel">Откажи</span><span id="catLogic">Логика</span><span id="catLoops">Јамки</span><span id="catMath">Математика</span><span id="catText">Текст</span><span id="catLists">Списоци</span><span id="catColour">Боја</span><span id="catVariables">Променливи</span><span id="catProcedures">Процедури</span><span id="httpRequestError">Се појави проблем во барањето.</span><span id="linkAlert">Споделете ги вашите блокчиња со оваа врска:\n\n%1</span><span id="hashError">„%1“ не одговара на ниеден зачуван програм.</span><span id="xmlError">Не можев да ја вчитам зачуваната податотека. Да не сте ја создале со друга верзија на Blockly?</span><span id="listVariable">список</span><span id="textVariable">текст</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">ОК</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">мрдни напред</span><span id="Maze_turnLeft">сврти лево</span><span id="Maze_turnRight">сврти десно</span><span id="Maze_doCode">изведи</span><span id="Maze_elseCode">инаку</span><span id="Maze_helpIfElse">Блокчињата „ако-тогаш“ ќе извршат или едно нешто или друго.</span><span id="Maze_pathAhead">ако има пат напред</span><span id="Maze_pathLeft">ако има пат лево</span><span id="Maze_pathRight">ако има пат десно</span><span id="Maze_repeatUntil">повторувај сè до</span><span id="Maze_moveForwardTooltip">Го мрднува играчот напред за едно место.</span><span id="Maze_turnTooltip">Го свртува играчот на лево или на десно за 90 \\nстепени. </span><span id="Maze_ifTooltip">Ако постои патека во зададената насока, \\nтогаш изврши некои дејства. </span><span id="Maze_ifelseTooltip">Ако постои патека во зададената насока, \\nтогаш изврши го првиот блок дејства. \\nВо спротивно, изврши го вториот. </span><span id="Maze_whileTooltip">Повторувај ги зададените дејства додека дојдеш \\nдо целта (крајот). </span><span id="Maze_capacity0">Ви преостануваат %0 блокчиња.</span><span id="Maze_capacity1">Ви преостанува %1 блокче.</span><span id="Maze_capacity2">Имате уште %2 блокчиња.</span><span id="Maze_nextLevel">Честитаме! Дали сте да преминете на Ниво %1?</span><span id="Maze_finalLevel">Честитаме! Го решивте последното ниво.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html">Блокли</a> : Лавиринт</span> &nbsp; ';
  for (var i161 = 1; i161 < 11; i161++) {
    output += ' ' + ((i161 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i161) + '</span>' : (i161 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Погл. создадениот JavaScript-код. "><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Зачувај и стави врска до блокчињата."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Му кажува на играчот да прави како што велат \\nблокчињата. "><img src="../../media/1x1.gif" class="run icon21"> Пушти го програмот</button><button id="resetButton" class="primary" style="display: none" title="Врати го играчот на почетокот од лавиринтот."><img src="../../media/1x1.gif" class="stop icon21"> Одново</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Наредете две блокчиња „оди напред“ за да ми помогнете да дојдам до целта.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>На ова ниво ќе треба да ги наредите сите блокчиња во белиот работен простор.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Пуштете го програмот и бидете што ќе се случи.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Програмот не го реши лавиринтот. Стиснете „Одново“ за да се обидете повторно.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Сметачите имаат ограничена меморија. Дојдете до крајот на со помош на само два блока. Послужете се со „повтори“ за да пуштите едно блокче повеќе пати.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Ги искористивте сите блокчиња за ова ниво. За да направите ново блокче, ќе треба прво да избришете некое постоечко.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Можете да ставите повеќе од едно блокче во секое блокче „повтори“</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Изберете го вашиот омилен играч од менито.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Блокчето „ако“ ќе изврши нешто само ако условот е точен. На пример, свртете лево ако има патека натаму.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Стиснете на %1 во блокот „ако“ за да му го смените условот.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Блокчињата „ако-тогаш“ ќе извршат или едно нешто или друго.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Дали можете да го решите овој сложен лавиринт? Обидете се со следниов ѕид на лево. Само за напредни програмери!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><title name="DIR">turnLeft</title></block><block type="maze_turn"><title name="DIR">turnRight</title></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><title name="DIR">isPathLeft</title></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
