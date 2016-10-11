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
        [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['blockSummary'], 'blockly-workspace-block')"
        [attr.aria-level]="level">
      <label [id]="idMap['blockSummary']">{{getBlockDescription()}}</label>

      <ol role="group">
        <template ngFor #blockInput [ngForOf]="block.inputList" #i="index">
          <li role="treeitem" [id]="idMap['listItem' + i]" [attr.aria-level]="level + 1" *ngIf="blockInput.fieldRow.length"
              [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['fieldLabel' + i])">
            <blockly-field-segment *ngFor="#fieldSegment of inputListAsFieldSegments[i]"
                                   [prefixFields]="fieldSegment.prefixFields"
                                   [mainField]="fieldSegment.mainField"
                                   [mainFieldId]="idMap['fieldLabel' + i]"
                                   [level]="level + 2">
            </blockly-field-segment>
          </li>

          <blockly-workspace-tree *ngIf="blockInput.connection && blockInput.connection.targetBlock()"
                                  [block]="blockInput.connection.targetBlock()" [level]="level + 1"
                                  [tree]="tree">
          </blockly-workspace-tree>
          <li #inputList [id]="idMap['inputList' + i]" role="treeitem"
              *ngIf="blockInput.connection && !blockInput.connection.targetBlock()"
              [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['inputMenuLabel' + i], 'blockly-submenu-indicator')"
              [attr.aria-level]="level + 1">
            <label [id]="idMap['inputMenuLabel' + i]">
              {{utilsService.getInputTypeLabel(blockInput.connection)}} {{utilsService.getBlockTypeLabel(blockInput)}} needed:
            </label>
            <ol role="group">
              <li *ngFor="#fieldButtonInfo of fieldButtonsInfo"
                  [id]="idMap[fieldButtonInfo.baseIdKey + i]" role="treeitem"
                  [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap[fieldButtonInfo.baseIdKey + 'Button' + i], 'blockly-button')"
                  [attr.aria-level]="level + 2"
                  [attr.aria-disabled]="fieldButtonInfo.isDisabled(blockInput.connection)">
                <button [id]="idMap[fieldButtonInfo.baseIdKey + 'Button' + i]"
                        (click)="fieldButtonInfo.action(blockInput.connection)"
                        [disabled]="fieldButtonInfo.isDisabled(blockInput.connection)" tabindex="-1">
                  {{fieldButtonInfo.translationIdForText|translate}}
                </button>
              </li>
            </ol>
          </li>
        </template>

        <li [id]="idMap['listItem']" class="blocklyHasChildren" role="treeitem"
            [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-more-options', 'blockly-submenu-indicator')"
            [attr.aria-level]="level + 1">
          <label [id]="idMap['label']">{{'BLOCK_OPTIONS'|translate}}</label>
          <ol role="group">
            <li *ngFor="#buttonInfo of actionButtonsInfo"
                [id]="idMap[buttonInfo.baseIdKey]" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap[buttonInfo.baseIdKey + 'Button'], 'blockly-button')"
                [attr.aria-level]="level + 2"
                [attr.aria-disabled]="buttonInfo.isDisabled()">
              <button [id]="idMap[buttonInfo.baseIdKey + 'Button']" (click)="buttonInfo.action()"
                      [disabled]="buttonInfo.isDisabled()" tabindex="-1">
                {{buttonInfo.translationIdForText|translate}}
              </button>
            </li>
          </ol>
        </li>
      </ol>
    </li>

    <blockly-workspace-tree *ngIf= "block.nextConnection && block.nextConnection.targetBlock()"
                            [block]="block.nextConnection.targetBlock()"
                            [level]="level" [tree]="tree">
    </blockly-workspace-tree>
    `,
    directives: [blocklyApp.FieldSegmentComponent, ng.core.forwardRef(function() {
      return blocklyApp.WorkspaceTreeComponent;
    })],
    inputs: ['block', 'level', 'tree', 'isTopLevel'],
    pipes: [blocklyApp.TranslatePipe]
  })
  .Class({
    constructor: [
        blocklyApp.ClipboardService, blocklyApp.NotificationsService,
        blocklyApp.TreeService, blocklyApp.UtilsService,
        blocklyApp.AudioService,
        function(
            _clipboardService, _notificationsService, _treeService,
            _utilsService, _audioService) {
      this.clipboardService = _clipboardService;
      this.notificationsService = _notificationsService;
      this.treeService = _treeService;
      this.utilsService = _utilsService;
      this.audioService = _audioService;
    }],
    ngOnInit: function() {
      var SUPPORTED_FIELDS = [
          Blockly.FieldTextInput, Blockly.FieldDropdown,
          Blockly.FieldCheckbox];
      this.inputListAsFieldSegments = this.block.inputList.map(function(input) {
        // Converts the input to a list of field segments. Each field segment
        // represents a user-editable field, prefixed by any number of
        // non-editable fields.
        var fieldSegments = [];

        var bufferedFields = [];
        input.fieldRow.forEach(function(field) {
          var fieldIsSupported = SUPPORTED_FIELDS.some(function(fieldType) {
            return (field instanceof fieldType);
          });

          if (fieldIsSupported) {
            var fieldSegment = {
              prefixFields: [],
              mainField: field
            };
            bufferedFields.forEach(function(bufferedField) {
              fieldSegment.prefixFields.push(bufferedField);
            });
            fieldSegments.push(fieldSegment);
            bufferedFields = [];
          } else {
            bufferedFields.push(field);
          }
        });

        // Handle leftover text at the end.
        if (bufferedFields.length) {
          fieldSegments.push({
            prefixFields: bufferedFields,
            mainField: null
          });
        }

        return fieldSegments;
      });

      // Generate a list of action buttons.
      var that = this;
      this.actionButtonsInfo = [{
        baseIdKey: 'copy',
        translationIdForText: 'COPY_BLOCK',
        action: function() {
          that.clipboardService.copy(that.block);
          that.notificationsService.setStatusMessage(
              that.getBlockDescription() + ' ' + Blockly.Msg.COPIED_BLOCK_MSG);
        },
        isDisabled: function() {
         return false;
        }
      }, {
        baseIdKey: 'pasteBefore',
        translationIdForText: 'PASTE_BEFORE',
        action: function() {
          that.treeService.pasteToConnection(
              that.block, that.block.previousConnection);
        },
        isDisabled: function() {
          return Boolean(
              !that.block.previousConnection ||
              !that.isCompatibleWithClipboard(that.block.previousConnection));
        }
      }, {
        baseIdKey: 'pasteAfter',
        translationIdForText: 'PASTE_AFTER',
        action: function() {
          that.treeService.pasteToConnection(
              that.block, that.block.nextConnection);
        },
        isDisabled: function() {
          return Boolean(
             !that.block.nextConnection ||
              !that.isCompatibleWithClipboard(that.block.nextConnection));
        }
      }, {
        baseIdKey: 'markBefore',
        translationIdForText: 'MARK_SPOT_BEFORE',
        action: that.markSpotBefore_.bind(that),
        isDisabled: function() {
          return !that.block.previousConnection;
        }
      }, {
        baseIdKey: 'markAfter',
        translationIdForText: 'MARK_SPOT_AFTER',
        action: that.markSpotAfter_.bind(that),
        isDisabled: function() {
          return !that.block.nextConnection;
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
        translationIdForText: 'PASTE_INSIDE',
        action: function(connection) {
          that.treeService.pasteToConnection(that.block, connection);
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
        var blockInput = this.block.inputList[i];
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
    getBlockDescription: function() {
      var blockDescription = this.utilsService.getBlockDescription(this.block);

      var parentBlock = this.block.getSurroundParent();
      if (parentBlock) {
        var fullDescription = blockDescription + ' inside ' +
            this.utilsService.getBlockDescription(parentBlock);
        return fullDescription;
      } else {
        return blockDescription;
      }
    },
    removeBlockAndSetFocus_: function(block, deleteBlockFunc) {
      this.treeService.removeBlockAndSetFocus(
          block, document.getElementById(this.idMap['blockRoot']),
          deleteBlockFunc);
    },
    deleteBlock_: function() {
      var blockDescription = this.getBlockDescription();

      var that = this;
      this.removeBlockAndSetFocus_(this.block, function() {
        that.block.dispose(true);
        that.audioService.playDeleteSound();
      });

      setTimeout(function() {
        if (that.utilsService.isWorkspaceEmpty()) {
          that.notificationsService.setStatusMessage(
              blockDescription + ' deleted. Workspace is empty.');
        } else {
          that.notificationsService.setStatusMessage(
              blockDescription + ' deleted. Now on workspace.');
        }
      });
    },
    moveToMarkedSpot_: function() {
      var blockDescription = this.getBlockDescription();
      var oldDestinationTreeId = this.treeService.getTreeIdForBlock(
          this.clipboardService.getMarkedConnectionBlock().id);
      this.treeService.clearActiveDesc(oldDestinationTreeId);

      var newBlockId = this.clipboardService.pasteToMarkedConnection(
          this.block);

      var that = this;
      this.removeBlockAndSetFocus_(this.block, function() {
        that.block.dispose(true);
      });

      // Invoke a digest cycle, so that the DOM settles.
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
            blockDescription + ' ' +
            Blockly.Msg.PASTED_BLOCK_TO_MARKED_SPOT_MSG +
            '. Now on moved block in workspace.');
      });
    },
    markSpotBefore_: function() {
      this.clipboardService.markConnection(this.block.previousConnection);
    },
    markSpotAfter_: function() {
      this.clipboardService.markConnection(this.block.nextConnection);
    },
    generateAriaLabelledByAttr: function(mainLabel, secondLabel) {
      return this.utilsService.generateAriaLabelledByAttr(
          mainLabel, secondLabel);
    },
    isCompatibleWithClipboard: function(connection) {
      return this.clipboardService.isCompatibleWithClipboard(connection);
    }
  });
