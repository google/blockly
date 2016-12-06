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

blocklyApp.WorkspaceTreeComponent = ng.core.Component({
  selector: 'blockly-workspace-tree',
  template: `
    <li [id]="idMap['blockRoot']" role="treeitem" class="blocklyHasChildren"
        [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['blockSummary'], 'blockly-translate-workspace-block')"
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
              {{getBlockNeededLabel(blockInput)}}
            </label>
            <button [id]="idMap[fieldButtonsInfo[0].baseIdKey + 'Button' + i]"
                    (click)="fieldButtonsInfo[0].action(blockInput.connection)"
                    [disabled]="fieldButtonsInfo[0].isDisabled(blockInput.connection)" tabindex="-1">
              {{fieldButtonsInfo[0].translationIdForText|translate}}
            </button>
          </li>
        </template>
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
    blocklyApp.AudioService,
    blocklyApp.BlockConnectionService,
    blocklyApp.TreeService,
    blocklyApp.UtilsService,
    function(audioService, blockConnectionService, treeService, utilsService) {
      this.audioService = audioService;
      this.blockConnectionService = blockConnectionService;
      this.treeService = treeService;
      this.utilsService = utilsService;
    }
  ],
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

    // Make a list of all the id keys.
    this.idKeys = ['blockRoot', 'blockSummary', 'listItem', 'label'];

    // Generate a list of action buttons.
    this.fieldButtonsInfo = [{
      baseIdKey: 'markSpot',
      translationIdForText: 'MARK_THIS_SPOT',
      action: function(connection) {
        that.blockConnectionService.markConnection(connection);
      },
      isDisabled: function() {
        return false;
      }
    }];

    var that = this;
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
  generateAriaLabelledByAttr: function(mainLabel, secondLabel) {
    return this.utilsService.generateAriaLabelledByAttr(
        mainLabel, secondLabel);
  },
  getBlockNeededLabel: function(blockInput) {
    // The input type name, or 'any' if any official input type qualifies.
    var inputTypeLabel = (
        blockInput.connection.check_ ?
        blockInput.connection.check_.join(', ') : Blockly.Msg.ANY);
    var blockTypeLabel = (
        blockInput.type == Blockly.NEXT_STATEMENT ?
        Blockly.Msg.BLOCK : Blockly.Msg.VALUE);
    return inputTypeLabel + ' ' + blockTypeLabel + ' needed:';
  }
});
