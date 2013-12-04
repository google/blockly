// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un environament de programacion visual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Veire lo còde JavaScript generat.</span><span id="linkTooltip">Salva e liga als blòts.</span><span id="runTooltip">Aviar lo programa definit pels blòts dins \\nl’espaci de trabalh. </span><span id="runProgram">Executa lo programa</span><span id="resetProgram">Reïnicializar</span><span id="dialogOk">D\'acòrdi</span><span id="dialogCancel">Anullar</span><span id="catLogic">Logic</span><span id="catLoops">Boclas</span><span id="catMath">Math</span><span id="catText">Tèxte</span><span id="catLists">Listas</span><span id="catColour">Color</span><span id="catVariables">Variablas</span><span id="catProcedures">Proceduras</span><span id="httpRequestError">I a agut un problèma amb la demanda.</span><span id="linkAlert">Partejatz vòstres blòts gràcia a aqueste ligam :\n\n%1</span><span id="hashError">O planhèm, \'%1\' correspond pas a un fichièr Blockly salvament.</span><span id="xmlError">Impossible de cargar lo fichièr de salvament.  Benlèu qu\'es estat creat amb una autra version de Blockly ?</span><span id="listVariable">lista</span><span id="textVariable">tèxte</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">D\'acòrdi</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Austràlia</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">Anglés</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sydney</span><span id="Puzzle_country1HelpUrl">https://oc.wikipedia.org/wiki/Austr%C3%A0lia</span><span id="Puzzle_country2">Alemanha</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Alemand</span><span id="Puzzle_country2City1">Berlin</span><span id="Puzzle_country2City2">Munich</span><span id="Puzzle_country2HelpUrl">https://oc.wikipedia.org/wiki/Alemanha</span><span id="Puzzle_country3">Chine</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Chinés</span><span id="Puzzle_country3City1">Pequin</span><span id="Puzzle_country3City2">Shanghai</span><span id="Puzzle_country3HelpUrl">https://oc.wikipedia.org/wiki/Republica_Populara_de_China</span><span id="Puzzle_country4">Brasil</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Portugués</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">São Paulo</span><span id="Puzzle_country4HelpUrl">https://oc.wikipedia.org/wiki/Brasil</span><span id="Puzzle_flag">bandièra :</span><span id="Puzzle_language">lenga :</span><span id="Puzzle_languageChoose">causissètz...</span><span id="Puzzle_cities">vilas :</span><span id="Puzzle_error0">Perfièch !  Totes los %1 blòts son corrèctes.</span><span id="Puzzle_error1">Gaireben !  Un blòt es incorrècte.</span><span id="Puzzle_error2">%1 blòts son incorrèctes.</span><span id="Puzzle_tryAgain">Lo blòt en susbrilhança es incorrècte.  Tornatz ensajar.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Puzzle</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Ajuda</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Verificatz las responsas</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Per cada país (en verd), estaca sa bandièra, causís sa lenga, e fa un empilatge de sas vilas.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
