// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">Et visuelt programmeringsmiljø</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Se generert JavaScriptkode</span><span id="linkTooltip">Lagre og lenke til blokker.</span><span id="runTooltip">Kjør programmet definert av blokken i arbeidsområdet.</span><span id="runProgram">Kjør Programmet</span><span id="resetProgram">Nullstill</span><span id="dialogOk">OK</span><span id="dialogCancel">Avbryt</span><span id="catLogic">Logikk</span><span id="catLoops">Looper</span><span id="catMath">Matte</span><span id="catText">Tekst</span><span id="catLists">Lister</span><span id="catColour">Farge</span><span id="catVariables">Variabler</span><span id="catProcedures">Funksjoner</span><span id="httpRequestError">Det oppsto et problem med forespørselen din</span><span id="linkAlert">Del dine blokker med denne lenken:\n\n%1</span><span id="hashError">Beklager, \'%1\' samsvarer ikke med noe lagret program.</span><span id="xmlError">Kunne ikke laste inn filen. Kanskje den ble laget med en annen versjon av Blockly?</span><span id="listVariable">Liste</span><span id="textVariable">Tekst</span></div>';
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
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">gå fremover</span><span id="Maze_turnLeft">sving til venstre</span><span id="Maze_turnRight">sving til høyre</span><span id="Maze_doCode">utfør</span><span id="Maze_elseCode">ellers</span><span id="Maze_helpIfElse">If-else-blokker vil gjøre det ene eller det andre.</span><span id="Maze_pathAhead">if-sti fremover</span><span id="Maze_pathLeft">if-sti til venstre</span><span id="Maze_pathRight">if-sti til høyre</span><span id="Maze_repeatUntil">gjenta inntil</span><span id="Maze_moveForwardTooltip">Flytter spilleren ett felt fremover.</span><span id="Maze_turnTooltip">Svinger spilleren 90 grader til høyre eller venstre.</span><span id="Maze_ifTooltip">Hvis det finnes en sti i angitt retning, gjør visse handlinger.</span><span id="Maze_ifelseTooltip">Hvis det finnes en sti i angitt retning, gjør den første blokken av handlinger. Ellers, gjør den andre blokken av handlinger.</span><span id="Maze_whileTooltip">Gjenta de sluttede kommandoene inntil sluttpunktet nås.</span><span id="Maze_capacity0">Du har %0 blokker igjen.</span><span id="Maze_capacity1">Du har %1 blokk igjen.</span><span id="Maze_capacity2">Du har %2 blokker igjen.</span><span id="Maze_nextLevel">Gratulerer! Er du klar til å gå videre til nivå %1?</span><span id="Maze_finalLevel">Gratulerer! Du har løst det siste nivået.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Labyrint</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Se generert JavaScriptkode"><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Lagre og lenke til blokker."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Få spilleren til å gjøre det blokkene sier."><img src="../../media/1x1.gif" class="run icon21"> Kjør Programmet</button><button id="resetButton" class="primary" style="display: none" title="Flytt spilleren tilbake til starten av labyrinten."><img src="../../media/1x1.gif" class="stop icon21"> Nullstill</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Sett sammen et par \'gå fremover\'-blokker for å hjelpe meg med å nå målet.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>På dette nivået må du sette sammen alle blokkene i det hvite arbeidsområdet.<iframe id="iframeOneTopBlock" style="height: 80px; width: 100%; border: none;" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Kjør programmet for å se hva som skjer.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Programmet ditt løste ikke labyrinten. Trykk \'Nullstill\' og prøv igjen.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Nå slutten av denne stien ved å bruke bare to blokker. Bruk \'repeter\' for å kjøre en blokk mer enn én gang.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Du har brukt opp alle blokkene for dette nivået. For å lage nye blokker, må du først slette en eksisterende blokk.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Du kan plassere mer enn en blokk i en repeteringsblokk.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Velg din favorittspiller fra denne menyen.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>En \'if\'-blokk vil bare gjøre noe dersom forholdene er sanne. Forsøk å svinge til venstre hvis det finnes en sti til venstre.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Klikk på %1 i \'if\'-blokken for å endre tilstand.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>If-else-blokker vil gjøre det ene eller det andre.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Kan du løse denne kompliserte pyramiden? Forsøk å følge veggen på venstre side. Kun for avanserte programmerere.' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
