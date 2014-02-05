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

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">블록리 앱</ span><span id="indexFooter">Blockly는 공짜이며 오픈소스입니다. Blockly의 코드 또는 번역에 기여하거나 당신의 프로그램에서 Blockly를 이용하려면, %1 을 방문하세요.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">블록리 앱</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly는 그래픽 프로그래밍 환경을 제공합니다. 아래는 Blockly를 사용하는 몇가지 예시 프로그램들입니다.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">퍼즐</a></div><div>블록리의 인터페이스를 사용하는 방법을 알아봅니다.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">미로</a></div><div>Blockly를 사용하여 미로를 풉니다.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">터틀 그래픽</a></div><div>Blockly를 이용하여 그림을 그립니다.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">그래프 계산기</a></div><div>Blockly를 이용하여 함수를 배열합니다.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">코드</a></div><div>Bloxkly 프로그램을 자바스크립트, 파이썬, 혹은 XML 파일로 내보냅니다.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">비행기 좌석 계산기</a></div><div>하나 또는 두개의 변수를 가진 수학 문제를 풉니다.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">블록 공장</a></div><div>Blockly를 이용해 나만의 블록을 만듭니다.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
