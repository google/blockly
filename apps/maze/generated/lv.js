// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">vizuāla programmēšanas vide</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Apskatīt ģenerēto JavaScript pirmkodu.</span><span id="linkTooltip">Saglamāt un piesaistīt blokiem.</span><span id="runTooltip">Run the program defined by the blocks in the workspace.</span><span id="runProgram">Izpildīt programmu</span><span id="resetProgram">Sākt no sākuma</span><span id="dialogOk">Labi</span><span id="dialogCancel">Cancel</span><span id="catLogic">Logic</span><span id="catLoops">Loops</span><span id="catMath">Math</span><span id="catText">Text</span><span id="catLists">Lists</span><span id="catColour">Colour</span><span id="catVariables">Variables</span><span id="catProcedures">Procedures</span><span id="httpRequestError">Pieprasījuma kļūda.</span><span id="linkAlert">Dalies ar saviem blokiem ar šo saiti:\n\n%1</span><span id="hashError">Atvaino, bet \'%1\' neatbilst nevienam saglabātajam bloku failam.</span><span id="xmlError">Nevaru ielādēt tavu saglabāto failu.  Iespējams, tas tika izveidots ar citu Blockly versiju?</span><span id="listVariable">list</span><span id="textVariable">text</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Labi</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">ej uz priekšu</span><span id="Maze_turnLeft">pagriezies pa kreisi</span><span id="Maze_turnRight">pagriezies pa labi</span><span id="Maze_doCode">dari</span><span id="Maze_elseCode">citādi</span><span id="Maze_helpIfElse">Pārbaudes komandas \'ja-citādi\' izpildīs vai nu vienu, vai otru bloku atkarībā no pārbaudes.</span><span id="Maze_pathAhead">ja priekšā ir brīvs ceļš</span><span id="Maze_pathLeft">ja pa kreisi ir brīvs ceļš</span><span id="Maze_pathRight">ja pa labi ir brīvs ceļš</span><span id="Maze_repeatUntil">atkārto tikmēr kamēr</span><span id="Maze_moveForwardTooltip">Pārvieto cilvēciņu uz priekšu par vienu soli.</span><span id="Maze_turnTooltip">Pārvieto cilvēciņu pa kreisi vai pa labi par 90 \\ngrādiem. </span><span id="Maze_ifTooltip">Ja attiecīgajā virzienā ir brīvs ceļš, \\ntad izpildīt attiecīgās darbības. </span><span id="Maze_ifelseTooltip">Ja attiecīgajā virzienā ir brīvs ceļš, \\ntad izpildīt pirmo bloku ar darbībām. \\nCitādi izpildīt otro bloku ar darbībām. </span><span id="Maze_whileTooltip">Atkārtot iekļautās darbības kamēr sasniegts mērķis.</span><span id="Maze_capacity0">Tev atlikuši %0 bloki.</span><span id="Maze_capacity1">Tev atlicis %1 bloks.</span><span id="Maze_capacity2">Tev atlikuši %2 bloki.</span><span id="Maze_nextLevel">Apsveicu! Vai esi gatavs turpināt ar %1 līmeni?</span><span id="Maze_finalLevel">Apsveicu! Tu esi atrisinājis pēdējo līmeni.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html">Blockly</a> : Labirints</span> &nbsp; ';
  for (var i161 = 1; i161 < 11; i161++) {
    output += ' ' + ((i161 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i161) + '</span>' : (i161 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Apskatīt ģenerēto JavaScript pirmkodu."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Saglamāt un piesaistīt blokiem."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Makes the player do what the blocks say."><img src="../../media/1x1.gif" class="run icon21"> Izpildīt programmu</button><button id="resetButton" class="primary" style="display: none" title="Put the player back at the start of the maze."><img src="../../media/1x1.gif" class="stop icon21"> Sākt no sākuma</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Saliec kopā dažus \'ej uz priekšu\' blokus lai mēs varētu sasniegt mērķi.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Šajā līmenī tev bloki jāsaliek kopā baltajā laumumā.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Run your program to see what happens.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Your program didn\'t solve the maze.  Press \'Reset\' and try again.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Datoriem ir ierobežota atmiņa. Sasniedz ceļa mērķi lietojot tikai divus blokus. Lieto atkārtošanas bloku lai varētu izpildīt darbību vairāk kā vienu reizi.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>You have used up all the blocks for this level.  To create a new block, you first need to delete an existing block.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Sasniedz mērķi lietojot tikai piecus blokus.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Choose your favourite player from this menu.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Pārbaudes komanda \'ja\' dara kaut ko tikai tad, ja pārbaude ir patiesa. Pamēģini pagriezties pa kreisi, ja pa kreisi ir brīvs ceļš.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Click on %1 in the \'if\' block to change its condition.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Pārbaudes komandas \'ja-citādi\' izpildīs vai nu vienu, vai otru bloku atkarībā no pārbaudes.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Vai tu vari atrisināt šo sarežģīto labirintu? Mēģini sekot sienai kreisajā pusē. Šis ir pieredzējušiem programmētājiem!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><title name="DIR">turnLeft</title></block><block type="maze_turn"><title name="DIR">turnRight</title></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><title name="DIR">isPathLeft</title></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
