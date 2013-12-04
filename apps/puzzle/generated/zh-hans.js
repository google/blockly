// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">一个可视化编程环境</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">查看生成的JavaScript代码。</span><span id="linkTooltip">保存模块并生成链接。</span><span id="runTooltip">于工作区中运行块所定义的程式。</span><span id="runProgram">运行程序</span><span id="resetProgram">重置</span><span id="dialogOk">确认</span><span id="dialogCancel">取消</span><span id="catLogic">逻辑</span><span id="catLoops">循环</span><span id="catMath">数学</span><span id="catText">文本</span><span id="catLists">列表</span><span id="catColour">颜色</span><span id="catVariables">变量</span><span id="catProcedures">程序</span><span id="httpRequestError">请求存在问题。</span><span id="linkAlert">通过这个链接分享您的模块：\n\n%1</span><span id="hashError">对不起，没有任何已保存的程序对应\'%1\' 。</span><span id="xmlError">无法载入您保存的文件。您是否使用其他版本的Blockly创建该文件的？</span><span id="listVariable">列表</span><span id="textVariable">文本</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">确认</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">澳大利亚</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">英语</span><span id="Puzzle_country1City1">墨尔本</span><span id="Puzzle_country1City2">悉尼</span><span id="Puzzle_country1HelpUrl">https://zh.wikipedia.org/wiki/澳大利亚</span><span id="Puzzle_country2">德国</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">德语</span><span id="Puzzle_country2City1">柏林</span><span id="Puzzle_country2City2">慕尼黑</span><span id="Puzzle_country2HelpUrl">https://zh.wikipedia.org/wiki/德国</span><span id="Puzzle_country3">中国</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">汉语</span><span id="Puzzle_country3City1">北京</span><span id="Puzzle_country3City2">上海</span><span id="Puzzle_country3HelpUrl">https://zh.wikipedia.org/wiki/中华人民共和国</span><span id="Puzzle_country4">巴西</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">葡萄牙语</span><span id="Puzzle_country4City1">里约热内卢</span><span id="Puzzle_country4City2">圣保罗</span><span id="Puzzle_country4HelpUrl">https://zh.wikipedia.org/wiki/巴西</span><span id="Puzzle_flag">国旗：</span><span id="Puzzle_language">语言：</span><span id="Puzzle_languageChoose">请选择...</span><span id="Puzzle_cities">城市：</span><span id="Puzzle_error0">完美!\n所有共%1块都正确。</span><span id="Puzzle_error1">差不多了！还有一个块是不正确的。</span><span id="Puzzle_error2">%1 块不正确</span><span id="Puzzle_tryAgain">高亮块不正确，请重试。</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : 拼图</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">帮助</button>&nbsp; &nbsp;<button id="checkButton" class="primary">检查答案</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">为每个国家（绿色）加上其国旗、选择其使用的语言并加入其拥有的城市。</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
