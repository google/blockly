// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un environnement de programmation visuel</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Voir le code JavaScript généré\'.</span><span id="linkTooltip">Sauvegarde et lies aux blocs.</span><span id="runTooltip">Lancer le programme défini par les blocs dans \\nl’espace de travail. </span><span id="runProgram">Execute le programme</span><span id="resetProgram">Reset</span><span id="dialogOk">OK</span><span id="dialogCancel">Annuler</span><span id="catLogic">Logique</span><span id="catLoops">Boucles</span><span id="catMath">Math</span><span id="catText">Texte</span><span id="catLists">Listes</span><span id="catColour">Couleur</span><span id="catVariables">Variables</span><span id="catProcedures">Procédures</span><span id="httpRequestError">Il y a eu un problème avec la demande.</span><span id="linkAlert">Partagez vos blocs grâce à ce lien:\n\n%1</span><span id="hashError">Désolé, \'%1\' ne correspond pas à un fichier Blockly sauvegarde.</span><span id="xmlError">Impossible de charger le fichier de sauvegarde.  Peut être a t-il ete créé avec une autre version de Blockly?</span><span id="listVariable">liste</span><span id="textVariable">texte</span></div>';
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
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">Applications Blockly</ span><span id="indexFooter">Blockly est libre et avec code ouvert. Pour contribuer au code ou aux traductions de Blockly, ou pour utiliser Blockly dans votre propre application, allez sur %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">Applications Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Blockly est un environnement de programmation graphique. Ci-dessous quelques exemples d’application qui utilisent Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Puzzle</a></div><div>Apprendre à utiliser l’interface de Blockly.</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Labyrinthe</a></div><div>Utiliser Blockly pour résoudre un labyrinthe.</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Tortue dessinatrice</a></div><div>Utiliser Blockly pour dessiner.</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Calculatrice graphique</a></div><div>Préparer des fonctions avec Blockly.</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Code</a></div><div>Exporter un programme Blockly en JavaScript, Python, Dart ou XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Calculateur de sièges d’avion</a></div><div>Résoudre un problème de math avec une ou deux variables.</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Usine de blocs</a></div><div>Construire des blocs personnalisés en utilisant Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
