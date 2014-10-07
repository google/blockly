// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un\'ambienti gràficu po programai</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Càstia su còdixi JavaScript ingenerau.</span><span id="linkTooltip">Sarva e alliòngia a is brocus.</span><span id="runTooltip">Arròllia su programa cumpostu de is brocus in s\'àrea de traballu.</span><span id="runProgram">Arròllia su Programa</span><span id="resetProgram">Reset</span><span id="dialogOk">OK</span><span id="dialogCancel">Anudda</span><span id="catLogic">Lògica</span><span id="catLoops">Lòrigas</span><span id="catMath">Matemàtica</span><span id="catText">Testu</span><span id="catLists">Lista</span><span id="catColour">Colori</span><span id="catVariables">Variabilis</span><span id="catProcedures">Funtzionis</span><span id="httpRequestError">Ddui fut unu problema cun sa pregunta</span><span id="linkAlert">Poni is brocus tuus in custu acàpiu:\n\n%1</span><span id="hashError">Mi dispraxit, \'%1\' non torrat a pari cun nimancu unu de is programas sarvaus.</span><span id="xmlError">Non potzu carrigai su file sarvau. Fortzis est stètiu fatu cun d-una versioni diferenti de Blockly?</span><span id="listVariable">lista</span><span id="textVariable">testu</span></div>';
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

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Blockly Apps</ span><span id="indexFooter">Blockly est free e open source.  Po agiudai in sa codifica o in sa furriadura de Blockly, o po imperai Blockly in sa app cosa tua, bisita %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Blockly Apps</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly est un\'ambienti gràficu po programai.  Asuta agatas pariga de programas cuncordaus cun Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Puzzle</a></div><div>Impara a manigiai s\'interfacia de Blockly.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Labirintu</a></div><div>Impera Blockly po arresòlvi unu labirintu.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Tostoinu Gràficu</a></div><div>Impera Blockly po disenniai.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Computeredda gràfica</a></div><div>Afigura funtzionis cun Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Còdixi</a></div><div>Esporta unu programa Blockly  in JavaScript, Python, Dart o XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Fai su contu de is cadironis de unu aparèchiu</a></div><div>Arresòlvi unu problema de matemàtica cun d-una o duas variàbilis.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Fábrica de brocus</a></div><div>Cuncorda is brocus chi ti serbint imperendi Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://developers.google.com/blockly/">github.com/google/blockly</a><span id="footer_suffix"></span>';
};
