// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un endro programmiñ da welet</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Gwelet ar c\'hod JavaScript krouet.</span><span id="linkTooltip">Enrollañ ha liammañ d\'ar bloc\'hadoù.</span><span id="runTooltip">Lañsañ ar programm termenet gant ar bloc\'hadoù \\nen takad labour. </span><span id="runProgram">Lañsañ ar programm</span><span id="resetProgram">Adderaouekaat</span><span id="dialogOk">Mat eo</span><span id="dialogCancel">Nullañ</span><span id="catLogic">Poell</span><span id="catLoops">Boukloù</span><span id="catMath">Matematik</span><span id="catText">Testenn</span><span id="catLists">Rolloù</span><span id="catColour">Liv</span><span id="catVariables">Argemmennoù</span><span id="catProcedures">Argerzhadurioù</span><span id="httpRequestError">Ur gudenn zo gant ar reked.</span><span id="linkAlert">Rannañ ho ploc\'hoù gant al liamm-mañ :\n\n%1</span><span id="hashError">Digarezit. "%1" ne glot gant programm enrollet ebet.</span><span id="xmlError">Ne c\'haller ket kargañ ho restr enrollet. Marteze e oa bet krouet gant ur stumm disheñvel eus Blockly ?</span><span id="listVariable">roll</span><span id="textVariable">testenn</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Mat eo</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Aostralia</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">Saozneg</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sydney</span><span id="Puzzle_country1HelpUrl">https://br.wikipedia.org/wiki/Aostralia</span><span id="Puzzle_country2">Alamagn</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Alamaneg</span><span id="Puzzle_country2City1">Berlin</span><span id="Puzzle_country2City2">München</span><span id="Puzzle_country2HelpUrl">https://br.wikipedia.org/wiki/Alamagn</span><span id="Puzzle_country3">Sina</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Sinaeg</span><span id="Puzzle_country3City1">Beijing</span><span id="Puzzle_country3City2">Shanghai</span><span id="Puzzle_country3HelpUrl">https://br.wikipedia.org/wiki/Sina</span><span id="Puzzle_country4">Brazil</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Portugaleg</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">São Paulo</span><span id="Puzzle_country4HelpUrl">https://br.wikipedia.org/wiki/Brazil</span><span id="Puzzle_flag">banniel :</span><span id="Puzzle_language">yezh :</span><span id="Puzzle_languageChoose">dibab...</span><span id="Puzzle_cities">keodedoù :</span><span id="Puzzle_error0">Dispar !\nReizh eo an/ar %1 bloc\'h.</span><span id="Puzzle_error1">Tost ! Chom a ra ur bloc\'h direizh.</span><span id="Puzzle_error2">%1 bloc\'h direizh zo.</span><span id="Puzzle_tryAgain">Direizh eo ar bloc\'h usskedet.\nKendalc\'hit da bleustriñ.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Miltamm</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Skoazell</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Gwiriañ ar respontoù</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Evit kement bro (e gwer), stagañ he banniel, dibab he yezh, ha berniañ he c\'hêrioù.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
