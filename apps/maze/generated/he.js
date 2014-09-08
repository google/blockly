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

if (typeof mazepage == 'undefined') { var mazepage = {}; }


mazepage.messages = function(opt_data, opt_ignored, opt_ijData) {
  return apps.messages(null, null, opt_ijData) + '<div style="display: none"><span id="Maze_moveForward">נוע קדימה</span><span id="Maze_turnLeft">פנה שמאלה</span><span id="Maze_turnRight">פנה ימינה</span><span id="Maze_doCode">תעשה</span><span id="Maze_elseCode">אחרת</span><span id="Maze_helpIfElse">אם-אז קטעי קוד יעשו אחד משני דברים</span><span id="Maze_pathAhead">נתיב אם בהמשך</span><span id="Maze_pathLeft">נתיב אם משמאל</span><span id="Maze_pathRight">נתיב אם מימין</span><span id="Maze_repeatUntil">המשך עד ש</span><span id="Maze_moveForwardTooltip">הזז את השחקן קדימה מרווח אחד</span><span id="Maze_turnTooltip">סובב את השחקן שמאלה או ימינה ב-90 מעלות</span><span id="Maze_ifTooltip">אם יש אפשרות תנועה בכיוון הנוכחי, עשה מספר פעולות</span><span id="Maze_ifelseTooltip">אם יש אפשרות תנועה בכיוון הנוכחי אזי עשה את מקטע הפעולות הראשון. אחרת, עשה את מקטע הפעולות השני.</span><span id="Maze_whileTooltip">חזור על הפעולות האלה עד הגעה לנקודת הסיום</span><span id="Maze_capacity0">נותרו לך %0 פעולות</span><span id="Maze_capacity1">נותרה לך פעולת קוד אחת</span><span id="Maze_capacity2">נותרו לך שני קטעי קוד</span><span id="Maze_nextLevel">ברכותיי! האם את/ה מוכנ/ה להמשיך לשלב %1?</span><span id="Maze_finalLevel">כל הכבוד! הצלחת לפתור את השלב האחרון.</span></div>';
};


