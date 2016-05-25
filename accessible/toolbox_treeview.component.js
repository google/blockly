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
            [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-block-summary', idMap['blockSummaryLabel'])"
            [attr.aria-selected]="index == 0 && tree.getAttribute('aria-activedescendant') == 'blockly-toolbox-tree-node0'"
            [attr.aria-level]="level">
        {{setActiveDesc(parentList)}}
        <label #blockSummaryLabel [id]="idMap['blockSummaryLabel']">{{block.toString()}}</label>
        <ol role="group" *ngIf="displayBlockMenu || block.inputList.length > 0"  [attr.aria-level]="level+1">
          <li #listItem [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-block-menu', idMap['blockSummaryLabel'])" class="blocklyHasChildren" [id]="idMap['listItem']" *ngIf="displayBlockMenu" role="treeitem" aria-selected=false [attr.aria-level]="level+1">
            <label #label [id]="idMap['label']">{{stringMap['BLOCK_ACTION_LIST']}}</label>
            <ol role="group" *ngIf="displayBlockMenu"  [attr.aria-level]="level+2">
              <li #workspaceCopy [id]="idMap['workspaceCopy']" role="treeitem"
                  [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['workspaceCopyButton'], 'blockly-button')"
                  [attr.aria-level]="level+2" aria-selected=false>
                <button #workspaceCopyButton [id]="idMap['workspaceCopyButton']"
                    (click)="copyToWorkspace(block)">{{stringMap['COPY_TO_WORKSPACE']}}</button>
              </li>
              <li #blockCopy [id]="idMap['blockCopy']" role="treeitem"
                  [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['blockCopyButton'], 'blockly-button')"
                  [attr.aria-level]="level+2" aria-selected=false>
                <button #blockCopyButton [id]="idMap['blockCopyButton']"
                    (click)="clipboardService.copy(block, true)">{{stringMap['COPY_TO_CLIPBOARD']}}</button>
              </li>
              <li #sendToSelected [id]="idMap['sendToSelected']" role="treeitem"
                  [attr.aria-labelledBy]="generateAriaLabelledByAttr(idMap['sendToSelectedButton'], 'blockly-button', utilsService.getMarkedBlockCompatibilityHTMLText(clipboardService.isBlockCompatibleWithMarkedConnection(block)))"
                  [attr.aria-level]="level+2" aria-selected=false>
                <button #sendToSelectedButton [id]="idMap['sendToSelectedButton']" (click)="copyToMarked(block)"
                    [disabled]="getMarkedBlockCompatibilityHTMLText(clipboardService.isBlockCompatibleWithMarkedConnection(block))">
                    {{stringMap['COPY_TO_MARKED_SPOT']}}</button>
              </li>
            </ol>
          </li>
          <div *ngFor="#inputBlock of block.inputList; #i=index">
            <field-view *ngFor="#field of inputBlock.fieldRow; #j=index" [attr.aria-level]="level+1" [field]="field" [level]="level+1"></field-view>
            <toolbox-tree-view *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()" [block]="inputBlock.connection.targetBlock()" [displayBlockMenu]="false" [level]="level+1"></toolbox-tree-view>
            <li #listItem1 [id]="idMap['listItem' + i]" role="treeitem"
                *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()"
                [attr.aria-labelledBy]="generateAriaLabelledByAttr('blockly-argument-text', idMap['listItem' + i + 'Label'])"
                [attr.aria-level]="level+1" aria-selected=false>
              <!--TODO(madeeha): i18n here will need to happen in a different way due to the way grammar changes based on language.-->
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
    inputs: ['block', 'displayBlockMenu', 'level', 'index', 'tree',
             'noCategories'],
    providers: [blocklyApp.TreeService, blocklyApp.UtilsService]
  })
  .Class({
    constructor: [blocklyApp.ClipboardService, blocklyApp.TreeService,
                  blocklyApp.UtilsService,
                  function(_clipboardService, _treeService, _utilsService) {
      this.infoBlocks = Object.create(null);
      this.clipboardService = _clipboardService;
      this.treeService = _treeService;
      this.utilsService = _utilsService;
      this.stringMap = {
        'BLOCK_ACTION_LIST': Blockly.Msg.BLOCK_ACTION_LIST,
        'COPY_TO_CLIPBOARD': Blockly.Msg.COPY_TO_CLIPBOARD,
        'COPY_TO_WORKSPACE': Blockly.Msg.COPY_TO_WORKSPACE,
        'COPY_TO_MARKED_SPOT': Blockly.Msg.COPY_TO_MARKED_SPOT
      };
    }],
    ngOnInit: function() {
      var elementsNeedingIds = ['blockSummaryLabel'];
      if (this.displayBlockMenu || this.block.inputList.length){
        elementsNeedingIds = elementsNeedingIds.concat(['listItem', 'label',
            'workspaceCopy', 'workspaceCopyButton', 'blockCopy',
            'blockCopyButton', 'sendToSelected', 'sendToSelectedButton']);
      }
      for (var i = 0; i < this.block.inputList.length; i++){
        elementsNeedingIds.push('listItem' + i);
        elementsNeedingIds.push('listItem' + i + 'Label')
      }
      this.idMap = this.utilsService.generateIds(elementsNeedingIds);
      if (this.index == 0 && this.noCategories) {
        this.idMap['parentList'] = 'blockly-toolbox-tree-node0';
      } else {
        this.idMap['parentList'] = this.utilsService.generateUniqueId();
      }
    },
    getMarkedBlockCompatibilityHTMLText: function(isCompatible) {
      return this.utilsService.getMarkedBlockCompatibilityHTMLText(
          isCompatible);
    },
    generateAriaLabelledByAttr: function() {
      return this.utilsService.generateAriaLabelledByAttr.apply(this,
          arguments);
    },
    setActiveDesc: function(parentList) {
      // If this is the first child of the toolbox and the
      // current active descendant of the tree is this child,
      // then set the active descendant stored in the treeService.
      if (this.index == 0 && this.tree.getAttribute('aria-activedescendant') ==
            'blockly-toolbox-tree-node0') {
        this.treeService.setActiveDesc(parentList, this.tree.id);
      }
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
