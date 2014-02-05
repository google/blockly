// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">graficzne środowisko programistyczne</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Zobacz wygenerowany kod JavaScript.</span><span id="linkTooltip">Zapisz i podlinkuj do bloków</span><span id="runTooltip">Uruchom program zdefinowany przez bloki w \\nobszarze roboczym </span><span id="runProgram">Uruchom Program</span><span id="resetProgram">Zresetuj</span><span id="dialogOk">OK</span><span id="dialogCancel">Anuluj</span><span id="catLogic">Logika</span><span id="catLoops">Pętle</span><span id="catMath">Matematyka</span><span id="catText">Tekst</span><span id="catLists">Listy</span><span id="catColour">Kolor</span><span id="catVariables">Zmienne</span><span id="catProcedures">Procedury</span><span id="httpRequestError">Wystąpił problem z żądaniem.</span><span id="linkAlert">Udpostępnij swoje bloki korzystając z poniższego linku : \n\n\n%1</span><span id="hashError">Przepraszamy, "%1" nie odpowiada żadnemu zapisanemu programowi.</span><span id="xmlError">Nie można załadować zapisanego pliku. Być może został utworzony za pomocą innej wersji Blockly?</span><span id="listVariable">lista</span><span id="textVariable">tekst</span></div>';
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
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Aplikacje Blockly</ span><span id="indexFooter">Blockly jest darmowe i rozwijane w ramach open source (wolnego oprogramowania). Jeżeli chcesz pracować nad kodem, tłumaczeniem Blockly, lub użyć go w swojej aplikacji, wejdź na %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Aplikacje Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly jest graficznym środowiskiem programistycznym. Poniżej znajdziesz przykładowe aplikacje, które wykorzystują Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Puzzle</a></div><div>Naucz się używać interfejsu Blockly.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Labirynt</a></div><div>Użyj Blockly, aby znaleźć drogę w labiryncie.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Grafiki Żółwia</a></div><div>Użyj Blockly, żeby rysować.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kalkulator graficzny</a></div><div>Rysuj wykresy funkcji z Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kod</a></div><div>Exportuj program napisany w Blockly do JavaScriptu, Pythona lub XMLa.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kalkulator miejsc w samolocie.</a></div><div>Rozwiąż zadanie matematyczne z jedną lub dwiema zmiennymi.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Fabryka bloków</a></div><div>Twórz swoje bloki wykorzystując Blocky.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
