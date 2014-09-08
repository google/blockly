// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">vizualus programavimas</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Peržiūrėti atitinkantį JavaScript kodą.</span><span id="linkTooltip">Išsaugoti (sugeneruoti URL nuorodą).</span><span id="runTooltip">Vykdyti programą.</span><span id="runProgram">Paleisti Programą</span><span id="resetProgram">Atnaujinti</span><span id="dialogOk">Gerai</span><span id="dialogCancel">Atšaukti</span><span id="catLogic">Logika</span><span id="catLoops">Kartojimas</span><span id="catMath">Matematika</span><span id="catText">Tekstas</span><span id="catLists">Sąrašai</span><span id="catColour">Spalva</span><span id="catVariables">Kintamieji</span><span id="catProcedures">Funkcijos</span><span id="httpRequestError">Iškilo problema su prašymu.</span><span id="linkAlert">%1</span><span id="hashError">Deja, \'%1\' neatitinka jokios išsaugotos programos.</span><span id="xmlError">Nesuprantu pateikto failo. Gal jis buvo sukurtas su kita Blocky versija?</span><span id="listVariable">sąrašas</span><span id="textVariable">tekstas</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Gerai</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Australija</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">Anglų</span><span id="Puzzle_country1City1">Melburnas</span><span id="Puzzle_country1City2">Sidnėjus</span><span id="Puzzle_country1HelpUrl">https://en.wikipedia.org/wiki/Australia</span><span id="Puzzle_country2">Vokietija</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Vokietijos</span><span id="Puzzle_country2City1">Berlynas</span><span id="Puzzle_country2City2">Miunchenas</span><span id="Puzzle_country2HelpUrl">https://en.wikipedia.org/wiki/Germany</span><span id="Puzzle_country3">Kinija</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Kinų</span><span id="Puzzle_country3City1">Pekinas</span><span id="Puzzle_country3City2">Šanchajus</span><span id="Puzzle_country3HelpUrl">https://en.wikipedia.org/wiki/China</span><span id="Puzzle_country4">Brazilija</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Portugalų</span><span id="Puzzle_country4City1">Rio de Žaneiras</span><span id="Puzzle_country4City2">San Paulas</span><span id="Puzzle_country4HelpUrl">https://en.wikipedia.org/wiki/Brazil</span><span id="Puzzle_flag">vėliava:</span><span id="Puzzle_language">kalba:</span><span id="Puzzle_languageChoose">pasirinkti...</span><span id="Puzzle_cities">miestai:</span><span id="Puzzle_error0">Puiku!\nVisi %1 blokai yra teisingi.</span><span id="Puzzle_error1">Beveik! Vienas blokas yra neteisingas.</span><span id="Puzzle_error2">%1 blokai yra neteisingi.</span><span id="Puzzle_tryAgain">Paryškintas blokas nėra teisingas.\nToliau bandykite.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Galvosūkis</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Pagalba</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Patikrinti Atsakymus</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Kiekvienai šaliai (žalia), pridėkite vėliavą, pasirinkite savo kalbą, ir padarykite savo miestų kaminą.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
