// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">et visuelt programmeringsmiljø</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Se den genererede JavaScript kode.</span><span id="linkTooltip">Gem og link til blokke.</span><span id="runTooltip">Kør programmet, der er defineret af blokkene i \\narbejdsområdet. </span><span id="runProgram">Kør program</span><span id="resetProgram">Nulstil</span><span id="dialogOk">OK</span><span id="dialogCancel">Afbryd</span><span id="catLogic">Logik</span><span id="catLoops">Løkker</span><span id="catMath">Matematik</span><span id="catText">Tekst</span><span id="catLists">Lister</span><span id="catColour">Farve</span><span id="catVariables">Variabler</span><span id="catProcedures">Procedurer</span><span id="httpRequestError">Der var et problem med forespørgslen.</span><span id="linkAlert">Del dine blokke med dette link:\n\n%1</span><span id="hashError">Beklager, \'%1\' passer ikke med nogen gemt Blockly fil.</span><span id="xmlError">Kunne ikke hente din gemte fil.  Måske er den lavet med en anden udgave af Blockly?</span><span id="listVariable">liste</span><span id="textVariable">tekst</span></div>';
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
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Blockly programmer</ span><span id="indexFooter">Blockly er gratis og open source. For at bidrage kode eller oversættelser til Blockly eller bruge Blockly i dit eget program, kan du besøge %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<table><tr><td><h1><span id="title">Blockly programmer</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly er et grafisk programmeringsmiljø. Nedenfor er nogle eksempler på programmer der bruger Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Puslespil</a></div><div>Lær at bruge Blocklys interface.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Labyrint</a></div><div>Brug Blockly til at løse en labyrint.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Skildpaddegrafik</a></div><div>Brug Blockly til at tegne.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Grafisk lommeregner</a></div><div>Tegn funktioner med Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Kode</a></div><div>Eksporter et Blockly program til JavaScript, Python eller XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Flysædelommeregner</a></div><div>Løs et matematisk problem med en eller to variabler.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Blokfabrik</a></div><div>Byg brugerdefinerede blokke ved hjælp af Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
