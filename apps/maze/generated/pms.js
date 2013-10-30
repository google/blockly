// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">n\'ambient ëd programassion visual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Vëdde ël còdes JavaScript generà.</span><span id="linkTooltip">Argistré e lijé ai blòch.</span><span id="runTooltip">Fé andé ël programa definì dai blòch ant lë \\nspassi ëd travaj. </span><span id="runProgram">Fé andé ël programa</span><span id="resetProgram">Buté torna coma al prinsipi</span><span id="dialogOk">Va bin</span><span id="dialogCancel">Anulé</span><span id="catLogic">Lògica</span><span id="catLoops">Liasse</span><span id="catMath">Matemàtica</span><span id="catText">Test</span><span id="catLists">Liste</span><span id="catColour">Color</span><span id="catVariables">Variàbij</span><span id="catProcedures">Procedure</span><span id="httpRequestError">A-i é staje un problema con l\'arcesta.</span><span id="linkAlert">Ch\'a partagia ij sò blòch grassie a sta liura: %1</span><span id="hashError">An dëspias, \'%1% a corëspond a gnun programa salvà.</span><span id="xmlError">A l\'é nen podusse carié so archivi salvà. Miraco a l\'é stàit creà con na version diferenta ëd Blockly?</span><span id="listVariable">lista</span><span id="textVariable">test</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Va bin</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">andé drit</span><span id="Maze_turnLeft">voltesse a snistra</span><span id="Maze_turnRight">voltesse a drita</span><span id="Maze_doCode">fé</span><span id="Maze_elseCode">opura</span><span id="Maze_helpIfElse">Un blòch si-opura a farà na còsa u l\'àutra.</span><span id="Maze_pathAhead">se sënté dë dnans</span><span id="Maze_pathLeft">se sënté a snistra</span><span id="Maze_pathRight">se sënté a drita</span><span id="Maze_repeatUntil">arpete fin-a a</span><span id="Maze_moveForwardTooltip">Fà andé ël giugador anans ëd në spassi.</span><span id="Maze_turnTooltip">Fé volté ël giugador a snistra o a drita ëd 90 gré.</span><span id="Maze_ifTooltip">S\'a-i é na stra ant la diression ëspessificà, \\nantlora fa chèiche assion. </span><span id="Maze_ifelseTooltip">S\'a-i é na stra ant la diression ëspessificà, \\nantlora fa ël prim blòch d\'assion. \\nDësnò, fà ël second blòch d\'assion. </span><span id="Maze_whileTooltip">Arpet j\'assion contnùe fin-a a argionze ël pont \\nfinal. </span><span id="Maze_capacity0">At resto %0 blòch.</span><span id="Maze_capacity1">At resta %1 blòch.</span><span id="Maze_capacity2">At resto %2 blòch.</span><span id="Maze_nextLevel">Brav! T\'ses pront për andé anans al livel %1?</span><span id="Maze_finalLevel">Brav! Tl\'has livrà ël livel final.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html">Blockly</a> : Labirint</span> &nbsp; ';
  for (var i161 = 1; i161 < 11; i161++) {
    output += ' ' + ((i161 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i161) + '</span>' : (i161 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Vëdde ël còdes JavaScript generà."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Argistré e lijé ai blòch."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="A fà fé al giugador lòn ch\'a diso ij block."><img src="../../media/1x1.gif" class="run icon21"> Fé andé ël programa</button><button id="resetButton" class="primary" style="display: none" title="Buta torna ël giugador al prinsipi dël labirint."><img src="../../media/1x1.gif" class="stop icon21"> Buté torna coma al prinsipi</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Ambaron-a un pàira ëd blòch \'va anans\' për giuteme a argionze me but.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>An cost livel, it deve ambaroné ij blòch un ansima a l\'àutr ant la zòna ëd travaj bianca.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Fà marcé tò programa për vëdde lòn ch\'a-i suced.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Tò programa a l\'ha nen arzolvù ël labirint. Sgnaca \'Buté torna coma al prinsipi\' e preuva torna.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>J\'ordinator a l\'han na memòria limità. Riva a la fin ëd sa stra dovrand mach doi blòch. Deuvra \'arpet\' për eseguì un blòch pi \'d na vira.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>It l\'has consumà tuti ij blòch për cost livel. Për creé un blòch neuv, tl\'has prima damanca dë scancelé un blòch esistent.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>A peul buté pi d\'un blòch andrinta a \'n blòch «arpete».</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Ch\'a serna sò giugador preferì da së mnù.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Un blòch \'si\' a farà cheicòs mach si la condission a l\'é vera. Preuva a svolté a snistra s\'a-i é na stra a snistra.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Sgnaca su %1 ant ël blòch \'si\' për cangé soa condission.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Un blòch si-opura a farà na còsa u l\'àutra.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Peulës-to arzòlve cost labirint complicà? Sërca d\'andeje dapress a la muraja a snistra. Mach për programator coj barbis!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><title name="DIR">turnLeft</title></block><block type="maze_turn"><title name="DIR">turnRight</title></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><title name="DIR">isPathLeft</title></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
