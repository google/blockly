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

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Blocklyprogram</ span><span id="indexFooter">Blockly er gratis og har en åpen kildekode. FOr å bidra med kode eller oversettelser til Blockly, eller for å bruke Blockly i din egen app, se %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Blocklyprogram</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly er et grafisk programmeringsmiljø. Under er noen eksempelprogram som bruker Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Puslespill</a></div><div>Lær deg å bruke Blocklys grensesnitt.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Labyrint</a></div><div>Bruk Blockly for å løse en labyring.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Skilpaddegrafikk</a></div><div>Bruk Blockly til å tegne.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Grafisk kalkulator</a></div><div>Tegnefunksjoner med Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kode</a></div><div>Eksporter et Blockly-program til JavaScript, Python, Dart eller XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Flysetekalkulator</a></div><div>Løs et matematisk problem med én eller to variabler.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Blockfabrikk</a></div><div>Bygg tilpassede blokker med Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
