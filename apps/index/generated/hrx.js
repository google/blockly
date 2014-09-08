// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">Visuelle Programmierumgebung</span><span id="blocklyMessage">Blockly\n\nI translated all the Blockly strings into Riograndenser Hunsrückisch (Hrx / var. of German) using I.E. The translations didn\'t save - I got this message in a faded yellow background: "Saving the translation failed: Unknown error" . \n\nIn Translatewiki.net Web chat Nemo_bis suggested I try and save the translations in Chromium - I tried that and it worked. However, now I have to copy and paste all my work from IE to Chrome, unless there is another way of doing that ... \n\nNow I\'m in the process of transferring over the translations ... but they are all done (so no duplicate work is needed!).\n\n~~~~\nPaul Beppler (talk) 23:30, 12 March 2014 (UTC)</span><span id="codeTooltip">Generierte Java-COde oonsiehn.</span><span id="linkTooltip">Speichre und auf Bausten verlinke.</span><span id="runTooltip">Das Programm ausfüahre, das von den Bausten im Oorweitsbereich definiert ist.</span><span id="runProgram">Programm ausführe</span><span id="resetProgram">Zurücksetze</span><span id="dialogOk">Okay</span><span id="dialogCancel">Abbreche</span><span id="catLogic">Logik</span><span id="catLoops">Schleife</span><span id="catMath">Mathematik</span><span id="catText">Text</span><span id="catLists">Liste</span><span id="catColour">Farreb</span><span id="catVariables">Variable</span><span id="catProcedures">Funktione</span><span id="httpRequestError">Mit der Oonfroch hots en Problem geb.</span><span id="linkAlert">Tel von dein Bausten mit dem Link:\n\n%1</span><span id="hashError">„%1“ stimmt leider mit kenem üweren gespeicherte Programm.</span><span id="xmlError">Dein gespeicherte Datei könnt net gelood sin. Vielleicht woard se mit ener annre Version von Blockly erstellt.</span><span id="listVariable">List</span><span id="textVariable">Text</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Okay</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Blockly-Oonwennunge</ span><span id="indexFooter">Blockly ist frei und Open Source. Um Code orrer Üwersetzunge für Blockly beizusteire oder um Blockly in deiner eichne Oonwennung zu verwenne, besuch %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Blockly-Oonwennunge</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly ist frei und Open Source. Um Code orrer Üwersetzunge für Blockly beizusteiere orrer um Blockly in deiner eichne Onwennung zu verwenne, besuch %1.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Puzzle</a></div><div>Lern, wie man die Blockly-Owerfläch verwenne tut.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Labyrinth</a></div><div>Blockly zum Löse von en Labyrinth verwenne.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Turtle-Grafike</a></div><div>Blockly zum Zeichne verwenne.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Grafikrechner</a></div><div>Plotfunktione mit Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Code</a></div><div>En Blockly-Programm als JavaScript, Python, Dart orrer XML exportiere.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Fluchzeichsitzrechner</a></div><div>En mathematisches Problem mit ener orrer zwooi Variable löse.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Block-Fabrik</a></div><div>Benutzerdefinierte Blöcke mit Blockly baue.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
