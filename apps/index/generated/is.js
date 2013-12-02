// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">sjónrænt forritunarumhverfi</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Sjá forritið sem JavaScript kóða.</span><span id="linkTooltip">Vista og tengja við kubba.</span><span id="runTooltip">Keyra forritið sem kubbarnir á vinnusvæðinu mynda.</span><span id="runProgram">Keyra forritið</span><span id="resetProgram">Byrja aftur</span><span id="dialogOk">Í lagi</span><span id="dialogCancel">Hætta við</span><span id="catLogic">Rökvísi</span><span id="catLoops">Lykkjur</span><span id="catMath">Reikningur</span><span id="catText">Texti</span><span id="catLists">Listar</span><span id="catColour">Litir</span><span id="catVariables">Breytur</span><span id="catProcedures">Stefjur</span><span id="httpRequestError">Það kom upp vandamál með beiðnina.</span><span id="linkAlert">Deildu kubbunum þínum með þessari krækju:</span><span id="hashError">Því miður, \'%1\' passar ekki við neitt vistað forrit.</span><span id="xmlError">Gat ekki hlaðið vistuðu skrána þína. Var hún kannske búin til í annarri útgáfu af Blockly?</span><span id="listVariable">listi</span><span id="textVariable">texti</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Í lagi</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored) {
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Blockly forrit</ span><span id="indexFooter">Blockly er ókeypis og opinn hugbúnaður. Ef þú vilt gefa kóða eða þýða fyrir Blockly eða nota það í eigin appi, líttu þá við á %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<table><tr><td><h1><span id="title">Blockly forrit</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly er sjónrænt forritunarumhverfi. Hér fyrir neðan eru nokkur sýnishorn af öppum sem nota Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Púsl</a></div><div>Læra að nota viðmót Blockly.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Völundarhús</a></div><div>Nota Blockly til að rata.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Teiknandi skjaldbaka</a></div><div>Nota Blockly til að teikna.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Reiknir með línuriti</a></div><div>Teikna gröf með Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Kóði</a></div><div>Þýða Blockly forrit yfir í JavaScript, Python eða XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Flugsætareiknir</a></div><div>Leysa reikningsdæmi með einni eða tveimur breytum.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Kubbasmiðja</a></div><div>Sérhanna kubba með Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
