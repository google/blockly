// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">시각 프로그래밍 환경</span><span id="blocklyMessage">블록리</span><span id="codeTooltip">생성된 자바스크립트 코드를 봅니다.</span><span id="linkTooltip">블록을 저장하고 링크를 가져옵니다.</span><span id="runTooltip">작업 공간에서 블록으로 정의된 프로그램을 실행합니다.</span><span id="runProgram">프로그램 실행</span><span id="resetProgram">재설정</span><span id="dialogOk">확인</span><span id="dialogCancel">취소</span><span id="catLogic">논리</span><span id="catLoops">반복</span><span id="catMath">수학</span><span id="catText">텍스트</span><span id="catLists">목록</span><span id="catColour">색</span><span id="catVariables">변수</span><span id="catProcedures">절차</span><span id="httpRequestError">요청에 문제가 있습니다.</span><span id="linkAlert">다음 링크로 블록을 공유하세요:\n\n%1</span><span id="hashError">죄송하지만 \'%1\'은 어떤 저장된 프로그램으로 일치하지 않습니다.</span><span id="xmlError">저장된 파일을 불러올 수 없습니다. 혹시 블록리의 다른 버전으로 만들었습니까?</span><span id="listVariable">목록</span><span id="textVariable">텍스트</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">확인</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">앞으로 가기</span><span id="Maze_turnLeft">왼쪽으로 돌기</span><span id="Maze_turnRight">오른쪽으로 돌기</span><span id="Maze_doCode">하기</span><span id="Maze_elseCode">그렇지 않으면</span><span id="Maze_helpIfElse">만약-그렇지 않으면 블록은 한 가지 또는 다른 행동을 합니다.</span><span id="Maze_pathAhead">만약 앞으로 가면</span><span id="Maze_pathLeft">만약 왼쪽으로 가면</span><span id="Maze_pathRight">만약 오른쪽으로 가면</span><span id="Maze_repeatUntil">다음까지 반복</span><span id="Maze_moveForwardTooltip">플레이어가 한 칸 앞으로 이동합니다.</span><span id="Maze_turnTooltip">플레이어가 90도로 왼쪽이나 오른쪽으로 돕니다.</span><span id="Maze_ifTooltip">만약 지정된 방향으로 하고 있으면, 몇 가지 행동을 합니다.</span><span id="Maze_ifelseTooltip">만약 지정된 방향으로 하고 있으면, 첫 번째 블록을 행동을 합니다. \\n그렇지 않으면, 두 번째 블록을 행동을 합니다. </span><span id="Maze_whileTooltip">도착점에 도달할 때까지 내부 행동을 반복합니다.</span><span id="Maze_capacity0">나머지 블록 %0개가 있습니다.</span><span id="Maze_capacity1">나머지 블록 %1개가 있습니다.</span><span id="Maze_capacity2">나머지 블록 %2개가 있습니다.</span><span id="Maze_nextLevel">축하합니다! %1단계를 진행할 준비가 되었습니까?</span><span id="Maze_finalLevel">축하합니다! 최종 단계를 해결했습니다.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html">블록리</a> : 미로</span> &nbsp; ';
  for (var i161 = 1; i161 < 11; i161++) {
    output += ' ' + ((i161 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i161) + '</span>' : (i161 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i161) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i161) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="생성된 자바스크립트 코드를 봅니다."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="블록을 저장하고 링크를 가져옵니다."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="블록이 말하는 행동을 플레이어가 합니다."><img src="../../media/1x1.gif" class="run icon21"> 프로그램 실행</button><button id="resetButton" class="primary" style="display: none" title="미로의 시작에서 플레이어를 다시 넣습니다."><img src="../../media/1x1.gif" class="stop icon21"> 재설정</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>목표에 도달할 수 있도록 함께 \'앞으로 가기\' 블록을 세로로 쌓으세요.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>이 단계에서, 하얀 작업 공간에서 모든 블록을 함께 쌓을 필요가 있습니다.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>어떻게 되는지 보려면 프로그램을 실행하세요.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>당신의 프로그램은 미로를 풀 수 없습니다. \'재설정\'을 누르고 다시 시도하세요.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>컴퓨터는 제한된 메모리가 있습니다. 블록 두 개만 사용해 이 길의 끝에 도달하세요. 한 번 이상 블록을 실행하려면 \'반복\'을 사용하세요.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>이 단계에 대한 모든 블록을 사용했습니다. 새 블록은 만드려면, 먼저 기존 블록을 삭제해야 합니다.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>\'반복\' 블록 안에 하나 이상의 블록을 넣을 수 있습니다.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>메뉴에서 당신이 좋아하는 선수를 고르세요.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>\'만약\' 블록은 조건이 참이면 무언가를 합니다. 왼쪽에 길이 있으면 왼쪽으로 돌도록 하세요.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">\'만약\' 블록의 조건을 바꾸려면 %1 부분을 클릭하세요.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>만약-그렇지 않으면 블록은 한 가지 또는 다른 행동을 합니다.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>복잡한 미로를 풀 수 있습니까? 다음 왼쪽 벽을 하세요. 고급 프로그래머만!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><title name="DIR">turnLeft</title></block><block type="maze_turn"><title name="DIR">turnRight</title></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><title name="DIR">isPathLeft</title></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
