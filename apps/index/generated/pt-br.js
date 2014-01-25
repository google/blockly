// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">um ambiente de programação visual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Veja o código JavaScript gerado.</span><span id="linkTooltip">Salvar e gerar link para os blocos.</span><span id="runTooltip">Executar o programa definido pelos blocos na \\nárea de trabalho. </span><span id="runProgram">Executar programa</span><span id="resetProgram">Reiniciar</span><span id="dialogOk">OK</span><span id="dialogCancel">Cancelar</span><span id="catLogic">Lógica</span><span id="catLoops">Laços</span><span id="catMath">Matemática</span><span id="catText">Texto</span><span id="catLists">Listas</span><span id="catColour">Cor</span><span id="catVariables">Variáveis</span><span id="catProcedures">Procedimentos</span><span id="httpRequestError">Houve um problema com sua requisição.</span><span id="linkAlert">Compartilhe seus blocos por este link:\n\n%1</span><span id="hashError">Desculpe, \'%1\' não corresponde a um programa salvo.</span><span id="xmlError">Não foi possível carregar seu arquivo salvo. Talvez ele tenha sido criado com uma versão diferente do Blockly?</span><span id="listVariable">lista</span><span id="textVariable">texto</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">OK</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Aplicativos Blockly</ span><span id="indexFooter">Blockly é gratuito e aberto. Para contribuir com código e traduções do Blockly, ou para usar Blockly eu seu aplicativo, visite %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Aplicativos Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly é um ambiente de programação gráfica. A seguir alguns exemplos de aplicações que utilizam Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Quebra-Cabeça</a></div><div>Aprenda a usar a interface do Blockly.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Labirinto</a></div><div>Use Blockly para resolver um labirinto.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Gráficos de Tartaruga</a></div><div>Use Blockly para desenhar.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Calculadora gráfica</a></div><div>Trace funções com Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Código</a></div><div>Exporte um programa Blockly para JavaScript, Python, Dart ou XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Calculadora de Assentos em Avião</a></div><div>Resolva um problema de matemática com uma ou duas variáveis.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Fábrica de Blocos</a></div><div>Construa blocos personalizados usando Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
