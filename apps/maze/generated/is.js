// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">sjónrænt forritunarumhverfi</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Sjá forritið sem JavaScript kóða.</span><span id="linkTooltip">Vista og tengja við kubba.</span><span id="runTooltip">Keyra forritið sem kubbarnir á vinnusvæðinu mynda.</span><span id="runProgram">Keyra forritið</span><span id="resetProgram">Byrja aftur</span><span id="dialogOk">Í lagi</span><span id="dialogCancel">Hætta við</span><span id="catLogic">Rökvísi</span><span id="catLoops">Lykkjur</span><span id="catMath">Reikningur</span><span id="catText">Texti</span><span id="catLists">Listar</span><span id="catColour">Litir</span><span id="catVariables">Breytur</span><span id="catProcedures">Stefjur</span><span id="httpRequestError">Það kom upp vandamál með beiðnina.</span><span id="linkAlert">Deildu kubbunum þínum með þessari krækju:</span><span id="hashError">Því miður, \'%1\' passar ekki við neitt vistað forrit.</span><span id="xmlError">Gat ekki hlaðið vistuðu skrána þína. Var hún kannske búin til í annarri útgáfu af Blockly?</span><span id="listVariable">listi</span><span id="textVariable">texti</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Í lagi</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">færa áfram</span><span id="Maze_turnLeft">snúa til vinstri</span><span id="Maze_turnRight">snúa til hægri</span><span id="Maze_doCode">gera</span><span id="Maze_elseCode">annars</span><span id="Maze_helpIfElse">Ef-annars kubbar gera eitt eða annað.</span><span id="Maze_pathAhead">ef slóð framundan</span><span id="Maze_pathLeft">ef slóð til vinstri</span><span id="Maze_pathRight">ef slóð til hægri</span><span id="Maze_repeatUntil">endurtaka þar til</span><span id="Maze_moveForwardTooltip">Færir leikmann fram um eitt bil.</span><span id="Maze_turnTooltip">Snýr leikmanninum til vinstri eða hægri um 90 gráður.</span><span id="Maze_ifTooltip">Ef það er slóð í valda stefnu, þá á að gera eitthvað.</span><span id="Maze_ifelseTooltip">Ef það er slóð í valda stefnu þá á að gera fyrri kubbinn. Annars á að gera seinni kubbinn.</span><span id="Maze_whileTooltip">Endurtaka innifaldar aðgerðir þar til endapunkti er náð.</span><span id="Maze_capacity0">Þú átt %0 kubba eftir.</span><span id="Maze_capacity1">Þú átt %1 kubb eftir.</span><span id="Maze_capacity2">Þú átt %2 kubba eftir.</span><span id="Maze_nextLevel">Til hamingju! Viltu halda áfram á borð %1?</span><span id="Maze_finalLevel">Til hamingju! Þú hefur leyst síðasta borðið.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Völundarhús</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Sjá forritið sem JavaScript kóða."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Vista og tengja við kubba."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Lætur leikmanninn gera það sem kubbarnir segja."><img src="../../media/1x1.gif" class="run icon21"> Keyra forritið</button><button id="resetButton" class="primary" style="display: none" title="Setja leikmanninn aftur á upphafsreit."><img src="../../media/1x1.gif" class="stop icon21"> Byrja aftur</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Raðaðu tveimur \'færa áfram\' kubbum saman til að hjálpa mér að ná takmarkinu.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Á þessu borði þarftu að raða öllum kubbunum saman á hvíta svæðinu.<iframe id="iframeOneTopBlock" style="height: 80px; width: 100%; border: none;" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Keyrðu forritið til að sjá hvað gerist.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Forritið þitt rataði ekki. Smelltu á \'Byrja aftur\' og reyndu betur.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Náðu út á enda slóðarinnar með því að nota bara tvo kubba. Notaðu \'endurtaka\' til að keyra kubb oftar en einu sinni.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Þú hefur notað alla kubbana á þessu borði. Til að losa kubb verður þú að eyða honum úr forritinu.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Þú getur sett fleiri en einn kubb inn í \'endurtaka\' kubb.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Veldu þér leikmann úr þessum lista.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>\'Ef\' kubbur gerir eitthvað aðeins ef skilyrðið er satt. T.d. beygja til vinstri ef það er slóð til vinstri.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Smelltu á %1 í \'ef\' kubbnum til að breyta skilyrði hans.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Ef-annars kubbar gera eitt eða annað.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Getur þú leyst þetta flókna völundarhús? Reyndu að fylgja veggnum á vinstri hönd. Aðeins fyrir reyndari forritara!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
