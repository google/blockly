// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">een visuele programmeeromgeving</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Bekijk de gemaakte JavaScriptcode.</span><span id="linkTooltip">Opslaan en koppelen naar blokken.</span><span id="runTooltip">Voer het programma uit dat met de blokken in de \\nwerkruimte is gemaakt. </span><span id="runProgram">Programma uitvoeren</span><span id="resetProgram">Opnieuw instellen</span><span id="dialogOk">OK</span><span id="dialogCancel">Annuleren</span><span id="catLogic">Logica</span><span id="catLoops">Lussen</span><span id="catMath">Formules</span><span id="catText">Tekst</span><span id="catLists">Lijsten</span><span id="catColour">Kleur</span><span id="catVariables">Variabelen</span><span id="catProcedures">Procedures</span><span id="httpRequestError">Er is een probleem opgetreden tijdens het verwerken van het verzoek.</span><span id="linkAlert">Deel uw blokken via deze koppeling:\n\n%1</span><span id="hashError">"%1" komt helaas niet overeen met een opgeslagen bestand.</span><span id="xmlError">Uw opgeslagen bestand kan niet geladen worden. Is het misschien gemaakt met een andere versie van Blockly?</span><span id="listVariable">lijst</span><span id="textVariable">tekst</span></div>';
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

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Australië</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">Engels</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sydney</span><span id="Puzzle_country1HelpUrl">https://nl.wikipedia.org/wiki/Australië</span><span id="Puzzle_country2">Duitsland</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Duits</span><span id="Puzzle_country2City1">Berlijn</span><span id="Puzzle_country2City2">München</span><span id="Puzzle_country2HelpUrl">https://nl.wikipedia.org/wiki/Duitsland</span><span id="Puzzle_country3">China</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Chinees</span><span id="Puzzle_country3City1">Beijing</span><span id="Puzzle_country3City2">Shanghai</span><span id="Puzzle_country3HelpUrl">https://nl.wikipedia.org/wiki/China</span><span id="Puzzle_country4">Brazilië</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Portugees</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">São Paulo</span><span id="Puzzle_country4HelpUrl">https://nl.wikipedia.org/wiki/Brazilië</span><span id="Puzzle_flag">vlag:</span><span id="Puzzle_language">taal:</span><span id="Puzzle_languageChoose">kies...</span><span id="Puzzle_cities">steden:</span><span id="Puzzle_error0">Perfect\nAlle %1 blokken zijn correct.</span><span id="Puzzle_error1">Bijna! Eén blok is onjuist.</span><span id="Puzzle_error2">%1 blokken zijn onjuist.</span><span id="Puzzle_tryAgain">Het gemarkeerde blok is niet correct.\nBlijf het proberen.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Puzzel</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Hulp</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Antwoorden controleren</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Koppel de vlag, kies de taal en maak een stapel van de steden voor ieder land (groen).</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
