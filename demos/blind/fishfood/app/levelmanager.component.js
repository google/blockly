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
app.level = 1;
app.levelInstructions = {};
app.levelHints = {};
app.levelInstructions[1] = [`If you are using a screen reader, make sure to set your punctuation
    setting to 'all'.`,
    `Let us start by navigating to the toolbox and copying the 'play random note'
    block onto the workspace. Both the Toolbox and the Workspace are trees.
    Once you have tabbed to the tree, use your arrow keys to navigate. A tree is
     a fancy way of saying a list of lists: much like a table of contents.`,
    `If you are at item A in the tree and you hit the up or down arrows, you will
    move up and down the list A is in. If you hit the left arrow, you will be taken
    back to the parent list item of A. Hitting the right arrow will take you to the
    first child list item of A.`];
app.levelInstructions[2] = [`If you are using a screen reader, make sure to set your punctuation
    setting to 'all'.`,
    `Play the C note.`,
    `Do not forget how to navigate a tree: If you are at item A in the tree and you hit the up or down arrows, you will
    move up and down the list A is in. If you hit the left arrow, you will be taken
    back to the parent list item of A. Hitting the right arrow will take you to the
    first child list item of A.`];
app.levelInstructions[3] = [`If you are using a screen reader, make sure to set your punctuation
    setting to 'all'.`,
    `Play 2 C notes. Make sure the blocks are connected to each other.`,
    `Do not forget how to navigate a tree: If you are at item A in the tree and you hit the up or down arrows, you will
    move up and down the list A is in. If you hit the left arrow, you'll be taken
    back to the parent list item of A. Hitting the right arrow will take you to the
    first child list item of A.`];
app.levelHints[3] = [`Each list in the workspace is a set of connected blocks. So if you have two blocks,
    each item number 1 of its own list, then those blocks are not connected.
    If you have two blocks, one item 1 of a list and one item 2 of a list, then they are connected.`,
    `Try to make use of the 'copy to Blockly clipboard' and 'paste above'/'paste below' options in the block menus.`];
app.levelToolboxes=['','level1_ToolboxXml.xml','level1_ToolboxXml.xml','level1_ToolboxXml.xml'];
app.levelWorkspaces=[undefined,new Blockly.Workspace(),new Blockly.Workspace(),new Blockly.Workspace()];
app.maxLevelAllowed=1;

app.workspace = app.levelWorkspaces[app.level];

app.LevelManagerView = ng.core
  .Component({
    selector: 'levelview',
    template: `
    <h2>Instructions</h2>
    <p *ngFor='#para of setInstructions()'>{{para}}</p>
    <h2 *ngIf='getHints()'>Hints</h2>
    <p *ngFor='#para of getHints()'>{{para}}</p>
    <button #level1 aria-selected='true' (click)='setLevel(1, level1, [level2,level3])' disabled={{disableButton(1)}}>Level 1</button>
    <button #level2 aria-selected='false' (click)='setLevel(2, level2, [level1,level3])' disabled={{disableButton(2)}}>Level 2</button>
    <button #level3 aria-selected='false' (click)='setLevel(3, level3, [level2,level1])' disabled={{disableButton(3)}}>Level 3</button>
    <app></app>
    `,
    directives: [app.AppView],
  })
  .Class({
    constructor: function() {
      this.level = app.level;
      app.levelValidationFunctions={};
      app.levelValidationFunctions[1] = function(){
        var correct = true;
        correct = correct && app.workspace.topBlocks_.length == 1;
        correct = correct && app.workspace.topBlocks_[0].type == 'music_play_random_note';
        //if we have completed a level, update the max level the user can try.
        if (correct && app.level >= app.maxLevelAllowed){
          app.maxLevelAllowed = Math.min(app.level + 1,3);
        }
        return correct;
      };
      app.levelValidationFunctions[2] = function(){
        var correct = true;
        correct = correct && app.workspace.topBlocks_.length == 1;
        correct = correct && app.workspace.topBlocks_[0].type == 'music_play_note';
        correct = correct && notesBuffer.length == 1;
        correct = correct && notesBuffer[0].midiValues.length == 1 && notesBuffer[0].midiValues[0] == 60;
        correct = correct && notesBuffer[0].durationInBeats == 1;
        correct = correct && notesBuffer[0].delayInBeats == 0;
        //if we have completed a level, update the max level the user can try.
        if (correct && app.level >= app.maxLevelAllowed){
          app.maxLevelAllowed = Math.min(app.level + 1,3);
        }
        return correct;
      };
      app.levelValidationFunctions[3] = function(){
        //we have one topBlock
        //the topBlock has something connected to it.
        //block.nextConnection.targetConnection.sourceBlock_
        var topBlock = app.workspace.topBlocks_[0];
        var connectedBlock = topBlock.nextConnection.targetConnection.sourceBlock_;
        var correct = topBlock && connectedBlock;
        correct = correct && app.workspace.topBlocks_.length == 1;
        correct = correct && topBlock.type == 'music_play_note';
        correct = correct && connectedBlock.type == 'music_play_note';
        correct = correct && notesBuffer.length == 2;
        correct = correct && notesBuffer[0].midiValues.length == 1 && notesBuffer[0].midiValues[0] == 60;
        correct = correct && notesBuffer[0].durationInBeats == 1;
        correct = correct && notesBuffer[0].delayInBeats == 0;
        correct = correct && notesBuffer[1].midiValues.length == 1 && notesBuffer[1].midiValues[0] == 60;
        correct = correct && notesBuffer[1].durationInBeats == 1;
        correct = correct && notesBuffer[1].delayInBeats == 1;
        //if we have completed a level, update the max level the user can try.
        if (correct && app.level >= app.maxLevelAllowed){
          app.maxLevelAllowed = Math.min(app.level + 1,3);
        }
        return correct;
      };
    },
    getHints: function(){
      return app.levelHints[app.level];
    },
    disableButton: function(num) {
      if (num > app.maxLevelAllowed) {
        return true;
      }
    },
    setLevel: function(num, rightButton, wrongButtons){
      app.level = num;
      //TODO(madeeha): make it so that workspaces switch across the app.
      //app.workspace = app.levelWorkspaces[app.level];
      //app.workspace.clear();
      console.log(app.workspace.id);
      rightButton.setAttribute('aria-selected','true');
      for (var i=0; i<wrongButtons.length; i++) {
        wrongButtons[i].setAttribute('aria-selected','false');
      }
    },
    setInstructions: function() {
      if (app.level && app.levelInstructions) {
        return app.levelInstructions[app.level];
      }
    },
    log: function(obj) {
      //TODO(madeeha): delete after development is finished
      console.log(obj);
    },
  });
