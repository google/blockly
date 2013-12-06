// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un entorn visual de programació</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Vegeu el codi JavaScript generat.</span><span id="linkTooltip">Desa i enllaça als blocs.</span><span id="runTooltip">Executa el programa definit pels blocs de l\'àrea \\nde treball. </span><span id="runProgram">Executa el programa</span><span id="resetProgram">Reinicialitza</span><span id="dialogOk">D\'acord</span><span id="dialogCancel">Cancel·la</span><span id="catLogic">Lògica</span><span id="catLoops">Bucles</span><span id="catMath">Matemàtiques</span><span id="catText">Text</span><span id="catLists">Llistes</span><span id="catColour">Color</span><span id="catVariables">Variables</span><span id="catProcedures">Procediments</span><span id="httpRequestError">Hi ha hagut un problema amb la sol·licitud.</span><span id="linkAlert">Comparteix els teus blocs amb aquest enllaç: %1</span><span id="hashError">Ho sentim, \'%1\' no es correspon amb cap fitxer desat de Blockly.</span><span id="xmlError">No s\'ha pogut carregar el teu fitxer desat.  Potser va ser creat amb una versió diferent de Blockly?</span><span id="listVariable">llista</span><span id="textVariable">text</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">D\'acord</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Austràlia</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">Anglès</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sydney</span><span id="Puzzle_country1HelpUrl">https://en.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">Alemanya</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Alemany</span><span id="Puzzle_country2City1">Berlín</span><span id="Puzzle_country2City2">Munic</span><span id="Puzzle_country2HelpUrl">https://ca.wikipedia.org/wiki/Alemanya</span><span id="Puzzle_country3">Xina</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Xinès</span><span id="Puzzle_country3City1">Pequín</span><span id="Puzzle_country3City2">Xangai</span><span id="Puzzle_country3HelpUrl">https://ca.wikipedia.org/wiki/Xina</span><span id="Puzzle_country4">Brasil</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Portuguès</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">São Paulo</span><span id="Puzzle_country4HelpUrl">https://ca.wikipedia.org/wiki/Brasil</span><span id="Puzzle_flag">Bandera:</span><span id="Puzzle_language">Llengua:</span><span id="Puzzle_languageChoose">triar...</span><span id="Puzzle_cities">Ciutats:</span><span id="Puzzle_error0">Perfecte!\nTots els blocs de %1 són correctes.</span><span id="Puzzle_error1">Gairebé! Una bloc és incorrecte.</span><span id="Puzzle_error2">%1 blocs són errònies.</span><span id="Puzzle_tryAgain">El bloc de subratllat no és correcta.\nContinuï provant.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Trencaclosques</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Ajuda</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Comprovar les respostes</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Per a cada país (verd), adjuntar la seva bandera, escollir la seva llengua i fer una pila de les seves ciutats.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
