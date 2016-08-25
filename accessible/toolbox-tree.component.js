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
 * @fileoverview Angular2 Component that details how blocks are
 * rendered in the toolbox in AccessibleBlockly. Also handles any interactions
 * with the blocks.
 * @author madeeha@google.com (Madeeha Ghori)
 */

blocklyApp.ToolboxTreeComponent = ng.core
  .Component({
    selector: 'blockly-toolbox-tree',
    template: `
    <li #parentList [id]="idMap['parentList']" role="treeitem"
        [ngClass]="{blocklyHasChildren: displayBlockMenu, blocklyActiveDescendant: index == 0 && noCategories}"
        [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['blockSummaryLabel'], 'blockly-toolbox-block')"
        [attr.aria-level]="level">
      <label #blockSummaryLabel [id]="idMap['blockSummaryLabel']">{{getBlockDescription()}}</label>
      <ol role="group" *ngIf="displayBlockMenu">
        <li [id]="idMap['workspaceCopy']" role="treeitem"
            [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['workspaceCopyButton'], 'blockly-button')"
            [attr.aria-level]="level + 2">
          <button [id]="idMap['workspaceCopyButton']" (click)="copyToWorkspace()" tabindex="-1">
            {{'COPY_TO_WORKSPACE'|translate}}
          </button>
        </li>
        <li [id]="idMap['blockCopy']" role="treeitem"
            [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['blockCopyButton'], 'blockly-button')"
            [attr.aria-level]="level + 2">
          <button [id]="idMap['blockCopyButton']" (click)="copyToClipboard()" tabindex="-1">
            {{'COPY_TO_CLIPBOARD'|translate}}
          </button>
        </li>
        <li [id]="idMap['sendToSelected']" role="treeitem"
            [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['sendToSelectedButton'], 'blockly-button', !canBeCopiedToMarkedConnection())"
            [attr.aria-level]="level + 2">
          <button [id]="idMap['sendToSelectedButton']" (click)="copyToMarkedSpot()"
                  [disabled]="!canBeCopiedToMarkedConnection()" tabindex="-1">
            {{'COPY_TO_MARKED_SPOT'|translate}}
          </button>
        </li>
      </ol>
    </li>

    <blockly-toolbox-tree *ngIf= "block.nextConnection && block.nextConnection.targetBlock()"
                          [level]="level"
                          [block]="block.nextConnection.targetBlock()"
                          [displayBlockMenu]="false">
    </blockly-toolbox-tree>
    `,
    directives: [blocklyApp.FieldComponent, ng.core.forwardRef(function() {
      return blocklyApp.ToolboxTreeComponent;
    })],
    inputs: [
        'block', 'displayBlockMenu', 'level', 'index', 'tree', 'noCategories', 'isTopLevel'],
    pipes: [blocklyApp.TranslatePipe]
  })
  .Class({
    constructor: [
        blocklyApp.ClipboardService, blocklyApp.NotificationsService,
        blocklyApp.TreeService, blocklyApp.UtilsService,
        function(
            _clipboardService, _notificationsService,
            _treeService, _utilsService) {
      this.clipboardService = _clipboardService;
      this.notificationsService = _notificationsService;
      this.treeService = _treeService;
      this.utilsService = _utilsService;
    }],
    ngOnInit: function() {
      var elementsNeedingIds = ['blockSummaryLabel'];
      if (this.displayBlockMenu) {
        elementsNeedingIds = elementsNeedingIds.concat(['blockSummarylabel',
            'workspaceCopy', 'workspaceCopyButton', 'blockCopy',
            'blockCopyButton', 'sendToSelected', 'sendToSelectedButton']);
      }
      this.idMap = this.utilsService.generateIds(elementsNeedingIds);
      if (this.isTopLevel) {
        this.idMap['parentList'] = 'blockly-toolbox-tree-node0';
      } else {
        this.idMap['parentList'] = this.utilsService.generateUniqueId();
      }
    },
    getBlockDescription: function() {
      return this.utilsService.getBlockDescription(this.block);
    },
    generateAriaLabelledByAttr: function(mainLabel, secondLabel, isDisabled) {
      return this.utilsService.generateAriaLabelledByAttr(
          mainLabel, secondLabel, isDisabled);
    },
    canBeCopiedToMarkedConnection: function() {
      return this.clipboardService.canBeCopiedToMarkedConnection(this.block);
    },
    copyToWorkspace: function() {
      var blockDescription = this.getBlockDescription();
      var xml = Blockly.Xml.blockToDom(this.block);
      var newBlockId = Blockly.Xml.domToBlock(blocklyApp.workspace, xml).id;

      var that = this;
      setTimeout(function() {
        that.treeService.focusOnBlock(newBlockId);
        that.notificationsService.setStatusMessage(
            blockDescription + ' copied to workspace. ' +
            'Now on copied block in workspace.');
      });
    },
    copyToClipboard: function() {
      this.clipboardService.copy(this.block);
      this.notificationsService.setStatusMessage(
          this.getBlockDescription() + ' ' + Blockly.Msg.COPIED_BLOCK_MSG);
    },
    copyToMarkedSpot: function() {
      var blockDescription = this.getBlockDescription();
      // Clean up the active desc for the destination tree.
      var oldDestinationTreeId = this.treeService.getTreeIdForBlock(
          this.clipboardService.getMarkedConnectionBlock().id);
      this.treeService.clearActiveDesc(oldDestinationTreeId);

      var newBlockId = this.clipboardService.pasteToMarkedConnection(
          this.block);

      // Invoke a digest cycle, so that the DOM settles.
      var that = this;
      setTimeout(function() {
        that.treeService.focusOnBlock(newBlockId);

        var newDestinationTreeId = that.treeService.getTreeIdForBlock(
            newBlockId);
        if (newDestinationTreeId != oldDestinationTreeId) {
          // It is possible for the tree ID for the pasted block to change
          // after the paste operation, e.g. when inserting a block between two
          // existing blocks that are joined together. In this case, we need to
          // also reset the active desc for the old destination tree.
          that.treeService.initActiveDesc(oldDestinationTreeId);
        }

        that.notificationsService.setStatusMessage(
            blockDescription + ' copied to marked spot. ' +
            'Now on copied block in workspace.');
      });
    }
  });
