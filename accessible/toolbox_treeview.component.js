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
blocklyApp.ToolboxTreeView = ng.core
  .Component({
    selector: 'toolbox-tree-view',
    template: `
      <li #parentList [id]="idMap['parentList']" role="treeitem"
            [ngClass]="{blocklyHasChildren: displayBlockMenu || block.inputList.length > 0, blocklyActiveDescendant: index == 0 && noCategories}" 
            [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-block-summary', idMap['blockSummaryLabel'])"             
            [attr.aria-selected]="index == 0 && tree.getAttribute('aria-activedescendant') == 'blockly-toolbox-tree-node0'" 
            [attr.aria-level]="level">
        {{setActiveDesc(parentList)}}
        <label #blockSummaryLabel [id]="idMap['blockSummaryLabel']" style="color:red">{{block.toString()}}</label>
        <ol role="group" *ngIf="displayBlockMenu || block.inputList.length > 0"  [attr.aria-level]="level+1">
          <li #listItem [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-block-menu', idMap['blockSummaryLabel'])" class="blocklyHasChildren" [id]="idMap['listItem']" *ngIf="displayBlockMenu" role="treeitem" aria-selected=false [attr.aria-level]="level+1">
            <label #label [id]="idMap['label']">block action list </label>
            <ol role="group" *ngIf="displayBlockMenu"  [attr.aria-level]="level+2">
              <li #workspaceCopy [id]="idMap['workspaceCopy']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['workspaceCopyButton'], 'blockly-button')" 
                  [attr.aria-level]="level+2" aria-selected=false>
                <button #workspaceCopyButton [id]="idMap['workspaceCopyButton']" 
                    (click)="copyToWorkspace(block)">copy to workspace</button>
              </li>
              <li #blockCopy [id]="idMap['blockCopy']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['blockCopyButton'], 'blockly-button')" 
                  [attr.aria-level]="level+2" aria-selected=false>
                <button #blockCopyButton [id]="idMap['blockCopyButton']" 
                    (click)="clipboardService.copy(block, true)">copy to clipboard</button>
              </li>
              <li #sendToSelected [id]="idMap['sendToSelected']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['sendToSelectedButton'], 'blockly-button', utilsService.getMarkedBlockCompatibilityHTMLText(clipboardService.isBlockCompatibleWithMarkedConnection(block)))" 
                  [attr.aria-level]="level+2" aria-selected=false>
                <button #sendToSelectedButton [id]="idMap['sendToSelectedButton']" (click)="copyToMarked(block)" 
                    [disabled]="utilsService.getMarkedBlockCompatibilityHTMLText(clipboardService.isBlockCompatibleWithMarkedConnection(block))">
                    copy to marked spot</button>
              </li>
            </ol>
          </li>
          <div *ngFor="#inputBlock of block.inputList; #i=index">
            <field-view *ngFor="#field of getInfo(inputBlock); #j=index" [attr.aria-level]="level+1" [field]="field" [level]="level+1"></field-view>
            <toolbox-tree-view *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()" [block]="inputBlock.connection.targetBlock()" [displayBlockMenu]="false" [level]="level+1"></toolbox-tree-view>
            <li #listItem1 [id]="idMap['listItem' + i]" role="treeitem" 
                *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()" 
                [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-argument-text', idMap['listItem' + i + 'Label'])" 
                [attr.aria-level]="level+1" aria-selected=false>
              <label #label [id]="idMap['listItem' + i + 'Label']">{{utilsService.getInputTypeLabel(inputBlock.connection)}} {{utilsService.getBlockTypeLabel(inputBlock)}} needed:</label>
            </li>
          </div>
        </ol>
      </li>
      <toolbox-tree-view *ngIf= "block.nextConnection && block.nextConnection.targetBlock()" [level]="level" [block]="block.nextConnection.targetBlock()" [displayBlockMenu]="false"></toolbox-tree-view>
    `,
    directives: [ng.core.forwardRef(
        function() { return blocklyApp.ToolboxTreeView; }),
        blocklyApp.FieldView],
    inputs: ['block', 'displayBlockMenu', 'level', 'index', 'tree', 'noCategories'],
  })
  .Class({
    constructor: [blocklyApp.ClipboardService, blocklyApp.TreeService,
                  blocklyApp.UtilsService,
                  function(_clipboardService, _treeService, _utilsService) {
      this.infoBlocks = Object.create(null);
      this.clipboardService = _clipboardService;
      this.treeService = _treeService;
      this.utilsService = _utilsService;
    }],
    ngOnInit: function(){
      var elementsNeedingIds = ['blockSummaryLabel'];
      if (this.displayBlockMenu && this.block.inputList.length){
        elementsNeedingIds.concat(['listItem', 'label', 'workspaceCopy', 
            'workspaceCopyButton', 'blockCopy', 'blockCopyButton',
            'sendToSelected', 'sendToSelectedButton']);
      }
      for (var i=0; i<this.block.inputList.length; i++){
        elementsNeedingIds.push('listItem' + i);
        elementsNeedingIds.push('listItem' + i + 'Label')
      }
      this.idMap = this.utilsService.generateIds(elementsNeedingIds);
      if (this.index == 0 && this.noCategories){
        this.idMap['parentList'] = 'blockly-toolbox-tree-node0';
      } else {
        this.idMap['parentList'] = this.utilsService.generateUniqueId();
      }
    },
    setActiveDesc: function(parentList){
      // If this is the first child of the toolbox and the
      // current active descendant of the tree is this child,
      // then set the active descendant stored in the treeService.
      if (this.index == 0 && this.tree.getAttribute('aria-activedescendant') ==
            'blockly-toolbox-tree-node0'){
        this.treeService.setActiveDesc(parentList, this.tree.id);
      }
    },
    getCategoryId: function(index, parentList) {
      // If this is the first block in a category-less toolbox,
      // the id should be blockly-toolbox-tree-node0.
      if (index === 0) {
        return 'blockly-toolbox-tree-node0';
      } else {
        return this.treeService.createId(parentList);
      }
    },
    addClass: function(node, classText) {
      // Ensure that node doesn't have class already in it.
      var classList = (node.className || '').split(' ');
      var canAdd = classList.indexOf(classText) == -1;
      // Add class if it doesn't.
      if (canAdd) {
        if (classList.length) {
          node.className += ' ' + classText;
        } else {
          node.className = classText;
        }
      }
    },
    getInfo: function(block) {
      // Get the list of all inputs.
      if (this.infoBlocks[block.id]) {
        this.infoBlocks[block.id].length = 0;
      } else {
        this.infoBlocks[block.id] = [];
      }

      var blockInfoList = this.infoBlocks[block.id];

      for (var i = 0, field; field = block.fieldRow[i]; i++) {
        blockInfoList.push(field);
      }

      return this.infoBlocks[block.id];
    },
    copyToWorkspace: function(block) {
      var xml = Blockly.Xml.blockToDom(block);
      Blockly.Xml.domToBlock(blocklyApp.workspace, xml);
      alert('Added block to workspace: ' + block.toString());
    },
    copyToClipboard: function(block) {
      if (this.clipboardService) {
        this.clipboardService.copy(block, true);
      }
    },
    copyToMarked: function(block) {
      if (this.clipboardService) {
        this.clipboardService.pasteToMarkedConnection(block);
      }
    }
  });
