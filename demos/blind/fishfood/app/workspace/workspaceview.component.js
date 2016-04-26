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
  <label><h3 id='workspace-title'>Workspace</h3></label>
  <div (keydown)="treeService.workspaceButtonKeyHandler($event, activeButtonId())"> <!--put keyboard handler here-->
  <button id='run-code' (click)="runCode()" disabled={{disableRunCode()}} [attr.aria-disabled]='disableRunCode()' class="tree">Run Code</button>
  <button id='clear-workspace' (click)="workspace.clear()" disabled={{disableRunCode()}} [attr.aria-disabled]='disableRunCode()' class="tree">Clear Workspace</button>
  <div *ngIf='workspace'>
  <ol #tree id={{makeId(i)}} *ngFor='#block of workspace.topBlocks_; #i=index' tabIndex='0' class='tree' role='group' aria-labelledby='workspace-title' (keydown)="treeService.keyHandler($event, tree)">
    {{treeService.setActiveAttribute(tree)}}
    <tree-view [level]=1 [block]='block' [isTopBlock]='true' [topBlockIndex]='i' [parentId]='tree.id'></tree-view>
  </ol>
  </div>
  </div>
    `,
    directives: [app.TreeView],
  })
  .Class({
    constructor: [app.TreeService, function(_service) {
      if (app.workspace) {
        this.workspace = app.workspace;
        this.level = app.gameManager.level;
        this.treeService = _service;
      }
    }],
    activeButtonId: function(){
      var id = document.activeElement.id;
      if(id == 'run-code' || id == 'clear-workspace'){
        return id;
      }
    },
    makeId: function(index){
      return 'workspace-tree'+index;
    },
    runCode: function() {
      playAndGrade();
    },
    disableRunCode: function() {
      if (this.workspace.topBlocks_.length == 0){
        return 'disabled';
      } else {
        return undefined;
      }
    }
  });
