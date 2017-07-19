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
 * @fileoverview Angular2 Component representing a Blockly.Block in the
 * workspace.
 * @author madeeha@google.com (Madeeha Ghori)
 */

goog.provide('blocklyApp.WorkspaceBlockComponent');

goog.require('blocklyApp.UtilsService');

goog.require('blocklyApp.AudioService');
goog.require('blocklyApp.BlockConnectionService');
goog.require('blocklyApp.FieldSegmentComponent');
goog.require('blocklyApp.TranslatePipe');
goog.require('blocklyApp.TreeService');


blocklyApp.WorkspaceBlockComponent = ng.core.Component({
  selector: 'blockly-workspace-block',
  template: `
    <li [id]="componentIds.blockRoot" role="treeitem"
        [attr.aria-labelledBy]="generateAriaLabelledByAttr(componentIds.blockSummary, 'blockly-translate-workspace-block')"
        [attr.aria-level]="level">
      <label #blockSummaryLabel [id]="componentIds.blockSummary">{{getBlockDescription()}}</label>

      <ol role="group">
        <template ngFor #blockInput [ngForOf]="block.inputList" #i="index">
          <li [id]="componentIds.inputs[i].inputLi" role="treeitem"
              *ngIf="blockInput.fieldRow.length"
              [attr.aria-labelledBy]="generateAriaLabelledByAttr(componentIds.inputs[i].fieldLabel)"
              [attr.aria-level]="level + 1">
            <blockly-field-segment *ngFor="#fieldSegment of inputListAsFieldSegments[i]"
                                   [prefixFields]="fieldSegment.prefixFields"
                                   [mainField]="fieldSegment.mainField"
                                   [mainFieldId]="componentIds.inputs[i].fieldLabel"
                                   [level]="level + 2">
            </blockly-field-segment>
          </li>

          <template [ngIf]="blockInput.connection">
            <blockly-workspace-block *ngIf="blockInput.connection.targetBlock()"
                                     [block]="blockInput.connection.targetBlock()"
                                     [level]="level + 1"
                                     [tree]="tree">
            </blockly-workspace-block>
            <li [id]="componentIds.inputs[i].actionButtonLi" role="treeitem"
                *ngIf="!blockInput.connection.targetBlock()"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(componentIds.inputs[i].buttonLabel)"
                [attr.aria-level]="level + 1">
              <label [id]="componentIds.inputs[i].label">
                {{getBlockNeededLabel(blockInput)}}
              </label>
              <button [id]="componentIds.inputs[i].actionButton"
                      (click)="addInteriorLink(blockInput.connection)"
                      tabindex="-1">
                {{'MARK_THIS_SPOT'|translate}}
              </button>
            </li>
          </template>
        </template>
      </ol>
    </li>

    <blockly-workspace-block *ngIf= "block.nextConnection && block.nextConnection.targetBlock()"
                             [block]="block.nextConnection.targetBlock()"
                             [level]="level" [tree]="tree">
    </blockly-workspace-block>
  `,
  directives: [blocklyApp.FieldSegmentComponent, ng.core.forwardRef(function() {
    return blocklyApp.WorkspaceBlockComponent;
  })],
  inputs: ['block', 'level', 'tree'],
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
      this.cachedBlockId = null;
    }
  ],
  ngDoCheck: function() {
    // The block ID can change if, for example, a block is spliced between two
    // linked blocks. We need to refresh the fields and component IDs when this
    // happens.
    if (this.cachedBlockId != this.block.id) {
      this.cachedBlockId = this.block.id;

      var SUPPORTED_FIELDS = [Blockly.FieldTextInput, Blockly.FieldDropdown];
      this.inputListAsFieldSegments = this.block.inputList.map(function(input) {
        // Converts the input list to an array of field segments. Each field
        // segment represents a user-editable field, prefixed by an arbitrary
        // number of non-editable fields.
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

      // Generate unique IDs for elements in this component.
      this.componentIds = {};
      this.componentIds.blockRoot =
          this.block.id + blocklyApp.BLOCK_ROOT_ID_SUFFIX;
      this.componentIds.blockSummary = this.block.id + '-blockSummary';

      var that = this;
      this.componentIds.inputs = this.block.inputList.map(function(input, i) {
        var idsToGenerate = ['inputLi', 'fieldLabel'];
        if (input.connection && !input.connection.targetBlock()) {
          idsToGenerate.push('actionButtonLi', 'actionButton', 'buttonLabel');
        }

        var inputIds = {};
        idsToGenerate.forEach(function(idBaseString) {
          inputIds[idBaseString] = [that.block.id, i, idBaseString].join('-');
        });

        return inputIds;
      });
    }
  },
  ngAfterViewInit: function() {
    // If this is a top-level tree in the workspace, ensure that it has an
    // active descendant. (Note that a timeout is needed here in order to
    // trigger Angular change detection.)
    var that = this;
    setTimeout(function() {
      if (that.level === 0 && !that.treeService.getActiveDescId(that.tree.id)) {
        that.treeService.setActiveDesc(
            that.componentIds.blockRoot, that.tree.id);
      }
    });
  },
  addInteriorLink: function(connection) {
    this.blockConnectionService.markConnection(connection);
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
  getBlockNeededLabel: function(blockInput) {
    // The input type name, or 'any' if any official input type qualifies.
    var inputTypeLabel = (
        blockInput.connection.check_ ?
        blockInput.connection.check_.join(', ') : Blockly.Msg.ANY);
    var blockTypeLabel = (
        blockInput.type == Blockly.NEXT_STATEMENT ?
        Blockly.Msg.BLOCK : Blockly.Msg.VALUE);
    return inputTypeLabel + ' ' + blockTypeLabel + ' needed:';
  },
  generateAriaLabelledByAttr: function(mainLabel, secondLabel) {
    return mainLabel + (secondLabel ? ' ' + secondLabel : '');
  }
});
