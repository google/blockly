// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">un\'ambienti gràficu po programai</span><span id="blocklyMessage">Blockly</span><span id="codeTooltip">Càstia su còdixi JavaScript ingenerau.</span><span id="linkTooltip">Sarva e alliòngia a is brocus.</span><span id="runTooltip">Arròllia su programa cumpostu de is brocus in s\'àrea de traballu.</span><span id="runProgram">Arròllia su Programa</span><span id="resetProgram">Reset</span><span id="dialogOk">OK</span><span id="dialogCancel">Anudda</span><span id="catLogic">Lògica</span><span id="catLoops">Lòrigas</span><span id="catMath">Matemàtica</span><span id="catText">Testu</span><span id="catLists">Lista</span><span id="catColour">Colori</span><span id="catVariables">Variabilis</span><span id="catProcedures">Funtzionis</span><span id="httpRequestError">Ddui fut unu problema cun sa pregunta</span><span id="linkAlert">Poni is brocus tuus in custu acàpiu:\n\n%1</span><span id="hashError">Mi dispraxit, \'%1\' non torrat a pari cun nimancu unu de is programas sarvaus.</span><span id="xmlError">Non potzu carrigai su file sarvau. Fortzis est stètiu fatu cun d-una versioni diferenti de Blockly?</span><span id="listVariable">lista</span><span id="textVariable">testu</span></div>';
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

if (typeof planepage == 'undefined') { var planepage = {}; }


planepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Plane_rows">Fileras: %1</span><span id="Plane_getRows">fileras (%1)</span><span id="Plane_rows1">fileras de primu classi: %1</span><span id="Plane_getRows1">fileras de primu classi (%1)</span><span id="Plane_rows2">fileras de segunda classi: %1</span><span id="Plane_getRows2">fileras de segunda classi (%1)</span><span id="Plane_seats">Cadironis: %1</span><span id="Plane_placeholder">?</span><span id="Plane_setSeats">cadironis =</span></div>';
};


planepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = planepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly</a> : Fai su contu de is cadironis de unu aparèchiu</span> &nbsp; ';
  var iLimit130 = opt_ijData.maxLevel + 1;
  for (var i130 = 1; i130 < iLimit130; i130++) {
    output += ' ' + ((i130 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i130) + '</span>' : (i130 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i130) + '">' + soy.$$escapeHtml(i130) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i130) + '">' + soy.$$escapeHtml(i130) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select></td></tr></table><script type="text/javascript" src="../slider.js"><\/script><svg id="plane" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="600" height="256" viewBox="0 142 600 256"><defs><g id="row1st"><rect class="seat1st" width="10" height="10" x="75" y="245" /><rect class="seat1st" width="10" height="10" x="75" y="256" /><rect class="seat1st" width="10" height="10" x="75" y="274" /><rect class="seat1st" width="10" height="10" x="75" y="285" /></g><g id="row2nd"><rect class="seat2nd" width="10" height="8" x="75" y="245" /><rect class="seat2nd" width="10" height="8" x="75" y="253" /><rect class="seat2nd" width="10" height="8" x="75" y="271" /><rect class="seat2nd" width="10" height="8" x="75" y="279" /><rect class="seat2nd" width="10" height="8" x="75" y="287" /></g><linearGradient id="grad1" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" style="stop-color:#fff;stop-opacity:0" /><stop offset="100%" style="stop-color:#fff;stop-opacity:1" /></linearGradient><linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#fff;stop-opacity:0" /><stop offset="100%" style="stop-color:#fff;stop-opacity:1" /></linearGradient></defs><path d="M 404,1 373,15 230,244 230,297 373,524 404,542 330,351 330,189 z" id="wing" /><path d="m 577,269 22,-93 -27,6 -44,88 44,88 27,6 z" id="tail" /><path d="m 483,296 h -407 c -38,0 -75,-13 -75,-26 c 0,-13 38,-26 75,-26 h 407 l 94,24 z" id="fuselage" /><rect width="610" height="100" x="-5" y="142" fill="url(#grad1)" /><rect width="610" height="100" x="-5" y="298" fill="url(#grad2)" /><text id="row1stText" x="55" y="380"></text><text id="row2ndText" x="350" y="380"></text><text x="55" y="210"><tspan id="seatText"></tspan><tspan id="seatYes" style="fill: #0c0;" dy="10">&#x2713;</tspan><tspan id="seatNo" style="fill: #f00;" dy="10">&#x2717;</tspan></text>' + ((opt_ijData.level > 1) ? '<rect id="crew_right" class="crew" width="10" height="10" x="35" y="256" /><rect id="crew_left" class="crew" width="10" height="10" x="35" y="274" />' : '') + '</svg><p>';
  switch (opt_ijData.level) {
    case 1:
      output += 'Unu aparèchiu tenit unas cantu fileras de cadironis po passigeris. Dònnia filera tenit cuatru cadironis.';
      break;
    case 2:
      output += 'Unu aparèchiu tenit duus cadironis in sa cabina de cumandu (po su pilota e su co-pilota), e unas cantu fileras de cadironis po passigeris. Dònnia filera tenit cuatru cadironis.';
      break;
    case 3:
      output += 'Unu aparèchiu tenit duus cadironis in sa cabina de cumandu (po su pilota e su co-pilota), e unas cantu fileras de cadironis po passigeris de prima classi e de segunda classi. Dònnia filera de prima classi tenit cuatru cadironis. Dònnia filera de segunda classi tenit cincu cadironis.';
      break;
  }
  output += '</p><p>Cuncorda una formula (innoi asuta) chi cumpudit su numeru totali de postus a setzi in s\'aparechiu, a segunda de comenti mudant is fileras de postus (innoi in susu)</p><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + planepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div>';
  return output;
};


planepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none"><block type="math_number"></block><block type="math_arithmetic"></block><block type="math_arithmetic"><field name="OP">MULTIPLY</field></block>' + ((opt_ijData.level <= 2) ? '<block type="plane_get_rows"></block>' : '<block type="plane_get_rows1st"></block><block type="plane_get_rows2nd"></block>') + '</xml>';
};