mazepage.start = function(opt_data, opt_ignored, opt_ijData) {
  var output = mazepage.messages(null, null, opt_ijData) + '<table width="100%"><tr><td><h1><span id="title"><a href="../index.html?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '">בלוקלי</a> : מבוך</span> &nbsp; ';
  var iLimit163 = opt_ijData.maxLevel + 1;
  for (var i163 = 1; i163 < iLimit163; i163++) {
    output += ' ' + ((i163 == opt_ijData.level) ? '<span class="tab" id="selected">' + soy.$$escapeHtml(i163) + '</span>' : (i163 < opt_ijData.level) ? '<a class="tab previous" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>' : '<a class="tab" href="?lang=' + soy.$$escapeHtml(opt_ijData.lang) + '&level=' + soy.$$escapeHtml(i163) + '&skin=' + soy.$$escapeHtml(opt_ijData.skin) + '">' + soy.$$escapeHtml(i163) + '</a>');
  }
  output += '</h1></td><td class="farSide"><select id="languageMenu"></select> &nbsp; <button id="pegmanButton"><img src="../../media/1x1.gif"><span>&#x25BE;</span></button></td></tr></table><div id="visualization"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" id="svgMaze" width="400px" height="400px"><g id="look"><path d="M 0,-15 a 15 15 0 0 1 15 15" /><path d="M 0,-35 a 35 35 0 0 1 35 35" /><path d="M 0,-55 a 55 55 0 0 1 55 55" /></g></svg><div id="capacityBubble"><div id="capacity"></div></div></div><table width="400"><tr><td style="width: 190px; text-align: center; vertical-align: top;"><button id="codeButton" class="notext" title="הצגת קוד ה־Javascript שנוצר."><img src="../../media/1x1.gif" class="code icon21"></button><button id="linkButton" class="notext" title="שמירה וקישור לקטעי קוד."><img src="../../media/1x1.gif" class="link icon21"></button></td><td><button id="runButton" class="primary" title="גורם לשחקן לעשות את מה שקטע הקוד אומר"><img src="../../media/1x1.gif" class="run icon21"> הרץ תכנית</button><button id="resetButton" class="primary" style="display: none" title="שים את השחקן בחזרה בנקודת ההתחלה של המבוך"><img src="../../media/1x1.gif" class="stop icon21"> איפוס</button></td></tr></table><script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript" src="../../javascript_compressed.js"><\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script>' + mazepage.toolbox(null, null, opt_ijData) + '<div id="blockly"></div><div id="pegmanMenu"></div>' + apps.dialog(null, null, opt_ijData) + apps.codeDialog(null, null, opt_ijData) + apps.storageDialog(null, null, opt_ijData) + '<div id="dialogDone" class="dialogHiddenContent"><div id="dialogDoneText" style="font-size: large; margin: 1em;"></div><img src="../../media/1x1.gif" id="pegSpin"><div id="dialogDoneButtons" class="farSide" style="padding: 1ex 3ex 0"></div></div><div id="dialogHelpStack" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>שים כמה קטעי קוד \'נוע קדימה\' כדי לעזור להגיע אל המטרה</td><td valign="top"><img src="help_stack.png" class="mirrorImg" height=63 width=136></td></tr></table></div><div id="dialogHelpOneTopBlock" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>בשלב זה, נדרש ממך לעשות שימוש בכל קטעי הקוד הזמינים<iframe id="iframeOneTopBlock" style="height: 80px; width: 100%; border: none;" src=""></iframe></td></tr></table></div><div id="dialogHelpRun" class="dialogHiddenContent"><table><tr><td>עליך להריץ את התוכנית בכדי לראות מה קורה</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpReset" class="dialogHiddenContent"><table><tr><td>התוכנית שלך לא פתרה את המבוך. לחץ על \'אפס\' בכדי לנסות שנית</td><td rowspan=2><img src="help.png"></td></tr><tr><td><div><img src="help_run.png" class="mirrorImg" height=27 width=141></div></td></tr></table></div><div id="dialogHelpRepeat" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>השתמש בשני קטעי קוד בלבד בכדי להגיע לקצה הנתיב הזה. השתמש ב-\'חזור\' בכדי להריץ קטע קוד יותר מפעם אחת.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpCapacity" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>עשית שימוש בכל קטעי הקוד הזמינים לשלב זה. בכדי ליצור קטע קוד חדש, אתה צריך קודם לכן למחוק קטע קוד קיים.</td></tr></table></div><div id="dialogHelpRepeatMany" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>אתה יכול להשתמש ביותר מקטע קוד אחד בתוך קטע קוד \'חזור\'.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpSkins" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>בחר את השחקן המועדף עליך מתוך תפריט זה.</td><td><img src="help_up.png"></td></tr></table></div><div id="dialogHelpIf" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td>קטע קוד \'אם\' יבצע פעולה רק אם התנאי הוא נכון. נסה לפנות שמאלה אם ישנו נתיב פנוי לכיוון צד שמאל.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpMenu" class="dialogHiddenContent"><table><tr><td><img src="help_up.png"></td><td id="helpMenuText">לחץ על %1 בתוך בלוק הקוד \'אם\' בכדי לשנות את התנאי.</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpIfElse" class="dialogHiddenContent"><table><tr><td><img src="help_down.png"></td><td>אם-אז קטעי קוד יעשו אחד משני דברים</td><td><img src="help.png"></td></tr></table></div><div id="dialogHelpWallFollow" class="dialogHiddenContent"><table><tr><td><img src="help.png"></td><td>&nbsp;</td><td>האם תוכל לפתור את המבוך המסובך הזה? נסה לעקוב אחרי הקיר השמאלי. מיועד לתוכניתנים מנוסים בלבד!' + apps.ok(null, null, opt_ijData) + '</td></tr></table></div>';
  return output;
};


mazepage.toolbox = function(opt_data, opt_ignored, opt_ijData) {
  return '<xml id="toolbox" style="display: none;"><block type="maze_moveForward"></block><block type="maze_turn"><field name="DIR">turnLeft</field></block><block type="maze_turn"><field name="DIR">turnRight</field></block>' + ((opt_ijData.level > 2) ? '<block type="maze_forever"></block>' + ((opt_ijData.level == 6) ? '<block type="maze_if"><field name="DIR">isPathLeft</field></block>' : (opt_ijData.level > 6) ? '<block type="maze_if"></block>' + ((opt_ijData.level > 8) ? '<block type="maze_ifElse"></block>' : '') : '') : '') + '</xml>';
};


mazepage.readonly = function(opt_data, opt_ignored, opt_ijData) {
  return mazepage.messages(null, null, opt_ijData) + '<script type="text/javascript" src="../../blockly_compressed.js"><\/script><script type="text/javascript">Blockly.JavaScript = {};<\/script><script type="text/javascript" src="../../' + soy.$$escapeHtml(opt_ijData.langSrc) + '"><\/script><script type="text/javascript" src="blocks.js"><\/script><div id="blockly"></div>';
};
