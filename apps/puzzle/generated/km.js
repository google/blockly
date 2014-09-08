// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">a visual programming environment</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">See generated JavaScript code.</span><span id="linkTooltip">Save and link to blocks.</span><span id="runTooltip">Run the program defined by the blocks in the workspace.</span><span id="runProgram">Run Program</span><span id="resetProgram">Reset</span><span id="dialogOk">យល់ព្រម</span><span id="dialogCancel">Cancel</span><span id="catLogic">Logic</span><span id="catLoops">Loops</span><span id="catMath">Math</span><span id="catText">Text</span><span id="catLists">Lists</span><span id="catColour">Colour</span><span id="catVariables">Variables</span><span id="catProcedures">Functions</span><span id="httpRequestError">There was a problem with the request.</span><span id="linkAlert">Share your blocks with this link:\\n\\n%1</span><span id="hashError">Sorry, \'%1\' doesn\'t correspond with any saved program.</span><span id="xmlError">Could not load your saved file.  Perhaps it was created with a different version of Blockly?</span><span id="listVariable">list</span><span id="textVariable">text</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">យល់ព្រម</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">អូស្ត្រាលី</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">ភាសាអង់គ្លេស</span><span id="Puzzle_country1City1">ម៉ែលបូន</span><span id="Puzzle_country1City2">ស៊ីដនី</span><span id="Puzzle_country1HelpUrl">https://km.wikipedia.org/wiki/អូស្ត្រាលី</span><span id="Puzzle_country2">អាល្លឺម៉ង់</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">ភាសាអាល្លឺម៉ង់</span><span id="Puzzle_country2City1">ប៊ែរឡាំង</span><span id="Puzzle_country2City2">មុយនិច</span><span id="Puzzle_country2HelpUrl">https://km.wikipedia.org/wiki/អាល្លឺម៉ង់</span><span id="Puzzle_country3">ចិន</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">ភាសាចិន</span><span id="Puzzle_country3City1">ប៉េកាំង</span><span id="Puzzle_country3City2">សៀងហៃ</span><span id="Puzzle_country3HelpUrl">https://km.wikipedia.org/wiki/ចិន</span><span id="Puzzle_country4">ប្រេស៊ីល</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">ភាសាព័រទុយហ្គាល់</span><span id="Puzzle_country4City1">រ្យូដេចានេរ៉ូ</span><span id="Puzzle_country4City2">សៅប៉ូឡូ</span><span id="Puzzle_country4HelpUrl">https://km.wikipedia.org/wiki/ប្រេស៊ីល</span><span id="Puzzle_flag">ទង់ជាតិ</span><span id="Puzzle_language">ភាសា៖</span><span id="Puzzle_languageChoose">ជ្រើសរើស...</span><span id="Puzzle_cities">ទីក្រុង៖</span><span id="Puzzle_error0">ល្អណាស់!\nផ្គុំត្រូវប្លុកចំនួន%1ទាំងអស់ហើយ។</span><span id="Puzzle_error1">ជិតហើយៗ! នៅសល់តែប្លុកមួយទៀតមិនទាន់ត្រូវ។</span><span id="Puzzle_error2">នៅសល់ប្លុកចំនួន %1 ទៀតមិនទាន់ត្រឹមត្រូវ។</span><span id="Puzzle_tryAgain">ប្លុកដែលដាក់ពណ៌ហ៊ុំមិនទាន់ត្រឹមត្រូវទេ។\nសូមព្យាយាមបន្ត។</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : ល្បែងផ្គុំប្លុក</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">ជំនួយ</button>&nbsp; &nbsp;<button id="checkButton" class="primary">ផ្ទៀងផ្ទាត់ចម្លើយ</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">ភ្ជាប់ទង់ជាតិ ជ្រើសរើសភាសា និង ផ្គុំឈ្មោះទីក្រុងសម្រាប់ប្រទេសនីមួយៗ (ពណ៌បៃតង)។</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
