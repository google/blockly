// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">γραφικό περιβάλλον προγραμματισμού</span><span id="blocklyMessage">Blockly (Μπλόκλι)</span><span id="codeTooltip">Δες τον κώδικα JavaScript που δημιουργήθηκε.</span><span id="linkTooltip">Αποθηκεύει και συνδέει σε μπλοκ.</span><span id="runTooltip">Εκτελεί το πρόγραμμα που ορίζεται από τα μπλοκ \\nστον χώρο εργασίας. </span><span id="runProgram">Εκτέλεση Προγράμματος</span><span id="resetProgram">Επανεκκίνηση</span><span id="dialogOk">Εντάξει</span><span id="dialogCancel">Ακύρωση</span><span id="catLogic">Λογική</span><span id="catLoops">Επαναλήψεις</span><span id="catMath">Μαθηματικά</span><span id="catText">Κείμενο</span><span id="catLists">Λίστες</span><span id="catColour">Χρώμα</span><span id="catVariables">Μεταβλητές</span><span id="catProcedures">Διαδικασίες</span><span id="httpRequestError">Υπήρξε πρόβλημα με το αίτημα.</span><span id="linkAlert">Μοιράσου τα μπλοκ σου με αυτόν τον σύνδεσμο:\n\n%1</span><span id="hashError">Λυπάμαι, το «%1» δεν αντιστοιχεί σε κανένα αποθηκευμένο πρόγραμμα.</span><span id="xmlError">Δεν μπορώ να φορτώσω το αποθηκευμένο αρχείο σου.  Μήπως δημιουργήθηκε από μία παλιότερη έκδοση του Μπλόκλι;</span><span id="listVariable">λίστα</span><span id="textVariable">κείμενο</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">Εντάξει</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">προχώρησε ευθεία</span><span id="Maze_turnLeft">στρίψε αριστερά</span><span id="Maze_turnRight">στρίψε δεξιά</span><span id="Maze_doCode">κάνε</span><span id="Maze_elseCode">αλλιώς</span><span id="Maze_helpIfElse">Τα μπλοκ «εάν...αλλιώς» θα κάνουν είτε το ένα είτε το άλλο.</span><span id="Maze_pathAhead">εάν υπάρχει μονοπάτι μπροστά</span><span id="Maze_pathLeft">εάν υπάρχει μονοπάτι προς τα αριστερά</span><span id="Maze_pathRight">εάν υπάρχει μονοπάτι προς τα δεξιά</span><span id="Maze_repeatUntil">επανάλαβε μέχρι</span><span id="Maze_moveForwardTooltip">Κινεί τον χαρακτήρα μία θέση μπροστά.</span><span id="Maze_turnTooltip">Στρίβει το ανθρωπάκι αριστερά ή δεξιά κατά 90 \\nμοίρες. </span><span id="Maze_ifTooltip">Αν υπάρχει μονοπάτι προς τη συγκεκριμένη \\nκατεύθυνση, τότε εκτελεί κάποιες ενέργειες. </span><span id="Maze_ifelseTooltip">Αν υπάρχει μονοπάτι προς τη συγκεκριμένη \\nκατεύθυνση, τότε εκτελεί το πρώτο μπλοκ \\nτων δράσεων. Διαφορετικά, εκτελεί το δεύτερο \\nμπλοκ των δράσεων. </span><span id="Maze_whileTooltip">Επαναλαμβάνει τις περικλειόμενες ενέργειες μέχρι \\nνα φθάσει στο τέρμα. </span><span id="Maze_capacity0">Σου απομένουν %0 μπλοκ.</span><span id="Maze_capacity1">Σου απομένουν %1 μπλοκ.</span><span id="Maze_capacity2">Σου απομένουν %2 μπλοκ.</span><span id="Maze_nextLevel">Συγχαρητήρια! Θα προχωρήσεις στο επίπεδο %1;</span><span id="Maze_finalLevel">Συγχαρητήρια! Έλυσες το τελευταίο επίπεδο.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">Blockly (Μπλόκλι)</a> : Λαβύρινθος</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="Δες τον κώδικα JavaScript που δημιουργήθηκε."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="Αποθηκεύει και συνδέει σε μπλοκ."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="Κάνει τον χαρακτήρα να κάνει αυτό που λένε τα \\nμπλοκ. "><img src="../../media/1x1.gif" class="run icon21"> Εκτέλεση Προγράμματος</button><button id="resetButton" class="primary" style="display: none" title="Βάζει το ανθρωπάκι πίσω στην αρχή του λαβυρίνθου."><img src="../../media/1x1.gif" class="stop icon21"> Επανεκκίνηση</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><svg version="1.1" height="1px" width="1px"><text id="arrowTest" style="font-family: sans-serif; font-size: 11pt;">⟲⟳</text></svg><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Στοίβαξε δύο μπλοκ «προχώρησε» για να φτάσω στο τέρμα.</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Σε αυτό το επίπεδο, πρέπει να στοιβάξεις όλα τα μπλοκ στον λευκό χώρο εργασίας.<iframe id="iframeOneTopBlock" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>Εκτέλεσε το πρόγραμμά σου και δες τι συμβαίνει.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>Το πρόγραμμα σου δεν έλυσε τον λαβύρινθο. Πάτησε «Επαναφορά» και δοκίμασε άλλη μια φορά.</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Προσπάθησε να φτάσεις στο τέλος του μονοπατιού χρησιμοποιώντας μόνο δύο μπλοκ. Χρησιμοποίησε το μπλοκ «επανάλαβε» για να εκτελέσεις το μπλοκ που θέλεις περισσότερες φορές.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Έχουν εξαντληθεί όλα τα μπλοκ για αυτό το επίπεδο.  Για να δημιουργήσεις ένα νέο μπλοκ, θα πρέπει πρώτα να διαγράψεις ένα υπάρχον μπλοκ.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Μπορείς να στριμώξεις περισσότερο από ένα μπλοκ μέσα σε μπλοκ «επανάληψη».</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>Επίλεξε τον αγαπημένο σου χαρακτήρα από αυτό το μενού.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>Μια συνθήκη «εάν» θα εκτελέσει κάτι μόνο αν είναι αληθής. Προσπάθησε να στρίψεις αριστερά, εάν υπάρχει μονοπάτι προς τα αριστερά.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">Κάνε κλικ στο %1 μέσα στο μπλοκ «εάν» για να αλλάξεις την κατάστασή του.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>Τα μπλοκ «εάν...αλλιώς» θα κάνουν είτε το ένα είτε το άλλο.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>Μπορείς να επιλύσεις αυτόν τον περίπλοκο λαβύρινθο; Προσπάθησε να ακολουθήσεις τον αριστερό τοίχο. Μόνο για προχωρημένους προγραμματιστές!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
