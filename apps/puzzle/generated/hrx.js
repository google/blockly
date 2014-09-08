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

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Australie</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">Englisch</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sydney</span><span id="Puzzle_country1HelpUrl">https://hrx.wikipedia.org/wiki/Australie</span><span id="Puzzle_country2">Deitschland</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Deitsch</span><span id="Puzzle_country2City1">Berlin</span><span id="Puzzle_country2City2">München</span><span id="Puzzle_country2HelpUrl">https://hrx.wikipedia.org/wiki/Deutschland</span><span id="Puzzle_country3">Volksrepublik China</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Chinesisch</span><span id="Puzzle_country3City1">Peking</span><span id="Puzzle_country3City2">Shanghai</span><span id="Puzzle_country3HelpUrl">https://hrx.wikipedia.org/wiki/Volksrepublik_China</span><span id="Puzzle_country4">Brasilie</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Brasilioonisch</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">São Paulo</span><span id="Puzzle_country4HelpUrl">https://hrx.wikipedia.org/wiki/Brasilie</span><span id="Puzzle_flag">Flagg:</span><span id="Puzzle_language">Sproch:</span><span id="Puzzle_languageChoose">wähl …</span><span id="Puzzle_cities">Städte:</span><span id="Puzzle_error0">Perfekt! All %1 Bausten sind richtich.</span><span id="Puzzle_error1">Nächst! En Baustein ist falsch.</span><span id="Puzzle_error2">%1 Bausten sind falsch.</span><span id="Puzzle_tryAgain">Der hervoargehobne Bausten ist falsch. Versuch das noch enmol.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly\n\nI translated all the Blockly strings into Riograndenser Hunsrückisch (Hrx / var. of German) using I.E. The translations didn\'t save - I got this message in a faded yellow background: "Saving the translation failed: Unknown error" . \n\nIn Translatewiki.net Web chat Nemo_bis suggested I try and save the translations in Chromium - I tried that and it worked. However, now I have to copy and paste all my work from IE to Chrome, unless there is another way of doing that ... \n\nNow I\'m in the process of transferring over the translations ... but they are all done (so no duplicate work is needed!).\n\n~~~~\nPaul Beppler (talk) 23:30, 12 March 2014 (UTC)</a> : Puzzle</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Hellef</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Antworte üwerprüfe</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Häng für jeden Stoot (grün) sein Flagg an, wähl sein Sproch aus und mach einen Stapel mit seine Städte.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
