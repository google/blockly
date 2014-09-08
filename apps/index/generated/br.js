// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un endro programmiñ da welet</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Gwelet ar c\'hod JavaScript krouet.</span><span id="linkTooltip">Enrollañ ha liammañ d\'ar bloc\'hadoù.</span><span id="runTooltip">Lañsañ ar programm termenet gant ar bloc\'hadoù en takad labour.</span><span id="runProgram">Lañsañ ar programm</span><span id="resetProgram">Adderaouekaat</span><span id="dialogOk">Mat eo</span><span id="dialogCancel">Nullañ</span><span id="catLogic">Poell</span><span id="catLoops">Boukloù</span><span id="catMath">Matematik</span><span id="catText">Testenn</span><span id="catLists">Rolloù</span><span id="catColour">Liv</span><span id="catVariables">Argemmennoù</span><span id="catProcedures">Arc\'hwelioù</span><span id="httpRequestError">Ur gudenn zo gant ar reked.</span><span id="linkAlert">Rannañ ho ploc\'hoù gant al liamm-mañ :\n\n%1</span><span id="hashError">Digarezit. "%1" ne glot gant programm enrollet ebet.</span><span id="xmlError">Ne c\'haller ket kargañ ho restr enrollet. Marteze e oa bet krouet gant ur stumm disheñvel eus Blockly ?</span><span id="listVariable">roll</span><span id="textVariable">testenn</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Mat eo</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Arloadoù Blockly</ span><span id="indexFooter">Frank ha gant kod tarzh digor eo Blockly. Evit degas ho lod er c\'hod hag e troidigezhioù Blockly, pe evit implijout Blockly en hoc\'h arload, kit war %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Arloadoù Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Un endro programmiñ grafek. Kavout a reot amañ dindan un nebeud skouerioù eus arloadoù a implij Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Miltamm</a></div><div>Deskiñ implijout etrefas Blockly.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Milendall</a></div><div>Implijout Blockly da ziskoulmañ ur milendall.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Baot tresañ</a></div><div>Implijout Blockly da dresañ.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Jederez c\'hrafek</a></div><div>Prientiñ arloadoù gant Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kod</a></div><div>Ezporzhiañ ur programm Blockly e JavaScript, Python, Dart pe XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Jederez azezenn nijerez</a></div><div>Diskoulmañ ur skoulmad matematikoù gant un argemmenn pe ziv.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Labouradeg bloc\'hoù</a></div><div>Sevel bloc\'hoù personelaet oc\'h implijout Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
