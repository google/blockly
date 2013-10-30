// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">視覺化程式設計環境</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">查看產生的JavaScript程式碼。</span><span id="linkTooltip">儲存模組並提供連結。</span><span id="runTooltip">於工作區中運行模組所定義的程式。</span><span id="runProgram">運行程式</span><span id="resetProgram">重設</span><span id="dialogOk">確定</span><span id="dialogCancel">Cancel</span><span id="catLogic">邏輯</span><span id="catLoops">迴圈</span><span id="catMath">數學公式</span><span id="catText">文字</span><span id="catLists">列表</span><span id="catColour">顏色</span><span id="catVariables">變數</span><span id="catProcedures">程序</span><span id="httpRequestError">請求存在問題。</span><span id="linkAlert">以此連結分享您的模組：\n\n%1</span><span id="hashError">對不起，「%1」並未對應任何已保存的程式。</span><span id="xmlError">未能載入您保存的檔案。或許它是由其他版本的Blockly創建？</span><span id="listVariable">列表</span><span id="textVariable">文字</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">確定</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">澳洲</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">英語</span><span id="Puzzle_country1City1">墨爾本</span><span id="Puzzle_country1City2">悉尼</span><span id="Puzzle_country1HelpUrl">http://zh.wikipedia.org/wiki/澳洲</span><span id="Puzzle_country2">德國</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">德語</span><span id="Puzzle_country2City1">柏林</span><span id="Puzzle_country2City2">慕尼克</span><span id="Puzzle_country2HelpUrl">http://zh.wikipedia.org/wiki/德國</span><span id="Puzzle_country3">中國</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">中文</span><span id="Puzzle_country3City1">北京</span><span id="Puzzle_country3City2">上海</span><span id="Puzzle_country3HelpUrl">http://zh.wikipedia.org/wiki/中國</span><span id="Puzzle_country4">巴西</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">葡萄牙文</span><span id="Puzzle_country4City1">里約熱內盧</span><span id="Puzzle_country4City2">聖保羅</span><span id="Puzzle_country4HelpUrl">http://zh.wikipedia.org/wiki/巴西</span><span id="Puzzle_flag">國旗：</span><span id="Puzzle_language">語言：</span><span id="Puzzle_languageChoose">請選擇…</span><span id="Puzzle_cities">城市：</span><span id="Puzzle_error0">完美！\n所有共%1塊皆正確。</span><span id="Puzzle_error1">差不多！有一塊出錯了。</span><span id="Puzzle_error2">%1塊出錯。</span><span id="Puzzle_tryAgain">高亮顯示的塊不正確，請重試。</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html">Blockly</a> : 拼圖</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">說明</button>&nbsp; &nbsp;<button id="checkButton" class="primary">檢查答案</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">為每個國家（綠色）加上其國旗、選擇其使用的語言並加入其擁有的城市。</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
