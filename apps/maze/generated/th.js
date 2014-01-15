// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">ระบบการเขียนโปรแกรมด้วยรูปภาพ</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">ดูโค้ด JavaScript ที่ถูกสร้างขึ้น.</span><span id="linkTooltip">บันทึกและสร้างลิงก์มายังบล็อกเหล่านี้.</span><span id="runTooltip">\\nเรียกใช้โปรแกรมตามที่กำหนดไว้ด้วยบล็อกที่อยู่ในพื้นที่ทำงาน </span><span id="runProgram">เรียกใช้โปรแกรม</span><span id="resetProgram">เริ่มใหม่</span><span id="dialogOk">ตกลง</span><span id="dialogCancel">ยกเลิก</span><span id="catLogic">ตรรกะ</span><span id="catLoops">การวนซ้ำ</span><span id="catMath">คณิตศาสตร์</span><span id="catText">ข้อความ</span><span id="catLists">รายการ</span><span id="catColour">สี</span><span id="catVariables">ตัวแปร</span><span id="catProcedures">ฟังก์ชัน</span><span id="httpRequestError">มีปัญหาเกี่ยวกับการร้องขอ</span><span id="linkAlert">แบ่งปันบล็อกของคุณด้วยลิงก์นี้:\n\n%1</span><span id="hashError">เสียใจด้วย \'%1\' ไม่ตรงกับโปรแกรมใดๆ ที่เคยบันทึกเอาไว้เลย</span><span id="xmlError">ไม่สามารถโหลดไฟล์ที่บันทึกไว้ของคุณได้ บางทีมันอาจจะถูกสร้างขึ้นด้วย Blockly รุ่นอื่นที่แตกต่างกัน?</span><span id="listVariable">รายการ</span><span id="textVariable">ข้อความ</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">ตกลง</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">เดินหน้า</span><span id="Maze_turnLeft">หัน ซ้าย</span><span id="Maze_turnRight">หัน ขวา</span><span id="Maze_doCode">ทำ:</span><span id="Maze_elseCode">มิฉะนั้น:</span><span id="Maze_helpIfElse">บล็อก "ถ้า-มิฉะนั้น" จะทำอย่างใดอย่างหนึ่งเท่านั้น คือ\nถ้าเงื่อนไขเป็นจริง จะไปทำตามคำสั่งใน [ทำ] เสร็จแล้วจะโดดข้ามคำสั่งที่อยู่ใน [มิฉะนั้น] ไป\nแต่ถ้าเงื่อนไขเป็นเท็จ จะโดดข้ามคำสั่งที่อยู่ใน [ทำ] โดยจะข้ามไปทำคำสั่งใน [มิฉะนั้น] แทน</span><span id="Maze_pathAhead">ถ้ามีทางไปต่อ ข้างหน้า</span><span id="Maze_pathLeft">ถ้ามีทางไปต่อ ทางซ้ายมือ</span><span id="Maze_pathRight">ถ้ามีทางไปต่อ ทางขวามือ</span><span id="Maze_repeatUntil">ทำซ้ำจนกว่าจะถึง</span><span id="Maze_moveForwardTooltip">เคลื่อนตัวผู้เล่นไปข้างหน้าหนึ่งช่อง.</span><span id="Maze_turnTooltip">หมุนตัวผู้เล่นไปทางซ้ายหรือขวา 90 องศา.</span><span id="Maze_ifTooltip">ถ้ามีทางไปต่อตามทิศที่กำหนดไว้ \\nก็ให้ทำตามคำสั่งใน [ทำ] </span><span id="Maze_ifelseTooltip">ถ้ามีทางไปต่อตามทิศที่กำหนดไว้ \\nก็ให้ทำตามคำสั่งใน [ทำ] \\nแต่ถ้าไม่ก็ให้ทำตามคำสั่งใน \\n[มิฉะนั้น] </span><span id="Maze_whileTooltip">ทำซ้ำคำสั่งที่อยู่ใน [ทำ] ไปเรื่อยๆ \\nจนกว่าจะถึงจุดหมาย </span><span id="Maze_capacity0">เหลือให้ใช้ได้อีก %0 บล็อก</span><span id="Maze_capacity1">เหลือให้ใช้ได้อีก %1 บล็อก</span><span id="Maze_capacity2">เหลือให้ใช้ได้อีก %2 บล็อก</span><span id="Maze_nextLevel">ยินดีด้วย! คุณพร้อมที่จะไปต่อยังด่านที่ %1 แล้วหรือยัง?</span><span id="Maze_finalLevel">ยินดีด้วย! คุณผ่านด่านสุดท้ายได้แล้ว</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : เขาวงกต</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="ดูโค้ด JavaScript ที่ถูกสร้างขึ้น."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="บันทึกและสร้างลิงก์มายังบล็อกเหล่านี้."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="สั่งให้ตัวผู้เล่นทำตามคำสั่งของบล็อก."><img src="../../media/1x1.gif" class="run icon21"> เรียกใช้โปรแกรม</button><button id="resetButton" class="primary" style="display: none" title="ส่งตัวผู้เล่นกลับไปที่จุดเริ่มต้น."><img src="../../media/1x1.gif" class="stop icon21"> เริ่มใหม่</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>ต่อบล็อก "เดินหน้า" สองอันเข้าด้วยกัน เพื่อช่วยให้ไปถึงจุดหมาย</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>ในด่านนี้ คุณต้องต่อทุกบล็อกเข้าด้วยกันภายในพื้นที่ทำงาน (พื้นที่ว่างสีขาว)<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>เรียกใช้โปรแกรมของคุณ แล้วคอยดูว่าจะเกิดอะไรขึ้น</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>โปรแกรมของคุณยังไม่สามารถแก้ปัญหาเขาวงกตนี้ได้ ให้กดปุ่ม "เริ่มใหม่" แล้วลองดูอีกครั้ง</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>ด่านนี้จำกัดให้คุณใช้บล็อกได้เพียงแค่ 2 บล็อกเท่านั้น ให้ลองใช้บล็อก "ทำซ้ำ..." ซึ่งจะทำให้สามารถเรียกใช้บล็อกเดิมซ้ำได้มากกว่าหนึ่งครั้ง</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>คุณได้ใช้บล็อกจนครบตามจำนวนที่กำหนดแล้ว ถ้าจะเพิ่มบล็อกใหม่เข้าไปอีก ก็ต้องเอาบล็อกบางอันออกเสียก่อน</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>คุณสามารถใส่บล็อกเข้าไปข้างในบล็อก "ทำซ้ำ..." ได้มากกว่าหนึ่งบล็อก</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>เลือกตัวผู้เล่นที่คุณชอบได้จากเมนูนี้</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>ถ้าเงื่อนไขของบล็อก "ถ้า..." เป็นจริง ก็จะ [ทำ]\nลองกำหนดให้หันซ้ายเมื่อมีทางไปต่อทางซ้ายมือดูสิ</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">คลิ้กที่ %1 ในบล็อก "ถ้า..." เพื่อเลือกเงื่อนไข</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>บล็อก "ถ้า-มิฉะนั้น" จะทำอย่างใดอย่างหนึ่งเท่านั้น คือ\nถ้าเงื่อนไขเป็นจริง จะไปทำตามคำสั่งใน [ทำ] เสร็จแล้วจะโดดข้ามคำสั่งที่อยู่ใน [มิฉะนั้น] ไป\nแต่ถ้าเงื่อนไขเป็นเท็จ จะโดดข้ามคำสั่งที่อยู่ใน [ทำ] โดยจะข้ามไปทำคำสั่งใน [มิฉะนั้น] แทน</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>คุณสามารถแก้ปัญหาเขาวงกตที่ซับซ้อนนี้ได้หรือเปล่า?\nให้ลองใช้เทคนิคเดินเลียบกำแพงทางซ้ายดูสิ\nนี่น่ะ สำหรับโปรแกรมเมอร์ระดับสูงเท่านั้นนะ!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
