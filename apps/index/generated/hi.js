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

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">ब्लॉकली एप्स</ span><span id="indexFooter">ब्लॉकली मुफ़्त और ओपन सोर्स है। ब्लॉकली का अनुवाद, कोड योगदान या आपने एप्स मे इस्तेमाल करने के लिए, %1 पर जाएँ।<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">ब्लॉकली एप्स</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>ब्लॉकली एक ग्राफिकल प्रोग्रामिंग वातावरण है। नीचे कुछ सैम्पल ऐप्लकेशन हैं जो की ब्लॉकली का उपयोग करते हैं।</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">पहेली</a></div><div>इस्तेमाल करने के लिए ब्लॉकली इंटरफेस सीखें।</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">भूलभुलैया</a></div><div>भूलभुलैया को हल करने के लिए ब्लॉकली का उपयोग करें।</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">कछुआ ग्राफिक्स</a></div><div>रेखांकन करने के लिए ब्लॉकली का उपयोग करें।</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">ग्राफ कैलक्यूलेटर</a></div><div>ब्लॉकली से फंगक्शन प्लाट करें।</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">कोड</a></div><div>ब्लॉकली प्रोग्राम को जावास्क्रिप्ट, पायथन या XML में निर्यात करें।</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">विमान सीट कैलक्यूलेटर</a></div><div>एक या दो चर के साथ गणित की समस्या को हल करें।</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">ब्लॉक फैक्टरी</a></div><div>ब्लॉकली का इस्तेमाल कर के कस्टम ब्लॉक बनाएँ।</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
