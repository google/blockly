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
 * @fileoverview Angular2 Component that details how Blockly.Block's are
 * rendered in the workspace in AccessibleBlockly. Also handles any
 * interactions with the blocks.
 * @author madeeha@google.com (Madeeha Ghori)
 */

blocklyApp.WorkspaceTreeComponent = ng.core
  .Component({
    selector: 'blockly-workspace-tree',
    template: `
    <li #parentList [id]="idMap['parentList']" role="treeitem" class="blocklyHasChildren"
        [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-block-summary', idMap['blockSummary'])"
        [attr.aria-level]="level" aria-selected=false>
      <label [id]="idMap['blockSummary']">{{block.toString()}}</label>
      <ol role="group"  [attr.aria-level]="level+1">
        <li [id]="idMap['listItem']" class="blocklyHasChildren" role="treeitem"
            [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-block-menu', idMap['blockSummary'])"
            [attr.aria-level]="level+1" aria-selected=false>
          <label [id]="idMap['label']">{{'BLOCK_ACTION_LIST'|translate}}</label>
          <ol role="group"  [attr.aria-level]="level+2">
            <li [id]="idMap['cutListItem']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['cutButton'], 'blockly-button')"
                [attr.aria-level]="level+2" aria-selected=false>
              <button [id]="idMap['cutButton']" (click)="cutToClipboard(block)">{{'CUT_BLOCK'|translate}}</button>
            </li>
            <li [id]="idMap['copyListItem']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['copyButton'], 'blockly-button')"
                [attr.aria-level]="level+2" aria-selected=false>
              <button [id]="idMap['copyButton']" (click)="clipboardService.copy(block, true)">{{'COPY_BLOCK'|translate}}</button>
            </li>
            <li [id]="idMap['pasteBelow']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['pasteBelowButton'], 'blockly-button', !hasNextConnection(block) || !isCompatibleWithClipboard(block.nextConnection))"
                [attr.aria-level]="level+2" aria-selected=false>
              <button [id]="idMap['pasteBelowButton']" (click)="pasteBelow(block)"
                      [disabled]="!hasNextConnection(block) || !isCompatibleWithClipboard(block.nextConnection)">
                {{'PASTE_BELOW'|translate}}
              </button>
            </li>
            <li [id]="idMap['pasteAbove']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['pasteAboveButton'], 'blockly-button', !hasPreviousConnection(block) || !isCompatibleWithClipboard(block.previousConnection))"
                [attr.aria-level]="level+2" aria-selected=false>
              <button [id]="idMap['pasteAboveButton']" (click)="pasteAbove(block)"
                      [disabled]="!hasPreviousConnection(block) || !isCompatibleWithClipboard(block.previousConnection)">
                {{'PASTE_ABOVE'|translate}}
              </button>
            </li>
            <li [id]="idMap['markBelow']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['markBelowButton'], 'blockly-button', !hasNextConnection(block))"
                [attr.aria-level]="level+2" aria-selected=false>
              <button [id]="idMap['markBelowButton']" (click)="clipboardService.markConnection(block.nextConnection)"
                      [disabled]="!hasNextConnection(block)">
                {{'MARK_SPOT_BELOW'|translate}}
              </button>
            </li>
            <li [id]="idMap['markAbove']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['markAboveButton'], 'blockly-button', !hasPreviousConnection(block))"
                [attr.aria-level]="level+2" aria-selected=false>
              <button [id]="idMap['markAboveButton']" (click)="clipboardService.markConnection(block.previousConnection)"
                      [disabled]="!hasPreviousConnection(block)">{{'MARK_SPOT_ABOVE'|translate}}</button>
            </li>
            <li [id]="idMap['sendToSelectedListItem']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['sendToSelectedButton'], 'blockly-button', !canBeMovedToMarkedConnection(block))"
                [attr.aria-level]="level+2" aria-selected=false>
              <button [id]="idMap['sendToSelectedButton']" (click)="sendToMarkedSpot(block)"
                      [disabled]="!canBeMovedToMarkedConnection(block)">{{'MOVE_TO_MARKED_SPOT'|translate}}</button>
            </li>
            <li [id]="idMap['delete']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['deleteButton'], 'blockly-button')"
                [attr.aria-level]="level+2" aria-selected=false>
              <button [id]="idMap['deleteButton']" (click)="deleteBlock(block)">{{'DELETE'|translate}}</button>
            </li>
          </ol>
        </li>
        <div *ngFor="#inputBlock of block.inputList; #i = index">
          <blockly-field *ngFor="#field of inputBlock.fieldRow" [field]="field"></blockly-field>
          <blockly-workspace-tree *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()"
                                  [block]="inputBlock.connection.targetBlock()" [level]="level"
                                  [tree]="tree">
          </blockly-workspace-tree>
          <li #inputList [attr.aria-level]="level + 1" [id]="idMap['inputList' + i]"
              [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-menu', idMap['inputMenuLabel' + i])"
              *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()" (keydown)="treeService.onKeypress($event, tree)">
            <!-- TODO(madeeha): i18n here will need to happen in a different way due to the way grammar changes based on language. -->
            <label [id]="idMap['inputMenuLabel' + i]"> {{utilsService.getInputTypeLabel(inputBlock.connection)}} {{utilsService.getBlockTypeLabel(inputBlock)}} needed: </label>
            <ol role="group"  [attr.aria-level]="level+2">
              <li [id]="idMap['markSpot' + i]" role="treeitem"
                  [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['markButton' + i], 'blockly-button')"
                  [attr.aria-level]="level + 2" aria-selected=false>
                <button [id]="idMap['markSpotButton + i']" (click)="clipboardService.markConnection(inputBlock.connection)">{{'MARK_THIS_SPOT'|translate}}</button>
              </li>
              <li [id]="idMap['paste' + i]" role="treeitem"
                  [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['pasteButton' + i], 'blockly-button', !isCompatibleWithClipboard(inputBlock.connection))"
                  [attr.aria-level]="level+2" aria-selected=false>
                <button [id]="idMap['pasteButton' + i]" (click)="clipboardService.pasteFromClipboard(inputBlock.connection)"
                        [disabled]="!isCompatibleWithClipboard(inputBlock.connection)">
                  {{'PASTE'|translate}}
                </button>
              </li>
            </ol>
          </li>
        </div>
      </ol>
    </li>

    <blockly-workspace-tree *ngIf= "block.nextConnection && block.nextConnection.targetBlock()"
                            [block]="block.nextConnection.targetBlock()"
                            [level]="level" [tree]="tree">
    </blockly-workspace-tree>
    `,
    directives: [blocklyApp.FieldComponent, ng.core.forwardRef(function() {
      return blocklyApp.WorkspaceTreeComponent;
    })],
    inputs: ['block', 'level', 'tree', 'isTopLevel'],
    pipes: [blocklyApp.TranslatePipe]
  })
  .Class({
    constructor: [
        blocklyApp.ClipboardService, blocklyApp.TreeService, blocklyApp.UtilsService,
        function(_clipboardService, _treeService, _utilsService) {
      this.infoBlocks = Object.create(null);
      this.clipboardService = _clipboardService;
      this.treeService = _treeService;
      this.utilsService = _utilsService;
    }],
    getElementsNeedingIds_: function() {
      var elementsNeedingIds = ['blockSummary', 'listItem', 'label',
          'cutListItem', 'cutButton', 'copyListItem', 'copyButton',
          'pasteBelow', 'pasteBelowButton', 'pasteAbove', 'pasteAboveButton',
          'markBelow', 'markBelowButton', 'markAbove', 'markAboveButton',
          'sendToSelectedListItem', 'sendToSelectedButton', 'delete',
          'deleteButton'];

      for (var i = 0; i < this.block.inputList.length; i++) {
        var inputBlock = this.block.inputList[i];
        if (inputBlock.connection && !inputBlock.connection.targetBlock()) {
          elementsNeedingIds = elementsNeedingIds.concat(
            ['inputList' + i, 'inputMenuLabel' + i, 'markSpot' + i,
             'markSpotButton' + i, 'paste' + i, 'pasteButton' + i]);
        }
      }

      return elementsNeedingIds;
    },
    ngOnChanges: function() {
      // The ids needs to be generated on every change (as opposed to only on
      // init), so that they will update if, e.g., a new workspace-tree
      // component is added to the middle of an array.
      var elementsNeedingIds = this.getElementsNeedingIds_();

      this.idMap = {}
      this.idMap['parentList'] = this.block.id + 'parent';
      for (var i = 0; i < elementsNeedingIds.length; i++) {
        this.idMap[elementsNeedingIds[i]] =
            this.block.id + elementsNeedingIds[i];
      }
    },
    ngAfterViewInit: function() {
      // If this is a top-level tree in the workspace, set its id and active
      // descendant.
      if (this.tree && this.isTopLevel && !this.tree.id) {
        this.tree.id = this.utilsService.generateUniqueId();
      }

      if (this.tree && this.isTopLevel &&
          !this.treeService.getActiveDescId(this.tree.id)) {
        this.treeService.setActiveDesc(this.idMap['parentList'], this.tree.id);
      }
    },
    canBeMovedToMarkedConnection: function(block) {
      return this.clipboardService.canBeMovedToMarkedConnection(block);
    },
    hasPreviousConnection: function(block) {
      return Boolean(block.previousConnection);
    },
    hasNextConnection: function(block) {
      return Boolean(block.nextConnection);
    },
    isCompatibleWithClipboard: function(connection) {
      return this.clipboardService.isCompatibleWithClipboard(connection);
    },
    isIsolatedTopLevelBlock: function(block) {
      // Returns whether the given block is at the top level, and has no
      // siblings.
      return Boolean(
          !block.nextConnection.targetConnection &&
          !block.previousConnection.targetConnection &&
          blocklyApp.workspace.topBlocks_.some(function(topBlock) {
            return topBlock.id == block.id;
          }));
    },
    generateAriaLabelledByAttr: function(mainLabel, secondLabel, isDisabled) {
      return this.utilsService.generateAriaLabelledByAttr(
          mainLabel, secondLabel, isDisabled);
    },
    pasteAbove: function(block) {
      var that = this;
      this.treeService.runWhilePreservingFocus(function() {
        that.clipboardService.pasteFromClipboard(block.previousConnection);
      }, this.tree.id);
    },
    pasteBelow: function(block) {
      var that = this;
      this.treeService.runWhilePreservingFocus(function() {
        that.clipboardService.pasteFromClipboard(block.nextConnection);
      }, this.tree.id);
    },
    getRootNode: function() {
      // Gets the root HTML node for this component.
      return document.getElementById(this.idMap['parentList']);
    },
    removeBlockAndSetFocus_: function(block, deleteBlockFunc) {
      // This method runs the given function and then does one of two things:
      // - If the block is an isolated top-level block, it shifts the tree
      //   focus.
      // - Otherwise, it sets the correct new active desc for the current tree.
      if (this.isIsolatedTopLevelBlock(block)) {
        var nextNodeToFocusOn =
            this.treeService.getNodeToFocusOnWhenTreeIsDeleted(this.tree.id);
        deleteBlockFunc();
        nextNodeToFocusOn.focus();
      } else {
        var nextActiveDesc =
            this.treeService.getNextActiveDescWhenBlockIsDeleted(
                this.getRootNode());
        this.treeService.runWhilePreservingFocus(
            deleteBlockFunc, this.tree.id, nextActiveDesc.id);
      }
    },
    cutToClipboard: function(block) {
      var that = this;
      this.removeBlockAndSetFocus_(block, function() {
        that.clipboardService.cut(block);
      });
    },
    deleteBlock: function(block) {
      this.removeBlockAndSetFocus_(block, function() {
        block.dispose(true);
      });
    },
    sendToMarkedSpot: function(block) {
      this.clipboardService.pasteToMarkedConnection(block, false);

      this.removeBlockAndSetFocus_(block, function() {
        block.dispose(true);
      });

      alert('Block moved to marked spot: ' + block.toString());
    }
  });
