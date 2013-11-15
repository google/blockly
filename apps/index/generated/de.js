// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">Visuelle Programmierumgebung</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Erzeugten JavaScript-Code ansehen.</span><span id="linkTooltip">Speichern und auf Bausteine verlinken.</span><span id="runTooltip">Das Programm ausführen, das von den Bausteinen \\nim Arbeitsbereich definiert ist. </span><span id="runProgram">Programm ausführen</span><span id="resetProgram">Zurücksetzen</span><span id="dialogOk">Okay</span><span id="dialogCancel">Abbrechen</span><span id="catLogic">Logik</span><span id="catLoops">Schleifen</span><span id="catMath">Mathematik</span><span id="catText">Text</span><span id="catLists">Listen</span><span id="catColour">Farbe</span><span id="catVariables">Variablen</span><span id="catProcedures">Funktionen</span><span id="httpRequestError">Mit der Anfrage gab es ein Problem.</span><span id="linkAlert">Teile deine Bausteine mit diesem Link:\n\n%1</span><span id="hashError">„%1“ stimmt leider mit keinem gespeicherten Programm überein.</span><span id="xmlError">Deine gespeicherte Datei konnte nicht geladen werden. Vielleicht wurde sie mit einer anderen Version von Blockly erstellt.</span><span id="listVariable">Liste</span><span id="textVariable">Text</span></div>';
};


apps.dialog = function(opt_data, opt_ignored) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};


apps.codeDialog = function(opt_data, opt_ignored) {
  return '<div id="dialogCode" class="dialogHiddenContent"><pre id="containerCode"></pre>' + apps.ok(null) + '</div>';
};


apps.storageDialog = function(opt_data, opt_ignored) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + apps.ok(null) + '</div>';
};


apps.ok = function(opt_data, opt_ignored) {
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Okay</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored) {
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Blockly-Anwendungen</ span><span id="indexFooter">Blockly ist frei und Open Source. Um Code oder Übersetzungen für Blockly beizusteuern oder um Blockly in deiner eigenen Anwendung zu verwenden, besuche %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<table><tr><td><h1><span id="title">Blockly-Anwendungen</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly ist eine grafische Programmierumgebung. Unten sind einige Beispielanwendungen, die Blockly verwenden.</td></tr></table><table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Puzzle</a></div><div>Lernen, wie man die Blockly-Oberfläche verwendet.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Labyrinth</a></div><div>Blockly zum Lösen eines Labyrinths verwenden.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Turtle-Grafiken</a></div><div>Blockly zum Zeichnen verwenden.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Grafikrechner</a></div><div>Plotfunktionen mit Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Code</a></div><div>Ein Blockly-Programm als JavaScript, Python oder XML exportieren.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Flugzeugsitzrechner</a></div><div>Ein mathematisches Problem mit einer oder zwei Variablen lösen.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Block-Fabrik</a></div><div>Benutzerdefinierte Blöcke mit Blockly bauen.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
