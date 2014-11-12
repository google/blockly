// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un environament de programacion visual</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Veire lo còde JavaScript generat.</span><span id="linkTooltip">Salva e liga als blòts.</span><span id="runTooltip">Aviar lo programa definit pels blòts dins l’espaci de trabalh.</span><span id="runProgram">Executa lo programa</span><span id="resetProgram">Reïnicializar</span><span id="dialogOk">D\'acòrdi</span><span id="dialogCancel">Anullar</span><span id="catLogic">Logic</span><span id="catLoops">Boclas</span><span id="catMath">Math</span><span id="catText">Tèxte</span><span id="catLists">Listas</span><span id="catColour">Color</span><span id="catVariables">Variablas</span><span id="catProcedures">Foncions</span><span id="httpRequestError">I a agut un problèma amb la demanda.</span><span id="linkAlert">Partejatz vòstres blòts gràcia a aqueste ligam :\n\n%1</span><span id="hashError">O planhèm, \'%1\' correspond pas a un fichièr Blockly salvament.</span><span id="xmlError">Impossible de cargar lo fichièr de salvament.  Benlèu qu\'es estat creat amb una autra version de Blockly ?</span><span id="listVariable">lista</span><span id="textVariable">tèxte</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">D\'acòrdi</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Aplicacions Blockly</ span><span id="indexFooter">Blockly is free and open source.  To contribute code or translations to Blockly, or to use Blockly in your own app, visit %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Aplicacions Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly is a graphical programming environment.  Below are some sample applications that use Blockly.</td></tr></table><table><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Còde</a></div><div>Export a Blockly program into JavaScript, Python, Dart or XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Calculador de sètis d’avion</a></div><div>Solve a math problem with one or two variables.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://developers.google.com/blockly/">developers.google.com/blockly</a><span id="footer_suffix"></span>';
};
