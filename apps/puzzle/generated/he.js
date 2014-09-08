// This file was automatically generated from common.soy.
// Please don't edit this file by hand.

if (typeof apps == 'undefined') { var apps = {}; }


apps.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="subtitle">סביבת תיכנות חזותי</span><span id="blocklyMessage">בלוקלי</span><span id="codeTooltip">הצגת קוד ה־Javascript שנוצר.</span><span id="linkTooltip">שמירה וקישור לקטעי קוד.</span><span id="runTooltip">הרצת התכנית שהוגדרה על ידי קטעי הקוד שבמרחב העבודה.</span><span id="runProgram">הרץ תכנית</span><span id="resetProgram">איפוס</span><span id="dialogOk">אישור</span><span id="dialogCancel">ביטול</span><span id="catLogic">לוגיקה</span><span id="catLoops">לולאות</span><span id="catMath">מתמטיקה</span><span id="catText">טקסט</span><span id="catLists">רשימות</span><span id="catColour">צבע</span><span id="catVariables">משתנים</span><span id="catProcedures">פונקציות</span><span id="httpRequestError">הבקשה נכשלה.</span><span id="linkAlert">ניתן לשתף את קטעי הקוד שלך באמצעות קישור זה:\n\n%1</span><span id="hashError">לצערנו, \'%1\' איננו מתאים לאף אחת מהתוכניות השמורות</span><span id="xmlError">נסיון הטעינה של הקובץ השמור שלך נכשל. האם ייתכן שהוא נוצר בגרסא שונה של בלוקלי?</span><span id="listVariable">רשימה</span><span id="textVariable">טקסט</span></div>';
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

if (typeof puzzlepage == 'undefined') { var puzzlepage = {}; }


puzzlepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return '<div style="display: none"><span id="Puzzle_country1">אוסטרליה</span><span id="Puzzle_country1Flag">flag_au.png</span><span id="Puzzle_country1FlagHeight">50</span><span id="Puzzle_country1FlagWidth">100</span><span id="Puzzle_country1Language">אנגלית</span><span id="Puzzle_country1City1">מלבורן</span><span id="Puzzle_country1City2">סידני</span><span id="Puzzle_country1HelpUrl">https://he.wikipedia.org/wiki/אוסטרליה</span><span id="Puzzle_country2">גרמניה</span><span id="Puzzle_country2Flag">flag_de.png</span><span id="Puzzle_country2FlagHeight">60</span><span id="Puzzle_country2FlagWidth">100</span><span id="Puzzle_country2Language">גרמנית</span><span id="Puzzle_country2City1">ברלין</span><span id="Puzzle_country2City2">מינכן</span><span id="Puzzle_country2HelpUrl">https://he.wikipedia.org/wiki/גרמניה</span><span id="Puzzle_country3">סין</span><span id="Puzzle_country3Flag">flag_cn.png</span><span id="Puzzle_country3FlagHeight">66</span><span id="Puzzle_country3FlagWidth">100</span><span id="Puzzle_country3Language">סינית</span><span id="Puzzle_country3City1">בייג׳ינג</span><span id="Puzzle_country3City2">שאנגחאי</span><span id="Puzzle_country3HelpUrl">https://he.wikipedia.org/wiki/הרפובליקה_העממית_של_סין</span><span id="Puzzle_country4">ברזיל</span><span id="Puzzle_country4Flag">flag_br.png</span><span id="Puzzle_country4FlagHeight">70</span><span id="Puzzle_country4FlagWidth">100</span><span id="Puzzle_country4Language">פורטוגלית</span><span id="Puzzle_country4City1">ריו דה ז\'ניירו</span><span id="Puzzle_country4City2">סאו פאולו</span><span id="Puzzle_country4HelpUrl">https://he.wikipedia.org/wiki/ברזיל</span><span id="Puzzle_flag">דגל:</span><span id="Puzzle_language">שפה:</span><span id="Puzzle_languageChoose">בחירה…</span><span id="Puzzle_cities">ערים:</span><span id="Puzzle_error0">מושלם!\nכל %1 קטעי הקוד נכונים.</span><span id="Puzzle_error1">כמעט! קטע קוד אחד לא נכון.</span><span id="Puzzle_error2">%1 קטעי קוד אינם נכונים.</span><span id="Puzzle_tryAgain">קטע הקוד המודגש אינו נכון.\nנסו שוב.</span></div>';
};


puzzlepage.start = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<table id="header" width="100%"><tr><td valign="bottom"><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">בלוקלי</a> : פאזל</span></h1></td><td class="farSide"><select id="languageMenu"></select>&nbsp; &nbsp;<button id="helpButton">עזרה</button>&nbsp; &nbsp;<button id="checkButton" class="primary">בדוק את התשובות</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>' + apps.dialog(null, null, opt_ijData) + '<div id="help" class="dialogHiddenContent"><div style="padding-bottom: 0.7ex">בשביל כל מדינה (בירוק), צרפו את הדגל, בחרו את השפה, ועשו ערימה של הערים שלה.</div><iframe style="height: 200px; width: 100%; border: none;" src="readonly.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&xml=%3Cblock+type%3D%22country%22+x%3D%225%22+y%3D%225%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3Ctitle+name%3D%22LANG%22%3E1%3C%2Ftitle%3E%3Cvalue+name%3D%22FLAG%22%3E%3Cblock+type%3D%22flag%22%3E%3Cmutation+country%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fvalue%3E%3Cstatement+name%3D%22CITIES%22%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%222%22%3E%3C%2Fmutation%3E%3Cnext%3E%3Cblock+type%3D%22city%22%3E%3Cmutation+country%3D%221%22+city%3D%221%22%3E%3C%2Fmutation%3E%3C%2Fblock%3E%3C%2Fnext%3E%3C%2Fblock%3E%3C%2Fstatement%3E%3C%2Fblock%3E"></iframe>' + apps.ok(null, null, opt_ijData) + '</div><div id="answers" class="dialogHiddenContent"><div id="answerMessage"></div><div id="graph"><div id="graphValue"></div></div>' + apps.ok(null, null, opt_ijData) + '</div>';
};


puzzlepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return puzzlepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
