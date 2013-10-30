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

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">mara ke hadapan</span><span id="Maze_turnLeft">belok kiri</span><span id="Maze_turnRight">belok kanan</span><span id="Maze_doCode">lakukan</span><span id="Maze_elseCode">jika tidak</span><span id="Maze_helpIfElse">Blok \'jika-jika tidak\' akan memilih salah satu tindakan yang diberikan.</span><span id="Maze_pathAhead">jika ada laluan ke hadapan</span><span id="Maze_pathLeft">jika ada laluan ke kiri</span><span id="Maze_pathRight">jika ada laluan ke kanan</span><span id="Maze_repeatUntil">ulangi sehingga</span><span id="Maze_moveForwardTooltip">Mengalihkan Pegman satu petak ke hadapan.</span><span id="Maze_turnTooltip">Membelokkan Pegman 90 darjah ke kiri atau ke kanan.</span><span id="Maze_ifTooltip">Jika terdapat laluan ke arah yang tertentu, \\nlakukan beberapa tindakan. </span><span id="Maze_ifelseTooltip">Jika terdapat laluan ke arah yang tertentu, \\nambil blok tindakan yang pertama. \\nJika tidak, ambil blok tindakan yang kedua. </span><span id="Maze_whileTooltip">Ulangi tindakan-tindakan yang dilampirkan \\nsehingga titik penamat dicapai. </span><span id="Maze_capacity0">Tinggal %0 blok.</span><span id="Maze_capacity1">Tinggal %1 blok.</span><span id="Maze_capacity2">Tinggal %2 blok.</span><span id="Maze_nextLevel">Tahniah! Adakah anda sedia untuk meningkat ke peringkat %1?</span><span id="Maze_finalLevel">Tahniah! Anda telah menyelesaikan peringkat terakhir.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html">Blockly</a> : Pagar Sesat</span> &nbsp; ';
  for (var i161 = 1; i161 < 11; i161++) {
    output += ' ' + ((i161 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i161) + '</span>' : (i161 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Lihat kod JavaScript yang dihasilkan."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Simpan dan pautkan kepada blok."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Membuatkan pemain menurut pesan blok."><img src="../../media/1x1.gif" class="run icon21"> Jalankan Program</button><button id="resetButton" class="primary" style="display: none" title="Letakkn pemain kembali di pangkal pagar sesat."><img src="../../media/1x1.gif" class="stop icon21"> Reset</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Program merupakan turutan blok. Susunkan beberapa blok \'maju\' untuk menolong saya mencapai tempat tujuan.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Di tingkat ini, anda perlu menyusun semua blok secara bertingkat-tingkat ini di dalam ruang kerja putih.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Jalankan program anda untuk melihat apa yang berlaku.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Program anda tidak menyelesaikan pagar sesat. Tekan \'Reset\' dan cuba lagi.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Komputer mempunyai memori yang terhad. Capai hujung jalan dengan menggunakan dua blok sahaja. Gunakan \'ulang\' untuk menjalankan satu blok lebih daripada sekali.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Anda telah menggunakan semua blok untuk tahap ini. Untuk membuat blok baru, anda perlu memadamkan satu blok yang sedia ada dahulu.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Anda boleh memuatkan lebih daripada satu blok di dalam blok \'ulang\'.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Choose your favourite player from this menu.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Blok \'jika\' akan melakukan sesuatu hanya jika keadaannya benar. Cuba belok ke kiri jika terdapat laluan ke kiri.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Klik pada %1 di dalam blok \'if\' untuk mengubah keadaannya.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Blok \'jika-jika tidak\' akan memilih salah satu tindakan yang diberikan.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Bolehkah anda menyelesaikan pagar sesat yang rumit ini? Cuba ikut tembok sebelah kiri. Untuk pengaturcara pakar sahaja!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><title name="DIR">turnLeft</title></block><block type="maze_turn"><title name="DIR">turnRight</title></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><title name="DIR">isPathLeft</title></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
