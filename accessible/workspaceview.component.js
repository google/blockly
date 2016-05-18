/**
 * AccessibleBlockly
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
 * @fileoverview Angular2 Component that details how a Blockly.Workspace is
 * rendered in AccessibleBlockly.
 * @author madeeha@google.com (Madeeha Ghori)
 */
blocklyApp.WorkspaceView = ng.core
  .Component({
    selector: 'workspace-view',
    viewInjector: [blocklyApp.ClipboardService],
    template: `
      <label>
        <h3 #workspaceTitle id="blockly-workspace-title">Workspace</h3>
      </label>
      <div id="blockly-workspace-toolbar" (keydown)="treeService.onWorkspaceToolbarKeypress($event, getActiveElementId())">
        <button id='run-code' (click)='runCode()' disabled={{disableRunCode()}} 
            [attr.aria-disabled]='disableRunCode()' class='blocklyTree'>Run Code</button>
        <button id='clear-workspace' (click)='workspace.clear()' disabled={{disableRunCode()}} 
            [attr.aria-disabled]='disableRunCode()' class='blocklyTree'>Clear Workspace</button>
      </div>
      <div *ngIf="workspace">
        <ol #tree id={{makeId(i)}} *ngFor="#block of workspace.topBlocks_; #i=index" 
            tabIndex="0" role="group" class="blocklyTree" [attr.aria-labelledby]="workspaceTitle.id" 
            [attr.aria-activedescendant]="tree.getAttribute('aria-activedescendant') || tree.id + '-node0' " 
            (keydown)="treeService.onKeypress($event, tree)">
          <tree-view [level]=1 [block]="block" [isTopBlock]="true" [topBlockIndex]="i" [parentId]="tree.id"></tree-view>
        </ol>
      </div>
    `,
    directives: [blocklyApp.TreeView],
  })
  .Class({
    constructor: [blocklyApp.TreeService, function(_treeService) {
      if (blocklyApp.workspace) {
        this.workspace = blocklyApp.workspace;
        this.treeService = _treeService;
      }
    }],
    getActiveElementId: function() {
      return document.activeElement.id;
    },
    makeId: function(index) {
      return 'blockly-workspace-tree' + index;
    },
    runCode: function() {
      // Generate JavaScript code and run it.
      window.LoopTrap = 1000;
      Blockly.JavaScript.INFINITE_LOOP_TRAP =
          'if (--window.LoopTrap == 0) throw \'Infinite loop.\';\n';
      var code = Blockly.JavaScript.workspaceToCode(blocklyApp.workspace);
      Blockly.JavaScript.INFINITE_LOOP_TRAP = null;
      try {
        eval(code);
      } catch (e) {
        alert(e);
      }
    },
    disableRunCode: function() {
      if (blocklyApp.workspace.topBlocks_.length == 0){
        return 'blockly-disabled';
      } else {
        return undefined;
      }
    },
  });
