// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">görsel bir programlama ortamı</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Oluşturulan JavaScript kodunu görüntüle.</span><span id="linkTooltip">Blokları ve bağlantı adresini kaydet.</span><span id="runTooltip">Çalışma alanında bloklar tarafından tanımlanan programını çalıştırın.</span><span id="runProgram">Programı Çalıştır</span><span id="resetProgram">Tekrar</span><span id="dialogOk">TAMAM</span><span id="dialogCancel">İptal</span><span id="catLogic">Mantık</span><span id="catLoops">Döngüler</span><span id="catMath">Matematik</span><span id="catText">Metin</span><span id="catLists">Listeler</span><span id="catColour">Renk</span><span id="catVariables">Değişkenler</span><span id="catProcedures">İşlevler</span><span id="httpRequestError">İstek ile ilgili bir problem var.</span><span id="linkAlert">Bloklarını bu bağlantı ile paylaş:\n\n%1</span><span id="hashError">Üzgünüz, \'%1\' hiç bir kaydedilmiş program ile uyuşmuyor.</span><span id="xmlError">Kaydedilen dosyanız yüklenemiyor\nBlockly\'nin önceki sürümü ile kaydedilmiş olabilir mi?</span><span id="listVariable">liste</span><span id="textVariable">metin</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">TAMAM</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">Avustralya</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">İngilizce</span><span id="Puzzle_country1City1">Melbourne</span><span id="Puzzle_country1City2">Sidney</span><span id="Puzzle_country1HelpUrl">https://tr.wikipedia.org/wiki/Avustralya</span><span id="Puzzle_country2">Almanya</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">Almanca</span><span id="Puzzle_country2City1">Berlin</span><span id="Puzzle_country2City2">Münih</span><span id="Puzzle_country2HelpUrl">https://tr.wikipedia.org/wiki/Almanya</span><span id="Puzzle_country3">Çin</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">Çince</span><span id="Puzzle_country3City1">Pekin</span><span id="Puzzle_country3City2">Şangay</span><span id="Puzzle_country3HelpUrl">https://tr.wikipedia.org/wiki/Çin_Halk_Cumhuriyeti</span><span id="Puzzle_country4">Brezilya</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">Portekizce</span><span id="Puzzle_country4City1">Rio de Janeiro</span><span id="Puzzle_country4City2">São Paulo</span><span id="Puzzle_country4HelpUrl">https://tr.wikipedia.org/wiki/Brezilya</span><span id="Puzzle_flag">bayrak:</span><span id="Puzzle_language">dil:</span><span id="Puzzle_languageChoose">seçim yapın...</span><span id="Puzzle_cities">şehirler:</span><span id="Puzzle_error0">Muhteşem!\n%1 bloğun hepsi de doğru.</span><span id="Puzzle_error1">Neredeyse oluyordu! Bir blok yanlış.</span><span id="Puzzle_error2">%1 blok yanlış.</span><span id="Puzzle_tryAgain">Vurgulanan blok yanlış.\nDenemeye devam.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Bulmaca</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">Yardım</button>&nbsp; &nbsp;<button id="checkButton" class="primary">Yanıtları Kontrol Et</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">Her ülkenin (yeşil), bayrağını ekle, dilini seç ve şehirlerinden bir yığın oluştur.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
