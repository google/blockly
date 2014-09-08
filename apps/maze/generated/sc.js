// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un\'ambienti gràficu po programai</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Càstia su còdixi JavaScript ingenerau.</span><span id="linkTooltip">Sarva e alliòngia a is brocus.</span><span id="runTooltip">Arròllia su programa cumpostu de is brocus in s\'àrea de traballu.</span><span id="runProgram">Arròllia su Programa</span><span id="resetProgram">Reset</span><span id="dialogOk">OK</span><span id="dialogCancel">Anudda</span><span id="catLogic">Lògica</span><span id="catLoops">Lòrigas</span><span id="catMath">Matemàtica</span><span id="catText">Testu</span><span id="catLists">Lista</span><span id="catColour">Colori</span><span id="catVariables">Variabilis</span><span id="catProcedures">Funtzionis</span><span id="httpRequestError">Ddui fut unu problema cun sa pregunta</span><span id="linkAlert">Poni is brocus tuus in custu acàpiu:\n\n%1</span><span id="hashError">Mi dispraxit, \'%1\' non torrat a pari cun nimancu unu de is programas sarvaus.</span><span id="xmlError">Non potzu carrigai su file sarvau. Fortzis est stètiu fatu cun d-una versioni diferenti de Blockly?</span><span id="listVariable">lista</span><span id="textVariable">testu</span></div>';
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
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">movi ananti</span><span id="Maze_turnLeft">furria a manu manca</span><span id="Maze_turnRight">furria a manu dereta</span><span id="Maze_doCode">fai</span><span id="Maze_elseCode">sinuncas</span><span id="Maze_helpIfElse">Su brocu si-sinuncas fait una cosa o s\'àtera.</span><span id="Maze_pathAhead">si tenis caminu ananti</span><span id="Maze_pathLeft">si tenis caminu a manu manca</span><span id="Maze_pathRight">si tenis caminu a manu dereta</span><span id="Maze_repeatUntil">repiti fintzas</span><span id="Maze_moveForwardTooltip">Movi su giogadori ananti de unu</span><span id="Maze_turnTooltip">Furria su giogadori a manu manca o dereta de 90 gradus.</span><span id="Maze_ifTooltip">Si ddu est unu caminu anca as nau, insaras fai su de fai.</span><span id="Maze_ifelseTooltip">Si tenis caminu in d-una andada, fai su primu brocu de atzionis. Sinuncas, fai su segundu brocu de atzionis.</span><span id="Maze_whileTooltip">Repiti s\'atzioni sceberada fintzas a lompi.</span><span id="Maze_capacity0">Abarrant %0 brocus.</span><span id="Maze_capacity1">Abarrant %1 brocus.</span><span id="Maze_capacity2">Abarrant %2 brocus.</span><span id="Maze_nextLevel">Beni meda! Ses prontu po sighiri a su livellu %1?</span><span id="Maze_finalLevel">Beni meda! As arresòlviu s\'urtimu livellu.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Labirintu</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Càstia su còdixi JavaScript ingenerau."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Sarva e alliòngia a is brocus."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Lassa fai a su giogadori su chi nant is brocus."><img src="../../media/1x1.gif" class="run icon21"> Arròllia su Programa</button><button id="resetButton" class="primary" style="display: none" title="Torra a ponni su giogadori a su comintzu de su labirintu."><img src="../../media/1x1.gif" class="stop icon21"> Reset</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Apilla pariga de brocus \'movi ananti\' po m\'agiudai a fai su chi depu.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>In custu livellu, depis apillai a pari totu is brocus in s\'area bianca.<iframe id="iframeOneTopBlock" style="height: 80px; width: 100%; border: none;" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Arròllia su programa po biri ita fait.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Su programa no arrèsolvit su labirintu. Craca \'Reset\' e torra a provai.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Arriba a sa fini de custu caminu cun duus brocus sceti. Impera \'repit\' po fai arrolliai unu brocu prus de una borta.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>As imperau totu is brocus po custu livellu. Po tenni unu brocu nou, ndi depis bogai unu innantis.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Podis ponni prus de unu brocu aintru de su brocu\'repiti\'.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Scebera de custu menu su giogadori chi preferis.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Su brocu \'si\' fait calincuna cosa sceti si sa cunditzioni est bera. Prova a furriai a manu manca si nci est unu caminu a manu manca.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Craca in %1 in su brocu \'si\' po mudai sa cunditzioni.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Su brocu si-sinuncas fait una cosa o s\'àtera.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Si dda fais a arrèsolvi custu labirintu introbeddau? Prova sighendi su muru a manu manca. Po programadoris espertus sceti!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
