// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">Ruweuëng meuprogram ban leumah</span><span id="blocklyMessage">Teutheun</span><span id="codeTooltip">Eu kode JavaScript yang geupeuhasé</span><span id="linkTooltip">Keubah ngon neupawôt keu theun</span><span id="runTooltip">Neupeujak program nyang geupeuteutap le seuneutheun lam ruweuëng keurija</span><span id="runProgram">Peujak program</span><span id="resetProgram">Atô keulayi</span><span id="dialogOk">Ka got</span><span id="dialogCancel">Peubateuë</span><span id="catLogic">Logis</span><span id="catLoops">Kuwien</span><span id="catMath">Matematik</span><span id="catText">Haraih</span><span id="catLists">Dapeuta</span><span id="catColour">Wareuna</span><span id="catVariables">Meumacam</span><span id="catProcedures">Prosedur</span><span id="httpRequestError">Na masalah lam neumeulakèe</span><span id="linkAlert">Neubagi seuneutheun droëneuh ngon peunawôt nyoë: %1</span><span id="hashError">Meu\'ah, \'%1\' hana saban sakri ngon peuë mantong program nyang meukeubah</span><span id="xmlError">Beureukaih keuneubah droëneuh han jeuët geupasoë. Kadang na neupeugot ngon versi seuneutheun yang la\'én</span><span id="listVariable">dapeuta</span><span id="textVariable">haraih</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Ka got</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Aplikasi seuneutheun</ span><span id="indexFooter">Blockly nakeuh bibeuëh ngon meunè nyang teuhah.\nSoë mantong nyang meuripèe kode atawa teujeumah keu Blockly, atawa geungui Blockly lam aplikasi droëneuh, neukunjông %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Aplikasi seuneutheun</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly nakeuh ruweuëng meuprogram grafis. Dimeuyub nyoë nakeuh meupadum boh conto aplikasi nyang geunguy Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Hiëm</a></div><div>Meurunoë meungui antaramuka Blockly.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Pageuë peusisat</a></div><div>Neungui Blockly keu peuseuleusoë pageuë sisat.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Punyië Gfarfis</a></div><div>Neungui Blockly ngon meugamba.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">kalkulator graf</a></div><div>Neuplot guna ngon Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kode</a></div><div>Neu eksport program Blockly u dalam JavaScript, Phyton atawa XMK.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Peukakah Bileuëng Kurusi Kapai Teureubang.</a></div><div>Neupeuglah masalah matematik ngon saboh atawa dua kri neuubah.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Pabrék Block</a></div><div>Puga blok-blok peuneugot keudroë ngon Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
