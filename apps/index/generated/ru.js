// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">среда визуального программирования</span><span id="blocklyMessage">Blockly (Блoкли)</span><span id="codeTooltip">Просмотреть созданный код JavaScript.</span><span id="linkTooltip">Сохранить и показать ссылку на блоки.</span><span id="runTooltip">Запустить программу, заданную блоками в рабочей \\nобласти. </span><span id="runProgram">Запустить Программу</span><span id="resetProgram">Сбросить</span><span id="dialogOk">OK</span><span id="dialogCancel">Отмена</span><span id="catLogic">Логические</span><span id="catLoops">Циклы</span><span id="catMath">Математика</span><span id="catText">Текст</span><span id="catLists">Списки</span><span id="catColour">Цвет</span><span id="catVariables">Переменные</span><span id="catProcedures">Процедуры</span><span id="httpRequestError">Произошла проблема при запросе.</span><span id="linkAlert">Поделитесь своими блоками по этой ссылке:\n\n%1</span><span id="hashError">К сожалению, «%1» не соответствует ни одному сохраненному файлу Блокли.</span><span id="xmlError">Не удалось загрузить ваш сохраненный файл.  Возможно, он был создан в другой версии Блокли?</span><span id="listVariable">список</span><span id="textVariable">текст</span></div>';
};


apps.dialog = function(opt_data, opt_ignored) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};


apps.codeDialog = function(opt_data, opt_ignored) {
  return '<div id="dialogCode" class="dialogHiddenContent"><pre id="containerCode"></pre>' + apps.ok(null) + '</div>';
};


apps.storageDialog = function(opt_data, opt_ignored) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + apps.ok(null) + '</div>';
};


apps.ok = function(opt_data, opt_ignored) {
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">OK</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored) {
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Приложения Blockly (Блокли)</ span><span id="indexFooter">Блокли - бесплатное и открытое программное обеспечение. Чтобы поделиться своим кодом или переводами Блокли, чтобы использовать Блокли для своих приложений, - посетите %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<table><tr><td><h1><span id="title">Приложения Blockly (Блокли)</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Блокли это графическая среда программирования. Ниже приведены примеры приложений, использующих Блокли.</td></tr></table><table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Головоломка</a></div><div>Учитесь использовать интерфейс Блокли.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Лабиринт</a></div><div>Используйте Блокли, чтобы пройти лабиринт.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Черепашка</a></div><div>Используйте Блокли для рисования.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Графический калькулятор</a></div><div>Постройте график функции с Блокли.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Код</a></div><div>Переведите программу Блокли на JavaScript, Python или XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Самолёт</a></div><div>Решите математическую задачу с одной или двумя переменными.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Фабрика блоков</a></div><div>Создайте свои блоки, используя Блокли.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
