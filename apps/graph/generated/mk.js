// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">визуелна околина за програмирање</span><span id="blocklyMessage">Блокли</span><span id="codeTooltip">Погл. создадениот JavaScript-код. </span><span id="linkTooltip">Зачувај и стави врска до блокчињата.</span><span id="runTooltip">Пушти го програмот определен од блокчињата во \\nработниот простор. </span><span id="runProgram">Пушти го програмот</span><span id="resetProgram">Одново</span><span id="dialogOk">ОК</span><span id="dialogCancel">Откажи</span><span id="catLogic">Логика</span><span id="catLoops">Јамки</span><span id="catMath">Математика</span><span id="catText">Текст</span><span id="catLists">Списоци</span><span id="catColour">Боја</span><span id="catVariables">Променливи</span><span id="catProcedures">Процедури</span><span id="httpRequestError">Се појави проблем во барањето.</span><span id="linkAlert">Споделете ги вашите блокчиња со оваа врска:\n\n%1</span><span id="hashError">„%1“ не одговара на ниеден зачуван програм.</span><span id="xmlError">Не можев да ја вчитам зачуваната податотека. Да не сте ја создале со друга верзија на Blockly?</span><span id="listVariable">список</span><span id="textVariable">текст</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">ОК</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof graphpage == 'undefined') { var graphpage = {}; }


graphpage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData);
};


graphpage.start = function(opt_data, opt_ignored, opt_ijData) {
  return graphpage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Блокли</a> : Графички дигитрон</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="linkButton" class="notext" title="Зачувај и стави врска до блокчињата."><img src=\'link.png\' height=21 width=21></button></div></td></tr></table><div id="visualization"></div><div id="funcText"><img id="y1" src="../../media/1x1.gif">...</div><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + graphpage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData);
};


graphpage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none"><category name="Математика"><block type="math_number"></block><block type="math_arithmetic"></block><block type="math_single"></block><block type="math_trig"></block><block type="math_constant"></block><block type="math_number_property"></block><block type="math_round"></block><block type="math_modulo"></block><block type="math_constrain"><value name="LOW"><block type="math_number"><field name="NUM">1</field></block></value><value name="HIGH"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_int"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_float"></block></category><category name="Променливи"><block type="graph_get_x"></block></category><category name="Логика"><block type="logic_compare"></block><block type="logic_operation"></block><block type="logic_negate"></block><block type="logic_boolean"></block><block type="logic_ternary"></block></category></xml>';
};
