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

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">ऑस्ट्रेलिया</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">अंग्रेज़ी</span><span id="Puzzle_country1City1">मेलबोर्न</span><span id="Puzzle_country1City2">सिडनी</span><span id="Puzzle_country1HelpUrl">https://en.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">जर्मनी</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">जर्मन</span><span id="Puzzle_country2City1">बर्लिन</span><span id="Puzzle_country2City2">म्यूनिख</span><span id="Puzzle_country2HelpUrl">https://en.wikipedia.org/wiki/Germany</span><span id="Puzzle_country3">चीन</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">चीनी</span><span id="Puzzle_country3City1">बीजिंग</span><span id="Puzzle_country3City2">शंघाई</span><span id="Puzzle_country3HelpUrl">https://en.wikipedia.org/wiki/China</span><span id="Puzzle_country4">ब्राज़ील</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">पुर्तगाली</span><span id="Puzzle_country4City1">रिओ डी जैनेरो</span><span id="Puzzle_country4City2">साओ पाउलो</span><span id="Puzzle_country4HelpUrl">https://en.wikipedia.org/wiki/Brazil</span><span id="Puzzle_flag">ध्वज:</span><span id="Puzzle_language">भाषा:</span><span id="Puzzle_languageChoose">चुनें...</span><span id="Puzzle_cities">शहर:</span><span id="Puzzle_error0">बहुत बढ़िया!\nसभी %1 ब्लॉक सही हैं।</span><span id="Puzzle_error1">लगभग हो गया! एक ब्लॉक गलत है।</span><span id="Puzzle_error2">%1 ब्लॉक गलत हैं।</span><span id="Puzzle_tryAgain">हाइलाइट किए गया ब्लॉक सही नहीं है।\nकोशिश करते रहें।</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly (ब्लॉकली)</a> : पहेली</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">सहायता</button>&nbsp; &nbsp;<button id="checkButton" class="primary">उत्तर जांच करें</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">For each country (green), attach its flag, choose its language, and make a stack of its cities.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
