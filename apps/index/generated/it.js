// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">un ambiente di programmazione grafico</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Vedi il codice JavaScript generato.</span><span id="linkTooltip">Salva e collega ai blocchi.</span><span id="runTooltip">Esegui il programma definito dai blocchi \\nnell\'area di lavoro. </span><span id="runProgram">Esegui programma</span><span id="resetProgram">Reimposta</span><span id="dialogOk">OK</span><span id="dialogCancel">Annulla</span><span id="catLogic">Logica</span><span id="catLoops">Cicli</span><span id="catMath">Matematica</span><span id="catText">Testo</span><span id="catLists">Elenchi</span><span id="catColour">Colore</span><span id="catVariables">Variabili</span><span id="catProcedures">Procedure</span><span id="httpRequestError">La richiesta non è stata soddisfatta.</span><span id="linkAlert">Condividi i tuoi blocchi con questo collegamento:\n\n%1</span><span id="hashError">Mi spiace, \'%1\' non corrisponde ad alcun programma salvato.</span><span id="xmlError">Non è stato possibile caricare il documento.  Forse è stato creato con una versione diversa di Blockly?</span><span id="listVariable">elenco</span><span id="textVariable">testo</span></div>';
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
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Applicazioni Blockly</ span><span id="indexFooter">Blockly è gratuito e open source. Per contribuire al codice o alle traduzioni per Blockly, o utilizzare Blockly nella tua applicazione, visita %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<table><tr><td><h1><span id="title">Applicazioni Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly è un ambiente di programmazione grafico. Di seguito sono riportati alcuni esempi di applicazioni che utilizzano Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Puzzle</a></div><div>Impara a utilizzare l\'interfaccia di Blockly.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Labirinto</a></div><div>Usa Blockly per risolvere un labirinto.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Tartaruga grafica</a></div><div>Usa Blockly per disegnare.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Calcolatrice grafica</a></div><div>Disegna funzioni con Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Codice</a></div><div>Esporta un programma Blockly in JavaScript, Python o XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Calcolo posti aereo</a></div><div>Risolvi un problema di matematica con una o due variabili.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Fabbrica di blocchi</a></div><div>Costruisci blocchi personalizzati utilizzando Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
