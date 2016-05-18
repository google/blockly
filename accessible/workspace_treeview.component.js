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
blocklyApp.TreeView = ng.core
  .Component({
    selector: 'tree-view',
    template: `
      <li #parentList [id]="idMap['parentList']" role="treeitem" class="blocklyHasChildren" 
          [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-block-summary', idMap['blockSummary'])" 
          [attr.aria-level]="level" aria-selected=false>
        {{checkParentList(parentList)}}
        <label [id]="idMap['blockSummary']">{{block.toString()}}</label>
        <ol role="group"  [attr.aria-level]="level+1">
          <li [id]="idMap['listItem']" class="blocklyHasChildren" role="treeitem" 
              [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-block-menu', idMap['blockSummary'])" 
              [attr.aria-level]="level+1" aria-selected=false>
            <label [id]="idMap['label']">block action list </label>
            <ol role="group"  [attr.aria-level]="level+2">
              <li [id]="idMap['cutListItem']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['cutButton'], 'blockly-button')" 
                  [attr.aria-level]="level+2" aria-selected=false>
                <button [id]="idMap['cutButton']" (click)="clipboardService.cut(block)">cut block</button>
              </li>
              <li [id]="idMap['copyListItem']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['copyButton'], 'blockly-button')" 
                  [attr.aria-level]="level+2" aria-selected=false>
                <button [id]="idMap['copyButton']" (click)="clipboardService.copy(block)">copy block</button>
              </li>
              <li [id]="idMap['pasteBelow']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['pasteBelowButton'], 'blockly-button', (noNextConnectionHTMLText(block)||clipboardCompatibilityHTMLText(block.nextConnection)))"  
                  [attr.aria-level]="level+2" aria-selected=false>
                <button [id]="idMap['pasteBelowButton']" (click)="clipboardService.pasteFromClipboard(block.nextConnection)" 
                    [disabled]="noNextConnectionHTMLText(block)" [disabled]="clipboardCompatibilityHTMLText(block.nextConnection)">paste below</button>
              </li>
              <li [id]="idMap['pasteAbove']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['pasteAboveButton'], 'blockly-button', (noPreviousConnectionHTMLText(block)||clipboardCompatibilityHTMLText(block.previousConnection)))"  
                  [attr.aria-level]="level+2" aria-selected=false>
                <button [id]="idMap['pasteAboveButton']" (click)="clipboardService.pasteFromClipboard(block.previousConnection)" 
                    [disabled]="noPreviousConnectionHTMLText(block)" [disabled]="clipboardCompatibilityHTMLText(block.previousConnection)">paste above</button>
              </li>
              <li [id]="idMap['markBelow']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['markBelowButton'], 'blockly-button', noNextConnectionHTMLText(block))"  
                  [attr.aria-level]="level+2" aria-selected=false>
                <button [id]="idMap['markBelowButton']" (click)="clipboardService.markConnection(block.nextConnection)" 
                    [disabled]="noNextConnectionHTMLText(block)">mark spot below</button>
              </li>
              <li [id]="idMap['markAbove']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['markAboveButton'], 'blockly-button', noPreviousConnectionHTMLText(block))" 
                  [attr.aria-level]="level+2" aria-selected=false>
                <button [id]="idMap['markAboveButton']" (click)="clipboardService.markConnection(block.previousConnection)" 
                    [disabled]="noPreviousConnectionHTMLText(block)">mark spot above</button>
              </li>
              <li [id]="idMap['sendToSelectedListItem']" role="treeitem" 
                  [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['sendToSelectedButton'], 'blockly-button', utilsService.getMarkedBlockCompatibilityHTMLText(clipboardService.isBlockCompatibleWithMarkedConnection(block)))" 
                  [attr.aria-level]="level+2" aria-selected=false>
                <button [id]="idMap['sendToSelectedButton']" (click)="sendToSelected(block)" 
                    [disabled]="utilsService.getMarkedBlockCompatibilityHTMLText(clipboardService.isBlockCompatibleWithMarkedConnection(block))">move to marked spot</button>
              </li>
              <li [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['deleteButton'], 'blockly-button')"  [id]="idMap['delete']" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button [id]="idMap['deleteButton']" (click)="block.dispose(true)">delete</button>
              </li>
            </ol>
          </li>
          <div *ngFor="#inputBlock of block.inputList; #i = index">
            <field-view *ngFor="#field of getInfo(inputBlock)" [field]="field"></field-view>
            <tree-view *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()" [block]="inputBlock.connection.targetBlock()" [isTopBlock]="false" [level]="level"></tree-view>
            <li #inputList [attr.aria-level]="level + 1" [id]="idMap['inputList' + i]" 
                [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr('blockly-menu', idMap['inputMenuLabel' + i])" 
                *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()" (keydown)="treeService.onKeypress($event, tree)">
              <label [id]="idMap['inputMenuLabel' + i]"> {{utilsService.getInputTypeLabel(inputBlock.connection)}} {{utilsService.getBlockTypeLabel(inputBlock)}} needed: </label>
              <ol role="group"  [attr.aria-level]="level+2">
                <li [id]="idMap['markSpot' + i]" role="treeitem" 
                    [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['markButton' + i], 'blockly-button')" 
                    [attr.aria-level]="level + 2" aria-selected=false>
                  <button [id]="idMap['markSpotButton + i']" (click)="clipboardService.cut(block)">mark this spot</button>
                </li>
                <li [id]="idMap['paste' + i]" role="treeitem" 
                    [attr.aria-labelledBy]="utilsService.generateAriaLabelledByAttr(idMap['pasteButton' + i], 'blockly-button', clipboardCompatibilityHTMLText(inputBlock.connection))" 
                    [attr.aria-level]="level+2" aria-selected=false>
                  <button [id]="idMap['pasteButton' + i]" (click)="clipboardService.pasteFromClipboard(inputBlock.connection)" 
                      [disabled]="clipboardCompatibilityHTMLText(inputBlock.connection)">paste</button>
                </li>
              </ol>
            </li>
          </div>
        </ol>
      </li>
      <tree-view *ngIf= "block.nextConnection && block.nextConnection.targetBlock()" [block]="block.nextConnection.targetBlock()" [isTopBlock]="false" [level]="level"></tree-view>
    `,
    directives: [ng.core.forwardRef(
        function() { return blocklyApp.TreeView; }), blocklyApp.FieldView],
    inputs: ['block', 'isTopBlock', 'topBlockIndex', 'level', 'parentId'],
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
      var elementsNeedingIds = ['blockSummary', 'listItem', 'label',
          'cutListItem', 'cutButton', 'copyListItem', 'copyButton',
          'pasteBelow', 'pasteBelowButton', 'pasteAbove', 'pasteAboveButton',
          'markBelow', 'markBelowButton', 'markAbove', 'markAboveButton',
          'sendToSelectedListItem', 'sendToSelectedButton', 'delete',
          'deleteButton'];
      for (var i=0; i<this.block.inputList.length; i++){
        var inputBlock = this.block.inputList[i];
        if (inputBlock.connection && !inputBlock.connection.targetBlock()){
          elementsNeedingIds.concat(['inputList' + i, 'inputMenuLabel' + i, 'markSpot' + i,
             'markSpotButton' + i, 'paste' + i, 'pasteButton' + i]);
        }
      }
      this.idMap = this.utilsService.generateIds(elementsNeedingIds);
      this.idMap['parentList'] = this.generateParentListId();
    },
    generateParentListId: function(){
      if (this.isTopBlock){
        return this.parentId + '-node0'
      } else {
        return this.utilsService.generateUniqueId();
      }
    },
    noPreviousConnectionHTMLText: function(block) {
      if (!block.previousConnection) {
        return 'blockly-disabled';
      } else {
        return '';
      }
    },
    noNextConnectionHTMLText: function(block) {
      if (!block.nextConnection) {
        return 'blockly-disabled';
      } else {
        return '';
      }
    },
    checkParentList: function(parentList) {
      blocklyApp.debug && console.log('setting parent list');
      var tree = parentList;
      var regex = /^blockly-workspace-tree\d+$/;
      while (tree && !tree.id.match(regex)) {
        tree = tree.parentNode;
      }
      if (tree && tree.getAttribute('aria-activedescendant') == parentList.id) {
        this.treeService.updateSelectedNode(parentList, tree, false);
      }
    },
    setId: function(block) {
      if (this.isTopBlock) {
        return this.parentId + '-node0';
      }
      return this.treeService.createId(block);
    },
    getInfo: function(block) {
      // List all inputs.
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
    sendToSelected: function(block) {
      if (this.clipboardService) {
        this.clipboardService.pasteToMarkedConnection(block);
        block.dispose(true);
        alert('block sent to marked spot');
      }
    },
    inputMenuSelected: function(connection, event) {
      switch (event.target.value) {
        case 'MARK_SPOT':
          this.clipboardService.markConnection(connection);
          blocklyApp.debug && console.log('marked spot');
          break;
        case 'PASTE':
          this.clipboardService.pasteFromClipboard(connection);
          break;
      }
      event.target.selectedIndex = 0;
    },
    clipboardCompatibilityHTMLText: function(connection) {
      if (this.clipboardService.isConnectionCompatibleWithClipboard(
              connection)) {
        // Undefined will result in the 'paste' option being ENABLED.
        return undefined;
      } else {
        // Any value returned will result in the 'paste' option being DISABLED.
        return 'blockly-disabled';
      }
    }
  });
