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
 *
 * @author madeeha@google.com (Madeeha Ghori)
 */

blocklyApp.WorkspaceComponent = ng.core.Component({
  selector: 'blockly-workspace',
  template: `
    <div class="blocklyWorkspaceColumn">
      <h3 #workspaceTitle id="blockly-workspace-title">{{'WORKSPACE'|translate}}</h3>

      <div *ngIf="workspace" class="blocklyWorkspace">
        <ol #tree *ngFor="#block of workspace.topBlocks_; #i = index"
            tabindex="0" role="tree" class="blocklyTree blocklyWorkspaceFocusTarget"
            [attr.aria-activedescendant]="getActiveDescId(tree.id)"
            [attr.aria-labelledby]="workspaceTitle.id"
            (keydown)="onKeypress($event, tree)"
            (focus)="speakLocation(i)">
          <blockly-workspace-tree [level]="0" [block]="block" [tree]="tree" [isTopLevel]="true">
          </blockly-workspace-tree>
        </ol>

        <span *ngIf="workspace.topBlocks_.length === 0">
          <p id="emptyWorkspaceBtnLabel">
            There are no blocks in the workspace.
            <button (click)="showToolboxModalForCreateNewGroup()"
                    class="blocklyWorkspaceFocusTarget"
                    id="{{ID_FOR_EMPTY_WORKSPACE_BTN}}"
                    aria-describedby="emptyWorkspaceBtnLabel">
              Create new block group...
            </button>
          </p>
        </span>
      </div>
    </div>
  `,
  directives: [blocklyApp.WorkspaceTreeComponent],
  pipes: [blocklyApp.TranslatePipe]
})
.Class({
  constructor: [
    blocklyApp.NotificationsService,
    blocklyApp.ToolboxModalService,
    blocklyApp.TreeService,
    function(notificationsService, toolboxModalService, treeService) {
      this.notificationsService = notificationsService;
      this.toolboxModalService = toolboxModalService;
      this.treeService = treeService;

      this.workspace = blocklyApp.workspace;
      this.ID_FOR_EMPTY_WORKSPACE_BTN = blocklyApp.ID_FOR_EMPTY_WORKSPACE_BTN;
    }
  ],
  getActiveDescId: function(treeId) {
    return this.treeService.getActiveDescId(treeId);
  },
  onKeypress: function(e, tree) {
    this.treeService.onKeypress(e, tree);
  },
  showToolboxModalForCreateNewGroup: function() {
    this.toolboxModalService.showToolboxModalForCreateNewGroup(
        this.ID_FOR_EMPTY_WORKSPACE_BTN);
  },
  speakLocation: function(index) {
    this.notificationsService.speak(
        'Now in workspace group ' + (index + 1) + ' of ' +
        this.workspace.topBlocks_.length);
  }
});
