// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">a visual programming environment</span><span id="blocklyMessage">Blockly (บล็อค-ลี่)</span><span id="codeTooltip">ดูโค้ด JavaScript ที่ถูกสร้างขึ้น.</span><span id="linkTooltip">บันทึกและเชื่อมโยงไปยังบล็อค</span><span id="runTooltip">Run the program defined by the blocks in the workspace.</span><span id="runProgram">เรียกใช้โปรแกรม</span><span id="resetProgram"> ตั้งค่าใหม่</span><span id="dialogOk">OK</span><span id="dialogCancel">Cancel</span><span id="catLogic">Logic</span><span id="catLoops">Loops</span><span id="catMath">Math</span><span id="catText">Text</span><span id="catLists">Lists</span><span id="catColour">Colour</span><span id="catVariables">Variables</span><span id="catProcedures">Procedures</span><span id="httpRequestError">มีปัญหาเกี่ยวกับการร้องขอ</span><span id="linkAlert">แบ่งปันบล็อคต่างๆของคุณด้วยลิงก์นี้:\n\n%1</span><span id="hashError">ขอโทษด้วย, \'%1\' ไม่สอดคล้องกับไฟล์ Blockly ที่บันทึกไว้</span><span id="xmlError">ไม่สามารถโหลดไฟล์ที่บันทึกไว้ของคุณได้\nบางทีมันอาจจะถูกสร้างขึ้นด้วย Blockly เวอร์ชันที่แตกต่างกัน?</span><span id="listVariable">list</span><span id="textVariable">text</span></div>';
};


apps.dialog = function(opt_data, opt_ignored) {
  return '<div id="dialogShadow" class="dialogAnimate"></div><div id="dialogBorder"></div><div id="dialog"></div>';
};


apps.codeDialog = function(opt_data, opt_ignored) {
  return '<div id="dialogCode" class="dialogHiddenContent"><pre id="containerCode"></pre>' + apps.ok(null) + '</div>';
};


apps.storageDialog = function(opt_data, opt_ignored) {
  return '<div id="dialogStorage" class="dialogHiddenContent"><div id="containerStorage"></div>' + apps.ok(null) + '</div>';
};


apps.ok = function(opt_data, opt_ignored) {
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">OK</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored) {
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Blockly Apps</ span><span id="indexFooter">Blockly is free and open source.  To contribute code or translations to Blockly, or to use Blockly in your own app, visit %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<h1>Blockly Apps</h1><p>Blockly is a graphical programming environment.  Below are some sample applications that use Blockly.<table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Puzzle</a></div><div>Learn to use Blockly\'s interface.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">เขาวงกต</a></div><div>Use Blockly to solve a maze.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Turtle Graphics</a></div><div>Use Blockly to draw.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Graphing Calculator</a></div><div>Plot functions with Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Code</a></div><div>Export a Blockly program into JavaScript, Python or XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Plane Seat Calculator</a></div><div>Solve a math problem with one or two variables.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Block Factory</a></div><div>Build custom blocks using Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
