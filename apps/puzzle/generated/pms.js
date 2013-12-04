// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">n\'ambient ëd programassion visual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Vëdde ël còdes JavaScript generà.</span><span id="linkTooltip">Argistré e lijé ai blòch.</span><span id="runTooltip">Fé andé ël programa definì dai blòch ant lë \\nspassi ëd travaj. </span><span id="runProgram">Fé andé ël programa</span><span id="resetProgram">Buté torna coma al prinsipi</span><span id="dialogOk">Va bin</span><span id="dialogCancel">Anulé</span><span id="catLogic">Lògica</span><span id="catLoops">Liasse</span><span id="catMath">Matemàtica</span><span id="catText">Test</span><span id="catLists">Liste</span><span id="catColour">Color</span><span id="catVariables">Variàbij</span><span id="catProcedures">Procedure</span><span id="httpRequestError">A-i é staje un problema con l\'arcesta.</span><span id="linkAlert">Ch\'a partagia ij sò blòch grassie a sta liura: %1</span><span id="hashError">An dëspias, \'%1% a corëspond a gnun programa salvà.</span><span id="xmlError">A l\'é nen podusse carié so archivi salvà. Miraco a l\'é stàit creà con na version diferenta ëd Blockly?</span><span id="listVariable">lista</span><span id="textVariable">test</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Va bin</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Australia</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">Anglèis</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sydney</span><span id="Puzzle_country1HelpUrl">https://pms.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">Almagna</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Alman</span><span id="Puzzle_country2City1">Berlin</span><span id="Puzzle_country2City2">Mùnich</span><span id="Puzzle_country2HelpUrl">https://pms.wikipedia.org/wiki/Gërmania</span><span id="Puzzle_country3">Cin-a</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Cinèis</span><span id="Puzzle_country3City1">Pechin</span><span id="Puzzle_country3City2">Shangai</span><span id="Puzzle_country3HelpUrl">https://pms.wikipedia.org/wiki/Cin-a</span><span id="Puzzle_country4">Brasil</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Portughèis</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">San Pàul</span><span id="Puzzle_country4HelpUrl">https://pms.wikipedia.org/wiki/Brasil</span><span id="Puzzle_flag">drapò:</span><span id="Puzzle_language">lenga:</span><span id="Puzzle_languageChoose">sern...</span><span id="Puzzle_cities">sità:</span><span id="Puzzle_error0">Përfet! Tuti ij %1 blòch a son giust.</span><span id="Puzzle_error1">Scasi! Un blòch a va nen bin.</span><span id="Puzzle_error2">%1 blòch a van nen bin.</span><span id="Puzzle_tryAgain">Ël blòch evidensià a va nen bin. Preuva torna.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : S-ciapatesta</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Giuté</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Contròla le rispòste</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Për minca pais (an verd), tachje sò drapò, sern soa lenga, e fa na colòna ëd soe sità.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
