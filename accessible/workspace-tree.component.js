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
        [attr.aria-level]="level" aria-selected="false">
      <label [id]="idMap['blockSummary']">{{block.toString()}}</label>

      <ol role="group">
        <li [id]="idMap['listItem']" class="blocklyHasChildren" role="treeitem"
            [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-block-menu', idMap['blockSummary'])"
            [attr.aria-level]="level + 1" aria-selected="false">
          <label [id]="idMap['label']">{{'BLOCK_ACTION_LIST'|translate}}</label>
          <ol role="group">
            <li *ngFor="#buttonInfo of actionButtonsInfo"
                [id]="idMap[buttonInfo.baseIdKey]" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap[buttonInfo.baseIdKey + 'Button'], 'blockly-button', buttonInfo.isDisabled())"
                [attr.aria-level]="level + 2" aria-selected="false">
              <button [id]="idMap[buttonInfo.baseIdKey + 'Button']" (click)="buttonInfo.action()"
                      [disabled]="buttonInfo.isDisabled()">
                {{buttonInfo.translationIdForText|translate}}
              </button>
            </li>
          </ol>
        </li>

        <div *ngFor="#inputBlock of block.inputList; #i = index">
          <blockly-field *ngFor="#field of inputBlock.fieldRow" [field]="field" [level]="level + 1"></blockly-field>
          <blockly-workspace-tree *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()"
                                  [block]="inputBlock.connection.targetBlock()" [level]="level + 1"
                                  [tree]="tree">
          </blockly-workspace-tree>
          <li #inputList [attr.aria-level]="level + 1" [id]="idMap['inputList' + i]"
              [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-menu', idMap['inputMenuLabel' + i])"
              *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()" (keydown)="treeService.onKeypress($event, tree)">
            <!-- TODO(madeeha): i18n here will need to happen in a different way due to the way grammar changes based on language. -->
            <label [id]="idMap['inputMenuLabel' + i]"> {{utilsService.getInputTypeLabel(inputBlock.connection)}} {{utilsService.getBlockTypeLabel(inputBlock)}} needed: </label>
            <ol role="group">
              <li [id]="idMap['markSpot' + i]" role="treeitem"
                  [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['markButton' + i], 'blockly-button')"
                  [attr.aria-level]="level + 2" aria-selected="false">
                <button [id]="idMap['markSpotButton + i']" (click)="clipboardService.markConnection(inputBlock.connection)">{{'MARK_THIS_SPOT'|translate}}</button>
              </li>
              <li [id]="idMap['paste' + i]" role="treeitem"
                  [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['pasteButton' + i], 'blockly-button', !isCompatibleWithClipboard(inputBlock.connection))"
                  [attr.aria-level]="level + 2" aria-selected="false">
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
        blocklyApp.ClipboardService, blocklyApp.TreeService,
        blocklyApp.UtilsService,
        function(_clipboardService, _treeService, _utilsService) {
      this.infoBlocks = Object.create(null);
      this.clipboardService = _clipboardService;
      this.treeService = _treeService;
      this.utilsService = _utilsService;
    }],
    isIsolatedTopLevelBlock_: function(block) {
      // Returns whether the given block is at the top level, and has no
      // siblings.
      return Boolean(
          !block.nextConnection.targetConnection &&
          !block.previousConnection.targetConnection &&
          blocklyApp.workspace.topBlocks_.some(function(topBlock) {
            return topBlock.id == block.id;
          }));
    },
    removeBlockAndSetFocus_: function(block, deleteBlockFunc) {
      // This method runs the given function and then does one of two things:
      // - If the block is an isolated top-level block, it shifts the tree
      //   focus.
      // - Otherwise, it sets the correct new active desc for the current tree.
      if (this.isIsolatedTopLevelBlock_(block)) {
        var nextNodeToFocusOn =
            this.treeService.getNodeToFocusOnWhenTreeIsDeleted(this.tree.id);
        deleteBlockFunc();
        nextNodeToFocusOn.focus();
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
      var that = this;
      this.removeBlockAndSetFocus_(this.block, function() {
        that.clipboardService.cut(that.block);
      });
    },
    deleteBlock_: function() {
      var that = this;
      this.removeBlockAndSetFocus_(this.block, function() {
        that.block.dispose(true);
      });
    },
    pasteToConnection_: function(connection) {
      var that = this;
      this.treeService.runWhilePreservingFocus(function() {
        // If the connection is a 'previousConnection' and that connection is
        // already joined to something, use the 'nextConnection' of the
        // previous block instead in order to do an insertion.
        if (connection.type == Blockly.PREVIOUS_STATEMENT &&
            connection.isConnected()) {
          that.clipboardService.pasteFromClipboard(
              connection.targetConnection);
        } else {
          that.clipboardService.pasteFromClipboard(connection);
        }
      }, this.tree.id);
    },
    sendToMarkedSpot_: function() {
      this.clipboardService.pasteToMarkedConnection(this.block, false);

      var that = this;
      this.removeBlockAndSetFocus_(this.block, function() {
        that.block.dispose(true);
      });

      alert('Block moved to marked spot: ' + this.block.toString());
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
        baseIdKey: 'sendToMarkedSpot',
        translationIdForText: 'MOVE_TO_MARKED_SPOT',
        action: that.sendToMarkedSpot_.bind(that),
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

      // Make a list of all the id keys.
      this.idKeys = ['blockRoot', 'blockSummary', 'listItem', 'label'];
      this.actionButtonsInfo.forEach(function(buttonInfo) {
        that.idKeys.push(buttonInfo.baseIdKey, buttonInfo.baseIdKey + 'Button');
      });
      for (var i = 0; i < this.block.inputList.length; i++) {
        var inputBlock = this.block.inputList[i];
        if (inputBlock.connection && !inputBlock.connection.targetBlock()) {
          that.idKeys.push(
              'inputList' + i, 'inputMenuLabel' + i, 'markSpot' + i,
              'markSpotButton' + i, 'paste' + i, 'pasteButton' + i);
        }
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
