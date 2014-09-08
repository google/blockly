// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un contorno de programación visual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Ver o código JavaScript xerado.</span><span id="linkTooltip">Gardar e crear unha ligazón aos bloques.</span><span id="runTooltip">Executar o programa definido polos bloques no espazo de traballo.</span><span id="runProgram">Executar o programa</span><span id="resetProgram">Restablecer</span><span id="dialogOk">Aceptar</span><span id="dialogCancel">Cancelar</span><span id="catLogic">Lóxica</span><span id="catLoops">Bucles</span><span id="catMath">Matemáticas</span><span id="catText">Texto</span><span id="catLists">Listas</span><span id="catColour">Cor</span><span id="catVariables">Variables</span><span id="catProcedures">Funcións</span><span id="httpRequestError">Houbo un problema coa solicitude.</span><span id="linkAlert">Comparte os teus bloques con esta ligazón:\n\n%1</span><span id="hashError">Sentímolo, "%1" non se corresponde con ningún programa gardado.</span><span id="xmlError">Non se puido cargar o ficheiro gardado. Se cadra, foi creado cunha versión diferente de Blockly.</span><span id="listVariable">lista</span><span id="textVariable">texto</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Aceptar</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Australia</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">inglés</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sidney</span><span id="Puzzle_country1HelpUrl">https://gl.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">Alemaña</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">alemán</span><span id="Puzzle_country2City1">Berlín</span><span id="Puzzle_country2City2">Múnic</span><span id="Puzzle_country2HelpUrl">https://gl.wikipedia.org/wiki/Alema%C3%B1a</span><span id="Puzzle_country3">China</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">chinés</span><span id="Puzzle_country3City1">Pequín</span><span id="Puzzle_country3City2">Shanghai</span><span id="Puzzle_country3HelpUrl">https://gl.wikipedia.org/wiki/Rep%C3%BAblica_Popular_da_China</span><span id="Puzzle_country4">Brasil</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">portugués</span><span id="Puzzle_country4City1">Río de Xaneiro</span><span id="Puzzle_country4City2">San Paulo</span><span id="Puzzle_country4HelpUrl">https://gl.wikipedia.org/wiki/Brasil</span><span id="Puzzle_flag">bandeira:</span><span id="Puzzle_language">lingua:</span><span id="Puzzle_languageChoose">escolle...</span><span id="Puzzle_cities">cidades:</span><span id="Puzzle_error0">Perfecto!\nOs %1 bloques son correctos.</span><span id="Puzzle_error1">Por pouco! Un bloque é incorrecto.</span><span id="Puzzle_error2">%1 bloques son incorrectos.</span><span id="Puzzle_tryAgain">O bloque destacado non é correcto.\nSigue intentándoo.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Crebacabezas</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Axuda</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Comprobar as respostas</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">A cada país (en verde) faille corresponder a súa bandeira, sinala a súa lingua e apiña as súas cidades.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
