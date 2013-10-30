// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">vizuálne programovacie prostredie</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Prezrieť vygenerovaný javascriptový kód.</span><span id="linkTooltip">Uložiť a zdieľať odkaz na tento program.</span><span id="runTooltip">Spustiť program, zložený z dielcov na pracovnej \\nploche. </span><span id="runProgram">Spustiť program</span><span id="resetProgram">Odznova</span><span id="dialogOk">OK</span><span id="dialogCancel">Zrušiť</span><span id="catLogic">Logika</span><span id="catLoops">Cykly</span><span id="catMath">Matematické</span><span id="catText">Text</span><span id="catLists">Zoznamy</span><span id="catColour">Farby</span><span id="catVariables">Premenné</span><span id="catProcedures">Procedúry</span><span id="httpRequestError">Problém so spracovaním požiadavky.</span><span id="linkAlert">Zdieľať tento program skopírovaním odkazu\n\n%1</span><span id="hashError">Prepáč, \'%1\' nie je meno žiadnemu uloženému programu.</span><span id="xmlError">Nebolo možné načítať uložený súbor. Možno bol vytvorený v inej verzii Blocky.</span><span id="listVariable">zoznam</span><span id="textVariable">text</span></div>';
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
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">choď dopredu</span><span id="Maze_turnLeft">otoč sa vľavo</span><span id="Maze_turnRight">otoč sa vpravo</span><span id="Maze_doCode">urob</span><span id="Maze_elseCode">inak</span><span id="Maze_helpIfElse">Príkaz ak-tak urobí buď jedno, alebo druhé.</span><span id="Maze_pathAhead">ak je cesta pred</span><span id="Maze_pathLeft">ak je cesta vľavo</span><span id="Maze_pathRight">ak je cesta vpravo</span><span id="Maze_repeatUntil">opakuj až do</span><span id="Maze_moveForwardTooltip">Posun hráča o jednu dĺžku dopredu.</span><span id="Maze_turnTooltip">Otočiť hráča o 90 stupňov vľavo či vpravo.</span><span id="Maze_ifTooltip">Ak je tým smerom cesta, vykonaj príkazy.</span><span id="Maze_ifelseTooltip">Ak je tým smerom cesta, vykonaj prvý blok príkazov.\\nInak vykonaj druhý blok príkazov.</span><span id="Maze_whileTooltip">Opakuj príkazy vo vnútri až kým neprídeš do cieľa.</span><span id="Maze_capacity0">Zostalo ti %0 dielcov.</span><span id="Maze_capacity1">Máš už iba %1 diel.</span><span id="Maze_capacity2">Zostalo ti ešte %2 dielcov.</span><span id="Maze_nextLevel">Gratulujeme! Priprav sa na na vstup do levelu %2!</span><span id="Maze_finalLevel">Gratulujeme! Posledný level je šťastne vyriešený!</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html">Blockly</a> : Bludisko</span> &nbsp; ';
  for (var i161 = 1; i161 < 11; i161++) {
    output += ' ' + ((i161 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i161) + '</span>' : (i161 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Prezrieť vygenerovaný javascriptový kód."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Uložiť a zdieľať odkaz na tento program."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Postavička urobí to, čo je napísané na dielci."><img src="../../media/1x1.gif" class="run icon21"> Spustiť program</button><button id="resetButton" class="primary" style="display: none" title="Presunúť postavičku späť na začiatok bludiska."><img src="../../media/1x1.gif" class="stop icon21"> Odznova</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Program je postupnosť dielcov. Spoj dokopy niekoľko dielcov \'pohyb vpred\' a pomôž mi prísť do cieľa.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Na tejto úrovni musíš na bielej ploche poskladať všetky diely skladačky.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Spusti svoj program, aby si videl čo sa stane.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Váš program neprešiel cez bludisko. Stlačte tlačidlo "Obnoviť" a skúste to znova.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Pamäte v počítačoch nikdy nie je dosť. Dosiahni cieľ len použítím dvoch blokov. Na zopakovanie príkazu použi príkaz \'opakuj\'.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Použili ste všetky bloky dostupné pre túto úroveň. Ak chcete vytvoriť nový blok, musíte najprv odstrániť existujúci.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Možte upraviť viac ako jeden blok v rámci \'repeat\' bloku.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Choose your favourite player from this menu.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Dielec \'ak\' urobí niečo len vtedy, ak je splnená podmienka. Skús otočenie vľavo, ak je cesta naľavo.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Klikni na %1 v \'ak\' bloku pre zmenu jeho stavu.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Príkaz ak-tak urobí buď jedno, alebo druhé.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>A zvládneš aj toto komplikované bludisko? Skús ísť popri ľavej stene. Len pre pokročilých programátorov!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><title name="DIR">turnLeft</title></block><block type="maze_turn"><title name="DIR">turnRight</title></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><title name="DIR">isPathLeft</title></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
