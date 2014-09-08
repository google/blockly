// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">Асяродзьдзе віртуальнага праграмаваньня</span><span id="blocklyMessage">Blockly (Блоклі)</span><span id="codeTooltip">Глядзі згенераваны код JavaScript.</span><span id="linkTooltip">Захаваць і зьвязаць з блёкамі.</span><span id="runTooltip">Запусьціце праграму, вызначаную блёкамі ў працоўнай вобласьці.</span><span id="runProgram">Запусьціць праграму</span><span id="resetProgram">Скасаваць</span><span id="dialogOk">OK</span><span id="dialogCancel">Скасаваць</span><span id="catLogic">Лёгіка</span><span id="catLoops">Петлі</span><span id="catMath">Матэматычныя формулы</span><span id="catText">Тэкст</span><span id="catLists">Сьпісы</span><span id="catColour">Колер</span><span id="catVariables">Зьменныя</span><span id="catProcedures">Функцыі</span><span id="httpRequestError">Узьнікла праблема з запытам.</span><span id="linkAlert">Падзяліцца Вашым блёкам праз гэтую спасылку:\n\n%1</span><span id="hashError">Прабачце, \'%1\' не адпавядае ніводнай захаванай праграме.</span><span id="xmlError">Не атрымалася загрузіць захаваны файл. Магчыма, ён быў створаны з іншай вэрсіяй Блёклі?</span><span id="listVariable">сьпіс</span><span id="textVariable">тэкст</span></div>';
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

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Дастасаваньні Блоклі</ span><span id="indexFooter">Блоклі - гэта вольны рэсурс з адкрытым кодам. Каб падзяліцца сваім кодам ці перакладамі Блоклі або выкарыстоўваць Блоклі ва ўласных даставаньнях наведайце  %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Дастасаваньні Блоклі</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Блоклі - гэта графічнае асяродзьдзе праграмаваньня. Ніжэй знаходзяцца некалькі прыкладаў дастасаваньняў якія выкарыстоўваюць Блоклі.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Мазгатня</a></div><div>Вучыцеся выкарыстоўваць інтэрфэйс Блоклі.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Лябірынт</a></div><div>Выкарыстоўвайце Блоклі каб прайсьці лябірынт.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Графіка Чарапахі</a></div><div>Выкарыстоўвайце Блоклі для маляваньня.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Графічны калькулятар</a></div><div>Пабудуйце графікі функцыяў з Блоклі.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Код</a></div><div>Экспартуйце праграму Блоклі на JavaScript, Python, Dart ці XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Калькулятар месцаў у самалёце</a></div><div>Рашыце матэматычную задачу з адной ці некалькімі пераменнымі.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Фабрыка блёкаў</a></div><div>Пабудуйце ўласныя блёкі з выкарыстаньнем Блоклі.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
