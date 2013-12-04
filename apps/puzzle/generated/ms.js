// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">persekitaran pengaturcaraan visual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Lihat kod JavaScript yang dihasilkan.</span><span id="linkTooltip">Simpan dan pautkan kepada blok.</span><span id="runTooltip">Jalankan aturcara yang ditetapkan oleh blok-blok \\ndi dalam ruang kerja. </span><span id="runProgram">Jalankan Program</span><span id="resetProgram">Reset</span><span id="dialogOk">OK</span><span id="dialogCancel">Batalkan</span><span id="catLogic">Logik</span><span id="catLoops">Gelung</span><span id="catMath">Matematik</span><span id="catText">Teks</span><span id="catLists">Senarai</span><span id="catColour">Warna</span><span id="catVariables">Pemboleh ubah</span><span id="catProcedures">Prosedur</span><span id="httpRequestError">Permintaan itu terdapat masalah.</span><span id="linkAlert">Kongsikan blok-blok anda dengan pautan ini:\n\n%1</span><span id="hashError">Maaf, \'%1\' tidak berpadanan dengan sebarang aturcara yang disimpan.</span><span id="xmlError">Fail simpanan anda tidak dapat dimuatkan. Jangan-jangan ia dicipta dengan versi Blockly yang berlainan?</span><span id="listVariable">senarai</span><span id="textVariable">teks</span></div>';
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
  return '<div style="display: none"><span id="Puzzle_country1">Australia</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">Inggeris</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sydney</span><span id="Puzzle_country1HelpUrl">https://ms.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">Jerman</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Jerman</span><span id="Puzzle_country2City1">Berlin</span><span id="Puzzle_country2City2">Munich</span><span id="Puzzle_country2HelpUrl">https://ms.wikipedia.org/wiki/Jerman</span><span id="Puzzle_country3">China</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Cina</span><span id="Puzzle_country3City1">Beijing</span><span id="Puzzle_country3City2">Shanghai</span><span id="Puzzle_country3HelpUrl">https://ms.wikipedia.org/wiki/Republik_Rakyat_China</span><span id="Puzzle_country4">Brazil</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Portugis</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">São Paulo</span><span id="Puzzle_country4HelpUrl">https://ms.wikipedia.org/wiki/Brazil</span><span id="Puzzle_flag">bendera:</span><span id="Puzzle_language">bahasa:</span><span id="Puzzle_languageChoose">pilih...</span><span id="Puzzle_cities">bandar:</span><span id="Puzzle_error0">Sempurna!\nKesemua %1 blok adalah betul.</span><span id="Puzzle_error1">Sikit saja lagi! Satu blok tidak betul.</span><span id="Puzzle_error2">%1 blok tidak betul.</span><span id="Puzzle_tryAgain">Blok yang ditonjolkan itu tidak betul. Cuba lagi.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Teka-teki</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Bantuan</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Semak Jawapan</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Untuk setiap negara (hijau), lampirkan benderanya, pilih bahasanya, dan susunkan bandar-bandarnya.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
