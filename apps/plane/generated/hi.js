// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">एक विषुयल प्रोग्रामिंग वातावरण</span><span id="blocklyMessage">Blockly (ब्लॉकली)</span><span id="codeTooltip">बना हुआ जावास्क्रिप्ट कोड देखें।</span><span id="linkTooltip">सेव करें और ब्लॉक से लिंक करें।</span><span id="runTooltip">कार्यस्थान में ब्लॉक द्वारा वर्णन किया गया प्रोग्राम चलाएँ।</span><span id="runProgram">प्रोग्राम चलाएँ</span><span id="resetProgram">रीसेट करें</span><span id="dialogOk">ओके</span><span id="dialogCancel">रद्द करें</span><span id="catLogic">तर्क</span><span id="catLoops">लूप</span><span id="catMath">गणित</span><span id="catText">टेक्स्ट</span><span id="catLists">सूचियाँ</span><span id="catColour">रंग</span><span id="catVariables">चर</span><span id="catProcedures">प्रोसीजर</span><span id="httpRequestError">अनुरोध के साथ समस्या हुई।</span><span id="linkAlert">इस लिंक के साथ का अपने ब्लॉक का साझा करें:\n\n %1</span><span id="hashError">खेद है, \'%1\' किसी सेव किए गए प्रोग्राम से संबंधित नहीं है।</span><span id="xmlError">आपकी सेव की गई फ़ाइल लोड नहीं हो सकी।  शायद यह ब्लॉकली के किसी भिन्न संस्करण के साथ बनाई गयी थी?</span><span id="listVariable">सूची</span><span id="textVariable">टेक्स्ट</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">ओके</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof planepage == 'undefined') { var planepage = {}; }


planepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Plane_rows">पंक्तियाँ: %1</span><span id="Plane_getRows">पंक्तियाँ (%1)</span><span id="Plane_rows1">प्रथम श्रेणी की पंक्तियाँ: %1</span><span id="Plane_getRows1">प्रथम श्रेणी की पंक्तियाँ (%1)</span><span id="Plane_rows2">द्वितीय श्रेणी की पंक्तियाँ: %1</span><span id="Plane_getRows2">द्वितीय श्रेणी की पंक्तियाँ (%1)</span><span id="Plane_seats">सीटें: %1</span><span id="Plane_placeholder">?</span><span id="Plane_setSeats">सीटें =</span></div>';
};


planepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = planepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly (ब्लॉकली)</a> : विमान सीट कैलक्यूलेटर</span> &nbsp; ';
  var iLimit130 = opt_ijData.maxLevel + 1;
  for (var i130 = 1; i130 < iLimit130; i130++) {
    output += ' ' + ((i130 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i130) + '</span>' : (i130 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i130) + '">' + soy.$$escapeHtml(i130) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i130) + '">' + soy.$$escapeHtml(i130) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select></td></tr></table><script type="text/javascript" src="../slider.js"><\/script><svg id="plane" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="600" height="256" viewBox="0 142 600 256"><defs><g id="row1st"><rect class="seat1st" width="10" height="10" x="75" y="245" /><rect class="seat1st" width="10" height="10" x="75" y="256" /><rect class="seat1st" width="10" height="10" x="75" y="274" /><rect class="seat1st" width="10" height="10" x="75" y="285" /></g><g id="row2nd"><rect class="seat2nd" width="10" height="8" x="75" y="245" /><rect class="seat2nd" width="10" height="8" x="75" y="253" /><rect class="seat2nd" width="10" height="8" x="75" y="271" /><rect class="seat2nd" width="10" height="8" x="75" y="279" /><rect class="seat2nd" width="10" height="8" x="75" y="287" /></g><linearGradient id="grad1" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" style="stop-color:#fff;stop-opacity:0" /><stop offset="100%" style="stop-color:#fff;stop-opacity:1" /></linearGradient><linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#fff;stop-opacity:0" /><stop offset="100%" style="stop-color:#fff;stop-opacity:1" /></linearGradient></defs><path d="M 404,1 373,15 230,244 230,297 373,524 404,542 330,351 330,189 z" id="wing" /><path d="m 577,269 22,-93 -27,6 -44,88 44,88 27,6 z" id="tail" /><path d="m 483,296 h -407 c -38,0 -75,-13 -75,-26 c 0,-13 38,-26 75,-26 h 407 l 94,24 z" id="fuselage" /><rect width="610" height="100" x="-5" y="142" fill="url(#grad1)" /><rect width="610" height="100" x="-5" y="298" fill="url(#grad2)" /><text id="row1stText" x="55" y="380"></text><text id="row2ndText" x="350" y="380"></text><text x="55" y="210"><tspan id="seatText"></tspan><tspan id="seatYes" style="fill: #0c0;" dy="10">&#x2713;</tspan><tspan id="seatNo" style="fill: #f00;" dy="10">&#x2717;</tspan></text>' + ((opt_ijData.level > 1) ? '<rect id="crew_right" class="crew" width="10" height="10" x="35" y="256" /><rect id="crew_left" class="crew" width="10" height="10" x="35" y="274" />' : '') + '</svg><p>';
  switch (opt_ijData.level) {
    case 1:
      output += 'हवाई जहाज मे यात्री सीटों की कई पंक्तियों है। प्रत्येक पंक्ति में चार सीटें हैं।';
      break;
    case 2:
      output += 'हवाई जहाज के फ्लाइट डेक में दो सीटें हैं (पायलट और सह-पायलट के लिए), और यात्री सीटों की कई पंक्तियाँ हैं। प्रत्येक पंक्ति में चार सीटें हैं।';
      break;
    case 3:
      output += 'हवाई जहाज के फ्लाइट डेक में दो सीटें हैं (पायलट और सह-पायलट के लिए), और प्रथम और द्वितीय श्रेणी की यात्री सीटों की कई पंक्तियाँ हैं। प्रत्येक प्रथम श्रेणी पंक्ति में चार सीटें हैं। प्रत्येक द्वितीय श्रेणी पंक्ति में पांच सीटें हैं।';
      break;
  }
  output += '</p><p>Build a formula (below) that calculates the total number of seats on the airplane as the rows are changed (above).</p><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../blocks_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + planepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div>';
  return output;
};


planepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none"><block type="math_number"></block><block type="math_arithmetic"></block><block type="math_arithmetic"><field name="OP">MULTIPLY</field></block>' + ((opt_ijData.level <= 2) ? '<block type="plane_get_rows"></block>' : '<block type="plane_get_rows1st"></block><block type="plane_get_rows2nd"></block>') + '</xml>';
};
