// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">vizualus programavimas</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Peržiūrėti atitinkantį JavaScript kodą.</span><span id="linkTooltip">Išsaugoti (sugeneruoti URL nuorodą).</span><span id="runTooltip">Vykdyti programą.</span><span id="runProgram">Paleisti Programą</span><span id="resetProgram">Atnaujinti</span><span id="dialogOk">Gerai</span><span id="dialogCancel">Atšaukti</span><span id="catLogic">Logika</span><span id="catLoops">Kartojimas</span><span id="catMath">Matematika</span><span id="catText">Tekstas</span><span id="catLists">Sąrašai</span><span id="catColour">Spalva</span><span id="catVariables">Kintamieji</span><span id="catProcedures">Funkcijos</span><span id="httpRequestError">Iškilo problema su prašymu.</span><span id="linkAlert">%1</span><span id="hashError">Deja, \'%1\' neatitinka jokios išsaugotos programos.</span><span id="xmlError">Nesuprantu pateikto failo. Gal jis buvo sukurtas su kita Blocky versija?</span><span id="listVariable">sąrašas</span><span id="textVariable">tekstas</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Gerai</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Blocky programėlės</ span><span id="indexFooter">Blocky yra atviro kodo sistema. Norintys prisidėti ar naudoti, žr. %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Blocky programėlės</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blocky yra vizuali programavimo aplinka. Žemiau yra keli pritaikymo pavyzdžiai.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Galvosūkis</a></div><div>Kaip naudotis Blocky.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Labirintas</a></div><div>Užprogramuokite, kaip keliauti labirintu.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Vėžlio Grafika</a></div><div>Pieškite su Blocky :)</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Funkcijų grafikai</a></div><div>Užrašykite funkcijų formules - ir pamatysite jų grafikus.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kodas</a></div><div>Eksportuokite Blocky programą į JavaScript, Python, Dart arba XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Lėktuvo sėdimų vietų skaičiuoklė</a></div><div>Išspręskite lygtį - užrašykite atsakymo formulę pagal turimus duomenis.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Block Factory</a></div><div>Build custom blocks using Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://github.com/google/blockly">github.com/google/blockly</a><span id="footer_suffix"></span>';
};
