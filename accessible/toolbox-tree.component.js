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
        [ngClass]="{blocklyHasChildren: displayBlockMenu || block.inputList.length > 0, blocklyActiveDescendant: index == 0 && noCategories}"
        [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-block-summary', idMap['blockSummaryLabel'])"
        [attr.aria-level]="level">
      <label #blockSummaryLabel [id]="idMap['blockSummaryLabel']">{{getBlockDescription()}}</label>
      <ol role="group" *ngIf="displayBlockMenu || block.inputList.length > 0">
        <li #listItem class="blocklyHasChildren" [id]="idMap['listItem']"
            [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-block-menu', idMap['blockSummaryLabel'])"
            *ngIf="displayBlockMenu" role="treeitem"
            [attr.aria-level]="level + 1">
          <label #label [id]="idMap['label']">{{'BLOCK_ACTION_LIST'|translate}}</label>
          <ol role="group" *ngIf="displayBlockMenu">
            <li [id]="idMap['workspaceCopy']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['workspaceCopyButton'], 'blockly-button')"
                [attr.aria-level]="level + 2">
              <button [id]="idMap['workspaceCopyButton']" (click)="copyToWorkspace()">
                {{'COPY_TO_WORKSPACE'|translate}}
              </button>
            </li>
            <li [id]="idMap['blockCopy']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['blockCopyButton'], 'blockly-button')"
                [attr.aria-level]="level + 2">
              <button [id]="idMap['blockCopyButton']" (click)="copyToClipboard()">
                {{'COPY_TO_CLIPBOARD'|translate}}
              </button>
            </li>
            <li [id]="idMap['sendToSelected']" role="treeitem"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['sendToSelectedButton'], 'blockly-button', !canBeCopiedToMarkedConnection())"
                [attr.aria-level]="level + 2">
              <button [id]="idMap['sendToSelectedButton']" (click)="copyToMarkedSpot()"
                      [disabled]="!canBeCopiedToMarkedConnection()">
                {{'COPY_TO_MARKED_SPOT'|translate}}
              </button>
            </li>
          </ol>
        </li>
        <template ngFor #inputBlock [ngForOf]="block.inputList" #i="index">
          <li role="treeitem" [id]="idMap['listItem' + i]" [attr.aria-level]="level + 1">
            <blockly-field *ngFor="#field of inputBlock.fieldRow" [field]="field" [disabled]="true">
            </blockly-field>
          </li>

          <blockly-toolbox-tree *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()"
                                [block]="inputBlock.connection.targetBlock()" [level]="level + 1"
                                [displayBlockMenu]="false">
          </blockly-toolbox-tree>
          <li [id]="idMap['inputList' + i]" role="treeitem"
              *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()"
              [attr.aria-level]="level + 1">
            <label>
              {{utilsService.getInputTypeLabel(inputBlock.connection)}} {{utilsService.getBlockTypeLabel(inputBlock)}} needed:
            </label>
          </li>
        </template>
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
        blocklyApp.ClipboardService, blocklyApp.TreeService, blocklyApp.UtilsService,
        function(_clipboardService, _treeService, _utilsService) {
      // ClipboardService and UtilsService are app-wide singleton services.
      // TreeService is from the parent ToolboxComponent.
      this.infoBlocks = Object.create(null);
      this.clipboardService = _clipboardService;
      this.treeService = _treeService;
      this.utilsService = _utilsService;
    }],
    ngOnInit: function() {
      var elementsNeedingIds = ['blockSummaryLabel'];
      if (this.displayBlockMenu || this.block.inputList.length){
        elementsNeedingIds = elementsNeedingIds.concat(['listItem', 'label',
            'workspaceCopy', 'workspaceCopyButton', 'blockCopy',
            'blockCopyButton', 'sendToSelected', 'sendToSelectedButton']);
      }
      for (var i = 0; i < this.block.inputList.length; i++){
        elementsNeedingIds.push('listItem' + i, 'inputList' + i);
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
      var xml = Blockly.Xml.blockToDom(this.block);
      Blockly.Xml.domToBlock(blocklyApp.workspace, xml);
      alert('Added block to workspace: ' + this.getBlockDescription());
    },
    copyToClipboard: function() {
      this.clipboardService.copy(this.block, true);
    },
    copyToMarkedSpot: function() {
      // This involves two steps:
      // - Put the block on the destination tree.
      // - Change the current tree-level focus to the destination tree, and the
      // screenreader focus for the destination tree to the block just moved.
      var blockDescription = this.getBlockDescription();

      var newBlockId = this.clipboardService.pasteToMarkedConnection(
          this.block);

      // Invoke a digest cycle, so that the DOM settles.
      var that = this;
      setTimeout(function() {
        var destinationTreeId = that.treeService.getTreeIdForBlock(newBlockId);
        document.getElementById(destinationTreeId).focus();
        that.treeService.setActiveDesc(
            newBlockId + 'blockRoot', destinationTreeId);

        alert('Block copied to marked spot: ' + blockDescription);
      });
    }
  });
