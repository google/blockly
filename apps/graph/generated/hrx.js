// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">Visuelle Programmierumgebung</span><span id="blocklyMessage">Blockly\n\nI translated all the Blockly strings into Riograndenser Hunsrückisch (Hrx / var. of German) using I.E. The translations didn\'t save - I got this message in a faded yellow background: "Saving the translation failed: Unknown error" . \n\nIn Translatewiki.net Web chat Nemo_bis suggested I try and save the translations in Chromium - I tried that and it worked. However, now I have to copy and paste all my work from IE to Chrome, unless there is another way of doing that ... \n\nNow I\'m in the process of transferring over the translations ... but they are all done (so no duplicate work is needed!).\n\n~~~~\nPaul Beppler (talk) 23:30, 12 March 2014 (UTC)</span><span id="codeTooltip">Generierte Java-COde oonsiehn.</span><span id="linkTooltip">Speichre und auf Bausten verlinke.</span><span id="runTooltip">Das Programm ausfüahre, das von den Bausten im Oorweitsbereich definiert ist.</span><span id="runProgram">Programm ausführe</span><span id="resetProgram">Zurücksetze</span><span id="dialogOk">Okay</span><span id="dialogCancel">Abbreche</span><span id="catLogic">Logik</span><span id="catLoops">Schleife</span><span id="catMath">Mathematik</span><span id="catText">Text</span><span id="catLists">Liste</span><span id="catColour">Farreb</span><span id="catVariables">Variable</span><span id="catProcedures">Funktione</span><span id="httpRequestError">Mit der Oonfroch hots en Problem geb.</span><span id="linkAlert">Tel von dein Bausten mit dem Link:\n\n%1</span><span id="hashError">„%1“ stimmt leider mit kenem üweren gespeicherte Programm.</span><span id="xmlError">Dein gespeicherte Datei könnt net gelood sin. Vielleicht woard se mit ener annre Version von Blockly erstellt.</span><span id="listVariable">List</span><span id="textVariable">Text</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Okay</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof graphpage == 'undefined') { var graphpage = {}; }


graphpage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData);
};


graphpage.start = function(opt_data, opt_ignored, opt_ijData) {
  return graphpage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly\n\nI translated all the Blockly strings into Riograndenser Hunsrückisch (Hrx / var. of German) using I.E. The translations didn\'t save - I got this message in a faded yellow background: "Saving the translation failed: Unknown error" . \n\nIn Translatewiki.net Web chat Nemo_bis suggested I try and save the translations in Chromium - I tried that and it worked. However, now I have to copy and paste all my work from IE to Chrome, unless there is another way of doing that ... \n\nNow I\'m in the process of transferring over the translations ... but they are all done (so no duplicate work is needed!).\n\n~~~~\nPaul Beppler (talk) 23:30, 12 March 2014 (UTC)</a> : Grafikrechner</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="linkButton" class="notext" title="Speichre und auf Bausten verlinke."><img src=\'link.png\' height=21 width=21></button></div></td></tr></table><div id="visualization"></div><div id="funcText"><img id="y1" src="../../media/1x1.gif">...</div><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + graphpage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData);
};


graphpage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none"><category name="Mathematik"><block type="math_number"></block><block type="math_arithmetic"></block><block type="math_single"></block><block type="math_trig"></block><block type="math_constant"></block><block type="math_number_property"></block><block type="math_round"></block><block type="math_modulo"></block><block type="math_constrain"><value name="LOW"><block type="math_number"><field name="NUM">1</field></block></value><value name="HIGH"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_int"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_float"></block></category><category name="Variable"><block type="graph_get_x"></block></category><category name="Logik"><block type="logic_compare"></block><block type="logic_operation"></block><block type="logic_negate"></block><block type="logic_boolean"></block><block type="logic_ternary"></block></category></xml>';
};
