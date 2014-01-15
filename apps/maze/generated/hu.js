// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">egy vizuális programozási környezet</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">A JavaScript forráskód megtekintése.</span><span id="linkTooltip">Hivatkozás létrehozása</span><span id="runTooltip">Program futtatása.</span><span id="runProgram">Program futtatása</span><span id="resetProgram">Alaphelyzet</span><span id="dialogOk">Elolvastam</span><span id="dialogCancel">Mégsem</span><span id="catLogic">Logikai műveletek</span><span id="catLoops">Ciklusok</span><span id="catMath">Matematikai műveletek</span><span id="catText">Sztring műveletek</span><span id="catLists">Listakezelés</span><span id="catColour">Színek</span><span id="catVariables">Változók</span><span id="catProcedures">Eljárások</span><span id="httpRequestError">A kéréssel kapcsolatban probléma merült fel.</span><span id="linkAlert">Ezzel a hivatkozással tudod megosztani a programodat:\n\n%1</span><span id="hashError">Sajnos a \'%1\' hivatkozás nem tartozik egyetlen programhoz sem.</span><span id="xmlError">A programodat nem lehet betölteni.  Elképzelhető, hogy a Blockly egy másik verziójában készült?</span><span id="listVariable">lista</span><span id="textVariable">szöveg</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Elolvastam</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">Menj előre</span><span id="Maze_turnLeft">Fordulj balra</span><span id="Maze_turnRight">Fordulj jobbra</span><span id="Maze_doCode">végrehajt</span><span id="Maze_elseCode">egyébként</span><span id="Maze_helpIfElse">A Ha-egyébként feltétel esetén vagy az egyik, vagy a másik utasítás-csoport kerül végrehajtásra.</span><span id="Maze_pathAhead">Ha szabad az út előtted</span><span id="Maze_pathLeft">Ha szabad az út balra</span><span id="Maze_pathRight">Ha szabad az út jobbra</span><span id="Maze_repeatUntil">Ismételd amíg eljutː</span><span id="Maze_moveForwardTooltip">A figura előre lép egy mezőt.</span><span id="Maze_turnTooltip">A figura 90 fokot fordul balra, vagy jobbra.</span><span id="Maze_ifTooltip">Ha szabad az út a megadott irányban, \\nakkor végrehajtja az utasításokat. </span><span id="Maze_ifelseTooltip">Ha szabad az út a megadott irányban, \\nakkor végrehajtja az első blokkban \\nmegadott utasításokat. Egyébként a \\nmásodik blokkban szereplő utasításokat \\nhajtja végre. </span><span id="Maze_whileTooltip">A beágyazott utasításokat hajtja végre a cél \\neléréséig. </span><span id="Maze_capacity0">Nem használhatsz fel több blokkot.</span><span id="Maze_capacity1">Még %1 blokkot használhatsz fel.</span><span id="Maze_capacity2">Még %2 blokkot használhatsz fel.</span><span id="Maze_nextLevel">Gratulálok! Kész vagy megoldani a(z) %1. szintet?</span><span id="Maze_finalLevel">Gratulálok! Sikeresen megoldottad az utolsó szintet.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Labirintus</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="A JavaScript forráskód megtekintése."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Hivatkozás létrehozása"><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="A figura végrehajtja a blokkokkal megadott \\nprogramot. "><img src="../../media/1x1.gif" class="run icon21"> Program futtatása</button><button id="resetButton" class="primary" style="display: none" title="A labirintus kezdő pozíciójába állítja a figurát."><img src="../../media/1x1.gif" class="stop icon21"> Alaphelyzet</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Segíts eljuttatni a figurát a célig, kapcsolj össze néhány \'Menj előre\' blokkot!</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Ezen a szinten össze kell kapcsolnod minden blokkot a munkaterületen.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Program futtatása, hogy kiderüljön mire utasítottuk a figurát.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>A programmal nem sikerült a figurát a célba juttatni. Kezdd elölről.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>A számítógépeknek véges a memóriájuk. Juttasd el a figurát a célig mindössze 2 blokk felhasználásával. Használd az \'Ismételd a cél eléréséig\' blokkot egy másik blokk ismételt végrehajtásához.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Minden rendelkezésedre álló blokkot felhasználtál. Új blokk kirakásához egy létezőt törölnöd kell.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Több blokkot is használhatsz az Ismétlésen belül.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Válaszd ki kedvenc figurádat a menüből.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Egy \'Ha\' esetén az utasítások csak akkor kerülnek végrehajtásra, ha a feltétel igaz. Próbáld a figurát balra fordítani, ha van út balra.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Kattints a(z) %1 elemre és változtass a \'ha\' blokk feltételén.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>A Ha-egyébként feltétel esetén vagy az egyik, vagy a másik utasítás-csoport kerül végrehajtásra.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Végig tudod vezetni a figurát ezen a bonyolult labirintuson? Próbáld a bal oldali falat követni. Haladó programozóknak!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
