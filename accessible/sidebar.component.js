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
    <div id="blockly-workspace-sidebar" (keydown)="onSidebarKeypress($event)">
      <span *ngFor="#buttonConfig of customSidebarButtons">
        <button *ngIf="!buttonConfig.isHidden()"
                (click)="handleButtonClick(buttonConfig)"
                [attr.aria-describedby]="buttonConfig.ariaDescribedBy"
                class="blocklySidebarButton">
          {{buttonConfig.text}}
        </button>
      </span>
      <button id="{{ID_FOR_ATTACH_TO_LINK_BUTTON}}"
              (click)="showToolboxModalForAttachToMarkedConnection()"
              [attr.disabled]="isAnyConnectionMarked() ? undefined : 'disabled'"
              [attr.aria-disabled]="!isAnyConnectionMarked()"
              class="blocklySidebarButton">
        Attach new block to link...
      </button>
      <button id="{{ID_FOR_CREATE_NEW_GROUP_BUTTON}}"
              (click)="showToolboxModalForCreateNewGroup()"
              class="blocklySidebarButton">
        Create new block group...
      </button>
      <button id="clear-workspace" (click)="clearWorkspace()"
              [attr.disabled]="isWorkspaceEmpty() ? 'disabled' : undefined"
              [attr.aria-disabled]="isWorkspaceEmpty()"
              class="blocklySidebarButton">
        {{'CLEAR_WORKSPACE'|translate}}
      </button>
    </div>
  </div>
  `,
  pipes: [blocklyApp.TranslatePipe]
})
.Class({
  constructor: [
    blocklyApp.NotificationsService, blocklyApp.TreeService,
    blocklyApp.UtilsService, blocklyApp.ToolboxModalService,
    blocklyApp.ClipboardService,
    function(
        _notificationsService, _treeService, _utilsService,
        _toolboxModalService, _clipboardService) {
      // ACCESSIBLE_GLOBALS is a global variable defined by the containing
      // page. It should contain a key, customSidebarButtons, describing
      // additional buttons that should be displayed after the default ones.
      // See README.md for details.
      this.customSidebarButtons =
          ACCESSIBLE_GLOBALS && ACCESSIBLE_GLOBALS.customSidebarButtons ?
          ACCESSIBLE_GLOBALS.customSidebarButtons : [];
      this.workspace = blocklyApp.workspace;
      this.notificationsService = _notificationsService;
      this.treeService = _treeService;
      this.utilsService = _utilsService;
      this.toolboxModalService = _toolboxModalService;
      this.clipboardService = _clipboardService;

      this.ID_FOR_ATTACH_TO_LINK_BUTTON = 'blocklyAttachToLinkBtn';
      this.ID_FOR_CREATE_NEW_GROUP_BUTTON = 'blocklyCreateNewGroupBtn';
    }
  ],
  isAnyConnectionMarked: function() {
    return this.clipboardService.isAnyConnectionMarked();
  },
  handleButtonClick: function(buttonConfig) {
    buttonConfig.action();
    if (buttonConfig.onClickNotification) {
      this.notificationsService.setStatusMessage(
          buttonConfig.onClickNotification);
    }
  },
  clearWorkspace: function() {
    this.workspace.clear();
    document.getElementById(this.ID_FOR_CREATE_NEW_GROUP_BUTTON).focus();
  },
  onSidebarKeypress: function(e) {
    this.treeService.onSidebarKeypress(e, document.activeElement.id);
  },
  isWorkspaceEmpty: function() {
    return this.utilsService.isWorkspaceEmpty();
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
