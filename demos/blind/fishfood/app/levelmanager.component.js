/**
 * Blockly Demos: BlindBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Component that details how the BlindBlockly app is rendered on the page.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var app = app || {};
app.gameManager = {};
app.gameManager.level = 1;
app.gameManager.levelInstructions = {};
app.gameManager.levelHints = {};
app.gameManager.expectedBassLines = {};
app.gameManager.levelInstructions[1] = [`If you are using a screen reader, make sure to set your punctuation
    setting to 'all'.`,
    `Let us start by navigating to the toolbox and copying the 'play random note'
    block onto the workspace. Both the Toolbox and the Workspace are trees.
    Once you have tabbed to the tree, use your arrow keys to navigate. A tree is
     a fancy way of saying a list of lists: much like a table of contents.`,
    `If you are at item A in the tree and you hit the up or down arrows, you will
    move up and down the list A is in. If you hit the left arrow, you will be taken
    back to the parent list item of A. Hitting the right arrow will take you to the
    first child list item of A.`];
app.gameManager.levelInstructions[2] = [`If you are using a screen reader, make sure to set your punctuation
    setting to 'all'.`,
    `Play the G3 note.`,
    `Do not forget how to navigate a tree: If you are at item A in the tree and you hit the up or down arrows, you will
    move up and down the list A is in. If you hit the left arrow, you will be taken
    back to the parent list item of A. Hitting the right arrow will take you to the
    first child list item of A.`];
app.gameManager.levelInstructions[3] = [`If you are using a screen reader, make sure to set your punctuation
    setting to 'all'.`,
    `Play 2 G3 notes. Make sure the blocks are connected to each other.`,
    `Do not forget how to navigate a tree: If you are at item A in the tree and you hit the up or down arrows, you will
    move up and down the list A is in. If you hit the left arrow, you will be taken
    back to the parent list item of A. Hitting the right arrow will take you to the
    first child list item of A.`];
app.gameManager.levelHints[3] = [`Each list in the workspace is a set of connected blocks. So if you have two blocks,
    each item number 1 of its own list, then those blocks are not connected.
    If you have two blocks, one item 1 of a list and one item 2 of a list, then they are connected.`,
    `Try to make use of the 'copy to Blockly clipboard' and 'paste above'/'paste below' options in the block menus.`];
app.gameManager.expectedBassLines[1] = [
      [[45], 1],
    ];
app.gameManager.expectedBassLines[2] = [
      [[43], 1],
    ];
app.gameManager.expectedBassLines[3] = [
      [[43], 1],
      [[43], 1]
    ];
app.gameManager.expectedBlockType = [undefined, 'music_play_random_note', 'music_play_note', 'music_play_note'];
app.gameManager.levelToolboxes=['', 'ToolboxXml.xml', 'level1_ToolboxXml.xml', 'level1_ToolboxXml.xml'];
app.gameManager.levelWorkspaces=[undefined, new Blockly.Workspace(), new Blockly.Workspace(), new Blockly.Workspace()];
app.gameManager.maxLevelAllowed=1;

app.gameManager.validateLevel = function(){
  var correct = true;
  var level = app.gameManager.level;
  var expectedBassLine = new MusicLine();
  var topBlock = app.workspace.topBlocks_[0];
  var errorMessage = 'Not quite! Try again!';

  //we should only report the earliest problem with their code
  var errorMessageChanged = false;

  expectedBassLine.setFromChordsAndDurations(
    app.gameManager.expectedBassLines[level]);
  correct = correct && musicPlayer.doesBassLineEqual(expectedBassLine);
  if (!correct && !errorMessageChanged){
    errorMessage = 'Not quite! Are you playing the right note?'
    errorMessageChanged = true;
  }

  if (level != 3) {
    correct = correct && app.workspace.topBlocks_.length == 1;
  } else {
    //if there are two topblocks that aren't connected, the error message should be the error message on line 112
    correct = correct && (app.workspace.topBlocks_.length == 1 || app.workspace.topBlocks_.length == 2);
  }
  if (!correct && !errorMessageChanged){
    errorMessage = 'Not quite! Are you playing the right number of blocks?'
    errorMessageChanged = true;
  }

  correct = correct && topBlock && topBlock.type == app.gameManager.expectedBlockType[level];
  if (!correct && !errorMessageChanged){
    errorMessage = 'Not quite! Are you playing the right block?'
    errorMessageChanged = true;
  }

  if (level == 3){
    var connection = topBlock.nextConnection.targetConnection;
    correct = correct && connection && connection.sourceBlock_ && connection.sourceBlock_.type == app.gameManager.expectedBlockType[level];
    if (!correct && !errorMessageChanged){
      errorMessage = 'Not quite! Are your blocks connected?'
      errorMessageChanged = true;
    }
  }
  if (correct){
    alert('Good job! You completed the level!');
    app.gameManager.maxLevelAllowed = Math.min(app.gameManager.maxLevelAllowed + 1, 3);
  } else {
    alert(errorMessage);
  }
}

app.workspace = app.gameManager.levelWorkspaces[app.gameManager.level];

app.LevelManagerView = ng.core
  .Component({
    selector: 'levelview',
    template: `
    <h2>Instructions</h2>
    <p *ngFor='#para of setInstructions()'>{{para}}</p>
    <h2 *ngIf='getHints()'>Hints</h2>
    <p *ngFor='#para of getHints()'>{{para}}</p>
    <button #level1 aria-pressed='true' (click)='setLevel(1, level1, [level2,level3])' disabled={{disableButton(1)}}>Level 1</button>
    <button #level2 aria-pressed='false' (click)='setLevel(2, level2, [level1,level3])' disabled={{disableButton(2)}}>Level 2</button>
    <button #level3 aria-pressed='false' (click)='setLevel(3, level3, [level2,level1])' disabled={{disableButton(3)}}>Level 3</button>
    <app></app>
    `,
    directives: [app.AppView],
  })
  .Class({
    constructor: function() {
      this.level = app.gameManager.level;
    },
    getHints: function(){
      return app.gameManager.levelHints[app.level];
    },
    disableButton: function(num) {
      if (num > app.gameManager.maxLevelAllowed) {
        return true;
      }
    },
    setLevel: function(num, rightButton, wrongButtons){
      app.gameManager.level = num;
      //TODO(madeeha): make it so that workspaces switch across the app.
      //app.workspace = app.gameManager.levelWorkspaces[app.level];
      //app.workspace.clear();
      console.log(app.workspace.id);
      rightButton.setAttribute('aria-pressed','true');
      for (var i=0; i<wrongButtons.length; i++) {
        wrongButtons[i].setAttribute('aria-pressed','false');
      }
      app.workspace.clear();
    },
    setInstructions: function() {
      if (app.gameManager.level && app.gameManager.levelInstructions) {
        return app.gameManager.levelInstructions[app.gameManager.level];
      }
    },
    log: function(obj) {
      //TODO(madeeha): delete after development is finished
      console.log(obj);
    },
  });
