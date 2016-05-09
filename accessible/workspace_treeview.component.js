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
      <li #parentList aria-selected=false role="treeitem" class="blocklyHasChildren" [attr.aria-level]="level" id="{{setId(parentList)}}">
        {{checkParentList(parentList)}}
        <label #blockSummary id="blockly-{{block.id}}">{{block.toString()}}</label>
        {{utilsService.setLabelledBy(parentList, utilsService.concatStringWithSpaces("blockly-block-summary", blockSummary.id))}}
        <ol role="group"  [attr.aria-level]="level+1">
          <li #listItem id="{{treeService.createId(listItem)}}" class="blocklyHasChildren" role="treeitem" aria-selected=false [attr.aria-level]="level+1">
            {{utilsService.setLabelledBy(listItem, utilsService.concatStringWithSpaces("blockly-block-menu", blockSummary.id))}}
            <label #label id="{{treeService.createId(label)}}">block action list </label>
            <ol role="group"  [attr.aria-level]="level+2">
              <li #cutListItem id="{{treeService.createId(cutListItem)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #cutButton id="{{treeService.createId(cutButton)}}" (click)="clipboardService.cut(block)">cut block</button>
                {{utilsService.setLabelledBy(cutListItem, utilsService.concatStringWithSpaces(cutButton.id, "blockly-button"))}}
              </li>
              <li #copyListItem id="{{treeService.createId(copyListItem)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #copyButton id="{{treeService.createId(copyButton)}}" (click)="clipboardService.copy(block)">copy block</button>
                {{utilsService.setLabelledBy(copyListItem, utilsService.concatStringWithSpaces(copyButton.id, "blockly-button"))}}
              </li>
              <li #pasteBelow id="{{treeService.createId(pasteBelow)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #pasteBelowButton id="{{treeService.createId(pasteBelowButton)}}" (click)="clipboardService.pasteFromClipboard(block.nextConnection)" disabled="{{noNextConnectionHTMLText(block)}}" disabled="{{clipboardCompatibilityHTMLText(block.nextConnection)}}">paste below</button>
                {{utilsService.setLabelledBy(pasteBelow, utilsService.concatStringWithSpaces(pasteBelowButton.id, "blockly-button", (noNextConnectionHTMLText(block)||clipboardCompatibilityHTMLText(block.nextConnection))))}}
              </li>
              <li #pasteAbove id="{{treeService.createId(pasteAbove)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #pasteAboveButton id="{{treeService.createId(pasteAboveButton)}}" (click)="clipboardService.pasteFromClipboard(block.previousConnection)" disabled="{{noPreviousConnectionHTMLText(block)}}" disabled="{{clipboardCompatibilityHTMLText(block.previousConnection)}}">paste above</button>
                {{utilsService.setLabelledBy(pasteAbove, utilsService.concatStringWithSpaces(pasteAboveButton.id, "blockly-button", (noPreviousConnectionHTMLText(block)||clipboardCompatibilityHTMLText(block.previousConnection))))}}
              </li>
              <li #markBelow id="{{treeService.createId(markBelow)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #markBelowButton id="{{treeService.createId(markBelowButton)}}" (click)="clipboardService.markConnection(block.nextConnection)" disabled="{{noNextConnectionHTMLText(block)}}">mark spot below</button>
                {{utilsService.setLabelledBy(markBelow, utilsService.concatStringWithSpaces(markBelowButton.id, "blockly-button", noNextConnectionHTMLText(block)))}}
              </li>
              <li #markAbove id="{{treeService.createId(markAbove)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #markAboveButton id="{{treeService.createId(markAboveButton)}}" (click)="clipboardService.markConnection(block.previousConnection)" disabled="{{noPreviousConnectionHTMLText(block)}}">mark spot above</button>
                {{utilsService.setLabelledBy(markAbove, utilsService.concatStringWithSpaces(markAboveButton.id, "blockly-button", noPreviousConnectionHTMLText(block)))}}
              </li>
              <li #sendToSelectedListItem id="{{treeService.createId(sendToSelectedListItem)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #sendToSelectedButton id="{{treeService.createId(sendToSelectedButton)}}" (click)="sendToSelected(block)" disabled="{{utilsService.markedBlockCompatibilityHTMLText(clipboardService.isBlockCompatibleWithMarkedConnection(block))}}">move to marked spot</button>
                {{utilsService.setLabelledBy(sendToSelectedListItem, utilsService.concatStringWithSpaces(sendToSelectedButton.id, "blockly-button", utilsService.markedBlockCompatibilityHTMLText(clipboardService.isBlockCompatibleWithMarkedConnection(block))))}}
              </li>
              <li #delete id="{{treeService.createId(delete)}}" role="treeitem" aria-selected=false [attr.aria-level]="level+2">
                <button #deleteButton id="{{treeService.createId(deleteButton)}}" (click)="block.dispose(true)">delete</button>
                {{utilsService.setLabelledBy(delete, utilsService.concatStringWithSpaces(deleteButton.id, "blockly-button"))}}
              </li>
            </ol>
          </li>
          <div *ngFor="#inputBlock of block.inputList">
            <field-view *ngFor="#field of getInfo(inputBlock)" [field]="field"></field-view>
            <tree-view *ngIf="inputBlock.connection && inputBlock.connection.targetBlock()" [block]="inputBlock.connection.targetBlock()" [isTopBlock]="false" [level]="level"></tree-view>
            <li #inputList [attr.aria-level]="level+1" id="{{treeService.createId(inputList)}}" *ngIf="inputBlock.connection && !inputBlock.connection.targetBlock()" (keydown)="treeService.onKeypress($event, tree)">
              {{utilsService.getInputTypeLabel(inputBlock.connection)}} {{utilsService.getValueOrStatementLabel(inputBlock)}} needed:
              <select aria-label="insert input menu" (change)="inputMenuSelected(inputBlock.connection, $event)">
                <option value="NO_ACTION" selected>select an action</option>
                <option value="MARK_SPOT">mark this spot</option>
                <option value="PASTE" disabled="{{clipboardCompatibilityHTMLText(inputBlock.connection)}}">paste</option>
              </select>
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
    noPreviousConnectionHTMLText: function(block) {
      if (!block.previousConnection) {
        return 'blockly-disabled';
      } else {
        return undefined;
      }
    },
    noNextConnectionHTMLText: function(block) {
      if (!block.nextConnection) {
        return 'blockly-disabled';
      } else {
        return undefined;
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
