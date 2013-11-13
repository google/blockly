// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">un endro programmiñ da welet</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Gwelet ar c\'hod JavaScript krouet.</span><span id="linkTooltip">Enrollañ ha liammañ d\'ar bloc\'hadoù.</span><span id="runTooltip">Lañsañ ar programm termenet gant ar bloc\'hadoù \\nen takad labour. </span><span id="runProgram">Lañsañ ar programm</span><span id="resetProgram">Adderaouekaat</span><span id="dialogOk">Mat eo</span><span id="dialogCancel">Nullañ</span><span id="catLogic">Poell</span><span id="catLoops">Boukloù</span><span id="catMath">Matematik</span><span id="catText">Testenn</span><span id="catLists">Rolloù</span><span id="catColour">Liv</span><span id="catVariables">Argemmennoù</span><span id="catProcedures">Argerzhadurioù</span><span id="httpRequestError">Ur gudenn zo gant ar reked.</span><span id="linkAlert">Rannañ ho ploc\'hoù gant al liamm-mañ :\n\n%1</span><span id="hashError">Digarezit. "%1" ne glot gant programm enrollet ebet.</span><span id="xmlError">Ne c\'haller ket kargañ ho restr enrollet. Marteze e oa bet krouet gant ur stumm disheñvel eus Blockly ?</span><span id="listVariable">roll</span><span id="textVariable">testenn</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Mat eo</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored) {
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Blockly Apps</ span><span id="indexFooter">Blockly is free and open source.  To contribute code or translations to Blockly, or to use Blockly in your own app, visit %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<h1>Blockly Apps</h1><p>Blockly is a graphical programming environment.  Below are some sample applications that use Blockly.<table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Miltamm</a></div><div>Learn to use Blockly\'s interface.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Milendall</a></div><div>Use Blockly to solve a maze.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Baot tresañ</a></div><div>Use Blockly to draw.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Jederez c\'hrafek</a></div><div>Plot functions with Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Kod</a></div><div>Export a Blockly program into JavaScript, Python or XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Nijerez</a></div><div>Solve a math problem with one or two variables.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Block Factory</a></div><div>Build custom blocks using Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
