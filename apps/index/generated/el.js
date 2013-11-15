// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored) {
  return '<div style="display: none"><span id="subtitle">Ένα οπτικό περιβάλλον προγραμματισμού</span><span id="blocklyMessage">Blockly (Μπλόκλι)</span><span id="codeTooltip">Δες τον κώδικα JavaScript που δημιουργήθηκε.</span><span id="linkTooltip">Αποθήκευση και σύνδεση στο μπλοκ.</span><span id="runTooltip">Εκτέλεσε το πρόγραμμα που ορίζεται από τα μπλοκ \\nστο χώρο εργασίας. </span><span id="runProgram">Εκτέλεση Προγράμματος</span><span id="resetProgram">Επανεκκίνηση</span><span id="dialogOk">ΟΚ</span><span id="dialogCancel">Ακύρωση</span><span id="catLogic">Λογική</span><span id="catLoops">Επαναλήψεις</span><span id="catMath">Μαθηματικά</span><span id="catText">Κείμενο</span><span id="catLists">Λίστες</span><span id="catColour">Χρώμα</span><span id="catVariables">Μεταβλητές</span><span id="catProcedures">Διαδικασίες</span><span id="httpRequestError">Υπήρξε πρόβλημα με το αίτημα.</span><span id="linkAlert">Μοιράσου τα blocks σου με αυτό το σύνδεσμο:\n\n%1</span><span id="hashError">Λυπάμαι, το «%1» δεν αντιστοιχεί σε κανένα αποθηκευμένο πρόγραμμα.</span><span id="xmlError">Δεν μπορώ να φορτώσω το αποθηκευμένο αρχείο σου.  Μήπως δημιουργήθηκε από μία παλιότερη έκδοση του Μπλόκλι.</span><span id="listVariable">Λίστα</span><span id="textVariable">κείμενο</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">ΟΚ</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored) {
  return apps.messages(null) + '<div style="display: none"><span id="indexTitle">Εφαρμογές Blockly</ span><span id="indexFooter">To Blockly είναι ανοικτού κώδικα και δωρεάν. Για να συνεισφέρετε σε κώδικα ή μεταφράσεις στο Blockly, ή για να χρησιμοποιήσετε το Blockly στη δική σας εφαρμογή, επισκεφτείτε το %1.<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored) {
  return appsIndex.messages(null) + '<table><tr><td><h1><span id="title">Εφαρμογές Blockly</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>Το Blockly είναι ένα γραφικό περιβάλλον προγραμματισμού. Παρακάτω είναι μερικά δείγματα εφαρμογών που χρησιμοποιούν το Blockly.</td></tr></table><table><tr><td><a href="puzzle/index.html"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html">Παζλ</a></div><div>Μάθετε να χρησιμοποιείτε το περιβάλλον του Blockly.</div></td></tr><tr><td><a href="maze/index.html"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html">Λαβύρινθος</a></div><div>Χρησιμοποιήστε το Blockly για να λύσετε έναν λαβύρινθο.</div></td></tr><tr><td><a href="turtle/index.html"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html">Γραφικά με τη Χελώνα</a></div><div>Χρησιμοποιήστε το Blockly για να σχεδιάσετε.</div></td></tr><tr><td><a href="graph/index.html"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html">Η Γραφική Απεικόνιση Αριθμομηχανή</a></div><div>Σχεδιάστε γραφικές παραστάσεις με το Blockly.</div></td></tr><tr><td><a href="code/index.html"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html">Κώδικας</a></div><div>Εξαγάγετε ένα πρόγραμμα γραμμένο σε Blockly στη γλώσσα Python, JavaScript ή XML.</div></td></tr><tr><td><a href="plane/index.html"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html">Υπολογισμός θέσεων σε Αεροπλάνο</a></div><div>Επίλυση ενός μαθηματικού προβλήματος με ένα ή δύο μεταβλητές.</div></td></tr><tr><td><a href="blockfactory/index.html"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">Κατασκευή Μπλόκ</a></div><div>Δημιουργία προσαρμοσμένων μπλοκ χρησιμοποιώντας το Blockly.</div></td></tr></table><p><span id="footer_prefix"></span><a href="http://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
