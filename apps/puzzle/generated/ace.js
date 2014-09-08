// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">Ruweuëng meuprogram ban leumah</span><span id="blocklyMessage">Teutheun</span><span id="codeTooltip">Eu kode JavaScript yang geupeuhasé</span><span id="linkTooltip">Keubah ngon neupawôt keu theun</span><span id="runTooltip">Neupeujak program nyang geupeuteutap le seuneutheun lam ruweuëng keurija</span><span id="runProgram">Peujak program</span><span id="resetProgram">Atô keulayi</span><span id="dialogOk">Ka got</span><span id="dialogCancel">Peubateuë</span><span id="catLogic">Logis</span><span id="catLoops">Kuwien</span><span id="catMath">Matematik</span><span id="catText">Haraih</span><span id="catLists">Dapeuta</span><span id="catColour">Wareuna</span><span id="catVariables">Meumacam</span><span id="catProcedures">Prosedur</span><span id="httpRequestError">Na masalah lam neumeulakèe</span><span id="linkAlert">Neubagi seuneutheun droëneuh ngon peunawôt nyoë: %1</span><span id="hashError">Meu\'ah, \'%1\' hana saban sakri ngon peuë mantong program nyang meukeubah</span><span id="xmlError">Beureukaih keuneubah droëneuh han jeuët geupasoë. Kadang na neupeugot ngon versi seuneutheun yang la\'én</span><span id="listVariable">dapeuta</span><span id="textVariable">haraih</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Ka got</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Australia</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">Inggréh</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sydney</span><span id="Puzzle_country1HelpUrl">https://ace.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">Jeureuman</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Jeureuman</span><span id="Puzzle_country2City1">Berlin</span><span id="Puzzle_country2City2">Munich</span><span id="Puzzle_country2HelpUrl">https://ace.wikipedia.org/wiki/Jeureuman</span><span id="Puzzle_country3">Cina</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Cina</span><span id="Puzzle_country3City1">Beijing</span><span id="Puzzle_country3City2">Shanghai</span><span id="Puzzle_country3HelpUrl">https://ace.wikipedia.org/wiki/China</span><span id="Puzzle_country4">Brazil</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Portugéh</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">Sao Paulo</span><span id="Puzzle_country4HelpUrl">https://ace.wikipedia.org/wiki/Brazil</span><span id="Puzzle_flag">\'alam:</span><span id="Puzzle_language">bahsa:</span><span id="Puzzle_languageChoose">piléh</span><span id="Puzzle_cities">banda:</span><span id="Puzzle_error0">samporeuna!\nBanmandum % 1 blok ka beutôi.</span><span id="Puzzle_error1">Bacut teuk! Saboh blok hana beutôi</span><span id="Puzzle_error2">% 1 blok hana beutôi.</span><span id="Puzzle_tryAgain">Blok nyang geupeuleumah hana beutôi. Neucuba lom.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Teutheun</a> : Hiëm</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Help</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Pareksa jeunaweueb</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">For each country (green), attach its flag, choose its language, and make a stack of its cities.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
