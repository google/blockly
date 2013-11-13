// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">vizuálne programovacie prostredie</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Prezrieť vygenerovaný javascriptový kód.</span><span id="linkTooltip">Uložiť a zdieľať odkaz na tento program.</span><span id="runTooltip">Spustiť program, zložený z dielcov na pracovnej \\nploche. </span><span id="runProgram">Spustiť program</span><span id="resetProgram">Odznova</span><span id="dialogOk">OK</span><span id="dialogCancel">Zrušiť</span><span id="catLogic">Logika</span><span id="catLoops">Cykly</span><span id="catMath">Matematické</span><span id="catText">Text</span><span id="catLists">Zoznamy</span><span id="catColour">Farby</span><span id="catVariables">Premenné</span><span id="catProcedures">Procedúry</span><span id="httpRequestError">Problém so spracovaním požiadavky.</span><span id="linkAlert">Zdieľať tento program skopírovaním odkazu\n\n%1</span><span id="hashError">Prepáč, \'%1\' nie je meno žiadnemu uloženému programu.</span><span id="xmlError">Nebolo možné načítať uložený súbor. Možno bol vytvorený v inej verzii Blocky.</span><span id="listVariable">zoznam</span><span id="textVariable">text</span></div>';
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
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Blockly Apps</ span><span id="indexFooter">Blockly is free and open source.  To contribute code or translations to Blockly, or to use Blockly in your own app, visit %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<h1>Blockly Apps</h1><p>Blockly is a graphical programming environment.  Below are some sample applications that use Blockly.<table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Skladačka</a></div><div>Learn to use Blockly\'s interface.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Bludisko</a></div><div>Use Blockly to solve a maze.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Korytnačia grafika</a></div><div>Use Blockly to draw.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Grafická kalkulačka</a></div><div>Plot functions with Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Kód</a></div><div>Export a Blockly program into JavaScript, Python or XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Lietadlo</a></div><div>Solve a math problem with one or two variables.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Block Factory</a></div><div>Build custom blocks using Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
