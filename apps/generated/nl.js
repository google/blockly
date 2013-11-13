// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">een visuele programmeeromgeving</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Bekijk de gemaakte JavaScriptcode.</span><span id="linkTooltip">Opslaan en koppelen naar blokken.</span><span id="runTooltip">Voer het programma uit dat met de blokken in de \\nwerkruimte is gemaakt. </span><span id="runProgram">Programma uitvoeren</span><span id="resetProgram">Opnieuw instellen</span><span id="dialogOk">OK</span><span id="dialogCancel">Annuleren</span><span id="catLogic">Logica</span><span id="catLoops">Lussen</span><span id="catMath">Formules</span><span id="catText">Tekst</span><span id="catLists">Lijsten</span><span id="catColour">Kleur</span><span id="catVariables">Variabelen</span><span id="catProcedures">Procedures</span><span id="httpRequestError">Er is een probleem opgetreden tijdens het verwerken van het verzoek.</span><span id="linkAlert">Deel uw blokken via deze koppeling:\n\n%1</span><span id="hashError">"%1" komt helaas niet overeen met een opgeslagen bestand.</span><span id="xmlError">Uw opgeslagen bestand kan niet geladen worden. Is het misschien gemaakt met een andere versie van Blockly?</span><span id="listVariable">lijst</span><span id="textVariable">tekst</span></div>';
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
  return appsIndex.messages(null) + '<h1>Blockly Apps</h1><p>Blockly is a graphical programming environment.  Below are some sample applications that use Blockly.<table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Puzzel</a></div><div>Learn to use Blockly\'s interface.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Doolhof</a></div><div>Use Blockly to solve a maze.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Schildpadtekeningen</a></div><div>Use Blockly to draw.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Grafische rekenmachine</a></div><div>Plot functions with Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Code</a></div><div>Export a Blockly program into JavaScript, Python or XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Vliegtuig</a></div><div>Solve a math problem with one or two variables.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Block Factory</a></div><div>Build custom blocks using Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
