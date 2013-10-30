// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un contorno de programación visual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Ver o código JavaScript xerado.</span><span id="linkTooltip">Gardar e crear unha ligazón aos bloques.</span><span id="runTooltip">Executar o programa definido polos bloques no \\nespazo de traballo. </span><span id="runProgram">Executar o programa</span><span id="resetProgram">Restablecer</span><span id="dialogOk">Aceptar</span><span id="dialogCancel">Cancelar</span><span id="catLogic">Lóxica</span><span id="catLoops">Bucles</span><span id="catMath">Matemáticas</span><span id="catText">Texto</span><span id="catLists">Listas</span><span id="catColour">Cor</span><span id="catVariables">Variables</span><span id="catProcedures">Procedementos</span><span id="httpRequestError">Houbo un problema coa solicitude.</span><span id="linkAlert">Comparte os teus bloques con esta ligazón:\n\n%1</span><span id="hashError">Sentímolo, "%1" non se corresponde con ningún programa gardado.</span><span id="xmlError">Non se puido cargar o ficheiro gardado. Se cadra, foi creado cunha versión diferente de Blockly.</span><span id="listVariable">lista</span><span id="textVariable">texto</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Aceptar</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">avanzar</span><span id="Maze_turnLeft">xirar á esquerda</span><span id="Maze_turnRight">xirar á dereita</span><span id="Maze_doCode">facer</span><span id="Maze_elseCode">se non</span><span id="Maze_helpIfElse">Os bloques "se/se non" fan unha cousa ou a outra.</span><span id="Maze_pathAhead">se hai camiño diante</span><span id="Maze_pathLeft">se hai camiño á esquerda</span><span id="Maze_pathRight">se hai camiño á dereita</span><span id="Maze_repeatUntil">repetir ata</span><span id="Maze_moveForwardTooltip">Fai que a figura avance un espazo.</span><span id="Maze_turnTooltip">Fai que a figura xire á esquerda ou á dereita 90 \\ngraos. </span><span id="Maze_ifTooltip">Se hai un camiño na dirección especificada, \\nentón fanse algunhas accións. </span><span id="Maze_ifelseTooltip">Se hai un camiño na dirección especificada, \\nentón faise o primeiro bloque de accións. \\nEn caso contrario, faise o segundo bloque de \\naccións. </span><span id="Maze_whileTooltip">Repetir as accións do bloque ata chegar á meta.</span><span id="Maze_capacity0">Restan %0 bloques.</span><span id="Maze_capacity1">Resta %1 bloque.</span><span id="Maze_capacity2">Restan %2 bloques.</span><span id="Maze_nextLevel">Parabéns! Queres continuar no nivel %1?</span><span id="Maze_finalLevel">Parabéns! Resolviches o nivel final.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html">Blockly</a> : Labirinto</span> &nbsp; ';
  for (var i161 = 1; i161 < 11; i161++) {
    output += ' ' + ((i161 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i161) + '</span>' : (i161 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Ver o código JavaScript xerado."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Gardar e crear unha ligazón aos bloques."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Fai que a figura realice o que din os bloques."><img src="../../media/1x1.gif" class="run icon21"> Executar o programa</button><button id="resetButton" class="primary" style="display: none" title="Coloca a figura ao inicio do labirinto."><img src="../../media/1x1.gif" class="stop icon21"> Restablecer</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Apila un par de bloques "avanzar" para axudarme a chegar á meta.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Neste nivel, tes que apilar xuntos todos os bloques no espazo de traballo.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Executa o teu programa para comprobar o que acontece.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>O teu programa non resolveu o labirinto. Preme en "Restablecer" e inténtao de novo.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Chega ao final deste camiño usando só dous bloques. Utiliza "repetir" para executar un bloque máis dunha vez.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Xa usaches todos os bloques dispoñibles para este nivel. Para crear un novo bloque, primeiro debes borrar un dos existentes.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Podes apilar máis dun bloque dentro dos bloques "repetir".</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Escolle o teu xogador favorito neste menú.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Un bloque "se" fará algo unicamente se a condición é certa. Intenta xirar á esquerda se hai camiño á esquerda.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Preme en %1 no bloque "se" para cambiar a súa condición.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Os bloques "se/se non" fan unha cousa ou a outra.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Podes resolver este labirinto máis complicado? Intenta seguir a parede da esquerda. Só para programadores avanzados!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><title name="DIR">turnLeft</title></block><block type="maze_turn"><title name="DIR">turnRight</title></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><title name="DIR">isPathLeft</title></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
