// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">een visuele programmeeromgeving</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Bekijk de gemaakte JavaScriptcode.</span><span id="linkTooltip">Opslaan en koppelen naar blokken.</span><span id="runTooltip">Voer het programma uit dat met de blokken in de werkruimte is gemaakt.</span><span id="runProgram">Programma uitvoeren</span><span id="resetProgram">Opnieuw instellen</span><span id="dialogOk">OK</span><span id="dialogCancel">Annuleren</span><span id="catLogic">Logica</span><span id="catLoops">Lussen</span><span id="catMath">Formules</span><span id="catText">Tekst</span><span id="catLists">Lijsten</span><span id="catColour">Kleur</span><span id="catVariables">Variabelen</span><span id="catProcedures">Functies</span><span id="httpRequestError">Er is een probleem opgetreden tijdens het verwerken van het verzoek.</span><span id="linkAlert">Deel uw blokken via deze koppeling:\n\n%1</span><span id="hashError">"%1" komt helaas niet overeen met een opgeslagen bestand.</span><span id="xmlError">Uw opgeslagen bestand kan niet geladen worden. Is het misschien gemaakt met een andere versie van Blockly?</span><span id="listVariable">lijst</span><span id="textVariable">tekst</span></div>';
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
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Blockly Apps</ span><span id="indexFooter">Blockly is gratis en open source. Ga naar %1 om code of vertalingen bij te dragen of vertalingen aan Blockly, of Blockly te gebruiken in uw eigen app.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Blockly Apps</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly is een grafische programmeeromgeving.  Hieronder treft u een aantal voorbeeldtoepassingen aan die gebruikmaken van Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Puzzel</a></div><div>Leren werken met de interface van Blockly.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Doolhof</a></div><div>Gebruik Blockly om een doolhof op te lossen.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Schildpadtekeningen</a></div><div>Gebruik Blockly om te tekenen.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Grafische rekenmachine</a></div><div>Plotfuncties met Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Code</a></div><div>Een Blocklyprogramma exporteren naar JavaScript, Python, Dart of XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Vliegtuigstoelencalculator</a></div><div>Een wiskundige probleem met een of twee variabelen oplossen.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Blokkenfabriek</a></div><div>Aangepaste blokken maken met Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
