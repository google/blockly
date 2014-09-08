// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">ae veesual programin environment</span><span id="blocklyMessage">Blockly (Blocklie)</span><span id="codeTooltip">See generated JavaScript code.</span><span id="linkTooltip">Hain n airt til blocks.</span><span id="runTooltip">Rin the program defined bi the blocks in the wairkspace.</span><span id="runProgram">Rin Program</span><span id="resetProgram">Reset</span><span id="dialogOk">OK</span><span id="dialogCancel">Cancel</span><span id="catLogic">Logeec</span><span id="catLoops">Luips</span><span id="catMath">Maths</span><span id="catText">Tex</span><span id="catLists">Leets</span><span id="catColour">Colour</span><span id="catVariables">Variables</span><span id="catProcedures">Functions</span><span id="httpRequestError">Thaur wis ae problem wi the request.</span><span id="linkAlert">Shair yer blocks wi this airtin:\n\n%1</span><span id="hashError">Sairrie, \'%1\' disna correspond wi onie hained program.</span><span id="xmlError">Coudnae laid yer hained file.  Perhaps it wis makit wi ae deefferent version o Blockly?</span><span id="listVariable">leet</span><span id="textVariable">tex</span></div>';
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
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">muiv forewaird</span><span id="Maze_turnLeft">turn cair</span><span id="Maze_turnRight">turn richt</span><span id="Maze_doCode">dae</span><span id="Maze_elseCode">itherwise</span><span id="Maze_helpIfElse">Gif-itherwise blocks will dae yin thing or the ither.</span><span id="Maze_pathAhead">gif path is aheid</span><span id="Maze_pathLeft">gif path is oan the cair</span><span id="Maze_pathRight">gif path is oan the richt</span><span id="Maze_repeatUntil">repeat ontil</span><span id="Maze_moveForwardTooltip">Muivs the player forewaird yin space.</span><span id="Maze_turnTooltip">Turns the player cair or richt bi 90 degrees.</span><span id="Maze_ifTooltip">Gif thaur is ae path in the speceefied direction, than dae some aictions.</span><span id="Maze_ifelseTooltip">Gif thaur is ae path in the speceefied direction, than dae the first block o aictions. Itherwise, dae the seicont block o aictions.</span><span id="Maze_whileTooltip">Repeat the enclaised aictions ontil the finish point is reached.</span><span id="Maze_capacity0">Ye hae %0 blocks left.</span><span id="Maze_capacity1">Ye hae %1 block left.</span><span id="Maze_capacity2">Ye hae %2 blocks left.</span><span id="Maze_nextLevel">Congratulations! Ar ye readie tae proceed tae level %1?</span><span id="Maze_finalLevel">Congratulations! Ye\'v solved the final level.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly (Blocklie)</a> : Maze</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="See generated JavaScript code."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Hain n airt til blocks."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Maks the player dae whit the blocks say."><img src="../../media/1x1.gif" class="run icon21"> Rin Program</button><button id="resetButton" class="primary" style="display: none" title="Put the player back at the stairt o the maze."><img src="../../media/1x1.gif" class="stop icon21"> Reset</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Stack some \'muiv forewaird\' blocks thegather tae heelp me reach the goal.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Oan this level, ye need tae stack thegather aw o the blocks in the white warkspace.<iframe id="iframeOneTopBlock" style="height: 80px; width: 100%; border: none;" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Rin yer program tae see whit happens.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Yer program didna solve the maze.  Press \'Reset\' n gie it anither shot.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Reach the end o this path uisin yinlie twa blocks.  Uise \'repeat\' tae rin ae block mair than yince.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Ye\'v uised up aw the blocks fer this level.  Tae mak ae new block, ye maun first delyte aen exeestin block.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Ye can fit mair than yin block inside ae \'repeat\' block.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Chuise yer favoorite player fae this menu.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Ae \'gif\' block will dae sommit yinlie gif the condeetion is true.  Gie turnin cair ae shot gif thaur is ae path oan the cair.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Clap oan %1 in the \'gif\' block tae chynge its condeetion.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Gif-itherwise blocks will dae yin thing or the ither.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Can ye solve this compleecated maze?  Gie follaein the cair waa ae shot.  Advanced programmers yinlie!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
