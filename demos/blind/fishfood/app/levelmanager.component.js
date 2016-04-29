/**
 * Blockly Demos: AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Component that details how the AccessibleBlockly app is rendered on the page.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var blocklyApp = blocklyApp || {};
blocklyApp.gameManager = {};
blocklyApp.gameManager.level = 1;
blocklyApp.gameManager.levelInstructions = {};
blocklyApp.gameManager.levelHints = {};
blocklyApp.gameManager.expectedBassLines = {};
blocklyApp.gameManager.levelInstructions[1] = [
    `Let us start by navigating to the toolbox and copying the 'play random note'
    block onto the workspace.`];
blocklyApp.gameManager.levelInstructions[2] = [
    `Play the G3 note.`];
blocklyApp.gameManager.levelInstructions[3] = [
    `Play 2 G3 notes. Make sure the blocks are connected to each other.`
    ];
blocklyApp.gameManager.levelHints[3] = [`Each list in the workspace is a set of connected blocks. So if you have two blocks,
    each item number 1 of its own list, then those blocks are not connected.
    If you have two blocks, one item 1 of a list and one item 2 of a list, then they are connected.`,
    `Try to make use of the 'copy to Blockly clipboard' and 'paste above'/'paste below' options in the block menus.`];
blocklyApp.gameManager.expectedBassLines[1] = [
      [[45], 1]
    ];
blocklyApp.gameManager.expectedBassLines[2] = [
      [[43], 1]
    ];
blocklyApp.gameManager.expectedBassLines[3] = [
      [[43], 1],
      [[43], 1]
    ];
blocklyApp.gameManager.expectedBlockType = [undefined, 'music_play_random_note', 'music_play_note', 'music_play_note'];
blocklyApp.gameManager.levelToolboxes=['', 'level1_ToolboxXml.xml', 'level1_ToolboxXml.xml', 'level1_ToolboxXml.xml'];
blocklyApp.gameManager.levelWorkspaces=[undefined, new Blockly.Workspace(), new Blockly.Workspace(), new Blockly.Workspace()];
blocklyApp.gameManager.maxLevelAllowed=1;

blocklyApp.gameManager.validateLevel = function(){
  var correct = true;
  var level = blocklyApp.gameManager.level;
  var expectedBassLine = new MusicLine();
  var topBlock = blocklyApp.workspace.topBlocks_[0];
  var errorMessage = 'Not quite! Try again!';

  //we should only report the earliest problem with their code
  var errorMessageChanged = false;

  expectedBassLine.setFromChordsAndDurations(
    blocklyApp.gameManager.expectedBassLines[level]);
  correct = correct && musicPlayer.doesBassLineEqual(expectedBassLine);
  if (!correct && !errorMessageChanged){
    errorMessage = 'Not quite! Are you playing the right note?'
    errorMessageChanged = true;
  }

  if (level != 3) {
    correct = correct && blocklyApp.workspace.topBlocks_.length == 1;
  } else {
    //if there are two topblocks that aren't connected, the error message should be the error message on line 112
    correct = correct && (blocklyApp.workspace.topBlocks_.length == 1 || blocklyApp.workspace.topBlocks_.length == 2);
  }
  if (!correct && !errorMessageChanged){
    errorMessage = 'Not quite! Are you playing the right number of blocks?'
    errorMessageChanged = true;
  }

  correct = correct && topBlock && topBlock.type == blocklyApp.gameManager.expectedBlockType[level];
  if (!correct && !errorMessageChanged){
    errorMessage = 'Not quite! Are you playing the right block?'
    errorMessageChanged = true;
  }

  if (level == 3){
    var connection = topBlock.nextConnection.targetConnection;
    correct = correct && connection && connection.sourceBlock_ && connection.sourceBlock_.type == blocklyApp.gameManager.expectedBlockType[level];
    if (!correct && !errorMessageChanged){
      errorMessage = 'Not quite! Are your blocks connected?'
      errorMessageChanged = true;
    }
  }
  if (correct){
    alert('Good job! You completed the level!');
    blocklyApp.gameManager.maxLevelAllowed = Math.min(blocklyApp.gameManager.maxLevelAllowed + 1, 3);
  } else {
    alert(errorMessage);
  }
}

blocklyApp.workspace = blocklyApp.gameManager.levelWorkspaces[blocklyApp.gameManager.level];

blocklyApp.LevelManagerView = ng.core
  .Component({
    selector: 'levelview',
    template: `
    <h2>Page Layout</h2>
    <p>Welcome to the Blockly Music Game! On this page is a music puzzle game
    you will complete using AccessibleBlockly. There are three levels to this
    game.</p>
    <p>This page has several instruction sections followed by the game area.
    All sections have a level 2 heading associated with them. The
    ‘Screen Reader Settings and Compatilibity’ section (directly after this
      section) describes the best screen reader/browser combinations to use for
    AccessibleBlockly and what settings to use. The ‘Navigation’ section
    describes how to use your keyboard to navigate in the AccessibleBlockly game
     area. The ‘Level Goal’ section tells you the objective of the level you are
      on. You are currently on level {{level}}. The ‘Hints’ section will be available if
       the level has any hints associated with it. Any extra tips or reminders
       will be in the ‘Hints’ section.</p>
    <p>Following this are three buttons: Level 1, Level 2, and Level 3.
    When you begin the game, the buttons for Level 2 and Level 3 will be
    disabled, as you will begin automatically on Level 1. As you complete each
    level, the next level’s button will be enabled for you.</p>
    <p>Next is the AccessibleBlockly game area. This area is two columns with
    the ‘Toolbox’ section on the left and the ‘Workspace’ section on the right.
    The ‘Toolbox’ section has a collection of blocks of code. These blocks can
    be moved to the workspace and put together to make code! Putting the right
    blocks together in the workspace will help you complete the level. The
    workspace area has two buttons: ‘Run Code’ and ‘Clear Workspace’. When you
    think you’ve completed the level, hit the ‘Run Code’ button. When you’ve
    switched to a new level, make sure to use the ‘Clear Workspace’ button to
    remove all blocks from your workspace.</p>
    <h2>Screen Reader Settings and Compatibility</h2>
    <p>AccessibleBlockly is best experienced using Firefox with NVDA or Jaws.
    Turn the punctuation setting to ‘all’ and ensure that you are in focus mode
    while navigating the game area.</p>
    <h2>Navigation</h2>
    <p>The game area is split into two sections: The Toolbox and the Workspace.
    Use the tab key to navigate to the Toolbox. Tab and Shift+Tab are also the
    best ways to navigate between the Toolbox, ‘Run Code’ button, ‘Clear
    Workspace’ button, and the Workspace.</p>
    <p>The Toolbox and the Workspace are both nested lists, much like a table of
     contents. The outer-most list item will be a block summary that reads out
     the block contents to you. Sublists like the block action list will allow
     you to copy, paste and do other actions to the block. Other sublists will
     read you specific details about the block or allow you to change parts of
     the block.</p>
    <p>Navigating the nested list structure uses exclusively the arrow keys.
    If you are at item A (level 2 item 2) in the Toolbox and you hit the up or
    down arrows, you will move up and down the list A is in (level 2 item 3, or
      level 2 item 1, for instance). If you hit the left arrow, you will be
    taken back to the parent list item of A (e.g. the level 1 item that has A
      as a sublist item). Hitting the right arrow will take you to the first
    sublist item of A (level 3 item 1).</p>
    <p>Feel free to play around in the Toolbox a bit to understand how the
    navigation works.</p>
    <h2>Level Goal: Level {{level}}</h2>
    <p *ngFor='#para of setInstructions()'>{{para}}</p>
    <h2 *ngIf='getHints()'>Hints</h2>
    <p *ngFor='#para of getHints()'>{{para}}</p>
    <button #level1 aria-pressed='true' (click)='setLevel(1, level1, [level2,level3])' disabled={{disableButton(1)}}>Level 1</button>
    <button #level2 aria-pressed='false' (click)='setLevel(2, level2, [level1,level3])' disabled={{disableButton(2)}}>Level 2</button>
    <button #level3 aria-pressed='false' (click)='setLevel(3, level3, [level2,level1])' disabled={{disableButton(3)}}>Level 3</button>
    <blockly-app></blockly-app>
    <button id='run-code' (click)='runCode()' disabled={{disableRunCode()}} [attr.aria-disabled]='disableRunCode()' class='blocklyTree'>Run Code</button>
    <button id='clear-workspace' (click)='workspace.clear()' disabled={{disableRunCode()}} [attr.aria-disabled]='disableRunCode()' class='blocklyTree'>Clear Workspace</button>
    {{moveButtons()}}
    `,
    directives: [blocklyApp.AppView],
  })
  .Class({
    constructor: function() {
      this.level = blocklyApp.gameManager.level;
    },
    getHints: function(){
      return blocklyApp.gameManager.levelHints[blocklyApp.gameManager.level];
    },
    disableButton: function(num) {
      if (num > blocklyApp.gameManager.maxLevelAllowed) {
        return true;
      }
    },
    setLevel: function(num, rightButton, wrongButtons){
      blocklyApp.gameManager.level = num;
      //TODO(madeeha): make it so that workspaces switch across the blocklyApp.
      //blocklyApp.workspace = blocklyApp.gameManager.levelWorkspaces[blocklyApp.level];
      //blocklyApp.workspace.clear();
      console.log(blocklyApp.workspace.id);
      rightButton.setAttribute('aria-pressed','true');
      for (var i=0; i<wrongButtons.length; i++) {
        wrongButtons[i].setAttribute('aria-pressed','false');
      }
      this.level = blocklyApp.gameManager.level;
      blocklyApp.workspace.clear();
    },
    setInstructions: function() {
      if (blocklyApp.gameManager.level && blocklyApp.gameManager.levelInstructions) {
        return blocklyApp.gameManager.levelInstructions[blocklyApp.gameManager.level];
      }
    },
    log: function(obj) {
      //TODO(madeeha): delete after development is finished
      console.log(obj);
    },
    runCode: function() {
      playAndGrade();
    },
    disableRunCode: function() {
      if (blocklyApp.workspace.topBlocks_.length == 0){
        return 'blockly-disabled';
      } else {
        return undefined;
      }
    },
    moveButtons: function(){
      var buttonArea = document.getElementById('blockly-workspace-toolbar');
      buttonArea.appendChild(document.getElementById('run-code'));
      buttonArea.appendChild(document.getElementById('clear-workspace'));
    }
  });
