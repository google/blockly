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
 * @fileoverview Angular2 Component representing the sidebar that is shown next
 * to the workspace.
 *
 * @author sll@google.com (Sean Lip)
 */

blocklyApp.SidebarComponent = ng.core.Component({
  selector: 'blockly-sidebar',
  template: `
    <div class="blocklySidebarColumn">
      <button *ngFor="#buttonConfig of customSidebarButtons"
              id="{{buttonConfig.id || undefined}}"
              (click)="buttonConfig.action()"
              class="blocklySidebarButton">
        {{buttonConfig.text}}
      </button>
      <button id="{{ID_FOR_ATTACH_TO_LINK_BUTTON}}"
              (click)="showToolboxModalForAttachToMarkedConnection()"
              [attr.disabled]="!isAnyConnectionMarked() ? 'disabled' : undefined"
              [attr.aria-disabled]="!isAnyConnectionMarked()"
              class="blocklySidebarButton">
        {{'ATTACH_NEW_BLOCK_TO_LINK'|translate}}
      </button>
      <button id="{{ID_FOR_CREATE_NEW_GROUP_BUTTON}}"
              (click)="showToolboxModalForCreateNewGroup()"
              class="blocklySidebarButton">
        {{'CREATE_NEW_BLOCK_GROUP'|translate}}
      </button>
      <button id="clear-workspace" (click)="clearWorkspace()"
              [attr.disabled]="isWorkspaceEmpty() ? 'disabled' : undefined"
              [attr.aria-disabled]="isWorkspaceEmpty()"
              class="blocklySidebarButton">
        {{'ERASE_WORKSPACE'|translate}}
      </button>
    </div>
  `,
  pipes: [blocklyApp.TranslatePipe]
})
.Class({
  constructor: [
    blocklyApp.BlockConnectionService,
    blocklyApp.ToolboxModalService,
    blocklyApp.TreeService,
    blocklyApp.UtilsService,
    function(
        blockConnectionService, toolboxModalService, treeService,
        utilsService) {
      // ACCESSIBLE_GLOBALS is a global variable defined by the containing
      // page. It should contain a key, customSidebarButtons, describing
      // additional buttons that should be displayed after the default ones.
      // See README.md for details.
      this.customSidebarButtons =
          ACCESSIBLE_GLOBALS && ACCESSIBLE_GLOBALS.customSidebarButtons ?
          ACCESSIBLE_GLOBALS.customSidebarButtons : [];

      this.blockConnectionService = blockConnectionService;
      this.toolboxModalService = toolboxModalService;
      this.treeService = treeService;
      this.utilsService = utilsService;

      this.ID_FOR_ATTACH_TO_LINK_BUTTON = 'blocklyAttachToLinkBtn';
      this.ID_FOR_CREATE_NEW_GROUP_BUTTON = 'blocklyCreateNewGroupBtn';
    }
  ],
  isAnyConnectionMarked: function() {
    return this.blockConnectionService.isAnyConnectionMarked();
  },
  isWorkspaceEmpty: function() {
    return this.utilsService.isWorkspaceEmpty();
  },
  clearWorkspace: function() {
    blocklyApp.workspace.clear();
    // The timeout is needed in order to give the blocks time to be cleared
    // from the workspace, and for the 'workspace is empty' button to show up.
    setTimeout(function() {
      document.getElementById(blocklyApp.ID_FOR_EMPTY_WORKSPACE_BTN).focus();
    }, 50);
  },
  showToolboxModalForAttachToMarkedConnection: function() {
    this.toolboxModalService.showToolboxModalForAttachToMarkedConnection(
        this.ID_FOR_ATTACH_TO_LINK_BUTTON);
  },
  showToolboxModalForCreateNewGroup: function() {
    this.toolboxModalService.showToolboxModalForCreateNewGroup(
        this.ID_FOR_CREATE_NEW_GROUP_BUTTON);
  }
});
