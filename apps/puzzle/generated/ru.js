// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">среда визуального программирования</span><span id="blocklyMessage">Blockly (Блoкли)</span><span id="codeTooltip">Просмотреть созданный код JavaScript.</span><span id="linkTooltip">Сохранить и показать ссылку на блоки.</span><span id="runTooltip">Запустить программу, заданную блоками в рабочей \\nобласти. </span><span id="runProgram">Запустить Программу</span><span id="resetProgram">Сбросить</span><span id="dialogOk">OK</span><span id="dialogCancel">Отмена</span><span id="catLogic">Логические</span><span id="catLoops">Циклы</span><span id="catMath">Математика</span><span id="catText">Текст</span><span id="catLists">Списки</span><span id="catColour">Цвет</span><span id="catVariables">Переменные</span><span id="catProcedures">Процедуры</span><span id="httpRequestError">Произошла проблема при запросе.</span><span id="linkAlert">Поделитесь своими блоками по этой ссылке:\n\n%1</span><span id="hashError">К сожалению, «%1» не соответствует ни одному сохраненному файлу Блокли.</span><span id="xmlError">Не удалось загрузить ваш сохраненный файл.  Возможно, он был создан в другой версии Блокли?</span><span id="listVariable">список</span><span id="textVariable">текст</span></div>';
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
  return '<div style="display: none"><span id="Puzzle_country1">Австралия</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">английский</span><span id="Puzzle_country1City1">Мельбурн</span><span id="Puzzle_country1City2">Сидней</span><span id="Puzzle_country1HelpUrl">https://ru.wikipedia.org/wiki/Австралия</span><span id="Puzzle_country2">Германия</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">немецкий</span><span id="Puzzle_country2City1">Берлин</span><span id="Puzzle_country2City2">Мюнхен</span><span id="Puzzle_country2HelpUrl">https://ru.wikipedia.org/wiki/Германия</span><span id="Puzzle_country3">Китай</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">китайский</span><span id="Puzzle_country3City1">Пекин</span><span id="Puzzle_country3City2">Шанхай</span><span id="Puzzle_country3HelpUrl">https://ru.wikipedia.org/wiki/Китай</span><span id="Puzzle_country4">Бразилия</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">португальский</span><span id="Puzzle_country4City1">Рио-де-Жанейро</span><span id="Puzzle_country4City2">Сан-Паулу</span><span id="Puzzle_country4HelpUrl">https://ru.wikipedia.org/wiki/Бразилия</span><span id="Puzzle_flag">флаг:</span><span id="Puzzle_language">язык:</span><span id="Puzzle_languageChoose">выберите...</span><span id="Puzzle_cities">города:</span><span id="Puzzle_error0">Идеально!\nВсе блоки (%1) расположены правильно.</span><span id="Puzzle_error1">Почти! Один блок расположен неправильно.</span><span id="Puzzle_error2">Несколько блоков (%1) расположены неправильно.</span><span id="Puzzle_tryAgain">Выделенный блок расположен неправильно.\nПопробуйте ещё.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly (Блoкли)</a> : Головоломка</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Помощь</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Проверить результат</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Для каждой страны (зеленый блок), прикрепите её флаг, выберите официальный язык и соберите города этой страны.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
