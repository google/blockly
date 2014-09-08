// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">एक विषुयल प्रोग्रामिंग वातावरण</span><span id="blocklyMessage">Blockly (ब्लॉकली)</span><span id="codeTooltip">बना हुआ जावास्क्रिप्ट कोड देखें।</span><span id="linkTooltip">सेव करें और ब्लॉक से लिंक करें।</span><span id="runTooltip">कार्यस्थान में ब्लॉक द्वारा वर्णन किया गया प्रोग्राम चलाएँ।</span><span id="runProgram">प्रोग्राम चलाएँ</span><span id="resetProgram">रीसेट करें</span><span id="dialogOk">ओके</span><span id="dialogCancel">रद्द करें</span><span id="catLogic">तर्क</span><span id="catLoops">लूप</span><span id="catMath">गणित</span><span id="catText">टेक्स्ट</span><span id="catLists">सूचियाँ</span><span id="catColour">रंग</span><span id="catVariables">चर</span><span id="catProcedures">प्रोसीजर</span><span id="httpRequestError">अनुरोध के साथ समस्या हुई।</span><span id="linkAlert">इस लिंक के साथ का अपने ब्लॉक का साझा करें:\n\n %1</span><span id="hashError">खेद है, \'%1\' किसी सेव किए गए प्रोग्राम से संबंधित नहीं है।</span><span id="xmlError">आपकी सेव की गई फ़ाइल लोड नहीं हो सकी।  शायद यह ब्लॉकली के किसी भिन्न संस्करण के साथ बनाई गयी थी?</span><span id="listVariable">सूची</span><span id="textVariable">टेक्स्ट</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">ओके</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof graphpage == 'undefined') { var graphpage = {}; }


graphpage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData);
};


graphpage.start = function(opt_data, opt_ignored, opt_ijData) {
  return graphpage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly (ब्लॉकली)</a> : ग्राफ कैलक्यूलेटर</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="linkButton" class="notext" title="सेव करें और ब्लॉक से लिंक करें।"><img src=\'link.png\' height=21 width=21></button></div></td></tr></table><div id="visualization"></div><div id="funcText"><img id="y1" src="../../media/1x1.gif">...</div><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + graphpage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData);
};


graphpage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none"><category name="गणित"><block type="math_number"></block><block type="math_arithmetic"></block><block type="math_single"></block><block type="math_trig"></block><block type="math_constant"></block><block type="math_number_property"></block><block type="math_round"></block><block type="math_modulo"></block><block type="math_constrain"><value name="LOW"><block type="math_number"><field name="NUM">1</field></block></value><value name="HIGH"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_int"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_float"></block></category><category name="चर"><block type="graph_get_x"></block></category><category name="तर्क"><block type="logic_compare"></block><block type="logic_operation"></block><block type="logic_negate"></block><block type="logic_boolean"></block><block type="logic_ternary"></block></category></xml>';
};
