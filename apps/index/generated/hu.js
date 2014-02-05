// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">egy vizuális programozási környezet</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">A JavaScript forráskód megtekintése.</span><span id="linkTooltip">Hivatkozás létrehozása</span><span id="runTooltip">Program futtatása.</span><span id="runProgram">Program futtatása</span><span id="resetProgram">Alaphelyzet</span><span id="dialogOk">Elolvastam</span><span id="dialogCancel">Mégsem</span><span id="catLogic">Logikai műveletek</span><span id="catLoops">Ciklusok</span><span id="catMath">Matematikai műveletek</span><span id="catText">Sztring műveletek</span><span id="catLists">Listakezelés</span><span id="catColour">Színek</span><span id="catVariables">Változók</span><span id="catProcedures">Eljárások</span><span id="httpRequestError">A kéréssel kapcsolatban probléma merült fel.</span><span id="linkAlert">Ezzel a hivatkozással tudod megosztani a programodat:\n\n%1</span><span id="hashError">Sajnos a \'%1\' hivatkozás nem tartozik egyetlen programhoz sem.</span><span id="xmlError">A programodat nem lehet betölteni.  Elképzelhető, hogy a Blockly egy másik verziójában készült?</span><span id="listVariable">lista</span><span id="textVariable">szöveg</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Elolvastam</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Blockly alkalmazások</ span><span id="indexFooter">A Blockly ingyenes és  nyílt forráskódú. Segítsen a forráskódban, készítsen fordítást Blocklyhoz, vagy használja a Blocklyt saját alkalmazásában, látogasson el a %1 oldalra.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Blockly alkalmazások</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>A Blockly egy grafikus programozási környezet. Az alábbiakban bemutatunk néhány példa alkalmazást.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kirakós</a></div><div>Ismerje meg a Blockly felületét.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Labirintus</a></div><div>Blockly segítségével oldjon meg egy labirintust.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Teknőc Grafika</a></div><div>Rajzolásához használja a Blocklyt.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Függvényrajzoló</a></div><div>Függvényábrázolás Blocklyval.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kódszerkesztő</a></div><div>Blocklyval megírt programját exportálhatja JavaScript, Python, Dart vagy XML nyelven.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Repülőgép alkalmazás</a></div><div>Oldjon meg matematikai problémát, egy vagy két változóval.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Blokk készítés</a></div><div>Készítsen saját blokkokat a Blockly segítségével.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
