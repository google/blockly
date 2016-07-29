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
    <li [id]="idMap['blockRoot']" role="treeitem" class="blocklyHasChildren"
        [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-block-summary', idMap['blockSummary'])"
        [attr.aria-level]="level">
      <label [id]="idMap['blockSummary']">{{getBlockDescription()}}</label>

      <ol role="group">
        <li [id]="idMap['listItem']" class="blocklyHasChildren" role="treeitem"
            [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-block-menu', idMap['blockSummary'])"
            [attr.aria-level]="level + 1">
          <label [id]="idMap['label']">{{'BLOCK_ACTION_LIST'|translate}}</label>
          <ol role="group">
            <li *ngFor="#buttonInfo of actionButtonsInfo"
                [id]="idMap[buttonInfo.baseIdKey]" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap[buttonInfo.baseIdKey + 'Button'], 'blockly-button', buttonInfo.isDisabled())"
                [attr.aria-level]="level + 2">
              <button [id]="idMap[buttonInfo.baseIdKey + 'Button']" (click)="buttonInfo.action()"
                      [disabled]="buttonInfo.isDisabled()">
                {{buttonInfo.translationIdForText|translate}}
              </button>
            </li>
          </ol>
        </li>

        <template ngFor #inputBlock [ngForOf]="block.inputList" #i="index">
          <li role="treeitem" [id]="idMap['listItem' + i]" [attr.aria-level]="level + 1" *ngIf="inputBlock.fieldRow.length"
              [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['fieldLabel' + i])">
            <blockly-field *ngFor="#field of inputBlock.fieldRow" [field]="field" [mainFieldId]="idMap['fieldLabel' + i]">
            </blockly-field>
          </li>

          <blockly-workspace-tree *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()"
                                  [block]="inputBlock.connection.targetBlock()" [level]="level + 1"
                                  [tree]="tree">
          </blockly-workspace-tree>
          <li #inputList [id]="idMap['inputList' + i]" role="treeitem"
              *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()"
              [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-menu', idMap['inputMenuLabel' + i])"
              [attr.aria-level]="level + 1"
              (keydown)="treeService.onKeypress($event, tree)">
            <label [id]="idMap['inputMenuLabel' + i]">
              {{utilsService.getInputTypeLabel(inputBlock.connection)}} {{utilsService.getBlockTypeLabel(inputBlock)}} needed:
            </label>
            <ol role="group">
              <li *ngFor="#fieldButtonInfo of fieldButtonsInfo"
                  [id]="idMap[fieldButtonInfo.baseIdKey + i]" role="treeitem"
                  [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap[fieldButtonInfo.baseIdKey + 'Button' + i], 'blockly-button', fieldButtonInfo.isDisabled(inputBlock.connection))"
                  [attr.aria-level]="level + 2">
                <button [id]="idMap[fieldButtonInfo.baseIdKey + 'Button' + i]"
                        (click)="fieldButtonInfo.action(inputBlock.connection)"
                        [disabled]="fieldButtonInfo.isDisabled(inputBlock.connection)">
                  {{fieldButtonInfo.translationIdForText|translate}}
                </button>
              </li>
            </ol>
          </li>
        </template>
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
        blocklyApp.ClipboardService, blocklyApp.TreeService,
        blocklyApp.UtilsService,
        function(_clipboardService, _treeService, _utilsService) {
      this.infoBlocks = Object.create(null);
      this.clipboardService = _clipboardService;
      this.treeService = _treeService;
      this.utilsService = _utilsService;
    }],
    getBlockDescription: function() {
      return this.utilsService.getBlockDescription(this.block);
    },
    isIsolatedTopLevelBlock_: function(block) {
      // Returns whether the given block is at the top level, and has no
      // siblings.
      var blockIsAtTopLevel = !block.getParent();
      var blockHasNoSiblings = (
          (!block.nextConnection ||
           !block.nextConnection.targetConnection) &&
          (!block.previousConnection ||
           !block.previousConnection.targetConnection));
      return blockIsAtTopLevel && blockHasNoSiblings;
    },
    removeBlockAndSetFocus_: function(block, deleteBlockFunc) {
      // This method runs the given function and then does one of two things:
      // - If the block is an isolated top-level block, it shifts the tree
      //   focus.
      // - Otherwise, it sets the correct new active desc for the current tree.
      if (this.isIsolatedTopLevelBlock_(block)) {
        var nextNodeToFocusOn =
            this.treeService.getNodeToFocusOnWhenTreeIsDeleted(this.tree.id);

        this.treeService.clearActiveDesc(this.tree.id);
        deleteBlockFunc();
        // Invoke a digest cycle, so that the DOM settles.
        setTimeout(function() {
          nextNodeToFocusOn.focus();
        });
      } else {
        var blockRootNode = document.getElementById(this.idMap['blockRoot']);
        var nextActiveDesc =
            this.treeService.getNextActiveDescWhenBlockIsDeleted(
                blockRootNode);
        this.treeService.runWhilePreservingFocus(
            deleteBlockFunc, this.tree.id, nextActiveDesc.id);
      }
    },
    cutBlock_: function() {
      var blockDescription = this.getBlockDescription();

      var that = this;
      this.removeBlockAndSetFocus_(this.block, function() {
        that.clipboardService.cut(that.block);
      });

      alert(Blockly.Msg.CUT_BLOCK_MSG + blockDescription);
    },
    deleteBlock_: function() {
      var blockDescription = this.getBlockDescription();

      var that = this;
      this.removeBlockAndSetFocus_(this.block, function() {
        that.block.dispose(true);
      });

      alert('Block deleted: ' + blockDescription);
    },
    pasteToConnection_: function(connection) {
      // This involves two steps:
      // - Put the block on the destination tree.
      // - Change the current tree-level focus to the destination tree, and the
      // screenreader focus for the destination tree to the block just moved.
      var newBlockId = null;

      this.treeService.clearActiveDesc(this.tree.id);

      // If the connection is a 'previousConnection' and that connection is
      // already joined to something, use the 'nextConnection' of the
      // previous block instead in order to do an insertion.
      if (connection.type == Blockly.PREVIOUS_STATEMENT &&
          connection.isConnected()) {
        newBlockId = this.clipboardService.pasteFromClipboard(
            connection.targetConnection);
      } else {
        newBlockId = this.clipboardService.pasteFromClipboard(connection);
      }

      // Invoke a digest cycle, so that the DOM settles.
      var that = this;
      setTimeout(function() {
        // Move the focus to the current tree.
        document.getElementById(that.tree.id).focus();
        // Move the screenreader focus to the newly-pasted block.
        that.treeService.setActiveDesc(newBlockId + 'blockRoot', that.tree.id);
      });
    },
    moveToMarkedSpot_: function() {
      // This involves three steps:
      // - Put the block on the destination tree.
      // - Remove the block from the source tree, while preserving the
      // screenreader focus for that tree.
      // - Change the current tree-level focus to the destination tree, and the
      // screenreader focus for the destination tree to the block just moved.
      var blockDescription = this.getBlockDescription();

      var newBlockId = this.clipboardService.pasteToMarkedConnection(
          this.block);

      var that = this;
      this.removeBlockAndSetFocus_(this.block, function() {
        that.block.dispose(true);
      });

      // Invoke a digest cycle, so that the DOM settles.
      setTimeout(function() {
        var destinationTreeId = that.treeService.getTreeIdForBlock(newBlockId);
        that.treeService.clearActiveDesc(destinationTreeId);

        document.getElementById(destinationTreeId).focus();
        that.treeService.setActiveDesc(
            newBlockId + 'blockRoot', destinationTreeId);

        alert('Block moved to marked spot: ' + blockDescription);
      });
    },
    ngOnInit: function() {
      var that = this;

      // Generate a list of action buttons.
      this.actionButtonsInfo = [{
        baseIdKey: 'cut',
        translationIdForText: 'CUT_BLOCK',
        action: that.cutBlock_.bind(that),
        isDisabled: function() {
          return false;
        }
      }, {
        baseIdKey: 'copy',
        translationIdForText: 'COPY_BLOCK',
        action: that.clipboardService.copy.bind(
            that.clipboardService, that.block, true),
        isDisabled: function() {
          return false;
        }
      }, {
        baseIdKey: 'pasteBelow',
        translationIdForText: 'PASTE_BELOW',
        action: that.pasteToConnection_.bind(that, that.block.nextConnection),
        isDisabled: function() {
          return Boolean(
              !that.block.nextConnection ||
              !that.isCompatibleWithClipboard(that.block.nextConnection));
        }
      }, {
        baseIdKey: 'pasteAbove',
        translationIdForText: 'PASTE_ABOVE',
        action: that.pasteToConnection_.bind(
            that, that.block.previousConnection),
        isDisabled: function() {
          return Boolean(
              !that.block.previousConnection ||
              !that.isCompatibleWithClipboard(that.block.previousConnection));
        }
      }, {
        baseIdKey: 'markBelow',
        translationIdForText: 'MARK_SPOT_BELOW',
        action: that.clipboardService.markConnection.bind(
            that.clipboardService, that.block.nextConnection),
        isDisabled: function() {
          return !that.block.nextConnection;
        }
      }, {
        baseIdKey: 'markAbove',
        translationIdForText: 'MARK_SPOT_ABOVE',
        action: that.clipboardService.markConnection.bind(
            that.clipboardService, that.block.previousConnection),
        isDisabled: function() {
          return !that.block.previousConnection;
        }
      }, {
        baseIdKey: 'moveToMarkedSpot',
        translationIdForText: 'MOVE_TO_MARKED_SPOT',
        action: that.moveToMarkedSpot_.bind(that),
        isDisabled: function() {
          return !that.clipboardService.isMovableToMarkedConnection(
              that.block);
        }
      }, {
        baseIdKey: 'delete',
        translationIdForText: 'DELETE',
        action: that.deleteBlock_.bind(that),
        isDisabled: function() {
          return false;
        }
      }];

      // Generate a list of action buttons.
      this.fieldButtonsInfo = [{
        baseIdKey: 'markSpot',
        translationIdForText: 'MARK_THIS_SPOT',
        action: function(connection) {
          that.clipboardService.markConnection(connection);
        },
        isDisabled: function() {
          return false;
        }
      }, {
        baseIdKey: 'paste',
        translationIdForText: 'PASTE',
        action: function(connection) {
          that.pasteToConnection_(connection);
        },
        isDisabled: function(connection) {
          return !that.isCompatibleWithClipboard(connection);
        }
      }];

      // Make a list of all the id keys.
      this.idKeys = ['blockRoot', 'blockSummary', 'listItem', 'label'];
      this.actionButtonsInfo.forEach(function(buttonInfo) {
        that.idKeys.push(buttonInfo.baseIdKey, buttonInfo.baseIdKey + 'Button');
      });
      this.fieldButtonsInfo.forEach(function(buttonInfo) {
        for (var i = 0; i < that.block.inputList.length; i++) {
          that.idKeys.push(
              buttonInfo.baseIdKey + i, buttonInfo.baseIdKey + 'Button' + i);
        }
      });
      for (var i = 0; i < this.block.inputList.length; i++) {
        var inputBlock = this.block.inputList[i];
        that.idKeys.push(
            'inputList' + i, 'inputMenuLabel' + i, 'listItem' + i,
            'fieldLabel' + i);
      }
    },
    ngDoCheck: function() {
      // Generate a unique id for each id key. This needs to be done every time
      // changes happen, but after the first ng-init, in order to force the
      // element ids to change in cases where, e.g., a block is inserted in the
      // middle of a sequence of blocks.
      this.idMap = {};
      for (var i = 0; i < this.idKeys.length; i++) {
        this.idMap[this.idKeys[i]] = this.block.id + this.idKeys[i];
      }
    },
    ngAfterViewInit: function() {
      // If this is a top-level tree in the workspace, set its id and active
      // descendant. (Note that a timeout is needed here in order to trigger
      // Angular change detection.)
      var that = this;
      setTimeout(function() {
        if (that.tree && that.isTopLevel && !that.tree.id) {
          that.tree.id = that.utilsService.generateUniqueId();
        }
        if (that.tree && that.isTopLevel &&
            !that.treeService.getActiveDescId(that.tree.id)) {
          that.treeService.setActiveDesc(that.idMap['blockRoot'], that.tree.id);
        }
      });
    },
    generateAriaLabelledByAttr: function(mainLabel, secondLabel, isDisabled) {
      return this.utilsService.generateAriaLabelledByAttr(
          mainLabel, secondLabel, isDisabled);
    },
    isCompatibleWithClipboard: function(connection) {
      return this.clipboardService.isCompatibleWithClipboard(connection);
    }
  });
