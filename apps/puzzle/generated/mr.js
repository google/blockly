// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">a visual programming environment</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">See generated JavaScript code.</span><span id="linkTooltip">Save and link to blocks.</span><span id="runTooltip">Run the program defined by the blocks in the workspace.</span><span id="runProgram">प्रोग्राम चालवा(दौडवा)</span><span id="resetProgram">पुनर्स्थापित करा</span><span id="dialogOk">OK</span><span id="dialogCancel">Cancel</span><span id="catLogic">Logic</span><span id="catLoops">वेटोळ्या(लूप्स)</span><span id="catMath">Math</span><span id="catText">मजकूर</span><span id="catLists">Lists</span><span id="catColour">रंग</span><span id="catVariables">अस्थिरके</span><span id="catProcedures">Functions</span><span id="httpRequestError">There was a problem with the request.</span><span id="linkAlert">Share your blocks with this link:\\n\\n%1</span><span id="hashError">Sorry, \'%1\' doesn\'t correspond with any saved program.</span><span id="xmlError">Could not load your saved file.  Perhaps it was created with a different version of Blockly?</span><span id="listVariable">यादी</span><span id="textVariable">मजकूर</span></div>';
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
  return '<div style="display: none"><span id="Puzzle_country1">ऑस्ट्रेलिया</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">इंग्लिश</span><span id="Puzzle_country1City1">मेलबोर्न</span><span id="Puzzle_country1City2">सिडनी</span><span id="Puzzle_country1HelpUrl">https://mr.wikipedia.org/wiki/%E0%A4%91%E0%A4%B8%E0%A5%8D%E0%A4%9F%E0%A5%8D%E0%A4%B0%E0%A5%87%E0%A4%B2%E0%A4%BF%E0%A4%AF%E0%A4%BE</span><span id="Puzzle_country2">जर्मनी</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">जर्मन</span><span id="Puzzle_country2City1">बर्लिन</span><span id="Puzzle_country2City2">म्युनिक</span><span id="Puzzle_country2HelpUrl">https://mr.wikipedia.org/wiki/%E0%A4%9C%E0%A4%B0%E0%A5%8D%E0%A4%AE%E0%A4%A8%E0%A5%80</span><span id="Puzzle_country3">चीन</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">चीनचा/ची</span><span id="Puzzle_country3City1">बीजिंग</span><span id="Puzzle_country3City2">शांघाय</span><span id="Puzzle_country3HelpUrl">https://mr.wikipedia.org/wiki/%E0%A4%9A%E0%A5%80%E0%A4%A8</span><span id="Puzzle_country4">ब्राझिल</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">पोर्तुगीज</span><span id="Puzzle_country4City1">रिओ-दि-जानेरो</span><span id="Puzzle_country4City2">साओ पाउलो</span><span id="Puzzle_country4HelpUrl">https://mr.wikipedia.org/wiki/%E0%A4%AC%E0%A5%8D%E0%A4%B0%E0%A4%BE%E0%A4%9D%E0%A5%80%E0%A4%B2</span><span id="Puzzle_flag">ध्वज:</span><span id="Puzzle_language">भाषा:</span><span id="Puzzle_languageChoose">निवडा...</span><span id="Puzzle_cities">शहरे:</span><span id="Puzzle_error0">सर्व %1 ब्लॉक्स बरोबर आहेत.</span><span id="Puzzle_error1">जवळपास! एक ब्लॉक चुकिचा आहे.</span><span id="Puzzle_error2">%1 ब्लॉक्स चुकिचे आहेत.</span><span id="Puzzle_tryAgain">The highlighted block is not correct.\\nKeep trying.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : कोडे</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">सहाय्य</button>&nbsp; &nbsp;<button id="checkButton" class="primary">उत्तरे तपासा</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">प्रत्येक देशास (हिरव्या रंगात),त्याचा राष्ट्रध्वज लावा,त्याची भाषा निवडा व त्याच्या शहरांची चळत लावा.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
