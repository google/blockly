// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">סביבת תיכנות חזותי</span><span id="blocklyMessage">בלוקלי</span><span id="codeTooltip">הצגת קוד הג\'אווה סקריפט שנוצר. </span><span id="linkTooltip">שמירה וקישור לקטעי קוד.</span><span id="runTooltip">הרצת התכנית שהוגדרה על ידי קטעי הקוד שבמרחב העבודה.</span><span id="runProgram">הרץ תכנית</span><span id="resetProgram">איפוס</span><span id="dialogOk">אישור</span><span id="dialogCancel">ביטול</span><span id="catLogic">לוגיקה</span><span id="catLoops">לולאות</span><span id="catMath">מתמטיקה</span><span id="catText">טקסט</span><span id="catLists">רשימות</span><span id="catColour">צבע</span><span id="catVariables">משתנים</span><span id="catProcedures">פרוצדורות</span><span id="httpRequestError">הבקשה נכשלה.</span><span id="linkAlert">ניתן לשתף את קטעי הקוד שלך באמצעות קישור זה:\n\n%1</span><span id="hashError">לצערנו, \'%1\' איננו מתאים לאף אחת מהתוכניות השמורות</span><span id="xmlError">נסיון הטעינה של הקובץ השמור שלך נכשל. האם ייתכן שהוא נוצר בגרסא שונה של בלוקלי?</span><span id="listVariable">רשימה</span><span id="textVariable">טקסט</span></div>';
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
  return '<div class="farSide" style="padding: 1ex 3ex 0"><button class="secondary" onclick="BlocklyApps.hideDialog(true)">אישור</button></div>';
};

;
// This file was automatically generated from template.soy.
// Please don't edit this file by hand.

if (typeof appsIndex == 'undefined') { var appsIndex = {}; }


appsIndex.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="indexTitle">אפליקציות בלוקלי</ span><span id="indexFooter">בלוקלי הוא חינם ומבוסס קוד פתוח. בכדי לתרום קוד או תרגום לבלוקלי, או כדי להשתמש בבלוקלי באפליקציה שלך, בקר ב- %1<span></div>';
};


appsIndex.start = function(opt_data, opt_ignored, opt_ijData) {
  return appsIndex.messages(null, null, opt_ijData) + '<table><tr><td><h1><span id="title">אפליקציות בלוקלי</span></h1></td><td class="farSide"><select id="languageMenu"></select></td></tr><tr><td>בלוקלי היא סביבת פיתוח גרפית. בהמשך ישנן מספר דוגמאות לאפליקציות אשר משתמשות בבלוקלי.</td></tr></table><table><tr><td><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/puzzle.png" height=80 width=100></a></td><td><div><a href="puzzle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">פאזל</a></div><div>למד להשתמש בממשק המשתמש של בלוקלי</div></td></tr><tr><td><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/maze.png" height=80 width=100></a></td><td><div><a href="maze/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">מבוך</a></div><div>השתמש בבלוקלי בכדי לפתור מבוך</div></td></tr><tr><td><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/turtle.png" height=80 width=100></a></td><td><div><a href="turtle/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">גרפיקת צב</a></div><div>השתמש בבלוקלי כדי לצייר</div></td></tr><tr><td><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/graph.png" height=80 width=100></a></td><td><div><a href="graph/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">מחשבון גרפים</a></div><div>הצג פונקציות עם בלוקלי</div></td></tr><tr><td><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/code.png" height=80 width=100></a></td><td><div><a href="code/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">קוד</a></div><div>ייצא תוכנית בלוקלי לג\'אווה סקריפט, פייתון או XML.</div></td></tr><tr><td><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/plane.png" height=80 width=100></a></td><td><div><a href="plane/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">מחשבון מושב במטוס</a></div><div>פתור בעייה חשבונית עם משתנה אחד או שניים</div></td></tr><tr><td><a href="blockfactory/index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '"><img src="index/blockfactory.png" height=80 width=100></a></td><td><div><a href="blockfactory/index.html">מפעל קטע קוד</a></div><div>בנה קטע קוד מותאם אישית על ידי שימוש בבלוקלי</div></td></tr></table><p><span id="footer_prefix"></span><a href="https://blockly.googlecode.com/">blockly.googlecode.com</a><span id="footer_suffix"></span>';
};
