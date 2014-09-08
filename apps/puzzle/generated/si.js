// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">a visual programming environment</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">See generated JavaScript code.</span><span id="linkTooltip">Save and link to blocks.</span><span id="runTooltip">Run the program defined by the blocks in the workspace.</span><span id="runProgram">මෘදුකාංගය ක්\u200Dරියාත්මක කරන්න</span><span id="resetProgram">නැවත සකසන්න</span><span id="dialogOk">හරි</span><span id="dialogCancel">අවලංගු කරන්න</span><span id="catLogic">තර්කය</span><span id="catLoops">Loops</span><span id="catMath">ගණිත</span><span id="catText">පෙළ</span><span id="catLists">ලැයිස්තු</span><span id="catColour">වර්ණය</span><span id="catVariables">විචල්\u200Dයයන්</span><span id="catProcedures">ශ්\u200Dරිත</span><span id="httpRequestError">ඉල්ලීමෙහි දෝෂයක් තිබුනි.</span><span id="linkAlert">Share your blocks with this link:\\n\\n%1</span><span id="hashError">Sorry, \'%1\' doesn\'t correspond with any saved program.</span><span id="xmlError">Could not load your saved file.  Perhaps it was created with a different version of Blockly?</span><span id="listVariable">ලැයිස්තුව</span><span id="textVariable">පෙළ</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">හරි</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">ඔස්ට්\u200Dරේලියාව</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">ඉංග්\u200Dරීසි</span><span id="Puzzle_country1City1">මෙල්බර්න්</span><span id="Puzzle_country1City2">සිඩ්නි</span><span id="Puzzle_country1HelpUrl">https://en.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">ජර්මනිය</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">ජර්මන්</span><span id="Puzzle_country2City1">බර්ලින්</span><span id="Puzzle_country2City2">මියුනිච්</span><span id="Puzzle_country2HelpUrl">https://en.wikipedia.org/wiki/Germany</span><span id="Puzzle_country3">චීනය</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">චීන</span><span id="Puzzle_country3City1">බීජීං</span><span id="Puzzle_country3City2">ශෙන්හයි</span><span id="Puzzle_country3HelpUrl">https://en.wikipedia.org/wiki/China</span><span id="Puzzle_country4">බ්\u200Dරසීලය</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">පෘතුගීසි</span><span id="Puzzle_country4City1">රියෝ ද ජැනෙයිරෝ</span><span id="Puzzle_country4City2">සාඕපෝලෝ(São Paulo)</span><span id="Puzzle_country4HelpUrl">https://en.wikipedia.org/wiki/Brazil</span><span id="Puzzle_flag">කොඩිය:</span><span id="Puzzle_language">භාෂාව:</span><span id="Puzzle_languageChoose">තෝරන්න...</span><span id="Puzzle_cities">නගර:</span><span id="Puzzle_error0">විශිෂ්ඨයි!\nසියලු %1 කොටස් නිවරදියි.</span><span id="Puzzle_error1">බොහෝ දුරට නිවරදියි!එක් කොටසක් වැරදියි.</span><span id="Puzzle_error2">%1 කොටස් වැරදියි.</span><span id="Puzzle_tryAgain">ඉස්මතු කල කොටස් වැරදියි.උත්සහ කරන්න.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Puzzle</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">උදව්</button>&nbsp; &nbsp;<button id="checkButton" class="primary">පිළිතුරු පරික්ෂා කරන්න</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">For each country (green), attach its flag, choose its language, and make a stack of its cities.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
