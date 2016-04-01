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
 * @fileoverview Angular2 Component that details how a Blockly.Workspace is rendered in BlindBlockly.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var app = app || {};

app.WorkspaceView = ng.core
  .Component({
    selector: 'workspace-view',
    viewInjector: [app.ClipboardService],
    template: `
  <div class='treeview' *ngIf='workspace'>
  <label><h3 id='workspace-title'>Workspace</h3>
  <button (click)="runCode()" disabled={{disableRunCode()}}>Run Code</button>
  <button (click)="workspace.clear()" disabled={{disableRunCode()}}>Clear Workspace</button>
  </label>
  <ol #tree id={{makeId(i)}} *ngFor='#block of workspace.topBlocks_; #i=index' tabIndex='0' class='tree' role='group' aria-labelledby='workspace-title' (keydown)="treeService.keyHandler($event, tree)">
    {{treeService.setActiveAttribute(tree)}}
    <tree-view [level]=1 [block]='block' [isTopBlock]='true' [topBlockIndex]='i'></tree-view>
  </ol>
  </div>
    `,
    directives: [app.TreeView],
  })
  .Class({
    constructor: [app.TreeService, function(_service) {
      if (app.workspace) {
        this.workspace = app.workspace;
        this.level = app.level;
        this.treeService = _service;
      }
    }],
    makeId: function(index){
      return 'workspace-tree'+index;
    },
    runCode: function() {
      //var code = Blockly.JavaScript.workspaceToCode(this.workspace);
      try {
        //eval(code);
        if(app.levelValidationFunctions[app.level]()){
          alert('Good job! You completed the level!');
        }
      } catch (e) {
        alert(e);
      }
    },
    disableRunCode: function() {
      if (this.workspace.topBlocks_.length == 0){
        return true;
      } else {
        return undefined;
      }
    }
  });
