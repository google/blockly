// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">시각 프로그래밍 환경</span><span id="blocklyMessage">블록리</span><span id="codeTooltip">생성된 자바스크립트 코드를 봅니다.</span><span id="linkTooltip">블록을 저장하고 링크를 가져옵니다.</span><span id="runTooltip">작업 공간에서 블록으로 정의된 프로그램을 실행합니다.</span><span id="runProgram">프로그램 실행</span><span id="resetProgram">초기화</span><span id="dialogOk">확인</span><span id="dialogCancel">취소</span><span id="catLogic">논리</span><span id="catLoops">반복</span><span id="catMath">수학</span><span id="catText">텍스트</span><span id="catLists">목록</span><span id="catColour">색</span><span id="catVariables">변수</span><span id="catProcedures">기능</span><span id="httpRequestError">요청에 문제가 있습니다.</span><span id="linkAlert">다음 링크로 블록을 공유하세요:\n\n%1</span><span id="hashError">죄송하지만 \'%1\'은 어떤 저장된 프로그램으로 일치하지 않습니다.</span><span id="xmlError">저장된 파일을 불러올 수 없습니다. 혹시 블록리의 다른 버전으로 만들었습니까?</span><span id="listVariable">목록</span><span id="textVariable">텍스트</span></div>';
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

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">호주</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">영어</span><span id="Puzzle_country1City1">멜버른</span><span id="Puzzle_country1City2">시드니</span><span id="Puzzle_country1HelpUrl">https://ko.wikipedia.org/wiki/오스트레일리아</span><span id="Puzzle_country2">독일</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">독일어</span><span id="Puzzle_country2City1">베를린</span><span id="Puzzle_country2City2">뮌헨</span><span id="Puzzle_country2HelpUrl">https://ko.wikipedia.org/wiki/독일</span><span id="Puzzle_country3">중국</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">중국어</span><span id="Puzzle_country3City1">베이징</span><span id="Puzzle_country3City2">상하이</span><span id="Puzzle_country3HelpUrl">https://ko.wikipedia.org/wiki/중화인민공화국</span><span id="Puzzle_country4">브라질</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">포르투갈어</span><span id="Puzzle_country4City1">리우데자네이루</span><span id="Puzzle_country4City2">상파울루</span><span id="Puzzle_country4HelpUrl">https://ko.wikipedia.org/wiki/브라질</span><span id="Puzzle_flag">국기:</span><span id="Puzzle_language">언어:</span><span id="Puzzle_languageChoose">선택...</span><span id="Puzzle_cities">도시:</span><span id="Puzzle_error0">완벽합니다!\n모든 블록 %1개가 정확합니다.</span><span id="Puzzle_error1">거의 됐습니다! 블록 한 개가 잘못되었습니다.</span><span id="Puzzle_error2">블록 %1개가 잘못되었습니다.</span><span id="Puzzle_tryAgain">강조한 블록은 올바르지 않습니다.\n계속 해보세요.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">블록리</a> : 퍼즐</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">도움말</button>&nbsp; &nbsp;<button id="checkButton" class="primary">정답 확인</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">각 국가(초록)에 국기를 연결하고 언어를 선택하여 도시를 정렬하세요.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
