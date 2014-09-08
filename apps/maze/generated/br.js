// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un endro programmiñ da welet</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Gwelet ar c\'hod JavaScript krouet.</span><span id="linkTooltip">Enrollañ ha liammañ d\'ar bloc\'hadoù.</span><span id="runTooltip">Lañsañ ar programm termenet gant ar bloc\'hadoù en takad labour.</span><span id="runProgram">Lañsañ ar programm</span><span id="resetProgram">Adderaouekaat</span><span id="dialogOk">Mat eo</span><span id="dialogCancel">Nullañ</span><span id="catLogic">Poell</span><span id="catLoops">Boukloù</span><span id="catMath">Matematik</span><span id="catText">Testenn</span><span id="catLists">Rolloù</span><span id="catColour">Liv</span><span id="catVariables">Argemmennoù</span><span id="catProcedures">Arc\'hwelioù</span><span id="httpRequestError">Ur gudenn zo gant ar reked.</span><span id="linkAlert">Rannañ ho ploc\'hoù gant al liamm-mañ :\n\n%1</span><span id="hashError">Digarezit. "%1" ne glot gant programm enrollet ebet.</span><span id="xmlError">Ne c\'haller ket kargañ ho restr enrollet. Marteze e oa bet krouet gant ur stumm disheñvel eus Blockly ?</span><span id="listVariable">roll</span><span id="textVariable">testenn</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Mat eo</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">mont war-raok</span><span id="Maze_turnLeft">treiñ a-gleiz</span><span id="Maze_turnRight">treiñ a-zehou</span><span id="Maze_doCode">ober</span><span id="Maze_elseCode">a-hend-all</span><span id="Maze_helpIfElse">Seveniñ a raio ar bloc\'hoù "Ma/A-hend-all" an eil tra pe egile.</span><span id="Maze_pathAhead">Ma\'z eus un hent dirak</span><span id="Maze_pathLeft">Ma\'z eus un hent a-gleiz</span><span id="Maze_pathRight">Ma\'z eus un hent a-zehoù</span><span id="Maze_repeatUntil">adober betek</span><span id="Maze_moveForwardTooltip">Lakait ar c\'hoarier da vont war-raok eus un esaouenn.</span><span id="Maze_turnTooltip">Lakait ar c\'hoarier da dreiñ a-gleiz pe a-zehoù a 90 derez.</span><span id="Maze_ifTooltip">Ma\'z eus un hent war an tu spisaet, grit an oberoù-se neuze.</span><span id="Maze_ifelseTooltip">Ma\'z eus un hent war an tu spisaet, grit ar c\'hentañ bloc\'had oberoù. A-hend-all, grit an eil bloc\'had oberoù.</span><span id="Maze_whileTooltip">Adober ar bloc\'hoù zo en diabarzh betek tizhout ar pal.</span><span id="Maze_capacity0">Ne chom bloc\'h ebet (%0) ganeoc\'h.</span><span id="Maze_capacity1">Chom a ra %1 bloc\'h ganeoc\'h.</span><span id="Maze_capacity2">Chom a ra %2 bloc\'h ganeoc\'h.</span><span id="Maze_nextLevel">Gourc\'hemennoù ! Ha prest oc\'h da vont d\'al live %1 ?</span><span id="Maze_finalLevel">Gourc\'hemennoù ! Diskoulmet eo bet al live diwezhañ ganeoc\'h.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Milendall</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Gwelet ar c\'hod JavaScript krouet."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Enrollañ ha liammañ d\'ar bloc\'hadoù."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Lakaat ar c\'hoarier d\'ober ar pezh a lavar ar bloc\'hoù."><img src="../../media/1x1.gif" class="run icon21"> Lañsañ ar programm</button><button id="resetButton" class="primary" style="display: none" title="Adlakaat an dudenn e deroù ar milendall."><img src="../../media/1x1.gif" class="stop icon21"> Adderaouekaat</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Berniañ asambles daou vloc\'h kemennoù "mont war-raok" evit sikour ac\'hanon da dizhout ar pal.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>El live-se az peus ezhomm da verniañ bloc\'hoù an eil war egile en un takad labour gwenn.<iframe id="iframeOneTopBlock" style="height: 80px; width: 100%; border: none;" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Sevenit ho programm evit gwelet petra a c\'hoarvez.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>N\'eo ket bet diskoulmet ar milendall gant ho programm. Pouezit war "Adderaouekaat" ha klaskit en-dro.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>N\'eus ket nemeur a vemor gant an urzhiataerioù. Implijit daou vloc\'h hepken evit tizhout ar pal. Implijit ar bloc\'h "adober" evit seveniñ ur bloc\'h meur a wech.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Implijet eo bet ganeoc\'h holl vloc\'hoù al live-mañ. Evit krouiñ ur bloc\'h nevez e rankit dilemel ur bloc\'h zo anezhañ da gentañ.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Meur a vloc\'h a c\'haller lakaat en ur bloc\'h \'adober\'.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Dibabit ho c\'hoarier karetañ el lañser.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Ne raio ur bloc\'h "ma" un dra bennak ken nemet ma\'z eo gwir an amplegad. Klaskit treiñ a-gleiz ma\'z eus un hent war an tu kleiz.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Klikit war %1 er bloc\'h "ma" evit cheñch e amplegad.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Seveniñ a raio ar bloc\'hoù "Ma/A-hend-all" an eil tra pe egile.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Daoust ha gouest oc\'h da ziskoulmañ ar milendall luziet-mañ ? Klaskit mont a-hed ar voger gleiz. Evit ar brogrammerien arroutet-mat hepken !' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
