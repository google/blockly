// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un mediu de programare vizual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Vizualizează codul JavaScript generat.</span><span id="linkTooltip">Salvează și adaugă la blocuri. </span><span id="runTooltip">Execută programul definit de către blocuri în \\nspațiul de lucru. </span><span id="runProgram">Rulează programul</span><span id="resetProgram">Resetează</span><span id="dialogOk">OK</span><span id="dialogCancel">Revocare</span><span id="catLogic">Logic</span><span id="catLoops">Bucle</span><span id="catMath">Matematică</span><span id="catText">Text</span><span id="catLists">Liste</span><span id="catColour">Culoare</span><span id="catVariables">Variabile</span><span id="catProcedures">Proceduri</span><span id="httpRequestError">A apărut o problemă la solicitare.</span><span id="linkAlert">Distribuie-ți blocurile folosind această legătură:\n\n%1</span><span id="hashError">Scuze, „%1” nu corespunde nici unui program salvat.</span><span id="xmlError">Sistemul nu a putut încărca fișierul salvat. Poate că a fost creat cu o altă versiune de Blockly?</span><span id="listVariable">listă</span><span id="textVariable">text</span></div>';
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
  return '<div style="display: none"><span id="Puzzle_country1">Australia</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">engleză</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sydney</span><span id="Puzzle_country1HelpUrl">https://ro.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">Germania</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">germană</span><span id="Puzzle_country2City1">Berlin</span><span id="Puzzle_country2City2">München</span><span id="Puzzle_country2HelpUrl">https://ro.wikipedia.org/wiki/Germania</span><span id="Puzzle_country3">China</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">chineză</span><span id="Puzzle_country3City1">Beijing</span><span id="Puzzle_country3City2">Shanghai</span><span id="Puzzle_country3HelpUrl">https://ro.wikipedia.org/wiki/China</span><span id="Puzzle_country4">Brazilia</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">portugheză</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">São Paulo</span><span id="Puzzle_country4HelpUrl">https://ro.wikipedia.org/wiki/Brazilia</span><span id="Puzzle_flag">drapel:</span><span id="Puzzle_language">limbă:</span><span id="Puzzle_languageChoose">alege...</span><span id="Puzzle_cities">orașe:</span><span id="Puzzle_error0">Perfect!\nToate cele %1 (de) blocuri sunt corecte.</span><span id="Puzzle_error1">Aproape! Un bloc este incorect.</span><span id="Puzzle_error2">%1 (de) blocuri sunt incorecte.</span><span id="Puzzle_tryAgain">Blocul evidențiat nu este corect.\nMai încearcă.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Puzzle</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Ajutor</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Verifică răspunsurile</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Pentru fiecare țară (verde) atașează drapelul, alege-i limba și fă un grup cu orașele sale.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
