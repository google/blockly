// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">Tontolo fanoratam-pandaharana ara-pijery</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Hijery ny kaody JavaScript namboarina.</span><span id="linkTooltip">Hitahiry ary hampirohy amin\'ny bolongana.</span><span id="runTooltip">Handefa ny fandaharana voafaritry ny bolongana ao amin\'ny erana iasana.</span><span id="runProgram">Handefa ny fandaharana</span><span id="resetProgram">Averina</span><span id="dialogOk">OK</span><span id="dialogCancel">Aoka ihany</span><span id="catLogic">Lôjika</span><span id="catLoops">Tondro mifolaka</span><span id="catMath">Matematika</span><span id="catText">Soratra</span><span id="catLists">Lisitra</span><span id="catColour">Loko</span><span id="catVariables">Ova</span><span id="catProcedures">Paika</span><span id="httpRequestError">Nisy olana tamin\'ilay hataka.</span><span id="linkAlert">Zarao amin\'ity rohy ity ny bolonganao: \n\n%1</span><span id="hashError">Miala tsiny, tsy miady amin\'ny fandaharana notehirizina \'%1\'.</span><span id="xmlError">Tsy nahasokatra ny rakitra voatahirinao. Mety namboarina tamin\'ny versionan\'i Blockly hafa angamba ilay izy?</span><span id="listVariable">lisitra</span><span id="textVariable">soratra</span></div>';
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
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Fandaharana Blockly</ span><span id="indexFooter">Malalaka ary open-souce i Blockly. Vangio %1 raha tia handray anjara amin\'ny renifango na amin\'ny dikan-teny.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Fandaharana Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Tontolo fanoratana fandaharana ara-tsary i Blockly. Eo ambany ireo santiônam-pandaharana mampiasa an\'i Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Piozila</a></div><div>Hianatra hampiasa an\'i Blockly.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Labirainty</a></div><div>Hampiasa an\'i Blockly hamahàna labirainty.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Sokatra mpanao sarisary</a></div><div>Hampiasa an\'i Blockly hanaovana sarisary</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Mpikajy ara-tsary</a></div><div>Sarin-defa amin\'ny alalan\'i Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Kaody</a></div><div>Hamoaka ny fandaharana Blockly amin\'ny JavaScript, Python na XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Mpikajy sezam-piaramanidina</a></div><div>Hamaha olana matematika mampiasa ova iray na roa.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Mpamoaka bolongana</a></div><div>Bolongana manokana amin\'ny alalan\'i Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
