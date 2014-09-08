// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">визуелно окружење за програмирање</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Погледајте генерисани JavaScript кôд.</span><span id="linkTooltip">Сачувајте и повежите са блоковима.</span><span id="runTooltip">Покрените програм заснован на блоковима у радном простору.</span><span id="runProgram">Покрени програм</span><span id="resetProgram">Поново постави</span><span id="dialogOk">У реду</span><span id="dialogCancel">Откажи</span><span id="catLogic">Логика</span><span id="catLoops">Петље</span><span id="catMath">Математика</span><span id="catText">Текст</span><span id="catLists">Спискови</span><span id="catColour">Боја</span><span id="catVariables">Променљиве</span><span id="catProcedures">Процедуре</span><span id="httpRequestError">Дошло је до проблема у захтеву.</span><span id="linkAlert">Делите своје блокове овом везом:\n\n%1</span><span id="hashError">„%1“ не одговара ниједном сачуваном програму.</span><span id="xmlError">Не могу да учитам сачувану датотеку. Можда је направљена другом верзијом Blockly-ја.</span><span id="listVariable">списак</span><span id="textVariable">текст</span></div>';
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

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Апликације Blockly-ја</ span><span id="indexFooter">Blockly је слободан програм отвореног кода. Да бисте допринели његовом коду или преводу или користили га у својој апликацији, посетите %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Апликације Blockly-ја</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly је графичко окружење за програмирање. Испод су као пример дате неке апликације које користе Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Слагалица</a></div><div>Научите да користите Blockly.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Лавиринт</a></div><div>Решите лавиринт помоћу Blockly-ја.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Корњачина графика</a></div><div>Користите Blockly за цртање.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Графички калкулатор</a></div><div>Цртајте графике функција помоћу Blockly-ја.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Кôд</a></div><div>Извезите програм Blockly-ја у JavaScript, Python, Dart или XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Калкулатор места у авиону</a></div><div>Решите математички проблем помоћу једне или две променљиве.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Фабрика блокова</a></div><div>Изградите прилагођене блокове помоћу Blockly-ја.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
