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

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">โปรแกรมประยุกต์ Blockly</ span><span id="indexFooter">Blockly นั้นฟรีและเปิดเผยซอร์สโค้ด ถ้าต้องการช่วยเหลือในการพัฒนาโปรแกรม ช่วยแปลภาษา หรือต้องการใช้ Blockly ในโปรแกรมของคุณ สามารถเข้าไปได้ที่ %1<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">โปรแกรมประยุกต์ Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly คือระบบการเขียนโปรแกรมด้วยภาพ ด้านล่างนี้คือตัวอย่างโปรแกรมประยุกต์ที่ใช้ Blockly</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">ตัวต่อปริศนา</a></div><div>เรียนรู้การใช้งาน Blockly</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">เขาวงกต</a></div><div>ใช้ Blockly แก้ปัญหาเขาวงกต</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">เต่าสร้างภาพ</a></div><div>ใช้ Blockly วาดภาพ</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">ระบบคำนวณเชิงกราฟ</a></div><div>ใช้ Blockly สร้างกราฟ</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">เขียนโปรแกรม</a></div><div>เขียนโปรแกรมทั่วไป และสามารถแปลง Blockly ให้เป็นภาษา JavaScript, Python, Dart และ XML ได้</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">ระบบคำนวณที่นั่งบนเครื่องบิน</a></div><div>แก้ปัญหาทางคณิตศาสตร์ด้วยการสร้างสูตรคำนวณที่มีหนึ่งหรือสองตัวแปร</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">โรงงานผลิตบล็อก</a></div><div>สร้างบล็อกของคุณเองด้วย Blockly</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
