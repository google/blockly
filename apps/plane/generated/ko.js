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

if (typeof planepage == 'undefined') { var planepage = {}; }


planepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Plane_rows">행 수: %1</span><span id="Plane_getRows">행 수 (%1)</span><span id="Plane_rows1">1등석 행 수: %1</span><span id="Plane_getRows1">1등석 행 수 (%1)</span><span id="Plane_rows2">2등석 행 수: %1</span><span id="Plane_getRows2">2등석 행 수 (%1)</span><span id="Plane_seats">좌석 수: %1</span><span id="Plane_placeholder">?</span><span id="Plane_setSeats">좌석수 =</span></div>';
};


planepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = planepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">블록리</a> : 비행기 좌석 계산기</span> &nbsp; ';
  var iLimit130 = opt_ijData.maxLevel + 1;
  for (var i130 = 1; i130 < iLimit130; i130++) {
    output += ' ' + ((i130 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i130) + '</span>' : (i130 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i130) + '">' + soy.$$escapeHtml(i130) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i130) + '">' + soy.$$escapeHtml(i130) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select></td></tr></table><script type="text/javascript" src="../slider.js"><\/script><svg id="plane" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="600" height="256" viewBox="0 142 600 256"><defs><g id="row1st"><rect class="seat1st" width="10" height="10" x="75" y="245" /><rect class="seat1st" width="10" height="10" x="75" y="256" /><rect class="seat1st" width="10" height="10" x="75" y="274" /><rect class="seat1st" width="10" height="10" x="75" y="285" /></g><g id="row2nd"><rect class="seat2nd" width="10" height="8" x="75" y="245" /><rect class="seat2nd" width="10" height="8" x="75" y="253" /><rect class="seat2nd" width="10" height="8" x="75" y="271" /><rect class="seat2nd" width="10" height="8" x="75" y="279" /><rect class="seat2nd" width="10" height="8" x="75" y="287" /></g><linearGradient id="grad1" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" style="stop-color:#fff;stop-opacity:0" /><stop offset="100%" style="stop-color:#fff;stop-opacity:1" /></linearGradient><linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#fff;stop-opacity:0" /><stop offset="100%" style="stop-color:#fff;stop-opacity:1" /></linearGradient></defs><path d="M 404,1 373,15 230,244 230,297 373,524 404,542 330,351 330,189 z" id="wing" /><path d="m 577,269 22,-93 -27,6 -44,88 44,88 27,6 z" id="tail" /><path d="m 483,296 h -407 c -38,0 -75,-13 -75,-26 c 0,-13 38,-26 75,-26 h 407 l 94,24 z" id="fuselage" /><rect width="610" height="100" x="-5" y="142" fill="url(#grad1)" /><rect width="610" height="100" x="-5" y="298" fill="url(#grad2)" /><text id="row1stText" x="55" y="380"></text><text id="row2ndText" x="350" y="380"></text><text x="55" y="210"><tspan id="seatText"></tspan><tspan id="seatYes" style="fill: #0c0;" dy="10">&#x2713;</tspan><tspan id="seatNo" style="fill: #f00;" dy="10">&#x2717;</tspan></text>' + ((opt_ijData.level > 1) ? '<rect id="crew_right" class="crew" width="10" height="10" x="35" y="256" /><rect id="crew_left" class="crew" width="10" height="10" x="35" y="274" />' : '') + '</svg><p>';
  switch (opt_ijData.level) {
    case 1:
      output += '비행기는 승객 좌석의 행 수가 있습니다. 각 행에는 시트 네 개가 포함되어 있습니다.';
      break;
    case 2:
      output += '비행기는 비행 갑판(조종사와 부조종사용)에서 좌석 두 개가 있고, 승객 좌석의 행 수가 있습니다. 각 행에는 시트 네 개가 포함되어 있습니다.';
      break;
    case 3:
      output += '비행기는 비행 갑판(조종사와 부조종사용)에서 좌석 두 개가 있고, 1등석과 2등석 승객 좌석의 행 수가 있습니다. 각 1등석 행에는 시트 네 개가 포함되어 있습니다. 각 2등석 행에는 시트 다섯 개가 포함되어 있습니다.';
      break;
  }
  output += '</p><p>행이 바뀐(위) 비행기에 좌석의 총 수를 계산하는 공식(아래)을 구축하세요.</p><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + planepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div>';
  return output;
};


planepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none"><block type="math_number"></block><block type="math_arithmetic"></block><block type="math_arithmetic"><field name="OP">MULTIPLY</field></block>' + ((opt_ijData.level <= 2) ? '<block type="plane_get_rows"></block>' : '<block type="plane_get_rows1st"></block><block type="plane_get_rows2nd"></block>') + '</xml>';
};
