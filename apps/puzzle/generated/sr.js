// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">визуелно окружење за програмирање</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Погледајте генерисани JavaScript кôд.</span><span id="linkTooltip">Сачувајте и повежите са блоковима.</span><span id="runTooltip">Покрените програм заснован на блоковима у радном \\nпростору. </span><span id="runProgram">Покрени програм</span><span id="resetProgram">Поново постави</span><span id="dialogOk">У реду</span><span id="dialogCancel">Откажи</span><span id="catLogic">Логика</span><span id="catLoops">Петље</span><span id="catMath">Математика</span><span id="catText">Текст</span><span id="catLists">Спискови</span><span id="catColour">Боја</span><span id="catVariables">Променљиве</span><span id="catProcedures">Процедуре</span><span id="httpRequestError">Дошло је до проблема у захтеву.</span><span id="linkAlert">Делите своје блокове овом везом:\n\n%1</span><span id="hashError">„%1“ не одговара ниједном сачуваном програму.</span><span id="xmlError">Не могу да учитам сачувану датотеку. Можда је направљена другом верзијом Blockly-ја.</span><span id="listVariable">списак</span><span id="textVariable">текст</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">У реду</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Аустралија</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">енглески</span><span id="Puzzle_country1City1">Мелбурн</span><span id="Puzzle_country1City2">Сиднеј</span><span id="Puzzle_country1HelpUrl">https://sr.wikipedia.org/wiki/Аустралија</span><span id="Puzzle_country2">Немачка</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">немачки</span><span id="Puzzle_country2City1">Берлин</span><span id="Puzzle_country2City2">Минхен</span><span id="Puzzle_country2HelpUrl">https://sr.wikipedia.org/wiki/Немачка</span><span id="Puzzle_country3">Кина</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">кинески</span><span id="Puzzle_country3City1">Пекинг</span><span id="Puzzle_country3City2">Шангај</span><span id="Puzzle_country3HelpUrl">https://sr.wikipedia.org/wiki/Кина</span><span id="Puzzle_country4">Бразил</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">португалски</span><span id="Puzzle_country4City1">Рио де Жанеиро</span><span id="Puzzle_country4City2">Сао Пауло</span><span id="Puzzle_country4HelpUrl">https://sr.wikipedia.org/wiki/Бразил</span><span id="Puzzle_flag">застава:</span><span id="Puzzle_language">језик:</span><span id="Puzzle_languageChoose">изаберите…</span><span id="Puzzle_cities">градови:</span><span id="Puzzle_error0">Савршено!\nСвих %1 блокова је исправно постављено.</span><span id="Puzzle_error1">Умало! Један блок је неисправно постављен.</span><span id="Puzzle_error2">%1 блокова је неисправно постављено.</span><span id="Puzzle_tryAgain">The highlighted block is not correct.\\nKeep trying.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Слагалица</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Помоћ</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Check Answers</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">For each country (green), attach its flag, choose its language, and make a stack of its cities.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
