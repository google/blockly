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

if (typeof turtlepage == 'undefined') { var turtlepage = {}; }


turtlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Turtle_moveTooltip">将乌龟向前或向后移动指定的量。</span><span id="Turtle_moveForward">前移指定格数</span><span id="Turtle_moveBackward">后移指定格数</span><span id="Turtle_turnTooltip">按指定的度数向左或向右转动乌龟。</span><span id="Turtle_turnRight">右转</span><span id="Turtle_turnLeft">左转</span><span id="Turtle_widthTooltip">更改宽度。</span><span id="Turtle_setWidth">将宽度设置为</span><span id="Turtle_colourTooltip">更改画笔颜色。</span><span id="Turtle_setColour">设置颜色</span><span id="Turtle_penTooltip">提高或放下笔以停止或开始绘图。</span><span id="Turtle_penUp">拿起笔</span><span id="Turtle_penDown">放下笔</span><span id="Turtle_turtleVisibilityTooltip">使乌龟（圆圈和箭头）可见或隐藏。</span><span id="Turtle_hideTurtle">隐藏乌龟</span><span id="Turtle_showTurtle">显示乌龟</span><span id="Turtle_printHelpUrl">https://zh.wikipedia.org/wiki/印刷</span><span id="Turtle_printTooltip">在龟的方向及位置绘制文本。</span><span id="Turtle_print">打印</span><span id="Turtle_fontHelpUrl">https://zh.wikipedia.org/wiki/字体</span><span id="Turtle_fontTooltip">设置打印块使用的字体。</span><span id="Turtle_font">字体</span><span id="Turtle_fontSize">字体大小</span><span id="Turtle_fontNormal">正常</span><span id="Turtle_fontBold">粗体</span><span id="Turtle_fontItalic">斜体</span><span id="Turtle_unloadWarning">离开本页面会丢失你的工作。</span></div>';
};


turtlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return turtlepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : 乌龟图形</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr></table><div id="visualization"><canvas id="scratch" width="400" height="400" style="display: none"></canvas><canvas id="display" width="400" height="400"></canvas></div><table style="padding-top: 1em;"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><script type="text/javascript" src="../slider.js"><\/script><svg id="slider" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="150" height="50"><!-- Slow icon. --><clipPath id="slowClipPath"><rect width=26 height=12 x=5 y=14 /></clipPath><image xlink:href="icons.png" height=42 width=84 x=-21 y=-10 clip-path="url(#slowClipPath)" /><!-- Fast icon. --><clipPath id="fastClipPath"><rect width=26 height=16 x=120 y=10 /></clipPath><image xlink:href="icons.png" height=42 width=84 x=120 y=-11 clip-path="url(#fastClipPath)" /></svg></td><td style="width: 15px;"><img id="spinner" style="visibility: hidden;" src="loading.gif" height=15 width=15></td><td style="width: 190px; text-align: center"><button id="runButton" class="primary" title="让乌龟按照块的指令工作。"><img src="../../media/1x1.gif" class="run icon21">运行程序</button><button id="resetButton" class="primary" style="display: none"><img src="../../media/1x1.gif" class="stop icon21"> 重置</button></td></tr></table><div id="toolbarDiv"><button id="codeButton" class="notext" title="查看生成的JavaScript代码。"><img src=\'../../media/1x1.gif\' class="code icon21"></button><button id="linkButton" class="notext" title="保存模块并生成链接。"><img src=\'../../media/1x1.gif\' class="link icon21"></button><button class="notext" id="captureButton" title="保存该绘图。"><img src=\'../../media/1x1.gif\' class="img icon21"></button><a id="downloadImageLink" download="绘图.png"></a></div><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + turtlepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData);
};


turtlepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none"><category name="乌龟"><block type="draw_move"><value name="VALUE"><block type="math_number"><field name="NUM">10</field></block></value></block><block type="draw_turn"><value name="VALUE"><block type="math_number"><field name="NUM">90</field></block></value></block><block type="draw_width"><value name="WIDTH"><block type="math_number"><field name="NUM">1</field></block></value></block><block type="draw_pen"></block><block type="turtle_visibility"></block><block type="draw_print"><value name="TEXT"><block type="text"></block></value></block><block type="draw_font"></block></category><category name="颜色"><block type="draw_colour"><value name="COLOUR"><block type="colour_picker"></block></value></block><block type="colour_picker"></block><block type="colour_random"></block><block type="colour_rgb"></block><block type="colour_blend"></block></category><category name="逻辑"><block type="controls_if"></block><block type="logic_compare"></block><block type="logic_operation"></block><block type="logic_negate"></block><block type="logic_boolean"></block><block type="logic_ternary"></block></category><category name="循环"><block type="controls_repeat_ext"><value name="TIMES"><block type="math_number"><field name="NUM">10</field></block></value></block><block type="controls_whileUntil"></block><block type="controls_for"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">10</field></block></value><value name="BY"><block type="math_number"><field name="NUM">1</field></block></value></block><block type="controls_forEach"></block><block type="controls_flow_statements"></block></category><category name="数学"><block type="math_number"></block><block type="math_arithmetic"></block><block type="math_single"></block><block type="math_trig"></block><block type="math_constant"></block><block type="math_number_property"></block><block type="math_change"><value name="DELTA"><block type="math_number"><field name="NUM">1</field></block></value></block><block type="math_round"></block><block type="math_on_list"></block><block type="math_modulo"></block><block type="math_constrain"><value name="LOW"><block type="math_number"><field name="NUM">1</field></block></value><value name="HIGH"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_int"><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">100</field></block></value></block><block type="math_random_float"></block></category><category name="列表"><block type="lists_create_empty"></block><block type="lists_create_with"></block><block type="lists_repeat"><value name="NUM"><block type="math_number"><field name="NUM">5</field></block></value></block><block type="lists_length"></block><block type="lists_isEmpty"></block><block type="lists_indexOf"><value name="VALUE"><block type="variables_get"><field name="VAR">列表</field></block></value></block><block type="lists_getIndex"><value name="VALUE"><block type="variables_get"><field name="VAR">列表</field></block></value></block><block type="lists_setIndex"><value name="LIST"><block type="variables_get"><field name="VAR">列表</field></block></value></block><block type="lists_getSublist"><value name="LIST"><block type="variables_get"><field name="VAR">列表</field></block></value></block></category><category name="变量" custom="VARIABLE"></category><category name="程序" custom="PROCEDURE"></category></xml>';
};
