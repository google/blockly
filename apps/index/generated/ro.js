// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">un mediu de programare vizual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Vizualizează codul JavaScript generat.</span><span id="linkTooltip">Salvează și adaugă la blocuri. </span><span id="runTooltip">Execută programul definit de către blocuri în \\nspațiul de lucru. </span><span id="runProgram">Rulează programul</span><span id="resetProgram">Resetează</span><span id="dialogOk">OK</span><span id="dialogCancel">Revocare</span><span id="catLogic">Logic</span><span id="catLoops">Bucle</span><span id="catMath">Matematică</span><span id="catText">Text</span><span id="catLists">Liste</span><span id="catColour">Culoare</span><span id="catVariables">Variabile</span><span id="catProcedures">Proceduri</span><span id="httpRequestError">A apărut o problemă la solicitare.</span><span id="linkAlert">Distribuie-ți blocurile folosind această legătură:\n\n%1</span><span id="hashError">Scuze, „%1” nu corespunde nici unui program salvat.</span><span id="xmlError">Sistemul nu a putut încărca fișierul salvat. Poate că a fost creat cu o altă versiune de Blockly?</span><span id="listVariable">listă</span><span id="textVariable">text</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">OK</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored) {
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Aplicații Blockly</ span><span id="indexFooter">Blockly este gratuit și open source. Pentru a contribui cu linii de cod sau traduceri la Blockly, sau pentru a folosi Blockly în propriile aplicații, vizitează %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<table><tr><td><h1><span id="title">Aplicații Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly este un mediu de programare vizual. Mai jos sunt listate câteva aplicații care folosesc Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Puzzle</a></div><div>Invață să folosești interfața Blockly.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Labirint</a></div><div>Folosește Blockly pentru a rezolva un labirint.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Grafică Turtles</a></div><div>Folosește Blockly pentru a desena.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Calculator grafic</a></div><div>Trasează graficul unei funcții cu Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Cod</a></div><div>Exportă un program Blockly în JavaScript, Python sau XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Calculator pentru locurile dintr-un avion</a></div><div>Rezolvă o problemă de matematică cu una sau două variabile.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Fabrica de blocuri.</a></div><div>Construiește blocuri personalizate folosind Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
