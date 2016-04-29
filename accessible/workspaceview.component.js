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
 * @fileoverview Angular2 Component that details how a Blockly.Workspace is rendered in AccessibleBlockly.
 * @author madeeha@google.com (Madeeha Ghori)
 */
var blocklyApp = blocklyApp || {};

blocklyApp.WorkspaceView = ng.core
  .Component({
    selector: 'workspace-view',
    viewInjector: [blocklyApp.ClipboardService],
    template: `
      <label>
        <h3 #workspaceTitle id='blockly-workspace-title'>Workspace</h3>
      </label>
      <div id='blockly-workspace-toolbar' (keydown)='treeService.workspaceButtonKeyHandler($event, activeElementId())'>
      </div>
      <div *ngIf='workspace'>
        <ol #tree id={{makeId(i)}} *ngFor='#block of workspace.topBlocks_; #i=index' tabIndex='0' class='blocklyTree' role='group' [attr.aria-labelledby]='workspaceTitle.id' (keydown)='treeService.keyHandler($event, tree)'>
          {{treeService.setActiveAttribute(tree)}}
          <tree-view [level]=1 [block]='block' [isTopBlock]='true' [topBlockIndex]='i' [parentId]='tree.id'></tree-view>
        </ol>
      </div>
    `,
    directives: [blocklyApp.TreeView],
  })
  .Class({
    constructor: [blocklyApp.TreeService, function(_service) {
      if (blocklyApp.workspace) {
        this.workspace = blocklyApp.workspace;
        this.level = blocklyApp.gameManager.level;
        this.treeService = _service;
      }
    }],
    activeElementId: function(){
      return document.activeElement.id;
    },
    makeId: function(index){
      return 'blockly-workspace-tree'+index;
    }
  });
